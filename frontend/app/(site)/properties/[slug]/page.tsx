"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';

interface PropertyDetail {
    unit_id: number;
    name: string;
    category: string;
    alamat: string;
    price: number;
    capacity: number;
    jumlah_kamar: number;
    fasilitas: string[];
    images: string[];
    description?: string;
}

export default function Details() {
    const { slug } = useParams();

    // 🔥 JWT AUTH STATE
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState<any>(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050"}/api/profile`, {
            credentials: "include",
        })
            .then(res => {
                if (!res.ok) throw new Error()
                return res.json()
            })
            .then(data => setUser(data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, []);

    // Fetch property detail by unit_id (slug)
    useEffect(() => {
        if (!slug) return;

        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050"}/accommodations`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((data: PropertyDetail[]) => {
                // Find the accommodation matching unit_id
                const found = data.find((acc: PropertyDetail) => acc.unit_id?.toString() === slug.toString());

                if (found) {
                    const getFasilitasCount = (keyword: string) => {
                        if (!found.fasilitas) return null;
                        const f = found.fasilitas.find((f: string) => f.toLowerCase().includes(keyword));
                        if (f) {
                            const match = f.match(/\d+/);
                            return match ? parseInt(match[0]) : null;
                        }
                        return null;
                    };

                    const priceRaw = found.price || 0;
                    const rate = priceRaw >= 1000000 ? `${priceRaw / 1000000}M/Day` : `${priceRaw / 1000}K/Day`;

                    // Format images
                    let formattedImages: { src: string; alt: string }[] = [];
                    if (found.images && found.images.length > 0) {
                        formattedImages = found.images.map((img: string) => {
                            const isBase64 = img.length > 200 && !img.startsWith('http');
                            const formatted = (isBase64 && !img.startsWith('data:')) ? `data:image/png;base64,${img}` : img;
                            return { src: formatted, alt: found.name };
                        });
                    }

                    // Ensure we always have at least 4 images to fill the 4-image grid layout
                    while (formattedImages.length < 4) {
                        formattedImages.push({ src: '/images/properties/property-1.png', alt: found.name || 'Placeholder Property Image' });
                    }

                    setItem({
                        type: found.category || "Rent",
                        name: found.name || "Accommodation",
                        location: found.alamat || "Blitar",
                        detailLocation: found.alamat || "Blitar",
                        price: priceRaw,
                        capacity: found.capacity || 1,
                        rate: rate,
                        beds: found.jumlah_kamar || 2,
                        baths: getFasilitasCount('mandi') || 1,
                        area: getFasilitasCount('m2') || 120,
                        slug: found.unit_id?.toString(),
                        images: formattedImages,
                        fasilitas: found.fasilitas || [],
                        description: found.description || "A comfortable accommodation for your stay.",
                    });
                }
            })
            .catch(err => console.error("Failed to fetch property detail:", err));
    }, [slug]);

    if (loading || !item) {
        return (
            <section className="pt-32 lg:pt-44 pb-20 relative">
                <div className="container mx-auto max-w-8xl px-5 2xl:px-0 text-center">
                    <p className="text-dark/50 dark:text-white/50 text-lg">Loading property details...</p>
                </div>
            </section>
        );
    }

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
                    {/* Gambar utama kiri - besar */}
                    <div className="lg:col-span-8 col-span-12 lg:row-span-2">
                        {item?.images && item?.images[0] && (
                            <Image
                                src={item.images[0]?.src}
                                alt="Main Property Image"
                                width={800}
                                height={540}
                                className="rounded-2xl w-full h-[300px] sm:h-[400px] lg:h-[540px] object-cover"
                                unoptimized={true}
                            />
                        )}
                    </div>
                    {/* Gambar kanan atas */}
                    <div className="lg:col-span-4 hidden lg:block">
                        {item?.images && item?.images[1] && (
                            <Image
                                src={item.images[1]?.src}
                                alt="Property Image 2"
                                width={400}
                                height={254}
                                className="rounded-2xl w-full h-[254px] object-cover"
                                unoptimized={true}
                            />
                        )}
                    </div>
                    {/* Dua gambar kanan bawah */}
                    <div className="lg:col-span-2 col-span-6">
                        {item?.images && item?.images[2] && (
                            <Image
                                src={item.images[2]?.src}
                                alt="Property Image 3"
                                width={400}
                                height={254}
                                className="rounded-2xl w-full h-[150px] sm:h-[200px] lg:h-[254px] object-cover"
                                unoptimized={true}
                            />
                        )}
                    </div>
                    <div className="lg:col-span-2 col-span-6">
                        {item?.images && item?.images[3] && (
                            <Image
                                src={item.images[3]?.src}
                                alt="Property Image 4"
                                width={400}
                                height={254}
                                className="rounded-2xl w-full h-[150px] sm:h-[200px] lg:h-[254px] object-cover"
                                unoptimized={true}
                            />
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-6 lg:gap-8 mt-10">
                    <div className="lg:col-span-8 col-span-12">
                        <h3 className='text-xl font-medium'>Property details</h3>
                        <div className="py-8 my-8 border-y border-dark/10 dark:border-white/20 flex flex-col gap-8">
                            {item?.fasilitas && item.fasilitas.length > 0 && (
                                <div className="flex flex-col gap-4">
                                    {item.fasilitas.map((fas: string, index: number) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <Icon icon="ph:check-circle" className="text-xl text-primary flex-shrink-0" />
                                            <p className="text-dark dark:text-white text-xm">{fas}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-5">
                            {item?.description
                                ?.split("\n\n")
                                ?.map((paragraph: string, index: number) => (
                                    <p
                                        key={index}
                                        className="text-dark dark:text-white text-xm"
                                    >
                                        {paragraph}
                                    </p>
                                ))}
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
                                href={user
                                    ? `/booking?unit_id=${encodeURIComponent(item?.slug || '')}
                                        &category=${encodeURIComponent(item?.type || '')}
                                        &type=${encodeURIComponent(item?.name || '')}
                                        &price=${encodeURIComponent(item?.price || '')}
                                        &capacity=${encodeURIComponent(item?.capacity || '')}`
                                    : '/signup'
                                }
                                className='py-4 px-8 bg-primary text-white rounded-full w-full block text-center hover:bg-white duration-300 text-base mt-8 hover:cursor-pointer hover:text-primary'
                            >
                                Book Now
                            </Link>
                            <div className="absolute right-0 top-4 -z-[1]">
                                <Image src="/images/properties/vector.svg" width={400} height={500} alt="vector" unoptimized={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
