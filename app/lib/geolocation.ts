export type Coordinates = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/** Distância em quilômetros entre duas coordenadas, pela fórmula de Haversine. */
export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Ordena uma lista de itens com coordenadas pela distância até `origin`, do mais próximo ao mais distante. */
export function sortByDistance<T extends Coordinates>(items: T[], origin: Coordinates): Array<T & { distanceKm: number }> {
  return items
    .map((item) => ({ ...item, distanceKm: haversineDistanceKm(origin, item) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Formata a distância para exibição, em metros abaixo de 1km e com uma casa decimal acima disso. */
export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1).replace(".", ",")} km`;
}
