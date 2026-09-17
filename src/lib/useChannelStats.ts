import { useEffect, useState } from 'react';
import { channelStats as defaultStats } from '../data/channel';

export type ChannelStats = typeof defaultStats;

const YOUTUBE_API_KEY = 'AIzaSyA5HX2x-W6JdZDUbQ5x2wNNs37koo8VniI';
const YOUTUBE_HANDLE = 'KaaliChamkadad';

export function useChannelStats() {
  const [stats, setStats] = useState<ChannelStats>(defaultStats);

  useEffect(() => {
    // If the keys aren't set, we just use the default stats
    if (YOUTUBE_API_KEY === 'PUT_YOUR_API_KEY_HERE' || YOUTUBE_HANDLE === 'PUT_YOUR_CHANNEL_ID_HERE') {
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=${YOUTUBE_HANDLE}&key=${YOUTUBE_API_KEY}`
        );
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const ytStats = data.items[0].statistics;
          setStats((prev) => ({
            ...prev,
            subscribers: parseInt(ytStats.subscriberCount, 10),
            views: parseInt(ytStats.viewCount, 10),
            totalVideos: parseInt(ytStats.videoCount, 10),
          }));
        }
      } catch (error) {
        console.error('Failed to fetch live YouTube stats:', error);
      }
    };

    fetchStats();
    
    // Optional: Auto-refresh every 60 seconds so it updates if they leave the page open
    const intervalId = setInterval(fetchStats, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return stats;
}
