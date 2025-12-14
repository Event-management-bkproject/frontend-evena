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
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  // Popular Material Icons
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

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  label?: string;
  helperText?: string;
}

// Available icons with their names
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

export const IconPicker: React.FC<IconPickerProps> = ({
  value = '',
  onChange,
  label = 'Icon',
  helperText,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSearch('');
  };

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    handleClose();
  };

  const filteredIcons = AVAILABLE_ICONS.filter(
    (icon) =>
      icon.name.toLowerCase().includes(search.toLowerCase()) ||
      icon.label.toLowerCase().includes(search.toLowerCase())
  );

  // Find selected icon
  const selectedIcon = AVAILABLE_ICONS.find((icon) => icon.name === value);
  const SelectedIconComponent = selectedIcon?.icon;

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      <Button
        variant="outlined"
        onClick={handleOpen}
        sx={{
          width: '100%',
          height: 56,
          justifyContent: 'flex-start',
          px: 2,
          borderColor: '#ddd',
          color: value ? '#2A3363' : '#999',
          '&:hover': {
            borderColor: '#F36BF9',
          },
        }}
      >
        {value && SelectedIconComponent ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SelectedIconComponent sx={{ fontSize: 28 }} />
            <Typography>{selectedIcon.label}</Typography>
          </Box>
        ) : (
          <Typography color="textSecondary">Select an icon</Typography>
        )}
      </Button>
      {helperText && (
        <Typography variant="caption" sx={{ mt: 0.5, color: '#666', display: 'block' }}>
          {helperText}
        </Typography>
      )}

      {/* Icon Picker Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Select Icon</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Icon Grid */}
          <Grid container spacing={1}>
            {filteredIcons.map((iconItem) => {
              const IconComponent = iconItem.icon;
              const isSelected = value === iconItem.name;

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
                        backgroundColor: isSelected ? 'rgba(243, 107, 249, 0.15)' : 'rgba(0, 0, 0, 0.04)',
                        borderColor: isSelected ? '#F36BF9' : 'rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <IconComponent
                      sx={{
                        fontSize: 32,
                        color: isSelected ? '#F36BF9' : '#2A3363',
                      }}
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
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No icons found
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default IconPicker;
