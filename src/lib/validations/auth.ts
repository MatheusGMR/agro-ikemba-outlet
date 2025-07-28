
import { z } from 'zod';

const corporateEmailDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'icloud.com'];

const isCorporateEmail = (email: string) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && !corporateEmailDomains.includes(domain);
};

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

export const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  company: z.string().min(1, 'Empresa é obrigatória'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  tipo: z.string().min(1, 'Selecione uma opção'),
  conheceu: z.string().optional(),
  cnpj: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
}).refine((data) => {
  // CNPJ is required ONLY for non-corporate emails (gmail, hotmail, etc.)
  if (!isCorporateEmail(data.email)) {
    return data.cnpj && cnpjRegex.test(data.cnpj);
  }
  // For corporate emails, CNPJ is not required
  return true;
}, {
  message: "CNPJ é obrigatório para emails não corporativos (Gmail, Hotmail, Outlook, etc.) e deve seguir o formato XX.XXX.XXX/XXXX-XX",
  path: ["cnpj"],
});
