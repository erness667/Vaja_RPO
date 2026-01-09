using System.ComponentModel.DataAnnotations;

namespace SuperCarsApi.Models
{
    public class CarDealership
    {
        public int Id { get; set; }

        // Owner of the dealership (the user who created it)
        [Required]
        public Guid OwnerId { get; set; }
        public User Owner { get; set; } = null!;

        // Dealership information
        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required, MaxLength(200)]
        public string Address { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string City { get; set; } = string.Empty;

        // Geographic coordinates for map display
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        [Required, MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(256)]
        public string? Email { get; set; }

        [MaxLength(500)]
        public string? Website { get; set; }

        [MaxLength(20)]
        public string? TaxNumber { get; set; }

        // Approval status
        [Required]
        public DealershipStatus Status { get; set; } = DealershipStatus.Pending;

        // Admin who approved/declined (if applicable)
        public Guid? ReviewedByAdminId { get; set; }
        public User? ReviewedByAdmin { get; set; }

        // Review notes from admin
        [MaxLength(1000)]
        public string? AdminNotes { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<DealershipWorker> Workers { get; set; } = new List<DealershipWorker>();
    }

    public enum DealershipStatus
    {
        Pending = 0,    // Waiting for admin approval
        Approved = 1,   // Approved by admin
        Declined = 2,   // Declined by admin
        Suspended = 3   // Suspended by admin (can be reactivated)
    }
}

