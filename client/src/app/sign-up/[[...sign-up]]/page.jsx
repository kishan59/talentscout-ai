import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cyber-black relative overflow-hidden">
      
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-green/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/20 rounded-full blur-[100px]" />

      <div className="z-10 glass-panel p-8 rounded-2xl border border-white/10 shadow-neon-purple">
        <h1 className="text-2xl font-bold text-center mb-6 text-white tracking-wider">
          NEW <span className="text-neon-purple">OPERATOR</span>
        </h1>
        
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-neon-purple hover:bg-fuchsia-400 text-white font-bold',
              card: 'bg-transparent shadow-none',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'bg-white/10 border-white/10 text-white hover:bg-white/20',
              formFieldLabel: 'text-gray-400',
              formFieldInput: 'bg-black/50 border-white/10 text-white',
              footerActionLink: 'text-neon-purple hover:text-white'
            }
          }}
        />
      </div>
    </div>
  );
}