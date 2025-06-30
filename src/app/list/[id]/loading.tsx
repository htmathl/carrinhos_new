"use client"

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Stats simples */}
      <div className="p-4 border-b border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div 
                className="h-6 bg-gray-800 rounded animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
              <div 
                className="h-3 bg-gray-700 rounded animate-pulse"
                style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading principal centrado */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6">
          {/* Spinner animado */}
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-800 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <div className="w-8 h-8 border-4 border-transparent border-t-purple-400 rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          
          {/* Texto animado */}
          <div className="space-y-2">
            <p className="text-gray-400 text-sm animate-pulse">Carregando lista...</p>
            <div className="flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
