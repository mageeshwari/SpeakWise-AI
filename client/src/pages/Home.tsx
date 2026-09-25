import { useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  AudioLines,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flame,
  Gauge,
  Headphones,
  LayoutDashboard,
  LineChart,
  ListChecks,
  LockKeyhole,
  Menu,
  MessageCircle,
  Mic2,
  Moon,
  Play,
  RotateCcw,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  Volume2,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

type Section = "dashboard" | "speak" | "talk" | "learn" | "practice" | "progress" | "leaderboard" | "profile";
type AnalyzeMode = "text" | "speech";

const navItems: Array<{ id: Section; label: string; icon: typeof LayoutDashboard; shortcut?: string }> = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "speak", label: "Speak", icon: Mic2, shortcut: "S" },
  { id: "talk", label: "Talk", icon: MessageCircle },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "practice", label: "Practice", icon: ListChecks },
  { id: "progress", label: "Progress", icon: LineChart },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "profile", label: "Profile", icon: UserRound },
];

const fallbackDashboard = {
  greeting: "Good evening, Ananya",
  subtitle: "A few focused minutes can make your next conversation feel easier.",
  overall: 78,
  xp: 1240,
  level: 7,
  streak: 7,
  dailyGoal: 64,
  weeklyMinutes: 42,
  wordOfDay: { word: "resilient", meaning: "Able to recover from difficulties.", example: "She remained resilient despite many challenges.", synonyms: ["strong", "persistent", "adaptable"] },
  practice: [
    { id: "tense", title: "Verb tense tune-up", meta: "3 min · based on your history", type: "Grammar", color: "indigo" },
    { id: "speaking", title: "One-minute speaking sprint", meta: "1 min · build your flow", type: "Speaking", color: "mint" },
    { id: "vocab", title: "Make your words sharper", meta: "5 words · vocabulary", type: "Vocabulary", color: "sun" },
  ],
  commonErrors: [
    { label: "Verb tense", count: 12, score: 82, color: "#4352c7" },
    { label: "Articles", count: 8, score: 74, color: "#ef9c70" },
    { label: "Prepositions", count: 6, score: 68, color: "#62a989" },
  ],
  achievements: [
    { icon: "✦", title: "First speech", detail: "Completed", tone: "indigo" },
    { icon: "7", title: "Steady voice", detail: "7 day streak", tone: "sun" },
    { icon: "↗", title: "Finding flow", detail: "+12 this month", tone: "mint" },
  ],
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-10 w-10 place-items-center rounded-[14px] bg-[#4352c7] text-white shadow-[0_8px_20px_rgba(67,82,199,.25)]">
        <div className="absolute h-4 w-4 rounded-full border-2 border-[#f7d77a]" />
        <div className="absolute h-1 w-1 translate-x-[7px] -translate-y-[7px] rounded-full bg-[#d7f0e5]" />
        <div className="absolute h-1 w-1 -translate-x-[7px] translate-y-[7px] rounded-full bg-[#f5b2a5]" />
      </div>
      {!compact && <div><p className="font-display text-[21px] font-semibold leading-none tracking-[-.03em]">SpeakWise</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#687477]">English coach</p></div>}
    </div>
  );
}

function Sidebar({ active, onChange, open, onClose }: { active: Section; onChange: (section: Section) => void; open: boolean; onClose: () => void }) {
  return (
    <>
      <div className={classNames("fixed inset-0 z-30 bg-[#1e2526]/20 backdrop-blur-sm transition md:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} onClick={onClose} />
      <aside className={classNames("fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col border-r border-[#e2e5df] bg-[#fbfaf6] px-5 py-6 transition-transform duration-300 md:static md:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-9 flex items-center justify-between"><Logo /><button onClick={onClose} className="rounded-lg p-2 text-[#697477] hover:bg-[#f0f1ec] md:hidden"><X size={18} /></button></div>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#9aa29d]">Your space</p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = active === item.id;
            return <button key={item.id} onClick={() => { onChange(item.id); onClose(); }} className={classNames("group flex w-full items-center gap-3 rounded-[13px] px-3 py-3 text-left text-[13px] font-semibold transition", selected ? "bg-[#e6e7fc] text-[#303c9d]" : "text-[#697477] hover:bg-[#f0f1ec] hover:text-[#1e2526]")}><Icon size={18} strokeWidth={selected ? 2.3 : 1.8} /><span className="flex-1">{item.label}</span>{item.shortcut && <span className={classNames("rounded-md px-1.5 py-0.5 text-[10px]", selected ? "bg-white/70" : "bg-[#f0f1ec] text-[#9aa29d]")}>{item.shortcut}</span>}</button>;
          })}
        </nav>
        <div className="mt-auto space-y-4">
          <div className="rounded-[18px] bg-[#eceafb] p-4">
            <div className="mb-3 flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#4352c7]"><Sparkles size={15} /></span><span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#7176b5]">Pro tip</span></div>
            <p className="text-[12px] font-medium leading-5 text-[#3f467a]">A short pause sounds more confident than “um”. Try it in your next answer.</p>
          </div>
          <div className="flex items-center gap-3 border-t border-[#e2e5df] pt-4"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f7d77a] text-[12px] font-bold text-[#6f5214]">AS</div><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold">Ananya Sharma</p><p className="text-[11px] text-[#89928f]">Demo profile · Level 7</p></div><Settings2 size={16} className="text-[#9aa29d]" /></div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ active, onMenu }: { active: Section; onMenu: () => void }) {
  const label = navItems.find((item) => item.id === active)?.label ?? "Home";
  return <header className="flex h-[76px] items-center justify-between border-b border-[#e2e5df] bg-[#f8f7f2]/90 px-5 backdrop-blur md:px-10"><div className="flex items-center gap-3"><button onClick={onMenu} className="rounded-xl p-2 text-[#697477] hover:bg-[#eceee8] md:hidden"><Menu size={21} /></button><div><p className="font-display text-[21px] font-semibold tracking-[-.03em]">{label}</p><p className="hidden text-[11px] text-[#89928f] sm:block">Tuesday, 22 September 2026</p></div></div><div className="flex items-center gap-2 sm:gap-3"><button className="hidden items-center gap-2 rounded-xl border border-[#e2e5df] bg-white px-3 py-2 text-[12px] font-semibold text-[#697477] shadow-sm sm:flex"><CircleHelp size={15} /> Help</button><button className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#e2e5df] bg-white text-[#697477] shadow-sm"><Bell size={17} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ef806c]" /></button><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7d77a] text-[12px] font-bold text-[#6f5214]">AS</div></div></header>;
}

function SectionHeading({ eyebrow, title, description, action, onAction }: { eyebrow?: string; title: string; description?: string; action?: string; onAction?: () => void }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow && <p className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#7176b5]">{eyebrow}</p>}<h1 className="font-display text-[32px] font-semibold leading-[1.05] tracking-[-.035em] text-[#1e2526] md:text-[38px]">{title}</h1>{description && <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#697477]">{description}</p>}</div>{action && <button onClick={onAction} className="pressable inline-flex items-center gap-2 self-start rounded-xl bg-[#4352c7] px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_8px_18px_rgba(67,82,199,.18)] hover:bg-[#303c9d] sm:self-auto">{action}<ChevronRight size={15} /></button>}</div>;
}

function ProgressBar({ value, color = "#4352c7" }: { value: number; color?: string }) {
  return <div className="progress-track"><div className="progress-fill" style={{ width: `${value}%`, background: color }} /></div>;
}

function ScoreRing({ value }: { value: number }) {
  return <div className="relative grid h-[142px] w-[142px] place-items-center rounded-full" style={{ background: `conic-gradient(#4352c7 ${value * 3.6}deg, #e8e9f1 0deg)` }}><div className="grid h-[116px] w-[116px] place-items-center rounded-full bg-white"><div className="text-center"><p className="font-display text-[42px] font-semibold leading-none tracking-[-.05em] text-[#303c9d]">{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#89928f]">overall</p></div></div></div>;
}

function Dashboard({ data, go }: { data: typeof fallbackDashboard; go: (section: Section) => void }) {
  return <div className="fade-up mx-auto max-w-[1440px] space-y-6 p-5 md:p-10">
    <SectionHeading eyebrow="Tuesday reset" title={data.greeting} description={data.subtitle} action="Start practice" onAction={() => go("speak")} />
    <div className="grid gap-5 xl:grid-cols-[1.16fr_.84fr]">
      <div className="soft-card relative overflow-hidden rounded-[24px] bg-[#e6e7fc] p-6 md:p-8"><div className="absolute -right-12 -top-20 h-56 w-56 rounded-full border-[24px] border-white/30" /><div className="absolute -bottom-24 right-28 h-44 w-44 rounded-full border-[18px] border-[#f7d77a]/50" /><div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-center"><div className="max-w-[360px]"><span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#545aa3]"><Gauge size={13} /> Communication snapshot</span><h2 className="font-display text-[26px] font-semibold leading-tight tracking-[-.03em] text-[#2e377f]">Your voice is getting clearer.</h2><p className="mt-3 text-[13px] leading-6 text-[#5a629c]">You are strongest when you slow down and give your ideas a little more room.</p><button onClick={() => go("progress")} className="pressable mt-5 inline-flex items-center gap-2 rounded-xl bg-[#303c9d] px-4 py-2.5 text-[12px] font-bold text-white">See your progress <ArrowUpRight size={15} /></button></div><ScoreRing value={data.overall} /></div></div>
      <div className="soft-card rounded-[24px] bg-white p-6 md:p-7"><div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9aa29d]">Today's goal</p><h3 className="mt-1 font-display text-[24px] font-semibold">A little, every day.</h3></div><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#d7f0e5] text-[#3b7d62]"><Target size={21} /></div></div><div className="mb-3 flex items-end justify-between"><p className="font-display text-[35px] font-semibold leading-none">{data.dailyGoal}<span className="text-[18px] text-[#9aa29d]">%</span></p><p className="text-[11px] font-semibold text-[#62a989]">+12% this week</p></div><ProgressBar value={data.dailyGoal} color="#62a989" /><div className="mt-5 flex items-center justify-between text-[11px] text-[#89928f]"><span className="flex items-center gap-1.5"><Flame size={14} className="text-[#ef806c]" /> {data.streak} day streak</span><span className="flex items-center gap-1.5"><Zap size={14} className="text-[#d3a71c]" /> {data.xp.toLocaleString()} XP</span></div></div>
    </div>
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <div className="soft-card rounded-[24px] bg-white p-6 md:p-7"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9aa29d]">Curated for you</p><h3 className="mt-1 font-display text-[24px] font-semibold">Today's practice</h3></div><button onClick={() => go("practice")} className="text-[12px] font-bold text-[#4352c7]">View all</button></div><div className="grid gap-3 md:grid-cols-3">{data.practice.map((item) => <button key={item.id} onClick={() => go(item.id === "speaking" ? "speak" : "practice")} className="card-lift group rounded-[18px] border border-[#edf0eb] bg-[#fcfcf9] p-4 text-left"><div className={classNames("mb-7 grid h-10 w-10 place-items-center rounded-xl", item.color === "indigo" ? "bg-[#e6e7fc] text-[#4352c7]" : item.color === "mint" ? "bg-[#d7f0e5] text-[#3b7d62]" : "bg-[#fff0bf] text-[#987514]")}>{item.type === "Grammar" ? <WandSparkles size={17} /> : item.type === "Speaking" ? <Mic2 size={17} /> : <BookOpen size={17} />}</div><p className="text-[13px] font-bold leading-5">{item.title}</p><p className="mt-1 text-[11px] leading-5 text-[#89928f]">{item.meta}</p><div className="mt-4 flex items-center justify-between text-[11px] font-bold text-[#4352c7]"><span>Begin</span><ChevronRight className="transition group-hover:translate-x-1" size={15} /></div></button>)}</div></div>
      <div className="soft-card rounded-[24px] bg-[#1e2526] p-6 text-white md:p-7"><div className="mb-6 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a7b6ae]">Word of the day</p><h3 className="mt-1 font-display text-[32px] font-semibold tracking-[-.03em]">{data.wordOfDay.word}</h3></div><button onClick={() => go("learn")} className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#f7d77a] hover:bg-white/15"><Volume2 size={18} /></button></div><p className="max-w-[310px] text-[13px] leading-6 text-[#c8d2cc]">{data.wordOfDay.meaning}</p><p className="mt-4 border-l-2 border-[#f7d77a] pl-3 text-[12px] italic leading-5 text-[#f0f3ed]">“{data.wordOfDay.example}”</p><div className="mt-6 flex flex-wrap gap-2">{data.wordOfDay.synonyms.map((synonym) => <span key={synonym} className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#dce7df]">{synonym}</span>)}</div></div>
    </div>
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr_.8fr]"><div className="soft-card rounded-[24px] bg-white p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9aa29d]">Personal error profile</p><h3 className="mt-1 font-display text-[22px] font-semibold">Where to focus next</h3></div><button onClick={() => go("progress")} className="text-[12px] font-bold text-[#4352c7]">Details</button></div><div className="space-y-4">{data.commonErrors.map((error) => <div key={error.label}><div className="mb-2 flex justify-between text-[12px]"><span className="font-semibold">{error.label}</span><span className="text-[#89928f]">{error.count} repeats · {error.score}%</span></div><ProgressBar value={error.score} color={error.color} /></div>)}</div></div><div className="soft-card rounded-[24px] bg-[#fff4d2] p-6"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9d7b22]">Recent improvement</p><h3 className="mt-2 font-display text-[24px] font-semibold text-[#604c19]">More space, less rush.</h3><p className="mt-3 text-[12px] leading-5 text-[#776329]">Your average pause length is improving. That makes your ideas easier to follow.</p><div className="mt-7 flex items-end justify-between"><div><p className="font-display text-[35px] font-semibold text-[#604c19]">+18%</p><p className="text-[11px] text-[#9d7b22]">in the last 14 days</p></div><div className="flex items-end gap-1"><span className="h-8 w-2 rounded-full bg-[#e6c85f]" /><span className="h-12 w-2 rounded-full bg-[#e6c85f]" /><span className="h-10 w-2 rounded-full bg-[#e6c85f]" /><span className="h-16 w-2 rounded-full bg-[#b7982c]" /></div></div></div><div className="soft-card rounded-[24px] bg-white p-6"><div className="mb-5 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5b2a5] text-[#9e544b]"><Award size={18} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9aa29d]">Milestones</p><h3 className="font-display text-[21px] font-semibold">Your wins</h3></div></div><div className="space-y-3">{data.achievements.map((item) => <div key={item.title} className="flex items-center gap-3"><span className={classNames("grid h-8 w-8 place-items-center rounded-full text-[12px] font-bold", item.tone === "indigo" ? "bg-[#e6e7fc] text-[#4352c7]" : item.tone === "sun" ? "bg-[#fff0bf] text-[#987514]" : "bg-[#d7f0e5] text-[#3b7d62]")}>{item.icon}</span><div className="min-w-0"><p className="truncate text-[12px] font-bold">{item.title}</p><p className="text-[10px] text-[#89928f]">{item.detail}</p></div></div>)}</div><button onClick={() => go("profile")} className="mt-5 flex w-full items-center justify-center gap-1 text-[11px] font-bold text-[#4352c7]">View achievements <ChevronRight size={14} /></button></div></div>
  </div>;
}

function SpeakPage({ initialMode = "text" as AnalyzeMode }: { initialMode?: AnalyzeMode }) {
  const [mode, setMode] = useState<AnalyzeMode>(initialMode);
  const [text, setText] = useState("Yesterday I go to college and meet my friend. It was a good day and I was very happy.");
  const [duration, setDuration] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<any>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const analyze = trpc.speakwise.analyzeText.useMutation({ onSuccess: setResult });
  const metrics = trpc.speakwise.speechMetrics.useMutation({ onSuccess: setResult });
  const voiceTranscribe = trpc.voice.transcribe.useMutation({
    onSuccess: (response) => {
      if (!response.ok) {
        console.error(response.error ?? "Voice transcription failed");
        setIsRecording(false);
        return;
      }
      setText(response.text ?? text);
      setIsRecording(false);
    },
    onError: (error) => {
      console.error(error);
      setIsRecording(false);
    },
  });

  const blobToBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result.split(",")[1] : "";
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Failed to read audio blob"));
    reader.readAsDataURL(blob);
  });

  const startRecording = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (!SpeechRecognition) {
        setIsRecording(true);
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
        setText((previous) => `${previous === "" ? "" : previous + " "}${transcript}`.trim());
      };
      recognition.onend = () => setIsRecording(false);
      recognition.start();
      setIsRecording(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: mimeType });
        const base64 = await blobToBase64(blob);
        voiceTranscribe.mutate({
          audioBase64: base64,
          mimeType,
          language: "en",
          prompt: "Transcribe the user’s spoken English accurately and naturally.",
        });
        stream.getTracks().forEach((track) => track.stop());
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access failed", error);
      const recognition = SpeechRecognition && new (SpeechRecognition as any)();
      if (recognition) {
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
          setText((previous) => `${previous === "" ? "" : previous + " "}${transcript}`.trim());
        };
        recognition.onend = () => setIsRecording(false);
        recognition.start();
        setIsRecording(true);
      }
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const runAnalysis = () => mode === "speech" ? metrics.mutate({ transcript: text, durationSeconds: duration }) : analyze.mutate({ text, mode: "text" });
  const loading = analyze.isPending || metrics.isPending || voiceTranscribe.isPending;
  return <div className="fade-up mx-auto max-w-[1240px] space-y-6 p-5 md:p-10"><SectionHeading eyebrow="Speak lab" title="Turn practice into progress." description="Write it, say it, or paste a thought. SpeakWise will show you what is working and what to try next." /><div className="flex flex-wrap gap-2 rounded-2xl border border-[#e2e5df] bg-white p-2 shadow-sm"><button onClick={() => setMode("text")} className={classNames("pressable flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold", mode === "text" ? "bg-[#4352c7] text-white" : "text-[#697477] hover:bg-[#f0f1ec]")}><WandSparkles size={15} /> Text analysis</button><button onClick={() => setMode("speech")} className={classNames("pressable flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold", mode === "speech" ? "bg-[#4352c7] text-white" : "text-[#697477] hover:bg-[#f0f1ec]")}><AudioLines size={15} /> Speech analysis</button></div><div className="grid gap-5 xl:grid-cols-[.96fr_1.04fr]"><div className="soft-card rounded-[24px] bg-white p-6 md:p-7"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9aa29d]">Your input</p><h2 className="mt-1 font-display text-[24px] font-semibold">{mode === "speech" ? "Say what you mean." : "Write as you would speak."}</h2></div>{mode === "speech" && <span className="rounded-full bg-[#fff0bf] px-3 py-1.5 text-[10px] font-bold text-[#896b14]">AI transcription</span>}</div><textarea value={text} onChange={(event) => setText(event.target.value)} className="min-h-[230px] w-full resize-none rounded-[18px] border border-[#e2e5df] bg-[#fcfcf9] p-4 text-[15px] leading-7 outline-none transition focus:border-[#9ca4f5] focus:ring-4 focus:ring-[#e6e7fc]" placeholder="Tell me about a recent experience..." /><div className="mt-4 flex flex-wrap items-center gap-3">{mode === "speech" && <button onClick={isRecording ? stopRecording : startRecording} className={classNames("pressable inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold", isRecording ? "bg-[#ef806c] text-white" : "bg-[#4352c7] text-white")}><Mic2 size={15} /> {isRecording ? "Stop recording" : "Record audio"}</button>}{mode === "speech" && <button onClick={() => setText("")} className="rounded-xl border border-[#e2e5df] bg-white px-4 py-2.5 text-[12px] font-bold text-[#697477]">Clear</button>}<button onClick={runAnalysis} disabled={loading || !text.trim()} className={classNames("pressable inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white", loading || !text.trim() ? "cursor-not-allowed bg-[#a6adf4]" : "bg-[#1e2526]")}><Play size={15} /> {loading ? "Processing..." : mode === "speech" ? "Analyze speech" : "Analyze text"}</button></div>{mode === "speech" && <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#f5f6f1] px-3 py-2 text-[11px] font-semibold text-[#697477]"><span>Duration</span><input type="number" min={15} max={300} value={duration} onChange={(event) => setDuration(Number(event.target.value || 60))} className="w-20 rounded-lg border border-[#e2e5df] bg-white px-2 py-1 text-right outline-none" /></div>}</div><div className="soft-card rounded-[24px] bg-white p-6 md:p-7"><AnalysisResult result={result} mode={mode} /></div></div></div>;
}

function AnalysisResult({ result, mode }: { result: any; mode: AnalyzeMode }) {
ne-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold", isRecording ? "bg-[#f5b2a5] text-[#87483e]" : "bg-[#d7f0e5] text-[#347054]")}><Mic2 size={15} /> {isRecording ? "Stop listening" : "Use microphone"}</button>}<button disabled={!text.trim() || loading} onClick={runAnalysis} className="pressable inline-flex items-center gap-2 rounded-xl bg-[#4352c7] px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_8px_18px_rgba(67,82,199,.18)] disabled:cursor-not-allowed disabled:opacity-50">{loading ? <RotateCcw className="animate-spin" size={15} /> : <Sparkles size={15} />} {loading ? "Analyzing..." : "Analyze my English"}</button>{mode === "speech" && <label className="flex items-center gap-2 text-[11px] text-[#89928f]"><Clock3 size={14} /> <input type="number" min={1} value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="w-14 rounded-lg border border-[#e2e5df] bg-[#fcfcf9] px-2 py-1.5 text-center font-semibold text-[#1e2526]" /> sec</label>}</div><p className="mt-4 flex items-center gap-2 text-[11px] leading-5 text-[#89928f]"><ShieldCheck size={14} className="text-[#62a989]" /> Raw audio is temporary by default. Scores are application metrics, not certification.</p></div><AnalysisResult result={result} mode={mode} /></div></div>;
}

function AnalysisResult({ result, mode }: { result: any; mode: AnalyzeMode }) {
  if (!result) return <div className="soft-card flex min-h-[370px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#cfd5cf] bg-[#fcfcf9] p-8 text-center"><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#e6e7fc] text-[#4352c7]"><Sparkles size={24} /></div><h3 className="font-display text-[23px] font-semibold">Your insight space is ready.</h3><p className="mt-2 max-w-[300px] text-[12px] leading-5 text-[#89928f]">Run an analysis to see clear corrections, natural alternatives, and one next step.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><span className="rounded-full bg-[#e6e7fc] px-3 py-1.5 text-[10px] font-bold text-[#4352c7]">Grammar</span><span className="rounded-full bg-[#d7f0e5] px-3 py-1.5 text-[10px] font-bold text-[#347054]">Flow</span><span className="rounded-full bg-[#fff0bf] px-3 py-1.5 text-[10px] font-bold text-[#896b14]">Vocabulary</span></div></div>;
  return <div className="soft-card rounded-[24px] bg-white p-6 md:p-7"><div className="mb-6 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9aa29d]">Your feedback</p><h2 className="mt-1 font-display text-[24px] font-semibold">A clearer way to say it.</h2></div><div className="rounded-2xl bg-[#d7f0e5] px-3 py-2 text-center"><p className="font-display text-[21px] font-semibold leading-none text-[#347054]">{result.scores.grammar}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#5a8e77]">grammar</p></div></div><div className="space-y-4">{result.errors.length ? result.errors.slice(0, 2).map((error: any) => <div key={error.id} className="rounded-[17px] border border-[#f0dfdc] bg-[#fff9f7] p-4"><div className="mb-2 flex items-center justify-between"><span className="rounded-full bg-[#f5b2a5] px-2.5 py-1 text-[10px] font-bold text-[#87483e]">{error.type}</span><span className="text-[10px] font-bold uppercase tracking-[.12em] text-[#b97e76]">Try this</span></div><p className="text-[12px] text-[#8c635d] line-through">{error.original}</p><p className="mt-1 text-[14px] font-bold text-[#347054]">{error.correction}</p><p className="mt-2 text-[11px] leading-5 text-[#7f716f]">{error.explanation}</p></div>) : <div className="rounded-[17px] bg-[#d7f0e5] p-4 text-[13px] font-semibold text-[#347054]">No recurring grammar errors found in this sample. Nice clarity.</div>}<div className="rounded-[17px] bg-[#e6e7fc] p-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#6067ad]">Natural version</p><p className="text-[13px] font-semibold leading-6 text-[#303c9d]">{result.naturalVersion}</p><div className="mt-3 border-t border-[#cfd1f1] pt-3"><p className="mb-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#7075b9]">Advanced option</p><p className="text-[12px] leading-5 text-[#4a5298]">{result.advancedVersion}</p></div></div>{mode === "speech" && <div className="grid grid-cols-3 gap-2">{[["WPM", result.wordsPerMinute], ["Pauses", result.longPauses], ["Fillers", result.fillerTotal]].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#edf0eb] bg-[#fcfcf9] p-3 text-center"><p className="font-display text-[22px] font-semibold">{value}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#89928f]">{label}</p></div>)}</div>}</div></div>;
}

function TalkPage() {
  const [scenario, setScenario] = useState("Job interview");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ from: "ai" | "you"; text: string }>>([{ from: "ai", text: "Hi Ananya. Let’s practice a calm, confident job interview answer. Tell me about a project you are proud of." }]);
  const respond = trpc.speakwise.conversation.useMutation({ onSuccess: (data) => setMessages((items) => [...items, { from: "ai", text: data.reply }]) });
  const send = () => { if (!message.trim()) return; const next = message.trim(); setMessages((items) => [...items, { from: "you", text: next }]); setMessage(""); respond.mutate({ scenario, message: next }); };
  return <div className="fade-up mx-auto max-w-[1050px] space-y-6 p-5 md:p-10"><SectionHeading eyebrow="Conversation mode" title="Practice the moment, not the script." description="A gentle conversation partner for interviews, presentations, travel, and everyday confidence." /><div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]"><div className="soft-card rounded-[24px] bg-[#1e2526] p-6 text-white"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a7b6ae]">Choose a scenario</p><div className="mt-4 space-y-2">{["Job interview", "Presentation", "Casual conversation", "Travel"].map((item) => <button key={item} onClick={() => setScenario(item)} className={classNames("flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-[12px] font-semibold transition", scenario === item ? "bg-[#4352c7] text-white" : "text-[#b8c7bf] hover:bg-white/10")}><span>{item}</span>{scenario === item && <Check size={15} />}</button>)}</div><div className="mt-8 rounded-[17px] border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-2 text-[#f7d77a]"><Sparkles size={14} /><span className="text-[10px] font-bold uppercase tracking-[.14em]">Coach note</span></div><p className="mt-2 text-[12px] leading-5 text-[#c8d2cc]">The coach waits for your thought to land. Feedback comes after the conversation.</p></div><span className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold text-[#9cad9f]"><WandSparkles size={13} /> Demo adapter · provider-ready</span></div><div className="soft-card flex min-h-[520px] flex-col rounded-[24px] bg-white p-5 md:p-7"><div className="flex items-center justify-between border-b border-[#edf0eb] pb-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#e6e7fc] text-[#4352c7]"><MessageCircle size={18} /></div><div><p className="text-[13px] font-bold">SpeakWise Coach</p><p className="text-[10px] text-[#89928f]">{scenario} · listening</p></div></div><span className="flex items-center gap-1.5 text-[10px] font-bold text-[#62a989]"><span className="h-1.5 w-1.5 rounded-full bg-[#62a989]" /> ready</span></div><div className="flex-1 space-y-4 overflow-y-auto py-5">{messages.map((item, index) => <div key={`${item.from}-${index}`} className={classNames("flex gap-3", item.from === "you" && "flex-row-reverse")}><div className={classNames("grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold", item.from === "ai" ? "bg-[#e6e7fc] text-[#4352c7]" : "bg-[#f7d77a] text-[#6f5214]")}>{item.from === "ai" ? "SW" : "AS"}</div><div className={classNames("max-w-[78%] rounded-[17px] px-4 py-3 text-[12px] leading-5", item.from === "ai" ? "bg-[#f5f6f1] text-[#4d5857]" : "bg-[#4352c7] text-white")}>{item.text}</div></div>)}</div><div className="flex items-center gap-2 rounded-2xl bg-[#f5f6f1] p-2"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Type your answer..." className="min-w-0 flex-1 bg-transparent px-3 text-[12px] outline-none" /><button onClick={send} disabled={respond.isPending} className="pressable grid h-10 w-10 place-items-center rounded-xl bg-[#4352c7] text-white disabled:opacity-50">{respond.isPending ? <RotateCcw size={15} className="animate-spin" /> : <Send size={15} />}</button></div></div></div></div>;
}

function LearnPage({ data }: { data: typeof fallbackDashboard }) {
  return <div className="fade-up mx-auto max-w-[1150px] space-y-6 p-5 md:p-10"><SectionHeading eyebrow="Learn with intention" title="Small lessons, well chosen." description="Build your learning path around the moments you want to handle with more confidence." /><div className="grid gap-5 lg:grid-cols-[1fr_.85fr]"><div className="soft-card overflow-hidden rounded-[24px] bg-[#1e2526] p-7 text-white md:p-9"><div className="flex items-start justify-between"><span className="rounded-full bg-[#f7d77a] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#604c19]">Featured word</span><Headphones size={20} className="text-[#f7d77a]" /></div><p className="mt-12 font-display text-[54px] font-semibold lowercase tracking-[-.06em] text-[#f7d77a]">{data.wordOfDay.word}</p><p className="mt-2 max-w-[410px] text-[14px] leading-6 text-[#d0dbd2]">{data.wordOfDay.meaning} Words like this help you describe progress without sounding rehearsed.</p><div className="mt-7 flex flex-wrap gap-2">{data.wordOfDay.synonyms.map((synonym) => <span key={synonym} className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-[#dce7df]">{synonym}</span>)}</div><div className="mt-8 border-t border-white/10 pt-5"><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#9cad9f]">In context</p><p className="mt-2 text-[14px] italic leading-6 text-white">“{data.wordOfDay.example}”</p></div></div><div className="soft-card rounded-[24px] bg-white p-7"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9aa29d]">Your learning path</p><h3 className="mt-1 font-display text-[26px] font-semibold">Find your clear voice</h3><div className="mt-7 space-y-5">{[{ step: "01", label: "Build strong sentences", detail: "Grammar foundations", done: true }, { step: "02", label: "Make words do more", detail: "Vocabulary & naturalness", done: true }, { step: "03", label: "Speak with space", detail: "Flow & confidence", done: false }, { step: "04", label: "Lead the conversation", detail: "Real-world practice", done: false }].map((item) => <div key={item.step} className="flex items-center gap-4"><div className={classNames("grid h-9 w-9 place-items-center rounded-full text-[10px] font-bold", item.done ? "bg-[#d7f0e5] text-[#347054]" : item.step === "03" ? "bg-[#e6e7fc] text-[#4352c7]" : "bg-[#f0f1ec] text-[#a2aaa4]")}>{item.done ? <Check size={15} /> : item.step}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between"><p className={classNames("text-[12px] font-bold", !item.done && item.step !== "03" && "text-[#a2aaa4]")}>{item.label}</p>{item.step === "03" && <span className="rounded-full bg-[#e6e7fc] px-2 py-1 text-[9px] font-bold text-[#4352c7]">Next</span>}</div><p className="mt-1 text-[11px] text-[#89928f]">{item.detail}</p></div></div>)}</div><button className="pressable mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4352c7] py-3 text-[12px] font-bold text-white">Continue learning <ChevronRight size={15} /></button></div></div></div>;
}

function PracticePage() {
  const { data } = trpc.speakwise.exercises.useQuery();
  const submit = trpc.speakwise.submitExercise.useMutation();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const items = data?.items ?? [];
  const item = items[index];
  if (!item) return null;
  const choose = (answer: string) => { setSelected(answer); submit.mutate({ exerciseId: item.id, answer }, { onSuccess: setFeedback }); };
  return <div className="fade-up mx-auto max-w-[930px] space-y-6 p-5 md:p-10"><SectionHeading eyebrow="Personalized practice" title="Practice what your profile notices." description="Every exercise here is selected from your recurring patterns, not a generic lesson list." /><div className="soft-card rounded-[26px] bg-white p-6 md:p-9"><div className="mb-8 flex flex-wrap items-center justify-between gap-3"><div><span className="rounded-full bg-[#e6e7fc] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#4352c7]">{item.kind}</span><h2 className="mt-4 font-display text-[30px] font-semibold tracking-[-.03em]">{item.title}</h2></div><div className="flex items-center gap-2 rounded-xl bg-[#fff4d2] px-3 py-2 text-[11px] font-bold text-[#896b14]"><Zap size={14} /> +{item.xp} XP</div></div><div className="rounded-[20px] bg-[#f5f6f1] p-6 text-center"><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#89928f]">{item.skill}</p><p className="mt-3 font-display text-[25px] font-semibold leading-relaxed">{item.prompt}</p></div>{item.choices.length > 0 && <div className="mt-6 grid gap-3 md:grid-cols-3">{item.choices.map((choice) => <button key={choice} onClick={() => choose(choice)} className={classNames("pressable rounded-2xl border px-4 py-4 text-left text-[12px] font-bold transition", selected === choice ? "border-[#4352c7] bg-[#e6e7fc] text-[#303c9d]" : "border-[#e2e5df] bg-white hover:border-[#9ca4f5] hover:bg-[#f7f7ff]")}>{choice}</button>)}</div>}{item.choices.length === 0 && <button onClick={() => choose("completed")} className="pressable mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4352c7] py-4 text-[12px] font-bold text-white">I completed the speaking challenge <Check size={15} /></button>}{feedback && <div className={classNames("mt-5 rounded-2xl p-4 text-[12px] font-semibold", feedback.correct ? "bg-[#d7f0e5] text-[#347054]" : "bg-[#fff4d2] text-[#896b14]")}><div className="flex items-center gap-2"><Check size={15} /> {feedback.correct ? "Nice work — that's the pattern." : "Good attempt. Review the pattern and try again."}</div><p className="mt-1 font-normal">{feedback.feedback}</p></div>}<div className="mt-8 flex items-center justify-between border-t border-[#edf0eb] pt-5"><p className="text-[11px] text-[#89928f]">Exercise {index + 1} of {items.length}</p><button onClick={() => { setIndex((index + 1) % items.length); setSelected(""); setFeedback(null); }} className="pressable inline-flex items-center gap-2 rounded-xl border border-[#e2e5df] px-3 py-2 text-[11px] font-bold text-[#697477] hover:bg-[#f5f6f1]">Next exercise <ChevronRight size={14} /></button></div></div></div>;
}

function ProgressPage() {
  const { data } = trpc.speakwise.profile.useQuery();
  const scores = data?.scores ?? { grammar: 82, vocabulary: 74, fluency: 78, pronunciation: 81 };
  return <div className="fade-up mx-auto max-w-[1150px] space-y-6 p-5 md:p-10"><SectionHeading eyebrow="Your progress" title="Notice the change." description="SpeakWise tracks application metrics across sessions so improvement feels visible and useful." /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{Object.entries(scores).map(([label, value], index) => <div key={label} className="soft-card rounded-[22px] bg-white p-5"><div className="mb-6 flex items-center justify-between"><span className={classNames("grid h-9 w-9 place-items-center rounded-xl", index === 0 ? "bg-[#e6e7fc] text-[#4352c7]" : index === 1 ? "bg-[#fff0bf] text-[#896b14]" : index === 2 ? "bg-[#d7f0e5] text-[#347054]" : "bg-[#f5b2a5] text-[#9e544b]")}>{index === 0 ? <WandSparkles size={17} /> : index === 1 ? <BookOpen size={17} /> : index === 2 ? <AudioLines size={17} /> : <Mic2 size={17} />}</span><ArrowUpRight size={16} className="text-[#62a989]" /></div><p className="font-display text-[32px] font-semibold leading-none">{value}</p><p className="mt-2 text-[11px] font-bold capitalize text-[#697477]">{label}</p><div className="mt-4"><ProgressBar value={Number(value)} color={index === 0 ? "#4352c7" : index === 1 ? "#d3a71c" : index === 2 ? "#62a989" : "#ef806c"} /></div></div>)}</div><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="soft-card rounded-[24px] bg-white p-6 md:p-8"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9aa29d]">Last 14 days</p><h3 className="mt-1 font-display text-[25px] font-semibold">A steadier rhythm</h3></div><div className="flex items-center gap-2 rounded-xl bg-[#d7f0e5] px-3 py-2 text-[11px] font-bold text-[#347054]"><ArrowUpRight size={14} /> 18%</div></div><div className="mt-8 flex h-[220px] items-end gap-3 border-b border-l border-[#edf0eb] px-3 pb-3 pt-5">{[34, 40, 37, 52, 48, 58, 57, 62, 60, 68, 65, 72, 74, 78].map((value, index) => <div key={index} className="group flex h-full flex-1 flex-col justify-end gap-2"><div className="w-full rounded-t-lg bg-[#e6e7fc] transition group-hover:bg-[#4352c7]" style={{ height: `${value * 2.3}px` }} /><span className="text-center text-[9px] text-[#a4aca7]">{index + 9}</span></div>)}</div><div className="mt-4 flex items-center justify-between text-[10px] text-[#89928f]"><span>Sep 9</span><span>Practice minutes · application metric</span><span>Sep 22</span></div></div><div className="soft-card rounded-[24px] bg-[#fff4d2] p-6 md:p-8"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9d7b22]">Personal error profile</p><h3 className="mt-1 font-display text-[25px] font-semibold text-[#604c19]">Your patterns are teachable.</h3><div className="mt-7 space-y-5">{(data?.patterns ?? []).map((pattern) => <div key={pattern.label} className="flex items-center justify-between border-b border-[#ead9a9] pb-4"><div><p className="text-[12px] font-bold text-[#604c19]">{pattern.label}</p><p className="mt-1 text-[11px] text-[#9d7b22]">{pattern.trend}</p></div><span className="font-display text-[21px] font-semibold text-[#604c19]">{pattern.value}</span></div>)}</div><p className="mt-5 flex items-center gap-2 text-[11px] leading-5 text-[#896b14]"><Sparkles size={14} /> Adaptive practice updates after each analysis.</p></div></div></div>;
}

function LeaderboardPage() {
  const { data } = trpc.speakwise.leaderboard.useQuery();
  return <div className="fade-up mx-auto max-w-[900px] space-y-6 p-5 md:p-10"><SectionHeading eyebrow="Friendly competition" title="A little momentum helps." description="Demo participants are seeded for the local experience. Real rankings arrive with optional accounts." /><div className="soft-card overflow-hidden rounded-[24px] bg-white"><div className="bg-[#1e2526] p-7 text-white md:p-9"><div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a7b6ae]">This week's practice</p><h2 className="mt-1 font-display text-[31px] font-semibold">Keep your place warm.</h2></div><Trophy size={38} className="text-[#f7d77a]" /></div><div className="mt-7 flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-white/10"><div className="h-2 w-[64%] rounded-full bg-[#f7d77a]" /></div><span className="text-[12px] font-bold text-[#f7d77a]">1,240 XP</span></div></div><div className="divide-y divide-[#edf0eb]">{(data ?? []).map((person) => <div key={person.rank} className={classNames("flex items-center gap-4 px-6 py-4 md:px-8", person.you && "bg-[#fafaff]")}><span className="w-5 text-center font-display text-[19px] font-semibold text-[#89928f]">{person.rank}</span><div className="grid h-10 w-10 place-items-center rounded-full text-[11px] font-bold" style={{ background: person.tone, color: person.you ? "#6f5214" : "#4352c7" }}>{person.initials}</div><div className="min-w-0 flex-1"><p className="text-[13px] font-bold">{person.name} {person.you && <span className="ml-1 rounded-full bg-[#fff0bf] px-2 py-1 text-[9px] font-bold text-[#896b14]">you</span>}</p><p className="text-[11px] text-[#89928f]">Consistent practice</p></div><p className="text-[13px] font-bold">{person.xp.toLocaleString()} <span className="text-[10px] font-normal text-[#89928f]">XP</span></p></div>)}</div></div><p className="flex items-center gap-2 text-[11px] text-[#89928f]"><LockKeyhole size={13} /> Seeded demo data is labeled and does not represent real users.</p></div>;
}

function ProfilePage() {
  return <div className="fade-up mx-auto max-w-[950px] space-y-6 p-5 md:p-10"><SectionHeading eyebrow="Your profile" title="Ananya, keep going." description="Your profile turns practice into a story you can actually see." /><div className="soft-card rounded-[24px] bg-white p-7 md:p-9"><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><div className="grid h-24 w-24 place-items-center rounded-[28px] bg-[#f7d77a] font-display text-[30px] font-semibold text-[#6f5214]">AS</div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-[29px] font-semibold">Ananya Sharma</h2><span className="rounded-full bg-[#e6e7fc] px-2.5 py-1 text-[10px] font-bold text-[#4352c7]">Demo profile</span></div><p className="mt-2 text-[12px] text-[#89928f]">College learner · practicing for clearer interviews and presentations</p><div className="mt-4 flex flex-wrap gap-4 text-[11px] font-semibold text-[#697477]"><span className="flex items-center gap-1.5"><Flame size={14} className="text-[#ef806c]" /> 7 day streak</span><span className="flex items-center gap-1.5"><Zap size={14} className="text-[#d3a71c]" /> Level 7</span><span className="flex items-center gap-1.5"><Clock3 size={14} className="text-[#4352c7]" /> 42 min this week</span></div></div><button className="pressable inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e5df] px-3 py-2 text-[11px] font-bold text-[#697477]"><Settings2 size={14} /> Settings</button></div><div className="mt-9 grid gap-4 border-t border-[#edf0eb] pt-7 sm:grid-cols-3"><div className="rounded-2xl bg-[#f5f6f1] p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#89928f]">XP earned</p><p className="mt-2 font-display text-[28px] font-semibold">1,240</p></div><div className="rounded-2xl bg-[#e6e7fc] p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#6970b2]">Sessions</p><p className="mt-2 font-display text-[28px] font-semibold text-[#303c9d]">18</p></div><div className="rounded-2xl bg-[#d7f0e5] p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#5a8e77]">Improvement</p><p className="mt-2 font-display text-[28px] font-semibold text-[#347054]">+18%</p></div></div></div><div className="grid gap-5 md:grid-cols-2"><div className="soft-card rounded-[24px] bg-[#fff4d2] p-6"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9d7b22]">Your focus</p><h3 className="mt-1 font-display text-[23px] font-semibold text-[#604c19]">More room between ideas.</h3><p className="mt-3 text-[12px] leading-6 text-[#776329]">You are learning to replace filler words with short pauses. That is a confident habit.</p></div><div className="soft-card rounded-[24px] bg-white p-6"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9aa29d]">Privacy promise</p><h3 className="mt-1 font-display text-[23px] font-semibold">Your practice stays yours.</h3><p className="mt-3 flex gap-2 text-[12px] leading-6 text-[#697477]"><ShieldCheck size={16} className="mt-1 shrink-0 text-[#62a989]" /> Raw audio is temporary by default. You decide which results become part of your learning history.</p></div></div></div>;
}

export default function Home() {
  const [active, setActive] = useState<Section>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: dashboardQuery } = trpc.speakwise.dashboard.useQuery();
  const dashboard = dashboardQuery ?? fallbackDashboard;
  const content = useMemo(() => {
    if (active === "dashboard") return <Dashboard data={dashboard} go={setActive} />;
    if (active === "speak") return <SpeakPage />;
    if (active === "talk") return <TalkPage />;
    if (active === "learn") return <LearnPage data={dashboard} />;
    if (active === "practice") return <PracticePage />;
    if (active === "progress") return <ProgressPage />;
    if (active === "leaderboard") return <LeaderboardPage />;
    return <ProfilePage />;
  }, [active, dashboard]);
  return <div className="paper-grain min-h-screen bg-[#f8f7f2] text-[#1e2526]"><div className="flex min-h-screen"><Sidebar active={active} onChange={setActive} open={mobileOpen} onClose={() => setMobileOpen(false)} /><main className="min-w-0 flex-1"><Topbar active={active} onMenu={() => setMobileOpen(true)} />{content}</main></div></div>;
}
