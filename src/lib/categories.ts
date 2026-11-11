import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type Category = { key: string; label: string; color: string; icon: IconName };

// Colors sampled from the approved design PNGs (Gifts is paused, so 14).
export const CATEGORIES: Category[] = [
  { key: 'activities', label: 'Activities', color: '#E8B33A', icon: 'star-outline' },
  { key: 'places', label: 'Places', color: '#3F9A8A', icon: 'map-marker-outline' },
  { key: 'movies', label: 'Movies', color: '#8A63A8', icon: 'movie-open-outline' },
  { key: 'food', label: 'Food', color: '#E8862F', icon: 'food-variant' },
  { key: 'restaurants', label: 'Restaurants & Cafes', color: '#3A8DA8', icon: 'silverware-fork-knife' },
  { key: 'topics', label: 'Topics to Talk About', color: '#A877A8', icon: 'chat-outline' },
  { key: 'buy', label: 'Things to Buy', color: '#5E9E5E', icon: 'tag-outline' },
  { key: 'books', label: 'Books', color: '#D49A2E', icon: 'book-open-page-variant-outline' },
  { key: 'recipes', label: 'Recipes', color: '#2F9C86', icon: 'pot-steam-outline' },
  { key: 'songs', label: 'Songs & Playlists', color: '#D4608A', icon: 'music-note' },
  { key: 'games', label: 'Games', color: '#5B83AE', icon: 'gamepad-variant-outline' },
  { key: 'athome', label: 'At-Home Dates', color: '#6FA05A', icon: 'home-outline' },
  { key: 'dreams', label: 'Big Dreams', color: '#8E6BB0', icon: 'star-four-points-outline' },
  { key: 'jokes', label: 'Inside Jokes', color: '#EBB93A', icon: 'emoticon-happy-outline' },
];

export const categoryByKey = (key: string) => CATEGORIES.find((c) => c.key === key);
