export interface ShoppingListItem {
  id: string;
  name: string;
  currentPrice: number;
  lastPrice?: number;
  isChecked: boolean;
  lastPurchaseDate?: string;
  quantity: number;
}