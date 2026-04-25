'use client';

import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { ChevronRight as ChevronIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ADMIN } from '@/src/utils/constants/adminBrand';

interface Crumb {
  label: string;
  href?: string;
}

interface AdminPageShellProps {
  title: string;
  breadcrumbs?: Crumb[];
  /** Slot for action buttons (e.g. filter chips, export button) */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminPageShell({ title, breadcrumbs = [], actions, children }: AdminPageShellProps) {
  const router = useRouter();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 20px)' }}>
      {/* Page header */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          backgroundColor: ADMIN.cardBg,
          borderRadius: '16px 16px 0 0',
          borderBottom: `1px solid ${ADMIN.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Box>
          {breadcrumbs.length > 0 && (
            <Breadcrumbs
              separator={<ChevronIcon sx={{ fontSize: 14, color: ADMIN.textMuted }} />}
              sx={{ mb: 0.5 }}
            >
              {breadcrumbs.map((c, i) =>
                c.href ? (
                  <Link
                    key={i}
                    underline="hover"
                    sx={{ fontSize: 12, color: ADMIN.textMuted, cursor: 'pointer' }}
                    onClick={() => router.push(c.href!)}
                  >
                    {c.label}
                  </Link>
                ) : (
                  <Typography key={i} sx={{ fontSize: 12, color: ADMIN.textSecondary }}>
                    {c.label}
                  </Typography>
                ),
              )}
            </Breadcrumbs>
          )}
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: ADMIN.heading, fontSize: 18, lineHeight: 1.2 }}
          >
            {title}
          </Typography>
        </Box>
        {actions && <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>{actions}</Box>}
      </Box>

      {/* Page body */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: ADMIN.pageBg,
          borderRadius: '0 0 16px 16px',
          p: 3,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: ADMIN.borderLight, borderRadius: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
