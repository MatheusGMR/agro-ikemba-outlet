import { userService } from './userService';
import { supabase } from '@/integrations/supabase/client';
import type { UnifiedRegistrationData } from '@/components/auth/UnifiedRegistrationForm';

export interface RegistrationOptions {
  context?: 'main' | 'authgate' | 'preregistration';
  sendEmail?: boolean;
}

/**
 * Unified registration service that handles all customer registration flows
 */
export class RegistrationService {
  /**
   * Register a new user with unified validation and processing
   */
  static async registerUser(
    data: UnifiedRegistrationData, 
    options: RegistrationOptions = {}
  ): Promise<{ success: boolean; error?: string }> {
    const { context = 'main', sendEmail = true } = options;

    try {
      console.log('=== UNIFIED REGISTRATION START ===');
      console.log('Context:', context);
      console.log('Data:', data);

      // Step 1: Check if email already exists
      const { exists, error: checkError } = await userService.checkEmailExists(data.email);
      if (checkError) {
        throw new Error(`Erro ao verificar email: ${checkError}`);
      }
      
      if (exists) {
        return { success: false, error: 'Este email já está cadastrado' };
      }

      // Step 2: Add user to database
      const { success, error: userError } = await userService.addUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        tipo: data.tipo,
        cnpj: data.cnpj || undefined,
        conheceu: data.conheceu || undefined,
      });

      if (!success || userError) {
        throw new Error(`Erro ao salvar cadastro: ${userError}`);
      }

      // Step 3: Send registration email (non-critical)
      if (sendEmail) {
        await this.sendRegistrationEmail(data, context);
      }

      console.log('=== UNIFIED REGISTRATION SUCCESS ===');
      return { success: true };

    } catch (error) {
      console.error('Unified registration error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Send registration email based on context
   */
  private static async sendRegistrationEmail(
    data: UnifiedRegistrationData, 
    context: string
  ): Promise<void> {
    try {
      const emailFunction = context === 'preregistration' ? 'send-pre-registration' : 'send-registration';
      
      const { data: emailResult, error: emailError } = await supabase.functions.invoke(emailFunction, {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          tipo: data.tipo,
          cnpj: data.cnpj || undefined,
          conheceu: data.conheceu || undefined,
        }
      });

      if (emailError) {
        console.warn('Warning: Email sending error:', emailError);
      } else if (emailResult?.success) {
        console.log('Registration emails sent successfully');
      } else {
        console.warn('Warning: Email sending failed:', emailResult);
      }
    } catch (emailError) {
      console.warn('Warning: Unexpected email error:', emailError);
      // Non-critical - don't throw
    }
  }

  /**
   * Validate registration data
   */
  static validateRegistrationData(data: Partial<UnifiedRegistrationData>): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!data.tipo) {
      errors.push('Selecione o tipo de conta');
    }

    if (!data.company) {
      errors.push('Nome da empresa é obrigatório');
    }

    if (!data.phone || data.phone.length < 11) {
      errors.push('Telefone deve ter pelo menos 11 dígitos');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email inválido');
    }

    return errors;
  }

  /**
   * Get contextual success messages
   */
  static getSuccessMessage(context: string): string {
    switch (context) {
      case 'preregistration':
        return 'Pré-cadastro enviado com sucesso! Entraremos em contato em breve via WhatsApp.';
      case 'authgate':
        return 'Cadastro realizado com sucesso! Sua solicitação foi enviada para análise.';
      default:
        return 'Cadastro realizado com sucesso! Sua solicitação foi enviada para análise.';
    }
  }
}