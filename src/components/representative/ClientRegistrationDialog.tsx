import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, User, Phone, Mail, FileText } from 'lucide-react';
import { useCreateClient } from '@/hooks/useRepresentative';
import { useToast } from '@/hooks/use-toast';

interface ClientRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  representativeId: string;
}

interface ClientFormData {
  company_name: string;
  contact_name: string;
  contact_function: string;
  cnpj_cpf: string;
  phone: string;
  email: string;
}

const contactFunctions = [
  'Proprietário',
  'Gerente',
  'Coordenador',
  'Diretor',
  'Comprador',
  'Outro'
];

export function ClientRegistrationDialog({ open, onOpenChange, representativeId }: ClientRegistrationDialogProps) {
  const { toast } = useToast();
  const createClient = useCreateClient();

  const [formData, setFormData] = useState<ClientFormData>({
    company_name: '',
    contact_name: '',
    contact_function: '',
    cnpj_cpf: '',
    phone: '',
    email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCNPJ = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 14 digits
    const limitedDigits = digits.slice(0, 14);
    
    // Apply CNPJ format: XX.XXX.XXX/XXXX-XX
    if (limitedDigits.length <= 2) {
      return limitedDigits;
    } else if (limitedDigits.length <= 5) {
      return `${limitedDigits.slice(0, 2)}.${limitedDigits.slice(2)}`;
    } else if (limitedDigits.length <= 8) {
      return `${limitedDigits.slice(0, 2)}.${limitedDigits.slice(2, 5)}.${limitedDigits.slice(5)}`;
    } else if (limitedDigits.length <= 12) {
      return `${limitedDigits.slice(0, 2)}.${limitedDigits.slice(2, 5)}.${limitedDigits.slice(5, 8)}/${limitedDigits.slice(8)}`;
    } else {
      return `${limitedDigits.slice(0, 2)}.${limitedDigits.slice(2, 5)}.${limitedDigits.slice(5, 8)}/${limitedDigits.slice(8, 12)}-${limitedDigits.slice(12)}`;
    }
  };

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 11 digits
    const limitedDigits = digits.slice(0, 11);
    
    // Apply phone format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    if (limitedDigits.length <= 2) {
      return limitedDigits;
    } else if (limitedDigits.length <= 7) {
      return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2)}`;
    } else if (limitedDigits.length <= 10) {
      return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2, 6)}-${limitedDigits.slice(6)}`;
    } else {
      return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2, 7)}-${limitedDigits.slice(7)}`;
    }
  };

  const validateForm = () => {
    if (!formData.company_name.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome da empresa é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.contact_name.trim()) {
      toast({
        title: "Erro de validação",
        description: "Nome do contato é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.contact_function) {
      toast({
        title: "Erro de validação",
        description: "Função do contato é obrigatória",
        variant: "destructive"
      });
      return false;
    }

    if (formData.email && !formData.email.includes('@')) {
      toast({
        title: "Erro de validação",
        description: "E-mail deve ter um formato válido",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createClient.mutateAsync({
        representative_id: representativeId,
        company_name: formData.company_name.trim(),
        contact_name: formData.contact_name.trim(),
        contact_function: formData.contact_function,
        cnpj_cpf: formData.cnpj_cpf || undefined,
        phone: formData.phone || undefined,
        email: formData.email.trim() || undefined,
        credit_limit: 0
      });

      toast({
        title: "Cliente cadastrado",
        description: "Cliente foi cadastrado com sucesso!",
        variant: "default"
      });

      // Reset form and close dialog
      setFormData({
        company_name: '',
        contact_name: '',
        contact_function: '',
        cnpj_cpf: '',
        phone: '',
        email: ''
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao cadastrar o cliente. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha as informações do cliente para cadastrá-lo no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company_name" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Nome da Empresa *
            </Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="Ex: AgroTech Ltda"
              required
            />
          </div>

          {/* Nome do Contato */}
          <div className="space-y-2">
            <Label htmlFor="contact_name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome do Contato *
            </Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => handleInputChange('contact_name', e.target.value)}
              placeholder="Ex: João Silva"
              required
            />
          </div>

          {/* Função do Contato */}
          <div className="space-y-2">
            <Label htmlFor="contact_function" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Função do Contato *
            </Label>
            <Select value={formData.contact_function} onValueChange={(value) => handleInputChange('contact_function', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                {contactFunctions.map((func) => (
                  <SelectItem key={func} value={func}>
                    {func}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CNPJ */}
          <div className="space-y-2">
            <Label htmlFor="cnpj_cpf">CNPJ</Label>
            <Input
              id="cnpj_cpf"
              value={formData.cnpj_cpf}
              onChange={(e) => handleInputChange('cnpj_cpf', formatCNPJ(e.target.value))}
              placeholder="XX.XXX.XXX/XXXX-XX"
              maxLength={18}
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefone
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
              placeholder="(XX) XXXXX-XXXX"
              maxLength={15}
            />
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="contato@empresa.com"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Cliente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}