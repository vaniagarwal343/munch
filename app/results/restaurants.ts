import data from '../../data/munch-dining-data.json';

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  tags: string[];
  price: string;
  description: string;
  address: string;
  hours: string;
  lat: number;
  lng: number;
  type?: string;
  rating?: number;
  zone: 'on-campus' | 'off-campus';
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const onCampus: Restaurant[] = data.on_campus.map((r) => ({
  id: slugify(r.name),
  name: r.name,
  cuisine: r.cuisine,
  tags: r.tags,
  price: r.price,
  description: r.description,
  address: r.address,
  hours: r.hours,
  lat: r.lat,
  lng: r.lng,
  type: r.type,
  zone: 'on-campus' as const,
}));

const offCampus: Restaurant[] = data.off_campus.map((r) => ({
  id: slugify(r.name),
  name: r.name,
  cuisine: r.cuisine,
  tags: r.tags,
  price: r.price,
  description: r.description,
  address: r.address,
  hours: r.hours,
  lat: r.lat,
  lng: r.lng,
  rating: r.rating,
  zone: 'off-campus' as const,
}));

export const restaurants: Restaurant[] = [...onCampus, ...offCampus];
export const mapCenter = data.metadata.map_center;
export const mapZoom = data.metadata.map_zoom;
