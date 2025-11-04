import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import PaymentCalculator from './components/PaymentCalculator';
import { Payment } from './types';
import { BackIcon, EditIcon, SaveIcon, MenuIcon, TrashIcon, CheckIcon } from './components/icons';
import { db, deleteReceiptImage } from './services/firebaseConfig';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

function App() {
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [activePayment, setActivePayment] = useState<Payment | null>(null);
  const [draftPayment, setDraftPayment] = useState<Payment | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // State for edit mode
  const [showMenu, setShowMenu] = useState(false); // State for menu visibility

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#') && hash.length > 1) {
        setPaymentId(hash.substring(1));
      } else {
        setPaymentId(null);
        setIsEditMode(false); // Exit edit mode when going home
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
      setIsEditMode(true); // Start in edit mode for new payments
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

  const updatePayment = async (payment: Payment) => {
    await setDoc(doc(db, 'payments', payment.id), payment);
    setIsEditMode(false);
    setDraftPayment(null);
  };

  const handleDeletePayment = async () => {
    if (activePayment && window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      try {
        if (activePayment.receiptImageUrl) {
          await deleteReceiptImage(activePayment.receiptImageUrl);
        }
        await deleteDoc(doc(db, 'payments', activePayment.id));
        window.location.hash = ''; // Go back to home page
      } catch (error) {
        console.error('Error deleting payment: ', error);
        alert('Failed to delete payment.');
      }
    }
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
          {paymentId && !loadingPayment && activePayment && (
            <div className='flex items-center gap-4'>
              <div className='text-slate-400 text-sm whitespace-nowrap'>
                {/* Save status can be displayed here if needed */}
              </div>
              {!isEditMode ? (
                <div className='relative'>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className='p-2 rounded-full hover:bg-slate-700 transition-colors text-white'
                    aria-label='Payment options'
                  >
                    <MenuIcon className='w-6 h-6' />
                  </button>
                  {showMenu && (
                    <div className='absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 z-10'>
                      <button
                        onClick={() => { setIsEditMode(true); setShowMenu(false); }}
                        className='flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700'
                      >
                        <EditIcon className='w-5 h-5' /> Edit Payment
                      </button>
                      <button
                        onClick={handleDeletePayment}
                        className='flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700'
                      >
                        <TrashIcon className='w-5 h-5' /> Delete Payment
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => updatePayment(draftPayment)}
                  className='p-2 rounded-full not-disabled:hover:bg-slate-700 transition-colors text-white disabled:text-opacity-20'
                  aria-label='Save changes'
                  disabled={!draftPayment}
                >
                  <CheckIcon className='w-6 h-6' />
                </button>
              )}
            </div>
          )}
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
              activePayment && <PaymentCalculator
                payment={activePayment}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                setDraftPayment={setDraftPayment} />
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
