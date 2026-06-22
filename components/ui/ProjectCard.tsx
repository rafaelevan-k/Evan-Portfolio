"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface ProjectCardProps {
  title: string;
  role: string;
  description: string;
  image: string;
  tags: string[];
  index: number;
  repoLink?: string;
  isPrivate?: boolean;
}

export function ProjectCard({ title, role, description, image, tags, index, repoLink, isPrivate }: ProjectCardProps) {
  const href = repoLink 
    ? (isPrivate ? `/private-repo?repo=${encodeURIComponent(repoLink)}` : repoLink)
    : undefined;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden rounded-2xl glass-panel transition-all duration-300 hover:shadow-xl dark:hover:shadow-white/5 hover:-translate-y-1 h-full"
    >
      {/* Project Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-soft">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Role badge (floating) */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-ink/90 backdrop-blur-md text-on-dark shadow-sm">
            {role}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-grow p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-display text-xl font-bold text-ink group-hover:text-ink-deep transition-colors">
            {title}
          </h3>
          {href && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-soft text-ink opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          )}
        </div>
        
        <p className="text-body-text text-sm leading-relaxed mb-6 flex-grow">
          {description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-medium rounded-md bg-surface-soft text-charcoal border border-hairline transition-colors group-hover:border-hairline-strong"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <Link 
        href={href} 
        target={isPrivate ? undefined : "_blank"} 
        rel={isPrivate ? undefined : "noopener noreferrer"}
        className="block outline-none h-full"
      >
        {content}
      </Link>
    );
  }

  return <div className="h-full">{content}</div>;
}
