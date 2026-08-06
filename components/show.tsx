import type { ReactNode } from "react";

type ShowProps = {
  condition: boolean;
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Conditional JSX renderer. Prefer this over inline `&&` or ternary in views.
 */
export function Show({ condition, children, fallback = null }: ShowProps) {
  return <>{condition ? children : fallback}</>;
}
