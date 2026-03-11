'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { quizQuestions, QuizAnswers } from './quizData';
import styles from './quiz.module.scss';

const AVATAR_COLORS = ['#674A40', '#50A3A4', '#FCAF38', '#F95335'];
const COLOR_NAMES: Record<string, string> = {
  '#674A40': 'brown',
  '#50A3A4': 'teal',
  '#FCAF38': 'amber',
  '#F95335': 'orange',
};

export default function QuizPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [nameComplete, setNameComplete] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const question = quizQuestions[step];
  const totalSteps = quizQuestions.length;
  const initial = nickname.trim() ? nickname.trim()[0].toUpperCase() : '?';

  const currentDisplay = nameComplete ? String(step + 2).padStart(2, '0') : '01';
  const totalDisplay = String(totalSteps + 1).padStart(2, '0');

  function handleNameContinue() {
    if (nickname.trim()) {
      setNameComplete(true);
    }
  }

  function handleSelect(value: string) {
    if (question.type === 'multi') {
      const current = (answers[question.id] as string[]) || [];
      if (value === 'none' || value === 'any') {
        setAnswers({ ...answers, [question.id]: [value] });
        return;
      }
      const filtered = current.filter((v) => v !== 'none' && v !== 'any');
      const updated = filtered.includes(value)
        ? filtered.filter((v) => v !== value)
        : [...filtered, value];
      setAnswers({ ...answers, [question.id]: updated });
    } else {
      setAnswers({ ...answers, [question.id]: value });
    }
  }

  function isSelected(value: string) {
    const ans = answers[question.id];
    if (Array.isArray(ans)) return ans.includes(value);
    return ans === value;
  }

  function canProceed() {
    const ans = answers[question.id];
    if (!ans) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    return true;
  }

  function handleNext() {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      const dietary = (answers.dietary as string[]) || [];
      const dietaryProfile = dietary.includes('none') ? [] : dietary;

      const payload = {
        nickname: nickname.trim(),
        avatarColor,
        dietary: dietaryProfile,
        answers,
      };
      const encoded = encodeURIComponent(JSON.stringify(payload));
      router.push(`/results?q=${encoded}`);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1);
    } else {
      setNameComplete(false);
    }
  }

  // Name your noms screen
  if (!nameComplete) {
    const hasName = nickname.trim().length > 0;

    return (
      <div className={styles.quizPage}>
        <div className={styles.quizContainer}>
          <span className={styles.counter}>{currentDisplay} / {totalDisplay}</span>
          <span className={styles.monoLabel}>NAME YOUR NOMS</span>
          <h1 className={styles.question}>what should we call you?</h1>

          <div className={styles.nameStep}>
            <div className={styles.nameLeft}>
              <input
                className={styles.nameInput}
                type="text"
                maxLength={16}
                placeholder="enter a nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameContinue()}
                autoFocus
              />

              <div className={styles.colorSection}>
                <span className={styles.monoLabelSmall}>PICK YOUR COLOR</span>
                <div className={styles.colorRow}>
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`${styles.colorSwatch} ${avatarColor === color ? styles.colorSelected : ''}`}
                      style={{ background: color }}
                      onClick={() => setAvatarColor(color)}
                      aria-label={COLOR_NAMES[color]}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.previewSection}>
              <span className={styles.monoLabelSmall}>THIS IS YOU</span>
              <div
                className={styles.avatarPreview}
                style={{ background: hasName ? avatarColor : 'rgba(103,74,64,0.1)' }}
              >
                <span className={styles.avatarInitial} style={{ color: hasName ? '#fff' : 'rgba(103,74,64,0.3)' }}>
                  {initial}
                </span>
              </div>
              {hasName && (
                <span className={styles.previewName}>{nickname.trim()}</span>
              )}
            </div>
          </div>

          <div className={styles.navButtons}>
            <span />
            <button
              className={styles.nextBtn}
              onClick={handleNameContinue}
              disabled={!hasName}
            >
              NEXT &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz questions
  return (
    <div className={styles.quizPage}>
      <div className={styles.quizContainer}>
        <span className={styles.counter}>{currentDisplay} / {totalDisplay}</span>
        <h1 className={styles.question}>{question.question}</h1>
        {question.subtitle && (
          <p className={styles.subtitle}>{question.subtitle}</p>
        )}

        <div className={styles.options}>
          {question.options?.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.option} ${isSelected(opt.value) ? styles.selected : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className={styles.navButtons}>
          <button className={styles.backBtn} onClick={handleBack}>
            &larr; BACK
          </button>
          <button
            className={styles.nextBtn}
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {step === totalSteps - 1 ? 'SEE RESULTS \u2192' : 'NEXT \u2192'}
          </button>
        </div>
      </div>
    </div>
  );
}
