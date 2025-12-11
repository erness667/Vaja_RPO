/**
 * Type definitions for authentication-related data structures
 */

export interface RegisterFormData {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

