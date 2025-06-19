import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import {
    Box,
    Button,
    IconButton,
    Link,
    MenuItem,
    Pagination,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
    Tooltip as TooltipMUI,
} from '@mui/material';
import React from 'react';
import ShortUrlActiveToggle from '../../components/ShortUrlActiveToggle';
import { ShortUrl } from './ShortUrlViewModal';

const sortableColumns = [
    { key: 'active', label: 'Ativo' },
    { key: 'title', label: 'Title' },
    { key: 'original_url', label: 'Original URL' },
    { key: 'short_code', label: 'Short URL' },
    { key: 'expires_at', label: 'Expires at' },
    { key: 'visit_count', label: 'Visits' },
    { key: 'max_visits', label: 'Max Visits' },
];

export interface ShortUrlsListProps {
    shortUrls: {
        data: ShortUrl[];
        last_page: number;
        current_page: number;
    };
    sort: string;
    direction: 'asc' | 'desc';
    search: string;
    setSearch: (value: string) => void;
    perPage: number;
    handleSearch: (e: React.FormEvent) => void;
    handlePerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePageChange: (_: React.ChangeEvent<unknown>, value: number) => void;
    handleSort: (column: string) => void;
    handleView: (url: ShortUrl) => void;
    handleShareShortUrl: (shortUrl: string) => void;
    handleOpen: () => void;
}

export default function ShortUrlsList({
    shortUrls,
    sort,
    direction,
    search,
    setSearch,
    perPage,
    handleSearch,
    handlePerPageChange,
    handlePageChange,
    handleSort,
    handleView,
    handleShareShortUrl,
    handleOpen,
}: ShortUrlsListProps) {
    const [toggleLoading, setToggleLoading] = React.useState<number | null>(null);
    const [urls, setUrls] = React.useState(shortUrls.data);

    React.useEffect(() => {
        setUrls(shortUrls.data);
    }, [shortUrls.data]);

    async function handleToggleActive(urlId: number) {
        setToggleLoading(urlId);
        // Optimistic update
        setUrls((prev) => prev.map((url) => (url.id === urlId ? { ...url, active: !url.active } : url)));
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        await fetch(`/short-urls/${urlId}/toggle-active`, {
            method: 'PATCH',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token || '',
            },
            credentials: 'same-origin',
        });
        setToggleLoading(null);
    }

    return (
        <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems="center">
                <form onSubmit={handleSearch} style={{ flex: 1 }}>
                    <TextField label="Search URL" value={search} onChange={(e) => setSearch(e.target.value)} size="small" fullWidth />
                </form>
                <TextField select label="Records per page" value={perPage} onChange={handlePerPageChange} size="small" sx={{ minWidth: 150 }}>
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
                        {urls.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No URLs found.
                                </TableCell>
                            </TableRow>
                        )}
                        {urls.map((url) => (
                            <TableRow key={url.id}>
                                <TableCell>
                                    <ShortUrlActiveToggle
                                        active={url.active}
                                        loading={toggleLoading === url.id}
                                        onChange={() => handleToggleActive(url.id)}
                                    />
                                </TableCell>
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
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <Link href={`/j/${url.short_code}`} target="_blank" rel="noopener noreferrer">
                                            {window.location.origin}/j/{url.short_code}
                                        </Link>
                                        <TooltipMUI title="Copiar link curto" arrow>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                sx={{ ml: 0.5, p: '3px' }}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/j/${url.short_code}`);
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
                                                onClick={() => handleShareShortUrl(`${window.location.origin}/j/${url.short_code}`)}
                                                aria-label="Compartilhar link curto"
                                            >
                                                <ShareIcon fontSize="small" />
                                            </IconButton>
                                        </TooltipMUI>
                                    </Box>
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
        </>
    );
}
