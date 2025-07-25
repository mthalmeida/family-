import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Paper,
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { useTransactionStore } from '../../stores/useTransactionStore';
import { useAuth } from '../../contexts/AuthContext';

interface TransactionFormData {
  amount: number;
  category_id: string;
  description: string;
  date: Date;
  type: 'income' | 'expense';
}

const schema = yup.object().shape({
  amount: yup
    .number()
    .required('Valor é obrigatório')
    .positive('O valor deve ser positivo')
    .transform((value) => (isNaN(value) ? undefined : Number(value.toFixed(2)))),
  category_id: yup.string().required('Categoria é obrigatória'),
  description: yup.string().required('Descrição é obrigatória'),
  date: yup.date().required('Data é obrigatória'),
  type: yup.string().oneOf(['income', 'expense']).required(),
});

import { useCategoryStore } from '../../stores/useCategoryStore';

export function TransactionForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const loadTransactions = useTransactionStore((state) => state.loadTransactions);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      type: 'expense',
      date: new Date(),
      category_id: '',
    },
  });

  const { id } = useParams<{ id: string }>();
  const updateTransaction = useTransactionStore((state) => state.updateTransaction);

  useEffect(() => {
    if (id) {
      const transaction = useTransactionStore.getState().getTransactionById(id);
      if (transaction) {
        setValue('amount', Math.abs(transaction.amount));
        setValue('category_id', transaction.category_id);
        setValue('description', transaction.description);
        setValue('date', new Date(transaction.date));
        setValue('type', transaction.amount > 0 ? 'income' : 'expense');
      }
    }
  }, [id, setValue]);

  useEffect(() => {
    const currentCategories = useCategoryStore.getState().categories;
    if (currentCategories.length === 0) {
      useCategoryStore.getState().addCategory('Alimentação');
      useCategoryStore.getState().addCategory('Transporte');
      useCategoryStore.getState().addCategory('Lazer');
    }
  }, []);



  const onSubmit = async (data: TransactionFormData) => {
    const amount = data.type === 'expense' ? -Math.abs(data.amount) : data.amount;
    try {
      if (id) {
        await updateTransaction(id, {
          amount,
          category_id: data.category_id,
          description: data.description,
          date: data.date.toISOString(),
          responsible_name: user?.name || ''
        });
      } else {
        await addTransaction({
          amount,
          category_id: data.category_id,
          description: data.description,
          date: data.date.toISOString(),
          responsible_name: user?.name || ''
        });
      }
      await loadTransactions();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      return;
    }
    reset();
    navigate('/dashboard');
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Paper
        sx={{
          p: 3,
          width: '100%',
          mx: 'auto',
          mb: 10,
        }}
      >
        <Grid container spacing={3} sx={{ width: '100%' }}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {id ? 'Alterar Transação' : 'Nova Transação'}
            </Typography>
          </Grid>
  
          <Grid item xs={12}>
            <Paper>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Valor"
                    type="number"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">R$</InputAdornment>
                      ),
                    }}
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                  />
                )}
              />
            </Paper>
          </Grid>
  
          <Grid item xs={12}>
            <Paper>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Tipo</InputLabel>
                    <Select {...field} label="Tipo">
                      <MenuItem value="income">Receita</MenuItem>
                      <MenuItem value="expense">Despesa</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Paper>
          </Grid>
  
          <Grid item xs={12}>
            <Paper>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Descrição"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Paper>
          </Grid>
  
          <Grid item xs={12}>
            <Paper>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category_id}>
                    <InputLabel>Categoria</InputLabel>
                    <Select {...field} label="Categoria">
                      {useCategoryStore((state) => state.categories).map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category_id && (
                      <FormHelperText>{errors.category_id.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Paper>
          </Grid>
  
          <Grid item xs={12}>
            <Paper>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Data"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.date,
                          helperText: errors.date?.message,
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
  
      {/* Botões fixos abaixo do Paper */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 60,
          left: 0,
          right: 0,
          p: 2,
          backgroundColor: 'background.paper',
          display: 'flex',
          gap: 2,
          maxWidth: 500,
          mx: 'auto',
        }}
      >
        <Button
          variant="outlined"
          fullWidth
          size="large"
          onClick={() => navigate('/dashboard')}
        >
          Voltar
        </Button>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isSubmitting}
        >
          {id ? 'Alterar Transação' : 'Salvar Transação'}
        </Button>
      </Box>
    </Box>
  );
  
}