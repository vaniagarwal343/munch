import data from '../../data/munch-dining-data.json';

export interface Restaurant {
  id: string;
  name: string;
  type: string;
  cuisine: string;
  tags: string[];
  vibe: string[];
  price: string;
  walkMinutes: number;
  description: string;
  address: string;
  hours: string;
  lat: number;
  lng: number;
  rating?: number;
}

export const restaurants: Restaurant[] = data.restaurants.map((r) => ({
  id: r.id,
  name: r.name,
  type: r.type,
  cuisine: r.cuisine,
  tags: r.tags,
  vibe: r.vibe,
  price: r.price,
  walkMinutes: r.walkMinutes,
  description: r.description,
  address: r.address,
  hours: r.hours,
  lat: r.lat,
  lng: r.lng,
  rating: r.rating,
}));

export const mapCenter = data.metadata.map_center;
export const mapZoom = data.metadata.map_zoom;
