import { SWRConfig } from 'swr';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { JobDetails } from '@/components/JobDetails';
import '@/index.css';

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
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs/:nanoId" element={<JobDetails />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SWRConfig>
  );
}

export default App;