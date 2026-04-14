'use client';

import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import TestimonialForm from '@/components/Testimonial/TestimonialForm'
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function TestimonialContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const type = searchParams.get('type') || '';
  const bookingId = searchParams.get('bookingId') || '';

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
            Testimonials
          </p>
        </div>
        <div className='text-center'>
          <h3 className='text-4xl sm:text-52 font-medium tracking-tighter text-black dark:text-white mb-3 leading-10 sm:leading-14'>
            Share Your Stay Experience
          </h3>
          <p className='text-xm font-normal tracking-tight text-black/50 dark:text-white/50 leading-6'>
            Tell us about your experience and help other guests discover the comfort and service you enjoyed.
          </p>
        </div>
      </div>
      {/* form */}
      <div className='border border-black/10 dark:border-white/10 rounded-2xl p-4 shadow-xl dark:shadow-white/10'>
        <div className='flex flex-col lg:flex-row lg:items-center gap-12'>
          <div className='relative w-full lg:w-1/3 h-[300px] lg:h-[500px]'>
            <Image
              src={'/images/contactUs/contactUs.png'}
              alt='wall'
              fill
              className='rounded-2xl brightness-50 object-cover'
              unoptimized={true}
            />
            <div className='absolute top-6 left-6 lg:top-12 lg:left-12 flex flex-col gap-2'>
              <h5 className='text-xl xs:text-2xl mobile:text-3xl font-medium tracking-tight text-white'>
                Manembah Review
              </h5>
              <p className='text-sm xs:text-base mobile:text-xm font-normal text-white/80'>
                We value your honest feedback to keep improving our services.
              </p>
            </div>
          </div>
          <div className='flex-1 pb-10 lg:pb-0'>
            <TestimonialForm 
              initialCategory={category}
              initialType={type}
              bookingId={parseInt(bookingId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonial() {
  return (
    <Suspense fallback={<div className='container max-w-8xl mx-auto px-5 2xl:px-0 pt-32 md:pt-44 pb-14 md:pb-28 text-center'>Loading...</div>}>
      <TestimonialContent />
    </Suspense>
  );
}
