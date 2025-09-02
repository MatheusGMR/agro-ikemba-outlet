# Deploy Mobile - Agro Ikemba

## Processo para Publicar nas Lojas de Apps

### Pré-requisitos
- Conta de desenvolvedor Google Play Console (US$ 25 única vez)
- Conta Apple Developer Program (US$ 99/ano)
- Mac com Xcode (apenas para iOS)
- Android Studio instalado

### 1. Preparação do Projeto

```bash
# 1. Exportar projeto para GitHub via botão "Export to Github"
# 2. Clonar seu repositório
git clone [seu-repo-url]
cd agro-ikemba-outlet

# 3. Instalar dependências
npm install

# 4. Adicionar plataformas nativas
npx cap add android
npx cap add ios

# 5. Build do projeto
npm run build

# 6. Sincronizar com plataformas nativas
npx cap sync
```

### 2. Configuração Android

```bash
# Abrir projeto no Android Studio
npx cap open android
```

**No Android Studio:**
1. **Build > Generate Signed Bundle/APK**
2. Escolher **Android App Bundle (AAB)**
3. Criar keystore se não tiver:
   - Keystore path: `android/app/release.keystore`
   - Password: criar senha segura
   - Key alias: `agro-ikemba`
   - Guardar credenciais com segurança!
4. Build Type: **release**
5. Gerar AAB file

### 3. Configuração iOS

```bash
# Abrir projeto no Xcode (apenas Mac)
npx cap open ios
```

**No Xcode:**
1. **Product > Archive**
2. **Window > Organizer**
3. **Distribute App**
4. **App Store Connect**
5. Upload para TestFlight primeiro

### 4. Publicação Google Play Store

**No Google Play Console:**

1. **Criar Nova App**
   - Nome: "Agro Ikemba Outlet"
   - Categoria: Business
   - Público-alvo: Empresas

2. **Upload do AAB**
   - Internal Testing primeiro
   - Depois Closed Testing
   - Finalmente Production

3. **Store Listing**
   - Descrição detalhada
   - Screenshots (obrigatório 2-8 imagens)
   - Ícone 512x512px
   - Banner 1024x500px

4. **Política de Privacidade**
   - URL obrigatória
   - Criar página no site

### 5. Publicação Apple App Store

**No App Store Connect:**

1. **Criar Nova App**
   - Bundle ID deve bater com capacitor.config.ts
   - Nome: "Agro Ikemba Outlet"
   - Categoria: Business

2. **TestFlight**
   - Upload via Xcode
   - Testes internos primeiro
   - Beta testing com usuários reais

3. **App Store Review**
   - Screenshots para todos os dispositivos
   - Descrição em português
   - Keywords para SEO

### 6. Assets Necessários

**Ícones:**
- Android: 192x192px, 512x512px
- iOS: Vários tamanhos (Xcode gera automaticamente)

**Screenshots:**
- Android: Phone + Tablet (mínimo 2 cada)
- iOS: iPhone + iPad (mínimo 3 cada)

**Splash Screens:**
- Android: 1080x1920px, 1440x2560px
- iOS: Vários tamanhos (Xcode Assets)

### 7. Configurações Importantes

**Versioning:**
```json
// package.json
"version": "1.0.0"
```

**Permissions (config.xml será gerado):**
- Internet
- Camera (se necessário)
- Storage
- Location (se necessário)

### 8. Processo de Aprovação

**Google Play:**
- Revisão: 1-3 dias
- Pode ser rejeitado por políticas
- Correções podem ser feitas rapidamente

**Apple App Store:**
- Revisão: 1-7 dias
- Processo mais rigoroso
- Testes de funcionalidade obrigatórios

### 9. Atualizações

```bash
# Para atualizações futuras:
npm run build
npx cap sync
# Repetir processo de build e upload
```

**Importante:**
- Sempre incrementar versão no package.json
- Testar completamente antes de submeter
- Manter changelog das alterações

### 10. Monetização (Opcional)

**In-App Purchases:**
- Configurar no Google Play Console
- Configurar no App Store Connect
- Implementar SDK de pagamentos

### 11. Analytics e Crashlytics

Recomendado adicionar:
```bash
npm install @capacitor/google-analytics
npm install @capacitor-firebase/crashlytics
```

### Suporte e Troubleshooting

- **Build Errors**: Verificar logs no Android Studio/Xcode
- **Rejection**: Ler guidelines das lojas
- **Performance**: Testar em dispositivos reais

Para mais detalhes técnicos, leia: https://lovable.dev/blogs/TODO