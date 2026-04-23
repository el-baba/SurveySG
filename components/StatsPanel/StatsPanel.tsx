"use client";

import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "@/store/filterStore";
import { filtersToSearchParams } from "@/lib/filters";
import { AgeChart } from "./AgeChart";
import { EthnicityDonut } from "./EthnicityDonut";

export function StatsPanel() {
  const filters = useFilterStore();
  const { subzone, planningArea } = useFilterStore();

  const selectedArea = subzone ?? planningArea;
  const params = filtersToSearchParams(filters);

  const { data, isLoading } = useQuery({
    queryKey: ["breakdown", params.toString()],
    queryFn: () =>
      fetch(`/api/personas/breakdown?${params}`).then((r) => r.json()),
    enabled: !!selectedArea,
  });

  if (!selectedArea) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-white/30 text-xs text-center px-4">
          Click a planning area or subzone on the map to see demographics.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-6">
      {data && (
        <p className="text-xs text-white/30">{data.total} matching personas</p>
      )}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <>
          <ChartSection label="Sex">
            <EthnicityDonut data={data.sexSplit} />
          </ChartSection>
          <ChartSection label="Education Level">
            <EthnicityDonut data={data.educationSplit} />
          </ChartSection>
          <ChartSection label="Age Distribution">
            <AgeChart data={data.ageBuckets} />
          </ChartSection>
        </>
      ) : (
        <p className="text-white/30 text-xs">No data available.</p>
      )}
    </div>
  );
}

function ChartSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-white/30 font-medium mb-2">{label}</p>
      {children}
    </div>
  );
}
