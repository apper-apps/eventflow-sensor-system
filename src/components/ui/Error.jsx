import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message, onRetry, className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-6">
        <ApperIcon name="AlertCircle" className="h-8 w-8 text-red-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {message || "We encountered an error while loading your data. Please try again."}
      </p>
      
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;