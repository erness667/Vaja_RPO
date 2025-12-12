import { client } from '@/client/client.gen';
import { getAccessToken } from './utils/auth-storage';

// Configure the client with base URL from environment variable
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5121';

// Set the base URL for all API requests
client.setConfig({
  baseUrl: apiBaseUrl,
  // Configure auth to automatically send Bearer token
  auth: (auth) => {
    const token = getAccessToken();
    if (token && auth.scheme === 'bearer') {
      return token;
    }
    return undefined;
  },
});

export { client };

