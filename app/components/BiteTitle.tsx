'use client';

import { useState, useEffect } from 'react';
import styles from './BiteTitle.module.scss';

interface BiteTitleProps {
  size?: 'large' | 'hero';
}

export default function BiteTitle({ size = 'hero' }: BiteTitleProps) {
  // 0: hidden, 1: text fades in, 2: bite + crumbs
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className={`${styles.wrap} ${phase >= 1 ? styles.visible : ''} ${styles[size]}`}>
      <h1 className={styles.title}>
        munch<span className={styles.dot}>.</span>
      </h1>

      {/* Bite marks — multiple overlapping circles for jagged bite shape */}
      {phase >= 2 && (
        <div className={styles.bite}>
          <div className={styles.biteMain} />
          <div className={styles.biteSec1} />
          <div className={styles.biteSec2} />
          <div className={styles.biteSec3} />
        </div>
      )}

      {/* Crumb particles flying off on bite */}
      {phase >= 2 && (
        <div className={styles.crumbOrigin}>
          <span className={styles.crumb0} />
          <span className={styles.crumb1} />
          <span className={styles.crumb2} />
          <span className={styles.crumb3} />
          <span className={styles.crumb4} />
        </div>
      )}
    </div>
  );
}
