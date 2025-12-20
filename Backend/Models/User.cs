using System.ComponentModel.DataAnnotations;

namespace SuperCarsApi.Models
{
    public class User
    {
        public Guid Id { get; set; }

        [Required, MaxLength(128)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(128)]
        public string Surname { get; set; } = string.Empty;

        [Required, MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string? AvatarImageUrl { get; set; }

        public Role Role { get; set; } = Role.User;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

