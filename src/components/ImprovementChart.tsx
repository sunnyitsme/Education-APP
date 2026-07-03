"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface ScorePoint {
  date: string; // short label e.g. "12 Jun"
  percentage: number;
  name: string; // test/paper name for the tooltip
}

/**
 * Improvement over time: one series (score %), light surface.
 * Line 2px, recessive grid, text in ink tokens, tooltip on hover.
 */
export function ImprovementChart({ data }: { data: ScorePoint[] }) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        Take at least one mock test or paper to see your improvement chart.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            unit="%"
          />
          <Tooltip
            cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 13,
              color: "#0f172a",
            }}
            formatter={(value) => [`${value ?? 0}%`, "Score"]}
            labelFormatter={(label, payload) => {
              const p = payload?.[0]?.payload as ScorePoint | undefined;
              return p ? `${label} · ${p.name}` : String(label);
            }}
          />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 3, fill: "#4f46e5", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#4f46e5", stroke: "#ffffff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
