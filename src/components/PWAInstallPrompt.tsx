import { Alert, Button, Snackbar, Fab, useMediaQuery, useTheme } from '@mui/material';
import { GetApp as GetAppIcon } from '@mui/icons-material';
import { usePWA } from '../hooks/usePWA';

export function PWAInstallPrompt() {
  const { isInstallable, promptInstall } = usePWA();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isInstallable) return null;

  if (isMobile) {
    return (
      <Fab
        color="primary"
        onClick={promptInstall}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        <GetAppIcon />
      </Fab>
    );
  }

  return (
    <Snackbar
      open={true}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity="info"
        action={
          <Button
            color="primary"
            size="small"
            onClick={promptInstall}
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            Instalar
          </Button>
        }
        sx={{
          width: '100%',
          alignItems: 'center',
          backgroundColor: 'white',
          '& .MuiAlert-message': {
            flex: 1
          }
        }}
      >
        Instale nosso app para uma melhor experiência!
      </Alert>
    </Snackbar>
  );
}