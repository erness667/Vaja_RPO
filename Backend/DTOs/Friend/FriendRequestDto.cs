using Backend.DTOs.Auth;

namespace Backend.DTOs.Friend
{
    public class FriendRequestDto
    {
        public int Id { get; set; }
        public Guid RequesterId { get; set; }
        public Guid AddresseeId { get; set; }
        public int Status { get; set; } // 0 = Pending, 1 = Accepted, 2 = Rejected
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public UserDto? Requester { get; set; }
        public UserDto? Addressee { get; set; }
    }
}

