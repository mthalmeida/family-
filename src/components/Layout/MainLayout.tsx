import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Category,
  Logout,
  AddCircle,
  ListAltTwoTone,
  CalendarMonth,
  SmartToy,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCountdownStore } from '../../stores/useCountdownStore';

const drawerWidth = 240;

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [value, setValue] = useState(0);
  const { logout } = useAuth();
  const { addCountdown } = useCountdownStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Mordomo IA', icon: <SmartToy />, path: '/butler-ai' },
    { text: 'Categorias', icon: <Category />, path: '/categories' },
    { text: 'Lista de compras', icon: <ListAltTwoTone />, path: '/shopping-list' },
    { text: 'Agenda', icon: <CalendarMonth />, path: '/agenda' },
    {
      text: 'Novo Contador',
      icon: <AddCircle />,
      onClick: async () => {
        await addCountdown({
          title: 'Nova Contagem Regressiva',
          target_date: new Date().toISOString(),
          background_image_url: null,
        });
        navigate('/dashboard');
      },
    },
  ];

  const bottomMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', color: 'primary' },
    { text: 'Nova Transação', icon: <AddCircle />, path: '/transaction/new', color: 'suces' },
    { text: 'Lista de compras', icon: <ListAltTwoTone />, path: '/shopping-list', color: 'primary' },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => {
              if (item.onClick) {
                item.onClick();
              } else {
                navigate(item.path);
              }
              setMobileOpen(false);
            }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton onClick={() => {
            logout();
            setMobileOpen(false);
          }}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          borderRadius: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="primary"
            aria-label="abrir menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: 'none' },
              '&:focus': {
                outline: 'none',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" color="primary" sx={{ fontWeight: 500 }}>
            Family+
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                borderRadius: 0,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                borderRadius: 0,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mb: isMobile ? 7 : 0,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
      {isMobile && (
        <Paper
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
          elevation={4}
        >
          <BottomNavigation
            value={value}
            onChange={(_event, newValue) => {
              setValue(newValue);
              navigate(bottomMenuItems[newValue].path);
            }}
          >
            {bottomMenuItems.map((item) => (
              <BottomNavigationAction
                key={item.text}
                label={item.text}
                icon={item.icon}
                color={item.color}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}