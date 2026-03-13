import type React from "react";

export interface Resource {
  title: string;
  url: string;
  description?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: React.ReactNode;
  date: string;
  category: string;
  author: string;
  tags: string[];
  resources?: Resource[];
  type?: "standard" | "foundational";
  image?: string;
}
