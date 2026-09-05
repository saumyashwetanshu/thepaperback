import React from "react";
import { Link } from "react-router-dom";

interface BreadcrumbProps {
  story: {
    id: string;
    title: string;
    category: string;
  };
}

export function Breadcrumb({ story }: BreadcrumbProps) {
  return (
    <nav className="mb-4 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
      <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300">
        Home
      </Link>
      <span className="mx-2">/</span>
      <Link
        to={`/search?q=${encodeURIComponent(story.category)}`}
        className="hover:text-gray-600 dark:hover:text-gray-300"
      >
        {story.category}
      </Link>
      <span className="mx-2">/</span>
      <span className="text-gray-600 dark:text-gray-300">
        {story.title.length > 30 ? story.title.substring(0, 30) + "..." : story.title}
      </span>
    </nav>
  );
}