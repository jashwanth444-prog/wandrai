import { DESTINATIONS } from '@/lib/constants';
import { EXPLORE_DESTINATIONS } from '@/data/destinations';
import type { GeneratedItinerary, ItineraryDay, ItineraryActivity, TripPlanForm, Destination } from '@/types';
import { daysBetween } from '@/lib/utils';

const STYLE_ACTIVITIES: Record<string, { morning: ItineraryActivity['category']; afternoon: ItineraryActivity['category']; evening: ItineraryActivity['category'] }> = {
  luxury: { morning: 'relaxation', afternoon: 'sightseeing', evening: 'food' },
  adventure: { morning: 'adventure', afternoon: 'sightseeing', evening: 'food' },
  budget: { morning: 'sightseeing', afternoon: 'food', evening: 'nightlife' },
  cultural: { morning: 'sightseeing', afternoon: 'sightseeing', evening: 'food' },
  relaxation: { morning: 'relaxation', afternoon: 'relaxation', evening: 'food' },
  family: { morning: 'sightseeing', afternoon: 'relaxation', evening: 'food' },
};

const CATEGORY_LABELS: Record<ItineraryActivity['category'], string> = {
  sightseeing: 'Sightseeing',
  food: 'Dining',
  transport: 'Travel',
  relaxation: 'Relaxation',
  shopping: 'Shopping',
  nightlife: 'Nightlife',
  adventure: 'Adventure',
};

const ALL_DESTINATIONS: Destination[] = [
  ...DESTINATIONS,
  ...EXPLORE_DESTINATIONS
    .filter((ed) => !DESTINATIONS.some((d) => d.id === ed.id))
    .map((ed) => ({
      id: ed.id,
      name: ed.name,
      country: ed.country,
      continent: ed.continent,
      image: ed.heroImage,
      rating: 4.5,
      reviews: 0,
      budgetPerDay: ed.dailyBudget,
      currency: ed.currency,
      bestSeason: ed.bestMonths,
      description: ed.description,
      attractions: ed.attractions,
      coordinates: ed.coordinates,
      color: ed.color,
    })),
];

function getExploreDest(id: string) {
  return EXPLORE_DESTINATIONS.find((d) => d.id === id);
}

function generateActivity(
  time: string,
  category: ItineraryActivity['category'],
  destination: Destination,
  day: number,
  _interests: string[]
): ItineraryActivity {
  const exploreDest = getExploreDest(destination.id);
  const attractions = exploreDest?.attractions ?? destination.attractions;
  const restaurants = exploreDest?.restaurants ?? [];
  const hiddenGems = exploreDest?.hiddenGems ?? [];
  const transportation = exploreDest?.transportation ?? [];

  const attraction = attractions[(day + Math.floor(Math.random() * 2)) % attractions.length];
  const restaurant = restaurants.length > 0 ? restaurants[day % restaurants.length] : `local restaurant in ${destination.name}`;
  const hiddenGem = hiddenGems.length > 0 ? hiddenGems[day % hiddenGems.length] : attraction;
  const transport = transportation.length > 0 ? transportation[day % transportation.length] : 'local transport';

  const templates: Record<ItineraryActivity['category'], { title: string; description: string; cost: number }> = {
    sightseeing: {
      title: `Explore ${attraction}`,
      description: `Visit the iconic ${attraction} and soak in the beauty of ${destination.name}. A must-see landmark that defines the city.`,
      cost: Math.round(destination.budgetPerDay * 0.15),
    },
    food: {
      title: `Dine at ${restaurant}`,
      description: `Experience authentic ${destination.country} cuisine at ${restaurant}, a hand-picked restaurant near ${attraction}.`,
      cost: Math.round(destination.budgetPerDay * 0.3),
    },
    transport: {
      title: `Travel by ${transport}`,
      description: `Travel by ${transport} to your next destination within ${destination.name}.`,
      cost: Math.round(destination.budgetPerDay * 0.08),
    },
    relaxation: {
      title: 'Unwind and recharge',
      description: `Take a leisurely break at a scenic spot near ${attraction}. Perfect for photos and reflection.`,
      cost: Math.round(destination.budgetPerDay * 0.12),
    },
    shopping: {
      title: 'Souvenir shopping',
      description: `Browse local markets and boutiques for unique ${destination.country} souvenirs and handicrafts.`,
      cost: Math.round(destination.budgetPerDay * 0.2),
    },
    nightlife: {
      title: 'Evening out',
      description: `Discover ${destination.name}'s vibrant nightlife scene with live music and local bars.`,
      cost: Math.round(destination.budgetPerDay * 0.25),
    },
    adventure: {
      title: `Adventure at ${attraction}`,
      description: `Experience thrilling outdoor activities near ${attraction} — hiking, climbing, or water sports.`,
      cost: Math.round(destination.budgetPerDay * 0.35),
    },
  };

  const template = templates[category];
  return {
    time,
    title: template.title,
    description: template.description,
    category,
    cost: template.cost,
  };
}

export function generateItinerary(form: TripPlanForm): GeneratedItinerary {
  const destination =
    ALL_DESTINATIONS.find((d) => d.id === form.destinationId) ?? ALL_DESTINATIONS[0];
  const exploreDest = getExploreDest(destination.id);
  const totalDays = daysBetween(form.startDate, form.endDate) || 5;
  const stylePattern = STYLE_ACTIVITIES[form.travelStyle] ?? STYLE_ACTIVITIES.luxury;
  const days: ItineraryDay[] = [];

  const hotelMap: Record<string, string> = {
    budget: `Budget hostel near city center`,
    'mid-range': `Comfortable 3-star hotel in central ${destination.name}`,
    luxury: `5-star luxury resort with premium amenities`,
    boutique: `Curated boutique hotel with local charm`,
  };

  const hotels = exploreDest?.hotels ?? [];
  const startDate = new Date(form.startDate || new Date());

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const activities: ItineraryActivity[] = [
      generateActivity('09:00', stylePattern.morning, destination, i, form.interests),
      generateActivity('13:00', 'food', destination, i, form.interests),
      generateActivity('15:00', stylePattern.afternoon, destination, i, form.interests),
      generateActivity('19:00', stylePattern.evening, destination, i, form.interests),
    ];

    if (i === 0) {
      activities.unshift({
        time: '08:00',
        title: 'Arrival & check-in',
        description: `Arrive in ${destination.name}, settle into your accommodation, and get oriented.`,
        category: 'transport',
        cost: Math.round(destination.budgetPerDay * 0.1),
      });
    }

    if (i === totalDays - 1) {
      activities.push({
        time: '21:00',
        title: 'Farewell dinner',
        description: `End your trip with a special farewell dinner at a top-rated restaurant in ${destination.name}.`,
        category: 'food',
        cost: Math.round(destination.budgetPerDay * 0.4),
      });
    }

    const totalCost = activities.reduce((sum, a) => sum + a.cost, 0);
    const accommodation = hotels.length > 0 ? hotels[i % hotels.length] : (hotelMap[form.hotelPreference] ?? hotelMap['mid-range']);

    days.push({
      day: i + 1,
      date: date.toISOString().split('T')[0],
      title: i === 0 ? `Welcome to ${destination.name}` : i === totalDays - 1 ? `Farewell ${destination.name}` : `Day ${i + 1} in ${destination.name}`,
      activities,
      accommodation,
      meals: {
        breakfast: `Hotel breakfast — included`,
        lunch: exploreDest && exploreDest.restaurants.length > 0
          ? `Lunch at ${exploreDest.restaurants[(i + 1) % exploreDest.restaurants.length]}`
          : `Local café near ${destination.attractions[i % destination.attractions.length]}`,
        dinner: exploreDest && exploreDest.restaurants.length > 0
          ? `Dinner at ${exploreDest.restaurants[i % exploreDest.restaurants.length]}`
          : `Recommended restaurant in ${destination.name}`,
      },
      totalCost,
    });
  }

  const totalCost = days.reduce((sum, d) => sum + d.totalCost, 0);

  return {
    destination,
    totalCost,
    totalDays,
    days,
  };
}

export { CATEGORY_LABELS };
