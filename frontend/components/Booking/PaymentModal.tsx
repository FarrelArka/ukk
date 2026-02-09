'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    category: string;
    type: string;
    checkIn?: string;
    checkOut?: string;
    price: string;
    guests?: number;
    totalPrice?: string;
  };
  onPaymentComplete: () => void;
  propertyImage?: string;
}

type PaymentMethod = 'qris' | 'bank' | 'card' | null;

const PaymentModal = ({ isOpen, onClose, bookingDetails, onPaymentComplete, propertyImage }: PaymentModalProps) => {
  const [step, setStep] = useState<'confirmation' | 'success'>('confirmation');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('confirmation');
      setSelectedMethod(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProceed = () => {
    if (!selectedMethod) return;
    
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
    }, 2000);
  };

  const handleClose = () => {
    if (step === 'success') {
      onPaymentComplete();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 ">
      <div className="bg-white dark:bg-dark w-full max-w-2xl rounded-[18px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative p-6 text-center border-b border-black/10 dark:border-white/10">
            {step === 'confirmation' ? (
                <>
                    <h2 className="text-3xl font-semibold text-black dark:text-white mb-2">Booking Confirmation</h2>
                    <p className="text-black/50 dark:text-white/50 text-sm">Your booking is almost complete. Please proceed with the payment.</p>
                </>
            ) : (
                <div className="pt-6">
                     <div className="w-20 h-20 bg-[#008000] rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon icon="ph:check-bold" className="text-white text-4xl" />
                     </div>
                     <h2 className="text-3xl font-semibold text-black dark:text-white mb-2">Payment Successful!</h2>
                     <p className="text-black/50 dark:text-white/50 text-sm max-w-sm mx-auto">
                        Thank you, your payment has been successfully completed. Here are your booking details :
                     </p>
                </div>
            )}
            
            <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
                <Icon icon="ph:x" className="text-2xl text-black/50 dark:text-white/50" />
            </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
            
            <h3 className="text-2xl font-medium text-black dark:text-white mb-6">Booking Details</h3>
            <hr className="border-black/10 dark:border-white/10 mb-6" />

            {/* Booking Summary */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
                {step === 'success' && (
                     <div className="w-full md:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden relative">
                         <Image 
                            src={propertyImage || "/images/properties/property4/mainvilla1.jpg"}
                            alt="Property"
                            layout="fill"
                            objectFit="cover"
                         />
                     </div>
                )}
                
                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-[100px_auto] gap-4 items-center">
                        <span className="text-black dark:text-white text-lg">Property</span>
                        <div className="flex items-center gap-4">
                            <span className="text-black dark:text-white">:</span>
                            <span className="text-black dark:text-white font-medium">{bookingDetails.category || '-'}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-[100px_auto] gap-4 items-center">
                        <span className="text-black dark:text-white text-lg">Type</span>
                        <div className="flex items-center gap-4">
                            <span className="text-black dark:text-white">:</span>
                            <span className="text-black dark:text-white font-medium">{bookingDetails.type || '-'}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-[100px_auto] gap-4 items-center">
                        <span className="text-black dark:text-white text-lg">Check-in</span>
                         <div className="flex items-center gap-4">
                            <span className="text-black dark:text-white">:</span>
                            <span className="text-black dark:text-white font-medium">{bookingDetails.checkIn || '-'}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-[100px_auto] gap-4 items-center">
                         <span className="text-black dark:text-white text-lg">Check-out</span>
                         <div className="flex items-center gap-4">
                            <span className="text-black dark:text-white">:</span>
                            <span className="text-black dark:text-white font-medium">{bookingDetails.checkOut || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-black/10 dark:border-white/10 mb-6" />

            <div className="flex items-center justify-between mb-8">
                {step === 'success' ? (
                     <div className="flex items-center gap-2 text-[#008000] font-medium text-lg">
                        <div className="w-6 h-6 rounded-full bg-[#008000] flex items-center justify-center">
                            <Icon icon="ph:check-bold" className="text-white text-xs" />
                        </div>
                        Paid
                     </div>
                ) : <div></div>}
                
                <div className="text-right">
                    <span className="text-black dark:text-white text-lg font-semibold">
                        Total Payment : IDR {bookingDetails.totalPrice || bookingDetails.price || '0'}
                    </span>
                </div>
            </div>
            
            <hr className="border-black/10 dark:border-white/10" />

            {step === 'confirmation' && (
                <>
                    <h3 className="text-lg font-medium text-black dark:text-white mb-4">Select Payment Method</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {/* QRIS */}
                        <div 
                            className={cn(
                                "border rounded-2xl p-4 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 hover:border-primary/50 relative overflow-hidden h-48",
                                selectedMethod === 'qris' ? "border-primary ring-1 ring-primary bg-primary/5" : "border-black/10 dark:border-white/10"
                            )}
                            onClick={() => setSelectedMethod('qris')}
                        >
                             <div className="relative w-24 h-24">
                                <Image 
                                    src="/images/payment/qris.png" 
                                    alt="QRIS" 
                                    layout="fill"
                                    objectFit="contain"
                                />
                             </div>
                             <div className="text-center">
                                 <p className="font-medium text-black dark:text-white">Scan QR Code</p>
                                 <p className="text-xs text-black/50 dark:text-white/50">QRIS Payment</p>
                             </div>
                        </div>

                        {/* Bank Transfer */}
                        <div 
                            className={cn(
                                "border rounded-2xl p-4 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 hover:border-primary/50 h-48",
                                selectedMethod === 'bank' ? "border-primary ring-1 ring-primary bg-primary/5" : "border-black/10 dark:border-white/10"
                            )}
                            onClick={() => setSelectedMethod('bank')}
                        >
                             <div className="flex items-center justify-center p-2">
                                <Image 
                                    src="/images/payment/bank.png" 
                                    alt="Bank Transfer" 
                                    width={160}
                                    height={40}
                                    className="object-contain"
                                />
                             </div>
                             <div className="text-center">
                                 <p className="font-medium text-black dark:text-white">Bank Transfer</p>
                                 <p className="text-xs text-black/50 dark:text-white/50">Manual Bank Transfer</p>
                             </div>
                        </div>

                        {/* Credit Card */}
                         <div 
                            className={cn(
                                "border rounded-2xl p-4 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 hover:border-primary/50 h-48",
                                selectedMethod === 'card' ? "border-primary ring-1 ring-primary bg-primary/5" : "border-black/10 dark:border-white/10"
                            )}
                            onClick={() => setSelectedMethod('card')}
                        >
                             <div className="flex items-center justify-center p-2">
                                <Image 
                                    src="/images/payment/card.png" 
                                    alt="Credit Card" 
                                    width={120}
                                    height={40}
                                    className="object-contain"
                                />
                             </div>
                             <div className="text-center">
                                 <p className="font-medium text-black dark:text-white">Credit / Debit Card</p>
                                 <p className="text-xs text-black/50 dark:text-white/50">Pay with Card</p>
                             </div>
                        </div>
                    </div>
                </>
            )}

            {step === 'confirmation' && (
                <button 
                    onClick={handleProceed}
                    disabled={!selectedMethod || isProcessing}
                    className="w-full py-4 bg-[#B0914F] text-white rounded-full font-semibold text-lg hover:bg-[#8F7336] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <Icon icon="ph:spinner" className="animate-spin text-2xl" />
                            Processing...
                        </>
                    ) : (
                        'Proceed to Payment'
                    )}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
