import { UserButton } from "@clerk/nextjs";
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="w-full h-16 border-b border-white/10 bg-cyber-black/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      
      {/* Logo Area */}
      <Link href="/dashboard" className="flex items-center gap-2 group">
        <div className="p-2 bg-neon-blue/10 rounded-lg group-hover:bg-neon-blue/20 transition-colors">
          <LayoutDashboard className="w-5 h-5 text-neon-blue" />
        </div>
        <span className="font-bold tracking-wider text-lg">
          TALENT<span className="text-neon-blue">SCOUT</span>
        </span>
      </Link>

      {/* User Area */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-[1px] bg-white/10" /> {/* Divider */}
        
        {/* Clerk User Button with Custom Theme */}
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-9 h-9 border border-neon-blue/30 hover:border-neon-blue transition-colors",
              userButtonPopoverCard: "bg-cyber-gray border border-white/10 shadow-xl",
              userButtonPopoverActionButton: "hover:bg-white/5",
              userButtonPopoverActionButtonText: "text-white",
              userButtonPopoverFooter: "hidden"
            }
          }}
        />
      </div>
    </nav>
  );
}