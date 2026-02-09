import Image from "next/image";
import { Metadata } from "next";
import { Icon } from "@iconify/react/dist/iconify.js"

export const metadata: Metadata = {
  title: "404 Page | Manembah ",
};

const ErrorPage = () => {
  return (
    <>
      <section className="text-center bg-cover relative overflow-x-hidden py-4 sm:py-6 lg:py-8">
        <div className="container max-w-8xl mx-auto">
          <div className="flex gap-2.5 items-center justify-center mb-4">
            <Icon
              icon="ph:house-simple-fill"
              width={20}
              height={20}
              className="text-primary"
            />
            <p className='text-base font-semibold text-dark/75 dark:text-white/75'>
              Error 404
            </p>
          </div>

          <h2 className='text-40 lg:text-52 font-medium text-black dark:text-white text-center tracking-tight leading-11 mb-2'>
            Let’s Help You Find Home.
          </h2>

          <p className='text-xm font-normal text-black/50 dark:text-white/50 text-center'>
            Looks like you’ve hit a dead end — but don’t worry, we’ll help you get back on track.
          </p>
        </div>
      </section>
      <section className="flex justify-center">
        <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Image
            src="/images/404.png"
            alt="404"
            width={490}
            height={450}
            unoptimized
          />
        </div>
      </section>
    </>
  );
};

export default ErrorPage;