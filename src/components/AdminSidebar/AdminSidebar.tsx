'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  ShoppingCart as OrdersIcon,
  ConfirmationNumber as TicketsIcon,
  AssignmentReturn as RefundIcon,
  Category as ContentIcon,
  Timeline as ActivityIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  SwapHoriz as FlexPassIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { useGetOrganizationsQuery } from '@/src/stores/services/OrganizerApi';
import { useGetOrganizerRefundRequestsQuery } from '@/src/stores/services/RefundRequestApi';
import { useGetOrganizerListingsQuery } from '@/src/stores/services/FlexPassApi';
import { FlexPassListingStatus } from '@/src/stores/types/flexpass';
import { ADMIN } from '@/src/utils/constants/adminBrand';

const SIDEBAR_W = 240;

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

function useBadgeCounts() {
  const { data: orgsData } = useGetOrganizationsQuery({ page: 0, size: 200 });
  const { data: refundsData } = useGetOrganizerRefundRequestsQuery({ page: 0, size: 100, status: 'PENDING' });
  const { data: flexPassData } = useGetOrganizerListingsQuery();
  const pendingOrgs = (orgsData?.data?.content ?? []).filter((o) => !o.verified).length;
  const pendingRefunds = refundsData?.data?.totalElements ?? 0;
  const pendingFlexPass = (flexPassData?.data ?? []).filter((l) => l.status === FlexPassListingStatus.PENDING_APPROVAL).length;
  return { pendingOrgs, pendingRefunds, pendingFlexPass };
}

interface NavItem {
  label: string;
  path: string;
  exact?: boolean;
  icon: React.ReactNode;
  badge?: number;
}

function BadgeDot({ count }: { count: number }) {
  if (!count) return null;
  return (
    <Box
      sx={{
        ml: 'auto',
        minWidth: 20,
        height: 20,
        borderRadius: '10px',
        backgroundColor: ADMIN.error,
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 0.75,
      }}
    >
      {count > 99 ? '99+' : count}
    </Box>
  );
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ open, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout, auth } = useAuth();
  const { t } = useTranslation();
  const { pendingOrgs, pendingRefunds, pendingFlexPass } = useBadgeCounts();

  const navItems: NavItem[] = [
    { label: 'Overview',      path: '/dashboard/admin',               exact: true, icon: <DashboardIcon fontSize="small" /> },
    { label: 'Organizations', path: '/dashboard/admin/organizations',              icon: <BusinessIcon fontSize="small" />, badge: pendingOrgs },
    { label: 'Events',        path: '/dashboard/admin/events',                     icon: <EventIcon fontSize="small" /> },
    { label: 'Orders',        path: '/dashboard/admin/orders',                     icon: <OrdersIcon fontSize="small" /> },
    { label: 'Tickets',       path: '/dashboard/admin/tickets',                    icon: <TicketsIcon fontSize="small" /> },
    { label: 'FlexPass',      path: '/dashboard/admin/flexpass',                   icon: <FlexPassIcon fontSize="small" />, badge: pendingFlexPass },
    { label: 'Refunds',       path: '/dashboard/admin/refunds',                    icon: <RefundIcon fontSize="small" />, badge: pendingRefunds },
    { label: 'Content',       path: '/dashboard/admin/content',                    icon: <ContentIcon fontSize="small" /> },
    { label: 'Activity Log',  path: '/dashboard/admin/activity-log',               icon: <ActivityIcon fontSize="small" /> },
  ];

  const bottomItems: NavItem[] = [
    { label: 'Profile', path: '/dashboard/admin/profile', icon: <PersonIcon fontSize="small" /> },
  ];

  const isActive = (path: string, exact = false) =>
    exact ? pathname === path : pathname.startsWith(path);

  const handleNav = (path: string) => {
    router.push(path);
    if (isMobile) onClose();
  };

  const handleLogout = async () => {
    await logout();
    if (isMobile) onClose();
    window.location.href = '/';
  };

  const renderItem = (item: NavItem) => {
    const active = isActive(item.path, item.exact);
    return (
      <Tooltip key={item.path} title="" placement="right" arrow={false}>
        <ListItemButton
          selected={active}
          onClick={() => handleNav(item.path)}
          sx={{
            borderRadius: '8px',
            mx: 1,
            mb: 0.5,
            py: 1,
            px: 1.5,
            color: active ? ADMIN.sidebarTextActive : ADMIN.sidebarText,
            backgroundColor: active ? ADMIN.sidebarBgActive : 'transparent',
            '&:hover': {
              backgroundColor: active ? ADMIN.sidebarBgActive : ADMIN.sidebarBgHover,
              color: '#fff',
            },
            '&.Mui-selected': {
              backgroundColor: ADMIN.sidebarBgActive,
              '&:hover': { backgroundColor: ADMIN.sidebarBgActive },
            },
            transition: 'all 0.15s ease',
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 32,
              color: active ? ADMIN.primary : ADMIN.sidebarText,
              transition: 'color 0.15s',
              '.MuiListItemButton-root:hover &': { color: ADMIN.primary },
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              letterSpacing: '0.01em',
            }}
          />
          {item.badge ? <BadgeDot count={item.badge} /> : null}
          {active && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 3,
                height: 20,
                borderTopRightRadius: 3,
                borderBottomRightRadius: 3,
                backgroundColor: ADMIN.primary,
              }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    );
  };

  const sidebarContent = (
    <Box
      sx={{
        width: SIDEBAR_W,
        height: '100%',
        backgroundColor: ADMIN.sidebarBg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand header */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${ADMIN.primary} 0%, ${ADMIN.primaryHover} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AdminIcon sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
              Admin Panel
            </Typography>
            <Typography sx={{ color: ADMIN.sidebarText, fontSize: 11, lineHeight: 1 }}>
              {auth.user?.email ?? 'Administrator'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: ADMIN.sidebarBorder, mx: 2, mb: 1 }} />

      {/* Main nav */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1, '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { bgcolor: ADMIN.sidebarBorder, borderRadius: 4 } }}>
        <Typography sx={{ px: 2.5, mb: 1, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: ADMIN.sidebarText, textTransform: 'uppercase' }}>
          Management
        </Typography>
        <List disablePadding>{navItems.map(renderItem)}</List>

        <Divider sx={{ borderColor: ADMIN.sidebarBorder, mx: 2, my: 1.5 }} />

        <Typography sx={{ px: 2.5, mb: 1, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: ADMIN.sidebarText, textTransform: 'uppercase' }}>
          Account
        </Typography>
        <List disablePadding>{bottomItems.map(renderItem)}</List>
      </Box>

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            py: 1,
            px: 1.5,
            color: ADMIN.sidebarText,
            '&:hover': { backgroundColor: '#991B1B22', color: '#FCA5A5' },
            transition: 'all 0.15s ease',
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t('common.buttons.logout')}
            primaryTypographyProps={{ fontSize: 13 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: SIDEBAR_W, border: 'none' },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_W,
            border: 'none',
            position: 'relative',
            height: 'calc(100vh - 20px)',
            borderRadius: '16px',
            overflow: 'hidden',
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

export default AdminSidebar;
