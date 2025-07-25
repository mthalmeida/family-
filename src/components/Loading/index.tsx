import { Box, CircularProgress } from '@mui/material';
import { keyframes } from '@mui/system';

interface LoadingProps {
  fullScreen?: boolean;
}

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

export function Loading({ fullScreen = false }: LoadingProps) {
  const containerStyles = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(5px)'
  } : {};

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '100%',
        ...containerStyles
      }}
    >
      <Box
        component="img"
        src="/icons/LogoApp.png"
        sx={{
          width: 64,
          animation: `${pulse} 2s infinite ease-in-out`,
          mb: 2
        }}
        alt="Carregando..."
      />
      <CircularProgress
        size={32}
        thickness={4}
        sx={{ color: 'primary.main' }}
      />
    </Box>
  );
}