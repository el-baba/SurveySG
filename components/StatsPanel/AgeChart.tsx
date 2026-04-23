"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Props = {
  data: Array<{ bucket: string; count: number }>;
};

export function AgeChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
        <XAxis
          dataKey="bucket"
          tick={{ fontSize: 9, fill: "#64748b" }}
          interval={2}
        />
        <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
        <Tooltip
          contentStyle={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 8,
            fontSize: 11,
          }}
          cursor={{ fill: "rgba(148,163,184,0.1)" }}
        />
        <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
