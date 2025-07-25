import { supabase } from '../supabaseConfig.js';

const saveData = async (collectionName, documentId, data) => {
  try {
    const { error } = await supabase
      .from(collectionName)
      .upsert({ id: documentId, ...data })
      .select();
    
    if (error) {
      console.error('Erro ao salvar documento:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar documento:', error);
    throw error;
  }
};

const getData = async (collectionName, documentId) => {
  try {
    const { data, error } = await supabase
      .from(collectionName)
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Documento não encontrado!');
        return null;
      }
      console.error('Erro ao buscar documento:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    return null;
  }
};

export { saveData, getData };