
# Instruções de Build e Deploy - Agro Ikemba

## Processo de Build para Produção

### 1. Preparação
```bash
# Instalar dependências
npm install

# Limpar builds anteriores (se necessário)
rm -rf dist/
```

### 2. Build de Produção
```bash
# Executar build otimizado
npm run build

# Verificar se a pasta dist/ foi criada
ls -la dist/
```

### 3. Teste Local (Opcional mas Recomendado)
```bash
# Testar build localmente
npm run preview

# Ou usar serve globalmente
npx serve dist/
```

### 4. Deploy

#### Opção A: Servidor Web (Apache/Nginx)
1. Faça upload APENAS da pasta `dist/` para o servidor
2. Configure o servidor para servir arquivos da pasta `dist/` como root
3. Certifique-se de que o arquivo `.htaccess` está presente na pasta `dist/`

#### Opção B: Netlify
1. Faça upload da pasta `dist/` ou conecte o repositório
2. O arquivo `_redirects` será usado automaticamente

#### Opção C: Vercel
1. Faça upload da pasta `dist/`
2. Configure o projeto como site estático

### 5. Verificação Pós-Deploy

Após o deploy, verifique:

- [ ] Site carrega em https://agroikemba.com.br
- [ ] Navegação entre páginas funciona
- [ ] Assets (CSS, JS, imagens) carregam corretamente
- [ ] Console do navegador não mostra erros 404
- [ ] Formulários funcionam corretamente

### 6. Troubleshooting

Se ainda houver erros 404:

1. **Verificar se o build foi executado**: A pasta `dist/` deve existir
2. **Verificar configuração do servidor**: O servidor deve servir arquivos da pasta `dist/`
3. **Verificar configuração SPA**: O servidor deve redirecionar todas as rotas para `index.html`
4. **Verificar console do navegador**: Procurar por erros específicos

### Comandos Úteis

```bash
# Build completo
npm run build

# Preview local
npm run preview

# Verificar tamanho do build
du -sh dist/

# Listar arquivos gerados
find dist/ -type f -name "*.js" -o -name "*.css"
```

## Configuração do Servidor

### Apache (.htaccess)
O arquivo `.htaccess` já está configurado na pasta `public/` e será copiado para `dist/` durante o build.

### Nginx
```nginx
server {
    listen 80;
    server_name agroikemba.com.br;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Importante

- **SEMPRE** execute `npm run build` antes do deploy
- **NUNCA** faça deploy da pasta `src/` ou arquivos TypeScript
- **APENAS** a pasta `dist/` deve ser enviada para o servidor de produção
- O servidor deve estar configurado para servir SPAs (Single Page Applications)
