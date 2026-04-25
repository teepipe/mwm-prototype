// Daily Picks — top 5 AI recommended
function DailyScreen({jobs, onOpenDetail, remaining}) {
  const top5 = [...jobs].sort((a,b)=>b.match-a.match).slice(0,5);
  const today = new Date();
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `${months[today.getMonth()]} ${today.getDate()} (${days[today.getDay()]})`;

  return (
    <div className="wm-screen">
      <WMTopBar counter={remaining}/>

      <div className="wm-daily-hero">
        <div className="wm-daily-kicker">
          <WM.Icon.Sparkle size={11}/> AI CURATED
        </div>
        <div className="wm-daily-title">Today's Top 5</div>
        <div className="wm-daily-date">{dateStr} · refreshed daily 6 AM</div>
      </div>

      <div className="wm-screen-scroll">
        {top5.map((job, i) => (
          <div key={job.id} className="wm-daily-row" onClick={()=>onOpenDetail(job)}>
            <div className="wm-daily-rank">{i+1}</div>
            <div className="wm-daily-thumb"><WM.JobArt job={job} labelOnly={true}/></div>
            <div className="wm-daily-info">
              <div className="wm-daily-job-title">{job.title}</div>
              <div className="wm-daily-meta">
                <span>{job.company}</span>
                <span style={{color:'var(--wm-ink-200)'}}>·</span>
                <span>{job.locationShort}</span>
              </div>
              <div className="wm-daily-meta" style={{marginBottom:6}}>
                <span className="wm-num" style={{fontWeight:700, color:'var(--wm-ink-900)'}}>
                  ¥{job.wage.toLocaleString()}
                </span>
                <span>/ {job.wageType === 'Hourly' ? 'hr' : 'mo'}</span>
              </div>
              <div className="wm-daily-score">
                <span className="wm-num">{job.match}%</span>
                <div className="wm-daily-score-bar"><div style={{width:`${job.match}%`}}/></div>
                <span style={{color:'var(--wm-ink-500)', fontWeight:500}}>match</span>
              </div>
            </div>
          </div>
        ))}

        <div style={{padding:'12px 20px 20px', textAlign:'center', fontSize:11, color:'var(--wm-ink-400)'}}>
          Powered by mico engageAI
        </div>
      </div>
    </div>
  );
}

window.DailyScreen = DailyScreen;
