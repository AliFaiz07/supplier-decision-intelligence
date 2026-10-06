import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ProcessingIndicator } from '../common/ProcessingIndicator';
import { PageHeader } from '../common/PageHeader';
import { DatabaseIcon, SearchIcon, LayersIcon } from '../common/Icons';
import { KnowledgeGraphView } from './KnowledgeGraphView';

export const DataExplorerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'datasets' | 'graph'>('datasets');
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('suppliers.json');
  const [recordsData, setRecordsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [inspectRecord, setInspectRecord] = useState<any>(null);

  useEffect(() => {
    loadDatasetsList();
  }, []);

  useEffect(() => {
    if (selectedDataset && activeTab === 'datasets') {
      loadRecords(selectedDataset, page, search);
    }
  }, [selectedDataset, page, activeTab]);

  const loadDatasetsList = async () => {
    try {
      const list = await api.getDatasetsList();
      setDatasets(list);
    } catch (err) {
      console.error('Failed to load datasets list:', err);
    }
  };

  const loadRecords = async (filename: string, pg: number, query?: string) => {
    try {
      setLoading(true);
      const res = await api.getDatasetRecords(filename, pg, 15, query);
      setRecordsData(res);
      setInspectRecord(null);
    } catch (err) {
      console.error('Failed to load dataset records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRecords(selectedDataset, 1, search);
  };

  const activeMeta = datasets.find((d) => d.filename === selectedDataset);
  const columns = recordsData?.data?.length > 0 ? Object.keys(recordsData.data[0]).slice(0, 7) : [];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title="Enterprise Data Explorer & Knowledge Graph"
        subtitle="Inspect underlying SAP-oriented synthetic datasets, referential integrity relationships, graph entity links, and data citations."
        breadcrumbs={[
          { label: 'Supplier Decision Intelligence' },
          { label: 'Data Explorer' },
          { label: activeTab === 'graph' ? 'Knowledge Graph' : selectedDataset }
        ]}
        badges={[
          { label: '22 Synthetic Datasets', variant: 'info' },
          { label: 'Seed 42 Deterministic', variant: 'neutral' }
        ]}
      />

      {/* View Switcher Bar */}
      <div className="bg-white border-b border-[#d9dcdf] px-4 flex items-center justify-between rounded-t-md">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('datasets')}
            className={`flex items-center space-x-2 py-3 px-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'datasets'
                ? 'border-[#0070f2] text-[#0070f2] font-semibold bg-[#edf5ff]/40'
                : 'border-transparent text-[#556b82] hover:text-[#1d2d3e] hover:border-[#d9dcdf]'
            }`}
          >
            <DatabaseIcon className={`w-3.5 h-3.5 ${activeTab === 'datasets' ? 'text-[#0070f2]' : 'text-[#556b82]'}`} />
            <span>22 Structured Mock Datasets</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center space-x-2 py-3 px-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'graph'
                ? 'border-[#0070f2] text-[#0070f2] font-semibold bg-[#edf5ff]/40'
                : 'border-transparent text-[#556b82] hover:text-[#1d2d3e] hover:border-[#d9dcdf]'
            }`}
          >
            <LayersIcon className={`w-3.5 h-3.5 ${activeTab === 'graph' ? 'text-[#0070f2]' : 'text-[#556b82]'}`} />
            <span>Procurement Knowledge Graph</span>
          </button>
        </div>

        <span className="text-[10px] font-mono text-[#8c9ba5] hidden sm:inline pr-2">
          {activeTab === 'datasets' ? 'Relational Schema Inspection' : 'Canonical Graph Traversal'}
        </span>
      </div>

      {activeTab === 'graph' ? (
        <KnowledgeGraphView />
      ) : (
        <>
          {/* Title & Dataset Selector */}
          <div className="sap-card p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-[#1d2d3e] tracking-tight">
                  Mock Data Explorer (22 Structured Datasets)
                </h2>
                <p className="text-xs text-[#556b82] mt-0.5">
                  Inspect underlying SAP-oriented synthetic datasets to verify referential consistency and audit evidence.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <select
                  value={selectedDataset}
                  onChange={(e) => {
                    setSelectedDataset(e.target.value);
                    setPage(1);
                    setSearch('');
                  }}
                  className="sap-select font-medium text-xs"
                >
                  {datasets.map((d) => (
                    <option key={d.filename} value={d.filename}>
                      {d.display_name} ({d.record_count} records)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeMeta && (
              <div className="mt-3 pt-3 border-t border-[#edf0f3] flex items-center justify-between text-xs text-[#556b82]">
                <p className="italic">{activeMeta.description}</p>
                <span className="font-mono text-[#1d2d3e] font-semibold">
                  {recordsData?.total_records ?? activeMeta.record_count} total records
                </span>
              </div>
            )}
          </div>

          {/* Search & Pagination Bar */}
          <div className="sap-card px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search in ${selectedDataset}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="sap-input pl-8 w-64 text-xs"
                />
                <SearchIcon className="w-3.5 h-3.5 text-[#8c9ba5] absolute left-2.5 top-2.5" />
              </div>
              <button
                type="submit"
                className="sap-btn sap-btn-primary text-xs h-8"
              >
                Filter
              </button>
            </form>

            <div className="flex items-center space-x-2 text-xs">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="sap-btn sap-btn-secondary text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-[#556b82] font-mono text-xs">
                Page {recordsData?.page || 1} of {recordsData?.total_pages || 1}
              </span>
              <button
                disabled={page >= (recordsData?.total_pages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="sap-btn sap-btn-secondary text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          {/* Main Table + Record Inspector */}
          {loading ? (
            <ProcessingIndicator operation="general" message={`Loading records from ${selectedDataset}...`} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className={`${inspectRecord ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white border border-[#d5dbe1] overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="sap-table">
                    <thead>
                      <tr>
                        {columns.map((col) => (
                          <th key={col}>{col.replace('_', ' ')}</th>
                        ))}
                        <th>Inspect</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recordsData?.data?.map((row: any, idx: number) => (
                        <tr
                          key={idx}
                          onClick={() => setInspectRecord(row)}
                          className="cursor-pointer hover:bg-slate-50"
                        >
                          {columns.map((col) => {
                            const val = row[col];
                            const display = typeof val === 'object' ? JSON.stringify(val) : String(val);
                            return (
                              <td key={col} className="font-mono text-xs truncate max-w-xs">
                                {display}
                              </td>
                            );
                          })}
                          <td>
                            <button
                              onClick={() => setInspectRecord(row)}
                              className="text-[10px] text-[#0a6ed1] hover:underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Record Inspector Drawer */}
              {inspectRecord && (
                <div className="lg:col-span-4 bg-white border border-[#d5dbe1] p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-800 uppercase">
                      Raw Record View
                    </span>
                    <button
                      onClick={() => setInspectRecord(null)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Close ✕
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono bg-slate-50 p-3 border border-slate-200 overflow-auto max-h-[500px] text-slate-800">
                    {JSON.stringify(inspectRecord, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
