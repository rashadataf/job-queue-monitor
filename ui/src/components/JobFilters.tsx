import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  type SelectChangeEvent,
} from "@mui/material";
import { Clear as ClearIcon, Search as SearchIcon } from "@mui/icons-material";
import {
  JobStatus,
  SortField,
  SortOrder,
} from "@shared";

interface JobFiltersProps {
  status: JobStatus | undefined;
  sortBy: SortField;
  sortOrder: SortOrder;
  search: string;
  onStatusChange: (status: JobStatus | undefined) => void;
  onSortByChange: (sortBy: SortField) => void;
  onSortOrderChange: (sortOrder: SortOrder) => void;
  onSearchChange: (search: string) => void;
}

export const JobFilters = ({
  status,
  sortBy,
  sortOrder,
  search,
  onStatusChange,
  onSortByChange,
  onSortOrderChange,
  onSearchChange,
}: JobFiltersProps) => {
  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onStatusChange(value === "" ? undefined : (value as JobStatus));
  };

  const handleSortByChange = (event: SelectChangeEvent<string>) => {
    onSortByChange(event.target.value as SortField);
  };

  const handleSortOrderChange = (event: SelectChangeEvent<string>) => {
    onSortOrderChange(event.target.value as SortOrder);
  };

  const handleClearStatus = () => {
    onStatusChange(undefined);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleClearSearch = () => {
    onSearchChange("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 3,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <TextField
        size="small"
        placeholder="Search by name or ID..."
        value={search}
        onChange={handleSearchChange}
        sx={{ minWidth: 250 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="status-filter-label">Status</InputLabel>
        <Select
          labelId="status-filter-label"
          id="status-filter"
          value={status || ""}
          label="Status"
          onChange={handleStatusChange}
          endAdornment={
            status ? (
              <IconButton
                size="small"
                onClick={handleClearStatus}
                sx={{ mr: 1 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : null
          }
        >
          <MenuItem value="">
            <em>All</em>
          </MenuItem>
          <MenuItem value={JobStatus.PENDING}>Pending</MenuItem>
          <MenuItem value={JobStatus.RUNNING}>Running</MenuItem>
          <MenuItem value={JobStatus.COMPLETED}>Completed</MenuItem>
          <MenuItem value={JobStatus.FAILED}>Failed</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="sort-by-label">Sort By</InputLabel>
        <Select
          labelId="sort-by-label"
          id="sort-by"
          value={sortBy}
          label="Sort By"
          onChange={handleSortByChange}
        >
          <MenuItem value={SortField.CREATED_AT}>Created At</MenuItem>
          <MenuItem value={SortField.UPDATED_AT}>Updated At</MenuItem>
          <MenuItem value={SortField.STARTED_AT}>Started At</MenuItem>
          <MenuItem value={SortField.COMPLETED_AT}>Completed At</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="sort-order-label">Order</InputLabel>
        <Select
          labelId="sort-order-label"
          id="sort-order"
          value={sortOrder}
          label="Order"
          onChange={handleSortOrderChange}
        >
          <MenuItem value={SortOrder.DESC}>
            Newest First
          </MenuItem>
          <MenuItem value={SortOrder.ASC}>
            Oldest First
          </MenuItem>
        </Select>
      </FormControl>

      <Tooltip title="Showing filtered results">
        <Box
          sx={{
            ml: "auto",
            fontSize: "0.875rem",
            color: "text.secondary",
          }}
        >
          {status && `Filtered by: ${status}`}
        </Box>
      </Tooltip>
    </Box>
  );
};
