namespace Backend.DTOs.Dealership
{
    public class DealershipDto
    {
        public int Id { get; set; }
        public Guid OwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public string OwnerSurname { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? TaxNumber { get; set; }
        public string Status { get; set; } = string.Empty; // "Pending", "Approved", "Declined", "Suspended"
        public Guid? ReviewedByAdminId { get; set; }
        public string? ReviewedByAdminName { get; set; }
        public string? AdminNotes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int WorkerCount { get; set; }
    }
}

