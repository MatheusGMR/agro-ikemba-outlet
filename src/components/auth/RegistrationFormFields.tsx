import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Building, Users, MessageSquare, Phone } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface RegistrationFormFieldsProps {
  form: UseFormReturn<any>;
  formatCNPJ: (value: string) => string;
}

export function RegistrationFormFields({ form, formatCNPJ }: RegistrationFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Completo *</FormLabel>
            <FormControl>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Seu nome completo" className="pl-10" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="seu@email.com" type="email" className="pl-10" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone *</FormLabel>
            <FormControl>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="(43) 99999-9999" className="pl-10" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="company"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Empresa *</FormLabel>
            <FormControl>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Nome da sua empresa" className="pl-10" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cnpj"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CNPJ (opcional)</FormLabel>
            <FormControl>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  className="pl-10"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatCNPJ(e.target.value);
                    field.onChange(formatted);
                  }}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
        <p className="text-blue-800">
          ℹ️ O CNPJ não é obrigatório para o cadastro, mas será necessário para validação e aprovação da conta.
        </p>
      </div>

      <FormField
        control={form.control}
        name="tipo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Você é: *</FormLabel>
            <FormControl>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Distribuidor">Distribuidor</SelectItem>
                    <SelectItem value="Cooperativa">Cooperativa</SelectItem>
                    <SelectItem value="Fabricante">Fabricante</SelectItem>
                    <SelectItem value="Agricultor">Agricultor</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="conheceu"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Como conheceu a Agro Ikemba?</FormLabel>
            <FormControl>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Linkedin">Linkedin</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Evento">Evento</SelectItem>
                    <SelectItem value="FarmNews">FarmNews</SelectItem>
                    <SelectItem value="AgroLend">AgroLend</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    </>
  );
}