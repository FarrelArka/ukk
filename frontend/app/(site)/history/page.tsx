'use client';

import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';

interface BookingHistoryItem {
  id: number;
  title: string;
  name: string;
  price: string;
  checkIn: string;
  checkOut: string;
  status: 'Completed' | 'Upcoming' | 'Cancelled';
  image: string;
}

const historyData: BookingHistoryItem[] = [
  {
    id: 1,
    title: 'Villa',
    name: 'Kelarisan Villa',
    price: 'IDR 650,000,00',
    checkIn: 'July 10, 2025',
    checkOut: 'July 11, 2025',
    status: 'Completed',
    image: '/images/properties/property4/image-history.jpg', 
  },
  {
    id: 2,
    title: 'Guest House',
    name: 'Comfort Unit',
    price: 'IDR 350,000,00',
    checkIn: 'September 20, 2026',
    checkOut: 'September 21, 2026',
    status: 'Completed',
    image: '/images/properties/property2/image-history.jpg',
  },
];

const HistoryCard = ({ item }: { item: BookingHistoryItem }) => {
  return (
    <div className='flex flex-col md:flex-row gap-6 p-4 md:p-6 border border-black/10 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-white/5 bg-white dark:bg-dark mb-8'>
      {/* Image Section */}
      <div className='w-full md:w-1/3 lg:w-1/4 h-64 md:h-auto relative'>
          <Image
            src={item.image}
            alt={item.name}
            fill
            className='object-cover rounded-xl'
          />
      </div>

      {/* Content Section */}
      <div className='flex-1 flex flex-col justify-between'>
        <div>
          <div className='flex justify-between items-start mb-2'>
              <h4 className='text-2xl font-semibold text-black dark:text-white'>{item.title}</h4>
              <span className='text-xl font-bold text-red-500'>{item.price}</span>
          </div>
          <h5 className='text-xl font-medium text-black/80 dark:text-white/80 mb-6'>{item.name}</h5>
          
          <div className='space-y-2 mb-6'>
            <div className='flex gap-4'>
                <span className='w-24 text-black/70 dark:text-white/70'>Check-in</span>
                <span className='text-black dark:text-white font-medium'>: {item.checkIn}</span>
            </div>
            <div className='flex gap-4'>
                <span className='w-24 text-black/70 dark:text-white/70'>Check-out</span>
                <span className='text-black dark:text-white font-medium'>: {item.checkOut}</span>
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto'>
           <div className='flex items-center gap-2 text-green-600 font-semibold'>
             <Icon icon="ph:check-circle-fill" width={24} height={24} />
             <span>{item.status}</span>
           </div>
           
           <Link
             href={{
               pathname: '/testimonial',
               query: { category: item.title, type: item.name },
             }}
             className='px-6 py-3 bg-[#B0914F] hover:bg-[#977c43] text-white rounded-full font-medium transition-colors text-sm'
           >
             Add Testimonial
           </Link>
        </div>
      </div>
    </div>
  );
};

export default function History() {
  return (
    <div className='container max-w-8xl mx-auto px-5 2xl:px-0 pt-32 md:pt-44 pb-14 md:pb-28'>
      {/* Header */}
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
            History
          </p>
        </div>
        <div className='text-center'>
          <h3 className='text-4xl sm:text-52 font-medium tracking-tighter text-black dark:text-white mb-3 leading-10 sm:leading-14'>
            Booking History
          </h3>
          <p className='text-xm font-normal tracking-tight text-black/50 dark:text-white/50 leading-6'>
            Review your past stays, track your bookings, and share your experience with us
          </p>
        </div>
      </div>

      {/* List */}
      <div className='max-w-5xl mx-auto'>
         {historyData.map((item) => (
            <HistoryCard key={item.id} item={item} />
         ))}
      </div>
    </div>
  );
}
