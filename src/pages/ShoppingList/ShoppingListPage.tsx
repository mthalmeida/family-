import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
  Menu,
  MenuItem,
  alpha,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { ShoppingListForm } from './ShoppingListForm';
import { useShoppingListStore } from '../../stores/useShoppingListStore';
import { ShoppingListItem } from '../../types/ShoppingListItem';

export function ShoppingListPage() {
  const { items, loadItems, addItem, editItem, removeItem, toggleItem, finishList } = useShoppingListStore();
  const [openForm, setOpenForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShoppingListItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    item: ShoppingListItem;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent, item: ShoppingListItem) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
          item,
        }
        : null,
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  let longPressTimer: NodeJS.Timeout;
  const handleTouchStart = (event: React.TouchEvent, item: ShoppingListItem) => {
    longPressTimer = setTimeout(() => {
      const touch = event.touches[0];
      setContextMenu({
        mouseX: touch.clientX,
        mouseY: touch.clientY,
        item,
      });
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await removeItem(itemToDelete);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (values: { name: string; currentPrice: number; quantity: number }) => {
    if (selectedItem) {
      await editItem(selectedItem.id, values.name, values.currentPrice, values.quantity);
    } else {
      await addItem(values.name, values.currentPrice, values.quantity);
    }
    setOpenForm(false);
  };

  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);

  const handleFinishList = async () => {
    setFinishConfirmOpen(true);
  };

  const handleConfirmFinish = async () => {
    await finishList();
    setFinishConfirmOpen(false);
  };

  const calculateSubtotal = (onlyChecked: boolean) => {
    return items
      .filter((item) => onlyChecked ? item.isChecked : true)
      .reduce((total, item) => total + (item.currentPrice * (item.quantity || 1)), 0);
  };

  const formatCurrency = (value: number) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue === null || numValue === undefined) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => {
            setSelectedItem(null);
            setOpenForm(true);
          }}
        >
          Novo Item
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleFinishList}
          disabled={!items.some((item) => item.isChecked)}
        >
          Finalizar Lista
        </Button>
      </Box>

      {/* Tabela */}
      <Box sx={{ minHeight: 'calc(100vh - 300px)', overflow: 'auto', mb: 10 }}>
        <Paper sx={{ backgroundColor: '#FFFFFF', borderRadius: 4, overflow: 'hidden' }}>
          <TableContainer sx={{ mb: 2, overflowX: 'auto' }}>
            <Table size="small" sx={{ '& .MuiTableCell-root': { height: '60px' } }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.200' }}>
                  <TableCell padding="checkbox" sx={{ width: 40, height: '50px' }}></TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 100, height: '50px' }}>Qtd</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 160, height: '50px' }}>Último Preço</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 160, height: '50px' }}>Preço Atual</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                    onTouchStart={(e) => handleTouchStart(e, item)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchEnd}
                    sx={{
                      textDecoration: item.isChecked ? 'line-through' : 'none',
                      opacity: item.isChecked ? 0.7 : 1,
                      cursor: 'context-menu',
                      '&:hover': {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={item.isChecked}
                        onChange={() => toggleItem(item.id)}
                      />
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity || 1}</TableCell>
                    <TableCell>{item.lastPrice ? formatCurrency(item.lastPrice) : '-'}</TableCell>
                    <TableCell>{formatCurrency(item.currentPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Diálogo de confirmação para finalizar lista */}
      <Dialog open={finishConfirmOpen} onClose={() => setFinishConfirmOpen(false)}>
        <DialogTitle>Finalizar lista de compras</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja finalizar a lista? Os itens selecionados serão removidos e seus preços serão atualizados no histórico.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinishConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmFinish} color="error" variant="contained">
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de exclusão */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir este item da lista de compras?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Totais fixos */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 60,
          left: 0,
          right: 0,
          p: 2,
          backgroundColor: 'background.paper',
          boxShadow: 'none',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          gap: 2,
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 4 },
            width: '100%',
            maxWidth: 'sm',
            mx: 'auto',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'space-between', sm: 'flex-start' },
              flex: 1,
            }}
          >
            <span>Subtotal (Selecionados):</span>
            <span>{formatCurrency(calculateSubtotal(true))}</span>
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'space-between', sm: 'flex-start' },
              flex: 1,
              fontWeight: 'bold',
            }}
          >
            <span>Total:</span>
            <span>{formatCurrency(calculateSubtotal(false))}</span>
          </Typography>
        </Box>
      </Box>

      {/* Menu de contexto */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
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
        <MenuItem
          onClick={() => {
            setSelectedItem(contextMenu?.item || null);
            setOpenForm(true);
            handleCloseContextMenu();
          }}
          sx={{
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <Edit sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (contextMenu?.item) {
              handleDelete(contextMenu.item.id);
            }
            handleCloseContextMenu();
          }}
          sx={{
            color: 'error.main',
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <Delete sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>

      {/* Formulário de item */}
      <ShoppingListForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        item={selectedItem}
        onSubmit={handleSubmit}
      />
    </Box>

  );
}