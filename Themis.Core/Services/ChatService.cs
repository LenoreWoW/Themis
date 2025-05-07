using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Themis.Core.Entities;
using Themis.Core.Interfaces;
using Themis.Infrastructure.Data;

namespace Themis.Core.Services
{
    public class ChatService : IChatService
    {
        private readonly ApplicationDbContext _context;

        public ChatService(ApplicationDbContext context)
        {
            _context = context;
        }

        #region Channel Management

        public async Task<ChatChannel> CreateChannelAsync(string name, ChannelType type, string creatorId, string departmentId = null, string projectId = null)
        {
            var creator = await _context.Users.FindAsync(creatorId);
            if (creator == null)
                throw new ArgumentException("Invalid creator ID", nameof(creatorId));

            // Check permissions based on channel type
            if (type == ChannelType.General)
            {
                // Only Main PMO or Executives can create general channels
                if (creator.Role != "MAIN_PMO" && creator.Role != "EXECUTIVE" && creator.Role != "ADMIN")
                    throw new UnauthorizedAccessException("Only Main PMO or Executives can create general channels");
            }
            else if (type == ChannelType.Department && !string.IsNullOrEmpty(departmentId))
            {
                // Only Department Directors or Sub-PMOs of that department can create department channels
                var department = await _context.Departments.FindAsync(departmentId);
                if (department == null)
                    throw new ArgumentException("Invalid department ID", nameof(departmentId));

                if (creator.DepartmentId != departmentId && 
                    (creator.Role != "DEPARTMENT_DIRECTOR" && creator.Role != "SUB_PMO" && creator.Role != "ADMIN"))
                    throw new UnauthorizedAccessException("Only Department Directors or Sub-PMOs can create department channels");
            }

            var channel = new ChatChannel
            {
                Name = name,
                Type = type,
                DepartmentId = departmentId,
                ProjectId = projectId,
                IsArchived = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ChatChannels.Add(channel);
            await _context.SaveChangesAsync();
            
            // Add creator as channel member
            await AddUserToChannelAsync(creatorId, channel.Id);
            
            return channel;
        }

        public async Task<ChatChannel> GetChannelByIdAsync(string channelId)
        {
            return await _context.ChatChannels
                .Include(c => c.Department)
                .Include(c => c.Project)
                .FirstOrDefaultAsync(c => c.Id == channelId);
        }

        public async Task<IEnumerable<ChatChannel>> GetUserChannelsAsync(string userId)
        {
            var user = await _context.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == userId);
                
            if (user == null)
                throw new ArgumentException("Invalid user ID", nameof(userId));

            // Get channels the user is a member of
            var memberChannelIds = await _context.ChatChannelMembers
                .Where(m => m.UserId == userId)
                .Select(m => m.ChannelId)
                .ToListAsync();
            
            var query = _context.ChatChannels
                .Include(c => c.Department)
                .Include(c => c.Project)
                .Where(c => memberChannelIds.Contains(c.Id));

            // For Main PMO and Executives, include all company-wide announcement channels
            if (user.Role == "MAIN_PMO" || user.Role == "EXECUTIVE" || user.Role == "ADMIN")
            {
                query = query.Union(_context.ChatChannels
                    .Include(c => c.Department)
                    .Include(c => c.Project)
                    .Where(c => c.Type == ChannelType.General));
            }
            
            // For Department Directors and Sub-PMOs, include department announcement channels
            if (user.Role == "DEPARTMENT_DIRECTOR" || user.Role == "SUB_PMO")
            {
                query = query.Union(_context.ChatChannels
                    .Include(c => c.Department)
                    .Include(c => c.Project)
                    .Where(c => c.Type == ChannelType.Department && c.DepartmentId == user.DepartmentId));
            }
            
            // Include department-specific announcement channels for the user's department
            query = query.Union(_context.ChatChannels
                .Include(c => c.Department)
                .Include(c => c.Project)
                .Where(c => c.Type == ChannelType.Department && c.DepartmentId == user.DepartmentId));
            
            return await query.ToListAsync();
        }

        public async Task<bool> ArchiveChannelAsync(string channelId)
        {
            var channel = await _context.ChatChannels.FindAsync(channelId);
            if (channel == null)
                return false;
                
            channel.IsArchived = true;
            channel.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CanUserPostToChannelAsync(string userId, string channelId)
        {
            var user = await _context.Users.FindAsync(userId);
            var channel = await _context.ChatChannels.FindAsync(channelId);
            
            if (user == null || channel == null)
                return false;
                
            // Archived channels are read-only
            if (channel.IsArchived)
                return false;
                
            // Check permissions based on channel type
            switch (channel.Type)
            {
                case ChannelType.General:
                    // Only Main PMO and Executives can post to general announcement channels
                    return user.Role == "MAIN_PMO" || user.Role == "EXECUTIVE" || user.Role == "ADMIN";
                    
                case ChannelType.Department:
                    // Department Directors and Sub-PMOs of that department can post to department announcement channels
                    return (user.Role == "DEPARTMENT_DIRECTOR" || user.Role == "SUB_PMO" || user.Role == "ADMIN") 
                           && user.DepartmentId == channel.DepartmentId;
                    
                case ChannelType.Project:
                    // Project members can post to project channels
                    var isProjectMember = await _context.ProjectTeamMembers
                        .AnyAsync(tm => tm.ProjectId == channel.ProjectId && tm.UserId == userId);
                    var isProjectManager = await _context.Projects
                        .AnyAsync(p => p.Id == channel.ProjectId && p.PMUserId == userId);
                    return isProjectMember || isProjectManager || user.Role == "ADMIN";
                    
                case ChannelType.DirectMessage:
                    // Both users in a DM channel can post
                    var isMember = await _context.ChatChannelMembers
                        .AnyAsync(m => m.ChannelId == channelId && m.UserId == userId);
                    return isMember;
                    
                default:
                    return false;
            }
        }

        #endregion

        #region Channel Membership

        public async Task<bool> AddUserToChannelAsync(string userId, string channelId)
        {
            var user = await _context.Users.FindAsync(userId);
            var channel = await _context.ChatChannels.FindAsync(channelId);
            
            if (user == null || channel == null)
                return false;
                
            // Check if user is already a member
            var existingMembership = await _context.ChatChannelMembers
                .FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == userId);
                
            if (existingMembership != null)
                return true;
                
            // Create new membership
            var membership = new ChatChannelMember
            {
                ChannelId = channelId,
                UserId = userId,
                JoinedAt = DateTime.UtcNow,
                LastReadAt = null
            };
            
            _context.ChatChannelMembers.Add(membership);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveUserFromChannelAsync(string userId, string channelId)
        {
            var membership = await _context.ChatChannelMembers
                .FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == userId);
                
            if (membership == null)
                return false;
                
            _context.ChatChannelMembers.Remove(membership);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateLastReadTimeAsync(string userId, string channelId)
        {
            var membership = await _context.ChatChannelMembers
                .FirstOrDefaultAsync(m => m.ChannelId == channelId && m.UserId == userId);
                
            if (membership == null)
                return false;
                
            membership.LastReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ChatChannelMember>> GetChannelMembersAsync(string channelId)
        {
            return await _context.ChatChannelMembers
                .Include(m => m.User)
                .Where(m => m.ChannelId == channelId)
                .ToListAsync();
        }

        #endregion

        #region Messages

        public async Task<ChatMessage> CreateMessageAsync(string channelId, string senderId, string body, string fileUrl = null, string fileType = null, long? fileSize = null)
        {
            // Check if user can post to this channel
            if (!await CanUserPostToChannelAsync(senderId, channelId))
                throw new UnauthorizedAccessException("User cannot post to this channel");
                
            var message = new ChatMessage
            {
                ChannelId = channelId,
                SenderId = senderId,
                Body = body,
                FileUrl = fileUrl,
                FileType = fileType,
                FileSize = fileSize,
                IsEdited = false,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();
            
            return message;
        }

        public async Task<ChatMessage> UpdateMessageAsync(string messageId, string userId, string body)
        {
            var message = await _context.ChatMessages.FindAsync(messageId);
            
            if (message == null)
                throw new ArgumentException("Message not found", nameof(messageId));
                
            // Only the sender can edit their message
            if (message.SenderId != userId)
                throw new UnauthorizedAccessException("Only the sender can edit this message");
                
            // Only allow edits within 5 minutes
            if (DateTime.UtcNow.Subtract(message.CreatedAt).TotalMinutes > 5)
                throw new InvalidOperationException("Messages can only be edited within 5 minutes of creation");
                
            message.Body = body;
            message.IsEdited = true;
            message.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return message;
        }

        public async Task<bool> DeleteMessageAsync(string messageId, string userId)
        {
            var message = await _context.ChatMessages.FindAsync(messageId);
            
            if (message == null)
                return false;
                
            // Only the sender can delete their message
            if (message.SenderId != userId)
                throw new UnauthorizedAccessException("Only the sender can delete this message");
                
            // Only allow deletion within 5 minutes
            if (DateTime.UtcNow.Subtract(message.CreatedAt).TotalMinutes > 5)
                throw new InvalidOperationException("Messages can only be deleted within 5 minutes of creation");
                
            // Soft delete
            message.IsDeleted = true;
            message.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<IEnumerable<ChatMessage>> GetChannelMessagesAsync(string channelId, int limit = 50, int offset = 0)
        {
            return await _context.ChatMessages
                .Include(m => m.Sender)
                .Where(m => m.ChannelId == channelId && !m.IsDeleted)
                .OrderByDescending(m => m.CreatedAt)
                .Skip(offset)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<ChatMessage>> SearchMessagesAsync(string searchTerm, string userId, string channelId = null)
        {
            // Get channels the user has access to
            var userChannels = await GetUserChannelsAsync(userId);
            var channelIds = userChannels.Select(c => c.Id).ToList();
            
            var query = _context.ChatMessages
                .Include(m => m.Sender)
                .Include(m => m.Channel)
                .Where(m => channelIds.Contains(m.ChannelId) && !m.IsDeleted && m.Body.Contains(searchTerm));
                
            // Filter by channel if specified
            if (!string.IsNullOrEmpty(channelId))
            {
                query = query.Where(m => m.ChannelId == channelId);
            }
            
            return await query.OrderByDescending(m => m.CreatedAt).Take(50).ToListAsync();
        }

        #endregion

        #region Project Lifecycle

        public async Task<ChatChannel> CreateProjectChannelAsync(string projectId)
        {
            var project = await _context.Projects
                .Include(p => p.ProjectManager)
                .Include(p => p.TeamMembers)
                .ThenInclude(tm => tm.User)
                .FirstOrDefaultAsync(p => p.Id == projectId);
                
            if (project == null)
                throw new ArgumentException("Invalid project ID", nameof(projectId));
                
            // Create project channel
            var channelName = $"project-{projectId}";
            var channel = new ChatChannel
            {
                Name = channelName,
                Type = ChannelType.Project,
                ProjectId = projectId,
                DepartmentId = project.DepartmentId,
                IsArchived = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            _context.ChatChannels.Add(channel);
            await _context.SaveChangesAsync();
            
            // Add project manager to channel
            if (project.ProjectManager != null)
            {
                await AddUserToChannelAsync(project.ProjectManager.Id, channel.Id);
            }
            
            // Add team members to channel
            foreach (var teamMember in project.TeamMembers)
            {
                await AddUserToChannelAsync(teamMember.UserId, channel.Id);
            }
            
            return channel;
        }

        public async Task<bool> HandleProjectCompletionAsync(string projectId)
        {
            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
                return false;
                
            // Only handle if project is completed
            if (project.Status != "COMPLETED")
                return false;
                
            // Find the project's channel and archive it
            var projectChannel = await _context.ChatChannels
                .FirstOrDefaultAsync(c => c.Type == ChannelType.Project && c.ProjectId == projectId);
                
            if (projectChannel == null)
                return false;
                
            projectChannel.IsArchived = true;
            projectChannel.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return true;
        }

        #endregion

        #region Default Channels

        public async Task<IEnumerable<ChatChannel>> CreateDepartmentChannelsAsync()
        {
            var departments = await _context.Departments.ToListAsync();
            var createdChannels = new List<ChatChannel>();
            
            // Create general announcements channel if it doesn't exist
            var generalAnnouncementsChannel = await _context.ChatChannels
                .FirstOrDefaultAsync(c => c.Type == ChannelType.General && c.Name == "general-announcements");
                
            if (generalAnnouncementsChannel == null)
            {
                generalAnnouncementsChannel = new ChatChannel
                {
                    Name = "general-announcements",
                    Type = ChannelType.General,
                    IsArchived = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                _context.ChatChannels.Add(generalAnnouncementsChannel);
                createdChannels.Add(generalAnnouncementsChannel);
            }
            
            // Create department announcement channels
            foreach (var department in departments)
            {
                var channelName = $"dept-announcements-{department.Name.ToLower().Replace(" ", "-")}";
                var existingChannel = await _context.ChatChannels
                    .FirstOrDefaultAsync(c => c.Type == ChannelType.Department && c.DepartmentId == department.Id);
                    
                if (existingChannel == null)
                {
                    var departmentChannel = new ChatChannel
                    {
                        Name = channelName,
                        Type = ChannelType.Department,
                        DepartmentId = department.Id,
                        IsArchived = false,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    
                    _context.ChatChannels.Add(departmentChannel);
                    createdChannels.Add(departmentChannel);
                }
            }
            
            await _context.SaveChangesAsync();
            return createdChannels;
        }

        public async Task<ChatChannel> GetGeneralAnnouncementsChannelAsync()
        {
            return await _context.ChatChannels
                .FirstOrDefaultAsync(c => c.Type == ChannelType.General && c.Name == "general-announcements");
        }

        public async Task<ChatChannel> GetDepartmentAnnouncementsChannelAsync(string departmentId)
        {
            var department = await _context.Departments.FindAsync(departmentId);
            if (department == null)
                return null;
                
            return await _context.ChatChannels
                .FirstOrDefaultAsync(c => c.Type == ChannelType.Department && c.DepartmentId == departmentId);
        }

        #endregion

        #region Direct Messaging

        public async Task<ChatChannel> CreateOrGetDirectMessageChannelAsync(string user1Id, string user2Id)
        {
            // Check if users can message each other
            if (!await CanUsersDirectMessageAsync(user1Id, user2Id))
                throw new UnauthorizedAccessException("These users cannot direct message each other");
                
            // Check if DM channel already exists
            var existingDM = await _context.ChatChannels
                .Where(c => c.Type == ChannelType.DirectMessage)
                .Where(c => c.Members.Any(m => m.UserId == user1Id) && c.Members.Any(m => m.UserId == user2Id))
                .FirstOrDefaultAsync();
                
            if (existingDM != null)
                return existingDM;
                
            // Get user information for channel name
            var user1 = await _context.Users.FindAsync(user1Id);
            var user2 = await _context.Users.FindAsync(user2Id);
            
            if (user1 == null || user2 == null)
                throw new ArgumentException("Invalid user IDs");
                
            // Create new DM channel
            var channelName = $"dm-{user1.FirstName}-{user2.FirstName}";
            var dmChannel = new ChatChannel
            {
                Name = channelName,
                Type = ChannelType.DirectMessage,
                IsArchived = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            _context.ChatChannels.Add(dmChannel);
            await _context.SaveChangesAsync();
            
            // Add both users to the channel
            await AddUserToChannelAsync(user1Id, dmChannel.Id);
            await AddUserToChannelAsync(user2Id, dmChannel.Id);
            
            return dmChannel;
        }

        public async Task<bool> CanUsersDirectMessageAsync(string senderId, string receiverId)
        {
            var sender = await _context.Users.Include(u => u.Department).FirstOrDefaultAsync(u => u.Id == senderId);
            var receiver = await _context.Users.Include(u => u.Department).FirstOrDefaultAsync(u => u.Id == receiverId);
            
            if (sender == null || receiver == null)
                return false;
                
            // Users in the same department can always DM each other
            if (sender.DepartmentId == receiver.DepartmentId)
                return true;
                
            // Cross-department DMs are restricted to Main PMO or Executives
            return sender.Role == "MAIN_PMO" || sender.Role == "EXECUTIVE" || sender.Role == "ADMIN";
        }

        #endregion
    }
} 