'use client';

import { motion } from 'framer-motion';
import { Star, Quote, MapPin } from 'lucide-react';
import type { Testimonial } from '@/types';

export default function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card p-6 transition-shadow hover:shadow-card-hover"
    >
      <Quote className="absolute right-4 top-4 h-8 w-8 text-white/5 transition-colors group-hover:text-white/10" />

      <div className="mb-4 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={i < testimonial.rating ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4 text-white/10'}
          />
        ))}
      </div>

      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">"{testimonial.text}"</p>

      <div className="flex items-center gap-3 border-t border-white/5 pt-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{testimonial.name}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {testimonial.location}
          </p>
        </div>
        <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">
          {testimonial.trip}
        </span>
      </div>
    </motion.div>
  );
}
