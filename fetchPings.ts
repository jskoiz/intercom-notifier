import axios from 'axios';
import * as dotenv from 'dotenv';
import {
  logMessage,
  logError,
  logPing,
  logNoPing,
  saveLogs,
  saveInvalidJson
} from './logger';

dotenv.config();

const TOKEN = process.env.INTERCOM_TOKEN;
const ADMIN_DETAILS = JSON.parse(process.env.ADMIN_DETAILS || '[]');
const INTERCOM_VERSION = '2.11';
const POLL_INTERVAL = 6000; // 6 seconds for testing

let processedConversations: Set<string> = new Set();

async function fetchConversations(adminId: string) {
  try {
    const response = await axios.get(
      `https://api.intercom.io/conversations?type=admin&admin_id=${adminId}&open=true`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: 'application/json',
          'Intercom-Version': INTERCOM_VERSION,
        },
      }
    );
    return response.data;
  } catch (error) {
    logError('fetchConversations', { adminId, error: error.message });
    return null;
  }
}

async function fetchConversationParts(conversationId: string) {
  try {
    const response = await axios.get(
      `https://api.intercom.io/conversations/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: 'application/json',
          'Intercom-Version': INTERCOM_VERSION,
        },
      }
    );
    return response.data;
  } catch (error) {
    logError('fetchConversationParts', { conversationId, error: error.message });
    return null;
  }
}

async function processConversations(initial: boolean = false) {
  logMessage(`Processing conversations... (initial: ${initial})`);
  for (const admin of ADMIN_DETAILS) {
    const adminId = admin.id;
    const adminName = admin.name;
    const conversations = await fetchConversations(adminId);

    if (conversations && Array.isArray(conversations.conversations)) {
      for (const conversation of conversations.conversations) {
        const conversationId = conversation.id;

        if (processedConversations.has(conversationId) && !initial) {
          continue;
        }

        const parts = await fetchConversationParts(conversationId);

        if (parts && parts.conversation_parts && Array.isArray(parts.conversation_parts.conversation_parts)) {
          const pingNotes = parts.conversation_parts.conversation_parts.filter(
            (part: any) => part.part_type === 'note' && part.body.includes('#ping')
          );

          if (pingNotes.length > 0) {
            pingNotes.forEach((note: any) => {
              const authorName = note.author.name;
              const noteTime = new Date(note.created_at * 1000).toUTCString();
              logPing(authorName, conversationId, noteTime);
            });
          } else {
            logNoPing(conversationId);
          }

          processedConversations.add(conversationId);
        } else {
          logError(`Invalid JSON for conversation parts: ${conversationId}`, parts);
          if (parts) {
            saveInvalidJson(`conversation_parts_${conversationId}`, parts);
          }
        }
      }
    } else {
      logError('Invalid JSON for conversations', conversations);
      if (conversations) {
        saveInvalidJson('conversations', conversations);
      }
    }
  }

  saveLogs();
}

function startMonitoring() {
  logMessage('Starting monitoring...');
  processConversations(true).then(() => {
    setInterval(() => {
      logMessage('Polling for new conversations...');
      processConversations().catch((error) => {
        logError('processConversations', { error: error.message });
        saveLogs();
      });
    }, POLL_INTERVAL);
  }).catch((error) => {
    logError('processConversations', { error: error.message });
    saveLogs();
  });
}

startMonitoring();
