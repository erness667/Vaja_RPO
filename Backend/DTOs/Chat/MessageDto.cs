using Backend.DTOs.Auth;

namespace Backend.DTOs.Chat
{
    public class MessageDto
    {
        public int Id { get; set; }
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public UserDto? Sender { get; set; }
        public UserDto? Receiver { get; set; }
    }
}

