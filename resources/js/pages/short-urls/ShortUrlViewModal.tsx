import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tabs,
    Tooltip as TooltipMUI,
    Typography,
} from '@mui/material';
import { scaleLinear } from 'd3-scale';
import { QRCodeCanvas } from 'qrcode.react';
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Tipos auxiliares
export interface ShortUrl {
    id: number;
    title: string;
    original_url: string;
    short_code: string;
    expires_at?: string | null;
    visit_count: number;
    max_visits?: number | null;
    created_at?: string | null;
}

export interface ShortUrlVisit {
    id: number;
    visited_at?: string | null;
    ip_address: string;
    country?: string | null;
    user_agent: string;
    referer?: string | null;
}

export interface ShortUrlChartPoint {
    date: string;
    count: number;
}

export interface ShortUrlViewModalProps {
    viewOpen: boolean;
    handleViewClose: () => void;
    selectedUrl: ShortUrl | null;
    tab: number;
    handleTabChange: (_event: React.SyntheticEvent, newValue: number) => void;
    visits: ShortUrlVisit[] | null;
    loadingVisits: boolean;
    chart: ShortUrlChartPoint[] | null;
    countryClicks: Record<string, number> | null;
    setHoveredCountry: (country: string | null) => void;
    handleShareShortUrl: (shortUrl: string) => void;
    handleDownloadQr: (url: ShortUrl) => void;
    handleShareQr: (url: ShortUrl) => void;
}

export default function ShortUrlViewModal({
    viewOpen,
    handleViewClose,
    selectedUrl,
    tab,
    handleTabChange,
    visits,
    loadingVisits,
    chart,
    countryClicks,
    setHoveredCountry,
    handleShareShortUrl,
    handleDownloadQr,
    handleShareQr,
}: ShortUrlViewModalProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Função para deletar a short url
    async function handleDelete() {
        if (!selectedUrl) return;
        setDeleting(true);
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        await fetch(`/short-urls/${selectedUrl.id}`, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token || '',
            },
            credentials: 'same-origin',
        });
        setDeleting(false);
        setConfirmOpen(false);
        handleViewClose();
        // Chama evento customizado para recarregar a listagem
        window.dispatchEvent(new CustomEvent('short-url-deleted'));
    }

    return (
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
                    mt: 4,
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
                                    <Box component="span" display="inline-flex" alignItems="center" gap={0.5}>
                                        <Link href={`/j/${selectedUrl.short_code}`} target="_blank" rel="noopener noreferrer">
                                            {window.location.origin}/j/{selectedUrl.short_code}
                                        </Link>
                                        <TooltipMUI title="Copiar link curto" arrow>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                sx={{ ml: 0.5, p: '3px' }}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/j/${selectedUrl.short_code}`);
                                                }}
                                                aria-label="Copiar link curto"
                                            >
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </TooltipMUI>
                                        <TooltipMUI title="Compartilhar" arrow>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                sx={{ ml: 0.5, p: '3px' }}
                                                onClick={() => handleShareShortUrl(`${window.location.origin}/j/${selectedUrl.short_code}`)}
                                                aria-label="Compartilhar link curto"
                                            >
                                                <ShareIcon fontSize="small" />
                                            </IconButton>
                                        </TooltipMUI>
                                    </Box>
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
                                    size={225}
                                    marginSize={2}
                                    data-qrcode={selectedUrl.short_code}
                                />
                                <Box display="flex" gap={1}>
                                    <Button variant="outlined" size="small" onClick={() => handleDownloadQr(selectedUrl)}>
                                        <DownloadIcon fontSize="small" sx={{ mr: 0.5 }} />
                                        Download
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => {
                                            const canvas = document.querySelector(
                                                'canvas[data-qrcode="' + selectedUrl.short_code + '"]',
                                            ) as HTMLCanvasElement;
                                            if (canvas) {
                                                canvas.toBlob(async (blob) => {
                                                    if (blob) {
                                                        try {
                                                            await navigator.clipboard.write([new window.ClipboardItem({ [blob.type]: blob })]);
                                                        } catch {
                                                            alert('Não foi possível copiar a imagem do QR Code.');
                                                        }
                                                    }
                                                });
                                            }
                                        }}
                                    >
                                        <ContentCopyIcon fontSize="small" sx={{ mr: 0.5 }} />
                                        Copy
                                    </Button>
                                    <Button variant="outlined" size="small" onClick={() => handleShareQr(selectedUrl)}>
                                        <ShareIcon fontSize="small" sx={{ mr: 0.5 }} />
                                        Share
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                        <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 2, mb: 2 }}>
                            <Tab label="Clicks" />
                            <Tab label="Chart" />
                            <Tab label="Map" />
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
                                                {({ geographies }: { geographies: Array<{ rsmKey: string; properties: { name: string } }> }) =>
                                                    geographies.map((geo) => {
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
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button color="error" startIcon={<DeleteIcon />} onClick={() => setConfirmOpen(true)} disabled={!selectedUrl}>
                    Delete
                </Button>
                <Button onClick={handleViewClose}>Close</Button>
            </DialogActions>
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Confirm deletion</DialogTitle>
                <DialogContent>Are you sure you want to delete this short URL?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button color="error" startIcon={<DeleteIcon />} onClick={handleDelete} disabled={deleting}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
}
