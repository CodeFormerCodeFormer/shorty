import { AppContent } from '@/components/app-content';
import AppLogo from '@/components/app-logo';
import { AppShell } from '@/components/app-shell';
import { useInitials } from '@/hooks/use-initials';
import { BreadcrumbItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Logout, Person } from '@mui/icons-material';
import { AppBar, Box, Button, IconButton, Menu, Toolbar } from '@mui/material';
import React, { PropsWithChildren, useState } from 'react';

type User = {
    name: string;
    email: string;
};

type PageProps = {
    auth?: {
        user: User;
    };
};

export default function AppNavbarLayout({ children }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { auth } = usePage<PageProps>().props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const getInitials = useInitials();
    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        window.location.href = route('logout');
    };
    return (
        <AppShell variant="header">
            <AppBar position="static" color="default" elevation={1} sx={{ zIndex: 1201 }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                            <AppLogo />
                        </Link>
                        <Button component={Link} href="/short-urls" color="inherit" sx={{ fontWeight: 600, textTransform: 'none', ml: 2 }}>
                            Links
                        </Button>
                    </Box>
                    <Box>
                        {auth?.user && (
                            <>
                                <IconButton onClick={handleMenu} size="small" sx={{ ml: 2 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: 18,
                                        }}
                                    >
                                        {getInitials(auth.user.name)}
                                    </Box>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    PaperProps={{
                                        elevation: 2,
                                        sx: { mt: 1.5, minWidth: 220 },
                                    }}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                    <Box px={2} py={1} display="flex" alignItems="center" gap={1}>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: 16,
                                            }}
                                        >
                                            {getInitials(auth.user.name)}
                                        </Box>
                                        <Box>
                                            <Box fontWeight={600}>{auth.user.name}</Box>
                                            <Box fontSize={13} color="text.secondary">
                                                {auth.user.email}
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box px={2} py={0.5}>
                                        <Button
                                            component={Link}
                                            href={route('profile.edit')}
                                            startIcon={<Person fontSize="small" />}
                                            fullWidth
                                            sx={{ justifyContent: 'flex-start', mb: 1 }}
                                            onClick={handleClose}
                                        >
                                            Profile
                                        </Button>
                                        <Button
                                            startIcon={<Logout fontSize="small" />}
                                            fullWidth
                                            sx={{ justifyContent: 'flex-start' }}
                                            onClick={handleLogout}
                                        >
                                            Sair
                                        </Button>
                                    </Box>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            <AppContent variant="header">{children}</AppContent>
        </AppShell>
    );
}
