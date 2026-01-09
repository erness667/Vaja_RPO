using System.Security.Claims;
using Backend.DTOs.Dealership;
using Backend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperCarsApi.Models;
using System.IO;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/dealerships")]
    public class DealershipController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly Services.GeocodingService _geocodingService;

        public DealershipController(ApplicationDbContext dbContext, Services.GeocodingService geocodingService)
        {
            _dbContext = dbContext;
            _geocodingService = geocodingService;
        }

        /// <summary>
        /// Create a new car dealership (requires authentication)
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateDealership([FromBody] CreateDealershipRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                // Check if user already has a dealership
                var existingDealership = await _dbContext.CarDealerships
                    .FirstOrDefaultAsync(d => d.OwnerId == userId);

                if (existingDealership != null)
                {
                    return BadRequest(new { message = "You already have a dealership." });
                }

                // Geocode address if coordinates not provided
                double? latitude = request.Latitude;
                double? longitude = request.Longitude;
                
                if (!latitude.HasValue || !longitude.HasValue)
                {
                    var (geocodedLat, geocodedLon) = await _geocodingService.GeocodeAddressAsync(request.Address, request.City);
                    latitude = geocodedLat;
                    longitude = geocodedLon;
                }

                // Create the dealership
                var dealership = new CarDealership
                {
                    OwnerId = userId,
                    Name = request.Name,
                    Description = request.Description,
                    Address = request.Address,
                    City = request.City,
                    PhoneNumber = request.PhoneNumber,
                    Email = request.Email,
                    Website = request.Website,
                    TaxNumber = request.TaxNumber,
                    Latitude = latitude,
                    Longitude = longitude,
                    Status = DealershipStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _dbContext.CarDealerships.Add(dealership);
                await _dbContext.SaveChangesAsync();

                // Load owner for DTO
                await _dbContext.Entry(dealership)
                    .Reference(d => d.Owner)
                    .LoadAsync();

                var dealershipDto = MapToDto(dealership);

                return CreatedAtAction(nameof(GetDealership), new { id = dealership.Id }, dealershipDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create dealership", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all dealerships (with optional filtering)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetDealerships(
            [FromQuery] string? status = null,
            [FromQuery] Guid? ownerId = null)
        {
            try
            {
                var query = _dbContext.CarDealerships
                    .Include(d => d.Owner)
                    .AsQueryable();

                // Filter by status
                if (!string.IsNullOrEmpty(status) && Enum.TryParse<DealershipStatus>(status, true, out var statusEnum))
                {
                    query = query.Where(d => d.Status == statusEnum);
                }

                // Filter by owner
                if (ownerId.HasValue)
                {
                    query = query.Where(d => d.OwnerId == ownerId.Value);
                }

                var dealerships = await query
                    .OrderByDescending(d => d.CreatedAt)
                    .ToListAsync();

                var dealershipDtos = dealerships.Select(d => MapToDto(d)).ToList();

                return Ok(dealershipDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch dealerships", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a dealership by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDealership(int id)
        {
            try
            {
                var dealership = await _dbContext.CarDealerships
                    .Include(d => d.Owner)
                    .Include(d => d.ReviewedByAdmin)
                    .Include(d => d.Workers)
                        .ThenInclude(w => w.User)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (dealership == null)
                {
                    return NotFound(new { message = "Dealership not found." });
                }

                var dealershipDto = MapToDto(dealership);

                return Ok(dealershipDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch dealership", error = ex.Message });
            }
        }

        /// <summary>
        /// Get dealerships pending approval (admin only)
        /// </summary>
        [HttpGet("pending")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetPendingDealerships()
        {
            try
            {
                var dealerships = await _dbContext.CarDealerships
                    .Include(d => d.Owner)
                    .Where(d => d.Status == DealershipStatus.Pending)
                    .OrderBy(d => d.CreatedAt)
                    .ToListAsync();

                var dealershipDtos = dealerships.Select(d => MapToDto(d)).ToList();

                return Ok(dealershipDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch pending dealerships", error = ex.Message });
            }
        }

        /// <summary>
        /// Approve or decline a dealership (admin only)
        /// </summary>
        [HttpPost("{id}/approve")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ApproveDealership(int id, [FromBody] ApproveDealershipRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (adminIdClaim == null || !Guid.TryParse(adminIdClaim.Value, out var adminId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                var dealership = await _dbContext.CarDealerships
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (dealership == null)
                {
                    return NotFound(new { message = "Dealership not found." });
                }

                if (dealership.Status != DealershipStatus.Pending)
                {
                    return BadRequest(new { message = "Dealership is not pending approval." });
                }

                dealership.Status = request.Approve ? DealershipStatus.Approved : DealershipStatus.Declined;
                dealership.ReviewedByAdminId = adminId;
                dealership.AdminNotes = request.Notes;
                dealership.ReviewedAt = DateTime.UtcNow;
                dealership.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                // Reload with related data
                await _dbContext.Entry(dealership)
                    .Reference(d => d.Owner)
                    .LoadAsync();
                await _dbContext.Entry(dealership)
                    .Reference(d => d.ReviewedByAdmin)
                    .LoadAsync();

                var dealershipDto = MapToDto(dealership);

                return Ok(dealershipDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to approve/decline dealership", error = ex.Message });
            }
        }

        /// <summary>
        /// Update a dealership (owner or admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateDealership(int id, [FromBody] UpdateDealershipRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                var dealership = await _dbContext.CarDealerships
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (dealership == null)
                {
                    return NotFound(new { message = "Dealership not found." });
                }

                // Only owner or dealership admin can update
                if (!await IsDealershipOwnerOrAdmin(userId, id))
                {
                    return Forbid();
                }

                // Only approved dealerships can be updated (unless system admin)
                if (dealership.Status != DealershipStatus.Approved && !AuthorizationHelper.IsAdmin(User))
                {
                    return BadRequest(new { message = "Only approved dealerships can be updated." });
                }

                // Track if address changed for geocoding
                bool addressChanged = (!string.IsNullOrEmpty(request.Address) && request.Address != dealership.Address) ||
                                     (!string.IsNullOrEmpty(request.City) && request.City != dealership.City);

                // Update fields if provided
                if (!string.IsNullOrEmpty(request.Name))
                    dealership.Name = request.Name;
                if (request.Description != null)
                    dealership.Description = request.Description;
                if (!string.IsNullOrEmpty(request.Address))
                    dealership.Address = request.Address;
                if (!string.IsNullOrEmpty(request.City))
                    dealership.City = request.City;
                if (!string.IsNullOrEmpty(request.PhoneNumber))
                    dealership.PhoneNumber = request.PhoneNumber;
                if (request.Email != null)
                    dealership.Email = request.Email;
                if (request.Website != null)
                    dealership.Website = request.Website;
                if (request.TaxNumber != null)
                    dealership.TaxNumber = request.TaxNumber;

                // Handle coordinates: use provided ones, or geocode if address changed and no coordinates provided
                if (request.Latitude.HasValue && request.Longitude.HasValue)
                {
                    dealership.Latitude = request.Latitude;
                    dealership.Longitude = request.Longitude;
                }
                else if (addressChanged && (!request.Latitude.HasValue || !request.Longitude.HasValue))
                {
                    // Geocode the new address
                    var (geocodedLat, geocodedLon) = await _geocodingService.GeocodeAddressAsync(dealership.Address, dealership.City);
                    dealership.Latitude = geocodedLat;
                    dealership.Longitude = geocodedLon;
                }

                dealership.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                // Reload with related data
                await _dbContext.Entry(dealership)
                    .Reference(d => d.Owner)
                    .LoadAsync();

                var dealershipDto = MapToDto(dealership);

                return Ok(dealershipDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update dealership", error = ex.Message });
            }
        }

        /// <summary>
        /// Invite a user to join the dealership as a worker (owner or dealership admin only)
        /// </summary>
        [HttpPost("{id}/workers/invite")]
        [Authorize]
        public async Task<IActionResult> InviteWorker(int id, [FromBody] InviteWorkerRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                var dealership = await _dbContext.CarDealerships
                    .Include(d => d.Workers)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (dealership == null)
                {
                    return NotFound(new { message = "Dealership not found." });
                }

                // Check if dealership is approved
                if (dealership.Status != DealershipStatus.Approved)
                {
                    return BadRequest(new { message = "Only approved dealerships can invite workers." });
                }

                // Check if user has permission (owner or dealership admin)
                if (!await IsDealershipOwnerOrAdmin(userId, id))
                {
                    return Forbid();
                }

                // Check if user to invite exists
                var userToInvite = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == request.UserId);

                if (userToInvite == null)
                {
                    return NotFound(new { message = "User to invite not found." });
                }

                // Cannot invite yourself
                if (request.UserId == userId)
                {
                    return BadRequest(new { message = "You cannot invite yourself." });
                }

                // Cannot invite the owner
                if (request.UserId == dealership.OwnerId)
                {
                    return BadRequest(new { message = "The owner is already part of the dealership." });
                }

                // Check if user is already a worker
                var existingWorker = dealership.Workers
                    .FirstOrDefault(w => w.UserId == request.UserId);

                if (existingWorker != null)
                {
                    return BadRequest(new { message = "User is already a worker in this dealership." });
                }

                // Parse role
                if (!Enum.TryParse<DealershipWorkerRole>(request.Role, true, out var workerRole))
                {
                    return BadRequest(new { message = "Invalid role. Must be 'Worker' or 'Admin'." });
                }

                // Create worker invitation
                var worker = new DealershipWorker
                {
                    DealershipId = id,
                    UserId = request.UserId,
                    Role = workerRole,
                    Status = DealershipWorkerStatus.Pending,
                    InvitedByUserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _dbContext.DealershipWorkers.Add(worker);
                await _dbContext.SaveChangesAsync();

                // Load related data
                await _dbContext.Entry(worker)
                    .Reference(w => w.User)
                    .LoadAsync();
                await _dbContext.Entry(worker)
                    .Reference(w => w.Dealership)
                    .LoadAsync();
                await _dbContext.Entry(worker)
                    .Reference(w => w.InvitedByUser)
                    .LoadAsync();

                var workerDto = MapWorkerToDto(worker);

                return CreatedAtAction(nameof(GetWorker), new { workerId = worker.Id }, workerDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to invite worker", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all workers for a dealership
        /// </summary>
        [HttpGet("{id}/workers")]
        public async Task<IActionResult> GetWorkers(int id)
        {
            try
            {
                var dealership = await _dbContext.CarDealerships
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (dealership == null)
                {
                    return NotFound(new { message = "Dealership not found." });
                }

                var workers = await _dbContext.DealershipWorkers
                    .Include(w => w.User)
                    .Include(w => w.Dealership)
                    .Include(w => w.InvitedByUser)
                    .Where(w => w.DealershipId == id)
                    .OrderByDescending(w => w.CreatedAt)
                    .ToListAsync();

                var workerDtos = workers.Select(w => MapWorkerToDto(w)).ToList();

                return Ok(workerDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch workers", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific worker by ID
        /// </summary>
        [HttpGet("workers/{workerId}")]
        public async Task<IActionResult> GetWorker(int workerId)
        {
            try
            {
                var worker = await _dbContext.DealershipWorkers
                    .Include(w => w.User)
                    .Include(w => w.Dealership)
                    .Include(w => w.InvitedByUser)
                    .FirstOrDefaultAsync(w => w.Id == workerId);

                if (worker == null)
                {
                    return NotFound(new { message = "Worker not found." });
                }

                var workerDto = MapWorkerToDto(worker);

                return Ok(workerDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch worker", error = ex.Message });
            }
        }

        /// <summary>
        /// Accept or decline a worker invitation
        /// </summary>
        [HttpPost("workers/{workerId}/respond")]
        [Authorize]
        public async Task<IActionResult> RespondToInvitation(int workerId, [FromBody] bool accept)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                var worker = await _dbContext.DealershipWorkers
                    .Include(w => w.Dealership)
                    .FirstOrDefaultAsync(w => w.Id == workerId);

                if (worker == null)
                {
                    return NotFound(new { message = "Worker invitation not found." });
                }

                // Only the invited user can respond
                if (worker.UserId != userId)
                {
                    return Forbid();
                }

                if (worker.Status != DealershipWorkerStatus.Pending)
                {
                    return BadRequest(new { message = "Invitation has already been responded to." });
                }

                worker.Status = accept ? DealershipWorkerStatus.Active : DealershipWorkerStatus.Declined;
                if (accept)
                {
                    worker.AcceptedAt = DateTime.UtcNow;
                }
                worker.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                // Reload with related data
                await _dbContext.Entry(worker)
                    .Reference(w => w.User)
                    .LoadAsync();
                await _dbContext.Entry(worker)
                    .Reference(w => w.Dealership)
                    .LoadAsync();
                await _dbContext.Entry(worker)
                    .Reference(w => w.InvitedByUser)
                    .LoadAsync();

                var workerDto = MapWorkerToDto(worker);

                return Ok(workerDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to respond to invitation", error = ex.Message });
            }
        }

        /// <summary>
        /// Get pending invitations for the current user
        /// </summary>
        [HttpGet("workers/invitations/pending")]
        [Authorize]
        public async Task<IActionResult> GetPendingInvitations()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                var invitations = await _dbContext.DealershipWorkers
                    .Include(w => w.User)
                    .Include(w => w.Dealership)
                    .Include(w => w.InvitedByUser)
                    .Where(w => w.UserId == userId && w.Status == DealershipWorkerStatus.Pending)
                    .OrderByDescending(w => w.CreatedAt)
                    .ToListAsync();

                var workerDtos = invitations.Select(w => MapWorkerToDto(w)).ToList();

                return Ok(workerDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch pending invitations", error = ex.Message });
            }
        }

        /// <summary>
        /// Get dealerships where the current user is an active worker
        /// </summary>
        [HttpGet("my/worker")]
        [Authorize]
        public async Task<IActionResult> GetMyWorkerDealerships()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                // Get dealerships where user is an active worker (any worker can post cars, admins can edit them)
                // Return all active worker dealerships, backend will validate approval on post
                var workerDealerships = await _dbContext.DealershipWorkers
                    .Include(w => w.Dealership)
                        .ThenInclude(d => d.Owner)
                    .Where(w => w.UserId == userId 
                        && w.Status == DealershipWorkerStatus.Active)
                    .Select(w => w.Dealership)
                    .Distinct()
                    .OrderByDescending(d => d.CreatedAt)
                    .ToListAsync();

                var dealershipDtos = workerDealerships.Select(d => MapToDto(d)).ToList();

                return Ok(dealershipDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch worker dealerships", error = ex.Message });
            }
        }

        /// <summary>
        /// Update a worker's role (owner or dealership admin only)
        /// </summary>
        [HttpPut("workers/{workerId}/role")]
        [Authorize]
        public async Task<IActionResult> UpdateWorkerRole(int workerId, [FromBody] UpdateWorkerRoleRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                var worker = await _dbContext.DealershipWorkers
                    .Include(w => w.Dealership)
                    .FirstOrDefaultAsync(w => w.Id == workerId);

                if (worker == null)
                {
                    return NotFound(new { message = "Worker not found." });
                }

                // Check if user has permission (owner or dealership admin)
                if (!await IsDealershipOwnerOrAdmin(userId, worker.DealershipId))
                {
                    return Forbid();
                }

                // Parse role
                if (!Enum.TryParse<DealershipWorkerRole>(request.Role, true, out var workerRole))
                {
                    return BadRequest(new { message = "Invalid role. Must be 'Worker' or 'Admin'." });
                }

                worker.Role = workerRole;
                worker.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                // Reload with related data
                await _dbContext.Entry(worker)
                    .Reference(w => w.User)
                    .LoadAsync();
                await _dbContext.Entry(worker)
                    .Reference(w => w.Dealership)
                    .LoadAsync();
                await _dbContext.Entry(worker)
                    .Reference(w => w.InvitedByUser)
                    .LoadAsync();

                var workerDto = MapWorkerToDto(worker);

                return Ok(workerDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update worker role", error = ex.Message });
            }
        }

        /// <summary>
        /// Remove a worker from the dealership (owner, dealership admin, or the worker themselves)
        /// </summary>
        [HttpDelete("workers/{workerId}")]
        [Authorize]
        public async Task<IActionResult> RemoveWorker(int workerId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                var worker = await _dbContext.DealershipWorkers
                    .Include(w => w.Dealership)
                    .FirstOrDefaultAsync(w => w.Id == workerId);

                if (worker == null)
                {
                    return NotFound(new { message = "Worker not found." });
                }

                // Check if user has permission (owner, dealership admin, or the worker themselves)
                bool isOwnerOrAdmin = await IsDealershipOwnerOrAdmin(userId, worker.DealershipId);
                bool isSelf = worker.UserId == userId;

                if (!isOwnerOrAdmin && !isSelf)
                {
                    return Forbid();
                }

                _dbContext.DealershipWorkers.Remove(worker);
                await _dbContext.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to remove worker", error = ex.Message });
            }
        }

        /// <summary>
        /// Transfer ownership of a dealership to another user (current owner only)
        /// </summary>
        [HttpPost("{id}/transfer-ownership")]
        [Authorize]
        public async Task<IActionResult> TransferOwnership(int id, [FromBody] TransferOwnershipRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                var dealership = await _dbContext.CarDealerships
                    .Include(d => d.Workers)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (dealership == null)
                {
                    return NotFound(new { message = "Dealership not found." });
                }

                // Only the current owner can transfer ownership
                if (dealership.OwnerId != userId)
                {
                    return Forbid();
                }

                // Cannot transfer to yourself
                if (request.NewOwnerId == userId)
                {
                    return BadRequest(new { message = "Cannot transfer ownership to yourself." });
                }

                // Check if new owner exists
                var newOwner = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.Id == request.NewOwnerId);

                if (newOwner == null)
                {
                    return NotFound(new { message = "New owner not found." });
                }

                // Check if new owner is already a worker (they should be an active worker)
                var newOwnerWorker = dealership.Workers
                    .FirstOrDefault(w => w.UserId == request.NewOwnerId && w.Status == DealershipWorkerStatus.Active);

                if (newOwnerWorker == null)
                {
                    return BadRequest(new { message = "New owner must be an active worker in the dealership." });
                }

                // Transfer ownership
                var oldOwnerId = dealership.OwnerId;
                dealership.OwnerId = request.NewOwnerId;
                dealership.UpdatedAt = DateTime.UtcNow;

                // Remove the new owner from workers list (since they're now the owner)
                if (newOwnerWorker != null)
                {
                    _dbContext.DealershipWorkers.Remove(newOwnerWorker);
                }

                // Add the old owner as a worker so they remain in the dealership
                var oldOwnerWorker = await _dbContext.DealershipWorkers
                    .FirstOrDefaultAsync(w => w.DealershipId == id && w.UserId == oldOwnerId);

                if (oldOwnerWorker == null)
                {
                    // Old owner is not already a worker, add them
                    var newWorker = new DealershipWorker
                    {
                        DealershipId = id,
                        UserId = oldOwnerId,
                        Role = DealershipWorkerRole.Worker,
                        Status = DealershipWorkerStatus.Active,
                        InvitedByUserId = request.NewOwnerId, // The new owner is effectively "inviting" the old owner
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        AcceptedAt = DateTime.UtcNow, // Auto-accepted since they were the owner
                    };
                    _dbContext.DealershipWorkers.Add(newWorker);
                }
                else if (oldOwnerWorker.Status != DealershipWorkerStatus.Active)
                {
                    // Old owner was a worker but not active, reactivate them
                    oldOwnerWorker.Status = DealershipWorkerStatus.Active;
                    oldOwnerWorker.UpdatedAt = DateTime.UtcNow;
                    if (oldOwnerWorker.AcceptedAt == null)
                    {
                        oldOwnerWorker.AcceptedAt = DateTime.UtcNow;
                    }
                }

                await _dbContext.SaveChangesAsync();

                // Reload with related data
                await _dbContext.Entry(dealership)
                    .Reference(d => d.Owner)
                    .LoadAsync();

                var dealershipDto = MapToDto(dealership);

                return Ok(dealershipDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to transfer ownership", error = ex.Message });
            }
        }

        /// <summary>
        /// Deactivate or reactivate a worker (owner or dealership admin only)
        /// </summary>
        [HttpPut("workers/{workerId}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateWorkerStatus(int workerId, [FromBody] bool activate)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                var worker = await _dbContext.DealershipWorkers
                    .Include(w => w.Dealership)
                    .FirstOrDefaultAsync(w => w.Id == workerId);

                if (worker == null)
                {
                    return NotFound(new { message = "Worker not found." });
                }

                // Check if user has permission (owner or dealership admin)
                if (!await IsDealershipOwnerOrAdmin(userId, worker.DealershipId))
                {
                    return Forbid();
                }

                // Can only activate/deactivate active workers
                if (worker.Status != DealershipWorkerStatus.Active && worker.Status != DealershipWorkerStatus.Inactive)
                {
                    return BadRequest(new { message = "Can only activate/deactivate active or inactive workers." });
                }

                worker.Status = activate ? DealershipWorkerStatus.Active : DealershipWorkerStatus.Inactive;
                worker.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                // Reload with related data
                await _dbContext.Entry(worker)
                    .Reference(w => w.User)
                    .LoadAsync();
                await _dbContext.Entry(worker)
                    .Reference(w => w.Dealership)
                    .LoadAsync();
                await _dbContext.Entry(worker)
                    .Reference(w => w.InvitedByUser)
                    .LoadAsync();

                var workerDto = MapWorkerToDto(worker);

                return Ok(workerDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update worker status", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete a dealership (owner only, and only if no active workers)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteDealership(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user token." });
                }

                var dealership = await _dbContext.CarDealerships
                    .Include(d => d.Workers)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (dealership == null)
                {
                    return NotFound(new { message = "Dealership not found." });
                }

                // Only owner can delete
                if (dealership.OwnerId != userId)
                {
                    return Forbid();
                }

                // Check if there are any active workers (excluding owner)
                var hasActiveWorkers = await _dbContext.DealershipWorkers
                    .AnyAsync(w => w.DealershipId == id && w.Status == DealershipWorkerStatus.Active);

                if (hasActiveWorkers)
                {
                    return BadRequest(new { message = "Cannot delete dealership with active workers. Please remove all workers first." });
                }

                // Get all cars associated with this dealership
                var dealershipCars = await _dbContext.Cars
                    .Include(c => c.Images)
                    .Where(c => c.DealershipId == id)
                    .ToListAsync();

                // Delete all car images from filesystem and then delete cars
                foreach (var car in dealershipCars)
                {
                    foreach (var image in car.Images)
                    {
                        try
                        {
                            if (!string.IsNullOrEmpty(image.Url) && image.Url.StartsWith("http"))
                            {
                                var uri = new Uri(image.Url);
                                var fileName = Path.GetFileName(uri.LocalPath);
                                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "cars", fileName);
                                
                                if (System.IO.File.Exists(filePath))
                                {
                                    System.IO.File.Delete(filePath);
                                }
                            }
                        }
                        catch
                        {
                            // Continue even if file deletion fails
                        }
                    }
                }

                // Delete all cars associated with the dealership
                _dbContext.Cars.RemoveRange(dealershipCars);

                // Delete all workers (cascade should handle this, but being explicit)
                var allWorkers = await _dbContext.DealershipWorkers
                    .Where(w => w.DealershipId == id)
                    .ToListAsync();
                _dbContext.DealershipWorkers.RemoveRange(allWorkers);

                // Delete the dealership
                _dbContext.CarDealerships.Remove(dealership);
                await _dbContext.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete dealership", error = ex.Message });
            }
        }

        // Helper methods

        private async Task<bool> IsDealershipOwnerOrAdmin(Guid userId, int dealershipId)
        {
            // Check if user is system admin
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null && user.Role == Role.Admin)
            {
                return true;
            }

            // Check if user is dealership owner
            var dealership = await _dbContext.CarDealerships
                .FirstOrDefaultAsync(d => d.Id == dealershipId && d.OwnerId == userId);

            if (dealership != null)
            {
                return true;
            }

            // Check if user is dealership admin
            var worker = await _dbContext.DealershipWorkers
                .FirstOrDefaultAsync(w => w.DealershipId == dealershipId 
                    && w.UserId == userId 
                    && w.Role == DealershipWorkerRole.Admin 
                    && w.Status == DealershipWorkerStatus.Active);

            return worker != null;
        }

        private DealershipDto MapToDto(CarDealership dealership)
        {
            return new DealershipDto
            {
                Id = dealership.Id,
                OwnerId = dealership.OwnerId,
                OwnerName = dealership.Owner?.Name ?? string.Empty,
                OwnerSurname = dealership.Owner?.Surname ?? string.Empty,
                Name = dealership.Name,
                Description = dealership.Description,
                Address = dealership.Address,
                City = dealership.City,
                Latitude = dealership.Latitude,
                Longitude = dealership.Longitude,
                PhoneNumber = dealership.PhoneNumber,
                Email = dealership.Email,
                Website = dealership.Website,
                TaxNumber = dealership.TaxNumber,
                Status = dealership.Status.ToString(),
                ReviewedByAdminId = dealership.ReviewedByAdminId,
                ReviewedByAdminName = dealership.ReviewedByAdmin != null 
                    ? $"{dealership.ReviewedByAdmin.Name} {dealership.ReviewedByAdmin.Surname}" 
                    : null,
                AdminNotes = dealership.AdminNotes,
                CreatedAt = dealership.CreatedAt,
                ReviewedAt = dealership.ReviewedAt,
                UpdatedAt = dealership.UpdatedAt,
                WorkerCount = dealership.Workers?.Count(w => w.Status == DealershipWorkerStatus.Active) ?? 0
            };
        }

        private DealershipWorkerDto MapWorkerToDto(DealershipWorker worker)
        {
            return new DealershipWorkerDto
            {
                Id = worker.Id,
                DealershipId = worker.DealershipId,
                DealershipName = worker.Dealership?.Name ?? string.Empty,
                UserId = worker.UserId,
                UserName = worker.User?.Name ?? string.Empty,
                UserSurname = worker.User?.Surname ?? string.Empty,
                UserEmail = worker.User?.Email ?? string.Empty,
                UserAvatarImageUrl = worker.User?.AvatarImageUrl,
                Role = worker.Role.ToString(),
                Status = worker.Status.ToString(),
                InvitedByUserId = worker.InvitedByUserId,
                InvitedByName = worker.InvitedByUser != null 
                    ? $"{worker.InvitedByUser.Name} {worker.InvitedByUser.Surname}" 
                    : string.Empty,
                CreatedAt = worker.CreatedAt,
                AcceptedAt = worker.AcceptedAt,
                UpdatedAt = worker.UpdatedAt
            };
        }
    }
}

