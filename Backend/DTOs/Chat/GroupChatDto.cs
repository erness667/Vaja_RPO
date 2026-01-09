using Backend.DTOs.Auth;

namespace Backend.DTOs.Chat
{
    public class GroupChatDto
    {
        public int Id { get; set; }
        public int DealershipId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Dealership info
        public DealershipInfoDto? Dealership { get; set; }
        
        // Participant count
        public int ParticipantCount { get; set; }
        
        // Unread message count for current user (if applicable)
        public int? UnreadCount { get; set; }
        
        // Last message preview
        public GroupChatMessageDto? LastMessage { get; set; }
    }

    public class DealershipInfoDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
