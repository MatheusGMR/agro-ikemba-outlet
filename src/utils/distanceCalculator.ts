/**
 * Calcula a distância em linha reta entre dois pontos geográficos
 * usando a fórmula de Haversine
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Formata a distância em km para exibição
 */
export function formatDistance(km: number): string {
  if (km < 1) return 'Mesma localidade';
  if (km < 50) return `~${km} km`;
  if (km < 100) return `~${km} km`;
  return `~${Math.round(km / 10) * 10} km`; // Arredondar para dezenas
}

/**
 * Determina a categoria de proximidade baseada na distância
 */
export function getProximityFromDistance(km: number): string {
  if (km < 50) return 'same_city';
  if (km < 500) return 'same_state';
  return 'distant';
}
