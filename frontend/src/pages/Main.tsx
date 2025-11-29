import Sidebar from "@/components/Sidebar";
import SearchInterface from "@/components/SearchInterface";
import DiscoverFeed from "@/components/DiscoverFeed";
import AuthDialog from "@/components/AuthDialog";
import NetworkVisualizer from "@/components/NetworkVisualizer";
import { useState } from "react";

const Main = () => {
  const [view, setView] = useState<"home" | "discover" | "spaces" | "finance">("home");
  const [discoverTab, setDiscoverTab] = useState<"forYou" | "topAfekNews" | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [visualizeQuery, setVisualizeQuery] = useState<string | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);

  const handleDiscoverTabSelect = (tab: "forYou" | "topAfekNews") => {
    setDiscoverTab(tab);
    setView("discover");
  };

  const handleViewSelect = (newView: "home" | "discover" | "spaces" | "finance") => {
    setView(newView);
    // Reset discover tab when switching away from discover
    if (newView !== "discover") {
      setDiscoverTab(null);
    }
  };

  const renderContent = () => {
    // Show visualizer if active
    if (visualizeQuery) {
      return (
        <div className="flex-1 overflow-hidden">
          <NetworkVisualizer query={visualizeQuery} onClose={() => setVisualizeQuery(null)} />
        </div>
      );
    }
    // Only show DiscoverFeed when a specific tab is selected
    if (view === "discover" && discoverTab) {
      return (
        <div className="flex-1 overflow-y-auto">
          <DiscoverFeed initialTab={discoverTab} />
        </div>
      );
    }
    // Show SearchInterface for home, finance (Visualize), or when no discover tab is selected
    if (view === "home" || view === "finance" || !view || (view === "discover" && !discoverTab)) {
      return <SearchInterface onSignInClick={() => setAuthDialogOpen(true)} showSignInPrompt={false} />;
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        selected={view}
        onSelect={handleViewSelect}
        discoverTab={discoverTab}
        onDiscoverTabSelect={handleDiscoverTabSelect}
        isExpanded={sidebarExpanded}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        onSignInClick={() => setAuthDialogOpen(true)}
        variant="main"
        visualizeQuery={visualizeQuery}
        setVisualizeQuery={setVisualizeQuery}
      />
      <div className="flex-1 flex flex-col">
        {/* Top Banner with Close Button */}
        {bannerVisible && (
          <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm relative">
            <span className="mr-2">🤖</span>
            Try out our Extension
            <a href="/pricing" className="ml-2 underline font-medium">
              Download →
            </a>
            <button
              onClick={() => setBannerVisible(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-primary-foreground/20 rounded-full p-1 transition-colors"
              aria-label="Close banner"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
        {renderContent()}
      </div>
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
};

export default Main;
