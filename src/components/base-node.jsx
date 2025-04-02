import { forwardRef } from "react";


export const BaseNode = forwardRef(({ className, selected, ...props }, ref) => (
  <div
    ref={ref}
    tabIndex={0}
    {...props} />
));

BaseNode.displayName = "BaseNode";
