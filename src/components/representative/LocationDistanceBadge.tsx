import { Badge } from '@/components/ui/badge';
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
  const { data: clientCoords } = useCityCoordinates(clientCity, clientState);
  const { data: productCoords } = useCityCoordinates(productCity, productState);

  // Calcular distância se ambas coordenadas estiverem disponíveis
  let distanceKm: number | null = null;
  let proximity = 'distant';
  let label = 'Distante';

  if (clientCity && clientState && clientCoords && productCoords) {
    distanceKm = calculateDistanceKm(
      clientCoords.latitude,
      clientCoords.longitude,
      productCoords.latitude,
      productCoords.longitude
    );
    proximity = getProximityFromDistance(distanceKm);
    label = formatDistance(distanceKm);
  } else if (clientCity && clientState) {
    // Fallback para lógica antiga se coordenadas não disponíveis
    if (productCity === clientCity && productState === clientState) {
      proximity = 'same_city';
      label = 'Mesma cidade';
    } else if (productState === clientState) {
      proximity = 'same_state';
      label = 'Mesmo estado';
    }
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
    <Badge className={getProximityColor(proximity)}>
      {label}
    </Badge>
  );
}
