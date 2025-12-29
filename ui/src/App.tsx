import { lazy, Suspense } from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useJobSocket } from '@/hooks/useJobSocket';
import { CircularProgress, Box } from '@mui/material';
import '@/index.css';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Metrics = lazy(() => import('@/pages/Metrics').then(m => ({ default: m.Metrics })));
const JobDetails = lazy(() => import('@/components/JobDetails').then(m => ({ default: m.JobDetails })));

// Minimal loading fallback for better LCP
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <CircularProgress size={40} />
  </Box>
);

function AppContent() {
  useJobSocket(); // Initialize WebSocket connection

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/jobs/:nanoId" element={<JobDetails />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <SWRConfig
      value={{
        onError: (error) => {
          console.error('SWR Error:', error);
        },
      }}
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </SWRConfig>
  );
}

export default App;