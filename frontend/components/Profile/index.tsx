'use client'

import React from 'react'
import Image from 'next/image'

const Profile = () => {
  return (
    <section className="pt-40 pb-20">
      <div className="container mx-auto px-4 mt-20">
        <div className='bg-white dark:bg-dark rounded-2xl border border-black/10 dark:border-white/10 shadow-xl dark:shadow-white/10 p-4 sm:p-10 max-w-3xl mx-auto'>
          
          {/* Avatar Section */}
          <div className='flex justify-center mb-8'>
            <div className='relative'>
              <Image
                src='/images/header/avatar.png'
                alt='Profile Avatar'
                width={120}
                height={120}
                className='rounded-full object-cover'
              />
            </div>
          </div>

          <form className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              
              {/* Full Name */}
              <div className='space-y-3'>
                <label htmlFor='fullName' className='block mb-2 text-base font-medium text-black dark:text-white'>
                  Full Name
                </label>
                <input
                  type='text'
                  id='fullName'
                  placeholder='Your registered name'
                  className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
                />
              </div>

              {/* Email Address */}
              <div className='space-y-3'>
                <label htmlFor='email' className='block mb-2 text-base font-medium text-black dark:text-white'>
                  Email Address
                </label>
                <input
                  type='email'
                  id='email'
                  placeholder='Your active email'
                  className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
                />
              </div>

              {/* Phone Number */}
              <div className='space-y-3'>
                <label htmlFor='phone' className='block mb-2 text-base font-medium text-black dark:text-white'>
                  Phone Number
                </label>
                <input
                  type='tel'
                  id='phone'
                  placeholder='Your contact number'
                  className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
                />
              </div>

              {/* Address */}
              <div className='space-y-3'>
                <label htmlFor='address' className='block mb-2 text-base font-medium text-black dark:text-white'>
                  Address
                </label>
                <input
                  type='text'
                  id='address'
                  placeholder='Your home address'
                  className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
                />
              </div>

            </div>

            {/* Button */}
            <div className='pt-4'>
              <button
                type='button'
                className='bg-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-dark duration-300 hover:cursor-pointer hover:scale-105'
              >
                Edit Profile
              </button>
            </div>
          </form>

        </div>
      </div>
    </section>
  )
}

export default Profile
