using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Themis.Core.Entities;

namespace Themis.Core.Interfaces
{
    public interface IChatService
    {
        // Channel management
        Task<ChatChannel> CreateChannelAsync(string name, ChannelType type, string creatorId, string departmentId = null, string projectId = null);
        Task<ChatChannel> GetChannelByIdAsync(string channelId);
        Task<IEnumerable<ChatChannel>> GetUserChannelsAsync(string userId);
        Task<bool> ArchiveChannelAsync(string channelId);
        Task<bool> CanUserPostToChannelAsync(string userId, string channelId);
        
        // Channel membership
        Task<bool> AddUserToChannelAsync(string userId, string channelId);
        Task<bool> RemoveUserFromChannelAsync(string userId, string channelId);
        Task<bool> UpdateLastReadTimeAsync(string userId, string channelId);
        Task<IEnumerable<ChatChannelMember>> GetChannelMembersAsync(string channelId);
        
        // Messages
        Task<ChatMessage> CreateMessageAsync(string channelId, string senderId, string body, string fileUrl = null, string fileType = null, long? fileSize = null);
        Task<ChatMessage> UpdateMessageAsync(string messageId, string senderId, string body);
        Task<bool> DeleteMessageAsync(string messageId, string userId);
        Task<IEnumerable<ChatMessage>> GetChannelMessagesAsync(string channelId, int limit = 50, int offset = 0);
        Task<IEnumerable<ChatMessage>> SearchMessagesAsync(string searchTerm, string userId, string channelId = null);
        
        // Project lifecycle hooks
        Task<ChatChannel> CreateProjectChannelAsync(string projectId);
        Task<bool> HandleProjectCompletionAsync(string projectId);
        
        // Department and general channels
        Task<IEnumerable<ChatChannel>> CreateDepartmentChannelsAsync();
        Task<ChatChannel> GetGeneralAnnouncementsChannelAsync();
        Task<ChatChannel> GetDepartmentAnnouncementsChannelAsync(string departmentId);
        
        // Direct messaging
        Task<ChatChannel> CreateOrGetDirectMessageChannelAsync(string user1Id, string user2Id);
        Task<bool> CanUsersDirectMessageAsync(string senderId, string receiverId);
    }
} 