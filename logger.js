"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMessage = logMessage;
exports.logError = logError;
exports.logPing = logPing;
exports.logNoPing = logNoPing;
exports.saveLogs = saveLogs;
exports.saveInvalidJson = saveInvalidJson;
var fs = require("fs");
var OUTPUT_FILE = 'ping_notes.json';
var ERROR_FILE = 'error_log.json';
var pingNotesList = [];
var errorLog = [];
function logMessage(message) {
    console.log(message);
}
function logError(type, details) {
    console.error("Error [".concat(type, "]:"), details);
    errorLog.push({ type: type, details: details });
}
function logPing(authorName, conversationId, noteTime) {
    var message = "'".concat(authorName, "' pinged conversation '").concat(conversationId, "' at '").concat(noteTime, "'");
    console.log(message);
    pingNotesList.push({ authorName: authorName, conversationId: conversationId, noteTime: noteTime });
}
function logNoPing(conversationId) {
    var message = "No #ping note found for conversation ID: ".concat(conversationId);
    console.log(message);
}
function saveLogs() {
    if (pingNotesList.length > 0) {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(pingNotesList, null, 2));
    }
    if (errorLog.length > 0) {
        fs.writeFileSync(ERROR_FILE, JSON.stringify(errorLog, null, 2));
    }
}
function saveInvalidJson(type, data) {
    var fileName = "error_".concat(type, ".json");
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    errorLog.push({ type: "invalid".concat(type), data: data });
}
