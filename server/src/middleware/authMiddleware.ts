import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
    id: number;
    role: string;
}

declare global {
    namespace Express {
        interface User extends UserPayload { }
    }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
            if (err) {
                return res.sendStatus(401);
            }

            req.user = user as UserPayload;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
            if (!err) {
                req.user = user as UserPayload;
            }
            next();
        });
    } else {
        next();
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super-admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Requires admin role' });
    }
};
export const isVendor = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Requires vendor role' });
    }
};

export const isDriver = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && (req.user.role === 'driver' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Requires driver role' });
    }
};
