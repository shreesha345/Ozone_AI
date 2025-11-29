import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";

type PlanCategory = "personal" | "education" | "business";

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory>("personal");

  const proFeatures = [
    "10x as many citations in answers",
    "Access to Ozone Labs",
    "Unlimited file and photo uploads",
    "Extended access to Ozone Research",
    "Extended access to image generation",
    "Limited access to video generation",
    "One subscription to the latest AI models including GPT-5 and Claude Sonnet 4",
    "Exclusive access to Pro Perks and more",
  ];

  const maxFeatures = [
    "Everything in Pro",
    "Early access to our newest products",
    "Unlimited access to Ozone Labs",
    "Unlimited access to Ozone Research",
    "Unlimited access to advanced AI models from OpenAI and Anthropic such as o3-pro",
    "Enhanced access to video generation",
    "Priority support",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full flex-col items-center gap-4 py-12 px-4">
        {/* Category Selector */}
        <div className="relative flex h-fit mb-2">
          <div className="absolute inset-0 bg-primary/10 dark:bg-black/20 dark:border dark:border-black/5 rounded-[10px] transition-colors duration-300"></div>
          <div className="p-0.5 flex shrink-0 items-center">
            {(["personal", "education", "business"] as PlanCategory[]).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className="relative focus:outline-none"
              >
                {selectedCategory === category && (
                  <div className="pointer-events-none absolute inset-0 z-0 block bg-white dark:bg-black dark:bg-gradient-to-b dark:from-primary/20 dark:to-primary/20 border-primary dark:border-primary/30 border rounded-lg shadow-primary/30 dark:shadow-primary/5 shadow-[0_1px_3px_0] transition-colors duration-300"></div>
                )}
                <div className="relative z-10 flex h-8 min-w-9 items-center justify-center py-1 gap-1 px-2.5">
                  <div className={`px-0.5 text-sm leading-[1.125rem] transition-colors duration-300 ${
                    selectedCategory === category ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-col sm:flex-row w-full max-w-[660px] gap-0">
          {/* Pro Plan */}
          <div className="p-6 gap-3 flex flex-col pb-8 border border-border h-auto sm:h-[560px] w-full sm:w-[324px] flex-1 rounded-t-lg sm:rounded-l-lg sm:rounded-r-none sm:border-r-0">
            <div className="flex grow flex-col">
              <div className="mb-3 flex flex-col gap-4">
                <div className="flex justify-between gap-4">
                  <div className="text-base font-medium text-foreground">Pro</div>
                  <div className="flex h-fit items-center rounded-md px-2 py-1 bg-primary/10">
                    <div className="text-xs font-normal text-primary">Popular</div>
                  </div>
                </div>
                <div className="h-8">
                  <div className="flex items-end gap-1">
                    <div className="text-base font-medium text-foreground">$20.00</div>
                    <div className="pb-0.5 text-xs font-normal text-foreground">USD / month</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 mb-3 min-h-10">
                <div className="text-xs font-normal text-foreground">
                  Upgrade productivity and learning with additional access.
                </div>
              </div>
              
              <div className="mb-6 mt-1 flex flex-col gap-2">
                <button
                  type="button"
                  className="bg-primary text-primary-foreground hover:opacity-80 font-sans focus:outline-none transition duration-300 ease-out select-none items-center relative font-medium justify-center text-center rounded-lg cursor-pointer active:scale-[0.97] active:duration-150 flex w-full text-base h-10 px-3"
                >
                  <div className="flex items-center min-w-0 gap-0.5 justify-center w-full">
                    <div className="relative truncate text-center px-1 leading-loose">Get Pro</div>
                  </div>
                </button>
              </div>
              
              <ul className="flex flex-col gap-3">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex flex-row gap-2">
                    <div className="flex items-center">
                      <Check className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="text-xs font-normal text-muted-foreground">{feature}</div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-auto pt-4">
              <div className="text-xs font-normal text-muted-foreground">
                Existing subscriber? See{" "}
                <a className="underline" target="_blank" href="/help/billing">
                  billing help
                </a>
              </div>
            </div>
          </div>

          {/* Max Plan */}
          <div className="p-6 gap-3 flex flex-col pb-8 border border-border h-auto sm:h-[560px] w-full sm:w-[324px] flex-1 rounded-b-lg sm:rounded-r-lg sm:rounded-l-none">
            <div className="flex grow flex-col">
              <div className="mb-3 flex flex-col gap-4">
                <div className="flex justify-between gap-4">
                  <div className="text-base font-medium text-foreground">Max</div>
                </div>
                <div className="h-8">
                  <div className="flex items-end gap-1">
                    <div className="text-base font-medium text-foreground">$200.00</div>
                    <div className="pb-0.5 text-xs font-normal text-foreground">USD / month</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 mb-3 min-h-10">
                <div className="text-xs font-normal text-foreground">
                  Unlock Ozone's full capabilities with early access to new products.
                </div>
              </div>
              
              <div className="mb-6 mt-1 flex flex-col gap-2">
                <button
                  type="button"
                  className="bg-foreground text-background hover:opacity-80 font-sans focus:outline-none transition duration-300 ease-out select-none items-center relative font-medium justify-center text-center rounded-lg cursor-pointer active:scale-[0.97] active:duration-150 flex w-full text-base h-10 px-3"
                >
                  <div className="flex items-center min-w-0 gap-0.5 justify-center w-full">
                    <div className="relative truncate text-center px-1 leading-loose">Get Max</div>
                  </div>
                </button>
              </div>
              
              <ul className="flex flex-col gap-3">
                {maxFeatures.map((feature, index) => (
                  <li key={index} className="flex flex-row gap-2">
                    <div className="flex items-center">
                      <Check className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="text-xs font-normal text-muted-foreground">{feature}</div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-auto pt-4">
              <div className="text-xs font-normal text-muted-foreground">
                For personal use only and subject to our{" "}
                <a className="underline" target="_blank" href="/terms">
                  policies
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
