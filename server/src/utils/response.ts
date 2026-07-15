import { Response } from 'express';

export const sendSuccess = (res: Response, data: any = null, message: string = '', metadata: any = undefined, statusCode = 200) => {
  const response: any = { success: true };
  if (data) response.data = data;
  if (message) response.message = message;
  if (metadata) response.metadata = metadata;
  
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, message: string, code: string = 'INTERNAL_ERROR', details: any = null, statusCode = 500) => {
  const errorObj: any = {
    code,
    message,
    timestamp: new Date().toISOString(),
    requestId: (res as any).locals?.requestId || 'unknown',
  };
  if (details) errorObj.details = details;

  return res.status(statusCode).json({
    success: false,
    error: errorObj,
  });
};
