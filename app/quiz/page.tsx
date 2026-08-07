'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCcw,
  Star,
  MapPin,
  Heart,
  Compass,
  Building2,
  Mountain,
  Waves,
  Hotel,
  Utensils,
  DollarSign,
  Clock,
  Sun,
  CloudSnow,
  Cloud,
  Users,
  Camera,
  ShoppingBag,
  Calendar,
  BookOpen,
  Crown,
  Plane,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { QUIZ_QUESTIONS } from '@/lib/feature-constants';
import { DESTINATIONS } from '@/lib/constants';
import { cn, formatCurrency } from '@/lib/utils';
import SectionHeading from '@/components/shared/SectionHeading';
import type { Destination, TravelStyle } from '@/types';

/* ------------------------------------------------------------------ */
/* Static config                                                       */
/* ------------------------------------------------------------------ */

type QuizState = 'start' | 'quiz' | 'results';

/** Map the string `icon` keys on quiz options to real lucide components. */
const OPTION_ICONS: Record<string, LucideIcon> = {
  building: Building2,
  mountain: Mountain,
  waves: Waves,
  hotel: Hotel,
  utensils: Utensils,
  dollar: DollarSign,
  clock: Clock,
  sun: Sun,
  'cloud-snow': CloudSnow,
  cloud: Cloud,
  user: Users,
  users: Users,
  heart: Heart,
  ticket: Compass,
  camera: Camera,
  'shopping-bag': ShoppingBag,
  palette: Compass,
  compass: Compass,
  calendar: Calendar,
  sparkles: Sparkles,
  crown: Crown,
  car: Plane,
  train: Plane,
  'book-open': BookOpen,
  home: Hotel,
};

/** Each travel style maps to the destination ids it suits best.
 *  (Thailand is referenced in the spec but absent from DESTINATIONS,
 *  so `budget` resolves to Bali.) */
const STYLE_DESTINATIONS: Record<TravelStyle, string[]> = {
  luxury: ['dubai', 'switzerland'],
  adventure: ['bali', 'newyork'],
  cultural: ['paris', 'tokyo'],
  relaxation: ['bali', 'switzerland'],
  family: ['newyork', 'dubai'],
  budget: ['bali'],
};

type Personality = {
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: string; // tailwind text color
  glow: string; // tailwind bg/border classes
};

const PERSONALITIES: Record<TravelStyle, Personality> = {
  luxury: {
    name: 'The Luxury Seeker',
    tagline: 'First-class or nothing',
    description:
      'You travel for the finer things — five-star resorts, Michelin dining, and seamless concierge service. Comfort and exclusivity define your perfect trip.',
    icon: Crown,
    accent: 'text-amber-300',
    glow: 'bg-amber-500/10 border-amber-500/30',
  },
  adventure: {
    name: 'The Adventurer',
    tagline: 'Collect moments, not things',
    description:
      'You chase the unfamiliar — dawn hikes, hidden trails, and spontaneous detours. For you, the journey is the destination and every day is an expedition.',
    icon: Compass,
    accent: 'text-emerald-300',
    glow: 'bg-emerald-500/10 border-emerald-500/30',
  },
  cultural: {
    name: 'The Cultural Explorer',
    tagline: 'Travel to learn',
    description:
      'Museums, ancient ruins, and local cooking classes call your name. You travel to understand a place deeply — its history, art, and everyday life.',
    icon: Building2,
    accent: 'text-sky-300',
    glow: 'bg-sky-500/10 border-sky-500/30',
  },
  relaxation: {
    name: 'The Relaxation Seeker',
    tagline: 'Relax and recharge',
    description:
      'Your ideal trip unwinds the clock — beach yoga, spa days, and slow mornings by the water. You travel to restore, not to rush.',
    icon: Waves,
    accent: 'text-cyan-300',
    glow: 'bg-cyan-500/10 border-cyan-500/30',
  },
  family: {
    name: 'The Family Voyager',
    tagline: 'Memories, together',
    description:
      'Theme parks, roomy villas, and flexible itineraries — you plan trips the whole crew will love, balancing adventure with comfort and convenience.',
    icon: Users,
    accent: 'text-violet-300',
    glow: 'bg-violet-500/10 border-violet-500/30',
  },
  budget: {
    name: 'The Budget Explorer',
    tagline: 'Stretch every dollar',
    description:
      'Street food, local transit, and weekend getaways are your specialty. You prove that the richest experiences don\'t require the biggest budget.',
    icon: DollarSign,
    accent: 'text-lime-300',
    glow: 'bg-lime-500/10 border-lime-500/30',
  },
};

const TOTAL_QUESTIONS = QUIZ_QUESTIONS.length;

/* ------------------------------------------------------------------ */
/* Scoring helpers                                                     */
/* ------------------------------------------------------------------ */

type ScoredDestination = {
  destination: Destination;
  matchScore: number;
  reasons: string[];
};

function computeResults(answers: string[]): {
  dominant: TravelStyle;
  styleCounts: Record<TravelStyle, number>;
  recommendations: ScoredDestination[];
} {
  const styleCounts: Record<TravelStyle, number> = {
    luxury: 0,
    adventure: 0,
    budget: 0,
    cultural: 0,
    relaxation: 0,
    family: 0,
  };

  for (const value of answers) {
    if (value in styleCounts) {
      styleCounts[value as TravelStyle] += 1;
    }
  }

  // Dominant style = most frequently selected (ties broken by declaration order).
  let dominant: TravelStyle = 'cultural';
  let max = -1;
  (Object.keys(styleCounts) as TravelStyle[]).forEach((style) => {
    if (styleCounts[style] > max) {
      max = styleCounts[style];
      dominant = style;
    }
  });

  // Affinity per destination — the dominant style counts double so its
  // mapped destinations reliably surface at the top of the recommendations.
  const affinity: Record<string, number> = {};
  for (const dest of DESTINATIONS) {
    let score = 0;
    for (const style of Object.keys(styleCounts) as TravelStyle[]) {
      const recommends = STYLE_DESTINATIONS[style].includes(dest.id);
      if (!recommends) continue;
      score += styleCounts[style] * (style === dominant ? 2 : 1);
    }
    affinity[dest.id] = score;
  }

  const maxAffinity = Math.max(1, ...Object.values(affinity));

  const recommendations: ScoredDestination[] = DESTINATIONS.map((destination) => {
    const raw = affinity[destination.id] ?? 0;
    const matchScore = Math.round((raw / maxAffinity) * 100);

    const reasons: string[] = [];
    (Object.keys(styleCounts) as TravelStyle[]).forEach((style) => {
      if (styleCounts[style] > 0 && STYLE_DESTINATIONS[style].includes(destination.id)) {
        reasons.push(style);
      }
    });

    return { destination, matchScore, reasons };
  })
    .sort((a, b) => b.matchScore - a.matchScore || b.destination.rating - a.destination.rating)
    .slice(0, 3);

  return { dominant, styleCounts, recommendations };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function QuizPage() {
  const [state, setState] = useState<QuizState>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [direction, setDirection] = useState(1); // 1 forward, -1 back

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const selectedValue = answers[currentIndex] ?? null;

  const results = useMemo(
    () => (state === 'results' ? computeResults(answers) : null),
    [state, answers],
  );

  const startQuiz = useCallback(() => {
    setAnswers([]);
    setCurrentIndex(0);
    setDirection(1);
    setState('quiz');
  }, []);

  const retake = useCallback(() => {
    setAnswers([]);
    setCurrentIndex(0);
    setDirection(1);
    setState('start');
  }, []);

  const selectOption = useCallback(
    (value: string) => {
      const next = [...answers];
      next[currentIndex] = value;
      setAnswers(next);

      // Brief delay so the selection highlight is visible before transitioning.
      window.setTimeout(() => {
        if (currentIndex + 1 < TOTAL_QUESTIONS) {
          setDirection(1);
          setCurrentIndex((i) => i + 1);
        } else {
          setDirection(1);
          setState('results');
        }
      }, 280);
    },
    [answers, currentIndex],
  );

  const goBack = useCallback(() => {
    if (currentIndex === 0) {
      setDirection(-1);
      setState('start');
      return;
    }
    setDirection(-1);
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, [currentIndex]);

  const progress = state === 'quiz' ? ((currentIndex + 1) / TOTAL_QUESTIONS) * 100 : 0;

  return (
    <div className="relative min-h-screen pt-24">
      {/* Background flourishes */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 bg-aurora opacity-30" />

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        <SectionHeading
          badge="AI Travel Personality Quiz"
          badgeColor="purple"
          title={
            <>
              <span className="text-white">Discover Your </span>
              <span className="text-gradient-blue">Travel Style</span>
            </>
          }
          description="Answer 12 quick questions and we'll match you with the destinations that fit the way you love to travel."
        />

        <div className="mt-12">
          <AnimatePresence mode="wait" custom={direction}>
            {state === 'start' && (
              <StartScreen key="start" onStart={startQuiz} />
            )}

            {state === 'quiz' && currentQuestion && (
              <QuizScreen
                key={`quiz-${currentQuestion.id}`}
                direction={direction}
                index={currentIndex}
                total={TOTAL_QUESTIONS}
                progress={progress}
                question={currentQuestion.question}
                options={currentQuestion.options}
                selectedValue={selectedValue}
                onSelect={selectOption}
                onBack={goBack}
              />
            )}

            {state === 'results' && results && (
              <ResultsScreen
                key="results"
                direction={direction}
                dominant={results.dominant}
                styleCounts={results.styleCounts}
                recommendations={results.recommendations}
                onRetake={retake}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Start screen                                                        */
/* ------------------------------------------------------------------ */

function StartScreen({ onStart }: { onStart: () => void }) {
  const highlights = [
    { icon: Sparkles, label: '12 curated questions' },
    { icon: Compass, label: '6 travel personalities' },
    { icon: MapPin, label: 'Personalized destinations' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4 }}
      className="glass-strong mx-auto max-w-2xl rounded-3xl p-8 text-center sm:p-12"
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 ring-1 ring-white/10">
        <Compass className="h-10 w-10 text-purple-300" />
      </div>
      <h3 className="font-display text-3xl font-bold text-white">
        Find your travel personality
      </h3>
      <p className="mx-auto mt-4 max-w-md text-muted-foreground">
        There are no right answers — just honest ones. In under two minutes you'll
        learn your dominant travel style and get three destinations matched to it.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {highlights.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80"
          >
            <Icon className="h-4 w-4 text-purple-300" />
            {label}
          </span>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-purple-500/20 transition-colors hover:from-purple-400 hover:to-blue-400"
      >
        Start Quiz
        <ArrowRight className="h-5 w-5" />
      </motion.button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Quiz screen                                                         */
/* ------------------------------------------------------------------ */

type QuizScreenProps = {
  direction: number;
  index: number;
  total: number;
  progress: number;
  question: string;
  options: { label: string; value: string; icon: string }[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  onBack: () => void;
};

function QuizScreen({
  direction,
  index,
  total,
  progress,
  question,
  options,
  selectedValue,
  onSelect,
  onBack,
}: QuizScreenProps) {
  const slide = {
    enter: { opacity: 0, x: direction > 0 ? 60 : -60 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction > 0 ? -60 : 60 },
  };

  return (
    <motion.div
      custom={direction}
      variants={slide}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {/* Progress bar + counter */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-white/80">
            Question{' '}
            <span className="text-gradient-blue">{index + 1}</span>{' '}
            <span className="text-muted-foreground">of {total}</span>
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="glass-strong rounded-3xl p-6 sm:p-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`q-${index}`}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {question}
            </h3>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {options.map((option, i) => {
                const Icon = OPTION_ICONS[option.icon] ?? Sparkles;
                const isSelected = selectedValue === option.value;
                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * i }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(option.value)}
                    className={cn(
                      'group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-5 text-left transition-colors',
                      isSelected
                        ? 'border-purple-500/60 bg-purple-500/15'
                        : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
                        isSelected
                          ? 'bg-purple-500/30 text-purple-200'
                          : 'bg-white/10 text-white/70 group-hover:bg-white/15 group-hover:text-white',
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="flex-1 font-medium text-white">{option.label}</span>
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all',
                        isSelected
                          ? 'border-purple-400 bg-purple-400 text-black opacity-100'
                          : 'border-white/20 text-transparent opacity-0 group-hover:opacity-60',
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Back control */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {index === 0 ? 'Back to intro' : 'Previous'}
          </button>
          <span className="text-xs text-muted-foreground">
            {index + 1} / {total}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Results screen                                                      */
/* ------------------------------------------------------------------ */

type ResultsScreenProps = {
  direction: number;
  dominant: TravelStyle;
  styleCounts: Record<TravelStyle, number>;
  recommendations: ScoredDestination[];
  onRetake: () => void;
};

function ResultsScreen({
  direction,
  dominant,
  styleCounts,
  recommendations,
  onRetake,
}: ResultsScreenProps) {
  const personality = PERSONALITIES[dominant];
  const PersonalityIcon = personality.icon;
  const topMatch = recommendations[0]?.matchScore ?? 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4 }}
    >
      {/* Personality hero */}
      <div className={cn('glass-strong relative overflow-hidden rounded-3xl border p-8 text-center sm:p-12', personality.glow)}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
          className={cn('mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border', personality.glow)}
        >
          <PersonalityIcon className={cn('h-10 w-10', personality.accent)} />
        </motion.div>

        <span className={cn('text-sm font-semibold uppercase tracking-widest', personality.accent)}>
          Your travel personality
        </span>
        <h3 className="font-display mt-2 text-4xl font-bold text-white sm:text-5xl">
          {personality.name}
        </h3>
        <p className={cn('mt-1 text-sm font-medium', personality.accent)}>
          “{personality.tagline}”
        </p>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          {personality.description}
        </p>

        {/* Style breakdown chips */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {(Object.keys(styleCounts) as TravelStyle[]).map((style) => {
            const count = styleCounts[style];
            if (count === 0) return null;
            const p = PERSONALITIES[style];
            const PIcon = p.icon;
            const isDominant = style === dominant;
            return (
              <span
                key={style}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
                  isDominant
                    ? cn(p.glow, p.accent)
                    : 'border-white/10 bg-white/5 text-white/60',
                )}
              >
                <PIcon className="h-3.5 w-3.5" />
                {p.name.replace('The ', '')}
                <span className="opacity-60">· {count}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Recommendations heading */}
      <div className="mt-12 flex items-center justify-between gap-4">
        <div>
          <h4 className="font-display text-2xl font-bold text-white">
            Your matched destinations
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Ranked by how well they fit your answers — top match{' '}
            <span className="font-semibold text-white">{topMatch}%</span>.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRetake}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/20 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Retake Quiz
        </motion.button>
      </div>

      {/* Recommendation cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={rec.destination.id} rec={rec} rank={i} />
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Recommendation card                                                 */
/* ------------------------------------------------------------------ */

function RecommendationCard({ rec, rank }: { rec: ScoredDestination; rank: number }) {
  const { destination, matchScore } = rec;
  const rankLabels = ['Best match', 'Great match', 'Good match'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 + rank * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -6 }}
      className="group glass-strong flex flex-col overflow-hidden rounded-2xl"
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Match score badge */}
        <div className="absolute right-3 top-3 flex flex-col items-end">
          <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            {rankLabels[rank] ?? 'Match'}
          </span>
          <span className="mt-1.5 font-display text-2xl font-bold text-emerald-300 drop-shadow-md">
            {matchScore}%
          </span>
        </div>

        {/* Name + country */}
        <div className="absolute bottom-3 left-4">
          <h5 className="font-display text-xl font-bold text-white drop-shadow-md">
            {destination.name}
          </h5>
          <p className="flex items-center gap-1 text-xs text-white/70">
            <MapPin className="h-3 w-3" /> {destination.country}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-muted-foreground">{destination.description}</p>

        {/* Quick facts */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-white/70">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            {destination.rating.toFixed(1)}{' '}
            <span className="text-muted-foreground">({destination.reviews.toLocaleString()})</span>
          </span>
          <span className="flex items-center gap-1.5 text-white/70">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            {formatCurrency(destination.budgetPerDay, destination.currency)}
            <span className="text-muted-foreground">/day</span>
          </span>
          <span className="flex items-center gap-1.5 text-white/70">
            <Calendar className="h-3.5 w-3.5 text-blue-400" />
            {destination.bestSeason}
          </span>
          <span className="flex items-center gap-1.5 text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            {destination.attractions.length} attractions
          </span>
        </div>

        {/* Top attractions */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {destination.attractions.slice(0, 3).map((attraction) => (
            <span
              key={attraction}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/60"
            >
              {attraction}
            </span>
          ))}
        </div>

        {/* CTA */}
        <a
          href={`/planner?dest=${destination.id}`}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/10"
        >
          Plan this trip
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </motion.div>
  );
}
