using Backend.DTOs.CarApi;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/car-api")]
    public class CarApiController : ControllerBase
    {
        private readonly AutoDevApiService _autoDevApiService;

        public CarApiController(AutoDevApiService autoDevApiService)
        {
            _autoDevApiService = autoDevApiService;
        }

        /// <summary>
        /// Get all available car makes
        /// </summary>
        [HttpGet("makes")]
        public async Task<IActionResult> GetMakes()
        {
            try
            {
                var makes = await _autoDevApiService.GetMakesAsync();
                return Ok(makes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch makes", error = ex.Message });
            }
        }

        /// <summary>
        /// Search for makes by name
        /// </summary>
        [HttpGet("makes/search")]
        public async Task<IActionResult> SearchMakes([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(new { message = "Query parameter is required" });
            }

            try
            {
                var makes = await _autoDevApiService.SearchMakesAsync(query);
                return Ok(makes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to search makes", error = ex.Message });
            }
        }

        /// <summary>
        /// Get models for a specific make
        /// </summary>
        [HttpGet("makes/{makeId}/models")]
        public async Task<IActionResult> GetModels(string makeId)
        {
            if (string.IsNullOrWhiteSpace(makeId))
            {
                return BadRequest(new { message = "Make ID is required" });
            }

            try
            {
                var models = await _autoDevApiService.GetModelsAsync(makeId);
                return Ok(models);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch models", error = ex.Message });
            }
        }

    }
}

