import { SWRConfig } from 'swr';
import { CreateJobForm } from './components/CreateJobForm';
import { JobsList } from './components/JobsList';
import './App.css';

function App() {
  return (
    <SWRConfig
      value={{
        onError: (error) => {
          console.error('SWR Error:', error);
        },
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Job Queue Monitor
          </h1>
          <p style={{ color: '#6B7280' }}>
            Monitor and manage your job queue in real-time
          </p>
        </header>

        <CreateJobForm />
        <JobsList />
      </div>
    </SWRConfig>
  );
}

export default App;
