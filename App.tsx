import React from 'react';
import SovereignScribe from './components/SovereignScribe';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-full lg:max-w-[95vw]">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 pb-2">
            VibeAI Canvas
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            The instant idea-to-reality studio. See your vision come to life as you type.
          </p>
        </header>

        <SovereignScribe />

        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>Powered by Gemini & The VibeAI Philosophy</p>
          <p>prompttopage.co.uk | prompttoscript.co.uk</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
