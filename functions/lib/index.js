"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMeetupDeletedEmail = exports.sendJoinMeetupEmail = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
admin.initializeApp();
const transporter = nodemailer.createTransport({
    host: functions.config().smtp.host,
    port: 587,
    secure: false,
    auth: {
        user: functions.config().smtp.user,
        pass: functions.config().smtp.pass,
    },
});
// Función para enviar email cuando un usuario se une al meetup
exports.sendJoinMeetupEmail = functions.https.onCall(async (request) => {
    const { userEmail, meetupTitle } = request.data;
    // Verificar si el usuario está autenticado
    if (!request.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to send emails.");
    }
    const subject = `You've joined a new meetup: ${meetupTitle}`;
    const text = `Hello,
  
    You have successfully joined the meetup "${meetupTitle}".
  
    We look forward to seeing you there!
  
    Best regards,
    The Meetly Team`;
    try {
        await transporter.sendMail({
            from: "\"Meetly App\" <noreply@meetly.com>",
            to: userEmail,
            subject,
            text,
        });
        return { success: true };
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new functions.https.HttpsError("internal", "Error sending email");
    }
});
// Función para enviar email cuando un meetup es cancelado
exports.sendMeetupDeletedEmail = functions.https.onCall(async (request) => {
    const { userEmail, meetupTitle } = request.data;
    // Verificar si el usuario está autenticado
    if (!request.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to send emails.");
    }
    const subject = `Meetup cancelled: ${meetupTitle}`;
    const text = `Hello,
  
    We regret to inform you that the meetup "${meetupTitle}" has been cancelled.
  
    We apologize for any inconvenience this may cause.
  
    Best regards,
    The Meetly Team`;
    try {
        await transporter.sendMail({
            from: "\"Meetly App\" <noreply@meetly.com>",
            to: userEmail,
            subject,
            text,
        });
        return { success: true };
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new functions.https.HttpsError("internal", "Error sending email");
    }
});
//# sourceMappingURL=index.js.map