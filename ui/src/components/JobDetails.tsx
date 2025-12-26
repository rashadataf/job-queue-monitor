import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowBack, AccessTime, PlayArrow, CheckCircle, Error as ErrorIcon, Refresh, CalendarToday, Timer, PriorityHigh, Autorenew, Delete } from '@mui/icons-material';
import { CircularProgress, Box, Typography, Stack, Divider, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useJob } from '@/hooks/useJobs';
import { JobStatus, JobPriority } from '@shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ButtonVariant } from '@/types/button';

const statusConfig = {
    [JobStatus.PENDING]: { icon: <AccessTime fontSize="small" />, label: 'Pending' },
    [JobStatus.RUNNING]: { icon: <PlayArrow fontSize="small" />, label: 'Running' },
    [JobStatus.COMPLETED]: { icon: <CheckCircle fontSize="small" />, label: 'Completed' },
    [JobStatus.FAILED]: { icon: <ErrorIcon fontSize="small" />, label: 'Failed' },
};

const priorityConfig = {
    [JobPriority.LOW]: { label: 'Low', color: 'default' as const },
    [JobPriority.NORMAL]: { label: 'Normal', color: 'primary' as const },
    [JobPriority.HIGH]: { label: 'High', color: 'warning' as const },
    [JobPriority.CRITICAL]: { label: 'Critical', color: 'error' as const },
};

export const JobDetails = () => {
    const { nanoId } = useParams();
    const navigate = useNavigate();
    const { job, isLoading, isError, refresh, updateStatus, retryJob, deleteJob } = useJob(nanoId ?? null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleStatusChange = async (status: JobStatus) => {
        setIsUpdating(true);
        try {
            await updateStatus(status);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRetry = async () => {
        setIsUpdating(true);
        try {
            await retryJob();
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        setIsUpdating(true);
        try {
            await deleteJob();
            navigate('/');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to delete job');
        } finally {
            setIsUpdating(false);
            setDeleteDialogOpen(false);
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
                <Box ml={2} color="text.secondary">Loading job details...</Box>
            </Box>
        );
    }

    if (isError || !job) {
        return (
            <Card>
                <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px' }}>
                    <ErrorIcon color="error" style={{ fontSize: 48, marginBottom: 16 }} />
                    <Typography color="error" variant="h6">Job not found</Typography>
                    <Typography variant="body2" color="text.secondary">The job you're looking for doesn't exist</Typography>
                    <Button variant={ButtonVariant.OUTLINE} style={{ marginTop: 16 }} component={Link} to="/">
                        <ArrowBack style={{ marginRight: 8 }} />
                        Back to Jobs
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const config = statusConfig[job.status];

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Button variant={ButtonVariant.GHOST} component={Link} to="/" startIcon={<ArrowBack />} sx={{ alignSelf: 'flex-start' }}>
                Back to Jobs
            </Button>

            <Card>
                <CardHeader>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <CardTitle>{job.name}</CardTitle>
                            <CardDescription>ID: {job.nanoId}</CardDescription>
                        </Box>
                        <Box display="flex" gap={1} flexWrap="wrap">
                            <Badge variant={job.status} label={config.label} icon={config.icon} />
                            <Chip
                                icon={<PriorityHigh fontSize="small" />}
                                label={priorityConfig[job.priority].label}
                                color={priorityConfig[job.priority].color}
                                size="small"
                            />
                            {job.autoRetry && (
                                <Chip
                                    icon={<Autorenew fontSize="small" />}
                                    label={`Retry ${job.retryCount}/${job.maxRetries}`}
                                    color="info"
                                    size="small"
                                />
                            )}
                        </Box>
                    </Box>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                    <CardDescription>Manage this job</CardDescription>
                </CardHeader>
                <CardContent>
                    <Stack direction="row" spacing={2}>
                        <Button variant={ButtonVariant.OUTLINE} onClick={refresh} disabled={isUpdating} startIcon={isUpdating ? <CircularProgress size={16} /> : <Refresh />}>
                            Refresh Status
                        </Button>
                        {job.status === JobStatus.PENDING && (
                            <Button onClick={() => handleStatusChange(JobStatus.RUNNING)} disabled={isUpdating} startIcon={<PlayArrow />}>
                                Start Job
                            </Button>
                        )}
                        {job.status === JobStatus.RUNNING && (
                            <>
                                <Button variant={ButtonVariant.DEFAULT} color="success" onClick={() => handleStatusChange(JobStatus.COMPLETED)} disabled={isUpdating} startIcon={<CheckCircle />}>
                                    Complete
                                </Button>
                                <Button variant={ButtonVariant.DESTRUCTIVE} onClick={() => handleStatusChange(JobStatus.FAILED)} disabled={isUpdating} startIcon={<ErrorIcon />}>
                                    Fail
                                </Button>
                            </>
                        )}
                        {(job.status === JobStatus.FAILED || job.status === JobStatus.COMPLETED) && (
                            <>
                                <Button variant={ButtonVariant.SECONDARY} onClick={handleRetry} disabled={isUpdating} startIcon={<Refresh />}>
                                    Retry Job
                                </Button>
                                <Button
                                    variant={ButtonVariant.DESTRUCTIVE}
                                    onClick={() => setDeleteDialogOpen(true)}
                                    disabled={isUpdating}
                                    startIcon={<Delete />}
                                >
                                    Delete Job
                                </Button>
                            </>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                    <CardDescription>Type and payload information</CardDescription>
                </CardHeader>
                <CardContent>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Type</Typography>
                            <Typography variant="body1" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                                {job.type}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Priority</Typography>
                            <Typography variant="body1">
                                {priorityConfig[job.priority].label}
                            </Typography>
                        </Box>

                        {job.autoRetry && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>Auto-Retry</Typography>
                                <Typography variant="body1">
                                    Enabled ({job.retryCount} of {job.maxRetries} attempts used)
                                </Typography>
                            </Box>
                        )}

                        {job.data && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>Input Payload</Typography>
                                <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, overflow: 'auto' }}>
                                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                                        {JSON.stringify(job.data, null, 2)}
                                    </pre>
                                </Box>
                            </Box>
                        )}

                        {job.result && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>Result</Typography>
                                <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, overflow: 'auto' }}>
                                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                                        {JSON.stringify(job.result, null, 2)}
                                    </pre>
                                </Box>
                            </Box>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                    <CardDescription>Job execution history</CardDescription>
                </CardHeader>
                <CardContent>
                    <Stack spacing={2}>
                        <Box display="flex" gap={2}>
                            <Box sx={{ bgcolor: 'success.light', borderRadius: '50%', p: 1, display: 'flex' }}>
                                <CalendarToday fontSize="small" sx={{ color: 'success.main' }} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle2">Created</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {new Date(job.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>

                        {job.startedAt && (
                            <Box display="flex" gap={2}>
                                <Box sx={{ bgcolor: 'info.light', borderRadius: '50%', p: 1, display: 'flex' }}>
                                    <PlayArrow fontSize="small" sx={{ color: 'info.main' }} />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2">Started</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(job.startedAt).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {job.completedAt && (
                            <Box display="flex" gap={2}>
                                <Box sx={{ bgcolor: job.status === JobStatus.COMPLETED ? 'success.light' : 'error.light', borderRadius: '50%', p: 1, display: 'flex' }}>
                                    {job.status === JobStatus.COMPLETED ? (
                                        <CheckCircle fontSize="small" sx={{ color: 'success.main' }} />
                                    ) : (
                                        <ErrorIcon fontSize="small" sx={{ color: 'error.main' }} />
                                    )}
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2">{job.status === JobStatus.COMPLETED ? 'Completed' : 'Failed'}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(job.completedAt).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {job.startedAt && job.completedAt && (
                            <>
                                <Divider />
                                <Box display="flex" gap={2} pt={1}>
                                    <Box sx={{ bgcolor: 'action.hover', borderRadius: '50%', p: 1, display: 'flex' }}>
                                        <Timer fontSize="small" color="action" />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2">Duration</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 1000)}s
                                        </Typography>
                                    </Box>
                                </Box>
                            </>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Job?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this job? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant={ButtonVariant.DESTRUCTIVE}
                        disabled={isUpdating}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
