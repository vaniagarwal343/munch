import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.stripe}>
        <span /><span /><span /><span />
      </div>
      <div className={styles.inner}>
        <p>built by vani agarwal &middot; info 490 &middot; uw seattle &middot; 2026</p>
      </div>
    </footer>
  );
}
