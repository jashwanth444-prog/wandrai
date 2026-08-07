import type { LucideIcon } from 'lucide-react';

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Destination = {
  id: string;
  name: string;
  country: string;
  continent: string;
  image: string;
  rating: number;
  reviews: number;
  budgetPerDay: number;
  currency: string;
  bestSeason: string;
  description: string;
  attractions: string[];
  coordinates: Coordinates;
  color: string;
};

export type ExploreDestination = {
  id: string;
  name: string;
  country: string;
  city: string;
  continent: string;
  heroImage: string;
  description: string;
  budget: 'budget' | 'mid-range' | 'luxury';
  dailyBudget: number;
  currency: string;
  language: string;
  bestMonths: string;
  weather: string;
  avgTemp: number;
  tripDuration: string;
  attractions: string[];
  restaurants: string[];
  hotels: string[];
  hiddenGems: string[];
  safetyRating: number;
  transportation: string[];
  nightlifeRating: number;
  familyRating: number;
  adventureRating: number;
  foodRating: number;
  travelTips: string[];
  packingSuggestions: string[];
  emergencyNumbers: { police: string; ambulance: string; fire: string };
  localEtiquette: string[];
  tags: string[];
  coordinates: Coordinates;
  color: string;
};

export type Feature = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

export type TravelStyle = 'luxury' | 'adventure' | 'budget' | 'cultural' | 'relaxation' | 'family';

export type Interest =
  | 'food'
  | 'history'
  | 'nature'
  | 'nightlife'
  | 'shopping'
  | 'art'
  | 'adventure'
  | 'beaches';

export type TripPlanForm = {
  destinationId: string;
  budget: number;
  currency: string;
  travelers: number;
  startDate: string;
  endDate: string;
  travelStyle: TravelStyle;
  interests: Interest[];
  transportation: 'flight' | 'train' | 'car' | 'mixed';
  hotelPreference: 'budget' | 'mid-range' | 'luxury' | 'boutique';
};

export type ItineraryActivity = {
  time: string;
  title: string;
  description: string;
  category: 'sightseeing' | 'food' | 'transport' | 'relaxation' | 'shopping' | 'nightlife' | 'adventure';
  cost: number;
};

export type ItineraryDay = {
  day: number;
  date: string;
  title: string;
  activities: ItineraryActivity[];
  accommodation: string;
  meals: { breakfast: string; lunch: string; dinner: string };
  totalCost: number;
};

export type GeneratedItinerary = {
  destination: Destination;
  totalCost: number;
  totalDays: number;
  days: ItineraryDay[];
};

export type Trip = {
  id: string;
  user_id: string;
  destination_id: string;
  destination_name: string;
  country: string;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  status: 'upcoming' | 'completed' | 'planning';
  travelers: number;
  cover_image: string;
  itinerary?: GeneratedItinerary | null;
  created_at: string;
};

export type SafetyLevel = 'low' | 'moderate' | 'high' | 'extreme';

export type CountrySafety = {
  id: string;
  country: string;
  code: string;
  flag: string;
  score: number;
  crimeLevel: SafetyLevel;
  medicalLevel: SafetyLevel;
  politicalStability: SafetyLevel;
  coordinates: Coordinates;
  emergencyNumbers: {
    police: string;
    ambulance: string;
    fire: string;
  };
  hospitals: { name: string; address: string; phone: string }[];
  embassies: { name: string; address: string; phone: string }[];
  medicalInfo: {
    vaccinations: string[];
    insuranceRequired: boolean;
    notes: string;
  };
};

export type SafetyAlert = {
  id: string;
  country: string;
  type: 'weather' | 'natural-disaster' | 'political' | 'health';
  severity: SafetyLevel;
  title: string;
  message: string;
  timestamp: string;
};

export type PricingPlan = {
  id: string;
  name: string;
  price: { monthly: number; yearly: number };
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type TravelStat = {
  label: string;
  value: string;
  suffix: string;
};

export type Activity = {
  id: string;
  type: 'trip_created' | 'destination_saved' | 'trip_completed' | 'review_added' | 'safety_checked';
  title: string;
  description: string;
  timestamp: string;
};

export type Testimonial = {
  id: string;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  text: string;
  trip: string;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type PackingItem = {
  category: string;
  items: string[];
};

export type TravelTip = {
  icon: string;
  title: string;
  description: string;
};

export type WeatherInfo = {
  condition: string;
  temperature: number;
  high: number;
  low: number;
  icon: string;
};

export type AIRecommendation = {
  id: string;
  type: 'destination' | 'tip' | 'alert' | 'deal';
  title: string;
  description: string;
  action: string;
  href: string;
};

export type QuickAction = {
  id: string;
  label: string;
  href: string;
  icon: string;
};

export type WeatherDay = {
  day: string;
  condition: string;
  icon: string;
  high: number;
  low: number;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type Expense = {
  id: string;
  user_id: string;
  category: 'flights' | 'hotels' | 'food' | 'transport' | 'shopping' | 'activities' | 'other';
  description: string;
  amount: number;
  currency: string;
  date: string;
  created_at: string;
};

export type CountryDetail = {
  id: string;
  name: string;
  code: string;
  flag: string;
  capital: string;
  currency: string;
  language: string;
  timezone: string;
  safetyScore: number;
  bestMonths: string;
  estimatedBudget: number;
  image: string;
  coordinates: Coordinates;
  attractions: string[];
  foodRecommendations: string[];
  localTransport: string[];
  emergencyNumbers: { police: string; ambulance: string; fire: string };
  weather: { condition: string; temp: number; high: number; low: number };
};

export type VisaInfo = {
  id: string;
  country: string;
  code: string;
  flag: string;
  visaRequired: boolean;
  visaType: string;
  passportValidity: string;
  vaccinations: string[];
  travelAdvisory: string;
  advisoryLevel: SafetyLevel;
  emergencyContacts: { police: string; ambulance: string; fire: string };
  currency: string;
  plugType: string;
  voltage: string;
  timezone: string;
  internetAvailable: boolean;
  internetSpeed: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: { label: string; value: string; icon: string }[];
};

export type QuizResult = {
  destinationId: string;
  matchScore: number;
  reason: string;
};

export type EmergencyPhrase = {
  phrase: string;
  translations: { language: string; translation: string }[];
};

export type CurrencyRate = {
  code: string;
  name: string;
  symbol: string;
  rate: number;
};

export type UnitConversion = {
  category: string;
  units: { name: string; factor: number; symbol: string }[];
};

export type ComparisonMetric = {
  label: string;
  icon: string;
  getValue: (d: Destination) => string | number;
  format?: (v: string | number) => string;
};

export type ShareOption = {
  platform: 'whatsapp' | 'email' | 'twitter' | 'linkedin' | 'copy';
  label: string;
  icon: string;
  color: string;
};

export type PackingCategory = {
  name: string;
  icon: string;
  items: string[];
};

export type GeneratedPackingList = {
  destination: string;
  duration: number;
  style: TravelStyle;
  categories: PackingCategory[];
};
