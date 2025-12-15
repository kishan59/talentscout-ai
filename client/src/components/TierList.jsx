import { useState } from "react";
import { motion } from "framer-motion";
import CandidateModal from "./CandidateModal"; 

const TIER_CONFIG = {
  S: { label: "S-TIER", color: "text-neon-yellow", bg: "bg-neon-yellow/10", border: "border-neon-yellow/50" },
  A: { label: "A-TIER", color: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/50" },
  B: { label: "B-TIER", color: "text-neon-blue", bg: "bg-neon-blue/10", border: "border-neon-blue/50" },
  F: { label: "F-TIER", color: "text-neon-red", bg: "bg-neon-red/10", border: "border-neon-red/50" },
};

export default function TierList({ candidates, onRefresh }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const tiers = {
    S: candidates.filter((c) => c.tier === 'S'),
    A: candidates.filter((c) => c.tier === 'A'),
    B: candidates.filter((c) => c.tier === 'B'),
    F: candidates.filter((c) => c.tier === 'F'),
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Object.entries(tiers).map(([tierKey, list]) => {
          const config = TIER_CONFIG[tierKey];
          
          return (
            <div key={tierKey} className="flex flex-col gap-4">
              {/* Header */}
              <div className={`p-3 rounded-lg border ${config.bg} ${config.border} flex justify-between items-center backdrop-blur-sm`}>
                <span className={`font-bold font-mono tracking-widest ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-xs bg-black/30 px-2 py-1 rounded text-gray-300">
                  {list.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3 min-h-[200px]">
                {list.map((c) => (
                  <motion.div
                    key={c._id}
                    layoutId={c._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedCandidate(c)}
                    className={`
                      p-4 glass-card rounded-lg cursor-pointer group relative overflow-hidden transition-all
                      ${c.status === 'Invited' 
                        ? 'opacity-50 grayscale border-neon-green/30' // Dimmed + Green Border for Invited
                        : 'hover:border-neon-blue/50'
                      }
                    `}
                  >
                    {/* Colored Sidebar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bg.replace('/10', '')}`} />
                    
                    {/* BADGE: Moved to Top-Left to avoid overlapping the Score */}
                    {c.status === 'Invited' && (
                        <div className="absolute top-2 left-3 px-2 py-0.5 bg-neon-green/20 border border-neon-green/50 rounded text-[10px] text-neon-green font-mono font-bold tracking-wider shadow-[0_0_10px_rgba(0,255,159,0.3)] z-10">
                           INVITED
                        </div>
                    )}

                    {/* Header: Name & Score */}
                    <div className="flex justify-between items-start mb-2 pl-2 mt-1">
                      {/* Name: Pushed down (mt-6) if invited, so it clears the badge */}
                      <h4 className={`font-bold text-white truncate max-w-[120px] group-hover:text-neon-blue transition-colors ${c.status === 'Invited' ? 'mt-6' : ''}`}>
                        {c.name}
                      </h4>
                      {/* Score: Always Top Right */}
                      <span className={`text-xl font-bold font-mono ${config.color}`}>
                        {c.aiScore}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 pl-2 mb-3 line-clamp-2">
                      {c.summary}
                    </p>

                    <div className="flex flex-wrap gap-1 pl-2">
                      {c.badges.slice(0, 2).map((badge, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-gray-300">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
                
                {list.length === 0 && (
                  <div className="h-full border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center text-white/20 text-sm font-mono min-h-[150px]">
                    EMPTY SLOT
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CandidateModal 
        candidate={selectedCandidate} 
        isOpen={!!selectedCandidate} 
        onClose={() => setSelectedCandidate(null)} 
        onUpdate={onRefresh}
      />
    </>
  );
}