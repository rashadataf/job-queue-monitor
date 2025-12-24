import { Typography, Grid, Box } from '@mui/material';
import { CreateJobForm } from '@/components/CreateJobForm';
import { JobsList } from '@/components/JobsList';

export const Dashboard = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Monitor and manage your job queue in real-time
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }} order={{ xs: 2, md: 2 }}>
                    <CreateJobForm />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }} order={{ xs: 1, md: 1 }}>
                    <JobsList />
                </Grid>
            </Grid>
        </Box>
    );
}
