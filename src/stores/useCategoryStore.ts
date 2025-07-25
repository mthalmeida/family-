import { create } from 'zustand';
import { supabase } from '../supabaseConfig';

interface Category {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface CategoryStore {
  categories: Category[];
  loadCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  editCategory: (id: string, name: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],

  loadCategories: async () => {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erro ao carregar categorias:', error);
      return;
    }

    set({ categories: categories || [] });
  },

  addCategory: async (name: string) => {
    const { data: category, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar categoria:', error);
      return;
    }

    set((state) => ({ categories: [...state.categories, category] }));
  },

  editCategory: async (id: string, name: string) => {
    const { data: category, error } = await supabase
      .from('categories')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar categoria:', error);
      return;
    }

    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === id ? category : cat
      ),
    }));
  },

  removeCategory: async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover categoria:', error);
      return;
    }

    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== id),
    }));
  },
}));