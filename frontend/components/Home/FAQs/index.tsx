import { Icon } from '@iconify/react';
import Image from 'next/image';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const FAQ: React.FC = () => {
    return (
        <section id='faqs'>
            <div className='container max-w-8xl mx-auto px-5 2xl:px-0'>
                <div className="grid lg:grid-cols-2 gap-10 ">
                    <div className='lg:mx-0 mx-auto'>
                        <Image
                            src="/images/faqs/faq-image.png"
                            alt='image'
                            width={680}
                            height={644}
                            className='lg:w-full'
                            unoptimized={true}
                        />
                    </div>
                    <div className='lg:px-12'>
                        <div className="space-y-2 sm:space-y-3">
                            <p className="text-dark/75 dark:text-white/75 text-base font-semibold flex gap-2.5">
                                <Icon icon="ph:house-simple-fill" className="text-2xl text-primary " />
                                FAQs
                            </p>
                            <h2 className='text-3xl sm:text-4xl lg:text-52 leading-[1.2] font-medium text-dark dark:text-white'>
                                Things You Need to Know
                            </h2>
                            <p className='text-dark/50 dark:text-white/50 pr-0 sm:pr-10 lg:pr-20 text-base'>
                                Find answers to the most common questions about our villa, facilities, and booking process.
                            </p>
                        </div>
                        <div className="my-8">
                            <Accordion type="single" defaultValue="item-1" collapsible className="w-full flex flex-col gap-6">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>1. Is parking available at the villa?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes, private and secure parking is available for guests.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>2. Is parking available at the guest house?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes, a designated parking area is provided for guests.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>3. What time is check-in and check-out?</AccordionTrigger>
                                    <AccordionContent>
                                        Check-in starts at 13:00 to allow our team to prepare the villa for your arrival. Check-out is at 12:00, and we kindly ask guests to respect these times to maintain comfort and service quality.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
