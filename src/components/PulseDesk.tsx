import React from "react";
import { LiveWire } from "./LiveWire";
import { FALLBACK_WIRE } from "../data/fallbackNews";
import { LiveWireItem } from "../types";

interface PulseDeskProps {
  onSelectWireItem?: (item: LiveWireItem) => void;
}

export function PulseDesk({ onSelectWireItem }: PulseDeskProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-8 text-center animate-fade-in my-8">
      {/* Title Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-stone-950 tracking-tight">
          The Pulse
        </h1>
        <p className="text-stone-500 font-sans text-sm sm:text-base">
          Community narrative tracking coming soon.
        </p>
      </div>

      {/* Live Wire Feed below */}
      <div className="pt-4">
        <LiveWire items={FALLBACK_WIRE} onSelectWireItem={onSelectWireItem} />
      </div>
    </div>
  );
}

