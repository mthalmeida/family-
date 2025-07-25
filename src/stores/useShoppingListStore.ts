import { create } from 'zustand';
import { ShoppingListItem } from '../types/ShoppingListItem';
import { shoppingListService } from '../services/shoppingListService';

interface ShoppingListStore {
  items: ShoppingListItem[];
  loadItems: () => Promise<void>;
  addItem: (name: string, currentPrice: number, quantity: number) => Promise<void>;
  editItem: (id: string, name: string, currentPrice: number, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  finishList: () => Promise<void>;
}

export const useShoppingListStore = create<ShoppingListStore>((set, get) => ({
  items: [],

  loadItems: async () => {
    try {
      const items = await shoppingListService.getItems();
      set({ items });
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  },

  addItem: async (name: string, currentPrice: number, quantity: number = 1) => {
    try {
      const newItem = await shoppingListService.addItem(name, currentPrice, quantity);
      set((state) => ({ items: [...state.items, newItem] }));
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  },

  editItem: async (id: string, name: string, currentPrice: number, quantity: number = 1) => {
    try {
      const updatedItem = await shoppingListService.editItem(id, name, currentPrice, quantity);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? updatedItem : item
        ),
      }));
    } catch (error) {
      console.error('Erro ao editar item:', error);
    }
  },

  removeItem: async (id: string) => {
    try {
      await shoppingListService.removeItem(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  },

  toggleItem: async (id: string) => {
    try {
      const updatedItem = await shoppingListService.toggleItem(id);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? updatedItem : item
        ),
      }));
    } catch (error) {
      console.error('Erro ao alternar item:', error);
    }
  },

  finishList: async () => {
    try {
      const checkedItems = get().items.filter((item) => item.isChecked);
      await shoppingListService.finishList(checkedItems);
      set((state) => ({
        items: state.items.filter((item) => !item.isChecked),
      }));
    } catch (error) {
      console.error('Erro ao finalizar lista:', error);
    }
  }
}));