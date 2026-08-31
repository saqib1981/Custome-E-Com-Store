type RightMenuIconProps = {
  className?: string
}

/** Tools menu icon — uses `public/icons/right-menu.svg`. */
export default function RightMenuIcon({ className = 'h-6 w-6' }: RightMenuIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/right-menu.svg"
      alt=""
      className={`inline-block shrink-0 object-contain ${className}`}
      aria-hidden
    />
  )
}
