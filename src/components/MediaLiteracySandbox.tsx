import React, { useState } from "react";
import { BookOpen, Award, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, HelpCircle, Check, Award as Trophy, RefreshCw, Flame, Plus, Trash2, Scale, FileText, Layers } from "lucide-react";
import { motion } from "motion/react";

interface FramingOption {
  id: string;
  source: string;
  headline: string;
  correctBias: "left" | "center" | "right";
  explanation: string;
  keywords: string[];
}

interface TriviaRound {
  id: string;
  factualCore: string;
  options: FramingOption[];
}

// Complete real-world Indian editorial framing rounds covering multiple news dimensions
const GAME_ROUNDS: TriviaRound[] = [
  {
    id: "g1",
    factualCore: "The Reserve Bank of India approves a record dividend surplus transfer of ₹2.11 lakh crore to the Central Government.",
    options: [
      {
        id: "g1-opt1",
        source: "The Financial Front",
        headline: "Historic Liquidity Payout: Unstoppable Growth Trajectory Validated by Record RBI Cash Infusion",
        correctBias: "right",
        keywords: ["Unstoppable Growth", "Historic Liquidity", "Validated"],
        explanation: "This headline uses high-sentiment booster terms ('Unstoppable', 'Historic') to declare economic success, reflecting supportive pro-government bias."
      },
      {
        source: "Economic Data Digest",
        id: "g1-opt2",
        headline: "Reserve Bank Board Approves ₹2.11 Trillion Surplus Transfer to Central Government Portfolio",
        correctBias: "center",
        keywords: ["Board Approves", "Surplus Transfer"],
        explanation: "This headline focuses strictly on regulatory facts, using neutral administrative actions and financial values without added emotional loading or speculative adjectives."
      },
      {
        source: "The Citizen Voice",
        id: "g1-opt3",
        headline: "Fears of Reserve Depletion as Sovereign Demands Massive Outlay from RBI Savings Pool",
        correctBias: "left",
        keywords: ["Fears of Reserve Depletion", "Demands", "Massive Outlay"],
        explanation: "This headline leads with anxiety-inducing phrases ('Fears of Depletion'), and frames the normal regulatory surplus transfer as critical or forced, inviting skepticism."
      }
    ]
  },
  {
    id: "g2",
    factualCore: "High summer temperatures force the government to use backup thermal coal plants to prevent electricity failures.",
    options: [
      {
        source: "Power Grid Record",
        id: "g2-opt1",
        headline: "Power Ministry Invokes Emergency Section 11 to Mandate Full Thermal Power Generation",
        correctBias: "center",
        keywords: ["Invokes Emergency Section 11", "Mandate Full"],
        explanation: "This report focuses strictly on administrative actions and official statutes, avoiding any celebratory or critical adjectives regarding fossil fuel usage."
      },
      {
        source: "Green Horizon Daily",
        id: "g2-opt2",
        headline: "Fossil Fuel Capitulation: Heatwave Surge Exposes Severe Lacunae in India's Green Solar Transition",
        correctBias: "left",
        keywords: ["Capitulation", "Exposes Severe Lacunae"],
        explanation: "This headline frames emergency coal generation as a defeat ('capitulation') and explicitly highlights systemic planning failures ('exposes severe lacunae') in line with green/skeptical perspectives."
      },
      {
        source: "Industrial Success India",
        id: "g2-opt3",
        headline: "Dynamic Grid Planning Saves India From Summer Blackout as Coal Reserves Perform Perfectly",
        correctBias: "right",
        keywords: ["Dynamic Grid Planning Saves", "Perform Perfectly"],
        explanation: "This headline frames the situation as a triumph ('planning saves India') and uses extreme praise ('perform perfectly') to present fossil fuel reliance as a proactive asset of national infrastructure."
      }
    ]
  },
  {
    id: "g3",
    factualCore: "The Election Commission reports a high voter turnout in regional assembly constituency seats.",
    options: [
      {
        source: "The Democratic Mirror",
        id: "g3-opt1",
        headline: "Voter Disappearance Feared Until Last-Minute Swell: Explaining Turnout Surges in Highly Contested Seats",
        correctBias: "left",
        keywords: ["Voter Disappearance Feared", "Swell"],
        explanation: "This headline uses suspenseful framing to invite anxiety and highlights potential voter detachment before concluding, aligning with a skeptical editorial bias."
      },
      {
        source: "National Bulletin",
        id: "g3-opt2",
        headline: "Election Commission Records 68.4% Overall Turnout Across the Assembly Poll Segments",
        correctBias: "center",
        keywords: ["Records 68.4%", "Overall Turnout"],
        explanation: "This headline reports the quantitative voter percentage directly and cites the state regulator without inserting speculative predictions or emotional color."
      },
      {
        source: "The Sovereign Citizen",
        id: "g3-opt3",
        headline: "Democratic Triumph: Enthusiastic Public Surge Demonstrates Deep Trust in Developmental Reforms",
        correctBias: "right",
        keywords: ["Democratic Triumph", "Enthusiastic Public Surge", "Deep Trust"],
        explanation: "This headline frames voter turnout as a political endorsement ('Democratic Triumph', 'Deep Trust in Reforms'), which represents a supportive pro-development framework."
      }
    ]
  },
  {
    id: "g4",
    factualCore: "A local tech hub announces state-backed capital subsidies to manufacture commercial AI micro-processors.",
    options: [
      {
        source: "Startup Swadeshi Daily",
        id: "g4-opt1",
        headline: "Historic Atmanirbhar Dawn: Indigenous Super-Processor Unveiled as Tech Sovereignty Goes Global",
        correctBias: "right",
        keywords: ["Historic Atmanirbhar Dawn", "Tech Sovereignty"],
        explanation: "This headline heavily utilizes civic pride buzzwords ('Historic Atmanirbhar Dawn', 'Tech Sovereignty') to frame chip production as a major national milestone."
      },
      {
        source: "The Tech Oversight Report",
        id: "g4-opt2",
        headline: "Handouts For Silicon Conglomerates? State AI Chip Initiative Faces Criticism Over Closed Sourcing",
        correctBias: "left",
        keywords: ["Handouts", "Faces Criticism", "Closed Sourcing"],
        explanation: "This report focuses strictly on criticisms of funding distribution ('Handouts', 'Closed Sourcing'), inviting public skepticism regarding corporate incentives."
      },
      {
        source: "Silicon India Journal",
        id: "g4-opt3",
        headline: "Electronics Ministry Allocates ₹400 Crore Infrastructure Capital Grant for Domestic Chip Fabrication Project",
        correctBias: "center",
        keywords: ["Allocates ₹400 Crore", "Domestic Chip Fabrication"],
        explanation: "This report centers on institutional financial numbers and statutory department names, leaving reader conclusions entirely independent."
      }
    ]
  },
  {
    id: "g5",
    factualCore: "The Forestry Ministry greenlights selective mining operations in Central India side-by-side with commercial replanting programs.",
    options: [
      {
        source: "Green Earth Coalition",
        id: "g5-opt1",
        headline: "Irreversible Ecological Betrayal: Mineral Lobby Wins Forest Mining Clearance in Sham Greenwashing Accord",
        correctBias: "left",
        keywords: ["Ecological Betrayal", "Sham Greenwashing Accord"],
        explanation: "This headline categorizes the environmental policy negatively as 'Greenwashing' and 'Betrayal' before a scientific audit is performed, setting clear skeptical/activist bias."
      },
      {
        source: "Mineral Resource Update",
        id: "g5-opt2",
        headline: "Forestry Ministry Permits Phase-1 Mineral Extraction Alongside Mandated Native Replanting Covenants",
        correctBias: "center",
        keywords: ["Permits Phase-1", "Mandated Native Replanting"],
        explanation: "This headline lists the bureaucratic steps ('Permits Phase-1') and standard administrative covenants without making pre-judgments on environmental success or failure."
      },
      {
        source: "National Infrastructure Post",
        id: "g5-opt3",
        headline: "Critical Mineral Victory: Sustainable Project Powers Industrial Might While Restoring Native Reserves",
        correctBias: "right",
        keywords: ["Victory", "Powers Industrial Might", "Restoring Native Reserves"],
        explanation: "This headline frames extraction positively as an automatic 'victory' and proclaims the project fully 'sustainable' prior to completion, aligning with patriotic/developmental bias."
      }
    ]
  }
];

const SLIDER_DATA = {
  title: "Interactive Bias Shifter Simulation",
  metric: "Semantics Weight",
  left: {
    label: "Skepticism / Critique Bias",
    text: "Activists are raising alarms as the state aggressively pushes semiconductor subsidies to enrich private conglomerates, risking public money in highly volatile silicon ventures instead of addressing systemic distress in education.",
    highlights: ["raising alarms", "aggressively pushes", "enrich private conglomerates", "risking public money", "systemic distress"]
  },
  center: {
    label: "Neutral Regulatory Frame",
    text: "The Joint Venture semiconductor fabrication facility completed its initial 28nm trial wafers in Gujarat, supported by state capital incentives totaling up to 50 percent of the verified equipment outlays.",
    highlights: ["completed its initial trial", "supported by state capital incentives"]
  },
  right: {
    label: "National Development Frame",
    text: "Atmanirbhar India achieves a historic landmark as the state-of-the-art Dholera silicon fabrication hub goes online, securing tech-sovereignty and laying foundations to dominate the modern global electronic arena.",
    highlights: ["Atmanirbhar India achieves", "historic landmark", "state-of-the-art", "securing tech-sovereignty", "dominate the modern"]
  }
};

interface DespinWord {
  text: string;
  isLoaded: boolean;
  neutralAlternative?: string;
  whyBiased?: string;
}

interface DespinMission {
  id: string;
  topic: string;
  originalHeadline: string;
  words: DespinWord[];
}

const DESPIN_MISSIONS: DespinMission[] = [
  {
    id: "ds1",
    topic: "Technology (Atmanirbhar Chip Drive)",
    originalHeadline: "Historic and state-of-the-art Dholera silicon fab facility dramatically saves local industry from disastrous dependency",
    words: [
      { text: "Historic", isLoaded: true, neutralAlternative: "The new", whyBiased: "A grandiose adjective that elevates standard public/private ventures into epic turning points of destiny." },
      { text: "and", isLoaded: false },
      { text: "state-of-the-art", isLoaded: true, neutralAlternative: "commercial", whyBiased: "Marketing-level hype terminology designed to evoke unquestioning technical admiration." },
      { text: "Dholera semiconductor facility", isLoaded: false },
      { text: "dramatically", isLoaded: true, whyBiased: "A theatrical adverb that dramatizes normal material scaling." },
      { text: "saves", isLoaded: true, neutralAlternative: "positions", whyBiased: "Creates an emotional 'rescue' narrative around standard commercial market security." },
      { text: "local industry from", isLoaded: false },
      { text: "disastrous", isLoaded: true, whyBiased: "A catastrophic adjective that triggers immediate public panic and sovereign fear." },
      { text: "dependency", isLoaded: true, neutralAlternative: "high import reliance", whyBiased: "A loaded noun representing external global trade trade-offs as a fundamental weakness." }
    ]
  },
  {
    id: "ds2",
    topic: "Elections (High Turnout Dynamics)",
    originalHeadline: "Desperate voter rebellion triggers massive landslide to ruthlessly sweep out corrupt and failed state representatives",
    words: [
      { text: "Desperate", isLoaded: true, whyBiased: "Psychological projection that reduces calculated electoral decisions to emotional panic." },
      { text: "voter rebellion", isLoaded: true, neutralAlternative: "Strong voter turnout", whyBiased: "A dramatic term casting standard democratic ballot-casting as an illegal, violent uprising." },
      { text: "triggers", isLoaded: false },
      { text: "massive", isLoaded: true, whyBiased: "Sensation-maximizing quantity adjective meant to artificially inflate the magnitude of victory." },
      { text: "landslide to", isLoaded: false },
      { text: "ruthlessly", isLoaded: true, whyBiased: "Suggests a cruel, merciless campaign rather than a peaceful regulatory replacement process." },
      { text: "sweep out", isLoaded: true, neutralAlternative: "replace", whyBiased: "A cleaning metaphor that subtly dehumanizes the outgoing public servants." },
      { text: "corrupt and failed", isLoaded: true, whyBiased: "A sweeping moral verdict that labels multi-year complex administrations as simple absolute failures." },
      { text: "state representatives", isLoaded: false }
    ]
  },
  {
    id: "ds3",
    topic: "Environment (Forest Clearances)",
    originalHeadline: "Severe eco-apocalypse looms as greedy mining conglomerates launch toxic operations in pristine forested reserves",
    words: [
      { text: "Severe", isLoaded: true, whyBiased: "An alarmist qualifier that primes readers to expect extreme doom before reviewing evidence." },
      { text: "eco-apocalypse", isLoaded: true, neutralAlternative: "environmental impact", whyBiased: "Exaggerated end-of-the-world wording used to stir environmental panic." },
      { text: "looms as", isLoaded: false },
      { text: "greedy", isLoaded: true, whyBiased: "An explicit moral denunciation assigning hostile psychological motives to business operators." },
      { text: "mining conglomerates", isLoaded: false },
      { text: "launch", isLoaded: false },
      { text: "toxic", isLoaded: true, whyBiased: "Pre-judges environmental runoff ahead of scientific lab tests or regulatory oversight." },
      { text: "operations in", isLoaded: false },
      { text: "pristine", isLoaded: true, whyBiased: "A romanticized term implying absolute state of purity, disregarding years of human proximity." },
      { text: "forested reserves", isLoaded: false }
    ]
  },
  {
    id: "ds4",
    topic: "Elections (Coalition Disputes)",
    originalHeadline: "Brutal and chaotic power-grab summit ends as desperate leaders strike a devious compromise to split treasury spoils",
    words: [
      { text: "Brutal and chaotic", isLoaded: true, neutralAlternative: "Intense", whyBiased: "Draws on conflict/war metaphors to depict standard administrative negotiations as violent disorder." },
      { text: "power-grab", isLoaded: true, neutralAlternative: "coalition-building", whyBiased: "A highly cynical characterization framing constitutional dialogue as a theft of democracy." },
      { text: "summit ends as", isLoaded: false },
      { text: "desperate", isLoaded: true, whyBiased: "Emotional term implying negotiators have lost control and act out of pure panic." },
      { text: "leaders strike a", isLoaded: false },
      { text: "devious", isLoaded: true, neutralAlternative: "strategic", whyBiased: "A hostile modifier projecting secret malice onto traditional administrative compromises." },
      { text: "compromise to", isLoaded: false },
      { text: "split treasury spoils", isLoaded: true, neutralAlternative: "allocate portfolios", whyBiased: "A military plunder metaphor ('spoils') that represents standard budget distribution as looted treasure." }
    ]
  },
  {
    id: "ds5",
    topic: "Environment (Water Conservation)",
    originalHeadline: "Miraculous water project sparks aggressive outrage from vocal activist factions amplifying unfounded eco-hysteria",
    words: [
      { text: "Miraculous", isLoaded: true, neutralAlternative: "New", whyBiased: "Grandiose religious hyperbole celebrating public works prior to scientific audit." },
      { text: "water project", isLoaded: false },
      { text: "sparks", isLoaded: false },
      { text: "aggressive", isLoaded: true, whyBiased: "A negative modifier that subtly discredits local critics as hostile or unreasonable." },
      { text: "outrage from", isLoaded: false },
      { text: "vocal", isLoaded: true, whyBiased: "A dismissive label representing serious local concern as merely loud and noisy." },
      { text: "activist factions", isLoaded: true, neutralAlternative: "community groups", whyBiased: "A divisive noun ('factions') designed to paint civic organizations as hostile sub-groups." },
      { text: "amplifying", isLoaded: false },
      { text: "unfounded", isLoaded: true, whyBiased: "An absolute dismissal that rejects ecological concerns without citing scientific studies." },
      { text: "eco-hysteria", isLoaded: true, neutralAlternative: "environmental concerns", whyBiased: "A highly patronizing label treating environmental data as simple irrational panic." }
    ]
  },
  {
    id: "ds6",
    topic: "Welfare (Public Handouts)",
    originalHeadline: "Unprecedented and visionary welfare handouts launch to effortlessly extinguish generational rural poverty",
    words: [
      { text: "Unprecedented", isLoaded: true, neutralAlternative: "Statutory", whyBiased: "A spectacularizing term that overrides objective comparison with historical welfare schemes." },
      { text: "and", isLoaded: false },
      { text: "visionary", isLoaded: true, neutralAlternative: "targeted", whyBiased: "Praising modifier that elevates policymakers' plans as prophetic, bypassing cost trade-off critiques." },
      { text: "welfare handouts", isLoaded: true, neutralAlternative: "social disbursements", whyBiased: "Concerts legitimate citizen security allowances with patronizing private charity." },
      { text: "launch to", isLoaded: false },
      { text: "effortlessly", isLoaded: true, whyBiased: "Exaggerates administrative ease to obscure operational friction or high fiscal strain." },
      { text: "extinguish", isLoaded: true, neutralAlternative: "mitigate", whyBiased: "A totalizing verb suggesting absolute, instant eradication of a complex socio-economic issue." },
      { text: "generational rural poverty", isLoaded: false }
    ]
  }
];

export function MediaLiteracySandbox() {
  const [activeSubTab, setActiveSubTab] = useState<"articles" | "checkTool" | "games" | "entman">("articles");
  const [activeGameType, setActiveGameType] = useState<"spin" | "despin" | "slider">("spin");
  
  // Entman's Framing Theory Academic Analyzer state
  const [articleInputText, setArticleInputText] = useState("");
  const [entmanResult, setEntmanResult] = useState<any | null>(null);
  const [entmanLoading, setEntmanLoading] = useState(false);
  const [entmanError, setEntmanError] = useState("");
  const [analysisTab, setAnalysisTab] = useState<"frame" | "sources" | "language" | "method" | "raw">("frame");

  // Entman's Comparative Framing state variables
  const [entmanMode, setEntmanMode] = useState<"single" | "compare">("single");
  const [compareArticles, setCompareArticles] = useState<{ outlet: string; text: string }[]>([
    {
      outlet: "The Daily Telegraph (National Press)",
      text: "MUMBAI — The Reserve Bank of India (RBI) approved a record dividend surplus transfer of ₹2.11 lakh crore to the Central Government. The record surplus payout will supplement standard tax-revenue projections, granting the finance ministry additional cushion for public capex and fiscal consolidation goals. The historic liquidity injection was strongly backed by robust asset stewardship. Sovereign commentators praised the magnificent financial shield."
    },
    {
      outlet: "The Independent Sentinel (Skeptic Press)",
      text: "MUMBAI — Critics and bank autonomy advocates raised severe concern as the RBI decided to transfer ₹2.11 lakh crore to the treasury. Financial skeptics warned that the depletion of capital buffers merger with sovereign debt goals puts extreme future risk on inflation shielding, compromising key institutional autonomy under active fiscal pressures from the capital."
    }
  ]);
  const [compareResult, setCompareResult] = useState<any | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState("");
  const [compareResultTab, setCompareResultTab] = useState<"summary" | "comparison" | "findings" | "credibility" | "raw">("summary");
  
  // Game 1: Spot the Spin state
  const [currentRound, setCurrentRound] = useState(0);
  const [guesses, setGuesses] = useState<Record<string, "left" | "center" | "right">>({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Game 2: De-spin Master state
  const [currentDespinIndex, setCurrentDespinIndex] = useState(0);
  const [selectedWordIndices, setSelectedWordIndices] = useState<number[]>([]);
  const [despinEvaluated, setDespinEvaluated] = useState(false);
  const [despinStreak, setDespinStreak] = useState(0);
  const [inspectedWordIndex, setInspectedWordIndex] = useState<number | null>(null);

  // Slider State (0: Left, 1: Center, 2: Right)
  const [biasSlider, setBiasSlider] = useState(1);

  // Custom user Headline Fact Checker Tool State
  const [customHeadline, setCustomHeadline] = useState("");
  const [completedChecks, setCompletedChecks] = useState<string[]>([]);
  const [hasChecked, setHasChecked] = useState(false);

  // Live AI Fact-check state variables
  const [isAnalyzingFact, setIsAnalyzingFact] = useState(false);
  const [factAnalysisResult, setFactAnalysisResult] = useState<any | null>(null);
  const [factAnalysisError, setFactAnalysisError] = useState("");

  const handleLiveFactCheck = async () => {
    if (!customHeadline.trim()) return;
    setIsAnalyzingFact(true);
    setFactAnalysisResult(null);
    setFactAnalysisError("");
    try {
      const res = await fetch("/api/fact-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline: customHeadline })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setFactAnalysisResult(data.analysis);
      } else {
        setFactAnalysisError(data.error || "Failed to process fact-check query.");
      }
    } catch (err) {
      setFactAnalysisError("A network error occurred while reaching the analytical model.");
    } finally {
      setIsAnalyzingFact(false);
    }
  };

  const verificationChecklist = [
    { id: "lateral", label: "Perform Lateral Reading", desc: "Open 3-4 other regional tabs to verify if other independent publications covered the same physical details." },
    { id: "loaded", label: "Inspect Loaded Adjectives", desc: "Check if the headline uses high-vibe emotional primers like 'Historic', 'Capitulation', or 'Grave threat'." },
    { id: "money", label: "Follow the Financing Angle", desc: "Look up if the story involves corporate subsidies, regulatory changes, or direct government incentives." },
    { id: "source", label: "Evaluate Primary Quotes", desc: "Look for direct quotation marks ('...') instead of the journalist's paraphrased interpretation." }
  ];

  const toggleCheck = (id: string) => {
    if (completedChecks.includes(id)) {
      setCompletedChecks(prev => prev.filter(c => c !== id));
    } else {
      setCompletedChecks(prev => [...prev, id]);
    }
  };

  const getVerificationScore = () => {
    const total = verificationChecklist.length;
    const completed = completedChecks.length;
    return Math.round((completed / total) * 100);
  };

  const handleGuess = (optionId: string, bias: "left" | "center" | "right") => {
    setGuesses(prev => ({
      ...prev,
      [optionId]: bias
    }));
  };

  const checkRound = () => {
    const roundObj = GAME_ROUNDS[currentRound];
    let correctCount = 0;
    
    roundObj.options.forEach(opt => {
      if (guesses[opt.id] === opt.correctBias) {
        correctCount += 1;
      }
    });

    setScore(prev => prev + correctCount);
    setShowResults(true);
  };

  const nextRound = () => {
    if (currentRound < GAME_ROUNDS.length - 1) {
      setCurrentRound(prev => prev + 1);
      setGuesses({});
      setShowResults(false);
    } else {
      setCurrentRound(0);
      setGuesses({});
      setScore(0);
      setShowResults(false);
    }
  };

  const currentRoundData = GAME_ROUNDS[currentRound];

  const renderHighlightedText = (text: string, highlights: string[]) => {
    let output = text;
    highlights.forEach(phrase => {
      const regex = new RegExp(`(${phrase})`, "gi");
      output = output.replace(regex, `<span class="bg-amber-100 text-amber-955 font-bold px-1 rounded-sm">$1</span>`);
    });
    return <p className="text-sm font-serif leading-relaxed text-stone-900" dangerouslySetInnerHTML={{ __html: output }} />;
  };

  const getSliderParagraph = () => {
    if (biasSlider === 0) return SLIDER_DATA.left;
    if (biasSlider === 2) return SLIDER_DATA.right;
    return SLIDER_DATA.center;
  };

  return (
    <section 
      id="media-literacy-section"
      className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs mb-12"
    >
      {/* Academy Header */}
      <div className="border-b border-slate-200/60 pb-5 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-slate-950 text-white p-2.5 rounded-xl flex items-center justify-center shadow-3xs">
            <BookOpen className="h-5 w-5 text-indigo-100" />
          </div>
          <h2 className="font-serif text-2xl font-black text-slate-900 tracking-tight">
            Media Literacy Academy
          </h2>
        </div>
        <p className="text-slate-500 text-sm max-w-3xl leading-relaxed">
          The ultimate platform to navigate modern news reporting. Cultivate structural fact-checking techniques, identify editorial spin, and learn how to deconstruct media bias on any event.
        </p>

        {/* Local Section Navigation Tab Bar */}
        <div className="flex flex-wrap gap-2 mt-6 border-b border-slate-100 pb-px">
          <button
            onClick={() => setActiveSubTab("articles")}
            className={`px-4.5 py-2.5 font-mono text-xs font-bold uppercase transition-all tracking-wide cursor-pointer relative ${
              activeSubTab === "articles"
                ? "text-slate-950 font-black border-b-2 border-slate-950"
                : "text-slate-400 hover:text-slate-700 hover:border-slate-200"
            }`}
          >
            📚 Core Bias Guides
          </button>
          <button
            onClick={() => setActiveSubTab("checkTool")}
            className={`px-4.5 py-2.5 font-mono text-xs font-bold uppercase transition-all tracking-wide cursor-pointer relative ${
              activeSubTab === "checkTool"
                ? "text-slate-950 font-black border-b-2 border-slate-950"
                : "text-slate-400 hover:text-slate-700 hover:border-slate-200"
            }`}
          >
            🕵️ Fact Verification Utility
          </button>
          <button
            onClick={() => setActiveSubTab("games")}
            className={`px-4.5 py-2.5 font-mono text-xs font-bold uppercase transition-all tracking-wide cursor-pointer relative ${
              activeSubTab === "games"
                ? "text-slate-950 font-black border-b-2 border-slate-950"
                : "text-slate-400 hover:text-slate-700 hover:border-slate-200"
            }`}
          >
            🎮 Interactive Games
          </button>
          <button
            onClick={() => setActiveSubTab("entman")}
            className={`px-4.5 py-2.5 font-mono text-xs font-bold uppercase transition-all tracking-wide cursor-pointer relative ${
              activeSubTab === "entman"
                ? "text-slate-950 font-black border-b-2 border-slate-950"
                : "text-slate-400 hover:text-slate-700 hover:border-slate-200"
            }`}
          >
            🔬 Academic Framing Engine
          </button>
        </div>
      </div>

      {/* Sub-tab Renders */}
      {activeSubTab === "articles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
          
          {/* Guide Article 1 */}
          <article className="border border-stone-200/60 rounded-sm p-6 bg-stone-50/40 hover:border-stone-300 transition-all">
            <span className="text-[10px] font-mono font-medium text-stone-400 uppercase tracking-widest block mb-2">Editorial Deep Dive</span>
            <h3 className="font-serif text-lg font-bold text-stone-950 mb-3">
              Understanding the Left-Center-Right Spectrum in India
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed mb-4">
              In the Indian context, media houses rarely partition cleanly along binary Western concepts of liberal vs conservative. Instead, political and developmental alignments express editorial viewpoints on distinct dimensions:
            </p>
            <ul className="space-y-3 text-xs text-stone-700">
              <li className="flex items-start gap-2">
                <span className="bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0 mt-0.5">Left Angle</span>
                <span>Focuses heavily on critiques of public-revenue allocation, corporate subsidies (capital handouts), labor rights, and raises alerts regarding surveillance or state digital registries.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-stone-200 text-stone-800 font-bold px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0 mt-0.5">Centrist Angle</span>
                <span>Prioritizes raw regulatory guidelines, judicial procedures, macroeconomic trends, and details actions exactly as noted in administrative bulletins.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0 mt-0.5">Right Angle</span>
                <span>Emphasizes national integration, investment momentum, technological autonomy (e.g. Atmanirbhar Bharat), and frames grid or hardware startups as major developmental victories.</span>
              </li>
            </ul>
          </article>

          {/* Guide Article 2 */}
          <article className="border border-stone-200/60 rounded-sm p-6 bg-stone-50/40 hover:border-stone-300 transition-all">
            <span className="text-[10px] font-mono font-medium text-stone-400 uppercase tracking-widest block mb-2">Practical Protocols</span>
            <h3 className="font-serif text-lg font-bold text-stone-950 mb-3">
              The Fact-Checker's Routine: 4 Actionable Techniques
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed mb-4">
              Consuming news critically means moving beyond passive digestion. Whenever you view a sensational or highly controversial national report, apply this checklist immediately to strip out emotional triggers:
            </p>
            <div className="space-y-3 font-sans text-xs">
              <div>
                <span className="font-bold text-stone-900 block mb-0.5">1. Practice Lateral Reading</span>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Do not stay on the original page. Open three other regions to check if they corroborate the same core numbers (e.g., verifying the exact RBI transfer amounts) without changing key figures.
                </p>
              </div>
              <div>
                <span className="font-bold text-stone-900 block mb-0.5">2. Isolate Loaded Adjectives</span>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Look for nouns and verbs that trigger emotions rather than presenting facts. A simple regulatory decision should be labeled as an administrative act, not a 'historic triumph' or a 'grave betrayal'.
                </p>
              </div>
              <div>
                <span className="font-bold text-stone-900 block mb-0.5">3. Inspect Quotation Integrity</span>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Make sure quotes are verbatim. Paraphrased statements are often used by polarized outlets to fit the overall spin of their editorial structure.
                </p>
              </div>
            </div>
          </article>
        </div>
      )}

      {activeSubTab === "checkTool" && (
        <div className="border border-slate-800 rounded-2xl p-6 bg-[#11111a]/90 font-sans text-left space-y-6">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-black text-[#fbfcfa] mb-2.5">
              Live AI Fact Verification Sandbox
            </h3>
            <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
              Paste any sensational news headline, social media statement, or viral claim regarding Indian current affairs to instantly cross-examine its framing and factual integrity.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <label className="block text-slate-450 font-mono text-[10px] uppercase tracking-wider font-bold mb-1.5">Paste Claim or Headline</label>
                <input
                  type="text"
                  placeholder="e.g. 'Unprecedented fiscal crisis forces RBI to transfer massive funds to state' or click below..."
                  value={customHeadline}
                  onChange={(e) => {
                    setCustomHeadline(e.target.value);
                    setHasChecked(true);
                  }}
                  className="w-full text-xs p-3 border border-slate-800 rounded-xl bg-[#08080c] focus:outline-none focus:ring-1 focus:ring-indigo-505 text-slate-200"
                />
              </div>
              <div className="self-end shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleLiveFactCheck}
                  disabled={isAnalyzingFact || !customHeadline.trim()}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-500 text-white font-mono text-[10px] sm:text-[11px] tracking-wider font-black uppercase rounded-xl transition-all duration-300 cursor-pointer shadow-md select-none"
                >
                  {isAnalyzingFact ? "VERIFYING..." : "ANALYZE CLAIM"}
                </button>
              </div>
            </div>

            {/* Quick pre-populate triggers */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[9px] font-mono uppercase text-slate-500">Suggested Examples:</span>
              <button
                type="button"
                onClick={() => {
                  setCustomHeadline("Record ₹2.11 lakh crore payout proves India is going bankrupt and depleting outer central bank vaults");
                  setHasChecked(true);
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-sans text-slate-350 rounded-lg cursor-pointer"
              >
                "Record payout proves bankruptcy"
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomHeadline("Dholera semiconductor factory to single-handedly replace all international imports next month");
                  setHasChecked(true);
                }}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-sans text-slate-350 rounded-lg cursor-pointer"
              >
                "Replace all microchip imports"
              </button>
            </div>

            {hasChecked && customHeadline && (
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 pt-3">
                {/* Left block: Traditional Verification steps for rigor reinforcement */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-[#12121c]/40 border border-slate-800/60 p-4 rounded-xl space-y-3">
                    <span className="block text-slate-400 font-mono text-[10px] uppercase tracking-wider font-bold">
                      Step 1: Your Verification Checklist
                    </span>
                    <p className="text-[11px] text-slate-450 leading-relaxed font-sans">
                      Academic checks to run in parallel in your browser:
                    </p>
                    <div className="space-y-2.5">
                      {verificationChecklist.map((check) => {
                        const isChecked = completedChecks.includes(check.id);
                        return (
                          <div 
                            key={check.id}
                            onClick={() => toggleCheck(check.id)}
                            className={`p-3 rounded-xl border text-slate-300 cursor-pointer transition-all flex items-start gap-3 select-none ${
                              isChecked 
                                ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-300" 
                                : "bg-slate-900/60 border-slate-850 hover:border-slate-800"
                            }`}
                          >
                            <div className={`h-4 w-4 mt-0.5 rounded-sm border flex items-center justify-center transition-all ${
                              isChecked ? "bg-emerald-600 border-emerald-700 text-white" : "border-slate-700 bg-slate-950"
                            }`}>
                              {isChecked && <Check className="h-3 w-3" />}
                            </div>
                            <div>
                              <span className={`text-xs font-bold font-sans block ${isChecked ? "text-emerald-400" : "text-slate-200"}`}>
                                {check.label}
                              </span>
                              <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
                                {check.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Checklist Rigor Gauge Indicator */}
                  <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-slate-500 font-mono text-[9px] uppercase block mb-2 tracking-widest">Rigor Verification Score</span>
                    
                    <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-slate-800 mb-3 bg-slate-950">
                      <span className="font-serif text-2xl font-black text-slate-100">
                        {getVerificationScore()}%
                      </span>
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-emerald-500/40 animate-pulse" 
                        style={{ 
                          clipPath: `inset(${(100 - getVerificationScore())}% 0px 0px 0px)`
                        }}
                      />
                    </div>

                    <span className="text-[10px] font-bold font-sans text-slate-350">
                      {getVerificationScore() === 100 && "💎 Ultimate Fact Investigation!"}
                      {getVerificationScore() >= 50 && getVerificationScore() < 100 && "🛡️ Good verification setup."}
                      {getVerificationScore() < 50 && "⚠️ Highly vulnerable to spin."}
                    </span>
                  </div>
                </div>

                {/* Right block: Live AI Fact-check outcomes */}
                <div className="lg:col-span-6 space-y-4">
                  {isAnalyzingFact ? (
                    <div className="h-full min-h-[300px] border border-slate-850 bg-slate-950/20 rounded-2xl flex flex-col items-center justify-center gap-3.5 p-6 text-center select-none">
                      <RefreshCw className="h-7 w-7 text-indigo-400 animate-spin" />
                      <div>
                        <p className="font-serif italic text-[#fbfbfc] text-sm">Processing verification query...</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1.5 uppercase tracking-widest">Applying Entman's structural factuality parameters</p>
                      </div>
                    </div>
                  ) : factAnalysisError ? (
                    <div className="border border-red-900/30 bg-red-950/20 text-red-200 p-5 rounded-2xl text-xs space-y-1">
                      <span className="font-mono uppercase text-red-400 font-bold tracking-wider">Analysis Execution Interrupted:</span>
                      <p className="font-medium text-red-300">{factAnalysisError}</p>
                      <button
                        onClick={handleLiveFactCheck}
                        className="mt-3.5 px-4.5 py-1.5 bg-red-950 text-red-300 font-mono text-[9px] font-bold uppercase tracking-wider rounded border border-red-900/45 hover:bg-red-900"
                      >
                        Retry Analysis
                      </button>
                    </div>
                  ) : factAnalysisResult ? (
                    <div className="border border-slate-800 bg-[#12121c]/45 p-6 rounded-2xl space-y-5 animate-fade-in">
                      
                      {/* Verdict Stance Banner */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4 gap-3 flex-wrap">
                        <div className="space-y-0.5 text-left">
                          <span className="text-[8.5px] font-mono tracking-widest uppercase text-slate-500 font-black block">VERDICT TYPE</span>
                          <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-widest px-3 py-1 rounded border ${
                            factAnalysisResult.verdict === "VERIFIED" 
                              ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-400" 
                              : factAnalysisResult.verdict === "MISLEADING" || factAnalysisResult.verdict === "NEEDS CONTEXT"
                                ? "border-amber-500/25 bg-amber-500/5 text-amber-400"
                                : "border-rose-500/25 bg-rose-500/5 text-rose-400"
                          }`}>
                            {factAnalysisResult.verdict}
                          </span>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span className="text-[8.5px] font-mono tracking-widest uppercase text-slate-500 font-black block">RELIABILITY SCALE</span>
                          <span className="font-mono text-sm font-black text-indigo-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded shadow-3xs">
                            {factAnalysisResult.score || 80}/100
                          </span>
                        </div>
                      </div>

                      {/* Extracted Core Claim */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono tracking-wider uppercase text-indigo-450 block font-bold">EXTRACTED FACTUAL CLAIM</span>
                        <p className="text-xs font-serif italic text-slate-200 pl-3.5 border-l-2 border-indigo-500">
                          &ldquo;{factAnalysisResult.claim}&rdquo;
                        </p>
                      </div>

                      {/* Precise Aspect Breakdowns */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        <div className="p-3.5 bg-slate-950/45 border border-slate-800/80 rounded-xl space-y-1.5 text-xs text-left">
                          <span className="text-emerald-405 text-[8.5px] font-black uppercase tracking-widest font-mono block">ACCURATE CONTEXT</span>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{factAnalysisResult.accurate || "N/A"}</p>
                        </div>
                        <div className="p-3.5 bg-slate-950/45 border border-slate-800/80 rounded-xl space-y-1.5 text-xs text-left">
                          <span className="text-amber-405 text-[8.5px] font-black uppercase tracking-widest font-mono block">OMITTED / MISSING</span>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{factAnalysisResult.missing || "Critical details omitted."}</p>
                        </div>
                        <div className="p-3.5 bg-slate-950/45 border border-slate-800/80 rounded-xl space-y-1.5 text-xs text-left">
                          <span className="text-rose-405 text-[8.5px] font-black uppercase tracking-widest font-mono block">ERRORS / HYPERBOLE</span>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{factAnalysisResult.wrong || "Exaggerated framing patterns."}</p>
                        </div>
                      </div>

                      {/* Step next manual corroboration */}
                      {factAnalysisResult.steps && factAnalysisResult.steps.length > 0 && (
                        <div className="bg-slate-900/40 border border-slate-800/80 p-4.5 rounded-xl space-y-3">
                          <span className="text-[9px] font-mono tracking-widest uppercase text-slate-450 block font-extrabold">
                            ACADEMIC ACTIONS — HOW TO CONFIRM ON YOUR OWN:
                          </span>
                          <ol className="space-y-2.5 text-left font-sans text-xs">
                            {factAnalysisResult.steps.map((st: string, sIdx: number) => (
                              <li key={sIdx} className="flex gap-2.5 items-start">
                                <span className="p-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[9px] font-black h-4 w-4 flex items-center justify-center shrink-0 mt-0.5">
                                  {sIdx + 1}
                                </span>
                                <span className="text-slate-350 text-[11px] leading-relaxed select-text">{st}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="h-full min-h-[300px] border border-slate-805 bg-slate-950/10 rounded-2xl p-6 text-center flex flex-col items-center justify-center select-none text-slate-500">
                      <HelpCircle className="h-7 w-7 text-slate-600 mb-1.5" />
                      <p className="font-serif italic text-xs">Ready to initiate claim examination...</p>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-slate-605 mt-1">Paste any news statement and hit "Analyze Claim" above.</p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "games" && (
        <div className="space-y-8 font-sans">
          
          {/* Game Sub-Tab Selection Header */}
          <div className="bg-stone-50 border border-stone-200 p-2 rounded-sm flex flex-wrap gap-1">
            <button
              onClick={() => setActiveGameType("spin")}
              className={`flex-1 min-w-[130px] px-4 py-2.5 rounded-sm font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                activeGameType === "spin"
                  ? "bg-stone-900 text-[#fbfcfa] shadow-sm"
                  : "bg-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-150/30"
              }`}
            >
              🎯 Spot the Spin ({currentRound + 1}/5)
            </button>
            <button
              onClick={() => {
                setActiveGameType("despin");
                setSelectedWordIndices([]);
                setDespinEvaluated(false);
              }}
              className={`flex-1 min-w-[130px] px-4 py-2.5 rounded-sm font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                activeGameType === "despin"
                  ? "bg-stone-900 text-[#fbfcfa] shadow-sm"
                  : "bg-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-150/30"
              }`}
            >
              🧼 De-spin Master™
            </button>
            <button
              onClick={() => setActiveGameType("slider")}
              className={`flex-1 min-w-[130px] px-4 py-2.5 rounded-sm font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                activeGameType === "slider"
                  ? "bg-stone-900 text-[#fbfcfa] shadow-sm"
                  : "bg-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-150/30"
              }`}
            >
              🎚️ Semantics Dial
            </button>
          </div>

          {/* GAME TYPE 1: SPOT THE SPIN TRIVIA */}
          {activeGameType === "spin" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Trivia Board */}
              <div className="border border-stone-200/80 rounded-sm p-6 bg-[#fbfcfb]/40 relative">
                <span className="absolute top-4 right-4 bg-stone-100 border border-stone-200 px-3 py-0.5 rounded-sm font-mono text-[10px] text-stone-600 uppercase tracking-wider font-bold">
                  LEVEL {currentRound + 1} OF 5
                </span>
                
                <h3 className="font-serif text-lg font-bold text-stone-950 mb-1.5 flex items-center gap-2">
                  <Trophy className="h-4.5 w-4.5 text-amber-600" />
                  Spot the Spin Training Game
                </h3>
                <p className="text-stone-500 text-xs mb-5 font-sans leading-relaxed">
                  Publications frame bare events differently to align with cognitive filters. Correctly categorize each regional headline's underlying bias orientation.
                </p>

                <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-sm mb-6">
                  <span className="text-[9px] font-mono font-bold uppercase text-stone-400 block mb-1">FACTUAL CORE:</span>
                  <p className="text-stone-700 text-xs leading-relaxed font-sans font-medium">
                    &ldquo;{currentRoundData.factualCore}&rdquo;
                  </p>
                </div>

                <div className="space-y-4">
                  {currentRoundData.options.map((opt) => {
                    const currentGuess = guesses[opt.id];
                    const isCorrectFlag = currentGuess === opt.correctBias;

                    return (
                      <div key={opt.id} className="p-4 border border-stone-200 rounded-sm bg-white">
                        <span className="text-[10px] font-mono text-stone-400 mb-1.5 block uppercase tracking-wide">{opt.source}</span>
                        <h4 className="font-serif font-bold text-sm text-stone-900 leading-snug mb-3">
                          &ldquo;{opt.headline}&rdquo;
                        </h4>

                        {/* Left Center Right selectors */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100 mt-2.5">
                          {(["left", "center", "right"] as const).map((biasType) => {
                            const isSelected = currentGuess === biasType;
                            return (
                              <button
                                key={biasType}
                                onClick={() => !showResults && handleGuess(opt.id, biasType)}
                                disabled={showResults}
                                className={`px-2.5 py-1 rounded-sm font-mono text-[10px] uppercase border cursor-pointer transition-all ${
                                  isSelected 
                                    ? biasType === "left" 
                                      ? "bg-sky-50 border-sky-300 text-sky-850 font-extrabold"
                                      : biasType === "center"
                                        ? "bg-stone-100 border-stone-450 text-stone-850 font-extrabold"
                                        : "bg-rose-50 border-rose-300 text-rose-850 font-extrabold"
                                    : "bg-[#fbfcfa] border-stone-200 text-stone-500 hover:bg-stone-50"
                                }`}
                              >
                                {biasType === "left" ? "Skeptical Focus" : biasType === "center" ? "Technical Focus" : "Sovereignty Focus"}
                              </button>
                            );
                          })}
                        </div>

                        {showResults && (
                          <div className="mt-3.5 pt-3 border-t border-stone-150 text-[11px]">
                            <div className="flex items-center gap-2 mb-1.5">
                              {isCorrectFlag ? (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100">
                                  ✓ Matches Intended Bias Label
                                </span>
                              ) : (
                                <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-100">
                                  ✗ Target category should be: {opt.correctBias.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <p className="text-stone-600 font-sans leading-relaxed">{opt.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Game Footer Control */}
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-stone-200">
                  {showResults ? (
                    <button
                      onClick={nextRound}
                      className="inline-flex items-center gap-1.5 text-stone-900 hover:text-stone-700 font-mono text-xs font-bold uppercase border-b border-stone-900 pb-0.5 cursor-pointer"
                    >
                      {currentRound < GAME_ROUNDS.length - 1 ? "Next Level" : "Reset Levels Loop"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={checkRound}
                      disabled={Object.keys(guesses).length < currentRoundData.options.length}
                      className="px-4 py-2 rounded-sm bg-stone-950 text-white font-mono text-xs font-extrabold cursor-pointer disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-200 uppercase tracking-widest border border-stone-850"
                    >
                      Evaluate Guess Sets
                    </button>
                  )}

                  {showResults && (
                    <span className="font-mono text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 border border-stone-200 rounded-sm">
                      MATCHES RECORDED: {score}
                    </span>
                  )}
                </div>
              </div>

              {/* Training Tips Sidebar */}
              <div className="bg-stone-50 border border-stone-200/80 rounded-sm p-6">
                <h4 className="font-serif text-base font-bold text-stone-950 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                  Bias Analysis Criteria
                </h4>
                <p className="text-stone-600 text-xs leading-relaxed mb-4">
                  Each news outlet selects verbs and adjectives based on editorial philosophies:
                </p>
                
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3 bg-white border border-stone-200 rounded-sm">
                    <span className="text-sky-800 font-mono font-bold uppercase text-[9px] block mb-1">Skeptical Focus (Left Bias)</span>
                    <p className="text-stone-500">
                      Investigative, cautions of regulatory compliance, emphasizes union or ecological risk, and represents government funding as taxpayer capital risk.
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-stone-200 rounded-sm">
                    <span className="text-stone-700 font-mono font-bold uppercase text-[9px] block mb-1">Technical Focus (Center Bias)</span>
                    <p className="text-stone-500">
                      Objective, relies strictly on numerical indices, government department quotes, legal terms, and provides verified action lists without hyperbole.
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-stone-200 rounded-sm">
                    <span className="text-rose-800 font-mono font-bold uppercase text-[9px] block mb-1">Sovereignty Focus (Right Bias)</span>
                    <p className="text-stone-500">
                      Patriotic, frames technology and infrastructure as milestones of self-reliance (Atmanirbhar), and emphasizes state growth indices and business trust.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GAME TYPE 2: DE-SPIN MASTER ARCHETYPE */}
          {activeGameType === "despin" && (() => {
            const mission = DESPIN_MISSIONS[currentDespinIndex];
            const loadCount = mission.words.filter(w => w.isLoaded).length;
            
            // Re-evaluate calculation
            const truePositives = mission.words.filter((w, i) => w.isLoaded && selectedWordIndices.includes(i)).length;
            const falsePositives = mission.words.filter((w, i) => !w.isLoaded && selectedWordIndices.includes(i)).length;
            const integrityScore = Math.max(0, Math.round(((truePositives - falsePositives) / loadCount) * 100));

            const toggleWord = (idx: number) => {
              if (despinEvaluated) {
                setInspectedWordIndex(idx);
                return;
              }
              setInspectedWordIndex(idx);
              if (selectedWordIndices.includes(idx)) {
                setSelectedWordIndices(prev => prev.filter(i => i !== idx));
              } else {
                setSelectedWordIndices(prev => [...prev, idx]);
              }
            };

            const evaluateDespin = () => {
              setDespinEvaluated(true);
              if (integrityScore === 100) {
                setDespinStreak(prev => prev + 1);
              } else {
                setDespinStreak(0);
              }
            };

            const nextDespin = () => {
              setSelectedWordIndices([]);
              setDespinEvaluated(false);
              setInspectedWordIndex(null);
              setCurrentDespinIndex(prev => (prev + 1) % DESPIN_MISSIONS.length);
            };

            const getStreakBadge = (streak: number) => {
              if (streak === 0) return { title: "Diction Apprentice", icon: "🌱", desc: "Starting to look past the spin" };
              if (streak < 3) return { title: "Skeptical Analyst", icon: "🔍", desc: "Recognizes high-intensity adjectives" };
              if (streak < 5) return { title: "Lexical Scrubber", icon: "🧼", desc: "Neutralizes complex regional framing" };
              return { title: "Absolute Factual Purist", icon: "👑", desc: "Perfect facts preservation champion!" };
            };
            
            const badge = getStreakBadge(despinStreak);

            return (
              <div className="border border-stone-250/80 rounded-sm p-6 sm:p-8 bg-[#fbfcfb]/10 font-sans shadow-xs">
                {/* Header Info */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-6">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#cf5c2a] bg-orange-50 px-2 py-0.5 rounded border border-orange-100 block w-fit mb-1">
                      REAL-TIME DE-BIAS CHALLENGE
                    </span>
                    <h3 className="font-serif text-lg font-black text-stone-900 flex items-center gap-1.5">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      De-spin Master™: Diction Scrubber
                    </h3>
                  </div>
                  
                  {/* Streak & Score indicators */}
                  <div className="flex flex-wrap gap-2 font-mono text-[11px] font-bold">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-sm flex items-center gap-1.5">
                      <span className="animate-pulse">{badge.icon}</span>
                      <span>STREAK: {despinStreak} ({badge.title})</span>
                    </span>
                    <span className="bg-stone-100 text-stone-700 border border-stone-200 px-3 py-1.5 rounded-sm">
                      MISSION: {currentDespinIndex + 1}/{DESPIN_MISSIONS.length}
                    </span>
                  </div>
                </div>

                <p className="text-stone-600 text-xs mb-6 max-w-2xl leading-relaxed">
                  <strong>Game Rules:</strong> Sensationalized headlines layer bare facts with high-intensity modifiers. <strong>Click each word that smuggles subjective, opinionated, or sensationalist spin</strong> to render the report neutral. Vetting factual anchors is essential!
                </p>

                <div className="space-y-6">
                  {/* Category/Topic Indicator */}
                  <div className="flex items-center gap-2 text-stone-500 font-mono text-xs">
                    <span className="font-bold text-stone-400 uppercase tracking-tight">Active Topic:</span>
                    <span className="text-stone-900 font-bold bg-stone-150/50 px-2.5 py-0.5 rounded border border-stone-250/20">{mission.topic}</span>
                  </div>

                  {/* Dynamic Clicking Word Bubble Area */}
                  <div className="p-5 border border-stone-200/80 bg-white rounded-sm">
                    <span className="text-[9px] font-mono font-bold uppercase text-stone-400 block mb-3">SELECT THE SUBJECTIVE & LOADED TERMINOLOGIES:</span>
                    
                    <div className="flex flex-wrap gap-2.5 leading-loose">
                      {mission.words.map((word, idx) => {
                        const isSelected = selectedWordIndices.includes(idx);
                        const isWordLoaded = word.isLoaded;
                        const isInspected = inspectedWordIndex === idx;
                        
                        let buttonStyle = "";
                        if (isSelected) {
                          if (despinEvaluated) {
                            if (isWordLoaded) {
                              buttonStyle = "bg-amber-100 text-amber-950 border-amber-400 font-bold shadow-xs ring-1 ring-amber-300";
                            } else {
                              buttonStyle = "bg-rose-50 text-rose-800 border-rose-300 line-through decoration-rose-450";
                            }
                          } else {
                            buttonStyle = "bg-stone-900 text-[#fbfcfa] border-stone-900 font-bold shadow-xs";
                          }
                        } else {
                          if (despinEvaluated && isWordLoaded) {
                            buttonStyle = "bg-orange-50/60 hover:bg-orange-50 text-orange-950 border-orange-300 border-dashed border-2";
                          } else {
                            buttonStyle = "bg-[#fbfcfa]/85 hover:bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-450";
                          }
                        }

                        if (isInspected) {
                          buttonStyle += " ring-2 ring-offset-1 ring-stone-400";
                        }

                        return (
                          <motion.button
                            key={idx}
                            onClick={() => toggleWord(idx)}
                            whileHover={{ scale: despinEvaluated ? 1.02 : 1.06, y: despinEvaluated ? 0 : -2 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 450, damping: 14 }}
                            className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${buttonStyle}`}
                          >
                            {word.text}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Lexical Tooltip Panel */}
                  <div className="bg-stone-50/60 border border-stone-200 rounded-sm p-4 transition-all duration-200">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="h-4 w-4 text-stone-500" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">Lexical Quality Inspector</span>
                    </div>
                    {inspectedWordIndex === null ? (
                      <p className="text-stone-400 text-[11px] italic">
                        Click on any word bubble above to audit its semantic structure and access regional media literacy commentary.
                      </p>
                    ) : (() => {
                      const wordObj = mission.words[inspectedWordIndex];
                      return (
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <span className="font-mono text-xs font-black text-stone-950 bg-white border border-stone-200 px-2 py-0.5 rounded">
                              &ldquo;{wordObj.text}&rdquo;
                            </span>
                            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                              wordObj.isLoaded 
                                ? "bg-amber-50 text-amber-800 border-amber-200" 
                                : "bg-sky-50 text-sky-800 border-sky-200"
                            }`}>
                              {wordObj.isLoaded ? "⚠️ Loaded Modifier Detected" : "🛡️ Vetted Factual Anchor"}
                            </span>
                          </div>
                          
                          <p className="text-stone-600 text-xs leading-relaxed mb-2 font-sans">
                            {wordObj.isLoaded 
                              ? wordObj.whyBiased || "This modifier injects emotional perspective or sweeping judgments, triggering preconceptions." 
                              : "This word is a vital factual anchor (subjects, verbs, nouns, or transition phrasing) needed to keep the story meaningful and informative."
                            }
                          </p>

                          {wordObj.isLoaded && wordObj.neutralAlternative && (
                            <div className="text-[11px] font-sans text-stone-600 flex items-center gap-1.5 bg-white border border-stone-150 p-1.5 rounded">
                              <span className="font-mono font-bold text-emerald-700 text-[9px] uppercase">Objective Scrubber Solution:</span>
                              <span className="italic font-serif font-black text-stone-850">&ldquo;{wordObj.neutralAlternative}&rdquo;</span>
                              <span className="text-stone-400 text-[10px]">(removes subjective loading)</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Real-time Factual Reconstruction Simulator Output */}
                  <div className="p-4 border-l-4 border-stone-950 bg-stone-50 rounded-r">
                    <span className="text-[10px] font-mono font-bold uppercase text-stone-400 block mb-2">NEVER-SPUN RECONSTRUCTED OUTPUT (FACTUAL ROUTE):</span>
                    
                    <div className="flex flex-wrap items-center gap-y-1.5 font-serif text-sm leading-relaxed text-stone-800">
                      {mission.words.map((word, idx) => {
                        const isSelected = selectedWordIndices.includes(idx);
                        if (isSelected) {
                          if (word.isLoaded) {
                            if (word.neutralAlternative) {
                              return (
                                <span key={idx} className="bg-emerald-100 text-emerald-950 px-1.5 py-0.2 rounded border border-emerald-300 font-sans text-[10px] font-extrabold mx-1">
                                  {word.neutralAlternative}
                                </span>
                              );
                            }
                            return null; // completely scrubbed
                          } else {
                            return (
                              <span key={idx} className="text-stone-400 line-through bg-stone-100 px-1 text-xs font-sans rounded mx-0.5">
                                {word.text}
                              </span>
                            );
                          }
                        }
                        return (
                          <span key={idx} className="mx-0.5">
                            {word.text}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Aesthetic Quality Custom Audit Lists */}
                  {despinEvaluated && (
                    <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 sm:p-5 mt-4 space-y-3">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Comprehensive Diction Audit
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        {/* Column 1: Successfully Neutralized */}
                        <div className="bg-white border border-stone-150 p-3 rounded-sm space-y-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 flex items-center gap-1">
                            ✓ Neutered Spin ({truePositives})
                          </span>
                          {truePositives === 0 ? (
                            <p className="text-stone-400 italic text-[11px]">No biased terms scrubbed.</p>
                          ) : (
                            <ul className="space-y-1">
                              {mission.words.map((w, i) => {
                                if (w.isLoaded && selectedWordIndices.includes(i)) {
                                  return (
                                    <li key={i} className="text-stone-600 text-[11px] flex flex-wrap gap-1 items-center">
                                      <span className="font-semibold line-through decoration-emerald-500 text-stone-550">{w.text}</span>
                                      {w.neutralAlternative && (
                                        <>
                                          <ArrowRight className="h-2.5 w-2.5 text-stone-400" />
                                          <span className="text-emerald-700 font-bold font-serif">{w.neutralAlternative}</span>
                                        </>
                                      )}
                                    </li>
                                  );
                                }
                                return null;
                              })}
                            </ul>
                          )}
                        </div>

                        {/* Column 2: Missed Loaded Modifiers */}
                        <div className="bg-white border border-stone-150 p-3 rounded-sm space-y-1.5">
                          {(() => {
                            const missedWords = mission.words.filter((w, i) => w.isLoaded && !selectedWordIndices.includes(i));
                            return (
                              <>
                                <span className={`text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${missedWords.length > 0 ? "text-orange-700" : "text-stone-400"}`}>
                                  ⚠ Missed Spin ({missedWords.length})
                                </span>
                                {missedWords.length === 0 ? (
                                  <p className="text-[#cf5c2a] text-[11px] font-bold">Perfect scrubber integrity!</p>
                                ) : (
                                  <ul className="space-y-1">
                                    {missedWords.map((w, i) => (
                                      <li key={i} className="text-orange-950 bg-orange-50/50 px-1.5 py-0.5 rounded text-[11px] font-mono">
                                        &ldquo;{w.text}&rdquo;
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        {/* Column 3: Redundantly Scrubbed Factual Anchors */}
                        <div className="bg-white border border-stone-150 p-3 rounded-sm space-y-1.5">
                          <span className={`text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${falsePositives > 0 ? "text-rose-700" : "text-stone-400"}`}>
                            ✗ Over-Scrubbed Anchors ({falsePositives})
                          </span>
                          {falsePositives === 0 ? (
                            <p className="text-emerald-700 text-[11px] font-bold">Excellent! Zero collateral damage.</p>
                          ) : (
                            <ul className="space-y-1">
                              {mission.words.map((w, i) => {
                                if (!w.isLoaded && selectedWordIndices.includes(i)) {
                                  return (
                                    <li key={i} className="text-rose-800 text-[11px] line-through flex items-center gap-1">
                                      &ldquo;{w.text}&rdquo; (Factual anchor)
                                    </li>
                                  );
                                }
                                return null;
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom evaluations */}
                  <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-2">
                      {!despinEvaluated ? (
                        <button
                          onClick={evaluateDespin}
                          disabled={selectedWordIndices.length === 0}
                          className="px-5 py-2.5 bg-stone-950 text-white font-mono text-xs font-black uppercase tracking-wider rounded-sm cursor-pointer disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-200"
                        >
                          Check Headline Accuracy
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={nextDespin}
                            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-black uppercase tracking-wider rounded-sm cursor-pointer border border-emerald-800 transition-colors"
                          >
                            Next Challenge
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWordIndices([]);
                              setDespinEvaluated(false);
                              setInspectedWordIndex(null);
                            }}
                            className="px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-700 font-mono text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer border border-stone-300 transition-colors"
                          >
                            Reset Scrubber
                          </button>
                        </div>
                      )}
                    </div>

                    {despinEvaluated && (
                      <div className="flex items-center gap-4 bg-white border border-stone-200 px-4 py-2.5 rounded-sm">
                        <div className="text-center shrink-0">
                          <span className="text-[9px] font-mono block text-stone-400">INTEGRITY RATIO</span>
                          <span className={`text-xl font-bold font-mono ${integrityScore >= 80 ? "text-emerald-750" : "text-amber-600"}`}>
                            {integrityScore}%
                          </span>
                        </div>
                        <div className="border-l border-stone-200 h-8"></div>
                        <p className="text-[11px] text-stone-600 max-w-sm leading-normal">
                          {integrityScore === 100 ? "🎯 100% PERFECT DE-SPIN! Extraordinary accuracy! Factual purity preserves the absolute integrity of direct journalism." : 
                           integrityScore >= 70 ? "🛡️ Good news hygiene! You caught most biased modifiers, though you may have over-scrubbed factual components." : 
                           "⚠️ High susceptibility to opinion loading. Read the Lexical Quality commentary above and restore factual anchors."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* GAME TYPE 3: DIALECT SLIDE SHIFTER */}
          {activeGameType === "slider" && (
            <div className="border border-stone-200/80 rounded-sm p-6 bg-stone-50/20">
              <h3 className="font-serif text-lg font-bold text-stone-950 mb-3 flex items-center gap-2">
                <Flame className="h-4 w-4 text-stone-700" />
                Lexical Semantics Shifter Slider
              </h3>
              <p className="text-stone-500 text-xs mb-6 leading-relaxed font-sans">
                Interact with the dialect slider. Observe how exactly the same silicon investment report filters its cognitive parameters based on raw editorial intents.
              </p>

              <div className="mb-6">
                <div className="flex justify-between font-mono text-[9px] text-stone-400 mb-2 uppercase tracking-tight font-bold">
                  <span>Regulatory Skeptic (0)</span>
                  <span>Pure Neutral (1)</span>
                  <span>National Support (2)</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="2"
                  step="1"
                  value={biasSlider}
                  onChange={(e) => setBiasSlider(parseInt(e.target.value))}
                  className="w-full accent-stone-950 cursor-pointer h-1 bg-stone-200 rounded-lg appearance-none"
                />
                
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-sm font-extrabold border transition-colors ${
                    biasSlider === 0 
                      ? "bg-sky-50 text-sky-800 border-sky-300" 
                      : biasSlider === 2 
                        ? "bg-rose-50 text-rose-800 border-rose-300" 
                        : "bg-stone-100 text-stone-800 border-stone-300"
                  }`}>
                    Current Style: {getSliderParagraph().label}
                  </span>
                </div>
              </div>

              {/* Simulated paragraph output */}
              <div className="bg-[#fbfcfa] border border-stone-200 p-5 rounded-sm min-h-[140px] shadow-inner font-serif">
                {renderHighlightedText(getSliderParagraph().text, getSliderParagraph().highlights)}
              </div>

              <div className="mt-5 text-xs text-stone-600 bg-stone-100/50 p-4 border border-stone-200/50 rounded-sm">
                <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase text-stone-700 mb-1.5">
                  <HelpCircle className="h-4 w-4 text-stone-600" />
                  Diction Analysis
                </div>
                <p className="leading-relaxed font-sans text-[11px] text-stone-600">
                  Notice that words act as high-speed subliminal cues. Highlighting &ldquo;historic landmarks&rdquo; boosts civil pride automatically, while highlighting &ldquo;capital handouts&rdquo; primes citizens to suspect administrative corruption. Pure, factual journalism strips out emotional primes to keep reports objective.
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {activeSubTab === "entman" && (
        <div className="space-y-6 font-sans">
          <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1 mb-4 max-w-sm border border-slate-300/45">
            <button
              onClick={() => setEntmanMode("single")}
              className={`flex-1 py-1.5 font-mono text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                entmanMode === "single"
                  ? "bg-slate-950 text-white shadow-xs"
                  : "text-slate-650 hover:text-slate-950 hover:bg-slate-200"
              }`}
            >
              👤 Single Article
            </button>
            <button
              onClick={() => setEntmanMode("compare")}
              className={`flex-1 py-1.5 font-mono text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                entmanMode === "compare"
                  ? "bg-slate-950 text-white shadow-xs"
                  : "text-slate-650 hover:text-slate-950 hover:bg-slate-200"
              }`}
            >
              👥 Comparative (Multi-Outlet)
            </button>
          </div>

          {entmanMode === "single" ? (
            <>
              <div className="bg-slate-55 border border-slate-200/60 rounded-2xl p-6">
                <h3 className="font-serif text-lg font-bold text-slate-900 mb-2 flex items-center gap-2 font-black">
                  <span>🔬 Robert Entman's Academic Framing Model</span>
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  According to Robert Entman's seminal model in academic media studies, news frames perform four active functions: 
                  <strong> defining problems</strong>, <strong>interpreting causes</strong>, <strong>making moral evaluations</strong>, and <strong>recommending solutions</strong>. 
                  Paste a full news article or headline block below to run a fully objective, non-biased academic framing analysis.
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-slate-600 font-mono text-[10px] uppercase font-bold">News Article Text to Analyze</label>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-mono text-slate-400">Quick Presets:</span>
                        <button
                          onClick={() => setArticleInputText("MUMBAI — The Reserve Bank of India (RBI) approved a record dividend surplus transfer of ₹2.11 lakh crore to the Central Government. The record surplus payout will supplement standard tax-revenue projections, granting the finance ministry additional cushion for public capex and fiscal consolidation goals. The historic liquidity injection was strongly backed by robust asset stewardship. Skeptics raised warnings about depletion of capital reserves and bank autonomy, while national commentators praised the sovereign financial shield.")}
                          className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 hover:bg-slate-150 transition-colors cursor-pointer"
                        >
                          RBI Dividend
                        </button>
                        <button
                          onClick={() => setArticleInputText("GUJARAT — Built with massive hardware investment, the state-of-the-art semiconductor fabrication facility completed its initial trials in Dholera. The Electronics Ministry allocated ₹400 crore in infrastructure capital grants to the project under national self-reliance initiatives (Atmanirbhar Bharat). Critics warned that corporate handouts to silicon giants place extreme risk on public taxpayers while corporate conglomerates retain core IP rights. Government spokespersons praised the landmark tech sovereignty triumph.")}
                          className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 hover:bg-slate-150 transition-colors cursor-pointer"
                        >
                          Dholera Chip Fab
                        </button>
                      </div>
                    </div>
                    <textarea
                      placeholder="Paste the full text of any news article..."
                      value={articleInputText}
                      onChange={(e) => setArticleInputText(e.target.value)}
                      className="w-full text-xs p-4 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 font-sans min-h-[160px] leading-relaxed shadow-3xs"
                    />
                  </div>

                  {entmanError && (
                    <div className="text-rose-600 text-xs bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-center gap-2">
                      <span>⚠️ {entmanError}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        if (!articleInputText.trim()) return;
                        setEntmanLoading(true);
                        setEntmanError("");
                        setEntmanResult(null);
                        try {
                          const response = await fetch("/api/entman/analyze", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ articleText: articleInputText })
                          });
                          const resData = await response.json();
                          if (resData.success) {
                            setEntmanResult(resData.data);
                          } else {
                            setEntmanError(resData.error || "Failed to analyze article.");
                          }
                        } catch (err: any) {
                          setEntmanError(err.message || "An error occurred during framing analysis.");
                        } finally {
                          setEntmanLoading(false);
                        }
                      }}
                      disabled={entmanLoading || !articleInputText.trim()}
                      className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-mono text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 transition-all shadow-xs text-center"
                    >
                      {entmanLoading ? "🔬 Analyzing Framing..." : "Run Academic Framing Analysis"}
                    </button>
                  </div>
                </div>
              </div>

              {entmanLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <RefreshCw className="h-8 w-8 text-slate-800 animate-spin animate-infinite" />
                  <p className="text-xs font-mono text-slate-500 animate-pulse">Running Robert Entman's academic news methodology...</p>
                  <div className="flex flex-wrap justify-center gap-1.5 max-w-sm text-[10px] text-slate-400 font-mono text-center">
                    <span>[Isolating emotional lemmas]</span>
                    <span>•</span>
                    <span>[Gauging structural voice passive ratio]</span>
                    <span>•</span>
                    <span>[Mapping four core informational functions]</span>
                  </div>
                </div>
              )}

              {entmanResult && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  <div className="bg-slate-950 text-white px-5 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <span className="text-[9px] font-mono font-bold tracking-widest text-slate-450 uppercase font-black">ACADEMIC OUTPUT METADATA</span>
                      <h4 className="font-serif text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                        {entmanResult.headline || "Analyzed Article"}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slate-300">
                        <span>Outlet: {entmanResult.outlet_name || "Not Specified"}</span>
                        <span>•</span>
                        <span>Date: {entmanResult.publication_date || "Not Specified"}</span>
                        <span>•</span>
                        <span>Words: {entmanResult.article_length || "Not Specified"}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(entmanResult, null, 2));
                        }}
                        className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-white font-mono text-[10px] uppercase font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Copy JSON
                      </button>
                      <button
                        onClick={() => {
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entmanResult, null, 2));
                          const downloadAnchor = document.createElement('a');
                          downloadAnchor.setAttribute("href", dataStr);
                          downloadAnchor.setAttribute("download", `entman_analysis_${entmanResult.outlet_name || "article"}.json`);
                          document.body.appendChild(downloadAnchor);
                          downloadAnchor.click();
                          downloadAnchor.remove();
                        }}
                        className="px-3 py-1.5 bg-emerald-850 hover:bg-emerald-800 text-white font-mono text-[10px] uppercase font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Download JSON
                      </button>
                    </div>
                  </div>

                  {/* Navigation within Result Tabs */}
                  <div className="flex flex-wrap border-b border-slate-100 bg-slate-50 p-1 gap-1">
                    {(["frame", "sources", "language", "method", "raw"] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setAnalysisTab(tab)}
                        className={`px-3.5 py-2 font-mono text-[10px] uppercase font-bold rounded-lg cursor-pointer transition-all ${
                          analysisTab === tab
                            ? "bg-slate-900 text-white"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                        }`}
                      >
                        {tab === "frame" && "🎯 Framing Functions"}
                        {tab === "sources" && "📊 Source Diversity"}
                        {tab === "language" && "✍️ Linguistic & Lede"}
                        {tab === "method" && "🛡️ Fact vs Opinion"}
                        {tab === "raw" && "💻 Raw Schema JSON"}
                      </button>
                    ))}
                  </div>

                  <div className="p-6 font-sans text-xs min-h-[220px]">
                    {analysisTab === "frame" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-1">
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-400">1. Problem Definition</span>
                          <p className="text-slate-800 font-serif leading-relaxed text-[13px] font-semibold">
                            {entmanResult.framing_analysis?.problem_definition || "None explicitly emphasizing."}
                          </p>
                        </div>
                        <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-1">
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-400">2. Causal Interpretation</span>
                          <p className="text-slate-800 font-serif leading-relaxed text-[13px] font-semibold">
                            {entmanResult.framing_analysis?.causal_interpretation || "None explicitly attributed."}
                          </p>
                        </div>
                        <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-1">
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-400">3. Moral Evaluation / Judgment</span>
                          <p className="text-slate-800 font-serif leading-relaxed text-[13px] font-semibold">
                            {entmanResult.framing_analysis?.moral_judgment || "Purely neutral or no narrative evaluation."}
                          </p>
                        </div>
                        <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-1">
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-400">4. Recommended Solution</span>
                          <p className="text-slate-800 font-serif leading-relaxed text-[13px] font-semibold">
                            {entmanResult.framing_analysis?.recommended_solution || "None suggested or implied."}
                          </p>
                        </div>
                      </div>
                    )}

                    {analysisTab === "sources" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <span className="block text-slate-600 font-mono text-[10px] uppercase font-bold">Identified Source Types Quoted:</span>
                            {entmanResult.source_diversity?.sources_quoted?.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {entmanResult.source_diversity.sources_quoted.map((src: string, i: number) => (
                                  <span key={i} className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full font-mono text-[10px] border border-slate-200">
                                    {src}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic">No direct sources quoted in this article text.</p>
                            )}
                          </div>

                          <div className="space-y-3">
                            <span className="block text-slate-600 font-mono text-[10px] uppercase font-bold">Quantitative Citation Database:</span>
                            <div className="space-y-2 bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                              {Object.entries(entmanResult.source_diversity?.source_count_by_category || {}).map(([cat, val]: any) => (
                                <div key={cat} className="flex justify-between items-center text-[11px]">
                                  <span className="capitalize font-mono text-slate-500">{cat.replace('_', ' ')}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-slate-900 h-full animate-pulse" style={{ width: `${Math.min(100, (val || 0) * 20)}%` }}></div>
                                    </div>
                                    <span className="font-mono font-bold text-slate-800 w-4 text-right">{val || 0}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {analysisTab === "language" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-2">
                            <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block border-b pb-1">Highly Charged Emotional Lemmas</span>
                            {entmanResult.linguistic_markers?.emotional_language?.length > 0 ? (
                              <ul className="list-disc pl-4 space-y-1">
                                {entmanResult.linguistic_markers.emotional_language.map((w: string, i: number) => (
                                  <li key={i} className="font-mono text-red-700 font-semibold">{w}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-slate-400 italic font-mono">None detected. Factual purity observed.</p>
                            )}
                          </div>

                          <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-2">
                            <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block border-b pb-1">Descriptors & Characterizations</span>
                            {entmanResult.linguistic_markers?.descriptors_used?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {entmanResult.linguistic_markers.descriptors_used.map((desc: string, i: number) => (
                                  <span key={i} className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-mono text-[10px]">
                                    {desc}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 italic">No extreme descriptive branding detected.</p>
                            )}
                          </div>
                        </div>

                        <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Syntactic Voice Structuring</span>
                            <span className="font-mono text-[10px] font-black text-slate-700 bg-slate-250 px-2 py-0.5 rounded">
                              {entmanResult.linguistic_markers?.passive_vs_active || "Unknown Structuring"}
                            </span>
                          </div>
                        </div>

                        <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-3">
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block border-b pb-1">Narrative Pacing & Discrepancies</span>
                          <div className="space-y-2">
                            <div>
                              <span className="font-bold text-slate-755 font-mono text-[10px]">Lede Focus:</span>
                              <p className="text-slate-600 leading-normal">{entmanResult.narrative_emphasis?.first_three_paragraphs}</p>
                            </div>
                            <div>
                              <span className="font-bold text-slate-755 font-mono text-[10px]">Buried Info:</span>
                              <p className="text-slate-600 leading-normal">{entmanResult.narrative_emphasis?.buried_information}</p>
                            </div>
                            <div>
                              <span className="font-bold text-slate-755 font-mono text-[10px]">Headline-to-Body Match:</span>
                              <p className="text-slate-600 leading-normal">{entmanResult.narrative_emphasis?.headline_vs_body}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {analysisTab === "method" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <span className="block text-emerald-800 font-mono text-[10px] uppercase font-bold">Verifiable Fact Claims Explicitly Stated:</span>
                          {entmanResult.methodological_notes?.fact_claims?.length > 0 ? (
                            <div className="space-y-1.5">
                              {entmanResult.methodological_notes.fact_claims.map((claim: string, i: number) => (
                                <div key={i} className="flex gap-2 items-start bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-lg text-emerald-950 leading-relaxed font-serif">
                                  <span className="font-mono text-[9px] bg-emerald-200 text-emerald-900 border border-emerald-300 w-4 h-4 flex items-center justify-center shrink-0 rounded-full font-black">✓</span>
                                  <span>{claim}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic">No clear verifiable quantitative factual claims extracted.</p>
                          )}
                        </div>

                        <div className="space-y-2 pt-2">
                          <span className="block text-slate-600 font-mono text-[10px] uppercase font-bold">Opinion, Commentary & Interpretations:</span>
                          {entmanResult.methodological_notes?.opinion_statements?.length > 0 ? (
                            <div className="space-y-1.5">
                              {entmanResult.methodological_notes.opinion_statements.map((claim: string, i: number) => (
                                <div key={i} className="flex gap-2 items-start bg-slate-50 border border-slate-150 p-2.5 rounded-lg text-slate-700 leading-relaxed font-serif">
                                  <span className="font-mono text-[9px] bg-slate-200 text-slate-600 border border-slate-300 w-4 h-4 flex items-center justify-center shrink-0 rounded-full font-black">ℹ</span>
                                  <span>{claim}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic">No subjective interpretations extracted.</p>
                          )}
                        </div>

                        <div className="space-y-2 pt-2">
                          <span className="block text-amber-800 font-mono text-[10px] uppercase font-bold">Unverified Claims Presented Without Attribute/Proof:</span>
                          {entmanResult.methodological_notes?.unverified_claims?.length > 0 ? (
                            <div className="space-y-1.5">
                              {entmanResult.methodological_notes.unverified_claims.map((claim: string, i: number) => (
                                <div key={i} className="flex gap-2 items-start bg-amber-50/50 border border-amber-100 p-2.5 rounded-lg text-amber-950 leading-relaxed font-serif">
                                  <span className="font-mono text-[9px] bg-amber-200 text-amber-800 border border-amber-300 w-4 h-4 flex items-center justify-center shrink-0 rounded-full font-black">⚠</span>
                                  <span>{claim}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic">No unverified speculative claims detected. Excellent news integrity.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {analysisTab === "raw" && (
                      <div className="bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner max-h-[400px]">
                        <pre>{JSON.stringify(entmanResult, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Comparative News Analyzer UI (Robert Entman Framing Comparison) */}
              <div className="bg-slate-55 border border-slate-200/60 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2 font-black">
                    <span>👥 Multi-Outlet Framing Comparative Engine</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setCompareArticles([
                          {
                            outlet: "The Daily Telegraph (Sovereignty Press)",
                            text: "MUMBAI — The Reserve Bank of India (RBI) approved a record dividend surplus transfer of ₹2.11 lakh crore to the Central Government. The record surplus payout will supplement standard tax-revenue projections, granting the finance ministry additional cushion for public capex and fiscal consolidation goals. The historic liquidity injection was strongly backed by robust asset stewardship. Sovereign commentators praised the magnificent financial shield."
                          },
                          {
                            outlet: "The Independent Sentinel (Skeptic Press)",
                            text: "MUMBAI — Critics and bank autonomy advocates raised severe concern as the RBI decided to transfer ₹2.11 lakh crore to the treasury. Financial skeptics warned that the depletion of capital buffers merger with sovereign debt goals puts extreme future risk on inflation shielding, compromising key institutional autonomy under active fiscal pressures from the capital."
                          }
                        ]);
                        setCompareResult(null);
                        setCompareError("");
                      }}
                      className="text-[10px] bg-white border border-slate-200 px-2.5 py-1 rounded text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer font-mono"
                    >
                      RBI Surplus Preset
                    </button>
                    <button
                      onClick={() => {
                        setCompareArticles([
                          {
                            outlet: "Atmanirbhar Times (Growth-focused)",
                            text: "GUJARAT — Built with massive hardware investment, the state-of-the-art semiconductor fabrication facility completed its initial trials in Dholera. The Electronics Ministry allocated ₹400 crore in infrastructure capital grants to the project under national self-reliance initiatives (Atmanirbhar Bharat). Economists hailed this landmark tech sovereignty milestone that bolsters our electronics grid."
                          },
                          {
                            outlet: "The Taxpayers Digest (Critical Journal)",
                            text: "GUJARAT — Built with high-profile state funding, initial trials finalized at Dholera's semiconductor fab. Citizens raised critical alarms over corporate welfare as ₹400 crore was routed directly to conglomerate pockets. Analysts warned that severe taxpayer risks are introduced while private multinationals retain complete ownership of core technology IP."
                          }
                        ]);
                        setCompareResult(null);
                        setCompareError("");
                      }}
                      className="text-[10px] bg-white border border-slate-200 px-2.5 py-1 rounded text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer font-mono"
                    >
                      Dholera Fab Preset
                    </button>
                    <button
                      onClick={() => {
                        setCompareArticles([
                          { outlet: "Outlet 1", text: "" },
                          { outlet: "Outlet 2", text: "" }
                        ]);
                        setCompareResult(null);
                        setCompareError("");
                      }}
                      className="text-[10px] bg-rose-50 border border-rose-200 px-2.5 py-1 rounded text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer font-mono"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mb-6">
                  According to academic standards, comparing multiple news sources covering the identical story reveals how differing headlines, citations, and causal interpretations construct ideological frames. Paste reports from 2 to 4 different news publications below to generate a real-time academic comparative analysis.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {compareArticles.map((art, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 relative shadow-3xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[9px] font-bold text-slate-400">OUTLET #{idx + 1}</span>
                          {compareArticles.length > 2 && (
                            <button
                              onClick={() => {
                                setCompareArticles(compareArticles.filter((_, i) => i !== idx));
                              }}
                              className="text-rose-500 hover:text-rose-700 cursor-pointer p-1 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete Outlet Card"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Outlet / Publisher Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Times of India, The Wire, NDTV..."
                            value={art.outlet}
                            onChange={(e) => {
                              const updated = [...compareArticles];
                              updated[idx].outlet = e.target.value;
                              setCompareArticles(updated);
                            }}
                            className="w-full text-xs p-2.5 border border-slate-250 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Coverage Text / Snippet</label>
                          <textarea
                            placeholder="Paste the paragraph or news report content..."
                            value={art.text}
                            onChange={(e) => {
                              const updated = [...compareArticles];
                              updated[idx].text = e.target.value;
                              setCompareArticles(updated);
                            }}
                            className="w-full text-xs p-2.5 border border-slate-250 rounded-lg min-h-[140px] bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 leading-relaxed font-sans"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {compareArticles.length < 4 && (
                    <button
                      onClick={() => {
                        setCompareArticles([...compareArticles, { outlet: `Outlet ${compareArticles.length + 1}`, text: "" }]);
                      }}
                      className="w-full py-2.5 bg-white border border-dashed border-slate-300 rounded-xl hover:border-slate-500 font-mono text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99] shadow-3xs"
                    >
                      <Plus className="h-4 w-4" /> Add Another Outlet (Max 4)
                    </button>
                  )}

                  {compareError && (
                    <div className="text-rose-600 text-xs bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-center gap-2">
                      <span>⚠️ {compareError}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={async () => {
                        if (compareArticles.some(a => !a.text.trim() || !a.outlet.trim())) {
                          setCompareError("Please ensure all outlet name and text coverage fields are filled before submitting.");
                          return;
                        }
                        setCompareLoading(true);
                        setCompareError("");
                        setCompareResult(null);
                        try {
                          const response = await fetch("/api/entman/compare", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ articles: compareArticles })
                          });
                          const resData = await response.json();
                          if (resData.success) {
                            setCompareResult(resData.data);
                          } else {
                            setCompareError(resData.error || "Failed to compare comparative framing.");
                          }
                        } catch (err: any) {
                          setCompareError(err.message || "An error occurred during comparative framing analysis.");
                        } finally {
                          setCompareLoading(false);
                        }
                      }}
                      disabled={compareLoading || compareArticles.some(a => !a.text.trim())}
                      className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-mono text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 transition-all shadow-xs text-center"
                    >
                      {compareLoading ? "🔬 running comparative analysis..." : "Run Systematic Comparative Analysis"}
                    </button>
                  </div>
                </div>
              </div>

              {compareLoading && (
                <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-slate-50 border border-slate-200/60 rounded-2xl">
                  <RefreshCw className="h-8 w-8 text-slate-900 animate-spin animate-infinite" />
                  <p className="text-xs font-mono text-slate-600 animate-pulse">Running Robert Entman's comparative media standards...</p>
                  <div className="flex flex-wrap justify-center gap-1.5 max-w-sm text-[10px] text-slate-400 font-mono text-center">
                    <span>[Cross-referencing causal attributions]</span>
                    <span>•</span>
                    <span>[Gauging structural tone and omissions]</span>
                    <span>•</span>
                    <span>[Constructing academic credibility matrix]</span>
                  </div>
                </div>
              )}

              {compareResult && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  <div className="bg-slate-950 text-white px-5 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase font-black">SYSTEMATIC COMPARATIVE RESULTS</span>
                      <h4 className="font-serif text-sm font-bold text-white leading-tight">
                        Comparative Academic Framing Report Output
                      </h4>
                      <p className="text-[10px] text-slate-300 font-mono mt-1">
                        Outlets: {Object.keys(compareResult.framing_comparison || {}).join(", ")}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(compareResult, null, 2));
                        }}
                        className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-white font-mono text-[10px] uppercase font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Copy JSON
                      </button>
                      <button
                        onClick={() => {
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(compareResult, null, 2));
                          const downloadAnchor = document.createElement('a');
                          downloadAnchor.setAttribute("href", dataStr);
                          downloadAnchor.setAttribute("download", "comparative_framing_analysis.json");
                          document.body.appendChild(downloadAnchor);
                          downloadAnchor.click();
                          downloadAnchor.remove();
                        }}
                        className="px-3 py-1.5 bg-emerald-850 hover:bg-emerald-800 text-white font-mono text-[10px] uppercase font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Download JSON
                      </button>
                    </div>
                  </div>

                  {/* Tab Navigation for Comparative Output */}
                  <div className="flex flex-wrap border-b border-slate-100 bg-slate-50 p-1 gap-1">
                    {(["summary", "comparison", "findings", "credibility", "raw"] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setCompareResultTab(tab)}
                        className={`px-3.5 py-2 font-mono text-[10px] uppercase font-bold rounded-lg cursor-pointer transition-all ${
                          compareResultTab === tab
                            ? "bg-slate-900 text-white"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                        }`}
                      >
                        {tab === "summary" && "🎯 Event Summary"}
                        {tab === "comparison" && "⚖️ Side-by-Side Comparison"}
                        {tab === "findings" && "🔍 Comparative Findings"}
                        {tab === "credibility" && "🛡️ Credibility Assessment"}
                        {tab === "raw" && "💻 Raw JSON Data"}
                      </button>
                    ))}
                  </div>

                  <div className="p-6 font-sans text-xs min-h-[220px]">
                    {compareResultTab === "summary" && (
                      <div className="space-y-4 text-slate-800">
                        <div className="border-l-2 border-slate-950 pl-4 space-y-1">
                          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OBJECTIVE EVENT SUMMARY</span>
                          <p className="text-slate-800 font-serif leading-relaxed text-sm">
                            {compareResult.event_summary || "No event summary extracted."}
                          </p>
                        </div>
                        <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-4 mt-2">
                          <h5 className="font-mono text-[10px] font-bold text-slate-500 uppercase mb-2">Analyzing Outlets Cover</h5>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-650 leading-relaxed font-sans">
                            {Object.entries(compareResult.framing_comparison || {}).map(([outletName, data]: [string, any], index) => (
                              <li key={outletName} className="flex gap-2 items-start text-[11px] bg-white border border-slate-150 p-2 rounded-lg shadow-3xs">
                                <span className="font-mono font-bold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded text-[9px]">#{index + 1}</span>
                                <div>
                                  <strong className="text-slate-950 font-serif font-black">{outletName}</strong>
                                  <span className="block text-slate-500 italic mt-0.5">Dominant news frame: {data.dominant_frame}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {compareResultTab === "comparison" && (
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
                          <thead>
                            <tr className="bg-slate-900 text-white font-mono text-[9px] uppercase tracking-wider border-b border-slate-900">
                              <th className="p-3 w-1/4">Comparative Axis</th>
                              {Object.keys(compareResult.framing_comparison || {}).map((outletName) => (
                                <th key={outletName} className="p-3 border-l border-slate-800 font-serif font-bold text-xs truncate" title={outletName}>
                                  {outletName}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150 text-[11px] leading-relaxed">
                            <tr className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-[9px] uppercase tracking-wider text-slate-400 bg-slate-50/40">Dominant Frame</td>
                              {Object.entries(compareResult.framing_comparison || {}).map(([outletName, data]: [string, any]) => (
                                <td key={outletName} className="p-3 border-l border-slate-150 font-medium text-slate-950">
                                  {data.dominant_frame || <span className="text-slate-400 italic">N/A</span>}
                                </td>
                              ))}
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-[9px] uppercase tracking-wider text-slate-400 bg-slate-50/40">Problem Definition</td>
                              {Object.entries(compareResult.framing_comparison || {}).map(([outletName, data]: [string, any]) => (
                                <td key={outletName} className="p-3 border-l border-slate-150 text-slate-850 font-serif italic">
                                  &ldquo;{data.problem_definition || "N/A"}&rdquo;
                                </td>
                              ))}
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-[9px] uppercase tracking-wider text-slate-400 bg-slate-50/40">Causal Interpretation</td>
                              {Object.entries(compareResult.framing_comparison || {}).map(([outletName, data]: [string, any]) => (
                                <td key={outletName} className="p-3 border-l border-slate-150 text-slate-850">
                                  {data.causal_attribution || data.causal_interpretation || <span className="text-slate-400 italic">N/A</span>}
                                </td>
                              ))}
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-[9px] uppercase tracking-wider text-slate-400 bg-slate-50/40">Linguistic Tone</td>
                              {Object.entries(compareResult.framing_comparison || {}).map(([outletName, data]: [string, any]) => (
                                <td key={outletName} className="p-3 border-l border-slate-150">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-black ${
                                    data.linguistic_tone?.includes("critical") ? "bg-red-50 text-red-700 border border-red-200" :
                                    data.linguistic_tone?.includes("supportive") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                    data.linguistic_tone?.includes("alarmist") ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                    "bg-slate-100 text-slate-705 border border-slate-200"
                                  }`}>
                                    {data.linguistic_tone || "neutral"}
                                  </span>
                                </td>
                              ))}
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-[9px] uppercase tracking-wider text-slate-400 bg-slate-50/40">Narrative Emphasis</td>
                              {Object.entries(compareResult.framing_comparison || {}).map(([outletName, data]: [string, any]) => (
                                <td key={outletName} className="p-3 border-l border-slate-150 text-slate-750 font-serif">
                                  {data.what_is_emphasized || <span className="text-slate-400 italic">N/A</span>}
                                </td>
                              ))}
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-[9px] uppercase tracking-wider text-slate-400 bg-slate-50/40">Notable Omissions / Buried Details</td>
                              {Object.entries(compareResult.framing_comparison || {}).map(([outletName, data]: [string, any]) => (
                                <td key={outletName} className="p-3 border-l border-slate-150 text-amber-900 bg-amber-50/10 font-serif leading-relaxed">
                                  {data.what_is_omitted || <span className="text-slate-400 italic">None detected</span>}
                                </td>
                              ))}
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-[9px] uppercase tracking-wider text-slate-400 bg-slate-50/40">Source Diversity Score</td>
                              {Object.entries(compareResult.framing_comparison || {}).map(([outletName, data]: [string, any]) => (
                                <td key={outletName} className="p-3 border-l border-slate-150 font-mono font-bold text-slate-800">
                                  {data.source_diversity_score || "N/A"}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {compareResultTab === "findings" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                            <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded uppercase block border-b pb-1 w-fit">🤝 Consensus / Alignment Areas</span>
                            {compareResult.comparative_findings?.frames_where_outlets_agree?.length > 0 ? (
                              <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-755 font-serif leading-relaxed pl-1">
                                {compareResult.comparative_findings.frames_where_outlets_agree.map((pt: string, i: number) => (
                                  <li key={i}>{pt}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-slate-400 italic text-[11px]">No active consensus areas extracted.</p>
                            )}
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                            <span className="font-mono text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded uppercase block border-b pb-1 w-fit">⚡ Sharp Narrative Divergence</span>
                            {compareResult.comparative_findings?.frames_where_outlets_dramatically_differ?.length > 0 ? (
                              <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-755 font-serif leading-relaxed pl-1">
                                {compareResult.comparative_findings.frames_where_outlets_dramatically_differ.map((pt: string, i: number) => (
                                  <li key={i}>{pt}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-slate-400 italic text-[11px]">No sharp narrative differences detected.</p>
                            )}
                          </div>
                        </div>

                        {compareResult.comparative_findings?.most_significant_framing_divergence && (
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white space-y-3">
                            <div className="flex items-center gap-1.5 text-amber-500 font-mono text-[10px] font-bold uppercase tracking-wider border-b border-slate-800 pb-1.5">
                              <Scale className="h-4 w-4" /> Core Framing Polarity Dimension
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 block font-mono uppercase tracking-wider">ANALYSIS CATEGORY AXIS</span>
                              <strong className="text-[13px] font-serif text-amber-300 block">
                                &ldquo;{compareResult.comparative_findings.most_significant_framing_divergence.dimension}&rdquo;
                              </strong>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                              <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 space-y-1">
                                <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">APPROACH A</span>
                                <p className="text-slate-200 text-[11px] leading-relaxed font-serif">
                                  {compareResult.comparative_findings.most_significant_framing_divergence.outlet_a_frame}
                                </p>
                              </div>
                              <div className="bg-slate-850 p-4 rounded-lg border border-slate-800 space-y-1">
                                <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">APPROACH B</span>
                                <p className="text-slate-200 text-[11px] leading-relaxed font-serif">
                                  {compareResult.comparative_findings.most_significant_framing_divergence.outlet_b_frame}
                                </p>
                              </div>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-1.5">
                              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest block">EXTRACTED COMPARATIVE EVIDENCE</span>
                              <p className="text-amber-100 italic text-[11px] leading-relaxed font-serif">
                                &ldquo;{compareResult.comparative_findings.most_significant_framing_divergence.evidence}&rdquo;
                              </p>
                            </div>
                          </div>
                        )}

                        {compareResult.comparative_findings?.source_diversity_ranking && (
                          <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
                            <span className="font-mono text-[9px] font-bold text-slate-500 uppercase block mb-3">⚖️ Verified Source Diversity Ranking</span>
                            <div className="flex flex-col md:flex-row gap-2">
                              {compareResult.comparative_findings.source_diversity_ranking.map((rankStr: string, idx: number) => (
                                <div key={idx} className="flex-1 bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between shadow-3xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-black w-5 h-5 flex items-center justify-center bg-slate-900 text-white rounded-full">
                                      {idx + 1}
                                    </span>
                                    <span className="text-[11px] font-serif font-bold text-slate-800">{rankStr}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider">
                                    {idx === 0 ? "🏆 Most Balanced" : idx === compareResult.comparative_findings.source_diversity_ranking.length - 1 ? "⚠️ Low Diversity" : "Moderate"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {compareResultTab === "credibility" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {Object.entries(compareResult.credibility_assessment || {}).map(([outletName, details]: [string, any]) => (
                            <div key={outletName} className="bg-slate-55 border border-slate-200 rounded-xl p-5 space-y-4 shadow-3xs">
                              <div className="border-b border-slate-150 pb-2">
                                <h5 className="font-serif text-sm font-bold text-slate-950 font-black">{outletName}</h5>
                                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-semibold block mt-0.5">CREDIBILITY ASSESSMENT METRICS</span>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white border border-slate-150 p-2.5 rounded-lg space-y-1">
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight block">Source Diversity</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-mono font-bold text-slate-900">{details.source_diversity_score}</span>
                                    <span className="text-[10px] font-mono text-slate-400">/10</span>
                                  </div>
                                </div>
                                <div className="bg-white border border-slate-150 p-2.5 rounded-lg space-y-1">
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight block">Factual Completeness</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-mono font-bold text-slate-900">{details.factual_completeness}</span>
                                    <span className="text-[10px] font-mono text-slate-400">/10</span>
                                  </div>
                                </div>
                                <div className="bg-white border border-slate-150 p-2.5 rounded-lg space-y-1">
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight block">Linguistic Neutrality</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-mono font-bold text-slate-900">{details.linguistic_neutrality}</span>
                                    <span className="text-[10px] font-mono text-slate-400">/10</span>
                                  </div>
                                </div>
                                <div className="bg-slate-900 border border-slate-900 p-2.5 rounded-lg space-y-1 text-white">
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight block">Overall Credibility</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-mono font-bold text-amber-400">{details.overall_framing_credibility || details.overall_framing_credibility === 0 ? details.overall_framing_credibility : "N/A"}</span>
                                    <span className="text-[10px] font-mono text-slate-300">/10</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white border border-slate-150 p-3.5 rounded-lg">
                                <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block mb-1">Methodological Reasoning</span>
                                <p className="text-slate-705 text-[11px] leading-relaxed font-serif">
                                  {details.reasoning}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                          <span className="text-base text-amber-800 shrink-0 select-none">💡</span>
                          <div>
                            <span className="font-mono text-[10px] text-amber-850 font-bold uppercase block mb-1">Academic Note on Scoring Methodology</span>
                            <p className="text-amber-900 text-[11px] leading-relaxed font-sans">
                              {compareResult.methodology_note || "This analysis uses Robert Entman's Framing Theory. Scores assess the equilibrium and balance of citation sets, physical volume parameters, syntactic focus distributions, and emotional lexical counts."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {compareResultTab === "raw" && (
                      <div className="bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner max-h-[400px]">
                        <pre>{JSON.stringify(compareResult, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
