// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

// 网站配置
export const SITE_TITLE = "Aktan Azat";
export const SITE_DESCRIPTION = "Welcome (. ❛ ᴗ ❛.)";
export const COPYRIGHT = "© 2025 AKTAN AZAT. All rights reserved.";
export const ICP_NUMBER = "";

// 社交媒体链接, 留空或注释=不显示
export const SOCIAL_LINKS = {
  Github: "https://github.com/derpcube",
  // Twitter: "https://twitter.com/yourusername",
  //   LinkedIn: "https://www.linkedin.com/in/yourusername",
  //   Instagram: "https://www.instagram.com/yourusername",
  //   Facebook: "https://www.facebook.com/yourusername",
  //   YouTube: "https://www.youtube.com/yourusername",
};

export const SEO_CONFIG = {
  ogImage: "/hero-img.png", 
  keywords: "blog, tech, programming", 
};

export const NAV_ITEMS = [
  { text: "Home", link: "/" },
  { text: "Academic History", link: "/academic-history" },
  { text: "Blog", link: "/blog" },
  { text: "Favorites", link: "/favorites" },
  { text: "Resume", link: "/resume" },
];

export const BLOG_CONFIG = {
  locale: "en-us", // 日期格式化语言
  profile: "https://github.com/derpcube",
  authorName: "Author Name", // 作者名称
  email: "mailto:aazat@ucdavis.edu",
  tags: {
    title: "Tags", // 标签页面标题
    description: "All the tags used in posts.", // 标签页面描述
  },
};
