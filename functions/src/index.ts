import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

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

interface EmailData {
  userEmail: string;
  meetupTitle: string;
}

// Función para enviar email cuando un usuario se une al meetup
export const sendJoinMeetupEmail = functions.https.onCall(
  async (request) => {
    const {userEmail, meetupTitle} = request.data as EmailData;

    // Verificar si el usuario está autenticado
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to send emails."
      );
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
      return {success: true};
    } catch (error) {
      console.error("Error sending email:", error);
      throw new functions.https.HttpsError("internal", "Error sending email");
    }
  }
);

// Función para enviar email cuando un meetup es cancelado
export const sendMeetupDeletedEmail = functions.https.onCall(
  async (request) => {
    const {userEmail, meetupTitle} = request.data as EmailData;

    // Verificar si el usuario está autenticado
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to send emails."
      );
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
      return {success: true};
    } catch (error) {
      console.error("Error sending email:", error);
      throw new functions.https.HttpsError("internal", "Error sending email");
    }
  }
);
