'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Send, Bot, User, MapPin, Hotel, Utensils,
  Backpack, Wallet, Calendar, Plane, Lightbulb, MessageSquare,
} from 'lucide-react';
import type { ChatMessage } from '@/types';

const SUGGESTIONS = [
  { icon: MapPin, label: 'Recommend a destination', prompt: 'Can you recommend a good destination for a first-time traveler to Asia?' },
  { icon: Hotel, label: 'Hotel suggestions', prompt: 'What are some good hotel options in Paris for a mid-range budget?' },
  { icon: Utensils, label: 'Restaurant tips', prompt: 'What are the best local restaurants to try in Tokyo?' },
  { icon: Backpack, label: 'Packing tips', prompt: 'What should I pack for a 7-day trip to Bali?' },
  { icon: Wallet, label: 'Budget advice', prompt: 'How can I save money while traveling in Switzerland?' },
  { icon: Calendar, label: 'Best time to visit', prompt: 'When is the best time of year to visit Japan?' },
  { icon: Plane, label: 'Flight tips', prompt: 'Any tips for finding cheap flights to Europe?' },
  { icon: Lightbulb, label: 'Travel tips', prompt: 'Give me some general travel tips for a solo traveler.' },
];

const AI_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ['recommend', 'destination', 'where', 'best place', 'visit'],
    response: 'Based on popular traveler preferences, I\'d recommend Tokyo, Japan! It offers an incredible mix of ancient culture and futuristic technology. You\'ll find world-class food, safe streets, and endless attractions. The best time to visit is March-May for cherry blossoms or October-November for fall foliage. Would you like me to create an itinerary for Tokyo?',
  },
  {
    keywords: ['hotel', 'stay', 'accommodation', 'lodging'],
    response: 'For a mid-range budget in Paris, I recommend looking at hotels in the Le Marais or Latin Quarter neighborhoods. You\'ll find charming boutique hotels around €120-180/night. For luxury, the 8th arrondissement near Champs-Élysées has world-class options. Would you like me to suggest specific hotels?',
  },
  {
    keywords: ['restaurant', 'food', 'eat', 'dining', 'cuisine'],
    response: 'In Tokyo, you must try: 1) Tsukiji Outer Market for fresh sushi, 2) A traditional izakaya in Shinjuku for yakitori, 3) Ramen Street in Tokyo Station, 4) A kaiseki dinner in Ginza. For budget options, conveyor belt sushi (kaiten-zushi) is excellent quality at low prices!',
  },
  {
    keywords: ['pack', 'packing', 'bring', 'luggage'],
    response: 'For a 7-day Bali trip, pack: lightweight clothing, swimwear, sunscreen SPF 50+, insect repellent, a light rain jacket, comfortable walking shoes, flip-flops, a power adapter (Type C/F), and any prescription medications. The climate is tropical, so breathable fabrics are key!',
  },
  {
    keywords: ['budget', 'save', 'cheap', 'money', 'afford'],
    response: 'To save money in Switzerland: 1) Get a Swiss Travel Pass for unlimited transport, 2) Eat at Migros/Coop supermarkets, 3) Stay in mountain hostels, 4) Visit on the first Sunday of the month when many museums are free, 5) Hike instead of taking cable cars when possible. Daily budget can be as low as $120!',
  },
  {
    keywords: ['best time', 'when', 'season', 'weather', 'month'],
    response: 'The best time to visit Japan is March-May (cherry blossom season) or October-November (autumn leaves). Avoid August (hot and humid) and late December-January (cold, many closures). For Tokyo specifically, late March to early April is magical with sakura blooms!',
  },
  {
    keywords: ['flight', 'fly', 'airline', 'ticket'],
    response: 'Tips for cheap flights to Europe: 1) Book 2-3 months in advance, 2) Fly on Tuesdays/Wednesdays, 3) Use Google Flights price tracking, 4) Consider budget airlines like Norwegian or WOW air, 5) Be flexible with departure airports, 6) Clear cookies or use incognito mode when searching!',
  },
  {
    keywords: ['tip', 'advice', 'solo', 'general'],
    response: 'Top travel tips: 1) Always carry a power bank, 2) Download offline maps before you go, 3) Learn 5 basic phrases in the local language, 4) Keep digital copies of important documents, 5) Get travel insurance — it\'s worth it, 6) Notify your bank before traveling, 7) Arrive at airports 3 hours early for international flights!',
  },
  {
    keywords: ['itinerary', 'plan', 'schedule', 'modify', 'change'],
    response: 'I can help modify your itinerary! Tell me what you\'d like to change — add more activities, swap restaurants, adjust the budget, or change dates. You can also use our AI Planner at the planner page to generate a fresh itinerary from scratch with your updated preferences!',
  },
];

function generateResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const { keywords, response } of AI_RESPONSES) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return response;
    }
  }
  return 'Great question! I can help with destination recommendations, hotel suggestions, restaurant tips, packing lists, budget advice, travel tips, and itinerary planning. Try one of the suggestion chips below, or ask me anything about your trip! You can also visit our AI Planner, World Explorer, or Safety Hub for more detailed information.';
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m your AI Travel Assistant. I can help with destinations, hotels, restaurants, packing, budgets, and more. How can I help you plan your next adventure?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: generateResponse(text),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const visibleSuggestions = useMemo(() => SUGGESTIONS.slice(0, 4), []);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className={`group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-neon transition-all hover:shadow-neon-purple ${open ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        aria-label="Open AI Assistant"
      >
        <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/30" />
        <Sparkles className="relative h-6 w-6 text-white" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
        </span>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="glass-strong fixed bottom-6 right-6 z-50 flex h-[600px] max-h-[85vh] w-[400px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl shadow-glass"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-neon">
                  <Bot className="h-5 w-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white">AI Travel Assistant</h3>
                  <p className="text-xs text-emerald-400">Online — Ready to help</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-hide">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${msg.role === 'user' ? 'bg-blue-500/20' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white/5 text-muted-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl bg-white/5 px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="h-2 w-2 rounded-full bg-blue-400"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && !typing && (
              <div className="border-t border-white/5 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {visibleSuggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleSend(s.prompt)}
                      className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-blue-500/15 hover:text-white"
                    >
                      <s.icon className="h-3 w-3 text-blue-400" />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(input);
                    }
                  }}
                  placeholder="Ask me anything about travel..."
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-blue-500/50 focus:outline-none"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white transition-all hover:shadow-neon disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
