export async function sendSlotNotification(coachName, slotDetails, clientEmails) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coachName,
        slotDetails,
        clientEmails
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}