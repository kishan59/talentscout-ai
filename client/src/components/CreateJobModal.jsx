import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useApi } from "@/lib/api";

export default function CreateJobModal({ isOpen, onClose, onJobCreated }) {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Send data to Backend
      const res = await api.post("/jobs", formData);
      
      // 2. Notify parent to refresh list
      onJobCreated(res.data);
      
      // 3. Reset & Close
      setFormData({ title: "", description: "" });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create mission. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* 2. The Modal Card */}
          {/* 2. The Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4 overflow-y-auto"
          >
            <div className="w-full max-w-lg p-6 glass-panel rounded-2xl pointer-events-auto border border-white/10 shadow-neon-blue my-auto">
              
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-wide">
                  INITIALIZE <span className="text-neon-blue">NEW MISSION</span>
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Job Title */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">
                    Role Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="w-full bg-cyber-dark border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                  />
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1 uppercase tracking-wider">
                    Mission Briefing (Job Description)
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Paste the full job description here. The AI will use this to grade candidates..."
                    className="w-full bg-cyber-dark border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-mono"
                  >
                    ABORT
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-neon-blue text-black font-bold rounded-lg hover:bg-cyan-400 transition-all shadow-neon-blue disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "INITIALIZING..." : "LAUNCH MISSION"}
                  </button>
                </div>

              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}