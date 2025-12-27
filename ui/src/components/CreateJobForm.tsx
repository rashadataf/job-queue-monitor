import { type FormEvent, useState } from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import { Box, Alert, FormControl, InputLabel, Select, MenuItem, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useJobs } from '@/hooks/useJobs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
    JobType,
    JobPriority,
    type JobData,
    type ApiCallJobData,
    type MathJobData,
    type MockJobData,
} from '@shared';

export const CreateJobForm = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState<JobType>(JobType.MOCK);
    const [priority, setPriority] = useState<JobPriority>(JobPriority.NORMAL);
    const [autoRetry, setAutoRetry] = useState(false);
    const [maxRetries, setMaxRetries] = useState(3);
    const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
    const [data, setData] = useState<Partial<JobData>>({});
    const [rawBody, setRawBody] = useState('');
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
            const jobData = { ...data } as JobData;

            if (type === JobType.API_CALL) {
                const apiData = jobData as ApiCallJobData;
                if (apiData.method === 'POST' && rawBody) {
                    try {
                        apiData.body = JSON.parse(rawBody);
                    } catch {
                        throw new Error('Invalid JSON body');
                    }
                }
            }

            await createJob({
                name: name.trim(),
                type,
                data: jobData,
                priority,
                autoRetry,
                maxRetries: autoRetry ? maxRetries : undefined,
                scheduledAt: scheduledAt || undefined,
            });
            setName('');
            setData({});
            setRawBody('');
            setType(JobType.MOCK);
            setPriority(JobPriority.NORMAL);
            setAutoRetry(false);
            setMaxRetries(3);
            setScheduledAt(null);
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
                            {apiData.method === 'POST' && (
                                <TextField
                                    label="Body (JSON)"
                                    value={rawBody}
                                    onChange={(e) => setRawBody(e.target.value)}
                                    multiline
                                    rows={4}
                                    fullWidth
                                    size="small"
                                    placeholder='{"key": "value"}'
                                    helperText="Enter valid JSON"
                                />
                            )}
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
                        <>
                            <TextField
                                label="Duration (ms)"
                                type="number"
                                value={mockData.duration || 5000}
                                onChange={(e) => setData({ ...data, duration: Number(e.target.value) })}
                                fullWidth
                                size="small"
                                helperText="Simulated processing time"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={mockData.shouldFail || false}
                                        onChange={(e) => setData({ ...data, shouldFail: e.target.checked })}
                                    />
                                }
                                label="Simulate Failure (for testing)"
                            />
                        </>
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
                                    setRawBody('');
                                }}
                            >
                                <MenuItem value={JobType.MOCK}>Mock Processing</MenuItem>
                                <MenuItem value={JobType.API_CALL}>API Call</MenuItem>
                                <MenuItem value={JobType.MATH}>Math Calculation</MenuItem>
                            </Select>
                        </FormControl>

                        {renderDataInputs()}

                        <FormControl fullWidth size="small">
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={priority}
                                label="Priority"
                                onChange={(e) => setPriority(e.target.value as JobPriority)}
                            >
                                <MenuItem value={JobPriority.LOW}>Low</MenuItem>
                                <MenuItem value={JobPriority.NORMAL}>Normal</MenuItem>
                                <MenuItem value={JobPriority.HIGH}>High</MenuItem>
                                <MenuItem value={JobPriority.CRITICAL}>Critical</MenuItem>
                            </Select>
                        </FormControl>

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                label="Schedule for Later (Optional)"
                                value={scheduledAt}
                                onChange={(newValue) => setScheduledAt(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        helperText: 'Leave empty to run immediately'
                                    }
                                }}
                                minDateTime={new Date()}
                            />
                        </LocalizationProvider>

                        <Box>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={autoRetry}
                                        onChange={(e) => setAutoRetry(e.target.checked)}
                                    />
                                }
                                label="Enable Auto-Retry on Failure"
                            />
                            {autoRetry && (
                                <TextField
                                    label="Max Retries"
                                    type="number"
                                    value={maxRetries}
                                    onChange={(e) => setMaxRetries(Math.min(10, Math.max(1, Number(e.target.value))))}
                                    fullWidth
                                    size="small"
                                    inputProps={{ min: 1, max: 10 }}
                                    helperText="Maximum number of retry attempts (1-10)"
                                />
                            )}
                        </Box>

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
