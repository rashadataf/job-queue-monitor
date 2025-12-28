import { Link, Outlet, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Container, Box, Button } from "@mui/material";
import { Dashboard as DashboardIcon, Work as WorkIcon, Analytics as AnalyticsIcon } from "@mui/icons-material";

export const Layout = () => {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="default" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <WorkIcon sx={{ mr: 1 }} aria-hidden="true" />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 4,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Job Queue Monitor
            </Typography>

            <Box component="nav" sx={{ flexGrow: 1, display: 'flex' }} aria-label="Main navigation">
              <Button
                component={Link}
                to="/"
                startIcon={<DashboardIcon aria-hidden="true" />}
                sx={{
                  my: 2,
                  color: location.pathname === "/" ? 'primary.main' : 'text.secondary',
                  display: 'flex',
                }}
                aria-current={location.pathname === "/" ? "page" : undefined}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                to="/metrics"
                startIcon={<AnalyticsIcon aria-hidden="true" />}
                sx={{
                  my: 2,
                  color: location.pathname === "/metrics" ? 'primary.main' : 'text.secondary',
                  display: 'flex',
                }}
                aria-current={location.pathname === "/metrics" ? "page" : undefined}
              >
                Metrics
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[100] }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            Built with ❤️ By Rashad Ataf.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
