import Link from 'next/link';
import BiteTitle from './components/BiteTitle';
import styles from './page.module.scss';

const TESTIMONIALS = [
  {
    quote:
      'i rarely eat on campus nowadays. the dining halls just don\u2019t have options for my religious dietary needs.',
    attribution: 'hindu student',
    color: '#50A3A4',
  },
  {
    quote:
      'there are international students who came from arab countries and they can\u2019t find access to halal meat on campus.',
    attribution: 'muslim student association president',
    color: '#FCAF38',
  },
  {
    quote:
      'i\u2019ll check what\u2019s listed online before going, and then they\u2019re not actually serving it.',
    attribution: 'uw junior',
    color: '#F95335',
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      {/* hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <div className={styles.biteTitleWrap}>
              <BiteTitle size="large" />
            </div>
            <h1 className={styles.headline}>
              you moved across the world. finding{' '}
              <span className={styles.accent}>food</span> shouldn&apos;t be
              the hard part.
            </h1>
            <p className={styles.heroSub}>
              a dining guide for uw students with dietary restrictions. take a
              30-second quiz. see what works for you.
            </p>
            <Link href="/quiz" className={styles.cta}>
              TAKE THE QUIZ &rarr;
            </Link>
          </div>

          <div className={styles.heroRight}>
            <span className={styles.monoLabel}>FROM A STUDENT</span>
            <blockquote className={styles.pullQuote}>
              <p>
                &ldquo;i&apos;m vegetarian, so situating myself in the US when i
                moved here for university was a decent struggle. i want to
                explore this more and see if the process can be made
                easier.&rdquo;
              </p>
              <cite>vani agarwal, class discussion post</cite>
            </blockquote>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.monoLabel}>HOW IT WORKS</span>
            <div className={styles.rule} />
          </div>

          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNum}>01</span>
              <h3>take the quiz</h3>
              <p>
                answer 5 quick questions about your dietary needs, cuisine
                preferences, and budget.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>02</span>
              <h3>get matched</h3>
              <p>
                we rank restaurants near uw campus based on what actually works
                for you.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>03</span>
              <h3>see the map</h3>
              <p>
                pick a spot and see where other students are eating in real
                time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* testimonials */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.monoLabel}>WHAT STUDENTS SAY</span>
            <div className={styles.rule} />
          </div>

          <div className={styles.testimonials}>
            {TESTIMONIALS.map((t, i) => (
              <blockquote
                key={i}
                className={styles.testimonial}
                style={{ borderLeftColor: t.color }}
              >
                <p>&ldquo;{t.quote}&rdquo;</p>
                <cite>{t.attribution}</cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
