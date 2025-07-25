import { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  useTheme,
  alpha,
  ListItemIcon,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
} from '@mui/material';
import { Grid } from '@mui/material';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import { CountdownCard } from '../../components/CountdownCard';
import { Add as AddIcon, ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon, Edit, Delete, FilterList as FilterIcon } from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../../stores/useTransactionStore';
import { Transaction } from '../../types';
import { Menu } from '@mui/material';
import { useCategoryStore } from '../../stores/useCategoryStore';
import { useCountdownStore } from '../../stores/useCountdownStore';
import { useLoading } from '../../contexts/LoadingContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { countdowns, loadCountdowns, updateCountdown, removeCountdown } = useCountdownStore();

  // Estados para controle do período de filtro
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('all');

  const handleUserChange = (event: SelectChangeEvent<string>) => {
    setSelectedUser(event.target.value);
  };
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const [endDate, setEndDate] = useState<Date | null>(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  });
  const [countdownMenu, setCountdownMenu] = useState<{ mouseX: number; mouseY: number; countdownId: string; } | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [editBackgroundImageUrl, setEditBackgroundImageUrl] = useState('');
  const [selectedCountdown, setSelectedCountdown] = useState<{ id: string; title: string; target_date: string; background_image_url?: string | null; } | null>(null);

  const handleCountdownContextMenu = (event: React.MouseEvent, countdownId: string) => {
    event.preventDefault();
    setCountdownMenu(
      countdownMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
          countdownId,
        }
        : null,
    );
  };

  const handleCountdownTouchStart = (event: React.TouchEvent, countdownId: string) => {
    longPressTimer = setTimeout(() => {
      const touch = event.touches[0];
      setCountdownMenu({
        mouseX: touch.clientX,
        mouseY: touch.clientY,
        countdownId,
      });
    }, 500);
  };

  const handleCountdownMenuClose = () => {
    setCountdownMenu(null);
  };

  const handleEditCountdown = () => {
    if (countdownMenu?.countdownId) {
      const countdown = countdowns.find(c => c.id === countdownMenu.countdownId);
      if (countdown) {
        setSelectedCountdown(countdown);
        setEditTitle(countdown.title);
        setEditDate(new Date(countdown.target_date));
        setEditBackgroundImageUrl(countdown.background_image_url || '');
        setOpenEditDialog(true);
      }
    }
    handleCountdownMenuClose();
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [countdownToDelete, setCountdownToDelete] = useState<string | null>(null);

  const handleDeleteCountdown = async () => {
    if (countdownMenu?.countdownId) {
      setCountdownToDelete(countdownMenu.countdownId);
      setDeleteConfirmOpen(true);
      handleCountdownMenuClose();
    }
  };

  const handleConfirmDelete = async () => {
    if (countdownToDelete) {
      await removeCountdown(countdownToDelete);
      setDeleteConfirmOpen(false);
      setCountdownToDelete(null);
    }
  };

  const handleSaveCountdown = async () => {
    if (editTitle && editDate && selectedCountdown) {
      await updateCountdown(selectedCountdown.id, {
        title: editTitle,
        target_date: editDate.toISOString(),
        background_image_url: editBackgroundImageUrl || null,
      });
    }
    setOpenEditDialog(false);
    setSelectedCountdown(null);
  };

  const {
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses,
    getRecentTransactions,
    getTransactionsByCategory,
    removeTransaction,
    getUniqueResponsibles,
    loadTransactions,
  } = useTransactionStore();

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    transaction: Transaction;
  } | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleContextMenu = (event: React.MouseEvent, transaction: Transaction) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
          transaction,
        }
        : null,
    );
    setSelectedTransaction(transaction);
  };

  let longPressTimer: NodeJS.Timeout;
  const handleTouchStart = (event: React.TouchEvent, transaction: Transaction) => {
    longPressTimer = setTimeout(() => {
      const touch = event.touches[0];
      setContextMenu({
        mouseX: touch.clientX,
        mouseY: touch.clientY,
        transaction,
      });
      setSelectedTransaction(transaction);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer);
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleEditTransaction = () => {
    if (selectedTransaction) {
      navigate(`/transaction/edit/${selectedTransaction.id}`);
      handleContextMenuClose();
    }
  };

  const [deleteTransactionConfirmOpen, setDeleteTransactionConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const handleDeleteTransaction = () => {
    if (selectedTransaction) {
      setTransactionToDelete(selectedTransaction.id);
      setDeleteTransactionConfirmOpen(true);
      handleContextMenuClose();
    }
  };

  const handleConfirmTransactionDelete = async () => {
    if (transactionToDelete) {
      await removeTransaction(transactionToDelete);
      setDeleteTransactionConfirmOpen(false);
      setTransactionToDelete(null);
    }
  };

  const [categoryData, setCategoryData] = useState<{ id: string; value: number; label: string }[]>([]);

  const { categories, loadCategories } = useCategoryStore();
  const responsibles = getUniqueResponsibles();

  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const loadData = async () => {
      showLoading();
      try {
        await Promise.all([
          loadCategories(),
          loadTransactions(),
          loadCountdowns()
        ]);
      } finally {
        hideLoading();
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const data = categories.map((category) => {
      const transactions = getTransactionsByCategory(category.id, startDate, endDate, responsibleId);
      const total = transactions
        .filter(transaction => transaction.amount < 0)
        .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
      return {
        id: category.id,
        value: total,
        label: category.name,
      };
    }).filter(category => category.value > 0);
    setCategoryData(data);
  }, [categories, getTransactionsByCategory, startDate, endDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const responsibleId = selectedUser === 'all' ? null : selectedUser;
  const recentTransactions = getRecentTransactions(150, startDate, endDate, responsibleId);
  const totalBalance = getTotalBalance(startDate, endDate, responsibleId);
  const totalIncome = getTotalIncome(startDate, endDate, responsibleId);
  const totalExpenses = getTotalExpenses(startDate, endDate, responsibleId);

  const theme = useTheme();

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', margin: 0, position: 'relative' }}>
      {showFilters && (
        <Box
          onClick={() => setShowFilters(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
        />
      )}
      <Box sx={{ position: 'fixed', right: 20, top: 70, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={() => setShowFilters(!showFilters)}
          sx={{
            minWidth: 'auto',
            width: 40,
            height: 40,
            borderRadius: '50%',
            boxShadow: (theme) => theme.shadows[8],
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          <FilterIcon fontSize="small" />
        </Button>

        {showFilters && (
          <Paper
            sx={{
              p: 2,
              mt: 2,
              backgroundColor: '#FFFFFF',
              borderRadius: 2,
              boxShadow: (theme) => theme.shadows[8],
              animation: 'slideIn 0.3s ease-out',
              '@keyframes slideIn': {
                from: { opacity: 0, transform: 'translateY(-20px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
              width: 'auto',
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Período de Transação
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="De"
                  value={startDate}
                  onChange={setStartDate}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }}
                  sx={{ width: 160 }}
                />
                <DatePicker
                  label="Até"
                  value={endDate}
                  onChange={setEndDate}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }}
                  sx={{ width: 160 }}
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="user-select-label">Usuário</InputLabel>
                  <Select<string>
                    labelId="user-select-label"
                    id="user-select"
                    value={selectedUser}
                    onChange={handleUserChange}
                    label="Usuário"
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    {responsibles.map((responsible) => (
                      <MenuItem value={responsible.id} key={responsible.id}>
                        {responsible.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </LocalizationProvider>
          </Paper>
        )}
      </Box>
      <Grid container spacing={2}>
        {/* Contadores Regressivos */}
        <Grid container item xs={12} spacing={2}>
          {countdowns.map((countdown) => (
            <Grid item xs={12} sm={6} md={4} key={countdown.id}>
              <CountdownCard
                id={countdown.id}
                targetDate={new Date(countdown.target_date)}
                title={countdown.title}
                backgroundImageUrl={countdown.background_image_url}
                onContextMenu={(e) => handleCountdownContextMenu(e, countdown.id)}
                onTouchStart={(e) => handleCountdownTouchStart(e, countdown.id)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
              />
            </Grid>
          ))}

        </Grid>

        {/* Resumo financeiro */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              width: { xs: '98%', sm: '95%' },
              mx: 'auto',
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              height: 160,
              backgroundColor: '#FFFFFF',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                backgroundColor: 'primary.main',
                opacity: 0.2,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography component="h2" variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                Saldo Total
              </Typography>
            </Box>
            <Typography component="p" variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {formatCurrency(totalBalance)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Atualizado hoje
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              width: { xs: '98%', sm: '95%' },
              mx: 'auto',
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              height: 160,
              backgroundColor: '#FFFFFF',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                backgroundColor: 'primary.main',
                opacity: 0.2,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ArrowUpwardIcon color="success" sx={{ mr: 1 }} />
              <Typography component="h2" variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                Receitas
              </Typography>
            </Box>
            <Typography component="p" variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {formatCurrency(totalIncome)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de entradas
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              width: { xs: '98%', sm: '95%' },
              mx: 'auto',
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              height: 160,
              backgroundColor: '#FFFFFF',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                backgroundColor: 'primary.main',
                opacity: 0.2,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ArrowDownwardIcon color="error" sx={{ mr: 1 }} />
              <Typography component="h2" variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                Despesas
              </Typography>
            </Box>
            <Typography component="p" variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {formatCurrency(Math.abs(totalExpenses))}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de saídas
            </Typography>
          </Paper>
        </Grid>

        {/* Gráficos */}
        <Grid item xs={12} sm={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#FFFFFF', borderRadius: 4 }}>
            <Typography component="h2" variant="h6" gutterBottom>
              Despesas por Categoria
            </Typography>
            <Box sx={{ height: 'auto', width: '100%' }}>
              <PieChart
                series={[{
                  data: categoryData,
                  highlightScope: { fade: 'global', highlight: 'item' },
                  innerRadius: 30,
                }]}
                height={300}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#FFFFFF', borderRadius: 4 }}>
            <Typography component="h2" variant="h6" gutterBottom>
              Receitas vs Despesas
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <BarChart
                xAxis={[{ scaleType: 'band', data: ['Atual'] }]}
                series={[
                  { data: [totalIncome], label: 'Receitas' },
                  { data: [Math.abs(totalExpenses)], label: 'Despesas' },
                ]}
                height={300}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Lista de transações recentes */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#FFFFFF', borderRadius: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography component="h2" variant="h6" gutterBottom>
                Transações
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/transaction/new')}
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: '50%',
                  minWidth: 0,
                  paddingLeft: 3.4,
                  width: 40,
                  height: 43,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  }
                }}
              ></Button>
            </Box>
            <List>
              {recentTransactions.map((transaction: Transaction) => (
                <ListItem
                  key={transaction.id}
                  divider
                  onContextMenu={(event) => handleContextMenu(event, transaction)}
                  onTouchStart={(e) => handleTouchStart(e, transaction)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                  sx={{
                    py: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    }
                  }}
                >
                  <ListItemIcon>
                    {transaction.amount > 0 ? (
                      <ArrowUpwardIcon color="success" />
                    ) : (
                      <ArrowDownwardIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {transaction.description}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {categoryData.find(category => category.id === transaction.category_id)?.label} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </Typography>
                    }
                  />
                  <Typography
                    variant="subtitle1"
                    color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 600 }}
                  >
                    {formatCurrency(transaction.amount)}
                  </Typography>
                </ListItem>
              ))}

              <Menu
                open={contextMenu !== null}
                onClose={handleContextMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={
                  contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
                }
                PaperProps={{
                  sx: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                    boxShadow: (theme) => theme.shadows[3],
                  },
                }}
              >
                <MenuItem onClick={handleEditTransaction}>
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Editar" />
                </MenuItem>
                <MenuItem onClick={handleDeleteTransaction}>
                  <ListItemIcon>
                    <Delete fontSize="small" sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Excluir" />
                </MenuItem>
              </Menu>

              <Menu
                open={countdownMenu !== null}
                onClose={handleCountdownMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={
                  countdownMenu !== null
                    ? { top: countdownMenu.mouseY, left: countdownMenu.mouseX }
                    : undefined
                }
                PaperProps={{
                  sx: {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                    boxShadow: (theme) => theme.shadows[3],
                  },
                }}
              >
                <MenuItem onClick={handleEditCountdown}>
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Editar" />
                </MenuItem>
                <MenuItem onClick={handleDeleteCountdown}>
                  <ListItemIcon>
                    <Delete fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Excluir" />
                </MenuItem>
              </Menu>

            </List>
          </Paper>
        </Grid>

        {/* Menu de contexto do contador */}
        <Menu
          open={countdownMenu !== null}
          anchorReference="anchorPosition"
          anchorPosition={
            countdownMenu !== null
              ? { top: countdownMenu.mouseY, left: countdownMenu.mouseX }
              : undefined
          }
          onClose={handleCountdownMenuClose}
          onClick={handleCountdownMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: '#FFFFFF',
              borderRadius: 2,
              boxShadow: (theme) => theme.shadows[3],
            },
          }}
        >
          <MenuItem
            onClick={handleEditCountdown}
            sx={{
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={handleDeleteCountdown}
            sx={{
              color: 'error.main',
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            <ListItemIcon>
              <Delete fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>Excluir</ListItemText>
          </MenuItem>
        </Menu>

        {/* Diálogo de edição do contador */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
          <DialogTitle>Editar Contador</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Título"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                fullWidth
              />
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Data Alvo"
                  value={editDate}
                  onChange={(newValue) => setEditDate(newValue)}
                  format="dd/MM/yyyy"
                />
              </LocalizationProvider>
              <TextField
                label="URL da Imagem de Fundo"
                value={editBackgroundImageUrl}
                onChange={(e) => setEditBackgroundImageUrl(e.target.value)}
                fullWidth
                placeholder="https://exemplo.com/imagem.jpg"
                helperText="Deixe em branco para remover a imagem de fundo"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveCountdown} variant="contained" color="primary">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogContent>
            <Typography>Tem certeza que deseja excluir este contador?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteTransactionConfirmOpen}
          onClose={() => setDeleteTransactionConfirmOpen(false)}
        >
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>Tem certeza que deseja excluir esta transação?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteTransactionConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmTransactionDelete} color="error" variant="contained">
              Excluir
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Box>
  );
}