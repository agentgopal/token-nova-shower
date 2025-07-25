import { CryptoConfetti } from "@/components/CryptoConfetti";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <CryptoConfetti />
      <div className="text-center z-20 relative">
        <h1 className="text-6xl font-bold mb-6 text-white drop-shadow-2xl animate-fade-in">
          🚀 Crypto Token Shower 🚀
        </h1>
        <p className="text-2xl text-purple-200 mb-8 animate-fade-in">
          Watch the tokens rain down from crypto heaven!
        </p>
        <p className="text-lg text-purple-300 animate-fade-in">
          Click anywhere to launch more tokens! 💰
        </p>
      </div>
    </div>
  );
};

export default Index;
