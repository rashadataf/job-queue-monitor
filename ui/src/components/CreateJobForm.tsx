import { type FormEvent, useState } from 'react';
import { useJobs } from '../hooks/useJobs';

export function CreateJobForm() {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { createJob } = useJobs();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError('Job name is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await createJob({ name: name.trim() });
            setName('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create job');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Create New Job</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter job name..."
                            disabled={isSubmitting}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                boxSizing: 'border-box',
                            }}
                        />
                        {error && (
                            <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                {error}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: isSubmitting ? '#9CA3AF' : '#3B82F6',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                        }}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Job'}
                    </button>
                </div>
            </form>
        </div>
    );
}
