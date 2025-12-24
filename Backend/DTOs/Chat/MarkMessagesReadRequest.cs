using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Chat
{
    public class MarkMessagesReadRequest
    {
        [Required]
        public Guid SenderId { get; set; }
    }
}




