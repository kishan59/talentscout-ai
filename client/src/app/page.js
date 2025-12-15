import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  // 1. Check if user is already logged in
  const { userId } = await auth();
  
  // 2. If yes, instant redirect to Dashboard
  if (userId) {
    redirect('/dashboard');
  }

  // 3. If no, show the Landing Page
  // ... (imports and logic stay the same)

  // 3. If no, show the Landing Page
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cyber-black text-white relative overflow-hidden px-4 sm:px-6">
      
      {/* Background Grid Animation */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyber-black" />

      <div className="z-10 text-center space-y-6 md:space-y-8 max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1 rounded-full border border-neon-blue/30 bg-neon-blue/10 text-neon-blue text-xs md:text-sm mb-4 animate-pulse">
          SYSTEM ONLINE
        </div>
        
        {/* Responsive Text Sizes */}
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-r from-white via-gray-400 to-gray-600 bg-clip-text text-transparent leading-tight">
          TALENTSCOUT <br />
          <span className="text-neon-blue drop-shadow-[0_0_30px_rgba(0,243,255,0.5)]">AI</span>
        </h1>
        
        <p className="text-base sm:text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
          The Automated Applicant Tracking System. <br className="hidden sm:block"/>
          Screen 100 resumes in 10 seconds with Gemini model.
        </p>

        {/* Responsive Buttons (Stack on mobile, Row on desktop) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 w-full sm:w-auto px-6 sm:px-0">
          <Link href="/sign-in" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-neon-blue text-black font-bold rounded-lg hover:bg-cyan-400 transition-all shadow-neon-blue">
              INITIALIZE SYSTEM
            </button>
          </Link>
          
          <a 
            href="https://github.com/kishan59/talentscout-ai" 
            target="_blank" 
            className="w-full sm:w-auto px-8 py-4 border border-white/20 rounded-lg hover:bg-white/10 transition-all text-gray-300 flex justify-center"
          >
            VIEW SOURCE
          </a>
        </div>
      </div>
    </main>
  );
}