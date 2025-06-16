import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Button, TextField, MenuItem, Pagination, Stack } from '@mui/material';
import AppLayout from '@/layouts/app-layout';

export default function ShortUrlsIndex() {
  const { shortUrls, filters } = usePage().props as any;
  const [search, setSearch] = useState(filters?.search || '');
  const [perPage, setPerPage] = useState(filters?.per_page || 10);

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

  return (
    <AppLayout breadcrumbs={[{ title: 'My Short URLs', href: '/short-urls' }]}> 
      <Box>
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
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Original URL</TableCell>
                <TableCell>Short URL</TableCell>
                <TableCell>Expires at</TableCell>
                <TableCell>Visits</TableCell>
                <TableCell>Max Visits</TableCell>
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
        <Button variant="contained" color="primary" sx={{ mt: 2 }} href="/short-urls/create">
          New URL
        </Button>
      </Box>
    </AppLayout>
  );
}
