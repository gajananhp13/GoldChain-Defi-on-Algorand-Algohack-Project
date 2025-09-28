import { z } from 'zod';
import algosdk from 'algosdk';

// Enhanced amount validation
export const amountSchema = z.number().positive().max(1000000); // Max 1M tokens

export function parseAmount(input?: string) {
  const value = Number(input);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Invalid amount');
  }
  if (value > 1000000) {
    throw new Error('Amount too large');
  }
  return value;
}

// Wallet address validation
export function validateAlgorandAddress(address: string): boolean {
  try {
    return algosdk.isValidAddress(address);
  } catch {
    return false;
  }
}

export const addressSchema = z.string().refine(validateAlgorandAddress, {
  message: "Invalid Algorand address format"
});

// Transaction amount validation
export function validateTransactionAmount(amount: number, balance: number): boolean {
  if (amount <= 0) return false;
  if (amount > balance) return false;
  if (amount < 0.001) return false; // Minimum transaction amount
  return true;
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 1000); // Limit length
}

// Rate limiting validation
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  wallet_connect: { windowMs: 60000, maxRequests: 5 }, // 5 per minute
  transaction: { windowMs: 60000, maxRequests: 10 }, // 10 per minute
  price_query: { windowMs: 60000, maxRequests: 30 }, // 30 per minute
  portfolio_query: { windowMs: 60000, maxRequests: 20 }, // 20 per minute
};

// Password validation (for future use)
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number");

// Email validation
export const emailSchema = z.string().email("Invalid email format");

// Username validation
export const usernameSchema = z.string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be less than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

// Transaction validation
export interface TransactionValidation {
  isValid: boolean;
  errors: string[];
}

export function validateTransaction(
  to: string,
  amount: number,
  balance: number,
  note?: string
): TransactionValidation {
  const errors: string[] = [];
  
  // Validate recipient address
  if (!validateAlgorandAddress(to)) {
    errors.push("Invalid recipient address");
  }
  
  // Validate amount
  if (!validateTransactionAmount(amount, balance)) {
    if (amount <= 0) {
      errors.push("Amount must be positive");
    } else if (amount > balance) {
      errors.push("Insufficient balance");
    } else if (amount < 0.001) {
      errors.push("Amount too small (minimum 0.001)");
    }
  }
  
  // Validate note
  if (note && note.length > 1000) {
    errors.push("Note too long (maximum 1000 characters)");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Lending validation
export function validateLendingAmount(
  amount: number,
  balance: number,
  durationDays: number
): TransactionValidation {
  const errors: string[] = [];
  
  if (!validateTransactionAmount(amount, balance)) {
    if (amount <= 0) {
      errors.push("Lending amount must be positive");
    } else if (amount > balance) {
      errors.push("Insufficient vGold balance for lending");
    } else if (amount < 0.001) {
      errors.push("Lending amount too small (minimum 0.001)");
    }
  }
  
  if (durationDays < 1 || durationDays > 365) {
    errors.push("Lending duration must be between 1 and 365 days");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Borrowing validation
export function validateBorrowingAmount(
  amount: number,
  collateral: number,
  durationDays: number
): TransactionValidation {
  const errors: string[] = [];
  
  if (amount <= 0) {
    errors.push("Borrowing amount must be positive");
  } else if (amount < 0.001) {
    errors.push("Borrowing amount too small (minimum 0.001)");
  }
  
  if (collateral <= 0) {
    errors.push("Collateral amount must be positive");
  } else if (collateral < amount * 1.5) {
    errors.push("Insufficient collateral (minimum 150% of borrowed amount)");
  }
  
  if (durationDays < 1 || durationDays > 180) {
    errors.push("Borrowing duration must be between 1 and 180 days");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// API request validation
export function validateApiRequest(
  method: string,
  path: string,
  body?: any
): TransactionValidation {
  const errors: string[] = [];
  
  // Validate HTTP method
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  if (!allowedMethods.includes(method)) {
    errors.push("Invalid HTTP method");
  }
  
  // Validate path
  if (!path || path.length > 500) {
    errors.push("Invalid or too long path");
  }
  
  // Validate body size
  if (body && JSON.stringify(body).length > 10000) {
    errors.push("Request body too large");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Security headers validation
export function validateSecurityHeaders(headers: Record<string, string>): boolean {
  // Check for required security headers
  const requiredHeaders = ['user-agent', 'content-type'];
  
  for (const header of requiredHeaders) {
    if (!headers[header]) {
      return false;
    }
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /expression\(/i
  ];
  
  for (const [key, value] of Object.entries(headers)) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(value)) {
        return false;
      }
    }
  }
  
  return true;
}


