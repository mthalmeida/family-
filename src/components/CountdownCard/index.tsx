import { useState, useEffect } from 'react';
import { Box, Typography, Paper, alpha, useTheme } from '@mui/material';
import { differenceInMonths, differenceInDays } from 'date-fns';

interface CountdownCircleProps {
  value: number;
  maxValue: number;
  label: string;
  size?: number;
  hasBackgroundImage?: boolean;
}

const CountdownCircle = ({ value, maxValue, label, size = 60, hasBackgroundImage = false }: CountdownCircleProps) => {
  const theme = useTheme();
  const radius = size / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const progress = 1 - (value / maxValue);
  const strokeDashoffset = circumference * progress;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={alpha(theme.palette.primary.main, 0.05)}
          strokeWidth={5}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={5}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.palette.info.main} />
            <stop offset="100%" stopColor={theme.palette.warning.main} />
          </linearGradient>
        </defs>
      </svg>
      <Typography
        variant="h6"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontWeight: 700,
          color: hasBackgroundImage ? 'white' : 'inherit',
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: -20,
          width: '100%',
          textAlign: 'center',
          color: hasBackgroundImage ? 'white' : 'text.secondary',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

interface CountdownCardProps {
  id: string;
  targetDate: Date;
  title: string;
  backgroundImageUrl?: string | null;
  onContextMenu: (event: React.MouseEvent) => void;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchMove: () => void;
}

export function CountdownCard({
  targetDate,
  title,
  backgroundImageUrl,
  onContextMenu,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
}: CountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState({ years: 0, months: 0, days: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const totalMonths = differenceInMonths(targetDate, now);
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      const days = differenceInDays(targetDate, now) % 30;
      setTimeLeft({ years, months, days });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <Paper
      sx={{
        width: { xs: '98%', sm: '95%' },
        mx: 'auto',
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: backgroundImageUrl ? 'transparent' : '#FFFFFF',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'context-menu',
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': backgroundImageUrl ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 0,
        } : {},
        '&:hover': backgroundImageUrl ? {
          '&::before': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        } : {},
      }}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, position: 'relative', zIndex: 1 }}>
        <Typography component="h2" variant="h6" color={backgroundImageUrl ? 'white' : 'primary'} sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          my: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CountdownCircle value={timeLeft.years} maxValue={100} label="Anos" hasBackgroundImage={!!backgroundImageUrl} />
        <CountdownCircle value={timeLeft.months} maxValue={12} label="Meses" hasBackgroundImage={!!backgroundImageUrl} />
        <CountdownCircle value={timeLeft.days} maxValue={30} label="Dias" hasBackgroundImage={!!backgroundImageUrl} />
      </Box>
    </Paper>
  );
}