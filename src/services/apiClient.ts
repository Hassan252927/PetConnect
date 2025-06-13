import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Default API configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TIMEOUT = 15000; // 15 seconds

export interface ApiErrorResponse {
  message: string;
  errors?: { [key: string]: string[] };
  status?: number;
}

export class ApiError extends Error {
  public status: number;
  public errors?: { [key: string]: string[] };

  constructor(message: string, status: number = 500, errors?: { [key: string]: string[] }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor(config: AxiosRequestConfig = {}) {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...config,
    });

    // Add request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => this.handleApiError(error)
    );
  }

  // Set the auth token for future requests
  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  // Generic GET request
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  // Generic POST request
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // Generic PUT request
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  // Generic PATCH request
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Handle API errors
  private handleApiError(error: AxiosError<ApiErrorResponse>): Promise<never> {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { data, status } = error.response;
      const message = data?.message || 'An error occurred with the server';
      const errors = data?.errors;
      
      // Handle authentication errors
      if (status === 401) {
        // Clear the token if it's expired or invalid
        this.setAuthToken(null);
        
        // You might want to redirect to login page or dispatch a logout action
        // here depending on your application's needs
      }
      
      throw new ApiError(message, status, errors);
    } else if (error.request) {
      // The request was made but no response was received
      throw new ApiError('No response received from server. Please check your internet connection.', 0);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new ApiError(error.message || 'An error occurred while setting up the request', 0);
    }
  }
}

// Create and export a default instance
const apiClient = new ApiClient();

export default apiClient; 