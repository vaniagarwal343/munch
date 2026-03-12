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
      { label: 'halal', value: 'halal' },
      { label: 'gluten-free', value: 'gluten-free' },
      { label: 'kosher', value: 'kosher' },
      { label: 'dairy-free', value: 'dairy-free' },
      { label: 'nut-free', value: 'nut-free' },
      { label: 'none', value: 'none' },
    ],
  },
  {
    id: 'cuisine',
    question: 'what cuisines are you into?',
    subtitle: 'pick your favorites.',
    type: 'multi',
    options: [
      { label: 'indian', value: 'indian' },
      { label: 'thai', value: 'thai' },
      { label: 'vietnamese', value: 'vietnamese' },
      { label: 'chinese', value: 'chinese' },
      { label: 'korean', value: 'korean' },
      { label: 'japanese', value: 'japanese' },
      { label: 'mexican', value: 'mexican' },
      { label: 'mediterranean', value: 'mediterranean' },
      { label: 'italian', value: 'italian' },
      { label: 'american', value: 'american' },
      { label: 'anything goes', value: 'any' },
    ],
  },
  {
    id: 'vibe',
    question: 'what vibe are you looking for?',
    type: 'single',
    options: [
      { label: 'quick grab-and-go', value: 'quick-grab' },
      { label: 'casual sit-down', value: 'casual-sit-down' },
      { label: 'study-friendly café', value: 'study-cafe' },
      { label: 'group hangout spot', value: 'group-hangout' },
      { label: 'late-night eats', value: 'late-night' },
    ],
  },
  {
    id: 'budget',
    question: "what's your budget per meal?",
    type: 'single',
    options: [
      { label: 'under $8', value: 'under-8' },
      { label: '$8–15', value: '8-15' },
      { label: '$15–25', value: '15-25' },
      { label: 'treat yourself', value: 'any' },
    ],
  },
  {
    id: 'distance',
    question: 'how far will you walk?',
    type: 'single',
    options: [
      { label: '5 min or less', value: '5' },
      { label: 'up to 10 min', value: '10' },
      { label: 'up to 20 min', value: '20' },
      { label: "i'll bus or drive", value: 'any' },
    ],
  },
];

export type QuizAnswers = Record<string, string | string[]>;
