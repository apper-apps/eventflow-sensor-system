import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ title, value, icon, trend, trendValue, gradient = "purple-pink" }) => {
  const gradients = {
    "purple-pink": "from-primary-500 to-secondary-500",
    "accent": "from-accent-500 to-accent-600",
    "success": "from-green-500 to-emerald-500",
    "info": "from-blue-500 to-indigo-500"
  };

  return (
    <Card gradient className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && trendValue && (
              <div className={`flex items-center text-sm font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                <ApperIcon 
                  name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                  className="h-4 w-4 mr-1" 
                />
                {trendValue}
              </div>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[gradient]} shadow-lg`}>
          <ApperIcon name={icon} className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;