'use client';

import { useState, useEffect } from 'react';
import styles from './BiteTitle.module.scss';

interface BiteTitleProps {
  size?: 'large' | 'hero';
}

export default function BiteTitle({ size = 'hero' }: BiteTitleProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`${styles.wrap} ${visible ? styles.visible : ''} ${styles[size]}`}>
      <h1 className={styles.title}>
        munch<span className={styles.dot}>.</span>
      </h1>
      {/* Single circular bite mark on the h */}
      <div className={styles.bite} />
    </div>
  );
}
