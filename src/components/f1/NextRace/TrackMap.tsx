import React from "react";

interface TrackMapProps {
  circuitId: string;
  circuitName: string;
}

export default function TrackMap({ circuitId, circuitName }: TrackMapProps) {
  return (
    <div className="w-full md:w-1/2 flex justify-center md:justify-end opacity-80 hover:opacity-100 transition-opacity mt-4 md:mt-0 flex-shrink-0">
      <img 
        src={`/circuits/${circuitId}.svg`} 
        alt={`Traçado do circuito ${circuitName}`}
        className="w-auto h-full max-h-[35dvh] sm:max-h-[40dvh] md:max-h-none object-contain drop-shadow-2xl brightness-200"
        onError={(e) => (e.currentTarget.style.display = 'none')} 
      />
    </div>
  );
}