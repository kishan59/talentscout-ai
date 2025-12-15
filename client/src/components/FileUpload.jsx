"use client";

import { useCallback, useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '@/lib/api';

export default function FileUpload({ jobId, onUploadComplete }) {
  const api = useApi();
  const [filesQueue, setFilesQueue] = useState([]);
  
  // Lock to prevent double-processing
  const processingRef = useRef(false);

  useEffect(() => {
    // 1. Check if we are already busy
    if (processingRef.current) return;

    // 2. Find the next file that needs processing
    const nextFile = filesQueue.find(f => f.status === 'pending');
    
    // If no pending files, we are done. Stop.
    if (!nextFile) return;

    // 3. Start Processing
    const process = async () => {
      processingRef.current = true; // LOCK

      // A. Mark as Uploading immediately
      setFilesQueue(currentQueue => 
        currentQueue.map(f => f.id === nextFile.id ? { ...f, status: 'uploading' } : f)
      );

      try {
        const formData = new FormData();
        formData.append('resume', nextFile.file);
        formData.append('jobId', jobId);

        // B. Send to Backend
        const res = await api.post('/resumes/analyze', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // C. Notify Parent (Add to Tier List)
        if (onUploadComplete) onUploadComplete(res.data.candidate);

        // D. RATE LIMIT PAUSE (4 Seconds)
        // We wait HERE, while the status is still 'uploading'.
        await new Promise(resolve => setTimeout(resolve, 4000));

        // E. Mark as Success (This triggers the re-render for the NEXT loop)
        setFilesQueue(currentQueue => 
          currentQueue.map(f => f.id === nextFile.id ? { ...f, status: 'success' } : f)
        );

      } catch (error) {
        console.error(error);
        
        // Even on error, wait 4s to be safe
        await new Promise(resolve => setTimeout(resolve, 4000));

        setFilesQueue(currentQueue => 
          currentQueue.map(f => f.id === nextFile.id ? { ...f, status: 'error' } : f)
        );
      } finally {
        processingRef.current = false; // UNLOCK
      }
    };

    process();

  }, [filesQueue, jobId, api, onUploadComplete]); 

  const onDrop = useCallback((acceptedFiles) => {
    // Assign a unique ID to each file so we never mix them up
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9), // Simple unique ID
      name: file.name,
      status: 'pending', 
      file: file
    }));

    setFilesQueue(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true 
  });

  return (
    <div className="w-full space-y-4">
      
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer overflow-hidden group
          ${isDragActive ? 'border-neon-blue bg-neon-blue/10 scale-[1.02]' : 'border-white/20 hover:border-neon-blue/50 hover:bg-white/5'}
        `}
      >
        <input {...getInputProps()} />

        {isDragActive && (
          <div className="absolute inset-0 bg-neon-blue/20 animate-pulse z-0" />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-white/5 group-hover:bg-neon-blue/20 transition-colors">
            <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-neon-blue" />
          </div>
          <div>
            <p className="text-lg font-bold text-white group-hover:text-neon-blue transition-colors">
              {isDragActive ? "DROP FILES HERE" : "Bulk Upload Resumes"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
               AI Queue Active: Auto-throttled for Free Tier
            </p>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {filesQueue.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={`
                flex items-center justify-between p-3 rounded-lg border text-sm transition-colors
                ${file.status === 'pending' ? 'bg-white/5 border-white/5 opacity-50' : ''}
                ${file.status === 'uploading' ? 'bg-neon-blue/5 border-neon-blue/30' : ''}
                ${file.status === 'success' ? 'bg-neon-green/5 border-neon-green/30' : ''}
                ${file.status === 'error' ? 'bg-neon-red/5 border-neon-red/30' : ''}
              `}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {file.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-600" />}
                {file.status === 'uploading' && <Loader2 className="w-4 h-4 text-neon-blue animate-spin shrink-0" />}
                {file.status === 'success' && <CheckCircle className="w-4 h-4 text-neon-green shrink-0" />}
                {file.status === 'error' && <AlertCircle className="w-4 h-4 text-neon-red shrink-0" />}
                
                <span className={`truncate font-mono ${
                  file.status === 'success' ? 'text-gray-300' : 'text-white'
                }`}>
                  {file.name}
                </span>
              </div>

              <div className="text-xs font-bold tracking-wider">
                {file.status === 'pending' && <span className="text-gray-500">QUEUED</span>}
                {file.status === 'uploading' && <span className="text-neon-blue animate-pulse">ANALYZING...</span>}
                {file.status === 'success' && <span className="text-neon-green">COMPLETE</span>}
                {file.status === 'error' && <span className="text-neon-red">FAILED</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}