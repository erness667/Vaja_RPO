using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Dealership
{
    public class TransferOwnershipRequest
    {
        [Required]
        public Guid NewOwnerId { get; set; }
    }
}

