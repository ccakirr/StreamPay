export function generateTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function shortenHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  image: string;
  videoUrl: string;
  category: string;
  duration: string;
  featured?: boolean;
  year: number;
  match: number;
}

export interface MinutePackage {
  id: string;
  minutes: number;
  costMON: number;
  label: string;
  popular?: boolean;
}

export const MINUTE_PACKAGES: MinutePackage[] = [
  { id: "pkg-10", minutes: 10, costMON: 0.01, label: "10 Dakika" },
  { id: "pkg-30", minutes: 30, costMON: 0.025, label: "30 Dakika", popular: true },
  { id: "pkg-60", minutes: 60, costMON: 0.04, label: "60 Dakika" },
  { id: "pkg-120", minutes: 120, costMON: 0.06, label: "120 Dakika" },
];

export interface ContentCategory {
  name: string;
  items: ContentItem[];
}

const thumbnailColors = [
  "from-purple-900 to-indigo-900",
  "from-red-900 to-orange-900",
  "from-blue-900 to-cyan-900",
  "from-emerald-900 to-teal-900",
  "from-pink-900 to-rose-900",
  "from-amber-900 to-yellow-900",
  "from-violet-900 to-fuchsia-900",
  "from-sky-900 to-blue-900",
];

// Free sample videos from Google's public bucket
const sampleVideos = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
];

export const allContent: ContentItem[] = [
  {
    id: "1",
    title: "Decentralized Horizons",
    description: "A journey through the evolution of blockchain technology and its impact on the future of finance. Follow pioneers as they build a new decentralized world.",
    thumbnail: thumbnailColors[0],
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    videoUrl: sampleVideos[0],
    category: "Documentary",
    duration: "2h 15m",
    featured: true,
    year: 2026,
    match: 98,
  },
  {
    id: "2",
    title: "The Last Validator",
    description: "In a world where consensus is everything, one validator holds the key to the network's survival.",
    thumbnail: thumbnailColors[1],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    videoUrl: sampleVideos[1],
    category: "Sci-Fi",
    duration: "1h 48m",
    year: 2025,
    match: 95,
  },
  {
    id: "3",
    title: "Chain Reaction",
    description: "A thrilling chase across the metaverse as hackers try to exploit a zero-day vulnerability.",
    thumbnail: thumbnailColors[2],
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    videoUrl: sampleVideos[2],
    category: "Thriller",
    duration: "1h 32m",
    year: 2026,
    match: 92,
  },
  {
    id: "4",
    title: "Smart Contract",
    description: "When a binding smart contract goes wrong, a lawyer must navigate both legal code and computer code.",
    thumbnail: thumbnailColors[3],
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    videoUrl: sampleVideos[3],
    category: "Drama",
    duration: "2h 05m",
    year: 2025,
    match: 88,
  },
  {
    id: "5",
    title: "Gas Wars",
    description: "An epic battle for network resources in the most congested blockchain ever built.",
    thumbnail: thumbnailColors[4],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
    videoUrl: sampleVideos[4],
    category: "Action",
    duration: "1h 55m",
    year: 2026,
    match: 94,
  },
  {
    id: "6",
    title: "The Fork",
    description: "A community torn apart by a controversial protocol upgrade must decide the future of their chain.",
    thumbnail: thumbnailColors[5],
    image: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&q=80",
    videoUrl: sampleVideos[5],
    category: "Drama",
    duration: "1h 40m",
    year: 2025,
    match: 91,
  },
  {
    id: "7",
    title: "Mempool Memories",
    description: "A nostalgic look back at the early days of crypto through the eyes of its forgotten builders.",
    thumbnail: thumbnailColors[6],
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
    videoUrl: sampleVideos[6],
    category: "Documentary",
    duration: "1h 22m",
    year: 2024,
    match: 87,
  },
  {
    id: "8",
    title: "Proof of Stake",
    description: "High-stakes poker meets DeFi in this gripping tale of risk and reward.",
    thumbnail: thumbnailColors[7],
    image: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800&q=80",
    videoUrl: sampleVideos[7],
    category: "Thriller",
    duration: "1h 50m",
    year: 2026,
    match: 93,
  },
  {
    id: "9",
    title: "Block Height",
    description: "A mountaineering documentary that parallels the ascent of blockchain adoption.",
    thumbnail: thumbnailColors[0],
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    videoUrl: sampleVideos[8],
    category: "Documentary",
    duration: "1h 35m",
    year: 2025,
    match: 85,
  },
  {
    id: "10",
    title: "Zero Knowledge",
    description: "A spy thriller where no one knows who anyone really is, powered by ZK proofs.",
    thumbnail: thumbnailColors[1],
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80",
    videoUrl: sampleVideos[9],
    category: "Thriller",
    duration: "2h 10m",
    year: 2026,
    match: 96,
  },
  {
    id: "11",
    title: "Nonce Upon a Time",
    description: "A whimsical animated tale about the little numbers that make blockchain work.",
    thumbnail: thumbnailColors[2],
    image: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=800&q=80",
    videoUrl: sampleVideos[10],
    category: "Animation",
    duration: "1h 28m",
    year: 2025,
    match: 89,
  },
  {
    id: "12",
    title: "Layer Two",
    description: "When the main chain gets congested, a group of outcasts builds a second layer to save the network.",
    thumbnail: thumbnailColors[3],
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    videoUrl: sampleVideos[11],
    category: "Sci-Fi",
    duration: "1h 45m",
    year: 2026,
    match: 90,
  },
  {
    id: "13",
    title: "Consensus",
    description: "A political drama about achieving agreement in a world where trust is a scarce resource.",
    thumbnail: thumbnailColors[4],
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    videoUrl: sampleVideos[12],
    category: "Drama",
    duration: "2h 00m",
    year: 2025,
    match: 86,
  },
  {
    id: "14",
    title: "Monad Rising",
    description: "The story of the fastest blockchain ever built and the team that defied all odds to ship it.",
    thumbnail: thumbnailColors[5],
    image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&q=80",
    videoUrl: sampleVideos[0],
    category: "Documentary",
    duration: "1h 58m",
    featured: true,
    year: 2026,
    match: 99,
  },
  {
    id: "15",
    title: "Private Key",
    description: "A detective must crack the most complex cryptographic puzzle to solve a mysterious disappearance.",
    thumbnail: thumbnailColors[6],
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80",
    videoUrl: sampleVideos[7],
    category: "Mystery",
    duration: "1h 42m",
    year: 2025,
    match: 92,
  },
  {
    id: "16",
    title: "Finality",
    description: "Once confirmed, there's no going back. A heist gone wrong on an immutable ledger.",
    thumbnail: thumbnailColors[7],
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80",
    videoUrl: sampleVideos[1],
    category: "Action",
    duration: "1h 38m",
    year: 2026,
    match: 94,
  },
];

export const contentCategories: ContentCategory[] = [
  {
    name: "Trending Now",
    items: allContent.filter((c) => c.match >= 93),
  },
  {
    name: "Documentaries",
    items: allContent.filter((c) => c.category === "Documentary"),
  },
  {
    name: "Sci-Fi & Thriller",
    items: allContent.filter((c) => c.category === "Sci-Fi" || c.category === "Thriller"),
  },
  {
    name: "Drama",
    items: allContent.filter((c) => c.category === "Drama"),
  },
  {
    name: "Action & Adventure",
    items: allContent.filter((c) => c.category === "Action" || c.category === "Animation"),
  },
  {
    name: "New Releases",
    items: allContent.filter((c) => c.year === 2026),
  },
];

export const featuredContent = allContent.find((c) => c.id === "14")!;
