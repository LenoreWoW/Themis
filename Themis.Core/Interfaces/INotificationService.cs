using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Themis.Core.Entities;

namespace Themis.Core.Interfaces
{
    public interface INotificationService
    {
        Task<Notification> CreateNotificationAsync(Guid userId, string type, string title, string message, Guid? relatedItemId = null, string relatedItemType = null);
        Task<List<Notification>> GetUserNotificationsAsync(Guid userId, bool includeRead = false);
        Task<Notification> MarkNotificationAsReadAsync(Guid notificationId);
        Task<int> MarkAllNotificationsAsReadAsync(Guid userId);
        Task<bool> DeleteNotificationAsync(Guid notificationId);
    }
} 