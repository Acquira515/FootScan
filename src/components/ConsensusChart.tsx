"use client";

import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';

interface ConsensusChartProps {
  data: any[];
  homeName?: string;
  awayName?: string;
}

export default function ConsensusChart({ data, homeName = 'Home', awayName = 'Away' }: ConsensusChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#333" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name={homeName} dataKey="A" stroke="#fff" fill="#fff" fillOpacity={0.3} />
        <Radar name={awayName} dataKey="B" stroke="#E50914" fill="#E50914" fillOpacity={0.3} />
        <Legend wrapperStyle={{ fontSize: 10 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
