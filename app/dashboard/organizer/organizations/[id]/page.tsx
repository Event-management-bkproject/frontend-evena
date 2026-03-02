'use client';

import { useAuth } from '@/src/hooks/auth/useAuth';
import { useGetOrganizationDetailsQuery } from '@/src/stores/services/OrganizerApi';
import { useGetMyEventsQuery } from '@/src/stores/services/EventApi';
import { useParams, useRouter } from 'next/navigation';
import React, { useMemo, useEffect } from 'react';
import ProtectedContent from '@/src/components/ProtectedContent';
import {
  Box,
  Card,
  Typography,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Business,
  Email,
  Phone,
  Language,
  Verified,
  Event as EventIcon,
  People,
  Edit,
} from '@mui/icons-material';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader';
import EventCard from '@/src/components/EventCard/EventCard';
import { OrganizationRole } from '@/src/stores/types/enums';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useSSE } from '@/src/providers/SSEProvider';
import { SSENormalizedType } from '@/src/stores/types/sse';

export default function OrganizationDetailPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const organizationId = parseInt(params.id as string, 10);
  const { t } = useTranslation();
  const { lastEvent } = useSSE();

  // Fetch organization details
  const {
    data: orgResponse,
    isLoading: loadingOrg,
    error: orgError,
    refetch: refetchOrganization,
  } = useGetOrganizationDetailsQuery(organizationId, {
    skip: !auth.accessToken || isNaN(organizationId),
  });

  // Fetch organization events
  const {
    data: eventsResponse,
    isLoading: loadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useGetMyEventsQuery(
    { page: 0, size: 100 },
    {
      skip: !auth.accessToken,
    },
  );

  const organization = orgResponse?.data;
  const allEvents = eventsResponse?.data?.content || [];

  // Filter events belonging to this organization
  const organizationEvents = useMemo(() => {
    if (!organization || !allEvents.length) return [];
    return allEvents.filter((event) => event.organizerName === organization.name);
  }, [allEvents, organization]);

  // Listen to SSE events for real-time updates
  useEffect(() => {
    if (!lastEvent) return;

    const eventData = lastEvent.data;
    const affectsThisOrg =
      eventData?.organizationId === organizationId ||
      eventData?.organizationId?.toString() === organizationId.toString();

    console.log('📨 [OrganizationDetail] Received SSE event:', lastEvent.type);

    switch (lastEvent.type) {
      case SSENormalizedType.ORGANIZATION_UPDATED:
      case SSENormalizedType.ORGANIZATION_VERIFIED:
      case SSENormalizedType.ORGANIZATION_UNVERIFIED:
        if (affectsThisOrg) {
          console.log('🔄 [OrganizationDetail] Refetching organization...');
          refetchOrganization();
        }
        break;
      case SSENormalizedType.INVITATION_ACCEPTED:
      case SSENormalizedType.INVITATION_REJECTED:
        if (affectsThisOrg) {
          console.log('🔄 [OrganizationDetail] Refetching organization (member change)...');
          refetchOrganization();
        }
        break;
      case SSENormalizedType.EVENT_CREATED:
      case SSENormalizedType.EVENT_UPDATED:
      case SSENormalizedType.EVENT_DELETED:
      case SSENormalizedType.EVENT_PUBLISHED:
        console.log('🔄 [OrganizationDetail] Refetching events...');
        refetchEvents();
        break;
      default:
        break;
    }
  }, [lastEvent, organizationId, refetchOrganization, refetchEvents]);

  const handleBack = () => {
    router.push('/dashboard/organizer/organizations');
  };

  const handleEditOrganization = () => {
    // TODO: Implement edit functionality
    console.log('Edit organization:', organizationId);
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/dashboard/organizer/events/${eventId}`);
  };

  const getRoleBadgeColor = (role: OrganizationRole) => {
    switch (role) {
      case OrganizationRole.OWNER:
        return '#F36BF9';
      case OrganizationRole.MANAGER:
        return '#37437D';
      case OrganizationRole.COORDINATOR:
        return '#5C6BC0';
      case OrganizationRole.SCANNER:
        return '#26A69A';
      case OrganizationRole.VIEWER:
        return '#ADACAE';
      default:
        return '#666';
    }
  };

  if (loadingOrg) {
    return (
      <ProtectedContent>
        <LayoutWithSidebar currentPage="organizations">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress sx={{ color: '#F36BF9' }} />
          </Box>
        </LayoutWithSidebar>
      </ProtectedContent>
    );
  }

  if (orgError || !organization) {
    return (
      <ProtectedContent>
        <LayoutWithSidebar currentPage="organizations">
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error">
              {t('messages.error.loadFailed', { item: t('common.entities.organization') })}
            </Typography>
            <Button onClick={handleBack} sx={{ mt: 2 }}>
              {t('common.buttons.goBack')}
            </Button>
          </Box>
        </LayoutWithSidebar>
      </ProtectedContent>
    );
  }

  return (
    <ProtectedContent>
      <LayoutWithSidebar currentPage="organizations">
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
          {/* Header */}
          <Box sx={{ mb: '10px' }}>
            <DashboardHeader
              title={organization.name}
              breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard/organizer' },
                { label: 'Organizations', href: '/dashboard/organizer/organizations' },
                { label: organization.name },
              ]}
              userName={auth.user?.name || 'User'}
            />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, p: '20px', overflow: 'auto', backgroundColor: '#F7F7F7', borderRadius: '20px' }}>
            {/* Back Button */}
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{
                mb: 3,
                color: '#37437D',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { backgroundColor: 'rgba(55, 67, 125, 0.08)' },
              }}
            >
              {t('organizer.backToOrganizations')}
            </Button>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
              {/* Organization Info Card */}
              <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 66%' }, minWidth: 0 }}>
                <Card sx={{ p: 3, borderRadius: '16px', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        src={organization.logoUrl}
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: '#F36BF9',
                          fontSize: '32px',
                          fontWeight: 700,
                        }}
                      >
                        {!organization.logoUrl && organization.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2A3363' }}>
                            {organization.name}
                          </Typography>
                          {organization.verified && (
                            <Verified sx={{ color: '#4CAF50', fontSize: 28 }} titleAccess={t('common.status.verified')} />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {organization.description || t('organizer.noDescriptionProvided')}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      onClick={handleEditOrganization}
                      sx={{
                        color: '#37437D',
                        '&:hover': { backgroundColor: 'rgba(55, 67, 125, 0.08)' },
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Contact Information */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {organization.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ color: '#37437D', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          {organization.email}
                        </Typography>
                      </Box>
                    )}
                    {organization.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone sx={{ color: '#37437D', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          {organization.phone}
                        </Typography>
                      </Box>
                    )}
                    {organization.website && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Language sx={{ color: '#37437D', fontSize: 20 }} />
                        <Typography
                          variant="body2"
                          component="a"
                          href={organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: '#F36BF9', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          {organization.website}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Metadata */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Created: {dayjs(organization.createdAt).format('MMM D, YYYY')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Updated: {dayjs(organization.updatedAt).format('MMM D, YYYY')}
                    </Typography>
                  </Box>
                </Card>

                {/* Events Section */}
                <Card sx={{ p: 3, borderRadius: '16px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <EventIcon sx={{ color: '#F36BF9' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2A3363' }}>
                      {t('organizer.organizationEvents', { count: organizationEvents.length })}
                    </Typography>
                  </Box>

                  {loadingEvents ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress sx={{ color: '#F36BF9' }} />
                    </Box>
                  ) : organizationEvents.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <EventIcon sx={{ fontSize: 64, color: '#CCC', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        {t('organizer.noEventsForOrganization')}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 3,
                        overflowX: 'auto',
                        pb: 2,
                        '&::-webkit-scrollbar': { height: 8 },
                        '&::-webkit-scrollbar-track': { backgroundColor: '#F0F0F0', borderRadius: 4 },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: '#F36BF9', borderRadius: 4 },
                      }}
                    >
                      {organizationEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={() => handleEventClick(event.id)}
                          variant="dashboard"
                          showActions={false}
                        />
                      ))}
                    </Box>
                  )}
                </Card>
              </Box>

              {/* Stats & Members Sidebar */}
              <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 33%' } }}>
                {/* Stats Card */}
                <Card sx={{ p: 3, borderRadius: '16px', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2A3363', mb: 2 }}>
                    {t('organizer.statistics')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon sx={{ color: '#F36BF9', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          {t('organizer.totalEventsLabel')}
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#F36BF9' }}>
                        {organization.totalEvents}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People sx={{ color: '#37437D', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          {t('organizer.totalMembersLabel')}
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#37437D' }}>
                        {organization.totalMembers}
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                {/* Members Card */}
                <Card sx={{ p: 3, borderRadius: '16px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <People sx={{ color: '#F36BF9' }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2A3363' }}>
                        {t('organizer.members')}
                      </Typography>
                    </Box>
                    <Chip label={organization.members.length} size="small" sx={{ bgcolor: '#EEF0FF', color: '#37437D' }} />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 400, overflowY: 'auto' }}>
                    {organization.members.map((member) => (
                      <Box
                        key={member.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          borderRadius: '8px',
                          backgroundColor: '#F7F7F7',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2A3363' }}>
                            {member.userName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                          {!member.invitationAccepted && (
                            <Chip
                              label={t('organizer.pendingInvitation')}
                              size="small"
                              sx={{
                                mt: 0.5,
                                height: 20,
                                fontSize: '10px',
                                bgcolor: '#FFF3E0',
                                color: '#F57C00',
                              }}
                            />
                          )}
                        </Box>
                        <Chip
                          label={member.role}
                          size="small"
                          sx={{
                            bgcolor: getRoleBadgeColor(member.role),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '11px',
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Card>
              </Box>
            </Box>
          </Box>
        </Box>
      </LayoutWithSidebar>
    </ProtectedContent>
  );
}
