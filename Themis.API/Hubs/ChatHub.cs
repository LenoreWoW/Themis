using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Themis.Core.Interfaces;

namespace Themis.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                var userId = Context.User.FindFirst("userId")?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    // Get all user's channels and join them
                    var channels = await _chatService.GetUserChannelsAsync(userId);
                    foreach (var channel in channels)
                    {
                        await Groups.AddToGroupAsync(Context.ConnectionId, channel.Id);
                    }

                    // Notify other users that this user is online
                    await Clients.Others.SendAsync("UserOnline", userId);
                }

                await base.OnConnectedAsync();
            }
            catch (Exception ex)
            {
                // Log the error (in production)
                await Clients.Caller.SendAsync("Error", $"Error connecting to chat: {ex.Message}");
                throw;
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            try
            {
                var userId = Context.User.FindFirst("userId")?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    // Notify other users that this user is offline
                    await Clients.Others.SendAsync("UserOffline", userId);
                }

                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                // Log the error (in production)
                throw;
            }
        }

        public async Task JoinChannel(string channelId)
        {
            try
            {
                var userId = Context.User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                    throw new HubException("Unauthorized");

                // Add connection to channel group
                await Groups.AddToGroupAsync(Context.ConnectionId, channelId);

                // Update the last read time
                await _chatService.UpdateLastReadTimeAsync(userId, channelId);

                await Clients.Caller.SendAsync("JoinedChannel", channelId);
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", $"Error joining channel: {ex.Message}");
                throw;
            }
        }

        public async Task LeaveChannel(string channelId)
        {
            try
            {
                // Remove connection from channel group
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, channelId);
                await Clients.Caller.SendAsync("LeftChannel", channelId);
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", $"Error leaving channel: {ex.Message}");
                throw;
            }
        }

        public async Task SendMessage(string channelId, string message, string fileUrl = null, string fileType = null, long? fileSize = null)
        {
            try
            {
                var userId = Context.User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                    throw new HubException("Unauthorized");

                // Check if user can post to this channel
                if (!await _chatService.CanUserPostToChannelAsync(userId, channelId))
                    throw new HubException("You don't have permission to post in this channel");

                // Save the message to the database
                var chatMessage = await _chatService.CreateMessageAsync(channelId, userId, message, fileUrl, fileType, fileSize);

                // Broadcast to all connections in the channel
                await Clients.Group(channelId).SendAsync("NewMessage", chatMessage);
            }
            catch (HubException)
            {
                throw;
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", $"Error sending message: {ex.Message}");
                throw;
            }
        }

        public async Task UpdateReadStatus(string channelId)
        {
            try
            {
                var userId = Context.User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                    throw new HubException("Unauthorized");

                // Update last read timestamp
                await _chatService.UpdateLastReadTimeAsync(userId, channelId);

                // Notify the user that the read status has been updated
                await Clients.Caller.SendAsync("ReadStatusUpdated", channelId);
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", $"Error updating read status: {ex.Message}");
                throw;
            }
        }
    }
} 