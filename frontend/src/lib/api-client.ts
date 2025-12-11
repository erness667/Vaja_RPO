import { client } from '@/client/client.gen';

// Configure the client with base URL from environment variable
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5121';

// Set the base URL for all API requests
client.setConfig({
  baseUrl: apiBaseUrl,
});

export { client };

