'use client';

import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Grid,
  Typography,
  Button,
  InputAdornment,
  FormHelperText,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  LinkOutlined as LinkIcon,
  Event,
  MusicNote,
  Sports,
  Restaurant,
  LocalMovies,
  TheaterComedy,
  Brush,
  School,
  Business,
  LocalHospital,
  ShoppingCart,
  FitnessCenter,
  Psychology,
  Celebration,
  Castle,
  Nightlife,
  LiveTv,
  SportsEsports,
  Campaign,
  Festival,
  Mic,
  Museum,
  Park,
  BeachAccess,
  Hiking,
  EmojiEvents,
  Explore,
  LocalLibrary,
  Science,
} from '@mui/icons-material';
import { Field, FieldProps } from 'formik';

// ─── Types ────────────────────────────────────────────────────────────────────

interface IconPickerProps {
  /** Formik field name — when provided, connects to Formik automatically */
  name?: string;
  /** Controlled value for standalone (non-Formik) usage */
  value?: string;
  /** Callback for standalone usage */
  onChange?: (value: string) => void;
  label?: string;
  helperText?: string;
  required?: boolean;
}

// ─── Icon registry ────────────────────────────────────────────────────────────

const AVAILABLE_ICONS = [
  { name: 'Event', icon: Event, label: 'Event' },
  { name: 'MusicNote', icon: MusicNote, label: 'Music' },
  { name: 'Sports', icon: Sports, label: 'Sports' },
  { name: 'Restaurant', icon: Restaurant, label: 'Food' },
  { name: 'LocalMovies', icon: LocalMovies, label: 'Movies' },
  { name: 'TheaterComedy', icon: TheaterComedy, label: 'Theater' },
  { name: 'Brush', icon: Brush, label: 'Art' },
  { name: 'School', icon: School, label: 'Education' },
  { name: 'Business', icon: Business, label: 'Business' },
  { name: 'LocalHospital', icon: LocalHospital, label: 'Health' },
  { name: 'ShoppingCart', icon: ShoppingCart, label: 'Shopping' },
  { name: 'FitnessCenter', icon: FitnessCenter, label: 'Fitness' },
  { name: 'Psychology', icon: Psychology, label: 'Mental Health' },
  { name: 'Celebration', icon: Celebration, label: 'Celebration' },
  { name: 'Castle', icon: Castle, label: 'Castle' },
  { name: 'Nightlife', icon: Nightlife, label: 'Nightlife' },
  { name: 'LiveTv', icon: LiveTv, label: 'Live TV' },
  { name: 'SportsEsports', icon: SportsEsports, label: 'Gaming' },
  { name: 'Campaign', icon: Campaign, label: 'Campaign' },
  { name: 'Festival', icon: Festival, label: 'Festival' },
  { name: 'Mic', icon: Mic, label: 'Microphone' },
  { name: 'Museum', icon: Museum, label: 'Museum' },
  { name: 'Park', icon: Park, label: 'Park' },
  { name: 'BeachAccess', icon: BeachAccess, label: 'Beach' },
  { name: 'Hiking', icon: Hiking, label: 'Hiking' },
  { name: 'EmojiEvents', icon: EmojiEvents, label: 'Trophy' },
  { name: 'Explore', icon: Explore, label: 'Explore' },
  { name: 'LocalLibrary', icon: LocalLibrary, label: 'Library' },
  { name: 'Science', icon: Science, label: 'Science' },
];

const ICON_PREFIX = 'IconPicker/';

/** Value stored/returned for a picked icon, e.g. "IconPicker/School" */
const toIconValue = (iconName: string) => `${ICON_PREFIX}${iconName}`;

/** True if the stored value is an IconPicker selection */
const isIconPickerValue = (v: string) => v.startsWith(ICON_PREFIX);

/** Extract the raw MUI icon name from a stored value */
const extractIconName = (v: string) =>
  isIconPickerValue(v) ? v.slice(ICON_PREFIX.length) : v;

const isImageUrl = (v: string) =>
  v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/');

// ─── Trigger preview (inline, outside dialog) ─────────────────────────────────

function TriggerPreview({ value, error }: { value: string; error: boolean }) {
  const iconEntry = isIconPickerValue(value)
    ? AVAILABLE_ICONS.find((i) => i.name === extractIconName(value))
    : null;

  if (iconEntry) {
    const IconComponent = iconEntry.icon;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconComponent sx={{ fontSize: 28, color: '#F36BF9' }} />
        <Typography sx={{ color: '#2A3363' }}>{iconEntry.label}</Typography>
      </Box>
    );
  }

  if (value && isImageUrl(value)) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          component="img"
          src={value}
          alt="icon preview"
          sx={{ width: 28, height: 28, objectFit: 'contain', borderRadius: '4px' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <Typography
          sx={{
            color: '#2A3363',
            maxWidth: 300,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.875rem',
          }}
        >
          {value}
        </Typography>
      </Box>
    );
  }

  return (
    <Typography color={error ? 'error' : 'textSecondary'}>
      Select an icon or enter a URL
    </Typography>
  );
}

// ─── Core UI (no Formik dependency) ───────────────────────────────────────────

interface IconPickerBaseProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
}

function IconPickerBase({
  value,
  onChange,
  label = 'Icon',
  helperText,
  error = false,
  required = false,
}: IconPickerBaseProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'icon' | 'url'>('icon');
  const [search, setSearch] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlPreviewError, setUrlPreviewError] = useState(false);

  const handleOpen = () => {
    // Start on the tab that matches the current value
    const initialTab = value && isImageUrl(value) ? 'url' : 'icon';
    setTab(initialTab);
    setUrlInput(initialTab === 'url' ? value : '');
    setUrlPreviewError(false);
    setSearch('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleIconSelect = (iconName: string) => {
    onChange(toIconValue(iconName));
    handleClose();
  };

  const handleUrlApply = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange(trimmed);
    }
    handleClose();
  };

  const filteredIcons = AVAILABLE_ICONS.filter(
    (icon) =>
      icon.name.toLowerCase().includes(search.toLowerCase()) ||
      icon.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box>
      {/* Label */}
      <Typography
        variant="body1"
        component="label"
        sx={{
          display: 'block',
          fontWeight: '540',
          color: error ? 'error.main' : '#37437D',
          fontSize: '16px',
          mb: 1,
        }}
      >
        {label}
        {required && (
          <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
            *
          </Box>
        )}
      </Typography>

      {/* Trigger button */}
      <Button
        variant="outlined"
        onClick={handleOpen}
        fullWidth
        sx={{
          height: 56,
          justifyContent: 'flex-start',
          px: 2,
          borderColor: error ? 'error.main' : '#ddd',
          textTransform: 'none',
          '&:hover': { borderColor: error ? 'error.main' : '#F36BF9' },
        }}
      >
        <TriggerPreview value={value} error={error} />
      </Button>

      {helperText && (
        <FormHelperText error={error} sx={{ mx: '14px' }}>
          {helperText}
        </FormHelperText>
      )}

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}
        >
          <Typography variant="h6" component="span">
            Select Icon
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Tabs */}
        <Box sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', minWidth: 100 },
              '& .Mui-selected': { color: '#F36BF9 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#F36BF9' },
            }}
          >
            <Tab value="icon" label="Icons" />
            <Tab value="url" label="Image URL" icon={<LinkIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
          </Tabs>
        </Box>

        <DialogContent>
          {/* ── Icons tab ── */}
          {tab === 'icon' && (
            <>
              <TextField
                fullWidth
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Grid container spacing={1}>
                {filteredIcons.map((iconItem) => {
                  const IconComponent = iconItem.icon;
                  const isSelected = value === toIconValue(iconItem.name);

                  return (
                    <Grid size={{ xs: 3, sm: 2 }} key={iconItem.name}>
                      <Box
                        onClick={() => handleIconSelect(iconItem.name)}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                          p: 2,
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: isSelected ? '#F36BF9' : 'transparent',
                          backgroundColor: isSelected ? 'rgba(243, 107, 249, 0.1)' : 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: isSelected
                              ? 'rgba(243, 107, 249, 0.15)'
                              : 'rgba(0, 0, 0, 0.04)',
                            borderColor: isSelected ? '#F36BF9' : 'rgba(0, 0, 0, 0.1)',
                          },
                        }}
                      >
                        <IconComponent
                          sx={{ fontSize: 32, color: isSelected ? '#F36BF9' : '#2A3363' }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            textAlign: 'center',
                            fontSize: '0.65rem',
                            color: isSelected ? '#F36BF9' : '#666',
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          {iconItem.label}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {filteredIcons.length === 0 && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ textAlign: 'center', py: 4 }}
                >
                  No icons found
                </Typography>
              )}
            </>
          )}

          {/* ── URL tab ── */}
          {tab === 'url' && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Image URL"
                placeholder="https://example.com/icon.png"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlPreviewError(false);
                }}
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Live image preview */}
              {urlInput.trim() && (
                <Box
                  sx={{
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    border: '1px solid #eee',
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                  }}
                >
                  {!urlPreviewError ? (
                    <Box
                      component="img"
                      src={urlInput.trim()}
                      alt="preview"
                      sx={{ width: 48, height: 48, objectFit: 'contain', borderRadius: '6px' }}
                      onError={() => setUrlPreviewError(true)}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f5f5f5',
                        borderRadius: '6px',
                        border: '1px dashed #ccc',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Error
                      </Typography>
                    </Box>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                    {urlPreviewError ? 'Cannot load image from this URL' : 'Preview'}
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                disabled={!urlInput.trim()}
                onClick={handleUrlApply}
                sx={{
                  backgroundColor: '#F36BF9',
                  '&:hover': { backgroundColor: '#e55ae0' },
                  '&:disabled': { backgroundColor: '#ddd' },
                  textTransform: 'none',
                  height: 44,
                }}
              >
                Apply URL
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export const IconPicker: React.FC<IconPickerProps> = ({
  name,
  value,
  onChange,
  label,
  helperText,
  required = false,
}) => {
  if (name) {
    return (
      <Field name={name}>
        {({ field, meta, form }: FieldProps) => (
          <IconPickerBase
            value={field.value ?? ''}
            onChange={(v) => {
              form.setFieldValue(name, v);
              form.setFieldTouched(name, true, false);
            }}
            label={label}
            helperText={meta.touched && meta.error ? meta.error : helperText}
            error={meta.touched && Boolean(meta.error)}
            required={required}
          />
        )}
      </Field>
    );
  }

  return (
    <IconPickerBase
      value={value ?? ''}
      onChange={onChange ?? (() => {})}
      label={label}
      helperText={helperText}
      required={required}
    />
  );
};

export default IconPicker;
