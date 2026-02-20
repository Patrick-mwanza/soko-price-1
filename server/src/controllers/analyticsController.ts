import { Request, Response } from 'express';
import Price from '../models/Price';
import User from '../models/User';
import Source from '../models/Source';
import Market from '../models/Market';
import Crop from '../models/Crop';

export const getOverviewStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            activeMarkets,
            pricesToday,
            pendingApprovals,
            totalCrops,
            totalSources,
        ] = await Promise.all([
            User.countDocuments(),
            Market.countDocuments({ active: true }),
            Price.countDocuments({ date: { $gte: today } }),
            Price.countDocuments({ approved: false }),
            Crop.countDocuments(),
            Source.countDocuments({ status: 'active' }),
        ]);

        res.json({
            totalUsers,
            activeMarkets,
            pricesToday,
            pendingApprovals,
            totalCrops,
            totalSources,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPriceTrends = async (req: Request, res: Response): Promise<void> => {
    try {
        const { days = 30, cropId, marketId } = req.query;
        const since = new Date();
        since.setDate(since.getDate() - Number(days));

        const match: any = {
            approved: true,
            date: { $gte: since },
        };
        if (cropId) match.cropId = cropId;
        if (marketId) match.marketId = marketId;

        const trends = await Price.aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                        cropId: '$cropId',
                        marketId: '$marketId',
                    },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.date': 1 } },
        ]);

        // Populate crop and market names
        const populated = await Promise.all(
            trends.map(async (t) => {
                const crop = await Crop.findById(t._id.cropId).select('name');
                const market = await Market.findById(t._id.marketId).select('name');
                return {
                    date: t._id.date,
                    crop: crop?.name || 'Unknown',
                    market: market?.name || 'Unknown',
                    avgPrice: Math.round(t.avgPrice),
                    minPrice: t.minPrice,
                    maxPrice: t.maxPrice,
                    submissions: t.count,
                };
            })
        );

        res.json(populated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMarketComparison = async (req: Request, res: Response): Promise<void> => {
    try {
        const { cropId } = req.query;
        if (!cropId) {
            res.status(400).json({ message: 'cropId is required' });
            return;
        }

        const markets = await Market.find({ active: true });
        const comparisons = await Promise.all(
            markets.map(async (market) => {
                const latestPrice = await Price.findOne({
                    cropId,
                    marketId: market._id,
                    approved: true,
                }).sort({ date: -1 });

                return {
                    market: market.name,
                    county: market.county,
                    price: latestPrice?.price || null,
                    date: latestPrice?.date || null,
                    confidence: latestPrice?.confidenceScore || null,
                };
            })
        );

        res.json(comparisons.filter((c) => c.price !== null));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
