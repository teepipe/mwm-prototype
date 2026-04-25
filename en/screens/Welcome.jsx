// S1 Welcome — one-screen onboarding intro shown after rich-menu tap, before swipe.
// Per requirements doc §4-1: "Just swipe through jobs! We'll learn your preferences and deliver perfect matches."
function WelcomeScreen({onStart, onSeeRecommended}) {
  return (
    <div className="wm-screen wm-screen-welcome" style={{
      display:'flex', flexDirection:'column', height:'100%',
      background:'linear-gradient(180deg, #ffffff 0%, #f0f4ff 100%)',
      padding:'24px 22px',
      overflow:'hidden',
    }}>
      <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center', textAlign:'center'}}>
        {/* Brand mark */}
        <div style={{display:'flex', justifyContent:'center', marginBottom:18}}>
          <div style={{
            width:80, height:80, borderRadius:'50%',
            background:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 30px rgba(42,46,234,0.18), 0 0 0 1px rgba(42,46,234,0.08)',
          }}>
            <img src="assets/mico-mark.png" alt="mico" style={{width:48, height:48, objectFit:'contain'}}/>
          </div>
        </div>

        {/* Heading */}
        <div style={{
          fontSize:26, fontWeight:800, lineHeight:1.25,
          color:'#0f1117', letterSpacing:'-0.02em',
          marginBottom:14,
        }}>
          Just swipe<br/>jobs you like.
        </div>

        {/* Body */}
        <div style={{
          fontSize:14, lineHeight:1.6, color:'#4a4e4a',
          marginBottom:28,
        }}>
          We'll learn your preferences and deliver<br/>
          <b style={{color:'#2a2eea'}}>perfect-fit jobs</b> every morning.
        </div>

        {/* 3 steps */}
        <div style={{
          display:'flex', flexDirection:'column', gap:10,
          margin:'0 0 28px',
          textAlign:'left',
        }}>
          {[
            {icon:'swipe', t:'Swipe to like the jobs you want', s:'Right = Like, Left = Skip'},
            {icon:'auto_awesome', t:'AI learns your preferences', s:'The more you swipe, the better it gets'},
            {icon:'notifications_active', t:'Daily picks at 6 AM', s:'LINE notification → resume in one tap'},
          ].map((item, i) => (
            <div key={i} style={{
              display:'flex', gap:12, alignItems:'flex-start',
              padding:'12px 14px',
              background:'rgba(255,255,255,0.7)',
              borderRadius:12,
              border:'1px solid rgba(42,46,234,0.08)',
            }}>
              <div style={{
                width:32, height:32, borderRadius:8,
                background:'#2a2eea', color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
              }}>
                <span className="material-symbols-rounded" style={{fontSize:18, fontVariationSettings:"'FILL' 1"}}>{item.icon}</span>
              </div>
              <div>
                <div style={{fontSize:13, fontWeight:700, color:'#0f1117', lineHeight:1.4}}>{item.t}</div>
                <div style={{fontSize:11, color:'#6b7280', marginTop:2, lineHeight:1.45}}>{item.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        <button
          className="wm-btn-primary"
          onClick={onStart}
          style={{
            width:'100%', background:'#2a2eea', color:'#fff',
            padding:'14px 20px', borderRadius:14, border:'none',
            fontSize:15, fontWeight:700, cursor:'pointer',
            boxShadow:'0 4px 16px rgba(42,46,234,0.35)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          }}
        >
          Start swiping
          <span className="material-symbols-rounded" style={{fontSize:18}}>arrow_forward</span>
        </button>
        <button
          onClick={onSeeRecommended}
          style={{
            width:'100%',
            padding:'10px 14px',
            background:'transparent',
            border:'none',
            color:'#2a2eea',
            fontSize:12, fontWeight:600, cursor:'pointer',
            fontFamily:'inherit',
          }}
        >
          See Today's Top 5 first →
        </button>
      </div>
    </div>
  );
}

window.WelcomeScreen = WelcomeScreen;
