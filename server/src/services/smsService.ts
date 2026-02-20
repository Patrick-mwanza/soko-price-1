import { env } from '../config/env';

// Africa's Talking SMS service wrapper
// In sandbox mode, messages are simulated

interface SMSResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

let smsClient: any = null;

const getClient = () => {
    if (!smsClient && env.AT_API_KEY) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const AfricasTalking = require('africastalking');
            const at = AfricasTalking({
                apiKey: env.AT_API_KEY,
                username: env.AT_USERNAME,
            });
            smsClient = at.SMS;
        } catch (err) {
            console.warn('⚠️ Africa\'s Talking SDK not configured. SMS disabled.');
        }
    }
    return smsClient;
};

export const sendSMS = async (
    to: string,
    message: string
): Promise<SMSResult> => {
    const client = getClient();

    if (!client) {
        console.log(`📱 [SMS SIMULATED] To: ${to}\n${message}`);
        return { success: true, messageId: 'simulated' };
    }

    try {
        const result = await client.send({
            to: [to],
            message,
            from: env.AT_SENDER_ID,
        });

        console.log(`📱 SMS sent to ${to}`);
        return {
            success: true,
            messageId: result.SMSMessageData?.Recipients?.[0]?.messageId,
        };
    } catch (error: any) {
        console.error(`❌ SMS failed to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

export const sendPriceSMS = async (
    to: string,
    cropName: string,
    marketName: string,
    price: number,
    unit: string,
    confidence: string
): Promise<SMSResult> => {
    const message =
        `SokoPrice: ${cropName} at ${marketName} Market\n` +
        `KSh ${price.toLocaleString('en-KE')} per ${unit}\n` +
        `Confidence: ${confidence}\n` +
        `Reply STOP to unsubscribe`;

    return sendSMS(to, message);
};

export const sendBulkSMS = async (
    recipients: string[],
    message: string
): Promise<SMSResult[]> => {
    const results: SMSResult[] = [];
    // Batch in groups of 100 for efficiency
    const batchSize = 100;
    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map((to) => sendSMS(to, message))
        );
        results.push(...batchResults);
    }
    return results;
};
