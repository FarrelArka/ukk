'use client';

import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";

interface TestimonialFormProps {
  initialCategory?: string;
  initialType?: string;
  bookingId?: number;
}

const TestimonialForm = ({ initialCategory = '', initialType = '', bookingId }: TestimonialFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [testimonialId, setTestimonialId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Fetch existing testimonial if editing
  useEffect(() => {
    const fetchExisting = async () => {
      if (!bookingId) return;
      setIsLoading(true);
      try {
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";
        const res = await fetch(`${backendURL}/api/testimonial/booking/${bookingId}`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setTestimonialId(data.id);
          setRating(data.rating);
          setComment(data.comment);
        }
      } catch (err) {
        console.error("Failed to fetch existing testimonial", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExisting();
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) {
        setError('Booking ID not found. Return to history and try again.');
        return;
    }
    if (rating === 0) {
        setError('Please select a rating.');
        return;
    }

    setIsSubmitting(true);
    setError('');

    try {
        const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";
        
        // Mode: POST if brand new, PUT if editing existing
        const method = testimonialId ? 'PUT' : 'POST';
        const url = testimonialId 
            ? `${backendURL}/api/testimonial/${testimonialId}` 
            : `${backendURL}/api/testimonial`;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                booking_id: bookingId,
                rating: rating,
                comment: comment,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(testimonialId ? 'Testimonial updated successfully!' : 'Testimonial saved successfully!');
            router.push('/');
            router.refresh(); 
        } else {
            setError(data.error || 'Failed to save testimonial.');
        }
    } catch (err) {
        setError('An error occurred during submission.');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <div className='flex items-center justify-center p-20'>
            <Icon icon="ph:spinner-bold" className="animate-spin text-primary text-4xl" />
        </div>
    );
  }

  return (
    <form className='w-full' onSubmit={handleSubmit}>
      <div className='flex flex-col gap-6'>
        {/* Info Heading */}
        <div className='p-6 bg-primary/5 rounded-2xl border border-primary/20 mb-4'>
            <h4 className='text-xl font-semibold text-black dark:text-white mb-1'>
                {testimonialId ? 'Editing Review for: ' : 'Reviewing: '} {initialType}
            </h4>
            <p className='text-sm text-black/60 dark:text-white/60'>{initialCategory}</p>
        </div>

        {error && (
            <div className='p-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl text-sm font-medium'>
                {error}
            </div>
        )}

        {/* Rating */}
        <div className='space-y-4'>
          <label className='block text-lg font-medium text-black dark:text-white'>
            How was your stay?
          </label>
          <div className='flex gap-3'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type='button'
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className='focus:outline-none transition-transform duration-200 active:scale-90 transform'
              >
                <Icon
                   icon={star <= (hoverRating || rating) ? 'ph:star-fill' : 'ph:star-bold'}
                  width={44}
                  height={44}
                  className={
                    star <= (hoverRating || rating)
                      ? 'text-[#FFE500]'
                      : 'text-[#E6E6E6] dark:text-white/20'
                  }
                />
              </button>
            ))}
          </div>
          <p className='text-sm text-black/40 dark:text-white/40'>Tap to rate stars</p>
        </div>

        {/* Testimonial */}
        <div className='space-y-3 pt-4'>
          <label
            htmlFor='testimonial'
            className='block text-lg font-medium text-black dark:text-white'
          >
            Your Review
          </label>
          <textarea
            rows={6}
            name='testimonial'
            id='testimonial'
            placeholder='Tell us about your experience during your stay...'
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className='px-6 py-4 border border-black/10 dark:border-white/10 rounded-2x outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 resize-none transition-all'
          ></textarea>
        </div>

        <div className='pt-4'>
            <button 
                type="submit"
                disabled={isSubmitting}
                className='px-10 py-5 rounded-full bg-primary text-white text-lg font-bold w-full lg:w-fit hover:cursor-pointer hover:bg-dark duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform active:scale-95'
            >
                {isSubmitting ? (
                    <div className='flex items-center gap-2'>
                        <Icon icon="ph:spinner-bold" className="animate-spin" />
                        Saving...
                    </div>
                ) : testimonialId ? 'Update Review' : 'Save'}
            </button>
        </div>
      </div>
    </form>
  );
};

export default TestimonialForm;
