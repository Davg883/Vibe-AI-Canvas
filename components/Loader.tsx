
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0s' }}></div>
      <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      <span className="ml-2 text-white font-semibold">Weaving...</span>
    </div>
  );
};

export default Loader;
