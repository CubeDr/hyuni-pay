import { useState, useEffect } from 'react';
import { Item, Payer, Payment, ReceiptData } from '../types';
import ItemList from './ItemList';
import PayerManager from './PayerManager';
import ReceiptUploader from './ReceiptUploader';
import Summary from './Summary';

interface PaymentCalculatorProps {
  payment: Payment;
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
  setDraftPayment: (draftPayment: Payment) => void;
}

function PaymentCalculator({ payment: initialPayment, isEditMode, setDraftPayment }: PaymentCalculatorProps) {
  const [title, setTitle] = useState<string>(initialPayment.title);
  const [items, setItems] = useState<Item[]>(initialPayment.items);
  const [payers, setPayers] = useState<Payer[]>(initialPayment.payers);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | undefined>(initialPayment.receiptImageUrl);

  useEffect(() => {
    if (!isEditMode) return;

    const draftPayment = {
      ...initialPayment,
      title,
      items,
      payers,
      receiptImageUrl,
    };

    if (JSON.stringify(initialPayment) !== JSON.stringify(draftPayment)) {
      setDraftPayment(draftPayment);
    } else {
      setDraftPayment(null);
    }

  }, [isEditMode, initialPayment, title, items, payers, receiptImageUrl]);

  const handleReceiptParsed = (data: ReceiptData, imageUrl: string) => {
    setReceiptImageUrl(imageUrl);
    if (data.shopName) {
      setTitle(data.shopName);
    }
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
        {isEditMode ? (
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='text-3xl font-bold text-white bg-transparent border-0 border-b-2 border-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-0 p-2 -ml-2 w-full'
            placeholder='Enter payment title'
          />
        ) : (
          <h1 className='text-3xl font-bold text-white p-2 -ml-2'>{title}</h1>
        )}
      </div>

      {isEditMode ? (
        <div className='lg:col-span-3 lg:row-start-2'>
          <ReceiptUploader onReceiptParsed={handleReceiptParsed} hasItems={items.length > 0} initialReceiptImageUrl={receiptImageUrl} />
        </div>
      ) : (
        receiptImageUrl && (
          <div className='lg:col-span-3 lg:row-start-2'>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex justify-center items-center">
              <img src={receiptImageUrl} alt="Receipt" className="max-h-96 rounded-md" />
            </div>
          </div>
        )
      )}

      {isEditMode && (
        <div className='lg:col-span-2 lg:row-start-2'>
          <div className='bg-slate-800 rounded-xl p-6 border border-slate-700'>
            <h2 className='text-2xl font-bold mb-4'>Who's Paying?</h2>
            <PayerManager payers={payers} onAddPayer={handleAddPayer} onRemovePayer={handleRemovePayer} />
          </div>
        </div>
      )}

      <div className='lg:col-span-3 lg:row-start-3'>
        {items.length > 0 && (
          <ItemList
            items={items}
            payers={payers}
            onTogglePayer={handleTogglePayerForItem}
            onToggleShared={handleToggleShared}
            isEditMode={isEditMode}
          />
        )}
      </div>

      <div className='lg:col-span-2 lg:row-start-3'>
        {items.length > 0 && (
          <div className='sticky top-28'>
            <Summary id={initialPayment.id} items={items} payers={payers} />
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentCalculator;
