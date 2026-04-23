"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Props = {
  data: Array<{ name: string; count: number }>;
};

export function OccupationChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
      >
        <XAxis type="number" tick={{ fontSize: 9, fill: "#64748b" }} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 9, fill: "#94a3b8" }}
          width={90}
        />
        <Tooltip
          contentStyle={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 8,
            fontSize: 11,
          }}
          cursor={{ fill: "rgba(148,163,184,0.1)" }}
        />
        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
