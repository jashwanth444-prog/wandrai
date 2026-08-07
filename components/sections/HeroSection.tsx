'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowRight, ChevronDown, Plane, Shield, Zap, Globe2 } from 'lucide-react';
import { TRAVEL_STATS } from '@/lib/constants';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

const EarthScene = dynamic(() => import('@/components/3d/EarthScene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
    </div>
  ),
});

const HERO_STATS = [
  { ...TRAVEL_STATS[0], numericValue: 195, prefix: '', decimals: 0 },
  { ...TRAVEL_STATS[1], numericValue: 2.4, prefix: '', decimals: 1 },
  { ...TRAVEL_STATS[2], numericValue: 580, prefix: '', decimals: 0 },
  { ...TRAVEL_STATS[3], numericValue: 12, prefix: '', decimals: 0 },
];

const TRUST_PILLS = [
  { icon: Zap, label: 'Instant Planning' },
  { icon: Globe2, label: '195 Countries' },
  { icon: Shield, label: 'Safety First' },
];

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <EarthScene />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/40 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-aurora z-0 pointer-events-none" />

      <div className="relative z-20 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 mt-20 inline-flex items-center gap-2 rounded-full glass px-4 py-2"
        >
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-white">AI-Powered Travel Intelligence</span>
          <span className="ml-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">New</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-balance"
        >
          <span className="text-gradient">Plan Your Dream</span>
          <br />
          <span className="text-white">Journey with </span>
          <span className="text-gradient-aurora">AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          Generate personalized itineraries, optimize your budget, and travel safer with
          real-time intelligence across 195 countries — all powered by AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/planner"
            className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-neon transition-all hover:shadow-neon-purple"
          >
            <Sparkles className="h-5 w-5" />
            Start Planning Free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
          <Link
            href="#destinations"
            className="flex items-center gap-2 rounded-xl glass px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
          >
            <Plane className="h-5 w-5 text-blue-400" />
            Explore Destinations
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {TRUST_PILLS.map((pill) => (
            <div
              key={pill.label}
              className="flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-white"
            >
              <pill.icon className="h-4 w-4 text-blue-400" />
              {pill.label}
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-bold text-white sm:text-4xl">
                <AnimatedCounter
                  value={stat.numericValue}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs">Scroll to explore</span>
          <ChevronDown className="h-5 w-5 animate-bounce-subtle" />
        </div>
      </motion.div>
    </section>
  );
}
