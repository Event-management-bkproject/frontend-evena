'use client';

import React from 'react';
import { Box, Container, Typography, Grid, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, Email, Phone, LocationOn } from '@mui/icons-material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#2A3363',
        color: 'white',
        pt: 6,
        pb: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              component="img"
              src="/logoCus.svg"
              alt="Evena Logo"
              sx={{
                height: 40,
                width: 'auto',
                mb: 2,
              }}
            />
            <Typography variant="body2" sx={{ mb: 2, color: '#B0B8D4' }}>
              Your premier destination for discovering and booking the best events. From concerts to conferences, we've
              got you covered.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <IconButton
                size="small"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(243, 107, 249, 0.2)',
                  '&:hover': { backgroundColor: '#F36BF9' },
                }}
              >
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(243, 107, 249, 0.2)',
                  '&:hover': { backgroundColor: '#F36BF9' },
                }}
              >
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(243, 107, 249, 0.2)',
                  '&:hover': { backgroundColor: '#F36BF9' },
                }}
              >
                <Instagram fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(243, 107, 249, 0.2)',
                  '&:hover': { backgroundColor: '#F36BF9' },
                }}
              >
                <LinkedIn fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/dashboard" sx={{ color: '#B0B8D4', textDecoration: 'none', '&:hover': { color: '#F36BF9' } }}>
                Browse Events
              </Link>
              <Link href="/about" sx={{ color: '#B0B8D4', textDecoration: 'none', '&:hover': { color: '#F36BF9' } }}>
                About Us
              </Link>
              <Link href="/contact" sx={{ color: '#B0B8D4', textDecoration: 'none', '&:hover': { color: '#F36BF9' } }}>
                Contact
              </Link>
              <Link href="/faq" sx={{ color: '#B0B8D4', textDecoration: 'none', '&:hover': { color: '#F36BF9' } }}>
                FAQ
              </Link>
              <Link
                href="/dashboard/organizer"
                sx={{ color: '#B0B8D4', textDecoration: 'none', '&:hover': { color: '#F36BF9' } }}
              >
                Become an Organizer
              </Link>
            </Box>
          </Grid>

          {/* Categories */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Event Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" sx={{ color: '#B0B8D4', textDecoration: 'none', '&:hover': { color: '#F36BF9' } }}>
                Music & Concerts
              </Link>
              <Link href="#" sx={{ color: '#B0B8D4', textDecoration: 'none', '&:hover': { color: '#F36BF9' } }}>
                Sports
              </Link>
              <Link href="#" sx={{ color: '#B0B8D4', textDecoration: 'none', '&:hover': { color: '#F36BF9' } }}>
                Arts & Theater
              </Link>
              <Link href="#" sx={{ color: '#B0B8D4', textDecoration: 'none', '&:hover': { color: '#F36BF9' } }}>
                Business & Conferences
              </Link>
              <Link href="#" sx={{ color: '#B0B8D4', textDecoration: 'none', '&:hover': { color: '#F36BF9' } }}>
                Food & Drink
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn sx={{ fontSize: 20, color: '#F36BF9', mt: 0.3 }} />
                <Typography variant="body2" sx={{ color: '#B0B8D4' }}>
                  123 Event Street, City Name, Country
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 20, color: '#F36BF9' }} />
                <Typography variant="body2" sx={{ color: '#B0B8D4' }}>
                  support@evena.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 20, color: '#F36BF9' }} />
                <Typography variant="body2" sx={{ color: '#B0B8D4' }}>
                  +1 (234) 567-8900
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Copyright */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#B0B8D4' }} suppressHydrationWarning>
            © {new Date().getFullYear()} Evena. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="/privacy" sx={{ color: '#B0B8D4', textDecoration: 'none', '&:hover': { color: '#F36BF9' } }}>
              Privacy Policy
            </Link>
            <Link href="/terms" sx={{ color: '#B0B8D4', textDecoration: 'none', '&:hover': { color: '#F36BF9' } }}>
              Terms of Service
            </Link>
            <Link href="/cookies" sx={{ color: '#B0B8D4', textDecoration: 'none', '&:hover': { color: '#F36BF9' } }}>
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
