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
    const t2 = setTimeout(() => setPhase(2), 1300);
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

      {/* Bite mark — overlapping circles */}
      {phase >= 2 && (
        <div className={styles.bite}>
          <div className={styles.circle1} />
          <div className={styles.circle2} />
          <div className={styles.circle3} />
          <div className={styles.circle4} />
        </div>
      )}

      {/* Crumb particles */}
      {phase >= 2 && (
        <div className={styles.crumbs}>
          <span className={styles.crumb} style={{ '--cx': '32px', '--cy': '-28px', '--delay': '0s', '--size': '6px' } as React.CSSProperties} />
          <span className={styles.crumb} style={{ '--cx': '50px', '--cy': '-14px', '--delay': '0.04s', '--size': '4px' } as React.CSSProperties} />
          <span className={styles.crumb} style={{ '--cx': '22px', '--cy': '-42px', '--delay': '0.07s', '--size': '5px' } as React.CSSProperties} />
          <span className={styles.crumb} style={{ '--cx': '44px', '--cy': '8px', '--delay': '0.02s', '--size': '3px' } as React.CSSProperties} />
          <span className={styles.crumb} style={{ '--cx': '56px', '--cy': '-34px', '--delay': '0.1s', '--size': '4px' } as React.CSSProperties} />
        </div>
      )}
    </div>
  );
}
