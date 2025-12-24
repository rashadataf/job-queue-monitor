import { type FormEvent, useState } from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import { Box, Alert } from '@mui/material';
import { useJobs } from '@/hooks/useJobs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export const CreateJobForm = () => {
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
        <Card>
            <CardHeader>
                <CardTitle>Create New Job</CardTitle>
                <CardDescription>Add a new job to the queue for processing</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter job name..."
                                disabled={isSubmitting}
                                error={!!error}
                            />
                            <Button type="submit" disabled={isSubmitting}>
                                <AddIcon />
                            </Button>
                        </Box>
                        {error && <Alert severity="error">{error}</Alert>}
                    </Box>
                </form>
            </CardContent>
        </Card>
    );
}
