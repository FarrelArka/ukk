'use client';

import { useState, useEffect } from 'react';
import { CustomSelect } from '@/components/ui/custom-select';
import { useRouter } from "next/navigation";
import PaymentModal from './PaymentModal';
import DatePicker from './DatePicker';

interface BookingFormProps {
  initialUnitId?: string;
  initialCategory?: string;
  initialType?: string;
  initialPrice?: string;
  initialCapacity?: string;
}

const BookingForm = ({ initialUnitId = '', initialCategory = '', initialType = '', initialPrice = '', initialCapacity = '' }: BookingFormProps) => {
  const [category, setCategory] = useState(initialCategory);
  const [type, setType] = useState(initialType);
  const [priceList, setPriceList] = useState(initialPrice);
  const [unitId] = useState(initialUnitId);
  const router = useRouter();

  /* State for Payment Modal */
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [capacity, setCapacity] = useState(initialCapacity);
  const [propertyImage, setPropertyImage] = useState<string | undefined>(undefined);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [bookingId, setBookingId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050"}/api/profile`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => {
        if (data && data.name) {
          setName(data.name || "");
          setEmail(data.email || "");
        }
      })
      .catch((err) => {
        console.error("Error fetching user profile:", err);
      });
  }, []);

  // Fetch property image based on unit_id (no session needed)
  useEffect(() => {
    if (!unitId) return;
    fetch(`http://localhost:5050/accommodations`, { cache: 'no-store' })
      .then(res => res.json())
      .then((data: any[]) => {
        const found = data.find((acc: any) => acc.unit_id?.toString() === unitId);
        if (found && found.images && found.images.length > 0) {
          const img = found.images[0];
          const isBase64 = img.length > 200 && !img.startsWith('http');
          setPropertyImage(isBase64 && !img.startsWith('data:') ? `data:image/png;base64,${img}` : img);
        }
      })
      .catch(() => { });
  }, [unitId]);

  // Fetch booked dates for this unit
  useEffect(() => {
    if (!unitId) return;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'}/bookings/unit/${unitId}/dates`)
      .then(res => res.json())
      .then((ranges: { check_in: string; check_out: string }[]) => {
        const dates: string[] = [];
        ranges.forEach(r => {
          const start = new Date(r.check_in + 'T00:00:00');
          const end = new Date(r.check_out + 'T00:00:00');
          const cur = new Date(start);
          while (cur <= end) {
            const y = cur.getFullYear();
            const m = String(cur.getMonth() + 1).padStart(2, '0');
            const d = String(cur.getDate()).padStart(2, '0');
            dates.push(`${y}-${m}-${d}`);
            cur.setDate(cur.getDate() + 1);
          }
        });
        setBookedDates(dates);
      })
      .catch(() => { });
  }, [unitId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInDate || !checkOutDate) {
      alert("Mohon pilih tanggal check-in dan check-out");
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050"}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          unit_id: parseInt(unitId),
          check_in: checkInDate,
          check_out: checkOutDate,
          jumlah_orang: parseInt(guests) || 1
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat booking");
      
      setBookingId(data.id_booking);
      setIsPaymentModalOpen(true);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handlePaymentComplete = () => {
    setIsPaymentModalOpen(false);
    router.push('/');
  };

  // Helper to format date nicely (e.g., "July 10, 2024")
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Helper to get duration in days
  const getDurasi = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const durasi = Math.max(1, (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24));
    return durasi;
  };

  // Helper to get extra price (50k per extra guest over capacity)
  const getExtraPrice = () => {
    const qtyGuests = parseInt(guests) || 0;
    const cap = parseInt(capacity) || 0;
    const extra = qtyGuests - cap;
    if (extra > 0) {
      return extra * 50000;
    }
    return 0;
  };

  // Helper to parse price string safely supporting K and M suffixes
  const parsePrice = (p: string | undefined) => {
    if (!p) return 0;
    const str = p.toString().toUpperCase();
    const num = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
    if (str.includes('M')) return num * 1000000;
    if (str.includes('K')) return num * 1000;
    // fallback if no suffix, but we might have parsed "425.000" which would be 425, so we should let it process normally.
    // However, replace(/\D/g) is safer if it's just raw number 425000.
    const rawNum = parseInt(str.replace(/\D/g, '')) || 0;
    return rawNum;
  };

  // Compute total price
  const getTotalPrice = () => {
    const rawPrice = parsePrice(initialPrice) || parsePrice(priceList);
    const extraPrice = getExtraPrice();
    const durasi = getDurasi();
    return (rawPrice + extraPrice) * durasi;
  };

  const formattedTotalPrice = getTotalPrice().toLocaleString('id-ID');
  const formattedRawPrice = (parsePrice(initialPrice) || parsePrice(priceList)).toLocaleString('id-ID');

  return (
    <>
      <form className='w-full' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-8'>
          {/* Full Name and Email Address */}
          <div className='flex flex-col lg:flex-row gap-6 w-full'>
            <div className='w-full space-y-3'>
              <label
                htmlFor='name'
                className='block mb-2 text-base font-medium text-black dark:text-white'
              >
                Name
              </label>
              <input
                type='text'
                name='name'
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Enter your full name'
                className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
                readOnly
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email address'
                className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
                readOnly
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
                Capacity
              </label>
              <input
                type='tel'
                name='setCapacity'
                id='setCapacity'
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder='Enter your phone number *'
                className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
                readOnly
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
              <DatePicker
                id='checkIn'
                name='checkIn'
                value={checkInDate}
                onChange={(date) => {
                  setCheckInDate(date);
                  // Reset check-out if it's before new check-in
                  if (checkOutDate && checkOutDate <= date) {
                    setCheckOutDate('');
                  }
                }}
                disabledDates={bookedDates}
                placeholder='Select check-in date'
              />
            </div>
            <div className='w-full space-y-3'>
              <label
                htmlFor='checkOut'
                className='block mb-2 text-base font-medium text-black dark:text-white'
              >
                Check-out Date
              </label>
              <DatePicker
                id='checkOut'
                name='checkOut'
                value={checkOutDate}
                onChange={(date) => setCheckOutDate(date)}
                disabledDates={bookedDates}
                placeholder='Select check-out date'
                minDate={checkInDate || undefined}
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
                  className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent opacity-70 text-black dark:text-white cursor-not-allowed'
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
                  className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent opacity-70 text-black dark:text-white cursor-not-allowed'
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
                  value={`IDR ${formattedRawPrice}`}
                  readOnly
                  className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent opacity-70 text-black dark:text-white cursor-not-allowed'
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
        bookingId={bookingId}
        bookingDetails={{
          category: category,
          type: type,
          price: formattedRawPrice,
          totalPrice: formattedTotalPrice,
          guests: parseInt(guests) || 0,
          checkIn: formatDate(checkInDate),
          checkOut: formatDate(checkOutDate),
        }}
        onPaymentComplete={handlePaymentComplete}
        propertyImage={propertyImage}
      />
    </>
  );
};

export default BookingForm;
