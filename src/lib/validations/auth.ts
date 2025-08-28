
import { z } from 'zod';

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

export const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(11, 'Telefone deve ter pelo menos 11 dígitos').regex(phoneRegex, 'Formato: (XX) XXXXX-XXXX'),
  company: z.string().min(1, 'Empresa é obrigatória'),
  tipo: z.string().min(1, 'Selecione uma opção'),
  conheceu: z.string().optional(),
  emailOrPhone: z.string().refine((value) => {
    // Verifica se é um email válido ou um telefone válido
    const isEmail = z.string().email().safeParse(value).success;
    const isPhone = phoneRegex.test(value);
    return isEmail || isPhone;
  }, {
    message: "Informe um email válido ou telefone no formato (XX) XXXXX-XXXX"
  }),
  cnpj: z.string().optional().refine((cnpj) => {
    // If CNPJ is provided, it must match the format
    if (cnpj && cnpj.trim() !== '') {
      return cnpjRegex.test(cnpj);
    }
    return true;
  }, {
    message: "CNPJ deve seguir o formato XX.XXX.XXX/XXXX-XX",
  }),
});
