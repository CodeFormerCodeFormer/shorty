import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Box } from '@mui/material';
import React, { useState } from 'react';
import ShortUrlCreateModal, { ShortUrlCreateModalProps } from './ShortUrlCreateModal';
import ShortUrlsList from './ShortUrlsList';
import ShortUrlViewModal, { ShortUrl, ShortUrlChartPoint, ShortUrlVisit } from './ShortUrlViewModal';

export default function ShortUrlsIndex() {
    // Cast props para unknown antes de tipar
    const { shortUrls, filters, sort, direction } = usePage().props as unknown as {
        shortUrls: {
            data: ShortUrl[];
            last_page: number;
            current_page: number;
            total: number;
        };
        filters: { search?: string; per_page?: number };
        sort: string;
        direction: 'asc' | 'desc';
    };
    const [search, setSearch] = useState<string>(filters?.search || '');
    const [perPage, setPerPage] = useState<number>(filters?.per_page || 10);
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedUrl, setSelectedUrl] = useState<ShortUrl | null>(null);
    const [tab, setTab] = useState(0);
    const [visits, setVisits] = useState<ShortUrlVisit[] | null>(null);
    const [chart, setChart] = useState<ShortUrlChartPoint[] | null>(null);
    const [countryClicks, setCountryClicks] = useState<Record<string, number> | null>(null);
    const [loadingVisits, setLoadingVisits] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<ShortUrlCreateModalProps['data']>({
        title: '',
        original_url: '',
        short_code: '',
        expires_at: '',
        max_visits: '',
    });
    const [success, setSuccess] = useState('');
    const [, setHoveredCountry] = useState<string | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/short-urls', { search, per_page: perPage });
    };

    const handlePerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPerPage(Number(e.target.value));
        router.get('/short-urls', { search, per_page: e.target.value });
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        router.get('/short-urls', { search, per_page: perPage, page: value });
    };

    const handleOpen = () => {
        setOpen(true);
        setSuccess('');
        reset();
    };
    const handleClose = () => setOpen(false);

    const handleView = async (url: ShortUrl) => {
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
            const countryRes = await fetch(`/short-urls/${url.id}/country-clicks`);
            if (countryRes.ok) {
                setCountryClicks(await countryRes.json());
            } else {
                setCountryClicks(null);
            }
        } catch {
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

    const handleDownloadQr = (url: { short_code: string }) => {
        const canvas = document.querySelector('canvas[data-qrcode="' + url.short_code + '"]') as HTMLCanvasElement;
        if (canvas) {
            const link = document.createElement('a');
            link.download = `short-url-${url.short_code}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    };

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
                    } catch {
                        // user cancelled or not supported
                    }
                } else {
                    alert('Sharing is not supported in this browser.');
                }
            });
        }
    };

    const handleShareShortUrl = async (shortUrl: string) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Short URL',
                    text: 'Confira este link encurtado:',
                    url: shortUrl,
                });
            } catch {
                // user cancelled or not supported
            }
        } else {
            navigator.clipboard.writeText(shortUrl);
            alert('Link copied to clipboard!');
        }
    };

    // Updates the list when a short url is deleted and returns to the first page
    React.useEffect(() => {
        function reloadList() {
            router.get('/short-urls', { page: 1, search, per_page: perPage });
        }
        window.addEventListener('short-url-deleted', reloadList);
        return () => window.removeEventListener('short-url-deleted', reloadList);
    }, [search, perPage]);

    return (
        <AppLayout breadcrumbs={[{ title: 'My Short URLs', href: '/short-urls' }]}>
            <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
                <Head title="My URLs" />
                <ShortUrlsList
                    shortUrls={{
                        ...shortUrls,
                        total: shortUrls.total ?? shortUrls.data.length,
                    }}
                    sort={sort}
                    direction={direction}
                    search={search}
                    setSearch={setSearch}
                    perPage={perPage}
                    handleSearch={handleSearch}
                    handlePerPageChange={handlePerPageChange}
                    handlePageChange={handlePageChange}
                    handleSort={handleSort}
                    handleView={handleView}
                    handleShareShortUrl={handleShareShortUrl}
                    handleOpen={handleOpen}
                />
                <ShortUrlCreateModal
                    open={open}
                    handleClose={handleClose}
                    handleSubmit={handleSubmit}
                    handleChange={handleChange}
                    data={data}
                    errors={errors}
                    processing={processing}
                    success={success}
                />
                <ShortUrlViewModal
                    viewOpen={viewOpen}
                    handleViewClose={handleViewClose}
                    selectedUrl={selectedUrl}
                    tab={tab}
                    handleTabChange={handleTabChange}
                    visits={visits}
                    loadingVisits={loadingVisits}
                    chart={chart}
                    countryClicks={countryClicks}
                    setHoveredCountry={setHoveredCountry}
                    handleShareShortUrl={handleShareShortUrl}
                    handleDownloadQr={handleDownloadQr}
                    handleShareQr={handleShareQr}
                />
            </Box>
        </AppLayout>
    );
}
