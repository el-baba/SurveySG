import { MapContainer } from "@/components/Map/MapContainer";
import { FilterPanel } from "@/components/FilterPanel/FilterPanel";
import { RightPanel } from "@/components/RightPanel/RightPanel";
import { ChatBar } from "@/components/ChatBar/ChatBar";

export default function Home() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Full-screen map */}
      <MapContainer />

      {/* Top-left filter panel */}
      <FilterPanel />

      {/* Right panel: Stats + Voices tabs */}
      <RightPanel />

      {/* Bottom chat bar */}
      <ChatBar />
    </div>
  );
}
