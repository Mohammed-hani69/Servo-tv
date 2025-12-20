import { API_BASE_URL, USE_MOCK_DATA } from './config';
import { Playlist, PlaylistItem } from '../types';

const getToken = () => localStorage.getItem('tv_app_token');

export const getPlaylists = async (): Promise<Playlist[]> => {
  const localM3u = localStorage.getItem('tv_playlist_source');
  const customPlaylists: Playlist[] = [];

  if (localM3u) {
    customPlaylists.push({
      id: 'local-m3u',
      name: 'Imported M3U Playlist',
      itemCount: 50, // Mock count, real impl would parse the file first
      created_at: new Date().toISOString()
    });
  }

  if (USE_MOCK_DATA) {
    return [
      ...customPlaylists,
      { id: '1', name: 'My Favorites', itemCount: 12 },
      { id: '2', name: 'Sports List', itemCount: 5 }
    ];
  }
  
  try {
      const res = await fetch(`${API_BASE_URL}/playlists`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if(Array.isArray(data)) {
          return [...customPlaylists, ...data];
      }
      return customPlaylists;
  } catch (e) {
      console.error(e);
      return customPlaylists;
  }
};

export const getPlaylistItems = async (playlistId: string): Promise<PlaylistItem[]> => {
  // Handle the locally imported M3U
  if (playlistId === 'local-m3u') {
    // In a real application, we would fetch the URL stored in localStorage,
    // parse the M3U text, and return the items.
    // Since we can't easily do cross-origin fetches in this demo environment,
    // we will return a simulated list of "Imported" channels.
    
    return Array.from({ length: 20 }).map((_, i) => ({
        id: `m3u-${i}`,
        title: `Imported Channel ${i + 1}`,
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Sample HLS Stream
        category: 'M3U Import'
    }));
  }

  if (USE_MOCK_DATA) {
    return [
       { id: '101', title: 'News 24', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', category: 'News' },
       { id: '102', title: 'Sports 1', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', category: 'Sports' },
    ];
  }
  
  const res = await fetch(`${API_BASE_URL}/playlists/${playlistId}/items`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.json();
};

export const createPlaylist = async (name: string): Promise<Playlist> => {
  if (USE_MOCK_DATA) return { id: Date.now().toString(), name, itemCount: 0 };
  
  const res = await fetch(`${API_BASE_URL}/playlists`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}` 
    },
    body: JSON.stringify({ name })
  });
  return res.json();
};