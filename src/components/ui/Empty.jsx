import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  icon = "Calendar", 
  title = "No events found", 
  description = "Get started by creating your first event", 
  action,
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
        <ApperIcon name={icon} className="h-8 w-8 text-gray-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {description}
      </p>
      
      {action}
    </div>
  );
};

export default Empty;