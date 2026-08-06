import { Show } from "@/components/show";

type AppLogoProps = {
  className?: string;
  title?: string;
};

/** Chain-link mark for App Links Helper. Color via `currentColor`. */
export function AppLogo({ className, title }: AppLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <Show condition={Boolean(title)}>
        <title>{title}</title>
      </Show>
      <rect
        x="2.75"
        y="10"
        width="14.5"
        height="10"
        rx="5"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect
        x="14.75"
        y="12"
        width="14.5"
        height="10"
        rx="5"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  );
}
