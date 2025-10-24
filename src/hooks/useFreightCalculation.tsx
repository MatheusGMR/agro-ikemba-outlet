import { useMemo } from 'react';
import { useCityCoordinates } from './useCityCoordinates';
import { calculateDistanceKm } from '@/utils/distanceCalculator';
import { calculateFreight, FreightCalculation } from '@/utils/freightCalculator';

interface FreightCalculationResult {
  distance_km: number | null;
  nacional: FreightCalculation | null;
  internacional: FreightCalculation | null;
  isLoading: boolean;
}

/**
 * Hook para calcular frete em tempo real baseado em coordenadas geográficas
 * 
 * @param originCity Cidade de origem (estoque)
 * @param originState Estado de origem (estoque)
 * @param destCity Cidade de destino (cliente)
 * @param destState Estado de destino (cliente)
 * @param cargoValue Valor total da carga (com overprice)
 * @param cargoVolume Volume total em litros
 */
export function useFreightCalculation(
  originCity: string | undefined,
  originState: string | undefined,
  destCity: string | undefined,
  destState: string | undefined,
  cargoValue: number,
  cargoVolume: number
): FreightCalculationResult {
  const originCoords = useCityCoordinates(originCity, originState);
  const destCoords = useCityCoordinates(destCity, destState);
  
  const isLoading = originCoords.isLoading || destCoords.isLoading;
  
  return useMemo(() => {
    if (!originCoords.data || !destCoords.data || cargoVolume === 0) {
      return {
        distance_km: null,
        nacional: null,
        internacional: null,
        isLoading
      };
    }
    
    const distance = calculateDistanceKm(
      originCoords.data.latitude,
      originCoords.data.longitude,
      destCoords.data.latitude,
      destCoords.data.longitude
    );
    
    const nacional = calculateFreight({
      delivery_type: 'entrega_nacional',
      distance_km: distance,
      cargo_value: cargoValue,
      cargo_volume: cargoVolume
    });
    
    const internacional = calculateFreight({
      delivery_type: 'entrega_internacional',
      distance_km: distance,
      cargo_value: cargoValue,
      cargo_volume: cargoVolume
    });
    
    return {
      distance_km: distance,
      nacional,
      internacional,
      isLoading: false
    };
  }, [originCoords.data, destCoords.data, cargoValue, cargoVolume, isLoading]);
}
