import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  className, 
  children, 
  hover = true,
  gradient = false,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-sm",
        hover && "card-hover cursor-pointer",
        gradient && "bg-gradient-to-br from-white to-gray-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;