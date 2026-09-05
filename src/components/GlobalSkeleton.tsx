import React from "react";

export function GlobalSkeleton() {
  return (
    <div className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 flex flex-col">
      <div className="animate-pulse flex flex-col space-y-8 mt-12">
        <div className="h-12 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-12"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          <div className="md:col-span-8 flex flex-col space-y-6">
            <div className="h-80 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="md:col-span-4 flex flex-col space-y-6">
            <div className="h-40 bg-gray-200 rounded w-full"></div>
            <div className="h-40 bg-gray-200 rounded w-full"></div>
            <div className="h-40 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
