import { create } from 'zustand';
import { supabase } from '../supabaseConfig';

interface Countdown {
  id: string;
  title: string;
  target_date: string;
  background_image_url: string | undefined | null;
  created_at?: string;
  updated_at?: string;
}

interface CountdownStore {
  countdowns: Countdown[];
  loadCountdowns: () => Promise<void>;
  addCountdown: (countdown: Omit<Countdown, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCountdown: (id: string, countdown: Partial<Omit<Countdown, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  removeCountdown: (id: string) => Promise<void>;
}

export const useCountdownStore = create<CountdownStore>((set) => ({
  countdowns: [],

  loadCountdowns: async () => {
    const { data: countdowns, error } = await supabase
      .from('countdowns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar contagens regressivas:', error);
      return;
    }

    set({ countdowns: countdowns || [] });
  },

  addCountdown: async (newCountdown) => {
    const { data: countdown, error } = await supabase
      .from('countdowns')
      .insert([newCountdown])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar contagem regressiva:', error);
      return;
    }

    set((state) => ({ countdowns: [...state.countdowns, countdown] }));
  },

  updateCountdown: async (id, updatedCountdown) => {
    const { data: countdown, error } = await supabase
      .from('countdowns')
      .update(updatedCountdown)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar contagem regressiva:', error);
      return;
    }

    set((state) => ({
      countdowns: state.countdowns.map((c) =>
        c.id === id ? { ...c, ...countdown } : c
      ),
    }));
  },

  removeCountdown: async (id) => {
    const { error } = await supabase
      .from('countdowns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover contagem regressiva:', error);
      return;
    }

    set((state) => ({
      countdowns: state.countdowns.filter((c) => c.id !== id),
    }));
  },
}));