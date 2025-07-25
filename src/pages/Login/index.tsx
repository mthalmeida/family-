import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { PWAInstallPrompt } from '../../components/PWAInstallPrompt';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Digite um e-mail válido')
    .required('E-mail é obrigatório'),
  password: yup.string().required('Senha é obrigatória'),
});

export function LoginPage() {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // CONFIGURAÇÃO DE AUTORIZAÇÃO
      // Substitua esta lista pelos emails autorizados para acessar o sistema
      // Você pode implementar uma verificação mais robusta usando o banco de dados
      const authorizedEmails = [
        // 'seu-email@exemplo.com',
        // 'outro-usuario@exemplo.com',
        // Adicione aqui os emails que devem ter acesso ao sistema
      ];
      
      // Verificação de autorização (opcional - pode ser removida se usar autenticação do Supabase)
      if (authorizedEmails.length > 0 && !authorizedEmails.includes(data.email)) {
        setError('Usuário não autorizado');
        return;
      }
      
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.');
    }
  };

  return (
    <>
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(-45deg, #00796B, #4CAF50, #1976D2, #0D47A1)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
        '@keyframes gradient': {
          '0%': {
            backgroundPosition: '0% 50%'
          },
          '50%': {
            backgroundPosition: '100% 50%'
          },
          '100%': {
            backgroundPosition: '0% 50%'
          },
        },
      }}
    >
      <Container
        component="main"
        sx={{
          width: '100%',
          maxWidth: { xs: '400px', md: '500px' },
          margin: '0 auto',
          padding: { xs: 2, sm: 3 },
          height: { md: '500px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            height: { md: '500px' },
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            aspectRatio: { md: '1/1' },
          }}
        >
          <Box
            sx={{
              width: { xs: 150, md: 120 },
              height: { xs: 150, md: 120 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <img src="/icons/LogoApp.png" alt="Logo Gestão Familiar" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: { xs: 3, md: 2 }, width: '100%' }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-mail"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                borderRadius: 2,
                height: 48,
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: '0 4px 6px rgba(33, 150, 243, 0.2)',
              }}
              disabled={isSubmitting}
            >
              Entrar
            </Button>
            {/* <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                Não tem uma conta? Criar conta
              </Link>
            </Box> */}
          </Box>
        </Paper>
      </Container>
    </Box>
    <PWAInstallPrompt />
    </>
  );
}