'use client';

import CreateEventForm from '../CreateEventForm/CreateEventForm';
import { UpdateEventFormProps } from './types';

export function UpdateEventForm({
  event,
  onSubmit,
  onCancel,
  loading,
  organizers,
  categories,
  venues,
}: UpdateEventFormProps) {
  // Helper function to get organizer ID
  const getOrganizerId = () => {
    if ('organizer' in event && event.organizer) {
      return event.organizer.id;
    }
    // Find organizer from the list based on organizerName
    if ('organizerName' in event) {
      const org = organizers.find((o) => o.name === event.organizerName);
      return org?.id || organizers[0]?.id || 0;
    }
    return organizers[0]?.id || 0;
  };

  // Helper function to get category ID
  const getCategoryId = () => {
    if ('category' in event && event.category) {
      return event.category.id;
    }
    // Find category from the list based on categoryName
    if ('categoryName' in event) {
      const cat = categories.find((c) => c.name === event.categoryName);
      return cat?.id || categories[0]?.id || 0;
    }
    return categories[0]?.id || 0;
  };

  // Helper function to get venue ID
  const getVenueId = () => {
    if ('venue' in event && event.venue) {
      return event.venue.id;
    }
    // Find venue from the list based on venueName
    if ('venueName' in event) {
      const venue = venues.find((v) => v.name === event.venueName);
      return venue?.id || venues[0]?.id || 0;
    }
    return venues[0]?.id || 0;
  };

  // Convert EventResponse to EventFormData format
  const initialValues = {
    title: event.title,
    description: 'description' in event ? event.description : '',
    startAt: event.startAt,
    endAt: event.endAt,
    organizerId: getOrganizerId(),
    categoryId: getCategoryId(),
    venueId: getVenueId(),
    coverUrl: 'coverUrl' in event ? event.coverUrl : '',
    imageUrls: 'imageUrls' in event ? event.imageUrls : [],
  };

  return (
    <CreateEventForm
      onSubmit={onSubmit}
      onCancel={onCancel}
      loading={loading}
      organizers={organizers}
      categories={categories}
      venues={venues}
      initialValues={initialValues}
      isEdit={true}
    />
  );
}

export default UpdateEventForm;
