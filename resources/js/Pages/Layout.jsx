import { Head, router, usePage } from '@inertiajs/react';
import {
  AccountCircleTwoTone,
  Dashboard,
  InventorySharp,
  LogoutTwoTone,
  Menu,
  PasswordTwoTone,
  TopicSharp
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Container,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';
import React from 'react';

export default function Layout({ children, title }) {
  const { auth } = usePage().props;
  const [openAppDrawer, setOpenAppDrawer] = React.useState(false);
  const [openUserDrawer, setOpenUserDrawer] = React.useState(false);

  const openAppModule = (route) => (e) => {
    e.preventDefault();
    router.get(`/${route}`);
  };

  const logout = () => {
    router.post('/logout');
  };

  // Drawers
  const toggleAppDrawer = (newOpenAppDrawer) => () => {
    setOpenAppDrawer(newOpenAppDrawer);
  };
  const toggleUserDrawer = (newOpenUserDrawer) => () => {
    setOpenUserDrawer(newOpenUserDrawer);
  };

  const AppDrawerList = (
    <Box
      onClick={toggleAppDrawer(false)}
      role="presentation"
      sx={{ width: 250 }}>
      <List>
        {[
          {
            icon: <Dashboard />,
            label: 'Dashboard',
            route: 'dashboard',
          },
        ].map((item) => (
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {[
          {
            icon: <TopicSharp />,
            label: 'Questionnaires',
            route: 'questionnaires',
          },
          {
            icon: <InventorySharp />,
            label: 'Questions',
            route: 'questions',
          }
        ].map((item) => (
          <ListItem disablePadding>
            <ListItemButton onClick={openAppModule(item.route)}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={logout}>
            <ListItemIcon>
              <LogoutTwoTone />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  const UserDrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleUserDrawer(false)}>
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <PasswordTwoTone />
            </ListItemIcon>
            <ListItemText primary="Change Password" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={logout}>
            <ListItemIcon>
              <LogoutTwoTone />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>
      <Container sx={{ flexGrow: 1 }}>
        <React.Fragment>
          <AppBar position="fixed">
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={toggleAppDrawer(true)}>
                <Menu />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {title}
              </Typography>
              <IconButton color="inherit" onClick={toggleUserDrawer(true)}>
                <AccountCircleTwoTone />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Toolbar />
        </React.Fragment>
        <Paper maxWidth={false} elevation={1} sx={{ p: 2 }}>{children}</Paper>
      </Container>
      <Drawer anchor="left" open={openAppDrawer} onClose={toggleAppDrawer(false)}>
        {AppDrawerList}
      </Drawer>
      <Drawer anchor="right" open={openUserDrawer} onClose={toggleUserDrawer(false)}>
        {UserDrawerList}
      </Drawer>
    </>
  );
};