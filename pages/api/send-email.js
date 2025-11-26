const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { coachName, slotDetails, clientEmails } = req.body;

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
                <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${slotDetails.date}</p>
                <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${slotDetails.time}</p>
              </div>
              
              <p><strong>Book now before someone else does!</strong></p>
              
              <a href="${slotDetails.bookingLink}" 
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

    return res.status(200).json({ success: true, sent: results.length });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};