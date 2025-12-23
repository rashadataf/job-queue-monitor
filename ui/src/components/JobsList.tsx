import { JobStatus } from '@job-queue-monitor/shared';
import { useJobs } from '../hooks/useJobs';


const statusColors: Record<JobStatus, string> = {
    [JobStatus.PENDING]: '#FDB022',
    [JobStatus.RUNNING]: '#3B82F6',
    [JobStatus.COMPLETED]: '#10B981',
    [JobStatus.FAILED]: '#EF4444',
};

const statusLabels: Record<JobStatus, string> = {
    [JobStatus.PENDING]: 'Pending',
    [JobStatus.RUNNING]: 'Running',
    [JobStatus.COMPLETED]: 'Completed',
    [JobStatus.FAILED]: 'Failed',
};

export function JobsList() {
    const { jobs, isLoading, isError } = useJobs();

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading jobs...</p>
            </div>
        );
    }

    if (isError) {
        console.error('Error loading jobs:', isError);
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#EF4444' }}>
                <p>Error loading jobs. Please try again.</p>
            </div>
        );
    }

    if (!jobs || jobs.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                <p>No jobs found. Create your first job!</p>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Jobs Queue</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {jobs.map((job) => (
                    <div
                        key={job.nanoId}
                        style={{
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            padding: '1rem',
                            backgroundColor: '#FFFFFF',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{job.name}</h3>
                                    <span
                                        style={{
                                            backgroundColor: statusColors[job.status],
                                            color: '#FFFFFF',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                        }}
                                    >
                                        {statusLabels[job.status]}
                                    </span>
                                </div>
                                <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6B7280' }}>
                                    ID: {job.nanoId}
                                </p>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
                                    <p style={{ margin: '0.25rem 0' }}>
                                        Created: {new Date(job.createdAt).toLocaleString()}
                                    </p>
                                    {job.startedAt && (
                                        <p style={{ margin: '0.25rem 0' }}>
                                            Started: {new Date(job.startedAt).toLocaleString()}
                                        </p>
                                    )}
                                    {job.completedAt && (
                                        <p style={{ margin: '0.25rem 0' }}>
                                            Completed: {new Date(job.completedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
