import React from "react";

export function HomeSkeleton() {
  return (
    <div className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 flex flex-col animate-pulse">
      {/* Greeting Header Skeleton */}
      <section className="mb-6 flex flex-col items-start pt-6 pb-2 border-b-2 border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-64 mb-4"></div>
      </section>

      {/* Main Layout Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pt-4">
        {/* Left Column (8 Cols) */}
        <div className="md:col-span-8 flex flex-col gap-8">
          {/* Hero Skeleton */}
          <div className="flex flex-col bg-white p-4 rounded-[16px] mb-8 border border-gray-100">
            <div className="w-full aspect-[4/3] md:aspect-[16/9] bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>

          {/* Essential Stories Section Skeleton */}
          <section className="pt-8 mt-4 border-t border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex flex-col bg-white p-4 rounded-[16px] border border-gray-100">
                  <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (4 Cols) */}
        <div className="md:col-span-4 flex flex-col gap-8">
          <div className="bg-gray-50 rounded-[16px] p-6 h-[400px]">
             <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
             {[1, 2, 3].map((i) => (
               <div key={i} className="flex gap-4 mb-4">
                 <div className="h-10 w-10 bg-gray-200 rounded-full shrink-0"></div>
                 <div className="flex-1">
                   <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                   <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
