
# Instruções de Build e Deploy - Agro Ikemba

## Processo de Build para Produção

### 1. Preparação
```bash
# Instalar dependências
npm install

# Limpar builds anteriores (se necessário)
rm -rf dist/
```

### 2. Preparar Assets de Vídeo
Para que o vídeo funcione corretamente, você precisa adicionar os arquivos de vídeo na pasta `public/`:

1. **Fazer download do vídeo original** de: https://agroikemba.com.br/wp-content/uploads/2025/05/Pitch-deck-1.mp4
2. **Renomear para `pitch-deck.mp4`** e colocar na pasta `public/`
3. **Opcionalmente**, converter para WebM para melhor compatibilidade:
   ```bash
   # Usando FFmpeg (se disponível)
   ffmpeg -i public/pitch-deck.mp4 -c:v libvpx-vp9 -c:a libvorbis public/pitch-deck.webm
   ```

### 3. Build de Produção
```bash
# Executar build otimizado
npm run build

# Verificar se a pasta dist/ foi criada
ls -la dist/

# Verificar se os vídeos foram copiados para dist/
ls -la dist/pitch-deck.*
```

### 4. Teste Local (Opcional mas Recomendado)
```bash
# Testar build localmente
npm run preview

# Ou usar serve globalmente
npx serve dist/
```

### 5. Deploy

#### Opção A: Servidor Web (Apache/Nginx)
1. Faça upload APENAS da pasta `dist/` para o servidor
2. Configure o servidor para servir arquivos da pasta `dist/` como root
3. Certifique-se de que o arquivo `.htaccess` está presente na pasta `dist/`
4. **IMPORTANTE**: Verifique se os arquivos de vídeo (`pitch-deck.mp4`, `pitch-deck.webm`) estão na raiz da pasta `dist/`

#### Opção B: Netlify
1. Faça upload da pasta `dist/` ou conecte o repositório
2. O arquivo `_redirects` será usado automaticamente
3. Certifique-se de incluir os arquivos de vídeo no upload

#### Opção C: Vercel
1. Faça upload da pasta `dist/`
2. Configure o projeto como site estático
3. Verifique se os vídeos estão sendo servidos corretamente

### 6. Verificação Pós-Deploy

Após o deploy, verifique:

- [ ] Site carrega em https://agroikemba.com.br
- [ ] Navegação entre páginas funciona
- [ ] Assets (CSS, JS, imagens) carregam corretamente
- [ ] **Vídeo carrega e reproduz corretamente**
- [ ] Console do navegador não mostra erros 404
- [ ] Formulários funcionam corretamente

### 7. Troubleshooting do Vídeo

Se o vídeo não carregar:

1. **Verificar se o arquivo existe**: Acesse diretamente `https://seusite.com/pitch-deck.mp4`
2. **Verificar tamanho do arquivo**: Vídeos muito grandes podem falhar no upload
3. **Verificar formato**: MP4 tem melhor compatibilidade que outros formatos
4. **Verificar console**: Procurar por erros 404 ou de CORS
5. **Testar localmente**: Use `npm run preview` para testar antes do deploy

### 8. Otimização do Vídeo

Para melhor performance:

```bash
# Reduzir tamanho do vídeo (se necessário)
ffmpeg -i pitch-deck.mp4 -c:v libx264 -crf 28 -c:a aac -b:a 128k pitch-deck-optimized.mp4

# Criar thumbnail personalizado
ffmpeg -i pitch-deck.mp4 -ss 00:00:01 -vframes 1 pitch-deck-thumbnail.jpg
```

### 9. Troubleshooting Geral

Se ainda houver erros 404:

1. **Verificar se o build foi executado**: A pasta `dist/` deve existir
2. **Verificar configuração do servidor**: O servidor deve servir arquivos da pasta `dist/`
3. **Verificar configuração SPA**: O servidor deve redirecionar todas as rotas para `index.html`
4. **Verificar console do navegador**: Procurar por erros específicos
5. **Verificar assets**: Todos os arquivos (incluindo vídeos) devem estar em `dist/`

### Comandos Úteis

```bash
# Build completo
npm run build

# Preview local
npm run preview

# Verificar tamanho do build
du -sh dist/

# Listar arquivos gerados
find dist/ -type f -name "*.js" -o -name "*.css" -o -name "*.mp4"

# Verificar se vídeo existe localmente
ls -la public/pitch-deck.*
ls -la dist/pitch-deck.*
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

    # Cache para vídeos
    location ~* \.(mp4|webm|ogg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Assets Necessários

Certifique-se de que os seguintes arquivos estão na pasta `public/`:

- [ ] `pitch-deck.mp4` (vídeo principal)
- [ ] `pitch-deck.webm` (opcional, para melhor compatibilidade)
- [ ] Imagens do projeto (já existentes)
- [ ] `favicon.ico`
- [ ] `.htaccess` (para Apache)
- [ ] `_redirects` (para Netlify)

## Importante

- **SEMPRE** execute `npm run build` antes do deploy
- **NUNCA** faça deploy da pasta `src/` ou arquivos TypeScript
- **APENAS** a pasta `dist/` deve ser enviada para o servidor de produção
- **INCLUA** os arquivos de vídeo na pasta `public/` antes do build
- O servidor deve estar configurado para servir SPAs (Single Page Applications)
- Verifique se os vídeos são copiados corretamente durante o build
