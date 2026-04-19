export type ProjectType = 'photography' | 'video';

export interface Project {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  thumbnail: string;
  media: string[]; // URLs for images or video embed IDs
  client?: string;
  equipment?: string;
  category: string;
}

export interface Category {
  id: string;
  ko: string;
  en: string;
  img: string;
}

export interface SiteContent {
  about: {
    name: string;
    description: string;
    bio: string;
    email: string;
    avatar?: string;
  };
  socialLinks: {
    platform: string;
    url: string;
  }[];
  categories: Category[];
}
