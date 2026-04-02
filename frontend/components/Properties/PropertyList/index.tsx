"use client";

import PropertyCard from '@/components/Home/Properties/Card/Card'
import { useEffect, useState } from 'react'

const PropertiesListing: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5050/api/properties")
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className='pt-0!'>
      <div className='container max-w-8xl mx-auto px-5 2xl:px-0'>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10'>
          
          {data.map((item: any, index) => (
            <div key={index}>
              <PropertyCard item={item} />
            </div>
          ))}

        </div>
      </div>
    </section>
  )
}

export default PropertiesListing