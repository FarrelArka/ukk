import Link from "next/link";
import { Icon } from "@iconify/react"
import { FooterLinks } from "@/app/api/footerlinks";

const Footer = () => {
  return (
    <footer id="contact" className="relative z-10 bg-dark">
      <div className="container mx-auto max-w-8xl pt-14 px-4 sm:px-6 lg:px-0">
        <div className="flex lg:items-center justify-between items-end lg:gap-8 pb-14 border-b border-white/10 lg:flex-nowrap flex-wrap gap-6">
          <div className="flex flex-col gap-2 lg:gap-1 lg:max-w-xs">
            <p className="text-white text-xl">
              Stay connected with Manembah
            </p>
            <p className="text-white/60 text-sm">
              Get the latest updates, special offers, and exclusive villa promotions.
            </p>
          </div>
          <div className="flex lg:flex-row flex-col items-center lg:gap-10 gap-3">
            <div className="flex sm:flex-row flex-col gap-2 w-full sm:w-auto">
              <input type="email" placeholder="Enter Your Email" className="rounded-full py-4 px-6 bg-white/10 placeholder:text-white text-white focus-visible:outline-0 w-full sm:w-auto" />
              <button className="text-dark bg-white py-4 px-8 font-semibold rounded-full hover:bg-primary hover:text-white duration-300 hover:cursor-pointer w-full sm:w-auto">
                Subscribe
              </button>
            </div>
            <p className="text-white/40 text-sm lg:max-w-[45%]">
              By subscribing, you agree to receive our promotional emails. You can unsubscribe  at any time.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#">
              <Icon icon="ph:x-logo-bold" width={24} height={24} className="text-white hover:text-primary duration-300" />
            </Link>
            <Link href="#">
              <Icon icon="ph:facebook-logo-bold" width={24} height={24} className="text-white hover:text-primary duration-300" />
            </Link>
            <Link href="#">
              <Icon icon="ph:instagram-logo-bold" width={24} height={24} className="text-white hover:text-primary duration-300" />
            </Link>
          </div>
        </div>
        <div className="py-16 border-b border-white/10">
          <div className="grid grid-cols-12 sm:gap-10 gap-y-6">
            <div className="md:col-span-7 col-span-12">
              <h2 className="hidden sm:block text-white leading-[1.2] text-[48px] sm:text-[40px] font-medium mb-10 lg:max-w-3/4">
                Plan your perfect villa
                <br/>
                Stay with us.
              </h2>
              <h2 className="sm:hidden text-white leading-[1.2] text-[48px] sm:text-[40px] font-medium mb-10 lg:max-w-3/4">
                Plan your perfect villa
                Stay with us. 
              </h2>
              <Link href="/#properties" className="bg-primary text-base font-semibold py-4 px-8 rounded-full text-white hover:bg-white hover:text-primary duration-300 hover:cursor-pointer hover:scale-105">
                Book Your Stay
              </Link>
            </div>
            <div className="md:col-span-4 sm:col-span-6 col-span-12 mt-10 ">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 ">
                {FooterLinks.slice(0, 6).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-white/40 text-xm hover:text-primary transition-colors duration-200">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between md:flex-nowrap flex-wrap items-center py-6 gap-6">
          <p className="text-white/40 text-sm ">
            © 2026 Manembah Villa and HomeStay | All Rights Reserved.
          </p>
          <div className="flex gap-4 sm:gap-8 items-center">
            <Link href="#" className="text-white/40 hover:text-primary text-sm">
              Terms of service
            </Link>
            <Link href="#" className="text-white/40 hover:text-primary text-sm">
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </footer >
  );
};

export default Footer;