import { Link } from 'react-router-dom';
import { AccessTime, PlayArrow, CheckCircle, Error as ErrorIcon, ChevronRight, Refresh, PriorityHigh, Autorenew } from '@mui/icons-material';
import { CircularProgress, List, ListItem, ListItemText, ListItemIcon, ListItemButton, Box, Typography, IconButton, Chip } from '@mui/material';
import { useJobs } from '@/hooks/useJobs';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { JobFilters } from '@/components/JobFilters';
import { JobStatus, JobPriority } from '@job-queue-monitor/shared';
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

export const JobsList = () => {
    const {
        jobs,
        meta,
        isLoading,
        isError,
        refresh,
        page,
        setPage,
        status,
        setStatus,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        search,
        setSearch,
    } = useJobs();

    const renderContent = () => {
        if (isLoading) {
            return (
                <Card>
                    <CardContent style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                        <CircularProgress size={24} />
                        <span style={{ marginLeft: '8px', color: 'gray' }}>Loading jobs...</span>
                    </CardContent>
                </Card>
            );
        }

        if (isError) {
            return (
                <Card>
                    <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px' }}>
                        <ErrorIcon color="error" style={{ fontSize: 48, marginBottom: 16 }} />
                        <Typography color="error" variant="h6">Error loading jobs</Typography>
                        <Button variant={ButtonVariant.OUTLINE} style={{ marginTop: 16 }} onClick={refresh}>
                            <Refresh style={{ marginRight: 8 }} />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        if (!jobs || jobs.length === 0) {
            return (
                <Card>
                    <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px' }}>
                        <Box sx={{ bgcolor: 'action.hover', borderRadius: '50%', p: 2, mb: 2 }}>
                            <AccessTime style={{ fontSize: 32, color: 'gray' }} />
                        </Box>
                        <Typography variant="h6">No jobs found</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {status ? 'No jobs match the selected filters' : 'Create a new job to get started'}
                        </Typography>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <List disablePadding>
                    {jobs.map((job, index) => {
                        const config = statusConfig[job.status];
                        return (
                            <ListItem
                                key={job.nanoId}
                                disablePadding
                                divider={index !== jobs.length - 1}
                                secondaryAction={
                                    <IconButton edge="end" component={Link} to={`/jobs/${job.nanoId}`}>
                                        <ChevronRight />
                                    </IconButton>
                                }
                            >
                                <ListItemButton component={Link} to={`/jobs/${job.nanoId}`}>
                                    <ListItemIcon>
                                        {config.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <span>{job.name}</span>
                                                {job.priority !== JobPriority.NORMAL && (
                                                    <Chip
                                                        icon={<PriorityHigh sx={{ fontSize: '14px !important' }} />}
                                                        label={priorityConfig[job.priority].label}
                                                        color={priorityConfig[job.priority].color}
                                                        size="small"
                                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                                    />
                                                )}
                                                {job.autoRetry && job.retryCount > 0 && (
                                                    <Chip
                                                        icon={<Autorenew sx={{ fontSize: '14px !important' }} />}
                                                        label={`${job.retryCount}/${job.maxRetries}`}
                                                        color="info"
                                                        size="small"
                                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={`ID: ${job.nanoId}`}
                                    />
                                    <Badge variant={job.status} label={config.label} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
                {meta && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                        <Button
                            variant={ButtonVariant.OUTLINE}
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        <Typography variant="body2" color="text.secondary">
                            Page {meta.page} of {meta.totalPages}
                        </Typography>
                        <Button
                            variant={ButtonVariant.OUTLINE}
                            disabled={page >= meta.totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next
                        </Button>
                    </Box>
                )}
            </Card>
        );
    };

    return (
        <>
            <JobFilters
                status={status}
                sortBy={sortBy}
                sortOrder={sortOrder}
                search={search}
                onStatusChange={setStatus}
                onSortByChange={setSortBy}
                onSortOrderChange={setSortOrder}
                onSearchChange={setSearch}
            />
            {renderContent()}
        </>
    );
}

