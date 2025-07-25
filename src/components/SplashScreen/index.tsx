import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

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

export function SplashScreen() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'primary.main',
        zIndex: 9999,
        animation: `${fadeIn} 0.5s ease-out`
      }}
    >
      <Box
        component="img"
        src="/icons/LogoApp.png"
        sx={{
          width: 180,
          animation: `${pulse} 2s infinite ease-in-out`,
          mb: 3,
          filter: 'brightness(0) invert(1)'
        }}
        alt="Logo do Aplicativo"
      />
    </Box>
  );
}