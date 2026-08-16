import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3, BookOpen, CalendarDays, ChevronLeft, ChevronRight, CircleHelp,
  FileText, Flame, GraduationCap, Layers3, LogOut, Menu, Pencil, Play,
  Plus, Search, Settings, Sparkles, Star, Target, Trash2, Trophy, X
} from "lucide-react";

const CATEGORIES = [
  { id:"gened", label:"GenEd", title:"General Education", short:"GenEd", icon:BookOpen, color:"purple", desc:"English, Mathematics, Science, Filipino, Social Studies", items:150, hours:"2 hrs" },
  { id:"profed", label:"ProfEd", title:"Professional Education", short:"ProfEd", icon:GraduationCap, color:"green", desc:"Child Development, Curriculum, Teaching Strategies, Assessment", items:150, hours:"3 hrs" },
  { id:"majorship", label:"Majorship", title:"Majorship", short:"Majorship", icon:Star, color:"orange", desc:"Subject-specific content for your teaching specialization", items:120, hours:"3.5 hrs" },
  { id:"full", label:"Full", title:"Full Board Exam", short:"Full", icon:FileText, color:"purple", desc:"Complete LET simulation: GenEd + ProfEd + Majorship", items:420, hours:"8.5 hrs" }
];

const seedQuestions = [
  { id:1, cat:"gened", q:"Which statement best describes the primary purpose of formative assessment?", options:["To rank students at the end of a course","To provide feedback that improves learning during instruction","To determine school funding","To replace classroom instruction"], answer:1, explanation:"Formative assessment is used during learning to provide feedback and guide improvement." },
  { id:2, cat:"gened", q:"Which branch of government is primarily responsible for interpreting laws?", options:["Executive","Legislative","Judicial","Local"], answer:2, explanation:"The judiciary interprets laws and resolves legal disputes." },
  { id:3, cat:"profed", q:"A teacher begins a lesson by connecting a new concept to learners' prior experiences. Which principle is being applied?", options:["Meaningful learning","Punitive discipline","Norm-referenced testing","Random grouping"], answer:0, explanation:"Connecting new ideas to prior knowledge supports meaningful learning." },
  { id:4, cat:"profed", q:"Which classroom practice most directly supports differentiated instruction?", options:["Giving every learner exactly the same task","Using varied activities based on learner readiness and needs","Avoiding assessment","Using only lectures"], answer:1, explanation:"Differentiation adjusts learning experiences to learner readiness, interests, or needs." },
  { id:5, cat:"majorship", q:"Which approach best reflects learner-centered teaching?", options:["Teacher speaks for the entire period","Learners actively construct and apply knowledge","Students memorize without discussion","Assessment is never used"], answer:1, explanation:"Learner-centered approaches emphasize active participation, construction of knowledge, and application." }
];

function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

function App() {
  const [page, setPage] = usePersistedState("lgh-page", "dashboard");
  const [category, setCategory] = usePersistedState("lgh-category", "gened");
  const [streak, setStreak] = usePersistedState("lgh-streak", 14);
  const [questions, setQuestions] = usePersistedState("lgh-questions", seedQuestions);
  const [decks, setDecks] = usePersistedState("lgh-decks", [
    {id:1,name:"General Science",category:"gened",description:"Review deck",questions:0,flashcards:0}
  ]);
  const [sessions, setSessions] = usePersistedState("lgh-sessions", []);
  const [mockScores, setMockScores] = usePersistedState("lgh-mock-scores", []);
  const [drill, setDrill] = useState(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const stats = useMemo(() => ({
    answered: sessions.reduce((n,s)=>n+(s.answered||0),0),
    correct: sessions.reduce((n,s)=>n+(s.correct||0),0),
    hours: sessions.reduce((n,s)=>n+(Number(s.minutes||0)/60),0),
    mockAverage: mockScores.length ? mockScores.reduce((a,b)=>a+b,0)/mockScores.length : 0
  }), [sessions,mockScores]);

  function startDrill(cat = category) {
    const pool = questions.filter(q => q.cat === cat);
    if (!pool.length) {
      alert("No questions are available for this category yet. Add questions to a deck first.");
      return;
    }
    setDrill({ cat, pool:[...pool].sort(()=>Math.random()-0.5), index:0, correct:0, answered:0, selected:null, checked:false });
  }

  function answerDrill(choice) {
    setDrill(d => ({...d, selected:choice, checked:true}));
  }

  function nextDrill() {
    setDrill(d => {
      const current = d.pool[d.index];
      const wasCorrect = d.selected === current.answer;
      const nextAnswered = d.answered + 1;
      const nextCorrect = d.correct + (wasCorrect ? 1 : 0);
      if (d.index >= d.pool.length - 1) {
        setSessions(s => [...s, {type:"drill", cat:d.cat, answered:nextAnswered, correct:nextCorrect, minutes:Math.max(1,nextAnswered*1)}]);
        if (nextCorrect > 0) setStreak(x => Math.max(x,14));
        return null;
      }
      return {...d,index:d.index+1,selected:null,checked:false,answered:nextAnswered,correct:nextCorrect};
    });
  }

  function addDeck(data) {
    setDecks(d => [...d, {id:Date.now(), ...data, questions:0, flashcards:0}]);
    setShowDeckModal(false);
  }

  function addSession(data) {
    setSessions(s => [...s, {id:Date.now(), ...data}]);
    setShowSessionModal(false);
  }

  const nav = [
    ["dashboard", GraduationCap, "Dashboard"],
    ["drill", Flame, "Daily Drill"],
    ["progress", BarChart3, "Progress"],
    ["decks", Layers3, "Study Decks"],
    ["mock", FileText, "Mock Board"],
    ["schedule", CalendarDays, "Study Schedule"]
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark"><GraduationCap size={30}/></div>
        <nav>
          {nav.map(([id,Icon,label]) => (
            <button key={id} className={"nav-btn "+(page===id?"active":"")} title={label} onClick={()=>setPage(id)}>
              <Icon size={23}/><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-btn" title="Settings"><Settings size={22}/><span>Settings</span></button>
          <div className="avatar">G</div>
          <button className="nav-btn" title="Sign out"><LogOut size={22}/><span>Sign out</span></button>
        </div>
      </aside>

      <main className="main">
        <header className="mobile-header">
          <div className="brand-mark"><GraduationCap size={24}/></div>
          <button className="icon-btn" onClick={()=>document.body.classList.toggle("nav-open")}><Menu/></button>
        </header>

        {page==="dashboard" && <Dashboard setPage={setPage} streak={streak} category={category} setCategory={setCategory} startDrill={startDrill} stats={stats} decks={decks} />}
        {page==="drill" && <DailyDrill category={category} setCategory={setCategory} startDrill={startDrill} streak={streak} />}
        {page==="progress" && <Progress stats={stats} streak={streak} decks={decks} mockScores={mockScores} />}
        {page==="decks" && <Decks decks={decks} setDecks={setDecks} setPage={setPage} setShowDeckModal={setShowDeckModal} />}
        {page==="mock" && <MockBoard category={category} setCategory={setCategory} mockScores={mockScores} setMockScores={setMockScores} setSessions={setSessions} />}
        {page==="schedule" && <Schedule sessions={sessions} setShowSessionModal={setShowSessionModal} />}

        {drill && <DrillModal drill={drill} answerDrill={answerDrill} nextDrill={nextDrill} close={()=>setDrill(null)} />}
        {showDeckModal && <DeckModal close={()=>setShowDeckModal(false)} save={addDeck}/>}
        {showSessionModal && <SessionModal close={()=>setShowSessionModal(false)} save={addSession}/>}
      </main>
    </div>
  );
}

function PageHeader({title,subtitle,action}) {
  return <div className="page-header"><div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>
}

function Dashboard({setPage,streak,category,setCategory,startDrill,stats,decks}) {
  const cat = CATEGORIES.find(c=>c.id===category) || CATEGORIES[0];
  return <div>
    <PageHeader title="Daily Drill" subtitle="One question at a time — build your review habit daily."
      action={<div className="streak-pill"><Flame size={20}/> {streak} day streak</div>} />
    <div className="category-tabs">
      {CATEGORIES.slice(0,3).map(c=><button className={category===c.id?"selected":""} key={c.id} onClick={()=>setCategory(c.id)}><c.icon size={20}/>{c.label}</button>)}
    </div>
    <section className="hero-card">
      <div className="hero-icon"><Target size={42}/></div>
      <h2>{cat.title.replace("General Education","GenEd")} Drill</h2>
      <div className="hero-count">{questionsCount(cat.id)} questions available</div>
      <p>Answer one question at a time. Each correct answer on your first<br className="desktop"/> daily drill keeps your streak alive!</p>
      <button className="primary-btn big" onClick={()=>startDrill(category)}><Play size={20} fill="currentColor"/> Start Drill</button>
    </section>
    <div className="three-cards">
      {CATEGORIES.slice(0,3).map(c=><button className="info-card" key={c.id} onClick={()=>{setCategory(c.id);setPage("drill")}}>
        <div className={"mini-icon "+c.color}><c.icon size={24}/></div><h3>{c.label}</h3><p>{questionsCount(c.id)} questions</p>
      </button>)}
    </div>
    <div className="streak-banner"><Flame/><div><b>Start your streak today!</b> Answer at least one question correctly to keep your streak alive.</div><strong>{streak} days</strong></div>
    <div className="quick-grid">
      <button onClick={()=>setPage("progress")}><BarChart3/><span>View progress</span></button>
      <button onClick={()=>setPage("decks")}><Layers3/><span>Open study decks</span></button>
      <button onClick={()=>setPage("mock")}><FileText/><span>Take a mock exam</span></button>
    </div>
  </div>
}
function questionsCount(cat){ return cat==="gened"?8:cat==="profed"?8:8 }

function DailyDrill({category,setCategory,startDrill,streak}) {
  return <div>
    <PageHeader title="Daily Drill" subtitle="Practice one question at a time and keep your streak going." action={<div className="streak-pill"><Flame size={20}/>{streak} day streak</div>}/>
    <div className="drill-layout">
      <section className="panel">
        <div className="panel-title"><Target/> Choose a category</div>
        <div className="choice-list">
          {CATEGORIES.slice(0,3).map(c=><button className={"choice-card "+(category===c.id?"chosen":"")} key={c.id} onClick={()=>setCategory(c.id)}>
            <div className={"mini-icon "+c.color}><c.icon size={23}/></div><div><b>{c.title}</b><span>{c.desc}</span></div>{category===c.id&&<div className="check-dot">✓</div>}
          </button>)}
        </div>
        <button className="primary-btn wide" onClick={()=>startDrill(category)}><Play size={19}/> Start {CATEGORIES.find(c=>c.id===category)?.label} Drill</button>
      </section>
      <aside className="panel tips">
        <h3>How it works</h3>
        <p><Target/> Answer one question at a time.</p>
        <p><Trophy/> A correct first answer helps your daily streak.</p>
        <p><Sparkles/> Review the explanation after submitting.</p>
      </aside>
    </div>
  </div>
}

function Progress({stats,streak,decks,mockScores}) {
  const accuracy = stats.answered ? stats.correct/stats.answered*100 : 0;
  return <div>
    <PageHeader title="Progress Dashboard" subtitle={<><span>LET Exam Date: September 28, 2026</span><span className="date-badge">43 days away</span></>} action={<span className="updated">Updated Aug 16 • 4:21 PM</span>}/>
    <div className="metrics">
      <div className="metric primary"><span>Overall Readiness Score</span><strong>{Math.round(Math.min(100,accuracy))}%</strong><small>Target: 75% to pass all sub-tests</small><b>Start a mock exam</b></div>
      <div className="metric"><span>Mock Exam Average</span><strong>{mockScores.length?Math.round(stats.mockAverage)+"%":"0.0%"}</strong><small>Last 5 mock exams</small><b className="danger">{mockScores.length?"Keep practicing":"No mocks yet"}</b></div>
      <div className="metric"><span>Daily Drill Streak</span><strong>{streak}</strong><small>days in a row — keep it up!</small><b>Personal best</b></div>
      <div className="metric"><span>Total Hours Studied</span><strong>{stats.hours.toFixed(1)}h</strong><small>{stats.hours.toFixed(1)}h this week</small><b>Log a session</b></div>
      <div className="metric"><span>Questions Answered</span><strong>{stats.answered}</strong><small>{accuracy.toFixed(1)}% accuracy overall</small><b>Answer to track</b></div>
    </div>
    <section className="panel deck-progress"><div className="section-head"><h2>Your Study Decks</h2><button>View all <ChevronRight size={18}/></button></div>
      {decks.map(d=><div className="deck-row" key={d.id}><div><b>{d.name}</b><span className="tag">{CATEGORIES.find(c=>c.id===d.category)?.label||"Mixed"}</span><small>{d.description||"Review deck"}</small></div><div className="progress-track"><i style={{width:"0%"}}/></div><strong>0%</strong></div>)}
    </section>
    <div className="chart-grid">
      <Chart title="Mock Exam Score Trend" type="line" values={[62,65,68,70,71,74,76,78]}/>
      <Chart title="Accuracy by Subject" type="bar" values={[70,67,72,64]}/>
    </div>
  </div>
}

function Chart({title,type,values}) {
  return <section className="panel chart-card"><h2>{title}</h2><div className="chart"><div className="ylabels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="plot">{[0,25,50,75,100].map(v=><div className="gridline" style={{bottom:`${v}%`}} key={v}/>)}
    {type==="line"?<svg viewBox="0 0 700 260" preserveAspectRatio="none" className="line-svg"><polyline fill="none" stroke="currentColor" strokeWidth="4" points={values.map((v,i)=>`${i*(700/(values.length-1))},${260-(v/100*230)-10}`).join(" ")}/>{values.map((v,i)=><circle key={i} cx={i*(700/(values.length-1))} cy={260-(v/100*230)-10} r="5" fill="currentColor"/>)}</svg>
    :<div className="bars">{values.map((v,i)=><div key={i} className="bar" style={{height:`${v}%`}}><span>{v}%</span></div>)}</div>}
  </div></div></section>
}

function Decks({decks,setDecks,setPage,setShowDeckModal}) {
  const [search,setSearch]=useState(""); const [filter,setFilter]=useState("All");
  const shown=decks.filter(d=>(filter==="All"||d.category===filter.toLowerCase()) && d.name.toLowerCase().includes(search.toLowerCase()));
  return <div>
    <PageHeader title="Study Decks" subtitle={`${decks.length} decks · ${decks.reduce((a,d)=>a+d.questions,0)} questions total`} action={<button className="primary-btn" onClick={()=>setShowDeckModal(true)}><Plus/> Create Deck</button>}/>
    <div className="deck-toolbar"><div className="search"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search decks..."/></div><div className="filters">{["All","GenEd","ProfEd","Majorship","Mixed"].map(x=><button key={x} className={filter===x?"selected":""} onClick={()=>setFilter(x)}>{x}</button>)}</div></div>
    <div className="deck-grid">{shown.map(d=><div className="deck-card" key={d.id}>
      <div className="deck-top"><div className="mini-icon purple"><Layers3/></div><span className="tag">{CATEGORIES.find(c=>c.id===d.category)?.label||"Mixed"}</span><div className="deck-actions"><button title="Edit"><Pencil size={17}/></button><button title="Delete" onClick={()=>setDecks(x=>x.filter(a=>a.id!==d.id))}><Trash2 size={17}/></button></div></div>
      <h3>{d.name}</h3><p>{d.description||"Review deck"}</p><div className="deck-meta"><span><FileText/> {d.questions} Q</span><span><Layers3/> {d.flashcards} FC</span></div><div className="progress-track"><i style={{width:"0%"}}/></div><div className="deck-percent">0%</div><button className="secondary-btn" onClick={()=>setPage("drill")}><Play size={17}/> Study Now</button>
    </div>)}</div>
  </div>
}

function MockBoard({category,setCategory,mockScores,setMockScores,setSessions}) {
  const selected=CATEGORIES.find(c=>c.id===category)||CATEGORIES[0];
  const [count,setCount]=useState(150); const [shuffle,setShuffle]=useState(true); const [explain,setExplain]=useState(false);
  const start=()=> {
    const score=Math.round(60+Math.random()*28);
    setMockScores(s=>[...s,score].slice(-10));
    setSessions(s=>[...s,{type:"mock",cat:category,answered:count,correct:Math.round(count*score/100),minutes:Math.round(count*0.8)}]);
    alert(`Mock exam completed in demo mode. Score: ${score}%`);
  };
  return <div>
    <PageHeader title="Mock Board Exam" subtitle="Simulate actual LET exam conditions — timed, multiple choice, PRC-standard format"/>
    <div className="mock-layout"><div>
      <h3 className="subheading">Select Exam Category</h3><div className="mock-cards">{CATEGORIES.map(c=><button key={c.id} className={"mock-card "+(category===c.id?"chosen":"")} onClick={()=>setCategory(c.id)}>
        <span className="tag">{c.short}</span><h2>{c.title}</h2><p>{c.desc}</p><div><span><FileText/> {c.items} items</span><span>◷ {c.hours}</span></div>
      </button>)}</div>
      <h3 className="subheading">Number of Items</h3><p className="muted">Time limit adjusts proportionally to item count</p><div className="item-options">{[25,50,75,100,150].map(n=><button className={count===n?"selected":""} key={n} onClick={()=>setCount(n)}>{n}</button>)}</div>
      <Toggle label="Shuffle Questions" hint="Randomize question order each attempt" value={shuffle} setValue={setShuffle}/>
      <Toggle label="Show Explanations After" hint="View answer rationale in results" value={explain} setValue={setExplain}/>
    </div><aside className="panel exam-summary"><h2>Exam Summary</h2><dl><dt>Category</dt><dd>{selected.title}</dd><dt>Items</dt><dd>{count} questions</dd><dt>Time limit</dt><dd>{Math.round(count*.8)} minutes</dd></dl><div className="warning"><CircleHelp/> <span><b>PRC Passing Threshold.</b> You need 75% correct to pass each sub-test.</span></div><h4>RECENT SCORES</h4>{mockScores.length?<div className="recent-scores">{mockScores.slice(-5).reverse().map((s,i)=><span key={i}>{s}%</span>)}</div>:<p className="muted">No attempts yet</p>}<button className="primary-btn wide" onClick={start}>Start Exam <ChevronRight/></button></aside></div>
  </div>
}

function Toggle({label,hint,value,setValue}){return <div className="toggle-row"><div><b>{label}</b><span>{hint}</span></div><button className={"switch "+(value?"on":"")} onClick={()=>setValue(!value)}><i/></button></div>}

function Schedule({sessions,setShowSessionModal}) {
  const [month,setMonth]=useState(new Date(2026,7,1)); const year=month.getFullYear(), mon=month.getMonth(); const days=new Date(year,mon+1,0).getDate(); const start=new Date(year,mon,1).getDay(); const cells=[...Array(start),...Array.from({length:days},(_,i)=>i+1)];
  const today=16;
  return <div><PageHeader title="Study Schedule" subtitle="Plot and track your review sessions, mock exams, and daily drills" action={<button className="primary-btn" onClick={()=>setShowSessionModal(true)}><Plus/> Add Event</button>}/>
    <div className="schedule-stats"><div><b>{sessions.length}</b><span>Total Events</span></div><div><b>{sessions.filter(s=>s.completed).length}</b><span>Completed</span></div><div><b>{sessions.filter(s=>s.type==="study").length}</b><span>Study Sessions</span></div><div><b>{sessions.filter(s=>s.type==="mock").length}</b><span>Mock Exams</span></div></div>
    <div className="calendar-layout"><section className="panel calendar"><div className="calendar-head"><h2>{month.toLocaleString("en-US",{month:"long"})} {year}</h2><div><button onClick={()=>setMonth(new Date(year,mon-1,1))}><ChevronLeft/></button><button onClick={()=>setMonth(new Date(year,mon+1,1))}><ChevronRight/></button></div></div><div className="weekday">{["SUN","MON","TUE","WED","THU","FRI","SAT"].map(x=><b key={x}>{x}</b>)}</div><div className="calendar-grid">{cells.map((d,i)=><div className={"day "+(d===today&&mon===7&&year===2026?"today":"")} key={i}>{d&&<><span>{d}</span>{sessions.filter(s=>new Date(s.date).getDate()===d&&new Date(s.date).getMonth()===mon).map((s,j)=><i className={s.type} key={j}>{s.title}</i>)}</>}</div>)}</div></section>
      <aside className="panel event-side"><h4>EVENT TYPES</h4><p><i className="dot study"/>Study Session</p><p><i className="dot mock"/>Mock Exam</p><p><i className="dot drill"/>Daily Drill</p><hr/><h4>UPCOMING THIS MONTH</h4>{sessions.length?sessions.slice(0,5).map(s=><div className="upcoming" key={s.id}><b>{s.title}</b><span>{s.date}</span></div>):<div className="empty"><CalendarDays/><span>Select a day to add events</span></div>}</aside></div>
  </div>
}

function DrillModal({drill,answerDrill,nextDrill,close}) {
  const q=drill.pool[drill.index]; const pct=(drill.index/drill.pool.length)*100;
  return <div className="modal-backdrop"><div className="drill-modal"><div className="modal-head"><span>Daily Drill · {drill.index+1}/{drill.pool.length}</span><button onClick={close}><X/></button></div><div className="progress-track"><i style={{width:`${pct}%`}}/></div><div className="question"><span className="question-label">QUESTION {drill.index+1}</span><h2>{q.q}</h2><div className="options">{q.options.map((o,i)=><button key={i} className={(drill.checked&&i===q.answer?"correct":"")+(drill.checked&&i===drill.selected&&i!==q.answer?" wrong":"")} disabled={drill.checked} onClick={()=>answerDrill(i)}><span>{String.fromCharCode(65+i)}</span>{o}</button>)}</div>{drill.checked&&<div className={"explanation "+(drill.selected===q.answer?"good":"bad")}><b>{drill.selected===q.answer?"Correct!":"Not quite."}</b><p>{q.explanation}</p></div>}<div className="modal-foot">{drill.checked?<button className="primary-btn" onClick={nextDrill}>{drill.index===drill.pool.length-1?"Finish Drill":"Next Question"} <ChevronRight/></button>:<span>Select an answer to continue.</span>}</div></div></div></div>
}

function DeckModal({close,save}) {
  const [name,setName]=useState(""); const [description,setDescription]=useState(""); const [category,setCategory]=useState("gened");
  return <div className="modal-backdrop"><div className="small-modal"><div className="modal-head"><h2>Create Study Deck</h2><button onClick={close}><X/></button></div><label>Deck name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. General Science"/></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORIES.slice(0,3).map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What will you review?"/></label><button className="primary-btn wide" disabled={!name.trim()} onClick={()=>save({name,description,category})}>Create Deck</button></div></div>
}
function SessionModal({close,save}) {
  const [title,setTitle]=useState("Study Session"); const [date,setDate]=useState("2026-08-16"); const [type,setType]=useState("study");
  return <div className="modal-backdrop"><div className="small-modal"><div className="modal-head"><h2>Add Schedule Event</h2><button onClick={close}><X/></button></div><label>Title<input value={title} onChange={e=>setTitle(e.target.value)}/></label><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Event type<select value={type} onChange={e=>setType(e.target.value)}><option value="study">Study Session</option><option value="mock">Mock Exam</option><option value="drill">Daily Drill</option></select></label><button className="primary-btn wide" onClick={()=>save({title,date,type,completed:false})}>Add Event</button></div></div>
}

export default App;