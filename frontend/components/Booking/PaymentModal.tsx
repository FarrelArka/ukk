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
type PaymentStep = 'confirmation' | 'qris_payment' | 'success';

const PaymentModal = ({ isOpen, onClose, bookingDetails, onPaymentComplete, propertyImage, bookingId }: PaymentModalProps) => {
    const [step, setStep] = useState<PaymentStep>('confirmation');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [qrUrl, setQrUrl] = useState<string>('');

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setStep('confirmation');
            setSelectedMethod(null);
            setIsProcessing(false);
            setTimeLeft(60);
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
                    payment_type: selectedMethod // 'qris' or 'bank'
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
            } else {
                setStep('success'); // Untuk bank transfer kita set success untuk simulasi / lanjutkan alur
            }
        } catch (error) {
            setIsProcessing(false);
            alert("Error processing payment");
        }
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
                step === 'qris_payment' ? "max-w-md" : "max-w-2xl"
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

                    {step === 'qris_payment' ? (
                        /* QRIS Payment Screen */
                        <div className="flex flex-col items-center text-center space-y-6">
                            {/* Logo */}
                            <div className="w-16 h-16 relative">
                                <Image
                                    src="/images/header/logo.png"
                                    alt="Manembah Logo"
                                    fill
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium tracking-widest text-black/60 dark:text-white/60">VILLA & GUEST HOUSE</p>
                                <h3 className="text-4xl font-bold tracking-tighter text-black dark:text-white">MANEMBAH</h3>
                            </div>

                            <div className="py-4">
                                <h4 className="text-xl font-bold tracking-wider text-black dark:text-white mb-4">SCAN TO BOOK</h4>
                                {/* QR Code Image */}
                                <div className="w-64 h-64 bg-white p-4 border border-black/5 mx-auto relative group overflow-hidden">
                                    <Image
                                        src={qrUrl || "/images/payment/qris.png"}
                                        alt="QRIS Code"
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        className=""
                                    />
                                    {/* Scanning line animation */}
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
                    ) : (
                        /* Original Content (Confirmation or Success) */
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
