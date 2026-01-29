// components/Sidebar/Sidebar.tsx
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
  Button,
} from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  Place as PlaceIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/hooks/auth/useAuth';
import Image from 'next/image';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentPage?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, currentPage = '' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { logout, auth } = useAuth();
  const { t } = useTranslation();

  const menuItems = [
    { text: t('common.navigation.dashboard'), path: '/dashboard/organizer', icon: <DashboardIcon />, exact: true },
    { text: t('common.navigation.organizations'), path: '/dashboard/organizer/organizations', icon: <BusinessIcon />, exact: false },
    { text: t('common.navigation.events'), path: '/dashboard/organizer/events', icon: <EventIcon />, exact: false },
    // { text: 'Venues', path: '/venues', icon: <PlaceIcon /> },
  ];

  const isActiveRoute = (itemPath: string, exact: boolean = false) => {
    if (exact) {
      return pathname === itemPath;
    }
    return pathname.startsWith(itemPath);
  };

  const handleMenuItemClick = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      if (isMobile) {
        onClose();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            backgroundColor: '#E4E6F5', // Background color for sidebar
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ p: 2 }}>
            {/* Logo thay thế chữ Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Image
                src="/logoOrg.svg"
                alt="F-Anizer Logo"
                width={40}
                height={40}
                priority
                style={{
                  objectFit: 'contain',
                  width: 'auto',
                  height: 'auto',
                }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 'bold',
                  ml: 1,
                  color: '#2A3363',
                  fontSize: '1.25rem',
                }}
              >
                F-Anizer
              </Typography>
            </Box>
            <List>
              {menuItems.map((item) => {
                const isActive = isActiveRoute(item.path, item.exact);
                return (
                  <Box
                    key={item.text}
                    sx={{
                      position: 'relative',
                      mb: 0.5,
                    }}
                  >
                    {/* Small rectangle for selected item */}
                    {isActive && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 4,
                          height: 30,
                          backgroundColor: '#F36BF9',
                          borderRadius: '20px',
                          zIndex: 1,
                        }}
                      />
                    )}
                    <ListItemButton
                      selected={isActive}
                      onClick={() => handleMenuItemClick(item.path)}
                      sx={{
                        borderRadius: 1,
                        color: isActive ? '#F36BF9' : '#2A3363', // Text colors
                        '&:hover': {
                          backgroundColor: 'rgba(243, 107, 249, 0.1)',
                        },
                        '&.Mui-selected': {
                          color: '#F36BF9',
                          backgroundColor: 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(243, 107, 249, 0.1)',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: isActive ? '#F36BF9' : '#2A3363',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </Box>
                );
              })}
            </List>
          </Box>
        </Box>

        {/* User Info and Logout Button for Mobile */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="text"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              borderRadius: '10px',
              color: '#36437C',
              backgroundColor: '#D8DAEB',
              '&:hover': {
                backgroundColor: '#C5CBDC',
              },
            }}
          >
            {t('common.buttons.logout')}
          </Button>
        </Box>
      </Drawer>

      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            backgroundColor: '#E4E6F5', // Background color for sidebar
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '20px',
            height: 'calc(100vh - 20px)',
          },
        }}
        open
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ p: 5 }}>
            {/* Logo thay thế chữ Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Image
                src="/logoOrg.svg"
                alt="Logo"
                width={200}
                height={50}
                style={{
                  objectFit: 'contain',
                  width: 'auto',
                  height: 'auto',
                }}
              />
            </Box>
            <List>
              {menuItems.map((item) => {
                const isActive = isActiveRoute(item.path, item.exact);
                return (
                  <Box
                    key={item.text}
                    sx={{
                      position: 'relative',
                      mb: 0.5,
                    }}
                  >
                    {/* Small rectangle for selected item */}
                    {isActive && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 4,
                          height: 30,
                          backgroundColor: '#F36BF9',
                          borderTopRightRadius: 10,
                          borderBottomRightRadius: 10,
                          zIndex: 1,
                        }}
                      />
                    )}
                    <ListItemButton
                      selected={isActive}
                      onClick={() => handleMenuItemClick(item.path)}
                      sx={{
                        borderRadius: 1,
                        color: isActive ? '#F36BF9' : '#2A3363', // Text colors
                        '&:hover': {
                          backgroundColor: 'rgba(243, 107, 249, 0.1)',
                        },
                        '&.Mui-selected': {
                          color: '#F36BF9',
                          backgroundColor: 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(243, 107, 249, 0.1)',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: isActive ? '#F36BF9' : '#2A3363',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </Box>
                );
              })}
            </List>
          </Box>
        </Box>

        {/* User Info and Logout Button for Desktop */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="text"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              justifyContent: 'center',
              textTransform: 'none',
              borderRadius: '10px',
              color: '#36437C',
              backgroundColor: '#D8DAEB',
              '&:hover': {
                backgroundColor: '#C5CBDC',
              },
            }}
          >
            {t('common.buttons.logout')}
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
