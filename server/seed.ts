import type { Pool } from 'pg';
import * as kv from './kv';
import { JOB_POSTING_SEEDS } from './jobPostingsSeed';

/** Public LinkedIn /in/ vanity + Wikimedia Commons portrait (same person; LinkedIn CDN is not hotlinked). */
const COUNSELOR_SEED_MARKER = 'meta:seed-counselors-v2';
const LEGACY_COUNSELOR_IDS = ['rohit-mahto', 'priya-sharma', 'amit-kumar', 'neha-patel', 'rajesh-singh'];

const COUNSELORS_V2 = [
  {
    id: 'dorie-clark',
    name: 'Dorie Clark',
    linkedInVanity: 'dorieclark',
    field: 'Career strategy & reinvention',
    company: 'Columbia Business School',
    position: 'Executive education faculty',
    experience: '15+ years',
    rating: 4.9,
    reviews: 412,
    linkedIn: 'https://www.linkedin.com/in/dorieclark',
    hourlyRate: '₹2,500',
    availability: 'online',
    expertise: ['Personal branding', 'Entrepreneurship', 'Long-term career planning'],
    bio: 'Author and professor focused on career reinvention, thought leadership, and professional growth.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Dorie_Clark_headshot.jpg/330px-Dorie_Clark_headshot.jpg',
  },
  {
    id: 'adam-grant',
    name: 'Adam Grant',
    linkedInVanity: 'adamgrant',
    field: 'Work psychology & careers',
    company: 'The Wharton School',
    position: 'Professor of organizational psychology',
    experience: '18+ years',
    rating: 4.9,
    reviews: 890,
    linkedIn: 'https://www.linkedin.com/in/adamgrant',
    hourlyRate: '₹2,800',
    availability: 'online',
    expertise: ['Motivation', 'Team dynamics', 'Original thinking at work'],
    bio: 'Organizational psychologist and author; research-backed advice on work, leadership, and career decisions.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Adam_Grant_at_the_2023_World_Economic_Forum_%2852693537938%29.jpg/330px-Adam_Grant_at_the_2023_World_Economic_Forum_%2852693537938%29.jpg',
  },
  {
    id: 'simon-sinek',
    name: 'Simon Sinek',
    linkedInVanity: 'simonsinek',
    field: 'Leadership & purpose',
    company: 'Simon Sinek Inc.',
    position: 'Author & speaker',
    experience: '20+ years',
    rating: 4.8,
    reviews: 620,
    linkedIn: 'https://www.linkedin.com/in/simonsinek',
    hourlyRate: '₹2,600',
    availability: 'online',
    expertise: ['Leadership', 'Culture', 'Communication'],
    bio: 'Optimist and author known for frameworks on purpose-driven leadership and infinite thinking.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Simon_Sinek_speaks_to_I_MIG_Marines_%282%29_%28cropped%29.jpg/330px-Simon_Sinek_speaks_to_I_MIG_Marines_%282%29_%28cropped%29.jpg',
  },
  {
    id: 'susan-cain',
    name: 'Susan Cain',
    linkedInVanity: 'susancain',
    field: 'Quiet leadership & workplace',
    company: 'Quiet Revolution',
    position: 'Author & lecturer',
    experience: '15+ years',
    rating: 4.8,
    reviews: 340,
    linkedIn: 'https://www.linkedin.com/in/susancain',
    hourlyRate: '₹2,400',
    availability: 'online',
    expertise: ['Introversion at work', 'Communication', 'Well-being'],
    bio: 'Writer and speaker on how introverts thrive in careers and organizations.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/61/SusanCainPortrait_250px_20120305.jpg',
  },
  {
    id: 'marie-forleo',
    name: 'Marie Forleo',
    linkedInVanity: 'marieforleo',
    field: 'Entrepreneurship & creative careers',
    company: 'Marie Forleo International',
    position: 'Founder & CEO',
    experience: '20+ years',
    rating: 4.9,
    reviews: 510,
    linkedIn: 'https://www.linkedin.com/in/marieforleo',
    hourlyRate: '₹2,200',
    availability: 'online',
    expertise: ['Online business', 'Marketing mindset', 'B-School-style planning'],
    bio: 'Entrepreneur and educator behind MarieTV and programs helping people build meaningful work.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Marie_Forleo_1.jpg/330px-Marie_Forleo_1.jpg',
  },
  {
    id: 'brene-brown',
    name: 'Brené Brown',
    linkedInVanity: 'brenebrown',
    field: 'Courageous leadership & culture',
    company: 'University of Houston / UT Austin',
    position: 'Research professor & author',
    experience: '25+ years',
    rating: 4.9,
    reviews: 720,
    linkedIn: 'https://www.linkedin.com/in/brenebrown',
    hourlyRate: '₹2,700',
    availability: 'online',
    expertise: ['Vulnerability at work', 'Team trust', 'Difficult conversations'],
    bio: 'Researcher and storyteller on courage, vulnerability, and leadership in professional life.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bren%C3%A9_Brown_and_Malcolm_Gladwell_at_SXSW_2025_06_%28cropped%29.jpg/330px-Bren%C3%A9_Brown_and_Malcolm_Gladwell_at_SXSW_2025_06_%28cropped%29.jpg',
  },
  {
    id: 'angela-duckworth',
    name: 'Angela Duckworth',
    linkedInVanity: 'angeladuckworth',
    field: 'Grit, goals & performance',
    company: 'University of Pennsylvania',
    position: 'Professor of psychology',
    experience: '20+ years',
    rating: 4.8,
    reviews: 380,
    linkedIn: 'https://www.linkedin.com/in/angeladuckworth',
    hourlyRate: '₹2,500',
    availability: 'online',
    expertise: ['Grit', 'Habits', 'Character development'],
    bio: 'Psychologist and author known for research on grit and sustained achievement in school and work.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Angela_Duckworth%2C_2017_%28cropped%29.jpg/330px-Angela_Duckworth%2C_2017_%28cropped%29.jpg',
  },
  {
    id: 'daniel-pink',
    name: 'Daniel H. Pink',
    linkedInVanity: 'danielpink',
    field: 'Motivation & future of work',
    company: 'Independent',
    position: 'Author & speaker',
    experience: '25+ years',
    rating: 4.8,
    reviews: 295,
    linkedIn: 'https://www.linkedin.com/in/danielpink',
    hourlyRate: '₹2,300',
    availability: 'online',
    expertise: ['Motivation science', 'Sales & persuasion', 'Career timing'],
    bio: 'Bestselling author on motivation, timing, and how people do their best work.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Daniel_H._Pink_%28cropped%29.jpg/330px-Daniel_H._Pink_%28cropped%29.jpg',
  },
  {
    id: 'gary-vaynerchuk',
    name: 'Gary Vaynerchuk',
    linkedInVanity: 'garyvaynerchuk',
    field: 'Marketing & founder mindset',
    company: 'VaynerX',
    position: 'CEO & chairman',
    experience: '25+ years',
    rating: 4.7,
    reviews: 910,
    linkedIn: 'https://www.linkedin.com/in/garyvaynerchuk',
    hourlyRate: '₹2,600',
    availability: 'online',
    expertise: ['Personal brand', 'Social media', 'Entrepreneurship'],
    bio: 'Entrepreneur and communicator focused on attention, brand-building, and modern careers.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Gary_Vaynerchuk_public_domain.jpg/330px-Gary_Vaynerchuk_public_domain.jpg',
  },
  {
    id: 'james-clear',
    name: 'James Clear',
    linkedInVanity: 'jamesclear',
    field: 'Habits & high performance',
    company: 'Independent',
    position: 'Author',
    experience: '12+ years',
    rating: 4.9,
    reviews: 560,
    linkedIn: 'https://www.linkedin.com/in/jamesclear',
    hourlyRate: '₹2,200',
    availability: 'online',
    expertise: ['Atomic habits', 'Systems thinking', 'Consistency'],
    bio: 'Author focused on small habits, systems, and continuous improvement for career and life.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/James_Clear_in_2010.jpg/330px-James_Clear_in_2010.jpg',
  },
];

async function seedCounselorsPack(pool: Pool): Promise<void> {
  const done = await kv.kvGet(pool, COUNSELOR_SEED_MARKER);
  if (done) return;
  for (const id of LEGACY_COUNSELOR_IDS) {
    await kv.kvDel(pool, `counselor:${id}`);
  }
  for (const c of COUNSELORS_V2) {
    await kv.kvSet(pool, `counselor:${c.id}`, c);
  }
  await kv.kvSet(pool, COUNSELOR_SEED_MARKER, { at: new Date().toISOString() });
}

export async function seedIfEmpty(pool: Pool): Promise<void> {
  await seedCounselorsPack(pool);

  const existing = await kv.kvGet(pool, 'college:iit-bombay');
  if (existing) return;

  const colleges = [
    {
      id: 'iit-bombay',
      name: 'IIT Bombay',
      location: 'Mumbai, Maharashtra',
      ranking: 1,
      featured: true,
      fees: '₹2,00,000/year',
      programs: ['Computer Science', 'Data Science', 'Electrical Engineering', 'Mechanical Engineering'],
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop',
      description: 'Premier engineering institute with world-class faculty and research facilities.',
      placement: '95% placement rate, Average package: ₹20 LPA',
    },
    {
      id: 'iit-delhi',
      name: 'IIT Delhi',
      location: 'New Delhi',
      ranking: 2,
      featured: true,
      fees: '₹2,00,000/year',
      programs: ['Computer Science', 'Data Science', 'AI & ML', 'Civil Engineering'],
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop',
      description: 'Top-ranked institution known for innovation and research excellence.',
      placement: '94% placement rate, Average package: ₹18 LPA',
    },
    {
      id: 'bits-pilani',
      name: 'BITS Pilani',
      location: 'Pilani, Rajasthan',
      ranking: 3,
      featured: false,
      fees: '₹4,50,000/year',
      programs: ['Computer Science', 'Electronics', 'Mechanical Engineering', 'Data Science'],
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop',
      description: 'Renowned private institution with strong industry connections.',
      placement: '92% placement rate, Average package: ₹16 LPA',
    },
    {
      id: 'nit-trichy',
      name: 'NIT Trichy',
      location: 'Tiruchirappalli, Tamil Nadu',
      ranking: 4,
      featured: false,
      fees: '₹1,50,000/year',
      programs: ['Computer Science', 'Data Science', 'Chemical Engineering', 'Production Engineering'],
      image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop',
      description: 'Leading NIT with excellent academic programs and infrastructure.',
      placement: '90% placement rate, Average package: ₹14 LPA',
    },
  ];

  for (const col of colleges) {
    await kv.kvSet(pool, `college:${col.id}`, col);
  }

  const questions = [
    {
      id: 'q1',
      title: 'Does CGPA really matter for placements?',
      content:
        'I am in 1st year and heard mixed opinions. Some say CGPA matters a lot, others say skills matter more. What is the reality?',
      tags: ['placement', 'cgpa', 'college'],
      userId: 'user1',
      userName: 'Arjun Verma',
      votes: 45,
      answers: [
        {
          userId: 'user2',
          userName: 'Sneha Gupta',
          answer:
            'CGPA definitely matters! Many companies have a cutoff (usually 7.0 or above) for campus placements. However, once you clear the cutoff, your skills and projects become more important. My advice: maintain at least 7.5 CGPA and focus equally on building projects and skills.',
          votes: 38,
          timestamp: '2024-11-20T10:30:00Z',
        },
        {
          userId: 'user3',
          userName: 'Karthik Reddy',
          answer:
            'Yes, CGPA matters especially for top companies and competitive roles. I had 8.2 CGPA and it helped me get shortlisted for all major companies. But also build a strong resume with internships and projects!',
          votes: 22,
          timestamp: '2024-11-20T14:15:00Z',
        },
      ],
      timestamp: '2024-11-20T09:00:00Z',
    },
    {
      id: 'q2',
      title: 'How to transition from non-CS background to Data Science?',
      content:
        'I am from Mechanical Engineering but interested in Data Science. Is it possible to switch? What should I learn?',
      tags: ['career-switch', 'data-science', 'learning'],
      userId: 'user4',
      userName: 'Meera Iyer',
      votes: 32,
      answers: [
        {
          userId: 'user5',
          userName: 'Vikram Malhotra',
          answer:
            'Absolutely possible! I did the same. Start with Python programming, then learn statistics, pandas, numpy, and machine learning. Do projects on Kaggle. Many successful data scientists come from non-CS backgrounds. Your domain knowledge from Mechanical can actually be an advantage!',
          votes: 28,
          timestamp: '2024-11-19T11:20:00Z',
        },
      ],
      timestamp: '2024-11-19T08:45:00Z',
    },
    {
      id: 'q3',
      title: 'Best resources for DSA preparation?',
      content: 'Starting placement preparation. What are the best resources for Data Structures and Algorithms?',
      tags: ['dsa', 'placement', 'resources'],
      userId: 'user6',
      userName: 'Rahul Joshi',
      votes: 67,
      answers: [
        {
          userId: 'user7',
          userName: 'Anjali Desai',
          answer:
            'For DSA: 1) Striver A2Z DSA sheet, 2) LeetCode for practice (do at least 200 problems), 3) YouTube channels like take U forward, 4) Book: Introduction to Algorithms (CLRS). Start with easy problems and gradually increase difficulty.',
          votes: 52,
          timestamp: '2024-11-18T16:40:00Z',
        },
        {
          userId: 'user8',
          userName: 'Siddharth Menon',
          answer:
            'Also add Codeforces and CodeChef for competitive programming practice. Consistency is key - solve at least 2 problems daily!',
          votes: 31,
          timestamp: '2024-11-18T18:20:00Z',
        },
      ],
      timestamp: '2024-11-18T15:00:00Z',
    },
  ];

  for (const q of questions) {
    await kv.kvSet(pool, `question:${q.id}`, q);
  }

  const dsaQuestions = [
    {
      id: 'dsa1',
      title: 'Two Sum',
      difficulty: 'Easy',
      description:
        'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
      examples: [
        'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
        'Input: nums = [3,2,4], target = 6\nOutput: [1,2]',
      ],
      constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
      hints: ['Use a hash map to store the numbers you have seen so far'],
      starterCode: `function twoSum(nums, target) {\n    // Write your code here\n    \n}`,
      topic: 'Arrays, Hash Map',
    },
    {
      id: 'dsa2',
      title: 'Reverse Linked List',
      difficulty: 'Easy',
      description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
      examples: ['Input: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]', 'Input: head = [1,2]\nOutput: [2,1]'],
      constraints: ['The number of nodes in the list is the range [0, 5000].', '-5000 <= Node.val <= 5000'],
      hints: ['Use three pointers: prev, current, and next'],
      starterCode: `function reverseList(head) {\n    // Write your code here\n    \n}`,
      topic: 'Linked List',
    },
  ];

  for (const dq of dsaQuestions) {
    await kv.kvSet(pool, `dsa-question:${dq.id}`, dq);
  }

  for (const j of JOB_POSTING_SEEDS) {
    await kv.kvSet(pool, `job-posting:${j.id}`, j);
  }

  console.log('[server] Demo seed data written to PostgreSQL');
}
