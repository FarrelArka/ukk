'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Image from 'next/image'

interface UserSession {
  name?: string | null;
  email?: string | null;
  phone?: string;
  address?: string;
}

const Profile = () => {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    if (session?.user) {
      const user = session.user as UserSession
      setFormData({
        name: String(user.name || ''),
        email: String(user.email || ''),
        phone: String(user.phone || ''),
        address: String(user.address || '')
      })
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Profile updated successfully!')
        // Update session client-side
        await update({
          name: formData.name,
          phone: formData.phone,
          address: formData.address
        })
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="pt-40 pb-20">
      <Toaster />
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

          <form className='space-y-6' onSubmit={handleSubmit}>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              
              {/* Full Name */}
              <div className='space-y-3'>
                <label htmlFor='name' className='block mb-2 text-base font-medium text-black dark:text-white'>
                  Name
                </label>
                <input
                  type='text'
                  id='name'
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='Your registered name'
                  readOnly
                  className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent opacity-70 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 cursor-not-allowed'
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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='Your active email'
                  readOnly
                  className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent opacity-70 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 cursor-not-allowed'
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
                  value={formData.phone}
                  onChange={handleChange}
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
                  value={formData.address}
                  onChange={handleChange}
                  placeholder='Your home address'
                  className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full bg-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50'
                />
              </div>

            </div>

            {/* Button */}
            <div className='pt-4'>
              <button
                type='submit'
                disabled={loading}
                className='bg-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-dark duration-300 hover:cursor-pointer hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </section>
  )
}

export default Profile
