'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { restaurants, Restaurant } from './restaurants';
import { QuizAnswers } from '../quiz/quizData';
import { supabase } from '../../lib/supabase';
import styles from './results.module.scss';

function passesHardFilters(r: Restaurant, answers: QuizAnswers): boolean {
  // Budget filter
  const budget = answers.budget as string;
  if (budget === 'under-8') {
    if (r.price !== '$') return false;
  } else if (budget === '8-15') {
    if (r.price !== '$' && r.price !== '$') return false;
  } else if (budget === '15-25') {
    if (r.price !== '$' && r.price !== '$$') return false;
  }
  // "any" = no filtering

  // Distance filter
  const distance = answers.distance as string;
  if (distance === '5') {
    if (r.walkMinutes > 5) return false;
  } else if (distance === '10') {
    if (r.walkMinutes > 10) return false;
  } else if (distance === '20') {
    if (r.walkMinutes > 20) return false;
  }
  // "any" = no filtering

  return true;
}

function scoreRestaurant(r: Restaurant, answers: QuizAnswers): number {
  let score = 0;

  // Dietary: +3 per matching tag
  const dietary = (answers.dietary as string[]) || [];
  if (!dietary.includes('none') && dietary.length > 0) {
    const matches = dietary.filter((d) => r.tags.includes(d)).length;
    if (matches === 0) return -1; // must match at least one dietary need
    score += matches * 3;
  }

  // Cuisine: +2 per match
  const cuisines = (answers.cuisine as string[]) || [];
  if (!cuisines.includes('any') && cuisines.length > 0) {
    if (cuisines.includes(r.cuisine)) {
      score += 2;
    }
  } else {
    score += 2; // "anything goes" gets base points
  }

  // Vibe: +1 for match
  const vibe = answers.vibe as string;
  if (vibe && r.vibe.includes(vibe)) {
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

  // Calculate max possible score for percentage
  const dietaryAnswers = (answers.dietary as string[]) || [];
  const hasDietary = dietaryAnswers.length > 0 && !dietaryAnswers.includes('none');
  const maxPossible = (hasDietary ? dietaryAnswers.length * 3 : 0) + 2 + 1;

  const scored = restaurants
    .filter((r) => passesHardFilters(r, answers))
    .map((r) => ({ restaurant: r, score: scoreRestaurant(r, answers) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const topMatches = scored.slice(0, 8);

  async function handleHeading(restaurantId: string) {
    const data = { nickname, avatarColor, dietary, restaurantId };
    localStorage.setItem('munch-heading', JSON.stringify(data));

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
