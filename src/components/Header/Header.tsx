'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar, Box, Toolbar, Typography, Button, IconButton, Badge,
  Menu, MenuItem, Avatar, Divider, Drawer, List, ListItem,
  ListItemButton, ListItemText, useMediaQuery, useTheme,
} from '@mui/material';
import {
  ShoppingCart, Menu as MenuIcon, Close, Logout, AccountCircle,
  ConfirmationNumber, NotificationsOutlined,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { useGetMyOrdersQuery } from '@/src/stores/services/OrderApi';
import { OrderStatus } from '@/src/stores/types/order';

// Stable reference — defined outside component to avoid re-creating on each render
const selectPendingCount = ({ data }: { data?: any }) => ({
  pendingOrdersCount:
    (data?.data?.content as { status: OrderStatus }[] | undefined)?.filter(
      (o) => o.status === OrderStatus.PENDING,
    ).length ?? 0,
});

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const { logout, auth } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const homePath = (() => {
    if (!auth?.accessToken) return '/';
    const roles = auth.user?.roles ?? [];
    if (roles.includes('ADMIN')) return '/dashboard/admin';
    if (roles.includes('ORGANIZER')) return '/dashboard/organizer';
    return '/dashboard/customer';
  })();

  const { pendingOrdersCount } = useGetMyOrdersQuery(
    { page: 0, size: 20 },
    { skip: !auth?.accessToken, selectFromResult: selectPendingCount },
  );

  const handleNavigate = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    setAccountMenuAnchor(null);
    window.location.href = '/';
  };

  const roles = auth.user?.roles ?? [];
  const isOrganizerOrAdmin = roles.includes('ADMIN') || roles.includes('ORGANIZER');

  const navItems = isOrganizerOrAdmin
    ? [
        { label: 'Home', path: homePath },
        { label: 'FlexPass', path: '/dashboard/customer/flexpass' },
      ]
    : [
        { label: 'Home', path: '/dashboard/customer' },
        { label: 'FlexPass', path: '/dashboard/customer/flexpass' },
        { label: 'My Bookings', path: '/dashboard/customer/cart' },
      ];

  const isActive = (path: string) => pathname === path.split('?')[0];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #ED4690 0%, #5522CC 100%)',
          boxShadow: scrolled ? '0 4px 20px rgba(85,34,204,0.35)' : 'none',
          transition: 'box-shadow 0.25s',
        }}
      >
        <Toolbar sx={{ py: 0.75, px: { xs: 2, sm: 3, md: 4 }, minHeight: { xs: 56, sm: 64 } }}>
          {/* Logo */}
          <Box
            onClick={() => handleNavigate(homePath)}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: { xs: 2, md: 5 }, userSelect: 'none', flexShrink: 0 }}
          >
            <Box component="img" src="/logoCus.svg" alt="Evena" sx={{ height: { xs: 32, md: 38 }, width: 'auto' }} />
          </Box>

          {/* Desktop nav */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
              {auth?.accessToken ? (
                navItems.map((item) => (
                  <Button key={item.path} onClick={() => handleNavigate(item.path)} disableRipple
                    sx={{
                      color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.75)',
                      textTransform: 'none', fontSize: 14,
                      fontWeight: isActive(item.path) ? 700 : 500,
                      px: 2, py: 0.75, borderRadius: '8px', position: 'relative',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' },
                      '&::after': isActive(item.path)
                        ? { content: '""', position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, borderRadius: 1, bgcolor: '#fff' }
                        : {},
                    }}>
                    {item.label}
                  </Button>
                ))
              ) : (
                [{ label: 'Home', path: '/' }, { label: 'Events', path: '/events' }].map((item) => (
                  <Button key={item.path} onClick={() => handleNavigate(item.path)} disableRipple
                    sx={{
                      color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.75)',
                      textTransform: 'none', fontSize: 14,
                      fontWeight: isActive(item.path) ? 700 : 500,
                      px: 2, py: 0.75, borderRadius: '8px', position: 'relative',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' },
                      '&::after': isActive(item.path)
                        ? { content: '""', position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, borderRadius: 1, bgcolor: '#fff' }
                        : {},
                    }}>
                    {item.label}
                  </Button>
                ))
              )}
            </Box>
          )}

          <Box sx={{ flex: isMobile ? 1 : 'unset' }} />

          {/* Right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {auth?.accessToken && (
              <IconButton onClick={() => handleNavigate('/dashboard/customer/cart')} size="small"
                sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' } }}>
                <Badge badgeContent={pendingOrdersCount} color="error">
                  <ShoppingCart sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            )}
            {auth?.accessToken && (
              <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' } }}>
                <NotificationsOutlined sx={{ fontSize: 20 }} />
              </IconButton>
            )}
            {!auth?.accessToken && !isMobile && (
              <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                <Button onClick={() => handleNavigate('/login')}
                  sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'none', fontWeight: 600, fontSize: 14, px: 2, borderRadius: '10px', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' } }}>
                  Sign in
                </Button>
                <Button onClick={() => handleNavigate('/register')} variant="contained"
                  sx={{ bgcolor: '#fff', color: '#ED4690', textTransform: 'none', fontWeight: 700, fontSize: 14, px: 2.5, py: 0.75, borderRadius: '10px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' } }}>
                  Get started
                </Button>
              </Box>
            )}
            {!isMobile && auth?.user && (
              <IconButton onClick={(e) => setAccountMenuAnchor(e.currentTarget)} size="small" sx={{ ml: 0.5 }}>
                <Avatar src={auth.user.avatarUrl ?? undefined}
                  sx={{ width: 34, height: 34, bgcolor: 'rgba(255,255,255,0.25)', fontSize: 13, fontWeight: 700, color: '#fff', border: '2px solid rgba(255,255,255,0.5)' }}>
                  {!auth.user.avatarUrl && (auth.user.name?.[0]?.toUpperCase() || 'U')}
                </Avatar>
              </IconButton>
            )}
            {isMobile && (
              <IconButton onClick={() => setMobileMenuOpen(true)} size="small" sx={{ color: '#fff' }}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Account dropdown */}
      <Menu anchorEl={accountMenuAnchor} open={Boolean(accountMenuAnchor)} onClose={() => setAccountMenuAnchor(null)}
        PaperProps={{ sx: { mt: 1.5, borderRadius: '14px', minWidth: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #F1F5F9' } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        {auth?.user && (
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #F1F5F9' }}>
            <Typography variant="body2" fontWeight={700} color="#0F172A">{auth.user.name}</Typography>
            <Typography variant="caption" color="#64748B">{auth.user.email}</Typography>
          </Box>
        )}
        <MenuItem onClick={() => { setAccountMenuAnchor(null); handleNavigate('/dashboard/customer/profile'); }}
          sx={{ py: 1.5, mx: 1, my: 0.5, borderRadius: '8px', '&:hover': { bgcolor: '#F8FAFC' } }}>
          <AccountCircle sx={{ mr: 1.5, color: '#64748B', fontSize: 20 }} />
          <Typography variant="body2" fontWeight={500}>My Profile</Typography>
        </MenuItem>
        <MenuItem onClick={() => { setAccountMenuAnchor(null); handleNavigate('/dashboard/customer/cart'); }}
          sx={{ py: 1.5, mx: 1, mb: 0.5, borderRadius: '8px', '&:hover': { bgcolor: '#F8FAFC' } }}>
          <ConfirmationNumber sx={{ mr: 1.5, color: '#64748B', fontSize: 20 }} />
          <Typography variant="body2" fontWeight={500}>My Bookings</Typography>
        </MenuItem>
        <Divider sx={{ borderColor: '#F1F5F9', mx: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, mx: 1, my: 0.5, borderRadius: '8px', color: '#EF4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' } }}>
          <Logout sx={{ mr: 1.5, fontSize: 20 }} />
          <Typography variant="body2" fontWeight={500}>Sign out</Typography>
        </MenuItem>
      </Menu>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}
        slotProps={{ paper: { sx: { width: 280, borderRadius: '16px 0 0 16px' } } }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ px: 2, py: 1, borderRadius: '10px', background: 'linear-gradient(135deg,#ED4690,#5522CC)', display: 'inline-flex' }}>
              <Box component="img" src="/logoCus.svg" alt="Evena" sx={{ height: 28, width: 'auto' }} />
            </Box>
            <IconButton onClick={() => setMobileMenuOpen(false)} size="small"><Close fontSize="small" /></IconButton>
          </Box>
          {auth?.user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, mb: 2, bgcolor: '#F8FAFC', borderRadius: '12px' }}>
              <Avatar src={auth.user.avatarUrl ?? undefined} sx={{ width: 38, height: 38, background: 'linear-gradient(135deg,#F36BF9,#e55ae0)', fontSize: 14, fontWeight: 700 }}>
                {!auth.user.avatarUrl && (auth.user.name?.[0]?.toUpperCase() || 'U')}
              </Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="body2" fontWeight={700} color="#0F172A" noWrap>{auth.user.name}</Typography>
                <Typography variant="caption" color="#64748B" noWrap>{auth.user.email}</Typography>
              </Box>
            </Box>
          )}
          {auth?.accessToken && (
            <List disablePadding>
              {navItems.map((item) => (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton onClick={() => handleNavigate(item.path)}
                    sx={{ borderRadius: '10px', py: 1.25, bgcolor: isActive(item.path) ? 'rgba(243,107,249,0.08)' : 'transparent', '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive(item.path) ? 700 : 500, fontSize: 14, color: isActive(item.path) ? '#F36BF9' : '#0F172A' }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
          {!auth?.accessToken && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[{ label: 'Home', path: '/' }, { label: 'Events', path: '/events' }].map((item) => (
                <ListItemButton key={item.path} onClick={() => handleNavigate(item.path)}
                  sx={{ borderRadius: '10px', py: 1.25, bgcolor: isActive(item.path) ? 'rgba(243,107,249,0.08)' : 'transparent', '&:hover': { bgcolor: '#F8FAFC' } }}>
                  <ListItemText primary={item.label} slotProps={{ primary: { style: { fontWeight: isActive(item.path) ? 700 : 500, fontSize: 14, color: isActive(item.path) ? '#F36BF9' : '#0F172A' } } }} />
                </ListItemButton>
              ))}
              <Button fullWidth variant="outlined" onClick={() => handleNavigate('/login')} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, borderColor: '#E2E8F0', color: '#475569', mt: 1 }}>Sign in</Button>
              <Button fullWidth variant="contained" onClick={() => handleNavigate('/register')} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg,#F36BF9,#e55ae0)', boxShadow: 'none' }}>Get started</Button>
            </Box>
          )}
          {auth?.user && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ borderColor: '#F1F5F9', mb: 2 }} />
              <Button fullWidth startIcon={<Logout fontSize="small" />} onClick={handleLogout}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, color: '#EF4444', justifyContent: 'flex-start', px: 2, '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' } }}>
                Sign out
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}
