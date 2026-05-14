import React from "react";

interface TrackMapProps {
  circuitId: string;
  circuitName: string;
}

export default function TrackMap({ circuitId, circuitName }: TrackMapProps) {
  return (
    <div className="w-full md:w-1/2 flex justify-center md:justify-end opacity-80 hover:opacity-100 transition-opacity mt-6 md:mt-0">
      <img 
        src={`/circuits/${circuitId}.svg`} 
        alt={`Traçado do circuito ${circuitName}`}
        className="w-full max-w-70 sm:max-w-87.5 drop-shadow-2xl brightness-200"
        onError={(e) => (e.currentTarget.style.display = 'none')} 
      />
    </div>
  );
}