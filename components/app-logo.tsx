import { Show } from "@/components/show";

type AppLogoProps = {
  className?: string;
  title?: string;
};

/** Dynamic monochrome link mark for App Links Helper using `currentColor`. */
export function AppLogo({ className = "size-7", title }: AppLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <Show condition={Boolean(title)}>
        <title>{title}</title>
      </Show>
      {/* Primary Link Ring */}
      <rect
        x="3"
        y="10"
        width="18"
        height="12"
        rx="6"
        stroke="currentColor"
        strokeWidth="3"
      />
      {/* Secondary Link Ring */}
      <rect
        x="15"
        y="14"
        width="18"
        height="12"
        rx="6"
        stroke="currentColor"
        strokeWidth="3"
      />
      {/* Central Connector Node */}
      <circle cx="18" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}
