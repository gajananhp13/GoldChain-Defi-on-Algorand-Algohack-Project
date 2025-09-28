/**
 * Enhanced Rate Limiting Middleware
 * Provides comprehensive rate limiting with different strategies for different endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { rateLimitConfigs, validateSecurityHeaders } from '../utils/validators';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

// In-memory store (in production, use Redis or similar)
const rateLimitStore: RateLimitStore = {};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 5 * 60 * 1000);

function getClientIdentifier(req: Request): string {
  // Use IP address as primary identifier
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Add user agent for additional uniqueness
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // Create a hash-like identifier
  return `${ip}-${userAgent.slice(0, 20)}`;
}

function getRateLimitKey(req: Request, configType: string): string {
  const clientId = getClientIdentifier(req);
  return `${configType}-${clientId}`;
}

function checkRateLimit(key: string, config: { windowMs: number; maxRequests: number }): boolean {
  const now = Date.now();
  const entry = rateLimitStore[key];
  
  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + config.windowMs,
      blocked: false
    };
    return true;
  }
  
  if (entry.blocked) {
    return false;
  }
  
  entry.count++;
  
  if (entry.count > config.maxRequests) {
    entry.blocked = true;
    return false;
  }
  
  return true;
}

function createRateLimitMiddleware(configType: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validate security headers first
    if (!validateSecurityHeaders(req.headers as Record<string, string>)) {
      return res.status(400).json({
        error: 'Invalid request headers',
        message: 'Request contains suspicious patterns'
      });
    }
    
    const config = rateLimitConfigs[configType];
    if (!config) {
      return res.status(500).json({
        error: 'Rate limit configuration not found',
        message: 'Internal server error'
      });
    }
    
    const key = getRateLimitKey(req, configType);
    const allowed = checkRateLimit(key, config);
    
    if (!allowed) {
      const entry = rateLimitStore[key];
      const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000);
      
      res.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': entry.resetTime.toString(),
        'Retry-After': retryAfter.toString()
      });
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${retryAfter} seconds.`,
        retryAfter
      });
    }
    
    // Add rate limit headers to successful requests
    const entry = rateLimitStore[key];
    const remaining = Math.max(0, config.maxRequests - entry.count);
    
    res.set({
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': entry.resetTime.toString()
    });
    
    next();
  };
}

// Specific rate limiters for different operations
export const walletConnectRateLimit = createRateLimitMiddleware('wallet_connect');
export const transactionRateLimit = createRateLimitMiddleware('transaction');
export const priceQueryRateLimit = createRateLimitMiddleware('price_query');
export const portfolioQueryRateLimit = createRateLimitMiddleware('portfolio_query');

// General rate limiter for all requests
export const generalRateLimit = createRateLimitMiddleware('transaction');

// Strict rate limiter for sensitive operations
export const strictRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const config = { windowMs: 60000, maxRequests: 3 }; // 3 requests per minute
  const key = getRateLimitKey(req, 'strict');
  const allowed = checkRateLimit(key, config);
  
  if (!allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many sensitive operations. Please wait before trying again.'
    });
  }
  
  next();
};

// IP-based blocking for suspicious activity
const suspiciousIPs: Set<string> = new Set();

export const ipBlockingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (suspiciousIPs.has(ip)) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Your IP address has been blocked due to suspicious activity'
    });
  }
  
  next();
};

// Function to block suspicious IP
export function blockSuspiciousIP(ip: string): void {
  suspiciousIPs.add(ip);
  
  // Auto-unblock after 1 hour
  setTimeout(() => {
    suspiciousIPs.delete(ip);
  }, 60 * 60 * 1000);
}

// Function to detect suspicious patterns
export function detectSuspiciousActivity(req: Request): boolean {
  const userAgent = req.get('User-Agent') || '';
  const path = req.path;
  
  // Check for common bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i
  ];
  
  // Check for suspicious paths
  const suspiciousPaths = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /javascript:/i, // JavaScript injection
    /eval\(/i, // Code injection
    /union\s+select/i, // SQL injection
    /drop\s+table/i, // SQL injection
  ];
  
  // Check user agent
  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      return true;
    }
  }
  
  // Check path
  for (const pattern of suspiciousPaths) {
    if (pattern.test(path)) {
      return true;
    }
  }
  
  // Check for rapid requests from same IP
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const key = `rapid-${ip}`;
  const rapidConfig = { windowMs: 10000, maxRequests: 20 }; // 20 requests in 10 seconds
  
  if (!checkRateLimit(key, rapidConfig)) {
    return true;
  }
  
  return false;
}

// Middleware to detect and block suspicious activity
export const suspiciousActivityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (detectSuspiciousActivity(req)) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    blockSuspiciousIP(ip);
    
    return res.status(403).json({
      error: 'Suspicious activity detected',
      message: 'Your request has been blocked due to suspicious patterns'
    });
  }
  
  next();
};

// Request size limiter
export const requestSizeLimit = (maxSize: number = 1024 * 1024) => { // 1MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request too large',
        message: `Request size exceeds ${maxSize} bytes`
      });
    }
    
    next();
  };
};

// CORS security headers
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'",
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  
  next();
};
