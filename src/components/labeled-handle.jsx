import React, { forwardRef } from "react";

import { BaseHandle } from "@/components/base-handle";

export const LabeledHandle = forwardRef((
  { className, labelClassName, handleClassName, title, position, ...props },
  ref,
) => (
  <div
    ref={ref}
    title={title}
  >
    <BaseHandle position={position} className={handleClassName} {...props} />
    <label >
      {title}
    </label>
  </div>
));

LabeledHandle.displayName = "LabeledHandle";
