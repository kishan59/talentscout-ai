import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Mail, 
  Star, 
  FileText, 
  Loader2, 
  CheckCircle, 
  Trash2 
} from "lucide-react";
import CandidateRadar from "./CandidateRadar";
import { useApi } from "@/lib/api";

export default function CandidateModal({ candidate, isOpen, onClose, onUpdate }) {
  const api = useApi();
  
  // State
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localStatus, setLocalStatus] = useState('New');
  const [showEmailView, setShowEmailView] = useState(false);

  // --- FIX: RESET STATE ON OPEN ---
  // Whenever the 'candidate' prop changes (or modal opens), we reset EVERYTHING.
  useEffect(() => {
    if (candidate) {
        // 1. Reset Action States (Fixes the "Spinning Button" bug)
        setIsDeleting(false);
        setLoadingEmail(false);

        // 2. Sync Data
        setLocalStatus(candidate.status);

        // 3. Reset View Mode (Fixes the "Wrong View" bug)
        // Only show email view if they are ALREADY invited. Otherwise, reset to Resume Summary.
        if (candidate.status === 'Invited') {
            setShowEmailView(true);
        } else {
            setShowEmailView(false);
        }
    }
  }, [candidate, isOpen]); // Run this whenever candidate changes or modal visibility toggles

  if (!candidate) return null;

  // --- DELETE CANDIDATE ---
  const handleDelete = async () => {
    if (!confirm("⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you sure you want to remove this candidate from the database? This cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/resumes/${candidate._id}`);
      onClose(); 
      if (onUpdate) onUpdate(); 
    } catch (err) {
      alert("Failed to delete candidate");
      setIsDeleting(false); // Only stop spinning on error
    }
  };

  // --- HANDLE INVITE ---
  const handleInvite = async () => {
    setLoadingEmail(true);
    try {
      const res = await api.post('/resumes/generate-email', {
        candidateId: candidate._id,
        jobId: candidate.jobId
      });
      
      const { subject, body } = res.data;

      const mailtoLink = `mailto:${candidate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;

      await api.patch('/resumes/status', {
        candidateId: candidate._id,
        status: 'Invited',
        emailBody: body
      });

      setLocalStatus('Invited');
      setShowEmailView(true); 
      if (onUpdate) onUpdate();

    } catch (err) {
      console.error(err);
      alert("Failed to generate draft.");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-cyber-gray/95 backdrop-blur-xl border border-white/10 shadow-neon-blue rounded-2xl pointer-events-auto flex flex-col md:flex-row relative">
              
              {/* --- LEFT SIDE (Stats & Radar) --- */}
              <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-white/10 bg-black/20">
                <div className="flex flex-col items-center text-center">
                  
                  {/* Score Badge */}
                  <div className={`
                    w-24 h-24 rounded-full flex items-center justify-center border-4 mb-4 shadow-lg
                    ${candidate.tier === 'S' ? 'border-neon-yellow shadow-neon-yellow text-neon-yellow' : 
                      candidate.tier === 'A' ? 'border-neon-green shadow-neon-green text-neon-green' : 
                      candidate.tier === 'B' ? 'border-neon-blue shadow-neon-blue text-neon-blue' : 
                      'border-neon-red shadow-neon-red text-neon-red'}
                  `}>
                    <span className="text-4xl font-bold font-mono">{candidate.aiScore}</span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-1">{candidate.name}</h2>
                  <p className="text-sm text-gray-400 mb-6">{candidate.email}</p>
                  
                  {/* Radar Chart */}
                  <div className="w-full">
                    <CandidateRadar skills={candidate.keySkills} />
                  </div>
                </div>
              </div>

              {/* --- RIGHT SIDE (Content & Actions) --- */}
              <div className="w-full md:w-2/3 p-6 flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">AI ANALYSIS</h3>
                    <div className="flex flex-wrap gap-2">
                       {localStatus === 'Invited' && (
                         <span className="px-2 py-1 bg-neon-green/10 border border-neon-green/50 rounded text-xs text-neon-green font-bold flex items-center gap-1">
                           <CheckCircle className="w-3 h-3" /> INVITED
                         </span>
                       )}
                       {candidate.badges.map((badge, i) => (
                         <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-cyan-200">
                           {badge}
                         </span>
                       ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      title="Delete Candidate"
                      className="p-2 hover:bg-neon-red/10 rounded-full transition-colors group"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-5 h-5 text-neon-red animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-gray-500 group-hover:text-neon-red transition-colors" />
                      )}
                    </button>

                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-neon-blue mb-3">
                      <Star className="w-4 h-4" /> EXECUTIVE SUMMARY
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {candidate.summary}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="flex items-center gap-2 text-sm font-bold text-gray-400">
                         {showEmailView ? <Mail className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                         {showEmailView ? "SENT EMAIL DRAFT" : "EXTRACTED TEXT SNIPPET"}
                       </h4>
                    </div>
                    
                    <div className={`p-4 rounded-lg border font-mono text-xs max-h-40 overflow-y-auto transition-all ${
                        showEmailView 
                        ? 'bg-neon-blue/5 border-neon-blue/30 text-gray-300' 
                        : 'bg-black/40 border-white/5 text-gray-500'
                    }`}>
                      {showEmailView 
                        ? (candidate.emailBody || "Email content not saved.") 
                        : (candidate.originalResumeText ? candidate.originalResumeText.substring(0, 500) + "..." : "No text available")
                      }
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 py-6 border-t border-white/10 flex gap-4">
                   <button 
                     onClick={localStatus === 'Invited' ? null : handleInvite}
                     disabled={loadingEmail || localStatus === 'Invited'}
                     className={`
                       flex-1 py-3 font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2
                       ${localStatus === 'Invited' 
                         ? 'bg-neon-green/20 text-neon-green border border-neon-green/50 cursor-default shadow-[0_0_15px_rgba(0,255,159,0.2)]' 
                         : 'bg-neon-blue text-black hover:bg-cyan-400 shadow-neon-blue'
                       }
                     `}
                   >
                     {loadingEmail ? (
                       <>
                         <Loader2 className="w-4 h-4 animate-spin" />
                         WRITING DRAFT...
                       </>
                     ) : localStatus === 'Invited' ? (
                       <>
                         <CheckCircle className="w-4 h-4" />
                         INVITE SENT
                       </>
                     ) : (
                       <>
                         <Mail className="w-4 h-4" />
                         INVITE TO INTERVIEW
                       </>
                     )}
                   </button>

                   <button 
                     onClick={() => setShowEmailView(!showEmailView)}
                     title={showEmailView ? "View Resume Text" : "View Email Draft"}
                     className={`
                       px-4 py-3 border rounded-lg transition-colors flex items-center justify-center
                       ${showEmailView 
                         ? 'bg-neon-blue/20 border-neon-blue text-neon-blue' 
                         : 'border-white/20 hover:bg-white/5 text-white'
                       }
                     `}
                   >
                     {showEmailView ? <FileText className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                   </button>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}