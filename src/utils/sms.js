export async function sendSMSNotification(phone, message) {
  console.log(`SMS to ${phone}: ${message}`);
  return true;
}