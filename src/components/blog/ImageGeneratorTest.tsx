
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const ImageGeneratorTest = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      console.log('Chamando função de geração de imagem...');
      
      const { data, error } = await supabase.functions.invoke('generate-blog-image', {
        body: { prompt }
      });

      if (error) {
        console.error('Erro da função:', error);
        throw error;
      }

      console.log('Resposta da função:', data);

      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        throw new Error('Nenhuma URL de imagem retornada');
      }
    } catch (err: any) {
      console.error('Erro ao gerar imagem:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Teste de Geração de Imagem</h3>
      
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Descreva a imagem que deseja gerar..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        
        <Button 
          onClick={generateImage} 
          disabled={loading || !prompt.trim()}
          className="w-full"
        >
          {loading ? 'Gerando...' : 'Gerar Imagem'}
        </Button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {imageUrl && (
          <div className="mt-4">
            <img 
              src={imageUrl} 
              alt="Imagem gerada" 
              className="w-full rounded-lg shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGeneratorTest;
