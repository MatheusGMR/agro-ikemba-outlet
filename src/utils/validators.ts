/**
 * Validações específicas para dados brasileiros
 */

// Lista de UFs válidas
export const VALID_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

/**
 * Valida CNPJ brasileiro
 */
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;
  
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  // Validação dos dígitos verificadores
  let soma = 0;
  const multiplicadores1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cleanCNPJ[i]) * multiplicadores1[i];
  }
  
  let resto = soma % 11;
  const digitoVerificador1 = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(cleanCNPJ[12]) !== digitoVerificador1) return false;
  
  soma = 0;
  const multiplicadores2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cleanCNPJ[i]) * multiplicadores2[i];
  }
  
  resto = soma % 11;
  const digitoVerificador2 = resto < 2 ? 0 : 11 - resto;
  
  return parseInt(cleanCNPJ[13]) === digitoVerificador2;
}

/**
 * Valida telefone brasileiro
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Aceita telefones com 10 ou 11 dígitos (com DDD)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
  
  // Verifica se começa com DDD válido (11-99)
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  
  return true;
}

/**
 * Valida UF brasileira
 */
export function validateUF(uf: string): boolean {
  return VALID_UFS.includes(uf.toUpperCase());
}

/**
 * Valida email
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formata CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  return cleanCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Formata telefone brasileiro
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Valida volume numérico
 */
export function validateVolume(volume: string): boolean {
  if (!volume.trim()) return false;
  
  // Remove caracteres não numéricos, exceto ponto e vírgula
  const cleanVolume = volume.replace(/[^\d.,]/g, '');
  
  // Substitui vírgula por ponto
  const normalizedVolume = cleanVolume.replace(',', '.');
  
  const num = parseFloat(normalizedVolume);
  return !isNaN(num) && num > 0;
}

/**
 * Formata volume para exibição
 */
export function formatVolume(volume: string): string {
  const cleanVolume = volume.replace(/[^\d.,]/g, '');
  const normalizedVolume = cleanVolume.replace(',', '.');
  const num = parseFloat(normalizedVolume);
  
  if (isNaN(num)) return volume;
  
  return new Intl.NumberFormat('pt-BR').format(num);
}