import fetch from 'node-fetch';
import { db } from './db';
import { streamers, User } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';
import { log } from './vite';

// Twitch API configuration
const TWITCH_API_URL = 'https://api.twitch.tv/helix';
const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Twitch API credentials are not configured. Please set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET environment variables.');
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
    
    return accessToken;
  } catch (error) {
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
    
    // Construct the user_login query params
    const userParams = twitchIds.map(id => `user_login=${id}`).join('&');
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
    return data.data || [];
  } catch (error) {
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
    
    // Construct the user_login query params
    const userParams = twitchIds.map(id => `broadcaster_login=${id}`).join('&');
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
    return data.data || [];
  } catch (error) {
    log(`Error fetching Twitch channels: ${error.message}`, 'twitch');
    return [];
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
    const twitchIds = streamersWithTwitchIds.map(streamer => streamer.twitchId!);
    
    if (twitchIds.length === 0) {
      log('No streamers with Twitch IDs found', 'twitch');
      return;
    }
    
    // Fetch stream data from Twitch API
    const streamData = await getStreams(twitchIds);
    const channelData = await getChannelInfo(twitchIds);
    
    // Process each streamer
    for (const streamer of streamersWithTwitchIds) {
      // Find stream data for this streamer
      const stream = streamData.find(s => s.user_login.toLowerCase() === streamer.twitchId!.toLowerCase());
      const channel = channelData.find(c => c.broadcaster_login.toLowerCase() === streamer.twitchId!.toLowerCase());
      
      // Prepare update data
      const updates: any = {
        isLive: !!stream,
        lastUpdated: new Date()
      };
      
      if (stream) {
        updates.streamTitle = stream.title;
        updates.viewerCount = stream.viewer_count;
        updates.startedAt = new Date(stream.started_at);
        updates.thumbnailUrl = stream.thumbnail_url
          .replace('{width}', '1280')
          .replace('{height}', '720');
      }
      
      if (channel) {
        updates.currentGame = channel.game_name;
        updates.profileImageUrl = streamer.profileImageUrl || ''; // Keep existing if present
      }
      
      // Update streamer in database
      await db.update(streamers)
        .set(updates)
        .where(eq(streamers.id, streamer.id));
      
      log(`Updated streamer ${streamer.displayName} (${streamer.twitchId}): ${stream ? 'LIVE' : 'OFFLINE'}`, 'twitch');
    }
    
    log(`Successfully updated status for ${streamersWithTwitchIds.length} streamers`, 'twitch');
  } catch (error) {
    log(`Error updating stream status: ${error.message}`, 'twitch');
  }
}

/**
 * Schedule regular updates of stream status
 * @param intervalMinutes How often to check Twitch API (in minutes)
 */
export function scheduleStreamStatusUpdates(intervalMinutes: number = 5): NodeJS.Timer {
  // Run immediately on startup
  updateStreamStatus().catch(err => log(`Initial stream status update failed: ${err.message}`, 'twitch'));
  
  // Then schedule regular updates
  const intervalMs = intervalMinutes * 60 * 1000;
  return setInterval(() => {
    updateStreamStatus().catch(err => log(`Scheduled stream status update failed: ${err.message}`, 'twitch'));
  }, intervalMs);
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
    const existingStreamers = await db.select().from(streamers).where(eq(streamers.twitchId, twitchUser.login));
    
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
          lastUpdated: new Date()
        })
        .where(eq(streamers.userId, userId));
    } else {
      // Create new streamer profile
      await db.insert(streamers)
        .values({
          userId,
          twitchId: twitchUser.login,
          displayName: twitchUser.display_name,
          profileImageUrl: twitchUser.profile_image_url,
          isLive: false,
          lastUpdated: new Date()
        });
    }
    
    return true;
  } catch (error) {
    log(`Error linking Twitch account: ${error.message}`, 'twitch');
    return false;
  }
}