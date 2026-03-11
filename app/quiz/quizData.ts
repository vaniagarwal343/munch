export interface QuizQuestion {
  id: string;
  question: string;
  subtitle?: string;
  type: 'multi' | 'single';
  options: { label: string; value: string }[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'dietary',
    question: 'any dietary restrictions?',
    subtitle: 'select all that apply.',
    type: 'multi',
    options: [
      { label: 'vegetarian', value: 'vegetarian' },
      { label: 'vegan', value: 'vegan' },
      { label: 'gluten-free', value: 'gluten-free' },
      { label: 'halal', value: 'halal' },
      { label: 'none', value: 'none' },
    ],
  },
  {
    id: 'cuisine',
    question: 'what cuisines are you into?',
    subtitle: 'pick your favorites.',
    type: 'multi',
    options: [
      { label: 'thai', value: 'thai' },
      { label: 'indian', value: 'indian' },
      { label: 'mediterranean', value: 'mediterranean' },
      { label: 'mexican', value: 'mexican' },
      { label: 'chinese', value: 'chinese' },
      { label: 'american', value: 'american' },
      { label: 'salvadoran', value: 'salvadoran' },
      { label: 'cafe', value: 'cafe' },
      { label: 'dining hall', value: 'dining-hall' },
      { label: 'anything goes', value: 'any' },
    ],
  },
  {
    id: 'vibe',
    question: 'what vibe are you looking for?',
    type: 'single',
    options: [
      { label: 'quick grab-and-go', value: 'quick' },
      { label: 'casual sit-down', value: 'casual' },
      { label: 'study-friendly cafe', value: 'cafe' },
      { label: 'group hangout spot', value: 'group' },
      { label: 'late-night eats', value: 'late-night' },
    ],
  },
  {
    id: 'budget',
    question: "what's your budget per meal?",
    type: 'single',
    options: [
      { label: 'under $8', value: '$' },
      { label: '$8 – $15', value: '$$' },
      { label: "don't care", value: 'any' },
    ],
  },
  {
    id: 'distance',
    question: 'how far will you walk?',
    type: 'single',
    options: [
      { label: 'on campus only', value: 'on-campus' },
      { label: "i'll walk to the ave", value: 'nearby' },
      { label: 'anywhere nearby', value: 'any' },
    ],
  },
];

export type QuizAnswers = Record<string, string | string[]>;
