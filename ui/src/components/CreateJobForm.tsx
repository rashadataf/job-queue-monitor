import { type FormEvent, useState } from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import { Box, Alert, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { useJobs } from '@/hooks/useJobs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
    JobType,
    type JobData,
    type ApiCallJobData,
    type MathJobData,
    type MockJobData,
} from '@job-queue-monitor/shared';

export const CreateJobForm = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState<JobType>(JobType.MOCK);
    const [data, setData] = useState<Partial<JobData>>({});
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
            await createJob({ name: name.trim(), type, data: data as JobData });
            setName('');
            setData({});
            setType(JobType.MOCK);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create job');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderDataInputs = () => {
        switch (type) {
            case JobType.API_CALL:
                {
                    const apiData = data as Partial<ApiCallJobData>;
                    return (
                        <>
                            <TextField
                                label="URL"
                                value={apiData.url || ''}
                                onChange={(e) => setData({ ...data, url: e.target.value })}
                                fullWidth
                                size="small"
                                required
                                placeholder="https://api.example.com/data"
                            />
                            <FormControl fullWidth size="small">
                                <InputLabel>Method</InputLabel>
                                <Select
                                    value={apiData.method || 'GET'}
                                    label="Method"
                                    onChange={(e) => setData({ ...data, method: e.target.value })}
                                >
                                    <MenuItem value="GET">GET</MenuItem>
                                    <MenuItem value="POST">POST</MenuItem>
                                </Select>
                            </FormControl>
                        </>
                    );
                }
            case JobType.MATH:
                {
                    const mathData = data as Partial<MathJobData>;
                    return (
                        <TextField
                            label="N (Fibonacci)"
                            type="number"
                            value={mathData.n || ''}
                            onChange={(e) => setData({ ...data, n: Number(e.target.value) })}
                            fullWidth
                            size="small"
                            required
                            helperText="Calculate Nth Fibonacci number (max 1000)"
                        />
                    );
                }
            case JobType.MOCK:
            default:
                {
                    const mockData = data as Partial<MockJobData>;
                    return (
                        <TextField
                            label="Duration (ms)"
                            type="number"
                            value={mockData.duration || 5000}
                            onChange={(e) => setData({ ...data, duration: Number(e.target.value) })}
                            fullWidth
                            size="small"
                            helperText="Simulated processing time"
                        />
                    );
                }
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
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter job name..."
                            disabled={isSubmitting}
                            error={!!error}
                        />

                        <FormControl fullWidth size="small">
                            <InputLabel>Job Type</InputLabel>
                            <Select
                                value={type}
                                label="Job Type"
                                onChange={(e) => {
                                    setType(e.target.value as JobType);
                                    setData({});
                                }}
                            >
                                <MenuItem value={JobType.MOCK}>Mock Processing</MenuItem>
                                <MenuItem value={JobType.API_CALL}>API Call</MenuItem>
                                <MenuItem value={JobType.MATH}>Math Calculation</MenuItem>
                            </Select>
                        </FormControl>

                        {renderDataInputs()}

                        <Button type="submit" disabled={isSubmitting} fullWidth>
                            <AddIcon sx={{ mr: 1 }} /> Create Job
                        </Button>

                        {error && <Alert severity="error">{error}</Alert>}
                    </Box>
                </form>
            </CardContent>
        </Card>
    );
}
