import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CityCoordinates {
  id: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export function useCityCoordinates(city?: string, state?: string) {
  return useQuery({
    queryKey: ['city-coordinates', city, state],
    queryFn: async () => {
      if (!city || !state) return null;

      const { data, error } = await supabase
        .from('city_coordinates')
        .select('*')
        .eq('city', city.toUpperCase())
        .eq('state', state.toUpperCase())
        .single();

      if (error) {
        console.warn(`Coordinates not found for ${city}, ${state}`);
        return null;
      }

      return data as CityCoordinates;
    },
    enabled: !!city && !!state,
    staleTime: Infinity, // Coordenadas nunca mudam
    retry: false, // Não tentar novamente se não encontrar
  });
}
