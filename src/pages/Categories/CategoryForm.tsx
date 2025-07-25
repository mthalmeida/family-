import { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface Category {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  category: Category | null;
  onSubmit: (values: { name: string; }) => void;
}

export function CategoryForm({ open, onClose, category, onSubmit }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');

  const { user } = useAuth();

  const handleSubmit = () => {
    if (user) {
      onSubmit({ name });
      setName('');
    }
  };

  useEffect(() => {
    setName(category?.name || '');
  }, [category]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{category ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!name.trim()}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}