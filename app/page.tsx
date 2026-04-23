import { MapContainer } from "@/components/Map/MapContainer";
import { TitlePanel } from "@/components/TitlePanel/TitlePanel";
import { FilterPanel } from "@/components/FilterPanel/FilterPanel";
import { RightPanel } from "@/components/RightPanel/RightPanel";
import { ChatBar } from "@/components/ChatBar/ChatBar";

export default function Home() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Full-screen map */}
      <MapContainer />

      {/* Title panel */}
      <TitlePanel />

      {/* Top-left filter panel */}
      <FilterPanel />

      {/* Right panel: Stats + Voices tabs */}
      <RightPanel />

      {/* Bottom chat bar */}
      <ChatBar />
    </div>
  );
}
