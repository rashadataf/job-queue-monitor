import { Box, Typography, CircularProgress, Grid } from "@mui/material";
import {
    TrendingUp,
    CheckCircle,
    AccessTime,
    Speed,
    Queue as QueueIcon,
    HourglassEmpty,
} from "@mui/icons-material";
import { Card, CardContent } from "@/components/ui/Card";
import useSWR from "swr";
import { ApiRoutes, type JobMetrics } from "@shared";
import { jobsApi } from "@/services/api";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
    subtitle?: string;
}

const MetricCard = ({ title, value, icon, color, subtitle }: MetricCardProps) => {
    return (
        <Card>
            <CardContent>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            color: color || "primary.main",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export const Metrics = () => {
    const { data: metrics, error, isLoading } = useSWR<JobMetrics>(
        ApiRoutes.JOBS_METRICS,
        () => jobsApi.fetchMetrics(),
        {
            refreshInterval: 5000,
            revalidateOnFocus: true,
        }
    );

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "400px",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error || !metrics) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Failed to load metrics</Typography>
            </Box>
        );
    }

    const formatTime = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Box>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    📊 Queue Metrics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Real-time statistics and performance metrics for your job queue
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Total Jobs */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                        title="Total Jobs"
                        value={metrics.total}
                        icon={<TrendingUp fontSize="large" />}
                        color="#2196f3"
                    />
                </Grid>

                {/* Success Rate */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                        title="Success Rate"
                        value={`${metrics.successRate}%`}
                        icon={<CheckCircle fontSize="large" />}
                        color="#4caf50"
                    />
                </Grid>

                {/* Average Processing Time */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                        title="Avg Processing Time"
                        value={formatTime(metrics.averageProcessingTime)}
                        icon={<AccessTime fontSize="large" />}
                        color="#ff9800"
                    />
                </Grid>

                {/* Jobs Per Hour */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                        title="Jobs Per Hour"
                        value={metrics.jobsPerHour}
                        icon={<Speed fontSize="large" />}
                        color="#9c27b0"
                    />
                </Grid>

                {/* Queue Health Section */}
                <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                        🔄 Queue Health (BullMQ Real-time)
                    </Typography>
                </Grid>

                {/* Waiting Jobs */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MetricCard
                        title="Waiting"
                        value={metrics.queueMetrics.waiting}
                        icon={<HourglassEmpty fontSize="large" />}
                        color="#ff9800"
                        subtitle="In queue"
                    />
                </Grid>

                {/* Active Jobs */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MetricCard
                        title="Active"
                        value={metrics.queueMetrics.active}
                        icon={<Speed fontSize="large" />}
                        color="#2196f3"
                        subtitle="Processing"
                    />
                </Grid>

                {/* Delayed Jobs */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MetricCard
                        title="Delayed"
                        value={metrics.queueMetrics.delayed}
                        icon={<AccessTime fontSize="large" />}
                        color="#9c27b0"
                        subtitle="Scheduled"
                    />
                </Grid>

                {/* Jobs by Status */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Jobs by Status
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                {[
                                    { label: "Pending", value: metrics.byStatus.pending, color: "#ff9800" },
                                    { label: "Running", value: metrics.byStatus.running, color: "#2196f3" },
                                    { label: "Completed", value: metrics.byStatus.completed, color: "#4caf50" },
                                    { label: "Failed", value: metrics.byStatus.failed, color: "#f44336" },
                                    { label: "Paused", value: metrics.byStatus.paused, color: "#9e9e9e" },
                                ].map((item) => (
                                    <Box
                                        key={item.label}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 1.5,
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: "50%",
                                                    bgcolor: item.color,
                                                }}
                                            />
                                            <Typography variant="body2">{item.label}</Typography>
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Jobs by Priority */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Jobs by Priority
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                {[
                                    { label: "Critical", value: metrics.byPriority.critical, color: "#f44336" },
                                    { label: "High", value: metrics.byPriority.high, color: "#ff9800" },
                                    { label: "Normal", value: metrics.byPriority.normal, color: "#2196f3" },
                                    { label: "Low", value: metrics.byPriority.low, color: "#9e9e9e" },
                                ].map((item) => (
                                    <Box
                                        key={item.label}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 1.5,
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: "50%",
                                                    bgcolor: item.color,
                                                }}
                                            />
                                            <Typography variant="body2">{item.label}</Typography>
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Activity */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Recent Activity
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mb: 2,
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Last Hour
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {metrics.recentTrend.lastHour} jobs
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Last 24 Hours
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {metrics.recentTrend.last24Hours} jobs
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Jobs by Type */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Jobs by Type
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                {Object.entries(metrics.byType).map(([type, count]) => (
                                    <Box
                                        key={type}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 1.5,
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                                            {type}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {count}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};
