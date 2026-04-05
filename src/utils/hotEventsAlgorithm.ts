import { EventListResponse } from '@/src/stores/types';

/**
 * Hot Events Algorithm
 *
 * Calculates a "hotness score" for events based on multiple factors:
 * 1. Recency: How recent the event was created (newer = higher score)
 * 2. Popularity: Number of tickets sold (more sales = higher score)
 * 3. Urgency: How soon the event starts (sooner = higher score, but not too soon)
 * 4. Availability: Percentage of tickets still available (scarce = higher score)
 *
 * @param events - Array of events to score
 * @param limit - Number of hot events to return (default: 6)
 * @returns Array of hot events sorted by score (highest first)
 */
export function calculateHotEvents(events: EventListResponse[], limit: number = 6): EventListResponse[] {
  const now = new Date();

  const scoredEvents = events
    .filter((event) => {
      if (event.status !== 'PUBLISHED' && event.status !== 'ONGOING') return false;
      return new Date(event.startAt) >= now || event.status === 'ONGOING';
    })
    .map((event) => {
      const eventDate = new Date(event.startAt);
      const createdDate = new Date(event.createdAt);

      // 1. Recency Score (0-25 points)
      // Events created within last 7 days get bonus points
      const daysSinceCreated = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 25 - daysSinceCreated * 2); // Decays over 12 days

      // 2. Popularity Score (0-30 points)
      // Based on sold percentage
      const soldPercentage = event.soldPercentage || 0;
      const popularityScore = (soldPercentage / 100) * 30;

      // 3. Urgency Score (0-25 points)
      // Events happening soon (but not too soon) get higher scores
      const daysUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      let urgencyScore = 0;
      if (daysUntilEvent < 3) {
        urgencyScore = 25; // Very urgent - happening this week
      } else if (daysUntilEvent < 7) {
        urgencyScore = 20; // Happening this week
      } else if (daysUntilEvent < 14) {
        urgencyScore = 15; // Happening within 2 weeks
      } else if (daysUntilEvent < 30) {
        urgencyScore = 10; // Happening this month
      } else {
        urgencyScore = 5; // Further away
      }

      // 4. Scarcity Score (0-20 points)
      // Events with limited tickets available get bonus (creates urgency)
      const availablePercentage = 100 - soldPercentage;
      let scarcityScore = 0;
      if (availablePercentage < 10 && availablePercentage > 0) {
        scarcityScore = 20; // Almost sold out!
      } else if (availablePercentage < 25) {
        scarcityScore = 15; // Running low
      } else if (availablePercentage < 50) {
        scarcityScore = 10; // Half sold
      } else if (soldPercentage > 30) {
        scarcityScore = 5; // Good sales momentum
      }

      // Total Score (max 100 points)
      const totalScore = recencyScore + popularityScore + urgencyScore + scarcityScore;

      return {
        event,
        score: totalScore,
        breakdown: {
          recency: recencyScore,
          popularity: popularityScore,
          urgency: urgencyScore,
          scarcity: scarcityScore,
        },
      };
    })
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, limit) // Take top N events
    .map((item) => item.event); // Return just the events

  return scoredEvents;
}

/**
 * Get upcoming events filtered by various criteria
 */
export function filterUpcomingEvents(
  events: EventListResponse[],
  filters: {
    categoryId?: number | null;
    timePeriod?: 'today' | 'week' | 'month' | 'all';
    searchKeyword?: string;
    searchPlace?: string;
    searchDate?: string;
  },
): EventListResponse[] {
  const now = new Date();

  return events.filter((event) => {
    if (event.status !== 'PUBLISHED' && event.status !== 'ONGOING') return false;

    const eventDate = new Date(event.startAt);
    if (eventDate < now && event.status !== 'ONGOING') return false;

    // Category filter
    if (filters.categoryId && event.categoryId !== filters.categoryId) {
      return false;
    }

    // Time period filter
    if (filters.timePeriod && filters.timePeriod !== 'all') {
      const daysDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      switch (filters.timePeriod) {
        case 'today':
          if (daysDiff > 1) return false;
          break;
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
      }
    }

    // Keyword search (title, description)
    if (filters.searchKeyword) {
      const keyword = filters.searchKeyword.toLowerCase();
      const matchesTitle = event.title.toLowerCase().includes(keyword);
      const matchesDescription = event.description?.toLowerCase().includes(keyword);
      if (!matchesTitle && !matchesDescription) return false;
    }

    // Place search (venue, city)
    if (filters.searchPlace) {
      const place = filters.searchPlace.toLowerCase();
      const matchesVenue = event.venueName?.toLowerCase().includes(place);
      const matchesCity = event.city?.toLowerCase().includes(place);
      if (!matchesVenue && !matchesCity) return false;
    }

    // Date search
    if (filters.searchDate) {
      const searchDate = new Date(filters.searchDate);
      const eventDateOnly = new Date(eventDate.toDateString());
      const searchDateOnly = new Date(searchDate.toDateString());
      if (eventDateOnly.getTime() !== searchDateOnly.getTime()) return false;
    }

    return true;
  });
}
