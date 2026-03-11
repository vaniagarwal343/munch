'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { restaurants, Restaurant } from './restaurants';
import { QuizAnswers } from '../quiz/quizData';
import { supabase } from '../../lib/supabase';
import styles from './results.module.scss';

function parseClosingHour(hours: string): number {
  const timeMatches = hours.match(/(\d{1,2})(:\d{2})?\s*(am|pm)/gi);
  if (!timeMatches) return 0;
  const last = timeMatches[timeMatches.length - 1];
  const m = last.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (!m) return 0;
  let h = parseInt(m[1]);
  const period = m[3].toLowerCase();
  if (period === 'am' && h < 6) h += 24;
  else if (period === 'pm' && h !== 12) h += 12;
  else if (period === 'am' && h === 12) h = 0;
  return h;
}

function cuisineMatches(restaurantCuisine: string, userPick: string): boolean {
  const c = restaurantCuisine.toLowerCase();
  if (userPick === 'mediterranean') return c.includes('mediterranean') || c.includes('egyptian');
  if (userPick === 'indian') return c.includes('indian');
  if (userPick === 'thai') return c.includes('thai');
  if (userPick === 'mexican') return c.includes('mexican');
  if (userPick === 'chinese') return c.includes('chinese');
  if (userPick === 'american') return c.includes('american');
  if (userPick === 'salvadoran') return c.includes('salvadoran');
  if (userPick === 'cafe') return c === 'cafe' || c === 'gastropub';
  if (userPick === 'dining-hall') return c === 'dining-hall' || c === 'food-court' || c === 'grab-and-go';
  return false;
}

function scoreRestaurant(r: Restaurant, answers: QuizAnswers): number {
  let score = 0;

  const dietary = (answers.dietary as string[]) || [];
  if (dietary.includes('none') || dietary.length === 0) {
    score += 3;
  } else {
    const matches = dietary.filter((d) => r.tags.includes(d)).length;
    if (matches === dietary.length) score += 5;
    else if (matches > 0) score += 2;
    else return -1;
  }

  const cuisines = (answers.cuisine as string[]) || [];
  if (cuisines.includes('any') || cuisines.length === 0) {
    score += 2;
  } else {
    const hasMatch = cuisines.some((c) => cuisineMatches(r.cuisine, c));
    if (hasMatch) score += 3;
  }

  const vibe = answers.vibe as string;
  if (vibe === 'late-night') {
    const closing = parseClosingHour(r.hours);
    if (closing >= 23) score += 2;
  } else if (vibe === 'quick') {
    if (r.type === 'market' || r.cuisine === 'grab-and-go' || r.price === '$') score += 2;
  } else if (vibe === 'cafe') {
    if (r.cuisine === 'cafe' || r.cuisine === 'gastropub') score += 2;
  } else if (vibe === 'group') {
    if (r.price === '$$' || r.cuisine.includes('indian') || r.cuisine.includes('mediterranean')) score += 2;
  } else if (vibe === 'casual') {
    if (r.type !== 'market') score += 1;
  }

  const budget = answers.budget as string;
  if (budget === 'any') {
    score += 1;
  } else if (budget === r.price) {
    score += 2;
  } else if (budget === '$$' && r.price === '$') {
    score += 1;
  }

  const distance = answers.distance as string;
  if (distance === 'any') {
    score += 1;
  } else if (distance === 'on-campus' && r.zone === 'on-campus') {
    score += 1;
  } else if (distance === 'nearby') {
    score += 1;
  }

  return score;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const raw = searchParams.get('q');

  let nickname = '';
  let avatarColor = '#50A3A4';
  let dietary: string[] = [];
  let answers: QuizAnswers = {};
  try {
    if (raw) {
      const parsed = JSON.parse(decodeURIComponent(raw));
      nickname = parsed.nickname || '';
      avatarColor = parsed.avatarColor || '#50A3A4';
      dietary = parsed.dietary || [];
      answers = parsed.answers || {};
    }
  } catch {
    // fall through
  }

  const initial = nickname ? nickname[0].toUpperCase() : '?';

  const scored = restaurants
    .map((r) => ({ restaurant: r, score: scoreRestaurant(r, answers) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const topMatches = scored.slice(0, 8);
  const maxPossible = 13;

  async function handleHeading(restaurantId: string) {
    // Save to localStorage as fallback
    const data = { nickname, avatarColor, dietary, restaurantId };
    localStorage.setItem('munch-heading', JSON.stringify(data));

    // Insert into supabase
    try {
      const { data: userData } = await supabase
        .from('users')
        .insert({ nickname, avatar_color: avatarColor, dietary })
        .select('id')
        .single();

      if (userData) {
        await supabase.from('check_ins').insert({
          user_id: userData.id,
          restaurant_id: restaurantId,
          nickname,
          avatar_color: avatarColor,
          dietary,
        });
      }
    } catch {
      // supabase not configured — localStorage fallback is fine
    }

    router.push('/map');
  }

  return (
    <div className={styles.resultsPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.monoLabel}>YOUR MATCHES</span>
          {nickname && (
            <p className={styles.greeting}>
              <span
                className={styles.greetingAvatar}
                style={{ background: avatarColor }}
              >
                {initial}
              </span>
              hey {nickname}, here are your spots.
            </p>
          )}
        </div>

        {topMatches.length === 0 ? (
          <div className={styles.empty}>
            <h2>no matches found</h2>
            <p>try adjusting your preferences for more results.</p>
            <Link href="/quiz" className={styles.retakeBtn}>
              RETAKE QUIZ &rarr;
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {topMatches.map(({ restaurant, score }, i) => (
                <div key={restaurant.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.rank}>#{i + 1}</span>
                    <span className={styles.matchBadge}>
                      {Math.min(Math.round((score / maxPossible) * 100), 99)}%
                    </span>
                  </div>
                  <h3 className={styles.cardName}>{restaurant.name}</h3>
                  <span className={styles.cuisineLabel}>{restaurant.cuisine}</span>
                  <p className={styles.cardDesc}>
                    {restaurant.description.toLowerCase().slice(0, 100)}
                    {restaurant.description.length > 100 ? '...' : ''}
                  </p>
                  <div className={styles.cardMeta}>
                    <span className={styles.tag}>{restaurant.price}</span>
                    {restaurant.tags.slice(0, 3).map((t) => (
                      <span key={t} className={styles.dietTag}>{t}</span>
                    ))}
                  </div>
                  <button
                    className={styles.headingBtn}
                    onClick={() => handleHeading(restaurant.id)}
                  >
                    I&apos;M HEADING HERE &rarr;
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.actions}>
              <Link href="/quiz" className={styles.retakeBtn}>
                &larr; RETAKE QUIZ
              </Link>
              <Link href="/map" className={styles.mapBtn}>
                VIEW MAP &rarr;
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.resultsPage}>
          <div className={styles.container}>
            <p>loading results...</p>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
