// hook/useCacheManager.ts
'use client';

import { useDispatch } from 'react-redux';
import { OrganizerAPI } from '../stores/services/OrganizerApi';
import { EventAPI } from '../stores/services/EventApi';
import { CategoryAPI } from '../stores/services/CategoryApi';
import { VenueAPI } from '../stores/services/VenueApi';

export const useCacheManager = () => {
  const dispatch = useDispatch();

  const clearAllCache = () => {
    dispatch(OrganizerAPI.util.resetApiState());
    dispatch(EventAPI.util.resetApiState());
    dispatch(CategoryAPI.util.resetApiState());
    dispatch(VenueAPI.util.resetApiState());
  };

  const invalidateOrganizers = () => {
    dispatch(OrganizerAPI.util.invalidateTags(['Organizer']));
  };

  const invalidateEvents = () => {
    dispatch(EventAPI.util.invalidateTags(['Event']));
  };

  return {
    clearAllCache,
    invalidateOrganizers,
    invalidateEvents,
  };
};
