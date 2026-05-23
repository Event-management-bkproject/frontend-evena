'use client';

import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Popover,
  Typography,
} from '@mui/material';
import { Notifications } from '@mui/icons-material';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
  type NotificationItem,
} from '@/src/stores/services/NotificationApi';
import { formatDistanceToNow } from 'date-fns';

function NotificationRow({
  item,
  onMarkRead,
  unreadBg,
  unreadBorder,
  unreadHover,
}: {
  item: NotificationItem;
  onMarkRead: (id: number) => void;
  unreadBg: string;
  unreadBorder: string;
  unreadHover: string;
}) {
  return (
    <Box
      onClick={() => !item.isRead && onMarkRead(item.id)}
      sx={{
        px: 2,
        py: 1.5,
        cursor: item.isRead ? 'default' : 'pointer',
        backgroundColor: item.isRead ? 'transparent' : unreadBg,
        borderLeft: item.isRead ? '3px solid transparent' : `3px solid ${unreadBorder}`,
        '&:hover': { backgroundColor: item.isRead ? 'action.hover' : unreadHover },
        transition: 'background-color 0.15s',
      }}
    >
      <Typography
        variant="body2"
        fontWeight={item.isRead ? 400 : 600}
        sx={{ color: '#1a1a2e', lineHeight: 1.4 }}
      >
        {item.title}
      </Typography>
      {item.body && (
        <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.3, lineHeight: 1.4 }}>
          {item.body}
        </Typography>
      )}
      <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5 }}>
        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
      </Typography>
    </Box>
  );
}

const STYLES = {
  organizer: {
    iconButton: {
      borderRadius: '50%',
      backgroundColor: '#36437C',
      color: 'white',
      '&:hover': { backgroundColor: '#2a3456' },
    },
    badge: { backgroundColor: '#F06CF6', color: 'white' },
    accent: '#36437C',
    headerBg: '#f8f9ff',
    unreadBg: 'rgba(54, 67, 124, 0.06)',
    unreadBorder: '#36437C',
    unreadHover: 'rgba(54, 67, 124, 0.1)',
  },
  admin: {
    iconButton: {
      borderRadius: '8px',
      backgroundColor: 'transparent',
      color: '#3B82F6',
      border: '1px solid #E2E8F0',
      '&:hover': { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
    },
    badge: { backgroundColor: '#EF4444', color: 'white' },
    accent: '#3B82F6',
    headerBg: '#F8FAFC',
    unreadBg: 'rgba(59, 130, 246, 0.06)',
    unreadBorder: '#3B82F6',
    unreadHover: 'rgba(59, 130, 246, 0.1)',
  },
} as const;

export function NotificationBell({ variant = 'organizer' }: { variant?: 'organizer' | 'admin' }) {
  const s = STYLES[variant];
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const { data: countData } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const { data: listData, isFetching } = useGetNotificationsQuery(undefined, {
    skip: !anchorEl,
  });
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const unreadCount = countData?.data?.count ?? 0;
  const notifications = listData?.data ?? [];

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleMarkRead = (id: number) => markRead(id);
  const handleMarkAllRead = () => markAllRead();

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleOpen} size="medium" sx={s.iconButton}>
        <Badge
          badgeContent={unreadCount > 0 ? unreadCount : undefined}
          color="error"
          sx={{ '& .MuiBadge-badge': { ...s.badge, fontWeight: 700 } }}
        >
          <Notifications />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #eee',
            backgroundColor: s.headerBg,
            flexShrink: 0,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: s.accent }}>
            Notifications
            {unreadCount > 0 && (
              <Typography component="span" variant="caption" sx={{ ml: 1, color: s.badge.backgroundColor, fontWeight: 700 }}>
                ({unreadCount} unread)
              </Typography>
            )}
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllRead}
              sx={{ fontSize: 12, color: s.accent, textTransform: 'none', fontWeight: 600 }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        {/* List */}
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {isFetching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((item, index) => (
              <Box key={item.id}>
                <NotificationRow
                  item={item}
                  onMarkRead={handleMarkRead}
                  unreadBg={s.unreadBg}
                  unreadBorder={s.unreadBorder}
                  unreadHover={s.unreadHover}
                />
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </Box>
      </Popover>
    </>
  );
}

export default NotificationBell;
