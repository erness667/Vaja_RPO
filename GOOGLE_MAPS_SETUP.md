# Google Maps API Setup

This project uses Google Maps API for address autocomplete and map display. Follow these steps to configure it:

## 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (for map display)
   - **Places API** (for autocomplete)
   - **Geocoding API** (for address to coordinates conversion)
4. Go to "Credentials" and create an API key
5. (Recommended) Restrict the API key to:
   - HTTP referrers (for frontend): `http://localhost:3000/*`, `https://yourdomain.com/*`
   - IP addresses (for backend): Your server's IP address

## 2. Configure Backend

Add your Google Maps API key to `Backend/appsettings.json`:

```json
{
  "GoogleMaps": {
    "ApiKey": "YOUR_API_KEY_HERE"
  }
}
```

**Important**: For production, use environment variables or Azure Key Vault instead of hardcoding the key in `appsettings.json`.

## 3. Configure Frontend

Create or update `frontend/.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

The frontend will automatically use this environment variable to load the Google Maps JavaScript API.

## 4. API Usage

The backend provides the following endpoints:

- `GET /api/geocoding/autocomplete?input={query}&city={city}` - Get address suggestions
- `GET /api/geocoding/place-details?placeId={placeId}` - Get full address details including coordinates
- `GET /api/geocoding/geocode?address={address}&city={city}` - Geocode an address to coordinates
- `GET /api/geocoding/reverse?latitude={lat}&longitude={lng}` - Reverse geocode coordinates to address

## 5. Features

- **Address Autocomplete**: As you type in the address field, suggestions appear from Google Places API
- **Automatic Geocoding**: When you select an address, coordinates are automatically fetched
- **Interactive Map**: The map displays the selected location with a marker and info window
- **House Numbers**: Address suggestions include house numbers when available

## Troubleshooting

- **Map not loading**: Check that `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
- **Autocomplete not working**: Verify that Places API is enabled in Google Cloud Console
- **API errors**: Check API key restrictions and billing status in Google Cloud Console
