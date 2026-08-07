'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Globe, Target, Heart, Users, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';

const STATS = [
  { label: 'Countries', value: '195', suffix: '+' },
  { label: 'Travelers', value: '580', suffix: 'K' },
  { label: 'Trips Planned', value: '2.4', suffix: 'M' },
  { label: 'Years of Data', value: '8', suffix: '' },
];

const TEAM = [
  { name: 'Alex Chen', role: 'CEO & Co-Founder', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Sofia Rivera', role: 'CTO & Co-Founder', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Marcus Webb', role: 'Head of AI', image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Yuki Tanaka', role: 'Head of Design', image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

const VALUES = [
  { icon: Target, title: 'Precision', description: 'Every itinerary is crafted with exact data — no guesswork, no fluff.' },
  { icon: Shield, title: 'Safety First', description: 'We believe travel should be adventurous, not dangerous. Safety is in our DNA.' },
  { icon: Heart, title: 'Human-Centric', description: 'Technology serves the traveler, not the other way around. Always.' },
  { icon: Zap, title: 'Constant Innovation', description: 'We ship fast and listen harder. Every update makes travel planning better.' },
];

const MILESTONES = [
  { year: '2018', title: 'The Idea', description: 'Founded by two frustrated travelers who wanted better trip planning tools.' },
  { year: '2020', title: 'First Million Trips', description: 'Hit 1M AI-generated itineraries and launched our safety intelligence engine.' },
  { year: '2022', title: 'Global Expansion', description: 'Expanded to 195 countries with real-time safety data and emergency resources.' },
  { year: '2024', title: 'AI Revolution', description: 'Launched next-gen AI with concierge-level personalization and 3D visualizations.' },
  { year: '2026', title: '580K Travelers', description: 'Now serving over half a million active travelers planning their dream journeys.' },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen pt-24">
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Our Story</span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-white">We're on a mission to </span>
            <span className="text-gradient-blue">make travel effortless</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            WandrAI was born from a simple belief: planning a trip should be as exciting as taking one.
            We combine AI, real-time data, and beautiful design to help millions of travelers explore the world with confidence.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <div className="font-display text-3xl font-bold text-white sm:text-4xl">
                {stat.value}<span className="text-gradient-blue">{stat.suffix}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-white">Our Mission</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              To empower every traveler with the intelligence to plan smarter, travel safer, and discover more.
              We believe the world's beauty should be accessible to everyone — and the technology to get there
              should feel like magic, not a spreadsheet.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              From the first spark of wanderlust to the moment you return home, WandrAI is with you every step of the way.
              We handle the logistics so you can focus on the adventure.
            </p>
            <Link
              href="/planner"
              className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-neon transition-all hover:shadow-neon-purple"
            >
              Try It Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <v.icon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="font-display text-base font-semibold text-white">{v.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative mx-auto max-w-4xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-white">Our Journey</h2>
          <p className="mt-2 text-muted-foreground">From idea to global platform</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-blue-500/50 via-purple-500/30 to-transparent md:left-1/2" />
          <div className="space-y-8">
            {MILESTONES.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative flex gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="hidden md:block md:w-1/2" />
                <div className="absolute left-4 z-10 flex h-3 w-3 -translate-x-[5px] rounded-full bg-blue-500 shadow-neon md:left-1/2 md:-translate-x-1/2" />
                <div className={`ml-10 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <div className="glass rounded-2xl p-5">
                    <span className="rounded-full bg-blue-500/15 px-3 py-0.5 text-xs font-medium text-blue-300">{m.year}</span>
                    <h3 className="mt-2 font-display text-lg font-semibold text-white">{m.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-white">Meet The Team</h2>
          <p className="mt-2 text-muted-foreground">The people making travel magical</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group text-center"
            >
              <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-2xl">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <h3 className="font-display text-base font-semibold text-white">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-transparent p-10 text-center sm:p-16"
        >
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="relative">
            <Globe className="mx-auto mb-4 h-10 w-10 text-blue-400" />
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Ready to explore the world?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join 580,000+ travelers planning smarter with WandrAI.
            </p>
            <Link
              href="/planner"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-neon transition-all hover:shadow-neon-purple"
            >
              Plan Your Trip
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
