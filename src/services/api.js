export async function sendAuditEvent(event) {
    try {
      const BASE_URL = 'https://smartlead-backend.onrender.com/audit-log';
      await fetch(BASE_URL, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send audit event', error);
    }
  }
  