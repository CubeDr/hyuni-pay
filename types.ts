
export interface Item {
  id: string;
  name: string;
  quantity: number;
  price: number;
  payers: string[]; // Array of payer IDs
  isShared: boolean;
}

export interface Payer {
  id: string;
  name: string;
}

export interface ParsedItem {
    name: string;
    quantity: number;
    price: number;
    isLikelyShared: boolean;
}

export interface ReceiptData {
  items: ParsedItem[];
  tax: number;
  tip: number;
  total: number;
}

export interface Payment {
  id: string;
  title: string;
  date: string;
  items: Item[];
  payers: Payer[];
  tax: number;
  tip: number;
}