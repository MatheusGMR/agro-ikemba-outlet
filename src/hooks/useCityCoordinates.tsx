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

      console.log(`🗺️ Buscando coordenadas para: ${city}, ${state}`);

      const { data, error } = await supabase
        .from('city_coordinates')
        .select('*')
        .eq('city', city.toUpperCase())
        .eq('state', state.toUpperCase())
        .single();

      if (error) {
        console.warn(`⚠️ Coordenadas não encontradas: ${city}, ${state}`);
        console.warn('💡 Considere adicionar estas coordenadas ao banco de dados');
        return null;
      }

      console.log(`✅ Coordenadas encontradas: ${city}, ${state} (${data.latitude}, ${data.longitude})`);
      return data as CityCoordinates;
    },
    enabled: !!city && !!state,
    staleTime: Infinity, // Coordenadas nunca mudam
    retry: false, // Não tentar novamente se não encontrar
  });
}
