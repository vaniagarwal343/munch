'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { restaurants, mapCenter, mapZoom, Restaurant } from '../results/restaurants';
import { supabase } from '../../lib/supabase';
import styles from './map.module.scss';

interface UserHeading {
  nickname: string;
  avatarColor: string;
  restaurantId: string;
  dietary: string[];
}

const DIET_TAG_COLORS: Record<string, string> = {
  vegetarian: '#50A3A4',
  vegan: '#5BB974',
  halal: '#FCAF38',
  'gluten-free': '#F95335',
};

const ALL_DIET_FILTERS = ['vegetarian', 'vegan', 'halal', 'gluten-free'];

function buildHeadingMap(users: UserHeading[]): Record<string, UserHeading[]> {
  const grouped: Record<string, UserHeading[]> = {};
  users.forEach((u) => {
    if (!grouped[u.restaurantId]) grouped[u.restaurantId] = [];
    grouped[u.restaurantId].push(u);
  });
  return grouped;
}

function buildPopupHTML(r: Restaurant, users: UserHeading[]): string {
  const tagsHTML = r.tags
    .filter((t) => DIET_TAG_COLORS[t])
    .map(
      (t) =>
        `<span style="font-family:'IBM Plex Mono',monospace;font-size:0.6rem;letter-spacing:0.05em;padding:2px 6px;border:1px solid ${DIET_TAG_COLORS[t]}40;color:${DIET_TAG_COLORS[t]};text-transform:uppercase">${t}</span>`
    )
    .join('');

  let dietBreakdownHTML = '';
  if (users.length > 0) {
    const counts: Record<string, number> = {};
    users.forEach((u) => {
      u.dietary.forEach((d) => {
        counts[d] = (counts[d] || 0) + 1;
      });
    });
    const entries = Object.entries(counts);
    if (entries.length > 0) {
      dietBreakdownHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${entries
        .map(
          ([d, c]) =>
            `<span style="font-family:'IBM Plex Mono',monospace;font-size:0.6rem;letter-spacing:0.04em;color:${DIET_TAG_COLORS[d] || '#674A40'}">${c} ${d}</span>`
        )
        .join('<span style="color:#674A4030;font-size:0.6rem">·</span>')}</div>`;
    }
  }

  let usersHTML: string;
  if (users.length === 0) {
    usersHTML = `<div style="font-size:0.75rem;color:#674A4080;margin-top:8px;font-style:italic">no one here yet — be the first</div>`;
  } else {
    const userLines = users
      .map((u) => {
        const dietStr = u.dietary.length > 0 ? ` · ${u.dietary.join(', ')}` : '';
        return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;background:${u.avatarColor};color:#fff;font-weight:700;font-size:9px;font-family:'Outfit',sans-serif;flex-shrink:0">${u.nickname[0].toUpperCase()}</span>
          <span style="font-size:0.75rem;color:#674A40">${u.nickname}<span style="color:#674A4060">${dietStr}</span></span>
        </div>`;
      })
      .join('');
    usersHTML = `<div style="margin-top:8px">
      <div style="font-family:'IBM Plex Mono',monospace;font-size:0.6rem;letter-spacing:0.1em;color:#674A4080;text-transform:uppercase;margin-bottom:4px">WHO'S HERE</div>
      ${userLines}
      ${dietBreakdownHTML}
    </div>`;
  }

  return `<div style="font-family:'Outfit',sans-serif;max-width:260px">
    <strong style="font-size:0.9rem">${r.name}</strong>
    <div style="font-family:'IBM Plex Mono',monospace;font-size:0.6rem;letter-spacing:0.08em;color:#674A4080;text-transform:uppercase;margin:2px 0 4px">${r.cuisine}</div>
    <div style="font-size:0.75rem;color:#674A4080">${r.address.toLowerCase()}</div>
    ${tagsHTML ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">${tagsHTML}</div>` : ''}
    ${usersHTML}
  </div>`;
}

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const [allUsers, setAllUsers] = useState<UserHeading[]>([]);
  const [currentUser, setCurrentUser] = useState<UserHeading | null>(null);
  const [filters, setFilters] = useState<Set<string>>(new Set());

  // Load users: supabase check_ins + fake users + localStorage
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const users: UserHeading[] = [];
      let realUser: UserHeading | null = null;

      // Read localStorage
      try {
        const stored = localStorage.getItem('munch-heading');
        if (stored) {
          const parsed = JSON.parse(stored);
          realUser = {
            nickname: parsed.nickname || '',
            avatarColor: parsed.avatarColor || '#50A3A4',
            restaurantId: parsed.restaurantId || '',
            dietary: parsed.dietary || [],
          };
          if (realUser.nickname && realUser.restaurantId) {
            setCurrentUser(realUser);
          }
        }
      } catch {
        // ignore
      }

      // Fetch from supabase
      try {
        const { data, error } = await supabase
          .from('check_ins')
          .select('nickname, avatar_color, restaurant_id, dietary')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          const supabaseUsers: UserHeading[] = data.map((row) => ({
            nickname: row.nickname,
            avatarColor: row.avatar_color,
            restaurantId: row.restaurant_id,
            dietary: row.dietary || [],
          }));
          users.push(...supabaseUsers);
        } else if (realUser && realUser.nickname && realUser.restaurantId) {
          // No supabase data — add localStorage user to the list
          users.push(realUser);
        }
      } catch {
        // Supabase not configured — add localStorage user as fallback
        if (realUser && realUser.nickname && realUser.restaurantId) {
          users.push(realUser);
        }
      }

      if (!cancelled) {
        setAllUsers(users);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Subscribe to realtime check-ins
  useEffect(() => {
    const channel = supabase
      .channel('map-check-ins')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'check_ins' },
        (payload) => {
          const row = payload.new as {
            nickname: string;
            avatar_color: string;
            restaurant_id: string;
            dietary: string[];
          };
          const newUser: UserHeading = {
            nickname: row.nickname,
            avatarColor: row.avatar_color,
            restaurantId: row.restaurant_id,
            dietary: row.dietary || [],
          };
          setAllUsers((prev) => [...prev, newUser]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Init map
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [mapCenter.lng, mapCenter.lat],
      zoom: mapZoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headingMap = buildHeadingMap(allUsers);

  // Render markers
  useEffect(() => {
    if (!map.current) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    restaurants.forEach((r) => {
      const users = headingMap[r.id] || [];
      const hasUsers = users.length > 0;

      const activeFilters = Array.from(filters);
      const matchesFilter =
        activeFilters.length === 0 ||
        activeFilters.every((f) => r.tags.includes(f));
      const dimmed = activeFilters.length > 0 && !matchesFilter;

      const size = hasUsers ? 36 : 28;
      const letter = r.name[0].toUpperCase();
      const bgColor = dimmed
        ? 'rgba(103,74,64,0.15)'
        : hasUsers
        ? '#F95335'
        : '#674A40';

      const el = document.createElement('div');
      el.style.position = 'relative';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.cursor = 'pointer';

      const square = document.createElement('div');
      square.style.width = '100%';
      square.style.height = '100%';
      square.style.background = bgColor;
      square.style.display = 'flex';
      square.style.alignItems = 'center';
      square.style.justifyContent = 'center';
      square.style.color = dimmed ? 'rgba(103,74,64,0.3)' : '#fff';
      square.style.fontWeight = '700';
      square.style.fontSize = `${Math.round(size * 0.4)}px`;
      square.style.fontFamily = "'Outfit', sans-serif";
      square.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
      square.textContent = letter;
      el.appendChild(square);

      if (hasUsers) {
        const badge = document.createElement('div');
        badge.style.position = 'absolute';
        badge.style.top = '-6px';
        badge.style.right = '-6px';
        badge.style.width = '18px';
        badge.style.height = '18px';
        badge.style.background = '#674A40';
        badge.style.color = '#fff';
        badge.style.fontSize = '10px';
        badge.style.fontWeight = '700';
        badge.style.fontFamily = "'IBM Plex Mono', monospace";
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.justifyContent = 'center';
        badge.style.borderRadius = '50%';
        badge.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
        badge.textContent = String(users.length);
        el.appendChild(badge);
      }

      const popup = new mapboxgl.Popup({
        offset: hasUsers ? 24 : 18,
        closeButton: false,
        maxWidth: '300px',
      }).setHTML(buildPopupHTML(r, users));

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([r.lng, r.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current[r.id] = marker;
    });

    if (currentUser) {
      const r = restaurants.find((r) => r.id === currentUser.restaurantId);
      if (r && map.current) {
        const m = map.current;
        const flyAndOpen = () => {
          m.flyTo({ center: [r.lng, r.lat], zoom: 16, duration: 1200 });
          setTimeout(() => {
            markersRef.current[currentUser.restaurantId]?.togglePopup();
          }, 1300);
        };
        if (m.loaded()) {
          flyAndOpen();
        } else {
          m.once('load', flyAndOpen);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUsers, currentUser, filters]);

  const toggleFilter = useCallback((tag: string) => {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  function handlePopularClick(id: string) {
    const r = restaurants.find((r) => r.id === id);
    if (!r || !map.current) return;
    map.current.flyTo({ center: [r.lng, r.lat], zoom: 16, duration: 800 });
    Object.values(markersRef.current).forEach((m) => m.getPopup()?.remove());
    markersRef.current[id]?.togglePopup();
  }

  const hasToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const userRestaurant = currentUser
    ? restaurants.find((r) => r.id === currentUser.restaurantId)
    : null;

  const popular = Object.entries(headingMap)
    .map(([id, users]) => ({ id, users, restaurant: restaurants.find((r) => r.id === id) }))
    .filter((p) => p.restaurant && p.users.length > 0)
    .sort((a, b) => b.users.length - a.users.length)
    .slice(0, 3);

  return (
    <div className={styles.mapPage}>
      <aside className={styles.sidebar}>
        <span className={styles.monoLabel}>LIVE MAP</span>

        {currentUser && userRestaurant && (
          <div className={styles.userBanner}>
            <span
              className={styles.userAvatar}
              style={{ background: currentUser.avatarColor }}
            >
              {currentUser.nickname[0].toUpperCase()}
            </span>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{currentUser.nickname}</span>
              <span className={styles.userHeading}>
                heading to <strong>{userRestaurant.name.toLowerCase()}</strong>
              </span>
              {currentUser.dietary.length > 0 && (
                <div className={styles.userDiet}>
                  {currentUser.dietary.map((d) => (
                    <span
                      key={d}
                      className={styles.dietLabel}
                      style={{ borderColor: `${DIET_TAG_COLORS[d]}60`, color: DIET_TAG_COLORS[d] }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {popular.length > 0 && (
          <div className={styles.popularSection}>
            <span className={styles.monoLabel}>MOST POPULAR RIGHT NOW</span>
            <div className={styles.popularList}>
              {popular.map(({ id, users, restaurant }) => (
                <button
                  key={id}
                  className={styles.popularItem}
                  onClick={() => handlePopularClick(id)}
                >
                  <div className={styles.popularHeader}>
                    <h4>{restaurant!.name}</h4>
                    <span className={styles.popularCount}>{users.length}</span>
                  </div>
                  <div className={styles.popularAvatars}>
                    {users.map((u, i) => (
                      <span
                        key={i}
                        className={styles.miniAvatar}
                        style={{ background: u.avatarColor }}
                        title={u.nickname}
                      >
                        {u.nickname[0].toUpperCase()}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.filterSection}>
          <span className={styles.monoLabel}>FILTER BY DIET</span>
          <div className={styles.filterList}>
            {ALL_DIET_FILTERS.map((tag) => (
              <label key={tag} className={styles.filterItem}>
                <input
                  type="checkbox"
                  checked={filters.has(tag)}
                  onChange={() => toggleFilter(tag)}
                  className={styles.filterCheck}
                />
                <span
                  className={styles.filterLabel}
                  style={{
                    borderColor: filters.has(tag) ? DIET_TAG_COLORS[tag] : undefined,
                    color: filters.has(tag) ? DIET_TAG_COLORS[tag] : undefined,
                  }}
                >
                  {tag}
                </span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      <div className={styles.mapArea}>
        {hasToken ? (
          <div ref={mapContainer} className={styles.mapContainer} />
        ) : (
          <div className={styles.mapPlaceholder}>
            <p className={styles.placeholderText}>mapbox token not found</p>
            <p className={styles.placeholderHint}>
              add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
