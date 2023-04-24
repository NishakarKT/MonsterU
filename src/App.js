import React, { useState, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
// components
import Battle from "./pages/Battle";
import Home from "./pages/Home";
import { BATTLE_ROUTE } from "./constants/routes";
// constants
import { COMPANY } from "./constants/vars";
// mui
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Drawer as MuiDrawer, Box, AppBar as MuiAppBar, Toolbar, List, Typography, Divider, IconButton, Badge, Container, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { ChevronLeft, CatchingPokemon } from "@mui/icons-material";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const mdTheme = createTheme();

const App = () => {
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [foeTrainer, setFoeTrainer] = useState(null);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar sx={{ pr: "24px" }}>
            <IconButton color="inherit">
              <CatchingPokemon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              {COMPANY}
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" sx={{ display: "none" }} open={open}>
          <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", px: [1] }}>
            <IconButton onClick={toggleDrawer}>
              <ChevronLeft />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <ListItemButton onClick={() => navigate(BATTLE_ROUTE)}>
              <ListItemIcon>
                <CatchingPokemon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </List>
        </Drawer>
        <Box ref={boxRef} component="main" sx={{ backgroundColor: (theme) => (theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[900]), flexGrow: 1, height: "100vh", overflow: "auto" }}>
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route path="/battle/*" element={<Battle boxRef={boxRef} foeTrainer={foeTrainer} />} />
              <Route path="/*" element={<Home setFoeTrainer={setFoeTrainer} />} />
            </Routes>
            <Typography sx={{ pt: 4 }} variant="body2" color="text.secondary" align="center">
              Copyright © {COMPANY} {new Date().getFullYear()}
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
