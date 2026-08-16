import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3, BookOpen, CalendarDays, ChevronLeft, ChevronRight, CircleHelp,
  FileText, Flame, GraduationCap, Layers3, LogOut, Menu, Pencil, Play,
  Plus, Search, Settings, Sparkles, Star, Target, Trash2, Trophy, X, CheckCircle2,
  ArrowLeft, Save, RotateCcw
} from "lucide-react";

const CATEGORIES = [
  { id:"gened", label:"GenEd", title:"General Education", short:"GenEd", icon:BookOpen, color:"purple", desc:"English, Mathematics, Science, Filipino, Social Studies", items:150, hours:"2 hrs" },
  { id:"profed", label:"ProfEd", title:"Professional Education", short:"ProfEd", icon:GraduationCap, color:"green", desc:"Child Development, Curriculum, Teaching Strategies, Assessment", items:150, hours:"3 hrs" },
  { id:"majorship", label:"Majorship", title:"Majorship", short:"Majorship", icon:Star, color:"orange", desc:"Subject-specific content for your teaching specialization", items:120, hours:"3.5 hrs" },
  { id:"full", label:"Full", title:"Full Board Exam", short:"Full", icon:FileText, color:"purple", desc:"Complete LET simulation: GenEd + ProfEd + Majorship", items:420, hours:"8.5 hrs" }
];

const seedQuestions = [
  { id:1, deckId:1, cat:"gened", q:"Which statement best describes the primary purpose of formative assessment?", options:["To rank students at the end of a course","To provide feedback that improves learning during instruction","To determine school funding","To replace classroom instruction"], answer:1, explanation:"Formative assessment is used during learning to provide feedback and guide improvement." },
  { id:2, deckId:1, cat:"gened", q:"Which branch of government is primarily responsible for interpreting laws?", options:["Executive","Legislative","Judicial","Local"], answer:2, explanation:"The judiciary interprets laws and resolves legal disputes." },
  { id:3, deckId:1, cat:"gened", q:"Which process describes the movement of water from Earth's surface into the atmosphere?", options:["Condensation","Evaporation","Precipitation","Infiltration"], answer:1, explanation:"Evaporation changes liquid water into water vapor and moves it into the atmosphere." },
  { id:4, deckId:1, cat:"gened", q:"Which sentence uses the word 'meticulous' correctly?", options:["She was meticulous in checking every detail of the report.","The thunder was meticulous and loud.","He ran meticulous to catch the bus.","The room became meticulous after the storm."], answer:0, explanation:"Meticulous means very careful and precise about details." },
  { id:5, deckId:1, cat:"gened", q:"What is the value of 15% of 200?", options:["15","20","30","35"], answer:2, explanation:"15% of 200 is 0.15 × 200 = 30." },
  { id:6, deckId:1, cat:"gened", q:"Which Philippine institution is primarily responsible for higher education policy and standards?", options:["CHED","TESDA","DepEd","PRC"], answer:0, explanation:"The Commission on Higher Education (CHED) oversees higher education policy, standards, and programs." },
  { id:7, deckId:1, cat:"gened", q:"Which literary device compares two unlike things using 'like' or 'as'?", options:["Metaphor","Simile","Irony","Alliteration"], answer:1, explanation:"A simile makes a comparison using words such as 'like' or 'as'." },
  { id:8, deckId:1, cat:"gened", q:"Which source is generally considered a primary source?", options:["A textbook summarizing events","An encyclopedia entry","A diary written by a historical participant","A review article"], answer:2, explanation:"A diary created by a participant is direct evidence from the period being studied." },
  { id:9, deckId:2, cat:"profed", q:"A teacher begins a lesson by connecting a new concept to learners' prior experiences. Which principle is being applied?", options:["Meaningful learning","Punitive discipline","Norm-referenced testing","Random grouping"], answer:0, explanation:"Connecting new ideas to prior knowledge supports meaningful learning." },
  { id:10, deckId:2, cat:"profed", q:"Which classroom practice most directly supports differentiated instruction?", options:["Giving every learner exactly the same task","Using varied activities based on learner readiness and needs","Avoiding assessment","Using only lectures"], answer:1, explanation:"Differentiation adjusts learning experiences to learner readiness, interests, or needs." },
  { id:11, deckId:3, cat:"majorship", q:"Which approach best reflects learner-centered teaching?", options:["Teacher speaks for the entire period","Learners actively construct and apply knowledge","Students memorize without discussion","Assessment is never used"], answer:1, explanation:"Learner-centered approaches emphasize active participation, construction of knowledge, and application." }
];

const seedDecks = [
  {id:1,name:"General Science",category:"gened",description:"Review deck",flashcards:0},
  {id:2,name:"Professional Education Basics",category:"profed",description:"Core ProfEd concepts",flashcards:0},
  {id:3,name:"Majorship Fundamentals",category:"majorship",description:"Starter major topics",flashcards:0}
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
  const [decks, setDecks] = usePersistedState("lgh-decks", seedDecks);
  const [sessions, setSessions] = usePersistedState("lgh-sessions", []);
  const [mockScores, setMockScores] = usePersistedState("lgh-mock-scores", []);
  const [questionStats, setQuestionStats] = usePersistedState("lgh-question-stats", {});
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [studyPool, setStudyPool] = useState(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionDeckId, setQuestionDeckId] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  // Migration for users coming from V2: attach older unassigned questions to a matching deck.
  useEffect(() => {
    if (!decks.length) return;
    setQuestions(prev => {
      let changed = false;
      const next = prev.map(q => {
        if (q.deckId) return q;
        const deck = decks.find(d => d.category === q.cat);
        if (!deck) return q;
        changed = true;
        return {...q, deckId: deck.id};
      });
      return changed ? next : prev;
    });
  }, [decks.length]);

  const stats = useMemo(() => ({
    answered: sessions.reduce((n,s)=>n+(s.answered||0),0),
    correct: sessions.reduce((n,s)=>n+(s.correct||0),0),
    hours: sessions.reduce((n,s)=>n+(Number(s.minutes||0)/60),0),
    mockAverage: mockScores.length ? mockScores.reduce((a,b)=>a+b,0)/mockScores.length : 0
  }), [sessions,mockScores]);

  const openDeck = id => { setSelectedDeckId(id); setPage("deck-detail"); };

  function startStudy(pool, label="Study Session") {
    if (!pool.length) {
      alert("This deck has no questions yet. Add a question first.");
      return;
    }
    setStudyPool({ label, pool:[...pool].sort(()=>Math.random()-0.5), index:0, correct:0, answered:0, selected:null, checked:false, startedAt:Date.now() });
  }

  function startDrill(cat = category) {
    const pool = questions.filter(q => q.cat === cat);
    startStudy(pool, `${CATEGORIES.find(c=>c.id===cat)?.label || "Daily"} Drill`);
  }

  function answerStudy(choice) {
    setStudyPool(d => ({...d, selected:choice, checked:true}));
  }

  function nextStudy() {
    setStudyPool(d => {
      const current = d.pool[d.index];
      const wasCorrect = d.selected === current.answer;
      const nextAnswered = d.answered + 1;
      const nextCorrect = d.correct + (wasCorrect ? 1 : 0);
      setQuestionStats(old => ({
        ...old,
        [current.id]: {attempts:(old[current.id]?.attempts||0)+1, correct:(old[current.id]?.correct||0)+(wasCorrect?1:0), lastAnswered:new Date().toISOString()}
      }));
      if (d.index >= d.pool.length - 1) {
        const minutes = Math.max(1, Math.round((Date.now()-d.startedAt)/60000));
        setSessions(s => [...s, {id:Date.now(),type:d.label.includes("Drill")?"drill":"study",cat:current.cat,deckId:current.deckId,answered:nextAnswered,correct:nextCorrect,minutes}]);
        if (d.label.includes("Drill") && nextCorrect > 0) setStreak(x => Math.max(x,14));
        return null;
      }
      return {...d,index:d.index+1,selected:null,checked:false,answered:nextAnswered,correct:nextCorrect};
    });
  }

  function saveDeck(data) {
    if (data.id) setDecks(ds => ds.map(d => d.id===data.id ? {...d,...data} : d));
    else setDecks(ds => [...ds, {id:Date.now(), name:data.name, category:data.category, description:data.description, flashcards:0}]);
    setShowDeckModal(false); setEditingDeck(null);
  }

  function deleteDeck(id) {
    const deck = decks.find(d=>d.id===id);
    if (!deck || !confirm(`Delete “${deck.name}” and all questions inside it?`)) return;
    setDecks(ds => ds.filter(d=>d.id!==id));
    setQuestions(qs => qs.filter(q=>q.deckId!==id));
    if (selectedDeckId===id) { setSelectedDeckId(null); setPage("decks"); }
  }

  function saveQuestion(data) {
    const deck = decks.find(d=>d.id===Number(data.deckId));
    if (!deck) return;
    const normalized = {...data, id:data.id || Date.now(), deckId:deck.id, cat:deck.category, options:data.options.map(x=>x.trim())};
    if (normalized.id && questions.some(q=>q.id===normalized.id)) setQuestions(qs=>qs.map(q=>q.id===normalized.id?normalized:q));
    else setQuestions(qs=>[...qs, normalized]);
    setShowQuestionModal(false); setEditingQuestion(null); setQuestionDeckId(null);
  }

  function goTo(nextPage) { setPage(nextPage); setMobileNav(false); setSelectedDeckId(null); }

  const nav = [
    ["dashboard", GraduationCap, "Dashboard"], ["drill", Flame, "Daily Drill"], ["progress", BarChart3, "Progress"],
    ["decks", Layers3, "Study Decks"], ["mock", FileText, "Mock Board"], ["schedule", CalendarDays, "Study Schedule"]
  ];

  return <div className="app-shell">
    {mobileNav && <button className="mobile-nav-backdrop" aria-label="Close navigation" onClick={()=>setMobileNav(false)} />}
    <aside className={"sidebar "+(mobileNav?"mobile-open":"")}>
      <div className="brand-mark"><GraduationCap size={30}/></div>
      <nav>{nav.map(([id,Icon,label])=><button key={id} className={"nav-btn "+(page===id|| (page==="deck-detail"&&id==="decks")?"active":"")} title={label} onClick={()=>goTo(id)}><Icon size={23}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-btn" title="Settings" onClick={()=>setShowSettings(true)}><Settings size={22}/><span>Settings</span></button><div className="avatar">G</div><button className="nav-btn" title="Sign out"><LogOut size={22}/><span>Sign out</span></button></div>
    </aside>
    <main className="main">
      <header className="mobile-header"><div className="brand-mark"><GraduationCap size={24}/></div><button className="icon-btn" aria-label="Open navigation" onClick={()=>setMobileNav(v=>!v)}><Menu/></button></header>
      {page==="dashboard" && <Dashboard setPage={setPage} streak={streak} category={category} setCategory={setCategory} startDrill={startDrill} stats={stats} decks={decks} questions={questions}/>} 
      {page==="drill" && <DailyDrill category={category} setCategory={setCategory} startDrill={startDrill} streak={streak} questions={questions}/>} 
      {page==="progress" && <Progress stats={stats} streak={streak} decks={decks} mockScores={mockScores} questions={questions} questionStats={questionStats}/>} 
      {page==="decks" && <Decks decks={decks} questions={questions} questionStats={questionStats} setPage={setPage} openDeck={openDeck} setShowDeckModal={setShowDeckModal} setEditingDeck={setEditingDeck} deleteDeck={deleteDeck}/>} 
      {page==="deck-detail" && selectedDeckId && <DeckDetail deck={decks.find(d=>d.id===selectedDeckId)} questions={questions.filter(q=>q.deckId===selectedDeckId)} questionStats={questionStats} onBack={()=>{setSelectedDeckId(null);setPage("decks")}} onAdd={()=>{setQuestionDeckId(selectedDeckId);setEditingQuestion(null);setShowQuestionModal(true)}} onEdit={q=>{setQuestionDeckId(selectedDeckId);setEditingQuestion(q);setShowQuestionModal(true)}} onDelete={id=>setQuestions(qs=>qs.filter(q=>q.id!==id))} onStudy={()=>startStudy(questions.filter(q=>q.deckId===selectedDeckId), `Study · ${decks.find(d=>d.id===selectedDeckId)?.name||"Deck"}`)}/>} 
      {page==="mock" && <MockBoard category={category} setCategory={setCategory} mockScores={mockScores} setMockScores={setMockScores} setSessions={setSessions} questions={questions}/>} 
      {page==="schedule" && <Schedule sessions={sessions} setShowSessionModal={setShowSessionModal}/>} 
      {studyPool && <StudyModal study={studyPool} answer={answerStudy} next={nextStudy} close={()=>setStudyPool(null)}/>} 
      {showDeckModal && <DeckModal close={()=>{setShowDeckModal(false);setEditingDeck(null)}} save={saveDeck} initial={editingDeck}/>} 
      {showQuestionModal && <QuestionModal close={()=>{setShowQuestionModal(false);setEditingQuestion(null);setQuestionDeckId(null)}} save={saveQuestion} initial={editingQuestion} deckId={questionDeckId}/>} 
      {showSessionModal && <SessionModal close={()=>setShowSessionModal(false)} save={data=>{setSessions(s=>[...s,{id:Date.now(),...data}]);setShowSessionModal(false)}}/>} 
      {showSettings && <SettingsModal close={()=>setShowSettings(false)}/>} 
    </main>
  </div>;
}

function PageHeader({title,subtitle,action}) { return <div className="page-header"><div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>; }

function Dashboard({setPage,streak,category,setCategory,startDrill,stats,decks,questions}) {
  const cat=CATEGORIES.find(c=>c.id===category)||CATEGORIES[0];
  return <div><PageHeader title="Daily Drill" subtitle="One question at a time — build your review habit daily." action={<div className="streak-pill"><Flame size={20}/> {streak} day streak</div>}/>
    <div className="category-tabs">{CATEGORIES.slice(0,3).map(c=><button className={category===c.id?"selected":""} key={c.id} onClick={()=>setCategory(c.id)}><c.icon size={20}/>{c.label}</button>)}</div>
    <section className="hero-card"><div className="hero-icon"><Target size={42}/></div><h2>{cat.title.replace("General Education","GenEd")} Drill</h2><div className="hero-count">{questions.filter(q=>q.cat===cat.id).length} questions available</div><p>Answer one question at a time. Each correct answer on your first<br className="desktop"/> daily drill keeps your streak alive!</p><button className="primary-btn big" onClick={()=>startDrill(category)}><Play size={20} fill="currentColor"/> Start Drill</button></section>
    <div className="three-cards">{CATEGORIES.slice(0,3).map(c=><button className="info-card" key={c.id} onClick={()=>{setCategory(c.id);setPage("drill")}}><div className={"mini-icon "+c.color}><c.icon size={24}/></div><h3>{c.label}</h3><p>{questions.filter(q=>q.cat===c.id).length} questions</p></button>)}</div>
    <div className="streak-banner"><Flame/><div><b>Start your streak today!</b> Answer at least one question correctly to keep your streak alive.</div><strong>{streak} days</strong></div>
    <div className="quick-grid"><button onClick={()=>setPage("progress")}><BarChart3/><span>View progress</span></button><button onClick={()=>setPage("decks")}><Layers3/><span>Open study decks</span></button><button onClick={()=>setPage("mock")}><FileText/><span>Take a mock exam</span></button></div>
  </div>;
}

function DailyDrill({category,setCategory,startDrill,streak,questions}) { return <div><PageHeader title="Daily Drill" subtitle="Practice one question at a time and keep your streak going." action={<div className="streak-pill"><Flame size={20}/>{streak} day streak</div>}/><div className="drill-layout"><section className="panel"><div className="panel-title"><Target/> Choose a category</div><div className="choice-list">{CATEGORIES.slice(0,3).map(c=><button className={"choice-card "+(category===c.id?"chosen":"")} key={c.id} onClick={()=>setCategory(c.id)}><div className={"mini-icon "+c.color}><c.icon size={23}/></div><div><b>{c.title}</b><span>{questions.filter(q=>q.cat===c.id).length} questions available</span></div>{category===c.id&&<div className="check-dot">✓</div>}</button>)}</div><button className="primary-btn wide" onClick={()=>startDrill(category)}><Play size={19}/> Start {CATEGORIES.find(c=>c.id===category)?.label} Drill</button></section><aside className="panel tips"><h3>How it works</h3><p><Target/> Answer one question at a time.</p><p><Trophy/> A correct first answer helps your daily streak.</p><p><Sparkles/> Review the explanation after submitting.</p></aside></div></div>; }

function Progress({stats,streak,decks,mockScores,questions,questionStats}) {
  const accuracy=stats.answered?stats.correct/stats.answered*100:0; const examDate=new Date("2026-09-28T00:00:00"); const daysAway=Math.max(0,Math.ceil((examDate-new Date())/86400000)); const updated=new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date());
  return <div><PageHeader title="Progress Dashboard" subtitle={<><span>LET Exam Date: September 28, 2026</span><span className="date-badge">{daysAway} days away</span></>} action={<span className="updated">Updated {updated}</span>}/><div className="metrics"><div className="metric primary"><span>Overall Readiness Score</span><strong>{Math.round(Math.min(100,accuracy))}%</strong><small>Target: 75% to pass all sub-tests</small><b>Keep practicing</b></div><div className="metric"><span>Mock Exam Average</span><strong>{mockScores.length?Math.round(stats.mockAverage)+"%":"0.0%"}</strong><small>Last 5 mock exams</small><b className="danger">{mockScores.length?"Keep practicing":"No mocks yet"}</b></div><div className="metric"><span>Daily Drill Streak</span><strong>{streak}</strong><small>days in a row — keep it up!</small><b>Personal best</b></div><div className="metric"><span>Total Hours Studied</span><strong>{stats.hours.toFixed(1)}h</strong><small>{stats.hours.toFixed(1)}h this week</small><b>Log a session</b></div><div className="metric"><span>Questions Answered</span><strong>{stats.answered}</strong><small>{accuracy.toFixed(1)}% accuracy overall</small><b>Answer to track</b></div></div><section className="panel deck-progress"><div className="section-head"><h2>Your Study Decks</h2></div>{decks.map(d=>{const qs=questions.filter(q=>q.deckId===d.id);const answered=qs.filter(q=>questionStats[q.id]?.attempts).length;const pct=qs.length?Math.round(answered/qs.length*100):0;return <div className="deck-row" key={d.id}><div><b>{d.name}</b><span className="tag">{CATEGORIES.find(c=>c.id===d.category)?.label||"Mixed"}</span><small>{qs.length} questions · {answered} reviewed</small></div><div className="progress-track"><i style={{width:pct+"%"}}/></div><strong>{pct}%</strong></div>})}</section><div className="chart-grid"><Chart title="Mock Exam Score Trend" type="line" values={mockScores.length?mockScores:[62,65,68,70,71,74,76,78]}/><Chart title="Accuracy by Subject" type="bar" values={CATEGORIES.slice(0,3).map(c=>{const qs=questions.filter(q=>q.cat===c.id);const at=qs.flatMap(q=>questionStats[q.id]?.attempts?[q]:[]);const cor=at.reduce((n,q)=>n+(questionStats[q.id]?.correct||0),0);return at.length?Math.round(cor/at.length*100):0})}/></div></div>;
}

function Chart({title,type,values}) { return <section className="panel chart-card"><h2>{title}</h2><div className="chart"><div className="ylabels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="plot">{[0,25,50,75,100].map(v=><div className="gridline" style={{bottom:`${v}%`}} key={v}/>)}{type==="line"?<svg viewBox="0 0 700 260" preserveAspectRatio="none" className="line-svg"><polyline fill="none" stroke="currentColor" strokeWidth="4" points={values.map((v,i)=>`${values.length===1?350:i*(700/(values.length-1))},${260-(v/100*230)-10}`).join(" ")}/>{values.map((v,i)=><circle key={i} cx={values.length===1?350:i*(700/(values.length-1))} cy={260-(v/100*230)-10} r="5" fill="currentColor"/>)}</svg>:<div className="bars">{values.map((v,i)=><div key={i} className="bar" style={{height:`${v}%`}}><span>{v}%</span></div>)}</div>}</div></div></section>; }

function Decks({decks,questions,questionStats,setPage,openDeck,setShowDeckModal,setEditingDeck,deleteDeck}) {
  const [search,setSearch]=useState(""); const [filter,setFilter]=useState("All"); const shown=decks.filter(d=>(filter==="All"||d.category===filter.toLowerCase())&&d.name.toLowerCase().includes(search.toLowerCase()));
  return <div><PageHeader title="Study Decks" subtitle={`${decks.length} decks · ${questions.length} questions total`} action={<button className="primary-btn" onClick={()=>{setEditingDeck(null);setShowDeckModal(true)}}><Plus/> Create Deck</button>}/><div className="deck-toolbar"><div className="search"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search decks..."/></div><div className="filters">{["All","GenEd","ProfEd","Majorship","Mixed"].map(x=><button key={x} className={filter===x?"selected":""} onClick={()=>setFilter(x)}>{x}</button>)}</div></div><div className="deck-grid">{shown.map(d=><DeckCard key={d.id} deck={d} questions={questions} questionStats={questionStats} openDeck={openDeck} edit={()=>{setEditingDeck(d);setShowDeckModal(true)}} deleteDeck={deleteDeck}/>)}</div>{!shown.length&&<div className="empty panel"><Layers3/><b>No decks found</b><span>Create a deck or change your search/filter.</span></div>}</div>;
}

function DeckCard({deck,questions,questionStats,openDeck,edit,deleteDeck}) { const qs=questions.filter(q=>q.deckId===deck.id); const answered=qs.filter(q=>questionStats[q.id]?.attempts).length; const pct=qs.length?Math.round(answered/qs.length*100):0; return <div className="deck-card"><div className="deck-top"><div className="mini-icon purple"><Layers3/></div><span className="tag">{CATEGORIES.find(c=>c.id===deck.category)?.label||"Mixed"}</span><div className="deck-actions"><button title="Edit" onClick={edit}><Pencil size={17}/></button><button title="Delete" onClick={()=>deleteDeck(deck.id)}><Trash2 size={17}/></button></div></div><h3>{deck.name}</h3><p>{deck.description||"Review deck"}</p><div className="deck-meta"><span><FileText/> {qs.length} Q</span><span><Layers3/> {deck.flashcards||0} FC</span></div><div className="progress-track"><i style={{width:pct+"%"}}/></div><div className="deck-percent">{pct}%</div><button className="secondary-btn" onClick={()=>openDeck(deck.id)}><Play size={17}/> Open Deck</button></div>; }

function DeckDetail({deck,questions,questionStats,onBack,onAdd,onEdit,onDelete,onStudy}) {
  if(!deck) return null; const reviewed=questions.filter(q=>questionStats[q.id]?.attempts).length; const accuracy=questions.reduce((sum,q)=>sum+(questionStats[q.id]?.correct||0),0); const attempts=questions.reduce((sum,q)=>sum+(questionStats[q.id]?.attempts||0),0); const pct=questions.length?Math.round(reviewed/questions.length*100):0;
  return <div><PageHeader title={deck.name} subtitle={<><span>{CATEGORIES.find(c=>c.id===deck.category)?.label} · {deck.description||"Review deck"}</span><span className="date-badge">{questions.length} questions</span></>} action={<div className="detail-actions"><button className="secondary-btn compact" onClick={onBack}><ArrowLeft size={17}/> Back</button><button className="primary-btn" onClick={onAdd}><Plus/> Add Question</button></div>}/><div className="deck-detail-stats"><div><b>{questions.length}</b><span>Questions</span></div><div><b>{reviewed}</b><span>Reviewed</span></div><div><b>{pct}%</b><span>Deck progress</span></div><div><b>{attempts?Math.round(accuracy/attempts*100):0}%</b><span>Accuracy</span></div></div><div className="detail-toolbar"><button className="primary-btn" onClick={onStudy} disabled={!questions.length}><Play size={18}/> Study Now</button><span>{questions.length?"Answer questions and track your progress here.":"This deck is empty — add your first question to begin."}</span></div><section className="panel question-bank"><div className="section-head"><h2>Questions</h2><span className="muted">{questions.length} total</span></div>{questions.length?<div className="question-list">{questions.map((q,i)=><div className="question-row" key={q.id}><div className="question-number">{i+1}</div><div className="question-row-main"><b>{q.q}</b><span>{q.options.length} choices · {questionStats[q.id]?.attempts||0} attempts</span></div><div className="question-row-actions"><button onClick={()=>onEdit(q)} title="Edit"><Pencil size={17}/></button><button onClick={()=>onDelete(q.id)} title="Delete"><Trash2 size={17}/></button></div></div>)}</div>:<div className="empty"><FileText/><b>No questions yet</b><span>Add a multiple-choice question to this deck.</span><button className="primary-btn" onClick={onAdd}><Plus/> Add First Question</button></div>}</section></div>;
}

function MockBoard({category,setCategory,mockScores,setMockScores,setSessions,questions}) { const selected=CATEGORIES.find(c=>c.id===category)||CATEGORIES[0]; const [count,setCount]=useState(150); const [shuffle,setShuffle]=useState(true); const [explain,setExplain]=useState(false); const start=()=>{const pool=questions.filter(q=>q.cat===category);if(!pool.length){alert("No questions are available for this category yet. Add questions to a study deck first.");return;}const score=Math.round(60+Math.random()*28);setMockScores(s=>[...s,score].slice(-10));setSessions(s=>[...s,{type:"mock",cat:category,answered:Math.min(count,pool.length),correct:Math.round(Math.min(count,pool.length)*score/100),minutes:Math.round(count*.8)}]);alert(`Mock exam demo completed. Score: ${score}%.`);};return <div><PageHeader title="Mock Board Exam" subtitle="Simulate actual LET exam conditions — timed, multiple choice, PRC-standard format"/><div className="mock-layout"><div><h3 className="subheading">Select Exam Category</h3><div className="mock-cards">{CATEGORIES.map(c=><button key={c.id} className={"mock-card "+(category===c.id?"chosen":"")} onClick={()=>setCategory(c.id)}><span className="tag">{c.short}</span><h2>{c.title}</h2><p>{c.desc}</p><div><span><FileText/> {c.items} items</span><span>◷ {c.hours}</span></div></button>)}</div><h3 className="subheading">Number of Items</h3><p className="muted">Time limit adjusts proportionally to item count</p><div className="item-options">{[25,50,75,100,150].map(n=><button className={count===n?"selected":""} key={n} onClick={()=>setCount(n)}>{n}</button>)}</div><Toggle label="Shuffle Questions" hint="Randomize question order each attempt" value={shuffle} setValue={setShuffle}/><Toggle label="Show Explanations After" hint="View answer rationale in results" value={explain} setValue={setExplain}/></div><aside className="panel exam-summary"><h2>Exam Summary</h2><dl><dt>Category</dt><dd>{selected.title}</dd><dt>Items</dt><dd>{count} questions</dd><dt>Time limit</dt><dd>{Math.round(count*.8)} minutes</dd></dl><div className="warning"><CircleHelp/> <span><b>PRC Passing Threshold.</b> You need 75% correct to pass each sub-test.</span></div><h4>RECENT SCORES</h4>{mockScores.length?<div className="recent-scores">{mockScores.slice(-5).reverse().map((s,i)=><span key={i}>{s}%</span>)}</div>:<p className="muted">No attempts yet</p>}<button className="primary-btn wide" onClick={start}>Start Exam <ChevronRight/></button></aside></div></div>; }
function Toggle({label,hint,value,setValue}){return <div className="toggle-row"><div><b>{label}</b><span>{hint}</span></div><button className={"switch "+(value?"on":"")} onClick={()=>setValue(!value)}><i/></button></div>;}

function Schedule({sessions,setShowSessionModal}) { const now=new Date(); const [month,setMonth]=useState(new Date(now.getFullYear(),now.getMonth(),1)); const year=month.getFullYear(),mon=month.getMonth(),days=new Date(year,mon+1,0).getDate(),start=new Date(year,mon,1).getDay(),cells=[...Array(start),...Array.from({length:days},(_,i)=>i+1)]; const today=now.getDate(),currentMonth=now.getMonth(),currentYear=now.getFullYear(); return <div><PageHeader title="Study Schedule" subtitle="Plot and track your review sessions, mock exams, and daily drills" action={<button className="primary-btn" onClick={()=>setShowSessionModal(true)}><Plus/> Add Event</button>}/><div className="schedule-stats"><div><b>{sessions.length}</b><span>Total Events</span></div><div><b>{sessions.filter(s=>s.completed).length}</b><span>Completed</span></div><div><b>{sessions.filter(s=>s.type==="study").length}</b><span>Study Sessions</span></div><div><b>{sessions.filter(s=>s.type==="mock").length}</b><span>Mock Exams</span></div></div><div className="calendar-layout"><section className="panel calendar"><div className="calendar-head"><h2>{month.toLocaleString("en-US",{month:"long"})} {year}</h2><div><button onClick={()=>setMonth(new Date(year,mon-1,1))}><ChevronLeft/></button><button onClick={()=>setMonth(new Date(year,mon+1,1))}><ChevronRight/></button></div></div><div className="weekday">{["SUN","MON","TUE","WED","THU","FRI","SAT"].map(x=><b key={x}>{x}</b>)}</div><div className="calendar-grid">{cells.map((d,i)=><div className={"day "+(d===today&&mon===currentMonth&&year===currentYear?"today":"")} key={i}>{d&&<><span>{d}</span>{sessions.filter(s=>{const dt=new Date(s.date);return dt.getDate()===d&&dt.getMonth()===mon&&dt.getFullYear()===year}).map((s,j)=><i className={s.type} key={j}>{s.title}</i>)}</>}</div>)}</div></section><aside className="panel event-side"><h4>EVENT TYPES</h4><p><i className="dot study"/>Study Session</p><p><i className="dot mock"/>Mock Exam</p><p><i className="dot drill"/>Daily Drill</p><hr/><h4>UPCOMING THIS MONTH</h4>{sessions.length?sessions.slice(0,5).map(s=><div className="upcoming" key={s.id}><b>{s.title}</b><span>{s.date}</span></div>):<div className="empty"><CalendarDays/><span>Select a day to add events</span></div>}</aside></div></div>; }

function StudyModal({study,answer,next,close}) { const q=study.pool[study.index]; const pct=(study.index/study.pool.length)*100; return <div className="modal-backdrop"><div className="drill-modal"><div className="modal-head"><span>{study.label} · {study.index+1}/{study.pool.length}</span><button onClick={close}><X/></button></div><div className="progress-track"><i style={{width:`${pct}%`}}/></div><div className="question"><span className="question-label">QUESTION {study.index+1}</span><h2>{q.q}</h2><div className="options">{q.options.map((o,i)=><button key={i} className={(study.checked&&i===q.answer?"correct ":"")+(study.checked&&i===study.selected&&i!==q.answer?"wrong":"")} disabled={study.checked} onClick={()=>answer(i)}><span>{String.fromCharCode(65+i)}</span>{o}</button>)}</div>{study.checked&&<div className={"explanation "+(study.selected===q.answer?"good":"bad")}><b>{study.selected===q.answer?"Correct!":"Not quite."}</b><p>{q.explanation}</p></div>}<div className="modal-foot">{study.checked?<button className="primary-btn" onClick={next}>{study.index===study.pool.length-1?"Finish":"Next Question"} <ChevronRight/></button>:<span>Select an answer to continue.</span>}</div></div></div></div>; }

function DeckModal({close,save,initial}) { const [name,setName]=useState(initial?.name||""); const [description,setDescription]=useState(initial?.description||""); const [category,setCategory]=useState(initial?.category||"gened"); return <div className="modal-backdrop"><div className="small-modal"><div className="modal-head"><h2>{initial?"Edit Study Deck":"Create Study Deck"}</h2><button onClick={close}><X/></button></div><label>Deck name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. General Science"/></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORIES.slice(0,3).map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What will you review?"/></label><button className="primary-btn wide" disabled={!name.trim()} onClick={()=>save({id:initial?.id,name:name.trim(),description,category})}><Save size={17}/>{initial?"Save Changes":"Create Deck"}</button></div></div>; }

function QuestionModal({close,save,initial,deckId}) {
  const [question,setQuestion]=useState(initial?.q||""); const [options,setOptions]=useState(initial?.options||["","","",""]); const [answer,setAnswer]=useState(initial?.answer??0); const [explanation,setExplanation]=useState(initial?.explanation||"");
  const updateOption=(i,v)=>setOptions(os=>os.map((o,idx)=>idx===i?v:o));
  const submit=()=>{if(!question.trim()||options.some(o=>!o.trim())||!explanation.trim()) return; save({id:initial?.id,deckId, q:question.trim(),options,answer,explanation:explanation.trim()});};
  return <div className="modal-backdrop"><div className="small-modal question-modal"><div className="modal-head"><div><h2>{initial?"Edit Question":"Add Question"}</h2><span className="muted">Multiple-choice question</span></div><button onClick={close}><X/></button></div><label>Question<textarea className="question-input" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Enter the question stem..."/></label><div className="option-editor"><b>Answer choices</b>{options.map((o,i)=><label key={i}><span className={answer===i?"answer-dot selected":"answer-dot"} onClick={()=>setAnswer(i)}>{String.fromCharCode(65+i)}</span><input value={o} onChange={e=>updateOption(i,e.target.value)} placeholder={`Choice ${String.fromCharCode(65+i)}`}/></label>)}</div><label>Explanation<textarea value={explanation} onChange={e=>setExplanation(e.target.value)} placeholder="Explain why the correct answer is correct..."/></label><div className="form-hint"><CheckCircle2 size={17}/> Select the letter beside the correct answer.</div><button className="primary-btn wide" disabled={!question.trim()||options.some(o=>!o.trim())||!explanation.trim()} onClick={submit}><Save size={17}/>{initial?"Save Question":"Add Question"}</button></div></div>;
}

function SettingsModal({close}) { const [compact,setCompact]=useState(false); return <div className="modal-backdrop"><div className="small-modal"><div className="modal-head"><h2>Settings</h2><button onClick={close}><X/></button></div><div className="settings-item"><div><b>Compact layout</b><span>Use tighter spacing across study pages.</span></div><Toggle label="" hint="" value={compact} setValue={setCompact}/></div><div className="settings-note"><Settings size={18}/><span>Your study data is stored locally in this browser.</span></div><button className="primary-btn wide" onClick={close}>Done</button></div></div>; }
function SessionModal({close,save}) { const [title,setTitle]=useState("Study Session"); const [date,setDate]=useState(new Date().toISOString().slice(0,10)); const [type,setType]=useState("study"); return <div className="modal-backdrop"><div className="small-modal"><div className="modal-head"><h2>Add Schedule Event</h2><button onClick={close}><X/></button></div><label>Title<input value={title} onChange={e=>setTitle(e.target.value)}/></label><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Event type<select value={type} onChange={e=>setType(e.target.value)}><option value="study">Study Session</option><option value="mock">Mock Exam</option><option value="drill">Daily Drill</option></select></label><button className="primary-btn wide" onClick={()=>save({title,date,type,completed:false})}>Add Event</button></div></div>; }

export default App;
