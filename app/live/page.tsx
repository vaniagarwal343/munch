'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import BiteTitle from '../components/BiteTitle';
import styles from './live.module.scss';

const SIM_USERS = [
  { nickname: 'priya', color: '#FCAF38' },
  { nickname: 'omar', color: '#50A3A4' },
  { nickname: 'mei', color: '#F95335' },
  { nickname: 'kai', color: '#674A40' },
  { nickname: 'sofia', color: '#FCAF38' },
  { nickname: 'james', color: '#50A3A4' },
  { nickname: 'anika', color: '#F95335' },
  { nickname: 'dex', color: '#674A40' },
  { nickname: 'luna', color: '#50A3A4' },
  { nickname: 'rio', color: '#FCAF38' },
  { nickname: 'zara', color: '#F95335' },
  { nickname: 'noah', color: '#674A40' },
  { nickname: 'isha', color: '#FCAF38' },
  { nickname: 'liam', color: '#50A3A4' },
  { nickname: 'yuki', color: '#F95335' },
];

interface DisplayUser {
  nickname: string;
  color: string;
}

export default function LivePage() {
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const simIndexRef = useRef(0);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Try to fetch real check-ins from supabase
  useEffect(() => {
    let cancelled = false;

    async function fetchCheckIns() {
      try {
        const { data, error } = await supabase
          .from('check_ins')
          .select('nickname, avatar_color')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0 && !cancelled) {
          const realUsers: DisplayUser[] = data.map((row) => ({
            nickname: row.nickname,
            color: row.avatar_color,
          }));
          setUsers(realUsers);
          setSupabaseReady(true);
          return;
        }
      } catch {
        // supabase not configured — fall through to simulation
      }

      if (!cancelled) {
        setSupabaseReady(false);
      }
    }

    fetchCheckIns();
    return () => { cancelled = true; };
  }, []);

  // Subscribe to realtime check-ins
  useEffect(() => {
    const channel = supabase
      .channel('live-check-ins')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'check_ins' },
        (payload) => {
          const row = payload.new as { nickname: string; avatar_color: string };
          setUsers((prev) => [...prev, { nickname: row.nickname, color: row.avatar_color }]);
          setSupabaseReady(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fallback: simulate users if supabase has no data
  useEffect(() => {
    if (supabaseReady) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      return;
    }

    simIntervalRef.current = setInterval(() => {
      if (simIndexRef.current >= SIM_USERS.length) {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
        return;
      }
      const user = SIM_USERS[simIndexRef.current];
      simIndexRef.current++;
      setUsers((prev) => [...prev, user]);
    }, 3000);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [supabaseReady]);

  return (
    <div className={styles.livePage}>
      <div className={styles.content}>
        <BiteTitle size="hero" />

        <p className={styles.counter}>
          {users.length} STUDENT{users.length !== 1 ? 'S' : ''} JOINED
        </p>

        {users.length > 0 && (
          <div className={styles.avatarRow}>
            {users.map((u, i) => (
              <span
                key={i}
                className={styles.avatar}
                style={{ background: u.color, animationDelay: `${i * 0.05}s` }}
              >
                {u.nickname[0].toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.stripe}>
        <span /><span /><span /><span />
      </div>
    </div>
  );
}
