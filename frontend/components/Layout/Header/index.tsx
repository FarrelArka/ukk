'use client'
import { navLinks } from '@/app/api/navlink'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'
import NavLink from './Navigation/NavLink'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const Header: React.FC = () => {
  const [sticky, setSticky] = useState(false)
  const [navbarOpen, setNavbarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const isHomepage = pathname === '/'

  const sideMenuRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (sideMenuRef.current && !sideMenuRef.current.contains(event.target as Node)) {
      setNavbarOpen(false)
    }
  }

  const handleScroll = useCallback(() => {
    setSticky(window.scrollY >= 50)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleScroll])


  return (
    <header className={`fixed ${navbarOpen ? 'h-24' : 'h-16 lg:h-24'} py-2 z-50 w-full bg-transparent transition-all duration-300 lg:px-0 px-4 ${sticky ? "top-3" : "top-0"}`}>
      <nav className={`container mx-auto max-w-8xl flex items-center justify-between ${navbarOpen ? 'py-4' : 'py-2 lg:py-4'} duration-300 ${sticky ? "shadow-lg bg-white dark:bg-dark rounded-full px-2.5 " : "shadow-none"}`}>
        <div className='flex justify-between items-center gap-2 w-full'>
          <div>
            <Link href='/'>
              <Image
                src={'/images/header/logo.png'}
                alt='logo'
                width={62}
                height={16}
                unoptimized={true}
                className={`${sticky ? "block dark:hidden" : isHomepage ? "hidden" : "block dark:hidden"}`}
              />
              <Image
                src={!isHomepage && !sticky ? '/images/header/logo.png' : '/images/header/logo.png'}
                alt='logo'
                width={62}
                height={16}
                unoptimized={true}
                className={`${sticky ? "hidden dark:block" : isHomepage ? "block" : "hidden dark:block"}`}
              />
            </Link>
          </div>
          <div className='flex items-center gap-2 sm:gap-6'>
            <button
              className='hover:cursor-pointer'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Icon
                icon={'solar:sun-bold'}
                className={`w-7 h-7 sm:w-8 sm:h-8 dark:hidden block ${sticky ? 'text-primary' : isHomepage ? 'text-white' : 'text-[#131313]'}`}
              />
              <Icon
                icon={'solar:moon-bold'}
                className={`w-7 h-7 sm:w-8 sm:h-8 dark:block hidden ${sticky ? 'text-primary' : isHomepage ? 'text-white' : 'text-white'}`}
              />
            </button>
            <div className={`hidden md:block`}>
              <Link href='#' className={`text-base text-inherit flex items-center gap-2 border-r pr-6 ${sticky
                  ? 'text-primary hover:text-primary border-primary'
                  : isHomepage
                    ? 'text-white hover:text-primary'
                    : 'text-[#131313] hover:text-primary'
                }`}
              >
                <Icon icon={'ph:phone-bold'} width={24} height={24} />
                +62 821-3145-9670
              </Link>
            </div>
            <div>
              <button
                onClick={() => setNavbarOpen(!navbarOpen)}
                className={`flex items-center gap-3 p-2 sm:px-5 sm:py-3 rounded-full font-semibold hover:cursor-pointer border ${sticky
                    ? 'text-white bg-primary border-primary hover:bg-white hover:text-primary'
                    : isHomepage
                      ? 'text-dark bg-white dark:text-dark hover:bg-transparent hover:text-white border-white'
                      : 'text-white bg-[#131313] hover:bg-transparent hover:text-[#131313] border-[#131313] dark:hover:bg-primary dark:hover:text-white'
                  }`}
                aria-label='Toggle mobile menu'>
                <span className='scale-90 sm:scale-100'>
                  <Icon icon={'ph:list'} width={24} height={24} />
                </span>
                <span className='hidden sm:block'>Menu</span>
              </button>
            </div>
            <div className='hidden sm:block'>
              <Link href="/profile">
                <Image
                  src='/images/header/avatar.png'
                  alt='avatar'
                  width={40}
                  height={40}
                  className='rounded-full hover:opacity-80 transition-opacity w-8 h-8 sm:w-10 sm:h-10 lg:w-[52px] lg:h-[52px]'
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {
        navbarOpen && (
          <div className='fixed top-0 left-0 w-full h-full bg-black/50 z-40' />
        )
      }

      <div
        ref={sideMenuRef}
        className={`fixed top-0 right-0 h-full w-full bg-dark shadow-lg transition-transform duration-300 max-w-2xl ${navbarOpen ? 'translate-x-0' : 'translate-x-full'} z-50 px-4 sm:px-10 md:px-20 overflow-auto no-scrollbar`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="">
            <div className='flex items-center justify-start py-10'>
              <button
                onClick={() => setNavbarOpen(false)}
                aria-label='Close mobile menu'
                className='bg-white p-3 rounded-full hover:cursor-pointer'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'>
                  <path
                    fill='none'
                    stroke='black'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            <nav className='flex flex-col items-start gap-4'>
              <ul className='w-full'>
                {navLinks.map((item, index) => (
                  <NavLink key={index} item={item} onClick={() => setNavbarOpen(false)} />
                ))}
                <li className='flex items-center gap-4'>
                  <Link href="/signin" className='py-4 px-8 bg-primary text-base leading-4 block w-fit text-white rounded-full border border-primary font-semibold mt-3 hover:bg-transparent hover:text-primary duration-300'>
                    Sign In
                  </Link>
                  <Link href="/signup" className='py-4 px-8 bg-transparent border border-white text-base leading-4 block w-fit text-white rounded-full font-semibold mt-3 hover:bg-transparent hover:text-primary hover:border-primary duration-300'>
                    Sign up
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className='flex flex-col gap-1 my-16 text-white'>
            <p className='text-base sm:text-xm font-normal text-white/40'>
              Contact
            </p>
            <Link href="#" className='text-base sm:text-xm font-medium text-inherit hover:text-primary'>
              contact@manembah.com
            </Link>
            <Link href="#" className='text-base sm:text-xm font-medium text-inherit hover:text-primary'>
              +62 821-3145-9670{' '}
            </Link>
          </div>
          <div className='flex items-center gap-4 mb-6 sm:hidden'>
            <Link href="/profile" className='flex items-center gap-4' onClick={() => setNavbarOpen(false)}>
               <Image
                  src='/images/header/avatar.png'
                  alt='avatar'
                  width={40}
                  height={40}
                  className='rounded-full'
                />
                <span className='text-white font-medium'>User</span>
            </Link>
          </div>
        </div>
      </div>
    </header >
  )
}

export default Header
