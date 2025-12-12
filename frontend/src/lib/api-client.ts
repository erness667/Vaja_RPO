import { client } from '@/client/client.gen';
import { getAccessToken } from './utils/auth-storage';

// Configure the client with base URL from environment variable
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5121';

// Set the base URL for all API requests
client.setConfig({
  baseUrl: apiBaseUrl,
});

// Add interceptor to automatically add Authorization header to all requests
client.interceptors.request.use(async (request, options) => {
  const token = getAccessToken();
  if (token) {
    // Clone the request to modify headers (Request headers are read-only)
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Authorization', `Bearer ${token}`);
    
    // Create a new request with the updated headers
    return new Request(request, {
      headers: newHeaders,
    });
  }
  return request;
});

export { client };

