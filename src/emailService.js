import { Resend } from 'resend';

const resend = new Resend('re_aEswZ2Pf_DyiqyFaNopzrQ6Xw7j7xWTd8'); // Replace with your actual key!

export async function sendSlotNotification(coachName, slotDetails, clientEmails) {
  const { date, time, bookingLink } = slotDetails;

  try {
    const results = await Promise.all(
      clientEmails.map(email =>
        resend.emails.send({
          from: 'LastMinuteLessonMode <onboarding@resend.dev>',
          to: email,
          subject: `🏸 New Last-Minute Opening from ${coachName}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #28a745;">🏸 Last-Minute Opening Available!</h1>
              <p><strong>${coachName}</strong> just opened a new time slot:</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${time}</p>
              </div>
              
              <p><strong>Book now before someone else does!</strong></p>
              
              <a href="${bookingLink}" 
                 style="display: inline-block; background: #28a745; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
                📋 Book This Slot
              </a>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This is an automated notification from LastMinuteLessonMode.
              </p>
            </div>
          `
        })
      )
    );

    return { success: true, sent: results.length };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}