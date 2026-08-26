import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { expandedQuestionBank, QUESTION_BANK_COUNTS } from "./questionBank";
import {
  BarChart3, BookOpen, LibraryBig, CalendarDays, ChevronLeft, ChevronRight, CircleHelp, Folder, FolderPlus,
  LayoutDashboard, Library, ClipboardCheck, UserCircle,
  FileText, Flame, GraduationCap, Layers3, LogOut, Menu, Pencil, Play,
  Plus, Search, Settings, Sparkles, Star, Target, Trash2, Trophy, X, CheckCircle2,
  ArrowLeft, Save, RotateCcw, Upload, WandSparkles, Loader2, Camera, Printer, ScanLine, FileDown, Link2, LockKeyhole, Clock3, Copy, ExternalLink, Video, FileArchive, Download, Highlighter, Eye
} from "lucide-react";

let mathJaxPromise=null;
function ensureMathJax(){
  if(typeof window === "undefined") return Promise.resolve(null);
  if(window.MathJax?.typesetPromise) return Promise.resolve(window.MathJax);
  if(mathJaxPromise) return mathJaxPromise;
  window.MathJax={
    tex:{inlineMath:[["\\(","\\)"],["$","$"]],displayMath:[["\\[","\\]"],["$$","$$"]],processEscapes:true},
    options:{skipHtmlTags:["script","noscript","style","textarea","pre","code"]},
    svg:{fontCache:"global"}
  };
  mathJaxPromise=new Promise((resolve,reject)=>{
    const script=document.createElement("script");
    script.src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
    script.async=true;
    script.onload=()=>resolve(window.MathJax);
    script.onerror=()=>reject(new Error("Math rendering library could not be loaded."));
    document.head.appendChild(script);
  });
  return mathJaxPromise;
}
function hasMathExpression(value){
  const s=String(value??"").trim();
  if(!s) return false;
  // Only invoke MathJax when the content contains explicit mathematical notation.
  // Ordinary prose, dates, currency, and punctuation stay on the normal UI font.
  const explicit = [
    /\\\((?:.|\n)+?\\\)/,
    /\\\[(?:.|\n)+?\\\]/,
    /\$\$(?:.|\n)+?\$\$/,
    /\\(?:frac|dfrac|tfrac|sqrt|sum|int|prod|lim|sin|cos|tan|log|ln|infty|alpha|beta|gamma|delta|theta|lambda|pi|times|div|leq|geq|neq|approx|pm)\b/,
    /\b[A-Za-z]\s*(?:\^|_)\s*(?:\{[^}]+\}|[A-Za-z0-9]+)/,
    /\b\d+\s*[+\-*=/]\s*\d+/,
    /[∑∫√∞≤≥≠≈±×÷]/
  ];
  return explicit.some(pattern=>pattern.test(s));
}

function MathText({text,className=""}){
  const ref=useRef(null);
  const value=String(text??"");
  const shouldRender=hasMathExpression(value);
  useEffect(()=>{
    let alive=true;
    if(!ref.current) return;
    ref.current.textContent=value;
    if(shouldRender){
      ensureMathJax().then(m=>{
        if(alive&&m?.typesetPromise&&ref.current) m.typesetPromise([ref.current]).catch(()=>{});
      }).catch(()=>{});
    }
    return ()=>{alive=false;};
  },[value,shouldRender]);
  return <span ref={ref} className={`${shouldRender?"math-text ":""}${className}`.trim()}>{value}</span>;
}

export function TopnotcherBrand({ compact = false }) {
  return (
    <div className={`topnotcher-brand ${compact ? "topnotcher-brand-compact" : ""}`} aria-label="TOPNOTCHER! By God's Grace">
      <span className="topnotcher-logo-circle" aria-hidden="true"><span>★</span></span>
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

const MATERIAL_DB_NAME = "topnotcher-materials-v1";
function openMaterialDB(){
  return new Promise((resolve,reject)=>{
    if(typeof indexedDB === "undefined") return reject(new Error("IndexedDB is not available in this browser."));
    const req=indexedDB.open(MATERIAL_DB_NAME,1);
    req.onupgradeneeded=()=>{ const db=req.result; if(!db.objectStoreNames.contains("materials")) db.createObjectStore("materials",{keyPath:"id"}); };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error("Could not open material storage."));
  });
}
async function saveDeckMaterial({scope,deckId,type,file,meta={}}){
  const db=await openMaterialDB();
  const item={id:`${scope}::${deckId}::${type}::${Date.now()}::${Math.random().toString(36).slice(2)}`,scope,deckId,type,name:file.name,size:file.size,mime:file.type||"application/octet-stream",createdAt:new Date().toISOString(),blob:file,...meta};
  await new Promise((resolve,reject)=>{const tx=db.transaction("materials","readwrite");tx.objectStore("materials").put(item);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error("Could not save material."));});
  db.close();
  return item;
}
async function saveDeckMaterialBlob({scope,deckId,type,name,blob,mime="application/pdf",meta={}}){
  return saveDeckMaterial({scope,deckId,type,file:new File([blob],name,{type:mime}),meta});
}
async function deleteDeckMaterialsBySource(scope,deckId,sourceId){
  const db=await openMaterialDB();
  const rows=await new Promise((resolve,reject)=>{const tx=db.transaction("materials","readonly");const req=tx.objectStore("materials").getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});
  const ids=rows.filter(x=>x.scope===scope&&String(x.deckId)===String(deckId)&&x.sourceId===sourceId&&x.isHighlightedVersion).map(x=>x.id);
  if(ids.length){
    await new Promise((resolve,reject)=>{const tx=db.transaction("materials","readwrite");const store=tx.objectStore("materials");ids.forEach(id=>store.delete(id));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error("Could not replace highlighted material."));});
  }
  db.close();
}
async function listDeckMaterials(scope,deckId,type){
  const db=await openMaterialDB();
  const rows=await new Promise((resolve,reject)=>{const tx=db.transaction("materials","readonly");const req=tx.objectStore("materials").getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});
  db.close();
  return rows.filter(x=>x.scope===scope && String(x.deckId)===String(deckId) && x.type===type).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
}
async function deleteDeckMaterial(id){
  const db=await openMaterialDB();
  await new Promise((resolve,reject)=>{const tx=db.transaction("materials","readwrite");tx.objectStore("materials").delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error("Could not delete material."));});
  db.close();
}


function TopnotcherMedal({size=28}) {
  return <span className="topnotcher-logo-circle topnotcher-logo-circle-small" style={{width:size,height:size}} aria-hidden="true"><span>★</span></span>;
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
        <span className="avatar avatar-btn">{profile?.avatar || (profile?.name||"G").trim().charAt(0).toUpperCase()}</span>
        <span className="profile-nav-copy"><strong>{profile?.name||"Profile"}</strong><small>View profile</small></span><ChevronRight size={16}/>
      </button>
      <button className="nav-btn signout-btn" title="Sign out" onClick={()=>{if(confirm("Sign out of TOPNOTCHER!?")) onSignOut?.();}}><LogOut size={20}/><span>Sign out</span></button>
    </div>
  </aside>;
}


const SHARE_EXPIRY_MS = 5 * 60 * 60 * 1000;

function bytesToBase64Url(bytes) {
  let binary = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const chunk = 0x8000;
  for (let i = 0; i < arr.length; i += chunk) binary += String.fromCharCode(...arr.subarray(i, i + chunk));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function base64UrlToBytes(value) {
  const base64 = String(value).replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (String(value).length % 4)) % 4);
  const binary = atob(base64);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
async function deriveShareKey(password, salt) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2", salt, iterations:120000, hash:"SHA-256"}, material, {name:"AES-GCM", length:256}, false, ["encrypt","decrypt"]);
}
async function createStudyShareToken(deck, questions, password) {
  if (!crypto?.subtle) throw new Error("Secure browser encryption is unavailable on this device.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveShareKey(password, salt);
  const payload = {
    v: 1,
    exp: Date.now() + SHARE_EXPIRY_MS,
    deckName: deck?.name || "Shared Study Questions",
    category: deck?.category || "gened",
    questions: questions.map(q => ({id:q.id, q:q.q, options:q.options, answer:q.answer, explanation:q.explanation}))
  };
  const encrypted = await crypto.subtle.encrypt({name:"AES-GCM", iv}, key, new TextEncoder().encode(JSON.stringify(payload)));
  return `${bytesToBase64Url(salt)}.${bytesToBase64Url(iv)}.${bytesToBase64Url(new Uint8Array(encrypted))}`;
}
async function openStudyShareToken(token, password) {
  if (!crypto?.subtle) throw new Error("Secure browser decryption is unavailable on this device.");
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("Invalid or incomplete share link.");
  const salt = base64UrlToBytes(parts[0]);
  const iv = base64UrlToBytes(parts[1]);
  const ciphertext = base64UrlToBytes(parts[2]);
  const key = await deriveShareKey(password, salt);
  let plain;
  try {
    plain = await crypto.subtle.decrypt({name:"AES-GCM", iv}, key, ciphertext);
  } catch {
    throw new Error("Incorrect password or invalid share link.");
  }
  const payload = JSON.parse(new TextDecoder().decode(plain));
  if (!payload?.exp || Date.now() >= payload.exp) throw new Error("This study link has expired. Share links are valid for 5 hours.");
  if (!Array.isArray(payload.questions) || !payload.questions.length) throw new Error("This share link contains no study questions.");
  return payload;
}
function clearShareHash() {
  if (window.location.hash.startsWith("#share=")) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}

function App({ authUser, onSignOut }) {
  const [page, setPage] = useState("progress");
  const [theme, setTheme] = usePersistedState(accountStorageKey(authUser, "lgh-theme"), "light");
  const [profile, setProfile] = usePersistedState(accountStorageKey(authUser, "lgh-profile"), {name:authUser?.displayName||"Genius Learner", email:authUser?.email||"", goal:"Pass the LET", examDate:"2026-09-28", dailyGoal:60, avatar:"⭐"});
  useEffect(() => { if (authUser?.email && profile?.email !== authUser.email) setProfile(p => ({...p, email: authUser.email, name: p?.name || authUser.displayName || "Genius Learner"})); }, [authUser?.email]);
  const [category, setCategory] = usePersistedState(accountStorageKey(authUser, "lgh-category"), "gened");
  const [streak, setStreak] = usePersistedState(accountStorageKey(authUser, "lgh-streak"), 0);
  const [lastActiveDate, setLastActiveDate] = usePersistedState(accountStorageKey(authUser, "lgh-last-active-date"), null);
  const [questions, setQuestions] = usePersistedState(accountStorageKey(authUser, "lgh-questions"), seedQuestions);
  const [decks, setDecks] = usePersistedState(accountStorageKey(authUser, "lgh-decks"), seedDecks);
  const [folders, setFolders] = usePersistedState(accountStorageKey(authUser, "lgh-deck-folders"), []);
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
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiDeckId, setAiDeckId] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingDuringStudy, setEditingDuringStudy] = useState(false);
  const [questionDeckId, setQuestionDeckId] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [examSession, setExamSession] = usePersistedState(accountStorageKey(authUser, "lgh-active-exam"), null);
  const [shareDeck, setShareDeck] = useState(null);
  const [shareToken, setShareToken] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [materialViewer, setMaterialViewer] = useState(null);
  const [materialStudyViewer, setMaterialStudyViewer] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const hash = window.location.hash || "";
    if (hash.startsWith("#share=")) {
      setShareToken(decodeURIComponent(hash.slice(7)));
      setShareOpen(true);
    }
  }, []);

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
    const pool = questions.filter(q => q.cat === cat).sort(()=>Math.random()-0.5).slice(0, 20);
    if (pool.length < 20) {
      alert(`Daily Drill requires at least 20 questions in this category. Only ${pool.length} are currently available.`);
      return;
    }
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
    if (data.id) setDecks(ds => ds.map(d => d.id===data.id ? {...d,...data, folderId:data.folderId||null} : d));
    else setDecks(ds => [...ds, {id:Date.now(), name:data.name, category:data.category, description:data.description, folderId:data.folderId||null, flashcards:0}]);
    setShowDeckModal(false); setEditingDeck(null);
  }

  function saveFolder(data) {
    if (data.id) setFolders(fs => fs.map(f => f.id===data.id ? {...f, name:data.name, description:data.description} : f));
    else setFolders(fs => [...fs, {id:Date.now(), name:data.name, description:data.description||""}]);
    setShowFolderModal(false); setEditingFolder(null);
  }

  function deleteFolder(id) {
    const folder = folders.find(f => f.id === id);
    if (!folder || !confirm(`Delete folder “${folder.name}”? Decks inside it will be kept and moved to Uncategorized.`)) return;
    setFolders(fs => fs.filter(f => f.id !== id));
    setDecks(ds => ds.map(d => d.folderId === id ? {...d, folderId:null} : d));
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
    const incomingDeckId = data.deckId ?? (editingDuringStudy ? studyPool?.pool?.find(item=>String(item.id)===String(data.id))?.deckId : null);
    const deck = decks.find(d=>String(d.id)===String(incomingDeckId));
    // During a live study session, allow an existing question to be edited even if
    // the deck reference is temporarily unavailable; preserve its original metadata.
    const existingQuestion = questions.find(q=>String(q.id)===String(data.id));
    if (!deck && !existingQuestion) return;
    const normalized = {
      ...data,
      id:data.id || Date.now(),
      deckId:deck?.id ?? existingQuestion?.deckId ?? incomingDeckId,
      cat:deck?.category ?? existingQuestion?.cat ?? "mixed",
      options:data.options.map(x=>x.trim())
    };
    if (normalized.id && questions.some(q=>String(q.id)===String(normalized.id))) setQuestions(qs=>qs.map(q=>String(q.id)===String(normalized.id)?normalized:q));
    else setQuestions(qs=>[...qs, normalized]);

    // Keep an already-saved flashcard synchronized with its edited question.
    // Only existing flashcards are updated; this does not create new flashcards automatically.
    if (normalized.id) {
      setFlashcards(cards => cards.map(card =>
        String(card.questionId) === String(normalized.id)
          ? {
              ...card,
              front: normalized.q,
              back: normalized.options?.[normalized.answer] || "",
              explanation: normalized.explanation || ""
            }
          : card
      ));
    }

    if (editingDuringStudy && studyPool && normalized.id) {
      setStudyPool(d => {
        if (!d) return d;
        const nextAnswers = {...(d.answers||{})};
        const nextResults = {...(d.results||{})};
        delete nextAnswers[normalized.id];
        delete nextResults[normalized.id];
        const nextPool = d.pool.map(item => String(item.id)===String(normalized.id) ? normalized : item);
        const nextAnswered = Object.keys(nextAnswers).length;
        const nextCorrect = Object.entries(nextAnswers).reduce((n,[id,choice]) => { const item=nextPool.find(x=>String(x.id)===String(id)); return n + (item && Number(choice)===Number(item.answer) ? 1 : 0); },0);
        return {...d,pool:nextPool,answers:nextAnswers,results:nextResults,answered:nextAnswered,correct:nextCorrect,selected:null,checked:false};
      });
    }
    setShowQuestionModal(false); setEditingQuestion(null); setQuestionDeckId(null); setEditingDuringStudy(false);
  }

  function editQuestionDuringStudy(q) {
    // Preserve the exact question being studied so Save & Continue updates the
    // live pool and returns to the same question immediately.
    setQuestionDeckId(q.deckId ?? studyPool?.pool?.find(item=>item.id===q.id)?.deckId ?? null);
    setEditingQuestion({...q});
    setEditingDuringStudy(true);
    setShowQuestionModal(true);
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

  function startSharedStudy(payload) {
    const pool = Array.isArray(payload?.questions) ? payload.questions : [];
    setStudyPool({ label:`Shared · ${payload?.deckName || "Study Questions"}`, pool:[...pool].sort(()=>Math.random()-0.5), index:0, correct:0, answered:0, selected:null, checked:false, answers:{}, results:{}, startedAt:Date.now(), finishedRecorded:false, shared:true });
    setShareOpen(false); setShareToken(null); clearShareHash();
  }

  return <>
    {shareOpen && shareToken && <SharedStudyAccessModal token={shareToken} onClose={()=>{setShareOpen(false);setShareToken(null);clearShareHash();}} onOpen={startSharedStudy} />}
    {shareDeck && <ShareStudyQuestionsModal deck={shareDeck} questions={questions.filter(q=>q.deckId===shareDeck.id)} onClose={()=>setShareDeck(null)} />}
    {studyPool && <StudyModal onSignOut={onSignOut} study={studyPool} onEditQuestion={editQuestionDuringStudy} answer={answerStudy} next={nextStudy} jump={jumpStudy} close={()=>setStudyPool(null)} goTo={goTo} profile={profile} theme={theme}/>}
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
      {page==="decks" && <Decks decks={decks} folders={folders} questions={questions} questionStats={questionStats} flashcards={flashcards} setPage={setPage} openDeck={openDeck} setShowDeckModal={setShowDeckModal} setEditingDeck={setEditingDeck} setShowFolderModal={setShowFolderModal} setEditingFolder={setEditingFolder} deleteFolder={deleteFolder} deleteDeck={deleteDeck}/>} 
      {page==="deck-detail" && selectedDeckId && <DeckDetail deck={decks.find(d=>d.id===selectedDeckId)} questions={questions.filter(q=>q.deckId===selectedDeckId)} questionStats={questionStats} flashcards={flashcards.filter(f=>f.deckId===selectedDeckId)} onGenerateFlashcards={()=>{const r=createFlashcardsForDeck(selectedDeckId);alert(`${r.created} flashcard${r.created===1?"":"s"} created${r.skipped?` · ${r.skipped} choice-dependent question${r.skipped===1?"":"s"} skipped`:""}.`);}} onDeleteFlashcard={deleteFlashcard} onBack={()=>{setSelectedDeckId(null);setPage("decks")}} onAdd={()=>{setQuestionDeckId(selectedDeckId);setEditingQuestion(null);setShowQuestionModal(true)}} onAI={()=>{setAiDeckId(selectedDeckId);setShowAIModal(true)}} onEdit={q=>{setQuestionDeckId(selectedDeckId);setEditingQuestion(q);setShowQuestionModal(true)}} onDelete={id=>setQuestions(qs=>qs.filter(q=>q.id!==id))} onStudy={()=>startStudy(questions.filter(q=>q.deckId===selectedDeckId), `Study · ${decks.find(d=>d.id===selectedDeckId)?.name||"Deck"}`)} onStudyFlashcards={()=>setFlashcardStudyPool(flashcards.filter(f=>f.deckId===selectedDeckId))} onShare={()=>setShareDeck(decks.find(d=>d.id===selectedDeckId))} onOpenMaterials={type=>setMaterialViewer({deckId:selectedDeckId,type})}/>} 
      {page==="mock" && <MockBoard category={category} setCategory={setCategory} mockScores={mockScores} mockHistory={mockHistory} setExamSession={setExamSession} questions={questions}/>}  
      {page==="schedule" && <Schedule sessions={sessions} onAdd={()=>{setEditingSession(null);setShowSessionModal(true)}} onEdit={s=>{setEditingSession(s);setShowSessionModal(true)}} onDelete={id=>setSessions(ss=>ss.filter(s=>s.id!==id && s.scheduleLogId!==id))} onToggleDone={id=>setSessions(ss=>{
        const target=ss.find(s=>s.id===id);
        if(!target) return ss;
        const nextDone=!target.completed;
        const updated=ss.map(s=>s.id===id?{...s,completed:nextDone,completedAt:nextDone?new Date().toISOString():null}:s);
        const existingLog=ss.find(s=>s.scheduleLogId===id);
        if(nextDone && !existingLog){
          updated.push({id:`schedule-log-${id}`,scheduleLogId:id,type:"schedule",title:target.title,studyCategory:target.studyCategory,minutes:Number(target.hours||0)*60,answered:0,correct:0,percentage:100,wrongQuestions:[],finishedAt:new Date().toISOString()});
        } else if(!nextDone && existingLog){
          return updated.filter(s=>s.scheduleLogId!==id);
        }
        return updated;
      })}/>} 

      {showDeckModal && <DeckModal close={()=>{setShowDeckModal(false);setEditingDeck(null)}} save={saveDeck} initial={editingDeck} folders={folders}/>}
      {showFolderModal && <FolderModal close={()=>{setShowFolderModal(false);setEditingFolder(null)}} save={saveFolder} initial={editingFolder}/>} 
      {showAIModal && <AIQuestionModal questions={questions} deck={decks.find(d=>d.id===aiDeckId)} materialScope={accountStorageKey(authUser,"lgh-materials")} onMaterialStored={()=>{}} close={()=>{setShowAIModal(false);setAiDeckId(null)}} saveQuestions={items=>{setQuestions(qs=>[...qs,...items]);setShowAIModal(false);setAiDeckId(null)}}/>}
      {showQuestionModal && <QuestionModal close={()=>{setShowQuestionModal(false);setEditingQuestion(null);setQuestionDeckId(null);setEditingDuringStudy(false)}} save={saveQuestion} initial={editingQuestion} deckId={questionDeckId} duringStudy={editingDuringStudy}/>} 
      {showSessionModal && <SessionModal close={()=>{setShowSessionModal(false);setEditingSession(null)}} save={data=>{
        setSessions(ss=>{
          if(editingSession?.id){
            const updated=ss.map(s=>s.id===editingSession.id?{...s,...data,id:editingSession.id}:s);
            const logIndex=updated.findIndex(s=>s.scheduleLogId===editingSession.id);
            if(logIndex>=0){ updated[logIndex]={...updated[logIndex],title:data.title,studyCategory:data.studyCategory,minutes:Number(data.hours||0)*60}; }
            return updated;
          }
          return [...ss,{id:Date.now(),...data}];
        });
        setShowSessionModal(false);setEditingSession(null);
      }} initial={editingSession}/>} 
      {materialViewer && <DeckMaterialsModal scope={accountStorageKey(authUser,"lgh-materials")} deckId={materialViewer.deckId} type={materialViewer.type} onClose={()=>setMaterialViewer(null)} onStudyPdf={item=>{setMaterialViewer(null);setMaterialStudyViewer(item);}}/>}
      {materialStudyViewer && <PDFStudyViewer scope={accountStorageKey(authUser,"lgh-materials")} item={materialStudyViewer} onClose={()=>setMaterialStudyViewer(null)}/>}
      {showSettings && <SettingsModal close={()=>setShowSettings(false)} theme={theme} setTheme={setTheme} profile={profile} setProfile={setProfile} openProfile={()=>{setShowSettings(false);setPage("profile")}}/>} 
    </main>
    </div>
  </>;
}

function PageHeader({title,subtitle,action}) { return <div className="page-header"><div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>; }

function Dashboard({setPage,streak,category,setCategory,startDrill,stats,decks,questions}) {
  const cat=CATEGORIES.find(c=>c.id===category)||CATEGORIES[0];
  return <div><PageHeader title="Daily Drill" subtitle="20 questions per daily drill — build your review habit daily." action={<div className="streak-pill"><Flame size={20}/> {streak} day streak</div>}/>
    <div className="category-tabs">{CATEGORIES.slice(0,3).map(c=><button className={category===c.id?"selected":""} key={c.id} onClick={()=>setCategory(c.id)}><c.icon size={20}/>{c.label}</button>)}</div>
    <section className="hero-card"><div className="hero-icon"><Target size={42}/></div><h2>{cat.title.replace("General Education","GenEd")} Drill</h2><div className="hero-count">20 questions per drill · {questions.filter(q=>q.cat===cat.id).length} available</div><p>Answer one question at a time. Each correct answer on your first<br className="desktop"/> daily drill keeps your streak alive!</p><button className="primary-btn big" onClick={()=>startDrill(category)}><Play size={20} fill="currentColor"/> Start Drill</button></section>
    <div className="three-cards">{CATEGORIES.slice(0,3).map(c=><button className="info-card" key={c.id} onClick={()=>{setCategory(c.id);startDrill(c.id)}}><div className={"mini-icon "+c.color}><c.icon size={24}/></div><h3>{c.label}</h3><p>{questions.filter(q=>q.cat===c.id).length} questions</p></button>)}</div>
    <div className="streak-banner"><Flame/><div><b>Start your streak today!</b> Answer at least one question correctly to keep your streak alive.</div><strong>{streak} days</strong></div>
    <div className="quick-grid"><button onClick={()=>setPage("progress")}><BarChart3/><span>View progress</span></button><button onClick={()=>setPage("decks")}><Layers3/><span>Open study decks</span></button><button onClick={()=>setPage("mock")}><FileText/><span>Take a mock exam</span></button></div>
  </div>;
}

function DailyDrill({category,setCategory,startDrill,streak,questions}) { return <div><PageHeader title="Daily Drill" subtitle="Practice 20 questions one at a time and keep your streak going." action={<div className="streak-pill"><Flame size={20}/>{streak} day streak</div>}/><div className="drill-layout"><section className="panel"><div className="panel-title"><Target/> Choose a category</div><div className="choice-list">{CATEGORIES.slice(0,3).map(c=><button className={"choice-card "+(category===c.id?"chosen":"")} key={c.id} onClick={()=>setCategory(c.id)}><div className={"mini-icon "+c.color}><c.icon size={23}/></div><div><b>{c.title}</b><span>{Math.min(20, questions.filter(q=>q.cat===c.id).length)} selected · 20 required</span></div>{category===c.id&&<div className="check-dot">✓</div>}</button>)}</div><button className="primary-btn wide" onClick={()=>startDrill(category)}><Play size={19}/> Start {CATEGORIES.find(c=>c.id===category)?.label} Drill</button></section><aside className="panel tips"><h3>How it works</h3><p><Target/> Answer one question at a time.</p><p><Trophy/> A correct first answer helps your daily streak.</p><p><Sparkles/> Review the explanation after submitting.</p></aside></div></div>; }

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
function Decks({decks,folders,questions,questionStats,flashcards,setPage,openDeck,setShowDeckModal,setEditingDeck,setShowFolderModal,setEditingFolder,deleteFolder,deleteDeck}) {
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("All");
  const [folderFilter,setFolderFilter]=useState("All");
  const shown=decks.filter(d=>{
    const categoryOk=filter==="All"||d.category===filter.toLowerCase();
    const folderOk=folderFilter==="All"||(folderFilter==="uncategorized"?!d.folderId:d.folderId===Number(folderFilter));
    return categoryOk&&folderOk&&d.name.toLowerCase().includes(search.toLowerCase());
  });
  return <div>
    <PageHeader title="Study Decks" subtitle={`${decks.length} decks · ${questions.length} questions total`} action={<div className="deck-page-actions"><button className="secondary-btn compact" onClick={()=>{setEditingFolder(null);setShowFolderModal(true)}}><FolderPlus size={17}/> Create Folder</button><button className="primary-btn" onClick={()=>{setEditingDeck(null);setShowDeckModal(true)}}><Plus/> Create Deck</button></div>}/>
    {folders.length>0&&<section className="panel deck-folders-panel"><div className="section-head"><div><h2><Folder size={19}/> Deck Folders</h2><span className="muted">Organize your study decks into folders.</span></div><button className="secondary-btn compact" onClick={()=>{setEditingFolder(null);setShowFolderModal(true)}}><FolderPlus size={15}/> New Folder</button></div><div className="folder-chip-row"><button className={`folder-chip ${folderFilter==="All"?"selected":""}`} onClick={()=>setFolderFilter("All")}><Folder size={16}/> All Decks <span>{decks.length}</span></button>{folders.map(f=><div className="folder-chip-wrap" key={f.id}><button className={`folder-chip ${folderFilter===String(f.id)?"selected":""}`} onClick={()=>setFolderFilter(String(f.id))}><Folder size={16}/> {f.name} <span>{decks.filter(d=>d.folderId===f.id).length}</span></button><button className="folder-delete" title={`Delete ${f.name}`} onClick={()=>deleteFolder(f.id)}><Trash2 size={13}/></button></div>)}<button className={`folder-chip ${folderFilter==="uncategorized"?"selected":""}`} onClick={()=>setFolderFilter("uncategorized")}><Folder size={16}/> Uncategorized <span>{decks.filter(d=>!d.folderId).length}</span></button></div></section>}
    <div className="deck-toolbar"><div className="search"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search decks..."/></div><div className="filters">{["All","GenEd","ProfEd","Majorship","Mixed"].map(x=><button key={x} className={filter===x?"selected":""} onClick={()=>setFilter(x)}>{x}</button>)}</div></div>
    <div className="deck-grid">{shown.map(d=><DeckCard key={d.id} deck={d} folder={folders.find(f=>f.id===d.folderId)} questions={questions} questionStats={questionStats} flashcardCount={flashcards.filter(f=>f.deckId===d.id).length} openDeck={openDeck} edit={()=>{setEditingDeck(d);setShowDeckModal(true)}} deleteDeck={deleteDeck}/>)}</div>
    {!shown.length&&<div className="empty panel"><Layers3/><b>No decks found</b><span>Create a deck or change your search/filter.</span></div>}
  </div>;
}

function DeckCard({deck,folder,questions,questionStats,flashcardCount,openDeck,edit,deleteDeck}) { const qs=questions.filter(q=>q.deckId===deck.id); const answered=qs.filter(q=>questionStats[q.id]?.attempts).length; const pct=qs.length?Math.round(answered/qs.length*100):0; const categoryLabel=deck.category==="mixed"?"Mixed":(CATEGORIES.find(c=>c.id===deck.category)?.label||"Mixed"); return <div className="deck-card"><div className="deck-top"><div className="mini-icon purple"><Layers3/></div><span className="tag">{categoryLabel}</span>{folder&&<span className="tag folder-tag"><Folder size={12}/> {folder.name}</span>}<div className="deck-actions"><button title="Edit" onClick={edit}><Pencil size={17}/></button><button title="Delete" onClick={()=>deleteDeck(deck.id)}><Trash2 size={17}/></button></div></div><h3>{deck.name}</h3><p>{deck.description||"Review deck"}</p><div className="deck-meta"><span><FileText/> {qs.length} Q</span><span><Layers3/> {flashcardCount||0} FC</span></div><div className="progress-track"><i style={{width:pct+"%"}}/></div><div className="deck-percent">{pct}%</div><button className="secondary-btn" onClick={()=>openDeck(deck.id)}><Play size={17}/> Open Deck</button></div>; }


function pdfEscape(text){
  return String(text ?? "").replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)").replace(/[^\x20-\x7E]/g,"?");
}
function wrapPdfText(text, maxChars=92){
  const words=String(text??"").split(/\s+/).filter(Boolean); const lines=[]; let line="";
  for(const word of words){ if((line+" "+word).trim().length>maxChars && line){ lines.push(line); line=word; } else line=(line+" "+word).trim(); }
  if(line) lines.push(line); return lines.length?lines:[""];
}
function downloadDeckQuestionsPdf(deck, questions){
  if(!questions?.length){ alert("This deck has no questions to download."); return; }
  const W=612,H=792, margin=42, leading=15, pageWidth=W-margin*2;
  const pages=[]; let ops=[]; let y=H-margin;
  const addPage=()=>{ if(ops.length) pages.push(ops); ops=[]; y=H-margin; };
  const text=(str,x,yy,size=10,bold=false)=>{ ops.push(`${bold?"/F2":"/F1"} ${size} Tf 0 g 1 0 0 1 ${x.toFixed(1)} ${yy.toFixed(1)} Tm (${pdfEscape(str)}) Tj`); };
  const line=()=>{ ops.push(`0.82 G 0.7 w ${margin} ${y.toFixed(1)} m ${W-margin} ${y.toFixed(1)} l S`); };
  text("TOPNOTCHER! — STUDY DECK QUESTIONS",margin,y,15,true); y-=22;
  text(deck?.name||"Study Deck",margin,y,12,true); y-=16;
  text(`${questions.length} questions · ${deck?.category==="mixed"?"Mixed":deck?.category||""}`,margin,y,9,false); y-=14; line(); y-=18;
  questions.forEach((q,idx)=>{
    const blocks=[{t:`${idx+1}. ${q.q}`,size:10,bold:true},{t:"",size:9}];
    q.options.forEach((o,i)=>blocks.push({t:`${String.fromCharCode(65+i)}. ${o}`,size:9,bold:false}));
    blocks.push({t:`Correct answer: ${q.options[q.answer]||""}`,size:9,bold:true});
    if(q.explanation) blocks.push({t:`Rationale: ${q.explanation}`,size:9,bold:false});
    for(const b of blocks){
      const lines=wrapPdfText(b.t,b.bold?86:92);
      for(const ln of lines){ if(y<margin+28){ addPage(); } text(ln,margin,y,b.size,b.bold); y-=leading; }
      if(b.t==="") y-=3;
    }
    y-=7; if(y<margin+55) addPage();
  });
  addPage();
  const objects=[]; const addObj=body=>{objects.push(body);return objects.length;};
  const font1=addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const font2=addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pageIds=[]; const contentIds=[];
  for(const pageOps of pages){ const stream=pageOps.join("\n"); contentIds.push(addObj(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)); pageIds.push(addObj("")); }
  const pagesId=addObj(""); const catalogId=addObj("");
  // Fill page and pages objects now that IDs are known.
  const pageBodies=pageIds.map((id,i)=>`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`);
  pageIds.forEach((id,i)=>objects[id-1]=pageBodies[i]);
  objects[pagesId-1]=`<< /Type /Pages /Kids [${pageIds.map(id=>id+" 0 R").join(" ")}] /Count ${pageIds.length} >>`;
  objects[catalogId-1]=`<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  let pdf="%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", offsets=[0];
  for(let i=0;i<objects.length;i++){ offsets[i+1]=pdf.length; pdf+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`; }
  const xref=pdf.length; pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`; for(let i=1;i<=objects.length;i++) pdf+=`${String(offsets[i]).padStart(10,"0")} 00000 n \n`;
  pdf+=`trailer\n<< /Size ${objects.length+1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const blob=new Blob([pdf],{type:"application/pdf"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${(deck?.name||"study-deck").replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"")}-questions.pdf`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500);
}

function DeckDetail({deck,questions,questionStats,flashcards,onGenerateFlashcards,onDeleteFlashcard,onBack,onAdd,onAI,onEdit,onDelete,onStudy,onStudyFlashcards,onShare,onOpenMaterials}) {
  const [selectedQuestion,setSelectedQuestion]=useState(null);
  const [selectedFlashcard,setSelectedFlashcard]=useState(null);
  const [activeTab,setActiveTab]=useState("questions");
  const [deckSearch,setDeckSearch]=useState("");
  const [scannerOpen,setScannerOpen]=useState(false);
  const [scanPairs,setScanPairs]=useState([]);
  const [scanRunning,setScanRunning]=useState(false);
  const scanStopwords=new Set("the a an and or of to in on for from by with at as is are was were be been being which what when where who whom why how that this these those their its it into than then do does did can could should would may might will shall best most more less about through during between among after before not no nor only primarily generally generally considered used using based very each all any one two three following statement describes purpose process approach principle practice source question answer correct teacher learner students student concept role effect factor example");
  const normalizeScan=v=>String(v||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
  const stemScan=w=>{let x=w; if(x.length>5&&x.endsWith("ies"))x=x.slice(0,-3)+"y"; else if(x.length>5&&x.endsWith("ing"))x=x.slice(0,-3); else if(x.length>4&&x.endsWith("ed"))x=x.slice(0,-2); else if(x.length>4&&x.endsWith("es"))x=x.slice(0,-2); else if(x.length>4&&x.endsWith("s"))x=x.slice(0,-1); return x;};
  const scanTokens=v=>normalizeScan(v).split(" ").map(stemScan).filter(w=>w.length>2&&!scanStopwords.has(w));
  const scanVector=v=>{const m=new Map();scanTokens(v).forEach(t=>m.set(t,(m.get(t)||0)+1));return m;};
  const cosineScan=(a,b)=>{const A=scanVector(a),B=scanVector(b);if(!A.size||!B.size)return 0;let dot=0,na=0,nb=0;A.forEach((v,k)=>{na+=v*v;dot+=v*(B.get(k)||0)});B.forEach(v=>nb+=v*v);return dot/Math.sqrt(na*nb)||0;};
  const charNgramScan=v=>{const x=`  ${normalizeScan(v)}  `;const m=new Map();for(let i=0;i<x.length-2;i++){const g=x.slice(i,i+3);m.set(g,(m.get(g)||0)+1)}return m;};
  const charCosineScan=(a,b)=>{const A=charNgramScan(a),B=charNgramScan(b);let dot=0,na=0,nb=0;A.forEach((v,k)=>{na+=v*v;dot+=v*(B.get(k)||0)});B.forEach(v=>nb+=v*v);return dot/Math.sqrt(na*nb)||0;};
  const sequenceScan=(a,b)=>{const A=normalizeScan(a).split(" "),B=normalizeScan(b).split(" ");if(!A.length||!B.length)return 0;const dp=Array(B.length+1).fill(0).map(()=>Array(A.length+1).fill(0));for(let i=1;i<=B.length;i++)for(let j=1;j<=A.length;j++)dp[i][j]=B[i-1]===A[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);return (2*dp[B.length][A.length])/(A.length+B.length);};
  const keyOverlapScan=(a,b)=>{const A=new Set(scanTokens(a)),B=new Set(scanTokens(b));if(!A.size||!B.size)return 0;let inter=0;A.forEach(t=>{if(B.has(t))inter++});return inter/Math.min(A.size,B.size);};
  const scanSimilarity=(a,b)=>{
    const qA=a.q||"",qB=b.q||"";
    const qCos=cosineScan(qA,qB), qChar=charCosineScan(qA,qB), qSeq=sequenceScan(qA,qB), qKey=keyOverlapScan(qA,qB);
    const answerA=a.options?.[a.answer]||"", answerB=b.options?.[b.answer]||"";
    const expA=a.explanation||"", expB=b.explanation||"";
    const contextCos=cosineScan(`${answerA} ${expA}`,`${answerB} ${expB}`);
    const contextChar=charCosineScan(`${answerA} ${expA}`,`${answerB} ${expB}`);
    const score=Math.max(qChar*0.34+qCos*0.28+qSeq*0.16+qKey*0.12+contextCos*0.07+contextChar*0.03, qKey*0.55+contextCos*0.3+qChar*0.15);
    const confidence=Math.min(0.99,Math.max(0,score));
    return {score:confidence,signals:{qCos,qChar,qSeq,qKey,contextCos,contextChar}};
  };
  const runQuestionScanner=()=>{
    setScanRunning(true);
    setTimeout(()=>{
      const pairs=[];
      for(let i=0;i<questions.length;i++) for(let j=i+1;j<questions.length;j++){
        const result=scanSimilarity(questions[i],questions[j]);
        // Strict scanner: 70%+ is flagged; 60%+ is also flagged when the same
        // answer/explanation context strongly indicates the same tested fact.
        const strict=result.score>=0.70 || (result.score>=0.60 && result.signals.contextCos>=0.68 && result.signals.qKey>=0.55);
        if(strict) pairs.push({a:questions[i],b:questions[j],score:result.score,signals:result.signals});
      }
      pairs.sort((a,b)=>b.score-a.score);
      setScanPairs(pairs); setScanRunning(false); setScannerOpen(true);
    },50);
  };
  const deleteScannedQuestion=id=>{ onDelete(id); setScanPairs(ps=>ps.filter(p=>p.a.id!==id&&p.b.id!==id)); };
  const normalizedDeckSearch=deckSearch.trim().toLowerCase();
  const filteredQuestions=normalizedDeckSearch
    ? questions.filter(q=>[q.q,q.explanation,...(q.options||[])].some(v=>String(v||"").toLowerCase().includes(normalizedDeckSearch)))
    : questions;
  const filteredFlashcards=normalizedDeckSearch
    ? flashcards.filter(card=>[card.front,card.back,card.explanation].some(v=>String(v||"").toLowerCase().includes(normalizedDeckSearch)))
    : flashcards;
  if(!deck) return null;
  const reviewed=questions.filter(q=>questionStats[q.id]?.attempts).length;
  const accuracy=questions.reduce((sum,q)=>sum+(questionStats[q.id]?.correct||0),0);
  const attempts=questions.reduce((sum,q)=>sum+(questionStats[q.id]?.attempts||0),0);
  const pct=questions.length?Math.round(reviewed/questions.length*100):0;
  return <div>
    <PageHeader title={deck.name} subtitle={<><span>{deck.category==="mixed"?"Mixed":(CATEGORIES.find(c=>c.id===deck.category)?.label||"Mixed")} · {deck.description||"Review deck"}</span><span className="date-badge">{questions.length} questions</span></>} action={<div className="detail-actions"><button className="secondary-btn compact" onClick={onBack}><ArrowLeft size={17}/> Back</button><button className="secondary-btn" onClick={onAI}><WandSparkles size={17}/> AI Generate</button><button className="primary-btn" onClick={onAdd}><Plus/> Add Question</button></div>}/>
    <div className="deck-detail-stats"><div><b>{questions.length}</b><span>Questions</span></div><div><b>{reviewed}</b><span>Reviewed</span></div><div><b>{pct}%</b><span>Deck progress</span></div><div><b>{attempts?Math.round(accuracy/attempts*100):0}%</b><span>Accuracy</span></div></div>
    <div className="detail-toolbar deck-action-row">
      <div className="detail-primary-actions">
        <button className="primary-btn study-now-inline" onClick={onStudy} disabled={!questions.length}><Play size={17}/> Study Questions Now</button>
        <button className="secondary-btn study-now-inline" onClick={onStudyFlashcards} disabled={!flashcards.length}><BookOpen size={17}/> Study Flashcards Now</button>
        <button className="secondary-btn study-now-inline share-study-btn" onClick={onShare} disabled={!questions.length}><Link2 size={17}/> Share Study Questions</button>
        <div className="deck-content-tabs" role="tablist" aria-label="Deck content">
          <button role="tab" aria-selected={activeTab==="questions"} className={activeTab==="questions"?"active":""} onClick={()=>setActiveTab("questions")}><FileText size={17}/> Questions <span>{questions.length}</span></button>
          <button role="tab" aria-selected={activeTab==="flashcards"} className={activeTab==="flashcards"?"active":""} onClick={()=>setActiveTab("flashcards")}><Layers3 size={17}/> Flashcards <span>{flashcards.length}</span></button><button type="button" className="deck-material-tab study-materials-btn" onClick={()=>onOpenMaterials("study")}><FileArchive size={17}/> Study Materials</button><button type="button" className="deck-material-tab video-materials-btn" onClick={()=>onOpenMaterials("video")}><Video size={17}/> Video Materials</button>
        </div>
      </div>
    </div>
    {activeTab==="questions"&&<section className="panel question-bank"><div className="section-head"><div><h2>Questions</h2><span className="muted">{filteredQuestions.length} of {questions.length} · click a question to view it</span></div><div className="question-bank-actions"><div className="deck-search-box"><Search size={16}/><input value={deckSearch} onChange={e=>setDeckSearch(e.target.value)} placeholder="Search questions or flashcards..." aria-label="Search this deck"/></div><button className="secondary-btn compact" onClick={()=>downloadDeckQuestionsPdf(deck,questions)} disabled={!questions.length}><FileDown size={16}/> Download Questions PDF</button><button className="secondary-btn compact question-scanner-btn" onClick={runQuestionScanner} disabled={questions.length<2}><Search size={16}/> {scanRunning?"Scanning…":"Scan for Similar Questions"}</button></div></div>
      {filteredQuestions.length?<div className="question-list">{filteredQuestions.map((q,i)=><div className="question-row" key={q.id}>
        <div className="question-number">{i+1}</div>
        <button className="question-row-main question-row-view" onClick={()=>setSelectedQuestion(q)}><b>{q.q}</b><span>{q.options.length} choices · {questionStats[q.id]?.attempts||0} attempts</span></button>
        <div className="question-row-actions"><button onClick={()=>onEdit(q)} title="Edit"><Pencil size={17}/></button><button onClick={()=>onDelete(q.id)} title="Delete"><Trash2 size={17}/></button></div>
      </div>)}</div>:<div className="empty"><FileText/><b>No questions yet</b><span>Add a multiple-choice question to this deck.</span><button className="primary-btn" onClick={onAdd}><Plus/> Add First Question</button></div>}
    </section>}
    {activeTab==="flashcards"&&<section className="panel flashcard-bank"><div className="section-head"><div><h2>Flashcards</h2><span className="muted">{filteredFlashcards.length} of {flashcards.length} created · choice-dependent questions are excluded</span></div><div className="flashcard-section-actions"><div className="deck-search-box"><Search size={16}/><input value={deckSearch} onChange={e=>setDeckSearch(e.target.value)} placeholder="Search questions or flashcards..." aria-label="Search this deck"/></div></div><div className="flashcard-section-actions"><button className="secondary-btn compact" onClick={onGenerateFlashcards} disabled={!questions.length}><Layers3 size={16}/> Generate from Questions</button>{flashcards.length>0&&<button className="primary-btn compact" onClick={onStudyFlashcards}><BookOpen size={16}/> Study All</button>}</div></div>
      {filteredFlashcards.length?<div className="flashcard-grid">{filteredFlashcards.map(card=><FlashcardCard key={card.id} card={card} onDelete={onDeleteFlashcard} onOpen={()=>setSelectedFlashcard(card)}/>)}</div>:<div className="flashcard-empty"><Layers3/><b>No flashcards yet</b><span>Generate flashcards from the questions in this deck.</span></div>}
    </section>}
    {scannerOpen&&createPortal(<div className="modal-backdrop scanner-backdrop" onClick={()=>setScannerOpen(false)}><div className="small-modal question-scanner-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="question-label">QUESTION SCANNER</span><h2>{scanPairs.length ? `${scanPairs.length} similar pair${scanPairs.length===1?"":"s"} found` : "No redundant questions found"}</h2><span className="muted">Strict similarity scan: exact duplicates, close rewordings, shared key concepts, answer/explanation context, and wording patterns are compared. Review flagged pairs before deleting.</span></div><button onClick={()=>setScannerOpen(false)}><X/></button></div>{scanPairs.length?<div className="scanner-list">{scanPairs.map((pair,i)=><div className="scanner-pair" key={`${pair.a.id}-${pair.b.id}`}><div className="scanner-score">{Math.round(pair.score*100)}% similar</div><div className="scanner-q"><b>Question {questions.findIndex(q=>q.id===pair.a.id)+1}</b><p>{pair.a.q}</p><button className="danger-outline" onClick={()=>deleteScannedQuestion(pair.a.id)}><Trash2 size={14}/> Delete this question</button></div><div className="scanner-vs">VS</div><div className="scanner-q"><b>Question {questions.findIndex(q=>q.id===pair.b.id)+1}</b><p>{pair.b.q}</p><button className="danger-outline" onClick={()=>deleteScannedQuestion(pair.b.id)}><Trash2 size={14}/> Delete this question</button></div></div>)}</div>:<div className="scanner-empty"><CheckCircle2 size={30}/><b>Deck looks clean</b><span>No questions crossed the redundancy threshold.</span></div>}<div className="modal-foot"><button className="secondary-btn" onClick={()=>setScannerOpen(false)}>Close</button></div></div></div>, document.body)}
    {selectedQuestion&&createPortal(<div className="modal-backdrop question-view-backdrop" onClick={()=>setSelectedQuestion(null)}><div className="small-modal question-view-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="question-label">QUESTION</span><h2>Question {questions.findIndex(x=>x.id===selectedQuestion.id)+1}</h2></div><button onClick={()=>setSelectedQuestion(null)}><X/></button></div><div className="question-view-content"><h3><MathText text={selectedQuestion.q}/></h3><div className="question-view-options">{selectedQuestion.options.map((o,i)=><div className={i===selectedQuestion.answer?"correct":""} key={i}><b>{String.fromCharCode(65+i)}.</b><span><MathText text={o}/></span></div>)}</div><div className="question-view-rationale"><CheckCircle2 size={18}/><div><b>Correct answer: <MathText text={selectedQuestion.options[selectedQuestion.answer]}/></b><p><MathText text={selectedQuestion.explanation}/></p></div></div></div><div className="modal-foot"><button className="secondary-btn" onClick={()=>setSelectedQuestion(null)}>Close</button><button className="primary-btn" onClick={()=>{setSelectedQuestion(null);onEdit(selectedQuestion)}}><Pencil size={16}/> Edit Question</button></div></div></div>, document.body)}
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


function openPaperAnswerSheet(session, autoPrint=true){
  const total=session.pool.length;
  const pages=[];
  for(let start=0; start<total; start+=100) pages.push(session.pool.slice(start,start+100));
  const letters=["A","B","C","D"];
  const pageHtml=pages.map((page,pi)=>{
    const columns=[0,1,2,3].map(ci=>page.slice(ci*25,(ci+1)*25));
    return `<section class="answer-sheet-page">
      <div class="sheet-border"></div>
      <div class="reg-marker reg-tl" aria-hidden="true"></div><div class="reg-marker reg-tr" aria-hidden="true"></div><div class="reg-marker reg-bl" aria-hidden="true"></div><div class="reg-marker reg-br" aria-hidden="true"></div>
      <header class="sheet-head">
        <div class="sheet-practice">FOR PRACTICE ONLY</div>
        <div class="sheet-brand"><div class="sheet-logo">★</div><b>TOPNOTCHER!</b><small>LET PRACTICE ANSWER SHEET</small></div>
        <div class="sheet-meta"><b>${session.category==='full'?'FULL BOARD EXAM':session.category.toUpperCase()}</b><span>PAGE ${pi+1} OF ${pages.length}</span><span>ITEMS ${pi*100+1}–${pi*100+page.length}</span></div>
      </header>
      <div class="sheet-instructions"><b>Instructions:</b> Use a No. 2 pencil. Completely shade one bubble for each item. Do not mark more than one answer. This is a TOPNOTCHER practice answer sheet and is not an official PRC/LET form. Keep all four black registration markers visible when scanning.</div>
      <div class="sheet-columns">
        ${columns.map((col,ci)=>`<div class="sheet-column"><div class="sheet-column-head">${pi*100+ci*25+1}–${Math.min(pi*100+(ci+1)*25,total)} <span class="sheet-letters">A&nbsp;&nbsp;B&nbsp;&nbsp;C&nbsp;&nbsp;D</span></div>${col.map((q,ri)=>{const n=pi*100+ci*25+ri+1;return `<div class="sheet-row"><b>${n}</b>${letters.map(()=>`<span class="sheet-bubble"></span>`).join('')}</div>`}).join('')}</div>`).join('')}
      </div>
      <footer class="sheet-footer"><span>Write lightly and erase completely.</span><span>Practice only · TOPNOTCHER! By God's Grace</span></footer>
    </section>`;
  }).join('');
  const w=window.open('', '_blank', 'noopener,noreferrer,width=1000,height=800');
  if(!w){ alert('Please allow pop-ups to print or download the answer sheet.'); return; }
  w.document.write(`<!doctype html><html><head><title>TOPNOTCHER LET Practice Answer Sheet</title><style>
    *{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#17243a;background:#eee}.answer-sheet-page{position:relative;width:8.5in;min-height:11in;background:#fff;margin:0 auto 16px;padding:.28in .35in .32in;overflow:hidden}.sheet-border{position:absolute;inset:.14in;border:2px solid #1e4f95;pointer-events:none}
    .reg-marker{position:absolute;width:.18in;height:.18in;background:#050505;border-radius:0;z-index:5}.reg-tl{left:.24in;top:.24in}.reg-tr{right:.24in;top:.24in}.reg-bl{left:.24in;bottom:.24in}.reg-br{right:.24in;bottom:.24in}
    .sheet-head{display:grid;grid-template-columns:1fr 1.6fr 1.2fr;gap:12px;align-items:center;border-bottom:2px solid #1e4f95;padding:.12in .08in .1in}.sheet-practice{font-size:14px;font-weight:800;color:#d71920;text-align:center;line-height:1.15}.sheet-brand{text-align:center}.sheet-logo{margin:0 auto 3px;width:32px;height:32px;border-radius:50%;background:#102a56;color:#ffd447;display:grid;place-items:center;font-size:17px}.sheet-brand b{display:block;font-size:17px;letter-spacing:.05em}.sheet-brand small{display:block;font-size:8px;color:#4b6380;letter-spacing:.08em;margin-top:2px}.sheet-meta{display:flex;flex-direction:column;gap:3px;text-align:right;font-size:9px;color:#466080}.sheet-meta b{font-size:11px;color:#1e4f95}.sheet-instructions{margin:.08in 0 .1in;border:1px solid #a9bcd5;background:#f5f8fd;padding:7px 9px;font-size:8.5px;line-height:1.35}.sheet-columns{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.sheet-column{border:1px solid #b8c7da;padding:5px 5px 4px}.sheet-column-head{font-weight:800;text-align:center;color:#1e4f95;font-size:8px;border-bottom:1px solid #d8e0ea;padding-bottom:4px;margin-bottom:3px}.sheet-row{display:grid;grid-template-columns:20px repeat(4,1fr);align-items:center;height:22px;border-bottom:1px dotted #e4e9f0;font-size:8px}.sheet-row b{text-align:right;padding-right:4px;color:#314b69}.sheet-bubble{width:14px;height:14px;border:1.4px solid #4f6b8d;border-radius:50%;display:grid;place-items:center;font-size:6.5px;color:#52708f;justify-self:center}.sheet-footer{position:absolute;left:.35in;right:.35in;bottom:.24in;display:flex;justify-content:space-between;border-top:1px solid #b8c7da;padding-top:5px;font-size:7.5px;color:#60748f}.sheet-toolbar{position:sticky;top:12px;z-index:20;width:min(8.5in,calc(100vw - 24px));margin:0 auto 14px;background:#fff;border:1px solid #d7e0ec;border-radius:14px;box-shadow:0 8px 28px rgba(18,42,78,.12);padding:10px 12px;display:flex;justify-content:space-between;align-items:center;gap:12px;font:13px Arial;color:#17243a}.sheet-toolbar div:first-child{display:flex;flex-direction:column;gap:2px}.sheet-toolbar span{font-size:11px;color:#60748f}.sheet-toolbar button{border:0;border-radius:9px;padding:8px 12px;background:#1e4f95;color:#fff;font-weight:700;cursor:pointer;margin-left:6px}.sheet-toolbar button.ghost{background:#eef3fa;color:#1e4f95}@media print{body{background:#fff;padding:0}.sheet-toolbar{display:none}.answer-sheet-page{margin:0;page-break-after:always}.answer-sheet-page:last-child{page-break-after:auto}}@media screen{body{padding:15px}.answer-sheet-page{box-shadow:0 8px 30px rgba(0,0,0,.12)}}
  </style></head><body>${autoPrint?'':`<div class="sheet-toolbar"><div><b>TOPNOTCHER! Practice Answer Sheet</b><span>${total} items · ${pages.length} page${pages.length===1?'':'s'}</span></div><div><button onclick="window.print()">Print / Save as PDF</button><button onclick="window.close()" class="ghost">Close</button></div></div>`}${pageHtml}<script>window.onload=()=>{${autoPrint?'setTimeout(()=>window.print(),250)':'setTimeout(()=>window.scrollTo({top:0,behavior:"instant"}),0)'}};</script></body></html>`);
  w.document.close();
}

function PaperScanModal({session,onClose,onVerified}){
  const [files,setFiles]=useState([]);
  const [scanning,setScanning]=useState(false);
  const [result,setResult]=useState(null);
  const [cameraOpen,setCameraOpen]=useState(false);
  const videoRef=React.useRef(null);
  const streamRef=React.useRef(null);
  const total=session.pool.length;
  const expectedPages=Math.ceil(total/100);
  useEffect(()=>()=>{streamRef.current?.getTracks?.().forEach(t=>t.stop())},[]);
  useEffect(()=>{
    if(!cameraOpen)return;
    navigator.mediaDevices?.getUserMedia?.({video:{facingMode:{ideal:'environment'},width:{ideal:1920}},audio:false}).then(stream=>{streamRef.current=stream;if(videoRef.current){videoRef.current.srcObject=stream;videoRef.current.play().catch(()=>{});}}).catch(()=>setCameraOpen(false));
  },[cameraOpen]);
  const capture=()=>{const v=videoRef.current;if(!v)return;const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);c.toBlob(blob=>{if(blob)setFiles(fs=>[...fs,new File([blob],`camera-page-${fs.length+1}.jpg`,{type:'image/jpeg'})]);setCameraOpen(false);streamRef.current?.getTracks?.().forEach(t=>t.stop());streamRef.current=null;},'image/jpeg',.92)};
  const solveLinear=(A,b)=>{
    const n=b.length;
    const M=A.map((row,i)=>[...row,b[i]]);
    for(let col=0;col<n;col++){
      let pivot=col;
      for(let r=col+1;r<n;r++) if(Math.abs(M[r][col])>Math.abs(M[pivot][col])) pivot=r;
      if(Math.abs(M[pivot][col])<1e-10) throw new Error('Unable to solve registration transform');
      [M[col],M[pivot]]=[M[pivot],M[col]];
      const d=M[col][col];
      for(let j=col;j<=n;j++) M[col][j]/=d;
      for(let r=0;r<n;r++) if(r!==col){const f=M[r][col];if(Math.abs(f)<1e-12)continue;for(let j=col;j<=n;j++)M[r][j]-=f*M[col][j];}
    }
    return M.map(r=>r[n]);
  };
  const homographyFrom4=(src,dst)=>{
    const A=[],b=[];
    src.forEach((p,i)=>{const [x,y]=p,[u,v]=dst[i];A.push([x,y,1,0,0,0,-u*x,-u*y]);b.push(u);A.push([0,0,0,x,y,1,-v*x,-v*y]);b.push(v);});
    const h=solveLinear(A,b);return [...h,1];
  };
  const mapH=(h,x,y)=>{const d=h[6]*x+h[7]*y+1;return [(h[0]*x+h[1]*y+h[2])/d,(h[3]*x+h[4]*y+h[5])/d]};
  const detectRegistrationMarkers=(gray,w,h)=>{
    const expected=[[.039,.033],[.961,.033],[.039,.967],[.961,.967]];
    const N=w*h, binary=new Uint8Array(N), integral=new Float64Array((w+1)*(h+1));
    for(let y=0;y<h;y++){let row=0;for(let x=0;x<w;x++){const dark=gray(x,y)<95?1:0;binary[y*w+x]=dark;row+=dark;integral[(y+1)*(w+1)+(x+1)]=integral[y*(w+1)+(x+1)]+row;}}
    const sum=(x1,y1,x2,y2)=>integral[y2*(w+1)+x2]-integral[y1*(w+1)+x2]-integral[y2*(w+1)+x1]+integral[y1*(w+1)+x1];
    const side=Math.max(12,Math.round(Math.min(w,h)*.018));
    const half=Math.floor(side/2);
    const found=[];
    expected.forEach(([ex,ey])=>{
      const minX=Math.max(half,Math.round(w*(ex<.5?.005:.82))),maxX=Math.min(w-half,Math.round(w*(ex<.5?.18:.995)));
      const minY=Math.max(half,Math.round(h*(ey<.5?.005:.82))),maxY=Math.min(h-half,Math.round(h*(ey<.5?.18:.995)));
      let best={score:0,x:0,y:0};
      const step=Math.max(2,Math.round(side/6));
      for(let cy=minY;cy<=maxY;cy+=step) for(let cx=minX;cx<=maxX;cx+=step){
        const x1=cx-half,y1=cy-half,x2=cx+half+1,y2=cy+half+1,area=(x2-x1)*(y2-y1),score=sum(x1,y1,x2,y2)/area;
        if(score>best.score) best={score,x:cx,y:cy};
      }
      if(best.score<.55) throw new Error('Registration markers not detected');
      found.push({x:best.x,y:best.y,score:best.score});
    });
    const minDist=Math.min(...found.flatMap((a,i)=>found.slice(i+1).map(b=>Math.hypot(a.x-b.x,a.y-b.y))));
    if(minDist<Math.min(w,h)*.35) throw new Error('Registration markers are too close or ambiguous');
    return found;
  };
  const scanImage=(file,pageIndex)=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{try{const max=1800,scale=Math.min(1,max/Math.max(img.width,img.height));const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);const data=ctx.getImageData(0,0,w,h).data;const gray=(x,y)=>{const xx=Math.max(0,Math.min(w-1,Math.round(x))),yy=Math.max(0,Math.min(h-1,Math.round(y)));const i=(xx+yy*w)*4;return data[i]*.299+data[i+1]*.587+data[i+2]*.114};
      const markers=detectRegistrationMarkers(gray,w,h);const src=[[.039,.033],[.961,.033],[.039,.967],[.961,.967]],dst=markers.map(m=>[m.x,m.y]),H=homographyFrom4(src,dst);const answers=[];const start=pageIndex*100;const pageCount=Math.min(100,total-start);
      for(let local=0;local<pageCount;local++){const col=Math.floor(local/25),row=local%25;const y=.132+(row/24)*.515;let best=-1,bestScore=0,second=0;for(let oi=0;oi<4;oi++){const x=.092+col*.232+oi*.052;const [cx,cy]=mapH(H,x,y);let dark=0,count=0;const rx=Math.max(3,Math.round(Math.min(w,h)*.006));for(let yy=-rx;yy<=rx;yy++)for(let xx=-rx;xx<=rx;xx++){const val=gray(cx+xx,cy+yy);if(val<145)dark++;count++;}const score=dark/count;if(score>bestScore){second=bestScore;bestScore=score;best=oi}else if(score>second)second=score;}answers.push({questionIndex:start+local,choice:bestScore>.12&&bestScore-second>.025?best:null,confidence:Math.round(bestScore*100)});}resolve({answers,markers:markers.map(m=>({x:m.x,y:m.y,confidence:Math.round(m.score*100)}))})}catch(e){reject(e)}};img.onerror=reject;img.src=URL.createObjectURL(file)});

  const runScan=async()=>{if(!files.length)return;setScanning(true);setResult(null);try{const pages=[];for(let i=0;i<files.length;i++)pages.push(await scanImage(files[i],i));const all=pages.flatMap(p=>p.answers);const byIndex=new Map(all.map(a=>[a.questionIndex,a]));const itemResults=session.pool.map((q,i)=>{const a=byIndex.get(i);const selected=a?.choice??undefined;return {questionId:q.id,selected,correct:q.answer,ok:selected!==undefined&&selected===q.answer,confidence:a?.confidence||0};});const answered=itemResults.filter(r=>r.selected!==undefined).length;const correct=itemResults.filter(r=>r.ok).length;const ambiguous=itemResults.length-answered;const score=Math.round(correct/total*100);const scan={correct,answered,score,ambiguous,itemResults,scannedPages:files.length,registrationVerified:true};setResult(scan);onVerified(scan)}catch(e){alert('The answer sheet could not be read reliably. Try a clearer, flatter photo with the full sheet visible.')}finally{setScanning(false)}};
  return <div className="modal-backdrop"><div className="small-modal paper-scan-modal"><div className="modal-head"><div><h2><ScanLine size={20}/> Scan Paper Answer Sheet</h2><span className="muted">Upload or photograph the TOPNOTCHER practice sheet. {expectedPages} page{expectedPages===1?'':'s'} expected.</span></div><button onClick={onClose}><X/></button></div>{cameraOpen?<div className="camera-box"><video ref={videoRef} playsInline muted/><div className="camera-guide">Fit the whole answer sheet inside the frame and keep all 4 black registration markers visible</div><div className="camera-actions"><button className="secondary-btn" onClick={()=>{setCameraOpen(false);streamRef.current?.getTracks?.().forEach(t=>t.stop())}}>Cancel</button><button className="primary-btn" onClick={capture}><Camera size={17}/> Capture Page</button></div></div>:<><label className="upload-drop"><Upload size={22}/><b>Upload scanned pages</b><span>Select one or more JPG/PNG images in page order.</span><input type="file" accept="image/*" multiple onChange={e=>setFiles(Array.from(e.target.files||[]))}/></label><div className="paper-scan-actions"><button className="secondary-btn" onClick={()=>setCameraOpen(true)} disabled={!navigator.mediaDevices?.getUserMedia}><Camera size={17}/> Use Camera</button><button className="secondary-btn" onClick={()=>openPaperAnswerSheet(session)}><Printer size={17}/> Print Sheet Again</button></div>{files.length>0&&<div className="scan-file-list">{files.map((f,i)=><div key={i}><span>Page {i+1}</span><b>{f.name}</b></div>)}</div>}<div className="scan-note"><CircleHelp size={16}/><span>For best results, use a flat, well-lit photo showing the entire page and all 4 black registration markers. The scanner first detects the markers and corrects for page position/perspective before reading bubble marks; unclear marks are reported as unanswered/ambiguous for review.</span></div><button className="primary-btn wide" disabled={!files.length||scanning} onClick={runScan}>{scanning?<><Loader2 className="spin" size={17}/> Scanning…</>:<><ScanLine size={17}/> Scan & Verify Answers</>}</button>{result&&<div className="scan-result"><b>{result.correct}/{total} correct · {result.score}%</b><span>{result.answered} answered · {result.ambiguous} unanswered/ambiguous</span></div>}</>}</div></div>;
}

function downloadPaperAnswerSheet({category,pool}){
  const total=pool.length;
  const pages=[];
  for(let start=0;start<total;start+=100){
    const pageItems=pool.slice(start,start+100);
    const cols=Array.from({length:4},(_,col)=>pageItems.slice(col*25,col*25+25));
    pages.push(`<section class="answer-sheet-page"><div class="sheet-border"></div><span class="reg-marker reg-tl"></span><span class="reg-marker reg-tr"></span><span class="reg-marker reg-bl"></span><span class="reg-marker reg-br"></span><header class="sheet-head"><div class="sheet-practice">PRACTICE ONLY</div><div class="sheet-brand"><div class="sheet-logo">★</div><b>TOPNOTCHER!</b><small>LET PRACTICE ANSWER SHEET</small></div><div class="sheet-meta"><span>Category</span><b>${(CATEGORIES.find(c=>c.id===category)?.short||category)}</b><span>Items ${start+1}–${Math.min(start+100,total)}</span></div></header><div class="sheet-instructions"><b>Instructions:</b> Shade one circle per item using a pencil. Keep all four black registration markers visible. This is a practice sheet and is not an official PRC answer form.</div><div class="sheet-columns">${cols.map((col,ci)=>`<div class="sheet-column"><div class="sheet-column-head">ITEMS ${start+ci*25+1}–${start+ci*25+col.length}</div>${col.map((_,ri)=>{const n=start+ci*25+ri+1;return `<div class="sheet-row"><b>${n}</b><span class="sheet-bubble">A</span><span class="sheet-bubble">B</span><span class="sheet-bubble">C</span><span class="sheet-bubble">D</span></div>`}).join('')}</div>`).join('')}</div><footer class="sheet-footer"><span>Write lightly and erase completely.</span><span>Practice only · TOPNOTCHER! By God's Grace</span></footer></section>`);
  }
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>TOPNOTCHER Paper Answer Sheet</title><style>*{box-sizing:border-box}body{margin:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#17243a}.answer-sheet-page{position:relative;width:8.5in;min-height:11in;background:#fff;margin:0 auto 16px;padding:.28in .35in .32in;overflow:hidden}.sheet-border{position:absolute;inset:.14in;border:2px solid #1e4f95}.reg-marker{position:absolute;width:.18in;height:.18in;background:#050505}.reg-tl{left:.24in;top:.24in}.reg-tr{right:.24in;top:.24in}.reg-bl{left:.24in;bottom:.24in}.reg-br{right:.24in;bottom:.24in}.sheet-head{display:grid;grid-template-columns:1fr 1.6fr 1.2fr;gap:12px;align-items:center;border-bottom:2px solid #1e4f95;padding:.12in .08in .1in}.sheet-practice{font-size:14px;font-weight:800;color:#d71920;text-align:center}.sheet-brand{text-align:center}.sheet-logo{margin:0 auto 3px;width:32px;height:32px;border-radius:50%;background:#102a56;color:#ffd447;display:grid;place-items:center;font-size:17px}.sheet-brand b{display:block;font-size:17px;letter-spacing:.05em}.sheet-brand small{display:block;font-size:8px;color:#4b6380}.sheet-meta{display:flex;flex-direction:column;gap:3px;text-align:right;font-size:9px;color:#466080}.sheet-meta b{font-size:11px;color:#1e4f95}.sheet-instructions{margin:.08in 0 .1in;border:1px solid #a9bcd5;background:#f5f8fd;padding:7px 9px;font-size:8.5px;line-height:1.35}.sheet-columns{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.sheet-column{border:1px solid #b8c7da;padding:5px}.sheet-column-head{font-weight:800;text-align:center;color:#1e4f95;font-size:8px;border-bottom:1px solid #d8e0ea;padding-bottom:4px;margin-bottom:3px}.sheet-row{display:grid;grid-template-columns:20px repeat(4,1fr);align-items:center;height:22px;border-bottom:1px dotted #e4e9f0;font-size:8px}.sheet-row b{text-align:right;padding-right:4px;color:#314b69}.sheet-bubble{width:14px;height:14px;border:1.4px solid #4f6b8d;border-radius:50%;display:grid;place-items:center;font-size:6.5px;color:#52708f;justify-self:center}.sheet-footer{position:absolute;left:.35in;right:.35in;bottom:.24in;display:flex;justify-content:space-between;border-top:1px solid #b8c7da;padding-top:5px;font-size:7.5px;color:#60748f}@media print{body{background:#fff}.answer-sheet-page{margin:0;page-break-after:always}.answer-sheet-page:last-child{page-break-after:auto}}@media screen{body{padding:15px}} </style></head><body>${pages.join('')}</body></html>`;
  const blob=new Blob([html],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`TOPNOTCHER-${category}-paper-answer-sheet.html`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function PreviewPaperSheetButton({category,count,questions}){
  const download=()=>{
    const pool=buildExamPool(category,questions).slice(0,count);
    if(!pool.length){alert('No questions are available for this answer sheet yet.');return;}
    downloadPaperAnswerSheet({category,pool});
  };
  return <button className="secondary-btn wide" type="button" onClick={download}><FileDown size={17}/> Download Paper Answer Sheet</button>;
}

function MockBoard({category,setCategory,mockScores,mockHistory,setExamSession,questions}) {
  const selected=CATEGORIES.find(c=>c.id===category)||CATEGORIES[0];
  const [count,setCount]=useState(150);
  const [shuffle,setShuffle]=useState(true);
  const [explain,setExplain]=useState(false);
  const [paperMode,setPaperMode]=useState(false);
  const available=buildExamPool(category,questions).length;
  const timeLimit=Math.max(5,Math.round(count*.8));
  const start=()=>{
    const pool=buildExamPool(category,questions);
    if(!pool.length){alert("No questions are available for this category yet. Add questions to a study deck first.");return;}
    const actualCount=Math.min(count,pool.length);
    const ordered=shuffle?[...pool].sort(()=>Math.random()-0.5):[...pool];
    setExamSession({id:Date.now(), category, requestedCount:count, pool:ordered.slice(0,actualCount), timeLimit, showExplanations:explain, startedAt:Date.now(), paperMode});
  };
  return <div><PageHeader title="Mock Board Exam" subtitle="Simulate actual LET exam conditions — timed, multiple choice, PRC-standard format"/><div className="mock-layout"><section className="panel mock-config-panel"><div className="mock-section"><h3 className="subheading">Select Exam Category</h3><div className="mock-cards">{CATEGORIES.map(c=><button key={c.id} className={"mock-card "+(category===c.id?"chosen":"")} onClick={()=>setCategory(c.id)}><span className="tag">{c.short}</span><h2>{c.title}</h2><p>{c.desc}</p><div><span><FileText/> {c.id==="full"?QUESTION_BANK_COUNTS.full:QUESTION_BANK_COUNTS[c.id]}+ items</span><span>◷ {c.hours}</span></div></button>)}</div></div><div className="mock-section"><h3 className="subheading">Number of Items</h3><p className="muted">Time limit adjusts proportionally to item count</p><div className="item-options">{[25,50,75,100,150,200,250,300,350,400,420].map(n=><button className={count===n?"selected":""} key={n} onClick={()=>setCount(n)}>{n}</button>)}</div><Toggle label="Shuffle Questions" hint="Randomize question order each attempt" value={shuffle} setValue={setShuffle}/><Toggle label="Show Explanations After" hint="View answer rationale in results" value={explain} setValue={setExplain}/><Toggle label="Paper Mode" hint="Answer on a printed pencil-shading sheet; questions still appear on screen." value={paperMode} setValue={setPaperMode}/></div></section><aside className="panel exam-summary"><h2>Exam Summary</h2><dl><dt>Category</dt><dd>{selected.title}</dd><dt>Items</dt><dd>{count} questions</dd><dt>Available</dt><dd>{available}</dd><dt>Time limit</dt><dd>{timeLimit} minutes</dd></dl><div className="warning"><CircleHelp/> <span><b>PRC Passing Threshold.</b> You need 75% correct to pass each sub-test.</span></div>{available>0&&available<count&&<div className="form-hint"><CircleHelp/> Only {available} questions are currently available, so this attempt will use {available} items.</div>}<div className="bank-ready"><CheckCircle2/> <span><b>Question bank ready.</b> Built-in LET-style items are available for long-form practice.</span></div><h4>RECENT SCORES</h4>{mockHistory?.length?<div className="recent-scores">{mockHistory.slice(-5).reverse().map((s,i)=><span key={i}>{s.score}%</span>)}</div>:<p className="muted">No attempts yet</p>}<PreviewPaperSheetButton category={category} count={Math.min(count,available)} questions={questions}/><button className="primary-btn wide" onClick={start}>Start Exam <ChevronRight/></button></aside></div></div>;
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
  const [paperStage,setPaperStage]=useState(savedState?.paperStage ?? (session.paperMode?"questions":"normal"));
  const current=session.pool[Math.min(index,session.pool.length-1)];
  const total=session.pool.length;
  const closeExam=()=>{ localStorage.removeItem(storageKey); close(); };

  useEffect(()=>{
    localStorage.setItem(storageKey,JSON.stringify({index,answers,marked,submitted,remaining,result,deadline,paperStage}));
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
    if(session.paperMode){ setPaperStage("scan"); setSubmitted(true); setResult({paper:true,elapsed:session.timeLimit*60-remaining}); return; }
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

  if(submitted&&result?.paper) return <div className="modal-backdrop exam-backdrop"><div className="exam-runner paper-submit-card"><div className="exam-top"><div><span className="question-label">PAPER MODE COMPLETE</span><h2>{CATEGORIES.find(c=>c.id===session.category)?.title} Mock Exam</h2><p className="muted">Time used: {Math.floor(result.elapsed/60)}m {result.elapsed%60}s. Your score will be calculated after the printed answer sheet is scanned.</p></div><button className="icon-close" onClick={closeExam}><X/></button></div><div className="paper-mode-actions"><button className="secondary-btn" onClick={()=>openPaperAnswerSheet(session)}><Printer size={17}/> Print / Download Answer Sheet</button><button className="primary-btn" onClick={()=>setPaperStage("scan")}><ScanLine size={17}/> Upload / Scan Answer Sheet</button></div><div className="paper-mode-note"><FileText size={20}/><div><b>How paper mode works</b><p>Keep answering the questions on screen, but shade your answers on the printed sheet. When finished, upload or photograph the completed sheet. TOPNOTCHER will compare the scanned marks with the correct answers from this attempt and report your score, percentage, answered items, ambiguous marks, and time used.</p></div></div>{paperStage==="scan"&&<PaperScanModal session={session} onClose={()=>setPaperStage("questions")} onVerified={scan=>{const elapsed=result.elapsed;setResult({...scan,elapsed});setPaperStage("verified");setMockScores(s=>[...s,scan.score].slice(-10));setMockHistory(h=>[...h,{id:Date.now(),category:session.category,score:scan.score,correct:scan.correct,total,answered:scan.answered,passed:scan.score>=75,date:new Date().toISOString(),paperMode:true}].slice(-20));setSessions(s=>[...s,{id:Date.now(),type:"mock",cat:session.category,answered:scan.answered,correct:scan.correct,minutes:Math.max(1,Math.round(elapsed/60)),percentage:scan.score,completed:true,paperMode:true,ambiguous:scan.ambiguous,title:`${CATEGORIES.find(c=>c.id===session.category)?.label||"Mock"} Paper Mock Exam`,date:new Date().toISOString().slice(0,10)}]);setQuestionStats(oldStats=>{const next={...oldStats};session.pool.forEach((q,i)=>{const r=scan.itemResults[i];if(!r)return;next[q.id]={attempts:(oldStats[q.id]?.attempts||0)+1,correct:(oldStats[q.id]?.correct||0)+(r.ok?1:0),lastAnswered:new Date().toISOString()};});return next;});}}/>}{paperStage==="verified"&&result?.itemResults&&<div className="paper-verified"><div className="result-score pass"><div className="result-ring"><strong>{result.score}%</strong><span>VERIFIED</span></div><div><h3>{result.correct} of {total} correct</h3><p>{result.answered} answered · {result.ambiguous} unanswered/ambiguous · Time {Math.floor(result.elapsed/60)}m {result.elapsed%60}s</p></div></div><div className="result-grid"><div><b>Correct</b><span>{result.correct}</span></div><div><b>Percentage</b><span>{result.score}%</span></div><div><b>Answered</b><span>{result.answered}</span></div><div><b>Time used</b><span>{Math.floor(result.elapsed/60)}m {result.elapsed%60}s</span></div></div><div className="result-list"><h3>Paper Answer Review</h3>{session.pool.map((q,i)=>{const r=result.itemResults[i];return <div className={"result-item "+(r.ok?"ok":"bad")} key={q.id}><span>{r.ok?<CheckCircle2/>:<X/>}</span><div><b>{i+1}. <MathText text={q.q}/></b><small>Paper answer: <MathText text={r.selected===undefined?"Not shaded / ambiguous":q.options[r.selected]}/></small><small>Correct answer: <MathText text={q.options[q.answer]}/></small></div></div>})}</div><div className="exam-result-actions"><button className="secondary-btn" onClick={closeExam}>Back to Mock Board</button></div></div>}</div></div>;

  if(submitted&&result) return <div className="modal-backdrop exam-backdrop"><div className="exam-runner results"><div className="exam-top"><div><span className="question-label">EXAM COMPLETE</span><h2>{CATEGORIES.find(c=>c.id===session.category)?.title} Mock Exam</h2></div><button className="icon-close" onClick={closeExam}><X/></button></div><div className={"result-score "+(result.passed?"pass":"fail")}><div className="result-ring"><strong>{result.score}%</strong><span>{result.passed?"PASSED":"NOT PASSED"}</span></div><div><h3>{result.passed?"Great work!":"Keep practicing!"}</h3><p>{result.correct} of {result.total} correct · {result.answered} answered</p><p>{result.auto?"The exam ended when the timer reached zero.":"You submitted the exam before time expired."}</p></div></div><div className="result-grid"><div><b>Passing threshold</b><span>75%</span></div><div><b>Questions</b><span>{result.total}</span></div><div><b>Answered</b><span>{result.answered}</span></div><div><b>Time used</b><span>{Math.floor(result.elapsed/60)}m {result.elapsed%60}s</span></div></div><div className="result-list"><h3>Question Review</h3>{session.pool.map((q,i)=>{const r=result.itemResults[i];return <div className={"result-item "+(r.ok?"ok":"bad")} key={q.id}><span>{r.ok?<CheckCircle2/>:<X/>}</span><div><b>{i+1}. <MathText text={q.q}/></b><small>Your answer: <MathText text={r.selected===undefined?"Not answered":q.options[r.selected]}/></small>{session.showExplanations&&<small>Correct answer: <MathText text={q.options[q.answer]}/> — <MathText text={q.explanation}/></small>}</div></div>})}</div><div className="exam-result-actions"><button className="secondary-btn" onClick={closeExam}>Back to Mock Board</button><button className="primary-btn" onClick={()=>{setResult(null);setSubmitted(false);setAnswers({});setMarked({});setIndex(0);setDeadline(Date.now()+session.timeLimit*60*1000);setRemaining(session.timeLimit*60);}}>Review Attempt</button></div></div></div>;

  return <div className={`exam-fullscreen exam-theme-${theme}`}><div className="exam-shell"><header className="exam-header"><div className="exam-title"><span className="question-label">MOCK BOARD EXAM</span><h1>{CATEGORIES.find(c=>c.id===session.category)?.title}</h1><span className="exam-meta">{total} items · 75% passing threshold</span></div><div className={"exam-timer " + (remaining<60?"danger":"")}><span>TIME REMAINING</span><strong>{hh}:{mm}:{ss}</strong></div><button className="icon-close" aria-label="Exit exam" onClick={()=>{if(confirm("Exit this exam? Your attempt will not be scored. If the page is refreshed accidentally, your answers will remain saved.")) closeExam();}}><X/></button></header><div className="exam-body"><aside className="exam-sidebar"><div className="navigator-head"><div><b>Question Navigator</b><span>{Object.keys(answers).length} of {total} answered</span></div><div className="navigator-legend"><span><i className="legend-dot answered"/>Answered</span><span><i className="legend-dot unanswered"/>Unanswered</span><span><i className="legend-dot current"/>Current</span></div></div><div className="navigator-progress"><div><span>Progress</span><b>{Math.round(Object.keys(answers).length/total*100)}%</b></div><div className="progress-track"><i style={{width:(Object.keys(answers).length/total*100)+"%"}}/></div></div><div className="question-jump question-jump-grid">{session.pool.map((q,i)=>{const answered=answers[q.id]!==undefined; return <button key={q.id} aria-label={`Question ${i+1}${answered?", answered":""}`} className={(i===index?"current ":"")+(answered?"answered":"unanswered")+(marked[q.id]?" marked":"")} onClick={()=>setIndex(i)}>{i+1}</button>})}</div><div className="navigator-footer"><span><b>{index+1}</b> / {total}</span><button className="navigator-action" onClick={goUnanswered}>Go to unanswered</button><button className={`navigator-action ${marked[current.id]?"marked":""}`} onClick={toggleMark}>{marked[current.id]?"Marked for review":"Mark for review"}</button></div></aside><main className="exam-main"><div className="exam-main-top"><div><span className="question-label">ITEM {index+1}</span><span className="exam-progress-copy">Question {index+1} of {total}</span></div><div className="exam-top-actions"><span className="answered-count">{Object.keys(answers).length} answered</span><button className={`secondary-btn compact ${marked[current.id]?"review-marked":""}`} onClick={toggleMark}><Star size={16}/>{marked[current.id]?"Marked":"Mark for review"}</button></div></div><div className="exam-question"><h2><MathText text={current.q}/></h2><div className={"exam-options "+(session.paperMode?"paper-static-options":"")}>{current.options.map((opt,i)=><button type="button" key={i} disabled={session.paperMode} className={answers[current.id]===i?"selected":""} onClick={()=>choose(i)}><span>{String.fromCharCode(65+i)}</span><b><MathText text={opt}/></b></button>)}</div>{session.paperMode&&<div className="paper-answer-hint"><FileText size={17}/><span>Paper Mode: read the item on screen and shade your answer on the printed answer sheet. Choices are displayed for reference only.</span></div>}</div><div className="exam-navigation"><button className="secondary-btn" disabled={index===0} onClick={()=>setIndex(i=>Math.max(0,i-1))}><ChevronLeft/> Previous</button><div className="exam-nav-status"><span>Question <b>{index+1}</b> / {total}</span><div className="progress-track"><i style={{width:((index+1)/total*100)+"%"}}/></div></div>{index===total-1?<button className="primary-btn" onClick={()=>{if(confirm("Submit this exam now? Unanswered questions will be counted as incorrect.")) finish(false);}}>Submit Exam <CheckCircle2/></button>:<button className="primary-btn" onClick={()=>setIndex(i=>Math.min(total-1,i+1))}>Next <ChevronRight/></button>}</div></main></div></div></div>;
}

function Schedule({sessions,onAdd,onEdit,onDelete,onToggleDone}) {
  const now=new Date();
  const [month,setMonth]=useState(new Date(now.getFullYear(),now.getMonth(),1));
  const year=month.getFullYear(), mon=month.getMonth();
  const days=new Date(year,mon+1,0).getDate(), start=new Date(year,mon,1).getDay();
  const cells=[...Array(start),...Array.from({length:days},(_,i)=>i+1)];
  const today=now.getDate(), currentMonth=now.getMonth(), currentYear=now.getFullYear();
  // Only records with a calendar date are schedules. Study-session logs do not have a date field,
  // and schedule completion logs are marked with scheduleLogId, so they must not inflate the tracker.
  const scheduleItems=sessions.filter(s=>Boolean(s.date) && !s.scheduleLogId);
  const monthSessions=scheduleItems.filter(s=>{const dt=new Date(s.date+"T00:00:00");return dt.getMonth()===mon&&dt.getFullYear()===year}).sort((a,b)=>a.date.localeCompare(b.date));
  const completedSchedules=scheduleItems.filter(s=>s.completed).length;
  const pendingSchedules=Math.max(0,scheduleItems.length-completedSchedules);
  const monthCompletion=monthSessions.length?Math.round(monthSessions.filter(s=>s.completed).length/monthSessions.length*100):0;
  const typeLabel=t=>t==="mock"?"Mock Exam":t==="drill"?"Daily Drill":"Study Session";
  const categoryLabel=t=>t==="profed"?"ProfEd":t==="majorship"?"Major":"GenEd";
  return <div>
    <PageHeader title="Study Schedule" subtitle="Plot, edit, complete, and track your review sessions." action={<button className="primary-btn" onClick={onAdd}><Plus/> Add Schedule</button>}/>
    <div className="schedule-stats">
      <div><b>{scheduleItems.length}</b><span>Total Schedules</span></div>
      <div><b>{completedSchedules}</b><span>Completed</span></div>
      <div><b>{pendingSchedules}</b><span>Pending</span></div>
      <div><b>{monthSessions.length}</b><span>This Month</span></div>
      <div><b>{monthCompletion}%</b><span>Completion</span></div>
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

function StudyModal({study,answer,next,jump,close,goTo,profile,onSignOut,onEditQuestion,theme="light"}) {
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
    return <div className={`study-fullscreen study-theme-${theme}`}><AppSidebar page="decks" profile={profile} onNavigate={()=>close()} onSettings={()=>close()} onSignOut={()=>{close();onSignOut?.();}} studyMode/><div className="study-shell"><header className="study-header"><div className="study-title"><span className="study-subject-kicker">STUDY COMPLETE</span><h1>{subjectText}</h1></div><button className="icon-close" onClick={close}><X/></button></header><main className="study-complete-wrap"><section className="study-complete-card panel"><CheckCircle2 size={48}/><span className="question-label">SESSION COMPLETE</span><h2>Great work!</h2><div className="study-result-grid"><div><b>{minutes} min</b><span>Time Taken</span></div><div><b>{study.correct}/{study.pool.length}</b><span>Score</span></div><div><b>{percentage}%</b><span>Percentage</span></div><div><b>{study.wrongQuestions?.length||0}</b><span>Wrong</span></div></div>{study.wrongQuestions?.length?<div className="wrong-question-report"><h3>Wrong Answered Questions</h3>{study.wrongQuestions.map((w,i)=><div key={w.id||i}><b>{i+1}. <MathText text={w.q}/></b><span>Your answer: <MathText text={w.selected||"Unanswered"}/></span><span>Correct answer: <MathText text={w.correct}/></span></div>)}</div>:<div className="no-wrong-report"><CheckCircle2 size={20}/> Perfect score — no wrong answers.</div>}<div className="study-complete-actions"><button className="secondary-btn" onClick={close}>Finish</button><button className="primary-btn" onClick={()=>{close();goTo("progress")}}>View Progress</button></div></section></main></div></div>;
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
            <div className="study-question-card-head"><span className="question-label">QUESTION {study.index+1}</span></div>
            <h2><MathText text={q.q}/></h2>
            <div className="options">{q.options.map((o,i)=><button key={i} className={(study.checked&&i===q.answer?"correct ":"")+(study.checked&&i===study.selected&&i!==q.answer?"wrong":"")} disabled={study.checked} onClick={()=>answer(i)}><span>{String.fromCharCode(65+i)}</span><MathText text={o}/></button>)}</div>
            {study.checked&&<div className={"explanation "+(study.selected===q.answer?"good":"bad")}><b>{study.selected===q.answer?"Correct!":"Not quite."}</b><p><MathText text={q.explanation}/></p></div>}
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
      <span className="tag">{flipped?"ANSWER":"QUESTION"}</span><h1><MathText text={flipped?card.back:card.front}/></h1>{flipped&&card.explanation&&<p><MathText text={card.explanation}/></p>}<small>Click to flip</small>
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


function ShareStudyQuestionsModal({deck,questions,onClose}) {
  const [password,setPassword]=useState("");
  const [confirmPassword,setConfirmPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [link,setLink]=useState("");
  const [copied,setCopied]=useState(false);
  const generate=async()=>{
    setError("");
    if(password.length<6){setError("Use a password with at least 6 characters.");return;}
    if(password!==confirmPassword){setError("The passwords do not match.");return;}
    if(!questions.length){setError("This deck has no questions to share.");return;}
    setBusy(true);
    try{
      const token=await createStudyShareToken(deck,questions,password);
      setLink(`${window.location.origin}${window.location.pathname}#share=${encodeURIComponent(token)}`);
    }catch(err){setError(err?.message||"Could not create the share link.");}
    finally{setBusy(false);}
  };
  const copy=async()=>{try{await navigator.clipboard.writeText(link);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{setError("Copy failed. Select and copy the link manually.");}};
  return <div className="modal-backdrop"><div className="small-modal share-study-modal"><div className="modal-head"><div><span className="question-label">SHARE STUDY QUESTIONS</span><h2>Share this deck's questions</h2><span className="muted">Recipients can open the Study Questions Now experience only. The link expires automatically after 5 hours.</span></div><button onClick={onClose}><X/></button></div><div className="share-info-grid"><div><Link2 size={18}/><span><b>{questions.length} questions</b><small>Shared study set</small></span></div><div><Clock3 size={18}/><span><b>5 hours</b><small>Automatic expiry</small></span></div><div><LockKeyhole size={18}/><span><b>Password protected</b><small>Never stored in the link</small></span></div></div><label>Share password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password"/></label><label>Confirm password<input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Re-enter password" autoComplete="new-password"/></label>{error&&<div className="ai-error">{error}</div>}{link&&<div className="share-link-box"><div><b>Share link</b><span>The encrypted link expires 5 hours after it was generated.</span></div><input readOnly value={link} onFocus={e=>e.currentTarget.select()}/><div className="share-link-actions"><button className="secondary-btn" onClick={copy}><Copy size={16}/>{copied?"Copied":"Copy Link"}</button><button className="secondary-btn" onClick={()=>window.open(link,"_blank","noopener,noreferrer")}><ExternalLink size={16}/> Open Link</button></div></div>}<div className="modal-foot"><button className="secondary-btn" onClick={onClose}>Close</button><button className="primary-btn" onClick={generate} disabled={busy}>{busy?<><Loader2 className="spin" size={17}/> Creating…</>:<><Link2 size={17}/> {link?"Regenerate 5-Hour Link":"Create 5-Hour Link"}</>}</button></div></div></div>;
}

function SharedStudyAccessModal({token,onClose,onOpen}) {
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const unlock=async()=>{setError("");setBusy(true);try{const payload=await openStudyShareToken(token,password);onOpen(payload);}catch(err){setError(err?.message||"Unable to open this shared study set.");}finally{setBusy(false);}};
  return <div className="modal-backdrop"><div className="small-modal share-access-modal"><div className="modal-head"><div><span className="question-label">SHARED STUDY QUESTIONS</span><h2>Password required</h2><span className="muted">Enter the password provided by the person who shared this Study Questions Now link.</span></div><button onClick={onClose}><X/></button></div><div className="share-access-icon"><LockKeyhole size={30}/></div><label>Share password<input type="password" autoFocus value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")unlock()}} placeholder="Enter password" autoComplete="off"/></label>{error&&<div className="ai-error">{error}</div>}<div className="modal-foot"><button className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" disabled={!password||busy} onClick={unlock}>{busy?<><Loader2 className="spin" size={17}/> Opening…</>:<><Play size={17}/> Study Questions Now</>}</button></div></div></div>;
}

function PDFStudyViewer({scope,item,onClose}) {
  const containerRef=useRef(null);
  const [pages,setPages]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [savingVersion,setSavingVersion]=useState(false);
  const [savedVersion,setSavedVersion]=useState(false);
  const [highlights,setHighlights]=useState(()=>{
    try{return JSON.parse(localStorage.getItem(`topnotcher-pdf-highlights::${scope}::${item.sourceId||item.id}`)||"[]");}catch{return [];}
  });
  const [selectedText,setSelectedText]=useState("");
  const [activePage,setActivePage]=useState(null);

  const highlightKey=`topnotcher-pdf-highlights::${scope}::${item.sourceId||item.id}`;
  const persistHighlights=next=>{
    setHighlights(next);
    try{localStorage.setItem(highlightKey,JSON.stringify(next));}catch{}
  };

  useEffect(()=>{
    let alive=true;
    const render=async()=>{
      try{
        setLoading(true);setError("");setSavedVersion(false);
        const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
        const workerUrl=(await import("pdfjs-dist/legacy/build/pdf.worker.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc=workerUrl;
        const bytes=new Uint8Array(await item.blob.arrayBuffer());
        const pdf=await pdfjs.getDocument({data:bytes}).promise;
        const rendered=[];
        for(let pageNo=1;pageNo<=pdf.numPages;pageNo++){
          if(!alive) return;
          const page=await pdf.getPage(pageNo);
          const base=page.getViewport({scale:1.35});
          const canvas=document.createElement("canvas");
          const ctx=canvas.getContext("2d");
          const viewport=base;
          canvas.width=Math.ceil(viewport.width);
          canvas.height=Math.ceil(viewport.height);
          canvas.className="pdf-study-canvas";
          await page.render({canvasContext:ctx,viewport}).promise;
          const textContent=await page.getTextContent();
          rendered.push({pageNo,canvas,textContent,viewport});
        }
        if(alive)setPages(rendered);
      }catch(err){
        console.error(err);
        if(alive)setError("This PDF could not be opened in the study viewer. You can still download the original file from Study Materials.");
      }finally{if(alive)setLoading(false);}
    };
    render();
    return()=>{alive=false;};
  },[item]);

  useEffect(()=>{
    if(!containerRef.current || !pages.length) return;
    containerRef.current.innerHTML="";
    pages.forEach(({pageNo,canvas,textContent,viewport})=>{
      const pageWrap=document.createElement("div");
      pageWrap.className="pdf-study-page";
      pageWrap.dataset.page=String(pageNo);
      pageWrap.appendChild(canvas);
      const textLayer=document.createElement("div");
      textLayer.className="pdf-study-text-layer";
      textContent.items.forEach((itemText,idx)=>{
        const span=document.createElement("span");
        span.textContent=itemText.str||"";
        span.dataset.textIndex=String(idx);
        const tx=itemText.transform||[1,0,0,1,0,0];
        const x=tx[4];
        const y=tx[5];
        const fontHeight=Math.abs(tx[3]||tx[0]||10);
        span.style.left=`${x*1.35}px`;
        span.style.top=`${viewport.height-(y*1.35)-fontHeight*1.35}px`;
        span.style.fontSize=`${fontHeight*1.35}px`;
        span.style.transform=`scaleX(${Math.abs(tx[0]||1)/Math.max(fontHeight,1)})`;
        textLayer.appendChild(span);
      });
      pageWrap.appendChild(textLayer);
      containerRef.current.appendChild(pageWrap);
      applySavedPdfHighlights(textLayer,highlights.filter(h=>h.page===pageNo).map(h=>h.text));
    });
  },[pages,highlights]);

  const handleSelection=()=>{
    const sel=window.getSelection();
    const text=sel?.toString().trim()||"";
    if(!text){setSelectedText("");setActivePage(null);return;}
    const anchor=sel.anchorNode?.parentElement?.closest?.(".pdf-study-page");
    const focus=sel.focusNode?.parentElement?.closest?.(".pdf-study-page");
    const node=anchor||focus;
    setSelectedText(text);
    setActivePage(node?Number(node.dataset.page):null);
  };

  const addHighlight=()=>{
    const text=selectedText.trim();
    if(!text || !activePage || !containerRef.current)return;
    const sel=window.getSelection();
    const pageEl=containerRef.current.querySelector(`.pdf-study-page[data-page="${activePage}"]`);
    if(!pageEl)return;
    const pageRect=pageEl.getBoundingClientRect();
    const rects=sel?Array.from(sel.getRangeAt(0).getClientRects()).map(r=>({
      x:(r.left-pageRect.left)/pageRect.width,
      y:(r.top-pageRect.top)/pageRect.height,
      w:r.width/pageRect.width,
      h:r.height/pageRect.height
    })).filter(r=>r.w>0&&r.h>0):[];
    const exists=highlights.some(h=>h.page===activePage&&h.text===text);
    if(!exists) persistHighlights([...highlights,{page:activePage,text,rects}]);
    window.getSelection()?.removeAllRanges();
    setSelectedText("");setActivePage(null);
  };

  const clearHighlights=()=>{
    if(!highlights.length)return;
    if(confirm("Remove all highlights from this PDF?")){persistHighlights([]);setSavedVersion(false);}
  };

  const downloadBlob=(blob,name)=>{
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  };

  const getSavedHighlightRects=(highlight)=>{
    if(!containerRef.current)return [];
    const pageEl=containerRef.current.querySelector(`.pdf-study-page[data-page="${highlight.page}"]`);
    if(!pageEl)return [];
    const layer=pageEl.querySelector(".pdf-study-text-layer");
    if(!layer)return [];
    const nodes=[...layer.querySelectorAll("span")];
    const target=String(highlight.text||"").trim();
    let full="";
    const map=[];
    nodes.forEach(node=>{const value=node.textContent||"";map.push({node,start:full.length,end:full.length+value.length});full+=value+" ";});
    const pos=full.indexOf(target);
    if(pos<0)return [];
    const end=pos+target.length;
    const first=map.find(m=>pos>=m.start&&pos<m.end);
    const last=map.find(m=>end>m.start&&end<=m.end);
    if(!first||!last)return [];
    const range=document.createRange();
    try{
      range.setStart(first.node,Math.max(0,pos-first.start));
      range.setEnd(last.node,Math.min((last.node.textContent||"").length,end-last.start));
    }catch{return [];}
    const pageRect=pageEl.getBoundingClientRect();
    return Array.from(range.getClientRects()).map(r=>({x:(r.left-pageRect.left)/pageRect.width,y:(r.top-pageRect.top)/pageRect.height,w:r.width/pageRect.width,h:r.height/pageRect.height})).filter(r=>r.w>0&&r.h>0);
  };

  const saveHighlightedVersion=async()=>{
    if(!highlights.length){alert("Add at least one highlight before saving a highlighted version.");return;}
    setSavingVersion(true);setError("");
    try{
      const {PDFDocument,rgb}=await import("pdf-lib");
      const originalBytes=await item.blob.arrayBuffer();
      const pdfDoc=await PDFDocument.load(originalBytes);
      const pdfPages=pdfDoc.getPages();
      const effectiveHighlights=highlights.map(h=>({...h,rects:h.rects?.length?h.rects:getSavedHighlightRects(h)}));
      effectiveHighlights.forEach(h=>{
        const page=pdfPages[h.page-1];
        if(!page)return;
        const pw=page.getWidth(),ph=page.getHeight();
        (h.rects||[]).forEach(r=>{
          page.drawRectangle({
            x:r.x*pw,
            y:ph-(r.y+r.h)*ph,
            width:r.w*pw,
            height:r.h*ph,
            color:rgb(1,0.86,0.12),
            opacity:0.42,
            borderOpacity:0
          });
        });
      });
      const bytes=await pdfDoc.save();
      const baseName=item.name.replace(/\.pdf$/i,"");
      const highlightedName=`${baseName} — Highlighted.pdf`;
      await deleteDeckMaterialsBySource(scope,item.deckId,item.sourceId||item.id);
      await saveDeckMaterialBlob({
        scope,deckId:item.deckId,type:"study",name:highlightedName,blob:new Blob([bytes],{type:"application/pdf"}),
        meta:{isHighlightedVersion:true,sourceId:item.sourceId||item.id}
      });
      setSavedVersion(true);
    }catch(err){
      console.error(err);
      setError("The highlighted version could not be saved. Please make sure the project dependencies are installed and try again.");
    }finally{setSavingVersion(false);}
  };

  return <div className="pdf-study-screen">
    <header className="pdf-study-header">
      <div className="pdf-study-title"><button className="icon-btn" onClick={onClose} aria-label="Back to Study Materials"><ArrowLeft size={19}/></button><div><span className="question-label">STUDY MATERIAL</span><h1>{item.name}</h1><span>{pages.length?`${pages.length} page${pages.length===1?"":"s"}`:"PDF Review"}</span></div></div>
      <div className="pdf-study-tools"><button className="secondary-btn compact" type="button" disabled={!selectedText} onClick={addHighlight}><Highlighter size={15}/> {selectedText?"Highlight Selection":"Select Text"}</button><button className="primary-btn compact" type="button" disabled={!highlights.length||savingVersion} onClick={saveHighlightedVersion}>{savingVersion?<><Loader2 className="spin" size={15}/> Saving…</>:<><Save size={15}/> Save Highlighted Version</>}{savedVersion&&!savingVersion?" ✓":""}</button><button className="secondary-btn compact" type="button" onClick={clearHighlights}>Clear Highlights</button><button className="secondary-btn compact" type="button" onClick={()=>downloadBlob(item.blob,item.name)}><Download size={15}/> Download</button><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={19}/></button></div>
    </header>
    <div className="pdf-study-help"><Highlighter size={15}/> Select text in the PDF, then click <b>Highlight Selection</b>. Use <b>Save Highlighted Version</b> to create a separate PDF copy with the highlights embedded.</div>
    <main className="pdf-study-scroll" onMouseUp={handleSelection}>
      {loading&&<div className="pdf-study-loading"><Loader2 className="spin" size={24}/> Opening study material…</div>}
      {error&&<div className="pdf-study-error"><FileText size={24}/><b>{error}</b></div>}
      <div ref={containerRef} className="pdf-study-pages" />
    </main>
  </div>;
}

function applySavedPdfHighlights(container,texts){
  if(!container || !texts?.length)return;
  const nodes=[...container.querySelectorAll("span")];
  texts.forEach(search=>{
    if(!search)return;
    const target=String(search).trim();
    let full="";
    const map=[];
    nodes.forEach((node,idx)=>{const value=node.textContent||"";map.push({node,start:full.length,end:full.length+value.length});full+=value+" ";});
    const pos=full.indexOf(target);
    if(pos<0)return;
    const end=pos+target.length;
    const first=map.find(m=>pos>=m.start&&pos<m.end);
    const last=map.find(m=>end>m.start&&end<=m.end);
    if(!first||!last)return;
    const range=document.createRange();
    range.setStart(first.node,Math.max(0,pos-first.start));
    range.setEnd(last.node,Math.min((last.node.textContent||"").length,end-last.start));
    const mark=document.createElement("mark");
    mark.className="pdf-study-highlight";
    try{range.surroundContents(mark);}catch{}
  });
}

function DeckMaterialsModal({scope,deckId,type,onClose,onStudyPdf}) {
  const [items,setItems]=useState([]);
  const [busy,setBusy]=useState(false);
  const isVideo=type==="video";
  const title=isVideo?"Video Materials":"Study Materials";
  const subtitle=isVideo?"Upload video lessons and review them directly from this deck.":"PDF materials uploaded through AI Question Generator are saved here for later review.";
  const reload=async()=>{try{setItems(await listDeckMaterials(scope,deckId,type));}catch(err){console.error(err);}};
  useEffect(()=>{reload();},[scope,deckId,type]);
  const upload=async e=>{
    const files=[...(e.target.files||[])];e.target.value="";
    if(!files.length)return;
    const allowed=isVideo?/\.(mp4|webm|mov|m4v)$/i:/\.pdf$/i;
    const invalid=files.find(f=>!allowed.test(f.name)&&!(isVideo?String(f.type).startsWith("video/"):f.type==="application/pdf"));
    if(invalid){alert(isVideo?"Please upload an MP4, WebM, MOV, or M4V video.":"Study Materials accepts PDF files saved from the AI Question Generator.");return;}
    setBusy(true);
    try{for(const file of files)await saveDeckMaterial({scope,deckId,type,file});await reload();}
    catch(err){alert(err?.message||"Could not save the material in this browser.");}
    finally{setBusy(false);}
  };
  const remove=async id=>{if(!confirm("Delete this material from the deck?"))return;try{await deleteDeckMaterial(id);await reload();}catch(err){alert("Could not delete this material.");}};
  const downloadFile=item=>{const url=URL.createObjectURL(item.blob);const a=document.createElement("a");a.href=url;a.download=item.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);};
  return <div className="modal-backdrop"><div className="small-modal deck-materials-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><span className="question-label">DECK MATERIALS</span><h2>{title}</h2><span className="muted">{subtitle}</span></div><button onClick={onClose}><X/></button></div><label className="material-upload-box"><input type="file" multiple accept={isVideo?"video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v":"application/pdf,.pdf"} onChange={upload}/><Upload size={22}/><b>{busy?"Saving…":`Upload ${isVideo?"Video":"PDF"}`}</b><span>{isVideo?"MP4, WebM, MOV, or M4V":"PDF files from AI Question Generator"}</span></label><div className="deck-material-list">{items.length?items.map(item=><div className="deck-material-item" key={item.id}><div className="deck-material-icon">{isVideo?<Video size={20}/>:<FileArchive size={20}/>}</div><div className="deck-material-info"><b>{item.name}</b><span>{(item.size/1024/1024).toFixed(2)} MB · {new Date(item.createdAt).toLocaleDateString()}</span>{!isVideo&&item.isHighlightedVersion&&<small className="deck-material-highlighted-label">Saved Highlighted Version</small>}{isVideo&&<video className="deck-material-video" controls preload="metadata" src={URL.createObjectURL(item.blob)}/>}</div><div className="deck-material-actions">{!isVideo&&<button className="primary-btn compact" type="button" onClick={()=>onStudyPdf?.(item)}><Eye size={15}/> Study</button>}<button className="secondary-btn compact" type="button" onClick={()=>downloadFile(item)}><Download size={15}/> Download</button><button className="danger-outline" type="button" onClick={()=>remove(item.id)}><Trash2 size={14}/> Delete</button></div></div>):<div className="empty"><FileArchive/><b>No {isVideo?"video":"study"} materials yet</b><span>{isVideo?"Upload video lessons for this deck.":"Upload a PDF through AI Question Generator and it will appear here automatically."}</span></div>}</div><div className="modal-foot"><button className="secondary-btn" onClick={onClose}>Close</button></div></div></div>;
}

function DeckModal({close,save,initial,folders=[]}) { const [name,setName]=useState(initial?.name||""); const [description,setDescription]=useState(initial?.description||""); const [category,setCategory]=useState(initial?.category||"gened"); const [folderId,setFolderId]=useState(initial?.folderId?String(initial.folderId):""); return <div className="modal-backdrop"><div className="small-modal"><div className="modal-head"><div><h2>{initial?"Edit Study Deck":"Create Study Deck"}</h2><span className="muted">Choose a category and optionally organize the deck into a folder.</span></div><button onClick={close}><X/></button></div><label>Deck name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. General Science"/></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option value="gened">GenEd</option><option value="profed">ProfEd</option><option value="majorship">Majorship</option><option value="mixed">Mixed — GenEd + ProfEd + Majorship</option></select></label><label>Folder<select value={folderId} onChange={e=>setFolderId(e.target.value)}><option value="">No Folder</option>{folders.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What will you review?"/></label><button className="primary-btn wide" disabled={!name.trim()} onClick={()=>save({id:initial?.id,name:name.trim(),description,category,folderId:folderId?Number(folderId):null})}><Save size={17}/>{initial?"Save Changes":"Create Deck"}</button></div></div>; }

function FolderModal({close,save,initial}) { const [name,setName]=useState(initial?.name||""); const [description,setDescription]=useState(initial?.description||""); return <div className="modal-backdrop"><div className="small-modal folder-modal"><div className="modal-head"><div><h2>{initial?"Edit Folder":"Create Study Folder"}</h2><span className="muted">Group related study decks together for easier access.</span></div><button onClick={close}><X/></button></div><label>Folder name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. LET 2026 Review"/></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Optional folder description..."/></label><button className="primary-btn wide" disabled={!name.trim()} onClick={()=>save({id:initial?.id,name:name.trim(),description:description.trim()})}><Save size={17}/>{initial?"Save Changes":"Create Folder"}</button></div></div>; }


function AIQuestionModal({questions=[],deck,close,saveQuestions,materialScope,onMaterialStored}) {
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
        if(deck?.id && materialScope){
          try{
            const saved=await saveDeckMaterial({scope:materialScope,deckId:deck.id,type:"study",file});
            onMaterialStored?.(saved);
          }catch(storageError){
            console.warn("PDF was read successfully but could not be saved to Study Materials.",storageError);
          }
        }
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
        return candidates.some(prev=>normalizeStem(prev)===normalizeStem(stem) || similarityScore(prev,stem)>=0.52);
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
          excludeQuestions:[...existingStems,...used]
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
      <div className="ai-generator-note"><Sparkles size={17}/><div><b>Material-grounded generation</b><span>Every question includes a meaningful rationale. Mathematical notation, symbols, equations, and LaTeX-style expressions are supported.</span></div></div>
      <button className="primary-btn ai-generate-btn" disabled={busy||!material.trim()} onClick={generate}>{busy?<><Loader2 className="spin" size={18}/> Generating {generated.length} / {count}...</>:<><WandSparkles size={18}/> Generate {count} Questions</>}</button>
    </div>

    {busy&&<div className="ai-generation-progress"><div className="ai-progress-top"><div><b>Generating your LET questions...</b><span>Creating questions in small batches to keep large sets reliable.</span></div><strong>{progress}%</strong></div><div className="progress-track"><i style={{width:progress+"%"}}/></div><div className="ai-progress-meta"><span>{generated.length} of {count} questions ready</span><span>Please keep this window open</span></div></div>}
    {error&&<div className="ai-error">{error}</div>}

    {generated.length>0&&!busy&&<div className="ai-preview ai-preview-v2"><div className="section-head"><div><h3>Generated Questions</h3><span className="muted">Review the questions and rationales before saving them to your deck.</span></div><span className="tag">{generated.length} ready</span></div>{generated.map((q,i)=><div className="ai-q" key={i}><div className="ai-q-head"><b>{i+1}. <MathText text={q.question}/></b><span className="tag">{q.difficulty||difficulty}</span></div><div className="ai-options">{q.options.map((o,j)=><div className={j===Number(q.correctAnswer)?"correct":""} key={j}><b>{String.fromCharCode(65+j)}.</b> <MathText text={o}/></div>)}</div><div className="ai-rationale"><CheckCircle2 size={16}/><div><b>Correct answer: {String.fromCharCode(65+Number(q.correctAnswer))}</b><p><MathText text={q.rationale}/></p></div></div></div>)}</div>}
    <div className="modal-foot ai-footer"><button className="secondary-btn" onClick={close}>Cancel</button>{generated.length>0&&<button className="primary-btn" onClick={save}><Save size={17}/> Save {generated.length} Questions to Deck</button>}</div>
  </div></div>;
}

function QuestionModal({close,save,initial,deckId,duringStudy=false}) {
  const [question,setQuestion]=useState(initial?.q||"");
  const [options,setOptions]=useState(initial?.options||["","","",""]);
  const [answer,setAnswer]=useState(initial?.answer??0);
  const [explanation,setExplanation]=useState(initial?.explanation||"");
  const updateOption=(i,v)=>setOptions(os=>os.map((o,idx)=>idx===i?v:o));
  const submit=()=>{
    const cleanQuestion=question.trim();
    const cleanOptions=options.map(o=>o.trim());
    const cleanExplanation=explanation.trim();
    if(!cleanQuestion||cleanOptions.some(o=>!o)||!cleanExplanation) return;
    save({id:initial?.id,deckId,q:cleanQuestion,options:cleanOptions,answer:Number(answer),explanation:cleanExplanation});
  };
  const modal=(
    <div className="modal-backdrop question-editor-backdrop" role="dialog" aria-modal="true" aria-labelledby="question-editor-title" onMouseDown={e=>{if(e.target===e.currentTarget) close();}}>
      <div className="small-modal question-modal question-editor-modal" onMouseDown={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><h2 id="question-editor-title">{initial?"Edit Question":"Add Question"}</h2><span className="muted">{duringStudy ? "Edit this question, then continue answering." : "Create a board-exam-style multiple-choice question."}</span></div>
          <button type="button" aria-label="Close question editor" onClick={close}><X/></button>
        </div>
        <label>Question / mathematical expression
          <textarea className="question-input" value={question} onChange={e=>setQuestion(e.target.value)} placeholder={'Enter the question. Math: x^2, √(x), π, ≤, or LaTeX such as \\(x^2\\) and \\[\\frac{a}{b}\\].'}/>
        </label>
        <div className="option-editor"><b>Answer choices</b>{options.map((o,i)=><label key={i} className="option-editor-row"><button type="button" className={answer===i?"answer-dot selected":"answer-dot"} onClick={()=>setAnswer(i)} aria-label={`Set choice ${String.fromCharCode(65+i)} as correct`}>{String.fromCharCode(65+i)}</button><input value={o} onChange={e=>updateOption(i,e.target.value)} placeholder={`Choice ${String.fromCharCode(65+i)}`}/></label>)}</div>
        <label>Explanation / solution
          <textarea value={explanation} onChange={e=>setExplanation(e.target.value)} placeholder="Explain the answer. Mathematical equations and symbols are supported."/>
        </label>
        <div className="form-hint"><CheckCircle2 size={17}/> Select the letter beside the correct answer.</div>
        <div className="math-support-hint"><b>Math:</b> Unicode (√, ≤, ≥, π, ∑, ∫, ±, ×, ÷) and LaTeX delimiters \\(…\\) / \\[…\\] are supported.</div>
        <div className="modal-foot question-editor-actions">
          <button type="button" className="secondary-btn" onClick={close}>Cancel</button>
          <button type="button" className="primary-btn" disabled={!question.trim()||options.some(o=>!o.trim())||!explanation.trim()} onClick={submit}><Save size={17}/>{duringStudy?"Save & Continue":(initial?"Save Question":"Add Question")}</button>
        </div>
      </div>
    </div>
  );
  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}

function SettingsModal({close,theme,setTheme,profile,openProfile}) { return <div className="modal-backdrop"><div className="small-modal settings-modal"><div className="modal-head"><div><h2>Settings</h2><span className="muted">Customize your TOPNOTCHER! experience.</span></div><button onClick={close}><X/></button></div><div className="settings-section"><b>Appearance</b><span>Choose how the app looks across your devices.</span><div className="theme-choice-grid"><button className={theme==="light"?"selected":""} onClick={()=>setTheme("light")}><span className="theme-swatch light-swatch">☀</span><div><b>Light</b><small>Clean off-white workspace</small></div></button><button className={theme==="dark"?"selected":""} onClick={()=>setTheme("dark")}><span className="theme-swatch dark-swatch">☾</span><div><b>Dark</b><small>Lower-light study workspace</small></div></button></div></div><div className="settings-section profile-setting"><div><b>Profile</b><span>{profile.name} · {profile.goal}</span></div><button className="secondary-btn compact" onClick={openProfile}><UserCircle size={17}/> Open Profile</button></div><div className="settings-note"><Settings size={18}/><span>Your profile, theme, and study data are stored separately for your signed-in Google account in this browser.</span></div><button className="primary-btn wide" onClick={close}>Done</button></div></div>; }
function Profile({profile,setProfile,setPage,theme,authUser}) {
  const [draft,setDraft]=useState({...profile, email: profile?.email || authUser?.email || ""});
  const save=()=>setProfile({...draft, email:authUser?.email || draft.email || "", dailyGoal:Number(draft.dailyGoal)||60});
  const initials=(draft.name||"G").trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();
  const avatars=["👩🏻","👨🏻","👩🏼","👨🏼","👩🏽","👨🏽","👩🏾","👨🏾","👩🏿","👨🏿","🧑🏻","🧑🏽"];
  return <div><PageHeader title="Profile" subtitle="Manage your learner profile and LET study goals." action={<button className="secondary-btn compact" onClick={()=>setPage("progress")}><ArrowLeft size={17}/> Back to Progress</button>}/><div className="profile-layout"><section className="panel profile-card"><div className="profile-hero"><div className="profile-avatar-large">{draft.avatar||initials||"G"}</div><div><h2>{draft.name||"Genius Learner"}</h2><p>{draft.goal||"Pass the LET"}</p><span className="tag">{theme==="dark"?"Dark mode":"Light mode"}</span></div></div><div className="profile-avatar-picker"><b>Choose your avatar</b><div className="avatar-choice-grid">{avatars.map(a=><button type="button" key={a} className={draft.avatar===a?"selected":""} onClick={()=>setDraft({...draft,avatar:a})} aria-label={`Choose avatar ${a}`}>{a}</button>)}</div></div><div className="profile-form"><label>Display name<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="Your name"/></label><label>Google account email<input value={authUser?.email || draft.email || ""} readOnly aria-readonly="true"/></label><label>Study goal<input value={draft.goal} onChange={e=>setDraft({...draft,goal:e.target.value})} placeholder="e.g. Pass the LET"/></label><label>LET exam date<input type="date" value={draft.examDate} onChange={e=>setDraft({...draft,examDate:e.target.value})}/></label><label>Daily study goal (minutes)<input type="number" min="10" max="720" value={draft.dailyGoal} onChange={e=>setDraft({...draft,dailyGoal:e.target.value})}/></label><button className="primary-btn wide" onClick={save}><Save size={17}/> Save Profile</button></div></section><aside className="panel profile-summary"><h3>Your Study Identity</h3><div className="profile-stat"><span>Daily goal</span><b>{draft.dailyGoal||60} min</b></div><div className="profile-stat"><span>Exam date</span><b>{draft.examDate?new Date(draft.examDate+"T00:00:00").toLocaleDateString():"Not set"}</b></div><div className="profile-stat"><span>Appearance</span><b>{theme==="dark"?"Dark":"Light"}</b></div><div className="profile-tip"><UserCircle size={18}/><span>Your profile and study data are kept separate for your signed-in Google account.</span></div></aside></div></div>;
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
