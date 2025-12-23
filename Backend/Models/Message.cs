using System.ComponentModel.DataAnnotations;

namespace SuperCarsApi.Models
{
    public class Message
    {
        public int Id { get; set; }

        // Sender of the message
        [Required]
        public Guid SenderId { get; set; }
        public User Sender { get; set; } = null!;

        // Receiver of the message
        [Required]
        public Guid ReceiverId { get; set; }
        public User Receiver { get; set; } = null!;

        // Message content
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        // Timestamp
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        // Whether the message has been read
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }
    }
}

