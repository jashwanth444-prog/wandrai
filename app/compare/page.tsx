'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Wallet, Utensils, Moon, Shield, Wifi, Car, MapPin, Mountain,
  Users, ArrowLeftRight, Check, X, Star, TrendingUp, Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DESTINATIONS } from '@/lib/constants';
import {
  DESTINATION_COMPARISON_DATA,
  COMPARISON_METRICS,
} from '@/lib/feature-constants';
import { cn, formatCurrency } from '@/lib/utils';
import SectionHeading from '@/components/shared/SectionHeading';
import type { Destination } from '@/types';

/* Map COMPARISON_METRICS icon strings to actual icon components */
const METRIC_ICONS: Record<string, LucideIcon> = {
  sun: Sun,
  wallet: Wallet,
  utensils: Utensils,
  moon: Moon,
  shield: Shield,
  wifi: Wifi,
  car: Car,
  'map-pin': MapPin,
  mountain: Mountain,
  users: Users,
};

/* Destinations that have comparison data available */
const COMPARABLE_DESTINATIONS = DESTINATIONS.filter((d) =>
  DESTINATION_COMPARISON_DATA[d.id]
);

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: i * 0.06,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  }),
};

export default function ComparePage() {
  const [leftId, setLeftId] = useState<string>('paris');
  const [rightId, setRightId] = useState<string>('tokyo');

  const left = useMemo(
    () => DESTINATIONS.find((d) => d.id === leftId) ?? null,
    [leftId]
  );
  const right = useMemo(
    () => DESTINATIONS.find((d) => d.id === rightId) ?? null,
    [rightId]
  );

  const leftScores = leftId ? DESTINATION_COMPARISON_DATA[leftId] : null;
  const rightScores = rightId ? DESTINATION_COMPARISON_DATA[rightId] : null;

  const bothSelected = Boolean(left && right && leftScores && rightScores);

  /* Overall winner computed from average of all metric scores */
  const { overallWinner, leftWins, rightWins, ties } = useMemo(() => {
    if (!leftScores || !rightScores || !left || !right) {
      return { overallWinner: null as Destination | null, leftWins: 0, rightWins: 0, ties: 0 };
    }
    let lw = 0;
    let rw = 0;
    let t = 0;
    for (const metric of COMPARISON_METRICS) {
      const a = leftScores[metric.key] ?? 0;
      const b = rightScores[metric.key] ?? 0;
      if (a > b) lw += 1;
      else if (b > a) rw += 1;
      else t += 1;
    }
    const winner = lw === rw ? null : lw > rw ? left : right;
    return { overallWinner: winner, leftWins: lw, rightWins: rw, ties: t };
  }, [leftScores, rightScores, left, right]);

  const swapDestinations = () => {
    setLeftId(rightId);
    setRightId(leftId);
  };

  return (
    <div className="relative min-h-screen pt-24">
      {/* Background flourishes */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 bg-aurora opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 py-12">
        {/* Heading */}
        <SectionHeading
          badge="Destination Comparison"
          badgeColor="purple"
          title={
            <>
              <span className="text-white">Compare </span>
              <span className="text-gradient-blue">Destinations</span>
            </>
          }
          description="Pick two destinations and stack them side by side — weather, budget, food, safety, and more — to find your perfect match."
        />

        {/* Selectors + VS badge */}
        <div className="mt-12 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:justify-center">
          <DestinationSelector
            value={leftId}
            onChange={setLeftId}
            excludeId={rightId}
            side="left"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
            className="flex shrink-0 items-center justify-center"
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-purple-500/40 bg-purple-500/10 backdrop-blur-md">
              <span className="font-display text-lg font-black tracking-tight text-purple-300">
                VS
              </span>
              <motion.span
                className="absolute inset-0 rounded-full border border-purple-500/40"
                animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              />
              <button
                onClick={swapDestinations}
                aria-label="Swap destinations"
                className="absolute -bottom-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-slate-900 text-white/70 shadow-lg transition-colors hover:border-purple-500/50 hover:text-purple-300"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>

          <DestinationSelector
            value={rightId}
            onChange={setRightId}
            excludeId={leftId}
            side="right"
          />
        </div>

        {/* Comparison body */}
        <AnimatePresence mode="wait">
          {bothSelected ? (
            <motion.div
              key={`${leftId}-${rightId}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mt-12 space-y-8"
            >
              {/* Side-by-side destination cards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <DestinationHeroCard destination={left} index={0} accent="left" />
                <DestinationHeroCard destination={right} index={1} accent="right" />
              </div>

              {/* Budget comparison */}
              <BudgetComparison left={left} right={right} />

              {/* Metric comparison bars */}
              <div className="glass-strong rounded-2xl p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <h3 className="font-display text-xl font-bold text-white">
                    Metric Breakdown
                  </h3>
                </div>

                <div className="mb-6 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: left?.color }}
                    />
                    <span className="font-medium text-white">{left?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{right?.name}</span>
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: right?.color }}
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  {COMPARISON_METRICS.map((metric, i) => (
                    <MetricBar
                      key={metric.key}
                      metric={metric}
                      leftScore={leftScores![metric.key] ?? 0}
                      rightScore={rightScores![metric.key] ?? 0}
                      leftColor={left!.color}
                      rightColor={right!.color}
                      leftName={left!.name}
                      rightName={right!.name}
                      index={i}
                    />
                  ))}
                </div>
              </div>

              {/* Overall winner banner */}
              <OverallWinnerBanner
                winner={overallWinner}
                left={left}
                right={right}
                leftWins={leftWins}
                rightWins={rightWins}
                ties={ties}
              />
            </motion.div>
          ) : (
            <EmptyCompareState />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- Destination selector ---------------- */

function DestinationSelector({
  value,
  onChange,
  excludeId,
  side,
}: {
  value: string;
  onChange: (id: string) => void;
  excludeId: string;
  side: 'left' | 'right';
}) {
  const selected = COMPARABLE_DESTINATIONS.find((d) => d.id === value);

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong relative w-full overflow-hidden rounded-2xl lg:w-[340px]"
    >
      {selected && (
        <div className="relative h-28 w-full overflow-hidden">
          <img
            src={selected.image}
            alt={selected.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <p className="text-[11px] uppercase tracking-wider text-white/60">
              {side === 'left' ? 'Destination A' : 'Destination B'}
            </p>
            <h3 className="font-display text-xl font-bold text-white drop-shadow-md">
              {selected.name}
            </h3>
          </div>
        </div>
      )}
      <div className="p-4">
        <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-purple-400" />
          Choose {side === 'left' ? 'first' : 'second'} destination
        </label>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-10 text-sm font-medium text-white outline-none transition-colors hover:border-white/20 focus:border-purple-500/50"
          >
            {COMPARABLE_DESTINATIONS.map((d) => (
              <option
                key={d.id}
                value={d.id}
                disabled={d.id === excludeId}
                className="bg-slate-900 text-white"
              >
                {d.name}, {d.country}
                {d.id === excludeId ? ' (selected)' : ''}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- Destination hero card ---------------- */

function DestinationHeroCard({
  destination,
  index,
  accent,
}: {
  destination: Destination | null;
  index: number;
  accent: 'left' | 'right';
}) {
  if (!destination) return null;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6 }}
      className="glass-strong group relative overflow-hidden rounded-2xl"
    >
      <div className="relative h-56 w-full overflow-hidden sm:h-64">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.7 }}
          src={destination.image}
          alt={destination.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        {/* accent glow */}
        <div
          className="absolute inset-x-0 bottom-0 h-1"
          style={{
            background: `linear-gradient(to right, transparent, ${destination.color}, transparent)`,
          }}
        />
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div>
            <h3 className="font-display text-3xl font-bold text-white drop-shadow-lg">
              {destination.name}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-white/70">
              <MapPin className="h-3.5 w-3.5" /> {destination.country}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 backdrop-blur-md">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-display text-sm font-bold text-white">
              {destination.rating}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-white/5">
        <CardStat
          label="Budget / Day"
          value={formatCurrency(destination.budgetPerDay, destination.currency)}
        />
        <CardStat label="Best Season" value={destination.bestSeason} />
        <CardStat label="Reviews" value={`${destination.reviews.toLocaleString()}`} />
      </div>

      <div className="p-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {destination.description}
        </p>
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Top Attractions
          </p>
          <div className="flex flex-wrap gap-2">
            {destination.attractions.slice(0, 4).map((a) => (
              <span
                key={a}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/90"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] p-4 text-center">
      <p className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="font-display text-sm font-bold text-white">{value}</p>
    </div>
  );
}

/* ---------------- Budget comparison ---------------- */

function BudgetComparison({
  left,
  right,
}: {
  left: Destination | null;
  right: Destination | null;
}) {
  if (!left || !right) return null;

  const cheaper = left.budgetPerDay <= right.budgetPerDay ? left : right;
  const diff = Math.abs(left.budgetPerDay - right.budgetPerDay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-strong rounded-2xl p-6 sm:p-8"
    >
      <div className="mb-6 flex items-center gap-2">
        <Wallet className="h-5 w-5 text-emerald-400" />
        <h3 className="font-display text-xl font-bold text-white">
          Budget Comparison
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left budget */}
        <BudgetBar
          destination={left}
          isCheaper={cheaper.id === left.id}
        />
        {/* Right budget */}
        <BudgetBar
          destination={right}
          isCheaper={cheaper.id === right.id}
        />
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wallet className="h-4 w-4 text-emerald-400" />
          <span>
            <span className="font-semibold text-white">{cheaper.name}</span> is
            cheaper by{' '}
            <span className="font-semibold text-emerald-400">
              {formatCurrency(diff, cheaper.currency)}
            </span>{' '}
            / day
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-purple-400" />
          Lower budget score = more affordable
        </div>
      </div>
    </motion.div>
  );
}

function BudgetBar({
  destination,
  isCheaper,
}: {
  destination: Destination;
  isCheaper: boolean;
}) {
  // Scale relative to a 300/day ceiling for the bar width
  const maxBudget = 300;
  const pct = Math.min(100, (destination.budgetPerDay / maxBudget) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-lg font-bold text-white">
          {destination.name}
        </span>
        <span
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            isCheaper
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-white/5 text-white/60'
          )}
        >
          {isCheaper ? (
            <>
              <Check className="h-3.5 w-3.5" /> Best Value
            </>
          ) : (
            <>
              <TrendingUp className="h-3.5 w-3.5" /> Pricier
            </>
          )}
        </span>
      </div>
      <div className="mb-2 flex items-baseline gap-1">
        <span className="font-display text-2xl font-bold text-white">
          {formatCurrency(destination.budgetPerDay, destination.currency)}
        </span>
        <span className="text-xs text-muted-foreground">/ day</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(to right, ${destination.color}, ${destination.color}aa)`,
          }}
        />
      </div>
    </div>
  );
}

/* ---------------- Metric bar ---------------- */

function MetricBar({
  metric,
  leftScore,
  rightScore,
  leftColor,
  rightColor,
  leftName,
  rightName,
  index,
}: {
  metric: { label: string; icon: string; key: string };
  leftScore: number;
  rightScore: number;
  leftColor: string;
  rightColor: string;
  leftName: string;
  rightName: string;
  index: number;
}) {
  const Icon = METRIC_ICONS[metric.icon] ?? Sparkles;

  const winner: 'left' | 'right' | 'tie' =
    leftScore > rightScore ? 'left' : rightScore > leftScore ? 'right' : 'tie';

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
            <Icon className="h-4 w-4 text-purple-300" />
          </span>
          <span className="text-sm font-medium text-white">{metric.label}</span>
        </div>

        <WinnerBadge
          winner={winner}
          leftName={leftName}
          rightName={rightName}
        />
      </div>

      <div className="space-y-2.5">
        <ScoreRow
          name={leftName}
          score={leftScore}
          color={leftColor}
          isWinner={winner === 'left'}
          isTie={winner === 'tie'}
          align="left"
        />
        <ScoreRow
          name={rightName}
          score={rightScore}
          color={rightColor}
          isWinner={winner === 'right'}
          isTie={winner === 'tie'}
          align="right"
        />
      </div>
    </motion.div>
  );
}

function ScoreRow({
  name,
  score,
  color,
  isWinner,
  isTie,
  align,
}: {
  name: string;
  score: number;
  color: string;
  isWinner: boolean;
  isTie: boolean;
  align: 'left' | 'right';
}) {
  const pct = (score / 10) * 100;

  return (
    <div className="flex items-center gap-3">
      {align === 'right' && (
        <span className="hidden w-20 shrink-0 text-right text-xs font-medium text-muted-foreground sm:block">
          {name}
        </span>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {align === 'left' && (
            <span className="w-20 shrink-0 truncate text-xs font-medium text-muted-foreground">
              {name}
            </span>
          )}
          <div className="flex-1">
            <div
              className={cn(
                'flex h-2.5 items-center overflow-hidden rounded-full bg-white/5',
                align === 'right' && 'flex-row-reverse'
              )}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="h-full rounded-full"
                style={{
                  background: isTie
                    ? `linear-gradient(to right, ${color}, ${color}99)`
                    : isWinner
                    ? `linear-gradient(to right, ${color}, ${color})`
                    : `linear-gradient(to right, ${color}66, ${color}44)`,
                  opacity: isWinner || isTie ? 1 : 0.55,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <span
        className={cn(
          'w-8 shrink-0 text-right font-display text-sm font-bold',
          isWinner ? 'text-white' : isTie ? 'text-white/80' : 'text-white/50'
        )}
      >
        {score}
        <span className="text-xs text-muted-foreground">/10</span>
      </span>
      {align === 'left' && (
        <span className="hidden w-20 shrink-0 text-xs font-medium text-muted-foreground sm:block">
          {name}
        </span>
      )}
    </div>
  );
}

function WinnerBadge({
  winner,
  leftName,
  rightName,
}: {
  winner: 'left' | 'right' | 'tie';
  leftName: string;
  rightName: string;
}) {
  if (winner === 'tie') {
    return (
      <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/60">
        <ArrowLeftRight className="h-3 w-3" /> Tie
      </span>
    );
  }

  const name = winner === 'left' ? leftName : rightName;
  return (
    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
      <Check className="h-3 w-3" /> {name} wins
    </span>
  );
}

/* ---------------- Overall winner banner ---------------- */

function OverallWinnerBanner({
  winner,
  left,
  right,
  leftWins,
  rightWins,
  ties,
}: {
  winner: Destination | null;
  left: Destination | null;
  right: Destination | null;
  leftWins: number;
  rightWins: number;
  ties: number;
}) {
  if (!left || !right) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/15 via-slate-900/60 to-blue-500/10 p-8 text-center"
    >
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5">
          <Sparkles className="h-4 w-4 text-purple-300" />
          <span className="text-sm font-medium text-purple-200">
            Overall Verdict
          </span>
        </div>

        {winner ? (
          <>
            <h3 className="font-display text-3xl font-black text-white sm:text-4xl">
              <span className="text-gradient-blue">{winner.name}</span> takes the crown
            </h3>
            <p className="mt-3 text-muted-foreground">
              Based on {COMPARISON_METRICS.length} weighted travel metrics,{' '}
              <span className="font-semibold text-white">{winner.name}</span> comes
              out on top across more categories.
            </p>
          </>
        ) : (
          <>
            <h3 className="font-display text-3xl font-black text-white sm:text-4xl">
              It&apos;s a <span className="text-gradient-blue">dead heat</span>
            </h3>
            <p className="mt-3 text-muted-foreground">
              <span className="font-semibold text-white">{left.name}</span> and{' '}
              <span className="font-semibold text-white">{right.name}</span> are
              evenly matched. Pick the vibe that suits you best!
            </p>
          </>
        )}

        {/* Win tally */}
        <div className="mt-6 flex items-center justify-center gap-4 sm:gap-8">
          <TallyPill
            name={left.name}
            color={left.color}
            wins={leftWins}
            isWinner={winner?.id === left.id}
          />
          <div className="flex flex-col items-center">
            <span className="font-display text-2xl font-black text-white/30">
              {ties}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Ties
            </span>
          </div>
          <TallyPill
            name={right.name}
            color={right.color}
            wins={rightWins}
            isWinner={winner?.id === right.id}
          />
        </div>
      </div>
    </motion.div>
  );
}

function TallyPill({
  name,
  color,
  wins,
  isWinner,
}: {
  name: string;
  color: string;
  wins: number;
  isWinner: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full border-2',
          isWinner ? 'border-transparent' : 'border-white/10'
        )}
        style={
          isWinner
            ? { backgroundColor: `${color}33`, borderColor: color }
            : undefined
        }
      >
        <span className="font-display text-xl font-black" style={{ color }}>
          {wins}
        </span>
      </div>
      <span className="mt-2 text-xs font-medium text-white/80">{name}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Wins
      </span>
    </div>
  );
}

/* ---------------- Empty state ---------------- */

function EmptyCompareState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass-strong mt-12 flex flex-col items-center justify-center rounded-2xl p-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
        <ArrowLeftRight className="h-8 w-8 text-purple-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-white">
        Select two destinations to compare
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Pick a destination on each side above and we&apos;ll stack them head-to-head
        across ten travel metrics.
      </p>
    </motion.div>
  );
}
