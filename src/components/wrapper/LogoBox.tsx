import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { Link } from 'react-router-dom'

const ICON = 'solar:widget-line-duotone'
const ICON_COLOR = '#7e67fe'
const DARK_TEXT = '#21252e'
const LIGHT_TEXT = '#ffffff'
const MUTED = '#8486a7'

const LogoLgContent = ({ textColor }: { textColor: string }) => (
  <div style={{ width: 114, height: 28, display: 'flex', alignItems: 'center', gap: 6 }}>
    <IconifyIcon icon={ICON} style={{ color: ICON_COLOR, fontSize: 18, flexShrink: 0 }} />
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1 }}>
      <span style={{ fontFamily: 'Play, sans-serif', fontWeight: 700, fontSize: 11, color: textColor, whiteSpace: 'nowrap' }}>RVM Flow</span>
      <span style={{ fontFamily: 'Play, sans-serif', fontWeight: 400, fontSize: 6.5, color: MUTED, whiteSpace: 'nowrap' }}>Management System</span>
    </div>
  </div>
)

const LogoSmContent = () => (
  <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <IconifyIcon icon={ICON} style={{ color: ICON_COLOR, fontSize: 18 }} />
  </div>
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
