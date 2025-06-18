import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';

interface ShortUrlActiveToggleProps {
    active: boolean;
    onChange: (active: boolean) => void;
    loading?: boolean;
}

export default function ShortUrlActiveToggle({ active, onChange, loading }: ShortUrlActiveToggleProps) {
    return (
        <Tooltip title={active ? 'Desativar link' : 'Ativar link'}>
            <span>
                <Switch
                    checked={active}
                    onChange={(e) => onChange(e.target.checked)}
                    color="primary"
                    disabled={loading}
                    inputProps={{ 'aria-label': 'Ativar/desativar link' }}
                />
            </span>
        </Tooltip>
    );
}
