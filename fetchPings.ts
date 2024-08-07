import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.INTERCOM_TOKEN;
const ADMIN_DETAILS = JSON.parse(process.env.ADMIN_DETAILS || '[]');
const INTERCOM_VERSION = '2.11';
const OUTPUT_FILE = 'ping_notes.json';
const ERROR_FILE = 'error_log.json';
const POLL_INTERVAL = 6000; // 6 seconds for testing

let pingNotesList: any[] = [];
let errorLog: any[] = [];
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
    console.error('Error fetching conversations:', error);
    errorLog.push({ type: 'fetchConversations', adminId, error: error.message });
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
    console.error(`Error fetching parts for conversation ID ${conversationId}:`, error);
    errorLog.push({ type: 'fetchConversationParts', conversationId, error: error.message });
    return null;
  }
}

async function processConversations(initial: boolean = false) {
  console.log(`Processing conversations... (initial: ${initial})`);
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
              console.log(`'${authorName}' pinged conversation '${conversationId}' at '${noteTime}'`);
              pingNotesList.push({ authorName, conversationId, noteTime });
            });
          } else {
            console.log(`No #ping note found for conversation ID: ${conversationId}`);
          }

          processedConversations.add(conversationId);
        } else {
          console.error(`Invalid JSON for conversation parts: ${conversationId}`);
          if (parts) {
            fs.writeFileSync(`error_conversation_parts_${conversationId}.json`, JSON.stringify(parts, null, 2));
            errorLog.push({ type: 'invalidParts', conversationId, parts });
          }
        }
      }
    } else {
      console.error('Invalid JSON for conversations');
      if (conversations) {
        fs.writeFileSync('error_conversations.json', JSON.stringify(conversations, null, 2));
        errorLog.push({ type: 'invalidConversations', conversations });
      }
    }
  }

  if (pingNotesList.length > 0) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pingNotesList, null, 2));
  }

  if (errorLog.length > 0) {
    fs.writeFileSync(ERROR_FILE, JSON.stringify(errorLog, null, 2));
  }
}

function startMonitoring() {
  console.log('Starting monitoring...');
  processConversations(true).then(() => {
    setInterval(() => {
      console.log('Polling for new conversations...');
      processConversations().catch((error) => {
        console.error('Error processing conversations:', error);
        errorLog.push({ type: 'processConversations', error: error.message });
        fs.writeFileSync(ERROR_FILE, JSON.stringify(errorLog, null, 2));
      });
    }, POLL_INTERVAL);
  }).catch((error) => {
    console.error('Error processing conversations:', error);
    errorLog.push({ type: 'processConversations', error: error.message });
    fs.writeFileSync(ERROR_FILE, JSON.stringify(errorLog, null, 2));
  });
}

startMonitoring();
