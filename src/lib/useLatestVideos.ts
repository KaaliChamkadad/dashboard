import { useEffect, useState } from 'react';
import { videos as fallbackVideos, type Video } from '../data/channel';

const YOUTUBE_API_KEY = 'AIzaSyA5HX2x-W6JdZDUbQ5x2wNNs37koo8VniI';
// Uploads playlist ID for KaaliChamkadad (derived from channel ID UCexc_D3rbZupBnlTGkEB45w → UUexc_D3rbZupBnlTGkEB45w)
const UPLOADS_PLAYLIST_ID = 'UUexc_D3rbZupBnlTGkEB45w';
const MAX_RESULTS = 20;

/** Map YouTube API game-detection hashtags to our local game labels. */
function detectGame(title: string, description: string): Video['game'] {
  const blob = `${title} ${description}`.toLowerCase();
  if (blob.includes('minecraft')) return 'Minecraft';
  if (blob.includes('gta') || blob.includes('grand theft auto')) return 'GTA V';
  if (blob.includes('valorant')) return 'Valorant';
  // Default to Minecraft since it's the primary game
  return 'Minecraft';
}

/** Detect if a video is a Short from title hashtags or description. */
function detectShort(title: string, description: string): boolean {
  const blob = `${title} ${description}`.toLowerCase();
  return blob.includes('#shorts') || blob.includes('#short');
}

/** Clean hashtags from title for display. */
function cleanTitle(title: string): string {
  return title
    .replace(/#\w+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Fetches the latest uploads from the KaaliChamkadad channel using the YouTube
 * Data API v3 PlaylistItems endpoint. Falls back to the hardcoded list in
 * `channel.ts` if the API call fails (e.g. quota exceeded, no network).
 *
 * The hook auto-refreshes every 5 minutes so the site stays current if someone
 * leaves the tab open.
 */
export function useLatestVideos() {
  const [videos, setVideos] = useState<Video[]>(fallbackVideos);

  useEffect(() => {
    if (YOUTUBE_API_KEY === 'PUT_YOUR_API_KEY_HERE') return;

    const fetchVideos = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=${MAX_RESULTS}&key=${YOUTUBE_API_KEY}`,
        );
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const liveVideos: Video[] = data.items.map(
            (item: { snippet: { title: string; description: string; publishedAt: string; resourceId: { videoId: string } } }) => {
              const s = item.snippet;
              const rawTitle = s.title;
              const description = s.description;
              return {
                id: s.resourceId.videoId,
                title: cleanTitle(rawTitle),
                game: detectGame(rawTitle, description),
                published: s.publishedAt.slice(0, 10),
                isShort: detectShort(rawTitle, description),
                description: description.split('\n')[0].slice(0, 200) || cleanTitle(rawTitle),
              };
            },
          );
          setVideos(liveVideos);
        }
      } catch (error) {
        console.error('Failed to fetch live YouTube videos:', error);
        // Keep using fallback videos
      }
    };

    fetchVideos();

    // Refresh every 5 minutes
    const intervalId = setInterval(fetchVideos, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return videos;
}
