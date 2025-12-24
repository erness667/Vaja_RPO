using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Chat
{
    public class SendMessageRequest
    {
        [Required]
        public Guid ReceiverId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }
}



