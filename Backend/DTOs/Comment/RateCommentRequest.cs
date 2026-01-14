using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Comment
{
    public class RateCommentRequest
    {
        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }
    }
}
