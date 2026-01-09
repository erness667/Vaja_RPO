using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/geocoding")]
    public class GeocodingController : ControllerBase
    {
        private readonly GeocodingService _geocodingService;

        public GeocodingController(GeocodingService geocodingService)
        {
            _geocodingService = geocodingService;
        }

        /// <summary>
        /// Get place autocomplete suggestions
        /// </summary>
        [HttpGet("autocomplete")]
        public async Task<IActionResult> GetAutocomplete([FromQuery] string input, [FromQuery] string? city = null)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return BadRequest(new { message = "Input is required." });
            }

            var suggestions = await _geocodingService.GetPlaceAutocompleteAsync(input, city);

            return Ok(new
            {
                suggestions = suggestions.Select(s => new
                {
                    description = s.Description,
                    placeId = s.PlaceId
                }),
                success = true
            });
        }

        /// <summary>
        /// Get place details from place_id
        /// </summary>
        [HttpGet("place-details")]
        public async Task<IActionResult> GetPlaceDetails([FromQuery] string placeId)
        {
            if (string.IsNullOrWhiteSpace(placeId))
            {
                return BadRequest(new { message = "Place ID is required." });
            }

            var details = await _geocodingService.GetPlaceDetailsAsync(placeId);

            if (details == null)
            {
                return NotFound(new { message = "Place not found.", success = false });
            }

            return Ok(new
            {
                formattedAddress = details.FormattedAddress,
                latitude = details.Latitude,
                longitude = details.Longitude,
                streetNumber = details.StreetNumber,
                streetName = details.StreetName,
                city = details.City,
                postalCode = details.PostalCode,
                success = true
            });
        }

        /// <summary>
        /// Geocode an address to get latitude and longitude
        /// </summary>
        [HttpGet("geocode")]
        public async Task<IActionResult> GeocodeAddress([FromQuery] string address, [FromQuery] string? city = null)
        {
            if (string.IsNullOrWhiteSpace(address))
            {
                return BadRequest(new { message = "Address is required." });
            }

            var (latitude, longitude) = await _geocodingService.GeocodeAddressAsync(address, city);

            if (latitude.HasValue && longitude.HasValue)
            {
                return Ok(new
                {
                    latitude = latitude.Value,
                    longitude = longitude.Value,
                    success = true
                });
            }

            return NotFound(new { message = "Address not found.", success = false });
        }

        /// <summary>
        /// Reverse geocode coordinates to get address
        /// </summary>
        [HttpGet("reverse")]
        public async Task<IActionResult> ReverseGeocode([FromQuery] double latitude, [FromQuery] double longitude)
        {
            var address = await _geocodingService.ReverseGeocodeAsync(latitude, longitude);

            if (!string.IsNullOrEmpty(address))
            {
                return Ok(new
                {
                    address = address,
                    success = true
                });
            }

            return NotFound(new { message = "Address not found for coordinates.", success = false });
        }
    }
}
