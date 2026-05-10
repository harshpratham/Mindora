/**
 * Strong B.Tech / engineering colleges in India — static for College Search UI.
 * Images: Unsplash (real photography, campus / study / architecture themes).
 */

export type CollegeRecord = {
  id: string;
  name: string;
  location: string;
  ranking: number;
  featured: boolean;
  fees: string;
  programs: string[];
  image: string;
  description: string;
  placement: string;
};

const img = (photoId: string, sig?: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&w=900&h=500&fit=crop&q=80${sig ? `&sig=${sig}` : ''}`;

export const LOCAL_COLLEGES: CollegeRecord[] = [
  {
    id: 'iit-bombay',
    name: 'IIT Bombay',
    location: 'Mumbai, Maharashtra',
    ranking: 1,
    featured: true,
    fees: 'Approx. ₹2–2.5 L/year (B.Tech)',
    programs: ['Computer Science', 'Electrical', 'Mechanical', 'Aerospace', 'Chemical', 'Data Science'],
    image: img('photo-1562774053-701939374585'),
    description:
      'Top-ranked IIT; exceptional research, startups, and tech placements. Ideal for serious B.Tech aspirants targeting core engineering, CS, or research careers.',
    placement: 'Very high campus placement; strong product & quant roles',
  },
  {
    id: 'iit-delhi',
    name: 'IIT Delhi',
    location: 'New Delhi',
    ranking: 2,
    featured: true,
    fees: 'Approx. ₹2–2.5 L/year (B.Tech)',
    programs: ['Computer Science', 'Mathematics & Computing', 'Electrical', 'Civil', 'Textile', 'AI'],
    image: img('photo-1541339907198-e08756dedf3f'),
    description:
      'Premier IIT with strong industry links in NCR; excellent for B.Tech in CS, EE, and interdisciplinary programs with high recruiter interest.',
    placement: 'Top-tier packages; strong consulting & tech hiring',
  },
  {
    id: 'iit-madras',
    name: 'IIT Madras',
    location: 'Chennai, Tamil Nadu',
    ranking: 3,
    featured: true,
    fees: 'Approx. ₹2–2.5 L/year (B.Tech)',
    programs: ['Computer Science', 'Engineering Design', 'Mechanical', 'Ocean Eng.', 'Metallurgy', 'AI & DS'],
    image: img('photo-1523050854058-8df90110c9f1'),
    description:
      'Large campus, deep research culture, and one of the strongest CS & core engineering ecosystems among IITs.',
    placement: 'Excellent placements across tech, R&D, and core sectors',
  },
  {
    id: 'iit-kanpur',
    name: 'IIT Kanpur',
    location: 'Kanpur, Uttar Pradesh',
    ranking: 4,
    featured: false,
    fees: 'Approx. ₹2–2.5 L/year (B.Tech)',
    programs: ['Computer Science', 'Aerospace', 'Materials', 'Chemical', 'Electrical', 'Mathematics'],
    image: img('photo-1498243691581-b145c3f54a5a'),
    description:
      'Known for rigorous academics and strong fundamentals—good fit for B.Tech students aiming for research, higher studies, or top tech roles.',
    placement: 'Strong tech & analytics; reputed PhD pipelines',
  },
  {
    id: 'iit-kharagpur',
    name: 'IIT Kharagpur',
    location: 'Kharagpur, West Bengal',
    ranking: 5,
    featured: false,
    fees: 'Approx. ₹2–2.5 L/year (B.Tech)',
    programs: ['Computer Science', 'Electronics', 'Mechanical', 'Mining', 'Industrial', 'Biotech'],
    image: img('photo-1523240795612-9a054b055dba'),
    description:
      'Oldest IIT; wide department mix and strong placement support for B.Tech across CS, core branches, and management dual options.',
    placement: 'Broad recruiter base; strong legacy hiring',
  },
  {
    id: 'bits-pilani',
    name: 'BITS Pilani',
    location: 'Pilani, Rajasthan',
    ranking: 6,
    featured: true,
    fees: 'Approx. ₹4–5 L/year (B.E.)',
    programs: ['Computer Science', 'Electronics', 'Mechanical', 'Chemical', 'Manufacturing'],
    image: img('photo-1524178232363-1cfc14790150'),
    description:
      'Private institute with strong coding culture, PS-1/PS-2 practice school, and excellent B.Tech placements especially in software and finance.',
    placement: 'High median packages in tech & startups',
  },
  {
    id: 'iiit-hyderabad',
    name: 'IIIT Hyderabad',
    location: 'Hyderabad, Telangana',
    ranking: 7,
    featured: true,
    fees: 'Approx. ₹3–4 L/year (dual-degree / B.Tech)',
    programs: ['Computer Science', 'ECE', 'CSD', 'CLD', 'Research dual degrees'],
    image: img('photo-1517245385007-61aa114a059f'),
    description:
      'Focused on CS & allied fields; one of the best choices in India for B.Tech-level depth in computing, research, and product careers.',
    placement: 'Elite tech hiring; strong research & MS abroad outcomes',
  },
  {
    id: 'nit-trichy',
    name: 'NIT Tiruchirappalli (NIT Trichy)',
    location: 'Tiruchirappalli, Tamil Nadu',
    ranking: 8,
    featured: false,
    fees: 'Approx. ₹1.5–2 L/year',
    programs: ['Computer Science', 'EEE', 'Mechanical', 'Civil', 'Production', 'Instrumentation'],
    image: img('photo-1509062522246-3755977927d7'),
    description:
      'Leading NIT; balanced B.Tech rigour and placements—strong for core branches and CS without IIT tag.',
    placement: 'Solid campus placements; good core & IT mix',
  },
  {
    id: 'nitk-surathkal',
    name: 'NIT Karnataka (NITK Surathkal)',
    location: 'Surathkal, Karnataka',
    ranking: 9,
    featured: false,
    fees: 'Approx. ₹1.5–2 L/year',
    programs: ['Computer Science', 'IT', 'ECE', 'Mechanical', 'Chemical', 'Civil'],
    image: img('photo-1434030216411-0b793f4b4173'),
    description:
      'Coastal campus, strong IT & core departments; popular B.Tech destination for South India with good industry connect.',
    placement: 'Strong IT & core hiring from campus',
  },
  {
    id: 'dtu-delhi',
    name: 'DTU (Delhi Technological University)',
    location: 'New Delhi',
    ranking: 10,
    featured: false,
    fees: 'Approx. ₹2–2.5 L/year',
    programs: ['Computer Engineering', 'Software', 'ECE', 'Mechanical', 'Civil', 'Environmental'],
    image: img('photo-1427504494785-3a9ca7044f45'),
    description:
      'State technical university with excellent Delhi-NCR placements; strong B.Tech choice for software, consulting, and PSUs.',
    placement: 'High placement velocity in NCR tech & analytics',
  },
  {
    id: 'nsut-delhi',
    name: 'NSUT Delhi',
    location: 'New Delhi',
    ranking: 11,
    featured: false,
    fees: 'Approx. ₹1.5–2 L/year',
    programs: ['Computer Engineering', 'ECE', 'Instrumentation', 'Manufacturing', 'BT'],
    image: img('photo-1547820037-8861cfcffa51'),
    description:
      'Former NSIT; very strong B.Tech coding culture and placements in software, data, and electronics roles.',
    placement: 'Competitive packages for CS/ECE cohorts',
  },
  {
    id: 'vit-vellore',
    name: 'VIT Vellore',
    location: 'Vellore, Tamil Nadu',
    ranking: 12,
    featured: false,
    fees: 'Approx. ₹2–4 L/year (category-based)',
    programs: ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Biotech'],
    image: img('photo-1522202176988-66273c2fd55f'),
    description:
      'Large private university; high-scale placements with strong IT hiring—good B.Tech path with broad peer competition.',
    placement: 'Mass recruiters + selective premium offers',
  },
  {
    id: 'thapar',
    name: 'Thapar Institute of Engineering & Technology',
    location: 'Patiala, Punjab',
    ranking: 13,
    featured: false,
    fees: 'Approx. ₹3–4 L/year',
    programs: ['Computer Science', 'COE', 'ECE', 'Mechanical', 'Civil', 'Chemical'],
    image: img('photo-1523050854058-8df90110c9f1', '1'),
    description:
      'Private deemed university with solid B.Tech academics and improving research; strong North India recruiter network.',
    placement: 'Good tech & core mix; growing startup pipeline',
  },
  {
    id: 'iit-roorkee',
    name: 'IIT Roorkee',
    location: 'Roorkee, Uttarakhand',
    ranking: 14,
    featured: false,
    fees: 'Approx. ₹2–2.5 L/year (B.Tech)',
    programs: ['Computer Science', 'Civil', 'Electrical', 'Hydrology', 'Architecture', 'Physics'],
    image: img('photo-1498243691581-b145c3f54a5a', '2'),
    description:
      'Historic campus; very strong civil/architecture plus growing CS—balanced B.Tech for core and tech careers.',
    placement: 'Strong core + improving tech placements',
  },
  {
    id: 'iit-guwahati',
    name: 'IIT Guwahati',
    location: 'Guwahati, Assam',
    ranking: 15,
    featured: false,
    fees: 'Approx. ₹2–2.5 L/year (B.Tech)',
    programs: ['Computer Science', 'ECE', 'Mechanical', 'Chemical', 'Design', 'Mathematics'],
    image: img('photo-1562774053-701939374585', '3'),
    description:
      'Scenic campus; quality B.Tech programs with growing startup and northeast industry engagement.',
    placement: 'Solid all-round placements; research-friendly',
  },
  {
    id: 'bits-goa',
    name: 'BITS Pilani — Goa Campus',
    location: 'Goa',
    ranking: 16,
    featured: false,
    fees: 'Approx. ₹4–5 L/year',
    programs: ['Computer Science', 'ECE', 'EEE', 'Chemical', 'Mechanical'],
    image: img('photo-1541339907198-e08756dedf3f', '4'),
    description:
      'Same BITS curriculum as Pilani; attractive campus and strong B.Tech outcomes in software and electronics.',
    placement: 'Comparable to Pilani cohort for many recruiters',
  },
  {
    id: 'iiit-bangalore',
    name: 'IIIT Bangalore',
    location: 'Bengaluru, Karnataka',
    ranking: 17,
    featured: false,
    fees: 'Approx. ₹3–4 L/year',
    programs: ['Integrated M.Tech (iMTech)', 'CS-focused curriculum'],
    image: img('photo-1517245385007-61aa114a059f', '5'),
    description:
      'Integrated program focused on computing; excellent for students who want intense CS depth early in their B.Tech journey.',
    placement: 'Strong tech & product roles in Bengaluru',
  },
  {
    id: 'jadavpur',
    name: 'Jadavpur University — Faculty of Engineering',
    location: 'Kolkata, West Bengal',
    ranking: 18,
    featured: false,
    fees: 'Very low (state subsidized)',
    programs: ['Computer Science', 'ECE', 'Mechanical', 'Civil', 'Power', 'Instrumentation'],
    image: img('photo-1523240795612-9a054b055dba', '6'),
    description:
      'Top state-funded engineering; outstanding value B.Tech with strong placements in Eastern India and pan-India IT.',
    placement: 'High ROI; strong IT & PSU preparation culture',
  },
  {
    id: 'coep',
    name: 'COEP Technological University',
    location: 'Pune, Maharashtra',
    ranking: 19,
    featured: false,
    fees: 'Approx. ₹1–1.5 L/year (state)',
    programs: ['Computer Engineering', 'IT', 'Mechanical', 'Civil', 'Electrical', 'Metallurgy'],
    image: img('photo-1509062522246-3755977927d7', '7'),
    description:
      'Historic Pune engineering college; strong B.Tech fundamentals and Maharashtra industry connect.',
    placement: 'Solid regional + national tech hiring',
  },
  {
    id: 'nit-warangal',
    name: 'NIT Warangal',
    location: 'Warangal, Telangana',
    ranking: 20,
    featured: false,
    fees: 'Approx. ₹1.5–2 L/year',
    programs: ['Computer Science', 'ECE', 'Mechanical', 'Chemical', 'Civil', 'Biotech'],
    image: img('photo-1434030216411-0b793f4b4173', '8'),
    description:
      'First NIT; reputed B.Tech programs with consistent placements and strong alumni in tech and PSUs.',
    placement: 'Strong IT & core placement track record',
  },
];

export function getSortedLocalColleges(): CollegeRecord[] {
  return [...LOCAL_COLLEGES].sort((a, b) => a.ranking - b.ranking);
}
