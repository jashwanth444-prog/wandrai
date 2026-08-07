'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactForm = z.infer<typeof schema>;

const CONTACT_INFO = [
  { icon: Mail, label: 'Email', value: 'hello@wandrai.com', href: 'mailto:hello@wandrai.com' },
  { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567', href: 'tel:+15551234567' },
  { icon: MapPin, label: 'Office', value: '123 Travel St, San Francisco, CA', href: '#' },
  { icon: Clock, label: 'Hours', value: 'Mon–Fri, 9AM–6PM PST', href: '#' },
];

export default function ContactPage() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(schema) as never });

  const onSubmit = async (data: ContactForm) => {
    await new Promise((r) => setTimeout(r, 1200));
    toast({ title: 'Message sent!', description: 'We will get back to you within 24 hours.' });
    setSent(true);
    reset();
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="relative min-h-screen pt-24">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Get In Touch</span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-white">Let's </span>
            <span className="text-gradient-blue">Talk Travel</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Questions, feedback, or partnership ideas? We would love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {CONTACT_INFO.map((info, i) => (
              <motion.a
                key={info.label}
                href={info.href}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass flex items-center gap-4 rounded-2xl p-4 transition-all hover:bg-white/10"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <info.icon className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{info.label}</p>
                  <p className="text-sm font-medium text-white">{info.value}</p>
                </div>
              </motion.a>
            ))}

            <div className="glass rounded-2xl p-5">
              <h3 className="mb-3 font-display text-sm font-semibold text-white">Response Time</h3>
              <p className="text-sm text-muted-foreground">
                We typically respond within 24 hours during business days. For urgent safety matters,
                use the Emergency SOS in our Safety Hub.
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-strong rounded-2xl p-6 sm:p-8 lg:col-span-2"
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">Message Sent!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thank you for reaching out. We will get back to you soon.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Name</label>
                    <input
                      {...register('name')}
                      placeholder="Jane Doe"
                      className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
                        errors.name ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/30'
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Email</label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="you@example.com"
                      className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
                        errors.email ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/30'
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Subject</label>
                  <input
                    {...register('subject')}
                    placeholder="How can we help?"
                    className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
                      errors.subject ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/30'
                    }`}
                  />
                  {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Message</label>
                  <textarea
                    {...register('message')}
                    rows={6}
                    placeholder="Tell us more about your question or feedback…"
                    className={`w-full resize-none rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
                      errors.message ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/30'
                    }`}
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-neon transition-all hover:shadow-neon-purple disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
