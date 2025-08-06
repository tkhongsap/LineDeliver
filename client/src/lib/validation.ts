import { z } from "zod";

// Thai and English character validation
export const thaiEnglishNameRegex = /^[\u0E00-\u0E7Fa-zA-Z\s'-]+$/;

// Thai mobile phone format validation (+66-XX-XXX-XXXX)
export const thaiPhoneRegex = /^\+66-\d{2}-\d{3}-\d{4}$/;

// LINE User ID format validation (U followed by 32 hex characters)
export const lineUserIdRegex = /^U[a-f0-9]{32}$/;

// Order number format validation (ORD-YYYY-XXX...)
export const orderNumberRegex = /^ORD-\d{4}-\d{3,}$/;

// Date format validation (YYYY-MM-DD)
export const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

// Real-time validation functions
export const validateCustomerName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Customer name is required" };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: "Customer name must be less than 100 characters" };
  }
  
  if (!thaiEnglishNameRegex.test(name)) {
    return { isValid: false, error: "Customer name must contain only Thai, English characters, spaces, hyphens, and apostrophes" };
  }
  
  return { isValid: true };
};

export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: true }; // Phone is optional
  }
  
  if (!thaiPhoneRegex.test(phone)) {
    return { isValid: false, error: "Phone number must be in format +66-XX-XXX-XXXX" };
  }
  
  return { isValid: true };
};

export const validateLineUserId = (lineUserId: string): { isValid: boolean; error?: string } => {
  if (!lineUserId || lineUserId.trim().length === 0) {
    return { isValid: false, error: "LINE User ID is required" };
  }
  
  if (!lineUserIdRegex.test(lineUserId)) {
    return { isValid: false, error: "LINE User ID must start with 'U' followed by 32 hexadecimal characters" };
  }
  
  return { isValid: true };
};

export const validateOrderNumber = (orderNumber: string): { isValid: boolean; error?: string } => {
  if (!orderNumber || orderNumber.trim().length === 0) {
    return { isValid: false, error: "Order number is required" };
  }
  
  if (!orderNumberRegex.test(orderNumber)) {
    return { isValid: false, error: "Order number must be in format ORD-YYYY-XXX" };
  }
  
  return { isValid: true };
};

export const validateDeliveryDate = (date: string): { isValid: boolean; error?: string } => {
  if (!date || date.trim().length === 0) {
    return { isValid: false, error: "Delivery date is required" };
  }
  
  if (!dateFormatRegex.test(date)) {
    return { isValid: false, error: "Delivery date must be in YYYY-MM-DD format" };
  }
  
  const deliveryDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (deliveryDate < today) {
    return { isValid: false, error: "Delivery date must be today or in the future" };
  }
  
  return { isValid: true };
};

export const validateDeliveryAddress = (address: string): { isValid: boolean; error?: string } => {
  if (!address || address.trim().length === 0) {
    return { isValid: true }; // Address is optional
  }
  
  if (address.length > 500) {
    return { isValid: false, error: "Delivery address must be less than 500 characters" };
  }
  
  return { isValid: true };
};

// Field validation hints and examples
export const validationHints = {
  customerName: {
    hint: "Enter customer name in Thai or English",
    example: "คุณสมชาย จันทร์ใส or John Smith",
    placeholder: "ชื่อลูกค้า / Customer Name"
  },
  phone: {
    hint: "Thai mobile number format",
    example: "+66-81-234-5678",
    placeholder: "+66-XX-XXX-XXXX"
  },
  lineUserId: {
    hint: "LINE User ID starting with U",
    example: "U1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6",
    placeholder: "UxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxX"
  },
  orderNumber: {
    hint: "Order number with year",
    example: "ORD-2024-0001",
    placeholder: "ORD-YYYY-XXX"
  },
  deliveryDate: {
    hint: "Select delivery date",
    example: "2024-01-22",
    placeholder: "YYYY-MM-DD"
  },
  deliveryAddress: {
    hint: "Full delivery address (optional)",
    example: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
    placeholder: "ที่อยู่จัดส่ง"
  },
  notes: {
    hint: "Additional notes (optional)",
    example: "โทรก่อนส่งของ",
    placeholder: "หมายเหตุเพิ่มเติม"
  }
};

// Comprehensive validation function for customer record
export const validateCustomerRecord = (record: any): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  const nameValidation = validateCustomerName(record.customerName);
  if (!nameValidation.isValid) {
    errors.customerName = nameValidation.error!;
  }
  
  const phoneValidation = validatePhoneNumber(record.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error!;
  }
  
  const lineUserIdValidation = validateLineUserId(record.lineUserId);
  if (!lineUserIdValidation.isValid) {
    errors.lineUserId = lineUserIdValidation.error!;
  }
  
  const orderNumberValidation = validateOrderNumber(record.orderNumber);
  if (!orderNumberValidation.isValid) {
    errors.orderNumber = orderNumberValidation.error!;
  }
  
  const deliveryDateValidation = validateDeliveryDate(record.deliveryDate);
  if (!deliveryDateValidation.isValid) {
    errors.deliveryDate = deliveryDateValidation.error!;
  }
  
  const addressValidation = validateDeliveryAddress(record.deliveryAddress);
  if (!addressValidation.isValid) {
    errors.deliveryAddress = addressValidation.error!;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Format phone number helper
export const formatPhoneNumber = (input: string): string => {
  // Remove all non-digits
  const digits = input.replace(/\D/g, '');
  
  // Handle Thai phone numbers
  if (digits.startsWith('66')) {
    const remaining = digits.slice(2);
    if (remaining.length >= 9) {
      return `+66-${remaining.slice(0, 2)}-${remaining.slice(2, 5)}-${remaining.slice(5, 9)}`;
    }
  } else if (digits.startsWith('0') && digits.length >= 10) {
    // Convert local format (0X-XXX-XXXX) to international
    const remaining = digits.slice(1);
    return `+66-${remaining.slice(0, 2)}-${remaining.slice(2, 5)}-${remaining.slice(5, 9)}`;
  }
  
  return input; // Return original if can't format
};

// Format order number helper
export const formatOrderNumber = (input: string): string => {
  const upperInput = input.toUpperCase();
  
  // If it doesn't start with ORD-, add it
  if (!upperInput.startsWith('ORD-')) {
    return `ORD-${input}`;
  }
  
  return upperInput;
};