"use client"
import React from 'react';
import { propertyHomes } from '@/app/api/propertyhomes';
import { useParams } from "next/navigation";
import { Icon } from '@iconify/react';
import { testimonials } from '@/app/api/testimonial';
import Link from 'next/link';
import Image from 'next/image';


export default function Details() {
    const { slug } = useParams();


    const item = propertyHomes.find((item) => item.slug === slug);
    return (
        <section className="pt-32 lg:pt-44 pb-20 relative" >
            <div className="container mx-auto max-w-8xl px-5 2xl:px-0">
                <div className="grid grid-cols-12 items-end gap-6">
                    <div className="lg:col-span-8 col-span-12 flex flex-col gap-2 sm:gap-1.5">
                        <p className="text-dark/75 dark:text-white/75 text-sm sm:text-base font-semibold flex items-center gap-2">
                            <Icon icon="ph:house-simple-fill" className="text-xl sm:text-2xl text-primary" />
                            {item?.type}
                        </p>
                        <h1 className='text-3xl sm:text-4xl lg:text-52 font-semibold text-dark dark:text-white leading-tight'>{item?.name}</h1>
                        <div className="flex items-start gap-2">
                            <Icon icon="ph:map-pin" className="text-xl sm:text-2xl text-dark/50 dark:text-white/50 mt-1 flex-shrink-0" />
                            <p className='text-dark/50 dark:text-white/50 text-base sm:text-xm'>{item?.detailLocation}</p>
                        </div>
                    </div>
                    <div className="lg:col-span-4 col-span-12">
                        <div className='flex'>
                            <div className='flex flex-col gap-2 border-e border-black/10 dark:border-white/20 pr-2 xs:pr-4 mobile:pr-8'>
                                <Icon icon={'solar:bed-linear'} width={20} height={20} />
                                <p className='text-sm mobile:text-base font-normal text-black dark:text-white'>
                                    {item?.beds} Bedrooms
                                </p>
                            </div>
                            <div className='flex flex-col gap-2 border-e border-black/10 dark:border-white/20 px-2 xs:px-4 mobile:px-8'>
                                <Icon icon={'solar:bath-linear'} width={20} height={20} />
                                <p className='text-sm mobile:text-base font-normal text-black dark:text-white'>
                                    {item?.baths} Bathrooms
                                </p>
                            </div>
                            <div className='flex flex-col gap-2 pl-2 xs:pl-4 mobile:pl-8'>
                                <Icon
                                    icon={'lineicons:arrow-all-direction'}
                                    width={20}
                                    height={20}
                                />
                                <p className='text-sm mobile:text-base font-normal text-black dark:text-white'>
                                    {item?.area}m<sup>2</sup>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-12 mt-8 gap-4 lg:gap-8">
                    <div className="lg:col-span-8 col-span-12 row-span-2">
                        {item?.images && item?.images[1] && (
                            <div className="">
                                <Image
                                    src={item.images[1]?.src}
                                    alt="Main Property Image"
                                    width={400}
                                    height={500}
                                    className="rounded-2xl w-full h-[300px] sm:h-[400px] lg:h-540 object-cover"
                                    unoptimized={true}
                                />
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-4 lg:block hidden">
                        {item?.images && item?.images[2] && (
                            <Image src={item.images[2]?.src} alt="Property Image 2" width={400} height={500} className="rounded-2xl w-full h-full" unoptimized={true} />
                        )}
                    </div>
                    <div className="lg:col-span-2 col-span-6">
                        {item?.images && item?.images[3] && (
                            <Image src={item.images[3]?.src} alt="Property Image 3" width={400} height={500} className="rounded-2xl w-full h-[150px] sm:h-[200px] lg:h-full object-cover" unoptimized={true} />
                        )}
                    </div>
                    <div className="lg:col-span-2 col-span-6">
                        {item?.images && item?.images[4] && (
                            <Image src={item.images[4]?.src} alt="Property Image 4" width={400} height={500} className="rounded-2xl w-full h-[150px] sm:h-[200px] lg:h-full object-cover" unoptimized={true} />
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-6 lg:gap-8 mt-10">
                    <div className="lg:col-span-8 col-span-12">
                        <h3 className='text-xl font-medium'>Property details</h3>
                        <div className="py-8 my-8 border-y border-dark/10 dark:border-white/20 flex flex-col gap-8">
                            <div className="flex items-center gap-6">
                                <div>
                                    {item?.iconFacility && item?.iconFacility[0] && (
                                        <Image src={item.iconFacility[0]?.src} alt="IconFacilities" width={400} height={500} className="w-8 h-8 dark:hidden" unoptimized={true} />
                                    )}
                                    {item?.iconFacility && item?.iconFacility[1] && (
                                        <Image src={item.iconFacility[1]?.src} alt="IconFacilities" width={400} height={500} className="w-8 h-8 dark:block hidden" unoptimized={true} />
                                    )}
                                </div>
                                {item?.facilityDescription.map((item, index) => (
                                    <div key={index}>
                                        <h3 className="text-dark dark:text-white text-xm">
                                        {item.name}
                                        </h3>
                                        <p className="text-base text-dark/50 dark:text-white/50">
                                        {item.description}
                                        </p>
                                    </div>
                                ))}

                            </div>
                            <div className="flex items-center gap-6">
                                <div>
                                    <Image src="/images/SVGs/smart-home-access.svg" width={400} height={500} alt="" className='w-8 h-8 dark:hidden' unoptimized={true} />
                                    <Image src="/images/SVGs/smart-home-access-white.svg" width={400} height={500} alt="" className='w-8 h-8 dark:block hidden' unoptimized={true} />
                                </div>
                                <div>
                                    <h3 className='text-dark dark:text-white text-xm'>Smart TV</h3>
                                    <p className='text-base text-dark/50 dark:text-white/50'>
                                        Watch your favorite entertainment with a smart TV.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div>
                                    <Image src="/images/SVGs/parkingarea.svg" width={400} height={500} alt="" className='w-8 h-8 dark:hidden' unoptimized={true} />
                                    <Image src="/images/SVGs/parkingarea-dark.svg" width={400} height={500} alt="" className='w-8 h-8 dark:block hidden' unoptimized={true} />
                                </div>
                                <div>
                                    <h3 className='text-dark dark:text-white text-xm'>Parking Area</h3>
                                    <p className='text-base text-dark/50 dark:text-white/50'>
                                        Safe and convenient parking space for guests.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5">
                            {item?.description
                                ?.split("\n\n")
                                ?.map((paragraph, index) => (
                                    <p
                                        key={index}
                                        className="text-dark dark:text-white text-xm"
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                        </div>
                        <div className="py-8 mt-8 border-t border-dark/5 dark:border-white/15">
                            <h3 className='text-xl font-medium'>What this property offers</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-5 gap-6">
                                <div className="flex items-center gap-2.5">
                                    <Image
                                        src="/images/SVGs/point.svg"
                                        alt="Point"
                                        width={16}
                                        height={16}
                                        className="block dark:hidden"
                                    />
                                    <Image
                                        src="/images/SVGs/point-dark.svg"
                                        alt="Point"
                                        width={16}
                                        height={16}
                                        className="hidden dark:block"
                                    />
                                    <p className="text-base text-dark dark:text-white">
                                        2 floors
                                    </p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Image
                                        src="/images/SVGs/point.svg"
                                        alt="Point"
                                        width={16}
                                        height={16}
                                        className="block dark:hidden"
                                    />
                                    <Image
                                        src="/images/SVGs/point-dark.svg"
                                        alt="Point"
                                        width={16}
                                        height={16}
                                        className="hidden dark:block"
                                    />
                                    <p className="text-base text-dark dark:text-white">
                                        Kitchen Set
                                    </p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Image
                                        src="/images/SVGs/point.svg"
                                        alt="Point"
                                        width={16}
                                        height={16}
                                        className="block dark:hidden"
                                    />
                                    <Image
                                        src="/images/SVGs/point-dark.svg"
                                        alt="Point"
                                        width={16}
                                        height={16}
                                        className="hidden dark:block"
                                    />
                                    <p className="text-base text-dark dark:text-white">
                                        Capacity 6 People
                                    </p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Image
                                        src="/images/SVGs/point.svg"
                                        alt="Point"
                                        width={16}
                                        height={16}
                                        className="block dark:hidden"
                                    />
                                    <Image
                                        src="/images/SVGs/point-dark.svg"
                                        alt="Point"
                                        width={16}
                                        height={16}
                                        className="hidden dark:block"
                                    />
                                    <p className="text-base text-dark dark:text-white">
                                        Dinning Room
                                    </p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Image
                                        src="/images/SVGs/point.svg"
                                        alt="Point"
                                        width={16}
                                        height={16}
                                        className="block dark:hidden"
                                    />
                                    <Image
                                        src="/images/SVGs/point-dark.svg"
                                        alt="Point"
                                        width={16}
                                        height={16}
                                        className="hidden dark:block"
                                    />
                                    <p className="text-base text-dark dark:text-white">
                                        Sitting Room
                                    </p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Image
                                        src="/images/SVGs/point.svg"
                                        alt="Point"
                                        width={16}
                                        height={16}
                                        className="block dark:hidden"
                                    />
                                    <Image
                                        src="/images/SVGs/point-dark.svg"
                                        alt="Point"
                                        width={16}
                                        height={16}
                                        className="hidden dark:block"
                                    />
                                    <p className="text-base text-dark dark:text-white">
                                        BBQ Grill
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full aspect-square sm:aspect-video lg:aspect-[6/3] rounded-2xl overflow-hidden mt-8">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.1193898715846!2d112.18352637442726!3d-8.089305491939179!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78ed946a5cd16d%3A0xf6860adb841a8327!2sMANEMBAH%20BLITAR%20FAMILY%20HOMESTAY!5e0!3m2!1sid!2sid!4v1769351506024!5m2!1sid!2sid"
                                className="w-full h-full border-0"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-4 col-span-12">
                        <div className="bg-dark p-8 rounded-2xl relative z-10 overflow-hidden">
                            <h4 className='text-white text-3xl font-medium dark:text-white'>
                                {item?.rate}
                            </h4>
                            <p className='text-sm text-white/50 dark:text-white'>Discounted Price</p>
                            <Link 
                                href={`/booking?category=${encodeURIComponent(item?.type || '')}&type=${encodeURIComponent(item?.name || '')}&price=${encodeURIComponent(item?.price || '')}`} 
                                className='py-4 px-8 bg-primary text-white rounded-full w-full block text-center hover:bg-white duration-300 text-base mt-8 hover:cursor-pointer hover:text-primary'
                            >
                                Book Now
                            </Link>
                            <div className="absolute right-0 top-4 -z-[1]">
                                <Image src="/images/properties/vector.svg" width={400} height={500} alt="vector" unoptimized={true} />
                            </div>
                        </div>
                        <div className="mt-10">
                            <div className="border p-6 lg:p-10 rounded-2xl border-dark/10 dark:border-white/20 flex flex-col gap-6 h-full">
                                <Icon icon="ph:house-simple" width={44} height={44} className="text-primary" />
                                <p className='text-xm text-dark dark:text-white'>{testimonials[0].review}</p>
                                <div className="flex items-center gap-6 mt-auto">
                                    <Image src={testimonials[0].image} alt={testimonials[0].name} width={400} height={500} className='w-20 h-20 rounded-2xl' unoptimized={true} />
                                    <div className="">
                                        <h3 className='text-xm text-dark dark:text-white'>{testimonials[0].name}</h3>
                                        <h4 className='text-base text-dark/50 dark:text-white/50'>{testimonials[0].position}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
