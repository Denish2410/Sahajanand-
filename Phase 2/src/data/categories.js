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
    image: 'egn-1500',
    scene: 'kitchen',
    subcategories: [
      'Reach-In Premium', 'Undercounter Premium', 'Undercounter with Prep Table', 'Blast Chiller & Freezer', 'Reach-In Static',
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
    image: 'ewg-130d',
    scene: 'bar',
    subcategories: ['Wine Chillers', 'Back Bars', 'Undercounter Bars'],
  },
  {
    slug: 'retail-solution',
    featured: true,
    name: 'Retail Solution',
    shortName: 'Retail',
    tagline: 'Trusted by retailers',
    description:
      'Counter-top coolers, glass-top and hard-top freezers, milk coolers and upright showcases tropicalised for Indian weather.',
    image: 'ecg-3door-hero',
    scene: 'retail',
    subcategories: [
      'Flat Glass Top', 'Hard Top', 'Upright Showcase Chiller', 'Upright Showcase Freezer',
    ],
  },
  {
    slug: 'ice-machine',
    featured: false,
    name: 'Ice Machine',
    shortName: 'Ice',
    tagline: 'Trusted by bars & clinics',
    description:
      'Air-cooled dice and flake ice machines from 55 to 909 kg per day, with SS 304 bodies and integrated or separate storage bins.',
    image: 'eim-hero',
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
    image: 'galaxy',
    scene: 'vending',
    subcategories: ['Snacks & Beverages', 'Elevator Vending', 'Frozen Vending', 'Smart Lockers'],
  },
];

export const getCategory = (slug) => categories.find((c) => c.slug === slug);
