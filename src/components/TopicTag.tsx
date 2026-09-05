import React from "react";

interface TopicTagProps {
  topic: string;
  className?: string;
}

export function TopicTag({ topic, className = "" }: TopicTagProps) {
  // Capitalize first letter of each word
  const formattedTopic = topic
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className} bg-primary/10 text-primary border border-primary/20`}>
      {formattedTopic}
    </span>
  );
}