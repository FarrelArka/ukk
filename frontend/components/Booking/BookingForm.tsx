'use client';

import { useState } from 'react';
import { CustomSelect } from '@/components/ui/custom-select';
import { useRouter } from "next/navigation";
import PaymentModal from './PaymentModal';
import { propertyHomes } from '@/app/api/propertyhomes';

interface BookingFormProps {
  initialCategory?: string;
  initialType?: string;
  initialPrice?: string;
}

const BookingForm = ({ initialCategory = '', initialType = '', initialPrice = '' }: BookingFormProps) => {
  const [category, setCategory] = useState(initialCategory);
  const [type, setType] = useState(initialType);
  const [priceList, setPriceList] = useState(initialPrice);
  const router = useRouter();

  /* State for Payment Modal */
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = () => {
      setIsPaymentModalOpen(false);
      router.push(`/testimonial?category=${encodeURIComponent(category)}&type=${encodeURIComponent(type)}`);
  };

  // Helper to format date nicely (e.g., "July 10, 2024")
  const formatDate = (dateString: string) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
    <form className='w-full' onSubmit={handleSubmit}>
      <div className='flex flex-col gap-8'>
        {/* Full Name and Email Address */}
        <div className='flex flex-col lg:flex-row gap-6 w-full'>
          <div className='w-full space-y-3'>
            <label
              htmlFor='fullName'
              className='block mb-2 text-base font-medium text-black dark:text-white'
            >
              Full Name
            </label>
            <input
              type='text'
              name='fullName'
              id='fullName'
              placeholder='Enter your full name'
              className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
            />
          </div>
          <div className='w-full space-y-3'>
            <label
              htmlFor='email'
              className='block mb-2 text-base font-medium text-black dark:text-white'
            >
              Email Address
            </label>
            <input
              type='email'
              name='email'
              id='email'
              placeholder='Enter your email address'
              className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
            />
          </div>
        </div>

        {/* Phone Number and Number of Guests */}
        <div className='flex flex-col lg:flex-row gap-6 w-full'>
          <div className='w-full space-y-3'>
            <label
              htmlFor='phoneNumber'
              className='block mb-2 text-base font-medium text-black dark:text-white'
            >
              Phone Number
            </label>
            <input
              type='tel'
              name='phoneNumber'
              id='phoneNumber'
              placeholder='Enter your phone number *'
              required
              className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
            />
          </div>
          <div className='w-full space-y-3'>
            <label
              htmlFor='guests'
              className='block mb-2 text-base font-medium text-black dark:text-white'
            >
              Number of Guests
            </label>
            <input
              type='number'
              name='guests'
              id='guests'
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder='Enter total number of guests'
              className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
            />
          </div>
        </div>

        {/* Check-in and Check-out Date */}
        <div className='flex flex-col lg:flex-row gap-6 w-full'>
          <div className='w-full space-y-3'>
            <label
              htmlFor='checkIn'
              className='block mb-2 text-base font-medium text-black dark:text-white'
            >
              Check-in Date
            </label>
            <input
              type='date'
              name='checkIn'
              id='checkIn'
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              placeholder='Select your check-in date'
              className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
            />
          </div>
          <div className='w-full space-y-3'>
            <label
              htmlFor='checkOut'
              className='block mb-2 text-base font-medium text-black dark:text-white'
            >
              Check-out Date
            </label>
            <input
              type='date'
              name='checkOut'
              id='checkOut'
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              placeholder='Select your check-out date'
              className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
            />
          </div>
        </div>

        {/* Category, Stay Type, Price List */}
        <div className='flex flex-col lg:flex-row gap-6 w-full'>
          <div className='w-full space-y-3 relative'>
            <label
              htmlFor='category'
              className='block mb-2 text-base font-medium text-black dark:text-white'
            >
              Category
            </label>
            {initialCategory ? (
              <input
                type='text'
                name='category'
                id='category'
                value={category}
                readOnly
                className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white cursor-not-allowed'
              />
            ) : (
              <CustomSelect
                name="category"
                value={category}
                onChange={setCategory}
                placeholder="Select category"
                options={[
                  { label: 'Villa', value: 'Villa' },
                  { label: 'Guest House', value: 'Guest House' },
                ]}
              />
            )}
          </div>
          <div className='w-full space-y-3 relative'>
            <label
              htmlFor='type'
              className='block mb-2 text-base font-medium text-black dark:text-white'
            >
              Type
            </label>
            {initialType ? (
              <input
                type='text'
                name='type'
                id='type'
                value={type}
                readOnly
                className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white cursor-not-allowed'
              />
            ) : (
              <CustomSelect
                name="type"
                value={type}
                onChange={setType}
                placeholder="Select type"
                options={[
                  { label: 'Classic Unit', value: 'Classic Unit' },
                  { label: 'Comfort Unit', value: 'Comfort Unit' },
                  { label: 'Harmony Plus', value: 'Harmony Plus' },
                  { label: 'Kelarisan Villa', value: 'Kelarisan Villa' },
                ]}
              />
            )}
          </div>
          <div className='w-full space-y-3 relative'>
            <label
              htmlFor='priceList'
              className='block mb-2 text-base font-medium text-black dark:text-white'
            >
              Price
            </label>
            {initialPrice ? (
              <input
                type='text'
                name='priceList'
                id='priceList'
                value={`IDR ${priceList}`}
                readOnly
                className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white cursor-not-allowed'
              />
            ) : (
              <CustomSelect
                name="priceList"
                value={priceList}
                onChange={setPriceList}
                placeholder="IDR"
                options={[
                  { label: 'IDR 350.000,00', value: '350.000,00' },
                  { label: 'IDR 650.000,00', value: '650.000,00' },
                ]}
              />
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div className='space-y-3'>
          <label
            htmlFor='additionalNotes'
            className='block mb-2 text-base font-medium text-black dark:text-white'
          >
            Additional Notes
          </label>
          <textarea
            rows={8}
            name='additionalNotes'
            id='additionalNotes'
            placeholder='Write additional notes or information (optional)'
            className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-2xl outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 resize-none'
          ></textarea>
        </div>

        {/* Submit Button */}
        
        <button type="submit" className="px-8 py-4 rounded-full bg-primary text-white text-base font-semibold w-fit transition-all duration-300 hover:bg-dark hover:scale-105">
          Reserve Now
        </button>

      </div>
    </form>

    <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingDetails={{
            category: category,
            type: type,
            price: priceList,
            checkIn: formatDate(checkInDate),
            checkOut: formatDate(checkOutDate),
        }}
        onPaymentComplete={handlePaymentComplete}
        propertyImage={propertyHomes.find(p => p.name === type)?.images[2]?.src}
    />
    </>
  );
};

export default BookingForm;
