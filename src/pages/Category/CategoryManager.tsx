import { useState } from 'react';
import { useCategoryStore } from '../../stores/useCategoryStore';

interface Category {
  id: string;
  name: string;
}
import { Button, TextField, Paper, Typography, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

export function CategoryManager() {
  const { categories, addCategory, editCategory, removeCategory } = useCategoryStore();
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory);
      setNewCategory('');
    }
  };

  const handleEditCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      editCategory(editingCategory.id, editingCategory.name);
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = (id: string) => {
    removeCategory(id);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Gerenciar Categorias
      </Typography>

      {editingCategory ? (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            value={editingCategory.name}
            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
          />
          <Button variant="contained" onClick={handleEditCategory}>
            Salvar
          </Button>
          <Button variant="outlined" onClick={() => setEditingCategory(null)}>
            Cancelar
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            label="Nova Categoria"
          />
          <Button variant="contained" onClick={handleAddCategory}>
            Adicionar
          </Button>
        </Box>
      )}

      <List>
        {categories.map((category: Category) => (
          <ListItem
            key={category.id}
            secondaryAction={
              <>
                <IconButton edge="end" onClick={() => setEditingCategory(category)}>
                  <Edit />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDeleteCategory(category.id)}>
                  <Delete />
                </IconButton>
              </>
            }
          >
            <ListItemText primary={category.name} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}