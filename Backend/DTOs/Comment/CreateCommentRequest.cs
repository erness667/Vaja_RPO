using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Comment
{
    public class CreateCommentRequest
    {
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }
}

