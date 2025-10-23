import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { useCityCoordinates } from '@/hooks/useCityCoordinates';
import { calculateDistanceKm, formatDistance, getProximityFromDistance } from '@/utils/distanceCalculator';

interface LocationDistanceBadgeProps {
  productCity: string;
  productState: string;
  clientCity?: string;
  clientState?: string;
}

export function LocationDistanceBadge({
  productCity,
  productState,
  clientCity,
  clientState,
}: LocationDistanceBadgeProps) {
  const { data: clientCoords, isLoading: loadingClient } = useCityCoordinates(clientCity, clientState);
  const { data: productCoords, isLoading: loadingProduct } = useCityCoordinates(productCity, productState);

  let distanceKm: number | null = null;
  let proximity = 'distant';
  let label = 'Distante';

  // Se está carregando coordenadas
  if ((loadingClient || loadingProduct) && clientCity && clientState) {
    return (
      <Badge className="bg-gray-100 text-gray-600 flex items-center gap-1">
        <MapPin className="h-3 w-3 animate-pulse" />
        Calculando...
      </Badge>
    );
  }

  // Se tem ambas as coordenadas, calcular distância real
  if (clientCity && clientState && clientCoords && productCoords) {
    distanceKm = calculateDistanceKm(
      clientCoords.latitude,
      clientCoords.longitude,
      productCoords.latitude,
      productCoords.longitude
    );
    proximity = getProximityFromDistance(distanceKm);
    label = formatDistance(distanceKm);
  } 
  // Fallback se coordenadas não disponíveis (com indicador)
  else if (clientCity && clientState) {
    if (productCity === clientCity && productState === clientState) {
      proximity = 'same_city';
      label = 'Mesma cidade';
    } else if (productState === clientState) {
      proximity = 'same_state';
      label = 'Mesmo estado';
    } else {
      label = 'Outro estado';
    }
  }
  // Se não tem dados do cliente
  else {
    return null; // Não mostrar badge se não tem cliente selecionado
  }

  const getProximityColor = (prox: string) => {
    switch (prox) {
      case 'same_city':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'same_state':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Badge className={`${getProximityColor(proximity)} flex items-center gap-1`}>
      <MapPin className="h-3 w-3" />
      {label}
    </Badge>
  );
}
