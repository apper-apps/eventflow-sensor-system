import React from "react";

const Loading = ({ className = "" }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shimmer" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
            <div className="h-4 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
          </div>
        </div>
        <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shimmer" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
                <div className="h-8 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* Event cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 shimmer" />
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="h-6 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
                <div className="h-5 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full shimmer" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
                  <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
                  <div className="h-4 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
                  <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
                </div>
              </div>
              
              <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
              
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
                <div className="w-4 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;