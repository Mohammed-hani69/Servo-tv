
import { User, UserRole } from '../types';
import { MOCK_USER, MOCK_ADMIN_USER } from '../constants';
import { API_BASE_URL, USE_MOCK_DATA } from './config';

const DEVICE_ID_KEY = 'tv_app_device_id';
const TOKEN_KEY = 'tv_app_token';

export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'dev-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

interface LoginResponse {
  user?: User;
  requiresVerification?: boolean;
  token?: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const currentDeviceId = getDeviceId();

  // --- MOCK MODE ---
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Admin Mock Login
    if (email === 'admin@servo.tv' && password === 'admin') {
         const adminUser = { ...MOCK_ADMIN_USER, deviceId: currentDeviceId };
         localStorage.setItem(TOKEN_KEY, 'mock-admin-token');
         localStorage.setItem('tv_user', JSON.stringify(adminUser));
         return { user: adminUser };
    }

    // Reseller/User Mock Login
    if (email === 'demo@tvapp.com' && password === 'password') {
       // Simulate device check logic in mock mode
       const isDeviceRecognized = true; // Set to false to test OTP flow in Mock mode
       
       if (!isDeviceRecognized) {
         return { requiresVerification: true };
       }

       const mockUser = { ...MOCK_USER, deviceId: currentDeviceId };
       localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
       localStorage.setItem('tv_user', JSON.stringify(mockUser));
       return { user: mockUser };
    }
    throw new Error('Invalid credentials');
  }

  // --- REAL BACKEND ---
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceId: currentDeviceId }),
    });

    const data = await res.json();

    if (res.status === 200 && data.requiresVerification) {
        return { requiresVerification: true };
    }

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem('tv_user', JSON.stringify(data.user));
    return { user: data.user, token: data.token };

  } catch (error: any) {
    throw new Error(error.message || 'Network error');
  }
};

export const verifyDeviceBinding = async (code: string): Promise<User> => {
  const email = 'demo@tvapp.com'; // In real app, pass this from state
  const deviceId = getDeviceId();

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (code === '123456') {
      const user = { ...MOCK_USER, deviceId };
      localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
      localStorage.setItem('tv_user', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid code');
  }

  // Real Backend
  const res = await fetch(`${API_BASE_URL}/auth/verify-device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, deviceId }),
  });
  
  const data = await res.json();
  if(!res.ok) throw new Error(data.error);

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem('tv_user', JSON.stringify(data.user));
  return data.user;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('tv_user');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

export const getCurrentUser = (): User | null => {
    const u = localStorage.getItem('tv_user');
    return u ? JSON.parse(u) : null;
};