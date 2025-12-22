using System.ComponentModel.DataAnnotations;

namespace SuperCarsApi.Models
{
    public class FriendRequest
    {
        public int Id { get; set; }

        // User who sent the friend request
        [Required]
        public Guid RequesterId { get; set; }
        public User Requester { get; set; } = null!;

        // User who received the friend request
        [Required]
        public Guid AddresseeId { get; set; }
        public User Addressee { get; set; } = null!;

        // Status of the friend request
        [Required]
        public FriendRequestStatus Status { get; set; } = FriendRequestStatus.Pending;

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}

