using System.ComponentModel.DataAnnotations;

namespace SuperCarsApi.Models
{
    public class DealershipWorker
    {
        public int Id { get; set; }

        // Dealership this worker belongs to
        [Required]
        public int DealershipId { get; set; }
        public CarDealership Dealership { get; set; } = null!;

        // User who is a worker
        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        // Role in the dealership
        [Required]
        public DealershipWorkerRole Role { get; set; } = DealershipWorkerRole.Worker;

        // Status of the worker invitation/employment
        [Required]
        public DealershipWorkerStatus Status { get; set; } = DealershipWorkerStatus.Pending;

        // Who invited this worker (usually the owner or another admin)
        [Required]
        public Guid InvitedByUserId { get; set; }
        public User InvitedByUser { get; set; } = null!;

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? AcceptedAt { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum DealershipWorkerRole
    {
        Worker = 0,        // Regular worker
        Admin = 1          // Dealership admin (can manage workers, but owner has ultimate control)
    }

    public enum DealershipWorkerStatus
    {
        Pending = 0,       // Invitation sent, waiting for user to accept
        Active = 1,        // Active worker
        Inactive = 2,      // Deactivated by admin/owner
        Declined = 3       // User declined the invitation
    }
}

