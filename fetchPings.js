"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var dotenv = require("dotenv");
var logger_1 = require("./logger");
dotenv.config();
var TOKEN = process.env.INTERCOM_TOKEN;
var ADMIN_DETAILS = JSON.parse(process.env.ADMIN_DETAILS || '[]');
var INTERCOM_VERSION = '2.11';
var POLL_INTERVAL = 6000; // 6 seconds for testing
var processedConversations = new Set();
function fetchConversations(adminId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get("https://api.intercom.io/conversations?type=admin&admin_id=".concat(adminId, "&open=true"), {
                            headers: {
                                Authorization: "Bearer ".concat(TOKEN),
                                Accept: 'application/json',
                                'Intercom-Version': INTERCOM_VERSION,
                            },
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
                case 2:
                    error_1 = _a.sent();
                    (0, logger_1.logError)('fetchConversations', { adminId: adminId, error: error_1.message });
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fetchConversationParts(conversationId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get("https://api.intercom.io/conversations/".concat(conversationId), {
                            headers: {
                                Authorization: "Bearer ".concat(TOKEN),
                                Accept: 'application/json',
                                'Intercom-Version': INTERCOM_VERSION,
                            },
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
                case 2:
                    error_2 = _a.sent();
                    (0, logger_1.logError)('fetchConversationParts', { conversationId: conversationId, error: error_2.message });
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function processConversations() {
    return __awaiter(this, arguments, void 0, function (initial) {
        var _i, ADMIN_DETAILS_1, admin, adminId, adminName, conversations, _loop_1, _a, _b, conversation;
        if (initial === void 0) { initial = false; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    (0, logger_1.logMessage)("Processing conversations... (initial: ".concat(initial, ")"));
                    _i = 0, ADMIN_DETAILS_1 = ADMIN_DETAILS;
                    _c.label = 1;
                case 1:
                    if (!(_i < ADMIN_DETAILS_1.length)) return [3 /*break*/, 9];
                    admin = ADMIN_DETAILS_1[_i];
                    adminId = admin.id;
                    adminName = admin.name;
                    return [4 /*yield*/, fetchConversations(adminId)];
                case 2:
                    conversations = _c.sent();
                    if (!(conversations && Array.isArray(conversations.conversations))) return [3 /*break*/, 7];
                    _loop_1 = function (conversation) {
                        var conversationId, parts, pingNotes;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    conversationId = conversation.id;
                                    if (processedConversations.has(conversationId) && !initial) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    return [4 /*yield*/, fetchConversationParts(conversationId)];
                                case 1:
                                    parts = _d.sent();
                                    if (parts && parts.conversation_parts && Array.isArray(parts.conversation_parts.conversation_parts)) {
                                        pingNotes = parts.conversation_parts.conversation_parts.filter(function (part) { return part.part_type === 'note' && part.body.includes('#ping'); });
                                        if (pingNotes.length > 0) {
                                            pingNotes.forEach(function (note) {
                                                var authorName = note.author.name;
                                                var noteTime = new Date(note.created_at * 1000).toUTCString();
                                                (0, logger_1.logPing)(authorName, conversationId, noteTime);
                                            });
                                        }
                                        else {
                                            (0, logger_1.logNoPing)(conversationId);
                                        }
                                        processedConversations.add(conversationId);
                                    }
                                    else {
                                        (0, logger_1.logError)("Invalid JSON for conversation parts: ".concat(conversationId), parts);
                                        if (parts) {
                                            (0, logger_1.saveInvalidJson)("conversation_parts_".concat(conversationId), parts);
                                        }
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a = 0, _b = conversations.conversations;
                    _c.label = 3;
                case 3:
                    if (!(_a < _b.length)) return [3 /*break*/, 6];
                    conversation = _b[_a];
                    return [5 /*yield**/, _loop_1(conversation)];
                case 4:
                    _c.sent();
                    _c.label = 5;
                case 5:
                    _a++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    (0, logger_1.logError)('Invalid JSON for conversations', conversations);
                    if (conversations) {
                        (0, logger_1.saveInvalidJson)('conversations', conversations);
                    }
                    _c.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9:
                    (0, logger_1.saveLogs)();
                    return [2 /*return*/];
            }
        });
    });
}
function startMonitoring() {
    (0, logger_1.logMessage)('Starting monitoring...');
    processConversations(true).then(function () {
        setInterval(function () {
            (0, logger_1.logMessage)('Polling for new conversations...');
            processConversations().catch(function (error) {
                (0, logger_1.logError)('processConversations', { error: error.message });
                (0, logger_1.saveLogs)();
            });
        }, POLL_INTERVAL);
    }).catch(function (error) {
        (0, logger_1.logError)('processConversations', { error: error.message });
        (0, logger_1.saveLogs)();
    });
}
startMonitoring();
