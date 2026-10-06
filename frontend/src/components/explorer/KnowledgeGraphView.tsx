import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { KnowledgeGraphData, KnowledgeGraphNode, KnowledgeGraphEdge } from '../../types';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import {
  DatabaseIcon,
  SearchIcon,
  LayersIcon,
  RefreshIcon,
  ChevronRightIcon
} from '../common/Icons';

export const KnowledgeGraphView: React.FC = () => {
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      setLoading(true);
      const res = await api.getKnowledgeGraph();
      setGraphData(res);
      if (res.nodes && res.nodes.length > 0) {
        setSelectedNode(res.nodes[0]);
      }
    } catch (err) {
      console.error('Failed to load Knowledge Graph:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !graphData) {
    return <ProcessingIndicator operation="general" message="Loading Enterprise Procurement Knowledge Graph..." />;
  }

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  const filteredNodes = nodes.filter(n => {
    const matchesType = selectedType === 'ALL' || n.type === selectedType;
    const matchesSearch = !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const connectedEdges = selectedNode
    ? edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#d5dbe1] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase bg-[#0a6ed1] text-white px-2 py-0.5 rounded-[2px] font-semibold">
                Enterprise Ontology
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Canonical Relational Entity Graph
              </span>
            </div>
            <h2 className="text-base font-semibold text-slate-900 mt-1">
              Procurement Knowledge Graph Explorer
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Traverses relational dependencies connecting Suppliers, Materials, Plants, Purchase Orders, Goods Receipts, Outline Contracts, QM Inspection Lots, Decisions, and Actual Outcomes.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadGraph}
              className="flex items-center space-x-1.5 border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-[2px] font-medium transition-colors"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              <span>Refresh Graph</span>
            </button>
          </div>
        </div>

        {/* Graph Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 text-xs">
          <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px]">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Total Nodes</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{graphData?.node_count || 0}</p>
            <p className="text-[10px] text-slate-400">Canonical entities</p>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px]">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Directed Edges</span>
            <p className="text-xl font-bold font-mono text-[#0a6ed1] mt-0.5">{graphData?.edge_count || 0}</p>
            <p className="text-[10px] text-slate-400">Relational semantic links</p>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px]">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Entity Types</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{graphData?.entity_types?.length || 0}</p>
            <p className="text-[10px] text-slate-400">Classes represented</p>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200 p-3 rounded-[2px]">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Target Integration</span>
            <p className="text-xs font-semibold text-slate-800 mt-1">SAP Graph / Neo4j</p>
            <p className="text-[9px] text-slate-400 font-mono">Provider-independent schema</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#d5dbe1] px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <label className="text-slate-600 font-medium">Filter by Entity Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-slate-300 rounded-[2px] px-2.5 py-1 text-xs bg-white text-slate-900"
          >
            <option value="ALL">All Entity Types ({nodes.length})</option>
            {graphData?.entity_types?.map(t => (
              <option key={t} value={t}>
                {t} ({nodes.filter(n => n.type === t).length})
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search entity node or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 border border-slate-300 rounded-[2px] text-xs w-64 bg-white focus:outline-none focus:border-[#0a6ed1]"
          />
          <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Main Split: Node Entity List (5 cols) + Node Graph Inspector & Relations (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Node Entity List */}
        <div className="lg:col-span-5 bg-white border border-[#d5dbe1] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Entity Nodes ({filteredNodes.length})
            </span>
            <span className="text-[10px] font-mono text-slate-400">Click to focus</span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredNodes.map(node => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-2.5 border rounded-[2px] cursor-pointer text-xs transition-all ${
                  selectedNode?.id === node.id
                    ? 'border-[#0a6ed1] bg-blue-50/70 shadow-sm font-medium'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 truncate max-w-[240px]">
                    {node.label}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {node.type}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  ID: {node.id}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Node Inspector & Connecting Relationships */}
        <div className="lg:col-span-7 bg-white border border-[#d5dbe1] p-5 space-y-4">
          <div className="flex items-start justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-mono uppercase bg-blue-100 text-[#0a6ed1] px-2 py-0.5 rounded-[2px] font-semibold">
                Focused Entity Node
              </span>
              <h3 className="text-base font-semibold text-slate-900 mt-1">
                {selectedNode?.label || 'Select a Node'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Type: {selectedNode?.type} | Canonical Key: {selectedNode?.id}
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
              {connectedEdges.length} Connected Edges
            </span>
          </div>

          {/* Node Properties */}
          {selectedNode && (
            <div>
              <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider block mb-2">
                Entity Attributes
              </span>
              <pre className="text-[11px] font-mono bg-slate-50 p-3 border border-slate-200 overflow-auto max-h-48 text-slate-800">
                {JSON.stringify(selectedNode.properties, null, 2)}
              </pre>
            </div>
          )}

          {/* Connected Edges List */}
          <div>
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider block mb-2">
              Connected Semantic Relationships ({connectedEdges.length})
            </span>

            {connectedEdges.length > 0 ? (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {connectedEdges.map((edge, idx) => {
                  const isOutgoing = edge.source === selectedNode?.id;
                  const otherNodeId = isOutgoing ? edge.target : edge.source;
                  const otherNode = nodes.find(n => n.id === otherNodeId);

                  return (
                    <div
                      key={idx}
                      onClick={() => otherNode && setSelectedNode(otherNode)}
                      className="p-2.5 border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer rounded-[2px] text-xs flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isOutgoing ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-[#0a6ed1]'
                        }`}>
                          {isOutgoing ? 'OUTGOING →' : '← INCOMING'}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {edge.label}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          ({edge.relationship})
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[#0a6ed1] font-mono text-[11px] hover:underline">
                          {otherNode?.label || otherNodeId}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-mono p-4 border border-slate-200 bg-slate-50 text-center">
                No directed edges connected to this entity node in the current depth radius.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
