import React from 'react';
import { Item, Payer } from '../types';
import { UsersIcon } from './icons';

interface ItemListProps {
  items: Item[];
  payers: Payer[];
  onTogglePayer: (itemId: string, payerId: string) => void;
  onToggleShared: (itemId: string) => void;
  isEditMode: boolean;
}

const ItemRow: React.FC<{ item: Item; payers: Payer[]; onTogglePayer: (itemId: string, payerId: string) => void; onToggleShared: (itemId: string) => void; isEditMode: boolean; }> = ({ item, payers, onTogglePayer, onToggleShared, isEditMode }) => {
  const getInitials = (name: string) => name.substring(0, 1).toUpperCase();
  const COLORS = ['bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-white">{item.name}</p>
        </div>
        <p className="font-mono text-lg font-medium text-white">₩{item.price.toLocaleString()}</p>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-700">
        <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-300">Paid by:</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
           <button
                onClick={() => isEditMode && onToggleShared(item.id)}
                title="Toggle Shared Item"
                disabled={!isEditMode}
                className={`h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-200 px-3 gap-1.5
                    ${item.isShared ? `bg-cyan-500 border-transparent text-white` : 'bg-slate-600 border-slate-600 hover:border-slate-400 text-slate-300'}
                    ${!isEditMode && 'opacity-50 cursor-not-allowed'}
                `}
            >
                <UsersIcon className="w-4 h-4" />
                <span>Shared</span>
            </button>
          
          {!item.isShared && payers.map((payer, index) => {
            const isSelected = item.payers.includes(payer.id);
            return (
              <button
                key={payer.id}
                onClick={() => isEditMode && onTogglePayer(item.id, payer.id)}
                title={payer.name}
                disabled={!isEditMode}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm border-2 transition-all duration-200
                  ${isSelected ? `${COLORS[index % COLORS.length]} border-transparent` : 'bg-slate-600 border-slate-600 hover:border-slate-400'}
                  ${!isEditMode && 'opacity-50 cursor-not-allowed'}
                `}
              >
                {getInitials(payer.name)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


const ItemList: React.FC<ItemListProps> = ({ items, payers, onTogglePayer, onToggleShared, isEditMode }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Itemized List</h2>
      <div className="space-y-3">
        {items.map(item => (
          <ItemRow key={item.id} item={item} payers={payers} onTogglePayer={onTogglePayer} onToggleShared={onToggleShared} isEditMode={isEditMode}/>
        ))}
      </div>
    </div>
  );
};

export default ItemList;