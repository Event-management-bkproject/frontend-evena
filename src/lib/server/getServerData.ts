import 'server-only';

import type {
  OrganizationResponse,
  CategoryResponse,
  VenueResponse,
} from '@/src/stores/types/event';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

/**
 * Server-side fetch với token từ cookies hoặc headers
 * NOTE: Vì dự án đang dùng localStorage cho token, data fetching sẽ được thực hiện
 * ở client-side với React Query. Server Components chỉ dùng cho static/public data.
 */

/**
 * Server-side: Fetch categories (public data, không cần auth)
 */
export async function getCategories(): Promise<CategoryResponse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      next: {
        revalidate: 300, // Cache 5 phút
        tags: ['categories'],
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

/**
 * Server-side: Fetch venues (public data, không cần auth)
 */
export async function getVenues(): Promise<VenueResponse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/venues?page=0&size=100`, {
      next: {
        revalidate: 300, // Cache 5 phút
        tags: ['venues'],
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch venues');
    }

    const data: PageResponse<VenueResponse> = await response.json();
    return data.content || [];
  } catch (error) {
    console.error('Failed to fetch venues:', error);
    return [];
  }
}

/**
 * NOTE: Organizations data cần auth token từ localStorage
 * → Fetch trên client-side với React Query
 */
