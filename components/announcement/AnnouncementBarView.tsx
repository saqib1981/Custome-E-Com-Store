import type { AnnouncementConfig } from '@/lib/announcement'

function AnnouncementSeparator() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="shrink-0 opacity-90"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M0 6c3 0 6-3 6-6 0 3 3 6 6 6-3 0-6 3-6 6 0-3-3-6-6-6Z"
      />
    </svg>
  )
}

function AnnouncementMessage({ message, gap }: { message: string; gap: string }) {
  return (
    <div
      className="flex shrink-0 items-center whitespace-nowrap text-xs font-medium uppercase tracking-wide sm:text-[13px]"
      style={{ gap }}
    >
      <span>{message}</span>
      <AnnouncementSeparator />
    </div>
  )
}

type AnnouncementBarViewProps = {
  config: AnnouncementConfig
  repeats?: number
}

/** Shared announcement marquee — used on storefront and admin preview. */
export default function AnnouncementBarView({ config, repeats = 8 }: AnnouncementBarViewProps) {
  const { enabled, message, speed, gap, backgroundColor, textColor, height } = config
  if (!enabled || !message.trim()) return null

  const barStyle = {
    backgroundColor,
    color: textColor,
    height,
    minHeight: height,
  }

  return (
    <div
      className="relative flex shrink-0 items-center overflow-hidden border-b border-black/10 dark:border-white/10"
      style={barStyle}
      aria-label="Announcement"
    >
      <p
        className="hidden w-full px-4 text-center text-xs font-medium uppercase tracking-wide motion-reduce:block sm:text-[13px]"
        style={{ color: textColor }}
      >
        {message}
      </p>
      <div
        className="flex h-full w-max items-center announcement-marquee motion-reduce:hidden"
        style={{ ['--announcement-speed' as string]: speed }}
      >
        <div className="flex h-full shrink-0 items-center px-4 sm:px-6" style={{ gap }}>
          {Array.from({ length: repeats }, (_, i) => (
            <AnnouncementMessage key={`a-${i}`} message={message} gap={gap} />
          ))}
        </div>
        <div
          className="flex h-full shrink-0 items-center px-4 sm:px-6 motion-reduce:hidden"
          style={{ gap }}
          aria-hidden
        >
          {Array.from({ length: repeats }, (_, i) => (
            <AnnouncementMessage key={`b-${i}`} message={message} gap={gap} />
          ))}
        </div>
      </div>
    </div>
  )
}
