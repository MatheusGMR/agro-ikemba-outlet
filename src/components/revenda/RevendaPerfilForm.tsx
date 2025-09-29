import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentRevenda, useUpsertRevenda } from '@/hooks/useRevenda';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const revendaSchema = z.object({
  razao_social: z.string().min(1, 'Razão social é obrigatória'),
  cnpj: z.string().min(14, 'CNPJ deve ter 14 dígitos'),
  endereco_completo: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(2, 'Estado é obrigatório'),
  cep: z.string().min(8, 'CEP deve ter 8 dígitos'),
  telefone_comercial: z.string().optional(),
  email_comercial: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(),
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  tipo_conta: z.string().optional(),
  chave_pix: z.string().optional(),
  volume_minimo_compra: z.number().min(0, 'Volume mínimo deve ser positivo'),
  regioes_atuacao: z.string(),
  tipos_produto_interesse: z.string(),
});

type RevendaFormData = z.infer<typeof revendaSchema>;

export default function RevendaPerfilForm() {
  const { data: revenda } = useCurrentRevenda();
  const { mutate: upsertRevenda, isPending } = useUpsertRevenda();

  const form = useForm<RevendaFormData>({
    resolver: zodResolver(revendaSchema),
    defaultValues: {
      razao_social: revenda?.razao_social || '',
      cnpj: revenda?.cnpj || '',
      endereco_completo: revenda?.endereco_completo || '',
      cidade: revenda?.cidade || '',
      estado: revenda?.estado || '',
      cep: revenda?.cep || '',
      telefone_comercial: revenda?.telefone_comercial || '',
      email_comercial: revenda?.email_comercial || '',
      website: revenda?.website || '',
      banco: revenda?.banco || '',
      agencia: revenda?.agencia || '',
      conta: revenda?.conta || '',
      tipo_conta: revenda?.tipo_conta || 'corrente',
      chave_pix: revenda?.chave_pix || '',
      volume_minimo_compra: revenda?.volume_minimo_compra || 0,
      regioes_atuacao: revenda?.regioes_atuacao?.join(', ') || '',
      tipos_produto_interesse: revenda?.tipos_produto_interesse?.join(', ') || '',
    },
  });

  const onSubmit = (data: RevendaFormData) => {
    upsertRevenda({
      ...data,
      regioes_atuacao: data.regioes_atuacao.split(',').map(r => r.trim()).filter(Boolean),
      tipos_produto_interesse: data.tipos_produto_interesse.split(',').map(t => t.trim()).filter(Boolean),
      status: 'active',
    } as any);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="razao_social">Razão Social *</Label>
              <Input
                id="razao_social"
                {...form.register('razao_social')}
                placeholder="Nome da empresa"
              />
              {form.formState.errors.razao_social && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.razao_social.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                {...form.register('cnpj')}
                placeholder="00.000.000/0000-00"
              />
              {form.formState.errors.cnpj && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.cnpj.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco_completo">Endereço Completo *</Label>
            <Textarea
              id="endereco_completo"
              {...form.register('endereco_completo')}
              placeholder="Rua, número, bairro..."
              rows={3}
            />
            {form.formState.errors.endereco_completo && (
              <p className="text-sm text-destructive">
                {form.formState.errors.endereco_completo.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                {...form.register('cidade')}
                placeholder="Cidade"
              />
              {form.formState.errors.cidade && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.cidade.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Input
                id="estado"
                {...form.register('estado')}
                placeholder="UF"
                maxLength={2}
              />
              {form.formState.errors.estado && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.estado.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                {...form.register('cep')}
                placeholder="00000-000"
              />
              {form.formState.errors.cep && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.cep.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contatos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefone_comercial">Telefone Comercial</Label>
              <Input
                id="telefone_comercial"
                {...form.register('telefone_comercial')}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_comercial">E-mail Comercial</Label>
              <Input
                id="email_comercial"
                type="email"
                {...form.register('email_comercial')}
                placeholder="contato@empresa.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...form.register('website')}
              placeholder="https://www.empresa.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados Bancários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="banco">Banco</Label>
              <Input
                id="banco"
                {...form.register('banco')}
                placeholder="Nome do banco"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agencia">Agência</Label>
              <Input
                id="agencia"
                {...form.register('agencia')}
                placeholder="0000"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="conta">Conta</Label>
              <Input
                id="conta"
                {...form.register('conta')}
                placeholder="00000-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_conta">Tipo de Conta</Label>
              <select
                id="tipo_conta"
                {...form.register('tipo_conta')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="corrente">Corrente</option>
                <option value="poupanca">Poupança</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chave_pix">Chave PIX</Label>
            <Input
              id="chave_pix"
              {...form.register('chave_pix')}
              placeholder="CPF, e-mail ou chave aleatória"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Negócio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="volume_minimo_compra">Volume Mínimo de Compra (L)</Label>
            <Input
              id="volume_minimo_compra"
              type="number"
              {...form.register('volume_minimo_compra', { valueAsNumber: true })}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regioes_atuacao">Regiões de Atuação</Label>
            <Input
              id="regioes_atuacao"
              {...form.register('regioes_atuacao')}
              placeholder="SP, MG, PR (separar por vírgula)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipos_produto_interesse">Tipos de Produto de Interesse</Label>
            <Input
              id="tipos_produto_interesse"
              {...form.register('tipos_produto_interesse')}
              placeholder="Herbicidas, Fungicidas, Inseticidas (separar por vírgula)"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Salvando...' : 'Salvar Dados'}
      </Button>
    </form>
  );
}