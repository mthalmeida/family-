import { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Autocomplete, InputAdornment } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingListItem } from '../../types/ShoppingListItem';
import { shoppingListService } from '../../services/shoppingListService';

interface ShoppingListFormProps {
  open: boolean;
  onClose: () => void;
  item: ShoppingListItem | null;
  onSubmit: (values: { name: string; currentPrice: number; quantity: number }) => void;
}

export function ShoppingListForm({ open, onClose, item, onSubmit }: ShoppingListFormProps) {
  const [name, setName] = useState(item?.name || '');
  const [currentPrice, setCurrentPrice] = useState(item?.currentPrice?.toString() || '');
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const uniqueNames = await shoppingListService.getItemSuggestions();
        setSuggestions(uniqueNames);
      } catch (error) {
        console.error('Erro ao carregar sugestões:', error);
      }
    };
    loadSuggestions();
  }, []);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCurrentPrice(item.currentPrice?.toString() || '');
      setQuantity(item.quantity || 1);
    }
  }, [item]);

  const formatCurrency = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Converte para centavos
    const cents = parseInt(numericValue) || 0;
    
    // Formata o valor como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  };

  const formatPriceFromHistory = (price: number): string => {
    // Multiplica por 100 para converter em centavos antes de formatar
    return formatCurrency((price * 100).toString());
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrency(e.target.value);
    setCurrentPrice(formattedValue);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuantity(value > 0 ? value : 1); // Garante que a quantidade seja pelo menos 1
  };

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCurrentPrice(item.currentPrice ? formatPriceFromHistory(item.currentPrice) : '');
      setQuantity(item.quantity || 1);
    } else {
      // Quando for um novo item, define o preço como zero por padrão
      setCurrentPrice('0,00');
    }
  }, [item]);

  const handleSubmit = () => {
    if (user && name.trim() && currentPrice) {
      // Converte o valor formatado para número
      const numericValue = Number(currentPrice.replace(/\D/g, '')) / 100;
      if (!isNaN(numericValue)) {
        onSubmit({
          name: name.trim(),
          currentPrice: numericValue,
          quantity: quantity
        });
      }
      setName('');
      setCurrentPrice('');
      setQuantity(1);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{item ? 'Editar Item' : 'Novo Item'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Autocomplete
            freeSolo
            options={suggestions}
            value={name}
            inputValue={inputValue}
            onInputChange={(_, newValue) => {
              setInputValue(newValue);
              setName(newValue);
            }}
            onChange={async (_, newValue) => {
              if (newValue) {
                try {
                  const lastPurchaseInfo = await shoppingListService.getLastPurchaseInfo(newValue);
                  if (lastPurchaseInfo?.price) {
                    setCurrentPrice(formatPriceFromHistory(lastPurchaseInfo.price));
                  }
                } catch (error) {
                  console.error('Erro ao buscar último preço:', error);
                }
              }
            }}
            filterOptions={(options, { inputValue }) => {
              const inputValueLower = inputValue.toLowerCase();
              return options.filter(option =>
                option.toLowerCase().includes(inputValueLower)
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Nome do Item"
                required
              />
            )}
          />
          <TextField
            fullWidth
            label="Preço"
            value={currentPrice}
            onChange={handlePriceChange}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
          />
          <TextField
            fullWidth
            label="Quantidade"
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            required
            inputProps={{ min: 1, step: 1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name.trim() || !currentPrice || isNaN(Number(currentPrice.replace(/\D/g, '')) / 100)}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}