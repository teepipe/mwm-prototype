// History — Like / Skip tabs
function HistoryScreen({jobs, liked, skipped, onOpenDetail, onReconsider, remaining}) {
  const [tab, setTab] = React.useState('liked');
  const data = tab === 'liked' ? liked : skipped;
  const jobById = React.useMemo(() => {
    const m = {};
    jobs.forEach(j => m[j.id] = j);
    return m;
  }, [jobs]);

  return (
    <div className="wm-screen wm-screen-history">
      {/* Header — mirrors Swipe's rich bar chrome but compact */}
      <div className="wm-hist-header">
        <div className="wm-hist-header-row">
          <div className="wm-hist-brand">
            <img src="assets/mico-mark.png" alt="mico" style={{width:22, height:22, objectFit:'contain', display:'block'}}/>
            <span className="wm-hist-title">My Likes</span>
          </div>
          <div className="wm-hist-counter">{remaining} left</div>
        </div>

        <div className="wm-hist-tabs">
          <button
            className={`wm-hist-tab ${tab==='liked'?'active':''}`}
            onClick={()=>setTab('liked')}
          >
            <span
              className="material-symbols-rounded"
              style={{
                fontSize:16,
                color: tab==='liked' ? '#ff3b5c' : '#b0b3b0',
                fontVariationSettings: tab==='liked' ? "'FILL' 1" : "'FILL' 0"
              }}
            >favorite</span>
            <span>Liked</span>
            <span className="wm-hist-tab-count">{liked.length}</span>
          </button>
          <button
            className={`wm-hist-tab ${tab==='skipped'?'active':''}`}
            onClick={()=>setTab('skipped')}
          >
            <span
              className="material-symbols-rounded"
              style={{fontSize:16, color: tab==='skipped' ? '#1a1a1a' : '#b0b3b0'}}
            >close</span>
            <span>Skipped</span>
            <span className="wm-hist-tab-count">{skipped.length}</span>
          </button>
        </div>
      </div>

      <div className="wm-screen-scroll wm-hist-list">
        {data.length === 0 && (
          <div className="wm-hist-empty">
            <div className="wm-hist-empty-icon">
              <span className="material-symbols-rounded" style={{fontSize:28, color:'#b0b3b0', fontVariationSettings:"'FILL' 1"}}>
                {tab==='liked' ? 'favorite' : 'history'}
              </span>
            </div>
            <div className="wm-hist-empty-title">
              {tab==='liked' ? 'No likes yet' : 'No skipped jobs yet'}
            </div>
            <div className="wm-hist-empty-sub">
              {tab==='liked'
                ? 'Swipe to find jobs you like'
                : 'Jobs you skip will appear here'}
            </div>
          </div>
        )}

        {data.map((entry, i) => {
          const job = jobById[entry.jobId];
          if (!job) return null;
          return (
            <div key={i} className="wm-hist-card">
              <div className="wm-hist-thumb" onClick={()=>onOpenDetail(job, tab)}>
                {job.photo ? (
                  <img src={job.photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}/>
                ) : (
                  <WM.JobArt job={job} labelOnly={true}/>
                )}
                {tab === 'liked' && (
                  <div className="wm-hist-thumb-badge">
                    <span className="material-symbols-rounded" style={{fontSize:12, color:'#fff', fontVariationSettings:"'FILL' 1"}}>favorite</span>
                  </div>
                )}
              </div>
              <div className="wm-hist-info" onClick={()=>onOpenDetail(job, tab)}>
                <div className="wm-hist-company">{job.company || job.subcategory}</div>
                <div className="wm-hist-title-text">{job.title}</div>
                <div className="wm-hist-meta">
                  <span className="wm-hist-wage">
                    ¥{job.wage.toLocaleString()}<span style={{opacity:0.5, marginLeft:2}}>/{job.wageType === 'Hourly' ? 'hr' : 'mo'}</span>
                  </span>
                  <span className="wm-hist-dot">·</span>
                  <span>{job.locationShort}</span>
                </div>
                <div className="wm-hist-footer">
                  <span className="wm-hist-date">{entry.date}</span>
                  {entry.reason && entry.reason !== '-' && (
                    <span className="wm-hist-reason">{entry.reason}</span>
                  )}
                </div>
              </div>
              {tab === 'skipped' && (
                <button className="wm-hist-reconsider" onClick={()=>onReconsider(job)}>
                  Reconsider
                </button>
              )}
            </div>
          );
        })}

        {tab === 'skipped' && data.length > 0 && (
          <div className="wm-hist-tip">
            <span className="material-symbols-rounded" style={{fontSize:16, color:'#b58400'}}>lightbulb</span>
            <span>Skipped jobs that match your preferences can be revisited via "Reconsider"</span>
          </div>
        )}
      </div>
    </div>
  );
}

window.HistoryScreen = HistoryScreen;
