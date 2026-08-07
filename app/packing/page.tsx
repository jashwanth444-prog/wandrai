'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Backpack, Check, Printer, Download, MapPin, Calendar, Users,
  Shirt, Smartphone, FileText, Pill, Watch, Sparkles, Loader2, RefreshCw,
} from 'lucide-react';
import { DESTINATIONS } from '@/lib/constants';
import { COUNTRY_DETAILS } from '@/lib/feature-constants';
import { cn } from '@/lib/utils';
import type { Destination, TravelStyle, PackingCategory } from '@/types';
import SectionHeading from '@/components/shared/SectionHeading';

type CategoryMeta = {
  label: string;
  icon: typeof Shirt;
  accent: string;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  Clothing: { label: 'Clothing', icon: Shirt, accent: 'text-sky-300' },
  Electronics: { label: 'Electronics', icon: Smartphone, accent: 'text-violet-300' },
  Documents: { label: 'Documents', icon: FileText, accent: 'text-amber-300' },
  Medicines: { label: 'Medicines', icon: Pill, accent: 'text-emerald-300' },
  Accessories: { label: 'Accessories', icon: Watch, accent: 'text-pink-300' },
  Toiletries: { label: 'Toiletries', icon: Backpack, accent: 'text-cyan-300' },
};

const CATEGORY_ORDER = ['Clothing', 'Electronics', 'Documents', 'Medicines', 'Accessories', 'Toiletries'];

const TRAVEL_STYLES: { value: TravelStyle; label: string; emoji: string }[] = [
  { value: 'luxury', label: 'Luxury', emoji: '✨' },
  { value: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { value: 'budget', label: 'Budget', emoji: '💰' },
  { value: 'cultural', label: 'Cultural', emoji: '🏛️' },
  { value: 'relaxation', label: 'Relaxation', emoji: '🏖️' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
];

// --- Packing generation logic -------------------------------------------------

type Climate = 'cold' | 'mild' | 'hot' | 'tropical';

function getClimate(destination: Destination): Climate {
  const detail = COUNTRY_DETAILS.find((c) => c.name === destination.country);
  const temp = detail?.weather.temp ?? 20;
  if (temp <= 12) return 'cold';
  if (temp <= 22) return 'mild';
  if (temp <= 28) return 'hot';
  return 'tropical';
}

function buildPackingList(
  destination: Destination,
  duration: number,
  style: TravelStyle,
): PackingCategory[] {
  const days = Math.max(1, Math.min(duration, 60));
  const climate = getClimate(destination);

  // Each category starts with a base set, then receives conditional additions.
  const buckets: Record<string, string[]> = {
    Clothing: [],
    Electronics: [],
    Documents: [],
    Medicines: [],
    Accessories: [],
    Toiletries: [],
  };

  const push = (cat: string, item: string) => {
    if (!buckets[cat].includes(item)) buckets[cat].push(item);
  };

  // --- Clothing (scales with duration) ---
  push('Clothing', 'Underwear');
  push('Clothing', 'Socks');
  push('Clothing', 'T-shirts / tops');
  push('Clothing', 'Pants / trousers');
  push('Clothing', 'Sleepwear');

  // Scale clothing count with duration — roughly one outfit per ~3 days, capped.
  const outfitSets = Math.min(Math.ceil(days / 3), 10);
  if (outfitSets > 1) push('Clothing', `${outfitSets}x Mix-and-match outfits`);

  if (days >= 7) push('Clothing', 'Extra undergarments (long trip)');
  if (days >= 14) push('Clothing', 'Laundry bag or detergent sheets');

  // Climate-driven additions
  if (climate === 'cold') {
    push('Clothing', 'Thermal base layers');
    push('Clothing', 'Insulated jacket / winter coat');
    push('Clothing', 'Warm hat & gloves');
    push('Clothing', 'Scarf');
    push('Clothing', 'Waterproof boots');
  } else if (climate === 'mild') {
    push('Clothing', 'Light jacket or cardigan');
    push('Clothing', 'Comfortable walking shoes');
  } else if (climate === 'hot') {
    push('Clothing', 'Breathable cotton/linen shirts');
    push('Clothing', 'Shorts');
    push('Clothing', 'Sunglasses-friendly wide-brim hat');
  } else {
    push('Clothing', 'Lightweight breathable clothing');
    push('Clothing', 'Swimwear');
    push('Clothing', 'Sandals / flip-flops');
  }

  // Style-driven additions
  if (style === 'luxury') {
    push('Clothing', 'Formal / evening wear');
    push('Clothing', 'Dress shoes');
    push('Clothing', 'Cocktail outfit');
  } else if (style === 'adventure') {
    push('Clothing', 'Hiking boots');
    push('Clothing', 'Moisture-wicking activewear');
    push('Clothing', 'Convertible hiking pants');
    push('Clothing', 'Rain shell / windbreaker');
  } else if (style === 'cultural') {
    push('Clothing', 'Modest outfit for temples / churches');
    push('Clothing', 'Smart-casual evening outfit');
  } else if (style === 'relaxation') {
    push('Clothing', 'Resort-wear / loungewear');
    push('Clothing', 'Cover-up / sarong');
  } else if (style === 'family') {
    push('Clothing', 'Spare outfits for kids');
    push('Clothing', 'Comfortable sneakers');
  } else if (style === 'budget') {
    push('Clothing', 'Quick-dry travel clothes');
  }

  // --- Electronics ---
  push('Electronics', 'Smartphone + charger');
  push('Electronics', 'Universal power adapter');
  push('Electronics', 'Power bank');
  push('Electronics', 'Headphones / earbuds');

  if (days >= 5) push('Electronics', 'E-reader or tablet');
  if (style === 'luxury' || style === 'cultural') push('Electronics', 'Camera + memory cards');
  if (style === 'adventure') {
    push('Electronics', 'GoPro / action camera');
    push('Electronics', 'Portable speaker (optional)');
  }
  if (style === 'family') {
    push('Electronics', 'Kids tablet + chargers');
    push('Electronics', 'Extra long charging cable');
  }
  if (climate === 'cold') push('Electronics', 'Phone battery drains faster in cold — bring extra power bank');

  // --- Documents ---
  push('Documents', 'Passport (6+ months validity)');
  push('Documents', 'Flight / transport tickets');
  push('Documents', 'Hotel reservation confirmations');
  push('Documents', 'Travel insurance documents');
  push('Documents', 'Emergency contact list');

  if (days >= 14) push('Documents', 'Visa (if required)');
  if (style === 'adventure' || style === 'family') push('Documents', 'Medical / allergy info card');
  if (style === 'luxury') push('Documents', 'Concierge / loyalty program cards');
  if (climate === 'cold' && style === 'adventure') push('Documents', 'Avalanche / trail permits');

  // --- Medicines ---
  push('Medicines', 'Personal prescription medications');
  push('Medicines', 'Pain relievers (ibuprofen / paracetamol)');
  push('Medicines', 'Adhesive bandages');
  push('Medicines', 'Motion sickness tablets');

  if (climate === 'tropical' || climate === 'hot') {
    push('Medicines', 'Sunscreen (SPF 50+)');
    push('Medicines', 'Insect repellent');
    push('Medicines', 'Rehydration salts');
  }
  if (climate === 'cold') {
    push('Medicines', 'Lip balm & moisturizer');
    push('Medicines', 'Cold / flu remedy');
  }
  if (style === 'adventure') {
    push('Medicines', 'Blister pads / tape');
    push('Medicines', 'Antiseptic wipes');
  }
  if (style === 'family') {
    push('Medicines', 'Children\'s pain reliever');
    push('Medicines', 'Digital thermometer');
  }

  // --- Accessories ---
  push('Accessories', 'Daypack / backpack');
  push('Accessories', 'Reusable water bottle');
  push('Accessories', 'Sunglasses');
  push('Accessories', 'Travel wallet / document organizer');

  if (climate === 'cold') {
    push('Accessories', 'Insulated gloves');
    push('Accessories', 'Warm beanie');
  } else {
    push('Accessories', 'Sun hat / cap');
  }
  if (style === 'luxury') {
    push('Accessories', 'Jewelry / watches (discreet)');
    push('Accessories', 'Silk scarf');
  }
  if (style === 'adventure') {
    push('Accessories', 'Carabiner clips');
    push('Accessories', 'Dry bag');
  }
  if (style === 'relaxation') {
    push('Accessories', 'Beach tote');
    push('Accessories', 'Eye mask');
  }
  if (style === 'family') {
    push('Accessories', 'Stroller / baby carrier');
    push('Accessories', 'Snack pouches');
  }
  if (days >= 7) push('Accessories', 'Packing cubes');

  // --- Toiletries ---
  push('Toiletries', 'Toothbrush & toothpaste');
  push('Toiletries', 'Deodorant');
  push('Toiletries', 'Shampoo & conditioner');
  push('Toiletries', 'Face wash');
  push('Toiletries', 'Hand sanitizer');

  if (style === 'luxury') {
    push('Toiletries', 'Skincare routine set');
    push('Toiletries', 'Hair styling product');
  }
  if (style === 'relaxation') {
    push('Toiletries', 'After-sun lotion');
    push('Toiletries', 'Essential oils');
  }
  if (style === 'adventure') {
    push('Toiletries', 'Quick-dry travel towel');
    push('Toiletries', 'Biodegradable soap');
  }
  if (style === 'family') {
    push('Toiletries', 'Baby wipes');
    push('Toiletries', 'Diaper bag essentials');
  }

  // Destination-specific flair
  if (destination.continent === 'Asia') push('Toiletries', 'Wet wipes (handy for street food trips)');
  if (destination.country === 'Japan') push('Toiletries', 'Pocket tissues (some public restrooms lack paper)');

  return CATEGORY_ORDER.map((name) => ({ name, icon: '', items: buckets[name] })).filter(
    (c) => c.items.length > 0,
  );
}

// --- Component ----------------------------------------------------------------

export default function PackingPage() {
  const [destinationId, setDestinationId] = useState<string>(DESTINATIONS[0]?.id ?? '');
  const [duration, setDuration] = useState<number>(7);
  const [style, setStyle] = useState<TravelStyle>('adventure');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [categories, setCategories] = useState<PackingCategory[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const selectedDestination = useMemo(
    () => DESTINATIONS.find((d) => d.id === destinationId) ?? DESTINATIONS[0],
    [destinationId],
  );

  const allItems = useMemo(() => categories.flatMap((c) => c.items), [categories]);
  const totalItems = allItems.length;
  const packedCount = useMemo(
    () => allItems.filter((i) => checked[i]).length,
    [allItems, checked],
  );
  const progress = totalItems === 0 ? 0 : Math.round((packedCount / totalItems) * 100);

  const handleGenerate = () => {
    if (!selectedDestination) return;
    setIsGenerating(true);
    setHasGenerated(false);
    // Simulate "AI" generation for a premium feel.
    setTimeout(() => {
      const result = buildPackingList(selectedDestination, duration, style);
      setCategories(result);
      setChecked({});
      setIsGenerating(false);
      setHasGenerated(true);
    }, 700);
  };

  const toggleItem = (item: string) =>
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));

  const handlePrint = () => window.print();
  const handleDownload = () => window.print();

  return (
    <div className="relative min-h-screen pt-24">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 bg-aurora opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6 py-12">
        <SectionHeading
          badge="AI Packing List Generator"
          badgeColor="purple"
          title={
            <>
              <span className="text-white">Pack Smarter, </span>
              <span className="text-gradient-blue">Travel Lighter</span>
            </>
          }
          description="Tell us where you're going and how you like to travel — we'll build a tailored packing list for every item you need."
          align="center"
          className="mb-12"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Form panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-strong rounded-2xl p-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/20">
                <Backpack className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-white">Trip Details</h3>
                <p className="text-xs text-muted-foreground">Customize your packing list</p>
              </div>
            </div>

            {/* Destination */}
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <MapPin className="h-4 w-4 text-purple-300" /> Destination
            </label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="mb-5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-purple-500/50 focus:outline-none"
            >
              {DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900">
                  {d.name}, {d.country}
                </option>
              ))}
            </select>

            {/* Duration */}
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <Calendar className="h-4 w-4 text-purple-300" /> Travel Duration
            </label>
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-purple-500"
                />
                <span className="flex min-w-[3.5rem] items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/20 px-3 py-1.5 font-display text-sm font-semibold text-purple-200">
                  {duration} {duration === 1 ? 'day' : 'days'}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Longer trips add more clothing & laundry essentials.
              </div>
            </div>

            {/* Travel style */}
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <Sparkles className="h-4 w-4 text-purple-300" /> Travel Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TRAVEL_STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-all',
                    style === s.value
                      ? 'border-purple-500/50 bg-purple-500/15 text-white'
                      : 'border-white/5 bg-white/5 text-muted-foreground hover:border-white/15 hover:text-white',
                  )}
                >
                  <span className="text-lg">{s.emoji}</span>
                  <span className="text-xs font-medium">{s.label}</span>
                </button>
              ))}
            </div>

            {/* Generate */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-3.5 font-display text-sm font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate Packing List
                </>
              )}
            </motion.button>

            {selectedDestination && (
              <div className="mt-5 rounded-xl bg-white/5 p-4">
                <p className="text-xs text-muted-foreground">Best season to visit</p>
                <p className="mt-1 text-sm font-medium text-white">{selectedDestination.bestSeason}</p>
              </div>
            )}
          </motion.div>

          {/* Generated list / empty state */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl p-6 lg:col-span-8"
          >
            <AnimatePresence mode="wait">
              {/* Empty state */}
              {!hasGenerated && !isGenerating && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[400px] flex-col items-center justify-center text-center"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-500/20"
                  >
                    <Backpack className="h-10 w-10 text-purple-300" />
                  </motion.div>
                  <h3 className="font-display text-xl font-semibold text-white">
                    Your packing list will appear here
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Select your destination, trip length, and travel style — then hit{' '}
                    <span className="text-purple-300">Generate</span> to get a tailored checklist.
                  </p>
                </motion.div>
              )}

              {/* Loading state */}
              {isGenerating && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[400px] flex-col items-center justify-center text-center"
                >
                  <Loader2 className="h-10 w-10 animate-spin text-purple-300" />
                  <h3 className="mt-4 font-display text-lg font-semibold text-white">
                    Curating your essentials…
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Factoring in climate, duration, and travel style.
                  </p>
                </motion.div>
              )}

              {/* Generated list */}
              {hasGenerated && !isGenerating && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Progress + actions */}
                  <div className="mb-6">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-white">
                          {selectedDestination?.name} Packing List
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {duration} {duration === 1 ? 'day' : 'days'} ·{' '}
                          {TRAVEL_STYLES.find((s) => s.value === style)?.label} style
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDownload}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition-all hover:border-purple-500/40 hover:bg-purple-500/10"
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
                        </button>
                        <button
                          onClick={handlePrint}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition-all hover:border-purple-500/40 hover:bg-purple-500/10"
                        >
                          <Printer className="h-3.5 w-3.5" /> Print
                        </button>
                        <button
                          onClick={handleGenerate}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition-all hover:border-purple-500/40 hover:bg-purple-500/10"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400"
                        />
                      </div>
                      <span className="font-display text-sm font-semibold text-white">
                        {packedCount} / {totalItems}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {progress === 100
                        ? 'All packed — have a wonderful trip! 🧳'
                        : `${progress}% packed — keep going!`}
                    </p>
                  </div>

                  {/* Categories */}
                  <div className="space-y-4">
                    {categories.map((cat, idx) => {
                      const meta = CATEGORY_META[cat.name];
                      const Icon = meta?.icon ?? Backpack;
                      const packedInCat = cat.items.filter((i) => checked[i]).length;
                      return (
                        <motion.div
                          key={cat.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          className="rounded-xl bg-white/5 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                                <Icon className={cn('h-4 w-4', meta?.accent)} />
                              </div>
                              <h4 className="font-display text-sm font-semibold text-white">
                                {cat.name}
                              </h4>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {packedInCat}/{cat.items.length}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            {cat.items.map((item) => {
                              const isChecked = !!checked[item];
                              return (
                                <button
                                  key={item}
                                  onClick={() => toggleItem(item)}
                                  className={cn(
                                    'group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
                                    isChecked
                                      ? 'border-emerald-500/30 bg-emerald-500/5'
                                      : 'border-white/5 bg-white/[0.02] hover:border-white/15',
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all',
                                      isChecked
                                        ? 'border-emerald-500 bg-emerald-500'
                                        : 'border-white/20 group-hover:border-white/40',
                                    )}
                                  >
                                    {isChecked && <Check className="h-3.5 w-3.5 text-white" />}
                                  </span>
                                  <span
                                    className={cn(
                                      'text-sm transition-all',
                                      isChecked
                                        ? 'text-muted-foreground line-through'
                                        : 'text-white/90',
                                    )}
                                  >
                                    {item}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
