import { create } from 'zustand';
import { supabase } from '../supabaseConfig';

interface Task {
  id: string;
  title: string;
  date: string;
  is_all_day: boolean;
  start_time?: string;
  end_time?: string;
  repeat_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeat_until?: string;
  created_at?: string;
  updated_at?: string;
}

interface AgendaStore {
  tasks: Task[];
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  getTasksByDate: (date: Date) => Task[];
}

export const useAgendaStore = create<AgendaStore>((set, get) => ({
  tasks: [],

  loadTasks: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        set({ tasks: [] });
        return;
      }

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      if (tasks) {
        set({ tasks });
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      set({ tasks: [] });
    }
  },

  addTask: async (newTask) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('Usuário não autenticado');
      return;
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([{
        ...newTask,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar tarefa:', error);
      return;
    }

    set((state) => ({ tasks: [...state.tasks, task] }));
  },

  updateTask: async (id, updatedTask) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('Usuário não autenticado');
      return;
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        ...updatedTask,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return;
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...task } : t
      ),
    }));
  },

  removeTask: async (id) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('Usuário não autenticado');
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Erro ao remover tarefa:', error);
      return;
    }

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },

  getTasksByDate: (date) => {
    const tasks = get().tasks;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);

      // Para tarefas sem repetição, compara apenas a data
      if (task.repeat_type === 'none') {
        return taskDate.getTime() === targetDate.getTime();
      }

      // Verifica se a data alvo está dentro do período de repetição
      const taskStartDate = new Date(taskDate);
      taskStartDate.setHours(0, 0, 0, 0);

      const repeatUntil = task.repeat_until ? new Date(task.repeat_until) : null;
      if (repeatUntil) {
        repeatUntil.setHours(23, 59, 59, 999);
      }

      // Verifica se a data alvo está dentro do período válido
      if (targetDate < taskStartDate) {
        return false;
      }
      if (repeatUntil && targetDate > repeatUntil) {
        return false;
      }

      // Calcula a diferença em dias entre a data da tarefa e a data alvo
      const diffTime = targetDate.getTime() - taskStartDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Verifica o padrão de repetição
      switch (task.repeat_type) {
        case 'daily':
          return true;
        case 'weekly':
          return diffDays % 7 === 0;
        case 'monthly':
          return targetDate.getDate() === taskStartDate.getDate();
        case 'yearly':
          return (
            targetDate.getDate() === taskStartDate.getDate() &&
            targetDate.getMonth() === taskStartDate.getMonth()
          );
        default:
          return false;
      }
    });
  },
}));