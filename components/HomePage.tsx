
import React from 'react';
import { Payment } from '../types';

interface HomePageProps {
  onNewPayment: () => void;
  onSelectPayment: (payment: Payment) => void;
}

const MOCK_PAYMENTS: Payment[] = [];

const HomePage: React.FC<HomePageProps> = ({ onNewPayment, onSelectPayment }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Welcome Back!</h2>
        <p className="text-slate-400 mt-2">Create a new payment or view your past splits.</p>
      </div>
      
      <button
        onClick={onNewPayment}
        className="w-full md:w-auto px-6 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300/50 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        <span>Create New Payment</span>
      </button>

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-white border-b border-slate-700 pb-2">Recent Payments</h3>
        {MOCK_PAYMENTS.length > 0 ? (
          <ul className="space-y-4">
            {MOCK_PAYMENTS.map((payment) => (
              <li
                key={payment.id}
                onClick={() => onSelectPayment(payment)}
                className="bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-700/70 border border-transparent hover:border-cyan-500 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg text-white">{payment.title}</p>
                    <p className="text-sm text-slate-400">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                     <p className="font-bold text-xl text-cyan-400">₩{(payment.items.reduce((acc, i) => acc + i.price, 0) + payment.tax + payment.tip).toLocaleString()}</p>
                    <p className="text-sm text-slate-400">{payment.payers.length} People</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">No recent payments. Create one to get started!</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
