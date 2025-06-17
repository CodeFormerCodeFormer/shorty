import React, { useState } from 'react';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Button, TextField, MenuItem, Pagination, Stack, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Alert, TableSortLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AppLayout from '@/layouts/app-layout';

const sortableColumns = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'original_url', label: 'Original URL' },
  { key: 'short_code', label: 'Short URL' },
  { key: 'expires_at', label: 'Expires at' },
  { key: 'visit_count', label: 'Visits' },
  { key: 'max_visits', label: 'Max Visits' },
];

export default function ShortUrlsIndex() {
  const { shortUrls, filters, sort, direction } = usePage().props as any;
  const [search, setSearch] = useState(filters?.search || '');
  const [perPage, setPerPage] = useState(filters?.per_page || 10);
  const [open, setOpen] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    original_url: '',
    short_code: '',
    expires_at: '',
    max_visits: '',
  });
  const [success, setSuccess] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/short-urls', { search, per_page: perPage });
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(Number(e.target.value));
    router.get('/short-urls', { search, per_page: e.target.value });
  };

  const handlePageChange = (_: any, value: number) => {
    router.get('/short-urls', { search, per_page: perPage, page: value });
  };

  const handleOpen = () => {
    setOpen(true);
    setSuccess('');
    reset();
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(e.target.name as keyof typeof data, e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    post('/short-urls', {
      onSuccess: () => {
        setSuccess('Short URL created successfully!');
        reset();
        setOpen(false);
        router.reload();
      },
    });
  };

  const handleSort = (column: string) => {
    let newDirection = 'asc';
    if (sort === column) {
      newDirection = direction === 'asc' ? 'desc' : 'asc';
    }
    router.get('/short-urls', {
      ...filters,
      sort: column,
      direction: newDirection,
      page: 1,
    });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'My Short URLs', href: '/short-urls' }]}> 
      <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
        <Head title="My URLs" />
        <Typography variant="h4" mb={2}>My Short URLs</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems="center">
          <form onSubmit={handleSearch} style={{ flex: 1 }}>
            <TextField
              label="Search URL"
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              fullWidth
            />
          </form>
          <TextField
            select
            label="Records per page"
            value={perPage}
            onChange={handlePerPageChange}
            size="small"
            sx={{ minWidth: 120 }}
          >
            {[10, 25, 50, 100].map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
        </Stack>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {sortableColumns.map(col => (
                  <TableCell key={col.key}>
                    <TableSortLabel
                      active={sort === col.key}
                      direction={sort === col.key ? direction : 'asc'}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {shortUrls.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">No URLs found.</TableCell>
                </TableRow>
              )}
              {shortUrls.data.map((url: any) => (
                <TableRow key={url.id}>
                  <TableCell>{url.id}</TableCell>
                  <TableCell>{url.title}</TableCell>
                  <TableCell>
                    <Link href={url.original_url} target="_blank" rel="noopener noreferrer">
                      {url.original_url}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/j/${url.short_code}`} target="_blank" rel="noopener noreferrer">
                      {window.location.origin}/j/{url.short_code}
                    </Link>
                  </TableCell>
                  <TableCell>{url.expires_at ? new Date(url.expires_at).toLocaleString() : '-'}</TableCell>
                  <TableCell>{url.visit_count}</TableCell>
                  <TableCell>{url.max_visits ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" justifyContent="center" alignItems="center" mt={2}>
          <Pagination
            count={shortUrls.last_page}
            page={shortUrls.current_page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Stack>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 32 },
            right: { xs: 16, sm: 32 },
            borderRadius: '50%',
            minWidth: 0,
            width: 56,
            height: 56,
            boxShadow: 6,
            zIndex: 1201,
          }}
        >
          <AddIcon />
        </Button>
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
          <DialogTitle>
            New Short URL
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <form id="short-url-form" onSubmit={handleSubmit}>
              <Stack spacing={2} mt={1}>
                <TextField
                  label="Title"
                  name="title"
                  value={data.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  fullWidth
                  required
                />
                <TextField
                  label="Original URL"
                  name="original_url"
                  value={data.original_url}
                  onChange={handleChange}
                  error={!!errors.original_url}
                  helperText={errors.original_url}
                  fullWidth
                  required
                />
                <TextField
                  label="Custom path (optional)"
                  name="short_code"
                  value={data.short_code}
                  onChange={handleChange}
                  error={!!errors.short_code}
                  helperText={errors.short_code}
                  fullWidth
                />
                <TextField
                  label="Expiration date"
                  name="expires_at"
                  type="datetime-local"
                  value={data.expires_at}
                  onChange={handleChange}
                  error={!!errors.expires_at}
                  helperText={errors.expires_at}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Max visits"
                  name="max_visits"
                  type="number"
                  value={data.max_visits}
                  onChange={handleChange}
                  error={!!errors.max_visits}
                  helperText={errors.max_visits}
                  fullWidth
                />
              </Stack>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" form="short-url-form" variant="contained" color="primary" disabled={processing}>
              Create URL
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  );
}
