import Image from "next/image"
import Link from "next/link"

export default async function HeroSection() {
  let unit = null;

  try {
    // Kita bisa fetch ke Next.js API (http://localhost:3000/api/units) atau langsung tembak ke backend
    // Langsung ke backend lebih cepat untuk Server Component
    const res = await fetch("http://localhost:5050/accommodations", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        unit = data[0]; // Ambil data villa pertama
      }
    }
  } catch (error) {
    console.error("Gagal fetch data unit:", error);
  }

  // Gunakan data dari backend, atau fallback ke default jika gagal fetch
  const bedrooms = unit?.jumlah_kamar || 3;
  const priceRaw = unit?.price || 650000;
  
  // Format harga menjadi "650K" atau "1.5M"
  let priceStr = `${priceRaw / 1000}K`;
  if (priceRaw >= 1000000) {
    priceStr = `${priceRaw / 1000000}M`;
  }

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-10">
        {/* Mobile & Tablet */}
        <div className="block md:hidden w-full h-full">
          <Image
            src="/images/hero/heroBannerMobile.png"
            alt="Interior Background"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
        </div>

        {/* Desktop */}
        <div className="hidden md:block w-full h-full">
          <Image
            src="/images/hero/heroBanner.png"
            alt="Hero Image"
            fill
            priority
            unoptimized
            className="object-cover object-right"
          />
        </div>
      </div>

      {/* =====================================================
        GRADIENT OVERLAY (di atas image)
      ===================================================== */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-skyblue/90 via-lightskyblue/80 dark:via-[#CEAF6F]/70 to-white/10 dark:to-black/40" />

      {/* =====================================================
        CONTENT
      ===================================================== */}
      <div className="relative z-20 container max-w-8xl mx-auto px-5 2xl:px-0 pt-32 md:pt-28 pb-24">
        <div className="text-white text-start max-w-6xl">
          <p className="text-[16px] sm:text-base font-medium">
            Private Villa in Blitar
          </p>

          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-semibold -tracking-wider mt-4 mb-6">
            YOUR VILLA EXPERIENCE STARTS HERE
          </h1>

          <div className="flex flex-col xs:flex-row items-start justify-start gap-4">
            <Link
              href={unit ? `/properties/${unit.unit_id}` : `/properties/kelarisan-villa`}
              className="px-8 py-4 bg-primary border border-primary text-white font-semibold rounded-full hover:bg-white hover:text-primary duration-300"
            >
              Book Now
            </Link>

            <Link
              href="/#villa"
              className="px-8 py-4 border border-white text-white font-semibold rounded-full hover:border-primary hover:cursor-pointer hover:text-primary duration-300"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
        INFO CARD (BOTTOM)
      ===================================================== */}
      <div className="relative z-30 md:absolute md:bottom-0 md:right-0 bg-white dark:bg-black py-8 sm:py-9 px-4 sm:px-8 md:pl-10 md:pr-16 lg:pr-[160px] xl:pr-[200px] rounded-2xl md:rounded-none md:rounded-tl-2xl mx-4 md:mx-0 mt-16 md:mt-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:flex gap-6 sm:gap-15 text-black dark:text-white text-center md:text-start">
          <div className="flex flex-col items-center gap-3">
            <Image
                src={'/images/hero/sofa.svg'}
                alt='sofa'
                width={32}
                height={32}
                className='block dark:hidden'
                unoptimized={true}
              />
              <Image
                src={'/images/hero/dark-sofa.svg'}
                alt='sofa'
                width={32}
                height={32}
                className='hidden dark:block'
                unoptimized={true}
              />
            <p className="text-sm sm:text-base">{bedrooms} Bedrooms</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Image
                src={'/images/hero/tube.svg'}
                alt='sofa'
                width={32}
                height={32}
                className='block dark:hidden'
                unoptimized={true}
              />
              <Image
                src={'/images/hero/dark-tube.svg'}
                alt='sofa'
                width={32}
                height={32}
                className='hidden dark:block'
                unoptimized={true}
              />
            <p className="text-sm sm:text-base">2 Bathrooms</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Image
                src={'/images/hero/parking.svg'}
                alt='sofa'
                width={32}
                height={32}
                className='block dark:hidden'
                unoptimized={true}
              />
              <Image
                src={'/images/hero/dark-parking.svg'}
                alt='sofa'
                width={32}
                height={32}
                className='hidden dark:block'
                unoptimized={true}
              />
            <p className="text-sm sm:text-base">Parking Space</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-xl sm:text-3xl font-medium">
              {priceStr} / Day
            </p>
            <p className="text-sm sm:text-base opacity-60">
              For selling price
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
