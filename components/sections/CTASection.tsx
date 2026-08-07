'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowRight, Shield, Globe2, Zap } from 'lucide-react';

const PILLS = [
  { icon: Zap, label: 'Instant Planning' },
  { icon: Globe2, label: '195 Countries' },
  { icon: Shield, label: 'Safety First' },
];

export default function CTASection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-transparent p-10 text-center sm:p-16"
        >
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative">
            <div className="mb-6 flex flex-wrap justify-center gap-3">
              {PILLS.map((pill) => (
                <div
                  key={pill.label}
                  className="flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-white"
                >
                  <pill.icon className="h-4 w-4 text-blue-400" />
                  {pill.label}
                </div>
              ))}
            </div>

            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="text-white">Your Next Adventure</span>
              <br />
              <span className="text-gradient-blue">Starts Right Here</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Join over 580,000 travelers using WandrAI to plan smarter, travel safer, and discover
              the world. Free to start — no credit card required.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/planner"
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-neon transition-all hover:shadow-neon-purple"
              >
                <Sparkles className="h-5 w-5" />
                Plan Your Trip
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl glass px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
