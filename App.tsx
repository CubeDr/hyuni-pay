import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import PaymentCalculator from './components/PaymentCalculator';
import { Payment } from './types';
import { BackIcon } from './components/icons';
import { db } from './services/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function App() {
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [activePayment, setActivePayment] = useState<Payment | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#') && hash.length > 1) {
        setPaymentId(hash.substring(1));
      } else {
        setPaymentId(null);
      }
    };

    handleHashChange(); // Set initial paymentId
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    const fetchPayment = async (id: string) => {
      setLoadingPayment(true);
      try {
        const paymentRef = doc(db, 'payments', id);
        const paymentSnap = await getDoc(paymentRef);
        if (paymentSnap.exists()) {
          setActivePayment(paymentSnap.data() as Payment);
        } else {
          console.log("No such document!");
          setActivePayment(null);
          window.location.hash = ''; // Go home if payment not found
        }
      } catch (error) {
        console.error('Error fetching payment: ', error);
        setActivePayment(null);
        window.location.hash = ''; // Go home on error
      } finally {
        setLoadingPayment(false);
      }
    };

    if (paymentId) {
      fetchPayment(paymentId);
    } else {
      setActivePayment(null);
    }
  }, [paymentId]);

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
      window.location.hash = `#/${newPayment.id}`;
    } catch (error) {
      console.error('Error creating new payment: ', error);
    }
  };

  const handleSelectPayment = (payment: Payment) => {
    window.location.hash = `#/${payment.id}`;
  };

  const handleGoHome = () => {
    window.location.hash = '';
  };

  return (
    <div className='min-h-screen font-sans'>
      <header className='py-4 px-6 md:px-8 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-700/50'>
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            {paymentId && (
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
          {loadingPayment ? (
            <div>Loading payment...</div>
          ) : (
            !paymentId ? (
              <HomePage onNewPayment={handleCreateNewPayment} onSelectPayment={handleSelectPayment} />
            ) : (
              activePayment && <PaymentCalculator payment={activePayment} />
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default App;