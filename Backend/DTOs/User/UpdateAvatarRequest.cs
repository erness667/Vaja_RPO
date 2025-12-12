using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.User
{
    public class UpdateAvatarRequest
    {
        [Required]
        [Url(ErrorMessage = "Avatar image URL must be a valid URL.")]
        public string AvatarImageUrl { get; set; } = string.Empty;
    }
}

