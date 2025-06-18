import CloseIcon from '@mui/icons-material/Close';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField } from '@mui/material';

export default function ShortUrlCreateModal({ open, handleClose, handleSubmit, handleChange, data, errors, processing, success }: any) {
    return (
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
    );
}
