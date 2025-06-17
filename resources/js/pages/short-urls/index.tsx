import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    MenuItem,
    Pagination,
    Paper,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import TooltipMUI from '@mui/material/Tooltip';
import { scaleLinear } from 'd3-scale';
import { QRCodeCanvas } from 'qrcode.react';
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

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

    // Função para baixar o QR code como imagem
    const handleDownloadQr = (url: { short_code: string }) => {
        const canvas = document.querySelector('canvas[data-qrcode="' + url.short_code + '"]') as HTMLCanvasElement;
        if (canvas) {
            const link = document.createElement('a');
            link.download = `short-url-${url.short_code}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    // Função para compartilhar o QR code (usando Web Share API se disponível)
    const handleShareQr = async (url: { short_code: string }) => {
        const canvas = document.querySelector('canvas[data-qrcode="' + url.short_code + '"]') as HTMLCanvasElement;
        if (canvas) {
            canvas.toBlob(async (blob) => {
                if (navigator.share && blob) {
                    const file = new File([blob], `short-url-${url.short_code}.png`, { type: blob.type });
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Short URL QR Code',
                            text: 'Veja o QR code do link encurtado!',
                        });
                    } catch (e) {
                        // usuário cancelou ou não suportado
                    }
                } else {
                    alert('Compartilhamento não suportado neste navegador.');
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'My Short URLs', href: '/short-urls' }]}>
            <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
                <Head title="My URLs" />
                <Typography variant="h4" mb={2}>
                    My Short URLs
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems="center">
                    <form onSubmit={handleSearch} style={{ flex: 1 }}>
                        <TextField label="Search URL" value={search} onChange={(e) => setSearch(e.target.value)} size="small" fullWidth />
                    </form>
                    <TextField select label="Records per page" value={perPage} onChange={handlePerPageChange} size="small" sx={{ minWidth: 120 }}>
                        {[10, 25, 50, 100].map((opt) => (
                            <MenuItem key={opt} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {sortableColumns.map((col) => (
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
                                    <TableCell colSpan={7} align="center">
                                        No URLs found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {shortUrls.data.map((url: any) => (
                                <TableRow key={url.id}>
                                    <TableCell>{url.id}</TableCell>
                                    <TableCell>
                                        <Link
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleView(url);
                                            }}
                                            underline="hover"
                                        >
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
                        <IconButton aria-label="close" onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        {success && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                {success}
                            </Alert>
                        )}
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
                <Dialog
                    open={viewOpen}
                    onClose={handleViewClose}
                    maxWidth="md"
                    fullWidth
                    sx={{
                        '& .MuiDialog-container': {
                            alignItems: 'flex-start',
                        },
                        '& .MuiPaper-root': {
                            mt: 4, // margem superior opcional
                        },
                    }}
                >
                    <DialogTitle>
                        Short URL Details
                        <IconButton aria-label="close" onClick={handleViewClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        {selectedUrl && (
                            <Box>
                                <Box display="flex" flexDirection="row" gap={2}>
                                    <Box flex={3}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            <b>Title:</b> {selectedUrl.title}
                                        </Typography>
                                        <Typography variant="subtitle1" gutterBottom>
                                            <b>Short URL:</b>{' '}
                                            <Link href={`/j/${selectedUrl.short_code}`} target="_blank" rel="noopener noreferrer">
                                                {window.location.origin}/j/{selectedUrl.short_code}
                                            </Link>
                                        </Typography>
                                        <Typography variant="subtitle1" gutterBottom>
                                            <b>Original URL:</b>{' '}
                                            <Link href={selectedUrl.original_url} target="_blank" rel="noopener noreferrer">
                                                {selectedUrl.original_url}
                                            </Link>
                                        </Typography>
                                        <Typography variant="subtitle1" gutterBottom>
                                            <b>Visits:</b> {selectedUrl.visit_count}
                                        </Typography>
                                        <Typography variant="subtitle1" gutterBottom>
                                            <b>Max Visits:</b> {selectedUrl.max_visits ?? '-'}
                                        </Typography>
                                        <Typography variant="subtitle1" gutterBottom>
                                            <b>Expires at:</b> {selectedUrl.expires_at ? new Date(selectedUrl.expires_at).toLocaleString() : '-'}
                                        </Typography>
                                        <Typography variant="subtitle1" gutterBottom>
                                            <b>Created at:</b> {selectedUrl.created_at ? new Date(selectedUrl.created_at).toLocaleString() : '-'}
                                        </Typography>
                                    </Box>
                                    <Box flex={2} display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
                                        <QRCodeCanvas
                                            id="qr-code"
                                            value={`${window.location.origin}/j/${selectedUrl.short_code}`}
                                            size={128}
                                            includeMargin={true}
                                            data-qrcode={selectedUrl.short_code}
                                        />
                                        <Box display="flex" gap={1}>
                                            <Button variant="outlined" size="small" onClick={() => handleDownloadQr(selectedUrl)}>
                                                Download
                                            </Button>
                                            <Button variant="outlined" size="small" onClick={() => handleShareQr(selectedUrl)}>
                                                Share
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                                <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 2, mb: 2 }}>
                                    <Tab label="Clicks" />
                                    <Tab label="Chart" />
                                    <Tab label="Map" />
                                    <Tab label="QR Code" />
                                </Tabs>
                                {tab === 0 && (
                                    <Box>
                                        {loadingVisits ? (
                                            <Stack alignItems="center" py={4}>
                                                <CircularProgress />
                                            </Stack>
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
                                                            <TableCell
                                                                sx={{
                                                                    maxWidth: 180,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {v.user_agent}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    maxWidth: 180,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                }}
                                                            >
                                                                {v.referer ?? '-'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No clicks found.
                                            </Typography>
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
                                            <Typography variant="body2" color="text.secondary">
                                                No data for the last 7 days.
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                                {tab === 2 &&
                                    (() => {
                                        const dataByCountryName = countryClicks ?? {};
                                        const max = Math.max(1, ...Object.values(dataByCountryName));
                                        const colorScale = scaleLinear<string>().domain([0, max]).range(['#e0f2fe', '#0284c7']);
                                        return (
                                            <Box minHeight={350}>
                                                <ComposableMap
                                                    projectionConfig={{ scale: 140 }}
                                                    width={800}
                                                    height={350}
                                                    style={{ width: '100%', height: 'auto' }}
                                                >
                                                    <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                                                        {({ geographies }) =>
                                                            geographies.map((geo: any) => {
                                                                const name = geo.properties.name;
                                                                const count = dataByCountryName[name] ?? 0;
                                                                const fillColor = count ? colorScale(count) : '#F5F4F6';
                                                                return (
                                                                    <TooltipMUI
                                                                        key={geo.rsmKey}
                                                                        title={count ? `${name}: ${count} click${count > 1 ? 's' : ''}` : name}
                                                                        arrow
                                                                    >
                                                                        <Geography
                                                                            geography={geo}
                                                                            fill={fillColor}
                                                                            stroke="#DDD"
                                                                            style={{ outline: 'none', cursor: count ? 'pointer' : 'default' }}
                                                                            onMouseEnter={() => setHoveredCountry(name)}
                                                                            onMouseLeave={() => setHoveredCountry(null)}
                                                                        />
                                                                    </TooltipMUI>
                                                                );
                                                            })
                                                        }
                                                    </Geographies>
                                                </ComposableMap>
                                                <Typography variant="caption" color="text.secondary" mt={1}>
                                                    {countryClicks ? 'Heatmap by country (real data)' : 'Heatmap by country (mock)'}
                                                </Typography>
                                                {/* Country click legend */}
                                                {countryClicks && Object.keys(countryClicks).length > 0 && (
                                                    <Box mt={2}>
                                                        <Typography variant="subtitle2" mb={1}>
                                                            Legend:
                                                        </Typography>
                                                        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                                                            {Object.entries(countryClicks)
                                                                .sort((a, b) => b[1] - a[1])
                                                                .map(([name, count]) => (
                                                                    <Box component="li" key={name} display="flex" alignItems="center" mb={0.5}>
                                                                        <Box
                                                                            sx={{
                                                                                width: 18,
                                                                                height: 18,
                                                                                bgcolor: colorScale(count),
                                                                                border: '1px solid #DDD',
                                                                                borderRadius: 1,
                                                                                mr: 1,
                                                                            }}
                                                                        />
                                                                        <Typography variant="body2">
                                                                            {name}: {count} click{count > 1 ? 's' : ''}
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        );
                                    })()}
                                {tab === 3 && (
                                    <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            QR Code for Short URL
                                        </Typography>
                                        <QRCodeCanvas
                                            id="qr-code"
                                            value={`${window.location.origin}/j/${selectedUrl.short_code}`}
                                            size={256}
                                            style={{ height: 'auto', maxWidth: '100%', width: 256 }}
                                        />
                                        <Typography variant="caption" color="text.secondary" mt={1}>
                                            Scan the QR code or click the link below:
                                        </Typography>
                                        <Link
                                            href={`/j/${selectedUrl.short_code}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="body2"
                                            sx={{ wordBreak: 'break-all' }}
                                        >
                                            {window.location.origin}/j/{selectedUrl.short_code}
                                        </Link>
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
