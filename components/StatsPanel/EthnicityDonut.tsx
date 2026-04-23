"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

type Props = {
  data: Array<{ name: string; value: number }>;
};

export function EthnicityDonut({ data }: Props) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={120}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={28}
          outerRadius={45}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 8,
            fontSize: 11,
          }}
        />
        <Legend
          iconSize={8}
          wrapperStyle={{ fontSize: 10, color: "#94a3b8" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
