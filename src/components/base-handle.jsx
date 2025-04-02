import { forwardRef } from "react";
import { Handle } from "@xyflow/react";


export const BaseHandle = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <Handle
      ref={ref}
      {...props}>
      {children}
    </Handle>
  );
});

BaseHandle.displayName = "BaseHandle";
