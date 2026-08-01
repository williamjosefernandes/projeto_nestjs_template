/**
 * Validação real de CPF/CNPJ (dígito verificador mod-11), não só formato.
 * Mesma lógica replicada no frontend (`projeto_vite_template/src/lib/br-documents.ts`)
 * — os dois projetos não compartilham um pacote de tipos/validação, então a
 * duplicação aqui é intencional (algoritmo público, estável, baixo risco de
 * divergência).
 */

/** Remove tudo que não for dígito. */
function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** `true` se todos os dígitos forem iguais (000.000.000-00, 111.111.111-11...) — sempre inválido, mas passaria no checksum. */
function allSameDigit(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

export function isValidCPF(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || allSameDigit(digits)) return false;

  const calcDigit = (base: string, factorStart: number): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * (factorStart - i);
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const digit1 = calcDigit(digits.slice(0, 9), 10);
  if (digit1 !== Number(digits[9])) return false;

  const digit2 = calcDigit(digits.slice(0, 10), 11);
  return digit2 === Number(digits[10]);
}

export function isValidCNPJ(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 14 || allSameDigit(digits)) return false;

  const calcDigit = (base: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += Number(base[i]) * weights[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digit1 = calcDigit(digits.slice(0, 12), weights1);
  if (digit1 !== Number(digits[12])) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digit2 = calcDigit(digits.slice(0, 13), weights2);
  return digit2 === Number(digits[13]);
}
