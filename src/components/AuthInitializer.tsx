// components/AuthInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/src/hook/useAuth';
import { useDispatch } from 'react-redux';
import { OrganizerAPI } from '@/src/stores/services/OrganizerApi';
import { EventAPI } from '@/src/stores/services/EventApi';
import { CategoryAPI } from '@/src/stores/services/CategoryApi';
import { VenueAPI } from '@/src/stores/services/VenueApi';

export default function AuthInitializer() {
  const { login, auth } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      // Nếu đã initialized thì không cần check lại
      if (auth.isInitialized) return;

      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user && data.accessToken) {
            // Khôi phục trạng thái đăng nhập từ cookie
            login(data.accessToken, data.user, true);
          }
        } else {
          // Token không hợp lệ hoặc hết hạn
          console.error('No valid authentication found');
          // Clear cache khi không có auth
          dispatch(OrganizerAPI.util.resetApiState());
          dispatch(EventAPI.util.resetApiState());
          dispatch(CategoryAPI.util.resetApiState());
          dispatch(VenueAPI.util.resetApiState());

          // Vẫn set initialized thành true dù không có auth
          login('', null, true); // Truyền isInitialized = true
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear cache khi có lỗi
        dispatch(OrganizerAPI.util.resetApiState());
        dispatch(EventAPI.util.resetApiState());
        dispatch(CategoryAPI.util.resetApiState());
        dispatch(VenueAPI.util.resetApiState());

        // Trong trường hợp error, vẫn mark là initialized
        login('', null, true); // Truyền isInitialized = true
      }
    };

    initializeAuth();
  }, [login, auth.isInitialized, dispatch]);

  return null;
}
