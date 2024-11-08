import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { storage } from '../utils/storage';

interface SankeyNodeExtended {
  node: number;
  name: string;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  value?: number;
  index?: number;
  sourceLinks?: any[];
  targetLinks?: any[];
}

interface SankeyLinkExtended {
  source: SankeyNodeExtended;
  target: SankeyNodeExtended;
  value: number;
  width?: number;
  y0?: number;
  y1?: number;
}

const COLORS = {
  'WISHLIST': '#94a3b8',
  'EMAIL_INQUIRY': '#60a5fa',
  'APPLIED': '#fbbf24',
  'PHONE_SCREEN': '#a855f7',
  'TECHNICAL': '#6366f1',
  'ONSITE': '#ec4899',
  'OFFER': '#22c55e',
  'REJECTED': '#ef4444',
  'WITHDRAWN': '#64748b',
  'STAGE': '#0ea5e9'  // Default color for interview stages
};

export function Reports() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(800, width),
          height: 600
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    // Clear any existing content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 150, bottom: 20, left: 150 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get data from storage
    const { nodes: initialNodes, links: initialLinks } = storage.getSankeyData();

    // Skip rendering if no data
    if (initialNodes.length === 0 || initialLinks.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#64748b')
        .text('No application flow data available');
      return;
    }

    // Transform data for d3-sankey
    const nodeMap = new Map<string, number>();
    initialNodes.forEach((node, index) => {
      nodeMap.set(node, index);
    });

    const nodes: SankeyNodeExtended[] = initialNodes.map((node, index) => ({
      node: index,
      name: node.replace('STAGE_', '').replace(/_/g, ' ').toLowerCase()
    }));

    const links: SankeyLinkExtended[] = initialLinks.map(link => ({
      source: nodes[nodeMap.get(link.source) || 0],
      target: nodes[nodeMap.get(link.target) || 0],
      value: link.value
    }));

    // Create sankey generator
    const sankeyGenerator = sankey<SankeyNodeExtended, SankeyLinkExtended>()
      .nodeId(d => d.node)
      .nodeWidth(20)
      .nodePadding(20)
      .extent([[0, 0], [width, height]]);

    // Generate the sankey diagram
    const sankeyData = sankeyGenerator({
      nodes,
      links: links.map(d => ({ ...d }))
    });

    if (!sankeyData.nodes || !sankeyData.links) return;

    // Create color gradients for links
    const defs = svg.append('defs');
    sankeyData.links.forEach((link, i) => {
      const sourceNode = initialNodes[link.source.node];
      const targetNode = initialNodes[link.target.node];
      const gradientId = `gradient-${i}`;
      
      const sourceColor = sourceNode.startsWith('STAGE_') ? COLORS.STAGE : 
        COLORS[sourceNode as keyof typeof COLORS] || '#94a3b8';
      const targetColor = targetNode.startsWith('STAGE_') ? COLORS.STAGE :
        COLORS[targetNode as keyof typeof COLORS] || '#94a3b8';

      const gradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', String(link.source.x1 || 0))
        .attr('x2', String(link.target.x0 || 0));

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', sourceColor);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', targetColor);
    });

    // Add links
    const links_g = svg.append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.3)
      .selectAll('path')
      .data(sankeyData.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (_, i) => `url(#gradient-${i})`)
      .attr('stroke-width', d => Math.max(1, d.width || 1));

    // Add nodes
    const nodes_g = svg.append('g')
      .selectAll('rect')
      .data(sankeyData.nodes)
      .join('rect')
      .attr('x', d => d.x0 || 0)
      .attr('y', d => d.y0 || 0)
      .attr('height', d => Math.max(1, (d.y1 || 0) - (d.y0 || 0)))
      .attr('width', d => Math.max(1, (d.x1 || 0) - (d.x0 || 0)))
      .attr('fill', (d, i) => {
        const nodeName = initialNodes[i];
        if (nodeName.startsWith('STAGE_')) return COLORS.STAGE;
        return COLORS[nodeName as keyof typeof COLORS] || '#94a3b8';
      })
      .attr('opacity', 0.8);

    // Add hover effects
    nodes_g.on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke', '#1e293b')
          .attr('stroke-width', 2);

        // Highlight connected links
        links_g
          .attr('stroke-opacity', l => 
            l.source === d || l.target === d ? 0.6 : 0.1
          )
          .attr('stroke-width', l =>
            l.source === d || l.target === d
              ? Math.max(2, l.width || 1)
              : Math.max(1, l.width || 1)
          );

        // Highlight connected nodes
        nodes_g.attr('opacity', n => {
          if (n === d) return 1;
          if (d.sourceLinks?.some(l => l.target === n)) return 1;
          if (d.targetLinks?.some(l => l.source === n)) return 1;
          return 0.3;
        });
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('stroke', 'none');

        links_g
          .attr('stroke-opacity', 0.3)
          .attr('stroke-width', d => Math.max(1, d.width || 1));

        nodes_g.attr('opacity', 0.8);
      });

    // Add node labels
    svg.append('g')
      .selectAll('text')
      .data(sankeyData.nodes)
      .join('text')
      .attr('x', d => (d.x0 || 0) < width / 2 ? (d.x1 || 0) + 6 : (d.x0 || 0) - 6)
      .attr('y', d => ((d.y1 || 0) + (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => (d.x0 || 0) < width / 2 ? 'start' : 'end')
      .text(d => `${d.name} (${d.value})`)
      .attr('font-size', '12px')
      .attr('font-weight', 500)
      .attr('fill', '#1e293b');

    // Add value labels on links
    svg.append('g')
      .selectAll('text')
      .data(sankeyData.links)
      .join('text')
      .attr('x', d => ((d.source.x1 || 0) + (d.target.x0 || 0)) / 2)
      .attr('y', d => ((d.y1 || 0) + (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text(d => d.value)
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .attr('pointer-events', 'none');

  }, [dimensions]);

  return (
    <div className="p-4" ref={containerRef}>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Application Flow</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="overflow-x-auto">
          <svg ref={svgRef} style={{ minWidth: '800px', width: '100%', height: '600px' }} />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Object.entries(COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center space-x-2 p-2 rounded-md bg-white shadow-sm">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
            <span className="text-sm text-gray-600 font-medium">
              {status === 'STAGE' ? 'Interview Stage' : status.toLowerCase().replace(/_/g, ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
