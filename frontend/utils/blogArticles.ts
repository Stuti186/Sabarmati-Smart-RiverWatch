/**
 * Blog Articles Utilities
 * Load and manage awareness blog articles
 */

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string | null;
  category: string;
  author: string;
  publishedDate: string;
  readTime: string;
}

// Static blog articles data
const blogArticlesData: BlogArticle[] = [
  {
    id: 'blog-001',
    title: 'Understanding Water Quality Parameters',
    excerpt:
      'Learn about pH, DO, BOD, and other critical water quality indicators that help monitor river health.',
    content:
      'Water quality monitoring is essential for maintaining healthy river ecosystems. Key parameters include pH levels, dissolved oxygen (DO), biological oxygen demand (BOD), and chemical oxygen demand (COD). Each parameter provides insights into the river\'s health and helps identify potential issues early.',
    thumbnail: null,
    category: 'Education',
    author: 'River Watch Team',
    publishedDate: '2024-01-15T10:00:00Z',
    readTime: '5 min read',
  },
  {
    id: 'blog-002',
    title: 'How to Reduce Plastic Waste in Rivers',
    excerpt:
      'Simple steps citizens can take to prevent plastic pollution and protect our waterways.',
    content:
      'Plastic waste is one of the biggest threats to river ecosystems. This article explores practical ways to reduce plastic usage, proper disposal methods, and community initiatives that make a difference. Learn how small changes in daily habits can have a significant impact on river health.',
    thumbnail: null,
    category: 'Environment',
    author: 'Environmental Team',
    publishedDate: '2024-01-12T14:30:00Z',
    readTime: '7 min read',
  },
  {
    id: 'blog-003',
    title: 'Flood Preparedness Guide',
    excerpt:
      'Essential tips for staying safe during flood events and understanding flood risk levels.',
    content:
      'Floods can occur suddenly and pose serious risks to life and property. This comprehensive guide covers flood risk assessment, early warning signs, evacuation procedures, and how to prepare your home and family for potential flooding. Stay informed and stay safe.',
    thumbnail: null,
    category: 'Safety',
    author: 'Safety Department',
    publishedDate: '2024-01-10T09:15:00Z',
    readTime: '10 min read',
  },
  {
    id: 'blog-004',
    title: 'The Importance of Biodiversity in Urban Water Bodies',
    excerpt:
      'Discover how diverse aquatic life contributes to healthy urban water ecosystems.',
    content:
      'Biodiversity plays a crucial role in maintaining balanced aquatic ecosystems. This article explains the relationship between species diversity and water quality, the benefits of healthy biodiversity, and how citizens can contribute to preserving aquatic life in urban water bodies.',
    thumbnail: null,
    category: 'Environment',
    author: 'Biology Team',
    publishedDate: '2024-01-08T11:00:00Z',
    readTime: '6 min read',
  },
  {
    id: 'blog-005',
    title: 'Smart Technology for River Monitoring',
    excerpt:
      'How IoT sensors and AI are revolutionizing water quality monitoring and flood prediction.',
    content:
      'Modern technology is transforming how we monitor and protect our rivers. Learn about IoT sensors that provide real-time data, AI-powered waste detection systems, and predictive analytics for flood management. Discover how these innovations help create smarter, more responsive river management.',
    thumbnail: null,
    category: 'Technology',
    author: 'Tech Team',
    publishedDate: '2024-01-05T16:20:00Z',
    readTime: '8 min read',
  },
  {
    id: 'blog-006',
    title: 'Community Cleanup Initiatives',
    excerpt:
      'Join local efforts to clean up the riverfront and make a positive impact on your community.',
    content:
      'Community involvement is key to maintaining clean and healthy rivers. This article highlights successful cleanup initiatives, how to organize your own cleanup event, and the lasting benefits of community action. Get inspired and take action in your neighborhood.',
    thumbnail: null,
    category: 'Community',
    author: 'Community Outreach',
    publishedDate: '2024-01-03T13:45:00Z',
    readTime: '4 min read',
  },
];

/**
 * Get all blog articles
 */
export function getBlogArticles(): BlogArticle[] {
  return blogArticlesData;
}

/**
 * Get article by ID
 */
export function getArticleById(id: string): BlogArticle | undefined {
  return blogArticlesData.find((article) => article.id === id) as BlogArticle | undefined;
}

/**
 * Get articles by category
 */
export function getArticlesByCategory(category: string): BlogArticle[] {
  return blogArticlesData.filter(
    (article) => article.category.toLowerCase() === category.toLowerCase()
  ) as BlogArticle[];
}

/**
 * Format published date
 */
export function formatPublishedDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get category icon
 */
export function getCategoryIcon(
  category: string
): keyof typeof import('@expo/vector-icons').Ionicons.glyphMap {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('education')) return 'school';
  if (categoryLower.includes('environment')) return 'leaf';
  if (categoryLower.includes('safety')) return 'shield';
  if (categoryLower.includes('technology')) return 'hardware-chip';
  if (categoryLower.includes('community')) return 'people';
  return 'document-text';
}

