/** Original compass-inspired mark (not based on any existing brand). */
export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="MedCompass logo" className="shrink-0">
      <circle cx="16" cy="16" r="15" fill="#0f2a43" />
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="#5fd0c8" strokeWidth="1.4" />
      <path d="M16 6.2l3.3 7.4L16 16l-3.3-2.4z" fill="#5fd0c8" />
      <path d="M16 25.8l-3.3-7.4L16 16l3.3 2.4z" fill="#ffffff" opacity="0.85" />
      <circle cx="16" cy="16" r="1.5" fill="#0f2a43" />
    </svg>
  );
}
