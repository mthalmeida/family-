import { create } from 'zustand';
import { supabase } from '../supabaseConfig';

interface User {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface UserStore {
  users: User[];
  loadUsers: () => Promise<void>;
  addUser: (name: string) => Promise<void>;
  editUser: (id: string, name: string) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],

  loadUsers: async () => {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erro ao carregar usuários:', error);
      return;
    }

    set({ users: users || [] });
  },

  addUser: async (name: string) => {
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ name }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar usuário:', error);
      return;
    }

    set((state) => ({ users: [...state.users, user] }));
  },

  editUser: async (id: string, name: string) => {
    const { data: user, error } = await supabase
      .from('users')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return;
    }

    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? user : u
      ),
    }));
  },

  removeUser: async (id: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover usuário:', error);
      return;
    }

    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }));
  },
}));