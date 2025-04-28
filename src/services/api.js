export async function sendAuditEvent(event) {
    try {
      await fetch('http://localhost:5000/audit-log', {  // ✅ local backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send audit event', error);
    }
  }
  