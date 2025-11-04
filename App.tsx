import React, { useState } from 'react';
import HomePage from './components/HomePage';
import PaymentCalculator from './components/PaymentCalculator';
import { Payment } from './types';
import { BackIcon } from './components/icons';
import { db } from './services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

function App() {
  const [activePayment, setActivePayment] = useState<Payment | null>(null);

  const handleCreateNewPayment = async () => {
    const newPayment: Payment = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      title: 'New Payment',
      date: new Date().toISOString(),
      items: [],
      payers: [{ id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), name: '현이' }],
    };

    try {
      await setDoc(doc(db, 'payments', newPayment.id), newPayment);
      setActivePayment(newPayment);
    } catch (error) {
      console.error('Error creating new payment: ', error);
    }
  };

  const handleSelectPayment = (payment: Payment) => {
    setActivePayment(payment);
  };

  const handleGoHome = () => {
    setActivePayment(null);
  };

  return (
    <div className='min-h-screen font-sans'>
      <header className='py-4 px-6 md:px-8 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-700/50'>
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            {activePayment && (
              <button
                onClick={handleGoHome}
                className='p-2 rounded-full hover:bg-slate-700 transition-colors'
                aria-label='Go back to homepage'
              >
                <BackIcon className='w-6 h-6' />
              </button>
            )}
            <h1 className='text-2xl font-bold tracking-tight text-white'>
              Hyuni
              <span className='text-cyan-400'> Pay</span>
            </h1>
          </div>
        </div>
      </header>
      <main className='p-4 md:p-8'>
        <div className='max-w-7xl mx-auto'>
          {!activePayment ? (
            <HomePage onNewPayment={handleCreateNewPayment} onSelectPayment={handleSelectPayment} />
          ) : (
            <PaymentCalculator payment={activePayment} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
