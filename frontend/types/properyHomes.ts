export type PropertyHomes = {
  type: string
  name: string
  slug: string
  location: string
  detailLocation: string
  price: string
  rate: string
  beds: number
  baths: number
  area: number
  images: PropertyImage[]
  iconFacility: PropertyIconFacility[]
  description: string
  facilityDescription: FacilityDescription[]
}

interface PropertyImage {
  src: string;
}

interface PropertyIconFacility {
  src: string;
}

interface FacilityDescription {
  name: string;
  description: string;
}
