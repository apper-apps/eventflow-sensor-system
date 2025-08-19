import React, { useState } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search events...", 
  className,
  value: controlledValue,
  onChange: controlledOnChange
}) => {
  const [internalValue, setInternalValue] = useState("");
  
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    if (isControlled) {
      controlledOnChange?.(e);
    } else {
      setInternalValue(newValue);
    }
    
    onSearch?.(newValue);
  };

  const handleClear = () => {
    const newValue = "";
    
    if (isControlled) {
      controlledOnChange?.({ target: { value: newValue } });
    } else {
      setInternalValue(newValue);
    }
    
    onSearch?.(newValue);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <ApperIcon name="Search" className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="pl-10 pr-10"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ApperIcon name="X" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;