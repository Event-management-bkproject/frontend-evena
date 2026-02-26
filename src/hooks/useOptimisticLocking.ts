/**
 * useOptimisticLocking Hook
 *
 * Provides optimistic locking functionality for update forms.
 * Extracted from UpdateOrganizationForm to be reusable across all update operations.
 *
 * BUSINESS LOGIC PRESERVED:
 * - Version tracking when form opens
 * - SSE event listening for concurrent modifications
 * - Conflict detection and prevention
 * - Version inclusion in update requests
 *
 * Usage:
 * const { hasConflict, conflictMessage, version, resetConflict } = useOptimisticLocking({
 *   entityId: organization.id,
 *   entityVersion: organization.version,
 *   entityType: 'ORGANIZATION',
 *   eventTypes: ENTITY_EVENT_TYPES.ORGANIZATION,
 * });
 */

import { useEffect, useState, useCallback } from 'react';
import { useSSE } from '@/src/providers/SSEProvider';
import { SSENormalizedType } from '@/src/stores/types/sse';

// Entity types for SSE event matching
export type EntityType = 'ORGANIZATION' | 'EVENT' | 'VENUE' | 'CATEGORY' | 'TICKET_TYPE';

// Map entity types to their ID field in SSE events
const ENTITY_ID_FIELDS: Record<EntityType, string> = {
  ORGANIZATION: 'organizationId',
  EVENT:        'eventId',
  VENUE:        'venueId',
  CATEGORY:     'categoryId',
  TICKET_TYPE:  'ticketTypeId',
};

interface UseOptimisticLockingProps {
  /** The ID of the entity being edited (number for Long IDs, string for UUID IDs) */
  entityId: number | string;
  /** The version of the entity when the form was opened */
  entityVersion: number;
  /** The type of entity for SSE event matching */
  entityType: EntityType;
  /** SSE event types that indicate this entity was modified */
  eventTypes: readonly SSENormalizedType[];
  /** Optional callback when conflict is detected */
  onConflict?: () => void;
}

interface UseOptimisticLockingReturn {
  /** Whether a conflict has been detected */
  hasConflict: boolean;
  /** Human-readable conflict message */
  conflictMessage: string;
  /** The version to include in update request */
  version: number;
  /** Reset conflict state (e.g., when reopening form with fresh data) */
  resetConflict: () => void;
  /** Timestamp when form was opened */
  formOpenedAt: number;
}

export function useOptimisticLocking({
  entityId,
  entityVersion,
  entityType,
  eventTypes,
  onConflict,
}: UseOptimisticLockingProps): UseOptimisticLockingReturn {
  const { lastEvent } = useSSE();

  // Track conflict state
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');

  // Track the initial version when form opened
  const [initialVersion, setInitialVersion] = useState(entityVersion);

  // Track processed SSE events to avoid re-processing on remount
  const [processedEventId, setProcessedEventId] = useState<string | null>(null);

  // Track the timestamp when form was opened to ignore old SSE events
  const [formOpenedAt] = useState(() => Date.now());

  // Get the ID field name for this entity type
  const entityIdField = ENTITY_ID_FIELDS[entityType];

  // Reset conflict state when entity data changes (e.g., modal reopened with fresh data)
  useEffect(() => {
    setHasConflict(false);
    setConflictMessage('');
    setInitialVersion(entityVersion);
    setProcessedEventId(null);
  }, [entityId, entityVersion]);

  // Listen for SSE updates to this entity
  useEffect(() => {
    if (!lastEvent) return;

    // Generate unique event ID
    const eventId = `${lastEvent.type}-${lastEvent.data?.[entityIdField]}-${lastEvent.timestamp || ''}`;

    // Skip if already processed this event
    if (processedEventId === eventId) return;

    // Skip events that happened before form was opened
    const eventTime = lastEvent.timestamp ? new Date(lastEvent.timestamp).getTime() : Date.now();
    if (eventTime < formOpenedAt) return;

    // Check if this event affects our entity
    if (
      eventTypes.includes(lastEvent.type) &&
      lastEvent.data?.[entityIdField] === entityId
    ) {
      setHasConflict(true);
      setConflictMessage(
        `This ${entityType.toLowerCase()} has been modified by another user or session. ` +
        'Please close this form and reopen it to get the latest data before making changes.'
      );
      setProcessedEventId(eventId);

      // Call optional callback
      onConflict?.();
    }
  }, [lastEvent, entityId, entityIdField, eventTypes, processedEventId, formOpenedAt, entityType, onConflict]);

  // Reset conflict function
  const resetConflict = useCallback(() => {
    setHasConflict(false);
    setConflictMessage('');
    setProcessedEventId(null);
  }, []);

  return {
    hasConflict,
    conflictMessage,
    version: initialVersion,
    resetConflict,
    formOpenedAt,
  };
}

/**
 * Predefined event type configurations for common entities.
 * Import this alongside useOptimisticLocking to avoid repeating event type lists.
 */
export const ENTITY_EVENT_TYPES = {
  ORGANIZATION: [
    SSENormalizedType.ORGANIZATION_UPDATED,
    SSENormalizedType.ORGANIZATION_VERIFIED,
    SSENormalizedType.ORGANIZATION_UNVERIFIED,
  ],
  EVENT: [
    SSENormalizedType.EVENT_UPDATED,
    SSENormalizedType.EVENT_PUBLISHED,
    SSENormalizedType.EVENT_CANCELLED,
  ],
  VENUE: [
    SSENormalizedType.VENUE_UPDATED,
  ],
  CATEGORY: [
    SSENormalizedType.CATEGORY_UPDATED,
  ],
  TICKET_TYPE: [
    SSENormalizedType.TICKET_TYPE_UPDATED,
    SSENormalizedType.TICKET_TYPE_DEACTIVATED,
  ],
} as const;

export default useOptimisticLocking;
