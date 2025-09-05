import { Star, StarHalf, ShoppingCart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useUserApproval } from '@/hooks/useUserApproval';
import { useAuth } from '@/hooks/useAuth';

interface ProductCardProps {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  rating: number;
  image: string;
  price: string;
  className?: string;
}

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star 
          key={`full-${i}`} 
          className="w-4 h-4" 
          color="#d97904" 
          fill="#543921" 
        />
      ))}
      
      {hasHalfStar && (
        <StarHalf 
          className="w-4 h-4" 
          color="#d97904" 
          fill="#543921" 
        />
      )}
      
      {[...Array(emptyStars)].map((_, i) => (
        <Star 
          key={`empty-${i}`} 
          className="w-4 h-4 text-gray-300" 
        />
      ))}
    </div>
  );
};

export default function ProductCard({ id, name, manufacturer, category, rating, image, price, className }: ProductCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isApproved, isPending } = useUserApproval();

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Always allow viewing the product - redirect to product details
    navigate(`/product/${id}`);
  };

  const getButtonText = () => {
    if (!user) return 'Ver Produto';
    if (isPending) return 'Ver Produto';
    return 'Comprar';
  };

  const getButtonIcon = () => {
    if (!user || isPending) return null;
    return <ShoppingCart className="w-4 h-4 mr-1" color="#543921" />;
  };

  return (
    <div 
      className={cn("bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 cursor-pointer", className)}
      onClick={handleCardClick}
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">{category}</p>
            <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
          </div>
          <div className="flex items-center gap-1">
            {renderStars(rating)}
            <span className="text-sm font-medium ml-1">{rating}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">by {manufacturer}</p>
        
        <div className="flex justify-between items-center">
          <PriceDisplay price={price} size="md" />
          <Button 
            size="sm" 
            className="transition-all duration-200 bg-primary hover:bg-primary/90"
            onClick={handleButtonClick}
          >
            {getButtonIcon()}
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
}
