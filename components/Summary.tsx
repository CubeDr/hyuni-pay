import React, { useMemo, useState } from 'react';
import { Item, Payer } from '../types';
import { CopyIcon, CheckIcon } from './icons';

interface SummaryProps {
  items: Item[];
  payers: Payer[];
  tip: number;
}

interface PayerSummary {
  payerId: string;
  name: string;
  totalAmount: number;
  individualItems: Item[];
}

const Summary: React.FC<SummaryProps> = ({ items, payers, tip }) => {
  const [copied, setCopied] = useState(false);

  const summaryData = useMemo(() => {
    if (payers.length === 0) return { totals: [], sharedItems: [], perPersonSharedCost: 0 };

    const payerTotalsMap = new Map<string, { name: string; subtotal: number; individualItems: Item[] }>();
    payers.forEach(p => payerTotalsMap.set(p.id, { name: p.name, subtotal: 0, individualItems: [] }));

    const sharedItems = items.filter(item => item.isShared);
    const totalSharedCost = sharedItems.reduce((acc, item) => acc + item.price, 0);
    const perPersonSharedCost = payers.length > 0 ? totalSharedCost / payers.length : 0;
    
    payers.forEach(payer => {
        const data = payerTotalsMap.get(payer.id);
        if(data) {
            data.subtotal += perPersonSharedCost;
        }
    });

    const individualItems = items.filter(item => !item.isShared);
    individualItems.forEach(item => {
      if (item.payers.length > 0) {
        const share = item.price / item.payers.length;
        item.payers.forEach(payerId => {
          const data = payerTotalsMap.get(payerId);
          if (data) {
            data.subtotal += share;
            data.individualItems.push(item);
          }
        });
      }
    });
    
    const grandSubtotal = items.reduce((acc, item) => acc + item.price, 0);

    const totals: PayerSummary[] = payers.map(payer => {
      const data = payerTotalsMap.get(payer.id)!;
      const proportion = grandSubtotal > 0 ? data.subtotal / grandSubtotal : 1 / payers.length;
      const totalAmount = data.subtotal + (tip * proportion);
      
      return {
        payerId: payer.id,
        name: payer.name,
        totalAmount: Math.round(totalAmount),
        individualItems: data.individualItems
      };
    });

    return { totals, sharedItems, perPersonSharedCost: Math.round(perPersonSharedCost) };

  }, [items, payers, tip]);
  
  const grandTotal = items.reduce((acc, i) => acc + i.price, 0) + tip;

  const handleCopy = () => {
    let textToCopy = "Hyuni Pay Summary:\n\n";
    
    if (summaryData.sharedItems.length > 0) {
        textToCopy += `Shared Items (₩${summaryData.perPersonSharedCost.toLocaleString()} per person):\n`;
        textToCopy += `- ${summaryData.sharedItems.map(i => i.name).join(', ')}\n\n`;
    }

    summaryData.totals.forEach(t => {
      textToCopy += `${t.name}: ₩${t.totalAmount.toLocaleString()}\n`;
      if (t.individualItems.length > 0) {
        textToCopy += `  (Items: ${t.individualItems.map(i => i.name).join(', ')})\n`;
      }
    });
    
    if (tip > 0) {
      textToCopy += `\nTip: ₩${tip.toLocaleString()}\n`;
    }

    textToCopy += `\nTotal: ₩${grandTotal.toLocaleString()}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-2xl font-bold mb-4">Summary</h2>
      <div className="space-y-4">
        {/* Shared Items Row */}
        {summaryData.sharedItems.length > 0 && (
          <div className="pb-3 border-b border-slate-700">
            <div className="flex justify-between items-start text-lg">
              <div className="flex-1">
                <span className="font-medium text-slate-300">Shared Items</span>
                <p className="text-sm text-slate-400 mt-1">
                  {summaryData.sharedItems.map(i => i.name).join(', ')}
                </p>
              </div>
              <div className="text-right ml-4">
                 <span className="font-mono font-semibold text-white">₩{summaryData.perPersonSharedCost.toLocaleString()}</span>
                 <p className="text-xs text-slate-500">per person</p>
              </div>
            </div>
          </div>
        )}

        {/* Payer Rows */}
        {summaryData.totals.map(total => (
          <div key={total.payerId} className="flex justify-between items-start text-lg">
            <div className="flex-1">
              <span className="font-medium text-slate-300">{total.name}</span>
              {total.individualItems.length > 0 && (
                <p className="text-sm text-slate-400 mt-1">
                  {total.individualItems.map(i => i.name).join(', ')}
                </p>
              )}
            </div>
            <span className="font-mono font-semibold text-white ml-4">₩{total.totalAmount.toLocaleString()}</span>
          </div>
        ))}
        
        {tip > 0 && (
          <div className="pt-2 border-t border-slate-700 flex justify-between text-slate-400">
            <span>Tip</span>
            <span>₩{tip.toLocaleString()}</span>
          </div>
        )}
      </div>
      <hr className="border-slate-600 my-4" />
      <div className="flex justify-between items-center text-xl font-bold">
        <span className="text-cyan-400">Grand Total</span>
        <span className="text-cyan-400">₩{grandTotal.toLocaleString()}</span>
      </div>
      <button 
        onClick={handleCopy}
        className="w-full mt-6 bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-lg hover:bg-slate-600 flex items-center justify-center gap-2 transition-colors"
      >
        {copied ? <CheckIcon className="w-5 h-5 text-green-400"/> : <CopyIcon className="w-5 h-5" />}
        {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
      </button>
    </div>
  );
};

export default Summary;
