import * as fs from 'fs';

const OUTPUT_FILE = 'ping_notes.json';
const ERROR_FILE = 'error_log.json';

let pingNotesList: any[] = [];
let errorLog: any[] = [];

export function logMessage(message: string) {
  console.log(message);
}

export function logError(type: string, details: any) {
  console.error(`Error [${type}]:`, details);
  errorLog.push({ type, details });
}

export function logPing(authorName: string, conversationId: string, noteTime: string) {
  const message = `'${authorName}' pinged conversation '${conversationId}' at '${noteTime}'`;
  console.log(message);
  pingNotesList.push({ authorName, conversationId, noteTime });
}

export function logNoPing(conversationId: string) {
  const message = `No #ping note found for conversation ID: ${conversationId}`;
  console.log(message);
}

export function saveLogs() {
  if (pingNotesList.length > 0) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pingNotesList, null, 2));
  }

  if (errorLog.length > 0) {
    fs.writeFileSync(ERROR_FILE, JSON.stringify(errorLog, null, 2));
  }
}

export function saveInvalidJson(type: string, data: any) {
  const fileName = `error_${type}.json`;
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  errorLog.push({ type: `invalid${type}`, data });
}
