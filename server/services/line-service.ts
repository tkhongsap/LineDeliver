import { Client, TextMessage, ClientConfig } from '@line/bot-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration for LINE Bot SDK
const config: ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
};

// Create LINE client instance
const lineClient = new Client(config);

export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface BulkMessageResult {
  totalSent: number;
  successful: number;
  failed: number;
  results: Array<{
    userId: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Send a text message to a single LINE user
 */
export async function sendTextMessage(
  userId: string, 
  message: string
): Promise<MessageResult> {
  try {
    if (!config.channelAccessToken) {
      throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
    }

    const textMessage: TextMessage = {
      type: 'text',
      text: message
    };

    const result = await lineClient.pushMessage(userId, textMessage);
    
    return {
      success: true,
      messageId: result['x-line-request-id']
    };
  } catch (error: any) {
    console.error('Failed to send LINE message:', error);
    
    // Extract error details from LINE API response
    let errorMessage = 'Failed to send message';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Send messages to multiple LINE users
 */
export async function sendBulkMessages(
  userMessages: Array<{ userId: string; message: string }>
): Promise<BulkMessageResult> {
  const results: BulkMessageResult = {
    totalSent: userMessages.length,
    successful: 0,
    failed: 0,
    results: []
  };

  // Process messages in batches to avoid rate limiting
  const batchSize = 10;
  const delayBetweenBatches = 1000; // 1 second

  for (let i = 0; i < userMessages.length; i += batchSize) {
    const batch = userMessages.slice(i, i + batchSize);
    
    // Send messages in parallel within each batch
    const batchPromises = batch.map(async ({ userId, message }) => {
      const result = await sendTextMessage(userId, message);
      
      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
      }
      
      results.results.push({
        userId,
        success: result.success,
        error: result.error
      });
      
      return result;
    });
    
    await Promise.all(batchPromises);
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < userMessages.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
}

/**
 * Validate LINE User ID format
 * LINE User IDs start with 'U' followed by 32 hexadecimal characters
 */
export function validateLineUserId(userId: string): boolean {
  const lineUserIdPattern = /^U[0-9a-fA-F]{32}$/;
  return lineUserIdPattern.test(userId);
}

/**
 * Get LINE client configuration status
 */
export function getConfigStatus(): {
  isConfigured: boolean;
  hasAccessToken: boolean;
  hasChannelSecret: boolean;
} {
  return {
    isConfigured: !!config.channelAccessToken && !!config.channelSecret,
    hasAccessToken: !!config.channelAccessToken,
    hasChannelSecret: !!config.channelSecret
  };
}

/**
 * Test LINE API connection
 */
export async function testConnection(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    if (!config.channelAccessToken) {
      throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
    }

    // Try to get bot info to verify connection
    await lineClient.getBotInfo();
    
    return { connected: true };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || 'Connection test failed'
    };
  }
}