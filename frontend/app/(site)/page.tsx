import Villa from '@/components/Home/Villa'
import Hero from '@/components/Home/Hero'
import AboutUs from '@/components/Home/AboutUs'
import Testimonial from '@/components/Home/Testimonial'
import FAQ from '@/components/Home/FAQs'
import GuestHouse from '@/components/Home/Properties'

export default function Home() {
  return (
    <main>
      <Hero />
      <AboutUs />
      <Villa />
      <GuestHouse />
      <Testimonial />
      <FAQ />
    </main>
  )
}
