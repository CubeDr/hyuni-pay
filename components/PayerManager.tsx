
import React, { useState } from 'react';
import { Payer } from '../types';
import { UserPlusIcon, TrashIcon } from './icons';

interface PayerManagerProps {
  payers: Payer[];
  onAddPayer: (name: string) => void;
  onRemovePayer: (id: string) => void;
}

const PayerManager: React.FC<PayerManagerProps> = ({ payers, onAddPayer, onRemovePayer }) => {
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    onAddPayer(newName.trim());
    setNewName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const COLORS = ['bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a name..."
          className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          onClick={handleAdd}
          className="bg-slate-600 hover:bg-slate-500 text-white font-bold p-2 rounded-md transition-colors"
          aria-label="Add Payer"
        >
          <UserPlusIcon className="w-6 h-6" />
        </button>
      </div>
      <ul className="space-y-2">
        {payers.map((payer, index) => (
          <li key={payer.id} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${COLORS[index % COLORS.length]}`}>
                {getInitials(payer.name)}
              </div>
              <span className="font-medium">{payer.name}</span>
            </div>
            <button 
              onClick={() => onRemovePayer(payer.id)} 
              className="text-slate-400 hover:text-red-400 p-1 rounded-full transition-colors"
              aria-label={`Remove ${payer.name}`}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PayerManager;
