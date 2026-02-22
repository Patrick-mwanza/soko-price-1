import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, phoneNumber, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Return existing user's token instead of error (idempotent registration)
            const token = generateToken((existingUser._id as any).toString());
            res.status(200).json({
                token,
                user: {
                    id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    role: existingUser.role,
                    language: existingUser.language,
                    phoneNumber: existingUser.phoneNumber,
                },
            });
            return;
        }

        const user = await User.create({
            name,
            email,
            password,
            phoneNumber,
            role: role || 'Farmer',
        });

        const token = generateToken((user._id as any).toString());

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                language: user.language,
                phoneNumber: user.phoneNumber,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Please provide email and password' });
            return;
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = generateToken((user._id as any).toString());

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                language: user.language,
                phoneNumber: user.phoneNumber,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            user: {
                id: user?._id,
                name: user?.name,
                email: user?.email,
                role: user?.role,
                language: user?.language,
                phoneNumber: user?.phoneNumber,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
