import SectionDivider from '@/components/SectionDivider'

type HomeDividerProps = {
  children?: React.ReactNode
  contentClassName?: string
}

/** Homepage divider below hero — loads saved settings from admin API. */
export default function HomeDivider({ children, contentClassName }: HomeDividerProps) {
  return (
    <SectionDivider apiPath="/api/admin/home-divider" contentClassName={contentClassName}>
      {children}
    </SectionDivider>
  )
}
