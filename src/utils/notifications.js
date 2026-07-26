import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendSMSNotification(toPhoneNumber, message) {
  if (!client || !toPhoneNumber || !fromPhone) {
    console.log(`[SMS Mock] To ${toPhoneNumber}: ${message}`);
    return;
  }

  try {
    await client.messages.create({
      body: message,
      from: fromPhone,
      to: toPhoneNumber,
    });
    console.log(`SMS successfully sent to ${toPhoneNumber}`);
  } catch (error) {
    console.error("Twilio Error:", error.message);
  }
}
