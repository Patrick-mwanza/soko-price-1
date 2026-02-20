import { Request, Response } from 'express';
import Crop from '../models/Crop';
import Market from '../models/Market';
import Price from '../models/Price';
import Source from '../models/Source';
import { t, getConfidenceLabel, formatPrice, formatDate } from '../utils/i18n';
import { sendPriceSMS } from '../services/smsService';
import { sanitizePhone } from '../middleware/validate';

// Language store (in production, use Redis or DB)
const userLanguages: Map<string, 'en' | 'sw'> = new Map();

// Crop mapping for USSD menu
const cropIndexes = ['Maize', 'Beans', 'Rice', 'Potatoes', 'Wheat', 'Tomatoes'];
const marketIndexes = ['Wakulima', 'Eldoret', 'Kisumu', 'Nakuru', 'Mombasa'];

export const handleUSSD = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId, serviceCode, phoneNumber, text } = req.body;
        const phone = sanitizePhone(phoneNumber || '');
        const lang = userLanguages.get(phone) || 'en';
        const parts = (text || '').split('*').filter((p: string) => p !== '');

        let response = '';

        if (parts.length === 0) {
            // Welcome menu
            response = `CON ${t('welcome', lang)}`;
        } else if (parts[0] === '1') {
            // CHECK PRICES FLOW
            if (parts.length === 1) {
                response = `CON ${t('selectCrop', lang)}`;
            } else if (parts.length === 2) {
                const cropIdx = parseInt(parts[1]) - 1;
                if (cropIdx >= 0 && cropIdx < cropIndexes.length) {
                    response = `CON ${t('selectMarket', lang)}`;
                } else {
                    response = `CON ${t('invalidInput', lang)}`;
                }
            } else if (parts.length === 3) {
                const cropIdx = parseInt(parts[1]) - 1;
                const marketIdx = parseInt(parts[2]) - 1;

                if (
                    cropIdx >= 0 && cropIdx < cropIndexes.length &&
                    marketIdx >= 0 && marketIdx < marketIndexes.length
                ) {
                    const cropName = cropIndexes[cropIdx];
                    const marketName = marketIndexes[marketIdx];

                    const crop = await Crop.findOne({ name: cropName });
                    const market = await Market.findOne({
                        name: { $regex: new RegExp(marketName, 'i') },
                    });

                    if (crop && market) {
                        const latestPrice = await Price.findOne({
                            cropId: crop._id,
                            marketId: market._id,
                            approved: true,
                        }).sort({ date: -1 });

                        if (latestPrice) {
                            const confidenceLabel = getConfidenceLabel(
                                latestPrice.confidenceScore,
                                lang
                            );
                            const displayName = lang === 'sw' ? crop.nameSwahili : crop.name;

                            response =
                                `CON ${displayName} — ${market.name} Market\n` +
                                `${formatPrice(latestPrice.price)} ${t('per', lang)} ${crop.unit}\n` +
                                `${t('updated', lang)}: ${formatDate(latestPrice.date)}\n` +
                                `${t('confidence', lang)}: ${confidenceLabel}` +
                                `${t('getSMS', lang)}`;
                        } else {
                            response = `END ${t('noPriceData', lang)}`;
                        }
                    } else {
                        response = `END ${t('noPriceData', lang)}`;
                    }
                } else {
                    response = `CON ${t('invalidInput', lang)}`;
                }
            } else if (parts.length === 4) {
                if (parts[3] === '1') {
                    // Send SMS copy
                    const cropIdx = parseInt(parts[1]) - 1;
                    const marketIdx = parseInt(parts[2]) - 1;
                    const cropName = cropIndexes[cropIdx];
                    const marketName = marketIndexes[marketIdx];

                    const crop = await Crop.findOne({ name: cropName });
                    const market = await Market.findOne({
                        name: { $regex: new RegExp(marketName, 'i') },
                    });

                    if (crop && market) {
                        const latestPrice = await Price.findOne({
                            cropId: crop._id,
                            marketId: market._id,
                            approved: true,
                        }).sort({ date: -1 });

                        if (latestPrice) {
                            const confidenceLabel = getConfidenceLabel(
                                latestPrice.confidenceScore,
                                lang
                            );
                            await sendPriceSMS(
                                phone,
                                crop.name,
                                market.name,
                                latestPrice.price,
                                crop.unit,
                                confidenceLabel
                            );
                            response = `END ${t('smsSent', lang)}`;
                        } else {
                            response = `END ${t('noPriceData', lang)}`;
                        }
                    } else {
                        response = `END ${t('noPriceData', lang)}`;
                    }
                } else if (parts[3] === '0') {
                    // Back to market selection
                    response = `CON ${t('selectMarket', lang)}`;
                } else {
                    response = `END ${t('invalidInput', lang)}`;
                }
            }
        } else if (parts[0] === '2') {
            // SUBMIT PRICE FLOW
            if (parts.length === 1) {
                response = `CON ${t('selectCrop', lang)}`;
            } else if (parts.length === 2) {
                const cropIdx = parseInt(parts[1]) - 1;
                if (cropIdx >= 0 && cropIdx < cropIndexes.length) {
                    response = `CON ${t('selectMarket', lang)}`;
                } else {
                    response = `CON ${t('invalidInput', lang)}`;
                }
            } else if (parts.length === 3) {
                const marketIdx = parseInt(parts[2]) - 1;
                if (marketIdx >= 0 && marketIdx < marketIndexes.length) {
                    response = `CON ${t('enterPrice', lang)}`;
                } else {
                    response = `CON ${t('invalidInput', lang)}`;
                }
            } else if (parts.length === 4) {
                const priceValue = parseInt(parts[3]);
                if (!isNaN(priceValue) && priceValue > 0) {
                    const cropName = cropIndexes[parseInt(parts[1]) - 1];
                    const marketName = marketIndexes[parseInt(parts[2]) - 1];
                    response =
                        `CON ${cropName} @ ${marketName}\n` +
                        `${formatPrice(priceValue)}\n` +
                        `${t('confirmSubmission', lang)}`;
                } else {
                    response = `CON ${t('invalidInput', lang)}`;
                }
            } else if (parts.length === 5) {
                if (parts[4] === '1') {
                    // Confirm submission
                    const cropIdx = parseInt(parts[1]) - 1;
                    const marketIdx = parseInt(parts[2]) - 1;
                    const priceValue = parseInt(parts[3]);
                    const cropName = cropIndexes[cropIdx];
                    const marketName = marketIndexes[marketIdx];

                    const crop = await Crop.findOne({ name: cropName });
                    const market = await Market.findOne({
                        name: { $regex: new RegExp(marketName, 'i') },
                    });

                    // Find or create source by phone number
                    let source = await Source.findOne({ phoneNumber: phone });
                    if (!source) {
                        source = await Source.create({
                            name: `USSD User ${phone.slice(-4)}`,
                            phoneNumber: phone,
                            role: 'Trader',
                        });
                    }

                    if (crop && market) {
                        await Price.create({
                            cropId: crop._id,
                            marketId: market._id,
                            price: priceValue,
                            sourceId: source._id,
                            approved: false,
                        });

                        source.submissionCount += 1;
                        source.lastSubmission = new Date();
                        await source.save();

                        response = `END ${t('submissionSuccess', lang)}`;
                    } else {
                        response = `END ${t('invalidInput', lang)}`;
                    }
                } else {
                    response = `END ${t('submissionCancelled', lang)}`;
                }
            }
        } else if (parts[0] === '3') {
            // LANGUAGE SELECTION
            if (parts.length === 1) {
                response = `CON ${t('selectLanguage', lang)}`;
            } else if (parts.length === 2) {
                if (parts[1] === '1') {
                    userLanguages.set(phone, 'en');
                    response = `END ${t('languageSet', 'en')}`;
                } else if (parts[1] === '2') {
                    userLanguages.set(phone, 'sw');
                    response = `END ${t('languageSet', 'sw')}`;
                } else {
                    response = `END ${t('invalidInput', lang)}`;
                }
            }
        } else {
            response = `END ${t('invalidInput', lang)}`;
        }

        // Ensure we always send a response
        if (!response) {
            response = `END ${t('invalidInput', lang)}`;
        }

        res.set('Content-Type', 'text/plain');
        res.send(response);
    } catch (error: any) {
        console.error('USSD Error:', error);
        res.set('Content-Type', 'text/plain');
        res.send('END An error occurred. Please try again.');
    }
};
