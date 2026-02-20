import { Request, Response } from 'express';
import Source from '../models/Source';

export const getSources = async (_req: Request, res: Response): Promise<void> => {
    try {
        const sources = await Source.find().sort({ name: 1 });
        res.json(sources);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSource = async (req: Request, res: Response): Promise<void> => {
    try {
        const source = await Source.findById(req.params.id);
        if (!source) {
            res.status(404).json({ message: 'Source not found' });
            return;
        }
        res.json(source);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createSource = async (req: Request, res: Response): Promise<void> => {
    try {
        const source = await Source.create(req.body);
        res.status(201).json(source);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSource = async (req: Request, res: Response): Promise<void> => {
    try {
        const source = await Source.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!source) {
            res.status(404).json({ message: 'Source not found' });
            return;
        }
        res.json(source);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSourceByPhone = async (req: Request, res: Response): Promise<void> => {
    try {
        const source = await Source.findOne({ phoneNumber: req.params.phone });
        if (!source) {
            res.status(404).json({ message: 'Source not found' });
            return;
        }
        res.json(source);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
