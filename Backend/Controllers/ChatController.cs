using System.Security.Claims;
using Backend.DTOs.Chat;
using Backend.DTOs.Auth;
using Backend.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SuperCarsApi.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/chat")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(ApplicationDbContext dbContext, IHubContext<ChatHub> hubContext)
        {
            _dbContext = dbContext;
            _hubContext = hubContext;
        }

        /// <summary>
        /// Get chat history with a specific user
        /// Users can view their chat history even if they are no longer friends
        /// </summary>
        [HttpGet("conversation/{userId}")]
        public async Task<IActionResult> GetConversation(Guid userId, [FromQuery] int skip = 0, [FromQuery] int take = 50)
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (currentUserIdClaim == null || !Guid.TryParse(currentUserIdClaim.Value, out var currentUserId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            // Allow users to view their chat history regardless of friend status
            // This allows viewing messages even after unfriending someone
            var messages = await _dbContext.Messages
                .Where(m =>
                    (m.SenderId == currentUserId && m.ReceiverId == userId) ||
                    (m.SenderId == userId && m.ReceiverId == currentUserId))
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .OrderByDescending(m => m.SentAt)
                .Skip(skip)
                .Take(take)
                .Select(m => new MessageDto
                {
                    Id = m.Id,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    Content = m.Content,
                    SentAt = m.SentAt,
                    IsRead = m.IsRead,
                    ReadAt = m.ReadAt,
                    Sender = new UserDto
                    {
                        Id = m.Sender.Id,
                        Email = m.Sender.Email,
                        Name = m.Sender.Name,
                        Surname = m.Sender.Surname,
                        Username = m.Sender.Username,
                        PhoneNumber = m.Sender.PhoneNumber,
                        AvatarImageUrl = m.Sender.AvatarImageUrl,
                        Role = m.Sender.Role
                    },
                    Receiver = new UserDto
                    {
                        Id = m.Receiver.Id,
                        Email = m.Receiver.Email,
                        Name = m.Receiver.Name,
                        Surname = m.Receiver.Surname,
                        Username = m.Receiver.Username,
                        PhoneNumber = m.Receiver.PhoneNumber,
                        AvatarImageUrl = m.Receiver.AvatarImageUrl,
                        Role = m.Receiver.Role
                    }
                })
                .OrderBy(m => m.SentAt) // Return in chronological order
                .ToListAsync();

            return Ok(messages);
        }

        /// <summary>
        /// Get list of conversations (users you've chatted with)
        /// </summary>
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (currentUserIdClaim == null || !Guid.TryParse(currentUserIdClaim.Value, out var currentUserId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            // Get distinct users you've exchanged messages with
            var conversationPartners = await _dbContext.Messages
                .Where(m => m.SenderId == currentUserId || m.ReceiverId == currentUserId)
                .Select(m => m.SenderId == currentUserId ? m.ReceiverId : m.SenderId)
                .Distinct()
                .ToListAsync();

            // Get latest message for each conversation
            var conversations = new List<object>();
            foreach (var partnerId in conversationPartners)
            {
                var latestMessage = await _dbContext.Messages
                    .Where(m =>
                        (m.SenderId == currentUserId && m.ReceiverId == partnerId) ||
                        (m.SenderId == partnerId && m.ReceiverId == currentUserId))
                    .Include(m => m.Sender)
                    .Include(m => m.Receiver)
                    .OrderByDescending(m => m.SentAt)
                    .FirstOrDefaultAsync();

                if (latestMessage != null)
                {
                    var partner = latestMessage.SenderId == currentUserId ? latestMessage.Receiver : latestMessage.Sender;
                    var unreadCount = await _dbContext.Messages
                        .CountAsync(m => m.SenderId == partnerId && m.ReceiverId == currentUserId && !m.IsRead);

                    conversations.Add(new
                    {
                        UserId = partnerId,
                        User = new UserDto
                        {
                            Id = partner.Id,
                            Email = partner.Email,
                            Name = partner.Name,
                            Surname = partner.Surname,
                            Username = partner.Username,
                            PhoneNumber = partner.PhoneNumber,
                            AvatarImageUrl = partner.AvatarImageUrl,
                            Role = partner.Role
                        },
                        LastMessage = new
                        {
                            Content = latestMessage.Content,
                            SentAt = latestMessage.SentAt,
                            IsRead = latestMessage.IsRead
                        },
                        UnreadCount = unreadCount
                    });
                }
            }

            // Sort by last message time
            var sortedConversations = conversations
                .OrderByDescending(c => ((dynamic)c).LastMessage.SentAt)
                .ToList();

            return Ok(sortedConversations);
        }

        /// <summary>
        /// Mark messages as read
        /// </summary>
        [HttpPost("mark-read")]
        public async Task<IActionResult> MarkMessagesAsRead([FromBody] MarkMessagesReadRequest request)
        {
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (currentUserIdClaim == null || !Guid.TryParse(currentUserIdClaim.Value, out var currentUserId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var messages = await _dbContext.Messages
                .Where(m => m.ReceiverId == currentUserId && 
                           m.SenderId == request.SenderId && 
                           !m.IsRead)
                .ToListAsync();

            var messageIds = new List<int>();
            foreach (var message in messages)
            {
                message.IsRead = true;
                message.ReadAt = DateTime.UtcNow;
                messageIds.Add(message.Id);
            }

            await _dbContext.SaveChangesAsync();

            // Notify sender via SignalR that messages were read
            foreach (var messageId in messageIds)
            {
                await _hubContext.Clients.Group(request.SenderId.ToString()).SendAsync("MessageRead", messageId);
            }

            return Ok(new { message = "Messages marked as read." });
        }
    }
}



