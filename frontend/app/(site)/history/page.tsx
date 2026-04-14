'use client';

import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface BookingHistoryItem {
  id: number;
  title: string;
  name: string;
  price: string;
  checkIn: string;
  checkOut: string;
  status: 'Completed' | 'Upcoming' | 'Cancelled' | 'Pending Payment';
  image: string;
  hasTestimonial: boolean;
}

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
            unoptimized={true}
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
           <div className={`flex items-center gap-2 font-semibold ${
             item.status === 'Cancelled' ? 'text-red-500' : 
             item.status === 'Completed' ? 'text-green-600' : 
             item.status === 'Pending Payment' ? 'text-orange-500' : 'text-blue-500'}`}>
             <Icon icon={
               item.status === 'Cancelled' ? "ph:x-circle-fill" : 
               item.status === 'Completed' ? "ph:check-circle-fill" : "ph:clock-fill"
             } width={24} height={24} />
             <span>{item.status}</span>
           </div>
           
           {(item.status === 'Completed' || item.hasTestimonial) && (
             <Link
               href={{
                 pathname: '/testimonial',
                 query: { 
                    category: item.title, 
                    type: item.name,
                    bookingId: item.id
                 },
               }}
               className='px-6 py-3 bg-[#B0914F] hover:bg-[#977c43] text-white rounded-full font-medium transition-colors text-sm shadow-lg'
             >
               {item.hasTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
             </Link>
           )}
        </div>
      </div>
    </div>
  );
};

export default function History() {
  const [historyData, setHistoryData] = useState<BookingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";
        
        const accRes = await fetch(`${backendURL}/accommodations`);
        if (!accRes.ok) throw new Error('Failed to fetch properties');
        const properties = await accRes.json();
        
        const bookRes = await fetch(`${backendURL}/api/booking/me`, {
          credentials: 'include'
        });
        
        if (!bookRes.ok) {
           if (bookRes.status === 401) {
             throw new Error('Please login to view history');
           }
           throw new Error('Failed to fetch bookings');
        }
        
        const bookings = await bookRes.json();
        
        if (!bookings || bookings.length === 0) {
          setHistoryData([]);
          setLoading(false);
          return;
        }

        const formatDate = (dateStr: string) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        };

        const mapped: BookingHistoryItem[] = bookings.map((b: any) => {
          const prop = properties.find((p: any) => p.unit_id === b.unit_id);
          
          let statusText: 'Completed' | 'Upcoming' | 'Cancelled' | 'Pending Payment' = "Upcoming";
          const lowerStatus = b.status_booking?.toLowerCase();
          
          if (lowerStatus === 'paid' || lowerStatus === 'completed' || lowerStatus === 'sukses') {
             statusText = 'Completed';
          } else if (lowerStatus === 'cancelled') {
             statusText = 'Cancelled';
          } else if (lowerStatus === 'pending' || lowerStatus === 'dp_pending') {
             statusText = 'Pending Payment';
          }
          
          let imageSrc = '/images/properties/property4/image-history.jpg';
          if (prop && prop.images && prop.images.length > 0) {
            const isBase64 = prop.images[0].length > 200 && !prop.images[0].startsWith('http');
            imageSrc = (isBase64 && !prop.images[0].startsWith('data:')) ? `data:image/png;base64,${prop.images[0]}` : prop.images[0];
          }

          return {
            id: b.id_booking,
            title: prop ? prop.category : 'Accommodation',
            name: prop ? prop.name : `Unit ${b.unit_id}`,
            price: `IDR ${b.amount.toLocaleString('id-ID')}`,
            checkIn: formatDate(b.check_in),
            checkOut: formatDate(b.check_out),
            status: statusText,
            image: imageSrc,
            hasTestimonial: b.has_testimonial || false,
          };
        });

        setHistoryData(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
        <div className='container max-w-8xl mx-auto px-5 2xl:px-0 pt-32 md:pt-44 pb-14 md:pb-28 text-center'>
            <p className="text-xl">Loading your booking history...</p>
        </div>
    );
  }

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
         {error ? (
             <div className="text-center p-10 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl">
                 <p className="font-semibold text-xl mb-2">{error}</p>
                 <Link href="/login" className="text-primary underline">Go to Login</Link>
             </div>
         ) : historyData.length === 0 ? (
             <div className="text-center p-10 bg-gray-50 dark:bg-white/5 text-gray-500 rounded-xl">
                 <Icon icon="ph:calendar-blank" className="mx-auto text-5xl mb-4 opacity-50" />
                 <p className="font-medium text-xl">No booking history found.</p>
                 <Link href="/properties" className="text-primary mt-4 inline-block hover:underline">Explore Accommodations</Link>
             </div>
         ) : (
            historyData.map((item, index) => (
                <HistoryCard key={`${item.id}-${index}`} item={item} />
            ))
         )}
      </div>
    </div>
  );
}
