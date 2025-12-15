"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";

// Custom Tick to handle text wrapping
function CustomTick({ payload, x, y, textAnchor, stroke, radius }) {
  const words = payload.value.split(" ");
  const lineHeight = 10; // Tight line height for compact look

  return (
    <g className="recharts-layer recharts-polar-angle-axis-tick">
      {/* dy calculation: 
         - If single word, center it.
         - If multiple words, shift up slightly so the block is centered.
      */}
      <text
        x={x}
        y={y}
        dy={words.length > 1 ? -5 : 3} 
        textAnchor={textAnchor}
        fill="#9ca3af"
        fontSize={10}
        fontWeight={500}
      >
        {words.map((word, i) => (
          <tspan key={i} x={x} dy={i === 0 ? 0 : lineHeight}>
            {word}
          </tspan>
        ))}
      </text>
    </g>
  );
}

export default function CandidateRadar({ skills }) {
  const data = Object.entries(skills || {}).map(([key, value]) => ({
    subject: key,
    A: value,
    fullMark: 100,
  }));

  if (data.length === 0) return <div className="text-gray-500 text-xs text-center py-10">No Skill Data</div>;

  return (
    <div className="w-full h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        {/* FIX EXPLANATION:
           1. margin: Increased to 30px on all sides. This forces the chart inward,
              creating a "Safe Zone" for text labels so they don't clip.
           2. outerRadius="60%": Slightly reduced to ensure the "Spider Web" 
              plus the Text Labels fit perfectly inside the 300px box.
        */}
        <RadarChart 
          cx="50%" 
          cy="50%" 
          outerRadius="60%" 
          data={data} 
          margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
        >
          <PolarGrid stroke="#333" />
          
          <PolarAngleAxis 
            dataKey="subject" 
            tick={(props) => <CustomTick {...props} />} 
          />
          
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Radar
            name="Skill Level"
            dataKey="A"
            stroke="#00f3ff"
            strokeWidth={2}
            fill="#00f3ff"
            fillOpacity={0.2}
          />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#050505', border: '1px solid #333', borderRadius: '8px' }}
            itemStyle={{ color: '#00f3ff' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 bg-neon-blue/5 blur-3xl -z-10 rounded-full" />
    </div>
  );
}