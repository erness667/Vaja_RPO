using Backend.DTOs.Auth;

namespace Backend.DTOs.Friend
{
    public class FriendDto
    {
        public Guid UserId { get; set; }
        public UserDto User { get; set; } = null!;
        public DateTime FriendsSince { get; set; }
    }
}

