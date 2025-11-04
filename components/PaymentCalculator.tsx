import React, { useState } from 'react';
import { Payment, Item, Payer, ReceiptData } from '../types';
import ReceiptUploader from './ReceiptUploader';
import PayerManager from './PayerManager';
import ItemList from './ItemList';
import Summary from './Summary';

interface PaymentCalculatorProps {
  payment: Payment;
}

const PaymentCalculator: React.FC<PaymentCalculatorProps> = ({ payment: initialPayment }) => {
  const [items, setItems] = useState<Item[]>(initialPayment.items);
  const [payers, setPayers] = useState<Payer[]>(initialPayment.payers);
  const [tax, setTax] = useState<number>(initialPayment.tax);
  const [tip, setTip] = useState<number>(initialPayment.tip);
  
  const handleReceiptParsed = (data: ReceiptData) => {
    const expandedItems: ({ id: string; name: string; quantity: number; price: number; isLikelyShared: boolean; })[] = [];
    data.items.forEach(item => {
      if (item.quantity > 1) {
        const singleItemPrice = Math.round(item.price / item.quantity);
        for (let i = 0; i < item.quantity; i++) {
          expandedItems.push({
            id: crypto.randomUUID(),
            name: item.name,
            quantity: 1,
            price: singleItemPrice,
            isLikelyShared: item.isLikelyShared,
          });
        }
      } else {
        expandedItems.push({
          ...item,
          id: crypto.randomUUID(),
        });
      }
    });

    const newItems = expandedItems.map(item => {
      const { isLikelyShared, ...rest } = item;
      return {
        ...rest,
        payers: [],
        isShared: isLikelyShared,
      };
    });

    setItems(newItems);
    setTax(Math.round(data.tax));
    setTip(Math.round(data.tip));
  };
  
  const handleAddPayer = (name: string) => {
    if (name && !payers.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setPayers([...payers, { id: crypto.randomUUID(), name }]);
    }
  };

  const handleRemovePayer = (id: string) => {
    setPayers(payers.filter(p => p.id !== id));
    setItems(items.map(item => ({
      ...item,
      payers: item.payers.filter(payerId => payerId !== id)
    })));
  };

  const handleTogglePayerForItem = (itemId: string, payerId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const payers = item.payers.includes(payerId)
          ? item.payers.filter(pId => pId !== payerId)
          : [...item.payers, payerId];
        return { ...item, payers, isShared: false }; // Assigning manually un-shares it
      }
      return item;
    }));
  };
  
  const handleToggleShared = (itemId: string) => {
    setItems(items.map(item => {
        if (item.id === itemId) {
            return { 
                ...item, 
                isShared: !item.isShared,
                // Always reset payers on toggle to ensure a clean state
                payers: [] 
            };
        }
        return item;
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* ReceiptUploader: mobile=1st, desktop=top-left */}
      <div className="lg:col-span-3 lg:row-start-1">
        <ReceiptUploader onReceiptParsed={handleReceiptParsed} hasItems={items.length > 0} />
      </div>

      {/* PayerManager: mobile=2nd, desktop=top-right */}
      <div className="lg:col-span-2 lg:row-start-1">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Who's Paying?</h2>
            <PayerManager payers={payers} onAddPayer={handleAddPayer} onRemovePayer={handleRemovePayer} />
        </div>
      </div>

      {/* ItemList: mobile=3rd, desktop=bottom-left */}
      <div className="lg:col-span-3 lg:row-start-2">
        {items.length > 0 && (
          <ItemList 
            items={items} 
            payers={payers} 
            onTogglePayer={handleTogglePayerForItem}
            onToggleShared={handleToggleShared}
          />
        )}
      </div>
      
      {/* Summary: mobile=4th, desktop=bottom-right */}
      <div className="lg:col-span-2 lg:row-start-2">
        {items.length > 0 && (
            <div className="sticky top-28">
                <Summary items={items} payers={payers} tip={tip} />
            </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCalculator;