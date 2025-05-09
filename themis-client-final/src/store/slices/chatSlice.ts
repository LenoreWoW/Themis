import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  ChatChannel, 
  ChatMessage, 
  ChannelType, 
  ChatMessageStatus 
} from '../../types/ChatTypes';
import api from '../../services/api';

// Define the state interface
interface ChatState {
  channels: ChatChannel[];
  activeChannel: ChatChannel | null;
  messages: Record<string, ChatMessage[]>;
  unreadMessages: {channelId: string, count: number}[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ChatState = {
  channels: [],
  activeChannel: null,
  messages: {},
  unreadMessages: [],
  loading: false,
  error: null
};

// Async thunks
export const fetchChannels = createAsyncThunk(
  'chat/fetchChannels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.chat.getChannels('fake-token');
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to fetch channels');
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (channelId: string, { rejectWithValue }) => {
    try {
      const response = await api.chat.getMessages(channelId, 50, 0, 'fake-token');
      if (response.success) {
        return { channelId, messages: response.data };
      }
      return rejectWithValue(response.error || 'Failed to fetch messages');
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (params: { channelId: string, content: string }, { rejectWithValue }) => {
    try {
      const response = await api.chat.createMessage(params.channelId, { body: params.content }, 'fake-token');
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to send message');
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const createChannel = createAsyncThunk(
  'chat/createChannel',
  async (params: { name: string, type: ChannelType, participants?: string[] }, { rejectWithValue }) => {
    try {
      const response = await api.chat.createChannel({ 
        name: params.name, 
        type: params.type,
        // Handle other properties if needed
      }, 'fake-token');
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to create channel');
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

// Create the slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChannel(state, action: PayloadAction<string>) {
      const channel = state.channels.find(c => c.id === action.payload);
      if (channel) {
        state.activeChannel = channel;
        // Mark channel as read
        const unreadIndex = state.unreadMessages.findIndex(u => u.channelId === action.payload);
        if (unreadIndex >= 0) {
          state.unreadMessages.splice(unreadIndex, 1);
        }
      }
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      const message = action.payload;
      if (!state.messages[message.channelId]) {
        state.messages[message.channelId] = [];
      }
      state.messages[message.channelId].push(message);
      
      // If the message is for a non-active channel, increment unread count
      if (state.activeChannel?.id !== message.channelId) {
        const unreadIndex = state.unreadMessages.findIndex(u => u.channelId === message.channelId);
        if (unreadIndex >= 0) {
          state.unreadMessages[unreadIndex].count++;
        } else {
          state.unreadMessages.push({ channelId: message.channelId, count: 1 });
        }
      }
    },
    updateMessageStatus(state, action: PayloadAction<{ messageId: string, channelId: string, status: ChatMessageStatus }>) {
      const { messageId, channelId, status } = action.payload;
      const message = state.messages[channelId]?.find(m => m.id === messageId);
      if (message) {
        message.status = status;
      }
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Channels
    builder.addCase(fetchChannels.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchChannels.fulfilled, (state, action) => {
      state.loading = false;
      state.channels = action.payload;
      if (state.channels.length && !state.activeChannel) {
        state.activeChannel = state.channels[0];
      }
    });
    builder.addCase(fetchChannels.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch Messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.loading = false;
      const { channelId, messages } = action.payload as { channelId: string, messages: ChatMessage[] };
      state.messages[channelId] = messages;
      
      // Clear unread messages for this channel
      const unreadIndex = state.unreadMessages.findIndex(u => u.channelId === channelId);
      if (unreadIndex >= 0) {
        state.unreadMessages.splice(unreadIndex, 1);
      }
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Send Message
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const message = action.payload;
      if (!state.messages[message.channelId]) {
        state.messages[message.channelId] = [];
      }
      // Replace temp message with real one or add new message
      const msgIndex = state.messages[message.channelId].findIndex(
        m => m.tempId === message.tempId
      );
      if (msgIndex >= 0) {
        state.messages[message.channelId][msgIndex] = message;
      } else {
        state.messages[message.channelId].push(message);
      }
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    
    // Create Channel
    builder.addCase(createChannel.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createChannel.fulfilled, (state, action) => {
      state.loading = false;
      state.channels.push(action.payload);
      state.activeChannel = action.payload;
    });
    builder.addCase(createChannel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const { setActiveChannel, addMessage, updateMessageStatus, clearError } = chatSlice.actions;
export default chatSlice.reducer; 