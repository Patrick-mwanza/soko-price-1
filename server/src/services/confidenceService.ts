import Price from '../models/Price';
import Source from '../models/Source';
import { Types } from 'mongoose';

interface ConfidenceResult {
    score: number;
    weightedAverage: number;
    submissionCount: number;
}

export const calculateConfidence = async (
    cropId: string,
    marketId: string,
    windowHours: number = 48
): Promise<ConfidenceResult> => {
    const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);

    const recentPrices = await Price.find({
        cropId: new Types.ObjectId(cropId),
        marketId: new Types.ObjectId(marketId),
        date: { $gte: since },
    }).populate('sourceId');

    if (recentPrices.length === 0) {
        return { score: 0, weightedAverage: 0, submissionCount: 0 };
    }

    // Factor 1: Number of submissions (more = higher confidence)
    const countScore = Math.min(recentPrices.length / 5, 1) * 0.3;

    // Factor 2: Source reliability (average reliability of submitters)
    let totalReliability = 0;
    let totalWeight = 0;
    let weightedPriceSum = 0;

    for (const priceEntry of recentPrices) {
        const source = priceEntry.sourceId as any;
        const reliability = source?.reliabilityScore || 0.5;
        totalReliability += reliability;
        totalWeight += reliability;
        weightedPriceSum += priceEntry.price * reliability;
    }

    const avgReliability = totalReliability / recentPrices.length;
    const reliabilityScore = avgReliability * 0.4;

    // Factor 3: Price variance (lower variance = higher confidence)
    const prices = recentPrices.map((p) => p.price);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance =
        prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;
    const varianceScore = Math.max(1 - coefficientOfVariation, 0) * 0.3;

    const score = Math.min(countScore + reliabilityScore + varianceScore, 1);
    const weightedAverage =
        totalWeight > 0 ? weightedPriceSum / totalWeight : mean;

    return {
        score: Math.round(score * 100) / 100,
        weightedAverage: Math.round(weightedAverage),
        submissionCount: recentPrices.length,
    };
};

export const updateSourceReliability = async (
    sourceId: string
): Promise<void> => {
    const source = await Source.findById(sourceId);
    if (!source) return;

    const recentPrices = await Price.find({
        sourceId: new Types.ObjectId(sourceId),
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const approvedCount = recentPrices.filter((p) => p.approved).length;
    const total = recentPrices.length;

    if (total > 0) {
        const approvalRate = approvedCount / total;
        // Blend with existing score for smoothing
        source.reliabilityScore =
            Math.round((source.reliabilityScore * 0.3 + approvalRate * 0.7) * 100) /
            100;
        await source.save();
    }
};
