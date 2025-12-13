
import { Channel, User, UserRole, ResellerStats, PaymentPlan } from './types';

// TV Remote Key Codes (Standardized)
export const KEY_CODES = {
  ENTER: 13,
  BACK: 8, // Often mapped to Backspace on browsers
  ESCAPE: 27,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
};

// Mock Data
export const MOCK_CHANNELS: Channel[] = [
  { id: '1', name: 'News 24/7', category: 'News', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', logo: 'https://picsum.photos/100/100?random=1' },
  { id: '2', name: 'Sports HD', category: 'Sports', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', logo: 'https://picsum.photos/100/100?random=2' },
  { id: '3', name: 'Movies Action', category: 'Movies', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', logo: 'https://picsum.photos/100/100?random=3' },
  { id: '4', name: 'Kids TV', category: 'Kids', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', logo: 'https://picsum.photos/100/100?random=4' },
  { id: '5', name: 'Documentary', category: 'Edu', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', logo: 'https://picsum.photos/100/100?random=5' },
  { id: '6', name: 'Music Hits', category: 'Music', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', logo: 'https://picsum.photos/100/100?random=6' },
];

export const MOCK_RESELLER_STATS: ResellerStats = {
  totalUsers: 145,
  activeUsers: 120,
  expiredUsers: 10,
  codesActivatedToday: 5,
  pointsBalance: 850,
  monthlySales: [
    { name: 'Jan', sales: 400 },
    { name: 'Feb', sales: 300 },
    { name: 'Mar', sales: 500 },
    { name: 'Apr', sales: 200 },
    { name: 'May', sales: 600 },
    { name: 'Jun', sales: 850 },
  ],
};

export const MOCK_USER: User = {
  id: 'u-123',
  email: 'demo@tvapp.com',
  role: UserRole.RESELLER, // Default role for demo
  deviceId: 'stored-device-id',
  points: 850,
  isActive: true,
  created_at: '2023-01-01',
};

export const MOCK_ADMIN_USER: User = {
  id: 'admin-001',
  email: 'admin@tvapp.com',
  role: UserRole.ADMIN,
  deviceId: 'admin-device',
  isActive: true,
};

export const PAYMENT_PLANS: PaymentPlan[] = [
  { id: 'p1', name: 'Starter Pack', points: 10, durationMonths: 1, maxDevices: 1, isActive: true },
  { id: 'p2', name: 'Pro Pack', points: 50, durationMonths: 6, maxDevices: 2, isActive: true },
  { id: 'p3', name: 'Enterprise', points: 100, durationMonths: 12, maxDevices: 4, isActive: true },
];
