"use client";

import { useState, useEffect, use } from "react";
import Navbar from "@/components/Navbar";
import FileUpload from "@/components/FileUpload";
import TierList from "@/components/TierList"; // Ensure this is imported
import { useApi } from "@/lib/api";
import { ArrowLeft, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function JobCommandCenter({ params }) {
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.id;
  
  const api = useApi();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. NEW: Reusable Refresh Function ---
  const refreshCandidates = async () => {
    try {
      const res = await api.get(`/jobs/${jobId}/candidates`);
      setCandidates(res.data);
    } catch (err) {
      console.error("Failed to refresh candidates", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch Job Details
        const jobRes = await api.get(`/jobs/${jobId}`);
        setJob(jobRes.data);
        
        // Fetch Candidates using our new function
        await refreshCandidates();
      } catch (err) {
        console.error("Failed to load command center", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (jobId) init();
  }, [jobId]);

  const handleNewCandidate = (candidate) => {
    // Add new upload to list immediately
    setCandidates([candidate, ...candidates]);
  };

  if (loading) return <div className="min-h-screen bg-cyber-black text-white flex items-center justify-center">Loading Mission Data...</div>;
  if (!job) return <div className="min-h-screen bg-cyber-black text-white flex items-center justify-center">Mission Not Found</div>;

  return (
    <div className="min-h-screen bg-cyber-black text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-neon-blue transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mission Control</span>
          </Link>

          <div className="flex justify-between items-end border-b border-white/10 pb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2">{job.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-neon-yellow" />
                  STATUS: {job.status.toUpperCase()}
                </span>
                <span className="flex items-center gap-2">
                   <Users className="w-4 h-4 text-neon-blue" />
                   CANDIDATES: {candidates.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Upload */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Ingest Data</h3>
              <FileUpload jobId={jobId} onUploadComplete={handleNewCandidate} />
            </div>

            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Mission Brief</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </div>

          {/* Right Column: Tier List */}
          <div className="lg:col-span-2">
             {/* --- 2. PASS THE REFRESH FUNCTION DOWN --- */}
             <TierList 
               candidates={candidates} 
               onRefresh={refreshCandidates} 
             />
          </div>

        </div>
      </main>
    </div>
  );
}