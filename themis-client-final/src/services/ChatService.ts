import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { ChatChannel, ChatMessage, ChatChannelMember, User, ApiResponse, ChannelType, SystemMessagePayload } from '../types/ChatTypes';
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
  public async getUserChannels(): Promise<ApiResponse<ChatChannel[]>> {
    const response = await api.chat.getChannels(this.token!);
    // Ensure the response matches the ChatTypes.ApiResponse structure
    return {
      success: response.success,
      data: response.data || [],
      error: response.error
    };
  }
  
  /**
   * Get a single channel by ID
   */
  public async getChannel(channelId: string): Promise<ApiResponse<ChatChannel>> {
    const response = await api.chat.getChannel(channelId, this.token!);
    return {
      success: response.success,
      data: response.data,
      error: response.error
    };
  }
  
  /**
   * Get messages for a channel
   */
  public async getChannelMessages(channelId: string, limit = 50, offset = 0): Promise<ApiResponse<ChatMessage[]>> {
    const response = await api.chat.getMessages(channelId, limit, offset, this.token!);
    return {
      success: response.success,
      data: response.data || [],
      error: response.error
    };
  }
  
  /**
   * Get members of a channel
   */
  public async getChannelMembers(channelId: string): Promise<ApiResponse<ChatChannelMember[]>> {
    const response = await api.chat.getMembers(channelId, this.token!);
    return {
      success: response.success,
      data: response.data || [],
      error: response.error
    };
  }
  
  /**
   * Check if the current user can post to a channel
   * For most channels, users can post unless the channel is archived
   */
  public async canUserPostToChannel(channelId: string): Promise<boolean> {
    try {
      const channelResponse = await this.getChannel(channelId);
      if (channelResponse.success && channelResponse.data) {
        // Users can't post to archived channels
        if (channelResponse.data.isArchived) {
          return false;
        }
        
        // For department and project channels, check permissions based on user role
        // This is a simplified implementation - in a real app, we'd check against the backend
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking posting permissions:', error);
      return false;
    }
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
      
      await api.chat.createMessage(channelId, payload, this.token!);
    }
  }

  /**
   * Send a system message to a channel with structured data
   * @param channelId The channel to send the message to
   * @param message The message text body
   * @param payload The structured system message payload
   */
  public async sendSystemMessage(channelId: string, message: string, payload: SystemMessagePayload): Promise<void> {
    if (!this.connection) {
      await this.init();
    }
    
    try {
      // For system messages, we always use the API for now since SignalR might not support it yet
      const messagePayload = {
        body: message,
        isSystemMessage: true,
        systemPayload: payload
      };
      
      await api.chat.createMessage(channelId, messagePayload, this.token!);
      
      // Simulate the message being created for local UI updates
      // In a real implementation, this would be handled by the server
      const simulatedMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        channelId,
        senderId: 'system',
        body: message,
        isEdited: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'SENT' as any, // Type assertion to match enum
        sender: {
          id: 'system',
          firstName: 'System',
          lastName: 'Bot',
          role: 'SYSTEM'
        },
        isSystemMessage: true,
        systemPayload: payload
      };
      
      // Notify any listeners about this message
      this.notifyMessageListeners(simulatedMessage);
    } catch (error) {
      console.error('Error sending system message:', error);
      throw error;
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
    const response = await api.chat.createDM(recipientId, this.token!);
    return response.data;
  }
  
  /**
   * Create a new channel
   */
  public async createChannel(name: string, type: ChannelType, departmentId?: string, projectId?: string): Promise<ChatChannel> {
    const payload = {
      name,
      type,
      departmentId,
      projectId
    };
    
    const response = await api.chat.createChannel(payload, this.token!);
    return response.data;
  }
  
  /**
   * Archive a channel
   */
  public async archiveChannel(channelId: string): Promise<void> {
    await api.chat.archiveChannel(channelId, this.token!);
  }
  
  /**
   * Search for messages
   */
  public async searchMessages(query: string, channelId?: string): Promise<ChatMessage[]> {
    const response = await api.chat.searchMessages(query, channelId || null, this.token!);
    return response.data;
  }
  
  /**
   * Update a message
   */
  public async updateMessage(messageId: string, body: string): Promise<ChatMessage> {
    const response = await api.chat.updateMessage(messageId, { body }, this.token!);
    return response.data;
  }
  
  /**
   * Delete a message
   */
  public async deleteMessage(messageId: string): Promise<void> {
    await api.chat.deleteMessage(messageId, this.token!);
  }
  
  /**
   * Add a user to a channel
   */
  public async addUserToChannel(channelId: string, userId: string): Promise<void> {
    await api.chat.addMember(channelId, userId, this.token!);
  }
  
  /**
   * Remove a user from a channel
   */
  public async removeUserFromChannel(channelId: string, userId: string): Promise<void> {
    await api.chat.removeMember(channelId, userId, this.token!);
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
      this.notifyMessageListeners(message);
    });
    
    // Handle message update events
    this.connection.on('MessageUpdated', (message: ChatMessage) => {
      this.notifyMessageListeners(message);
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
  
  /**
   * Notify message listeners about a new/updated message
   * Extracted to a helper method to avoid code duplication
   */
  private notifyMessageListeners(message: ChatMessage): void {
    const listeners = this.messageListeners.get(message.channelId) || [];
    listeners.forEach(callback => callback(message));
  }
}

export default new ChatService(); 