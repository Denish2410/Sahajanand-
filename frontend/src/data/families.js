// Product families transcribed from the Elanpro catalogue (page numbers in comments).
// One family = one specification table in the catalogue. `labels` are the table rows,
// each model's `values` line up with `labels`. `shared` holds rows common to all models.
// Nothing here is estimated: if the catalogue does not print a value, it is left out.
//
// m(model, values, extra) -> extra: { t: [minC, maxC], cap: litres, img, name }

const m = (model, values, extra = {}) => ({ model, values, ...extra });
const HACCP = 'HACCP compliance (all models)';

export const families = [
  /* ───────────── PROFESSIONAL KITCHEN ───────────── */
  {
    id: 'reach-in-premium', category: 'professional-kitchen', subcategory: 'Reach-In Premium', // p7
    name: 'Reach-In Premium',
    description: 'All-in-one reach-in with ducted cold-air distribution for uniform cooling on every shelf and 100 mm insulation for better hold-over and pull-down.',
    image: 'egn-1500', gallery: ['egn-glass-2d'],
    features: [
      'Flexible space utilisation, offers up to 100% extra storage',
      'No sharp edges, effortless cleaning',
      'Holds up to 13 GN pans',
      'Cold air distributed through duct: uniform on each shelf, no contamination through moisture or air',
      '100 mm insulation: better hold-over, better pull-down, low power consumption',
      'Auto defrosting, digital controller, adjustable shelves',
      'Tropicalised at 43°C ambient',
    ],
    badges: ['SS 304', 'Frost Free', 'Digital Controller', 'Eco-Friendly Refrigerant'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Temperature range', 'GN compatibility', 'Refrigerant', 'No. of shelves'],
    shared: { 'Type of cooling': 'Ventilated cooling (frost free)' },
    models: [
      m('EGN 1500 C4', ['1300 L', '1420 × 875 × 2090 mm', '2°C to 8°C', '2 × GN 1/1', 'R290', '6'], { t: [2, 8], cap: 1300, name: 'Reach-In Premium Cooler' }),
      m('EGN 1500 F4', ['1300 L', '1420 × 875 × 2090 mm', '−16°C to −22°C', '2 × GN 1/1', 'R290', '6'], { t: [-22, -16], cap: 1300, name: 'Reach-In Premium Freezer' }),
      m('EGN 700 C2', ['650 L', '740 × 875 × 2090 mm', '2°C to 8°C', '2 × GN 1/1', 'R290', '3'], { t: [2, 8], cap: 650, img: 'egn-700', name: 'Reach-In Premium Cooler' }),
      m('EGN 700 F2', ['650 L', '740 × 875 × 2090 mm', '−16°C to −22°C', '2 × GN 1/1', 'R290', '3'], { t: [-22, -16], cap: 650, img: 'egn-700', name: 'Reach-In Premium Freezer' }),
    ],
  },
  {
    id: 'undercounter-premium', category: 'professional-kitchen', subcategory: 'Undercounter Premium', // p8
    name: 'Undercounter Premium',
    description: 'GN 1/1 undercounter on heavy-duty lockable castors. Also available in 3 door, with 100 or 150 mm back splash, overhead shelf and 2 or 3 drawer options.',
    image: 'egn-uc', gallery: ['egn-uc-drawer'],
    features: [
      'Heavy-duty lockable castors',
      'Digital controller, adjustable shelves',
      'Back splash available in 100 / 150 mm',
      'Overhead shelf option',
      '2 and 3 drawer options',
    ],
    badges: ['SS 304', 'Frost Free', 'Digital Controller', 'Eco-Friendly Refrigerant'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Temperature range', 'GN compatibility', 'Refrigerant', 'No. of shelves'],
    shared: { 'Type of cooling': 'Ventilated cooling (frost free)' },
    models: [
      m('EGN 2100 C', ['265 L', '1360 × 700 × 860 mm', '2°C to 8°C', '1 × GN 1/1', 'R600a', '2'], { t: [2, 8], cap: 265, name: 'Undercounter Premium Cooler' }),
      m('EGN 3100 C', ['400 L', '1795 × 700 × 860 mm', '2°C to 8°C', '1 × GN 1/1', 'R600a', '3'], { t: [2, 8], cap: 400, name: 'Undercounter Premium Cooler' }),
      m('EGN 2100 F', ['265 L', '1360 × 700 × 860 mm', '−16°C to −22°C', '1 × GN 1/1', 'R290', '2'], { t: [-22, -16], cap: 265, name: 'Undercounter Premium Freezer' }),
      m('EGN 3100 F', ['400 L', '1795 × 700 × 860 mm', '−16°C to −22°C', '1 × GN 1/1', 'R290', '3'], { t: [-22, -16], cap: 400, name: 'Undercounter Premium Freezer' }),
    ],
  },
  {
    id: 'free-standing', category: 'professional-kitchen', subcategory: 'Free Standing Cooler / Freezer', // p9
    name: 'Free Standing Cooler / Freezer',
    description: 'Compact free-standing units designed for high ambient conditions, with a Dixell digital controller and removable gasket.',
    image: 'ur-24', gallery: ['urd-24'],
    features: ['Dixell digital controller', 'Removable gasket', 'Designed for high ambient conditions', 'Energy-efficient design', 'Optional: left or right hinged door', HACCP],
    badges: ['HACCP', 'Digital Controller', 'Eco-Friendly Refrigerant', 'Energy Efficient'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Temperature range', 'Shelves / drawers'],
    models: [
      // Catalogue prints the freezer range as "-15°C ~ 20°C"; reproduced as printed. Confirm with Elanpro.
      m('UFD 24SS', ['120 L', '600 × 600 × 860 mm', '−15°C ~ 20°C (as printed)', '2 drawers'], { cap: 120, img: 'urd-24', name: 'Free Standing Freezer' }),
      m('UF 24SS', ['120 L', '600 × 600 × 860 mm', '−15°C ~ 20°C (as printed)', '2 shelves'], { cap: 120, name: 'Free Standing Freezer' }),
      m('URD 24SS', ['150 L', '600 × 600 × 860 mm', '2°C to 8°C', '2 drawers'], { t: [2, 8], cap: 150, img: 'urd-24', name: 'Free Standing Refrigerator' }),
      m('UR 24SS', ['150 L', '600 × 600 × 860 mm', '2°C to 8°C', '2 shelves'], { t: [2, 8], cap: 150, name: 'Free Standing Refrigerator' }),
    ],
  },
  {
    id: 'saladette-counter', category: 'professional-kitchen', subcategory: 'Saladette Counter', // p9
    name: 'Saladette Counter',
    description: 'Salad undercounter, static cooling with fan assist, in a GN-compatible range.',
    image: 'es-900',
    features: ['GN compatible range', 'Removable gasket', 'Digital controller', 'Adjustable shelves', HACCP],
    badges: ['HACCP', 'Digital Controller', 'Eco-Friendly Refrigerant'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Temperature range', 'GN compatibility', 'Climate class', 'No. of shelves'],
    shared: { 'Type of cooling': 'Static with fan assist' },
    models: [
      m('ES 900', ['240 L', '900 × 700 × 906 mm', '2°C to 8°C', '2 × GN 1/1 + 2 × GN 1/4', '32°C', '2'], { t: [2, 8], cap: 240 }),
      m('ES 903', ['360 L', '1365 × 700 × 906 mm', '2°C to 8°C', '4 × GN 1/1', '32°C', '3'], { t: [2, 8], cap: 360 }),
    ],
  },
  {
    id: 'undercounter-prep-table', category: 'professional-kitchen', subcategory: 'Undercounter with Prep Table', // p10
    name: 'Undercounter with Prep Table',
    description: 'Undercounter with prep table, static cooling with fan assist, in a GN-compatible range.',
    image: 'eps-300',
    features: ['GN compatible range', 'Removable gasket', 'Digital controller', 'Adjustable shelves', HACCP],
    badges: ['HACCP', 'Digital Controller', 'Eco-Friendly Refrigerant'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Temperature range', 'GN compatibility', 'Climate class', 'No. of shelves'],
    shared: { 'Type of cooling': 'Static with fan assist' },
    models: [
      m('EPS 200', ['257 L', '903 × 700 × 1010 mm', '2°C to 8°C', '5 × GN 1/6', '32°C', '2'], { t: [2, 8], cap: 257 }),
      m('EPS 300', ['444 L', '1365 × 700 × 1010 mm', '2°C to 8°C', '8 × GN 1/6', '32°C', '3'], { t: [2, 8], cap: 444 }),
    ],
  },
  {
    id: 'saladette-prep-table', category: 'professional-kitchen', subcategory: 'Undercounter with Prep Table', // p10
    name: 'Saladette Counter with Prep Table',
    description: 'Undercounter with prep table and ventilated cooling, on heavy-duty lockable castors. GN pans are optional and not supplied with the equipment.',
    image: 'esh-3000',
    features: ['Heavy-duty lockable castors', 'GN pan compatible', 'Environment-friendly refrigerant', 'Removable gasket', 'Optional: heavy-duty adjustable SS legs', HACCP],
    badges: ['SS 304', 'HACCP', 'Frost Free', 'Digital Controller'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Temperature range', 'GN compatibility', 'Climate class', 'No. of shelves'],
    shared: { 'Type of cooling': 'Ventilated cooling' },
    models: [
      m('ESH 2000', ['337 L', '1510 × 800 × 1085 mm', '2°C to 8°C', '7 × GN 1/3', '38°C', '2'], { t: [2, 8], cap: 337 }),
      m('ESH 3000', ['497 L', '2020 × 800 × 1085 mm', '2°C to 8°C', '10 × GN 1/3', '38°C', '3'], { t: [2, 8], cap: 497 }),
    ],
  },
  {
    id: 'salad-display-counter', category: 'professional-kitchen', subcategory: 'Sushi & Saladette Counter', // p11
    name: 'Salad Display Counter',
    description: 'Counter-top salad display with copper evaporator and condenser and a Dixell digital controller.',
    image: 'evrx',
    features: ['Copper evaporator & condenser', 'Dixell digital controller', 'GN pan compatibility', 'Rated for 32°C ambient', HACCP],
    badges: ['SS 304', 'HACCP', 'Digital Controller', 'Eco-Friendly Refrigerant'],
    labels: ['Dimensions (W × D × H)', 'Temperature range', 'GN compatibility', 'Climate class'],
    models: [
      m('EVRX 1200', ['1200 × 335 × 435 mm', '2°C to 8°C', '5 × GN 1/4', '32°C'], { t: [2, 8] }),
      m('EVRX 1400', ['1400 × 335 × 435 mm', '2°C to 8°C', '6 × GN 1/4', '32°C'], { t: [2, 8] }),
    ],
  },
  {
    id: 'sushi-case', category: 'professional-kitchen', subcategory: 'Sushi & Saladette Counter', // p11
    name: 'Sushi Case',
    description: 'Sushi case with top and bottom evaporators, heated front glass and a removable safety curved glass.',
    image: 'sss',
    features: ['LED lamp', 'Heated front glass', 'Top & bottom evaporator', 'Safety curved glass', 'Removable glass for easy cleaning', HACCP],
    badges: ['HACCP', 'Eco-Friendly Refrigerant'],
    labels: ['Dimensions (W × D × H)', 'Temperature range', 'GN compatibility', 'Climate class'],
    models: [
      m('SSS 1500', ['1500 × 415 × 300 mm', '2°C to 8°C', '5 × GN 1/3', '32°C'], { t: [2, 8] }),
      m('SSS 1800', ['1800 × 415 × 300 mm', '2°C to 8°C', '7 × GN 1/3', '32°C'], { t: [2, 8] }),
    ],
  },
  {
    id: 'ice-cream-buffet-freezer', category: 'professional-kitchen', subcategory: 'Ice Cream Buffet Freezer', // p11
    name: 'Ice Cream Buffet Freezer',
    description: 'Buffet freezer with food-grade pans, ideal for buffets, with tempered low-emissivity glass and LED lighting.',
    image: 'sd-59h',
    features: ['Copper evaporator', 'Dixell digital controller', 'GN compatible', 'Extra-strong hinges', 'Tempered & low-emissivity glass', 'LED lighting for better visibility', HACCP],
    badges: ['HACCP', 'Digital Controller', 'Eco-Friendly Refrigerant'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Temperature range', 'Ambient', 'GN pans 1/3'],
    models: [m('SD 59 H', ['40 L', '670 × 735 × 360 mm', '−16°C to −18°C', '32°C', '3'], { t: [-18, -16], cap: 40 })],
  },
  {
    id: 'frost-top', category: 'professional-kitchen', subcategory: 'Frost Top', // p12
    name: 'Frost Top',
    description: 'Drop-in frost top with uniform cooling and an easy-to-clean surface.',
    image: 'e3f',
    features: ['Copper evaporator', 'Environment-friendly refrigerant', 'Digital controller', 'Uniform cooling', 'Easy-to-clean surface', HACCP],
    badges: ['SS 304', 'HACCP', 'Digital Controller'],
    labels: ['Dimensions (W × D × H)', 'Temperature', 'GN compatibility', 'Climate class'],
    models: [m('E3F', ['1102 × 678 × 430 mm', '−10°C', '3 × GN 1/1', '32°C'], { t: [-10, -10] })],
  },
  {
    id: 'cooling-well', category: 'professional-kitchen', subcategory: 'Cooling Well', // p12
    name: 'Ventilated Cooling Well',
    description: 'Compact drop-in cooling well with ventilated cooling and GN pan compatibility.',
    image: 'egn-3v',
    features: ['Copper evaporator', 'Environment-friendly refrigerant', 'Ventilated cooling', 'Digital controller', 'Compact design', HACCP],
    badges: ['SS 304', 'HACCP', 'Digital Controller'],
    labels: ['Dimensions (W × D × H)', 'Temperature range', 'GN compatibility', 'Climate class'],
    shared: { 'Type of cooling': 'Ventilated cooling' },
    models: [m('EGN 3V', ['1122 × 688 × 636 mm', '2°C to 8°C', '3 × GN 1/1', '32°C'], { t: [2, 8] })],
  },
  {
    id: 'blast-chiller', category: 'professional-kitchen', subcategory: 'Blast Chiller & Freezer', // p13
    name: 'Blast Chiller / Freezer',
    description: 'Brings food from 70°C to 4°C within 90 minutes to inhibit bacterial growth, and from 70°C to −18°C within 240 minutes, forming microcrystals that protect food structure.',
    image: 'ed10',
    features: [
      'Blast chilling: 70°C to 4°C in 90 minutes',
      'Shock freezing: 70°C to −18°C in 240 minutes',
      'Rapid chilling with ventilated cooling',
      'Digital controller',
      '75 mm insulation',
      'GN 1/1 trays are not part of the equipment',
    ],
    badges: ['SS 304', 'Digital Controller', 'Eco-Friendly Refrigerant'],
    applications: ['Meat Processing', 'Hotels & Restaurants', 'Dairy', 'Food Processing', 'Ice Cream', 'Healthcare'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Operating temperature', 'Chilling capacity (70°C to 4°C in 90 min)', 'Freezing capacity (70°C to −18°C in 240 min)', 'GN 1/1 tray compatibility', 'Power supply'],
    shared: { 'Cooling mode': 'Ventilated' },
    models: [
      m('ED5', ['169 L', '800 × 815 × 1015 mm', '−35°C', '18 kg', '14 kg', '5', '230 V / 50 Hz'], { t: [-35, -35], cap: 169 }),
      m('ED10', ['368 L', '800 × 815 × 1645 mm', '−35°C', '40 kg', '28 kg', '10', '230 V / 50 Hz'], { t: [-35, -35], cap: 368 }),
      m('ED14', ['494 L', '800 × 815 × 2170 mm', '−35°C', '55 kg', '38 kg', '14', '380 V / 50 Hz'], { t: [-35, -35], cap: 494 }),
    ],
  },
  {
    id: 'reach-in-frost-free', category: 'professional-kitchen', subcategory: 'Reach-In Frost Free', // p14
    name: 'Reach-In Frost Free Classic',
    description: 'GN-compatible frost-free reach-in with copper evaporator and condenser, lock and heavy-duty lockable castors. Climate class 43°C.',
    image: 'cgn-1200',
    features: ['Heavy-duty lockable castors', 'Copper evaporator & condenser', 'Lock', 'GN compatible', 'Environment-friendly refrigerant', 'Optional: left or right hinged in 2 door unit, single or multi door, heavy-duty adjustable SS legs', HACCP],
    badges: ['HACCP', 'Frost Free', 'Digital Controller', 'SS 430'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Temperature range', 'GN compatibility', 'Refrigerant', 'Type of cooling', 'No. of shelves', 'SS grade'],
    shared: { 'Climate class': '43°C' },
    models: [
      m('CGN 600 C2', ['600 L', '680 × 810 × 2000 mm', '2°C to 8°C', '2 × GN 1/1', 'R290', 'Ventilated cooling (frost free)', '3', 'SS 430'], { t: [2, 8], cap: 600, name: 'Reach-In Frost Free Cooler' }),
      m('CGN 600 F2', ['600 L', '680 × 810 × 2000 mm', '−16°C to −22°C', '2 × GN 1/1', 'R290', 'Ventilated cooling (frost free)', '3', 'SS 430'], { t: [-22, -16], cap: 600, name: 'Reach-In Frost Free Freezer' }),
      m('CGN 1200 C4', ['1200 L', '1340 × 810 × 2000 mm', '2°C to 8°C', '2 × GN 1/1', 'R290', 'Ventilated cooling (frost free)', '6', 'SS 430'], { t: [2, 8], cap: 1200, name: 'Reach-In Frost Free Cooler' }),
      m('CGN 1200 F4', ['1200 L', '1340 × 810 × 2000 mm', '−16°C to −22°C', '2 × GN 1/1', 'R290', 'Ventilated cooling (frost free)', '6', 'SS 430'], { t: [-22, -16], cap: 1200, name: 'Reach-In Frost Free Freezer' }),
      m('CGN 600 CF', ['300 L chiller + 300 L freezer', '680 × 810 × 2000 mm', '2°C to 8°C / −16°C to −22°C', '2 × GN 1/1', 'R290 / R290', 'Static', '3', 'SS 430'], { t: [-22, 8], cap: 600, name: 'Reach-In Combi' }),
      m('CGN 1200 CF', ['600 L chiller + 600 L freezer', '1340 × 845 × 2000 mm', '2°C to 8°C / −16°C to −22°C', '2 × GN 1/1', 'R290 / R290', 'Static', '6', 'SS 430'], { t: [-22, 8], cap: 1200, name: 'Reach-In Combi' }),
    ],
  },
  {
    id: 'undercounter-frost-free', category: 'professional-kitchen', subcategory: 'Undercounter Frost Free', // p14
    name: 'Undercounter Frost Free Classic',
    description: 'GN-compatible frost-free undercounter with rounded internal edges. Also available in 3 door. Climate class 38°C.',
    image: 'cgn-2100',
    features: ['Removable gasket', 'Heavy-duty lockable castors', 'Copper evaporator & condenser', 'Lock', 'Rounded internal edges', 'Optional: heavy-duty adjustable SS legs', HACCP],
    badges: ['HACCP', 'Frost Free', 'Digital Controller', 'SS 430'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Temperature range', 'GN compatibility', 'Refrigerant', 'No. of shelves', 'SS grade'],
    shared: { 'Type of cooling': 'Ventilated cooling (frost free)', 'Climate class': '38°C' },
    models: [
      m('CGN 2100 C', ['265 L', '1360 × 700 × 860 mm', '2°C to 8°C', '1 × GN 1/1', 'R600a', '2', 'SS 430'], { t: [2, 8], cap: 265, name: 'Undercounter Frost Free Cooler' }),
      m('CGN 3100 C', ['400 L', '1795 × 700 × 860 mm', '2°C to 8°C', '1 × GN 1/1', 'R600a', '3', 'SS 430'], { t: [2, 8], cap: 400, name: 'Undercounter Frost Free Cooler' }),
      m('CGN 2100 F', ['265 L', '1360 × 700 × 860 mm', '−16°C to −22°C', '1 × GN 1/1', 'R290', '2', 'SS 430'], { t: [-22, -16], cap: 265, name: 'Undercounter Frost Free Freezer' }),
      m('CGN 3100 F', ['400 L', '1795 × 700 × 860 mm', '−16°C to −22°C', '1 × GN 1/1', 'R290', '3', 'SS 430'], { t: [-22, -16], cap: 400, name: 'Undercounter Frost Free Freezer' }),
    ],
  },
  {
    id: 'reach-in-static', category: 'professional-kitchen', subcategory: 'Reach-In Static', // p15
    name: 'Reach-In Static',
    description: 'Static-cooling reach-in with self-closing doors, lock and heavy-duty lockable castors.',
    image: 'ri-551',
    features: ['Removable gasket', 'Heavy-duty lockable castors', 'Lock', 'Self-closing door', 'Adjustable shelves', 'Optional: single or multi door, heavy-duty adjustable SS legs', HACCP],
    badges: ['HACCP', 'Digital Controller', 'Eco-Friendly Refrigerant', 'SS 201'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Temperature range', 'Refrigerant', 'No. of shelves', 'Material'],
    shared: { 'Type of cooling': 'Static cooling' },
    models: [
      m('RI 551 C', ['500 L', '680 × 710 × 2000 mm', '2°C to 8°C', 'R290', '3', 'SS 201'], { t: [2, 8], cap: 500, name: 'Reach-In Static Cooler' }),
      m('RI 551 F', ['500 L', '680 × 710 × 2000 mm', '−16°C to −22°C', 'R290', '3', 'SS 201'], { t: [-22, -16], cap: 500, name: 'Reach-In Static Freezer' }),
      m('RI 1101 C', ['1000 L', '1340 × 710 × 2000 mm', '2°C to 8°C', 'R290', '6', 'SS 201'], { t: [2, 8], cap: 1000, name: 'Reach-In Static Cooler' }),
      m('RI 1101 F', ['1000 L', '1340 × 710 × 2000 mm', '−16°C to −22°C', 'R290', '6', 'SS 201'], { t: [-22, -16], cap: 1000, name: 'Reach-In Static Freezer' }),
    ],
  },
  {
    id: 'undercounter-static', category: 'professional-kitchen', subcategory: 'Undercounter Static', // p15
    name: 'Undercounter Static',
    description: 'Static-cooling undercounter with rounded internal edges. Also available in 3 door.',
    image: 'uc-1502',
    features: ['Adjustable shelves', 'Heavy-duty lockable castors', 'Lock', 'Removable gasket', 'Rounded internal edges', 'Optional: heavy-duty adjustable SS legs', HACCP],
    badges: ['HACCP', 'Digital Controller', 'Eco-Friendly Refrigerant', 'SS 201'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Temperature range', 'GN compatibility', 'Refrigerant', 'No. of shelves', 'Material'],
    shared: { 'Type of cooling': 'Static cooling' },
    models: [
      m('UC 1502C', ['265 L', '1360 × 700 × 860 mm', '2°C to 8°C', '1 × GN 1/1', 'R290', '2', 'SS 201'], { t: [2, 8], cap: 265 }),
      m('UC 1802C', ['400 L', '1795 × 700 × 860 mm', '2°C to 8°C', '1 × GN 1/1', 'R290', '3', 'SS 201'], { t: [2, 8], cap: 400 }),
    ],
  },

  /* ───────────── BAR REFRIGERATION ───────────── */
  {
    id: 'wine-chillers', category: 'bar-refrigeration', subcategory: 'Wine Chillers', // p17
    name: 'Wine Cooler',
    description: 'Dual temperature zone wine cooler with pull-out beech wooden shelves, an anti-vibration system and a double-layer anti-UV tinted glass door. Climate class 35°C.',
    image: 'ewg-130d',
    features: ['Actual and set temperature display', 'Lock', 'No frost', 'Elegant stainless steel door frame', 'Double-layer anti-UV tinted glass door', 'Cabinet colour: black', 'Charcoal filter', 'Blue LED lighting'],
    badges: ['Dual Temperature Zone', 'Frost Free'],
    labels: ['Dimensions (W × D × H)', 'Capacity (standard 750 ml)', 'Power consumption', 'Temperature range', 'No. of shelves', 'Adjustable feet / lock'],
    shared: { 'Climate class': '35°C' },
    models: [
      m('EWG 51 D', ['595 × 575 × 820 mm', '46 bottles', '70 W', '5°C to 12°C & 12°C to 22°C', '6', 'Yes / Yes'], { t: [5, 22], img: 'ewg-51d' }),
      m('EWG 130 D', ['595 × 680 × 1417 mm', '121 bottles', '120 W', '5°C to 12°C & 12°C to 22°C', '11', 'Yes / Yes'], { t: [5, 22] }),
    ],
  },
  {
    id: 'back-bars', category: 'bar-refrigeration', subcategory: 'Back Bars', // p17
    name: 'Back Bar',
    description: 'Back bar cooler with double-layer glass, self-closing doors and internal LED light. Also available in 3 door. Climate class 35°C.',
    image: 'ebb-2d',
    features: ['Double-layer glass', 'Digital controller', 'Self-closing door', 'Internal LED light', 'Lock'],
    badges: ['Digital Controller'],
    labels: ['Description', 'Dimensions (W × D × H)', 'Capacity', 'Power consumption', 'Temperature range', 'No. of shelves', 'Castors / lock'],
    shared: { 'Climate class': '35°C' },
    models: [
      m('EBB 1D / 1D SS', ['1 door back bar', '600 × 535 × 895 mm', '129 L', '230 W', '2°C to 10°C', '1 × 2', 'No / Yes'], { t: [2, 10], cap: 129 }),
      m('EBB 2D / 2D SS', ['2 door back bar', '900 × 535 × 895 mm', '202 L', '230 W', '2°C to 10°C', '2 × 2', 'No / Yes'], { t: [2, 10], cap: 202 }),
      m('EBB 3D / 3D SS', ['3 door back bar', '1350 × 535 × 895 mm', '320 L', '320 W', '2°C to 10°C', '3 × 2', 'No / Yes'], { t: [2, 10], cap: 320 }),
    ],
  },
  {
    id: 'undercounter-bars', category: 'bar-refrigeration', subcategory: 'Undercounter Bars', // p18
    name: 'Undercounter Bar',
    description: 'Glass froster and undercounter bars with double insulated glass, lockable doors and internal LED light.',
    image: 'egn-2100-cg',
    features: ['Double insulated glass', 'Adjustable shelves', 'Lockable doors', 'Internal LED light'],
    badges: [],
    labels: ['Description', 'Dimensions (W × D × H)', 'Capacity', 'Power consumption', 'Temperature range', 'No. of shelves', 'Castors'],
    models: [
      m('EGF 5G', ['1 door glass froster', '595 × 525 × 875 mm', '100 L', '280 W', '−2°C to −10°C', '2', 'No'], { t: [-10, -2], cap: 100, img: 'egf-5g', name: 'Glass Froster' }),
      m('EGN 2100 CG', ['2 door undercounter bar', '1360 × 700 × 860 mm', '265 L', '396 W', '2°C to 10°C', '2', 'Yes'], { t: [2, 10], cap: 265 }),
      m('EGN 3100 CG', ['3 door undercounter bar', '1795 × 700 × 860 mm', '400 L', '514 W', '2°C to 10°C', '3', 'Yes'], { t: [2, 10], cap: 400 }),
    ],
  },
  {
    id: 'beer-coolers', category: 'bar-refrigeration', subcategory: 'Beer & Beverage', // p18
    name: 'Draft Beer Cooler',
    description: 'Draft beer cooling units for towers in brass, copper, SS, raisin and ceramic finishes. Cooling solutions start from a single line up to 16 lines, backed by 5000+ installations in the country.',
    image: 'life', gallery: ['beer-tower'],
    features: ['Expandable design up to 10 taps', 'Premium Italian craftsmanship', 'Eco-friendly refrigerant', 'Optimised beer flow', 'Towers with illuminated and non-illuminated branding options'],
    badges: ['Eco-Friendly Refrigerant'],
    labels: ['Dimensions', 'Compressor', 'Tank capacity (water)', 'Ice bank', 'No. of coils / kegs', 'Rate of drink', 'Cooling capacity*'],
    shared: { '*Cooling capacity basis': 'Beer at 25°C input / 4°C output in 25°C ambient on peak load' },
    models: [
      m('Mini Lady', ['407 × 407 × 280 mm', '1/6 HP', '12 L', '4', '1–2 coils', '2 glass', '25 L/hr'], { img: 'mini-lady' }),
      m('Life 100', ['420 × 440 × 760 mm', '1/3 HP', '36 L', '15', '1–4 coils', '8 glass', '100 L/hr']),
      m('Life 130', ['480 × 490 × 840 mm', '1/2 HP', '50 L', '23', '1–8 coils', '10 glass', '130 L/hr']),
      m('Life 250', ['590 × 900 × 720 mm', '3/4 HP', '90 L', '40', '1–10 coils', '20 glass', '250 L/hr']),
      m('Kegerator 4', ['604 × 790 × 1000 mm', '1/4 HP', 'NA', 'NA', '4 slim kegs, 20 L', 'NA', 'NA'], { img: 'kegerator', name: 'Kegerator' }),
      m('Kegerator 6', ['1135 × 740 × 1020 mm', '1/3 HP', 'NA', 'NA', '6 slim kegs, 20 L', 'NA', 'NA'], { img: 'kegerator', name: 'Kegerator' }),
    ],
  },

  /* ───────────── CONFECTIONERY SHOWCASE ───────────── */
  {
    id: 'confectionery-platinum', category: 'confectionery-showcase', subcategory: 'Platinum', // p20
    name: 'Confectionery Showcase Platinum',
    description: 'Ventilated showcase with triple-pane heated glass and LED light on each shelf. Available in titanium steel and gold finish.',
    image: 'edc-platinum', gallery: ['edc-cakes'],
    features: ['Available in titanium steel & gold finish', 'Stainless steel interior', 'Copper evaporator', 'Copper condenser', 'Lockable castors for easy mobility', 'Triple-pane heated glass', 'LED light on each shelf'],
    badges: ['Premium', 'Digital Controller'],
    labels: ['Dimensions (W × D × H)', 'Temperature range', 'No. of shelves', 'Input power'],
    shared: { 'Type of cooling': 'Ventilated cooling' },
    models: [
      m('EDC 901 F3', ['900 × 700 × 1250 mm', '2°C to 8°C', 'Base + 3', '638 W'], { t: [2, 8] }),
      m('EDC 1201 F3', ['1200 × 700 × 1250 mm', '2°C to 8°C', 'Base + 3', '704 W'], { t: [2, 8] }),
      m('EDC 1501 F3', ['1500 × 700 × 1250 mm', '2°C to 8°C', 'Base + 3', '820 W'], { t: [2, 8] }),
      m('EDC 1801 F3', ['1800 × 700 × 1250 mm', '2°C to 8°C', 'Base + 3', '876 W'], { t: [2, 8] }),
    ],
  },
  {
    id: 'confectionery-classic', category: 'confectionery-showcase', subcategory: 'Classic', // p20
    name: 'Confectionery Showcase Classic',
    description: 'Ventilated showcase in stainless steel finish with double-pane glass and LED light on each shelf.',
    image: 'edc-classic',
    features: ['Available in stainless steel finish', 'Stainless steel interior', 'Lockable castors for easy mobility', 'Copper condenser', 'Copper evaporator', 'Double-pane glass', 'LED light on each shelf'],
    badges: ['Digital Controller'],
    labels: ['Dimensions (W × D × H)', 'Temperature range', 'No. of shelves', 'Input power'],
    shared: { 'Type of cooling': 'Ventilated cooling' },
    models: [
      m('EDC 702 F3', ['700 × 665 × 1235 mm', '2°C to 8°C', 'Base + 3', '612 W'], { t: [2, 8] }),
      m('EDC 902 F3', ['900 × 665 × 1235 mm', '2°C to 8°C', 'Base + 3', '638 W'], { t: [2, 8] }),
      m('EDC 1202 F3', ['1200 × 665 × 1235 mm', '2°C to 8°C', 'Base + 3', '704 W'], { t: [2, 8] }),
    ],
  },
  {
    id: 'confectionery-counter-top', category: 'confectionery-showcase', subcategory: 'Counter Top', // p21
    name: 'Counter Top Showcase',
    description: 'Counter-top showcase with tempered low-emissivity glass and LED lighting, in cold and heated versions. Colour and design options available against order with MOQ.',
    image: 'ehtc', gallery: ['ed-1202-c3'],
    features: ['Countertop design', 'Tempered & low-emissivity glass', 'Eco-friendly refrigerant', 'LED lighting', 'Curve glass against order with MOQ'],
    badges: ['Eco-Friendly Refrigerant'],
    labels: ['Dimensions (W × D × H)', 'Temperature range', 'No. of shelves'],
    models: [
      m('EHTC 100', ['695 × 462 × 670 mm', '2°C to 8°C', 'Base + 2'], { t: [2, 8], name: 'Counter Top Cold Showcase' }),
      m('EHTC 160', ['873 × 580 × 670 mm', '2°C to 8°C', 'Base + 2'], { t: [2, 8], name: 'Counter Top Cold Showcase' }),
      m('EHTH 160', ['873 × 580 × 670 mm', '30°C to 90°C', 'Base + 2'], { t: [30, 90], name: 'Counter Top Heated Showcase' }),
    ],
  },

  /* ───────────── ICE MACHINE ───────────── */
  {
    id: 'ice-machines', category: 'ice-machine', subcategory: 'Ice Machines', // p23-24
    name: 'Ice Machine',
    description: 'Air-cooled ice machines with vertical evaporators and SS 304 bodies. Available in flake and dice ice options, with in-built or separate storage bins.',
    image: 'eim-201',
    features: [
      'Low energy consumption: designed for maximum efficiency to reduce operating costs',
      'Low water consumption: conserves water without compromising performance',
      'Air-cooled system for consistent operation in varied environments',
      'Control board with display for monitoring and adjustments',
      'Vertical evaporator for reliable ice formation and improved efficiency',
    ],
    badges: ['SS 304', 'Energy Efficient'],
    applications: ['Bar', 'HoReCa', 'Hospitals', 'Sports', 'Pharma'],
    labels: ['Compatible bin model', 'Rated capacity', 'Bin size', 'Machine dimensions (W × D × H)', 'Power consumption', 'Water consumption / 24 hrs', 'Cube size', 'Electricals'],
    models: [
      m('EIM 26', ['In-built', '25 kg / 24 hrs', '7 kg', '380 × 470 × 600 mm', '180 W', '35 L', '22 × 22 × 22 mm', '220 V / 1 Ph / 50 Hz'], { img: 'eim-101' }),
      m('EIM 41 BW', ['In-built', '36 kg / 24 hrs', '15 kg', '500 × 450 × 800 mm', '300 W', '50 L', '22 × 22 × 22 mm', '220 V / 1 Ph / 50 Hz'], { img: 'eim-bw' }),
      m('EIM 61 BW', ['In-built', '55 kg / 24 hrs', '18 kg', '500 × 590 × 850 mm', '360 W', '80 L', '22 × 22 × 22 mm', '220 V / 1 Ph / 50 Hz'], { img: 'eim-bw' }),
      m('EIM 101', ['In-built', '95 kg / 24 hrs', '36 kg', '660 × 685 × 920 mm', '580 W', '150 L', '22 × 22 × 22 mm', '220 V / 1 Ph / 50 Hz'], { img: 'eim-101' }),
      m('EIM 201', ['B 275', '191 kg / 24 hrs', '125 kg', '560 × 830 × 1718 mm', '1100 W', '286 L', '22 × 22 × 22 mm', '220 V / 1 Ph / 50 Hz']),
      m('EIM 351', ['B 375', '318 kg / 24 hrs', '170 kg', '760 × 830 × 1718 mm', '1420 W', '477 L', '22 × 22 × 22 mm', '220 V / 1 Ph / 50 Hz']),
      m('EIM 501', ['B 375', '455 kg / 24 hrs', '170 kg', '760 × 830 × 1893 mm', '2300 W', '682 L', '22 × 22 × 22 mm', '220 V / 1 Ph / 50 Hz']),
      m('EIM 1001', ['B 775', '909 kg / 24 hrs', '350 kg', '1227 × 973 × 2048 mm', '3800 W', '1363 L', '22 × 22 × 22 mm', '380 V / 1 Ph / 50 Hz'], { img: 'eim-1001' }),
    ],
  },
  {
    id: 'ice-flaker', category: 'ice-machine', subcategory: 'Ice Flakers', // p24
    name: 'Ice Flaker',
    description: 'Flake ice machine with in-built bin, high-performing compressor and an energy-efficient cooling unit. Supplied with a free pre-filter.',
    image: 'efm-101',
    features: ['High-performing compressor', 'Eco-friendly refrigerant', 'Energy-efficient cooling unit', 'Free pre-filter'],
    badges: ['SS 304', 'Energy Efficient', 'Eco-Friendly Refrigerant'],
    applications: ['Seafood Display', 'Salad Bars & Buffets', 'Bakeries & Desserts', 'Medical Storage', 'Catering & Events'],
    labels: ['Compatible bin model', 'Rated capacity', 'Bin size', 'Machine dimensions (W × D × H)', 'Power consumption', 'Water consumption / 24 hrs', 'Electricals'],
    models: [m('EFM 101', ['In-built', '100 kg / 24 hrs', '20 kg', '520 × 550 × 960 mm', '330 W', '110 L', '220 V / 1 Ph / 50 Hz'])],
  },

  /* ───────────── BEVERAGE SOLUTION ───────────── */
  {
    id: 'juice-dispenser-twin', category: 'beverage-solution', subcategory: 'Juice Dispensers', // p26
    name: 'Juice Dispenser',
    description: 'Twin-bowl juice dispenser with food-grade polycarbonate bowls and intelligent temperature control. Climate class 32°C.',
    image: 'jd-lp',
    features: ['Food-grade polycarbonate (PC) bowls', 'Intelligent temperature control', 'Stainless evaporator, built-in copper coil', 'Super cooling', 'Humanised residual liquid pipe design', 'Low maintenance, high-volume dispensing'],
    badges: [],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Power', 'Current', 'Weight'],
    shared: { 'Power supply': '220 V / 50 Hz', 'Climate class': '32°C' },
    models: [
      m('JD LP 8X2', ['8 L × 2', '290 × 400 × 680 mm', '230 W', '1.6 A', '24 kg'], { cap: 16 }),
      m('JD LJH 16X2', ['16 L × 2', '340 × 485 × 635 mm', '260 W', '2.0 A', '25 kg'], { cap: 32, img: 'jd-ljh-16' }),
    ],
  },
  {
    id: 'juice-dispenser-single', category: 'beverage-solution', subcategory: 'Juice Dispensers', // p26
    name: 'Juice Dispenser with Agitator',
    description: 'Single 20 litre bowl juice dispenser with agitator and an advanced cooling system. Climate class 32°C.',
    image: 'jd-ljh-20',
    features: ['Food-grade polycarbonate (PC) bowl', 'Intelligent temperature control', 'Stainless evaporator, built-in copper coil', 'Super cooling', 'Agitator', 'Advanced cooling system'],
    badges: [],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Power', 'Current', 'Weight'],
    shared: { 'Power supply': '220 V / 50 Hz', 'Climate class': '32°C' },
    models: [m('JD LJH 20', ['20 L', '372 × 412 × 724 mm', '180 W', '2.0 A', '21 kg'], { cap: 20 })],
  },
  {
    id: 'slush-dispenser', category: 'beverage-solution', subcategory: 'Slush Dispensers', // p27
    name: 'Slush Dispenser',
    description: 'Slush dispenser with high-density food-grade polycarbonate bowls, a liquid crystal display and an energy-saving mode. Climate class 32°C.',
    image: 'fbx',
    features: ['High-density food-grade polycarbonate (PC) bowls', 'Liquid crystal display, intelligent temperature control', 'Stainless steel evaporator, built-in copper coil', 'Energy-saving mode', 'Quick cooling for fast slush', 'Easy-pour dispenser'],
    badges: ['Energy Efficient'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Power', 'Current', 'Weight'],
    shared: { 'Power supply': '220 V / 50 Hz', 'Climate class': '32°C' },
    models: [
      m('FB XC 112', ['12 L × 1', '340 × 480 × 820 mm', '480 W', '3.3 A', '31 kg'], { cap: 12 }),
      m('FB XC 224', ['12 L × 2', '400 × 480 × 820 mm', '900 W', '5.5 A', '46 kg'], { cap: 24 }),
      m('FB XC 336', ['12 L × 3', '600 × 480 × 820 mm', '1050 W', '6.0 A', '65 kg'], { cap: 36 }),
    ],
  },
  {
    id: 'softy-machine', category: 'beverage-solution', subcategory: 'Softy Machines', // p27
    name: 'Softy Ice Cream Machine',
    description: 'Air-cooled soft-serve machine with SS beater, low premix alarm, night mode and defrost option. Climate class 38°C.',
    image: 'ssd-720t',
    features: ['SS beater', 'Low premix alarm', 'Night mode', 'Defrost option', 'Pre-mix guard for flavour protection', 'Dual flavour serving option', 'Fast cooling system'],
    badges: [],
    labels: ['Voltage', 'Rated input', 'Drive motor', 'Freezing cylinder', 'Mix hopper', 'Production', 'Refrigerant', 'Cooling type', 'Dimensions (W × D × H)'],
    shared: { 'Climate class': '38°C' },
    models: [
      m('SSD 720T', ['220 V / 50 Hz', '2600 W', '1100 W', '2 × 1.6 L', '2 × 5.5 L', '24 L/hr', 'R404a, 1.5 HP', 'Air-cooled', '540 × 870 × 810 mm']),
      m('D 200', ['220 V / 50 Hz', '1200 W', '200 W', '1.6 L', '5.5 L', '13 L/hr', 'R404a, 3/4 HP', 'Air-cooled', '220 × 710 × 740 mm']),
    ],
  },

  /* ───────────── MINI BAR & MINI FRIDGE ───────────── */
  {
    id: 'mini-bar', category: 'mini-bar-mini-fridge', subcategory: 'Mini Bar', // p29
    name: 'Mini Bar',
    description: 'Silent mini bar for hotels under 27°C ambient, in solid and glass door. Colour options: black, brown and white (MOQ of 200 for brown and white).',
    image: 'rb-41',
    features: ['Silent operation', 'Reversible door', 'Temperature controller', 'Low energy consumption', 'Available sizes 30 to 60 litres', 'Colour options: black, brown & white'],
    badges: ['Energy Efficient'],
    labels: ['Door option', 'Capacity', 'Input power', 'Energy consumption', 'Temperature range', 'Dimensions (W × D × H)'],
    shared: { 'Climate class': '27°C' },
    models: [
      m('RB 31', ['Solid', '30 L', '65 W', '0.7 kWh', '2°C to 10°C', '402 × 440 × 500 mm'], { t: [2, 10], cap: 30 }),
      m('RB 31 G', ['Glass', '30 L', '65 W', '0.7 kWh', '2°C to 10°C', '402 × 428 × 500 mm'], { t: [2, 10], cap: 30, img: 'rb-41g' }),
      m('RB 41', ['Solid', '40 L', '65 W', '0.7 kWh', '2°C to 10°C', '402 × 465 × 560 mm'], { t: [2, 10], cap: 40 }),
      m('RB 41 G', ['Glass', '40 L', '65 W', '0.7 kWh', '2°C to 10°C', '402 × 453 × 560 mm'], { t: [2, 10], cap: 40, img: 'rb-41g' }),
    ],
  },
  {
    id: 'mini-fridge', category: 'mini-bar-mini-fridge', subcategory: 'Mini Fridge', // p30
    name: 'Mini Fridge',
    description: 'Compact mini fridge designed to perform at 35°C, in black, silver and grey. Lock optional.',
    image: 'rf-57',
    features: ['Low noise', 'Lock optional', 'Temperature controller', 'Low energy consumption', 'Compact design maximises space', 'Colour options: black, silver, grey'],
    badges: ['Energy Efficient', 'Eco-Friendly Refrigerant'],
    labels: ['Door option', 'Capacity', 'Input power', 'Energy consumption', 'Temperature range', 'Dimensions (W × D × H)', 'Container load (20 / 40 HC)'],
    shared: { 'Climate class': '38°C' },
    models: [
      m('RF 55 G', ['Glass', '50 L', '80 W', '1.0 kWh', '2°C to 10°C', '450 × 470 × 500 mm', '220 / 550'], { t: [2, 10], cap: 50, img: 'rf-55g' }),
      m('RF 57', ['Solid', '48 L', '55 W', '0.7 kWh', '2°C to 10°C', '455 × 460 × 520 mm', '220 / 575'], { t: [2, 10], cap: 48 }),
      m('RF 107', ['Solid', '92 L', '55 W', '0.7 kWh', '2°C to 10°C', '455 × 495 × 845 mm', '110 / 230'], { t: [2, 10], cap: 92, img: 'rf-107' }),
    ],
  },

  /* ───────────── RETAIL SOLUTION ───────────── */
  {
    id: 'special-products', category: 'retail-solution', subcategory: 'Special Products', // p32
    name: 'Counter Top Showcase / Can Cooler',
    description: 'Counter-top showcases, coolers, freezers and can coolers designed to transform your store into an experience.',
    image: 'ecg-60',
    features: ['Counter-top footprint', 'Branding-ready canopy and body', 'Electricals: 220 V, 50 Hz, single phase'],
    badges: [],
    labels: ['Dimensions (W × D × H)', 'Capacity', 'Temperature range', 'Climate class', 'No. of 330 ml cans', 'Input power'],
    models: [
      m('ECG 26', ['330 × 415 × 610 mm', '26 L', '2°C to 8°C', '35°C', '24', '76 W'], { t: [2, 8], cap: 26, img: 'ecg-26', name: 'Counter Top Cooler' }),
      m('ECG 60', ['435 × 455 × 700 mm', '60 L', '2°C to 8°C', '35°C', '78', '120 W'], { t: [2, 8], cap: 60, name: 'Counter Top Cooler' }),
      m('ECG 85', ['480 × 510 × 805 mm', '85 L', '2°C to 8°C', '35°C', '105', '120 W'], { t: [2, 8], cap: 85, img: 'ecg-85', name: 'Counter Top Cooler' }),
      // Catalogue prints capacity as "10" for ECG 105; reproduced as printed. Confirm with Elanpro.
      m('ECG 105', ['470 × 535 × 812 mm', '10 L (as printed)', '2°C to 8°C', '35°C', '90', '120 W'], { t: [2, 8], img: 'ecg-105', name: 'Counter Top Cooler' }),
      m('CC 61', ['451 × 925 mm', '60 L', '2°C to 8°C', '32°C', '88', '129 W'], { t: [2, 8], cap: 60, img: 'cc-61', name: 'Can Cooler' }),
      m('SD 51 C', ['550 × 533 × 660 mm', '50 L', '−18°C to −20°C', '32°C', 'NA', '197 W'], { t: [-20, -18], cap: 50, img: 'sd-51c', name: 'Counter Top Freezer' }),
    ],
  },
  {
    id: 'milk-cooler', category: 'retail-solution', subcategory: 'Milk Cooler', // p32
    name: 'Milk Cooler',
    description: 'Milk cooler with temperature display, two side ports for placement on either side of your coffee machine, a built-in fan and a built-in glass container for fresh milk storage. Offered in solid or glass door.',
    image: 'bc9cn',
    features: ['Digital controller with temperature display', 'Energy-efficient compressor', 'Dual-side port', '4.5 litre milk container', 'Built-in fan for the most appropriate milk temperature'],
    badges: ['Digital Controller', 'Energy Efficient'],
    labels: ['Dimensions (W × D × H)', 'Capacity', 'Temperature range', 'Ambient', 'Milk container', 'Input power'],
    shared: { Electricals: '220 V, 50 Hz, single phase' },
    models: [m('BC9CN', ['220 × 452 × 456 mm', '9 L', '2°C to 5°C', '32°C', '4.5 L', '76 W'], { t: [2, 5], cap: 9 })],
  },
  {
    id: 'flat-glass-top', category: 'retail-solution', subcategory: 'Flat Glass Top', // p33
    name: 'Flat Glass Top Freezer',
    description: 'Premium series flat glass top freezer with sliding glass door, unique dual condenser and high insulation.',
    image: 'ekg-flat',
    features: ['High-performing cooling system', 'Low power consumption', 'Sliding glass door', 'Durable castors', 'High insulation', 'Unique dual condenser', 'Digital display'],
    badges: ['Energy Efficient', 'Eco-Friendly Refrigerant'],
    labels: ['Star rating', 'Capacity', 'Dimensions (W × D × H)', 'Baskets', 'LED', 'Energy consumption', 'Castors', 'Lock'],
    shared: { 'Temperature range': '−16°C to −24°C', 'Digital display': 'Yes' },
    models: [
      m('EKG 205 AG', ['5', '197 L', '934 × 574 × 825 mm', '2 Q3', 'No', '970 kWh/yr', 'Yes', 'Yes'], { t: [-24, -16], cap: 197 }),
      m('EKG 305 AG', ['5', '285 L', '1014 × 694 × 844 mm', '1 Q3 + 1 Q6', 'Yes', '1113 kWh/yr', 'Yes', 'Yes'], { t: [-24, -16], cap: 285 }),
      m('EKG 405 AG', ['5', '363 L', '1224 × 694 × 844 mm', '1 Q3 + 1 Q6', 'Yes', '1278 kWh/yr', 'Yes', 'Yes'], { t: [-24, -16], cap: 363 }),
      m('EKG 505 AG', ['5', '439 L', '1434 × 694 × 844 mm', '1 Q3 + 1 Q6', 'Yes', '1672 kWh/yr', 'Yes', 'Yes'], { t: [-24, -16], cap: 439 }),
      m('EKG 650 G', ['5', '566 L', '1800 × 694 × 850 mm', '9', 'Yes', '2007 kWh/yr', 'Yes', 'Yes'], { t: [-24, -16], cap: 566 }),
    ],
  },
  {
    id: 'curved-glass-top', category: 'retail-solution', subcategory: 'Curved Glass Top', // p33
    name: 'Curve Glass Top Freezer',
    description: 'Premium series curve glass top freezer with sliding glass door, unique dual condenser and LED inside.',
    image: 'ekg-curve',
    features: ['High insulation', 'Low power consumption', 'Sliding glass door', 'Durable castors', 'Unique dual condenser', 'LED inside'],
    badges: ['Energy Efficient', 'Eco-Friendly Refrigerant'],
    labels: ['Star rating', 'Capacity', 'Dimensions (W × D × H)', 'Baskets', 'Digital display', 'Energy consumption', 'Castors', 'Lock'],
    shared: { 'Temperature range': '−16°C to −24°C', LED: 'Yes' },
    models: [
      m('EKG 215 DPG', ['4', '169 L', '785 × 656 × 839 mm', '1', 'Yes', '920 kWh/yr', 'Yes', 'Yes'], { t: [-24, -16], cap: 169 }),
      m('EKG 310 DLG', ['3', '255 L', '1000 × 649 × 850 mm', '4', 'No', '1460 kWh/yr', 'Yes', 'Yes'], { t: [-24, -16], cap: 255 }),
      m('EKG 410 DLG', ['4', '330 L', '1224 × 649 × 850 mm', '4', 'Yes', '1552 kWh/yr', 'Yes', 'Yes'], { t: [-24, -16], cap: 330 }),
      m('EKG 415 DLG', ['4', '333 L', '1225 × 695 × 918 mm', '5', 'Yes', '1321 kWh/yr', 'Yes', 'Yes'], { t: [-24, -16], cap: 333 }),
      m('EKG 626 DLG', ['4', '574 L', '1844 × 694 × 850 mm', '8', 'Yes', '2336 kWh/yr', 'Yes', 'Yes'], { t: [-24, -16], cap: 574 }),
    ],
  },
  {
    id: 'hard-top-milk-cooler', category: 'retail-solution', subcategory: 'Hard Top', // p34
    name: 'Hard Top Milk Cooler',
    description: 'Hard top milk cooler with hinge door, high insulation and 4-side cooling. Tropicalised at 43°C.',
    image: 'mc-205g',
    features: ['High insulation', 'Castors for easy mobility', 'Hinge door', 'Tropicalised at 43°C', 'Big on storage space', '4-side cooling'],
    badges: ['Energy Efficient', 'Eco-Friendly Refrigerant'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Baskets', 'No. of doors', 'Energy consumption', 'Castors', 'Lock'],
    shared: { 'Temperature range': '2°C to 8°C' },
    models: [
      m('MC 76', ['76 L', '404 × 610 × 830 mm', '1', '1', 'NA', 'NA', 'Yes'], { t: [2, 8], cap: 76 }),
      m('MC 105G', ['98 L', '550 × 475 × 848 mm', '1', '1', '310 kWh/yr', 'NA', 'Yes'], { t: [2, 8], cap: 98 }),
      m('MC 205G', ['197 L', '820 × 554 × 848 mm', '1', '1', '493 kWh/yr', 'Yes', 'Yes'], { t: [2, 8], cap: 197 }),
    ],
  },
  {
    id: 'hard-top-fow', category: 'retail-solution', subcategory: 'Hard Top', // p34
    name: 'Hard Top Freezer (FOW)',
    description: 'Hard top freezer on wheels with hinge door and high insulation. Tropicalised at 43°C.',
    image: 'mc-205g',
    features: ['High insulation', 'Hinge door', 'Tropicalised at 43°C', '4-side cooling'],
    badges: ['Eco-Friendly Refrigerant'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'No. of doors'],
    shared: { 'Temperature range': '−18°C to −28°C' },
    models: [
      m('PCF 110', ['110 L', '980 × 645 × 825 mm', '1'], { t: [-28, -18], cap: 110 }),
      m('PCF 200', ['200 L', '1035 × 645 × 905 mm', '2'], { t: [-28, -18], cap: 200 }),
    ],
  },
  {
    id: 'hard-top-freezer-chiller', category: 'retail-solution', subcategory: 'Hard Top', // p34
    name: 'Hard Top Freezer cum Chiller',
    description: 'Premium series dual-temperature convertible freezer and chiller, designed to perform at 43°C ambient with extra-low cooling up to −32°C.',
    image: 'ef-555g',
    features: ['Dual-temperature convertible freezer & chiller', 'High insulation', 'Castors for easy mobility', 'Hinge door', 'Unique dual condenser', 'Extra-low cooling up to −32°C', 'Designed to perform at high ambient 43°C'],
    badges: ['Energy Efficient', 'Premium'],
    labels: ['Star rating', 'Capacity', 'Dimensions (W × D × H)', 'Baskets', 'No. of doors', 'Energy consumption', 'Castors', 'Lock'],
    shared: { 'Temperature range': '2°C to 8°C / −18°C to −25°C' },
    models: [
      m('EF 305 GDD', ['4', '283 L', '1100 × 662 × 886 mm', '1', '2', '767 kWh/yr', 'Yes', 'Yes'], { t: [-25, 8], cap: 283 }),
      m('EF 455 G', ['5', '375 L', '1309 × 693 × 838 mm', '2', '2', '785 kWh/yr', 'Yes', 'Yes'], { t: [-25, 8], cap: 375 }),
      m('EF 555 G', ['5', '465 L', '1653 × 695 × 842 mm', '2', '2', '803 kWh/yr', 'Yes', 'Yes'], { t: [-25, 8], cap: 465 }),
      m('EF 825 G', ['5', '757 L', '2415 × 695 × 842 mm', '2', '3', '1442 kWh/yr', 'Yes', 'Yes'], { t: [-25, 8], cap: 757 }),
      m('EF 875', ['5', '805 L', '1848 × 857 × 960 mm', '1', '3', '1311 kWh/yr', 'NA', 'Yes'], { t: [-25, 8], cap: 805 }),
    ],
  },
  {
    id: 'hard-top-combi', category: 'retail-solution', subcategory: 'Hard Top', // p34
    name: 'Hard Top Combi (Freezer + Chiller)',
    description: 'Premium series hard top combi with separate freezer and chiller compartments.',
    image: 'ef-555g',
    features: ['High insulation', 'Castors for easy mobility', 'Hinge door'],
    badges: [],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Baskets', 'No. of doors', 'Castors', 'Lock'],
    shared: { 'Temperature range': '2°C to 8°C / −16°C to −25°C' },
    models: [
      m('EF 290', ['189 L freezer + 98 L chiller', '1200 × 602 × 866 mm', '1', '2', 'Yes', 'Yes'], { t: [-25, 8], cap: 287 }),
      m('EF 390', ['160 L freezer + 201 L chiller', '1309 × 692 × 924 mm', '1', '2', 'Yes', 'Yes'], { t: [-25, 8], cap: 361 }),
    ],
  },
  {
    id: 'upright-chiller', category: 'retail-solution', subcategory: 'Upright Showcase Chiller', // p35
    name: 'Upright Display Chiller',
    description: 'Upright showcase chiller designed for high ambient, with a back-lit canopy that boosts branding and LED lighting for better visibility.',
    image: 'ecg-305',
    features: ['LED lighting for better visibility', 'Low power consumption', 'High insulation', 'Removable gasket', 'Castor & lock available', 'Back-lit canopy boosts branding', 'Adjustable shelves'],
    badges: ['Energy Efficient', 'Eco-Friendly Refrigerant'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Shelves', 'Doors / type', 'Temperature range', 'Digital controller', 'Input power'],
    models: [
      m('ECG 205', ['200 L', '500 × 578 × 1520 mm', '3', '1 / Glass', '2°C to 10°C', 'NA', '124 W'], { t: [2, 10], cap: 200 }),
      m('ECG 305', ['300 L', '560 × 618 × 1674 mm', '4', '1 / Glass', '2°C to 10°C', 'NA', '164 W'], { t: [2, 10], cap: 300 }),
      m('ECG 405', ['400 L', '645 × 618 × 1914 mm', '4', '1 / Glass', '2°C to 10°C', 'NA', '256 W'], { t: [2, 10], cap: 400 }),
      m('ECG 515', ['515 L', '680 × 660 × 1970 mm', '4', '1 / Glass', '2°C to 10°C', 'Yes', '260 W'], { t: [2, 10], cap: 515, img: 'ecg-515' }),
      m('ECG 606', ['600 L', '850 × 720 × 2205 mm', '5', '1 / Glass', '2°C to 10°C', 'NA', '325 W'], { t: [2, 10], cap: 600, img: 'ecg-515' }),
      m('ECG 775', ['730 L', '1050 × 640 × 2020 mm', '8', '2 / Glass', '2°C to 10°C', 'Yes', '360 W'], { t: [2, 10], cap: 730, img: 'ecg-1506' }),
      m('ECG 1075', ['1023 L', '1215 × 730 × 2020 mm', '8', '2 / Glass', '2°C to 10°C', 'Yes', '420 W'], { t: [2, 10], cap: 1023, img: 'ecg-1506' }),
      m('ECG 1506', ['1500 L', '1800 × 590 × 2015 mm', '12', '3 / Glass', '2°C to 10°C', 'Yes', '600 W'], { t: [2, 10], cap: 1500, img: 'ecg-1506' }),
    ],
  },
  {
    id: 'upright-freezer', category: 'retail-solution', subcategory: 'Upright Showcase Freezer', // p35
    name: 'Upright Display Freezer',
    description: 'Frost-free upright showcase freezer with triple-pane heated glass door, tropicalised for harsh Indian weather conditions.',
    image: 'efgv',
    features: ['LED lighting for better visibility', 'High insulation', 'Removable gasket', 'Tropicalised for harsh Indian weather conditions', 'Castor & lock available', 'Triple-pane heated glass door', 'Frost-free technology'],
    badges: ['Frost Free', 'Digital Controller', 'Eco-Friendly Refrigerant'],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Shelves', 'Doors / type', 'Temperature range', 'Digital controller', 'Input power'],
    models: [
      m('EFGV 175', ['144 L', '460 × 610 × 1390 mm', '3', '1 / Glass', '−16°C to −20°C', 'Yes', '320 W'], { t: [-20, -16], cap: 144 }),
      m('EFGV 275', ['213 L', '460 × 610 × 1820 mm', '4', '1 / Glass', '−16°C to −20°C', 'Yes', '380 W'], { t: [-20, -16], cap: 213 }),
      m('EFGV 375', ['375 L', '600 × 610 × 1750 mm', '4', '1 / Glass', '−16°C to −20°C', 'Yes', '760 W'], { t: [-20, -16], cap: 375 }),
      m('EFGV 500', ['500 L', '680 × 700 × 2020 mm', '4', '1 / Glass', '−16°C to −20°C', 'Yes', '760 W'], { t: [-20, -16], cap: 500 }),
      m('EFGV 1000', ['1000 L', '1370 × 700 × 1985 mm', '10', '2 / Glass', '−16°C to −20°C', 'Yes', '1011 W'], { t: [-20, -16], cap: 1000 }),
      m('EFGV 1500', ['1500 L', '2057 × 700 × 1985 mm', '15', '3 / Glass', '−16°C to −20°C', 'Yes', '1300 W'], { t: [-20, -16], cap: 1500 }),
    ],
  },

  /* ───────────── SCOOPING PARLOUR ───────────── */
  {
    id: 'scooping-cabinet', category: 'scooping-parlour', subcategory: 'Scooping Cabinets', // p37
    name: 'Scooping Cabinet',
    description: 'Scooping cabinet with optimised temperature control, front illuminated panel, illuminated LED interior and additional storage space at the base.',
    image: 'sd-575',
    features: ['Optimised temperature control', 'Front illuminated panel', 'Additional storage space at base', 'Illuminated LED interior'],
    badges: [],
    labels: ['Capacity', 'Dimensions (W × D × H)', 'Pans (optional)', 'Energy consumption', 'Castors', 'Lock'],
    models: [
      m('SD 415 S2', ['400 L', '1350 × 838 × 1270 mm', '9 × GN 1/3', '2029 kWh/yr', 'Yes', 'Yes'], { cap: 400 }),
      m('SD 575 S2', ['535 L', '1720 × 838 × 1270 mm', '12 × GN 1/3', '2555 kWh/yr', 'Yes', 'Yes'], { cap: 535 }),
    ],
  },
  {
    id: 'serve-over', category: 'scooping-parlour', subcategory: 'Serve Over Counters', // p37
    name: 'Serve Over Counter',
    description: 'Self-service and serve-over counters with uniform cooling, electronic temperature display, food-grade steel interior and automatic defrost.',
    image: 'sps',
    features: ['Uniform cooling', 'Electronic temperature display', 'Food-grade interior steel', 'Automatic defrost system'],
    badges: [],
    labels: ['Type', 'Capacity', 'Dimensions (W × D × H)', 'Temperature range'],
    shared: { Electricals: '220 V, 50 Hz, single phase' },
    models: [
      m('SPS 125', ['Serve over', '238 L', '1320 × 1160 × 885 mm', '1°C to 5°C'], { t: [1, 5], cap: 238 }),
      m('SPS 188', ['Serve over', '358 L', '1945 × 1160 × 885 mm', '1°C to 5°C'], { t: [1, 5], cap: 358 }),
      m('SCS 125', ['Serve over', '238 L', '1320 × 1210 × 1200 mm', '1°C to 5°C'], { t: [1, 5], cap: 238, img: 'scs' }),
      m('SCS 188', ['Serve over', '358 L', '1945 × 1210 × 1200 mm', '1°C to 5°C'], { t: [1, 5], cap: 358, img: 'scs' }),
    ],
  },

  /* ───────────── SUPERMARKET ───────────── */
  {
    id: 'plug-in-multideck-shf', category: 'supermarket', subcategory: 'Plug-in Multideck Chiller', // p39
    name: 'Plug-in Multideck Chiller',
    description: 'Slim plug-in multideck with an ultra-low front handrail for easy loading, rear air return and a low-noise compressor.',
    image: 'shf',
    features: ['Ultra-low front handrail for easy loading / unloading', 'Rear air return and low-noise compressor for uniform cooling', 'LED lighting for better display visibility and energy savings', 'Optional pull-out drawers for convenient goods handling', 'Night curtain', 'Adjustable LED shelves'],
    badges: ['R290', 'Energy Efficient'],
    labels: ['Dimensions*', 'Temperature range', 'Effective capacity', 'Display area', 'Input power', 'Voltage'],
    shared: { '*Dimensions note': 'Including 25 mm × 2 side panels width' },
    models: [
      m('SHF-70-55-15D', ['750 × 550 × 1500 mm', '2°C to 7°C', '166 L', '0.98 m²', '487 W', '220 V / 50 Hz'], { t: [2, 7], cap: 166 }),
      m('SHF-91-55-15D', ['960 × 550 × 1500 mm', '2°C to 7°C', '220 L', '1.34 m²', '556 W', '220 V / 50 Hz'], { t: [2, 7], cap: 220 }),
    ],
  },
  {
    id: 'plug-in-multideck-sf', category: 'supermarket', subcategory: 'Plug-in Multideck Chiller', // p39
    name: 'Plug-in Multideck Chiller',
    description: 'Full-height plug-in multideck with a high-efficiency integrated refrigeration system, optimised air curtain and night curtain.',
    image: 'sf',
    features: ['Advanced electronic controller', 'High-efficiency integrated refrigeration system', 'Night curtain minimises standby energy use', 'Magnetic front cover for quick maintenance', 'Optimised air curtain', 'Eco-friendly foam cabinet', 'Adjustable shelves'],
    badges: ['Energy Efficient'],
    labels: ['Dimensions*', 'Temperature range', 'Effective capacity', 'Display area', 'Input power', 'Voltage'],
    shared: { '*Dimensions note': 'Including 25 mm × 2 side panels width' },
    models: [
      m('SF-93-76-19', ['1050 × 770 × 1900 mm', '2°C to 7°C', '505 L', '2.34 m²', '1100 W', '220 V / 50 Hz'], { t: [2, 7], cap: 505 }),
      m('SF-125-76-19', ['1360 × 770 × 1900 mm', '2°C to 7°C', '645 L', '2.71 m²', '1320 W', '220 V / 50 Hz'], { t: [2, 7], cap: 645 }),
      m('SF-188-76-19', ['1985 × 770 × 1900 mm', '2°C to 7°C', '970 L', '3.57 m²', '1800 W', '220 V / 50 Hz'], { t: [2, 7], cap: 970 }),
    ],
  },
  {
    id: 'remote-multideck', category: 'supermarket', subcategory: 'Remote Multideck Chiller', // p40
    name: 'Remote Multideck Chiller',
    description: 'Remote multideck with a flexible air curtain to reduce cooling loss, night curtain and LED lighting.',
    image: 'rf-multideck',
    features: ['Flexible air curtain to reduce cooling loss', 'Night curtain saves standby energy', 'LED lighting for better visibility', 'Adjustable shelves for display needs', 'Optional pull-out drawers for convenience', 'Eco-friendly foam cabinet'],
    badges: ['Energy Efficient'],
    labels: ['Dimensions*', 'Temperature range', 'Effective capacity', 'Display area', 'Input power', 'Cooling capacity', 'Voltage'],
    shared: { '*Dimensions note': 'Including 25 mm × 2 side panels width' },
    models: [
      m('RF-188-76-19', ['1925 × 770 × 1900 mm', '2°C to 7°C', '1100 L', '2.64 m²', '128 W', '2.36 kW', '220 V / 50 Hz'], { t: [2, 7], cap: 1100 }),
      m('RF-250-76-19', ['2550 × 770 × 1900 mm', '2°C to 7°C', '1400 L', '3.53 m²', '182 W', '3.1 kW', '220 V / 50 Hz'], { t: [2, 7], cap: 1400 }),
    ],
  },
  {
    id: 'chiller-cabinet', category: 'supermarket', subcategory: 'Chiller Cabinet', // p40
    name: 'Chiller Cabinet, 2 / 3 Doors',
    description: 'Glass-door chiller cabinets in plug-in (SM series) and remote (RM series) builds, with anti-condensation, automatic-return glass doors.',
    image: 'sm',
    features: ['Anti-condensation glass door', 'Automatic return glass door', 'Customised electronic controller', 'Energy-efficient refrigeration'],
    badges: ['Energy Efficient'],
    labels: ['Dimensions', 'Temperature range', 'Effective capacity', 'Display area', 'Input power', 'Voltage', 'Type'],
    models: [
      m('SM2D-131-75-19', ['1310 × 750 × 1930 mm', '2°C to 7°C', '944 L', '1.31 m²', '610 W', '220 V / 50 Hz', 'Plug-in'], { t: [2, 7], cap: 944 }),
      m('SM3D-197-75-19', ['1965 × 750 × 1930 mm', '2°C to 7°C', '1473 L', '1.97 m²', '830 W', '220 V / 50 Hz', 'Plug-in'], { t: [2, 7], cap: 1473 }),
      m('RM2D-131A-75-19', ['1310 × 750 × 1930 mm', '2°C to 7°C', '1050 L', '1.5 m²', '230 W', '220 V / 50 Hz', 'Remote'], { t: [2, 7], cap: 1050, img: 'rm' }),
      m('RM3D-197A-75-19', ['1965 × 750 × 1930 mm', '2°C to 7°C', '1550 L', '2.25 m²', '380 W', '220 V / 50 Hz', 'Remote'], { t: [2, 7], cap: 1550, img: 'rm' }),
    ],
  },
  {
    id: 'freezer-cabinet-plug-in', category: 'supermarket', subcategory: 'Freezer Cabinet', // p41
    name: 'Plug-in Freezer Cabinet, 2 / 3 Doors',
    description: 'Plug-in glass-door freezer cabinet with a high-efficiency defrosting design, automatic dust removal and a flexible air curtain.',
    image: 'sl',
    features: ['High-efficiency defrosting design', 'Automatic dust removal', 'Flexible air curtain', 'Energy-efficient refrigeration'],
    badges: ['Energy Efficient'],
    labels: ['Dimensions', 'Temperature', 'Effective capacity', 'Display area', 'Input power', 'Voltage'],
    models: [
      m('SL2D-131-75-19', ['1310 × 750 × 1930 mm', '≤ −18°C', '750 L', '1.31 m²', '610 W', '220 V / 50 Hz'], { t: [-18, -18], cap: 750 }),
      m('SL3D-197-75-19', ['1965 × 750 × 1930 mm', '≤ −18°C', '1170 L', '1.97 m²', '830 W', '220 V / 50 Hz'], { t: [-18, -18], cap: 1170 }),
    ],
  },
  {
    id: 'freezer-cabinet-remote', category: 'supermarket', subcategory: 'Freezer Cabinet', // p41
    name: 'Remote Freezer Slim Cabinet, 2 / 3 Doors',
    description: 'Remote slim freezer cabinet with aluminium alloy handles and inclined price tags.',
    image: 'rl',
    features: ['Aluminium alloy handle', 'Inclined price tag', 'Eco-friendly refrigerant', 'Convenient humanised design'],
    badges: ['Eco-Friendly Refrigerant'],
    labels: ['Dimensions', 'Temperature', 'Effective capacity', 'Display area', 'Input power', 'Voltage'],
    models: [
      m('RL2D-131-75-19', ['1310 × 750 × 1930 mm', '≤ −18°C', '900 L', '0.98 m²', '401 W (defrost 1170 W)', '220 V / 50 Hz'], { t: [-18, -18], cap: 900 }),
      m('RL3D-197-75-19', ['1965 × 750 × 1930 mm', '≤ −18°C', '1395 L', '1.34 m²', '556 W (defrost 2130 W)', '220 V / 50 Hz'], { t: [-18, -18], cap: 1395 }),
    ],
  },

  /* ───────────── WATER DISPENSER ───────────── */
  {
    id: 'water-dispenser', category: 'water-dispenser', subcategory: 'Floor Standing', // p43
    name: 'Water Dispenser',
    description: 'Crystal-clear top-load dispenser with instant triple-temperature dispensing, a durable SS 304 tank and child safety lock.',
    image: 'bwd-fs',
    features: ['Crystal-clear top load design', 'Durable stainless steel tank', 'Instant triple temperature dispensing', 'Powerful cooling with energy efficiency', 'Child safety lock'],
    badges: ['SS 304', 'Energy Efficient'],
    labels: ['Format', 'Cabinet', 'Taps (3)', 'Cold water storage', 'Cooling capacity', 'Heating capacity', 'Dimensions (H × W × D)', 'Body material', 'Stainless steel tank', 'Child lock'],
    models: [
      m('BWD 21A FSC', ['Floor standing', 'Refrigerated', 'Hot, normal & cold', '3.7 L', '3 L/hr', '5 L/hr', '1010 × 315 × 350 mm', 'Pre-painted galvanised steel sheets', 'SS 304', 'Yes']),
      m('BWD 21A FSR', ['Floor standing', 'Non-refrigerated', 'Hot, normal & cold', '3.7 L', '3 L/hr', '5 L/hr', '1010 × 315 × 350 mm', 'Pre-painted galvanised steel sheets', 'SS 304', 'Yes'], { img: 'bwd-fsr' }),
      m('BWD 21A CT', ['Counter top', 'NA', 'Hot, normal & cold', '3.7 L', '3 L/hr', '5 L/hr', '530 × 315 × 350 mm', 'Pre-painted galvanised steel sheets', 'SS 304', 'Yes'], { img: 'bwd-ct', sub: 'Counter Top' }),
    ],
  },

  /* ───────────── WATER COOLER ───────────── */
  {
    id: 'water-cooler', category: 'water-cooler', subcategory: 'Water Coolers', // p45
    name: 'Water Cooler',
    description: 'ISI-marked water cooler with an SS 304 tank, high-efficiency cooling compressor and large storage and dispensing capacity.',
    image: 'ess-40-80',
    features: ['Stainless steel tank (SS 304)', 'High-efficiency cooling compressor', 'Large storage & dispensing capacity', 'Compact & modern design', 'ISI marked'],
    badges: ['SS 304', 'ISI Marked'],
    labels: ['Cooling capacity', 'Storage capacity', 'Cold water faucets', 'Unit dimensions', 'Compressor refrigerant', 'Power', 'Current', 'Energy consumption', 'Net weight', 'Gross weight', 'Legs'],
    models: [
      m('ESS 15/30', ['15 L/hr', '30 L', '1', '370 × 370 × 940 mm', 'R-134', '300 W', '1.3 A', '657 kWh/yr', '26 kg', '30.12 kg', 'Round'], { cap: 30, img: 'ess-15-30' }),
      m('ESS 40/40', ['40 L/hr', '40 L', '1', '400 × 400 × 1140 mm', 'R-134', '575 W', '2.5 A', '1260 kWh/yr', '28.8 kg', '31.22 kg', 'L type'], { cap: 40, img: 'ess-15-30' }),
      m('ESS 40/80', ['40 L/hr', '80 L', '2', '555 × 470 × 1180 mm', 'R-134', '575 W', '2.5 A', '1260 kWh/yr', '38.6 kg', '44.7 kg', 'L type'], { cap: 80 }),
      m('ESS 60/80', ['60 L/hr', '80 L', '2', '555 × 470 × 1180 mm', 'R-134', '775 W', '3.36 A', '1697 kWh/yr', '40.35 kg', '46.1 kg', 'L type'], { cap: 80 }),
      m('ESS 60/120', ['60 L/hr', '120 L', '2', '660 × 535 × 1230 mm', 'R-134', '775 W', '3.36 A', '1697 kWh/yr', '50.5 kg', '54.4 kg', 'L type'], { cap: 120 }),
      m('ESS 150/150', ['150 L/hr', '150 L', '2', '740 × 595 × 1250 mm', 'R-134', '1550 W', '6.7 A', '3394 kWh/yr', '75 kg', '83.42 kg', 'L type'], { cap: 150 }),
    ],
  },

  /* ───────────── PHARMA ───────────── */
  {
    id: 'ult-86', category: 'pharma', subcategory: 'Ultra Low Freezer (−86°C)', // p47
    name: 'Ultra Low Freezer (−86°C)',
    description: 'Upright ultra-low freezer with patented LBA foaming technology, a D-shape evaporator for faster pull-down and multifunction alarms.',
    image: 'edw-86', gallery: ['edw-86-open'],
    features: ['Patented LBA foaming technology', 'LED screen for an optimal user experience', 'D-shape evaporator for faster pull-down', 'Multifunction alarms'],
    badges: [],
    applications: ['Vaccination', 'Hospital', 'Biobank', 'Cold Chain'],
    labels: ['Cabinet type', 'Cooling type', 'Refrigerant', 'Total storage volume', 'Inner material', 'Display', 'Temperature range', 'Product dimensions (W × D × H)', 'Interior dimensions (W × D × H)', 'Power supply', 'Castors'],
    models: [
      m('EDW 86L 575', ['Upright', 'Direct cooling', 'Mixed refrigerant', '568 L', 'Stainless steel', 'LED', '−40°C to −86°C', '885 × 995 × 1980 mm', '595 × 720 × 1310 mm', '110–240 V / 50, 60 Hz', 'Yes'], { t: [-86, -40], cap: 568 }),
      m('EDW 86L 475', ['Upright', 'Direct cooling', 'Mixed refrigerant', '458 L', 'Stainless steel', 'LED', '−40°C to −86°C', '885 × 855 × 1980 mm', '595 × 580 × 1310 mm', '110–240 V / 50, 60 Hz', 'Yes'], { t: [-86, -40], cap: 458 }),
      m('EDW 86L 375', ['Upright', 'Direct cooling', 'Mixed refrigerant', '358 L', 'PCM liner', 'LED', '−40°C to −86°C', '795 × 885 × 1855 mm', '450 × 583 × 1326 mm', '220–240 V / 50 Hz', 'Yes'], { t: [-86, -40], cap: 358 }),
      m('EDW 86L 125', ['Upright', 'Direct cooling', 'Mixed refrigerant', '108 L', 'Galvanised steel sheet', 'LED', '−40°C to −86°C', '955 × 675 × 815 mm', '440 × 435 × 590 mm', '220–240 V / 50 Hz', 'No'], { t: [-86, -40], cap: 108 }),
    ],
  },
  {
    id: 'ult-40', category: 'pharma', subcategory: 'Ultra Low Freezer (−40°C)', // p48
    name: 'Ultra Low Freezer (−40°C)',
    description: 'Low-temperature freezer with next-gen LBA foaming technology, a high-efficiency micro-channel condenser and 3-dimensional sealing design.',
    image: 'edw-40', gallery: ['edw-40-open'],
    features: ['Next-gen LBA foaming technology', 'High-efficiency micro-channel condenser', 'Advanced LCD temperature control system', 'Innovative 3-dimensional sealing design'],
    badges: [],
    applications: ['Vaccination', 'Hospital', 'Biobank', 'Cold Chain'],
    labels: ['Temperature range', 'External material', 'Internal material', 'Product dimensions (W × D × H)', 'Interior dimensions (W × D × H)', 'Net / gross weight', 'Foaming agent', 'Cooling type', 'Rated voltage / frequency', 'Display', 'Castors'],
    models: [
      m('EDW 40L 525', ['−20°C to −40°C', 'High quality coated steel', 'High quality coated steel', '866 × 811 × 1920 mm', '680 × 620 × 650 mm (× 2)', '142 / 164 kg', 'Cyclopentane', 'Direct cooling', '220–240 V / 50 Hz', 'LED display', 'Yes'], { t: [-40, -20] }),
      m('EDW 40L 325', ['−20°C to −40°C', 'High quality coated steel', 'High quality coated steel', '700 × 690 × 1920 mm', '540 × 450 × 1277 mm', '102 / 114 kg', 'Cyclopentane', 'Direct cooling', '220 V / 50 Hz', 'LCD display', '4, front 2 wheels lockable'], { t: [-40, -20] }),
    ],
  },
  {
    id: 'lab-freezer', category: 'pharma', subcategory: 'Laboratory Freezer', // p49
    name: 'Laboratory Freezer',
    description: 'Laboratory freezer with microprocessor controller, digital temperature display, lock and wheels. CE, CB, ISO 9001 and ISO 13485 as stated in the catalogue.',
    image: 'lab-freezer-glass',
    features: ['Microprocessor controller', 'Digital temperature display', 'Lock', 'Wheels', 'Solid or glass door'],
    badges: ['CE', 'ISO 13485'],
    labels: ['Gross capacity', 'Dimensions (W × D × H)', 'Temperature range', 'Temperature display', 'Microprocessor controller', 'Lock', 'No. of shelves', 'Wheels', 'Door'],
    models: [
      m('CGN 1200 F4', ['1200 L', '1340 × 810 × 2000 mm', '−16°C to −25°C', 'Digital', 'Yes', 'Yes', '6 + 2 base', 'Yes', 'Solid'], { t: [-25, -16], cap: 1200, img: 'cgn-1200', slug: 'cgn-1200-f4-lab' }),
      m('CGN 1200 FG', ['1200 L', '1340 × 810 × 2000 mm', '−16°C to −25°C', 'Digital', 'Yes', 'Yes', '6 + 2 base', 'Yes', 'Glass'], { t: [-25, -16], cap: 1200 }),
      m('CGN 600 F2', ['600 L', '680 × 810 × 2000 mm', '−16°C to −25°C', 'Digital', 'Yes', 'Yes', '3 + 1 base', 'Yes', 'Solid'], { t: [-25, -16], cap: 600, img: 'lab-freezer-solid', slug: 'cgn-600-f2-lab' }),
      m('CGN 600 FG', ['600 L', '680 × 810 × 2000 mm', '−16°C to −25°C', 'Digital', 'Yes', 'Yes', '3 + 1 base', 'Yes', 'Glass'], { t: [-25, -16], cap: 600, img: 'egn-glass-1d' }),
    ],
  },
  {
    id: 'lab-refrigerator', category: 'pharma', subcategory: 'Laboratory Refrigerator', // p49
    name: 'Laboratory Refrigerator',
    description: 'Ventilated laboratory refrigerator with double-layer vacuum glass door, digital display and door lock. CE, ISO 9001 and ISO 13485 as stated in the catalogue.',
    image: 'lab-fridge',
    features: ['Ventilated cooling', 'Digital display', 'Double-layer vacuum glass door', 'Door lock', 'Optional system alarm: sensor error'],
    badges: ['CE', 'ISO 13485', 'Digital Controller'],
    labels: ['Capacity', 'External size (W × D × H)', 'Refrigerant', 'No. of shelves', 'Door lock', 'Power supply'],
    shared: { 'Temperature range': '2°C to 8°C', 'Cooling method': 'Ventilated cooling', Door: 'Double-layer vacuum glass' },
    models: [
      m('ECG 305', ['300 L', '22 × 24 × 67 in', 'R134a', '4', 'Yes', '220 V / 50 Hz'], { t: [2, 8], cap: 300, slug: 'ecg-305-lab' }),
      m('ECG 405', ['400 L', '26 × 25 × 77 in', 'R134a', '4', 'Yes', '220 V / 50 Hz'], { t: [2, 8], cap: 400, slug: 'ecg-405-lab' }),
      m('ECG 505', ['515 L', '23 × 27 × 79 in', 'R134a', '4', 'Yes', '220 V / 50 Hz'], { t: [2, 8], cap: 515 }),
      m('ECG 775', ['700 L', '41 × 25 × 80 in', 'R134a', '8', 'Yes', '220 V / 50 Hz'], { t: [2, 8], cap: 700, slug: 'ecg-775-lab' }),
      m('ECG 1075', ['1000 L', '48 × 28 × 80 in', 'R134a', '8', 'Yes', '220 V / 50 Hz'], { t: [2, 8], cap: 1000, slug: 'ecg-1075-lab' }),
    ],
  },
  {
    id: 'vaccine-freezer', category: 'pharma', subcategory: 'Portable Vaccine Freezer', // p49
    name: 'Portable Vaccine Freezer',
    description: 'Portable convertible dual-chamber freezer with individual temperature set, 4 to 6 hour hold-over and 6 to 8 hour battery backup. CE, ISO 13485 and ISO 9001:2008 as stated in the catalogue.',
    image: 'ebf',
    features: ['Microprocessor controller with digital display', 'Individual temperature set', 'Hold-over time 4 to 6 hr', 'Battery backup 6 to 8 hr', 'Inside light', 'Removable partition', 'Convertible dual chamber'],
    badges: ['CE', 'ISO 13485', 'Digital Controller'],
    applications: ['Vaccination', 'Cold Chain'],
    labels: ['Capacity', 'Refrigerant', 'Temperature range', 'Hold-over time', 'Battery backup', 'Storage chamber', 'Power supply'],
    models: [
      m('EBF 60T', ['60 L', 'R134a', '−20°C to +20°C', '4 to 6 hr', '6 to 8 hr', 'Convertible dual chamber', 'AC 220–240 V, DC 12 V / 24 V'], { t: [-20, 20], cap: 60 }),
      m('EBF 101', ['90 L', 'R134a', '−20°C to +20°C', '4 to 6 hr', '6 to 8 hr', 'Convertible dual chamber', 'AC 220–240 V, DC 12 V / 24 V'], { t: [-20, 20], cap: 90 }),
    ],
  },

  /* ───────────── COLD ROOM ───────────── */
  {
    id: 'cold-room-chiller', category: 'cold-room', subcategory: 'Chiller Units (2°C to 6°C)', // p52
    name: 'Cold Room Refrigeration Unit, Chiller',
    description: 'Icold refrigeration unit for modular cold rooms held at 2°C to 6°C. Basis of design: loading of 50 kg per sq. m, door opening 5 to 6 times per hour.',
    image: 'cold-room', gallery: ['evaporator', 'condensing-unit'],
    features: [
      'Modular interlocking panels for customisable cold room sizes',
      'Pre-fabricated panels for quick on-site assembly',
      'Self-closing doors with safety release, view port and sweep gasket',
      'Microprocessor controller, BMS compatible',
      'Ready-to-use power panel in powder-coated weatherproof housing',
      'Low-noise external rotor fans and removable side panels for easy servicing',
    ],
    badges: ['Eco-Friendly Refrigerant'],
    applications: ['Agriculture', 'Meat Processing', 'Hotels & Restaurants', 'Dairy', 'Pharmaceuticals', 'Floriculture', 'Ripening Chambers', 'R&D Labs', 'Food Processing', 'Ice Cream', 'Healthcare', 'Horticulture', 'Industrial Canteens', 'Sea Food'],
    labels: ['Refrigeration capacity', 'Refrigerant', 'Room temperature', 'Loading temperature', 'Max. loading', 'Ambient', 'Power consumption', 'Power supply'],
    models: [
      m('CH-8', ['2.34 kW', 'R-134a', '2°C to 6°C', '30–35°C', '250 kg/day', '43–46°C', '1.5 kW', '220 V / 1 Ph / 50 Hz'], { t: [2, 6] }),
      m('CH-12', ['3.51 kW', 'R-407c', '2°C to 6°C', '30–35°C', '540 kg/day', '43–46°C', '1.7 kW', '220 V / 1 Ph / 50 Hz'], { t: [2, 6] }),
      m('CH-15', ['4.39 kW', 'R-407c', '2°C to 6°C', '30–35°C', '770 kg/day', '43–46°C', '2.2 kW', '220 V / 1 Ph / 50 Hz'], { t: [2, 6] }),
      m('CH-20', ['5.85 kW', 'R-407c', '2°C to 6°C', '30–35°C', '1200 kg/day', '43–46°C', '3.1 kW', '400 V / 3 Ph / 50 Hz'], { t: [2, 6] }),
      m('CH-35', ['6.14 kW', 'R-407c', '2°C to 6°C', '30–35°C', '1200 kg/day', '43–46°C', '5 kW', '400 V / 3 Ph / 50 Hz'], { t: [2, 6] }),
      m('CH-42', ['12.29 kW', 'R-407c', '2°C to 6°C', '30–35°C', '2500 kg/day', '43–46°C', '6.2 kW', '400 V / 3 Ph / 50 Hz'], { t: [2, 6] }),
    ],
  },
  {
    id: 'cold-room-freezer', category: 'cold-room', subcategory: 'Freezer Units (−16°C to −20°C)', // p52
    name: 'Cold Room Refrigeration Unit, Low Temperature',
    description: 'Icold low-temperature refrigeration unit for modular cold rooms held at −16°C to −20°C, with electric defrost. Basis of design: loading of 30 kg per sq. m, door opening 5 to 6 times per hour.',
    image: 'cold-room', gallery: ['evaporator', 'condensing-unit'],
    features: [
      'Modular interlocking panels for customisable cold room sizes',
      'Self-closing doors with thermal break to prevent condensation and ice build-up',
      'Microprocessor controller, BMS compatible',
      'In-built defrost heaters for low-temperature units',
      'Inner grooved copper tubes for efficient heat transfer',
      'Low-noise external rotor fans and removable side panels for easy servicing',
    ],
    badges: ['Eco-Friendly Refrigerant'],
    applications: ['Meat Processing', 'Ice Cream', 'Sea Food', 'Food Processing', 'Pharmaceuticals', 'Hotels & Restaurants'],
    labels: ['Refrigeration capacity', 'Refrigerant', 'Room temperature', 'Loading temperature', 'Max. loading', 'Ambient', 'Power consumption', 'Power supply', 'Defrosting'],
    models: [
      m('CL-4', ['1.17 kW', 'R-404a', '−16°C to −20°C', '−10 to −15°C', '100 kg/day', '43–46°C', '1.1 kW', '220 V / 1 Ph / 50 Hz', 'Electric'], { t: [-20, -16] }),
      m('CL-6', ['1.76 kW', 'R-404a', '−16°C to −20°C', '−10 to −15°C', '200 kg/day', '43–46°C', '1.3 kW', '400 V / 3 Ph / 50 Hz', 'Electric'], { t: [-20, -16] }),
      m('CL-8', ['2.34 kW', 'R-404a', '−16°C to −20°C', '−10 to −15°C', '350 kg/day', '43–46°C', '2.5 kW', '400 V / 3 Ph / 50 Hz', 'Electric'], { t: [-20, -16] }),
      m('CL-10', ['2.93 kW', 'R-404a', '−16°C to −20°C', '−10 to −15°C', '500 kg/day', '43–46°C', '2.9 kW', '400 V / 3 Ph / 50 Hz', 'Electric'], { t: [-20, -16] }),
      m('CL-14', ['4.1 kW', 'R-404a', '−16°C to −20°C', '−10 to −15°C', '1000 kg/day', '43–46°C', '4.3 kW', '400 V / 3 Ph / 50 Hz', 'Electric'], { t: [-20, -16] }),
      m('CL-20', ['5.85 kW', 'R-404a', '−16°C to −20°C', '−10 to −15°C', '2000 kg/day', '43–46°C', '5.0 kW', '400 V / 3 Ph / 50 Hz', 'Electric'], { t: [-20, -16] }),
      m('CL-24', ['7.02 kW', 'R-404a', '−16°C to −20°C', '−10 to −15°C', '2500 kg/day', '43–46°C', '7.0 kW', '400 V / 3 Ph / 50 Hz', 'Electric'], { t: [-20, -16] }),
      m('CL-30', ['8.78 kW', 'R-404a', '−16°C to −20°C', '−10 to −15°C', '3500 kg/day', '43–46°C', '8.5 kW', '400 V / 3 Ph / 50 Hz', 'Electric'], { t: [-20, -16] }),
    ],
  },

  /* ───────────── VENDING MACHINE ───────────── */
  {
    id: 'vending', category: 'vending-machine', subcategory: 'Snacks & Beverages', // p54-55
    name: 'Vending Machine',
    description: 'UPI-based vending with cashless payments, direct funds transfer, an anti-theft delivery bin and inventory management through the Wendor dashboard.',
    image: 'galaxy',
    features: ['Cashless payments, direct funds transfer', 'Anti-theft delivery bin', 'Inventory management', '40 mm foaming insulation', 'Adjustable shelving heights'],
    badges: ['UPI Payments'],
    labels: ['Dimensions (W × D × H)', 'Touchscreen interface', 'SKUs', 'No. of trays', 'Temperature range', 'Voltage', 'Power (refrigerated / normal)', 'Weight', 'Capacity'],
    models: [
      m('Galaxy', ['1180 × 890 × 1985 mm', '10 / 22 inch', '60 varieties (max)', '6', '4°C to 25°C', '220 V / 50 Hz', '422 / 24 W', '350 kg', '360–510 pcs'], {
        t: [4, 25], name: 'Snacks & Beverages Vending Machine',
        features: ['Seamless touchscreen interface', '40 mm foaming insulation', 'Adjustable shelving heights', 'Easy spiral adjusting with pull & twist mechanism', 'Anti-theft delivery bin, inventory management', 'Cashless payments, direct funds transfer'],
        applications: ['Snacks', 'Beverages', 'Chocolate', 'Medicines & Health Products'],
      }),
      m('Nova', ['1275 × 790 × 1940 mm', '22 inch', '42 varieties (max)', '6', '4°C to 25°C', '220 V / 50 Hz', '422 / 24 W', '370 kg', '300–350 pcs'], {
        t: [4, 25], img: 'nova', name: 'Elevator Vending Machine', sub: 'Elevator Vending',
        features: ['Seamless touchscreen interface', '40 mm foaming refrigeration system', 'Adjustable shelving heights', 'Smooth elevator delivery, perfect for fragile products', 'Anti-theft delivery bin, inventory management', 'Cashless payments, direct funds transfer'],
        applications: ['Liquor', 'Electronics', 'Jewelry', 'Cosmetics'],
      }),
      m('Frozone', ['1375 × 875 × 1940 mm', '22 inch', '60 varieties (max)', '6', '4°C to −18°C', '220 V / 50 Hz', '422 / 24 W', '370 kg', '340 pcs'], {
        t: [-18, 4], img: 'frozone', name: 'Frozen Food & Ice Cream Vending Machine', sub: 'Frozen Vending',
        features: ['Temperature up to −18°C', 'Seamless touchscreen interface', '40 mm foaming refrigeration system', 'Adjustable shelving heights', 'Smooth elevator delivery, perfect for fragile products', 'Cashless payments, direct funds transfer'],
        applications: ['Frozen Food', 'Ice Cream'],
      }),
      m('Orion', ['630 × 870 × 1940 mm', 'QR / 10 inch screen', '60 varieties (max)', '6', '4°C to 25°C', '220 V / 50 Hz', '422 / 24 W', '190 kg', '180 pcs'], {
        t: [4, 25], img: 'orion', name: 'All-Purpose Vending Machine with QR Code',
        features: ['Budget-friendly all-purpose vending machine', '40 mm foaming refrigeration system', 'Direct QR code access to web app interface', 'Cashless payments, direct funds transfer', 'Anti-theft delivery bin', 'Inventory management'],
        applications: ['Snacks', 'Beverages', 'Chocolate', 'Medicines'],
      }),
      m('Apollo', ['1080 × 440 × 1840 mm', '10 / 13 / 15 inch', '17 / 19 / 24 / 37 slots', '6', 'Ambient', '220 V / 50 Hz', '422 / 24 W', 'As per slots', 'NA'], {
        img: 'apollo', name: 'Smart Locker for Vending & Storage', sub: 'Smart Lockers',
        features: ['Intuitive touchscreen for easy navigation', 'Detailed logs for tracking user activities', 'Supports biometric and payment authorisation', 'Remote monitoring available on mobile and web', 'Self-service automated inventory tracking', 'API and ERP integration for seamless connectivity'],
        applications: ['Bags', 'Helmets', 'Gloves & PPE Kits', 'Industrial Tools'],
      }),
    ],
  },
];
