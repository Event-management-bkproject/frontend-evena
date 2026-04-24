import { useEffect } from 'react';
import { useSSE } from '@/src/providers/SSEProvider';
import { SSENormalizedType } from '@/src/stores/types/sse';
import { FlexPassAPI } from '@/src/stores/services/FlexPassApi';
import { useAppDispatch } from '@/src/stores/hooks';

const REFETCH_EVENTS: SSENormalizedType[] = [
  SSENormalizedType.FLEXPASS_LISTING_APPROVED,
  SSENormalizedType.FLEXPASS_LISTING_REJECTED,
  SSENormalizedType.FLEXPASS_LISTING_EXPIRED,
  SSENormalizedType.FLEXPASS_PRICE_LOCKED,
  SSENormalizedType.FLEXPASS_SALE_WINDOW_OPENED,
  SSENormalizedType.FLEXPASS_SALE_WINDOW_CLOSED,
  SSENormalizedType.FLEXPASS_TRANSFER_COMPLETED,
  SSENormalizedType.FLEXPASS_TRANSFER_FAILED,
  SSENormalizedType.FLEXPASS_REFUND_COMPLETED,
  SSENormalizedType.FLEXPASS_REFUND_FAILED,
];

export function useFlexPassSSE() {
  const { lastEvent } = useSSE();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!lastEvent) return;
    if (REFETCH_EVENTS.includes(lastEvent.type)) {
      dispatch(FlexPassAPI.util.invalidateTags(['FlexPassListing']));
    }
  }, [lastEvent, dispatch]);
}
