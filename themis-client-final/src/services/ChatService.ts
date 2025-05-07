import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { ChatChannel, ChatMessage, ChatChannelMember, User } from '../types/ChatTypes';
import api from './api';

class ChatService {
  private connection: HubConnection | null = null;
  private token: string | null = null;
  private connectionPromise: Promise<void> | null = null;
  private messageListeners: Map<string, Array<(message: ChatMessage) => void>> = new Map();
  private channelStatusListeners: Map<string, Array<(channelId: string) => void>> = new Map();
  private userStatusListeners: Array<(userId: string, isOnline: boolean) => void> = [];
  
  constructor() {
    this.token = localStorage.getItem('token');
  }
  
  /**
   * Initialize the chat service and connect to the hub
   */
  public init(): Promise<void> {
    if (this.connection) {
      return Promise.resolve();
    }
    
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    
    this.token = localStorage.getItem('token');
    if (!this.token) {
      return Promise.reject(new Error('No authentication token available'));
    }
    
    // Create the connection
    this.connection = new HubConnectionBuilder()
      .withUrl(`${process.env.REACT_APP_API_URL}/hubs/chat?access_token=${this.token}`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
      
    // Set up event handlers
    this.setupEventHandlers();
    
    // Start the connection
    this.connectionPromise = this.connection.start()
      .then(() => {
        console.log('Connected to chat hub');
      })
      .catch(err => {
        console.error('Error connecting to chat hub:', err);
        this.connectionPromise = null;
        throw err;
      });
      
    return this.connectionPromise;
  }
  
  /**
   * Disconnect from the chat hub
   */
  public disconnect(): Promise<void> {
    if (this.connection) {
      return this.connection.stop()
        .then(() => {
          this.connection = null;
          this.connectionPromise = null;
          console.log('Disconnected from chat hub');
        })
        .catch(err => {
          console.error('Error disconnecting from chat hub:', err);
          throw err;
        });
    }
    
    return Promise.resolve();
  }
  
  /**
   * Get all channels for the current user
   */
  public async getUserChannels(): Promise<ChatChannel[]> {
    const response = await api.get('/chat/channels', this.token!);
    return response.data;
  }
  
  /**
   * Get channel details by ID
   */
  public async getChannel(channelId: string): Promise<ChatChannel> {
    const response = await api.get(`/chat/channels/${channelId}`, this.token!);
    return response.data;
  }
  
  /**
   * Get messages from a channel
   */
  public async getChannelMessages(channelId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    const response = await api.get(`/chat/channels/${channelId}/messages?limit=${limit}&offset=${offset}`, this.token!);
    return response.data;
  }
  
  /**
   * Get members of a channel
   */
  public async getChannelMembers(channelId: string): Promise<ChatChannelMember[]> {
    const response = await api.get(`/chat/channels/${channelId}/members`, this.token!);
    return response.data;
  }
  
  /**
   * Send a message to a channel
   */
  public async sendMessage(channelId: string, message: string, fileUrl?: string, fileType?: string, fileSize?: number): Promise<void> {
    if (!this.connection) {
      await this.init();
    }
    
    if (this.connection?.state === 'Connected') {
      return this.connection.invoke('SendMessage', channelId, message, fileUrl, fileType, fileSize);
    } else {
      // Fallback to API if hub is not connected
      const payload = {
        body: message,
        fileUrl,
        fileType,
        fileSize
      };
      
      await api.post(`/chat/channels/${channelId}/messages`, payload, this.token!);
    }
  }
  
  /**
   * Join a channel to receive real-time updates
   */
  public async joinChannel(channelId: string): Promise<void> {
    if (!this.connection) {
      await this.init();
    }
    
    if (this.connection?.state === 'Connected') {
      return this.connection.invoke('JoinChannel', channelId);
    }
  }
  
  /**
   * Leave a channel
   */
  public async leaveChannel(channelId: string): Promise<void> {
    if (this.connection?.state === 'Connected') {
      return this.connection.invoke('LeaveChannel', channelId);
    }
  }
  
  /**
   * Mark channel as read
   */
  public async markChannelAsRead(channelId: string): Promise<void> {
    if (this.connection?.state === 'Connected') {
      return this.connection.invoke('UpdateReadStatus', channelId);
    }
  }
  
  /**
   * Create a direct message channel with another user
   */
  public async createDirectMessageChannel(recipientId: string): Promise<ChatChannel> {
    const response = await api.post('/chat/dm', { recipientId }, this.token!);
    return response.data;
  }
  
  /**
   * Create a new channel
   */
  public async createChannel(name: string, type: string, departmentId?: string, projectId?: string): Promise<ChatChannel> {
    const payload = {
      name,
      type,
      departmentId,
      projectId
    };
    
    const response = await api.post('/chat/channels', payload, this.token!);
    return response.data;
  }
  
  /**
   * Archive a channel
   */
  public async archiveChannel(channelId: string): Promise<void> {
    await api.put(`/chat/channels/${channelId}/archive`, {}, this.token!);
  }
  
  /**
   * Search for messages
   */
  public async searchMessages(query: string, channelId?: string): Promise<ChatMessage[]> {
    const url = channelId 
      ? `/chat/search?query=${encodeURIComponent(query)}&channelId=${channelId}`
      : `/chat/search?query=${encodeURIComponent(query)}`;
      
    const response = await api.get(url, this.token!);
    return response.data;
  }
  
  /**
   * Update a message
   */
  public async updateMessage(messageId: string, body: string): Promise<ChatMessage> {
    const response = await api.put(`/chat/messages/${messageId}`, { body }, this.token!);
    return response.data;
  }
  
  /**
   * Delete a message
   */
  public async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/chat/messages/${messageId}`, this.token!);
  }
  
  /**
   * Add a user to a channel
   */
  public async addUserToChannel(channelId: string, userId: string): Promise<void> {
    await api.post(`/chat/channels/${channelId}/members`, { userId }, this.token!);
  }
  
  /**
   * Remove a user from a channel
   */
  public async removeUserFromChannel(channelId: string, userId: string): Promise<void> {
    await api.delete(`/chat/channels/${channelId}/members/${userId}`, this.token!);
  }
  
  /**
   * Add message listener for a specific channel
   */
  public addMessageListener(channelId: string, callback: (message: ChatMessage) => void): void {
    const listeners = this.messageListeners.get(channelId) || [];
    listeners.push(callback);
    this.messageListeners.set(channelId, listeners);
  }
  
  /**
   * Remove message listener
   */
  public removeMessageListener(channelId: string, callback: (message: ChatMessage) => void): void {
    const listeners = this.messageListeners.get(channelId) || [];
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
      this.messageListeners.set(channelId, listeners);
    }
  }
  
  /**
   * Add channel status listener (for archive events)
   */
  public addChannelStatusListener(channelId: string, callback: (channelId: string) => void): void {
    const listeners = this.channelStatusListeners.get(channelId) || [];
    listeners.push(callback);
    this.channelStatusListeners.set(channelId, listeners);
  }
  
  /**
   * Remove channel status listener
   */
  public removeChannelStatusListener(channelId: string, callback: (channelId: string) => void): void {
    const listeners = this.channelStatusListeners.get(channelId) || [];
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
      this.channelStatusListeners.set(channelId, listeners);
    }
  }
  
  /**
   * Add user status listener
   */
  public addUserStatusListener(callback: (userId: string, isOnline: boolean) => void): void {
    this.userStatusListeners.push(callback);
  }
  
  /**
   * Remove user status listener
   */
  public removeUserStatusListener(callback: (userId: string, isOnline: boolean) => void): void {
    const index = this.userStatusListeners.indexOf(callback);
    if (index !== -1) {
      this.userStatusListeners.splice(index, 1);
    }
  }
  
  /**
   * Set up SignalR event handlers
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;
    
    // Handle new message events
    this.connection.on('NewMessage', (message: ChatMessage) => {
      const listeners = this.messageListeners.get(message.channelId) || [];
      listeners.forEach(callback => callback(message));
    });
    
    // Handle message update events
    this.connection.on('MessageUpdated', (message: ChatMessage) => {
      const listeners = this.messageListeners.get(message.channelId) || [];
      listeners.forEach(callback => callback(message));
    });
    
    // Handle message deletion events
    this.connection.on('MessageDeleted', (messageId: string) => {
      // Each component will need to handle message deletion
    });
    
    // Handle channel archive events
    this.connection.on('ChannelArchived', (channelId: string) => {
      const listeners = this.channelStatusListeners.get(channelId) || [];
      listeners.forEach(callback => callback(channelId));
    });
    
    // Handle user online status
    this.connection.on('UserOnline', (userId: string) => {
      this.userStatusListeners.forEach(callback => callback(userId, true));
    });
    
    // Handle user offline status
    this.connection.on('UserOffline', (userId: string) => {
      this.userStatusListeners.forEach(callback => callback(userId, false));
    });
    
    // Handle errors
    this.connection.on('Error', (error: string) => {
      console.error('Chat hub error:', error);
    });
  }
}

export default new ChatService(); 