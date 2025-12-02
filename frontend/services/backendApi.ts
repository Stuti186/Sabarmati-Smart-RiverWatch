/**
 * Backend API Service
 * Handles all HTTP requests to the backend
 */

import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use your computer's local IP for physical device on same WiFi
const BASE_URL = 'http://10.201.229.243:3000/api/v1';
const TOKEN_KEY = '@smart_river_watch_token';

console.log('🌐 Backend API URL:', BASE_URL);

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - clear storage
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem('@smart_river_watch_auth');
    }
    return Promise.reject(error);
  }
);

// API Service class
class BackendApiService {
  // Auth methods
  async register(userData: {
    username: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  }

  async logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem('@smart_river_watch_auth');
  }

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  // Sensors
  async getSensors() {
    const response = await apiClient.get('/sensors');
    return response.data;
  }

  async getSensorById(id: string) {
    const response = await apiClient.get(`/sensors/${id}`);
    return response.data;
  }

  // Water Quality
  async getWaterQuality(params?: { sensorId?: string; startDate?: string; endDate?: string }) {
    const response = await apiClient.get('/water-quality', { params });
    return response.data;
  }

  // Unsafe Zones
  async getUnsafeZones() {
    const response = await apiClient.get('/unsafe-zones');
    return response.data;
  }

  // Waste Hotspots
  async getWasteHotspots() {
    const response = await apiClient.get('/waste-hotspots');
    return response.data;
  }

  // Reports
  async submitReport(data: any) {
    const response = await apiClient.post('/reports', data);
    return response.data;
  }

  async getMyReports() {
    const response = await apiClient.get('/reports/my-reports');
    return response.data;
  }

  // Alerts
  async getAlerts() {
    const response = await apiClient.get('/alerts');
    return response.data;
  }

  // Volunteer Events
  async getVolunteerEvents() {
    const response = await apiClient.get('/volunteers');
    return response.data;
  }

  // Rewards
  async getMyPoints() {
    const response = await apiClient.get('/rewards/points');
    return response.data;
  }
}

export const backendApi = new BackendApiService();
export default backendApi;
