import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { Link } from 'react-router-dom'

const ICON = 'solar:widget-line-duotone'
const ICON_COLOR = '#7e67fe'
const DARK_TEXT = '#21252e'
const LIGHT_TEXT = '#ffffff'
const MUTED = '#8486a7'

const LogoLgContent = ({ textColor }: { textColor: string }) => (
  <span className="logo-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 26 }}>
    <IconifyIcon icon={ICON} style={{ color: ICON_COLOR, fontSize: 24, flexShrink: 0 }} />
    <span style={{ display: 'inline-flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1 }}>
      <span style={{ fontFamily: 'Play, sans-serif', fontWeight: 700, fontSize: 16, color: textColor, whiteSpace: 'nowrap' }}>RVM Flow</span>
      <span style={{ fontFamily: 'Play, sans-serif', fontWeight: 400, fontSize: 9, color: MUTED, whiteSpace: 'nowrap' }}>Management System</span>
    </span>
  </span>
)

const LogoSmContent = () => (
  <span className="logo-sm" style={{ display: 'none', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
    <IconifyIcon icon={ICON} style={{ color: ICON_COLOR, fontSize: 22 }} />
  </span>
)

const LogoBox = () => {
  return (
    <div className="logo-box">
      <Link to="/dashboards" className="logo-dark">
        <LogoSmContent />
        <LogoLgContent textColor={DARK_TEXT} />
      </Link>
      <Link to="/dashboards" className="logo-light">
        <LogoSmContent />
        <LogoLgContent textColor={LIGHT_TEXT} />
      </Link>
    </div>
  )
}

export default LogoBox
