using System.Security.Claims;
using Backend.DTOs.Friend;
using Backend.DTOs.Auth;
using Backend.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SuperCarsApi.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/friends")]
    [Authorize]
    public class FriendController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IHubContext<ChatHub> _hubContext;

        public FriendController(ApplicationDbContext dbContext, IHubContext<ChatHub> hubContext)
        {
            _dbContext = dbContext;
            _hubContext = hubContext;
        }

        /// <summary>
        /// Send a friend request to another user
        /// </summary>
        [HttpPost("request")]
        public async Task<IActionResult> SendFriendRequest([FromBody] SendFriendRequestRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var requesterId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            // Cannot send friend request to yourself
            if (requesterId == request.AddresseeId)
            {
                return BadRequest(new { message = "You cannot send a friend request to yourself." });
            }

            // Check if addressee exists
            var addressee = await _dbContext.Users.FindAsync(request.AddresseeId);
            if (addressee == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Check if friend request already exists (in any direction)
            var existingRequest = await _dbContext.FriendRequests
                .FirstOrDefaultAsync(fr =>
                    (fr.RequesterId == requesterId && fr.AddresseeId == request.AddresseeId) ||
                    (fr.RequesterId == request.AddresseeId && fr.AddresseeId == requesterId));

            if (existingRequest != null)
            {
                if (existingRequest.Status == FriendRequestStatus.Pending)
                {
                    return BadRequest(new { message = "Friend request already exists." });
                }
                else if (existingRequest.Status == FriendRequestStatus.Accepted)
                {
                    return BadRequest(new { message = "You are already friends with this user." });
                }
                // If rejected, delete the old request to allow sending a new one
                else if (existingRequest.Status == FriendRequestStatus.Rejected)
                {
                    _dbContext.FriendRequests.Remove(existingRequest);
                    await _dbContext.SaveChangesAsync();
                }
            }

            // Create new friend request
            var friendRequest = new FriendRequest
            {
                RequesterId = requesterId,
                AddresseeId = request.AddresseeId,
                Status = FriendRequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.FriendRequests.Add(friendRequest);
            await _dbContext.SaveChangesAsync();

            // Load related data for response
            await _dbContext.Entry(friendRequest)
                .Reference(fr => fr.Requester)
                .LoadAsync();
            await _dbContext.Entry(friendRequest)
                .Reference(fr => fr.Addressee)
                .LoadAsync();

            var response = new FriendRequestDto
            {
                Id = friendRequest.Id,
                RequesterId = friendRequest.RequesterId,
                AddresseeId = friendRequest.AddresseeId,
                Status = (int)friendRequest.Status,
                CreatedAt = friendRequest.CreatedAt,
                UpdatedAt = friendRequest.UpdatedAt,
                Requester = new UserDto
                {
                    Id = friendRequest.Requester.Id,
                    Email = friendRequest.Requester.Email,
                    Name = friendRequest.Requester.Name,
                    Surname = friendRequest.Requester.Surname,
                    Username = friendRequest.Requester.Username,
                    PhoneNumber = friendRequest.Requester.PhoneNumber,
                    AvatarImageUrl = friendRequest.Requester.AvatarImageUrl,
                    Role = friendRequest.Requester.Role
                },
                Addressee = new UserDto
                {
                    Id = friendRequest.Addressee.Id,
                    Email = friendRequest.Addressee.Email,
                    Name = friendRequest.Addressee.Name,
                    Surname = friendRequest.Addressee.Surname,
                    Username = friendRequest.Addressee.Username,
                    PhoneNumber = friendRequest.Addressee.PhoneNumber,
                    AvatarImageUrl = friendRequest.Addressee.AvatarImageUrl,
                    Role = friendRequest.Addressee.Role
                }
            };

            // Notify the addressee about the new friend request
            await _hubContext.Clients.Group(friendRequest.AddresseeId.ToString())
                .SendAsync("FriendRequestReceived", response);

            return Ok(response);
        }

        /// <summary>
        /// Accept a friend request
        /// </summary>
        [HttpPost("request/{id}/accept")]
        public async Task<IActionResult> AcceptFriendRequest(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var friendRequest = await _dbContext.FriendRequests
                .Include(fr => fr.Requester)
                .Include(fr => fr.Addressee)
                .FirstOrDefaultAsync(fr => fr.Id == id);

            if (friendRequest == null)
            {
                return NotFound(new { message = "Friend request not found." });
            }

            // Only the addressee can accept the request
            if (friendRequest.AddresseeId != userId)
            {
                return Forbid();
            }

            if (friendRequest.Status != FriendRequestStatus.Pending)
            {
                return BadRequest(new { message = "Friend request is not pending." });
            }

            friendRequest.Status = FriendRequestStatus.Accepted;
            friendRequest.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            var response = new FriendRequestDto
            {
                Id = friendRequest.Id,
                RequesterId = friendRequest.RequesterId,
                AddresseeId = friendRequest.AddresseeId,
                Status = (int)friendRequest.Status,
                CreatedAt = friendRequest.CreatedAt,
                UpdatedAt = friendRequest.UpdatedAt,
                Requester = new UserDto
                {
                    Id = friendRequest.Requester.Id,
                    Email = friendRequest.Requester.Email,
                    Name = friendRequest.Requester.Name,
                    Surname = friendRequest.Requester.Surname,
                    Username = friendRequest.Requester.Username,
                    PhoneNumber = friendRequest.Requester.PhoneNumber,
                    AvatarImageUrl = friendRequest.Requester.AvatarImageUrl,
                    Role = friendRequest.Requester.Role
                },
                Addressee = new UserDto
                {
                    Id = friendRequest.Addressee.Id,
                    Email = friendRequest.Addressee.Email,
                    Name = friendRequest.Addressee.Name,
                    Surname = friendRequest.Addressee.Surname,
                    Username = friendRequest.Addressee.Username,
                    PhoneNumber = friendRequest.Addressee.PhoneNumber,
                    AvatarImageUrl = friendRequest.Addressee.AvatarImageUrl,
                    Role = friendRequest.Addressee.Role
                }
            };

            // Create FriendDto for both users
            var friendForRequester = new FriendDto
            {
                UserId = friendRequest.AddresseeId,
                User = new UserDto
                {
                    Id = friendRequest.Addressee.Id,
                    Email = friendRequest.Addressee.Email,
                    Name = friendRequest.Addressee.Name,
                    Surname = friendRequest.Addressee.Surname,
                    Username = friendRequest.Addressee.Username,
                    PhoneNumber = friendRequest.Addressee.PhoneNumber,
                    AvatarImageUrl = friendRequest.Addressee.AvatarImageUrl,
                    Role = friendRequest.Addressee.Role
                },
                FriendsSince = friendRequest.UpdatedAt ?? friendRequest.CreatedAt
            };

            var friendForAddressee = new FriendDto
            {
                UserId = friendRequest.RequesterId,
                User = new UserDto
                {
                    Id = friendRequest.Requester.Id,
                    Email = friendRequest.Requester.Email,
                    Name = friendRequest.Requester.Name,
                    Surname = friendRequest.Requester.Surname,
                    Username = friendRequest.Requester.Username,
                    PhoneNumber = friendRequest.Requester.PhoneNumber,
                    AvatarImageUrl = friendRequest.Requester.AvatarImageUrl,
                    Role = friendRequest.Requester.Role
                },
                FriendsSince = friendRequest.UpdatedAt ?? friendRequest.CreatedAt
            };

            // Notify both users about the accepted friend request
            await _hubContext.Clients.Group(friendRequest.RequesterId.ToString())
                .SendAsync("FriendRequestAccepted", friendForRequester);
            await _hubContext.Clients.Group(friendRequest.AddresseeId.ToString())
                .SendAsync("FriendRequestAccepted", friendForAddressee);

            return Ok(response);
        }

        /// <summary>
        /// Reject a friend request
        /// </summary>
        [HttpPost("request/{id}/reject")]
        public async Task<IActionResult> RejectFriendRequest(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var friendRequest = await _dbContext.FriendRequests
                .FirstOrDefaultAsync(fr => fr.Id == id);

            if (friendRequest == null)
            {
                return NotFound(new { message = "Friend request not found." });
            }

            // Only the addressee can reject the request
            if (friendRequest.AddresseeId != userId)
            {
                return Forbid();
            }

            if (friendRequest.Status != FriendRequestStatus.Pending)
            {
                return BadRequest(new { message = "Friend request is not pending." });
            }

            friendRequest.Status = FriendRequestStatus.Rejected;
            friendRequest.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            // Load related data for notification
            await _dbContext.Entry(friendRequest)
                .Reference(fr => fr.Requester)
                .LoadAsync();
            await _dbContext.Entry(friendRequest)
                .Reference(fr => fr.Addressee)
                .LoadAsync();

            var response = new FriendRequestDto
            {
                Id = friendRequest.Id,
                RequesterId = friendRequest.RequesterId,
                AddresseeId = friendRequest.AddresseeId,
                Status = (int)friendRequest.Status,
                CreatedAt = friendRequest.CreatedAt,
                UpdatedAt = friendRequest.UpdatedAt,
                Requester = new UserDto
                {
                    Id = friendRequest.Requester.Id,
                    Email = friendRequest.Requester.Email,
                    Name = friendRequest.Requester.Name,
                    Surname = friendRequest.Requester.Surname,
                    Username = friendRequest.Requester.Username,
                    PhoneNumber = friendRequest.Requester.PhoneNumber,
                    AvatarImageUrl = friendRequest.Requester.AvatarImageUrl,
                    Role = friendRequest.Requester.Role
                },
                Addressee = new UserDto
                {
                    Id = friendRequest.Addressee.Id,
                    Email = friendRequest.Addressee.Email,
                    Name = friendRequest.Addressee.Name,
                    Surname = friendRequest.Addressee.Surname,
                    Username = friendRequest.Addressee.Username,
                    PhoneNumber = friendRequest.Addressee.PhoneNumber,
                    AvatarImageUrl = friendRequest.Addressee.AvatarImageUrl,
                    Role = friendRequest.Addressee.Role
                }
            };

            // Notify the requester about the rejected friend request
            await _hubContext.Clients.Group(friendRequest.RequesterId.ToString())
                .SendAsync("FriendRequestRejected", response);

            return Ok(new { message = "Friend request rejected." });
        }

        /// <summary>
        /// Cancel a sent friend request (only requester can cancel)
        /// </summary>
        [HttpDelete("request/{id}")]
        public async Task<IActionResult> CancelFriendRequest(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var friendRequest = await _dbContext.FriendRequests
                .FirstOrDefaultAsync(fr => fr.Id == id);

            if (friendRequest == null)
            {
                return NotFound(new { message = "Friend request not found." });
            }

            // Only the requester can cancel the request
            if (friendRequest.RequesterId != userId)
            {
                return Forbid();
            }

            var addresseeId = friendRequest.AddresseeId;
            
            // Load related data for notification before deletion
            await _dbContext.Entry(friendRequest)
                .Reference(fr => fr.Requester)
                .LoadAsync();
            await _dbContext.Entry(friendRequest)
                .Reference(fr => fr.Addressee)
                .LoadAsync();

            var response = new FriendRequestDto
            {
                Id = friendRequest.Id,
                RequesterId = friendRequest.RequesterId,
                AddresseeId = friendRequest.AddresseeId,
                Status = (int)friendRequest.Status,
                CreatedAt = friendRequest.CreatedAt,
                UpdatedAt = friendRequest.UpdatedAt,
                Requester = new UserDto
                {
                    Id = friendRequest.Requester.Id,
                    Email = friendRequest.Requester.Email,
                    Name = friendRequest.Requester.Name,
                    Surname = friendRequest.Requester.Surname,
                    Username = friendRequest.Requester.Username,
                    PhoneNumber = friendRequest.Requester.PhoneNumber,
                    AvatarImageUrl = friendRequest.Requester.AvatarImageUrl,
                    Role = friendRequest.Requester.Role
                },
                Addressee = new UserDto
                {
                    Id = friendRequest.Addressee.Id,
                    Email = friendRequest.Addressee.Email,
                    Name = friendRequest.Addressee.Name,
                    Surname = friendRequest.Addressee.Surname,
                    Username = friendRequest.Addressee.Username,
                    PhoneNumber = friendRequest.Addressee.PhoneNumber,
                    AvatarImageUrl = friendRequest.Addressee.AvatarImageUrl,
                    Role = friendRequest.Addressee.Role
                }
            };

            _dbContext.FriendRequests.Remove(friendRequest);
            await _dbContext.SaveChangesAsync();

            // Notify the addressee about the cancelled friend request
            await _hubContext.Clients.Group(addresseeId.ToString())
                .SendAsync("FriendRequestCancelled", response);

            return NoContent();
        }

        /// <summary>
        /// Get all friends of the current user
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetFriends()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var friends = await _dbContext.FriendRequests
                .Where(fr => fr.Status == FriendRequestStatus.Accepted &&
                    (fr.RequesterId == userId || fr.AddresseeId == userId))
                .Include(fr => fr.Requester)
                .Include(fr => fr.Addressee)
                .Select(fr => new FriendDto
                {
                    UserId = fr.RequesterId == userId ? fr.AddresseeId : fr.RequesterId,
                    User = fr.RequesterId == userId
                        ? new UserDto
                        {
                            Id = fr.Addressee.Id,
                            Email = fr.Addressee.Email,
                            Name = fr.Addressee.Name,
                            Surname = fr.Addressee.Surname,
                            Username = fr.Addressee.Username,
                            PhoneNumber = fr.Addressee.PhoneNumber,
                            AvatarImageUrl = fr.Addressee.AvatarImageUrl,
                            Role = fr.Addressee.Role
                        }
                        : new UserDto
                        {
                            Id = fr.Requester.Id,
                            Email = fr.Requester.Email,
                            Name = fr.Requester.Name,
                            Surname = fr.Requester.Surname,
                            Username = fr.Requester.Username,
                            PhoneNumber = fr.Requester.PhoneNumber,
                            AvatarImageUrl = fr.Requester.AvatarImageUrl,
                            Role = fr.Requester.Role
                        },
                    FriendsSince = fr.UpdatedAt ?? fr.CreatedAt
                })
                .OrderByDescending(f => f.FriendsSince)
                .ToListAsync();

            return Ok(friends);
        }

        /// <summary>
        /// Get pending friend requests (sent and received)
        /// </summary>
        [HttpGet("requests/pending")]
        public async Task<IActionResult> GetPendingFriendRequests()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            var pendingRequests = await _dbContext.FriendRequests
                .Where(fr => fr.Status == FriendRequestStatus.Pending &&
                    (fr.RequesterId == userId || fr.AddresseeId == userId))
                .Include(fr => fr.Requester)
                .Include(fr => fr.Addressee)
                .OrderByDescending(fr => fr.CreatedAt)
                .Select(fr => new FriendRequestDto
                {
                    Id = fr.Id,
                    RequesterId = fr.RequesterId,
                    AddresseeId = fr.AddresseeId,
                    Status = (int)fr.Status,
                    CreatedAt = fr.CreatedAt,
                    UpdatedAt = fr.UpdatedAt,
                    Requester = new UserDto
                    {
                        Id = fr.Requester.Id,
                        Email = fr.Requester.Email,
                        Name = fr.Requester.Name,
                        Surname = fr.Requester.Surname,
                        Username = fr.Requester.Username,
                        PhoneNumber = fr.Requester.PhoneNumber,
                        AvatarImageUrl = fr.Requester.AvatarImageUrl,
                        Role = fr.Requester.Role
                    },
                    Addressee = new UserDto
                    {
                        Id = fr.Addressee.Id,
                        Email = fr.Addressee.Email,
                        Name = fr.Addressee.Name,
                        Surname = fr.Addressee.Surname,
                        Username = fr.Addressee.Username,
                        PhoneNumber = fr.Addressee.PhoneNumber,
                        AvatarImageUrl = fr.Addressee.AvatarImageUrl,
                        Role = fr.Addressee.Role
                    }
                })
                .ToListAsync();

            return Ok(pendingRequests);
        }

        /// <summary>
        /// Remove a friend (delete the friendship)
        /// </summary>
        [HttpDelete("{friendId}")]
        public async Task<IActionResult> RemoveFriend(Guid friendId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            // Find the accepted friend request
            var friendRequest = await _dbContext.FriendRequests
                .FirstOrDefaultAsync(fr =>
                    fr.Status == FriendRequestStatus.Accepted &&
                    ((fr.RequesterId == userId && fr.AddresseeId == friendId) ||
                     (fr.RequesterId == friendId && fr.AddresseeId == userId)));

            if (friendRequest == null)
            {
                return NotFound(new { message = "Friendship not found." });
            }

            var otherUserId = friendRequest.RequesterId == userId ? friendRequest.AddresseeId : friendRequest.RequesterId;

            _dbContext.FriendRequests.Remove(friendRequest);
            await _dbContext.SaveChangesAsync();

            // Notify the other user about the removed friendship
            await _hubContext.Clients.Group(otherUserId.ToString())
                .SendAsync("FriendRemoved", friendId);

            return NoContent();
        }
    }
}

