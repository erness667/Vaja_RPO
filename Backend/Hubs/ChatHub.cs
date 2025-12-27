using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SuperCarsApi.Models;

namespace Backend.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _dbContext;

        public ChatHub(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();
            if (userId.HasValue)
            {
                // Add user to a group named after their user ID for direct messaging
                await Groups.AddToGroupAsync(Context.ConnectionId, userId.Value.ToString());
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetUserId();
            if (userId.HasValue)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.Value.ToString());
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(Guid receiverId, string content)
        {
            var senderId = GetUserId();
            if (!senderId.HasValue)
            {
                await Clients.Caller.SendAsync("Error", "Unauthorized");
                return;
            }

            // Validate receiver exists
            var receiver = await _dbContext.Users.FindAsync(receiverId);
            if (receiver == null)
            {
                await Clients.Caller.SendAsync("Error", "Receiver not found.");
                return;
            }

            // Check if users are friends
            var areFriends = await AreFriendsAsync(senderId.Value, receiverId);
            
            // Create and save message
            // If users are not friends, mark as message request
            var message = new Message
            {
                SenderId = senderId.Value,
                ReceiverId = receiverId,
                Content = content,
                SentAt = DateTime.UtcNow,
                IsRead = false,
                IsMessageRequest = !areFriends
            };

            _dbContext.Messages.Add(message);
            await _dbContext.SaveChangesAsync();

            // Load sender for response
            await _dbContext.Entry(message)
                .Reference(m => m.Sender)
                .LoadAsync();

            // Create DTO
            var messageDto = new Backend.DTOs.Chat.MessageDto
            {
                Id = message.Id,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                Content = message.Content,
                SentAt = message.SentAt,
                IsRead = message.IsRead,
                ReadAt = message.ReadAt,
                IsMessageRequest = message.IsMessageRequest,
                Sender = new Backend.DTOs.Auth.UserDto
                {
                    Id = message.Sender.Id,
                    Email = message.Sender.Email,
                    Name = message.Sender.Name,
                    Surname = message.Sender.Surname,
                    Username = message.Sender.Username,
                    PhoneNumber = message.Sender.PhoneNumber,
                    AvatarImageUrl = message.Sender.AvatarImageUrl,
                    Role = message.Sender.Role
                }
            };

            // Send to receiver (if online)
            await Clients.Group(receiverId.ToString()).SendAsync("ReceiveMessage", messageDto);

            // Send confirmation to sender
            await Clients.Caller.SendAsync("MessageSent", messageDto);
        }

        public async Task MarkAsRead(int messageId)
        {
            var userId = GetUserId();
            if (!userId.HasValue)
            {
                await Clients.Caller.SendAsync("Error", "Unauthorized");
                return;
            }

            var message = await _dbContext.Messages
                .FirstOrDefaultAsync(m => m.Id == messageId && m.ReceiverId == userId.Value);

            if (message == null)
            {
                await Clients.Caller.SendAsync("Error", "Message not found.");
                return;
            }

            if (!message.IsRead)
            {
                message.IsRead = true;
                message.ReadAt = DateTime.UtcNow;
                await _dbContext.SaveChangesAsync();

                // Notify sender that message was read
                await Clients.Group(message.SenderId.ToString()).SendAsync("MessageRead", messageId);
            }
        }

        private Guid? GetUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return userId;
            }
            return null;
        }

        private async Task<bool> AreFriendsAsync(Guid userId1, Guid userId2)
        {
            return await _dbContext.FriendRequests
                .AnyAsync(fr =>
                    fr.Status == FriendRequestStatus.Accepted &&
                    ((fr.RequesterId == userId1 && fr.AddresseeId == userId2) ||
                     (fr.RequesterId == userId2 && fr.AddresseeId == userId1)));
        }
    }
}

