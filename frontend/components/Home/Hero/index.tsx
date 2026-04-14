import Image from "next/image"
import Link from "next/link"

export default async function HeroSection() {
  let unit: any = null;

  try {
    const res = await fetch("http://localhost:5050/accommodations", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      
      const villaData = data.find((item: any) => item.category && item.category.toLowerCase() === 'villa');
      
      if (villaData) {
        unit = villaData;
      } else if (data && data.length > 0) {
        unit = data[0]; 
      }
    }
  } catch (error) {
    console.error("Gagal fetch data unit:", error);
  }

  // Helper untuk mengekstrak angka dari array fasilitas (contoh mencari "Kamar Mandi")
  const getFasilitasCount = (keyword: string) => {
    if (!unit || !unit.fasilitas) return null;
    const found = unit.fasilitas.find((f: string) => f.toLowerCase().includes(keyword));
    if (found) {
      const match = found.match(/\d+/);
      return match ? match[0] : null;
    }
    return null;
  };

  const bedrooms = unit?.jumlah_kamar || 3;
  const bathrooms = getFasilitasCount('mandi') || 2;
  const hasParking = unit?.fasilitas?.some((f: string) => f.toLowerCase().includes('park')) || true;
  
  const priceRaw = unit?.price || 650000;
  let priceStr = priceRaw >= 1000000 ? `${priceRaw / 1000000}M` : `${priceRaw / 1000}K`;

  // Tentukan gambar background dinamis
  let bgImageDesktop = "/images/hero/heroBanner.png";
  let bgImageMobile = "/images/hero/heroBannerMobile.png";

  if (unit?.images && unit.images.length > 0) {
    const firstImg = unit.images[0];
    const isBase64 = firstImg.length > 200 && !firstImg.startsWith('http');
    const formattedImg = (isBase64 && !firstImg.startsWith('data:')) 
        ? `data:image/png;base64,${firstImg}` : firstImg;
    bgImageDesktop = formattedImg;
    bgImageMobile = formattedImg;
  }

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-10">
        {/* Mobile & Tablet */}
        <div className="relative block md:hidden w-full h-full">
          <Image
            src={bgImageMobile}
            alt="Interior Background"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
        </div>

        {/* Desktop */}
        <div className="relative hidden md:block w-full h-full">
          <Image
            src={bgImageDesktop}
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
            <p className="text-sm sm:text-base">{bathrooms} Bathrooms</p>
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
            <p className="text-sm sm:text-base">{hasParking ? "Parking Space" : "No Parking"}</p>
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
