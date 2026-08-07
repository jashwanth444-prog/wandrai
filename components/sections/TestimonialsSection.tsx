'use client';

import { motion } from 'framer-motion';
import { Star, Quote, MapPin } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/constants';
import SectionHeading from '@/components/shared/SectionHeading';

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="Loved by Travelers"
          badgeColor="amber"
          title={
            <>
              <span className="text-white">What Our </span>
              <span className="text-gradient-blue">Travelers Say</span>
            </>
          }
          description="Over 580,000 explorers trust WandrAI to plan their adventures. Here are a few of their stories."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card p-6 transition-shadow hover:shadow-card-hover"
            >
              <Quote className="absolute right-4 top-4 h-8 w-8 text-white/5 transition-colors group-hover:text-white/10" />

              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={j < t.rating ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4 text-white/10'}
                  />
                ))}
              </div>

              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>

              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {t.location}
                  </p>
                </div>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">
                  {t.trip}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
