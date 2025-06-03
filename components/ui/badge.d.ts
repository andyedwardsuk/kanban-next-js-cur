import { VariantProps } from "class-variance-authority";
import * as React from "react";

declare const badgeVariants: (props?: {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
  className?: string;
}) => string;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

declare function Badge(props: BadgeProps): React.ReactElement;

export { Badge, badgeVariants };
