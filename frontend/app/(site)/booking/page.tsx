'use client';

import { Icon } from '@iconify/react'
import BookingForm from '@/components/Booking/BookingForm';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function BookingContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const type = searchParams.get('type') || '';
  const price = searchParams.get('price') || '';

  return (
    <div className='container max-w-8xl mx-auto px-5 2xl:px-0 pt-32 md:pt-44 pb-14 md:pb-28'>
      <div className='mb-16'>
        <div className='flex gap-2.5 items-center justify-center mb-3'>
          <span>
            <Icon
              icon={'ph:house-simple-fill'}
              width={20}
              height={20}
              className='text-primary'
            />
          </span>
          <p className='text-base font-semibold text-badge dark:text-white/90'>
            Booking
          </p>
        </div>
        <div className='text-center'>
          <h3 className='text-4xl sm:text-52 font-medium tracking-tighter text-black dark:text-white mb-3 leading-10 sm:leading-14'>
            Start Your Villa Getaway
          </h3>
          <p className='text-xm font-normal tracking-tight text-black/50 dark:text-white/50 leading-6'>
            Reserve your villa easily and secure a comfortable stay with complete facilities for a relaxing getaway.
          </p>
        </div>
      </div>
      {/* form */}
      <div className='border border-black/10 dark:border-white/10 rounded-2xl p-4 sm:p-10 shadow-xl dark:shadow-white/10 max-w-5xl mx-auto'>
        <BookingForm 
          initialCategory={category}
          initialType={type}
          initialPrice={price}
        />
      </div>
    </div>
  );
}

export default function Booking() {
  return (
    <Suspense fallback={<div className='container max-w-8xl mx-auto px-5 2xl:px-0 pt-32 md:pt-44 pb-14 md:pb-28 text-center'>Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
