// DashboardHeader component types

export interface DashboardHeaderProps {
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  userName?: string;
  userAvatar?: string;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
}
