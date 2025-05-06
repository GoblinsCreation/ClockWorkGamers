import fetch from 'node-fetch';
import { db } from './db';
import { streamers, notifications, User } from '@shared/schema';
import { eq, inArray, and, desc } from 'drizzle-orm';
import { log } from './vite';

// Twitch API configuration
const TWITCH_API_URL = 'https://api.twitch.tv/helix';
const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';
const CLIENT_ID = process.env.TWITCH_CLIENT_ID || '';
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || '';

// Update interval in minutes (can be configured)
const DEFAULT_UPDATE_INTERVAL_MINUTES = 5;

// Track streamers that were live in the previous check
let previouslyLiveStreamers = new Set<string>();

// Store the interval timer reference
let updateInterval: NodeJS.Timer | null = null;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('Twitch API credentials are not configured. Please set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET environment variables.');
}

// Cache for Twitch access token
let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get a valid Twitch API access token
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await fetch(`${TWITCH_AUTH_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to get Twitch access token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { access_token: string, expires_in: number };
    accessToken = data.access_token;
    // Set expiry time with a small buffer (5 minutes)
    tokenExpiry = Date.now() + (data.expires_in * 1000) - (5 * 60 * 1000);
    
    log(`Successfully obtained Twitch access token, expires in ${Math.floor(data.expires_in / 60)} minutes`, 'twitch');
    return accessToken;
  } catch (error: any) {
    log(`Error getting Twitch access token: ${error.message}`, 'twitch');
    throw error;
  }
}

/**
 * Get stream information for a list of Twitch user IDs
 */
async function getStreams(twitchIds: string[]): Promise<any[]> {
  if (!twitchIds.length) return [];
  
  try {
    const token = await getAccessToken();
    
    // Handle Twitch API pagination and rate limits by processing in batches
    const MAX_IDS_PER_REQUEST = 100;
    let allStreams: any[] = [];
    
    // Process in batches to respect API limits
    for (let i = 0; i < twitchIds.length; i += MAX_IDS_PER_REQUEST) {
      const batchIds = twitchIds.slice(i, i + MAX_IDS_PER_REQUEST);
      const userParams = batchIds.map(id => `user_login=${id}`).join('&');
      const url = `${TWITCH_API_URL}/streams?${userParams}`;
      
      const response = await fetch(url, {
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Twitch API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { data: any[] };
      if (data.data && data.data.length > 0) {
        allStreams = allStreams.concat(data.data);
      }
      
      // Add a small delay between batch requests to avoid rate limiting
      if (i + MAX_IDS_PER_REQUEST < twitchIds.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return allStreams;
  } catch (error: any) {
    log(`Error fetching Twitch streams: ${error.message}`, 'twitch');
    return [];
  }
}

/**
 * Get channel information for a list of Twitch user IDs
 */
async function getChannelInfo(twitchIds: string[]): Promise<any[]> {
  if (!twitchIds.length) return [];
  
  try {
    const token = await getAccessToken();
    
    // Handle Twitch API pagination and rate limits by processing in batches
    const MAX_IDS_PER_REQUEST = 100;
    let allChannels: any[] = [];
    
    // Process in batches to respect API limits
    for (let i = 0; i < twitchIds.length; i += MAX_IDS_PER_REQUEST) {
      const batchIds = twitchIds.slice(i, i + MAX_IDS_PER_REQUEST);
      const userParams = batchIds.map(id => `broadcaster_login=${id}`).join('&');
      const url = `${TWITCH_API_URL}/channels?${userParams}`;
      
      const response = await fetch(url, {
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Twitch API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { data: any[] };
      if (data.data && data.data.length > 0) {
        allChannels = allChannels.concat(data.data);
      }
      
      // Add a small delay between batch requests to avoid rate limiting
      if (i + MAX_IDS_PER_REQUEST < twitchIds.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return allChannels;
  } catch (error: any) {
    log(`Error fetching Twitch channels: ${error.message}`, 'twitch');
    return [];
  }
}

/**
 * Create notifications for streamers that just went live
 */
async function createStreamLiveNotifications(liveStreamers: any[], streamerMap: Map<string, any>): Promise<void> {
  try {
    for (const stream of liveStreamers) {
      const twitchUsername = stream.user_login.toLowerCase();
      
      // Check if this streamer was previously not live
      if (!previouslyLiveStreamers.has(twitchUsername)) {
        const streamer = streamerMap.get(twitchUsername);
        if (!streamer) continue;
        
        // Create a notification for all users
        await db.insert(notifications)
          .values({
            userId: streamer.userId, // For the streamer themselves
            type: 'streamer_live',
            title: 'Stream Started',
            message: `${streamer.displayName} is now live on Twitch: ${stream.title}`,
            isRead: false,
            link: `https://twitch.tv/${twitchUsername}`,
            metadata: {
              streamerId: streamer.id,
              twitchId: twitchUsername,
              game: stream.game_name,
              viewerCount: stream.viewer_count,
              thumbnailUrl: stream.thumbnail_url
                .replace('{width}', '1280')
                .replace('{height}', '720')
            }
          });
        
        log(`Created 'Stream Started' notification for ${streamer.displayName}`, 'twitch');
      }
    }
  } catch (error: any) {
    log(`Error creating stream live notifications: ${error.message}`, 'twitch');
  }
}

/**
 * Update the streaming status of all streamers in the database
 */
export async function updateStreamStatus(): Promise<void> {
  try {
    // Fetch all streamers from the database
    const streamersList = await db.select().from(streamers);
    
    // Filter out streamers without Twitch IDs
    const streamersWithTwitchIds = streamersList.filter(streamer => streamer.twitchId);
    const twitchIds = streamersWithTwitchIds.map(streamer => streamer.twitchId as string).filter(Boolean);
    
    if (twitchIds.length === 0) {
      log('No streamers with Twitch IDs found', 'twitch');
      return;
    }
    
    // Create a map for faster lookups
    const streamerMap = new Map();
    for (const streamer of streamersWithTwitchIds) {
      if (streamer.twitchId) {
        streamerMap.set(streamer.twitchId.toLowerCase(), streamer);
      }
    }
    
    // Fetch stream data from Twitch API
    const streamData = await getStreams(twitchIds);
    const channelData = await getChannelInfo(twitchIds);
    
    // Track newly live streamers for notifications
    const currentlyLiveStreamers = new Set<string>();
    
    // Process each streamer
    for (const streamer of streamersWithTwitchIds) {
      if (!streamer.twitchId) continue;
      
      const twitchId = streamer.twitchId.toLowerCase();
      
      // Find stream data for this streamer
      const stream = streamData.find(s => s.user_login.toLowerCase() === twitchId);
      const channel = channelData.find(c => c.broadcaster_login.toLowerCase() === twitchId);
      
      // Track live status
      if (stream) {
        currentlyLiveStreamers.add(twitchId);
      }
      
      // Prepare update data
      const updates = {
        isLive: !!stream,
        lastUpdated: new Date()
      } as any;
      
      if (stream) {
        updates.streamTitle = stream.title;
        updates.viewerCount = stream.viewer_count;
        updates.startedAt = new Date(stream.started_at);
        updates.streamType = stream.type;
        updates.thumbnailUrl = stream.thumbnail_url
          .replace('{width}', '1280')
          .replace('{height}', '720');
          
        if (stream.tags && Array.isArray(stream.tags)) {
          updates.tags = stream.tags;
        }
        
        updates.language = stream.language || 'en';
      }
      
      if (channel) {
        updates.currentGame = channel.game_name;
        updates.gameId = channel.game_id;
        updates.profileImageUrl = streamer.profileImageUrl || ''; // Keep existing if present
      }
      
      // Update streamer in database
      await db.update(streamers)
        .set(updates)
        .where(eq(streamers.id, streamer.id));
      
      const statusChange = 
        (previouslyLiveStreamers.has(twitchId) && !stream) ? 'WENT OFFLINE' :
        (!previouslyLiveStreamers.has(twitchId) && stream) ? 'WENT LIVE' :
        stream ? 'STILL LIVE' : 'STILL OFFLINE';
        
      log(`Updated streamer ${streamer.displayName} (${twitchId}): ${statusChange}`, 'twitch');
    }
    
    // Create notifications for streamers who just went live
    await createStreamLiveNotifications(streamData, streamerMap);
    
    // Update the previously live streamers tracker
    previouslyLiveStreamers = currentlyLiveStreamers;
    
    log(`Successfully updated status for ${streamersWithTwitchIds.length} streamers`, 'twitch');
  } catch (error: any) {
    log(`Error updating stream status: ${error.message}`, 'twitch');
  }
}

/**
 * Get all currently live streamers from the database
 */
export async function getLiveStreamers() {
  try {
    return await db.select()
      .from(streamers)
      .where(eq(streamers.isLive, true))
      .orderBy(desc(streamers.viewerCount));
  } catch (error: any) {
    log(`Error fetching live streamers: ${error.message}`, 'twitch');
    throw error;
  }
}

/**
 * Schedule regular updates of stream status
 * @param intervalMinutes How often to check Twitch API (in minutes)
 */
export function scheduleStreamStatusUpdates(intervalMinutes: number = DEFAULT_UPDATE_INTERVAL_MINUTES): NodeJS.Timer {
  // Clear any existing interval
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  
  // Run immediately on startup
  updateStreamStatus().catch((err: any) => log(`Initial stream status update failed: ${err.message}`, 'twitch'));
  
  // Then schedule regular updates
  const intervalMs = intervalMinutes * 60 * 1000;
  updateInterval = setInterval(() => {
    updateStreamStatus().catch((err: any) => log(`Scheduled stream status update failed: ${err.message}`, 'twitch'));
  }, intervalMs);
  
  log(`Scheduled Twitch stream status updates every ${intervalMinutes} minutes`, 'twitch');
  
  return updateInterval;
}

/**
 * Stop scheduled stream status updates
 */
export function stopStreamStatusUpdates(): void {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
    log('Stopped Twitch stream status updates', 'twitch');
  }
}

/**
 * Reset the Twitch API token (for testing or when token becomes invalid)
 */
export function resetTwitchToken(): void {
  accessToken = null;
  tokenExpiry = 0;
  log('Reset Twitch API token', 'twitch');
}

/**
 * Authenticate a user with Twitch and link their Twitch account with CWG account
 */
export async function linkTwitchAccount(code: string, redirectUri: string, userId: number): Promise<boolean> {
  try {
    // Exchange auth code for token
    const tokenResponse = await fetch(
      `${TWITCH_AUTH_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${redirectUri}`, 
      { method: 'POST' }
    );
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to exchange code: ${tokenResponse.status}`);
    }
    
    const tokenData = await tokenResponse.json() as { access_token: string };
    
    // Get user info from Twitch
    const userResponse = await fetch(`${TWITCH_API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Client-ID': CLIENT_ID
      }
    });
    
    if (!userResponse.ok) {
      throw new Error(`Failed to get Twitch user: ${userResponse.status}`);
    }
    
    const userData = await userResponse.json() as { data: any[] };
    
    if (!userData.data || userData.data.length === 0) {
      throw new Error('No Twitch user data found');
    }
    
    const twitchUser = userData.data[0];
    
    // Check if this Twitch account is already linked to another CWG user
    const existingStreamers = await db.select().from(streamers).where(eq(streamers.twitchId as any, twitchUser.login));
    
    if (existingStreamers.length > 0 && existingStreamers[0].userId !== userId) {
      throw new Error('This Twitch account is already linked to another user');
    }
    
    // Check if user already has a streamer profile
    const userStreamer = await db.select().from(streamers).where(eq(streamers.userId, userId));
    
    if (userStreamer.length > 0) {
      // Update existing streamer profile
      await db.update(streamers)
        .set({
          twitchId: twitchUser.login,
          displayName: twitchUser.display_name,
          profileImageUrl: twitchUser.profile_image_url,
          lastUpdated: new Date(),
          isLive: false
        })
        .where(eq(streamers.userId, userId));
    } else {
      // Create new streamer profile
      await db.insert(streamers)
        .values({
          userId: userId,
          twitchId: twitchUser.login,
          displayName: twitchUser.display_name,
          profileImageUrl: twitchUser.profile_image_url,
          lastUpdated: new Date(),
          isLive: false
        });
    }
    
    // Run an immediate update to check if the streamer is currently live
    await updateStreamStatus();
    
    log(`Successfully linked Twitch account ${twitchUser.login} for user ${userId}`, 'twitch');
    return true;
  } catch (error: any) {
    log(`Error linking Twitch account: ${error.message}`, 'twitch');
    return false;
  }
}