'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import { ShoppingCart, Menu as MenuIcon, Close, Logout, AccountCircle, ConfirmationNumber } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { useGetMyOrdersQuery } from '@/src/stores/services/OrderApi';
import { OrderStatus } from '@/src/stores/types/order';

interface HeaderProps {
  cartItemCount?: number; // Deprecated: Now automatically fetched from pending orders
}

export default function Header({ cartItemCount }: HeaderProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const { logout, auth } = useAuth();

  // Resolve the correct home path based on role — prevents admin landing on /dashboard/customer
  const homePath = (() => {
    const roles = auth.user?.roles ?? [];
    if (roles.includes('ADMIN')) return '/dashboard/admin';
    if (roles.includes('ORGANIZER')) return '/dashboard/organizer';
    return '/dashboard/customer';
  })();

  // Fetch pending orders count for cart badge
  const { data: ordersResponse } = useGetMyOrdersQuery({ page: 0, size: 100 }, { skip: !auth?.accessToken });

  // Count only PENDING orders for the badge
  const pendingOrdersCount =
    ordersResponse?.data?.content?.filter((order) => order.status === OrderStatus.PENDING).length ?? 0;

  const handleNavigate = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const handleBuyTicket = () => {
    if (auth?.accessToken) {
      handleNavigate('/dashboard');
    } else {
      handleNavigate('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const menuItems = [
    { label: 'Home', path: homePath },
    { label: 'About Us', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #ED4690 0%, #5522CC 100%)',
        borderBottom: 'none',
      }}
    >
      <Toolbar sx={{ py: 1, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Logo */}
        <Box
          onClick={() => handleNavigate(homePath)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            mr: 4,
          }}
        >
          <Box
            component="img"
            src="/logoCus.svg"
            alt="Evena Logo"
            sx={{
              height: { xs: 32, md: 40 },
              width: 'auto',
            }}
          />
        </Box>

        {/* Desktop Navigation */}
        {!isMobile && auth?.accessToken && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '15px',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Spacer for mobile */}
        {isMobile && <Box sx={{ flex: 1 }} />}

        {/* Right side buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Cart Icon - Only show if logged in */}
          {auth?.accessToken && (
            <IconButton
              onClick={() => handleNavigate('/dashboard/customer/cart')}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                },
              }}
            >
              <Badge badgeContent={pendingOrdersCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
          )}

          {/* Buy Ticket Button - Desktop */}
          {!isMobile && (
            <Button
              variant="contained"
              onClick={handleBuyTicket}
              sx={{
                backgroundColor: 'white',
                color: '#ED4690',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: '25px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              {auth?.accessToken ? 'Buy Ticket' : 'Login'}
            </Button>
          )}

          {/* Account Menu - Desktop */}
          {!isMobile && auth?.user && (
            <IconButton
              onClick={handleAccountMenuOpen}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: 'white',
                  color: '#ED4690',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {auth.user.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                color: 'white',
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Close Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#F36BF9' }}>
              Menu
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>

          {/* Menu Items - Only show if logged in */}
          {auth?.accessToken && (
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(243, 107, 249, 0.1)',
                        '& .MuiListItemText-primary': {
                          color: '#F36BF9',
                        },
                      },
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: 500,
                          color: '#2A3363',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}

          {/* Buy Ticket Button - Mobile */}
          <Box sx={{ mt: 3, px: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleBuyTicket}
              sx={{
                backgroundColor: '#F36BF9',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                borderRadius: '25px',
                boxShadow: '0 4px 12px rgba(243, 107, 249, 0.3)',
                '&:hover': {
                  backgroundColor: '#e55ae0',
                  boxShadow: '0 6px 16px rgba(243, 107, 249, 0.4)',
                },
              }}
            >
              {auth?.accessToken ? 'Buy Ticket' : 'Login'}
            </Button>
          </Box>

          {/* Logout Button - Mobile */}
          {auth?.user && (
            <Box sx={{ mt: 2, px: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: '25px',
                  '&:hover': {
                    borderColor: '#b71c1c',
                    backgroundColor: 'rgba(211, 47, 47, 0.08)',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Account Menu - Desktop Dropdown */}
      <Menu
        anchorEl={accountMenuAnchor}
        open={Boolean(accountMenuAnchor)}
        onClose={handleAccountMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: '12px',
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {auth?.user && (
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E0E0E0' }}>
            <Typography variant="body2" fontWeight={600} color="#2A3363">
              {auth.user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {auth.user.email}
            </Typography>
          </Box>
        )}
        <MenuItem
          onClick={() => {
            handleAccountMenuClose();
            handleNavigate('/dashboard');
          }}
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(243, 107, 249, 0.1)',
            },
          }}
        >
          <AccountCircle sx={{ mr: 1.5, color: '#2A3363' }} />
          <Typography variant="body2">My Account</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleAccountMenuClose();
            handleNavigate('/dashboard/customer/my-tickets');
          }}
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(243, 107, 249, 0.1)',
            },
          }}
        >
          <ConfirmationNumber sx={{ mr: 1.5, color: '#2A3363' }} />
          <Typography variant="body2">My Tickets</Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleAccountMenuClose();
            handleLogout();
          }}
          sx={{
            py: 1.5,
            color: '#d32f2f',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.08)',
            },
          }}
        >
          <Logout sx={{ mr: 1.5 }} />
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
