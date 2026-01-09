using System.Text.Json;
using Backend.Options;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
    public class GeocodingService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<GeocodingService> _logger;
        private readonly string _apiKey;

        public GeocodingService(HttpClient httpClient, ILogger<GeocodingService> logger, IOptions<GoogleMapsSettings> googleMapsSettings)
        {
            _httpClient = httpClient;
            _logger = logger;
            _apiKey = googleMapsSettings.Value.ApiKey;
        }

        /// <summary>
        /// Geocode an address using Google Maps Geocoding API
        /// Returns latitude and longitude if found
        /// </summary>
        public async Task<(double? Latitude, double? Longitude)> GeocodeAddressAsync(string address, string? city = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(_apiKey))
                {
                    _logger.LogWarning("Google Maps API key is not configured");
                    return (null, null);
                }

                var query = string.IsNullOrEmpty(city) 
                    ? address 
                    : $"{address}, {city}";
                
                var encodedQuery = Uri.EscapeDataString(query);
                var url = $"https://maps.googleapis.com/maps/api/geocode/json?address={encodedQuery}&key={_apiKey}";

                var response = await _httpClient.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Geocoding API returned status code: {StatusCode}", response.StatusCode);
                    return (null, null);
                }

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<JsonElement>(content);

                if (result.ValueKind != JsonValueKind.Object)
                {
                    _logger.LogWarning("Invalid response from geocoding API");
                    return (null, null);
                }

                // Check status
                if (result.TryGetProperty("status", out var statusElement))
                {
                    var status = statusElement.GetString();
                    if (status != "OK" && status != "ZERO_RESULTS")
                    {
                        _logger.LogWarning("Geocoding API returned status: {Status}", status);
                        return (null, null);
                    }
                }

                // Get results array
                if (!result.TryGetProperty("results", out var resultsElement) || 
                    resultsElement.ValueKind != JsonValueKind.Array ||
                    resultsElement.GetArrayLength() == 0)
                {
                    _logger.LogInformation("No geocoding results found for address: {Address}", query);
                    return (null, null);
                }

                var firstResult = resultsElement[0];
                
                // Get geometry -> location
                if (firstResult.TryGetProperty("geometry", out var geometry) &&
                    geometry.TryGetProperty("location", out var location))
                {
                    if (location.TryGetProperty("lat", out var latElement) &&
                        location.TryGetProperty("lng", out var lngElement))
                    {
                        if (latElement.ValueKind == JsonValueKind.Number &&
                            lngElement.ValueKind == JsonValueKind.Number)
                        {
                            var lat = latElement.GetDouble();
                            var lng = lngElement.GetDouble();
                            return (lat, lng);
                        }
                    }
                }

                return (null, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error geocoding address: {Address}", address);
                return (null, null);
            }
        }

        /// <summary>
        /// Reverse geocode coordinates to get address using Google Maps API
        /// </summary>
        public async Task<string?> ReverseGeocodeAsync(double latitude, double longitude)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(_apiKey))
                {
                    _logger.LogWarning("Google Maps API key is not configured");
                    return null;
                }

                var url = $"https://maps.googleapis.com/maps/api/geocode/json?latlng={latitude},{longitude}&key={_apiKey}";

                var response = await _httpClient.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                {
                    return null;
                }

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<JsonElement>(content);

                if (result.ValueKind != JsonValueKind.Object)
                {
                    return null;
                }

                // Check status
                if (result.TryGetProperty("status", out var statusElement))
                {
                    var status = statusElement.GetString();
                    if (status != "OK" && status != "ZERO_RESULTS")
                    {
                        _logger.LogWarning("Reverse geocoding API returned status: {Status}", status);
                        return null;
                    }
                }

                // Get results array
                if (!result.TryGetProperty("results", out var resultsElement) || 
                    resultsElement.ValueKind != JsonValueKind.Array ||
                    resultsElement.GetArrayLength() == 0)
                {
                    return null;
                }

                var firstResult = resultsElement[0];
                
                // Get formatted_address
                if (firstResult.TryGetProperty("formatted_address", out var formattedAddress))
                {
                    return formattedAddress.GetString();
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reverse geocoding coordinates: {Lat}, {Lon}", latitude, longitude);
                return null;
            }
        }

        /// <summary>
        /// Get place autocomplete suggestions using Google Places API
        /// </summary>
        public async Task<List<PlaceAutocompleteResult>> GetPlaceAutocompleteAsync(string input, string? city = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(_apiKey))
                {
                    _logger.LogWarning("Google Maps API key is not configured");
                    return new List<PlaceAutocompleteResult>();
                }

                var query = string.IsNullOrEmpty(city) 
                    ? input 
                    : $"{input}, {city}";
                
                var encodedQuery = Uri.EscapeDataString(query);
                var url = $"https://maps.googleapis.com/maps/api/place/autocomplete/json?input={encodedQuery}&key={_apiKey}&components=country:si"; // Restrict to Slovenia

                var response = await _httpClient.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Places Autocomplete API returned status code: {StatusCode}", response.StatusCode);
                    return new List<PlaceAutocompleteResult>();
                }

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<JsonElement>(content);

                if (result.ValueKind != JsonValueKind.Object)
                {
                    return new List<PlaceAutocompleteResult>();
                }

                // Check status
                if (result.TryGetProperty("status", out var statusElement))
                {
                    var status = statusElement.GetString();
                    if (status != "OK" && status != "ZERO_RESULTS")
                    {
                        _logger.LogWarning("Places Autocomplete API returned status: {Status}", status);
                        return new List<PlaceAutocompleteResult>();
                    }
                }

                var suggestions = new List<PlaceAutocompleteResult>();

                // Get predictions array
                if (result.TryGetProperty("predictions", out var predictionsElement) && 
                    predictionsElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var prediction in predictionsElement.EnumerateArray())
                    {
                        if (prediction.TryGetProperty("description", out var description) &&
                            prediction.TryGetProperty("place_id", out var placeId))
                        {
                            suggestions.Add(new PlaceAutocompleteResult
                            {
                                Description = description.GetString() ?? "",
                                PlaceId = placeId.GetString() ?? ""
                            });
                        }
                    }
                }

                return suggestions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting place autocomplete for input: {Input}", input);
                return new List<PlaceAutocompleteResult>();
            }
        }

        /// <summary>
        /// Get place details including coordinates from place_id
        /// </summary>
        public async Task<PlaceDetails?> GetPlaceDetailsAsync(string placeId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(_apiKey))
                {
                    _logger.LogWarning("Google Maps API key is not configured");
                    return null;
                }

                var url = $"https://maps.googleapis.com/maps/api/place/details/json?place_id={placeId}&fields=formatted_address,address_components,geometry&key={_apiKey}";

                var response = await _httpClient.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                {
                    return null;
                }

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<JsonElement>(content);

                if (result.ValueKind != JsonValueKind.Object)
                {
                    return null;
                }

                // Check status
                if (result.TryGetProperty("status", out var statusElement))
                {
                    var status = statusElement.GetString();
                    if (status != "OK")
                    {
                        _logger.LogWarning("Place Details API returned status: {Status}", status);
                        return null;
                    }
                }

                if (!result.TryGetProperty("result", out var resultElement))
                {
                    return null;
                }

                var placeDetails = new PlaceDetails();

                // Get formatted address
                if (resultElement.TryGetProperty("formatted_address", out var formattedAddress))
                {
                    placeDetails.FormattedAddress = formattedAddress.GetString() ?? "";
                }

                // Get geometry -> location
                if (resultElement.TryGetProperty("geometry", out var geometry) &&
                    geometry.TryGetProperty("location", out var location))
                {
                    if (location.TryGetProperty("lat", out var latElement) &&
                        location.TryGetProperty("lng", out var lngElement))
                    {
                        if (latElement.ValueKind == JsonValueKind.Number &&
                            lngElement.ValueKind == JsonValueKind.Number)
                        {
                            placeDetails.Latitude = latElement.GetDouble();
                            placeDetails.Longitude = lngElement.GetDouble();
                        }
                    }
                }

                // Parse address components
                if (resultElement.TryGetProperty("address_components", out var addressComponents) &&
                    addressComponents.ValueKind == JsonValueKind.Array)
                {
                    foreach (var component in addressComponents.EnumerateArray())
                    {
                        if (component.TryGetProperty("types", out var types) && types.ValueKind == JsonValueKind.Array)
                        {
                            var typesList = types.EnumerateArray().Select(t => t.GetString()).ToList();
                            
                            if (component.TryGetProperty("long_name", out var longName))
                            {
                                var name = longName.GetString() ?? "";
                                
                                if (typesList.Contains("street_number"))
                                {
                                    placeDetails.StreetNumber = name;
                                }
                                else if (typesList.Contains("route"))
                                {
                                    placeDetails.StreetName = name;
                                }
                                else if (typesList.Contains("locality") || typesList.Contains("postal_town"))
                                {
                                    placeDetails.City = name;
                                }
                                else if (typesList.Contains("postal_code"))
                                {
                                    placeDetails.PostalCode = name;
                                }
                            }
                        }
                    }
                }

                return placeDetails;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting place details for place_id: {PlaceId}", placeId);
                return null;
            }
        }
    }

    public class PlaceAutocompleteResult
    {
        public string Description { get; set; } = "";
        public string PlaceId { get; set; } = "";
    }

    public class PlaceDetails
    {
        public string FormattedAddress { get; set; } = "";
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? StreetNumber { get; set; }
        public string? StreetName { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
    }
}
