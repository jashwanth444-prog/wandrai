'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, MapPin, Calendar, ArrowRight, ImageIcon } from 'lucide-react';
import type { Destination } from '@/types';
import { cn, formatCurrency } from '@/lib/utils';

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/2072184/pexels-photo-2072184.jpeg?auto=compress&cs=tinysrgb&w=1200';

const COLOR_MAP: Record<string, string> = {
  blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
  purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
  amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
  rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/30',
  red: 'from-red-500/20 to-red-600/5 border-red-500/30',
  sky: 'from-sky-500/20 to-sky-600/5 border-sky-500/30',
  orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/30',
  teal: 'from-teal-500/20 to-teal-600/5 border-teal-500/30',
  indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30',
};

const ICON_BG_MAP: Record<string, string> = {
  blue: 'bg-blue-500/20 text-blue-400',
  purple: 'bg-purple-500/20 text-purple-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-500/20 text-amber-400',
  rose: 'bg-rose-500/20 text-rose-400',
  red: 'bg-red-500/20 text-red-400',
  sky: 'bg-sky-500/20 text-sky-400',
  orange: 'bg-orange-500/20 text-orange-400',
  teal: 'bg-teal-500/20 text-teal-400',
  indigo: 'bg-indigo-500/20 text-indigo-400',
};

export function FeatureCard({
  feature,
  index,
}: {
  feature: import('@/types').Feature;
  index: number;
}) {
  const cardColor = COLOR_MAP[feature.color] ?? COLOR_MAP.blue;
  const iconBg = ICON_BG_MAP[feature.color] ?? ICON_BG_MAP.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${cardColor} p-6 transition-shadow hover:shadow-card-hover`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
          <feature.icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 font-display text-lg font-semibold text-white">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
      </div>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
    </motion.div>
  );
}

export function DestinationCard({
  destination,
  index,
}: {
  destination: Destination;
  index: number;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(destination.image);

  const handleImgError = useCallback(() => {
    if (imgSrc !== FALLBACK_IMAGE) {
      setImgSrc(FALLBACK_IMAGE);
      setImgLoaded(false);
    }
  }, [imgSrc]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card"
    >
      <div className="relative h-56 overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-md">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-white">{destination.rating}</span>
        </div>
        <div className="absolute left-3 top-3 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          {destination.continent}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-1 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{destination.country}</span>
        </div>
        <h3 className="mb-2 font-display text-xl font-bold text-white">{destination.name}</h3>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {destination.description}
        </p>

        <div className="mb-4 flex items-center justify-between border-t border-white/5 pt-4">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="font-display text-lg font-bold text-white">
              {formatCurrency(destination.budgetPerDay, destination.currency)}
              <span className="text-xs font-normal text-muted-foreground"> /day</span>
            </p>
          </div>
          <div className="text-right">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" /> Best
            </p>
            <p className="text-sm font-medium text-white">{destination.bestSeason}</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {destination.attractions.slice(0, 3).map((a) => (
            <span
              key={a}
              className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-muted-foreground"
            >
              {a}
            </span>
          ))}
        </div>

        <Link
          href={`/planner?dest=${destination.id}`}
          className="group/btn flex items-center justify-center gap-2 rounded-lg bg-white/5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500/20 hover:shadow-neon"
        >
          Plan This Trip
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
