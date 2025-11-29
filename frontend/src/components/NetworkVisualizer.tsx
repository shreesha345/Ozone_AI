import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { gsap } from 'gsap';
import misinfo from '@/lib/services/misinformationService';

interface VisualizerProps {
  query: string;
  onClose?: () => void;
}

type NodeDatum = {
  id: string;
  label: string;
  x?: number;
  y?: number;
  r?: number;
  truth?: 'true' | 'false' | 'unknown';
  url?: string;
};

type LinkDatum = { source: string; target: string };

const NetworkVisualizer = ({ query, onClose }: VisualizerProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ true: 0, false: 0, unknown: 0 });

  useEffect(() => {
    if (!query) return;
    let mounted = true;
    const run = async () => {
      setLoading(true);
      try {
        const articles = await misinfo.getTrendingNews(query, 10);
        if (!mounted) return;
        // Build nodes and links
        const centerId = `query::${query}`;
        const nodes: NodeDatum[] = [
          { id: centerId, label: query, r: 26, truth: 'unknown' },
        ];
        const links: LinkDatum[] = [];

        const results = await Promise.all(
          articles.map(async (a) => {
            const nd: NodeDatum = {
              id: a.url || `${Date.now()}-${Math.random()}`,
              label: a.title || a.url || 'Article',
              r: 18,
              truth: 'unknown',
              url: a.url,
            };
            // Heuristic classification using keywords
            const titleLower = (a.title || '').toLowerCase();
            const keywordsFalse = ['debunk', 'false', 'fake', 'hoax', 'misinformation', 'scam'];
            const keywordsTrue = ['verified', 'true', 'confirmed', 'study finds'];
            if (keywordsFalse.some((k) => titleLower.includes(k))) {
              nd.truth = 'false';
            } else if (keywordsTrue.some((k) => titleLower.includes(k))) {
              nd.truth = 'true';
            } else {
              // Try Google Fact Check if configured
              try {
                const fc = await misinfo.checkClaimWithGoogle(nd.label);
                if (fc && fc.claims && fc.claims.length > 0) {
                  const review = fc.claims[0].claimReview?.[0]?.textualRating || '';
                  const ratingLower = review.toLowerCase();
                  if (ratingLower.includes('false') || ratingLower.includes('pants on fire') || ratingLower.includes('mostly false')) nd.truth = 'false';
                  else if (ratingLower.includes('true') || ratingLower.includes('mostly true')) nd.truth = 'true';
                  else nd.truth = 'unknown';
                }
              } catch (err) {
                // ignore
              }
            }
            return nd;
          })
        );

        nodes.push(...results);
        for (const a of results) links.push({ source: centerId, target: a.id });

        // Update counts
        const c = { true: 0, false: 0, unknown: 0 };
        for (const n of nodes) {
          if (n.truth === 'true') c.true += 1;
          else if (n.truth === 'false') c.false += 1;
          else c.unknown += 1;
        }
        setCounts(c);

        // Render with d3
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        const width = svgRef.current?.clientWidth || 800;
        const height = svgRef.current?.clientHeight || 600;

        const linkGroup = svg.append('g').attr('class', 'links');
        const nodeGroup = svg.append('g').attr('class', 'nodes');

        const linkEls = linkGroup.selectAll('line').data(links).enter().append('line')
          .attr('stroke', '#808080')
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0)
          .attr('x1', width / 2).attr('y1', height / 2).attr('x2', width / 2).attr('y2', height / 2);

        const nodeEls = nodeGroup.selectAll('g').data(nodes).enter().append('g').attr('class', 'node').style('cursor', 'pointer');

        // Circle
        nodeEls.append('circle')
          .attr('r', (d: any) => d.r || 16)
          .attr('fill', (d: any) => (d.id === centerId ? '#000000' : d.truth === 'true' ? '#ffffff' : '#808080'))
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .attr('cx', width / 2)
          .attr('cy', height / 2);

        // Text
        nodeEls.append('text')
          .text((d: any) => d.label)
          .attr('font-size', 12)
          .attr('fill', '#ffffff')
          .attr('text-anchor', 'middle')
          .attr('dy', (d: any) => (d.id === centerId ? 40 : 34))
          .attr('opacity', 0)
          .attr('x', width / 2)
          .attr('y', height / 2);

        nodeEls.on('click', (event: any, d: any) => {
          if (d.url) window.open(d.url, '_blank');
        });

        // D3 force layout, compute final positions
        const simulation = d3.forceSimulation(nodes as any)
          .force('link', d3.forceLink(links as any).id((d: any) => d.id).distance(220).strength(1))
          .force('charge', d3.forceManyBody().strength(-420))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .stop();

        // Run ticks to compute final layout positions
        for (let i = 0; i < 300; ++i) simulation.tick();

        // animate nodes to their computed positions using GSAP
        const nodeSelection = nodeGroup.selectAll('g').nodes();
        nodeSelection.forEach((ng: any, idx: number) => {
          const d = (nodes as any)[idx];
          gsap.to(ng.querySelector('circle'), { cx: d.x, cy: d.y, duration: 1.5, ease: 'expo.out' });
          gsap.to(ng.querySelector('text'), { x: d.x, y: d.y + (d.id === centerId ? 40 : 34), opacity: 1, duration: 1.5, ease: 'expo.out' });
        });

        // After nodes are spread, animate links to grow
        gsap.to(linkGroup.selectAll('line'), { attr: { strokeOpacity: 0.8 }, duration: 1, delay: 1.5, ease: 'expo.out' });
      } catch (err) {
        console.error('[Visualizer] failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [query]);

  return (
    <div className="w-full h-full relative bg-black p-3">
      <div className="absolute top-4 left-4 z-10 text-white text-lg font-semibold">
        Network Visualization for "{query}"
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-300 text-sm">Close</button>
      </div>
      <div className="absolute right-3 top-3 z-50 text-xs text-gray-400">True: {counts.true} • False: {counts.false} • Unknown: {counts.unknown}</div>
      <svg ref={svgRef} className="w-full h-full rounded" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 text-white">Loading…</div>
      )}
      <div className="absolute right-3 bottom-3 text-xs text-gray-400">Click a node to open the article</div>
    </div>
  );
};

export default NetworkVisualizer;
