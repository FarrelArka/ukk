'use client';

import React, { useState } from 'react';
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
    bookingId?: number | null;
}

type PaymentMethod = 'qris' | 'bank' | 'card' | null;
type PaymentStep = 'confirmation' | 'qris_payment' | 'bank_transfer' | 'card_payment' | 'success';

const PaymentModal = ({ isOpen, onClose, bookingDetails, onPaymentComplete, propertyImage, bookingId }: PaymentModalProps) => {
    const [step, setStep] = useState<PaymentStep>('confirmation');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [qrUrl, setQrUrl] = useState<string>('');
    const [vaNumber, setVaNumber] = useState<string>('');
    const [copied, setCopied] = useState(false);

    // Card details simulation
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setStep('confirmation');
            setSelectedMethod(null);
            setIsProcessing(false);
            setTimeLeft(60);
            setVaNumber('');
            setCopied(false);
        }
    }

    // Timer for QRIS payment
    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if (step === 'qris_payment' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (step === 'qris_payment' && timeLeft === 0) {
            setStep('success');
        }
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    if (!isOpen) return null;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleProceed = async () => {
        if (!selectedMethod || !bookingId) return;

        setIsProcessing(true);
        try {
            const rawPriceStr = bookingDetails.totalPrice || bookingDetails.price || "0";
            const rawAmount = parseFloat(rawPriceStr.replace(/[^0-9.-]+/g, "")) || 0;

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050"}/api/payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    booking_id: bookingId,
                    amount: rawAmount,
                    payment_type: selectedMethod === 'bank' ? 'bank_transfer' : selectedMethod
                })
            });

            const data = await res.json();
            setIsProcessing(false);

            if (!res.ok) {
                alert("Payment error: " + (data.error || "Unknown"));
                return;
            }

            if (selectedMethod === 'qris') {
                if (data.qr_url) {
                    setQrUrl(data.qr_url);
                }
                setStep('qris_payment');
            } else if (selectedMethod === 'bank') {
                setVaNumber(data.va_number || '123456789012');
                setStep('bank_transfer');
            } else if (selectedMethod === 'card') {
                setStep('card_payment');
            }
        } catch (error) {
            setIsProcessing(false);
            alert("Error processing payment");
        }
    };

    const handleConfirmSimulation = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setStep('success');
        }, 1500);
    };

    const handleClose = () => {
        if (step === 'success') {
            onPaymentComplete();
        } else {
            setTimeout(() => {
                onClose();
            }, 0);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 ">
            <div className={cn(
                "bg-white dark:bg-dark w-full rounded-[18px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]",
                (step === 'qris_payment' || step === 'bank_transfer' || step === 'card_payment') ? "max-w-md" : "max-w-2xl"
            )}>

                {/* Header */}
                <div className="relative p-6 text-center border-b border-black/10 dark:border-white/10">
                    {step === 'confirmation' ? (
                        <>
                            <h2 className="text-3xl font-semibold text-black dark:text-white mb-2">Booking Confirmation</h2>
                            <p className="text-black/50 dark:text-white/50 text-sm">Your booking is almost complete. Please proceed with the payment.</p>
                        </>
                    ) : step === 'qris_payment' ? (
                        <>
                            <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">QRIS Payment</h2>
                            <p className="text-black/50 dark:text-white/50 text-sm">Please scan the code within <span className="text-primary font-bold">{timeLeft}s</span></p>
                        </>
                    ) : step === 'bank_transfer' ? (
                        <>
                            <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Bank Transfer</h2>
                            <p className="text-black/50 dark:text-white/50 text-sm">Transfer details for your booking</p>
                        </>
                    ) : step === 'card_payment' ? (
                        <>
                            <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Card Payment</h2>
                            <p className="text-black/50 dark:text-white/50 text-sm">Enter your card details</p>
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

                    {step === 'qris_payment' && (
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-16 h-16 relative">
                                <Image src="/images/header/logo.png" alt="Manembah Logo" fill style={{ objectFit: 'contain' }} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium tracking-widest text-black/60 dark:text-white/60">VILLA & GUEST HOUSE</p>
                                <h3 className="text-4xl font-bold tracking-tighter text-black dark:text-white">MANEMBAH</h3>
                            </div>
                            <div className="py-4">
                                <h4 className="text-xl font-bold tracking-wider text-black dark:text-white mb-4">SCAN TO BOOK</h4>
                                <div className="w-64 h-64 bg-white p-4 border border-black/5 mx-auto relative group overflow-hidden">
                                    <Image src={qrUrl || "/images/payment/qris.png"} alt="QRIS Code" fill style={{ objectFit: 'contain' }} />
                                    <div className="absolute top-0 left-0 w-full h-1 bg-primary/60 shadow-[0_0_15px_rgba(176,145,79,0.8)] animate-scan z-10" />
                                </div>
                            </div>
                            <div className="space-y-3 pt-4">
                                <div className="flex items-center gap-3 text-black/70 dark:text-white/70">
                                    <Icon icon="ph:instagram-logo-bold" className="text-xl" />
                                    <span className="font-medium">@villamanembah</span>
                                </div>
                                <div className="flex items-center gap-3 text-black/70 dark:text-white/70">
                                    <Icon icon="ph:phone-bold" className="text-xl" />
                                    <span className="font-medium">0812-345-6789</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'bank_transfer' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-black/5">
                                <div className="flex items-center gap-4">
                                    <Image src="/images/payment/bank.png" alt="BCA" width={80} height={30} className="object-contain" />
                                    <div>
                                        <p className="font-semibold text-black dark:text-white">Bank BCA</p>
                                        <p className="text-xs text-black/50 dark:text-white/50">Manembah Family Rest</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">VA</div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-black/50 dark:text-white/50">Virtual Account Number</p>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-black/5">
                                    <span className="text-xl font-bold tracking-widest text-black dark:text-white">{vaNumber}</span>
                                    <button 
                                        onClick={() => handleCopy(vaNumber)}
                                        className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary flex items-center gap-2"
                                    >
                                        <Icon icon={copied ? "ph:check-bold" : "ph:copy-bold"} className="text-xl" />
                                        <span className="text-xs font-bold uppercase">{copied ? 'Copied' : 'Copy'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-black/60 dark:text-white/60">Total Amount</span>
                                    <span className="font-bold text-black dark:text-white">IDR {bookingDetails.totalPrice || bookingDetails.price}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-semibold text-black dark:text-white">Payment Instructions:</p>
                                <ol className="text-sm text-black/60 dark:text-white/60 space-y-2 list-decimal pl-4">
                                    <li>Open your m-BCA or go to nearest ATM.</li>
                                    <li>Select <span className="font-medium">Transfer</span> &gt; <span className="font-medium">BCA Virtual Account</span>.</li>
                                    <li>Enter VA Number above.</li>
                                    <li>Confirm your transaction details and PIN.</li>
                                </ol>
                            </div>

                            <button
                                onClick={handleConfirmSimulation}
                                disabled={isProcessing}
                                className="w-full py-4 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Icon icon="ph:spinner" className="animate-spin text-xl" /> : "I've Paid"}
                            </button>
                        </div>
                    )}

                    {step === 'card_payment' && (
                        <div className="space-y-6">
                            {/* Card Display */}
                            <div className="relative w-full aspect-[1.6/1] bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-6 text-white overflow-hidden shadow-xl">
                                <div className="absolute top-0 right-0 p-6">
                                    <Icon icon="logos:visa" className="text-4xl" />
                                </div>
                                <div className="h-full flex flex-col justify-between relative z-10">
                                    <div className="w-12 h-10 bg-yellow-400/80 rounded-lg" />
                                    <div className="space-y-4">
                                        <p className="text-xl tracking-[0.2em] font-mono">
                                            {cardData.number || '•••• •••• •••• ••••'}
                                        </p>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] uppercase opacity-60">Card Holder</p>
                                                <p className="text-sm font-medium uppercase tracking-wider">{cardData.name || 'Your Name'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] uppercase opacity-60">Expires</p>
                                                <p className="text-sm font-medium">{cardData.expiry || 'MM/YY'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                            </div>

                            {/* Form Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-black/50 dark:text-white/50 mb-1.5 block">CARD NUMBER</label>
                                    <input 
                                        type="text" 
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 dark:bg-white/5 outline-none focus:border-primary transition-colors font-mono"
                                        onChange={(e) => setCardData({...cardData, number: e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)})}
                                        value={cardData.number}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-black/50 dark:text-white/50 mb-1.5 block">EXPIRY DATE</label>
                                        <input 
                                            type="text" 
                                            placeholder="MM/YY"
                                            className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 dark:bg-white/5 outline-none focus:border-primary transition-colors font-mono"
                                            onChange={(e) => setCardData({...cardData, expiry: e.target.value.replace(/[^\d/]/g, '').slice(0, 5)})}
                                            value={cardData.expiry}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-black/50 dark:text-white/50 mb-1.5 block">CVC/CVV</label>
                                        <input 
                                            type="password" 
                                            placeholder="•••"
                                            className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 dark:bg-white/5 outline-none focus:border-primary transition-colors font-mono"
                                            onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                                            value={cardData.cvv}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-black/50 dark:text-white/50 mb-1.5 block">CARDHOLDER NAME</label>
                                    <input 
                                        type="text" 
                                        placeholder="Full Name"
                                        className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 dark:bg-white/5 outline-none focus:border-primary transition-colors uppercase"
                                        onChange={(e) => setCardData({...cardData, name: e.target.value})}
                                        value={cardData.name}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleConfirmSimulation}
                                disabled={isProcessing || !cardData.number || !cardData.cvv}
                                className="w-full py-4 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Icon icon="ph:spinner" className="animate-spin text-xl" /> : "Pay Now"}
                            </button>
                        </div>
                    )}

                    {step === 'confirmation' || step === 'success' ? (
                        <>
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
                                            unoptimized={true}
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
                                    <h3 className="text-lg font-medium text-black dark:text-white my-6">Select Payment Method</h3>
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
                                                <Image src="/images/payment/qris.png" alt="QRIS" layout="fill" objectFit="contain" unoptimized={true} />
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
                                                <Image src="/images/payment/bank.png" alt="Bank Transfer" width={160} height={40} className="object-contain" unoptimized={true} />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-medium text-black dark:text-white">Bank Transfer</p>
                                                <p className="text-xs text-black/50 dark:text-white/50">BCA Virtual Account</p>
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
                                                <Image src="/images/payment/card.png" alt="Credit Card" width={120} height={40} className="object-contain" unoptimized={true} />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-medium text-black dark:text-white">Credit / Debit Card</p>
                                                <p className="text-xs text-black/50 dark:text-white/50">Visa / Mastercard</p>
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
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
