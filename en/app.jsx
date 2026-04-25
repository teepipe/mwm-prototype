// Mico Work Match — root app orchestrator
function App() {
  const useState = React.useState;
  const useRef = React.useRef;
  const jobs = window.WM_JOBS;

  // LIFF profile state — defaults to a mock user, swaps to the real LINE profile
  // once liff.init() + getProfile() resolve.
  const [user, setUser] = React.useState(() => {
    var p = window.WM_LIFF && window.WM_LIFF.profile;
    return p ? { name: p.displayName, picture: p.pictureUrl } : { name: 'Sato' };
  });
  React.useEffect(function() {
    function onReady(e) {
      var p = e.detail;
      if (p) setUser({ name: p.displayName, picture: p.pictureUrl });
    }
    window.addEventListener('liff-ready', onReady);
    return function() { window.removeEventListener('liff-ready', onReady); };
  }, []);
  const [screen, setScreen] = useState(() => {
    // Allow LP to set initial screen via ?screen= param
    const s = new URLSearchParams(window.location.search).get('screen');
    return ['lineIntro','welcome','swipe','daily','history','me','limit'].includes(s) ? s : 'lineIntro';
  }); // lineIntro | welcome | swipe | daily | history | detail | limit
  const [detailJob, setDetailJob] = useState(null);
  const [liked, setLiked] = useState(window.WM_HISTORY_LIKED);
  const [skipped, setSkipped] = useState(window.WM_HISTORY_SKIPPED);
  const [remaining, setRemaining] = useState(13); // daily budget remaining (of 20)
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const [likeSheet, setLikeSheet] = useState(null);
  const [feedbackSheet, setFeedbackSheet] = useState(null);
  const swipeCountRef = useRef(0);
  const swipeSeqRef = useRef(0);
  const [lineIntroKey, setLineIntroKey] = React.useState(0);
  const [autoSwipe, setAutoSwipe] = React.useState(0);
  const [swipeKey, setSwipeKey] = React.useState(0);
  const autoSwipingRef = React.useRef(false);

  const showToast = (msg) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => setToast(null), 2400);
  };

  const decrementAndCheckLimit = () => {
    setRemaining(r => {
      const next = Math.max(0, r - 1);
      if (next === 0) {
        setTimeout(() => setScreen('limit'), 300);
      }
      return next;
    });
  };

  const cancelPendingSheets = () => {
    ++swipeSeqRef.current;
    setLikeSheet(null);
    setFeedbackSheet(null);
    if (toastRef.current) {
      clearTimeout(toastRef.current);
      toastRef.current = null;
    }
    setToast(null);
  };

  React.useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type !== 'WM_CMD') return;
      setFeedbackSheet(null);
      setLikeSheet(null);
      if (d.screen) {
        setScreen(d.screen);
        if (d.screen === 'lineIntro' && d.reset) {
          setLineIntroKey(k => k + 1);
        }
      }
      if (d.showFeedback) {
        setScreen('swipe');
        setTimeout(() => setFeedbackSheet({ job: jobs[0], firstTime: false }), 120);
      }
      if (d.swipeNope) {
        autoSwipingRef.current = true;
        setScreen('swipe');
        setAutoSwipe(n => n + 1);
        setTimeout(() => { autoSwipingRef.current = false; }, 600);
      }
      if (d.resetState) {
        setFeedbackSheet(null);
        setLikeSheet(null);
        setScreen('swipe');
        setRemaining(13);
        setLiked(window.WM_HISTORY_LIKED);
        setSkipped(window.WM_HISTORY_SKIPPED);
        setSwipeKey(k => k + 1);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLike = (job) => {
    logEvent('add_favorite', eventParams(job));
    showToast(`Liked! Looks like you prefer ${job.subcategory} jobs`);
    setLiked(arr => [{jobId: job.id, date: 'Today', reason: '-'}, ...arr]);
    decrementAndCheckLimit();
    const seq = ++swipeSeqRef.current;
    setTimeout(() => {
      if (seq === swipeSeqRef.current) setLikeSheet(job);
    }, 400);
  };

  const handleNope = (job) => {
    logEvent('swipe_nope', eventParams(job));
    setSkipped(arr => [{jobId: job.id, date: 'Today', reason: '-'}, ...arr]);
    swipeCountRef.current += 1;
    decrementAndCheckLimit();
    if (autoSwipingRef.current) return;
    const count = swipeCountRef.current;
    const shouldAsk = count === 1 || count % 5 === 0;
    const seq = ++swipeSeqRef.current;
    if (shouldAsk) {
      setTimeout(() => {
        if (seq === swipeSeqRef.current) setFeedbackSheet({job, firstTime: count === 1});
      }, 400);
    }
  };

  const handleLikeReasonSubmit = (reason) => {
    logEvent('like_reason', {jobID: likeSheet.id, reason});
    setLikeSheet(null);
  };

  const handleFeedbackSubmit = (reason) => {
    logEvent('feedback_submit', {jobID: feedbackSheet.job.id, reason});
    setFeedbackSheet(null);
  };

  const [detailOrigin, setDetailOrigin] = useState('swipe');
  const openDetail = (job, origin = 'swipe') => {
    logEvent('browse_product', eventParams(job));
    setDetailJob(job);
    setDetailOrigin(origin);
    setScreen('detail');
  };
  const handleApply = (job) => {
    logEvent('apply_start', eventParams(job));
    showToast('Opening application form (mock)');
    setScreen('swipe');
  };
  const handleConsult = (job) => {
    logEvent('consult_start', eventParams(job));
    showToast('Chat with an agent on LINE (mock)');
  };

  const eventParams = (job) => ({
    jobID: job.id,
    category: job.category,
    subcategory: job.subcategory,
    wage: job.wage,
    location: job.location,
    shift: job.shift,
    tags: job.tags.join(','),
    match: job.match,
    companySize: job.companySize,
  });

  const logEvent = (name, params) => {
    console.log('[ME]', name, params);
  };

  const handleNav = (key, payload) => {
    if (key === 'detail' && payload) {
      openDetail(payload);
    } else {
      setScreen(key);
      if (key !== 'detail') setDetailJob(null);
    }
  };

  const tweaks = window.WM_TWEAKS || {};

  const showLiff = screen !== 'lineIntro';

  return (
    <div style={{position:'relative', width:'100%', height:'100%'}}>
      <LineIntro key={lineIntroKey} onEnter={()=>setScreen('welcome')}/>

      <div className={`wm-miniapp-sheet ${showLiff ? 'is-open' : ''}`} aria-hidden={!showLiff}>
        <LineLiffHeader
          title="Mico Work Match"
          onClose={()=>setScreen('lineIntro')}
        />
        <div className="wm-liff-body with-liff">
      {screen === 'welcome' && (
        <WelcomeScreen onStart={()=>setScreen('swipe')} onSeeRecommended={()=>setScreen('daily')}/>
      )}
      {screen === 'swipe' && (
        <SwipeScreen
          key={swipeKey}
          jobs={jobs}
          user={user}
          liked={liked}
          onLike={handleLike}
          onNope={handleNope}
          onSwipeStart={cancelPendingSheets}
          onOpenDetail={openDetail}
          remaining={remaining}
          toastMsg={toast}
          autoSwipe={autoSwipe}
        />
      )}
      {screen === 'daily' && (
        <DailyScreen
          jobs={jobs}
          remaining={remaining}
          onOpenDetail={openDetail}
        />
      )}
      {screen === 'history' && (
        <HistoryScreen
          jobs={jobs}
          liked={liked}
          skipped={skipped}
          onOpenDetail={(job, tab) => openDetail(job, tab === 'liked' ? 'liked' : 'skipped')}
          onReconsider={(job) => openDetail(job, 'swipe')}
          remaining={remaining}
        />
      )}
      {screen === 'me' && (
        <MyStub onBack={()=>setScreen('swipe')} liked={liked} skipped={skipped} remaining={remaining} onNav={setScreen}/>
      )}
      {screen === 'detail' && detailJob && (
        <DetailScreen
          job={detailJob}
          origin={detailOrigin}
          onBack={()=>setScreen(detailOrigin === 'swipe' ? 'swipe' : 'history')}
          onLike={()=>{ handleLike(detailJob); setScreen('swipe'); }}
          onSkip={()=>{ handleNope(detailJob); setScreen('swipe'); }}
          onApply={()=>handleApply(detailJob)}
          onConsult={()=>handleConsult(detailJob)}
        />
      )}
      {screen === 'limit' && (
        <LimitScreen
          jobs={jobs}
          liked={liked}
          onNav={(k, p)=>{
            setRemaining(13);
            handleNav(k, p);
          }}
        />
      )}

      {screen !== 'detail' && screen !== 'limit' && screen !== 'lineIntro' && screen !== 'welcome' && (
        <WMTabBar current={screen} onNav={setScreen}/>
      )}

      {likeSheet && (
        <LikeReasonSheet
          job={likeSheet}
          onClose={()=>setLikeSheet(null)}
          onSubmit={handleLikeReasonSubmit}
        />
      )}
      {feedbackSheet && (
        <FeedbackSheet
          job={feedbackSheet.job}
          firstTime={feedbackSheet.firstTime}
          onClose={()=>setFeedbackSheet(null)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
        </div>
      </div>
    </div>
  );
}

// My Page
function MyStub({onBack, liked, skipped, remaining, onNav}) {
  const Mi = ({name, size=20, fill=0, color}) => (
    <span className="material-symbols-rounded" style={{
      fontSize: size,
      color,
      fontVariationSettings: `'FILL' ${fill}, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
    }}>{name}</span>
  );
  const likeCount = liked?.length ?? 0;
  const skipCount = skipped?.length ?? 0;
  const swiped = 20 - (remaining ?? 20);
  return (
    <div className="wm-screen wm-screen-me">
      <div className="wm-screen-scroll" style={{padding:'14px 14px 24px'}}>
        <div style={{fontSize:18, fontWeight:800, letterSpacing:'-0.01em', padding:'4px 2px 10px'}}>My Page</div>

        <div className="wm-me-profile">
          <div className="wm-me-avatar">S</div>
          <div className="wm-me-pinfo">
            <div className="wm-me-pname">Sato</div>
            <div className="wm-me-pid">LINE linked · userId U_abc…3f21</div>
          </div>
          <button className="wm-me-edit" aria-label="Edit">
            <Mi name="edit" size={18}/>
          </button>
        </div>

        <div className="wm-me-stats">
          <div className="wm-me-stat" onClick={()=>onNav && onNav('history')}>
            <div className="wm-me-stat-num">{likeCount}</div>
            <div className="wm-me-stat-label">Likes</div>
          </div>
          <div className="wm-me-stat-divider"/>
          <div className="wm-me-stat">
            <div className="wm-me-stat-num">{swiped}<span className="wm-me-stat-sub">/20</span></div>
            <div className="wm-me-stat-label">Today's swipes</div>
          </div>
          <div className="wm-me-stat-divider"/>
          <div className="wm-me-stat">
            <div className="wm-me-stat-num">3</div>
            <div className="wm-me-stat-label">Applied</div>
          </div>
        </div>

        <div className="wm-me-card wm-me-profile-card">
          <div className="wm-me-card-head">
            <div>
              <div className="wm-me-card-title">Profile</div>
              <div className="wm-me-card-sub">Almost there! Match accuracy will improve</div>
            </div>
            <div className="wm-me-ring">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#eef1ee" strokeWidth="4"/>
                <circle cx="24" cy="24" r="20" fill="none" stroke="#2a2eea" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*20*0.7} ${2*Math.PI*20}`}
                  transform="rotate(-90 24 24)"/>
              </svg>
              <div className="wm-me-ring-text">70%</div>
            </div>
          </div>
          <div className="wm-me-progress-items">
            <div className="wm-me-prog-item done">
              <Mi name="check_circle" size={16} fill={1} color="#2a2eea"/>
              <span>Basic info</span>
            </div>
            <div className="wm-me-prog-item done">
              <Mi name="check_circle" size={16} fill={1} color="#2a2eea"/>
              <span>Preferences</span>
            </div>
            <div className="wm-me-prog-item">
              <Mi name="radio_button_unchecked" size={16} color="#c6cac6"/>
              <span>Work history</span>
            </div>
            <div className="wm-me-prog-item">
              <Mi name="radio_button_unchecked" size={16} color="#c6cac6"/>
              <span>Skills & licenses</span>
            </div>
          </div>
          <button className="wm-me-profile-cta">
            <span>Complete your profile</span>
            <Mi name="arrow_forward" size={18}/>
          </button>
        </div>

        <div className="wm-me-card">
          <div className="wm-me-card-head">
            <div className="wm-me-card-title">Preferences</div>
            <button className="wm-me-link">
              <span>Edit</span>
              <Mi name="chevron_right" size={16}/>
            </button>
          </div>
          <div className="wm-me-chips">
            <div className="wm-me-chip"><Mi name="place" size={13} color="#6b7069"/>Yokohama</div>
            <div className="wm-me-chip"><Mi name="directions_walk" size={13} color="#6b7069"/>≤30 min commute</div>
            <div className="wm-me-chip"><Mi name="payments" size={13} color="#6b7069"/>¥1,300+/h</div>
            <div className="wm-me-chip"><Mi name="calendar_month" size={13} color="#6b7069"/>3+ days/wk</div>
            <div className="wm-me-chip"><Mi name="schedule" size={13} color="#6b7069"/>Day shift only</div>
          </div>
        </div>

        <div className="wm-me-menu">
          <button className="wm-me-menu-row" onClick={()=>onNav && onNav('history')}>
            <div className="wm-me-menu-icon" style={{background:'#ffe9ed', color:'#e5154f'}}>
              <Mi name="favorite" size={18} fill={1}/>
            </div>
            <div className="wm-me-menu-body">
              <div className="wm-me-menu-title">My Likes</div>
              <div className="wm-me-menu-sub">{likeCount} saved jobs</div>
            </div>
            <Mi name="chevron_right" size={18} color="#c6cac6"/>
          </button>
          <button className="wm-me-menu-row">
            <div className="wm-me-menu-icon" style={{background:'#e6f4ff', color:'#2a2eea'}}>
              <Mi name="work" size={18} fill={1}/>
            </div>
            <div className="wm-me-menu-body">
              <div className="wm-me-menu-title">Application History</div>
              <div className="wm-me-menu-sub">3 total · 2 in review</div>
            </div>
            <Mi name="chevron_right" size={18} color="#c6cac6"/>
          </button>
          <button className="wm-me-menu-row">
            <div className="wm-me-menu-icon" style={{background:'#fff4d6', color:'#b88100'}}>
              <Mi name="notifications" size={18} fill={1}/>
            </div>
            <div className="wm-me-menu-body">
              <div className="wm-me-menu-title">Notifications</div>
              <div className="wm-me-menu-sub">Daily 6 AM · ON</div>
            </div>
            <Mi name="chevron_right" size={18} color="#c6cac6"/>
          </button>
          <button className="wm-me-menu-row">
            <div className="wm-me-menu-icon" style={{background:'#e6f4ff', color:'#2a2eea'}}>
              <Mi name="forum" size={18} fill={1}/>
            </div>
            <div className="wm-me-menu-body">
              <div className="wm-me-menu-title">Consult an Agent</div>
              <div className="wm-me-menu-sub">Chat on LINE</div>
            </div>
            <Mi name="chevron_right" size={18} color="#c6cac6"/>
          </button>
        </div>

        <div className="wm-me-menu">
          <button className="wm-me-menu-row">
            <div className="wm-me-menu-icon" style={{background:'#f1f4f1', color:'#4a4e4a'}}>
              <Mi name="help" size={18}/>
            </div>
            <div className="wm-me-menu-body">
              <div className="wm-me-menu-title">Help & FAQ</div>
            </div>
            <Mi name="chevron_right" size={18} color="#c6cac6"/>
          </button>
          <button className="wm-me-menu-row">
            <div className="wm-me-menu-icon" style={{background:'#f1f4f1', color:'#4a4e4a'}}>
              <Mi name="description" size={18}/>
            </div>
            <div className="wm-me-menu-body">
              <div className="wm-me-menu-title">Terms & Privacy</div>
            </div>
            <Mi name="chevron_right" size={18} color="#c6cac6"/>
          </button>
        </div>

        <div className="wm-me-foot">
          <div className="wm-me-foot-brand">Mico Work Match</div>
          <div className="wm-me-foot-ver">ver 1.0.2 · build 240421</div>
        </div>
      </div>
    </div>
  );
}

window.App = App;
