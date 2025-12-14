/**
 * Flow-specific loggers for different parts of the application
 */

import { fileLogger } from './fileLogger';

export const authLogger = {
  info: (message: string, data?: any) => fileLogger.log('auth', 'info', message, data),
  warn: (message: string, data?: any) => fileLogger.log('auth', 'warn', message, data),
  error: (message: string, data?: any) => fileLogger.log('auth', 'error', message, data),
  debug: (message: string, data?: any) => fileLogger.log('auth', 'debug', message, data),
};

export const eventLogger = {
  info: (message: string, data?: any) => fileLogger.log('event', 'info', message, data),
  warn: (message: string, data?: any) => fileLogger.log('event', 'warn', message, data),
  error: (message: string, data?: any) => fileLogger.log('event', 'error', message, data),
  debug: (message: string, data?: any) => fileLogger.log('event', 'debug', message, data),
};

export const orderLogger = {
  info: (message: string, data?: any) => fileLogger.log('order', 'info', message, data),
  warn: (message: string, data?: any) => fileLogger.log('order', 'warn', message, data),
  error: (message: string, data?: any) => fileLogger.log('order', 'error', message, data),
  debug: (message: string, data?: any) => fileLogger.log('order', 'debug', message, data),
};

export const paymentLogger = {
  info: (message: string, data?: any) => fileLogger.log('payment', 'info', message, data),
  warn: (message: string, data?: any) => fileLogger.log('payment', 'warn', message, data),
  error: (message: string, data?: any) => fileLogger.log('payment', 'error', message, data),
  debug: (message: string, data?: any) => fileLogger.log('payment', 'debug', message, data),
};

export const apiLogger = {
  info: (message: string, data?: any) => fileLogger.log('api', 'info', message, data),
  warn: (message: string, data?: any) => fileLogger.log('api', 'warn', message, data),
  error: (message: string, data?: any) => fileLogger.log('api', 'error', message, data),
  debug: (message: string, data?: any) => fileLogger.log('api', 'debug', message, data),
};

export const generalLogger = {
  info: (message: string, data?: any) => fileLogger.log('general', 'info', message, data),
  warn: (message: string, data?: any) => fileLogger.log('general', 'warn', message, data),
  error: (message: string, data?: any) => fileLogger.log('general', 'error', message, data),
  debug: (message: string, data?: any) => fileLogger.log('general', 'debug', message, data),
};

// Helper to download logs
export const downloadFlowLogs = (flow: 'auth' | 'event' | 'order' | 'payment' | 'api' | 'general') => {
  return fileLogger.downloadLogs(flow);
};

// Helper to clear logs
export const clearFlowLogs = (flow: 'auth' | 'event' | 'order' | 'payment' | 'api' | 'general') => {
  return fileLogger.clearLogs(flow);
};
