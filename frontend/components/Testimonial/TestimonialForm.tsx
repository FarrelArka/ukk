'use client';

import { Icon } from '@iconify/react';
import { useState } from 'react';
import { CustomSelect } from '@/components/ui/custom-select';
import { useRouter } from "next/navigation";

interface TestimonialFormProps {
  initialCategory?: string;
  initialType?: string;
}

const TestimonialForm = ({ initialCategory = '', initialType = '' }: TestimonialFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState(initialCategory);
  const [type, setType] = useState(initialType);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <form className='w-full' onSubmit={handleSubmit}>
      <div className='flex flex-col gap-8'>
        {/* Name and Email Row */}
        <div className='flex flex-col lg:flex-row gap-6 w-full'>
          <div className='w-full space-y-3'>
            <label
              htmlFor='username'
              className='block mb-2 text-base font-medium text-black dark:text-white'
            >
              Name
            </label>
            <input
              type='text'
              name='username'
              id='username'
              autoComplete='username'
              placeholder='Enter your full name'
              required
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
              autoComplete='email'
              placeholder='Enter your email address'
              required
              className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
            />
          </div>
        </div>

        {/* Category and Type Row */}
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
        </div>

        {/* Rating */}
        <div className='space-y-3'>
          <label className='block mb-2 text-base font-medium text-black dark:text-white'>
            Rating
          </label>
          <div className='flex gap-2'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type='button'
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className='focus:outline-none transition-colors duration-200'
              >
                <Icon
                  icon='ph:star-fill'
                  width={32}
                  height={32}
                  className={
                    star <= (hoverRating || rating)
                      ? 'text-[#FFE500]'
                      : 'text-[#E6E6E6] dark:text-white/20'
                  }
                />
              </button>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className='space-y-3'>
          <label
            htmlFor='testimonial'
            className='block mb-2 text-base font-medium text-black dark:text-white'
          >
            Testimonial
          </label>
          <textarea
            rows={8}
            name='testimonial'
            id='testimonial'
            placeholder='Share your experience during your stay'
            required
            className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-2xl outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 resize-none'
          ></textarea>
        </div>

        {/* Submit Button */}
        <button className='px-8 py-4 rounded-full bg-primary text-white text-base font-semibold w-fit hover:cursor-pointer hover:bg-dark duration-300 hover:scale-105'>
          Submit
        </button>
      </div>
    </form>
  );
};

export default TestimonialForm;
