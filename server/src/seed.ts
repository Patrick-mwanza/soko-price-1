import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { env } from './config/env';
import Crop from './models/Crop';
import Market from './models/Market';
import Price from './models/Price';
import Source from './models/Source';
import User from './models/User';

const crops = [
    { name: 'Maize', nameSwahili: 'Mahindi', unit: '90kg bag', category: 'cereals' },
    { name: 'Beans', nameSwahili: 'Maharage', unit: '90kg bag', category: 'legumes' },
    { name: 'Rice', nameSwahili: 'Mchele', unit: '50kg bag', category: 'cereals' },
    { name: 'Potatoes', nameSwahili: 'Viazi', unit: '110kg bag', category: 'tubers' },
    { name: 'Wheat', nameSwahili: 'Ngano', unit: '90kg bag', category: 'cereals' },
    { name: 'Tomatoes', nameSwahili: 'Nyanya', unit: 'crate (64kg)', category: 'vegetables' },
];

const markets = [
    { name: 'Wakulima Market', county: 'Nairobi', region: 'Central' },
    { name: 'Eldoret Market', county: 'Uasin Gishu', region: 'Rift Valley' },
    { name: 'Kisumu Market', county: 'Kisumu', region: 'Nyanza' },
    { name: 'Nakuru Market', county: 'Nakuru', region: 'Rift Valley' },
    { name: 'Mombasa Market', county: 'Mombasa', region: 'Coast' },
];

const sources = [
    { name: 'John Kamau', phoneNumber: '+254711000001', role: 'Trader' as const, reliabilityScore: 0.85 },
    { name: 'Mary Wanjiku', phoneNumber: '+254711000002', role: 'Official' as const, reliabilityScore: 0.95 },
    { name: 'Peter Ochieng', phoneNumber: '+254711000003', role: 'Enumerator' as const, reliabilityScore: 0.78 },
    { name: 'Grace Muthoni', phoneNumber: '+254711000004', role: 'Trader' as const, reliabilityScore: 0.88 },
];

// Price data for the last 30 days
const generatePriceData = (cropIds: any[], marketIds: any[], sourceIds: any[]) => {
    const prices: any[] = [];
    const basePrices: Record<string, number> = {};

    // Set base prices per crop
    cropIds.forEach((crop: any, idx: number) => {
        const bases = [3500, 8000, 6500, 2800, 4200, 5500];
        basePrices[crop._id.toString()] = bases[idx] || 3000;
    });

    for (let day = 30; day >= 0; day--) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        date.setHours(9, 30, 0, 0);

        for (const crop of cropIds) {
            for (const market of marketIds) {
                const basePrice = basePrices[crop._id.toString()];
                // Add some random variation (+/- 15%)
                const variation = (Math.random() - 0.5) * 0.3;
                const price = Math.round(basePrice * (1 + variation));
                const source = sourceIds[Math.floor(Math.random() * sourceIds.length)];

                prices.push({
                    cropId: crop._id,
                    marketId: market._id,
                    price,
                    date,
                    confidenceScore: 0.6 + Math.random() * 0.35,
                    approved: day > 0, // Today's prices are pending
                    sourceId: source._id,
                });
            }
        }
    }

    return prices;
};

const seed = async () => {
    try {
        await connectDB();
        console.log('🌱 Starting database seed...');

        // Clear existing data
        await Promise.all([
            Crop.deleteMany({}),
            Market.deleteMany({}),
            Price.deleteMany({}),
            Source.deleteMany({}),
            User.deleteMany({}),
        ]);
        console.log('🗑️  Cleared existing data');

        // Seed crops
        const createdCrops = await Crop.insertMany(crops);
        console.log(`🌽 Seeded ${createdCrops.length} crops`);

        // Seed markets
        const createdMarkets = await Market.insertMany(markets);
        console.log(`🏪 Seeded ${createdMarkets.length} markets`);

        // Seed sources
        const createdSources = await Source.insertMany(sources);
        console.log(`👤 Seeded ${createdSources.length} sources`);

        // Seed prices (30 days of historical data)
        const priceData = generatePriceData(createdCrops, createdMarkets, createdSources);
        await Price.insertMany(priceData);
        console.log(`💰 Seeded ${priceData.length} price entries`);

        // Seed admin user
        await User.create({
            name: 'SokoPrice Admin',
            email: env.ADMIN_EMAIL,
            password: env.ADMIN_PASSWORD,
            phoneNumber: env.ADMIN_PHONE,
            role: 'Admin',
        });

        // Seed demo buyer
        await User.create({
            name: 'Demo Buyer',
            email: 'buyer@sokoprice.co.ke',
            password: 'Buyer@123456',
            phoneNumber: '+254700000001',
            role: 'Buyer',
        });

        console.log('👤 Seeded admin and buyer users');
        console.log('✅ Database seeded successfully!');
        console.log('\n📋 Login credentials:');
        console.log(`   Admin: ${env.ADMIN_EMAIL} / ${env.ADMIN_PASSWORD}`);
        console.log('   Buyer: buyer@sokoprice.co.ke / Buyer@123456');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seed();
