import { create } from 'zustand';

interface Category {
  id: string;
  name: string;
}

interface CategoryStore {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: JSON.parse(localStorage.getItem('categories') || '[]'),
  setCategories: (categories) => {
    localStorage.setItem('categories', JSON.stringify(categories));
    set({ categories });
  },
}));