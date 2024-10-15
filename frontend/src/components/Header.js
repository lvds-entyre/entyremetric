// src/components/Header.js
import React from 'react';
import { AppBar, Toolbar, Button, IconButton, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import logo from '../assets/ENTYRE_Logo_white.png'; // Adjust the path to your logo

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#386743', // Set header background color to green
}));

const Logo = styled('img')(({ theme }) => ({
  height: 40,
  marginRight: theme.spacing(2),
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: '#fff',
  textTransform: 'none',
  marginLeft: theme.spacing(1),
}));

const Header = () => {
  return (
    <StyledAppBar position="static">
      <Toolbar>
        {/* Logo on the Left */}
        <IconButton edge="start" color="inherit" component={Link} to="/">
          <Logo src={logo} alt="Logo" />
        </IconButton>

        {/* Spacer to push navigation to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Links on the Right */}
        <Box sx={{ display: 'flex' }}>
          <NavButton component={Link} to="/">
            Home
          </NavButton>
          <NavButton component={Link} to="/metrics/all"> {/* New Link */}
            All Metrics
          </NavButton>
          <NavButton component={Link} to="/metrics/new">
            Add Metric
          </NavButton>
          <NavButton component={Link} to="/dashboard">
            Dashboard
          </NavButton>
          {/* Add more navigation links as needed */}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
