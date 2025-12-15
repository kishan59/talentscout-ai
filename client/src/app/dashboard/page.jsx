"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CreateJobModal from "@/components/CreateJobModal"; 
import { useApi } from "@/lib/api";
// Added: MoreVertical, Archive, RotateCcw, Trash2 for the menu
import { Plus, Briefcase, ChevronRight, Loader2, MoreVertical, Archive, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const api = useApi();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- NEW STATE FOR ARCHIVE FEATURE ---
  const [filter, setFilter] = useState("Active"); // Default to your DB's default: 'Active'
  const [openMenuId, setOpenMenuId] = useState(null); // Track which dropdown is open

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs");
        setJobs(res.data);
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(() => fetchJobs(), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleJobCreated = (newJob) => {
    setJobs([newJob, ...jobs]);
  };

  // --- NEW FUNCTION: Handle Status Update ---
  const handleStatusUpdate = async (e, jobId, newStatus) => {
    e.preventDefault(); // Stop Link navigation
    e.stopPropagation();
    
    try {
      // 1. Optimistic Update
      setJobs(jobs.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
      setOpenMenuId(null); 

      // 2. API Call
      await api.patch(`/jobs/${jobId}/status`, { status: newStatus });
    } catch (err) {
      console.error(err);
      // Optional: Revert on error here
    }
  };

  // --- SAFE FILTER LOGIC ---
  // Matches 'Active' (your DB default) or 'archived' (new status) case-insensitively
  const filteredJobs = jobs.filter(job => {
    const currentStatus = (job.status || 'Active').toLowerCase();
    return currentStatus === filter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-cyber-black text-white selection:bg-neon-blue/30">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
            <p className="text-gray-400 mt-1">Manage your active recruitment campaigns</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-neon-blue text-black font-bold rounded-lg hover:bg-cyan-400 transition-all shadow-neon-blue hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>NEW JOB</span>
          </button>
        </div>

        {/* --- NEW: TABS (Active vs Archived) --- */}
        <div className="flex gap-4 border-b border-white/10">
          <button 
            onClick={() => setFilter('Active')}
            className={`pb-3 text-sm font-bold tracking-wide transition-colors relative ${filter === 'Active' ? 'text-neon-blue' : 'text-gray-500 hover:text-white'}`}
          >
            ACTIVE MISSIONS
            {filter === 'Active' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-blue" />}
          </button>
          <button 
            onClick={() => setFilter('archived')}
            className={`pb-3 text-sm font-bold tracking-wide transition-colors relative ${filter === 'archived' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
          >
            ARCHIVED
            {filter === 'archived' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-neon-blue animate-spin" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white">No {filter === 'Active' ? 'Active' : 'Archived'} Jobs</h3>
            {filter === 'Active' && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 px-6 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Initialize First Mission
                </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
            {filteredJobs.map((job) => (
              <div key={job._id} className="relative group"> 
              {/* Wrapped in div to handle positioning of menu outside Link if needed, though putting menu inside works with stopPropagation */}
                
                <Link href={`/jobs/${job._id}`} className="block h-full">
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ y: -5 }}
                    className={`
                      relative h-full p-6 glass-card rounded-xl flex flex-col justify-between cursor-pointer border
                      ${job.status === 'archived' ? 'bg-black/40 border-white/5 grayscale opacity-75' : 'border-transparent hover:border-neon-blue/30'}
                    `}
                  >
                    <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />

                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg border ${job.status === 'archived' ? 'bg-white/5 border-white/5' : 'bg-white/5 border-white/10'}`}>
                          <Briefcase className={`w-6 h-6 ${job.status === 'archived' ? 'text-gray-500' : 'text-neon-blue'}`} />
                        </div>
                        
                        {/* --- NEW: MENU BUTTON (Replaces simple badge) --- */}
                        <div className="relative z-20">
                             <button 
                                onClick={(e) => {
                                    e.preventDefault(); // Don't click the card
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === job._id ? null : job._id);
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                             >
                                <MoreVertical className="w-5 h-5" />
                             </button>

                             {/* DROPDOWN */}
                             <AnimatePresence>
                                {openMenuId === job._id && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-full mt-2 w-32 bg-cyber-gray border border-white/10 rounded-lg shadow-xl overflow-hidden z-30"
                                  >
                                    {job.status === 'Active' || job.status === 'active' ? (
                                      <button 
                                        onClick={(e) => handleStatusUpdate(e, job._id, 'archived')}
                                        className="w-full px-4 py-2 text-left text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                                      >
                                        <Archive className="w-3 h-3" /> Archive
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={(e) => handleStatusUpdate(e, job._id, 'Active')}
                                        className="w-full px-4 py-2 text-left text-xs font-bold text-neon-blue hover:bg-neon-blue/10 flex items-center gap-2"
                                      >
                                        <RotateCcw className="w-3 h-3" /> Reactivate
                                      </button>
                                    )}
                                  </motion.div>
                                )}
                             </AnimatePresence>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-2 group-hover:text-neon-blue transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-white/5">
                      <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                      
                      {/* Status Badge (Moved to bottom or keep next to date) */}
                      <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${
                        job.status === 'Active' 
                          ? 'bg-neon-green/10 text-neon-green border-neon-green/20' 
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}>
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <CreateJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onJobCreated={handleJobCreated} 
      />
    </div>
  );
}