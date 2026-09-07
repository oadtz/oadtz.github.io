export type IconName =
  | "external"
  | "down"
  | "camera"
  | "gamepad"
  | "code"
  | "plus"
  | "pause"
  | "play"
  | "menu"
  | "close";
const paths: Record<IconName, string> = {
  external:
    "M14 4h6v6M20 4 10 14M10 5H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-5",
  down: "M12 4v15M6 13l6 6 6-6",
  camera:
    "M3 7h4l2-3h6l2 3h4v13H3ZM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0M18 10h.01",
  gamepad:
    "M7 7h10c2 0 3 2 3.5 4l1 6c.4 3-2 4-4 1l-2-2h-7l-2 2c-2 3-4.4 2-4-1l1-6C4 9 5 7 7 7ZM6 11v4M4 13h4M16 11h.01M19 14h.01",
  code: "m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18",
  plus: "M12 5v14M5 12h14",
  pause: "M8 5v14M16 5v14",
  play: "m8 4 12 8-12 8Z",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "m6 6 12 12M6 18 18 6",
};
export default function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={`icon ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
