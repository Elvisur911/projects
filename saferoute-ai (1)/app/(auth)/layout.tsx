export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070B14] cyber-bg flex items-center justify-center p-4">
      {/* Ambient glow blobs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
