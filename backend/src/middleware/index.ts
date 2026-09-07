import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function requestId(req: Request, res: Response, next: NextFunction) {
  req.headers['x-request-id'] = req.headers['x-request-id'] || randomUUID();
  res.setHeader('x-request-id', req.headers['x-request-id'] as string);
  next();
}

export function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const id = req.headers['x-request-id'];
  res.on('finish', () => {
    console.log(
      JSON.stringify({
        requestId: id,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        latencyMs: Date.now() - start,
      })
    );
  });
  next();
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(JSON.stringify({ error: err.message }));
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
}
