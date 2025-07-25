import { useState, useEffect } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Menu, MenuItem, alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { CategoryForm } from './CategoryForm';
import { useCategoryStore } from '../../stores/useCategoryStore';

interface Category {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export function CategoriesPage() {
  const { categories, loadCategories, addCategory, editCategory, removeCategory } = useCategoryStore();
  const [openForm, setOpenForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    category: Category;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent, category: Category) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
          category,
        }
        : null,
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  let longPressTimer: NodeJS.Timeout;
  const handleTouchStart = (event: React.TouchEvent, category: Category) => {
    longPressTimer = setTimeout(() => {
      const touch = event.touches[0];
      setContextMenu({
        mouseX: touch.clientX,
        mouseY: touch.clientY,
        category,
      });
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setCategoryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      await removeCategory(categoryToDelete);
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleSubmit = async (values: { name: string }) => {
    if (selectedCategory) {
      await editCategory(selectedCategory.id, values.name);
    } else {
      await addCategory(values.name);
    }
    setOpenForm(false);
  };

  return (
    <Box sx={{ p: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>

      <Box sx={{ display: 'flex', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedCategory(null);
            setOpenForm(true);
          }}
        >
          Nova Categoria
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
        <Table
          sx={{
            minWidth: 400, // valor mínimo para evitar que quebre em colunas únicas
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.200' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow
                key={category.id}
                onContextMenu={(e) => handleContextMenu(e, category)}
                onTouchStart={(e) => handleTouchStart(e, category)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
                sx={{
                  cursor: 'context-menu',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <TableCell>{category.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
            setSelectedCategory(contextMenu?.category || null);
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
            if (contextMenu?.category) {
              handleDelete(contextMenu.category.id);
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

      <CategoryForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        category={selectedCategory}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir esta categoria?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>

  );
}
