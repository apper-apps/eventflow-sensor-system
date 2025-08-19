import React from "react";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            🚀
          </h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Nouvelle Application
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Prêt à construire quelque chose d'incroyable ? 
            Votre nouvelle application React commence ici.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Configuration
          </h3>
          <div className="space-y-2 text-left">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">React 18.2.0</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Vite 6.3.5</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-700">Tailwind CSS 3.3.3</span>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Modifiez <code className="bg-gray-200 px-2 py-1 rounded text-xs">src/App.jsx</code> pour commencer
        </div>
      </div>
    </div>
  )
}

export default App
