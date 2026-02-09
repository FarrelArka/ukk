"use client";
import * as React from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import { testimonials } from "@/app/api/testimonial";

const Testimonial = () => {
    const [api, setApi] = React.useState<CarouselApi | undefined>(undefined);

    React.useEffect(() => {
        if (!api) return;
    }, [api]);



    return (
        <section className="bg-dark relative overflow-hidden" id="testimonial">
            <div className="absolute right-0">
                <Image
                    src="/images/testimonial/Vector.svg"
                    alt="victor"
                    width={850}
                    height={1100}
                    unoptimized={true}
                />
            </div>
            <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
                    <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                        <p className="text-white text-base font-semibold flex gap-2">
                            <Icon icon="ph:house-simple-fill" className="text-2xl text-primary" />
                            Testimonials
                        </p>
                        <h2 className="text-4xl sm:text-4xl lg:text-52 font-medium text-white leading-tight">
                            Reviews from Our Guests
                        </h2>
                    </div>
                    <div className="hidden lg:flex gap-4 p-2.5 justify-center relative z-10 lg:mb-2">
                        <button
                            onClick={() => api?.scrollPrev()}
                            className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center hover:opacity-80 duration-300 shadow-lg hover:cursor-pointer"
                            aria-label="Previous slide"
                        >
                            <Image 
                                src="/images/testimonial/arrow-left.png" 
                                alt="Previous" 
                                width={48} 
                                height={48} 
                                unoptimized 
                            />
                        </button>
                        <button
                            onClick={() => api?.scrollNext()}
                            className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center hover:opacity-80 duration-300 shadow-lg hover:cursor-pointer"
                            aria-label="Next slide"
                        >
                            <Image 
                                src="/images/testimonial/arrow-right.png" 
                                alt="Next" 
                                width={48} 
                                height={48} 
                                unoptimized 
                            />
                        </button>
                    </div>
                </div>
                <Carousel
                    setApi={setApi}
                    opts={{
                        loop: true,
                    }}
                >
                    <CarouselContent>
                        {testimonials.map((item, index) => (
                            <CarouselItem key={index} className="mt-9">
                                <div className="lg:flex items-center gap-11">
                                    <div className="flex flex-col sm:flex-row items-start gap-6 lg:gap-11 lg:pr-20">
                                        <div>
                                            <Icon icon="ph:house-simple" width={32} height={32} className="text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="text-white lg:text-3xl text-2xl">{item.review}</h4>
                                            <div className="flex items-center mt-8 gap-6">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    width={80}
                                                    height={80}
                                                    className="rounded-full lg:hidden block"
                                                    unoptimized={true}
                                                />
                                                <div>
                                                    <h6 className="text-white text-xm font-medium">{item.name}</h6>
                                                    <p className="text-white/40">{item.position}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full h-full rounded-2xl overflow-hidden">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            width={440}
                                            height={440}
                                            className="lg:block hidden"
                                            unoptimized={true}
                                        />
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                <div className="flex lg:hidden gap-4 p-2.5 items-start mt-10 relative z-10">
                    <button
                        onClick={() => api?.scrollPrev()}
                        className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center hover:opacity-80 duration-300 shadow-lg hover:cursor-pointer"
                        aria-label="Previous slide"
                    >
                        <Image 
                            src="/images/testimonial/arrow-left.png" 
                            alt="Previous" 
                            width={48} 
                            height={48}
                            unoptimized 
                        />
                    </button>
                    <button
                        onClick={() => api?.scrollNext()}
                        className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center hover:opacity-80 duration-300 shadow-lg hover:cursor-pointer"
                        aria-label="Next slide"
                    >
                        <Image 
                            src="/images/testimonial/arrow-right.png" 
                            alt="Next" 
                            width={48} 
                            height={48} 
                            unoptimized 
                        />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Testimonial;
