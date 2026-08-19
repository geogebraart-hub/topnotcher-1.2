import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { expandedQuestionBank, QUESTION_BANK_COUNTS } from "./questionBank";
import {
  BarChart3, BookOpen, LibraryBig, CalendarDays, ChevronLeft, ChevronRight, CircleHelp,
  LayoutDashboard, Library, ClipboardCheck, UserCircle,
  FileText, Flame, GraduationCap, Layers3, LogOut, Menu, Pencil, Play,
  Plus, Search, Settings, Sparkles, Star, Target, Trash2, Trophy, X, CheckCircle2,
  ArrowLeft, Save, RotateCcw, Upload, WandSparkles, Loader2
} from "lucide-react";

export function TopnotcherBrand({ compact = false }) {
  return (
    <div className={`topnotcher-brand ${compact ? "topnotcher-brand-compact" : ""}`} aria-label="TOPNOTCHER! By God's Grace">
      <svg className="topnotcher-medal" viewBox="0 0 48 56" aria-hidden="true">
        <path d="M13 4h8l3 10 3-10h8l-5 18H18L13 4Z" />
        <circle cx="24" cy="34" r="13" />
        <path d="M24 26l2.2 4.6 5.1.7-3.7 3.6.9 5.1-4.5-2.4-4.5 2.4.9-5.1-3.7-3.6 5.1-.7L24 26Z" />
      </svg>
      <div className="topnotcher-wordmark">
        <div className="topnotcher-name">TOPNOTCHER!</div>
        <div className="topnotcher-tagline">By God's Grace</div>
      </div>
    </div>
  );
}

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

const BUILTIN_MOCK_BANK = [...seedQuestions, ...expandedQuestionBank];

function accountStorageKey(authUser, key) {
  const accountId = authUser?.uid || authUser?.email || "guest";
  return `${key}::${accountId}`;
}

function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}


function TopnotcherMedal({size=28}) {
  return (
    <svg className="topnotcher-medal-svg" width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M16 5h6l2 12h-6L16 5Z" />
      <path d="M26 5h6l-2 12h-6l2-12Z" />
      <circle cx="24" cy="28" r="11.5" />
      <circle cx="24" cy="28" r="7.2" />
      <path d="M24 22.8l1.55 3.25 3.58.52-2.59 2.52.61 3.56L24 30.97l-3.15 1.66.6-3.56-2.58-2.52 3.57-.52L24 22.8Z" />
      <path d="M17.2 37.2 13.5 44l10.5-4.3L34.5 44l-3.7-6.8" />
    </svg>
  );
}

function AppSidebar({page, profile, onNavigate, onSettings, onSignOut, mobileOpen=false, studyMode=false}) {
  const nav = [
    ["progress", LayoutDashboard, "Progress Dashboard"],
    ["decks", LibraryBig, "Study Decks"],
    ["dashboard", Flame, "Daily Drill"],
    ["mock", ClipboardCheck, "Mock Board Exam"],
    ["schedule", CalendarDays, "Study Schedule"]
  ];
  return <aside className={"sidebar unified-sidebar "+(mobileOpen?"mobile-open ":"")+(studyMode?"study-app-sidebar":"")}>
    <TopnotcherBrand compact={studyMode} />
    <div className="sidebar-section-label">MAIN MENU</div>
    <nav className="sidebar-nav">
      {nav.map(([id,Icon,label])=><button key={id} className={"nav-btn "+((page===id || (page==="deck-detail"&&id==="decks"))?"active":"")} title={label} onClick={()=>onNavigate(id)}>
        <Icon size={20}/><span>{label}</span>
      </button>)}
    </nav>
    <div className="sidebar-spacer"/>
    <div className="sidebar-bottom">
      <button className="nav-btn" title="Settings" onClick={onSettings}><Settings size={20}/><span>Settings</span></button>
      <button className="profile-nav-btn" title="Profile" onClick={()=>onNavigate("profile")}>
        <span className="avatar avatar-btn">{(profile?.name||"G").trim().charAt(0).toUpperCase()}</span>
        <span className="profile-nav-copy"><strong>{profile?.name||"Profile"}</strong><small>View profile</small></span><ChevronRight size={16}/>
      </button>
      <button className="nav-btn signout-btn" title="Sign out" onClick={()=>{if(confirm("Sign out of TOPNOTCHER!?")) onSignOut?.();}}><LogOut size={20}/><span>Sign out</span></button>
    </div>
  </aside>;
}

function App({ authUser, onSignOut }) {
  const [page, setPage] = useState("progress");
  const [theme, setTheme] = usePersistedState(accountStorageKey(authUser, "lgh-theme"), "light");
  const [profile, setProfile] = usePersistedState(accountStorageKey(authUser, "lgh-profile"), {name:authUser?.displayName||"Genius Learner", email:authUser?.email||"", goal:"Pass the LET", examDate:"2026-09-28", dailyGoal:60});
  useEffect(() => { if (authUser?.email && profile?.email !== authUser.email) setProfile(p => ({...p, email: authUser.email, name: p?.name || authUser.displayName || "Genius Learner"})); }, [authUser?.email]);
  const [category, setCategory] = usePersistedState(accountStorageKey(authUser, "lgh-category"), "gened");
  const [streak, setStreak] = usePersistedState(accountStorageKey(authUser, "lgh-streak"), 0);
  const [lastActiveDate, setLastActiveDate] = usePersistedState(accountStorageKey(authUser, "lgh-last-active-date"), null);
  const [questions, setQuestions] = usePersistedState(accountStorageKey(authUser, "lgh-questions"), seedQuestions);
  const [decks, setDecks] = usePersistedState(accountStorageKey(authUser, "lgh-decks"), seedDecks);
  const [sessions, setSessions] = usePersistedState(accountStorageKey(authUser, "lgh-sessions"), []);
  const [mockScores, setMockScores] = usePersistedState(accountStorageKey(authUser, "lgh-mock-scores"), []);
  const [mockHistory, setMockHistory] = usePersistedState(accountStorageKey(authUser, "lgh-mock-history"), []);
  const [questionStats, setQuestionStats] = usePersistedState(accountStorageKey(authUser, "lgh-question-stats"), {});
  const [flashcards, setFlashcards] = usePersistedState(accountStorageKey(authUser, "lgh-flashcards"), []);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [studyPool, setStudyPool] = useState(null);
  const [flashcardStudyPool, setFlashcardStudyPool] = useState(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiDeckId, setAiDeckId] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionDeckId, setQuestionDeckId] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [examSession, setExamSession] = usePersistedState(accountStorageKey(authUser, "lgh-active-exam"), null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    // Daily login/activity streak: opening the app counts as activity for today.
    // Re-opening on the same day does not increment it; missing one or more days resets it.
    const today = new Date();
    const todayKey = today.toLocaleDateString("en-CA");
    if (lastActiveDate === todayKey) return;
    if (!lastActiveDate) {
      setStreak(1);
    } else {
      const last = new Date(lastActiveDate + "T00:00:00");
      const diffDays = Math.floor((new Date(todayKey + "T00:00:00") - last) / 86400000);
      setStreak(diffDays === 1 ? Math.max(0, streak) + 1 : 1);
    }
    setLastActiveDate(todayKey);
  }, []);

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
    setStudyPool({ label, pool:[...pool].sort(()=>Math.random()-0.5), index:0, correct:0, answered:0, selected:null, checked:false, answers:{}, results:{}, startedAt:Date.now(), finishedRecorded:false });
  }

  function startDrill(cat = category) {
    const pool = questions.filter(q => q.cat === cat);
    startStudy(pool, `${CATEGORIES.find(c=>c.id===cat)?.label || "Daily"} Drill`);
  }

  function answerStudy(choice) {
    setStudyPool(d => {
      if (!d) return d;
      const current = d.pool[d.index];
      // Once a question has been answered in this session, keep that answer
      // and never count it again just because the learner navigates away/back.
      if (d.answers?.[current.id] !== undefined) return d;
      const wasCorrect = choice === current.answer;
      const nextAnswered = d.answered + 1;
      const nextCorrect = d.correct + (wasCorrect ? 1 : 0);
      setQuestionStats(old => ({
        ...old,
        [current.id]: {
          attempts:(old[current.id]?.attempts||0)+1,
          correct:(old[current.id]?.correct||0)+(wasCorrect?1:0),
          lastAnswered:new Date().toISOString()
        }
      }));
      return {
        ...d,
        selected:choice,
        checked:true,
        answered:nextAnswered,
        correct:nextCorrect,
        answers:{...d.answers,[current.id]:choice},
        results:{...d.results,[current.id]:wasCorrect?"correct":"wrong"}
      };
    });
  }

  function nextStudy() {
    setStudyPool(d => {
      if (!d) return d;
      if (d.index >= d.pool.length - 1) {
        if (!d.finishedRecorded) {
          const minutes = Math.max(1, Math.round((Date.now()-d.startedAt)/60000));
          const current = d.pool[d.index];
          const wrongQuestions = d.pool.filter(item => d.results?.[item.id] === "wrong").map(item => ({id:item.id,q:item.q,correct:item.options?.[item.answer] || "",selected:item.options?.[d.answers?.[item.id]] || ""}));
          setSessions(s => [...s, {id:Date.now(),type:d.label.includes("Drill")?"drill":"study",cat:current.cat,deckId:current.deckId,answered:d.answered,correct:d.correct,minutes,percentage:d.pool.length?Math.round(d.correct/d.pool.length*100):0,wrongQuestions,finishedAt:new Date().toISOString()}]);
          if (d.label.includes("Drill") && d.correct > 0) setLastActiveDate(new Date().toLocaleDateString("en-CA"));
          return {...d,finishedRecorded:true,finishedAt:Date.now(),minutes,percentage:d.pool.length?Math.round(d.correct/d.pool.length*100):0,wrongQuestions};
        }
        return d;
      }
      const nextIndex=d.index+1;
      const nextQuestion=d.pool[nextIndex];
      const nextSelected=d.answers?.[nextQuestion.id];
      return {...d,index:nextIndex,selected:nextSelected===undefined?null:nextSelected,checked:nextSelected!==undefined};
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
    setFlashcards(cards => cards.filter(card => card.deckId !== id));
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

  function createFlashcardsForDeck(deckId) {
    const deckQuestions = questions.filter(q => q.deckId === deckId);
    const excludedPattern = /\b(which of the following|which of these|which statement|which option|which choice|what is the best answer|all of the following|except)\b/i;
    const usable = deckQuestions.filter(q => !excludedPattern.test(q.q));
    const existing = new Set(flashcards.filter(f => f.deckId === deckId).map(f => String(f.questionId)));
    const newCards = usable.filter(q => !existing.has(String(q.id))).map(q => ({
      id: Date.now() + Math.random(),
      deckId,
      questionId: q.id,
      front: q.q,
      back: q.options?.[q.answer] || "",
      explanation: q.explanation || ""
    }));
    if (newCards.length) setFlashcards(cards => [...cards, ...newCards]);
    return { created: newCards.length, skipped: deckQuestions.length - usable.length };
  }

  function deleteFlashcard(id) { setFlashcards(cards => cards.filter(card => card.id !== id)); }

  function goTo(nextPage) { setPage(nextPage); setMobileNav(false); setSelectedDeckId(null); }

  function jumpStudy(index) { setStudyPool(d => { if (!d) return d; const item=d.pool[index]; const saved=d.answers?.[item.id]; return {...d,index,selected:saved===undefined?null:saved,checked:saved!==undefined}; }); }

  return <>
    {studyPool && <StudyModal onSignOut={onSignOut} study={studyPool} answer={answerStudy} next={nextStudy} jump={jumpStudy} close={()=>setStudyPool(null)} goTo={goTo} profile={profile} theme={theme}/>}
    {flashcardStudyPool && <FlashcardStudyModal cards={flashcardStudyPool} close={()=>setFlashcardStudyPool(null)} onFinish={({minutes,answered,correct,percentage})=>setSessions(ss=>[...ss,{id:Date.now(),type:"flashcard",answered,correct,minutes,percentage,wrongQuestions:[],finishedAt:new Date().toISOString()}])} />}
    {examSession && <ExamRunner session={examSession} close={()=>setExamSession(null)} setMockScores={setMockScores} setMockHistory={setMockHistory} setSessions={setSessions} setQuestionStats={setQuestionStats} theme={theme}/>}
    <div className={`app-shell theme-${theme}`}>
    {mobileNav && <button className="mobile-nav-backdrop" aria-label="Close navigation" onClick={()=>setMobileNav(false)} />}
    <AppSidebar page={page} profile={profile} onNavigate={goTo} onSettings={()=>setShowSettings(true)} onSignOut={onSignOut} mobileOpen={mobileNav} />
    <main className="main">
      <header className="mobile-header"><div className="mobile-brand-lockup"><div className="brand-mark topnotcher-medal" aria-hidden="true"><TopnotcherMedal size={25}/></div><div className="sidebar-brand-copy"><strong>TOPNOTCHER!</strong><span>By God’s Grace</span></div></div><button className="icon-btn" aria-label="Open navigation" onClick={()=>setMobileNav(v=>!v)}><Menu/></button></header>
      {page==="dashboard" && <Dashboard setPage={setPage} streak={streak} category={category} setCategory={setCategory} startDrill={startDrill} stats={stats} decks={decks} questions={questions}/>} 
      
      {page==="profile" && <Profile profile={profile} setProfile={setProfile} setPage={setPage} theme={theme} authUser={authUser}/>}
      {page==="progress" && <Progress stats={stats} streak={streak} decks={decks} mockScores={mockScores} questions={questions} questionStats={questionStats} sessions={sessions} setPage={setPage} setCategory={setCategory} profile={profile}/>} 
      {page==="decks" && <Decks decks={decks} questions={questions} questionStats={questionStats} flashcards={flashcards} setPage={setPage} openDeck={openDeck} setShowDeckModal={setShowDeckModal} setEditingDeck={setEditingDeck} deleteDeck={deleteDeck}/>} 
      {page==="deck-detail" && selectedDeckId && <DeckDetail deck={decks.find(d=>d.id===selectedDeckId)} questions={questions.filter(q=>q.deckId===selectedDeckId)} questionStats={questionStats} flashcards={flashcards.filter(f=>f.deckId===selectedDeckId)} onGenerateFlashcards={()=>{const r=createFlashcardsForDeck(selectedDeckId);alert(`${r.created} flashcard${r.created===1?"":"s"} created${r.skipped?` · ${r.skipped} choice-dependent question${r.skipped===1?"":"s"} skipped`:""}.`);}} onDeleteFlashcard={deleteFlashcard} onBack={()=>{setSelectedDeckId(null);setPage("decks")}} onAdd={()=>{setQuestionDeckId(selectedDeckId);setEditingQuestion(null);setShowQuestionModal(true)}} onAI={()=>{setAiDeckId(selectedDeckId);setShowAIModal(true)}} onEdit={q=>{setQuestionDeckId(selectedDeckId);setEditingQuestion(q);setShowQuestionModal(true)}} onDelete={id=>setQuestions(qs=>qs.filter(q=>q.id!==id))} onStudy={()=>startStudy(questions.filter(q=>q.deckId===selectedDeckId), `Study · ${decks.find(d=>d.id===selectedDeckId)?.name||"Deck"}`)} onStudyFlashcards={()=>setFlashcardStudyPool(flashcards.filter(f=>f.deckId===selectedDeckId))}/>} 
      {page==="mock" && <MockBoard category={category} setCategory={setCategory} mockScores={mockScores} mockHistory={mockHistory} setExamSession={setExamSession} questions={questions}/>}  
      {page==="schedule" && <Schedule sessions={sessions} onAdd={()=>{setEditingSession(null);setShowSessionModal(true)}} onEdit={s=>{setEditingSession(s);setShowSessionModal(true)}} onDelete={id=>setSessions(ss=>ss.filter(s=>s.id!==id))} onToggleDone={id=>setSessions(ss=>ss.map(s=>s.id===id?{...s,completed:!s.completed}:s))}/>} 

      {showDeckModal && <DeckModal close={()=>{setShowDeckModal(false);setEditingDeck(null)}} save={saveDeck} initial={editingDeck}/>} 
      {showAIModal && <AIQuestionModal questions={questions} deck={decks.find(d=>d.id===aiDeckId)} close={()=>{setShowAIModal(false);setAiDeckId(null)}} saveQuestions={items=>{setQuestions(qs=>[...qs,...items]);setShowAIModal(false);setAiDeckId(null)}}/>}
      {showQuestionModal && <QuestionModal close={()=>{setShowQuestionModal(false);setEditingQuestion(null);setQuestionDeckId(null)}} save={saveQuestion} initial={editingQuestion} deckId={questionDeckId}/>} 
      {showSessionModal && <SessionModal close={()=>{setShowSessionModal(false);setEditingSession(null)}} save={data=>{if(editingSession?.id){setSessions(ss=>ss.map(s=>s.id===editingSession.id?{...s,...data,id:editingSession.id}:s));}else{setSessions(ss=>[...ss,{id:Date.now(),...data}]);}setShowSessionModal(false);setEditingSession(null)}} initial={editingSession}/>} 
      {showSettings && <SettingsModal close={()=>setShowSettings(false)} theme={theme} setTheme={setTheme} profile={profile} setProfile={setProfile} openProfile={()=>{setShowSettings(false);setPage("profile")}}/>} 
    </main>
    </div>
  </>;
}

function PageHeader({title,subtitle,action}) { return <div className="page-header"><div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>; }

function Dashboard({setPage,streak,category,setCategory,startDrill,stats,decks,questions}) {
  const cat=CATEGORIES.find(c=>c.id===category)||CATEGORIES[0];
  return <div><PageHeader title="Daily Drill" subtitle="One question at a time — build your review habit daily." action={<div className="streak-pill"><Flame size={20}/> {streak} day streak</div>}/>
    <div className="category-tabs">{CATEGORIES.slice(0,3).map(c=><button className={category===c.id?"selected":""} key={c.id} onClick={()=>setCategory(c.id)}><c.icon size={20}/>{c.label}</button>)}</div>
    <section className="hero-card"><div className="hero-icon"><Target size={42}/></div><h2>{cat.title.replace("General Education","GenEd")} Drill</h2><div className="hero-count">{questions.filter(q=>q.cat===cat.id).length} questions available</div><p>Answer one question at a time. Each correct answer on your first<br className="desktop"/> daily drill keeps your streak alive!</p><button className="primary-btn big" onClick={()=>startDrill(category)}><Play size={20} fill="currentColor"/> Start Drill</button></section>
    <div className="three-cards">{CATEGORIES.slice(0,3).map(c=><button className="info-card" key={c.id} onClick={()=>{setCategory(c.id);startDrill(c.id)}}><div className={"mini-icon "+c.color}><c.icon size={24}/></div><h3>{c.label}</h3><p>{questions.filter(q=>q.cat===c.id).length} questions</p></button>)}</div>
    <div className="streak-banner"><Flame/><div><b>Start your streak today!</b> Answer at least one question correctly to keep your streak alive.</div><strong>{streak} days</strong></div>
    <div className="quick-grid"><button onClick={()=>setPage("progress")}><BarChart3/><span>View progress</span></button><button onClick={()=>setPage("decks")}><Layers3/><span>Open study decks</span></button><button onClick={()=>setPage("mock")}><FileText/><span>Take a mock exam</span></button></div>
  </div>;
}

function DailyDrill({category,setCategory,startDrill,streak,questions}) { return <div><PageHeader title="Daily Drill" subtitle="Practice one question at a time and keep your streak going." action={<div className="streak-pill"><Flame size={20}/>{streak} day streak</div>}/><div className="drill-layout"><section className="panel"><div className="panel-title"><Target/> Choose a category</div><div className="choice-list">{CATEGORIES.slice(0,3).map(c=><button className={"choice-card "+(category===c.id?"chosen":"")} key={c.id} onClick={()=>setCategory(c.id)}><div className={"mini-icon "+c.color}><c.icon size={23}/></div><div><b>{c.title}</b><span>{questions.filter(q=>q.cat===c.id).length} questions available</span></div>{category===c.id&&<div className="check-dot">✓</div>}</button>)}</div><button className="primary-btn wide" onClick={()=>startDrill(category)}><Play size={19}/> Start {CATEGORIES.find(c=>c.id===category)?.label} Drill</button></section><aside className="panel tips"><h3>How it works</h3><p><Target/> Answer one question at a time.</p><p><Trophy/> A correct first answer helps your daily streak.</p><p><Sparkles/> Review the explanation after submitting.</p></aside></div></div>; }

function Progress({stats,streak,decks,mockScores,questions,questionStats,sessions=[],setPage,setCategory,profile}) {
  const accuracy=stats.answered?stats.correct/stats.answered*100:0;
  const examDate = profile?.examDate ? new Date(profile.examDate + "T00:00:00") : null;
  const examDateText = examDate ? examDate.toLocaleDateString("en-US", {month:"long", day:"numeric", year:"numeric"}) : "Not set";
  const daysAway = examDate ? Math.max(0, Math.ceil((examDate - new Date()) / 86400000)) : null;
  const updated=new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date());
  const subjectStats=CATEGORIES.slice(0,3).map(c=>{const qs=questions.filter(q=>q.cat===c.id);const attempts=qs.reduce((n,q)=>n+(questionStats[q.id]?.attempts||0),0);const correct=qs.reduce((n,q)=>n+(questionStats[q.id]?.correct||0),0);return {...c,attempts,correct,accuracy:attempts?Math.round(correct/attempts*100):0};});
  const weakAreas=[...subjectStats].sort((a,b)=>a.accuracy-b.accuracy);
  const recent=[...sessions.map(s=>({id:`session-${s.id}`,type:"study",title:s.type==="flashcard"?"Flashcard Study":(s.type==="drill"?"Daily Drill":"Study Questions"),detail:s.type==="flashcard"?`${s.answered||0} cards reviewed · ${s.percentage??100}% complete`:`Scored ${s.correct||0}/${s.answered||0} · ${s.percentage??0}% · ${(s.wrongQuestions||[]).length} wrong`,date:s.finishedAt?new Date(s.finishedAt).toLocaleDateString():"Recent",action:s.type==="drill"?"dashboard":"decks"})),...mockScores.map((score,i)=>({id:`mock-${i}`,type:"mock",title:"Mock Board Exam",detail:`Scored ${Math.round(score)}%`,date:"Recent",action:"mock"})),...decks.flatMap(d=>questions.filter(q=>q.deckId===d.id&&questionStats[q.id]?.lastAnswered).map(q=>({id:`q-${q.id}`,type:"study",title:d.name,detail:`Reviewed a question · ${questionStats[q.id].correct||0}/${questionStats[q.id].attempts||0} correct`,date:new Date(questionStats[q.id].lastAnswered).toLocaleDateString(),action:"decks"})))].slice(-8).reverse();
  const go=(target,cat)=>{if(cat)setCategory(cat);setPage(target);};
  const metricCards=[
    {label:"Overall Readiness Score",value:`${Math.round(Math.min(100,accuracy))}%`,small:"Target: 75% to pass all sub-tests",foot:"View readiness details",target:"progress",primary:true},
    {label:"Mock Exam Average",value:mockScores.length?`${Math.round(stats.mockAverage)}%`:"0.0%",small:"Last 5 mock exams",foot:mockScores.length?"Review mock exams":"Take your first mock",target:"mock"},
    {label:"Daily Drill Streak",value:streak,small:"days in a row — keep it up!",foot:"Plan your study time",target:"schedule"},
    {label:"Total Hours Studied",value:`${stats.hours.toFixed(1)}h`,small:"Recorded study time",foot:"Open study schedule",target:"schedule"},
    {label:"Questions Answered",value:stats.answered,small:`${accuracy.toFixed(1)}% accuracy overall`,foot:"Open study decks",target:"decks"}
  ];
  return <div>
    <PageHeader title="Progress Dashboard" subtitle={<><span>LET Exam Date: {examDateText}</span>{daysAway !== null && <span className="date-badge">{daysAway} days away</span>}</>} action={<span className="updated">Updated {updated}</span>}/>
    <div className="metrics">{metricCards.map((m,i)=><button key={m.label} className={`metric metric-button ${m.primary?"primary":""}`} onClick={()=>go(m.target)}><span>{m.label}</span><strong>{m.value}</strong><small>{m.small}</small><b className={i===1&&mockScores.length?"danger":""}>{m.foot}</b><ChevronRight className="metric-arrow" size={18}/></button>)}</div>
    <div className="progress-two-col">
      <section className="panel weak-card"><div className="section-head"><div><h2>Weak Areas</h2><p className="muted">Focus on the subjects with the lowest accuracy.</p></div><button onClick={()=>go("mock")}>Practice all <ChevronRight size={16}/></button></div><div className="weak-list">{weakAreas.map(c=><button className="weak-row" key={c.id} onClick={()=>go("mock",c.id)}><div className={`mini-icon ${c.color}`}><c.icon size={21}/></div><div className="weak-main"><div><b>{c.label}</b><span>{c.attempts?`${c.attempts} attempts`:"Not practiced yet"}</span></div><div className="progress-track"><i style={{width:`${Math.min(100,c.accuracy)}%`}}/></div></div><strong>{c.attempts?`${c.accuracy}%`:"—"}</strong><ChevronRight size={18}/></button>)}</div></section>
      <section className="panel recent-card"><div className="section-head"><div><h2>Recent Activity</h2><p className="muted">Your latest study and exam activity.</p></div><button onClick={()=>go("mock")}>View exams <ChevronRight size={16}/></button></div><div className="recent-list">{recent.length?recent.map(item=><button className="recent-row" key={item.id} onClick={()=>go(item.action)}><div className={`activity-icon ${item.type}`}><FileText size={18}/></div><div><b>{item.title}</b><span>{item.detail}</span></div><small>{item.date}</small><ChevronRight size={17}/></button>):<button className="recent-empty" onClick={()=>go("mock")}><Sparkles/><div><b>No activity yet</b><span>Start a mock exam or study a deck to see activity here.</span></div><ChevronRight/></button>}</div></section>
    </div>
    <section className="panel deck-progress interactive-panel"><div className="section-head"><div><h2>Your Study Decks</h2><p className="muted">Click a deck to continue studying.</p></div><button onClick={()=>go("decks")}>View all <ChevronRight size={16}/></button></div>{decks.map(d=>{const qs=questions.filter(q=>q.deckId===d.id);const answered=qs.filter(q=>questionStats[q.id]?.attempts).length;const pct=qs.length?Math.round(answered/qs.length*100):0;return <button className="deck-row interactive-row" key={d.id} onClick={()=>go("decks")}><div><b>{d.name}</b><span className="tag">{CATEGORIES.find(c=>c.id===d.category)?.label||"Mixed"}</span><small>{qs.length} questions · {answered} reviewed</small></div><div className="progress-track"><i style={{width:pct+"%"}}/></div><strong>{pct}%</strong><ChevronRight size={17}/></button>})}</section>
    <div className="chart-grid"><button className="panel chart-card chart-button" onClick={()=>go("mock")}><h2>Mock Exam Score Trend <ChevronRight size={18}/></h2><ChartInner type="line" values={mockScores.length?mockScores:[62,65,68,70,71,74,76,78]}/></button><button className="panel chart-card chart-button" onClick={()=>go("mock")}><h2>Accuracy by Subject <ChevronRight size={18}/></h2><ChartInner type="bar" values={subjectStats.map(c=>c.accuracy)}/></button></div>
  </div>;
}
function Chart({title,type,values}) { return <section className="panel chart-card"><h2>{title}</h2><ChartInner type={type} values={values}/></section>; }
function ChartInner({type,values}) { return <div className="chart"><div className="ylabels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="plot">{[0,25,50,75,100].map(v=><div className="gridline" style={{bottom:`${v}%`}} key={v}/>)}{type==="line"?<svg viewBox="0 0 700 260" preserveAspectRatio="none" className="line-svg"><polyline fill="none" stroke="currentColor" strokeWidth="4" points={values.map((v,i)=>`${values.length===1?350:i*(700/(values.length-1))},${260-(v/100*230)-10}`).join(" ")}/>{values.map((v,i)=><circle key={i} cx={values.length===1?350:i*(700/(values.length-1))} cy={260-(v/100*230)-10} r="5" fill="currentColor"/>)}</svg>:<div className="bars">{values.map((v,i)=><div key={i} className="bar" style={{height:`${Math.max(2,v)}%`}}><span>{v}%</span></div>)}</div>}</div></div>; }
function Decks({decks,questions,questionStats,flashcards,setPage,openDeck,setShowDeckModal,setEditingDeck,deleteDeck}) {
  const [search,setSearch]=useState(""); const [filter,setFilter]=useState("All"); const shown=decks.filter(d=>(filter==="All"||d.category===filter.toLowerCase())&&d.name.toLowerCase().includes(search.toLowerCase()));
  return <div><PageHeader title="Study Decks" subtitle={`${decks.length} decks · ${questions.length} questions total`} action={<button className="primary-btn" onClick={()=>{setEditingDeck(null);setShowDeckModal(true)}}><Plus/> Create Deck</button>}/><div className="deck-toolbar"><div className="search"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search decks..."/></div><div className="filters">{["All","GenEd","ProfEd","Majorship","Mixed"].map(x=><button key={x} className={filter===x?"selected":""} onClick={()=>setFilter(x)}>{x}</button>)}</div></div><div className="deck-grid">{shown.map(d=><DeckCard key={d.id} deck={d} questions={questions} questionStats={questionStats} flashcardCount={flashcards.filter(f=>f.deckId===d.id).length} openDeck={openDeck} edit={()=>{setEditingDeck(d);setShowDeckModal(true)}} deleteDeck={deleteDeck}/>)}</div>{!shown.length&&<div className="empty panel"><Layers3/><b>No decks found</b><span>Create a deck or change your search/filter.</span></div>}</div>;
}

function DeckCard({deck,questions,questionStats,flashcardCount,openDeck,edit,deleteDeck}) { const qs=questions.filter(q=>q.deckId===deck.id); const answered=qs.filter(q=>questionStats[q.id]?.attempts).length; const pct=qs.length?Math.round(answered/qs.length*100):0; return <div className="deck-card"><div className="deck-top"><div className="mini-icon purple"><Layers3/></div><span className="tag">{CATEGORIES.find(c=>c.id===deck.category)?.label||"Mixed"}</span><div className="deck-actions"><button title="Edit" onClick={edit}><Pencil size={17}/></button><button title="Delete" onClick={()=>deleteDeck(deck.id)}><Trash2 size={17}/></button></div></div><h3>{deck.name}</h3><p>{deck.description||"Review deck"}</p><div className="deck-meta"><span><FileText/> {qs.length} Q</span><span><Layers3/> {flashcardCount||0} FC</span></div><div className="progress-track"><i style={{width:pct+"%"}}/></div><div className="deck-percent">{pct}%</div><button className="secondary-btn" onClick={()=>openDeck(deck.id)}><Play size={17}/> Open Deck</button></div>; }

function DeckDetail({deck,questions,questionStats,flashcards,onGenerateFlashcards,onDeleteFlashcard,onBack,onAdd,onAI,onEdit,onDelete,onStudy,onStudyFlashcards}) {
  const [selectedQuestion,setSelectedQuestion]=useState(null);
  const [selectedFlashcard,setSelectedFlashcard]=useState(null);
  const [activeTab,setActiveTab]=useState("questions");
  if(!deck) return null;
  const reviewed=questions.filter(q=>questionStats[q.id]?.attempts).length;
  const accuracy=questions.reduce((sum,q)=>sum+(questionStats[q.id]?.correct||0),0);
  const attempts=questions.reduce((sum,q)=>sum+(questionStats[q.id]?.attempts||0),0);
  const pct=questions.length?Math.round(reviewed/questions.length*100):0;
  return <div>
    <PageHeader title={deck.name} subtitle={<><span>{CATEGORIES.find(c=>c.id===deck.category)?.label} · {deck.description||"Review deck"}</span><span className="date-badge">{questions.length} questions</span></>} action={<div className="detail-actions"><button className="secondary-btn compact" onClick={onBack}><ArrowLeft size={17}/> Back</button><button className="secondary-btn" onClick={onAI}><WandSparkles size={17}/> AI Generate</button><button className="primary-btn" onClick={onAdd}><Plus/> Add Question</button></div>}/>
    <div className="deck-detail-stats"><div><b>{questions.length}</b><span>Questions</span></div><div><b>{reviewed}</b><span>Reviewed</span></div><div><b>{pct}%</b><span>Deck progress</span></div><div><b>{attempts?Math.round(accuracy/attempts*100):0}%</b><span>Accuracy</span></div></div>
    <div className="detail-toolbar deck-action-row">
      <div className="detail-primary-actions">
        <button className="primary-btn study-now-inline" onClick={onStudy} disabled={!questions.length}><Play size={17}/> Study Questions Now</button>
        <button className="secondary-btn study-now-inline" onClick={onStudyFlashcards} disabled={!flashcards.length}><BookOpen size={17}/> Study Flashcards Now</button>
        <div className="deck-content-tabs" role="tablist" aria-label="Deck content">
          <button role="tab" aria-selected={activeTab==="questions"} className={activeTab==="questions"?"active":""} onClick={()=>setActiveTab("questions")}><FileText size={17}/> Questions <span>{questions.length}</span></button>
          <button role="tab" aria-selected={activeTab==="flashcards"} className={activeTab==="flashcards"?"active":""} onClick={()=>setActiveTab("flashcards")}><Layers3 size={17}/> Flashcards <span>{flashcards.length}</span></button>
        </div>
      </div>
    </div>
    {activeTab==="questions"&&<section className="panel question-bank"><div className="section-head"><div><h2>Questions</h2><span className="muted">{questions.length} total · click a question to view it</span></div></div>
      {questions.length?<div className="question-list">{questions.map((q,i)=><div className="question-row" key={q.id}>
        <div className="question-number">{i+1}</div>
        <button className="question-row-main question-row-view" onClick={()=>setSelectedQuestion(q)}><b>{q.q}</b><span>{q.options.length} choices · {questionStats[q.id]?.attempts||0} attempts</span></button>
        <div className="question-row-actions"><button onClick={()=>onEdit(q)} title="Edit"><Pencil size={17}/></button><button onClick={()=>onDelete(q.id)} title="Delete"><Trash2 size={17}/></button></div>
      </div>)}</div>:<div className="empty"><FileText/><b>No questions yet</b><span>Add a multiple-choice question to this deck.</span><button className="primary-btn" onClick={onAdd}><Plus/> Add First Question</button></div>}
    </section>}
    {activeTab==="flashcards"&&<section className="panel flashcard-bank"><div className="section-head"><div><h2>Flashcards</h2><span className="muted">{flashcards.length} created · choice-dependent questions are excluded</span></div><div className="flashcard-section-actions"><button className="secondary-btn compact" onClick={onGenerateFlashcards} disabled={!questions.length}><Layers3 size={16}/> Generate from Questions</button>{flashcards.length>0&&<button className="primary-btn compact" onClick={onStudyFlashcards}><BookOpen size={16}/> Study All</button>}</div></div>
      {flashcards.length?<div className="flashcard-grid">{flashcards.map(card=><FlashcardCard key={card.id} card={card} onDelete={onDeleteFlashcard} onOpen={()=>setSelectedFlashcard(card)}/>)}</div>:<div className="flashcard-empty"><Layers3/><b>No flashcards yet</b><span>Generate flashcards from the questions in this deck.</span></div>}
    </section>}
    {selectedQuestion&&createPortal(<div className="modal-backdrop question-view-backdrop" onClick={()=>setSelectedQuestion(null)}><div className="small-modal question-view-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="question-label">QUESTION</span><h2>Question {questions.findIndex(x=>x.id===selectedQuestion.id)+1}</h2></div><button onClick={()=>setSelectedQuestion(null)}><X/></button></div><div className="question-view-content"><h3>{selectedQuestion.q}</h3><div className="question-view-options">{selectedQuestion.options.map((o,i)=><div className={i===selectedQuestion.answer?"correct":""} key={i}><b>{String.fromCharCode(65+i)}.</b><span>{o}</span></div>)}</div><div className="question-view-rationale"><CheckCircle2 size={18}/><div><b>Correct answer: {selectedQuestion.options[selectedQuestion.answer]}</b><p>{selectedQuestion.explanation}</p></div></div></div><div className="modal-foot"><button className="secondary-btn" onClick={()=>setSelectedQuestion(null)}>Close</button><button className="primary-btn" onClick={()=>{setSelectedQuestion(null);onEdit(selectedQuestion)}}><Pencil size={16}/> Edit Question</button></div></div></div>, document.body)}
    {selectedFlashcard&&createPortal(<FlashcardViewer card={selectedFlashcard} close={()=>setSelectedFlashcard(null)} />, document.body)}
  </div>;
}

function buildExamPool(category, questions) {
  // The mock board uses the built-in LET-style bank so exam length is not
  // limited by the user-created study decks. User-created questions are
  // added on top, with duplicate IDs removed.
  const merged = [...BUILTIN_MOCK_BANK, ...questions];
  const seen = new Set();
  const unique = merged.filter(q => {
    const key = String(q.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (category === "full") return unique.filter(q => ["gened","profed","majorship"].includes(q.cat));
  return unique.filter(q => q.cat === category);
}

function Toggle({label,hint,value,setValue}) {
  return <div className="toggle-row">
    <div>{label && <b>{label}</b>}{hint && <span>{hint}</span>}</div>
    <button type="button" className={"switch "+(value?"on":"")} aria-pressed={value} aria-label={label || "Toggle"} onClick={()=>setValue(v=>!v)}><i/></button>
  </div>;
}

function MockBoard({category,setCategory,mockScores,mockHistory,setExamSession,questions}) {
  const selected=CATEGORIES.find(c=>c.id===category)||CATEGORIES[0];
  const [count,setCount]=useState(150);
  const [shuffle,setShuffle]=useState(true);
  const [explain,setExplain]=useState(false);
  const available=buildExamPool(category,questions).length;
  const timeLimit=Math.max(5,Math.round(count*.8));
  const start=()=>{
    const pool=buildExamPool(category,questions);
    if(!pool.length){alert("No questions are available for this category yet. Add questions to a study deck first.");return;}
    const actualCount=Math.min(count,pool.length);
    const ordered=shuffle?[...pool].sort(()=>Math.random()-0.5):[...pool];
    setExamSession({id:Date.now(), category, requestedCount:count, pool:ordered.slice(0,actualCount), timeLimit, showExplanations:explain, startedAt:Date.now()});
  };
  return <div><PageHeader title="Mock Board Exam" subtitle="Simulate actual LET exam conditions — timed, multiple choice, PRC-standard format"/><div className="mock-layout"><div><h3 className="subheading">Select Exam Category</h3><div className="mock-cards">{CATEGORIES.map(c=><button key={c.id} className={"mock-card "+(category===c.id?"chosen":"")} onClick={()=>setCategory(c.id)}><span className="tag">{c.short}</span><h2>{c.title}</h2><p>{c.desc}</p><div><span><FileText/> {c.id==="full"?QUESTION_BANK_COUNTS.full:QUESTION_BANK_COUNTS[c.id]}+ items</span><span>◷ {c.hours}</span></div></button>)}</div><h3 className="subheading">Number of Items</h3><p className="muted">Time limit adjusts proportionally to item count</p><div className="item-options">{[25,50,75,100,150,200,250,300,350,400,420].map(n=><button className={count===n?"selected":""} key={n} onClick={()=>setCount(n)}>{n}</button>)}</div><Toggle label="Shuffle Questions" hint="Randomize question order each attempt" value={shuffle} setValue={setShuffle}/><Toggle label="Show Explanations After" hint="View answer rationale in results" value={explain} setValue={setExplain}/></div><aside className="panel exam-summary"><h2>Exam Summary</h2><dl><dt>Category</dt><dd>{selected.title}</dd><dt>Items</dt><dd>{count} questions</dd><dt>Available</dt><dd>{available}</dd><dt>Time limit</dt><dd>{timeLimit} minutes</dd></dl><div className="warning"><CircleHelp/> <span><b>PRC Passing Threshold.</b> You need 75% correct to pass each sub-test.</span></div>{available>0&&available<count&&<div className="form-hint"><CircleHelp/> Only {available} questions are currently available, so this attempt will use {available} items.</div>}<div className="bank-ready"><CheckCircle2/> <span><b>Question bank ready.</b> Built-in LET-style items are available for long-form practice.</span></div><h4>RECENT SCORES</h4>{mockHistory?.length?<div className="recent-scores">{mockHistory.slice(-5).reverse().map((s,i)=><span key={i}>{s.score}%</span>)}</div>:<p className="muted">No attempts yet</p>}<button className="primary-btn wide" onClick={start}>Start Exam <ChevronRight/></button></aside></div></div>;
}

function ExamRunner({session,close,setMockScores,setMockHistory,setSessions,setQuestionStats,theme="light"}) {
  const storageKey=`lgh-active-exam-state-${session.id}`;
  const [savedState,setSavedState]=useState(()=>{
    try { return JSON.parse(localStorage.getItem(storageKey)) || null; } catch { return null; }
  });
  const initialDeadline=savedState?.deadline ?? (Date.now()+session.timeLimit*60*1000);
  const [deadline,setDeadline]=useState(initialDeadline);
  const [index,setIndex]=useState(savedState?.index ?? 0);
  const [answers,setAnswers]=useState(savedState?.answers ?? {});
  const [marked,setMarked]=useState(savedState?.marked ?? {});
  const [submitted,setSubmitted]=useState(savedState?.submitted ?? false);
  const [remaining,setRemaining]=useState(Math.max(0, Math.ceil((initialDeadline-Date.now())/1000)));
  const [result,setResult]=useState(savedState?.result ?? null);
  const current=session.pool[Math.min(index,session.pool.length-1)];
  const total=session.pool.length;
  const closeExam=()=>{ localStorage.removeItem(storageKey); close(); };

  useEffect(()=>{
    localStorage.setItem(storageKey,JSON.stringify({index,answers,marked,submitted,remaining,result,deadline}));
  },[storageKey,index,answers,submitted,remaining,result,deadline]);

  useEffect(()=>{
    if(submitted) return;
    const tick=()=>setRemaining(Math.max(0,Math.ceil((deadline-Date.now())/1000)));
    tick();
    const id=setInterval(tick,250);
    return ()=>clearInterval(id);
  },[submitted,deadline]);

  useEffect(()=>{
    if(!submitted && remaining===0) finish(true);
  },[remaining]);

  function choose(choice){ if(!submitted) setAnswers(a=>({...a,[current.id]:choice})); }
  function toggleMark(){ if(!submitted) setMarked(m=>({...m,[current.id]:!m[current.id]})); }
  function goUnanswered(){ const next=session.pool.findIndex((q,i)=>i>index && answers[q.id]===undefined); const fallback=session.pool.findIndex(q=>answers[q.id]===undefined); if(next>=0)setIndex(next); else if(fallback>=0)setIndex(fallback); }
  function finish(auto=false){
    if(submitted) return;
    const correct=session.pool.reduce((n,q)=>n+(answers[q.id]===q.answer?1:0),0);
    const answered=session.pool.filter(q=>answers[q.id]!==undefined).length;
    const score=Math.round(correct/total*100);
    const passed=score>=75;
    const itemResults=session.pool.map(q=>({questionId:q.id,selected:answers[q.id],correct:q.answer,ok:answers[q.id]===q.answer}));
    setSubmitted(true);
    setResult({correct,answered,score,passed,auto,itemResults,elapsed:session.timeLimit*60-remaining});
    setMockScores(s=>[...s,score].slice(-10));
    setMockHistory(h=>[...h,{id:Date.now(),category:session.category,score,correct,total,answered,passed,date:new Date().toISOString()}].slice(-20));
    setSessions(s=>[...s,{id:Date.now(),type:"mock",cat:session.category,answered,correct,minutes:Math.max(1,Math.round((session.timeLimit*60-remaining)/60)),completed:true,title:`${CATEGORIES.find(c=>c.id===session.category)?.label||"Mock"} Mock Exam`,date:new Date().toISOString().slice(0,10)}]);
    setQuestionStats(old=>{const next={...old};session.pool.forEach(q=>{const ok=answers[q.id]===q.answer;next[q.id]={attempts:(old[q.id]?.attempts||0)+1,correct:(old[q.id]?.correct||0)+(ok?1:0),lastAnswered:new Date().toISOString()};});return next;});
  }
  const hh=String(Math.floor(remaining/3600)).padStart(2,"0"), mm=String(Math.floor((remaining%3600)/60)).padStart(2,"0"), ss=String(remaining%60).padStart(2,"0");

  if(submitted&&result) return <div className="modal-backdrop exam-backdrop"><div className="exam-runner results"><div className="exam-top"><div><span className="question-label">EXAM COMPLETE</span><h2>{CATEGORIES.find(c=>c.id===session.category)?.title} Mock Exam</h2></div><button className="icon-close" onClick={closeExam}><X/></button></div><div className={"result-score "+(result.passed?"pass":"fail")}><div className="result-ring"><strong>{result.score}%</strong><span>{result.passed?"PASSED":"NOT PASSED"}</span></div><div><h3>{result.passed?"Great work!":"Keep practicing!"}</h3><p>{result.correct} of {result.total} correct · {result.answered} answered</p><p>{result.auto?"The exam ended when the timer reached zero.":"You submitted the exam before time expired."}</p></div></div><div className="result-grid"><div><b>Passing threshold</b><span>75%</span></div><div><b>Questions</b><span>{result.total}</span></div><div><b>Answered</b><span>{result.answered}</span></div><div><b>Time used</b><span>{Math.floor(result.elapsed/60)}m {result.elapsed%60}s</span></div></div><div className="result-list"><h3>Question Review</h3>{session.pool.map((q,i)=>{const r=result.itemResults[i];return <div className={"result-item "+(r.ok?"ok":"bad")} key={q.id}><span>{r.ok?<CheckCircle2/>:<X/>}</span><div><b>{i+1}. {q.q}</b><small>Your answer: {r.selected===undefined?"Not answered":q.options[r.selected]}</small>{session.showExplanations&&<small>Correct answer: {q.options[q.answer]} — {q.explanation}</small>}</div></div>})}</div><div className="exam-result-actions"><button className="secondary-btn" onClick={closeExam}>Back to Mock Board</button><button className="primary-btn" onClick={()=>{setResult(null);setSubmitted(false);setAnswers({});setMarked({});setIndex(0);setDeadline(Date.now()+session.timeLimit*60*1000);setRemaining(session.timeLimit*60);}}>Review Attempt</button></div></div></div>;

  return <div className={`exam-fullscreen exam-theme-${theme}`}><div className="exam-shell"><header className="exam-header"><div className="exam-title"><span className="question-label">MOCK BOARD EXAM</span><h1>{CATEGORIES.find(c=>c.id===session.category)?.title}</h1><span className="exam-meta">{total} items · 75% passing threshold</span></div><div className={"exam-timer " + (remaining<60?"danger":"")}><span>TIME REMAINING</span><strong>{hh}:{mm}:{ss}</strong></div><button className="icon-close" aria-label="Exit exam" onClick={()=>{if(confirm("Exit this exam? Your attempt will not be scored. If the page is refreshed accidentally, your answers will remain saved.")) closeExam();}}><X/></button></header><div className="exam-body"><aside className="exam-sidebar"><div className="navigator-head"><div><b>Question Navigator</b><span>{Object.keys(answers).length} of {total} answered</span></div><div className="navigator-legend"><span><i className="legend-dot answered"/>Answered</span><span><i className="legend-dot unanswered"/>Unanswered</span><span><i className="legend-dot current"/>Current</span></div></div><div className="navigator-progress"><div><span>Progress</span><b>{Math.round(Object.keys(answers).length/total*100)}%</b></div><div className="progress-track"><i style={{width:(Object.keys(answers).length/total*100)+"%"}}/></div></div><div className="question-jump question-jump-grid">{session.pool.map((q,i)=>{const answered=answers[q.id]!==undefined; return <button key={q.id} aria-label={`Question ${i+1}${answered?", answered":""}`} className={(i===index?"current ":"")+(answered?"answered":"unanswered")+(marked[q.id]?" marked":"")} onClick={()=>setIndex(i)}>{i+1}</button>})}</div><div className="navigator-footer"><span><b>{index+1}</b> / {total}</span><button className="navigator-action" onClick={goUnanswered}>Go to unanswered</button><button className={`navigator-action ${marked[current.id]?"marked":""}`} onClick={toggleMark}>{marked[current.id]?"Marked for review":"Mark for review"}</button></div></aside><main className="exam-main"><div className="exam-main-top"><div><span className="question-label">ITEM {index+1}</span><span className="exam-progress-copy">Question {index+1} of {total}</span></div><div className="exam-top-actions"><span className="answered-count">{Object.keys(answers).length} answered</span><button className={`secondary-btn compact ${marked[current.id]?"review-marked":""}`} onClick={toggleMark}><Star size={16}/>{marked[current.id]?"Marked":"Mark for review"}</button></div></div><div className="exam-question"><h2>{current.q}</h2><div className="exam-options">{current.options.map((opt,i)=><button key={i} className={answers[current.id]===i?"selected":""} onClick={()=>choose(i)}><span>{String.fromCharCode(65+i)}</span><b>{opt}</b></button>)}</div></div><div className="exam-navigation"><button className="secondary-btn" disabled={index===0} onClick={()=>setIndex(i=>Math.max(0,i-1))}><ChevronLeft/> Previous</button><div className="exam-nav-status"><span>Question <b>{index+1}</b> / {total}</span><div className="progress-track"><i style={{width:((index+1)/total*100)+"%"}}/></div></div>{index===total-1?<button className="primary-btn" onClick={()=>{if(confirm("Submit this exam now? Unanswered questions will be counted as incorrect.")) finish(false);}}>Submit Exam <CheckCircle2/></button>:<button className="primary-btn" onClick={()=>setIndex(i=>Math.min(total-1,i+1))}>Next <ChevronRight/></button>}</div></main></div></div></div>;
}

function Schedule({sessions,onAdd,onEdit,onDelete,onToggleDone}) {
  const now=new Date();
  const [month,setMonth]=useState(new Date(now.getFullYear(),now.getMonth(),1));
  const year=month.getFullYear(), mon=month.getMonth();
  const days=new Date(year,mon+1,0).getDate(), start=new Date(year,mon,1).getDay();
  const cells=[...Array(start),...Array.from({length:days},(_,i)=>i+1)];
  const today=now.getDate(), currentMonth=now.getMonth(), currentYear=now.getFullYear();
  const monthSessions=sessions.filter(s=>{const dt=new Date(s.date+"T00:00:00");return dt.getMonth()===mon&&dt.getFullYear()===year}).sort((a,b)=>a.date.localeCompare(b.date));
  const typeLabel=t=>t==="mock"?"Mock Exam":t==="drill"?"Daily Drill":"Study Session";
  const categoryLabel=t=>t==="profed"?"ProfEd":t==="majorship"?"Major":"GenEd";
  return <div>
    <PageHeader title="Study Schedule" subtitle="Plot, edit, complete, and track your review sessions." action={<button className="primary-btn" onClick={onAdd}><Plus/> Add Schedule</button>}/>
    <div className="schedule-stats">
      <div><b>{sessions.length}</b><span>Total Schedules</span></div>
      <div><b>{sessions.filter(s=>s.completed).length}</b><span>Completed</span></div>
      <div><b>{sessions.filter(s=>!s.completed).length}</b><span>Pending</span></div>
      <div><b>{monthSessions.length}</b><span>This Month</span></div>
    </div>
    <div className="calendar-layout">
      <section className="panel calendar">
        <div className="calendar-head"><h2>{month.toLocaleString("en-US",{month:"long"})} {year}</h2><div className="calendar-nav"><button aria-label="Previous month" onClick={()=>setMonth(new Date(year,mon-1,1))}><ChevronLeft/></button><button aria-label="Next month" onClick={()=>setMonth(new Date(year,mon+1,1))}><ChevronRight/></button></div></div>
        <div className="weekday">{["SUN","MON","TUE","WED","THU","FRI","SAT"].map(x=><b key={x}>{x}</b>)}</div>
        <div className="calendar-grid">{cells.map((d,i)=><div className={"day "+(d===today&&mon===currentMonth&&year===currentYear?"today":"")} key={i}>{d&&<><span>{d}</span>{monthSessions.filter(s=>{const dt=new Date(s.date+"T00:00:00");return dt.getDate()===d}).map(s=><button type="button" className={`calendar-event category-${s.studyCategory||"gened"} ${s.completed?"done":""}`} key={s.id} title={`${s.title} — ${categoryLabel(s.studyCategory)} · ${typeLabel(s.type)} · ${s.hours||1} hr${Number(s.hours||1)===1?"":"s"}`} onClick={()=>onEdit(s)}><span>{s.title}</span>{s.completed&&<CheckCircle2 size={11}/>}</button>)}</>}</div>)}</div>
      </section>
      <aside className="panel event-side schedule-list-panel">
        <div className="schedule-side-head"><div><h3>Schedules</h3><span>{monthSessions.length} this month</span></div><button className="secondary-btn compact" onClick={onAdd}><Plus size={16}/> Add</button></div>
        <div className="schedule-event-list">
          {monthSessions.length ? monthSessions.map(s=><div className={`schedule-event-card ${s.completed?"is-done":""}`} key={s.id}>
            <div className={`schedule-event-dot category-${s.studyCategory||"gened"}`}></div>
            <div className="schedule-event-info"><strong className={s.completed?"completed-title":""}>{s.title}</strong><span>{new Date(s.date+"T00:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})} · {categoryLabel(s.studyCategory)} · {typeLabel(s.type)} · {s.hours||1} hr{Number(s.hours||1)===1?"":"s"}</span></div>
            <div className="schedule-event-actions">
              <button title={s.completed?"Mark as pending":"Mark as done"} className={s.completed?"done-action":""} onClick={()=>onToggleDone(s.id)}><CheckCircle2 size={17}/></button>
              <button title="Edit schedule" onClick={()=>onEdit(s)}><Pencil size={16}/></button>
              <button title="Delete schedule" className="danger-action" onClick={()=>{if(confirm(`Delete “${s.title}”?`)) onDelete(s.id)}}><Trash2 size={16}/></button>
            </div>
          </div>) : <div className="empty schedule-empty"><CalendarDays/><span>No schedules this month.</span><button className="secondary-btn compact" onClick={onAdd}><Plus size={15}/> Add your first schedule</button></div>}
        </div>
      </aside>
    </div>
  </div>;
}

function StudyModal({study,answer,next,jump,close,goTo,profile,onSignOut,theme="light"}) {
  const subjectText = String(study.label || "Study Session").replace(/^Study\s*[·:-]?\s*/i, "");
  const subjectLower = subjectText.toLowerCase();
  const subjectObjects = subjectLower.includes("math") || subjectLower.includes("mathemat")
    ? ["🧩","📐","➗","🔢","📊"]
    : subjectLower.includes("science") || subjectLower.includes("biology") || subjectLower.includes("chem") || subjectLower.includes("physics")
      ? ["🔬","🧪","⚛️","🧬","🌡️"]
      : subjectLower.includes("self") || subjectLower.includes("psych") || subjectLower.includes("person")
        ? ["🪞","💭","🧠","🧩","✨"]
        : subjectLower.includes("history") || subjectLower.includes("social") || subjectLower.includes("philipp")
          ? ["📜","🗺️","🏛️","📖","🧭"]
          : subjectLower.includes("english") || subjectLower.includes("language") || subjectLower.includes("filipino")
            ? ["📚","✏️","🔤","📝","💬"]
            : ["📚","✏️","💡","🧠","⭐"];
  const q=study.pool[Math.min(study.index,study.pool.length-1)];
  const pct=((study.index+1)/study.pool.length)*100;
  if (study.finishedRecorded) {
    const minutes=study.minutes||Math.max(1,Math.round((Date.now()-study.startedAt)/60000));
    const percentage=study.percentage ?? (study.pool.length?Math.round(study.correct/study.pool.length*100):0);
    return <div className={`study-fullscreen study-theme-${theme}`}><AppSidebar page="decks" profile={profile} onNavigate={()=>close()} onSettings={()=>close()} onSignOut={()=>{close();onSignOut?.();}} studyMode/><div className="study-shell"><header className="study-header"><div className="study-title"><span className="study-subject-kicker">STUDY COMPLETE</span><h1>{subjectText}</h1></div><button className="icon-close" onClick={close}><X/></button></header><main className="study-complete-wrap"><section className="study-complete-card panel"><CheckCircle2 size={48}/><span className="question-label">SESSION COMPLETE</span><h2>Great work!</h2><div className="study-result-grid"><div><b>{minutes} min</b><span>Time Taken</span></div><div><b>{study.correct}/{study.pool.length}</b><span>Score</span></div><div><b>{percentage}%</b><span>Percentage</span></div><div><b>{study.wrongQuestions?.length||0}</b><span>Wrong</span></div></div>{study.wrongQuestions?.length?<div className="wrong-question-report"><h3>Wrong Answered Questions</h3>{study.wrongQuestions.map((w,i)=><div key={w.id||i}><b>{i+1}. {w.q}</b><span>Your answer: {w.selected||"Unanswered"}</span><span>Correct answer: {w.correct}</span></div>)}</div>:<div className="no-wrong-report"><CheckCircle2 size={20}/> Perfect score — no wrong answers.</div>}<div className="study-complete-actions"><button className="secondary-btn" onClick={close}>Finish</button><button className="primary-btn" onClick={()=>{close();goTo("progress")}}>View Progress</button></div></section></main></div></div>;
  }
  const [elapsed,setElapsed]=useState(Math.max(0,Math.floor((Date.now()-study.startedAt)/1000)));
  useEffect(()=>{ const id=setInterval(()=>setElapsed(Math.max(0,Math.floor((Date.now()-study.startedAt)/1000))),1000); return ()=>clearInterval(id); },[study.startedAt]);
  const hh=String(Math.floor(elapsed/3600)).padStart(2,"0"), mm=String(Math.floor((elapsed%3600)/60)).padStart(2,"0"), ss=String(elapsed%60).padStart(2,"0");
  const nav=[
    ["progress",LayoutDashboard,"Progress Dashboard"],["decks",Library,"Study Decks"],["dashboard",Flame,"Daily Drill"],["mock",ClipboardCheck,"Mock Board Exam"],["schedule",CalendarDays,"Study Schedule"]
  ];
  const exitTo=(page)=>{ if(confirm("Exit this study session? Your completed answers will remain recorded, but this session will not be counted as finished.")){ close(); goTo(page); } };
  return <div className={`study-fullscreen study-theme-${theme}`}>
    <AppSidebar page="decks" profile={profile} onNavigate={exitTo} onSettings={()=>{if(confirm("Exit this study session?")){close();}}} onSignOut={()=>{if(confirm("Exit this study session and sign out?")){close();onSignOut?.();}}} studyMode />
    <div className="study-shell">
      <header className="study-header">
        <div className="study-header-floaters" aria-hidden="true">
          {Array.from({length:20},(_,i)=>subjectObjects[i % subjectObjects.length]).map((item,i)=><span key={i} style={{"--float-index":i,"--float-x":`${8+(i*17)%86}%`,"--float-delay":`${-(i*0.72)}s`,"--float-duration":`${5.8+(i%5)*0.7}s`}}>{item}</span>)}
        </div>
        <div className="study-title"><span className="study-subject-kicker">SUBJECT</span><h1>{subjectText}</h1></div>
        <div className="study-timer"><span>TIME ELAPSED</span><strong>{hh}:{mm}:{ss}</strong></div>
        <button className="icon-close" aria-label="Exit study session" onClick={()=>{if(confirm("Exit this study session? Your completed answers will remain recorded, but this session will not be counted as finished.")) close();}}><X/></button>
      </header>
      <div className="study-body">
        <main className="study-main">
          <div className="study-main-top"><div><span className="question-label">QUESTION {study.index+1}</span><span>of {study.pool.length}</span></div><span className="study-answered">{study.answered} answered</span></div>
          <div className="study-progress-track"><i style={{width:`${pct}%`}}/></div>
          <section className="study-question-card">
            <h2>{q.q}</h2>
            <div className="options">{q.options.map((o,i)=><button key={i} className={(study.checked&&i===q.answer?"correct ":"")+(study.checked&&i===study.selected&&i!==q.answer?"wrong":"")} disabled={study.checked} onClick={()=>answer(i)}><span>{String.fromCharCode(65+i)}</span>{o}</button>)}</div>
            {study.checked&&<div className={"explanation "+(study.selected===q.answer?"good":"bad")}><b>{study.selected===q.answer?"Correct!":"Not quite."}</b><p>{q.explanation}</p></div>}
          </section>
          <div className="study-navigation"><span>{study.checked?"Review the rationale, then continue.":"Select an answer to continue."}</span>{study.checked&&<div className="study-nav-actions"><button className="secondary-btn" disabled={study.index===0} onClick={()=>jump(Math.max(0,study.index-1))}><ChevronLeft/> Previous</button><button className="primary-btn" onClick={next}>{study.index===study.pool.length-1?"Finish Study Session":"Next Question"}<ChevronRight/></button></div>}</div>
        </main>
        <aside className="study-sidebar study-question-sidebar">
          <div className="study-side-head"><b>Question Navigator</b><span>{study.index+1} of {study.pool.length}</span></div>
          <div className="study-progress"><span>Progress</span><b>{Math.round(study.answered/study.pool.length*100)}%</b></div>
          <div className="study-question-jump">{study.pool.map((item,i)=>{const status=study.results?.[item.id]; return <button key={item.id} className={`${status||"unanswered"}${i===study.index?" current":""}`} onClick={()=>jump(i)}>{i+1}</button>})}</div>
          <div className="study-side-note"><Flame size={17}/><span>Take your time and focus on understanding the rationale.</span></div>
        </aside>
      </div>
    </div>
  </div>;
}
function FlashcardCard({card,onDelete,onOpen}) {
  const [flipped,setFlipped]=useState(false);
  return <div className={`flashcard-item ${flipped?"flipped":""}`} onClick={()=>onOpen?.()} role="button" tabIndex={0} onKeyDown={e=>{if((e.key==="Enter"||e.key===" ")&&onOpen)onOpen();}}>
    <div className="flashcard-face"><span className="tag">FLASHCARD</span><h3>{card.front}</h3><small>Click to study this flashcard.</small></div>
    <button className="icon-delete" title="Delete flashcard" onClick={e=>{e.stopPropagation();onDelete(card.id)}}><Trash2 size={16}/></button>
  </div>;
}

function FlashcardViewer({card,close}) {
  const [flipped,setFlipped]=useState(false);
  return <div className="modal-backdrop flashcard-view-backdrop" onClick={close}><div className="flashcard-view-modal" onClick={e=>e.stopPropagation()}>
    <div className="modal-head"><div><span className="question-label">FLASHCARD</span><h2>{flipped?"Answer":"Question"}</h2></div><button onClick={close}><X/></button></div>
    <button className={`flashcard-view-card ${flipped?"flipped":""}`} onClick={()=>setFlipped(v=>!v)} aria-label="Flip flashcard">
      <span className="tag">{flipped?"ANSWER":"QUESTION"}</span><h1>{flipped?card.back:card.front}</h1>{flipped&&card.explanation&&<p>{card.explanation}</p>}<small>Click to flip</small>
    </button>
    <div className="modal-foot"><button className="secondary-btn" onClick={close}>Close</button></div>
  </div></div>;
}

function FlashcardStudyModal({cards,close,onFinish}) {
  const [index,setIndex]=useState(0);
  const [flipped,setFlipped]=useState(false);
  const [completed,setCompleted]=useState(false);
  const [startedAt]=useState(Date.now());
  const [saved,setSaved]=useState(false);
  const safeCards=Array.isArray(cards)?cards:[];
  if(!safeCards.length) return null;
  const card=safeCards[Math.min(index,safeCards.length-1)];
  const finish=()=>{
    const minutes=Math.max(1,Math.round((Date.now()-startedAt)/60000));
    if(!saved){onFinish?.({minutes,answered:safeCards.length,correct:safeCards.length,percentage:100});setSaved(true);}
    setCompleted(true);
  };
  const next=()=>{if(index<safeCards.length-1){setIndex(i=>i+1);setFlipped(false)}else finish()};
  return <div className="flashcard-study-fullscreen">
    <header className="flashcard-study-header"><div><span className="question-label">FLASHCARD STUDY</span><h1>Study All Flashcards</h1><span>{completed?safeCards.length:index+1} of {safeCards.length}</span></div><div className="flashcard-study-progress"><div className="progress-track"><i style={{width:(((completed?safeCards.length:index+1)/safeCards.length)*100)+"%"}}/></div></div><button className="icon-close" onClick={close} aria-label="Exit flashcard study"><X/></button></header>
    <main className="flashcard-study-main">{completed?<div className="flashcard-complete panel"><CheckCircle2 size={44}/><span className="question-label">SESSION COMPLETE</span><h2>Flashcard study complete</h2><div className="study-result-grid"><div><b>{Math.max(1,Math.round((Date.now()-startedAt)/60000))} min</b><span>Time Taken</span></div><div><b>{safeCards.length}/{safeCards.length}</b><span>Cards Reviewed</span></div><div><b>100%</b><span>Completion</span></div><div><b>0</b><span>Wrong</span></div></div><p>All flashcards in this study session were reviewed. Flashcards do not have a right/wrong score.</p><div><button className="secondary-btn" onClick={()=>{setIndex(0);setFlipped(false);setCompleted(false);setSaved(false)}}>Study Again</button><button className="primary-btn" onClick={close}>Finish</button></div></div>:<>
      <div className="flashcard-study-card-wrap"><button className={`flashcard-study-card ${flipped?"flipped":""}`} onClick={()=>setFlipped(v=>!v)}><span className="tag">{flipped?"ANSWER":"QUESTION"}</span><h2>{flipped?card.back:card.front}</h2>{flipped&&card.explanation&&<p>{card.explanation}</p>}<small>Click to flip</small></button></div>
      <div className="flashcard-study-actions"><button className="secondary-btn" disabled={index===0} onClick={()=>{setIndex(i=>Math.max(0,i-1));setFlipped(false)}}><ChevronLeft/> Previous</button><button className="primary-btn" onClick={next}>{index===safeCards.length-1?"Finish":"Next Flashcard"}<ChevronRight/></button></div>
    </>}</main>
  </div>;
}

function DeckModal({close,save,initial}) { const [name,setName]=useState(initial?.name||""); const [description,setDescription]=useState(initial?.description||""); const [category,setCategory]=useState(initial?.category||"gened"); return <div className="modal-backdrop"><div className="small-modal"><div className="modal-head"><h2>{initial?"Edit Study Deck":"Create Study Deck"}</h2><button onClick={close}><X/></button></div><label>Deck name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. General Science"/></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORIES.slice(0,3).map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What will you review?"/></label><button className="primary-btn wide" disabled={!name.trim()} onClick={()=>save({id:initial?.id,name:name.trim(),description,category})}><Save size={17}/>{initial?"Save Changes":"Create Deck"}</button></div></div>; }


function AIQuestionModal({questions=[],deck,close,saveQuestions}) {
  const [material,setMaterial]=useState("");
  const [sourceName,setSourceName]=useState("");
  const [count,setCount]=useState(50);
  const [progress,setProgress]=useState(0);
  const [difficulty,setDifficulty]=useState("mixed");
  const [topic,setTopic]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [generated,setGenerated]=useState([]);

  const readFile=async e=>{
    const file=e.target.files?.[0]; if(!file) return;
    setSourceName(file.name); setError("");
    try {
      if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
        // Use the legacy PDF.js build with the worker disabled. This is more reliable
        // when Vite/Vercel serves the app from a deployment where the PDF worker
        // asset cannot be resolved. Text extraction still happens entirely in-browser.
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        // PDF.js v4 requires an explicit worker source in Vite production builds.
        // Bundle the worker through Vite instead of relying on a /pdf.worker.mjs URL.
        const workerUrl = (await import("pdfjs-dist/legacy/build/pdf.worker.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        const bytes = new Uint8Array(await file.arrayBuffer());
        const pdf = await pdfjs.getDocument({
          data: bytes,
          disableWorker: true,
          useWorkerFetch: false,
          isEvalSupported: false
        }).promise;
        const pages=[];
        for (let pageNo=1; pageNo<=pdf.numPages; pageNo++) {
          const page=await pdf.getPage(pageNo);
          const content=await page.getTextContent();
          pages.push(content.items.map(item=>item.str||"").join(" "));
        }
        const text=pages.join("\n\n").replace(/\s{3,}/g,"  ").trim();
        if (!text) throw new Error("PDF_TEXT_EMPTY");
        setMaterial(text);
        setError("");
        return;
      }
      if (!/\.(txt|md|csv)$/i.test(file.name)) {
        setError("Supported materials are PDF, TXT, MD, and CSV. For DOCX/PPTX, paste the extracted text for now.");
        return;
      }
      setMaterial(await file.text());
    } catch (err) {
      console.error("Material upload error:", err);
      setMaterial("");
      if (err?.message === "PDF_TEXT_EMPTY") {
        setError("This PDF opened successfully, but it contains no selectable text. It may be scanned/image-only. Please use a text-based PDF or paste the extracted text here.");
      } else if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
        setError("This PDF could not be read. Make sure it is not password-protected and contains selectable text. Scanned/image-only PDFs need OCR or pasted text.");
      } else {
        setError("I couldn't read that material. Please try another PDF, TXT, MD, or CSV file, or paste the material instead.");
      }
    }
  };

  const generate=async()=>{
    if(!material.trim()) { setError("Add or paste study material first."); return; }
    setBusy(true); setError(""); setGenerated([]); setProgress(0);
    try {
      // V41 essential AI safeguards:
      // 1) Create a deliberately shuffled A/B/C/D answer-position plan.
      // 2) Reposition each correct option to its assigned slot after generation.
      // 3) Deduplicate question stems across all batches.
      const positions=[];
      for(let i=0;i<count;i++) positions.push(i%4);
      for(let i=positions.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [positions[i],positions[j]]=[positions[j],positions[i]]; }
      const normalizeStem=value=>String(value||"").toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g," ").trim();
      const stemTokens=value=>new Set(normalizeStem(value).split(" ").filter(w=>w.length>2));
      const similarityScore=(a,b)=>{
        const A=stemTokens(a), B=stemTokens(b);
        if(!A.size||!B.size) return 0;
        let intersection=0; A.forEach(t=>{if(B.has(t)) intersection++;});
        return intersection/(A.size+B.size-intersection);
      };
      const used=[];
      const all=[];
      const existingStems=questions.map(q=>q.q).filter(Boolean);
      const isDuplicateOrSimilar=stem=>{
        const candidates=[...existingStems,...used];
        return candidates.some(prev=>normalizeStem(prev)===normalizeStem(stem) || similarityScore(prev,stem)>=0.72);
      };
      const optionsAreBalanced=opts=>{
        const lengths=opts.map(o=>String(o||"").trim().length).sort((a,b)=>a-b);
        if(lengths.length!==4||lengths.some(n=>n<1)) return false;
        const median=(lengths[1]+lengths[2])/2||1;
        return Math.max(...lengths)<=median*1.55 && Math.min(...lengths)>=median*0.55;
      };
      let attempts=0;
      while(all.length<count && attempts<Math.max(8,Math.ceil(count/10)+4)){
        attempts++;
        const batchCount=Math.min(20,count-all.length);
        const requestedPositions=positions.slice(all.length,all.length+batchCount);
        const res=await fetch("/api/generate-questions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          material,category:deck?.category||"gened",topic,count:batchCount,difficulty,sourceName,
          targetPositions:requestedPositions,
          excludeQuestions:existingStems
        })});
        const contentType=res.headers.get("content-type")||"";
        const data=contentType.includes("application/json") ? await res.json() : {error:await res.text()};
        if(res.status===404) throw new Error("AI generation endpoint was not found (404). Redeploy this project on Vercel with the included /api/generate-questions.js function.");
        if(!res.ok) throw new Error(data.error||`Generation failed on batch ${attempts}.`);
        const qs=(data.questions||[]).filter(q=>q?.question && Array.isArray(q.options) && q.options.length===4);
        if(!qs.length) throw new Error(`The AI returned no usable questions on batch ${attempts}. Try adding more source material.`);

        for(const q of qs){
          if(all.length>=count) break;
          const key=normalizeStem(q.question);
          if(!key || isDuplicateOrSimilar(q.question)) continue;
          if(!optionsAreBalanced(q.options)) continue;
          let correct=Number(q.correctAnswer);
          if(!Number.isInteger(correct)||correct<0||correct>3) continue;
          const target=positions[all.length];
          const options=[...q.options];
          [options[correct],options[target]]=[options[target],options[correct]];
          all.push({...q,options,correctAnswer:target});
          used.push(q.question);
          setGenerated([...all]);
          setProgress(Math.round(all.length/count*100));
        }
      }
      if(all.length<count){
        throw new Error(`Only ${all.length} of ${count} unique questions were generated. Add more source material or try again for a fuller set.`);
      }
    } catch(e) { setError(e.message||"Could not generate questions. Any completed questions remain available below."); }
    finally { setBusy(false); }
  };

  const save=()=>{
    const normalized=generated.map((q,i)=>({id:Date.now()+i,deckId:deck.id,cat:deck.category,q:q.question,options:q.options,answer:Number(q.correctAnswer),explanation:q.rationale,topic:q.topic||topic||"AI Generated",difficulty:q.difficulty||difficulty,sourceMaterial:sourceName||"Pasted material",aiGenerated:true}));
    saveQuestions(normalized);
  };

  const questionOptions=[50,100,150,200,300,400];
  const difficultyOptions=[
    {value:"mixed",label:"Mixed",desc:"Balanced difficulty",icon:"◈"},
    {value:"easy",label:"Easy",desc:"Recall & foundations",icon:"○"},
    {value:"moderate",label:"Moderate",desc:"Understanding & application",icon:"◉"},
    {value:"difficult",label:"Difficult",desc:"Analysis & challenging items",icon:"◆"}
  ];

  return <div className="modal-backdrop"><div className="ai-modal ai-modal-v2">
    <div className="modal-head ai-hero-head">
      <div className="ai-title-wrap"><div className="ai-title-icon"><WandSparkles size={22}/></div><div><h2>AI Question Generator</h2><span className="muted">Turn your study material into LET-style questions for <b>{deck?.name}</b>.</span></div></div>
      <button onClick={close}><X/></button>
    </div>

    <div className="ai-step-grid">
      <div className="ai-step-card ai-material-card">
        <div className="ai-step-head"><div className="ai-step-number">1</div><div><h3>Study Material</h3><span>Add the material the AI should use as its primary source.</span></div></div>
        <label className={"ai-dropzone "+(sourceName?"has-file":"")}>
          <input type="file" accept=".pdf,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv" onChange={readFile}/>
          <div className="ai-upload-icon"><Upload size={22}/></div>
          {sourceName?<><b>{sourceName}</b><span>Material loaded · click to replace</span></>:<><b>Upload your reviewer</b><span>PDF, TXT, MD, or CSV · or click to browse</span></>}
        </label>
        <div className="ai-or"><span>OR</span></div>
        <textarea className="ai-material-input" value={material} onChange={e=>{setMaterial(e.target.value);if(sourceName)setSourceName("")}} placeholder="Paste your reviewer, lecture notes, textbook excerpt, or study material here..."/>
        <div className="ai-material-meta"><span><FileText size={14}/> {material.trim()?`${material.trim().length.toLocaleString()} characters ready`:`No material added yet`}</span>{sourceName&&<span className="ai-file-name">{sourceName}</span>}</div>
      </div>

      <div className="ai-step-card ai-settings-card">
        <div className="ai-step-head"><div className="ai-step-number">2</div><div><h3>Question Settings</h3><span>Choose the size and difficulty of your question set.</span></div></div>
        <div className="ai-setting-block"><div className="ai-setting-label"><b>Number of Questions</b><span>{count} items</span></div><div className="ai-choice-grid count-grid">{questionOptions.map(n=><button type="button" key={n} className={count===n?"selected":""} onClick={()=>setCount(n)} disabled={busy}>{n}</button>)}</div></div>
        <div className="ai-setting-block"><div className="ai-setting-label"><b>Difficulty</b><span>{difficultyOptions.find(x=>x.value===difficulty)?.label}</span></div><div className="ai-difficulty-list">{difficultyOptions.map(o=><button type="button" key={o.value} className={difficulty===o.value?"selected":""} onClick={()=>setDifficulty(o.value)} disabled={busy}><span className="ai-difficulty-icon">{o.icon}</span><span><b>{o.label}</b><small>{o.desc}</small></span></button>)}</div></div>
        <label className="ai-topic-field"><span>Topic / Focus <em>optional</em></span><input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Assessment, Philippine History" disabled={busy}/></label>
      </div>
    </div>

    <div className="ai-generator-footer">
      <div className="ai-generator-note"><Sparkles size={17}/><div><b>Material-grounded generation</b><span>Every question includes a meaningful rationale explaining why the correct answer is correct.</span></div></div>
      <button className="primary-btn ai-generate-btn" disabled={busy||!material.trim()} onClick={generate}>{busy?<><Loader2 className="spin" size={18}/> Generating {generated.length} / {count}...</>:<><WandSparkles size={18}/> Generate {count} Questions</>}</button>
    </div>

    {busy&&<div className="ai-generation-progress"><div className="ai-progress-top"><div><b>Generating your LET questions...</b><span>Creating questions in small batches to keep large sets reliable.</span></div><strong>{progress}%</strong></div><div className="progress-track"><i style={{width:progress+"%"}}/></div><div className="ai-progress-meta"><span>{generated.length} of {count} questions ready</span><span>Please keep this window open</span></div></div>}
    {error&&<div className="ai-error">{error}</div>}

    {generated.length>0&&!busy&&<div className="ai-preview ai-preview-v2"><div className="section-head"><div><h3>Generated Questions</h3><span className="muted">Review the questions and rationales before saving them to your deck.</span></div><span className="tag">{generated.length} ready</span></div>{generated.map((q,i)=><div className="ai-q" key={i}><div className="ai-q-head"><b>{i+1}. {q.question}</b><span className="tag">{q.difficulty||difficulty}</span></div><div className="ai-options">{q.options.map((o,j)=><div className={j===Number(q.correctAnswer)?"correct":""} key={j}><b>{String.fromCharCode(65+j)}.</b> {o}</div>)}</div><div className="ai-rationale"><CheckCircle2 size={16}/><div><b>Correct answer: {String.fromCharCode(65+Number(q.correctAnswer))}</b><p>{q.rationale}</p></div></div></div>)}</div>}
    <div className="modal-foot ai-footer"><button className="secondary-btn" onClick={close}>Cancel</button>{generated.length>0&&<button className="primary-btn" onClick={save}><Save size={17}/> Save {generated.length} Questions to Deck</button>}</div>
  </div></div>;
}

function QuestionModal({close,save,initial,deckId}) {
  const [question,setQuestion]=useState(initial?.q||""); const [options,setOptions]=useState(initial?.options||["","","",""]); const [answer,setAnswer]=useState(initial?.answer??0); const [explanation,setExplanation]=useState(initial?.explanation||"");
  const updateOption=(i,v)=>setOptions(os=>os.map((o,idx)=>idx===i?v:o));
  const submit=()=>{if(!question.trim()||options.some(o=>!o.trim())||!explanation.trim()) return; save({id:initial?.id,deckId, q:question.trim(),options,answer,explanation:explanation.trim()});};
  return <div className="modal-backdrop"><div className="small-modal question-modal"><div className="modal-head"><div><h2>{initial?"Edit Question":"Add Question"}</h2><span className="muted">Multiple-choice question</span></div><button onClick={close}><X/></button></div><label>Question<textarea className="question-input" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Enter the question stem..."/></label><div className="option-editor"><b>Answer choices</b>{options.map((o,i)=><label key={i}><span className={answer===i?"answer-dot selected":"answer-dot"} onClick={()=>setAnswer(i)}>{String.fromCharCode(65+i)}</span><input value={o} onChange={e=>updateOption(i,e.target.value)} placeholder={`Choice ${String.fromCharCode(65+i)}`}/></label>)}</div><label>Explanation<textarea value={explanation} onChange={e=>setExplanation(e.target.value)} placeholder="Explain why the correct answer is correct..."/></label><div className="form-hint"><CheckCircle2 size={17}/> Select the letter beside the correct answer.</div><button className="primary-btn wide" disabled={!question.trim()||options.some(o=>!o.trim())||!explanation.trim()} onClick={submit}><Save size={17}/>{initial?"Save Question":"Add Question"}</button></div></div>;
}

function SettingsModal({close,theme,setTheme,profile,openProfile}) { return <div className="modal-backdrop"><div className="small-modal settings-modal"><div className="modal-head"><div><h2>Settings</h2><span className="muted">Customize your TOPNOTCHER! experience.</span></div><button onClick={close}><X/></button></div><div className="settings-section"><b>Appearance</b><span>Choose how the app looks across your devices.</span><div className="theme-choice-grid"><button className={theme==="light"?"selected":""} onClick={()=>setTheme("light")}><span className="theme-swatch light-swatch">☀</span><div><b>Light</b><small>Clean off-white workspace</small></div></button><button className={theme==="dark"?"selected":""} onClick={()=>setTheme("dark")}><span className="theme-swatch dark-swatch">☾</span><div><b>Dark</b><small>Lower-light study workspace</small></div></button></div></div><div className="settings-section profile-setting"><div><b>Profile</b><span>{profile.name} · {profile.goal}</span></div><button className="secondary-btn compact" onClick={openProfile}><UserCircle size={17}/> Open Profile</button></div><div className="settings-note"><Settings size={18}/><span>Your profile, theme, and study data are stored separately for your signed-in Google account in this browser.</span></div><button className="primary-btn wide" onClick={close}>Done</button></div></div>; }
function Profile({profile,setProfile,setPage,theme,authUser}) {
  const [draft,setDraft]=useState({...profile, email: profile?.email || authUser?.email || ""});
  const save=()=>setProfile({...draft, email:authUser?.email || draft.email || "", dailyGoal:Number(draft.dailyGoal)||60});
  const initials=(draft.name||"G").trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();
  return <div><PageHeader title="Profile" subtitle="Manage your learner profile and LET study goals." action={<button className="secondary-btn compact" onClick={()=>setPage("progress")}><ArrowLeft size={17}/> Back to Progress</button>}/><div className="profile-layout"><section className="panel profile-card"><div className="profile-hero"><div className="profile-avatar-large">{initials||"G"}</div><div><h2>{draft.name||"Genius Learner"}</h2><p>{draft.goal||"Pass the LET"}</p><span className="tag">{theme==="dark"?"Dark mode":"Light mode"}</span></div></div><div className="profile-form"><label>Display name<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="Your name"/></label><label>Google account email<input value={authUser?.email || draft.email || ""} readOnly aria-readonly="true"/></label><label>Study goal<input value={draft.goal} onChange={e=>setDraft({...draft,goal:e.target.value})} placeholder="e.g. Pass the LET"/></label><label>LET exam date<input type="date" value={draft.examDate} onChange={e=>setDraft({...draft,examDate:e.target.value})}/></label><label>Daily study goal (minutes)<input type="number" min="10" max="720" value={draft.dailyGoal} onChange={e=>setDraft({...draft,dailyGoal:e.target.value})}/></label><button className="primary-btn wide" onClick={save}><Save size={17}/> Save Profile</button></div></section><aside className="panel profile-summary"><h3>Your Study Identity</h3><div className="profile-stat"><span>Daily goal</span><b>{draft.dailyGoal||60} min</b></div><div className="profile-stat"><span>Exam date</span><b>{draft.examDate?new Date(draft.examDate+"T00:00:00").toLocaleDateString():"Not set"}</b></div><div className="profile-stat"><span>Appearance</span><b>{theme==="dark"?"Dark":"Light"}</b></div><div className="profile-tip"><UserCircle size={18}/><span>Your profile and study data are kept separate for your signed-in Google account.</span></div></aside></div></div>;
}

function SessionModal({close,save,initial}) {
  const [title,setTitle]=useState(initial?.title||"Study Session");
  const [date,setDate]=useState(initial?.date||new Date().toISOString().slice(0,10));
  const [type,setType]=useState(initial?.type||"study");
  const [studyCategory,setStudyCategory]=useState(initial?.studyCategory||"gened");
  const [hours,setHours]=useState(initial?.hours ?? 1);
  const [completed,setCompleted]=useState(Boolean(initial?.completed));
  const submit=()=>{if(!title.trim()||!date||!(Number(hours)>0))return;save({title:title.trim(),date,type,studyCategory,hours:Number(hours),completed});};
  return <div className="modal-backdrop"><div className="small-modal schedule-modal">
    <div className="modal-head"><div><h2>{initial?"Edit Schedule":"Add Schedule"}</h2><span className="muted">Plan a study session, mock exam, or daily drill.</span></div><button onClick={close}><X/></button></div>
    <label>Schedule title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Review Assessment of Learning"/></label>
    <label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
    <label>Schedule type<select value={type} onChange={e=>setType(e.target.value)}><option value="study">Study Session</option><option value="mock">Mock Exam</option><option value="drill">Daily Drill</option></select></label>
    <label>Study area<select value={studyCategory} onChange={e=>setStudyCategory(e.target.value)}><option value="gened">GenEd</option><option value="profed">ProfEd</option><option value="majorship">Major</option></select></label>
    <label>Target study hours<input type="number" min="0.5" max="12" step="0.5" value={hours} onChange={e=>setHours(e.target.value)} placeholder="e.g. 2"/><span className="field-hint">How many hours do you want to achieve in this schedule?</span></label>
    {initial&&<label className="schedule-check"><input type="checkbox" checked={completed} onChange={e=>setCompleted(e.target.checked)}/><span>Mark this schedule as done</span></label>}
    <button className="primary-btn wide" disabled={!title.trim()||!date} onClick={submit}><Save size={17}/>{initial?"Save Changes":"Add Schedule"}</button>
  </div></div>;
}

export default App;
