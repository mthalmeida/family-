import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';

export function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Página não encontrada
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          A página que você está procurando não existe. Você será redirecionado para a página principal em 5 segundos.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard')}
          size="large"
        >
          Ir para página principal
        </Button>
      </Box>
    </Container>
  );
}