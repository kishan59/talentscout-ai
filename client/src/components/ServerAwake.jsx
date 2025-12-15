"use client";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { Loader2, Server } from "lucide-react";

export default function ServerAwake() {
  const api = useApi();
  const [status, setStatus] = useState("checking"); // checking | sleeping | awake
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      // If it takes more than 1 second, assume it's sleeping and show banner
      const timer = setTimeout(() => {
        if (status === 'checking') {
            setStatus('sleeping');
            setShowBanner(true);
        }
      }, 1500);

      try {
        await api.get("/"); // Ping the root or a health route
        setStatus("awake");
        
        // Hide banner after a brief "Success" moment
        setTimeout(() => setShowBanner(false), 2000);
      } catch (err) {
        console.error("Server ping failed", err);
      } finally {
        clearTimeout(timer);
      }
    };

    checkHealth();
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl transition-all
        ${status === 'awake' 
          ? 'bg-neon-green/10 border-neon-green text-neon-green' 
          : 'bg-cyber-gray border-neon-blue text-neon-blue'
        }
      `}>
        {status === 'awake' ? (
          <>
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="font-bold text-xs tracking-wider">SYSTEM ONLINE</span>
          </>
        ) : (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <div className="flex flex-col">
              <span className="font-bold text-xs tracking-wider">INITIALIZING SERVER...</span>
              <span className="text-[10px] opacity-70">This may take up to 60s (Free Tier)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}