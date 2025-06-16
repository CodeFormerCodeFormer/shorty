import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Box, Typography, TextField, Button, Paper, Alert, Stack } from '@mui/material';

export default function ShortUrlsCreate() {
  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    original_url: '',
    short_code: '',
    expires_at: '',
    max_visits: '',
  });
  const [success, setSuccess] = useState('');

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
      },
    });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'My URLs', href: '/short-urls' }, { title: 'New URL', href: '/short-urls/create' }]}> 
      <Head title="New URL" />
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <Paper sx={{ width: 400, p: 4 }}>
          <Typography variant="h5" mb={2} align="center">New Short URL</Typography>
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
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
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={processing}>
                Create URL
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>
    </AppLayout>
  );
}
