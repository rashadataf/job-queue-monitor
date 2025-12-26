import { SWRConfig } from 'swr';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Metrics } from '@/pages/Metrics';
import { JobDetails } from '@/components/JobDetails';
import { useJobSocket } from '@/hooks/useJobSocket';
import '@/index.css';

function AppContent() {
  useJobSocket(); // Initialize WebSocket connection

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/jobs/:nanoId" element={<JobDetails />} />
      </Route>
    </Routes>
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