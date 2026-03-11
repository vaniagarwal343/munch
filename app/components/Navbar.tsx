'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './Navbar.module.scss';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.stripe}>
        <span /><span /><span /><span />
      </div>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          munch
        </Link>
        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`${styles.bar} ${menuOpen ? styles.open : ''}`} />
        </button>
        <ul className={`${styles.links} ${menuOpen ? styles.active : ''}`}>
          <li><Link href="/quiz" onClick={() => setMenuOpen(false)}>take the quiz</Link></li>
          <li><Link href="/map" onClick={() => setMenuOpen(false)}>live map</Link></li>
        </ul>
      </div>
    </nav>
  );
}
