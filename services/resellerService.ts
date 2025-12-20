
import { API_BASE_URL, USE_MOCK_DATA } from './config';
import { MOCK_RESELLER_STATS } from '../constants';
import { ResellerStats } from '../types';

const getToken = () => localStorage.getItem('tv_app_token');

export const fetchResellerStats = async (): Promise<ResellerStats> => {
  if (USE_MOCK_DATA) {
    await new Promise(r => setTimeout(r, 500));
    return MOCK_RESELLER_STATS;
  }

  const res = await fetch(`${API_BASE_URL}/reseller/stats`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
};

export const createUser = async (email: string, devices: number = 1): Promise<void> => {
  if (USE_MOCK_DATA) {
    await new Promise(r => setTimeout(r, 800));
    return;
  }

  const res = await fetch(`${API_BASE_URL}/reseller/users`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}` 
    },
    body: JSON.stringify({ email, devicesCount: devices })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create user');
};

export const buyPoints = async (points: number, amount: number): Promise<void> => {
  if (USE_MOCK_DATA) {
    await new Promise(r => setTimeout(r, 1000));
    return;
  }

  const res = await fetch(`${API_BASE_URL}/reseller/buy-points`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}` 
    },
    body: JSON.stringify({ points, amountCents: amount * 100 })
  });

  if (!res.ok) throw new Error('Payment failed');
};
