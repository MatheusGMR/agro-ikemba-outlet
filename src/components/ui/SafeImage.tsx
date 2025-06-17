
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export const SafeImage = ({ src, alt, className, fallbackSrc }: SafeImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    console.warn(`⚠️ Falha ao carregar imagem: ${src}`);
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    console.log(`✅ Imagem carregada com sucesso: ${src}`);
    setIsLoading(false);
  };

  if (imageError && !fallbackSrc) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Imagem não disponível</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`bg-gray-200 animate-pulse ${className}`} />
      )}
      <img
        src={imageError ? fallbackSrc : src}
        alt={alt}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </>
  );
};
