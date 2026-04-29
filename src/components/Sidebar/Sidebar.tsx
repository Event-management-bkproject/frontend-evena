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
  Button,
} from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { Logout as LogoutIcon, Person as PersonIcon, AssignmentReturn as RefundIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/hooks/auth/useAuth';
import Image from 'next/image';

// ─── Inline SVG Icons (pink = active #F36BF9, dark-blue = inactive #2A3363) ──

function DashboardSvgIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 1.5H7.5C8.05156 1.5 8.5 1.94844 8.5 2.5V7.5C8.5 8.05156 8.05156 8.5 7.5 8.5H2.5C1.94844 8.5 1.5 8.05156 1.5 7.5V2.5C1.5 1.94844 1.94844 1.5 2.5 1.5Z" fill={color} />
      <path d="M2.5 11.5H7.5C8.05156 11.5 8.5 11.9484 8.5 12.5V17.5C8.5 18.0516 8.05156 18.5 7.5 18.5H2.5C1.94844 18.5 1.5 18.0516 1.5 17.5V12.5C1.5 11.9484 1.94844 11.5 2.5 11.5Z" fill={color} />
      <path d="M12.5 1.5H17.5C18.0516 1.5 18.5 1.94844 18.5 2.5V7.5C18.5 8.05156 18.0516 8.5 17.5 8.5H12.5C11.9484 8.5 11.5 8.05156 11.5 7.5V2.5C11.5 1.94844 11.9484 1.5 12.5 1.5Z" fill={color} />
      <path d="M12.5 11.5H17.5C18.0516 11.5 18.5 11.9484 18.5 12.5V17.5C18.5 18.0516 18.0516 18.5 17.5 18.5H12.5C11.9484 18.5 11.5 18.0516 11.5 17.5V12.5C11.5 11.9484 11.9484 11.5 12.5 11.5Z" fill={color} />
    </svg>
  );
}

function OrganizationsSvgIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 4C8 3.44687 8.44687 3 9 3H11C11.5531 3 12 3.44687 12 4V6C12 6.55313 11.5531 7 11 7H10.75V9H14.5C15.7437 9 16.75 10.0063 16.75 11.25V13H17C17.5531 13 18 13.4469 18 14V16C18 16.5531 17.5531 17 17 17H15C14.4469 17 14 16.5531 14 16V14C14 13.4469 14.4469 13 15 13H15.25V11.25C15.25 10.8344 14.9156 10.5 14.5 10.5H10.75V13H11C11.5531 13 12 13.4469 12 14V16C12 16.5531 11.5531 17 11 17H9C8.44687 17 8 16.5531 8 16V14C8 13.4469 8.44687 13 9 13H9.25V10.5H5.5C5.08437 10.5 4.75 10.8344 4.75 11.25V13H5C5.55313 13 6 13.4469 6 14V16C6 16.5531 5.55313 17 5 17H3C2.44687 17 2 16.5531 2 16V14C2 13.4469 2.44687 13 3 13H3.25V11.25C3.25 10.0063 4.25625 9 5.5 9H9.25V7H9C8.44687 7 8 6.55313 8 6V4Z" fill={color} />
    </svg>
  );
}

function EventsSvgIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 4C1.89688 4 1 4.89688 1 6V8C1 8.275 1.23125 8.49063 1.49063 8.58125C2.07812 8.78438 2.5 9.34375 2.5 10C2.5 10.6562 2.07812 11.2156 1.49063 11.4187C1.23125 11.5094 1 11.725 1 12V14C1 15.1031 1.89688 16 3 16H17C18.1031 16 19 15.1031 19 14V12C19 11.725 18.7687 11.5094 18.5094 11.4187C17.9219 11.2156 17.5 10.6562 17.5 10C17.5 9.34375 17.9219 8.78438 18.5094 8.58125C18.7687 8.49063 19 8.275 19 8V6C19 4.89688 18.1031 4 17 4H3ZM14 12.5V7.5H6V12.5H14ZM4.5 7C4.5 6.44688 4.94688 6 5.5 6H14.5C15.0531 6 15.5 6.44688 15.5 7V13C15.5 13.5531 15.0531 14 14.5 14H5.5C4.94688 14 4.5 13.5531 4.5 13V7Z" fill={color} />
    </svg>
  );
}

function OrdersSvgIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 3C16.1031 3 17 3.89688 17 5V15C17 16.1031 16.1031 17 15 17H5C3.89688 17 3 16.1031 3 15V5C3 3.89688 3.89688 3 5 3H15ZM5 4.5C4.725 4.5 4.5 4.725 4.5 5V15C4.5 15.275 4.725 15.5 5 15.5H15C15.275 15.5 15.5 15.275 15.5 15V5C15.5 4.725 15.275 4.5 15 4.5H5ZM12.2094 7.30937C12.4531 6.975 12.9219 6.9 13.2563 7.14375C13.5906 7.3875 13.6656 7.85625 13.4219 8.19063L9.60625 13.4406C9.47812 13.6188 9.27812 13.7312 9.05937 13.7469C8.84062 13.7625 8.625 13.6844 8.47188 13.5312L6.725 11.7844C6.43125 11.4906 6.43125 11.0156 6.725 10.725C7.01875 10.4344 7.49375 10.4313 7.78438 10.725L8.90938 11.85L12.2094 7.3125V7.30937Z" fill={color} />
    </svg>
  );
}

function FlexPassSvgIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 16H4V9H5.5V7H4C2.89688 7 2 7.89688 2 9V16C2 17.1031 2.89688 18 4 18H11C12.1031 18 13 17.1031 13 16V14.5H11V16ZM9 13H16C17.1031 13 18 12.1031 18 11V4C18 2.89688 17.1031 2 16 2H9C7.89688 2 7 2.89688 7 4V11C7 12.1031 7.89688 13 9 13Z" fill={color} />
    </svg>
  );
}

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
    { text: t('common.navigation.dashboard'), path: '/dashboard/organizer', renderIcon: (a: boolean) => <DashboardSvgIcon color={a ? '#F36BF9' : '#2A3363'} />, exact: true },
    { text: t('common.navigation.organizations'), path: '/dashboard/organizer/organizations', renderIcon: (a: boolean) => <OrganizationsSvgIcon color={a ? '#F36BF9' : '#2A3363'} />, exact: false },
    { text: t('common.navigation.events'), path: '/dashboard/organizer/events', renderIcon: (a: boolean) => <EventsSvgIcon color={a ? '#F36BF9' : '#2A3363'} />, exact: false },
    { text: t('common.navigation.orders') || 'Orders', path: '/dashboard/organizer/orders', renderIcon: (a: boolean) => <OrdersSvgIcon color={a ? '#F36BF9' : '#2A3363'} />, exact: false },
    { text: 'FlexPass', path: '/dashboard/organizer/flexpass', renderIcon: (a: boolean) => <FlexPassSvgIcon color={a ? '#F36BF9' : '#2A3363'} />, exact: false },
    { text: 'Refund Requests', path: '/dashboard/organizer/refund-requests', renderIcon: (a: boolean) => <RefundIcon sx={{ color: a ? '#F36BF9' : '#2A3363', fontSize: 20 }} />, exact: false },
    { text: 'Profile', path: '/dashboard/organizer/profile', renderIcon: (a: boolean) => <PersonIcon sx={{ color: a ? '#F36BF9' : '#2A3363', fontSize: 20 }} />, exact: false },
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
    } catch (error) {
      console.error('Logout error:', error);
    }
    if (isMobile) onClose();
    window.location.href = '/';
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
                width={50}
                height={50}
                priority
                style={{
                  objectFit: 'contain',
                  width: 'auto',
                  height: '70px',
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
                        {item.renderIcon(isActive)}
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
                width={50}
                height={50}
                style={{
                  objectFit: 'contain',
                  width: 'auto',
                  height: '70px',
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
                        {item.renderIcon(isActive)}
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
