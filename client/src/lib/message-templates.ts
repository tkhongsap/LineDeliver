import type { CustomerRecord } from "@shared/customer-schema";

// LINE message template variables
export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  description: string;
}

// Predefined message templates for deliveries
export const messageTemplates: MessageTemplate[] = [
  {
    id: "delivery-confirmation",
    name: "Delivery Confirmation",
    content: "สวัสดีครับ/ค่ะ คุณ[ชื่อลูกค้า]\n\nยืนยันการจัดส่งสินค้า\nหมายเลขออเดอร์: [หมายเลขออเดอร์]\nวันที่จัดส่ง: [วันที่จัดส่ง]\nที่อยู่จัดส่ง: [ที่อยู่จัดส่ง]\n\nกรุณายืนยันการรับสินค้า หรือติดต่อเราหากต้องการเปลี่ยนแปลงกำหนดการจัดส่ง\n\nขอบคุณครับ/ค่ะ\nทีมบริการลูกค้า",
    variables: ["ชื่อลูกค้า", "หมายเลขออเดอร์", "วันที่จัดส่ง", "ที่อยู่จัดส่ง"],
    description: "Standard delivery confirmation message with customer details"
  },
  {
    id: "delivery-reminder",
    name: "Delivery Reminder",
    content: "สวัสดีครับ/ค่ะ คุณ[ชื่อลูกค้า]\n\nเตือนความจำ: การจัดส่งสินค้า\nหมายเลขออเดอร์: [หมายเลขออเดอร์]\nกำหนดจัดส่ง: [วันที่จัดส่ง]\n\nเราจะจัดส่งสินค้าไปยัง: [ที่อยู่จัดส่ง]\n\nกรุณาเตรียมรับสินค้า และติดต่อเราหากมีข้อสงสัยใดๆ\n\nขอบคุณครับ/ค่ะ\nทีมบริการลูกค้า",
    variables: ["ชื่อลูกค้า", "หมายเลขออเดอร์", "วันที่จัดส่ง", "ที่อยู่จัดส่ง"],
    description: "Delivery reminder message sent before delivery date"
  },
  {
    id: "delivery-reschedule",
    name: "Delivery Reschedule Request",
    content: "สวัสดีครับ/ค่ะ คุณ[ชื่อลูกค้า]\n\nขอเปลี่ยนกำหนดการจัดส่งสินค้า\nหมายเลขออเดอร์: [หมายเลขออเดอร์]\nวันที่กำหนดเดิม: [วันที่จัดส่ง]\n\nกรุณาแจ้งวันที่ใหม่ที่ต้องการให้จัดส่ง เราจะประสานงานให้ตามความเหมาะสม\n\nขอบคุณครับ/ค่ะ\nทีมบริการลูกค้า",
    variables: ["ชื่อลูกค้า", "หมายเลขออเดอร์", "วันที่จัดส่ง"],
    description: "Request customer to reschedule delivery date"
  }
];

// Template variable definitions
export const templateVariables = {
  "ชื่อลูกค้า": {
    key: "customerName",
    description: "Customer's full name",
    example: "สมชาย สุขใจ"
  },
  "หมายเลขออเดอร์": {
    key: "orderNumber",
    description: "Order number",
    example: "ORD-2024-0001"
  },
  "วันที่จัดส่ง": {
    key: "deliveryDate",
    description: "Delivery date",
    example: "22 มกราคม 2567"
  },
  "ที่อยู่จัดส่ง": {
    key: "deliveryAddress",
    description: "Delivery address",
    example: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
  }
};

// Format delivery date to Thai format
export function formatDeliveryDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Bangkok'
  };
  
  return date.toLocaleDateString('th-TH', options);
}

// Replace template variables with customer data
export function substituteTemplateVariables(
  template: string,
  customer: CustomerRecord
): string {
  let message = template;
  
  // Replace each variable with corresponding customer data
  const replacements: Record<string, string> = {
    "[ชื่อลูกค้า]": customer.customerName,
    "[หมายเลขออเดอร์]": customer.orderNumber,
    "[วันที่จัดส่ง]": formatDeliveryDate(customer.deliveryDate),
    "[ที่อยู่จัดส่ง]": customer.deliveryAddress || "ที่อยู่ไม่ระบุ"
  };
  
  Object.entries(replacements).forEach(([variable, value]) => {
    message = message.replace(new RegExp(escapeRegExp(variable), 'g'), value);
  });
  
  return message;
}

// Escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Generate preview message for a customer
export function generateMessagePreview(
  template: MessageTemplate,
  customer: CustomerRecord
): string {
  return substituteTemplateVariables(template.content, customer);
}

// Get available variables for a template
export function getTemplateVariables(templateContent: string): string[] {
  const variableRegex = /\[([^\]]+)\]/g;
  const variables: string[] = [];
  let match;
  
  while ((match = variableRegex.exec(templateContent)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
}

// Validate if all required variables can be substituted
export function validateTemplateForCustomer(
  template: MessageTemplate,
  customer: CustomerRecord
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  if (template.variables.includes("ชื่อลูกค้า") && !customer.customerName) {
    missingFields.push("Customer Name");
  }
  
  if (template.variables.includes("หมายเลขออเดอร์") && !customer.orderNumber) {
    missingFields.push("Order Number");
  }
  
  if (template.variables.includes("วันที่จัดส่ง") && !customer.deliveryDate) {
    missingFields.push("Delivery Date");
  }
  
  if (template.variables.includes("ที่อยู่จัดส่ง") && !customer.deliveryAddress) {
    missingFields.push("Delivery Address");
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}