'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Shield, Star, DollarSign, Calendar, SlidersHorizontal,
  Compass, Sparkles, ChevronDown, X, Utensils, AlertCircle,
  ImageIcon,
} from 'lucide-react';
import { EXPLORE_DESTINATIONS, BUDGET_FILTERS, TAG_FILTERS } from '@/data/destinations';
import { cn } from '@/lib/utils';
import SectionHeading from '@/components/shared/SectionHeading';
import type { ExploreDestination } from '@/types';

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/2072184/pexels-photo-2072184.jpeg?auto=compress&cs=tinysrgb&w=1200';

/* ---------- Constants ---------- */

const SEASONS = ['all', 'summer', 'winter', 'spring', 'autumn'] as const;
type Season = (typeof SEASONS)[number];

const SEASON_LABELS: Record<Season, string> = {
  all: 'All Seasons',
  summer: 'Summer',
  winter: 'Winter',
  spring: 'Spring',
  autumn: 'Autumn',
};

const SEASON_MONTHS: Record<Exclude<Season, 'all'>, string[]> = {
  summer: ['June', 'July', 'August'],
  winter: ['December', 'January', 'February'],
  spring: ['March', 'April', 'May'],
  autumn: ['September', 'October', 'November'],
};

const BUDGET_LABELS: Record<string, string> = {
  all: 'All',
  budget: 'Budget',
  'mid-range': 'Mid-range',
  luxury: 'Luxury',
};

const BUDGET_STYLES: Record<string, string> = {
  budget: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'mid-range': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  luxury: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'budget-low', label: 'Budget: Low to High' },
  { value: 'budget-high', label: 'Budget: High to Low' },
  { value: 'safety', label: 'Highest Safety' },
  { value: 'food', label: 'Top Food' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];

/* ---------- Page ---------- */

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [budgetFilter, setBudgetFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [season, setSeason] = useState<Season>('all');
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [sort, setSort] = useState<SortValue>('popular');
  const [loading, setLoading] = useState(true);

  // Simulate initial load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let result = [...EXPLORE_DESTINATIONS];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q),
      );
    }

    // Budget
    if (budgetFilter !== 'all') {
      result = result.filter((d) => d.budget === budgetFilter);
    }

    // Tag
    if (tagFilter) {
      result = result.filter((d) => d.tags.includes(tagFilter));
    }

    // Season
    if (season !== 'all') {
      const months = SEASON_MONTHS[season];
      result = result.filter((d) =>
        months.some((m) => d.bestMonths.toLowerCase().includes(m.toLowerCase())),
      );
    }

    // Sort
    switch (sort) {
      case 'budget-low':
        result.sort((a, b) => a.dailyBudget - b.dailyBudget);
        break;
      case 'budget-high':
        result.sort((a, b) => b.dailyBudget - a.dailyBudget);
        break;
      case 'safety':
        result.sort((a, b) => b.safetyRating - a.safetyRating);
        break;
      case 'food':
        result.sort((a, b) => b.foodRating - a.foodRating);
        break;
      default:
        break;
    }

    return result;
  }, [search, budgetFilter, tagFilter, season, sort]);

  const hasActiveFilters =
    search.trim() !== '' || budgetFilter !== 'all' || tagFilter !== null || season !== 'all';

  const clearFilters = () => {
    setSearch('');
    setBudgetFilter('all');
    setTagFilter(null);
    setSeason('all');
  };

  return (
    <div className="relative min-h-screen pt-24">
      {/* Background flourishes */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 bg-aurora opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 py-12">
        {/* Heading */}
        <SectionHeading
          badge="Discover Destinations"
          badgeColor="blue"
          title={
            <>
              <span className="text-white">Explore the </span>
              <span className="text-gradient-blue">World</span>
            </>
          }
          description="Browse hand-curated destinations with detailed budgets, safety ratings, and local insights to find your next unforgettable trip."
        />

        {/* Search + Season */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, country, or city..."
              className="glass-strong w-full rounded-xl border border-white/10 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-muted-foreground outline-none transition-colors focus:border-blue-500/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Season dropdown */}
          <div className="relative">
            <button
              onClick={() => setSeasonOpen((o) => !o)}
              className={cn(
                'glass-strong flex w-full items-center justify-between gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium transition-colors sm:w-48',
                season !== 'all'
                  ? 'border-blue-500/50 text-blue-300'
                  : 'border-white/10 text-white hover:border-white/20',
              )}
            >
              <Calendar className="h-4 w-4" />
              <span className="flex-1 text-left">{SEASON_LABELS[season]}</span>
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', seasonOpen && 'rotate-180')}
              />
            </button>
            <AnimatePresence>
              {seasonOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setSeasonOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="glass-strong absolute right-0 top-full z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/10 p-1.5 sm:w-48"
                  >
                    {SEASONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSeason(s);
                          setSeasonOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors',
                          season === s
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'text-white/80 hover:bg-white/10 hover:text-white',
                        )}
                      >
                        {SEASON_LABELS[s]}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Budget filter pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" /> Budget:
          </span>
          {BUDGET_FILTERS.map((b) => (
            <FilterPill
              key={b}
              active={budgetFilter === b}
              onClick={() => setBudgetFilter(b)}
            >
              {BUDGET_LABELS[b]}
            </FilterPill>
          ))}
        </div>

        {/* Tag filter pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Tags:
          </span>
          <FilterPill active={tagFilter === null} onClick={() => setTagFilter(null)}>
            All
          </FilterPill>
          {TAG_FILTERS.map((t) => (
            <FilterPill
              key={t}
              active={tagFilter === t}
              onClick={() => setTagFilter(tagFilter === t ? null : t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </FilterPill>
          ))}
        </div>

        {/* Results count + sort */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {loading ? (
                'Loading destinations...'
              ) : (
                <>
                  <span className="font-semibold text-white">{filtered.length}</span>{' '}
                  {filtered.length === 1 ? 'destination' : 'destinations'} found
                </>
              )}
            </p>
            {hasActiveFilters && !loading && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-white/20 hover:text-white"
              >
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="glass rounded-lg border border-white/10 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500/50 [&>option]:bg-background"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((dest, i) => (
                <DestinationCard key={dest.id} destination={dest} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Filter Pill ---------- */

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-all',
        active
          ? 'border-blue-500/50 bg-blue-500/20 text-blue-300'
          : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

/* ---------- Destination Card ---------- */

function DestinationCard({
  destination,
  index,
}: {
  destination: ExploreDestination;
  index: number;
}) {
  const displayTags = destination.tags.slice(0, 3);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(destination.heroImage);

  const handleImgError = useCallback(() => {
    if (imgSrc !== FALLBACK_IMAGE) {
      setImgSrc(FALLBACK_IMAGE);
      setImgLoaded(false);
    }
  }, [imgSrc]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -6 }}
      className="group glass-strong relative flex flex-col overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-white/20"
    >
      {/* Hero image */}
      <div className="relative h-48 w-full overflow-hidden">
        {/* Skeleton placeholder */}
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/10 via-white/5 to-white/10">
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-8 w-8 text-white/20" />
            </div>
          </div>
        )}
        <img
          src={imgSrc}
          alt={destination.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={handleImgError}
          className={cn(
            'h-full w-full object-cover transition-all duration-700',
            imgLoaded ? 'opacity-100 scale-100 group-hover:scale-110' : 'opacity-0',
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Budget badge */}
        <span
          className={cn(
            'absolute left-3 top-3 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-md',
            BUDGET_STYLES[destination.budget],
          )}
        >
          {BUDGET_LABELS[destination.budget]}
        </span>

        {/* Safety badge */}
        <span
          className={cn(
            'absolute right-3 top-3 flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-md',
            destination.safetyRating >= 9
              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
              : destination.safetyRating >= 7
                ? 'border-sky-500/30 bg-sky-500/15 text-sky-300'
                : 'border-amber-500/30 bg-amber-500/15 text-amber-300',
          )}
        >
          <Shield className="h-3 w-3" />
          {destination.safetyRating}/10
        </span>

        {/* Name + country */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display text-xl font-bold text-white drop-shadow-md">
            {destination.name}
          </h3>
          <p className="flex items-center gap-1 text-sm text-white/70">
            <MapPin className="h-3 w-3" /> {destination.country}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Food rating */}
        <div className="mb-3 flex items-center gap-1.5">
          <Utensils className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs text-muted-foreground">Food</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < Math.round(destination.foodRating / 2)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-white/20',
                )}
              />
            ))}
          </div>
          <span className="ml-1 text-xs font-medium text-white">{destination.foodRating}/10</span>
        </div>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {displayTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] capitalize text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Daily budget */}
        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
          <div>
            <p className="text-[11px] text-muted-foreground">Daily budget</p>
            <p className="flex items-center gap-1 font-display text-lg font-bold text-white">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              {destination.dailyBudget}
              <span className="text-xs font-normal text-muted-foreground">
                {destination.currency}
              </span>
            </p>
          </div>
          <Link
            href={`/explore/${destination.id}`}
            className="flex items-center gap-1.5 rounded-lg bg-blue-500/20 px-3.5 py-2 text-xs font-medium text-blue-300 transition-all hover:bg-blue-500/30 hover:text-blue-200"
          >
            View Details
            <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Skeleton Card ---------- */

function SkeletonCard() {
  return (
    <div className="glass-strong overflow-hidden rounded-2xl border border-white/10">
      <div className="h-48 w-full animate-pulse bg-white/5" />
      <div className="p-4">
        <div className="mb-3 h-4 w-24 animate-pulse rounded bg-white/5" />
        <div className="mb-4 flex gap-1.5">
          <div className="h-5 w-14 animate-pulse rounded-full bg-white/5" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-white/5" />
          <div className="h-5 w-12 animate-pulse rounded-full bg-white/5" />
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <div className="h-8 w-20 animate-pulse rounded bg-white/5" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-white/5" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Empty State ---------- */

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong flex flex-col items-center justify-center rounded-2xl border border-white/10 py-20 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <Compass className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold text-white">No destinations found</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t find any destinations matching your filters. Try adjusting your search or
        clearing your filters to see everything.
      </p>
      <button
        onClick={onClear}
        className="mt-6 flex items-center gap-2 rounded-xl bg-blue-500/20 px-5 py-2.5 text-sm font-medium text-blue-300 transition-all hover:bg-blue-500/30"
      >
        <AlertCircle className="h-4 w-4" />
        Clear all filters
      </button>
    </motion.div>
  );
}
