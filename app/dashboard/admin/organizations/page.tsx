'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  CircularProgress,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Verified as VerifiedIcon,
  PendingActions as PendingIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  FolderOpen as DocsIcon,
} from '@mui/icons-material';
import AdminLayout from '@/src/components/layout/AdminLayout';
import AdminPageShell from '@/src/components/AdminSidebar/AdminPageShell';
import RoleGuard from '@/src/components/RoleGuard';
import { ConfirmationDialog } from '@/src/components/ConfirmationDialog';
import Snackbar from '@/src/components/SnackBar';
import AdminOrgDocumentDialog from '@/src/components/AdminOrgDocumentDialog';
import {
  useGetOrganizationsQuery,
  useVerifyOrganizationMutation,
  useDeleteOrganizationMutation,
} from '@/src/stores/services/OrganizerApi';
import { OrganizationResponse } from '@/src/stores/types';
import { ADMIN } from '@/src/utils/constants/adminBrand';

type FilterMode = 'all' | 'pending' | 'verified';

export default function AdminOrganizationsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [reviewOrg, setReviewOrg] = useState<OrganizationResponse | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data, isLoading } = useGetOrganizationsQuery({ page: 0, size: 200 });
  const [verifyOrg, { isLoading: verifying }] = useVerifyOrganizationMutation();
  const [deleteOrg, { isLoading: deleting }] = useDeleteOrganizationMutation();

  const allOrgs = data?.data?.content ?? [];
  const pendingCount = allOrgs.filter((o) => !o.verified).length;

  const filtered = useMemo(() => {
    let list = allOrgs;
    if (filter === 'pending') list = list.filter((o) => !o.verified);
    if (filter === 'verified') list = list.filter((o) => o.verified);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) => o.name.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q) || o.owner?.name?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allOrgs, filter, search]);

  const show = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleVerify = async (id: number) => {
    try {
      await verifyOrg(id).unwrap();
      show('Organization verified successfully');
      setReviewOrg(null);
    } catch {
      show('Failed to verify organization', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteOrg(deleteId).unwrap();
      show('Organization deleted');
    } catch {
      show('Failed to delete', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <AdminPageShell
          title="Organizations"
          breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Organizations' }]}
        >
          {/* Toolbar */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search by name, email or owner…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 260, bgcolor: ADMIN.cardBg, borderRadius: '8px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: ADMIN.textMuted }} />
                  </InputAdornment>
                ),
              }}
            />
            <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small">
              <ToggleButton value="all" sx={{ textTransform: 'none', fontSize: 13 }}>
                All ({allOrgs.length})
              </ToggleButton>
              <ToggleButton value="pending" sx={{ textTransform: 'none', fontSize: 13 }}>
                Pending
                {pendingCount > 0 && (
                  <Chip
                    label={pendingCount}
                    size="small"
                    sx={{ ml: 0.5, height: 18, fontSize: 10, bgcolor: ADMIN.error, color: '#fff' }}
                  />
                )}
              </ToggleButton>
              <ToggleButton value="verified" sx={{ textTransform: 'none', fontSize: 13 }}>
                Verified
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Card
            sx={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: `1px solid ${ADMIN.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: ADMIN.primary }} />
              </Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <BusinessIcon sx={{ fontSize: 48, color: ADMIN.border, mb: 1 }} />
                <Typography sx={{ color: ADMIN.textSecondary }}>No organizations found</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: ADMIN.pageBg }}>
                      {['Organization', 'Owner', 'Contact', 'Events', 'Status', 'Actions'].map((h) => (
                        <TableCell
                          key={h}
                          sx={{
                            fontWeight: 600,
                            color: ADMIN.heading,
                            fontSize: 12,
                            borderBottom: `1px solid ${ADMIN.border}`,
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((org) => (
                      <TableRow
                        key={org.id}
                        sx={{
                          '&:hover': { bgcolor: ADMIN.surfaceBg },
                          bgcolor: !org.verified ? ADMIN.warningBg + '50' : ADMIN.cardBg,
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              src={org.logoUrl}
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: ADMIN.primary + '20',
                                color: ADMIN.primary,
                                fontSize: 13,
                                fontWeight: 700,
                              }}
                            >
                              {!org.logoUrl && org.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: ADMIN.heading }}>
                                {org.name}
                              </Typography>
                              {org.description && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: ADMIN.textMuted, display: 'block', maxWidth: 200 }}
                                  noWrap
                                >
                                  {org.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: ADMIN.body }}>
                            {org.owner?.name ?? '—'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>
                            {org.owner?.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: ADMIN.body }}>
                            {org.email ?? '—'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>
                            {org.phone}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: ADMIN.body }}>
                            {org.totalEvents}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {org.verified ? (
                            <Chip
                              icon={<VerifiedIcon sx={{ fontSize: 12 }} />}
                              label="Verified"
                              size="small"
                              sx={{
                                bgcolor: ADMIN.successBg,
                                color: ADMIN.successText,
                                fontWeight: 600,
                                fontSize: 11,
                              }}
                            />
                          ) : (
                            <Chip
                              icon={<PendingIcon sx={{ fontSize: 12 }} />}
                              label="Pending"
                              size="small"
                              sx={{
                                bgcolor: ADMIN.warningBg,
                                color: ADMIN.warningText,
                                fontWeight: 600,
                                fontSize: 11,
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {/* Review documents — always visible, primary CTA for pending */}
                            <Tooltip title={org.verified ? 'View verification documents' : 'Review documents & verify'}>
                              <IconButton
                                size="small"
                                onClick={() => setReviewOrg(org)}
                                sx={{
                                  color: org.verified ? ADMIN.textMuted : ADMIN.primary,
                                  '&:hover': { bgcolor: org.verified ? ADMIN.pageBg : ADMIN.primaryLight },
                                }}
                              >
                                <DocsIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => setDeleteId(org.id)}
                                sx={{ color: ADMIN.error, '&:hover': { bgcolor: ADMIN.errorBg } }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </AdminPageShell>

        {/* Document review dialog */}
        {reviewOrg && (
          <AdminOrgDocumentDialog
            open={!!reviewOrg}
            organizationId={reviewOrg.id}
            organizationName={reviewOrg.name}
            isVerified={reviewOrg.verified}
            onClose={() => setReviewOrg(null)}
            onVerify={() => handleVerify(reviewOrg.id)}
            isVerifying={verifying}
          />
        )}

        <ConfirmationDialog
          open={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Organization"
          message="This will permanently delete the organization and all associated data."
          variant="error"
          loading={deleting}
          confirmText="Delete"
          cancelText="Cancel"
          disableBackdropClose
        />

        <Snackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          vertical="top"
          horizontal="right"
        />
      </AdminLayout>
    </RoleGuard>
  );
}
