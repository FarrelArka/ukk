"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { featuredProprty } from "@/app/api/featuredproperty";
import { Icon } from "@iconify/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const FeaturedProperty: React.FC = () => {
  const [api, setApi] = React.useState<CarouselApi | undefined>(undefined);
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [villaData, setVillaData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchVilla = async () => {
      try {
        const res = await fetch("http://localhost:5050/accommodations");
        if (!res.ok) throw new Error("Gagal mengambil data villa");
        const data = await res.json();

        console.log("Villa Section: Data received from API:", data);

        // Cari Kelarisan Villa atau ambil yang pertama
        const targetVilla = data.find((v: any) => v.name.toLowerCase().includes("kelarisan")) || data[0];
        console.log("Villa Section: Target Villa determined:", targetVilla);
        setVillaData(targetVilla);
      } catch (err) {
        console.error("Villa Section: Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVilla();
  }, []);

  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  const formatImageSrc = (img: string) => {
    if (img.startsWith("data:")) return img;

    // JPEG base64 often starts with /9j/, so we must check this BEFORE checking startsWith("/")
    if (img.startsWith("/9j/")) {
      return `data:image/jpeg;base64,${img}`;
    }

    if (img.startsWith("/")) return img;

    // Detect MIME type from base64 string
    // PNG starts with iVBOR
    // JPEG starts with /9j/
    if (img.startsWith("iVBOR")) {
      return `data:image/png;base64,${img}`;
    } else if (img.startsWith("/9j/")) {
      return `data:image/jpeg;base64,${img}`;
    }

    // Default to png if unsure
    return `data:image/png;base64,${img}`;
  };

  if (loading) {
    return <div className="py-20 text-center">Memuat Villa...</div>;
  }

  if (!villaData) {
    console.warn("Villa Section: No villa data found to display.");
    return null; // Atau tampilkan placeholder jika tidak ada data sama sekali
  }

  return (
    <section id="villa">
      <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="relative">
            <Carousel
              setApi={setApi}
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {(villaData.images && villaData.images.length > 0 ? villaData.images : ["/images/hero/heroBanner.png"]).map((img: string, index: number) => (
                  <CarouselItem key={index}>
                    <Image
                      src={formatImageSrc(img)}
                      alt={villaData.name}
                      width={680}
                      height={530}
                      className="rounded-2xl w-full h-[300px] sm:h-[400px] lg:h-540 object-cover"
                      unoptimized={true}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error(`Villa Section: Failed to load image at index ${index}. URL snippet: ${target.src.substring(0, 100)}...`);

                        // Anti-loop: Hanya ganti src jika belum menggunakan heroBanner
                        if (!target.src.includes("heroBanner.png")) {
                          console.log("Villa Section: Switching to fallback image.");
                          target.src = "/images/hero/heroBanner.png";
                        }
                      }}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="absolute left-1/2 -translate-x-1/2 bg-dark/50 rounded-full py-2.5 bottom-6 sm:bottom-10 flex justify-center mt-4 gap-2.5 px-2.5">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2.5 h-2.5 rounded-full ${current === index + 1 ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-10">
            <div className="space-y-1 sm:space-y-2">
              <p className="text-dark/75 dark:text-white/75 text-base font-semibold flex gap-2">
                <Icon icon="ph:house-simple-fill" className="text-2xl text-primary " />
                {villaData.category || "Villa"}
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-52 font-medium text-dark dark:text-white leading-tight">
                {villaData.name}
              </h2>
              <div className="flex items-center gap-2.5">
                <Icon icon="ph:map-pin" width={28} height={26} className="text-dark/50 dark:text-white/50" />
                <p className="text-dark/50 dark:text-white/50 text-base">
                  {villaData.alamat || "Graha Permata Regency, Blitar"}
                </p>
              </div>
            </div>
            <p className="text-base text-dark/50 dark:text-white/50">
              {villaData.description || "No description available."}
            </p>
            <div className="flex flex-col gap-8">
              {/* Dinamis Fasilitas bisa ditambahkan di sini jika ingin mengubah ikonnya juga */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-[6px]">
                  <Image
                    src={'/images/hero/pool.svg'}
                    alt="pool"
                    width={24}
                    height={24}
                    className="block dark:hidden"
                    unoptimized
                  />
                  <Image
                    src={'/images/hero/dark-pool.svg'}
                    alt="pool"
                    width={24}
                    height={24}
                    className="hidden dark:block"
                    unoptimized
                  />
                </div>
                <div>
                  <h6 className="font-medium text-base mb-1">
                    Fasilitas Tersedia
                  </h6>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    {villaData.fasilitas?.join(", ") || "WiFi, AC, Kolam Renang"}
                  </p>
                </div>
              </div>
              {/* Stats lainnya bisa dinamis atau tetap sesuai kebutuhan */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-[6px]">
                  <Icon icon="ph:users-fill" className="text-2xl text-primary" />
                </div>
                <div>
                  <h6 className="font-medium text-base mb-1">
                    Kapasitas
                  </h6>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Maksimal {villaData.capacity} Tamu
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-10">
              <Link href={`/properties/${villaData.unit_id}`} className="py-4 px-8 bg-primary hover:bg-dark duration-300 rounded-full text-white">
                View Details
              </Link>
              <div>
                <h4 className="text-3xl text-dark dark:text-white font-medium">
                  {Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(villaData.price)} /Hari
                </h4>
                <p className="text-base text-dark/50 dark:text-white/50">
                  Harga Terkini
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperty;
