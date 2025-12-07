'use client';

import React from 'react';
import { Box, Container, Typography, Button, Card, CardContent, alpha } from '@mui/material';
import {
  EventAvailable,
  ConfirmationNumber,
  TrendingUp,
  Security,
  Speed,
  Support,
  ArrowForward,
  Star,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <EventAvailable sx={{ fontSize: 48, color: '#F36BF9' }} />,
      title: 'Discover Events',
      description: 'Browse thousands of amazing events happening around you',
    },
    {
      icon: <ConfirmationNumber sx={{ fontSize: 48, color: '#F36BF9' }} />,
      title: 'Instant Booking',
      description: 'Book your tickets in seconds with our streamlined checkout',
    },
    {
      icon: <Security sx={{ fontSize: 48, color: '#F36BF9' }} />,
      title: 'Secure Payments',
      description: 'Your transactions are protected with industry-leading security',
    },
    {
      icon: <Speed sx={{ fontSize: 48, color: '#F36BF9' }} />,
      title: 'Fast & Easy',
      description: 'Get your e-tickets instantly delivered to your email',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48, color: '#F36BF9' }} />,
      title: 'Real-time Updates',
      description: 'Stay informed with instant notifications about your events',
    },
    {
      icon: <Support sx={{ fontSize: 48, color: '#F36BF9' }} />,
      title: '24/7 Support',
      description: 'Our dedicated team is here to help you anytime',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Events' },
    { value: '500K+', label: 'Happy Customers' },
    { value: '50+', label: 'Cities' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      {/* Header */}
      <Header cartItemCount={0} />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #ED4690 0%, #5522CC 100%)',
          borderTop: '1px solid white',
          borderBottom: 'none',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: alpha('#ffffff', 0.1),
            filter: 'blur(60px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: alpha('#ffffff', 0.1),
            filter: 'blur(80px)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                mb: 3,
                lineHeight: 1.2,
                textShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              Your Gateway to
              <br />
              Unforgettable Experiences
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 5,
                fontWeight: 400,
                fontSize: { xs: '1.1rem', md: '1.4rem' },
                opacity: 0.95,
                lineHeight: 1.6,
              }}
            >
              Discover, book, and manage tickets for the best events, concerts, and festivals all in one place
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => router.push('/login')}
                sx={{
                  backgroundColor: 'white',
                  color: '#F36BF9',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  px: 5,
                  py: 2,
                  borderRadius: '50px',
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Explore Events
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/login')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  px: 5,
                  py: 2,
                  borderRadius: '50px',
                  borderWidth: 2,
                  textTransform: 'none',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: 'white',
                    backgroundColor: alpha('#ffffff', 0.1),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mt: -6, mb: 10, position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {stats.map((stat, index) => (
            <Box key={index} sx={{ flex: { xs: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
              <Card
                sx={{
                  textAlign: 'center',
                  py: 4,
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 32px rgba(243, 107, 249, 0.2)',
                  },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #F36BF9 0%, #e55ae0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={600}>
                  {stat.label}
                </Typography>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '3rem' },
              color: '#2A3363',
              mb: 2,
            }}
          >
            Why Choose Evena?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Experience the future of event ticketing with our powerful features
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(33.333% - 22px)' } }}
            >
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 32px rgba(243, 107, 249, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '16px',
                      backgroundColor: alpha('#F36BF9', 0.1),
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom color="#2A3363">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2A3363 0%, #1a1f3f 100%)',
          color: 'white',
          py: 10,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: alpha('#F36BF9', 0.1),
            filter: 'blur(100px)',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} sx={{ fontSize: 40, color: '#FFD700' }} />
            ))}
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Ready to Start Your Journey?
          </Typography>
          <Typography variant="h6" sx={{ mb: 5, opacity: 0.9, lineHeight: 1.7 }}>
            Join thousands of happy customers who trust Evena for all their event ticketing needs
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => router.push('/login')}
            sx={{
              backgroundColor: '#F36BF9',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1rem',
              px: 6,
              py: 2.5,
              borderRadius: '50px',
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(243, 107, 249, 0.4)',
              '&:hover': {
                backgroundColor: '#e55ae0',
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 32px rgba(243, 107, 249, 0.5)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Browse Events Now
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}
