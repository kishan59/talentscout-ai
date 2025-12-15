import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cyber-black relative overflow-hidden">
      
      {/* Background Decor: Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-blue/20 rounded-full blur-[100px]" />

      {/* The Glass Container */}
      <div className="z-10 glass-panel p-8 rounded-2xl border border-white/10 shadow-neon-blue">
        <h1 className="text-2xl font-bold text-center mb-6 text-white tracking-wider">
          ACCESS <span className="text-neon-blue">CONTROL</span>
        </h1>
        
        {/* The Clerk Component (Styled Dark via appearance prop) */}
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-neon-blue hover:bg-cyan-400 text-black font-bold',
              card: 'bg-transparent shadow-none',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'bg-white/10 border-white/10 text-white hover:bg-white/20',
              formFieldLabel: 'text-gray-400',
              formFieldInput: 'bg-black/50 border-white/10 text-white',
              footerActionLink: 'text-neon-blue hover:text-white'
            }
          }}
        />
      </div>
    </div>
  );
}