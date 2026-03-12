import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// GET /api/users — List all users (admin only)
export const getUsers = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { role, search } = req.query;
        const filter: any = {};
        if (role && role !== 'all') filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

// DELETE /api/users/:id — Delete a user (admin only, cannot delete self)
export const deleteUser = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (req.user && req.user._id.toString() === id) {
            res.status(400).json({ message: 'Cannot delete your own account' });
            return;
        }

        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        await User.findByIdAndDelete(id);
        res.json({ message: `User "${user.name}" deleted successfully` });
    } catch (error) {
        console.error('Failed to delete user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

// DELETE /api/users/bulk — Delete multiple users by role (admin only)
export const bulkDeleteUsers = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { roles } = req.body; // e.g. ['Buyer', 'Trader', 'Seller', 'NGO']

        if (!roles || !Array.isArray(roles) || roles.length === 0) {
            res.status(400).json({ message: 'Provide an array of roles to delete' });
            return;
        }

        // Never allow deleting Admin users via bulk
        const safeRoles = roles.filter((r: string) => r !== 'Admin');
        if (safeRoles.length === 0) {
            res.status(400).json({ message: 'Cannot bulk-delete Admin users' });
            return;
        }

        const result = await User.deleteMany({ role: { $in: safeRoles } });
        res.json({ message: `Deleted ${result.deletedCount} user(s) with roles: ${safeRoles.join(', ')}` });
    } catch (error) {
        console.error('Failed to bulk delete users:', error);
        res.status(500).json({ message: 'Failed to bulk delete users' });
    }
};
