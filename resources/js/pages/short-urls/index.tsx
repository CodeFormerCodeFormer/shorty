import React, { useState } from 'react';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Button, TextField, MenuItem, Pagination, Stack, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Alert, TableSortLabel, Tabs, Tab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AppLayout from '@/layouts/app-layout';
import CircularProgress from '@mui/material/CircularProgress';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

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
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<any>(null);
  const [tab, setTab] = useState(0);
  const [visits, setVisits] = useState<any[] | null>(null);
  const [chart, setChart] = useState<any[] | null>(null);
  const [countryClicks, setCountryClicks] = useState<Record<string, number> | null>(null);
  const [loadingVisits, setLoadingVisits] = useState(false);
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

  const handleView = async (url: any) => {
    setSelectedUrl(url);
    setViewOpen(true);
    setVisits(null);
    setChart(null);
    setCountryClicks(null);
    setLoadingVisits(true);
    try {
      const res = await fetch(`/short-urls/${url.id}`);
      const data = await res.json();
      setVisits(data.visits);
      setChart(data.chart);
      // Busca cliques por país
      const countryRes = await fetch(`/short-urls/${url.id}/country-clicks`);
      if (countryRes.ok) {
        setCountryClicks(await countryRes.json());
      } else {
        setCountryClicks(null);
      }
    } catch (e) {
      setVisits([]);
      setChart([]);
      setCountryClicks(null);
    }
    setLoadingVisits(false);
  };
  const handleViewClose = () => setViewOpen(false);

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
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
                  <TableCell>
                    <Link href="#" onClick={e => { e.preventDefault(); handleView(url); }} underline="hover">
                      {url.title}
                    </Link>
                  </TableCell>
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
        <Dialog open={viewOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
          <DialogTitle>
            Short URL Details
            <IconButton
              aria-label="close"
              onClick={handleViewClose}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedUrl && (
              <Box>
                <Typography variant="subtitle1" gutterBottom><b>Title:</b> {selectedUrl.title}</Typography>
                <Typography variant="subtitle1" gutterBottom><b>Short URL:</b> <Link href={`/j/${selectedUrl.short_code}`} target="_blank" rel="noopener noreferrer">{window.location.origin}/j/{selectedUrl.short_code}</Link></Typography>
                <Typography variant="subtitle1" gutterBottom><b>Original URL:</b> <Link href={selectedUrl.original_url} target="_blank" rel="noopener noreferrer">{selectedUrl.original_url}</Link></Typography>
                <Typography variant="subtitle1" gutterBottom><b>Visits:</b> {selectedUrl.visit_count}</Typography>
                <Typography variant="subtitle1" gutterBottom><b>Max Visits:</b> {selectedUrl.max_visits ?? '-'}</Typography>
                <Typography variant="subtitle1" gutterBottom><b>Expires at:</b> {selectedUrl.expires_at ? new Date(selectedUrl.expires_at).toLocaleString() : '-'}</Typography>
                <Typography variant="subtitle1" gutterBottom><b>Created at:</b> {selectedUrl.created_at ? new Date(selectedUrl.created_at).toLocaleString() : '-'}</Typography>
                <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 2, mb: 2 }}>
                  <Tab label="Clicks" />
                  <Tab label="Chart" />
                  <Tab label="Map" />
                </Tabs>
                {tab === 0 && (
                  <Box>
                    {loadingVisits ? (
                      <Stack alignItems="center" py={4}><CircularProgress /></Stack>
                    ) : visits && visits.length > 0 ? (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>IP</TableCell>
                            <TableCell>Country</TableCell>
                            <TableCell>User Agent</TableCell>
                            <TableCell>Referer</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {visits.map((v) => (
                            <TableRow key={v.id}>
                              <TableCell>{v.visited_at ? new Date(v.visited_at).toLocaleString() : '-'}</TableCell>
                              <TableCell>{v.ip_address}</TableCell>
                              <TableCell>{v.country ?? '-'}</TableCell>
                              <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.user_agent}</TableCell>
                              <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.referer ?? '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No clicks found.</Typography>
                    )}
                  </Box>
                )}
                {tab === 1 && (
                  <Box minHeight={300} display="flex" alignItems="center" justifyContent="center">
                    {chart && chart.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chart} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="count" stroke="#1976d2" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No data for the last 7 days.</Typography>
                    )}
                  </Box>
                )}
                {tab === 2 && (
                  <Box minHeight={350}>
                    <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={350} style={{ width: '100%', height: 'auto' }}>
                      <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                        {({ geographies }) => {
                          const dataByCountryName = countryClicks ?? {};
                          const max = Math.max(1, ...Object.values(dataByCountryName));
                          const colorScale = scaleLinear()
                            .domain([0, max])
                            .range(["#e0f2fe", "#0284c7"]);
                          return geographies.map(geo => {
                            const name = geo.properties.name;
                            const count = dataByCountryName[name] ?? 0;
                            return (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill={count ? colorScale(count) : "#F5F4F6"}
                                stroke="#DDD"
                                style={{ outline: 'none' }}
                              />
                            );
                          });
                        }}
                      </Geographies>
                    </ComposableMap>
                    <Typography variant="caption" color="text.secondary" mt={1}>
                      {countryClicks ? 'Mapa de calor por país (dados reais)' : 'Mapa de calor por país (mock)'}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleViewClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  );
}
