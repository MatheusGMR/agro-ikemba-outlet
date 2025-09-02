#!/bin/bash

# Script para build mobile - Agro Ikemba
echo "🚀 Iniciando build mobile para produção..."

# Verificar se as dependências estão instaladas
if ! command -v npx &> /dev/null; then
    echo "❌ Node.js/npm não encontrado. Instale primeiro."
    exit 1
fi

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf dist/
rm -rf android/app/build/
rm -rf ios/App/build/

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build da aplicação web
echo "🏗️ Fazendo build da aplicação..."
npm run build

# Verificar se o build foi bem-sucedido
if [ ! -d "dist" ]; then
    echo "❌ Build falhou. Verifique os erros acima."
    exit 1
fi

# Sincronizar com plataformas nativas
echo "🔄 Sincronizando com plataformas nativas..."
npx cap sync

# Verificar se as plataformas existem
if [ ! -d "android" ] && [ ! -d "ios" ]; then
    echo "⚠️ Nenhuma plataforma nativa encontrada."
    echo "Execute: npx cap add android && npx cap add ios"
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo ""
echo "Próximos passos:"

if [ -d "android" ]; then
    echo "📱 Android: npx cap open android"
    echo "   Depois: Build > Generate Signed Bundle/AAB"
fi

if [ -d "ios" ]; then
    echo "🍎 iOS: npx cap open ios"
    echo "   Depois: Product > Archive"
fi

echo ""
echo "📖 Consulte MOBILE_DEPLOYMENT.md para detalhes completos."