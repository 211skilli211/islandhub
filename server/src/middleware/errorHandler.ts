import { Request, Response, NextFunction } from 'express';

// Custom error classes
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', code?: string, details?: any) {
    super(message, 400, code || 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(message, 401, code || 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code?: string) {
    super(message, 403, code || 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(message, 404, code || 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', code?: string) {
    super(message, 409, code || 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', code?: string) {
    super(message, 429, code || 'RATE_LIMIT');
  }
}

export class InternalError extends AppError {
  constructor(message: string = 'Internal server error', code?: string) {
    super(message, 500, code || 'INTERNAL_ERROR');
    this.isOperational = false;
  }
}

// Standardized response helper
export const sendSuccess = (
  res: Response,
  data: any = null,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
) => {
  const response: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (code) response.code = code;
  if (details) response.details = details;

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    response.stack = new Error().stack;
  }

  return res.status(statusCode).json(response);
};

// Central error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle operational errors (expected errors)
  if (err instanceof AppError) {
    if (err.isOperational) {
      return sendError(res, err.message, err.statusCode, err.code, err.details);
    }
  }

  // Log unexpected errors
  console.error('Unexpected Error:', err);
  console.error('Stack:', err.stack);

  // Send generic error response for unexpected errors
  return sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    500,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  );
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      timestamp: new Date().toISOString(),
    };
    
    if (res.statusCode >= 400) {
      console.error('Request Error:', logData);
    } else {
      console.log('Request:', logData);
    }
  });
  
  next();
};
