import React from "react";

export interface SourceItem {
  title: string;
  url: string;
  site: string;
  snippet: string;
}

export const MOCK_SOURCES: SourceItem[] = [
  {
    title: "What Came First, the Chicken or the Egg? - Science | HowStuffWorks",
    url: "https://science.howstuffworks.com/life/genetic/question85.htm",
    site: "HowStuffWorks",
    snippet: "It's a chicken-or-egg situation: What came first? Perplexed people need wonder no longer, as we've sussed out the answer to this ancient riddle.",
  },
  {
    title: "Chicken Came Before the Egg: 'Scientific Proof'",
    url: "https://www.cbsnews.com/news/chicken-came-before-the-egg-scientific-proof/",
    site: "CBS News",
    snippet: "Researchers in U.K. say Proof is in the Protein Found in Chicken's Ovaries, Used to Form Eggshell",
  },
  {
    title: "It's Official: The Egg Came Before the Chicken - Popular Mechanics",
    url: "https://www.popularmechanics.com/science/animals/a62940858/egg-chickin-mitosis/",
    site: "Popular Mechanics",
    snippet: "And maybe all animal life, for that matter.",
  },
  {
    title: "Cracked: The chicken came before the egg - Poultry World",
    url: "https://www.poultryworld.net/home/cracked-the-chicken-came-before-the-egg/",
    site: "Poultry World",
    snippet: "Cracked: The chicken came before the egg",
  },
  {
    title: "Chicken or the egg - Wikipedia",
    url: "https://en.wikipedia.org/wiki/Chicken_or_the_egg",
    site: "Wikimedia Foundation, Inc.",
    snippet: "If the question refers to eggs in general, the egg came first. The first amniote egg – that is, a hard-shelled egg that could be laid on land, rather than remaining in water like the eggs of fish or amphibians – appeared around 312 million years ago...",
  },
  {
    title: "Which came first: The chicken or the egg? - Live Science",
    url: "https://www.livescience.com/which-came-first-the-chicken-or-the-egg",
    site: "Live Science",
    snippet: "Most biologists will answer confidently when asked 'which came first, the chicken or the egg?' but the answer may depend on what type of egg you're talking about.",
  },
  {
    title: "Which came first: the chicken or the egg? - Curious",
    url: "https://www.science.org.au/curious/earth-environment/which-came-first-chicken-or-egg",
    site: "Curious",
    snippet: "Science can help us find the answer.",
  },
  {
    title: "Chicken or the Egg?",
    url: "https://www.reddit.com/r/evolution/comments/qb6ibr/chicken_or_the_egg/",
    site: "reddit",
    snippet: "Chicken or the Egg?",
  },
  {
    title: "Which came first, the chicken or the egg? - BBC Science Focus ...",
    url: "https://www.sciencefocus.com/nature/which-came-first-the-chicken-or-the-egg",
    site: "BBC Science Focus Magazine",
    snippet: "The age-old riddle has finally been settled.",
  },
  {
    title: "What came first? Chicken or an egg? Science finally has ...",
    url: "https://timesofindia.indiatimes.com/etimes/trending/what-came-first-chicken-or-an-egg-science-finally-has-an-answer/articleshow/114395840.cms",
    site: "Times Of India",
    snippet: "The age-old debate of whether the chicken or the egg came first is explored through historical and evolutionary contexts. Eggs, appearing millions of...",
  },
];

export function getFaviconUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`;
  } catch {
    return "";
  }
}
