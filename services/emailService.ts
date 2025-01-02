const SENDGRID_API_KEY = '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';
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

interface EmailData {
  to: string;
  subject: string;
  text: string;
}

async function sendEmail(emailData: EmailData) {
  const response = await fetch(SENDGRID_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: emailData.to }] }],
      from: { email: 'meetingsmilano@gmail.com' },
      subject: emailData.subject,
      content: [{ type: 'text/plain', value: emailData.text }],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export const sendJoinMeetupEmail = async (to: string, meetupTitle: string) => {
  const emailData: EmailData = {
    to,
    subject: `You've joined a new meetup: ${meetupTitle}`,
    text: `Hello,\n\nYou have successfully joined the meetup "${meetupTitle}".\n\nWe look forward to seeing you there!\n\nBest regards,\nThe Meetly Team`,
  };

  try {
    await sendEmail(emailData);
    console.log('Join meetup email sent successfully');
  } catch (error) {
    console.error('Error sending join meetup email:', error);
    throw error;
  }
};

export const sendMeetupDeletedEmail = async (to: string, meetupTitle: string) => {
  const emailData: EmailData = {
    to,
    subject: `Meetup cancelled: ${meetupTitle}`,
    text: `Hello,\n\nWe regret to inform you that the meetup "${meetupTitle}" has been cancelled.\n\nWe apologize for any inconvenience this may cause.\n\nBest regards,\nThe Meetly Team`,
  };

  try {
    await sendEmail(emailData);
    console.log('Meetup deleted email sent successfully');
  } catch (error) {
    console.error('Error sending meetup deleted email:', error);
    throw error;
  }
};

