// src/components/Footer.js
import React from 'react';
import { Typography, Container, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import logo from '../assets/ENTYRE_Logo_white.png'; // Adjust the path as needed

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#592846', // Adjust background color as needed
  padding: theme.spacing(2),
  marginTop: 'auto',
}));

const Logo = styled('img')(({ theme }) => ({
  height: 40, // Adjust as needed
  marginRight: theme.spacing(1),
}));

const FooterText = styled(Typography)(({ theme }) => ({
  color: '#fff',
}));

const Footer = () => {
  return (
    <FooterContainer component="footer">
      <Container
        maxWidth="lg"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Logo src={logo} alt="Logo" />
        <FooterText variant="body1">
          © {new Date().getFullYear()} ENTYRE. All rights reserved.
        </FooterText>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
