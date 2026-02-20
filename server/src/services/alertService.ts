import cron from 'node-cron';
import Alert from '../models/Alert';
import Price from '../models/Price';
import Crop from '../models/Crop';
import Market from '../models/Market';
import { sendSMS, sendPriceSMS } from './smsService';
import { formatPrice } from '../utils/i18n';

// Check all active alerts against latest approved prices
export const checkAlerts = async (): Promise<void> => {
    try {
        const activeAlerts = await Alert.find({ active: true })
            .populate('cropId')
            .populate('marketId');

        for (const alert of activeAlerts) {
            const latestPrice = await Price.findOne({
                cropId: alert.cropId,
                marketId: alert.marketId,
                approved: true,
            }).sort({ date: -1 });

            if (!latestPrice) continue;

            const shouldTrigger =
                (alert.direction === 'above' && latestPrice.price >= alert.targetPrice) ||
                (alert.direction === 'below' && latestPrice.price <= alert.targetPrice);

            // Don't trigger more than once per hour
            if (
                shouldTrigger &&
                (!alert.lastTriggered ||
                    Date.now() - alert.lastTriggered.getTime() > 60 * 60 * 1000)
            ) {
                const crop = alert.cropId as any;
                const market = alert.marketId as any;

                await sendPriceSMS(
                    alert.phoneNumber,
                    crop.name,
                    market.name,
                    latestPrice.price,
                    crop.unit,
                    'Alert'
                );

                alert.lastTriggered = new Date();
                await alert.save();
            }
        }
    } catch (error) {
        console.error('❌ Alert check failed:', error);
    }
};

// Send daily price summary to subscribed users
export const sendDailySummaries = async (): Promise<void> => {
    try {
        const alerts = await Alert.find({ active: true });
        const phoneNumbers = [...new Set(alerts.map((a) => a.phoneNumber))];

        for (const phone of phoneNumbers) {
            const userAlerts = alerts.filter((a) => a.phoneNumber === phone);
            let summary = 'SokoPrice Daily Summary:\n';

            for (const alert of userAlerts.slice(0, 5)) {
                const crop = await Crop.findById(alert.cropId);
                const market = await Market.findById(alert.marketId);
                const latestPrice = await Price.findOne({
                    cropId: alert.cropId,
                    marketId: alert.marketId,
                    approved: true,
                }).sort({ date: -1 });

                if (crop && market && latestPrice) {
                    summary += `${crop.name}@${market.name}: ${formatPrice(latestPrice.price)}/${crop.unit}\n`;
                }
            }

            await sendSMS(phone, summary);
        }
    } catch (error) {
        console.error('❌ Daily summary failed:', error);
    }
};

// Start scheduled jobs
export const startAlertScheduler = (): void => {
    // Check alerts every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        console.log('⏰ Running alert check...');
        checkAlerts();
    });

    // Send daily summaries at 7 AM EAT
    cron.schedule('0 7 * * *', () => {
        console.log('📊 Sending daily summaries...');
        sendDailySummaries();
    });

    console.log('✅ Alert scheduler started');
};
