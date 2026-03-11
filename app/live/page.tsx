'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import BiteTitle from '../components/BiteTitle';
import styles from './live.module.scss';

interface DisplayUser {
  nickname: string;
  color: string;
}

export default function LivePage() {
  const [users, setUsers] = useState<DisplayUser[]>([]);

  // Fetch existing check-ins from supabase
  useEffect(() => {
    let cancelled = false;

    async function fetchCheckIns() {
      try {
        const { data, error } = await supabase
          .from('check_ins')
          .select('nickname, avatar_color')
          .order('created_at', { ascending: true });

        if (!error && data && !cancelled) {
          const realUsers: DisplayUser[] = data.map((row) => ({
            nickname: row.nickname,
            color: row.avatar_color,
          }));
          setUsers(realUsers);
        }
      } catch {
        // supabase not configured — show 0 users
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className={styles.livePage}>
      <div className={styles.stripe}>
        <span /><span /><span /><span />
      </div>

      <div className={styles.content}>
        <BiteTitle size="hero" />

        <Link href="/quiz" className={styles.quizLink}>
          TAKE THE QUIZ &rarr;
        </Link>

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
