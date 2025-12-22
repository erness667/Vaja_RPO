using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Friend
{
    public class SendFriendRequestRequest
    {
        [Required]
        public Guid AddresseeId { get; set; }
    }
}

