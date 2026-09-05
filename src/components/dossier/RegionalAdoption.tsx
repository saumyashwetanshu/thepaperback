import React from "react";
import type { NewsStory } from "../../types";

interface RegionalAdoptionProps {
  story: NewsStory;
}

export function RegionalAdoption({ story }: RegionalAdoptionProps) {
  if (!story.region && !story.regionType) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-4">
        <h3 className="text-[11px] font-bold text-black uppercase tracking-widest mb-2 border-b border-gray-200 pb-2">
          Regional Adoption
        </h3>
        <div className="text-gray-500 text-sm">
          No regional data associated with this story.
        </div>
      </div>
    );
  }

  // Determine a placeholder map image based on regionType
  let mapImage = "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800&h=600";
  if (story.regionType === "northeast") {
    mapImage = "https://images.unsplash.com/photo-1582972236019-ea4af5eaeb0c?auto=format&fit=crop&q=80&w=800&h=600";
  } else if (story.regionType === "south") {
    mapImage = "https://images.unsplash.com/photo-1614264667530-58097b69c6fc?auto=format&fit=crop&q=80&w=800&h=600"; // Kerala/South India vibe
  } else if (story.regionType === "himalayan") {
    mapImage = "https://images.unsplash.com/photo-1626245083167-17fc5e1ed4f5?auto=format&fit=crop&q=80&w=800&h=600";
  } else if (story.regionType === "national") {
    mapImage = "https://images.unsplash.com/photo-1533423996375-f914ab160932?auto=format&fit=crop&q=80&w=800&h=600"; // India map/globe vibe
  }

  return (
    <div className="bg-white border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="text-[11px] font-bold text-black uppercase tracking-widest">
          Regional Impact: {story.regionType ? story.regionType.charAt(0).toUpperCase() + story.regionType.slice(1) : "Localized"}
        </h3>
        <span className="material-symbols-outlined text-gray-500 text-[18px]" data-icon="map">
          map
        </span>
      </div>
      <div
        className="h-64 relative bg-gray-100"
        style={{
          backgroundImage: `url('${mapImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Real map visualization could go here */}
      </div>
      <div className="p-4 text-base text-gray-700 leading-relaxed">
        {story.region ? `High concentration of related entities observed in ${story.region}.` : "Broad regional resonance with concentrated reporting nodes."}
      </div>
    </div>
  );
}
