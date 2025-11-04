import React, { useState, useEffect, useCallback } from 'react';
import { Payment, Item, Payer, ReceiptData } from '../types';
import ReceiptUploader from './ReceiptUploader';
import PayerManager from './PayerManager';
import ItemList from './ItemList';
import Summary from './Summary';
import { db } from '../services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => void;
}

interface PaymentCalculatorProps {
  payment: Payment;
}

function PaymentCalculator({ payment: initialPayment }: PaymentCalculatorProps) {
  const [title, setTitle] = useState<string>(initialPayment.title);
  const [items, setItems] = useState<Item[]>(initialPayment.items);
  const [payers, setPayers] = useState<Payer[]>(initialPayment.payers);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('All changes saved');

  const debouncedSave = useCallback(
    debounce(async (paymentData: Payment) => {
      setIsSaving(true);
      setSaveStatus('Saving...');
      try {
        await setDoc(doc(db, 'payments', paymentData.id), paymentData);
        setSaveStatus('All changes saved');
      } catch (error) {
        console.error('Error saving payment: ', error);
        setSaveStatus('Save failed');
      } finally {
        setIsSaving(false);
      }
    }, 1500),
    [initialPayment.id]
  );

  useEffect(() => {
    const hasChanged =
      title !== initialPayment.title ||
      items !== initialPayment.items ||
      payers !== initialPayment.payers;

    if (hasChanged) {
      setSaveStatus('Unsaved changes');
      const currentPayment: Payment = {
        id: initialPayment.id,
        date: initialPayment.date,
        title,
        items,
        payers,
      };
      debouncedSave(currentPayment);
    }
  }, [title, items, payers, initialPayment, debouncedSave]);

  const handleReceiptParsed = (data: ReceiptData) => {
    const expandedItems: ({ id: string; name: string; quantity: number; price: number; isLikelyShared: boolean; })[] = [];
    data.items.forEach(item => {
      if (item.quantity > 1) {
        const singleItemPrice = Math.round(item.price / item.quantity);
        for (let i = 0; i < item.quantity; i++) {
          expandedItems.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            name: item.name,
            quantity: 1,
            price: singleItemPrice,
            isLikelyShared: item.isLikelyShared,
          });
        }
      } else {
        expandedItems.push({
          ...item,
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
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

    if (title === 'New Payment' && newItems.length > 0) {
      setTitle(newItems[0].name);
    }
  };

  const handleAddPayer = (name: string) => {
    if (name && !payers.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setPayers([...payers, { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), name }]);
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
        return { ...item, payers, isShared: false };
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
          payers: []
        };
      }
      return item;
    }));
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-5 gap-8'>
      <div className='lg:col-span-5 flex justify-between items-center'>
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className='text-3xl font-bold text-white bg-transparent border-0 border-b-2 border-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-0 p-2 -ml-2 w-full'
          placeholder='Enter payment title'
        />
        <div className='text-slate-400 text-sm whitespace-nowrap pl-4'>
          {isSaving ? 'Saving...' : saveStatus}
        </div>
      </div>

      <div className='lg:col-span-3 lg:row-start-2'>
        <ReceiptUploader onReceiptParsed={handleReceiptParsed} hasItems={items.length > 0} />
      </div>

      <div className='lg:col-span-2 lg:row-start-2'>
        <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
          <h2 className='text-2xl font-bold mb-4'>Who's Paying?</h2>
          <PayerManager payers={payers} onAddPayer={handleAddPayer} onRemovePayer={handleRemovePayer} />
        </div>
      </div>

      <div className='lg:col-span-3 lg:row-start-3'>
        {items.length > 0 && (
          <ItemList
            items={items}
            payers={payers}
            onTogglePayer={handleTogglePayerForItem}
            onToggleShared={handleToggleShared}
          />
        )}
      </div>

      <div className='lg:col-span-2 lg:row-start-3'>
        {items.length > 0 && (
          <div className='sticky top-28'>
            <Summary items={items} payers={payers} />
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentCalculator;
