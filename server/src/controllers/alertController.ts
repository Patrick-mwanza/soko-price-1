import { Request, Response } from 'express';
import Alert from '../models/Alert';

export const getAlerts = async (req: any, res: Response): Promise<void> => {
    try {
        const filter: any = {};
        if (req.query.phoneNumber) filter.phoneNumber = req.query.phoneNumber;
        if (req.query.active !== undefined) filter.active = req.query.active === 'true';

        const alerts = await Alert.find(filter)
            .populate('cropId', 'name')
            .populate('marketId', 'name')
            .sort({ createdAt: -1 });

        res.json(alerts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createAlert = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phoneNumber, cropId, marketId, targetPrice, direction } = req.body;

        const alert = await Alert.create({
            phoneNumber,
            cropId,
            marketId,
            targetPrice,
            direction: direction || 'above',
        });

        await alert.populate('cropId', 'name');
        await alert.populate('marketId', 'name');

        res.status(201).json(alert);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deactivateAlert = async (req: Request, res: Response): Promise<void> => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { active: false },
            { new: true }
        );
        if (!alert) {
            res.status(404).json({ message: 'Alert not found' });
            return;
        }
        res.json({ message: 'Alert deactivated', alert });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAlert = async (req: Request, res: Response): Promise<void> => {
    try {
        const alert = await Alert.findByIdAndDelete(req.params.id);
        if (!alert) {
            res.status(404).json({ message: 'Alert not found' });
            return;
        }
        res.json({ message: 'Alert deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
