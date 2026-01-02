namespace Backend.DTOs.Dealership
{
    public class DealershipWorkerDto
    {
        public int Id { get; set; }
        public int DealershipId { get; set; }
        public string DealershipName { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserSurname { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string? UserAvatarImageUrl { get; set; }
        public string Role { get; set; } = string.Empty; // "Worker" or "Admin"
        public string Status { get; set; } = string.Empty; // "Pending", "Active", "Inactive", "Declined"
        public Guid InvitedByUserId { get; set; }
        public string InvitedByName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}

