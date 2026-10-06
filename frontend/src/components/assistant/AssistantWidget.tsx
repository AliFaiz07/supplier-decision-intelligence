import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StructuredInvestigation } from '../../types';
import {
  SparklesIcon,
  ChatIcon,
  ShieldAlertIcon,
  FileTextIcon,
  SlidersIcon,
  ActivityIcon,
  SearchIcon,
  LayersIcon,
  CheckIcon
} from '../common/Icons';

export interface AssistantContext {
  supplier_id?: string;
  supplier_name?: string;
  material_id?: string;
  requirement?: any;
  recommended_option?: any;
}

interface AssistantWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  activeContext?: AssistantContext | null;
  initialQuery?: string;
  onNavigateTab?: (tab: string, subtab?: string, targetId?: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  suggested_actions?: string[];
  investigation?: StructuredInvestigation;
}

const SECTION_22_QUERIES = [
  'Show suppliers for M-001 with OTIF above 90%',
  'Which suppliers deteriorated this quarter?',
  'Which materials have high concentration?',
  'Which contracts expire within 60 days?',
  'Why did M-003 procurement cost increase?',
  'Which supplier has the best effective cost?',
  'Which decisions were later proven wrong?'
];

export const AssistantWidget: React.FC<AssistantWidgetProps> = ({
  isOpen,
  onClose,
  activeContext,
  initialQuery,
  onNavigateTab
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Procurement Decision Intelligence Assistant active.\nAsk any strategic sourcing question, run a structured anomaly investigation, or explore historical decision outcomes.',
      sources: ['SAP S/4HANA Master Data', '24-Mo Verified PO, GR & QM Telemetry']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [investigationMode, setInvestigationMode] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: queryText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const isInvestigation = investigationMode || queryText.toLowerCase().startsWith('why') || queryText.toLowerCase().includes('investigate');

    try {
      if (isInvestigation) {
        const invRes = await api.investigateIssue(queryText, activeContext || undefined);
        const assistantMsg: Message = {
          role: 'assistant',
          content: invRes.answer || 'Investigation complete.',
          sources: invRes.supporting_evidence?.citations || [],
          suggested_actions: invRes.suggested_actions || [],
          investigation: invRes
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const res = await api.askAssistant(queryText, activeContext || undefined);
        const assistantMsg: Message = {
          role: 'assistant',
          content: res.answer,
          sources: res.evidence_sources,
          suggested_actions: res.suggested_actions
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to process query: ${err.message}. Please verify the query format.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] bg-white border-l border-[#e2e8f0] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white text-[#0f172a] p-3.5 flex items-center justify-between border-b border-[#e2e8f0]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#eff6ff] text-[#0066cc] flex items-center justify-center border border-[#bfdbfe]">
            <SparklesIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-tight text-[#0f172a]">AI Decision & Investigation Assistant</h3>
            <p className="text-[10px] text-[#64748b] font-mono">Grounded in SAP S/4HANA Procurement Records</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setInvestigationMode(!investigationMode)}
            className={`text-[10px] px-2.5 py-1 rounded-lg font-medium border transition-colors ${
              investigationMode
                ? 'bg-[#0066cc] border-[#005bb5] text-white shadow-xs'
                : 'bg-white border-[#cbd5e1] text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]'
            }`}
          >
            {investigationMode ? 'Investigation: ON' : 'Standard Q&A'}
          </button>
          <button
            onClick={onClose}
            className="text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] text-xs px-2 py-1 rounded-lg transition-colors font-medium"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Active Context Banner */}
      {activeContext && (activeContext.material_id || activeContext.supplier_id) && (
        <div className="bg-[#edf5ff] border-b border-[#bfdbfe] px-4 py-2 flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-2 text-[#1d2d3e]">
            <span className="font-semibold text-[#0070f2] uppercase tracking-wider text-[10px]">Context:</span>
            {activeContext.material_id && (
              <span className="bg-white border border-[#bfdbfe] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#0854a0] rounded">
                {activeContext.material_id}
              </span>
            )}
            {activeContext.supplier_id && (
              <span className="bg-white border border-[#bfdbfe] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#0854a0] rounded">
                {activeContext.supplier_name || activeContext.supplier_id}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-[#556b82]">Live Context Bound</span>
        </div>
      )}

      {/* Benchmark Audit Queries Chips (Section 22) */}
      <div className="bg-[#f8fafc] border-b border-[#d9dcdf] p-3 max-h-36 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase text-[#556b82] mb-1.5 flex items-center space-x-1.5">
          <ActivityIcon className="w-3 h-3 text-[#0070f2]" />
          <span>Section 22 Analytical Benchmark Queries:</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SECTION_22_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[10px] bg-white hover:bg-[#edf5ff] hover:text-[#0070f2] hover:border-[#bfdbfe] text-[#1d2d3e] border border-[#d9dcdf] px-2 py-1 rounded text-left transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#f8fafc]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[95%] p-3.5 rounded-md leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#edf5ff] text-[#004085] border border-[#b8d7ff] font-medium shadow-sm'
                  : 'bg-white text-[#1d2d3e] border border-[#d9dcdf] font-normal shadow-card'
              }`}
            >
              {/* If Structured Investigation is present, render structured sections */}
              {m.investigation?.structured_findings ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-purple-700 font-mono">
                      Structured Procurement Investigation
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {m.investigation.investigation_id}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Finding:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {m.investigation.structured_findings.finding}
                    </p>
                  </div>

                  <div className="bg-white p-2.5 border border-slate-200 rounded-[2px] space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Root Cause Drivers:</span>
                    <p className="text-slate-700">
                      <strong>• Primary Driver: </strong>
                      {m.investigation.structured_findings.primary_driver}
                    </p>
                    <p className="text-slate-700">
                      <strong>• Secondary Driver: </strong>
                      {m.investigation.structured_findings.secondary_driver}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white p-2 border border-slate-200">
                      <span className="text-[9px] uppercase font-semibold text-slate-500">Operational Impact</span>
                      <p className="font-medium text-rose-700 mt-0.5">
                        {m.investigation.structured_findings.operational_impact}
                      </p>
                    </div>
                    <div className="bg-white p-2 border border-slate-200">
                      <span className="text-[9px] uppercase font-semibold text-slate-500">Risk Exposure</span>
                      <p className="font-medium text-slate-800 mt-0.5">
                        {m.investigation.structured_findings.risk_exposure}
                      </p>
                    </div>
                  </div>

                  <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-[2px]">
                    <span className="text-[9px] uppercase font-semibold text-[#0a6ed1] block">Suggested Next Analysis:</span>
                    <p className="text-slate-800 mt-0.5">
                      {m.investigation.structured_findings.suggested_next_analysis}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{m.content}</div>
              )}

              {m.sources && m.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                  <span>Data Citations: </span>
                  <span className="font-semibold text-slate-700">{m.sources.join(' | ')}</span>
                </div>
              )}

              {m.suggested_actions && m.suggested_actions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#edf0f3] flex flex-wrap gap-1">
                  {m.suggested_actions.map((act, actIdx) => (
                    <button
                      key={actIdx}
                      onClick={() => {
                        if (act.includes('Sourcing Workspace') && onNavigateTab) {
                          onNavigateTab('sourcing', undefined, activeContext?.material_id || 'MAT-001');
                        } else if (act.includes('Stress Test') && onNavigateTab) {
                          onNavigateTab('decisions', 'stresstest', activeContext?.material_id || 'MAT-001');
                        } else if (act.includes('Contract') && onNavigateTab) {
                          onNavigateTab('analytics', 'contracts');
                        }
                      }}
                      className="text-[10px] bg-[#edf5ff] hover:bg-[#dbeafe] text-[#0070f2] border border-[#bfdbfe] px-2 py-0.5 rounded transition-colors font-medium"
                    >
                      {act} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-[#556b82] italic bg-white p-2.5 rounded border border-[#d9dcdf]">
            <div className="w-3.5 h-3.5 border-2 border-[#d9dcdf] border-t-[#0070f2] rounded-full animate-spin"></div>
            <span>Grounding response in verified SAP procurement records...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 border-t border-[#d9dcdf] bg-white flex space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={investigationMode ? "Enter investigation query (e.g., Why did M-003 procurement cost increase?)..." : "Ask about suppliers, OTIF, prices, or contracts..."}
          className="sap-input flex-1"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="sap-btn sap-btn-primary disabled:opacity-50"
        >
          {investigationMode ? 'Investigate' : 'Send'}
        </button>
      </form>
    </div>
  );
};

