import Image from 'next/image'

const Logo: React.FC = () => {
  return (
    <>
      <Image
        src={'/images/header/logo.png'}
        alt='logo'
        width={68}
        height={22}
        unoptimized={true}
        className='dark:hidden'
      />
      <Image
        src={'/images/header/logo.png'}
        alt='logo'
        width={68}
        height={22}
        unoptimized={true}
        className='dark:block hidden'
      />
    </>
  )
}

export default Logo
