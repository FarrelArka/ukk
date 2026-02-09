import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

const Categories = () => {
  return (
    <section id="about" className="relative overflow-hidden">
      <div className="absolute left-0 top-0">
        <Image
          src="/images/categories/Vector.svg"
          alt="vector"
          width={800}
          height={1050}
          className="dark:hidden"
          unoptimized={true}
        />
        <Image
          src="/images/categories/Vector-dark.svg"
          alt="vector"
          width={800}
          height={1050}
          className="hidden dark:block"
          unoptimized={true}
        />
      </div>
      <div className="container max-w-8xl mx-auto px-5 2xl:px-0 relative z-10">
        <div className="grid grid-cols-12 items-center gap-6 md:gap-10">
          <div className="lg:col-span-6 col-span-12">
            <p className="text-dark/75 dark:text-white/75 text-base font-semibold flex gap-2.5">
              <Icon icon="ph:house-simple-fill" className="text-2xl text-primary " />
              About Us
            </p>
            <h2 className="text-3xl md:text-52 mt-4 mb-2 lg:max-w-full font-medium leading-[1.2] text-dark dark:text-white">
              Experience a Relaxing Stay
              at Kelarisan Blitar
            </h2>
            <p className="text-dark/50 dark:text-white/50 text-lg lg:max-w-full leading-[1.3] md:max-w-3/4">
              Kelarisan Blitar is a private villa offering comfort, privacy, and complete facilities for a relaxing stay in Blitar.
            </p>
            <Link href="/properties" className="py-4 px-8 bg-primary text-base leading-4 block w-fit text-white rounded-full font-semibold mt-8 hover:bg-dark duration-300">
              View properties
            </Link>
          </div>
          <div className="lg:col-span-6 col-span-12 sm:col-span-12">
            <div className="relative rounded-2xl overflow-hidden group">
              <Link href="/">
                <Image
                  src="/images/categories/villas-1.jpg"
                  alt="villas"
                  width={680}
                  height={386}
                  className="w-full h-[240px] sm:h-[280px] md:h-auto object-cover"
                  unoptimized={true}
                />
              </Link>
              <Link href="/">
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6 col-span-12 sm:col-span-12">
            <div className="relative rounded-2xl overflow-hidden group">
              <Link href="/properties/classic-unit">
                <Image
                  src="/images/categories/villas-2.jpg"
                  alt="villas"
                  width={680}
                  height={386}
                  className="w-full h-[240px] sm:h-[280px] md:h-auto object-cover"
                  unoptimized={true}
                />
              </Link>
              <Link href="/properties/kelarisan-villa" className="absolute w-full h-full bg-gradient-to-b from-black/0 to-black/80 top-0 md:top-full md:group-hover:top-0 flex flex-col justify-between pl-4 pb-4 sm:pl-6 sm:pb-6 lg:pl-10 lg:pb-10 transition-all duration-500">
                <div className="flex justify-end mt-6 mr-6">
                  <div className="bg-primary text-dark rounded-full w-fit p-4" >
                    <Icon icon="ph:arrow-right" width={24} height={24} className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-white text-2xl">
                    Kelarisan Villa
                  </h3>
                  <p className="text-white/80 text-base leading-6">
                    Kelarisan Blitar offers a comfortable private villa experience with a warm atmosphere and modern facilities.
                  </p>
                </div>
              </Link>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-3">
            <div className="relative rounded-2xl overflow-hidden group">
              <Link href="/properties/classic-unit">
                <Image
                  src="/images/categories/villas-3.jpg"
                  alt="villas"
                  width={320}
                  height={386}
                  className="w-full h-[240px] sm:h-[280px] md:h-auto object-cover"
                  unoptimized={true}
                />
              </Link>
              <Link href="/properties/classic-unit" className="absolute w-full h-full bg-gradient-to-b from-black/0 to-black/80 top-0 md:top-full md:group-hover:top-0 flex flex-col justify-between pl-4 pb-4 sm:pl-6 sm:pb-6 lg:pl-10 lg:pb-10 transition-all duration-500">
                <div className="flex justify-end mt-6 mr-6">
                  <div className="bg-primary text-dark rounded-full w-fit p-4">
                    <Icon icon="ph:arrow-right" width={24} height={24} className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"/>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-white text-2xl">
                    Classic Unit
                  </h3>
                  <p className="text-white/80 text-base leading-6">
                    Guest House Classic Unit offers a cozy and comfortable stay.
                  </p>
                </div>
              </Link>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-12 md:col-span-6 lg:col-span-3">
            <div className="relative rounded-2xl overflow-hidden group">
              <Link href="/properties/comfort-unit">
                <Image
                  src="/images/categories/villas-4.jpg"
                  alt="office"
                  width={320}
                  height={386}
                  className="w-full h-[240px] sm:h-[280px] md:h-auto object-cover"
                  unoptimized={true}
                />
              </Link>
              <Link href="/properties/comfort-unit" className="absolute w-full h-full bg-gradient-to-b from-black/0 to-black/80 top-0 md:top-full md:group-hover:top-0 flex flex-col justify-between pl-4 pb-4 sm:pl-6 sm:pb-6 lg:pl-10 lg:pb-10 transition-all duration-500">
                <div className="flex justify-end mt-6 mr-6">
                  <div className="bg-primary text-dark rounded-full w-fit p-4">
                    <Icon icon="ph:arrow-right" width={24} height={24} className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-white text-2xl">
                    Comfort Unit
                  </h3>
                  <p className="text-white/80 text-base leading-6">
                    Guest House Comfort Unit offers a warm and comfortable stay.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
