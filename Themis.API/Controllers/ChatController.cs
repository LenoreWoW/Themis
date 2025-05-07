using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Themis.Core.Entities;
using Themis.Core.Interfaces;
using Themis.API.Hubs;
using Themis.API.Models;

namespace Themis.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IHubContext<ChatHub> _chatHubContext;

        public ChatController(IChatService chatService, IHubContext<ChatHub> chatHubContext)
        {
            _chatService = chatService;
            _chatHubContext = chatHubContext;
        }

        #region Channels

        [HttpGet("channels")]
        public async Task<IActionResult> GetUserChannels()
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var channels = await _chatService.GetUserChannelsAsync(userId);
                return Ok(new { success = true, data = channels });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error retrieving user channels", error = ex.Message });
            }
        }

        [HttpGet("channels/{channelId}")]
        public async Task<IActionResult> GetChannel(string channelId)
        {
            try
            {
                var channel = await _chatService.GetChannelByIdAsync(channelId);
                if (channel == null)
                    return NotFound(new { success = false, message = "Channel not found" });

                return Ok(new { success = true, data = channel });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error retrieving channel", error = ex.Message });
            }
        }

        [HttpPost("channels")]
        public async Task<IActionResult> CreateChannel([FromBody] CreateChannelRequest request)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var channel = await _chatService.CreateChannelAsync(
                    request.Name,
                    request.Type,
                    userId,
                    request.DepartmentId,
                    request.ProjectId
                );

                return Ok(new { success = true, data = channel });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error creating channel", error = ex.Message });
            }
        }

        [HttpPost("channels/{channelId}/members")]
        public async Task<IActionResult> AddMemberToChannel(string channelId, [FromBody] AddChannelMemberRequest request)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var result = await _chatService.AddUserToChannelAsync(request.UserId, channelId);
                if (!result)
                    return BadRequest(new { success = false, message = "Failed to add user to channel" });

                return Ok(new { success = true, message = "User added to channel successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error adding user to channel", error = ex.Message });
            }
        }

        [HttpDelete("channels/{channelId}/members/{userId}")]
        public async Task<IActionResult> RemoveMemberFromChannel(string channelId, string userId)
        {
            try
            {
                var currentUserId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(currentUserId))
                    return Unauthorized();

                var result = await _chatService.RemoveUserFromChannelAsync(userId, channelId);
                if (!result)
                    return BadRequest(new { success = false, message = "Failed to remove user from channel" });

                return Ok(new { success = true, message = "User removed from channel successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error removing user from channel", error = ex.Message });
            }
        }

        [HttpGet("channels/{channelId}/members")]
        public async Task<IActionResult> GetChannelMembers(string channelId)
        {
            try
            {
                var members = await _chatService.GetChannelMembersAsync(channelId);
                return Ok(new { success = true, data = members });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error retrieving channel members", error = ex.Message });
            }
        }

        [HttpPut("channels/{channelId}/archive")]
        public async Task<IActionResult> ArchiveChannel(string channelId)
        {
            try
            {
                var result = await _chatService.ArchiveChannelAsync(channelId);
                if (!result)
                    return BadRequest(new { success = false, message = "Failed to archive channel" });

                // Notify all channel members about the channel being archived
                await _chatHubContext.Clients.Group(channelId).SendAsync("ChannelArchived", channelId);

                return Ok(new { success = true, message = "Channel archived successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error archiving channel", error = ex.Message });
            }
        }

        #endregion

        #region Messages

        [HttpGet("channels/{channelId}/messages")]
        public async Task<IActionResult> GetChannelMessages(string channelId, [FromQuery] int limit = 50, [FromQuery] int offset = 0)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                // Update last read time
                await _chatService.UpdateLastReadTimeAsync(userId, channelId);

                var messages = await _chatService.GetChannelMessagesAsync(channelId, limit, offset);
                return Ok(new { success = true, data = messages });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error retrieving channel messages", error = ex.Message });
            }
        }

        [HttpPost("channels/{channelId}/messages")]
        public async Task<IActionResult> CreateMessage(string channelId, [FromBody] CreateMessageRequest request)
        {
            try
            {
                var senderId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(senderId))
                    return Unauthorized();

                // Check if user can post to this channel
                var canPost = await _chatService.CanUserPostToChannelAsync(senderId, channelId);
                if (!canPost)
                    return Unauthorized(new { success = false, message = "You don't have permission to post in this channel" });

                var message = await _chatService.CreateMessageAsync(
                    channelId,
                    senderId,
                    request.Body,
                    request.FileUrl,
                    request.FileType,
                    request.FileSize
                );

                // Notify all channel members about the new message
                await _chatHubContext.Clients.Group(channelId).SendAsync("NewMessage", message);

                return Ok(new { success = true, data = message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error creating message", error = ex.Message });
            }
        }

        [HttpPut("messages/{messageId}")]
        public async Task<IActionResult> UpdateMessage(string messageId, [FromBody] UpdateMessageRequest request)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var message = await _chatService.UpdateMessageAsync(messageId, userId, request.Body);

                // Notify all members about the message update
                await _chatHubContext.Clients.Group(message.ChannelId).SendAsync("MessageUpdated", message);

                return Ok(new { success = true, data = message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error updating message", error = ex.Message });
            }
        }

        [HttpDelete("messages/{messageId}")]
        public async Task<IActionResult> DeleteMessage(string messageId)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var result = await _chatService.DeleteMessageAsync(messageId, userId);
                if (!result)
                    return BadRequest(new { success = false, message = "Failed to delete message" });

                // Notify all members about the message deletion
                await _chatHubContext.Clients.All.SendAsync("MessageDeleted", messageId);

                return Ok(new { success = true, message = "Message deleted successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error deleting message", error = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchMessages([FromQuery] string query, [FromQuery] string channelId = null)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var messages = await _chatService.SearchMessagesAsync(query, userId, channelId);
                return Ok(new { success = true, data = messages });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error searching messages", error = ex.Message });
            }
        }

        #endregion

        #region Direct Messages

        [HttpPost("dm")]
        public async Task<IActionResult> CreateDirectMessageChannel([FromBody] CreateDMRequest request)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                // Check if users can message each other
                var canMessage = await _chatService.CanUsersDirectMessageAsync(userId, request.RecipientId);
                if (!canMessage)
                    return Unauthorized(new { success = false, message = "You don't have permission to send direct messages to this user" });

                var channel = await _chatService.CreateOrGetDirectMessageChannelAsync(userId, request.RecipientId);
                return Ok(new { success = true, data = channel });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error creating direct message channel", error = ex.Message });
            }
        }

        #endregion

        #region Project Channels

        [HttpPost("projects/{projectId}/channel")]
        public async Task<IActionResult> CreateProjectChannel(string projectId)
        {
            try
            {
                var channel = await _chatService.CreateProjectChannelAsync(projectId);
                return Ok(new { success = true, data = channel });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error creating project channel", error = ex.Message });
            }
        }

        [HttpPost("projects/{projectId}/completion")]
        public async Task<IActionResult> HandleProjectCompletion(string projectId)
        {
            try
            {
                var result = await _chatService.HandleProjectCompletionAsync(projectId);
                if (!result)
                    return BadRequest(new { success = false, message = "Failed to update project channel" });

                return Ok(new { success = true, message = "Project channel archived successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error handling project completion", error = ex.Message });
            }
        }

        #endregion

        #region Default Channels

        [HttpPost("setup/channels")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> SetupDefaultChannels()
        {
            try
            {
                var channels = await _chatService.CreateDepartmentChannelsAsync();
                return Ok(new { success = true, data = channels });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error setting up default channels", error = ex.Message });
            }
        }

        [HttpGet("announcements/general")]
        public async Task<IActionResult> GetGeneralAnnouncementsChannel()
        {
            try
            {
                var channel = await _chatService.GetGeneralAnnouncementsChannelAsync();
                if (channel == null)
                    return NotFound(new { success = false, message = "General announcements channel not found" });

                return Ok(new { success = true, data = channel });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error retrieving general announcements channel", error = ex.Message });
            }
        }

        [HttpGet("announcements/department/{departmentId}")]
        public async Task<IActionResult> GetDepartmentAnnouncementsChannel(string departmentId)
        {
            try
            {
                var channel = await _chatService.GetDepartmentAnnouncementsChannelAsync(departmentId);
                if (channel == null)
                    return NotFound(new { success = false, message = "Department announcements channel not found" });

                return Ok(new { success = true, data = channel });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Error retrieving department announcements channel", error = ex.Message });
            }
        }

        #endregion
    }
} 