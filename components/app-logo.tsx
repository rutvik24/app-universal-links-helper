import { Show } from "@/components/show";

type AppLogoProps = {
  className?: string;
  title?: string;
};

/** High-tech dual-ring link mark for App Links Helper with gradient accents. */
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
      <defs>
        <linearGradient id="logo-grad-android" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="logo-grad-ios" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Android Link Ring */}
      <rect
        x="3"
        y="10"
        width="18"
        height="12"
        rx="6"
        stroke="url(#logo-grad-android)"
        strokeWidth="3"
        filter="url(#logo-glow)"
      />
      {/* iOS Link Ring */}
      <rect
        x="15"
        y="14"
        width="18"
        height="12"
        rx="6"
        stroke="url(#logo-grad-ios)"
        strokeWidth="3"
        filter="url(#logo-glow)"
      />
      {/* Central Connector Node */}
      <circle cx="18" cy="18" r="2.5" fill="#38BDF8" />
    </svg>
  );
}
