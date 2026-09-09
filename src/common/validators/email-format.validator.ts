const FORMATO_DE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailFormatValid(email: string): boolean {
  return FORMATO_DE_EMAIL.test(email.trim());
  }
  
