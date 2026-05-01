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
} from '@mui/material';
import {
  Event as EventIcon,
  ShoppingCart as OrdersIcon,
  AssignmentReturn as RefundIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/hooks/auth/useAuth';
import Image from 'next/image';

// ─── Brand colors (original organizer palette) ────────────────────────────────
const C = {
  bg:           '#E4E6F5',
  divider:      '#CDD0E8',
  textInactive: '#2A3363',
  textActive:   '#F36BF9',
  sectionLabel: '#8890B5',
  activeBar:    '#F36BF9',
  activeBg:     'rgba(243, 107, 249, 0.08)',
  hoverBg:      'rgba(243, 107, 249, 0.06)',
  logoutBg:     '#D8DAEB',
  logoutHover:  '#C5CBDC',
  logoutText:   '#36437C',
} as const;

const SIDEBAR_W = 240;

// ─── Custom SVG icons (keep originals) ───────────────────────────────────────

function DashboardIcon({ active }: { active: boolean }) {
  const color = active ? C.textActive : C.textInactive;
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M2.5 1.5H7.5C8.05156 1.5 8.5 1.94844 8.5 2.5V7.5C8.5 8.05156 8.05156 8.5 7.5 8.5H2.5C1.94844 8.5 1.5 8.05156 1.5 7.5V2.5C1.5 1.94844 1.94844 1.5 2.5 1.5Z" fill={color} />
      <path d="M2.5 11.5H7.5C8.05156 11.5 8.5 11.9484 8.5 12.5V17.5C8.5 18.0516 8.05156 18.5 7.5 18.5H2.5C1.94844 18.5 1.5 18.0516 1.5 17.5V12.5C1.5 11.9484 1.94844 11.5 2.5 11.5Z" fill={color} />
      <path d="M12.5 1.5H17.5C18.0516 1.5 18.5 1.94844 18.5 2.5V7.5C18.5 8.05156 18.0516 8.5 17.5 8.5H12.5C11.9484 8.5 11.5 8.05156 11.5 7.5V2.5C11.5 1.94844 11.9484 1.5 12.5 1.5Z" fill={color} />
      <path d="M12.5 11.5H17.5C18.0516 11.5 18.5 11.9484 18.5 12.5V17.5C18.5 18.0516 18.0516 18.5 17.5 18.5H12.5C11.9484 18.5 11.5 18.0516 11.5 17.5V12.5C11.5 11.9484 11.9484 11.5 12.5 11.5Z" fill={color} />
    </svg>
  );
}

function OrgsIcon({ active }: { active: boolean }) {
  const color = active ? C.textActive : C.textInactive;
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M8 4C8 3.44687 8.44687 3 9 3H11C11.5531 3 12 3.44687 12 4V6C12 6.55313 11.5531 7 11 7H10.75V9H14.5C15.7437 9 16.75 10.0063 16.75 11.25V13H17C17.5531 13 18 13.4469 18 14V16C18 16.5531 17.5531 17 17 17H15C14.4469 17 14 16.5531 14 16V14C14 13.4469 14.4469 13 15 13H15.25V11.25C15.25 10.8344 14.9156 10.5 14.5 10.5H10.75V13H11C11.5531 13 12 13.4469 12 14V16C12 16.5531 11.5531 17 11 17H9C8.44687 17 8 16.5531 8 16V14C8 13.4469 8.44687 13 9 13H9.25V10.5H5.5C5.08437 10.5 4.75 10.8344 4.75 11.25V13H5C5.55313 13 6 13.4469 6 14V16C6 16.5531 5.55313 17 5 17H3C2.44687 17 2 16.5531 2 16V14C2 13.4469 2.44687 13 3 13H3.25V11.25C3.25 10.0063 4.25625 9 5.5 9H9.25V7H9C8.44687 7 8 6.55313 8 6V4Z" fill={color} />
    </svg>
  );
}

function OrdersSvgIcon({ active }: { active: boolean }) {
  const color = active ? C.textActive : C.textInactive;
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M15 3C16.1031 3 17 3.89688 17 5V15C17 16.1031 16.1031 17 15 17H5C3.89688 17 3 16.1031 3 15V5C3 3.89688 3.89688 3 5 3H15ZM5 4.5C4.725 4.5 4.5 4.725 4.5 5V15C4.5 15.275 4.725 15.5 5 15.5H15C15.275 15.5 15.5 15.275 15.5 15V5C15.5 4.725 15.275 4.5 15 4.5H5ZM12.2094 7.30937C12.4531 6.975 12.9219 6.9 13.2563 7.14375C13.5906 7.3875 13.6656 7.85625 13.4219 8.19063L9.60625 13.4406C9.47812 13.6188 9.27812 13.7312 9.05937 13.7469C8.84062 13.7625 8.625 13.6844 8.47188 13.5312L6.725 11.7844C6.43125 11.4906 6.43125 11.0156 6.725 10.725C7.01875 10.4344 7.49375 10.4313 7.78438 10.725L8.90938 11.85L12.2094 7.3125V7.30937Z" fill={color} />
    </svg>
  );
}

function FlexPassIcon({ active }: { active: boolean }) {
  const color = active ? C.textActive : C.textInactive;
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M11 16H4V9H5.5V7H4C2.89688 7 2 7.89688 2 9V16C2 17.1031 2.89688 18 4 18H11C12.1031 18 13 17.1031 13 16V14.5H11V16ZM9 13H16C17.1031 13 18 12.1031 18 11V4C18 2.89688 17.1031 2 16 2H9C7.89688 2 7 2.89688 7 4V11C7 12.1031 7.89688 13 9 13Z" fill={color} />
    </svg>
  );
}

// ─── Nav item type ─────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  exact?: boolean;
  icon: (active: boolean) => React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentPage?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const router   = useRouter();
  const pathname = usePathname();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout, auth } = useAuth();
  const { t } = useTranslation();

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

  const mainItems: NavItem[] = [
    { label: t('common.navigation.dashboard'),     path: '/dashboard/organizer',                exact: true, icon: (a) => <DashboardIcon active={a} /> },
    { label: t('common.navigation.organizations'), path: '/dashboard/organizer/organizations',              icon: (a) => <OrgsIcon active={a} /> },
    { label: t('common.navigation.events'),        path: '/dashboard/organizer/events',                    icon: (a) => <EventIcon fontSize="small" sx={{ color: a ? C.textActive : C.textInactive }} /> },
    { label: t('common.navigation.orders') || 'Orders', path: '/dashboard/organizer/orders',              icon: (a) => <OrdersSvgIcon active={a} /> },
    { label: 'FlexPass',                           path: '/dashboard/organizer/flexpass',                  icon: (a) => <FlexPassIcon active={a} /> },
    { label: 'Refund Requests',                    path: '/dashboard/organizer/refund-requests',           icon: (a) => <RefundIcon fontSize="small" sx={{ color: a ? C.textActive : C.textInactive }} /> },
  ];

  const accountItems: NavItem[] = [
    { label: 'Profile', path: '/dashboard/organizer/profile', icon: (a) => <PersonIcon fontSize="small" sx={{ color: a ? C.textActive : C.textInactive }} /> },
  ];

  const renderItem = (item: NavItem) => {
    const active = isActive(item.path, item.exact);
    return (
      <ListItemButton
        key={item.path}
        selected={active}
        onClick={() => handleNav(item.path)}
        sx={{
          borderRadius: '8px',
          mx: 1,
          mb: 0.5,
          py: 1,
          px: 1.5,
          color: active ? C.textActive : C.textInactive,
          backgroundColor: active ? C.activeBg : 'transparent',
          '&:hover': { backgroundColor: active ? C.activeBg : C.hoverBg },
          '&.Mui-selected': {
            backgroundColor: C.activeBg,
            '&:hover': { backgroundColor: C.activeBg },
          },
          transition: 'all 0.15s ease',
        }}
      >
        <ListItemIcon sx={{ minWidth: 32, display: 'flex', alignItems: 'center' }}>
          {item.icon(active)}
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: 13,
            fontWeight: active ? 600 : 400,
            letterSpacing: '0.01em',
          }}
        />
        {/* Active left bar — inside button (matches admin pattern) */}
        {active && (
          <Box sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: 20,
            borderTopRightRadius: 3,
            borderBottomRightRadius: 3,
            backgroundColor: C.activeBar,
          }} />
        )}
      </ListItemButton>
    );
  };

  const sidebarContent = (
    <Box sx={{ width: SIDEBAR_W, height: '100%', backgroundColor: C.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Logo area */}
      <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center' }}>
        <Image
          src="/logoOrg.svg"
          alt="Evena"
          width={120}
          height={45}
          priority
          style={{ objectFit: 'contain', width: 'auto', height: '42px' }}
        />
      </Box>

      <Divider sx={{ borderColor: C.divider, mx: 2, mb: 1 }} />

      {/* Nav scroll area */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1, '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { bgcolor: C.divider, borderRadius: 4 } }}>

        <Typography sx={{ px: 2.5, mb: 1, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C.sectionLabel, textTransform: 'uppercase' }}>
          Management
        </Typography>
        <List disablePadding>{mainItems.map(renderItem)}</List>

        <Divider sx={{ borderColor: C.divider, mx: 2, my: 1.5 }} />

        <Typography sx={{ px: 2.5, mb: 1, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C.sectionLabel, textTransform: 'uppercase' }}>
          Account
        </Typography>
        <List disablePadding>{accountItems.map(renderItem)}</List>
      </Box>

      {/* User info */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Box sx={{ px: 1.5, py: 1, borderRadius: '10px', backgroundColor: C.bg }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.textInactive, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {auth.user?.name || 'Organizer'}
          </Typography>
          <Typography sx={{ fontSize: 11, color: C.sectionLabel, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {auth.user?.email}
          </Typography>
        </Box>
      </Box>

      {/* Logout */}
      <Box sx={{ px: 2, pb: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '10px',
            py: 1,
            px: 1.5,
            backgroundColor: C.logoutBg,
            color: C.logoutText,
            '&:hover': { backgroundColor: C.logoutHover },
            transition: 'background-color 0.15s',
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: C.logoutText }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t('common.buttons.logout')}
            primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
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

export default Sidebar;
