import { Link } from 'react-router-dom';
import { useState } from 'react';
import { AccessTime, PlayArrow, CheckCircle, Error as ErrorIcon, ChevronRight, Refresh, PriorityHigh, Autorenew, Pause, Delete, PlayCircle, RestartAlt, Download } from '@mui/icons-material';
import { CircularProgress, List, ListItem, ListItemText, ListItemIcon, ListItemButton, Box, Typography, IconButton, Chip, Checkbox, Toolbar, Alert, Menu, MenuItem } from '@mui/material';
import { useJobs } from '@/hooks/useJobs';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { JobFilters } from '@/components/JobFilters';
import { JobStatus, JobPriority, BulkAction, ExportFormat } from '@shared';
import { ButtonVariant } from '@/types/button';
import { jobsApi } from '@/services/api';

const statusConfig = {
    [JobStatus.PENDING]: { icon: <AccessTime fontSize="small" />, label: 'Pending' },
    [JobStatus.RUNNING]: { icon: <PlayArrow fontSize="small" />, label: 'Running' },
    [JobStatus.COMPLETED]: { icon: <CheckCircle fontSize="small" />, label: 'Completed' },
    [JobStatus.FAILED]: { icon: <ErrorIcon fontSize="small" />, label: 'Failed' },
    [JobStatus.PAUSED]: { icon: <Pause fontSize="small" />, label: 'Paused' },
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

    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const [bulkActionResult, setBulkActionResult] = useState<{ success: number; failed: number } | null>(null);
    const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
    const [exportLoading, setExportLoading] = useState(false);

    const handleSelectAll = () => {
        if (selectedJobs.length === jobs.length) {
            setSelectedJobs([]);
        } else {
            setSelectedJobs(jobs.map(job => job.nanoId));
        }
    };

    const handleSelectJob = (nanoId: string) => {
        setSelectedJobs(prev =>
            prev.includes(nanoId)
                ? prev.filter(id => id !== nanoId)
                : [...prev, nanoId]
        );
    };

    const handleBulkAction = async (action: BulkAction) => {
        if (selectedJobs.length === 0) return;

        setBulkActionLoading(true);
        setBulkActionResult(null);

        try {
            const result = await jobsApi.bulkAction({
                nanoIds: selectedJobs,
                action,
            });

            setBulkActionResult({
                success: result.success.length,
                failed: result.failed.length,
            });

            setSelectedJobs([]);
            refresh();

            // Clear result after 5 seconds
            setTimeout(() => setBulkActionResult(null), 5000);
        } catch (error) {
            console.error('Bulk action failed:', error);
            alert(error instanceof Error ? error.message : 'Bulk action failed');
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
        setExportMenuAnchor(event.currentTarget);
    };

    const handleExportClose = () => {
        setExportMenuAnchor(null);
    };

    const handleExport = async (format: ExportFormat) => {
        setExportLoading(true);
        handleExportClose();

        try {
            await jobsApi.exportJobs(format, {
                status,
                sortBy,
                sortOrder,
                search,
            });
        } catch (error) {
            console.error('Export failed:', error);
            alert(error instanceof Error ? error.message : 'Export failed');
        } finally {
            setExportLoading(false);
        }
    };

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
                        const isSelected = selectedJobs.includes(job.nanoId);
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
                                <Checkbox
                                    checked={isSelected}
                                    onChange={() => handleSelectJob(job.nanoId)}
                                    onClick={(e) => e.stopPropagation()}
                                />
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
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'flex-start' },
                gap: 2,
                mb: 2
            }}>
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
                <Button
                    variant={ButtonVariant.OUTLINE}
                    onClick={handleExportClick}
                    disabled={exportLoading}
                    startIcon={<Download />}
                    sx={{ minWidth: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}
                >
                    Export
                </Button>
                <Menu
                    anchorEl={exportMenuAnchor}
                    open={Boolean(exportMenuAnchor)}
                    onClose={handleExportClose}
                >
                    <MenuItem onClick={() => handleExport(ExportFormat.JSON)}>
                        Export as JSON
                    </MenuItem>
                    <MenuItem onClick={() => handleExport(ExportFormat.CSV)}>
                        Export as CSV
                    </MenuItem>
                </Menu>
            </Box>

            {selectedJobs.length > 0 && (
                <Card sx={{ mb: 2 }}>
                    <Toolbar sx={{ bgcolor: 'action.hover' }}>
                        <Checkbox
                            checked={selectedJobs.length === jobs.length && jobs.length > 0}
                            indeterminate={selectedJobs.length > 0 && selectedJobs.length < jobs.length}
                            onChange={handleSelectAll}
                        />
                        <Typography variant="subtitle1" sx={{ flex: 1 }}>
                            {selectedJobs.length} selected
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant={ButtonVariant.OUTLINE}
                                size="small"
                                onClick={() => handleBulkAction(BulkAction.RETRY)}
                                disabled={bulkActionLoading}
                                startIcon={<RestartAlt />}
                            >
                                Retry
                            </Button>
                            <Button
                                variant={ButtonVariant.OUTLINE}
                                size="small"
                                onClick={() => handleBulkAction(BulkAction.PAUSE)}
                                disabled={bulkActionLoading}
                                startIcon={<Pause />}
                            >
                                Pause
                            </Button>
                            <Button
                                variant={ButtonVariant.OUTLINE}
                                size="small"
                                onClick={() => handleBulkAction(BulkAction.RESUME)}
                                disabled={bulkActionLoading}
                                startIcon={<PlayCircle />}
                            >
                                Resume
                            </Button>
                            <Button
                                variant={ButtonVariant.DESTRUCTIVE}
                                size="small"
                                onClick={() => handleBulkAction(BulkAction.DELETE)}
                                disabled={bulkActionLoading}
                                startIcon={<Delete />}
                            >
                                Delete
                            </Button>
                        </Box>
                    </Toolbar>
                </Card>
            )}

            {bulkActionResult && (
                <Alert severity={bulkActionResult.failed > 0 ? "warning" : "success"} sx={{ mb: 2 }}>
                    Bulk action completed: {bulkActionResult.success} succeeded
                    {bulkActionResult.failed > 0 && `, ${bulkActionResult.failed} failed`}
                </Alert>
            )}

            {renderContent()}
        </>
    );
}

