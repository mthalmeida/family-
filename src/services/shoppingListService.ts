import { supabase } from '../supabaseConfig';
import { ShoppingListItem } from '../types/ShoppingListItem';

export const shoppingListService = {
  async getItems(): Promise<ShoppingListItem[]> {
    const { data, error } = await supabase
      .from('shopping_list_items')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Buscar os últimos preços para cada item
    const itemsWithLastPrices = await Promise.all(data.map(async (item) => {
      const { data: lastPurchase } = await supabase
        .from('purchase_history')
        .select('price, purchase_date')
        .ilike('item_name', item.name)
        .order('purchase_date', { ascending: false })
        .limit(1);

      return {
        id: item.id,
        name: item.name,
        currentPrice: item.current_price,
        lastPrice: lastPurchase?.[0]?.price || null,
        isChecked: item.is_checked,
        lastPurchaseDate: lastPurchase?.[0]?.purchase_date || null,
        quantity: item.quantity || 1 // Valor padrão de 1 se não existir
      };
    }));

    return itemsWithLastPrices;
  },

  async addItem(name: string, currentPrice: number, quantity: number = 1): Promise<ShoppingListItem> {
    // Buscar o último preço do item no histórico de compras
    const { data: lastPurchase, error: lastPurchaseError } = await supabase
      .from('purchase_history')
      .select('price, purchase_date')
      .ilike('item_name', name)
      .order('purchase_date', { ascending: false })
      .limit(1);

    if (lastPurchaseError) throw lastPurchaseError;

    // Inserir o novo item com o último preço encontrado
    const { data, error } = await supabase
      .from('shopping_list_items')
      .insert({
        name,
        current_price: currentPrice,
        is_checked: false,
        quantity: quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      currentPrice: data.current_price,
      lastPrice: lastPurchase?.[0]?.price || null,
      isChecked: data.is_checked,
      lastPurchaseDate: lastPurchase?.[0]?.purchase_date || null,
      quantity: data.quantity
    };
  },

  async editItem(id: string, name: string, currentPrice: number, quantity: number = 1): Promise<ShoppingListItem> {
    // Buscar o último preço do item no histórico de compras
    const { data: lastPurchase, error: lastPurchaseError } = await supabase
      .from('purchase_history')
      .select('price, purchase_date')
      .ilike('item_name', name)
      .order('purchase_date', { ascending: false })
      .limit(1);

    if (lastPurchaseError) throw lastPurchaseError;

    const { data, error } = await supabase
      .from('shopping_list_items')
      .update({
        name,
        current_price: currentPrice,
        quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      currentPrice: data.current_price,
      lastPrice: lastPurchase?.[0]?.price || null,
      isChecked: data.is_checked,
      lastPurchaseDate: lastPurchase?.[0]?.purchase_date || null,
      quantity: data.quantity
    };
  },

  async removeItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleItem(id: string): Promise<ShoppingListItem> {
    const { data: currentItem, error: fetchError } = await supabase
      .from('shopping_list_items')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Buscar o último preço do item no histórico de compras
    const { data: lastPurchase, error: lastPurchaseError } = await supabase
      .from('purchase_history')
      .select('price, purchase_date')
      .ilike('item_name', currentItem.name)
      .order('purchase_date', { ascending: false })
      .limit(1);

    if (lastPurchaseError) throw lastPurchaseError;

    const { data, error } = await supabase
      .from('shopping_list_items')
      .update({
        is_checked: !currentItem.is_checked,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      currentPrice: data.current_price,
      lastPrice: lastPurchase?.[0]?.price || null,
      isChecked: data.is_checked,
      lastPurchaseDate: lastPurchase?.[0]?.purchase_date || null,
      quantity: data.quantity || 1
    };
  },

  async finishList(checkedItems: ShoppingListItem[]): Promise<void> {
    const { error: insertError } = await supabase
      .from('purchase_history')
      .insert(
        checkedItems.map(item => ({
          item_name: item.name,
          price: item.currentPrice,
          purchase_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        }))
      );

    if (insertError) throw insertError;

    const checkedIds = checkedItems.map(item => item.id);
    const { error: deleteError } = await supabase
      .from('shopping_list_items')
      .delete()
      .in('id', checkedIds);

    if (deleteError) throw deleteError;
  },

  async getItemSuggestions(): Promise<string[]> {
    const { data: purchaseHistoryData, error: purchaseHistoryError } = await supabase
      .from('purchase_history')
      .select('item_name')
      .order('created_at', { ascending: false });

    if (purchaseHistoryError) throw purchaseHistoryError;

    const { data: currentItems, error: currentItemsError } = await supabase
      .from('shopping_list_items')
      .select('name');

    if (currentItemsError) throw currentItemsError;

    // Combine unique names from both purchase history and current items
    const allNames = [
      ...purchaseHistoryData.map(item => item.item_name),
      ...currentItems.map(item => item.name)
    ];

    // Return unique names
    return [...new Set(allNames)];
  },
  async getLastPurchaseInfo(itemName: string): Promise<{ price: number; purchase_date: string } | null> {
    const { data, error } = await supabase
      .from('purchase_history')
      .select('price, purchase_date')
      .ilike('item_name', itemName)
      .order('purchase_date', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data?.[0] || null;
  },
};