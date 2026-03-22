import IconifyIcon from '@/components/wrapper/IconifyIcon'

const ICONS = [
  { name: 'Variation A — Flow Node', icon: 'mingcute:flow-line' },
  { name: 'Variation B — Shield Governance', icon: 'bx:shield-quarter' },
  { name: 'Variation C — Grid System', icon: 'solar:widget-line-duotone' },
]

const LogoLg = ({ icon, bg, textColor, mutedColor }: { icon: string; bg: string; textColor: string; mutedColor: string }) => (
  <div style={{
    width: 114, height: 28, display: 'flex', alignItems: 'center', gap: 6,
    background: bg, borderRadius: 4, padding: '0 4px', boxSizing: 'border-box',
  }}>
    <IconifyIcon icon={icon} style={{ color: '#7e67fe', fontSize: 18, flexShrink: 0 }} />
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1 }}>
      <span style={{ fontFamily: 'Play, sans-serif', fontWeight: 700, fontSize: 11, color: textColor, whiteSpace: 'nowrap' }}>RVM Flow</span>
      <span style={{ fontFamily: 'Play, sans-serif', fontWeight: 400, fontSize: 6.5, color: mutedColor, whiteSpace: 'nowrap' }}>Management System</span>
    </div>
  </div>
)

const LogoSm = ({ icon, bg }: { icon: string; bg: string }) => (
  <div style={{
    width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: bg, borderRadius: 4,
  }}>
    <IconifyIcon icon={icon} style={{ color: '#7e67fe', fontSize: 18 }} />
  </div>
)

const LogoPreviewPage = () => {
  return (
    <div className="p-4">
      <h4 className="mb-1" style={{ fontFamily: 'Play, sans-serif' }}>RVM Flow — Logo Variations Preview</h4>
      <p className="text-muted mb-4">3 variations × 2 sizes × 2 modes = 12 renders. No production files modified.</p>

      <div className="row g-4">
        {ICONS.map(({ name, icon }) => (
          <div className="col-md-4" key={icon}>
            <div className="card">
              <div className="card-body">
                <h6 className="card-title mb-3">{name}</h6>

                {/* Light mode */}
                <p className="text-muted mb-1" style={{ fontSize: 11 }}>Light Mode — Expanded (114×28)</p>
                <div className="mb-2 p-2 d-inline-block" style={{ background: '#ffffff', border: '1px solid #e9ecef', borderRadius: 4 }}>
                  <LogoLg icon={icon} bg="transparent" textColor="#21252e" mutedColor="#8486a7" />
                </div>

                <p className="text-muted mb-1" style={{ fontSize: 11 }}>Light Mode — Collapsed (24×24)</p>
                <div className="mb-3 p-2 d-inline-block" style={{ background: '#ffffff', border: '1px solid #e9ecef', borderRadius: 4 }}>
                  <LogoSm icon={icon} bg="transparent" />
                </div>

                {/* Dark mode */}
                <p className="text-muted mb-1" style={{ fontSize: 11 }}>Dark Mode — Expanded (114×28)</p>
                <div className="mb-2 p-2 d-inline-block" style={{ background: '#21252e', borderRadius: 4 }}>
                  <LogoLg icon={icon} bg="transparent" textColor="#ffffff" mutedColor="#8486a7" />
                </div>

                <p className="text-muted mb-1" style={{ fontSize: 11 }}>Dark Mode — Collapsed (24×24)</p>
                <div className="mb-3 p-2 d-inline-block" style={{ background: '#21252e', borderRadius: 4 }}>
                  <LogoSm icon={icon} bg="transparent" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h6>Validation Checklist</h6>
          <ul className="mb-0">
            <li>✅ Icons: All from authorized Iconify sets (mingcute, bx, solar)</li>
            <li>✅ Colors: Only Darkone tokens (#7e67fe, #21252e, #8486a7, #ffffff)</li>
            <li>✅ Font: Play (already loaded globally)</li>
            <li>✅ Dimensions: 114×28px (lg), 24×24px (sm)</li>
            <li>✅ Dark/light: Both variants rendered</li>
            <li>✅ No production files modified</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default LogoPreviewPage
