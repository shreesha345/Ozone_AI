import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import SearchInterface from "@/components/SearchInterface";
import AuthDialog from "@/components/AuthDialog";

const Index = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isExpanded={false} variant="landing" onSignInClick={() => setAuthDialogOpen(true)} />
      <div className="flex-1 flex flex-col">
        {/* Top Banner with Close Button */}
        {bannerVisible && (
          <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm relative">
            <span className="mr-2">🤖</span>
            Get Our Chrome Extension
            <a href="#" className="ml-2 underline font-medium">
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
        
        <SearchInterface onSignInClick={() => setAuthDialogOpen(true)} showSignInPrompt={true} />
      </div>
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
};

export default Index;
