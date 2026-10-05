// Five core business categories. Scene & image fields retained for compatibility.
export const categories = [
  {
    slug: 'professional-kitchen',
    featured: true,
    name: 'Professional Kitchen',
    shortName: 'Kitchen',
    tagline: 'Trusted by chefs',
    description:
      'GN-compatible reach-ins, undercounters, saladettes and blast chillers with ducted cold-air distribution and up to 100 mm insulation.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=480&q=80&auto=format&fit=crop',
    scene: 'kitchen',
    subcategories: [
      'Reach-In Premium', 'Undercounter Premium', 'Saladette Counter', 'Blast Chiller & Freezer',
    ],
  },
  {
    slug: 'bar-refrigeration',
    featured: true,
    name: 'Bar Refrigeration',
    shortName: 'Bar',
    tagline: 'Trusted by bartenders',
    description:
      'Dual-zone wine chillers, back bars, undercounter bars and draft beer cooling systems for every venue size.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=480&q=80&auto=format&fit=crop',
    scene: 'bar',
    subcategories: ['Wine Chillers', 'Back Bars', 'Undercounter Bars', 'Beer & Beverage'],
  },
  {
    slug: 'retail-solution',
    featured: true,
    name: 'Retail Solution',
    shortName: 'Retail',
    tagline: 'Trusted by retailers',
    description:
      'Counter-top coolers, glass-top and hard-top freezers, milk coolers and upright showcases tropicalised for Indian weather.',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=480&q=80&auto=format&fit=crop',
    scene: 'retail',
    subcategories: [
      'Milk Cooler', 'Flat Glass Top', 'Curved Glass Top',
      'Upright Showcase Chiller', 'Upright Showcase Freezer',
    ],
  },
  {
    slug: 'ice-machine',
    featured: false,
    name: 'Ice Machine',
    shortName: 'Ice',
    tagline: 'Trusted by bars & clinics',
    description:
      'Air-cooled dice and flake ice machines from 25 to 350 kg per day, with SS 304 bodies and integrated or separate storage bins.',
    image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=480&q=80&auto=format&fit=crop',
    scene: 'beach',
    subcategories: ['Ice Machines', 'Ice Flakers'],
  },
  {
    slug: 'vending-machine',
    featured: false,
    name: 'Vending Machine',
    shortName: 'Vending',
    tagline: "India's first UPI based vending machine",
    description:
      'Touchscreen snack, beverage, frozen and smart-locker vending with cashless payments and remote inventory management.',
    image: 'https://images.unsplash.com/photo-1529400971008-f566de0db787?w=480&q=80&auto=format&fit=crop',
    scene: 'vending',
    subcategories: ['Snacks & Beverages', 'Elevator Vending', 'Frozen Vending', 'Smart Lockers'],
  },
];

export const getCategory = (slug) => categories.find((c) => c.slug === slug);
