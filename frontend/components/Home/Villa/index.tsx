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
                {featuredProprty.map((item, index) => (
                  <CarouselItem key={index}>
                    <Image
                      src={item.scr}
                      alt={item.alt}
                      width={680}
                      height={530}
                      className="rounded-2xl w-full h-[300px] sm:h-[400px] lg:h-540 object-cover"
                      unoptimized={true}
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
                Villa
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-52 font-medium text-dark dark:text-white leading-tight">
                Kelarisan Villa
              </h2>
              <div className="flex items-center gap-2.5">
                <Icon icon="ph:map-pin" width={28} height={26} className="text-dark/50 dark:text-white/50" />
                <p className="text-dark/50 dark:text-white/50 text-base">
                  Graha Permata Regency, Blitar
                </p>
              </div>
            </div>
            <p className="text-base text-dark/50 dark:text-white/50">
              Kelarisan Villa is a modern and comfortable villa designed for families or
              groups seeking a private and relaxing stay. The villa features two floors with
              three bedrooms, two bathrooms, a cozy sitting room, a fully equipped 
              kitchen, a smart TV, a private swimming pool, and a convenient parking area,
              ensuring a pleasant and enjoyable experience.
            </p>
            <div className="flex flex-col gap-8">
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
                    Private Pool
                  </h6>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Enjoy a private pool for a relaxing and comfortable stay.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-[6px]">
                  <Image
                    src={'/images/hero/remote.svg'}
                    alt="remote"
                    width={24}
                    height={24}
                    className="block dark:hidden"
                    unoptimized
                  />
                  <Image
                    src={'/images/hero/dark-remote.svg'}
                    alt="remote"
                    width={24}
                    height={24}
                    className="hidden dark:block"
                    unoptimized
                  />
                </div>
                <div>
                  <h6 className="font-medium text-base mb-1">
                    Smart TV
                  </h6>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Watch your favorite entertainment with a smart TV.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-[6px]">
                  <Image
                    src={'/images/hero/parking.svg'}
                    alt="parking"
                    width={24}
                    height={24}
                    className="block dark:hidden"
                    unoptimized
                  />
                  <Image
                    src={'/images/hero/dark-parking.svg'}
                    alt="parking"
                    width={24}
                    height={24}
                    className="hidden dark:block"
                    unoptimized
                  />
                </div>
                <div>
                  <h6 className="font-medium text-base mb-1">
                    Parking Area
                  </h6>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    Safe and convenient parking space for guests.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-10">
              <Link href="/properties/kelarisan-villa" className="py-4 px-8 bg-primary hover:bg-dark duration-300 rounded-full text-white">
                View Details
              </Link>
              <div>
                <h4 className="text-3xl text-dark dark:text-white font-medium">
                  650K /Day
                </h4>
                <p className="text-base text-dark/50 dark:text-white/50">
                  Discounted price
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
