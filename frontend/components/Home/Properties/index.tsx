import { Icon } from '@iconify/react'
import PropertyCard from './Card/Card'
import { PropertyHomes } from '@/types/properyHomes'

const Properties = async () => {
  let guestHouses: PropertyHomes[] = [];

  try {
    const res = await fetch("http://localhost:5050/accommodations", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();

      // Filter untuk category Guest House (atau selain Villa)
      const filtered = data.filter((item: any) => item.category && item.category.toLowerCase().includes('guest'));

      // Map ke format PropertyHomes yang dibutuhkan oleh Card
      guestHouses = filtered.map((item: any): PropertyHomes => {
        const getFasilitasCount = (keyword: string) => {
          if (!item.fasilitas) return null;
          const found = item.fasilitas.find((f: string) => f.toLowerCase().includes(keyword));
          if (found) {
            const match = found.match(/\d+/);
            return match ? parseInt(match[0]) : null;
          }
          return null;
        };

        const priceRaw = item.price || 0;
        const rate = priceRaw >= 1000000 ? `${priceRaw / 1000000}M/Day` : `${priceRaw / 1000}K/Day`;

        // Format images array
        let formattedImages = [];
        if (item.images && item.images.length > 0) {
          formattedImages = item.images.map((img: string) => {
            const isBase64 = img.length > 200 && !img.startsWith('http');
            const formatted = (isBase64 && !img.startsWith('data:')) ? `data:image/png;base64,${img}` : img;
            return {
              src: formatted,
              alt: item.name
            };
          });
        } else {
          // Fallback image jika tidak ada
          formattedImages = [{ src: '/images/properties/property-1.png', alt: item.name }];
        }

        return {
          type: "Rent",
          name: item.name || "Guest House",
          location: item.alamat || "Blitar",
          detailLocation: item.alamat || "Blitar",
          price: rate,
          rate: rate,
          beds: item.jumlah_kamar || 2,
          baths: getFasilitasCount('mandi') || 1,
          area: getFasilitasCount('m2') || 120,
          slug: (item.unit_id || 1).toString(),
          images: formattedImages,
          iconFacility: [],
          description: "A very nice guest house.",
          facilityDescription: []
        };
      });
    }
  } catch (error) {
    console.error("Gagal fetch guest houses:", error);
  }

  return (
    <section id="properties">
      <div className='container max-w-8xl mx-auto px-5 2xl:px-0'>
        <div className='mb-16 flex flex-col gap-3 '>
          <div className='flex gap-2.5 items-center justify-center'>
            <span>
              <Icon
                icon={'ph:house-simple-fill'}
                width={20}
                height={20}
                className='text-primary'
              />
            </span>
            <p className='text-base font-semibold text-dark/75 dark:text-white/75'>
              Guest House
            </p>
          </div>
          <h2 className='text-40 lg:text-52 font-medium text-black dark:text-white text-center tracking-tight leading-11 mb-2'>
            Our Guest House Properties
          </h2>
          <p className='text-xm font-normal text-black/50 dark:text-white/50 text-center'>
            Comfort, convenience, and a peaceful stay for every guest.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10'>
          {guestHouses.slice(0, 3).map((item, index) => (
            <div key={index} className='h-full'>
              <PropertyCard item={item} />
            </div>
          ))}
          {guestHouses.length === 0 && (
            <p className="text-center text-dark/50 col-span-full">No guest houses available right now.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default Properties
