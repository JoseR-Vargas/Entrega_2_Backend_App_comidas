import twilio from "twilio";
const { TWILIO_ID, TWILIO_TOKEN, TWILIO_PHONE } = process.env

async function sendSms(phone) {
    try {
        const client = twilio(TWILIO_ID, TWILIO_TOKEN);
        client.messages.create({
            body:"welcome to my App dev.Eats",
            from: TWILIO_PHONE,
            to: phone
        });
    } catch (error) {
        console.log(error);
        throw error
    }
};

export default sendSms