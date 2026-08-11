'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  HelpCircle,
  User,
  ChevronDown,
  ChevronRight,
  Printer,
  Download,
  Share2,
  Send,
  Mic,
  Leaf,
  HeartHandshake,
  ShieldCheck,
  UsersRound,
  Scale,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
  Factory,
  BadgeDollarSign,
  BookOpenCheck,
  Megaphone,
  BarChart3,
  Landmark,
  ClipboardCheck,
  AlertTriangle
} from 'lucide-react';
import { BoardroomMode, SimulationDecisions, Message, DEFAULT_DECISIONS, CXORole, evaluatePackagingDesign, PackagingEvaluationResult, generateOralQuestions, evaluateOralDefense, DefenseAssessmentResult } from '@/lib/abis-engine';

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

export default function Home() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'lecture' | 'workspace'>('workspace');
  const [activeMenu, setActiveMenu] = useState<string>('market-share');
  
  // Accordion Sidebar sections expanded state
  const [expandedSections, setExpandedSections] = useState({
    performance: true,
    brand: true,
    salesChannel: true,
    marketing: false,
    manufacturing: false,
    finance: false,
    boardroom: true,
    conscious: true
  });

  // Settings & Simulation Balance
  const [credits, setCredits] = useState(4500);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');

  // Simulation Decisions State
  const [decisions, setDecisions] = useState<SimulationDecisions>(DEFAULT_DECISIONS);
  
  // Packaging Evaluator State
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<PackagingEvaluationResult | null>(null);
  const [evalBrandName, setEvalBrandName] = useState('Mirai-Prime');
  const [evalSegment, setEvalSegment] = useState('Mercedes');
  
  // Oral Defense / Final Check State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordingSubmitted, setRecordingSubmitted] = useState(false);
  const [defenseEvaluating, setDefenseEvaluating] = useState(false);
  const [defenseResult, setDefenseResult] = useState<DefenseAssessmentResult | null>(null);

  // Conscious Capitalism planning state. These inputs illustrate the trade-offs
  // between stakeholder investment and the current quarter's financial plan.
  const [impactPlan, setImpactPlan] = useState({ people: 70, planet: 62, community: 55, governance: 76 });
  const [learningLevel, setLearningLevel] = useState<'foundation' | 'applied' | 'advanced'>('applied');

  // Market-offering workspace. This is intentionally separate from the
  // simulation decision object until the student applies the proposed offer.
  const [offerName, setOfferName] = useState('Mirai EcoShift');
  const [offerDirection, setOfferDirection] = useState<'sustainable' | 'premium' | 'smart' | 'value'>('sustainable');
  const [offerSaved, setOfferSaved] = useState(false);

  // Guide-aligned Quarter 4 decision workspaces.
  const [marketingPlan, setMarketingPlan] = useState({
    claims: ['Easy to use', 'High performance'],
    localFrequency: 6,
    regionalFrequency: 4,
    marketResearch: 115000,
    rebate: 125
  });
  const [productionPlan, setProductionPlan] = useState({
    coreForecast: 455,
    nomadForecast: 390,
    operatingCapacity: 24,
    fixedCapacityIncrease: 50,
    maxInventoryPerBrand: 120
  });
  const [forecastLab, setForecastLab] = useState({
    low: 760,
    expected: 845,
    high: 940,
    confidence: 65,
    driver: 'Competitor price response',
    reversalTrigger: 'Nomad demand falls below 340 units',
    locked: false
  });
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastMission, setForecastMission] = useState({
    evidence: ['Nomad stock-outs'],
    forecastCase: 'expected' as 'conservative' | 'expected' | 'stretch',
    scenario: 'Competitor cuts price',
    result: ''
  });
  const [financePlan, setFinancePlan] = useState({
    equityRequest: 3000000,
    sharesOffered: 30000,
    conventionalLoan: 0,
    certificateOfDeposit: 0
  });
  const [decisionRationales, setDecisionRationales] = useState<Record<string, string>>({
    marketing: '', manufacturing: '', finance: '', brand: ''
  });
  const [quarterChecks, setQuarterChecks] = useState<Record<string, boolean>>({
    performance: true,
    market: true,
    businessPlan: false,
    marketing: false,
    production: false,
    finance: false
  });
  
  // Boardroom Interrogation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeStage, setActiveStage] = useState<'awareness' | 'discovery' | 'refinement' | 'completed'>('awareness');
  const [activeCxo, setActiveCxo] = useState<CXORole | 'System' | null>(null);
  const [boardroomMode, setBoardroomMode] = useState<BoardroomMode>('impact-review');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [showDecisionCoach, setShowDecisionCoach] = useState(false);
  const [decisionCoachContext, setDecisionCoachContext] = useState('');
  const [decisionCoachMessages, setDecisionCoachMessages] = useState<Message[]>([]);
  const [decisionCoachInput, setDecisionCoachInput] = useState('');
  const [decisionCoachLoading, setDecisionCoachLoading] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const impactScore = Math.round((impactPlan.people + impactPlan.planet + impactPlan.community + impactPlan.governance) / 4);
  const stakeholderMetrics = [
    { key: 'people', label: 'Employee wellbeing', value: impactPlan.people, icon: UsersRound, color: '#5B79C9', note: 'Retention & capability' },
    { key: 'planet', label: 'Environmental impact', value: impactPlan.planet, icon: Leaf, color: '#18896B', note: 'Materials & emissions' },
    { key: 'community', label: 'Community value', value: impactPlan.community, icon: HeartHandshake, color: '#C8782D', note: 'Access & local impact' },
    { key: 'governance', label: 'Trust & governance', value: impactPlan.governance, icon: ShieldCheck, color: '#7A5BC5', note: 'Safety & accountability' }
  ] as const;

  const offeringFeatures = [
    { name: 'High-speed Processor', cost: 175, tags: ['Smart', 'Innovator'], note: 'Faster workflows and premium performance.' },
    { name: 'Eco Case', cost: 55, tags: ['Sustainable', 'Trust'], note: 'Lower-impact materials and a visible sustainability signal.' },
    { name: 'Premium Battery', cost: 90, tags: ['Premium', 'Traveler'], note: 'Longer use between charges for mobile professionals.' },
    { name: 'Luxury Trim', cost: 120, tags: ['Premium', 'Mercedes'], note: 'Elevates perception in design-led segments.' },
    { name: 'Bluetooth Audio', cost: 42, tags: ['Experience', 'Traveler'], note: 'Adds convenience for hybrid work and travel.' },
    { name: 'Waterproof Casing', cost: 65, tags: ['Reliable', 'Workhorse'], note: 'Improves durability in demanding settings.' },
    { name: 'Specialized Sensors', cost: 110, tags: ['Smart', 'Innovator'], note: 'Enables data-rich specialist use cases.' },
    { name: 'Impact Defense Shield', cost: 70, tags: ['Reliable', 'Workhorse'], note: 'Protects the device and reduces replacement waste.' }
  ];
  const offerDirections = [
    { id: 'sustainable', title: 'Responsible growth', segment: 'Traveler', features: ['Eco Case', 'Impact Defense Shield'], color: '#18896B', description: 'Lead with durable design, credible materials, and long-term value.' },
    { id: 'premium', title: 'Premium productivity', segment: 'Mercedes', features: ['Luxury Trim', 'Premium Battery'], color: '#7A5BC5', description: 'Build a polished offer for buyers who value quality and status.' },
    { id: 'smart', title: 'Intelligent specialist', segment: 'Innovator', features: ['High-speed Processor', 'Specialized Sensors'], color: '#356DC2', description: 'Prioritize advanced capability for technology-led users.' },
    { id: 'value', title: 'Reliable value', segment: 'Workhorse', features: ['Waterproof Casing', 'Impact Defense Shield'], color: '#C8782D', description: 'Focus on resilience, practical benefit, and total cost of ownership.' }
  ] as const;
  const activeOfferDirection = offerDirections.find(direction => direction.id === offerDirection) ?? offerDirections[0];
  const selectedOfferFeatures = offeringFeatures.filter(feature => decisions.rdFeatures.includes(feature.name));
  const offerComponentCost = selectedOfferFeatures.reduce((total, feature) => total + feature.cost, 0);
  const recommendedFeaturesSelected = (activeOfferDirection.features as readonly string[]).filter(feature => decisions.rdFeatures.includes(feature)).length;
  const offerFit = Math.min(100, 42 + selectedOfferFeatures.length * 8 + recommendedFeaturesSelected * 18 + (decisions.targetSegment === activeOfferDirection.segment ? 12 : 0));
  const totalDemandForecast = productionPlan.coreForecast + productionPlan.nomadForecast;
  const forecastOrdered = forecastLab.low <= forecastLab.expected && forecastLab.expected <= forecastLab.high;
  const forecastReadiness = Math.min(100, (forecastOrdered ? 40 : 0) + (forecastLab.driver ? 20 : 0) + (forecastLab.reversalTrigger.trim().length >= 12 ? 25 : 0) + (forecastLab.confidence > 0 ? 15 : 0));
  const quarterlyCapacity = productionPlan.operatingCapacity * 65;
  const capacityGap = quarterlyCapacity - totalDemandForecast;
  const netBrandPrice = decisions.pricing - marketingPlan.rebate;
  const projectedEndingCash = 1332781 + financePlan.equityRequest + financePlan.conventionalLoan - decisions.rdBudget - (productionPlan.fixedCapacityIncrease * 22000) - decisions.marketingBudget;
  const quarterProgress = Math.round(Object.values(quarterChecks).filter(Boolean).length / Object.keys(quarterChecks).length * 100);
  const finalCheckItems = [
    { label: 'Net brand price is above $1,300', pass: netBrandPrice > 1300, detail: `Price $${decisions.pricing.toLocaleString()} - rebate $${marketingPlan.rebate.toLocaleString()} = $${netBrandPrice.toLocaleString()}` },
    { label: 'Brand price is below $8,500', pass: decisions.pricing < 8500, detail: `Current price: $${decisions.pricing.toLocaleString()}` },
    { label: 'Fixed-capacity increase is no more than 50 units/day', pass: productionPlan.fixedCapacityIncrease <= 50, detail: `Planned increase: ${productionPlan.fixedCapacityIncrease} units/day` },
    { label: 'Maximum inventory is no more than 200 per brand', pass: productionPlan.maxInventoryPerBrand <= 200, detail: `Planned maximum: ${productionPlan.maxInventoryPerBrand} units` },
    { label: 'Projected ending cash remains positive', pass: projectedEndingCash >= 1, detail: `Projected ending cash: $${projectedEndingCash.toLocaleString()}` },
    { label: 'Production capacity can support the demand forecast', pass: capacityGap >= 0, detail: `${quarterlyCapacity.toLocaleString()} capacity vs ${totalDemandForecast.toLocaleString()} forecast units` },
    { label: 'Each major decision has a written rationale', pass: ['marketing', 'manufacturing', 'finance', 'brand'].every(key => decisionRationales[key].trim().length >= 20), detail: 'Explain the evidence, assumption, and trade-off for all four decision areas.' }
  ];
  const finalChecksPassed = finalCheckItems.filter(item => item.pass).length;


  const speakAssessmentResponse = (content: string) => {
    if (boardroomMode !== 'verbal-assessment' || !voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(content);
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
  };

  const captureSpokenResponse = () => {
    if (typeof window === 'undefined') return;
    const browserWindow = window as unknown as {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor;
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    };
    const Recognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      alert('Speech recognition is not available in this browser. You can type your response instead.');
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) setInputVal(current => current ? `${current} ${transcript}` : transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  };

  const startDecisionCoach = async (context: string) => {
    if (credits < 25) {
      alert('You need 25 credits to open a Decision Coach session.');
      return;
    }
    const newCredits = credits - 25;
    setCredits(newCredits);
    localStorage.setItem('abis_credits', String(newCredits));
    setDecisionCoachContext(context);
    setDecisionCoachMessages([]);
    setDecisionCoachInput('');
    setShowDecisionCoach(true);
    setDecisionCoachLoading(true);

    try {
      const res = await fetch('/api/boardroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], decisions, stage: 'awareness', customApiKey, mode: 'decision-help', courseTopics: [context] })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDecisionCoachMessages([{ id: `coach-${Date.now()}`, role: 'assistant', cxo: data.cxo, content: data.content, timestamp: 'Now' }]);
    } catch (err) {
      console.error(err);
      setDecisionCoachMessages([{ id: `coach-fallback-${Date.now()}`, role: 'assistant', cxo: 'CHAIR', content: `Let’s examine ${context.toLowerCase()}. Which number concerns you most, and what decision might it change?`, timestamp: 'Now' }]);
    } finally {
      setDecisionCoachLoading(false);
    }
  };

  const sendDecisionCoachMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!decisionCoachInput.trim() || decisionCoachLoading) return;
    const userMessage: Message = { id: `coach-user-${Date.now()}`, role: 'user', content: decisionCoachInput.trim(), timestamp: 'Now' };
    const updatedMessages = [...decisionCoachMessages, userMessage];
    setDecisionCoachMessages(updatedMessages);
    setDecisionCoachInput('');
    setDecisionCoachLoading(true);
    try {
      const res = await fetch('/api/boardroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, decisions, stage: 'awareness', customApiKey, mode: 'decision-help', courseTopics: [decisionCoachContext] })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDecisionCoachMessages(current => [...current, { id: `coach-ai-${Date.now()}`, role: 'assistant', cxo: data.cxo, content: data.content, timestamp: 'Now' }]);
    } catch (err) {
      console.error(err);
      setDecisionCoachMessages(current => [...current, { id: `coach-fallback-${Date.now()}`, role: 'assistant', cxo: 'CHAIR', content: 'Compare the outcome you expect with the downside if demand or cash is weaker than forecast. Which assumption should you test next?', timestamp: 'Now' }]);
    } finally {
      setDecisionCoachLoading(false);
    }
  };

  const decisionCoachButton = (context: string) => (
    <button onClick={() => startDecisionCoach(context)} className="decision-coach-button"><Sparkles size={15} /> Help me decide <span>25 credits</span></button>
  );

  const financialReports: Record<string, { heading: string; description: string; context: string; columns: string[]; rows: Array<[string, string, string, string]> }> = {
    'income-statement': {
      heading: 'Income Statement', description: 'Previous-quarter results show how revenue, cost, and investment decisions combine into operating performance.', context: 'Income Statement', columns: ['Quarter 1', 'Quarter 2', 'Quarter 3'],
      rows: [['Revenue', '$405,356', '$2,296,200', '$2,296,200'], ['Cost of goods sold', '$269,126', '$1,259,157', '$1,259,157'], ['Gross profit', '$136,230', '$940,293', '$940,293'], ['Research & development', '$81,000', '$390,000', '$520,000'], ['Marketing & sales', '$154,820', '$525,140', '$556,885'], ['Operating income', '-$98,150', '-$535,424', '-$535,424']]
    },
    'cash-flow': {
      heading: 'Cash Flow', description: 'Track whether operating decisions are generating enough cash to fund the next quarter.', context: 'Cash Flow', columns: ['Quarter 1', 'Quarter 2', 'Quarter 3'],
      rows: [['Beginning cash balance', '$0', '$13,785', '$14,142'], ['Cash receipts from customers', '$405,356', '$2,296,200', '$2,296,200'], ['Production & operating costs', '-$344,429', '-$1,372,879', '-$1,372,879'], ['Research & marketing', '-$235,820', '-$505,000', '-$635,000'], ['Capital investment', '$0', '-$600,000', '-$25,000'], ['Ending cash balance', '$13,785', '$14,142', '$1,332,781']]
    },
    'balance-sheet': {
      heading: 'Balance Sheet', description: 'See the resources the firm controls and how those resources are financed.', context: 'Balance Sheet', columns: ['Quarter 1', 'Quarter 2', 'Quarter 3'],
      rows: [['Cash', '$13,785', '$14,142', '$1,332,781'], ['Finished goods inventory', '$0', '$0', '$113,722'], ['Net fixed assets', '$0', '$600,000', '$575,000'], ['Total assets', '$932,785', '$1,556,927', '$2,021,502'], ['Long-term debt', '$0', '$0', '$0'], ['Total debt & equity', '$932,785', '$1,556,927', '$2,021,502']]
    },
    'balanced-scorecard': {
      heading: 'Balanced Scorecard', description: 'Measure financial, customer, market, and future-readiness performance together.', context: 'Balanced Scorecard', columns: ['Current score', 'Industry benchmark', 'Status'],
      rows: [['Market performance', '0.36', '0.35', 'Above benchmark'], ['Customer satisfaction', '74', '70', 'Improving'], ['Financial performance', '0.22', '0.40', 'Needs attention'], ['Asset management', '0.61', '0.55', 'Above benchmark'], ['Preparedness for the future', '0.68', '0.60', 'On track'], ['Stakeholder impact', `${impactScore}/100`, '70/100', 'Monitor']]
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setCustomApiKey(savedKey);

    const savedCredits = localStorage.getItem('abis_credits');
    if (savedCredits) setCredits(Number(savedCredits));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFileName(file.name);
    setUploadedFileSize(Math.round(file.size / 1024)); // in KB
    setEvaluationResult(null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }, 150);
  };

  const handleEvaluatePackaging = () => {
    if (credits < 200) {
      alert("Insufficient credits to run brand packaging evaluation. Please add credits.");
      return;
    }

    setEvaluating(true);
    
    // Deduct fee
    const newBal = credits - 200;
    setCredits(newBal);
    localStorage.setItem('abis_credits', String(newBal));

    setTimeout(() => {
      const result = evaluatePackagingDesign(
        uploadedFileName,
        evalBrandName,
        evalSegment,
        decisions.rdFeatures
      );
      setEvaluationResult(result);
      setEvaluating(false);
    }, 2000);
  };

  const handleEvaluateDefense = () => {
    if (credits < 150) {
      alert("Insufficient credits to run oral defense evaluation. Please add credits.");
      return;
    }

    setIsRecording(false);
    setRecordingSubmitted(true);
    setDefenseEvaluating(true);
    
    // Deduct fee
    const newBal = credits - 150;
    setCredits(newBal);
    localStorage.setItem('abis_credits', String(newBal));

    setTimeout(() => {
      const result = evaluateOralDefense(decisions);
      setDefenseResult(result);
      setDefenseEvaluating(false);
    }, 2000);
  };

  const handleResetDefense = () => {
    setIsRecording(false);
    setRecordSeconds(0);
    setRecordingSubmitted(false);
    setDefenseEvaluating(false);
    setDefenseResult(null);
  };

  const handleSalesForceChange = (city: 'tokyo' | 'sydney', segment: keyof typeof decisions.salesForce.tokyo, val: number) => {
    const updatedValue = Math.max(0, val);
    setDecisions(prev => ({
      ...prev,
      salesForce: {
        ...prev.salesForce,
        [city]: {
          ...prev.salesForce[city],
          [segment]: updatedValue
        }
      }
    }));
  };

  const toggleRdFeature = (feature: string) => {
    setDecisions(prev => {
      const current = prev.rdFeatures;
      const next = current.includes(feature)
        ? current.filter(f => f !== feature)
        : [...current, feature];
      return { ...prev, rdFeatures: next };
    });
  };

  const saveApiKey = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowSettingsModal(false);
  };

  const addCredits = () => {
    const newBal = credits + 1000;
    setCredits(newBal);
    localStorage.setItem('abis_credits', String(newBal));
  };

  const runForecastMission = async () => {
    if (forecastMission.evidence.length < 2) {
      alert('Choose two evidence signals before testing your forecast.');
      return;
    }
    if (credits < 25 || forecastLoading) {
      alert('You need 25 credits to run the Forecast Mission.');
      return;
    }
    const forecastValue = forecastMission.forecastCase === 'conservative' ? forecastLab.low : forecastMission.forecastCase === 'stretch' ? forecastLab.high : forecastLab.expected;
    setCredits(current => {
      const next = current - 25;
      localStorage.setItem('abis_credits', String(next));
      return next;
    });
    setForecastLoading(true);
    const missionContext = `FORECAST ANALYST: FORECAST MISSION. Student chose ${forecastMission.forecastCase} demand case of ${forecastValue} units using evidence: ${forecastMission.evidence.join(', ')}. Test scenario: ${forecastMission.scenario}. Previous total demand 797; Nomad had 23 stock-outs; current capacity ${quarterlyCapacity}; current price $${decisions.pricing}; marketing $${decisions.marketingBudget}. Give feedback on evidence quality, the likely pressure from the scenario, and one next check.`;
    try {
      const response = await fetch('/api/boardroom', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], decisions, stage: 'awareness', customApiKey, mode: 'decision-help', courseTopics: [missionContext] })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setForecastMission(current => ({ ...current, result: data.content }));
    } catch (error) {
      console.error(error);
      const capacityMessage = quarterlyCapacity >= forecastValue ? 'Your planned capacity covers this case.' : 'Your planned capacity does not cover this case.';
      setForecastMission(current => ({ ...current, result: `You used ${current.evidence.join(' and ')} to support a ${current.forecastCase} case of ${forecastValue.toLocaleString()} units. Under “${current.scenario},” test whether demand or margin moves first; ${capacityMessage} What result would make you switch cases?` }));
    } finally {
      setForecastLoading(false);
    }
  };

  // Init boardroom session (Booking Fee transaction)
  const handleInitiateSession = () => {
    if (credits < 500) {
      alert("Insufficient credits. Please click '+ Add Credits' at the bottom of the right sidebar first.");
      return;
    }
    setShowBookingModal(true);
  };

  const handlePayBookingFee = async () => {
    const newCredits = credits - 500;
    setCredits(newCredits);
    localStorage.setItem('abis_credits', String(newCredits));
    setShowBookingModal(false);
    
    // Set up initial session state
    setMessages([]);
    setActiveStage('awareness');
    setActiveMenu('boardroom-chat');
    setLoading(true);

    try {
      const res = await fetch('/api/boardroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          decisions,
          stage: 'awareness',
          customApiKey,
          mode: boardroomMode,
          courseTopics: []
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const introMsg: Message = {
        id: 'intro',
        role: 'assistant',
        cxo: data.cxo,
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([introMsg]);
      setActiveCxo(data.cxo);
      speakAssessmentResponse(introMsg.content);
    } catch (err: unknown) {
      console.error(err);
      setMessages([{
        id: 'err-fallback',
        role: 'assistant',
        cxo: 'CEO',
        content: boardroomMode === 'verbal-assessment'
          ? `Welcome. We will defend one decision from your quarter, and I will make the question smaller if you get stuck. You chose the ${decisions.targetSegment} segment, a $${decisions.pricing.toLocaleString()} price, and ${decisions.productionVolume.toLocaleString()} production units—what evidence makes those choices fit together?`
          : `Welcome to the Boardroom. We have extracted your APAC strategy. Let's start with your targeting of ${decisions.targetSegment}. Explain the overarching rationale behind your marketing allocations here.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setActiveCxo('CEO');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputVal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputVal('');
    setLoading(true);

    try {
      const res = await fetch('/api/boardroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          decisions,
          stage: activeStage,
          customApiKey,
          mode: boardroomMode,
          courseTopics: []
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        cxo: data.cxo,
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setActiveCxo(data.cxo);
      speakAssessmentResponse(aiMsg.content);
      
      if (data.nextStage && data.nextStage !== activeStage) {
        setActiveStage(data.nextStage);
      }
    } catch (err: unknown) {
      console.error(err);
      const fallbackMsg: Message = {
        id: `fallback-${Date.now()}`,
        role: 'assistant',
        cxo: 'CFO',
        content: boardroomMode === 'verbal-assessment'
          ? "That is okay; let us make it smaller. Which previous-quarter result influenced this decision most?"
          : "Explain how these figures align with your long term operational margins. I need concrete details, not high-level assertions.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
      setActiveCxo('CFO');
    } finally {
      setLoading(false);
    }
  };

  const getStageTitle = (stage: typeof activeStage) => {
    switch (stage) {
      case 'awareness': return 'Situational Awareness';
      case 'discovery': return 'Diagnostic Discovery';
      case 'refinement': return 'Strategic Refinement';
      case 'completed': return 'Interrogation Complete';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="header-top">
        <div className="header-left">
          <div className="logo-container">
            <Globe className="logo-globe" size={24} />
            <span>Marketplace</span>
          </div>
          <div className="notif-badge">2</div>
          <span style={{ fontSize: '0.8rem', color: '#667E96', marginLeft: '8px' }}>microsimulations</span>
          <span style={{ fontSize: '0.8rem', color: '#667E96' }}>trophy room</span>
          <span style={{ fontSize: '0.8rem', color: '#667E96' }}>blog</span>
        </div>

        <div className="header-tabs">
          <div 
            onClick={() => setActiveTab('lecture')}
            className={`header-tab ${activeTab === 'lecture' ? 'active' : ''}`}
          >
            Lecture
          </div>
          <div 
            onClick={() => setActiveTab('workspace')}
            className={`header-tab ${activeTab === 'workspace' ? 'active' : ''}`}
          >
            Workspace
          </div>
        </div>

        <div className="header-right">
          <div className="header-action">
            <HelpCircle size={16} />
            <span>help</span>
            <ChevronDown size={14} />
          </div>
          <div className="header-action" onClick={() => setShowSettingsModal(true)}>
            <User size={16} />
            <span>account (Mirai)</span>
            <ChevronDown size={14} />
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT */}
      <div className="layout-body">
        
        {/* LEFT SIDEBAR ACCORDION */}
        <aside className="left-sidebar">
          <div className="sidebar-quarter-selector">
            <span>&lt;</span>
            <span style={{ fontSize: '0.9rem' }}>Quarter 4</span>
            <span>&gt;</span>
          </div>

          <div className="sidebar-search-box">
            <input 
              type="text" 
              className="sidebar-search-input" 
              placeholder="Menu Search" 
            />
          </div>

          <button onClick={() => setActiveMenu('quarter-plan')} className={`quarter-plan-link ${activeMenu === 'quarter-plan' ? 'active' : ''}`}>
            <BookOpenCheck size={15} />
            <span>Quarter 4 Action Plan</span>
            <b>{quarterProgress}%</b>
          </button>

          <div className="sidebar-menu">
            
            {/* accordion item: Performance Report */}
            <div className="menu-group">
              <div onClick={() => toggleSection('performance')} className={`menu-group-header ${expandedSections.performance ? 'active' : ''}`}>
                <span>Performance Report</span>
                {expandedSections.performance ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {expandedSections.performance && (
                <div className="menu-sub-items">
                  <button 
                    onClick={() => setActiveMenu('market-share')} 
                    className={`menu-item-btn ${activeMenu === 'market-share' ? 'active' : ''}`}
                  >
                    Market Share
                  </button>
                  <button onClick={() => setActiveMenu('sales')} className={`menu-item-btn ${activeMenu === 'sales' ? 'active' : ''}`}>Sales</button>
                  <button onClick={() => setActiveMenu('income-statement')} className={`menu-item-btn ${activeMenu === 'income-statement' ? 'active' : ''}`}>Income Statement</button>
                  <button onClick={() => setActiveMenu('cash-flow')} className={`menu-item-btn ${activeMenu === 'cash-flow' ? 'active' : ''}`}>Cash Flow</button>
                  <button onClick={() => setActiveMenu('balance-sheet')} className={`menu-item-btn ${activeMenu === 'balance-sheet' ? 'active' : ''}`}>Balance Sheet</button>
                  <button onClick={() => setActiveMenu('balanced-scorecard')} className={`menu-item-btn ${activeMenu === 'balanced-scorecard' ? 'active' : ''}`}>Balanced Scorecard</button>
                  <button onClick={() => setActiveMenu('detailed-demand')} className={`menu-item-btn ${activeMenu === 'detailed-demand' ? 'active' : ''}`}>Detailed Brand Demand Report</button>
                  <button onClick={() => setActiveMenu('strategic-graphs')} className={`menu-item-btn ${activeMenu === 'strategic-graphs' ? 'active' : ''}`}>Strategic Graphs</button>
                  <button 
                    onClick={() => setActiveMenu('competitors-profiles')} 
                    className={`menu-item-btn ${activeMenu === 'competitors-profiles' ? 'active' : ''}`}
                  >
                    Competitors&apos; Profiles
                  </button>
                </div>
              )}
            </div>

            {/* accordion item: Brand Management */}
            <div className="menu-group">
              <div onClick={() => toggleSection('brand')} className={`menu-group-header ${expandedSections.brand ? 'active' : ''}`}>
                <span>Brand Management</span>
                {expandedSections.brand ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {expandedSections.brand && (
                <div className="menu-sub-items">
                  <button 
                    onClick={() => setActiveMenu('brand-offering')}
                    className={`menu-item-btn ${activeMenu === 'brand-offering' ? 'active' : ''}`}
                  >
                    Expand the Market Offering
                  </button>
                  <button 
                    onClick={() => setActiveMenu('packaging-eval')}
                    className={`menu-item-btn ${activeMenu === 'packaging-eval' ? 'active' : ''}`}
                  >
                    AI Brand Packaging Score
                  </button>
                  <button className="menu-item-btn">Brand Profitability</button>
                  <button className="menu-item-btn">Product Review</button>
                  <button className="menu-item-btn">Brand Judgment</button>
                  <button className="menu-item-btn">Competitors&apos; Brands</button>
                  <button className="menu-item-btn">Design Brand</button>
                  <button className="menu-item-btn">R&D Investment</button>
                </div>
              )}
            </div>

            {/* accordion item: Marketing */}
            <div className="menu-group">
              <div onClick={() => toggleSection('marketing')} className={`menu-group-header ${expandedSections.marketing ? 'active' : ''}`}>
                <span>Marketing</span>
                {expandedSections.marketing ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {expandedSections.marketing && (
                <div className="menu-sub-items">
                  <button onClick={() => setActiveMenu('marketing-plan')} className={`menu-item-btn ${activeMenu === 'marketing-plan' ? 'active' : ''}`}>Advertising & Media</button>
                  <button onClick={() => setActiveMenu('marketing-plan')} className="menu-item-btn">Buy Market Research</button>
                  <button onClick={() => setActiveMenu('summary-decisions')} className="menu-item-btn">Tactical Summary</button>
                </div>
              )}
            </div>

            {/* accordion item: Sales Channel */}
            <div className="menu-group">
              <div onClick={() => toggleSection('salesChannel')} className={`menu-group-header ${expandedSections.salesChannel ? 'active' : ''}`}>
                <span>Sales Channel</span>
                {expandedSections.salesChannel ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {expandedSections.salesChannel && (
                <div className="menu-sub-items">
                  <button 
                    onClick={() => setActiveMenu('hire-sales')}
                    className={`menu-item-btn ${activeMenu === 'hire-sales' ? 'active' : ''}`}
                  >
                    Hire Sales People
                  </button>
                  <button className="menu-item-btn">Open Sales Offices</button>
                  <button className="menu-item-btn">Tactical Summary</button>
                </div>
              )}
            </div>

            {/* accordion item: Manufacturing */}
            <div className="menu-group">
              <div onClick={() => toggleSection('manufacturing')} className={`menu-group-header ${expandedSections.manufacturing ? 'active' : ''}`}>
                <span>Manufacturing</span>
                {expandedSections.manufacturing ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {expandedSections.manufacturing && (
                <div className="menu-sub-items">
                  <button onClick={() => setActiveMenu('manufacturing-plan')} className={`menu-item-btn ${activeMenu === 'manufacturing-plan' ? 'active' : ''}`}>Demand Projection</button>
                  <button onClick={() => setActiveMenu('manufacturing-plan')} className="menu-item-btn">Operating Capacity</button>
                  <button onClick={() => setActiveMenu('manufacturing-plan')} className="menu-item-btn">Production Simulation</button>
                  <button onClick={() => setActiveMenu('manufacturing-plan')} className="menu-item-btn">Fixed Capacity</button>
                </div>
              )}
            </div>

            {/* accordion item: Finance */}
            <div className="menu-group">
              <div onClick={() => toggleSection('finance')} className={`menu-group-header ${expandedSections.finance ? 'active' : ''}`}>
                <span>Finance</span>
                {expandedSections.finance ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {expandedSections.finance && (
                <div className="menu-sub-items">
                  <button onClick={() => setActiveMenu('finance-plan')} className={`menu-item-btn ${activeMenu === 'finance-plan' ? 'active' : ''}`}>Funding Plan</button>
                  <button onClick={() => setActiveMenu('finance-plan')} className="menu-item-btn">Pro Forma Accounting</button>
                  <button onClick={() => setActiveMenu('income-statement')} className="menu-item-btn">Financial Ratios</button>
                </div>
              )}
            </div>

            {/* accordion item: Boardroom Interrogation */}
            <div className="menu-group">
              <div onClick={() => toggleSection('boardroom')} className={`menu-group-header ${expandedSections.boardroom ? 'active' : ''}`}>
                <span style={{ color: 'var(--accent-red)' }}>AI Socratic Boardroom</span>
                {expandedSections.boardroom ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {expandedSections.boardroom && (
                <div className="menu-sub-items">
                  <button 
                    onClick={() => {
                      if (messages.length > 0) {
                        setActiveMenu('boardroom-chat');
                      } else {
                        setActiveMenu('boardroom-intro');
                      }
                    }}
                    className={`menu-item-btn ${activeMenu.startsWith('boardroom') ? 'active' : ''}`}
                  >
                    Interrogate Strategy
                  </button>
                </div>
              )}
            </div>

            <div className="menu-group conscious-menu-group">
              <div onClick={() => toggleSection('conscious')} className={`menu-group-header ${expandedSections.conscious ? 'active' : ''}`}>
                <span className="conscious-menu-title"><Leaf size={14} /> Conscious Capitalism</span>
                {expandedSections.conscious ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {expandedSections.conscious && (
                <div className="menu-sub-items">
                  <button onClick={() => setActiveMenu('impact-hub')} className={`menu-item-btn ${activeMenu === 'impact-hub' ? 'active' : ''}`}>
                    Stakeholder Impact Hub
                  </button>
                  <button onClick={() => setActiveMenu('boardroom-intro')} className="menu-item-btn">
                    Socratic Impact Review
                  </button>
                </div>
              )}
            </div>

          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--sidebar-border)' }}>
            <button onClick={() => setActiveMenu('summary-decisions')} className={`menu-item-btn ${activeMenu === 'summary-decisions' ? 'active' : ''}`} style={{ paddingLeft: '14px', fontWeight: 600 }}>Summary of Decisions</button>
            <button 
              onClick={() => setActiveMenu('final-check')}
              className={`menu-item-btn ${activeMenu === 'final-check' ? 'active' : ''}`}
              style={{ paddingLeft: '14px', fontWeight: 600 }}
            >
              Final Check
            </button>
            <button onClick={() => finalChecksPassed === finalCheckItems.length ? alert('Quarter 4 decisions submitted successfully.') : setActiveMenu('final-check')} className="menu-item-btn" style={{ paddingLeft: '14px', color: 'white', fontWeight: 700 }}>Submit</button>
          </div>
        </aside>

        {/* CENTER WORKSPACE AREA */}
        <main className="center-workspace">
          
          {/* Workspace Header */}
          <div className="workspace-header">
            <h2 className="workspace-title">
              {activeMenu === 'quarter-plan' && 'Quarter 4 Action Plan'}
              {activeMenu === 'market-share' && 'Market Share'}
              {activeMenu === 'sales' && 'Sales'}
              {activeMenu === 'income-statement' && 'Income Statement'}
              {activeMenu === 'cash-flow' && 'Cash Flow'}
              {activeMenu === 'balance-sheet' && 'Balance Sheet'}
              {activeMenu === 'balanced-scorecard' && 'Balanced Scorecard'}
              {activeMenu === 'detailed-demand' && 'Detailed Brand Demand Report'}
              {activeMenu === 'strategic-graphs' && 'Strategic Graphs'}
              {activeMenu === 'competitors-profiles' && 'Competitors\' Profiles'}
              {activeMenu === 'hire-sales' && 'Hire Sales People'}
              {activeMenu === 'marketing-plan' && 'Advertising & Media Placement'}
              {activeMenu === 'manufacturing-plan' && 'Manufacturing Plan'}
              {activeMenu === 'finance-plan' && 'Funding & Pro Forma Plan'}
              {activeMenu === 'summary-decisions' && 'Summary of Decisions'}
              {activeMenu === 'brand-offering' && 'Expand the Market Offering'}
              {activeMenu === 'packaging-eval' && 'AI Brand Packaging & Brochure Score'}
              {activeMenu === 'final-check' && 'Strategic Oral Defense (Final Check)'}
              {activeMenu === 'boardroom-intro' && (boardroomMode === 'verbal-assessment' ? 'AI Socratic Verbal Assessment' : 'AI Boardroom Challenge')}
              {activeMenu === 'boardroom-chat' && (boardroomMode === 'verbal-assessment' ? `AI Verbal Assessment - ${activeStage === 'completed' ? 'Complete' : 'In Progress'}` : `AI Boardroom - ${getStageTitle(activeStage)}`)}
              {activeMenu === 'impact-hub' && 'Conscious Capitalism — Stakeholder Impact Hub'}
            </h2>
            <div className="workspace-actions">
              <Printer className="workspace-action-icon" size={16} />
              <Download className="workspace-action-icon" size={16} />
              <Share2 className="workspace-action-icon" size={16} />
            </div>
          </div>

          {/* Workspace Content Scrollable Area */}
          <div className="workspace-scrollable" style={{ padding: activeMenu.startsWith('boardroom-chat') ? '0' : '24px' }}>

            {/* VIEW: Guide-aligned Quarter 4 work plan */}
            {activeMenu === 'quarter-plan' && (
              <div className="guide-workspace">
                <section className="guide-hero">
                  <div><span>Quarter 4 · Invest in the future</span><h3>Turn last quarter&apos;s evidence into one coherent business plan.</h3><p>The game manual expects you to evaluate performance, estimate demand, build a one-year plan, secure funding, invest in R&amp;D, and coordinate marketing with production.</p></div>
                  <div className="guide-progress"><strong>{quarterProgress}%</strong><span>work plan complete</span><div><i style={{ width: `${quarterProgress}%` }} /></div></div>
                </section>

                <section className="guide-card">
                  <div className="guide-card-title"><div><ClipboardCheck size={19} /><h4>Quarter 4 decision sequence</h4></div><span>Based on the game manual</span></div>
                  <div className="guide-sequence">
                    {[
                      { key: 'performance', phase: 'Review', title: 'Financial performance & ABC', copy: 'Inspect brand profitability, sales-office economics, cash flow, and financial ratios.', menu: 'income-statement' },
                      { key: 'market', phase: 'Diagnose', title: 'Market response & competitors', copy: 'Compare customer judgments, demand, market share, and competitor tactics.', menu: 'detailed-demand' },
                      { key: 'businessPlan', phase: 'Plan', title: 'One-year business strategy', copy: 'Set linked marketing, manufacturing, ownership, and financial goals.', menu: 'summary-decisions' },
                      { key: 'marketing', phase: 'Decide', title: 'Marketing & market coverage', copy: 'Revise brand, price, rebate, advertising, media, sales force, and research.', menu: 'marketing-plan' },
                      { key: 'production', phase: 'Coordinate', title: 'Forecast & production plan', copy: 'Forecast by brand, schedule operating capacity, simulate production, and plan fixed capacity.', menu: 'manufacturing-plan' },
                      { key: 'finance', phase: 'Fund', title: 'Equity, debt & pro forma', copy: 'Size the equity request, consider debt, and preserve a positive ending cash balance.', menu: 'finance-plan' }
                    ].map((item, index) => (
                      <article key={item.key} className={`guide-sequence-item ${quarterChecks[item.key] ? 'complete' : ''}`}>
                        <button className="guide-check" onClick={() => setQuarterChecks(current => ({ ...current, [item.key]: !current[item.key] }))} aria-label={`Mark ${item.title} ${quarterChecks[item.key] ? 'incomplete' : 'complete'}`}>{quarterChecks[item.key] ? <CheckCircle2 size={19} /> : index + 1}</button>
                        <div><span>{item.phase}</span><h5>{item.title}</h5><p>{item.copy}</p></div>
                        <button className="guide-open" onClick={() => setActiveMenu(item.menu)}>Open <ChevronRight size={14} /></button>
                      </article>
                    ))}
                  </div>
                </section>

                <div className="guide-two-column">
                  <section className="guide-card dependency-card"><div className="guide-card-title"><div><BarChart3 size={19} /><h4>Decision dependency check</h4></div></div><p>Every major choice should have an upstream reason and a downstream consequence.</p><div className="dependency-flow"><span>Market evidence</span><ChevronRight size={15}/><span>Brand & price</span><ChevronRight size={15}/><span>Demand forecast</span><ChevronRight size={15}/><span>Capacity & cash</span></div></section>
                  <section className="guide-card learning-card"><div className="guide-card-title"><div><BookOpenCheck size={19} /><h4>Learning standard</h4></div></div><p>Before submission, students should be able to state the evidence used, the assumption made, the trade-off accepted, and what result would trigger a change next quarter.</p><button onClick={() => setActiveMenu('final-check')}>Run Final Check <ArrowUpRight size={15}/></button></section>
                </div>
              </div>
            )}

            {/* VIEW: Marketing and advertising decisions */}
            {activeMenu === 'marketing-plan' && (
              <div className="manual-decision-view">
                <div className="manual-view-intro"><div><span><Megaphone size={16}/> Quarter 4 marketing</span><h3>Advertising & Media Placement</h3><p>Match the message to the target segment, then balance reach against diminishing returns.</p></div>{decisionCoachButton('Advertising, media placement, price rebates, and market research')}</div>
                <div className="manual-view-grid">
                  <section className="manual-panel"><div className="manual-panel-title"><h4>Ad copy claims</h4><span>{marketingPlan.claims.length} selected</span></div><p className="manual-help">The guide recommends claims that communicate the benefits customers value. Avoid claims the brand cannot substantiate.</p><div className="claim-grid">{['Easy to use','High performance','Portable design','Low operating cost','Sustainable materials','Reliable service'].map(claim => { const selected = marketingPlan.claims.includes(claim); return <button key={claim} onClick={() => setMarketingPlan(current => ({ ...current, claims: selected ? current.claims.filter(item => item !== claim) : [...current.claims, claim] }))} className={selected ? 'selected' : ''}>{selected && <CheckCircle2 size={15}/>} {claim}</button>; })}</div></section>
                  <section className="manual-panel"><div className="manual-panel-title"><h4>Media & pricing inputs</h4><span>APAC</span></div><div className="decision-input-grid"><label>Local ad frequency<input type="number" value={marketingPlan.localFrequency} min="0" onChange={event => setMarketingPlan({ ...marketingPlan, localFrequency: Number(event.target.value) })}/></label><label>Regional ad frequency<input type="number" value={marketingPlan.regionalFrequency} min="0" onChange={event => setMarketingPlan({ ...marketingPlan, regionalFrequency: Number(event.target.value) })}/></label><label>Price rebate ($)<input type="number" value={marketingPlan.rebate} min="0" onChange={event => setMarketingPlan({ ...marketingPlan, rebate: Number(event.target.value) })}/></label><label>Market research ($)<input type="number" value={marketingPlan.marketResearch} min="0" step="5000" onChange={event => setMarketingPlan({ ...marketingPlan, marketResearch: Number(event.target.value) })}/></label></div><div className="decision-signal"><strong>Net market price: ${netBrandPrice.toLocaleString()}</strong><span>{netBrandPrice > 1300 ? 'Within the manual safety constraint.' : 'Fatal error: price minus rebate must exceed $1,300.'}</span></div></section>
                </div>
                <section className="rationale-panel"><div><h4>Explain the marketing decision</h4><p>What customer or competitor evidence supports this plan, and what would make you revise it?</p></div><textarea value={decisionRationales.marketing} onChange={event => setDecisionRationales({ ...decisionRationales, marketing: event.target.value })} placeholder="Evidence → assumption → trade-off → next-quarter trigger"/><span>{decisionRationales.marketing.trim().length}/20 minimum characters</span></section>
              </div>
            )}

            {/* VIEW: Manufacturing decisions */}
            {activeMenu === 'manufacturing-plan' && (
              <div className="manual-decision-view">
                <div className="manual-view-intro"><div><span><Factory size={16}/> Quarter 4 manufacturing</span><h3>Demand Projection & Operating Capacity</h3><p>Forecast demand by brand, schedule daily capacity, and test whether the production plan serves demand without excessive inventory.</p></div>{decisionCoachButton('Demand forecasting, production capacity, inventory, and manufacturing economics')}</div>
                <div className="manual-view-grid manufacturing-grid">
                  <section className="manual-panel"><div className="manual-panel-title"><h4>Demand forecast by brand</h4><span>Units</span></div><div className="forecast-table"><label><span>Mirai Core</span><small>Previous demand: 430</small><input type="number" value={productionPlan.coreForecast} min="0" onChange={event => setProductionPlan({ ...productionPlan, coreForecast: Number(event.target.value) })}/></label><label><span>Mirai Nomad</span><small>Previous demand: 367 · 23 stock-outs</small><input type="number" value={productionPlan.nomadForecast} min="0" onChange={event => setProductionPlan({ ...productionPlan, nomadForecast: Number(event.target.value) })}/></label><div><span>Total forecast</span><strong>{totalDemandForecast.toLocaleString()}</strong></div></div></section>
                  <section className="manual-panel"><div className="manual-panel-title"><h4>Capacity schedule</h4><span>65 days / quarter</span></div><div className="decision-input-grid"><label>Operating capacity / day<input type="number" value={productionPlan.operatingCapacity} min="0" max="425" onChange={event => setProductionPlan({ ...productionPlan, operatingCapacity: Number(event.target.value) })}/></label><label>Fixed capacity increase / day<input type="number" value={productionPlan.fixedCapacityIncrease} min="0" onChange={event => setProductionPlan({ ...productionPlan, fixedCapacityIncrease: Number(event.target.value) })}/></label><label>Maximum inventory / brand<input type="number" value={productionPlan.maxInventoryPerBrand} min="0" onChange={event => setProductionPlan({ ...productionPlan, maxInventoryPerBrand: Number(event.target.value) })}/></label></div><div className={`capacity-result ${capacityGap >= 0 ? 'good' : 'risk'}`}><span>Quarterly scheduled capacity</span><strong>{quarterlyCapacity.toLocaleString()}</strong><p>{capacityGap >= 0 ? `${capacityGap.toLocaleString()} units of capacity remain after forecast demand.` : `${Math.abs(capacityGap).toLocaleString()} forecast units are currently unsupported.`}</p></div></section>
                </div>
                <section className="forecast-lab">
                  <div className="forecast-mission">
                    <div className="forecast-mission-heading"><div><span><Sparkles size={15}/> 3-minute Forecast Mission</span><h4>Make a prediction, then let the market push back.</h4><p>There is no “correct” demand number. Your job is to choose evidence, commit to a case, and see which assumption needs testing.</p></div><b>25 credits</b></div>
                    <div className="forecast-mission-step"><span>1</span><div><b>Choose two signals you trust</b><div className="forecast-signal-grid">{['Nomad stock-outs', 'Previous total demand: 797', 'Current price: $3,000', 'Marketing investment: $1.2M', `Capacity: ${quarterlyCapacity.toLocaleString()} units`].map(signal => { const selected = forecastMission.evidence.includes(signal); return <button key={signal} className={selected ? 'selected' : ''} onClick={() => setForecastMission(current => ({ ...current, evidence: selected ? current.evidence.filter(item => item !== signal) : current.evidence.length >= 2 ? [...current.evidence.slice(1), signal] : [...current.evidence, signal], result: '' }))}>{selected && <CheckCircle2 size={14}/>} {signal}</button>; })}</div></div></div>
                    <div className="forecast-mission-step"><span>2</span><div><b>Commit to one demand case</b><div className="forecast-case-grid">{([{ id: 'conservative', label: 'Conservative', value: forecastLab.low, copy: 'Protect cash and inventory' }, { id: 'expected', label: 'Expected', value: forecastLab.expected, copy: 'Best evidence-based view' }, { id: 'stretch', label: 'Stretch', value: forecastLab.high, copy: 'Prepare for upside demand' }] as const).map(option => <button key={option.id} className={forecastMission.forecastCase === option.id ? 'selected' : ''} onClick={() => setForecastMission(current => ({ ...current, forecastCase: option.id, result: '' }))}><b>{option.label}</b><strong>{option.value.toLocaleString()} units</strong><small>{option.copy}</small></button>)}</div></div></div>
                    <div className="forecast-mission-step"><span>3</span><div><b>Test one market surprise</b><div className="forecast-scenario-row">{['Competitor cuts price', 'Advertising performs better', 'Demand arrives late'].map(scenario => <button key={scenario} className={forecastMission.scenario === scenario ? 'selected' : ''} onClick={() => setForecastMission(current => ({ ...current, scenario, result: '' }))}>{scenario}</button>)}</div></div></div>
                    <div className="forecast-mission-action"><p>{forecastMission.evidence.length < 2 ? 'Choose one more signal to unlock the simulation.' : `You will test ${forecastMission.forecastCase} demand under “${forecastMission.scenario}.”`}</p><button onClick={runForecastMission} disabled={forecastLoading || forecastMission.evidence.length < 2}>{forecastLoading ? 'AI is testing your logic…' : 'Test my forecast'}</button></div>
                    {forecastMission.result && <div className="forecast-mission-result"><div><Sparkles size={17}/><b>AI Forecast Debrief</b></div><p>{forecastMission.result}</p><button onClick={() => { const target = forecastMission.forecastCase === 'conservative' ? forecastLab.low : forecastMission.forecastCase === 'stretch' ? forecastLab.high : forecastLab.expected; const ratio = productionPlan.coreForecast / Math.max(1, totalDemandForecast); setProductionPlan({ ...productionPlan, coreForecast: Math.round(target * ratio), nomadForecast: Math.round(target * (1 - ratio)) }); }}>Use this case in my plan</button></div>}
                  </div>
                  <div className="forecast-lab-heading"><div><span><Sparkles size={15}/> Forecast Lab</span><h4>Predict a range, not one perfect number</h4><p>Record uncertainty before seeing the result. This creates a prediction you can replay and calibrate next quarter.</p></div><div className={`forecast-readiness ${forecastReadiness === 100 ? 'ready' : ''}`}><strong>{forecastReadiness}</strong><span>forecast readiness</span></div></div>
                  <div className="forecast-range-grid">
                    <label>Low case<input type="number" min="0" value={forecastLab.low} disabled={forecastLab.locked} onChange={event => setForecastLab({ ...forecastLab, low: Number(event.target.value), locked: false })}/></label>
                    <label>Expected<input type="number" min="0" value={forecastLab.expected} disabled={forecastLab.locked} onChange={event => setForecastLab({ ...forecastLab, expected: Number(event.target.value), locked: false })}/></label>
                    <label>High case<input type="number" min="0" value={forecastLab.high} disabled={forecastLab.locked} onChange={event => setForecastLab({ ...forecastLab, high: Number(event.target.value), locked: false })}/></label>
                    <label>Confidence: {forecastLab.confidence}%<input type="range" min="10" max="95" step="5" value={forecastLab.confidence} disabled={forecastLab.locked} onChange={event => setForecastLab({ ...forecastLab, confidence: Number(event.target.value), locked: false })}/></label>
                  </div>
                  <div className="forecast-band" aria-label={`Demand range ${forecastLab.low} to ${forecastLab.high} units`}><span style={{ width: `${Math.max(8, Math.min(92, forecastLab.confidence))}%` }}></span><b>{forecastLab.low.toLocaleString()}</b><strong>{forecastLab.expected.toLocaleString()} expected</strong><b>{forecastLab.high.toLocaleString()}</b></div>
                  {!forecastOrdered && <p className="forecast-order-warning"><AlertTriangle size={14}/> Keep the low case at or below expected, and expected at or below the high case.</p>}
                  <div className="forecast-thinking-grid">
                    <label>Biggest uncertainty<select value={forecastLab.driver} disabled={forecastLab.locked} onChange={event => setForecastLab({ ...forecastLab, driver: event.target.value, locked: false })}><option>Competitor price response</option><option>Stock-out recovery</option><option>Advertising response</option><option>Sales-force productivity</option><option>Segment growth</option></select></label>
                    <label>What result would change your mind?<input value={forecastLab.reversalTrigger} disabled={forecastLab.locked} onChange={event => setForecastLab({ ...forecastLab, reversalTrigger: event.target.value, locked: false })} placeholder="Example: demand falls below 760 units"/></label>
                  </div>
                  <div className="forecast-actions"><p><b>Capacity stress test:</b> {quarterlyCapacity >= forecastLab.high ? 'covers the high case' : quarterlyCapacity >= forecastLab.expected ? 'covers expected, not high' : 'does not cover expected demand'}.</p><button disabled={!forecastOrdered} onClick={() => { const ratio = productionPlan.coreForecast / Math.max(1, totalDemandForecast); setProductionPlan({ ...productionPlan, coreForecast: Math.round(forecastLab.expected * ratio), nomadForecast: Math.round(forecastLab.expected * (1 - ratio)) }); setForecastLab({ ...forecastLab, locked: !forecastLab.locked }); }}>{forecastLab.locked ? 'Unlock prediction' : 'Lock & apply expected case'}</button></div>
                </section>
                <section className="rationale-panel"><div><h4>Explain the manufacturing decision</h4><p>How did prior demand, stock-outs, inventory risk, and unit economics shape this forecast?</p></div><textarea value={decisionRationales.manufacturing} onChange={event => setDecisionRationales({ ...decisionRationales, manufacturing: event.target.value })} placeholder="Evidence → forecast assumption → capacity trade-off → monitoring trigger"/><span>{decisionRationales.manufacturing.trim().length}/20 minimum characters</span></section>
              </div>
            )}

            {/* VIEW: Finance and pro forma decisions */}
            {activeMenu === 'finance-plan' && (
              <div className="manual-decision-view">
                <div className="manual-view-intro"><div><span><Landmark size={16}/> Quarter 4 finance</span><h3>Funding & Pro Forma Plan</h3><p>Size the equity request, consider appropriate debt, and verify that growth investments preserve financial flexibility.</p></div>{decisionCoachButton('Equity funding, debt financing, pro forma cash flow, and financial risk')}</div>
                <div className="manual-view-grid">
                  <section className="manual-panel"><div className="manual-panel-title"><h4>Capital plan</h4><span>Venture round</span></div><div className="decision-input-grid"><label>Equity requested ($)<input type="number" value={financePlan.equityRequest} min="0" max="5000000" step="100000" onChange={event => setFinancePlan({ ...financePlan, equityRequest: Number(event.target.value) })}/></label><label>Shares offered<input type="number" value={financePlan.sharesOffered} min="1" step="1000" onChange={event => setFinancePlan({ ...financePlan, sharesOffered: Number(event.target.value) })}/></label><label>Conventional loan ($)<input type="number" value={financePlan.conventionalLoan} min="0" step="50000" onChange={event => { const conventionalLoan = Number(event.target.value); setFinancePlan({ ...financePlan, conventionalLoan }); setDecisions({ ...decisions, loanRequested: conventionalLoan }); }}/></label><label>3-month certificate ($)<input type="number" value={financePlan.certificateOfDeposit} min="0" step="50000" onChange={event => setFinancePlan({ ...financePlan, certificateOfDeposit: Number(event.target.value) })}/></label></div></section>
                  <section className="manual-panel proforma-panel"><div className="manual-panel-title"><h4>Live pro forma signals</h4><span>Estimate</span></div><div className="proforma-rows"><div><span>Implied share price</span><b>${Math.round(financePlan.equityRequest / Math.max(1, financePlan.sharesOffered)).toLocaleString()}</b></div><div><span>R&amp;D investment</span><b>-${decisions.rdBudget.toLocaleString()}</b></div><div><span>Marketing investment</span><b>-${decisions.marketingBudget.toLocaleString()}</b></div><div><span>Capacity investment</span><b>-${(productionPlan.fixedCapacityIncrease * 22000).toLocaleString()}</b></div><div className={projectedEndingCash >= 1 ? 'positive' : 'negative'}><span>Projected ending cash</span><b>${projectedEndingCash.toLocaleString()}</b></div></div></section>
                </div>
                <section className="rationale-panel"><div><h4>Explain the financing decision</h4><p>Why is this mix of equity and debt appropriate for the risk and timing of the growth plan?</p></div><textarea value={decisionRationales.finance} onChange={event => setDecisionRationales({ ...decisionRationales, finance: event.target.value })} placeholder="Funding need → financing choice → ownership/risk trade-off → contingency"/><span>{decisionRationales.finance.trim().length}/20 minimum characters</span></section>
              </div>
            )}

            {/* VIEW: Cross-functional decision summary */}
            {activeMenu === 'summary-decisions' && (
              <div className="manual-decision-view">
                <div className="manual-view-intro"><div><span><ClipboardCheck size={16}/> Tactical plan</span><h3>Summary of Decisions</h3><p>Use this cross-functional view to check that the market promise, demand forecast, production plan, and financing plan tell the same story.</p></div><button className="manual-primary-button" onClick={() => setActiveMenu('final-check')}>Run Final Check <ArrowUpRight size={15}/></button></div>
                <section className="manual-panel"><table className="replica-table"><thead><tr><th>Decision area</th><th>Current plan</th><th>Learning evidence</th><th>Status</th></tr></thead><tbody>{[
                  ['Brand', `${offerName}; ${decisions.targetSegment}; $${decisions.pricing}`, decisionRationales.brand],
                  ['Marketing', `${marketingPlan.claims.length} claims; ${marketingPlan.localFrequency + marketingPlan.regionalFrequency} insertions; $${marketingPlan.rebate} rebate`, decisionRationales.marketing],
                  ['Manufacturing', `${totalDemandForecast} forecast; ${quarterlyCapacity} capacity; ${productionPlan.maxInventoryPerBrand} max inventory`, decisionRationales.manufacturing],
                  ['Finance', `$${financePlan.equityRequest.toLocaleString()} equity; $${financePlan.conventionalLoan.toLocaleString()} debt`, decisionRationales.finance]
                ].map(([area, plan, rationale]) => <tr key={area}><td><b>{area}</b></td><td>{plan}</td><td>{rationale || 'Rationale not yet recorded'}</td><td><span className={`summary-status ${rationale && rationale.length >= 20 ? 'ready' : 'draft'}`}>{rationale && rationale.length >= 20 ? 'Ready' : 'Explain'}</span></td></tr>)}</tbody></table></section>
                <section className="rationale-panel"><div><h4>Explain the brand decision</h4><p>Connect the selected segment, customer benefits, components, and price.</p></div><textarea value={decisionRationales.brand} onChange={event => setDecisionRationales({ ...decisionRationales, brand: event.target.value })} placeholder="Target need → feature evidence → price logic → risk"/><span>{decisionRationales.brand.trim().length}/20 minimum characters</span></section>
              </div>
            )}
            
            {/* VIEW: Market Share */}
            {activeMenu === 'market-share' && (
              <div>
                {/* Donut and breakdown charts matching screenshot 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                  
                  {/* Market Share Overview Card */}
                  <div className="chart-card">
                    <h3 className="chart-title">Mercedes Segment Market Share</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px', justifyContent: 'center', padding: '20px' }}>
                      {/* Donut Ring Mock SVG */}
                      <svg width="150" height="150" viewBox="0 0 42 42" className="donut">
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#E2E8F0" strokeWidth="6"></circle>
                        {/* Mirai (You) - 77% */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--accent-blue)" strokeWidth="6" strokeDasharray="77 23" strokeDashoffset="25"></circle>
                        {/* NEXA Technology - 23% */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--accent-red)" strokeWidth="6" strokeDasharray="23 77" strokeDashoffset="48"></circle>
                      </svg>

                      <div className="donut-legend">
                        <div className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: 'var(--accent-blue)' }} />
                          <span style={{ fontWeight: 600 }}>Mirai (You): 77%</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: 'var(--accent-red)' }} />
                          <span style={{ fontWeight: 600 }}>NEXA Tech: 23%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3 className="chart-title">Workhorse Segment Market Share</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px', justifyContent: 'center', padding: '20px' }}>
                      <svg width="150" height="150" viewBox="0 0 42 42" className="donut">
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#E2E8F0" strokeWidth="6"></circle>
                        {/* Mirai - 17% */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--accent-blue)" strokeWidth="6" strokeDasharray="17 83" strokeDashoffset="25"></circle>
                        {/* Texvo - 25% */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--accent-red)" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="42"></circle>
                        {/* Others - 58% */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#718096" strokeWidth="6" strokeDasharray="58 42" strokeDashoffset="67"></circle>
                      </svg>
                      <div className="donut-legend">
                        <div className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: 'var(--accent-blue)' }} />
                          <span style={{ fontWeight: 600 }}>Mirai (You): 17%</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: 'var(--accent-red)' }} />
                          <span style={{ fontWeight: 600 }}>Texvo Corp: 25%</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: '#718096' }} />
                          <span style={{ fontWeight: 600 }}>Others: 58%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Segment Share Details list */}
                <div className="replica-table-wrapper" style={{ marginTop: '20px' }}>
                  <table className="replica-table">
                    <thead>
                      <tr>
                        <th>Customer Segment</th>
                        <th>Competitor Share Breakdown</th>
                        <th>Our Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Costcutter</td>
                        <td>Texvo (35%), NEXA (25%), Xyra (40%)</td>
                        <td>N/A</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Innovator</td>
                        <td>VIRTECH (55%), LusoByte (45%)</td>
                        <td>N/A</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Mercedes</td>
                        <td>Mirai (77%), NEXA Technology (23%)</td>
                        <td style={{ color: 'green', fontWeight: 700 }}>1st</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Workhorse</td>
                        <td>Texvo (25%), Mirai (17%), Others (58%)</td>
                        <td style={{ fontWeight: 600 }}>2nd</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Traveler</td>
                        <td>LusoByte (50%), JIM & JP (50%)</td>
                        <td>N/A</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW: Sales */}
            {activeMenu === 'sales' && (
              <div className="report-view">
                <div className="report-intro"><div><span>Results of the previous quarter</span><h3>Sales by brand</h3><p>Review demand, stock-outs, revenue, and gross margin before changing your next-round plan.</p></div>{decisionCoachButton('Sales report')}</div>
                <div className="replica-table-wrapper"><table className="replica-table"><thead><tr><th>Brand</th><th>Net demand</th><th>Units sold</th><th>Lost sales</th><th>Sales revenue</th><th>Gross margin</th></tr></thead><tbody><tr><td>Mirai Core</td><td>430</td><td>430</td><td>0</td><td>$1,161,000</td><td>$401,641</td></tr><tr><td>Mirai Nomad</td><td>367</td><td>344</td><td>23</td><td>$1,135,200</td><td>$538,652</td></tr><tr className="report-total"><td>Total</td><td>797</td><td>774</td><td>23</td><td>$2,296,200</td><td>$940,293</td></tr></tbody></table></div>
                <div className="report-callout"><b>Decision signal:</b> Nomad lost 23 sales to stock-outs. Before expanding production, compare its margin with the cash and capacity required to serve that extra demand.</div>
              </div>
            )}

            {/* VIEW: Financial and scorecard reports */}
            {financialReports[activeMenu] && (
              <div className="report-view">
                <div className="report-intro"><div><span>Results of previous quarters</span><h3>{financialReports[activeMenu].heading}</h3><p>{financialReports[activeMenu].description}</p></div>{decisionCoachButton(financialReports[activeMenu].context)}</div>
                <div className="replica-table-wrapper"><table className="replica-table report-statement"><thead><tr><th>Line item</th>{financialReports[activeMenu].columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{financialReports[activeMenu].rows.map((row, index) => <tr key={row[0]} className={index === 2 || index === 5 ? 'report-total' : ''}><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td></tr>)}</tbody></table></div>
                {activeMenu === 'balanced-scorecard' && <div className="report-callout"><b>Balanced view:</b> Strong market and future-readiness signals do not offset weak financial performance. Use the coach to identify which lever best protects the next quarter.</div>}
              </div>
            )}

            {/* VIEW: Detailed demand */}
            {activeMenu === 'detailed-demand' && (
              <div className="report-view"><div className="report-intro"><div><span>Results of the previous quarter</span><h3>Demand by brand and segment</h3><p>Use detailed demand to check whether each brand is reaching the segments it was designed to serve.</p></div>{decisionCoachButton('Detailed Brand Demand Report')}</div><div className="replica-table-wrapper"><table className="replica-table"><thead><tr><th>Brand (company)</th><th>Costcutter</th><th>Innovator</th><th>Mercedes</th><th>Workhorse</th><th>Traveler</th><th>Total</th></tr></thead><tbody><tr><td>Mirai Core (Mirai)</td><td>31</td><td>49</td><td>5</td><td>344</td><td>1</td><td>430</td></tr><tr><td>Mirai Nomad (Mirai)</td><td>0</td><td>24</td><td>0</td><td>9</td><td>334</td><td>367</td></tr><tr><td>Vector X1 (VIRTECH)</td><td>1</td><td>165</td><td>17</td><td>75</td><td>0</td><td>258</td></tr><tr><td>LB GO (LusoByte)</td><td>0</td><td>1</td><td>0</td><td>0</td><td>72</td><td>73</td></tr></tbody></table></div></div>
            )}

            {/* VIEW: Strategic graphs */}
            {activeMenu === 'strategic-graphs' && (
              <div className="report-view"><div className="report-intro"><div><span>Quarterly trend analysis</span><h3>Strategic graphs</h3><p>Compare trajectory, not just the latest result. Select a graph and ask the coach what assumption to test.</p></div>{decisionCoachButton('Strategic Graphs')}</div><div className="trend-grid">{[['Cash', [8, 12, 10, 88]], ['Net income', [60, 52, 31, 18]], ['Market demand', [16, 34, 53, 76]], ['Stakeholder impact', [52, 58, 63, impactScore]]].map(([label, points]) => <div className="trend-card" key={String(label)}><h4>{String(label)}</h4><div className="trend-chart">{(points as number[]).map((point, index) => <i key={index} style={{ height: `${point}%` }}><span>Q{index}</span></i>)}</div></div>)}</div></div>
            )}

            {/* VIEW: Competitors' Profiles */}
            {activeMenu === 'competitors-profiles' && (
              <div className="replica-table-wrapper">
                <table className="replica-table">
                  <thead>
                    <tr>
                      <th>Metric Name</th>
                      <th>Texvo</th>
                      <th>LusoByte</th>
                      <th>VIRTECH</th>
                      <th>NEXA Tech</th>
                      <th>Xyra</th>
                      <th>JIM & JP</th>
                      <th style={{ backgroundColor: '#D9E2EC', color: 'var(--accent-blue)' }}>Mirai (You)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Balanced Scorecard</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>6</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Total Demand (Units)</td>
                      <td>427</td>
                      <td>137</td>
                      <td>424</td>
                      <td>183</td>
                      <td>165</td>
                      <td>398</td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>797</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Number of Brands for Sale</td>
                      <td>2</td>
                      <td>2</td>
                      <td>2</td>
                      <td>2</td>
                      <td>2</td>
                      <td>2</td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>2</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Average Price ($)</td>
                      <td>2,753</td>
                      <td>3,357</td>
                      <td>2,975</td>
                      <td>3,074</td>
                      <td>3,253</td>
                      <td>2,900</td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>3,000</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Highest Rated Brand (Innovator)</td>
                      <td>N/A</td>
                      <td>N/A</td>
                      <td style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>73 (Vector X1)</td>
                      <td>N/A</td>
                      <td>N/A</td>
                      <td>N/A</td>
                      <td>N/A</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Highest Rated Brand (Mercedes)</td>
                      <td>N/A</td>
                      <td>N/A</td>
                      <td>N/A</td>
                      <td>65 (NEX-M1)</td>
                      <td>N/A</td>
                      <td>N/A</td>
                      <td style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>82 (Mirai-Prime)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* VIEW: Hire Sales People */}
            {activeMenu === 'hire-sales' && (
              <div>
                {/* specialized APAC grid matching Screenshot 5 */}
                <div style={{ backgroundColor: 'white', border: '1px solid var(--workspace-border)', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--workspace-text-dark)', marginBottom: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                    APAC Sales Operations
                  </h3>
                  
                  <div className="replica-table-wrapper" style={{ margin: 0 }}>
                    <table className="replica-table">
                      <thead>
                        <tr>
                          <th>City</th>
                          <th>Annual Salary</th>
                          <th>Support</th>
                          <th>Costcutter</th>
                          <th>Innovator</th>
                          <th>Mercedes</th>
                          <th>Workhorse</th>
                          <th>Traveler</th>
                          <th style={{ color: 'var(--accent-blue)' }}>Total Sales Reps</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(['tokyo', 'sydney'] as const).map(city => {
                          const data = decisions.salesForce[city];
                          const total = Object.values(data).reduce((a, b) => a + b, 0);
                          const salary = city === 'tokyo' ? 73000 : 70000;
                          return (
                            <tr key={city}>
                              <td style={{ fontWeight: 700, textTransform: 'capitalize' }}>{city}</td>
                              <td style={{ fontWeight: 600 }}>${salary.toLocaleString()}</td>
                              {(Object.keys(data) as Array<keyof typeof data>).map(seg => (
                                <td key={seg}>
                                  <input 
                                    type="number"
                                    min="0"
                                    max="20"
                                    className="replica-input"
                                    value={data[seg]}
                                    onChange={(e) => handleSalesForceChange(city, seg, Number(e.target.value))}
                                  />
                                </td>
                              ))}
                              <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{total}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>Total APAC Hired Reps:</span>
                      <span style={{ fontWeight: 700 }}>
                        {Object.values(decisions.salesForce.tokyo).reduce((a,b)=>a+b, 0) + Object.values(decisions.salesForce.sydney).reduce((a,b)=>a+b, 0)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>Total APAC Payroll Cost:</span>
                      <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>
                        ${(
                          (Object.values(decisions.salesForce.tokyo).reduce((a,b)=>a+b, 0) * 73000) +
                          (Object.values(decisions.salesForce.sydney).reduce((a,b)=>a+b, 0) * 70000)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-replica-blue" onClick={() => alert("Decisions Saved.")}>Save</button>
                  <button className="btn-replica-grey" onClick={() => setDecisions(DEFAULT_DECISIONS)}>Cancel</button>
                </div>
              </div>
            )}

            {/* VIEW: Expand the Market Offering (Brand Management) */}
            {activeMenu === 'brand-offering' && (
              <div className="offering-workspace">
                <section className="offering-hero">
                  <div>
                    <span className="offering-eyebrow"><TrendingUp size={15} /> Brand management studio</span>
                    <h3>Expand the Market Offering</h3>
                    <p>Translate customer evidence into a focused new offer. Choose a positioning direction, assemble the product, then test whether its price and target segment make sense together.</p>
                  </div>
                  <div className="offering-hero-actions">
                    {decisionCoachButton('Market Offering and brand expansion')}
                    <span>Coach sessions guide your reasoning; they do not select the offer for you.</span>
                  </div>
                </section>

                <section className="offering-steps" aria-label="Offer development steps">
                  <div className="offering-step complete"><CheckCircle2 size={18} /><span>1. Read the market</span><small>Segment needs</small></div>
                  <div className="offering-step active"><span>2</span><div><strong>Build the offer</strong><small>Components &amp; position</small></div></div>
                  <div className="offering-step"><span>3</span><div><strong>Test the economics</strong><small>Price &amp; margin</small></div></div>
                  <div className="offering-step"><span>4</span><div><strong>Commit the plan</strong><small>Apply to decisions</small></div></div>
                </section>

                <div className="offering-layout">
                  <div className="offering-main">
                    <section className="offering-card">
                      <div className="offering-card-heading">
                        <div><span className="section-kicker">Offer identity</span><h4>Name the offer and choose its strategic direction</h4></div>
                        <span className="research-pill">R&amp;D budget: ${decisions.rdBudget.toLocaleString()}</span>
                      </div>
                      <div className="offer-identity-row">
                        <label>Offer name<input className="replica-input" value={offerName} onChange={(event) => { setOfferName(event.target.value); setOfferSaved(false); }} /></label>
                        <div className="offer-fit-summary"><span>Current offer fit</span><strong>{offerFit}%</strong><div><i style={{ width: `${offerFit}%` }} /></div></div>
                      </div>
                      <div className="offer-direction-grid">
                        {offerDirections.map(direction => (
                          <button key={direction.id} type="button" onClick={() => { setOfferDirection(direction.id); setOfferSaved(false); }} className={`offer-direction ${offerDirection === direction.id ? 'selected' : ''}`} style={{ '--direction-color': direction.color } as React.CSSProperties}>
                            <strong>{direction.title}</strong>
                            <span>{direction.description}</span>
                            <small>Best fit: {direction.segment}</small>
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="offering-card">
                      <div className="offering-card-heading">
                        <div><span className="section-kicker">Product architecture</span><h4>Choose the components that make the promise believable</h4></div>
                        <span className="feature-count">{selectedOfferFeatures.length} selected</span>
                      </div>
                      <p className="offering-guidance">For <strong>{activeOfferDirection.title.toLowerCase()}</strong>, the strongest starting signals are {activeOfferDirection.features.join(' and ')}. Add components only when they reinforce the customer promise.</p>
                      <div className="offering-feature-grid">
                        {offeringFeatures.map(feature => {
                          const selected = decisions.rdFeatures.includes(feature.name);
                          const recommended = (activeOfferDirection.features as readonly string[]).includes(feature.name);
                          return (
                            <button key={feature.name} type="button" className={`offering-feature ${selected ? 'selected' : ''} ${recommended ? 'recommended' : ''}`} onClick={() => { toggleRdFeature(feature.name); setOfferSaved(false); }}>
                              <span className="feature-check">{selected ? <CheckCircle2 size={17} /> : '+'}</span>
                              <span className="feature-copy"><strong>{feature.name}</strong><small>{feature.note}</small><em>{feature.tags.join(' · ')}</em></span>
                              <b>+${feature.cost}</b>
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    <section className="offering-card economics-card">
                      <div className="offering-card-heading"><div><span className="section-kicker">Commercial hypothesis</span><h4>Connect the product promise to its market plan</h4></div><BadgeDollarSign size={22} /></div>
                      <div className="offer-economics-grid">
                        <label>Target segment<select className="replica-input" value={decisions.targetSegment} onChange={(event) => { setDecisions({ ...decisions, targetSegment: event.target.value as SimulationDecisions['targetSegment'] }); setOfferSaved(false); }}><option value="Mercedes">Mercedes</option><option value="Workhorse">Workhorse</option><option value="Costcutter">Costcutter</option><option value="Innovator">Innovator</option><option value="Traveler">Traveler</option></select></label>
                        <label>Planned price<input type="number" className="replica-input" value={decisions.pricing} min="0" onChange={(event) => { setDecisions({ ...decisions, pricing: Number(event.target.value) }); setOfferSaved(false); }} /></label>
                        <label>R&amp;D commitment<input type="number" className="replica-input" value={decisions.rdBudget} min="0" step="50000" onChange={(event) => { setDecisions({ ...decisions, rdBudget: Number(event.target.value) }); setOfferSaved(false); }} /></label>
                      </div>
                      <div className="offer-decision-note"><Factory size={18} /><span>Before expanding this offer, check whether its component cost, planned volume, and available capacity can support the promise you are making.</span></div>
                    </section>
                  </div>

                  <aside className="offer-preview-panel">
                    <div className="offer-preview-heading"><span className="section-kicker">Decision preview</span><h4>{offerName || 'Untitled offer'}</h4><p>{activeOfferDirection.title} for the {decisions.targetSegment} segment</p></div>
                    <div className="offer-preview-score"><span>Positioning fit</span><strong>{offerFit}<small>/100</small></strong><div><i style={{ width: `${offerFit}%` }} /></div></div>
                    <div className="offer-preview-metrics"><div><span>Design cost / unit</span><b>${offerComponentCost}</b></div><div><span>Planned price</span><b>${decisions.pricing}</b></div><div><span>Recommended signals used</span><b>{recommendedFeaturesSelected}/{activeOfferDirection.features.length}</b></div></div>
                    <div className="offer-evidence"><h5>Market evidence to test</h5><p>{decisions.targetSegment === activeOfferDirection.segment ? 'Your target segment matches this positioning direction.' : `This direction typically fits ${activeOfferDirection.segment}. Explain why ${decisions.targetSegment} is the better choice, or align the target.`}</p><p>{selectedOfferFeatures.length < 2 ? 'The offer has few visible proof points. Consider whether a customer can recognise its promise.' : 'You have enough components to articulate a clear customer promise. Avoid adding features that dilute it.'}</p></div>
                    <button type="button" className="apply-offer-button" onClick={() => { setDecisions(current => ({ ...current, targetSegment: activeOfferDirection.segment })); setOfferSaved(true); }}>Apply recommended segment <ArrowUpRight size={16} /></button>
                    {offerSaved && <div className="offer-saved"><CheckCircle2 size={16} /> Offer strategy saved to this quarter&apos;s decisions.</div>}
                  </aside>
                </div>
              </div>
            )}

            {/* VIEW: Brand Packaging Evaluator */}
            {activeMenu === 'packaging-eval' && (
              <div style={{ backgroundColor: 'white', border: '1px solid var(--workspace-border)', borderRadius: '4px', padding: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--workspace-text-dark)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px', marginBottom: '16px' }}>
                  AI Brand Packaging & Brochure Evaluator
                </h3>

                <p style={{ fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '20px', color: '#4A5568' }}>
                  Upload your marketing media (such as your Brand Brochure draft, advertisement mockup, or box packaging layout). The AI system scans segment alignment, layout contrast, and visual hierarchy.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
                  {/* Left Column: Config & Upload dropzone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Brand Name</label>
                      <input 
                        type="text" 
                        className="replica-input" 
                        value={evalBrandName}
                        onChange={(e) => setEvalBrandName(e.target.value)}
                        style={{ width: '100%', textAlign: 'left' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Target Segment</label>
                      <select 
                        className="replica-input" 
                        value={evalSegment}
                        onChange={(e) => setEvalSegment(e.target.value)}
                        style={{ width: '100%', textAlign: 'left' }}
                      >
                        <option value="Mercedes">Mercedes (Luxury)</option>
                        <option value="Workhorse">Workhorse (Value)</option>
                        <option value="Costcutter">Costcutter (Low-Cost)</option>
                        <option value="Innovator">Innovator (Technology)</option>
                        <option value="Traveler">Traveler (Design)</option>
                      </select>
                    </div>

                    {/* Dropzone */}
                    <div 
                      style={{ 
                        border: '2px dashed var(--workspace-border)', 
                        borderRadius: '6px', 
                        padding: '24px 16px', 
                        textAlign: 'center', 
                        backgroundColor: '#F8FAFC', 
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                        onChange={handleMockUpload}
                      />
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📂</div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--workspace-text-dark)' }}>
                        {uploadedFileName ? 'Change Design File' : 'Choose Design File'}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#7A8C9E' }}>
                        Drag & drop or click to upload brochure PDF or JPG packaging
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                          <span>Uploading design...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--accent-blue)', transition: 'width 0.15s ease' }} />
                        </div>
                      </div>
                    )}

                    {uploadedFileName && !isUploading && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#EDF2F7', padding: '10px', borderRadius: '4px', border: '1px solid var(--workspace-border)' }}>
                        <span style={{ fontSize: '1.2rem' }}>📄</span>
                        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{uploadedFileName}</div>
                          <span style={{ fontSize: '0.7rem', color: '#7A8C9E' }}>{uploadedFileSize} KB</span>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={handleEvaluatePackaging}
                      disabled={!uploadedFileName || isUploading || evaluating}
                      className="btn-replica-blue"
                      style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', backgroundColor: 'var(--accent-red)' }}
                    >
                      {evaluating ? 'Analyzing Layout...' : 'Evaluate Packaging (200 Credits)'}
                    </button>
                  </div>

                  {/* Right Column: Score Report */}
                  <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '24px' }}>
                    {evaluating && (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                        <div className="thinking-bubble">
                          <div className="thinking-dot" />
                          <div className="thinking-dot" />
                          <div className="thinking-dot" />
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#7A8C9E', marginTop: '12px' }}>
                          AI scanning packaging visuals and layout contrast...
                        </span>
                      </div>
                    )}

                    {!evaluating && !evaluationResult && (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#7A8C9E', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
                        <div style={{ fontWeight: 600 }}>No active evaluation report</div>
                        <span style={{ fontSize: '0.75rem', maxWidth: '280px', marginTop: '4px' }}>
                          Upload your design file and trigger evaluation to view scores.
                        </span>
                      </div>
                    )}

                    {!evaluating && evaluationResult && (
                      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        {/* Overall Score */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '4px', border: '1px solid var(--workspace-border)' }}>
                          <div 
                            style={{ 
                              width: '64px', 
                              height: '64px', 
                              borderRadius: '50%', 
                              border: '4px solid var(--accent-blue)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontWeight: 700, 
                              fontSize: '1.25rem',
                              color: 'var(--accent-blue)'
                            }}
                          >
                            {evaluationResult.overallScore}
                          </div>
                          <div>
                            <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Brand Packaging Score</h4>
                            <span style={{ fontSize: '0.75rem', color: '#7A8C9E' }}>
                              Overall alignment for segment {evalSegment}
                            </span>
                          </div>
                        </div>

                        {/* Breakdown Metrics */}
                        <div>
                          <h5 style={{ fontWeight: 700, fontSize: '0.8rem', color: '#4A5568', marginBottom: '8px' }}>Metric Breakdown</h5>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                              <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                                <span>Visual Appeal & Hierarchy</span>
                                <span style={{ fontWeight: 600 }}>{evaluationResult.visualAppeal}%</span>
                              </div>
                              <div style={{ width: '100%', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px' }}>
                                <div style={{ width: `${evaluationResult.visualAppeal}%`, height: '100%', backgroundColor: 'var(--accent-blue)' }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                                <span>Segment Alignment</span>
                                <span style={{ fontWeight: 600 }}>{evaluationResult.segmentAlignment}%</span>
                              </div>
                              <div style={{ width: '100%', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px' }}>
                                <div style={{ width: `${evaluationResult.segmentAlignment}%`, height: '100%', backgroundColor: 'green' }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                                <span>Information Clarity</span>
                                <span style={{ fontWeight: 600 }}>{evaluationResult.clarity}%</span>
                              </div>
                              <div style={{ width: '100%', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px' }}>
                                <div style={{ width: `${evaluationResult.clarity}%`, height: '100%', backgroundColor: 'var(--accent-gold)' }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                                <span>Call-to-Action</span>
                                <span style={{ fontWeight: 600 }}>{evaluationResult.ctaPerformance}%</span>
                              </div>
                              <div style={{ width: '100%', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px' }}>
                                <div style={{ width: `${evaluationResult.ctaPerformance}%`, height: '100%', backgroundColor: 'purple' }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Critiques */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                          <div style={{ padding: '8px', backgroundColor: 'rgba(236,72,153,0.05)', borderRadius: '4px', borderLeft: '3px solid var(--accent-pink)' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--accent-pink)' }}>CMO Review (Marcus Cole)</div>
                            <p style={{ fontSize: '0.8rem', marginTop: '4px', lineHeight: '1.4' }}>{evaluationResult.feedbackCMO}</p>
                          </div>
                          
                          <div style={{ padding: '8px', backgroundColor: 'rgba(59,130,246,0.05)', borderRadius: '4px', borderLeft: '3px solid var(--accent-blue)' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--accent-blue)' }}>CEO Review (Alexander Vance)</div>
                            <p style={{ fontSize: '0.8rem', marginTop: '4px', lineHeight: '1.4' }}>{evaluationResult.feedbackCEO}</p>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: CONSCIOUS CAPITALISM STAKEHOLDER IMPACT HUB */}
            {activeMenu === 'impact-hub' && (
              <div className="impact-hub">
                <section className="impact-hero">
                  <div>
                    <div className="impact-kicker"><Leaf size={16} /> Conscious Capitalism simulation</div>
                    <h2>Build a profitable business that creates value for every stakeholder.</h2>
                    <p>Plan the trade-offs across customer safety, employee wellbeing, community value, environmental impact, and financial resilience before you submit Quarter 4.</p>
                  </div>
                  <div className="impact-score" aria-label={`Stakeholder impact score ${impactScore} out of 100`}>
                    <span>Stakeholder impact</span><strong>{impactScore}</strong><small>/100</small><em>Balanced, with room to grow</em>
                  </div>
                </section>

                <section className="impact-toolbar">
                  <div><Sparkles size={17} /><span><b>Learning pathway</b> Choose the level of challenge for this course.</span></div>
                  <select value={learningLevel} onChange={(e) => setLearningLevel(e.target.value as typeof learningLevel)} aria-label="Learning pathway level">
                    <option value="foundation">Foundation — guided choices</option>
                    <option value="applied">Applied — linked trade-offs</option>
                    <option value="advanced">Advanced — executive accountability</option>
                  </select>
                </section>

                <section className="impact-metrics" aria-label="Stakeholder performance indicators">
                  {stakeholderMetrics.map(({ key, label, value, icon: Icon, color, note }) => (
                    <article className="impact-metric" key={key}>
                      <div className="impact-icon" style={{ color, backgroundColor: `${color}18` }}><Icon size={19} /></div>
                      <div><span>{label}</span><strong>{value}<small>/100</small></strong><em>{note}</em></div>
                    </article>
                  ))}
                </section>

                <section className="impact-grid">
                  <article className="impact-card impact-plan-card">
                    <div className="impact-card-title"><div><Scale size={18} /><h3>Stakeholder action planner</h3></div><span>Adjust the plan</span></div>
                    <p className="impact-card-copy">Your choices model a real management tension: stronger safeguards and stakeholder investment can protect long-term value while constraining the current quarter&apos;s cash.</p>
                    {stakeholderMetrics.map(({ key, label, value, color, note }) => (
                      <label className="impact-slider-row" key={key}>
                        <div><span>{label}</span><b>{value}</b></div>
                        <input type="range" min="20" max="100" step="1" value={value} onChange={(e) => setImpactPlan(plan => ({ ...plan, [key]: Number(e.target.value) }))} style={{ accentColor: color }} aria-label={label} />
                        <small>{note}</small>
                      </label>
                    ))}
                    <div className="impact-tradeoff"><span>Quarterly investment envelope</span><b>${((impactPlan.people + impactPlan.planet + impactPlan.community + impactPlan.governance) * 8500).toLocaleString()}</b><em>Estimated capacity for stakeholder initiatives</em></div>
                  </article>

                  <article className="impact-card impact-insight-card">
                    <div className="impact-card-title"><div><ShieldCheck size={18} /><h3>Materiality signals</h3></div><span>Quarter 4</span></div>
                    <div className="impact-signal good"><span>Opportunity</span><p>High governance readiness supports transparent product-safety and customer-trust decisions.</p></div>
                    <div className="impact-signal watch"><span>Watch closely</span><p>Community value is the lowest signal. Consider how access, local employment, or partner impact changes with your growth plan.</p></div>
                    <div className="impact-signal neutral"><span>Financial connection</span><p>Current marketing budget: <b>${decisions.marketingBudget.toLocaleString()}</b>. Use the Socratic review to make the trade-off explicit rather than optimizing a single score.</p></div>
                    <button className="impact-link-button" onClick={() => setActiveMenu('boardroom-intro')}>Open Socratic Impact Review <ArrowUpRight size={15} /></button>
                  </article>
                </section>

                <section className="impact-card impact-path-card">
                  <div><span className="impact-kicker dark">How this level works</span><h3>{learningLevel === 'foundation' ? 'Guided choices build stakeholder awareness.' : learningLevel === 'applied' ? 'Linked choices expose business trade-offs.' : 'Executive accountability tests long-term judgment.'}</h3><p>{learningLevel === 'foundation' ? 'Students receive short, plain-language prompts and reflect on one stakeholder consequence.' : learningLevel === 'applied' ? 'Students connect two stakeholder effects to their tactical plan and explain one trade-off.' : 'Students defend a material decision with evidence, alternatives, risk, and measurable commitments.'}</p></div>
                  <div className="impact-path-steps"><span>1. Decide</span><ChevronRight size={14}/><span>2. Explain</span><ChevronRight size={14}/><span>3. See outcomes</span><ChevronRight size={14}/><span>4. Improve</span></div>
                </section>
              </div>
            )}

            {/* VIEW: Final Check Strategic Oral Defense */}
            {activeMenu === 'final-check' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                <section className="final-audit-panel" style={{ gridColumn: '1 / -1' }}>
                  <div className="final-audit-heading">
                    <div><span><ClipboardCheck size={17}/> Manual-based decision audit</span><h3>{finalChecksPassed} of {finalCheckItems.length} checks passed</h3><p>These checks combine the guide&apos;s Quarter 4 constraints with cross-functional plan consistency.</p></div>
                    <div className={`final-audit-score ${finalChecksPassed === finalCheckItems.length ? 'ready' : ''}`}>{Math.round(finalChecksPassed / finalCheckItems.length * 100)}<small>%</small></div>
                  </div>
                  <div className="final-check-grid">
                    {finalCheckItems.map(item => <article key={item.label} className={item.pass ? 'pass' : 'fail'}>{item.pass ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}<div><strong>{item.label}</strong><span>{item.detail}</span></div></article>)}
                  </div>
                  {finalChecksPassed < finalCheckItems.length && <div className="final-audit-warning"><AlertTriangle size={17}/> Resolve failed checks before submitting. The oral defense can still be practiced while the plan is incomplete.</div>}
                </section>
                
                {/* Column 1: Key Decisions & Dynamic Questions */}
                <div style={{ backgroundColor: 'white', border: '1px solid var(--workspace-border)', borderRadius: '4px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ color: 'var(--workspace-text-dark)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                      Key Decisions Summary
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: '#7A8C9E' }}>Target Segment:</span>
                        <div style={{ fontWeight: 600, color: 'var(--workspace-text-dark)' }}>{decisions.targetSegment}</div>
                      </div>
                      <div>
                        <span style={{ color: '#7A8C9E' }}>Product Pricing:</span>
                        <div style={{ fontWeight: 600, color: 'var(--workspace-text-dark)' }}>${decisions.pricing}</div>
                      </div>
                      <div>
                        <span style={{ color: '#7A8C9E' }}>Production Volume:</span>
                        <div style={{ fontWeight: 600, color: 'var(--workspace-text-dark)' }}>{decisions.productionVolume.toLocaleString()} units</div>
                      </div>
                      <div>
                        <span style={{ color: '#7A8C9E' }}>Marketing Budget:</span>
                        <div style={{ fontWeight: 600, color: 'var(--workspace-text-dark)' }}>${decisions.marketingBudget.toLocaleString()}</div>
                      </div>
                      <div>
                        <span style={{ color: '#7A8C9E' }}>R&D Features:</span>
                        <div style={{ fontWeight: 600, color: 'var(--workspace-text-dark)', fontSize: '0.75rem' }}>
                          {decisions.rdFeatures.join(', ') || 'None selected'}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: '#7A8C9E' }}>Loan Requested:</span>
                        <div style={{ fontWeight: 600, color: 'var(--workspace-text-dark)' }}>${decisions.loanRequested.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ color: 'var(--workspace-text-dark)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                      Oral Defense Challenge Questions
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#556B82', marginBottom: '10px', lineHeight: '1.4' }}>
                      Analyze the decisions above. Defend your round entries against these AI-generated business dilemmas:
                    </p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px', fontSize: '0.8rem', color: '#1E293B', lineHeight: '1.4', margin: 0 }}>
                      {generateOralQuestions(decisions).map((q, idx) => (
                        <li key={idx} style={{ listStyleType: 'decimal' }}>
                          <span style={{ fontWeight: 600 }}>{q.split('?')[0]}?</span>{q.split('?')[1]}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Column 2: Audio Recorder & Assessment Reports */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Card: Recording Deck */}
                  <div style={{ backgroundColor: 'white', border: '1px solid var(--workspace-border)', borderRadius: '4px', padding: '20px', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--workspace-text-dark)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '16px', textAlign: 'left' }}>
                      Record Oral Defense
                    </h3>
                    
                    {!recordingSubmitted ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px 0' }}>
                        <div 
                          className={`flex-center ${isRecording ? 'recording-pulse' : ''}`}
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            backgroundColor: isRecording ? '#EF4444' : '#EBF1F5',
                            color: isRecording ? 'white' : '#4A5A6A',
                            cursor: 'pointer',
                            boxShadow: isRecording ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none',
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => setIsRecording(!isRecording)}
                        >
                          <Mic size={28} />
                        </div>

                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--workspace-text-dark)' }}>
                            {isRecording ? 'RECORDING VOICE DEFENSE' : 'READY TO RECORD'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#7A8C9E', marginTop: '2px' }}>
                            {isRecording ? `Duration: ${recordSeconds} seconds` : 'Click microphone icon to begin recording'}
                          </div>
                        </div>

                        {/* Waveform visual simulation */}
                        {isRecording && (
                          <div className="flex-center" style={{ gap: '3px', height: '24px', width: '100%' }}>
                            <div className="bar-wave" style={{ animationDelay: '0.1s' }} />
                            <div className="bar-wave" style={{ animationDelay: '0.3s' }} />
                            <div className="bar-wave" style={{ animationDelay: '0.5s' }} />
                            <div className="bar-wave" style={{ animationDelay: '0.2s' }} />
                            <div className="bar-wave" style={{ animationDelay: '0.4s' }} />
                          </div>
                        )}

                        <button
                          onClick={handleEvaluateDefense}
                          disabled={isRecording || recordSeconds === 0}
                          className="btn-replica-blue"
                          style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: (recordSeconds > 0 && !isRecording) ? 'var(--accent-red)' : '#7A8C9E',
                            color: 'white',
                            fontSize: '0.85rem'
                          }}
                        >
                          Stop & Evaluate Strategy (150 Credits)
                        </button>
                      </div>
                    ) : (
                      <div style={{ padding: '10px 0', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎙️</div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--workspace-text-dark)' }}>Defense Recording Submitted</h4>
                        <p style={{ fontSize: '0.75rem', color: '#7A8C9E', marginTop: '2px', marginBottom: '16px' }}>
                          Voice payload successfully transmitted to Socratic evaluator.
                        </p>
                        <button 
                          onClick={handleResetDefense} 
                          className="btn-replica-blue" 
                          style={{ padding: '6px 16px', fontSize: '0.75rem', backgroundColor: '#E3E8EE', color: '#4A5A6A', border: '1px solid var(--workspace-border)' }}
                        >
                          Record New Attempt
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card: AI Scoring Assessment */}
                  {recordingSubmitted && (
                    <div style={{ backgroundColor: 'white', border: '1px solid var(--workspace-border)', borderRadius: '4px', padding: '20px' }}>
                      <h3 style={{ color: 'var(--workspace-text-dark)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                        AI Oral Assessment Report
                      </h3>

                      {defenseEvaluating ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 0' }}>
                          <div className="loading-spinner" />
                          <span style={{ fontSize: '0.8rem', color: '#7A8C9E' }}>Evaluating voice structure & criteria weights...</span>
                        </div>
                      ) : defenseResult && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          
                          {/* Overall Score */}
                          <div className="flex-center" style={{ gap: '16px', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '4px' }}>
                            <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '50%', border: '4px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--accent-blue)', fontSize: '1.1rem' }}>
                              {defenseResult.overallScore}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--workspace-text-dark)' }}>Strategic Defense Score</div>
                              <span style={{ fontSize: '0.7rem', color: '#7A8C9E' }}>Evaluated against pricing, margin viability, and channel targets.</span>
                            </div>
                          </div>

                          {/* Breakdown bar meters */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                              <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                                <span>Market Justification</span>
                                <span style={{ fontWeight: 600 }}>{defenseResult.marketJustification}%</span>
                              </div>
                              <div style={{ width: '100%', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px' }}>
                                <div style={{ width: `${defenseResult.marketJustification}%`, height: '100%', backgroundColor: 'var(--accent-blue)' }} />
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                                <span>Financial Viability</span>
                                <span style={{ fontWeight: 600 }}>{defenseResult.financialViability}%</span>
                              </div>
                              <div style={{ width: '100%', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px' }}>
                                <div style={{ width: `${defenseResult.financialViability}%`, height: '100%', backgroundColor: 'var(--accent-green)' }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                                <span>Operational Feasibility</span>
                                <span style={{ fontWeight: 600 }}>{defenseResult.operationalFeasibility}%</span>
                              </div>
                              <div style={{ width: '100%', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px' }}>
                                <div style={{ width: `${defenseResult.operationalFeasibility}%`, height: '100%', backgroundColor: 'purple' }} />
                              </div>
                            </div>
                          </div>

                          {/* Strengths & Weaknesses lists */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                            <div style={{ fontSize: '0.75rem' }}>
                              <div style={{ fontWeight: 700, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>✓</span> Strategic Strengths
                              </div>
                              <ul style={{ paddingLeft: '14px', margin: '4px 0 0 0', color: '#475569', lineHeight: '1.4' }}>
                                {defenseResult.strengths.map((s, idx) => (
                                  <li key={idx}>{s}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div style={{ fontSize: '0.75rem' }}>
                              <div style={{ fontWeight: 700, color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>⚠</span> Gaps & Vulnerabilities
                              </div>
                              <ul style={{ paddingLeft: '14px', margin: '4px 0 0 0', color: '#475569', lineHeight: '1.4' }}>
                                {defenseResult.vulnerabilities.map((v, idx) => (
                                  <li key={idx}>{v}</li>
                                ))}
                              </ul>
                            </div>

                            <div style={{ fontSize: '0.75rem' }}>
                              <div style={{ fontWeight: 700, color: 'purple', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>💡</span> Actionable Recommendations
                              </div>
                              <ul style={{ paddingLeft: '14px', margin: '4px 0 0 0', color: '#475569', lineHeight: '1.4' }}>
                                {defenseResult.recommendations.map((r, idx) => (
                                  <li key={idx}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* VIEW: AI Boardroom Intro */}
            {activeMenu === 'boardroom-intro' && (
              <div className={`assessment-setup-card ${boardroomMode === 'impact-review' ? 'leadership-review-setup' : ''}`}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{boardroomMode === 'verbal-assessment' ? '🎙️' : '🏛️'}</div>
                <h2 style={{ color: 'var(--workspace-text-dark)', fontWeight: 700, fontSize: '1.4rem', marginBottom: '12px' }}>
                  {boardroomMode === 'verbal-assessment' ? 'AI Socratic Verbal Assessment' : 'AI Conscious Leadership Review'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#556B82', lineHeight: '1.6', maxWidth: '460px', margin: '0 auto 24px' }}>
                  {boardroomMode === 'verbal-assessment'
                    ? 'Defend one decision from your quarter in a short spoken conversation. The coach asks one thoughtful question, then makes it smaller only when you need support.'
                    : 'The Council will examine your current decisions through customer, employee, community, environmental, and financial lenses. Defend the trade-offs in your plan before locking the round.'}
                </p>

                <div className="assessment-mode-switch" role="group" aria-label="Choose AI session mode">
                  <button onClick={() => setBoardroomMode('impact-review')} className={boardroomMode === 'impact-review' ? 'selected' : ''}>Leadership Review</button>
                  <button onClick={() => setBoardroomMode('verbal-assessment')} className={boardroomMode === 'verbal-assessment' ? 'selected' : ''}>Decision Defense</button>
                </div>

                {boardroomMode === 'impact-review' && (
                  <div className="leadership-review-brief">
                    <div><span>Board mandate</span><b>Test strategy against stakeholder outcomes before the quarter is locked.</b></div>
                    <div className="leadership-review-lenses"><span><UsersRound size={15}/> People</span><span><Leaf size={15}/> Planet</span><span><HeartHandshake size={15}/> Community</span><span><Scale size={15}/> Governance</span></div>
                    <p>The council challenges trade-offs in three formal phases: awareness, diagnostic discovery, and strategic refinement.</p>
                  </div>
                )}

                {boardroomMode === 'verbal-assessment' && (
                  <div className="assessment-topic-config">
                    <div className="assessment-topic-heading"><label>Decision selected for defense</label><span>Uses your saved quarter choices</span></div>
                    <div className="decision-defense-summary"><b>{decisions.targetSegment} market offer</b><span>${decisions.pricing.toLocaleString()} price</span><span>{decisions.productionVolume.toLocaleString()} production units</span><span>${decisions.marketingBudget.toLocaleString()} marketing</span></div>
                    <div className="assessment-voice-note"><Mic size={15} /><span>One main question. Smaller evidence and cause-effect prompts appear only if needed. AI voice is {voiceEnabled ? 'on' : 'off'}.</span><button onClick={() => setVoiceEnabled(enabled => !enabled)}>{voiceEnabled ? 'Mute voice' : 'Enable voice'}</button></div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={handleInitiateSession}
                    className="btn-replica-blue"
                    style={{ padding: '12px 24px', fontSize: '0.9rem', backgroundColor: 'var(--accent-red)' }}
                  >
                    {boardroomMode === 'verbal-assessment' ? 'Begin Decision Defense (500 Credits)' : 'Review Stakeholder Plan (500 Credits)'}
                  </button>
                  <span style={{ fontSize: '0.8rem', color: '#7A8C9E' }}>
                    {boardroomMode === 'verbal-assessment' ? 'Assessed on choice, evidence, cause and effect, and awareness of risk.' : 'Requires a Board Booking Fee of 500 credits.'}
                  </span>
                </div>
              </div>
            )}

            {/* VIEW: AI Boardroom Chat Interrogation */}
            {activeMenu === 'boardroom-chat' && (
              <div className="boardroom-chat-panel">
                
                {/* Boardroom or voice-first assessment context */}
                {boardroomMode === 'verbal-assessment' ? (
                  <div className="verbal-session-banner">
                    <div className="verbal-session-icon"><Mic size={24} /></div>
                    <div><span>AI Socratic Decision Defense</span><h3>One decision. One main question. Smaller prompts only when needed.</h3><p>Your saved quarter choices • {voiceEnabled ? 'AI voice enabled' : 'Text-only mode'}</p></div>
                    <button onClick={() => setVoiceEnabled(enabled => !enabled)}>{voiceEnabled ? 'Mute AI voice' : 'Enable AI voice'}</button>
                  </div>
                ) : (
                <>
                <div className="leadership-session-banner"><div><span>Conscious Leadership Council</span><h3>Stakeholder review before Quarter 4 lock-in</h3><p>Formal council session • Evidence, trade-offs, and measurable mitigations</p></div><div className="leadership-phase-chip">{getStageTitle(activeStage)}</div></div>
                <div className="boardroom-visual-panel leadership-visual-panel">
                  <div className="boardroom-oval-table">
                    
                    {/* Seat 1: CHAIR */}
                    <div className="boardroom-seat seat-chair">
                      <div className={`seat-avatar color-chair ${activeCxo === 'CHAIR' ? 'active' : ''}`}>
                        Arthur
                      </div>
                      <span className="seat-label">CHAIR</span>
                    </div>

                    {/* Seat 2: CEO */}
                    <div className="boardroom-seat seat-ceo">
                      <div className={`seat-avatar color-ceo ${activeCxo === 'CEO' ? 'active' : ''}`}>
                        Vance
                      </div>
                      <span className="seat-label">CEO</span>
                    </div>

                    {/* Seat 3: CFO */}
                    <div className="boardroom-seat seat-cfo">
                      <div className={`seat-avatar color-cfo ${activeCxo === 'CFO' ? 'active' : ''}`}>
                        Elena
                      </div>
                      <span className="seat-label">CFO</span>
                    </div>

                    {/* Seat 4: CMO */}
                    <div className="boardroom-seat seat-cmo">
                      <div className={`seat-avatar color-cmo ${activeCxo === 'CMO' ? 'active' : ''}`}>
                        Cole
                      </div>
                      <span className="seat-label">CMO</span>
                    </div>

                    {/* Seat 5: COO */}
                    <div className="boardroom-seat seat-coo">
                      <div className={`seat-avatar color-coo ${activeCxo === 'COO' ? 'active' : ''}`}>
                        Diana
                      </div>
                      <span className="seat-label">COO</span>
                    </div>

                  </div>
                </div>
                </>
                )}

                <div className="boardroom-chat-messages">
                  {messages.map((m) => (
                    <div key={m.id} className={`boardroom-msg-card ${m.role}`}>
                      <div className="boardroom-msg-header">
                        {m.role === 'assistant' ? (
                          <span style={{ color: m.cxo === 'CHAIR' ? '#94A3B8' : m.cxo === 'CEO' ? '#3B82F6' : m.cxo === 'CFO' ? '#10B981' : m.cxo === 'CMO' ? '#EC4899' : '#8B5CF6', fontWeight: 700 }}>
                            {m.cxo === 'CHAIR' && (boardroomMode === 'verbal-assessment' ? 'Socratic Coach' : 'Arthur Pendelton (Chairperson)')}
                            {m.cxo === 'CEO' && 'Alexander Vance (CEO)'}
                            {m.cxo === 'CFO' && 'Elena Rostova (CFO)'}
                            {m.cxo === 'CMO' && 'Marcus Cole (CMO)'}
                            {m.cxo === 'COO' && 'Diana Prince (COO)'}
                            {!['CHAIR', 'CEO', 'CFO', 'CMO', 'COO'].includes(m.cxo || '') && (m.cxo || 'Board')}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>
                            Student (Mirai)
                          </span>
                        )}
                        <span>{m.timestamp}</span>
                      </div>
                      <div className="boardroom-msg-text">{m.content}</div>
                    </div>
                  ))}

                  {loading && (
                    <div className="boardroom-msg-card assistant">
                      <div className="boardroom-msg-header">
                        <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>{boardroomMode === 'verbal-assessment' ? 'Socratic Coach' : 'Leadership Council'}</span>
                        <span>Evaluating...</span>
                      </div>
                      <div className="thinking-bubble">
                        <div className="thinking-dot" />
                        <div className="thinking-dot" />
                        <div className="thinking-dot" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="boardroom-chat-input-bar">
                  {boardroomMode === 'verbal-assessment' && (
                    <button type="button" onClick={captureSpokenResponse} className={`voice-capture-btn ${isListening ? 'listening' : ''}`} aria-label="Speak your response" title="Speak your response">
                      <Mic size={16} />
                    </button>
                  )}
                  <input
                    type="text"
                    className="boardroom-input"
                    placeholder={activeStage === 'completed' ? "Assessment complete." : boardroomMode === 'verbal-assessment' ? 'Speak or type your answer…' : `Defend strategy to ${activeCxo || 'Board'}...`}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    disabled={loading || activeStage === 'completed'}
                  />
                  <button
                    type="submit"
                    className="btn-replica-blue"
                    style={{ backgroundColor: activeStage === 'completed' ? '#7A8C9E' : 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    disabled={loading || !inputVal.trim() || activeStage === 'completed'}
                  >
                    <Send size={14} />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}

          </div>
        </main>

        {/* RIGHT SIDEBAR WIDGETS */}
        <aside className="right-sidebar">
          
          {/* widget: Quick Links */}
          <div className="right-widget">
            <div className="widget-header light">
              <span>Quick Links</span>
              <HelpCircle size={14} />
            </div>
            <div className="widget-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <a href="#" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Competitors&apos; Sales Force</a>
                <a href="#" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Market Potential data sheet</a>
                <a href="#" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Simulation Help Center</a>
              </div>
            </div>
          </div>

          {/* widget: Live Pro Forma */}
          <div className="right-widget">
            <div className="widget-header dark">
              <span>Live Pro Forma</span>
              <HelpCircle size={14} />
            </div>
            <div className="widget-content">
              <span style={{ color: '#718096', fontStyle: 'italic' }}>
                Available after you project demand for this quarter and run production simulation.
              </span>
            </div>
          </div>

          {/* widget: Team Monitor */}
          <div className="right-widget">
            <div className="widget-header light">
              <span>Team Monitor</span>
              <HelpCircle size={14} />
            </div>
            <div className="widget-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="flex-between">
                  <span>Marçal, I.</span>
                  <span style={{ color: 'green', fontWeight: 600 }}>Active</span>
                </div>
                <div className="flex-between">
                  <span>Enochj (You)</span>
                  <span style={{ color: 'green', fontWeight: 600 }}>Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* widget: Schedule */}
          <div className="right-widget">
            <div className="widget-header dark">
              <span>Round Schedule (GMT)</span>
            </div>
            <div className="widget-content" style={{ padding: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="flex-between" style={{ padding: '4px', backgroundColor: '#EDF2F7', borderRadius: '3px' }}>
                  <span className="badge-red-outline" style={{ padding: '0 4px' }}>R4</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>2026-03-15 00:15</span>
                </div>
                <div className="flex-between" style={{ padding: '4px' }}>
                  <span style={{ border: '1px solid #718096', padding: '0 4px', borderRadius: '3px', color: '#718096' }}>R5</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>2026-03-29 00:15</span>
                </div>
                <div className="flex-between" style={{ padding: '4px' }}>
                  <span style={{ border: '1px solid #718096', padding: '0 4px', borderRadius: '3px', color: '#718096' }}>R6</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>2026-04-12 00:15</span>
                </div>
                <div className="flex-between" style={{ padding: '4px' }}>
                  <span style={{ border: '1px solid #718096', padding: '0 4px', borderRadius: '3px', color: '#718096' }}>R7</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>2026-04-19 00:15</span>
                </div>
              </div>
            </div>
          </div>

          {/* Credits Ledger widget */}
          <div className="right-widget" style={{ borderColor: 'var(--accent-gold)' }}>
            <div className="widget-header light" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>Simulation Ledger</span>
            </div>
            <div className="widget-content flex-between">
              <span style={{ fontWeight: 600 }}>{credits.toLocaleString()} Credits</span>
              <button 
                onClick={addCredits}
                className="btn-replica-grey" 
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
              >
                + Add Credits
              </button>
            </div>
          </div>

        </aside>

      </div>

      {/* DECISION COACH: PAY-PER-SESSION REPORT HELP */}
      {showDecisionCoach && (
        <div className="modal-overlay">
          <div className="decision-coach-modal animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="decision-coach-title">
            <div className="decision-coach-modal-head"><div><span>AI Socratic Coach</span><h3 id="decision-coach-title">Help with {decisionCoachContext}</h3></div><button onClick={() => setShowDecisionCoach(false)} aria-label="Close Decision Coach">×</button></div>
            <p className="decision-coach-disclaimer">This 25-credit session helps you interpret evidence and test your reasoning. It will not choose the decision for you.</p>
            <div className="decision-coach-messages">
              {decisionCoachMessages.map(message => <div key={message.id} className={`decision-coach-message ${message.role}`}><span>{message.role === 'assistant' ? 'Coach' : 'You'}</span><p>{message.content}</p></div>)}
              {decisionCoachLoading && <div className="decision-coach-message assistant"><span>Coach</span><p>Reviewing the decision context…</p></div>}
            </div>
            <form onSubmit={sendDecisionCoachMessage} className="decision-coach-form"><input value={decisionCoachInput} onChange={(e) => setDecisionCoachInput(e.target.value)} placeholder="Describe the decision or number you are weighing…" autoFocus disabled={decisionCoachLoading} /><button className="btn-replica-blue" disabled={decisionCoachLoading || !decisionCoachInput.trim()}><Send size={14} /> Ask coach</button></form>
          </div>
        </div>
      )}

      {/* MODAL 1: BOOKING FEE TRANSACTION */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="boardroom-msg-card modal-content animate-fade-in" style={{ padding: '24px', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--workspace-text-dark)', marginBottom: '8px' }}>
              Confirm Leadership Review Fee
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#556B82', lineHeight: '1.5', marginBottom: '16px' }}>
              Initiating a Conscious Leadership Review requires 500 Credits. The review will compile your strategy data and challenge the stakeholder consequences before you submit.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-around', margin: '16px 0', padding: '12px', border: '1px solid var(--workspace-border)', borderRadius: '4px', backgroundColor: '#F8FAFC' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#7A8C9E', textTransform: 'uppercase' }}>Balance</div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{credits} 🪙</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--workspace-border)', paddingLeft: '16px' }}>
                <div style={{ fontSize: '0.7rem', color: '#7A8C9E', textTransform: 'uppercase' }}>Fee</div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent-red)' }}>-500 🪙</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button onClick={() => setShowBookingModal(false)} className="btn-replica-grey" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handlePayBookingFee} className="btn-replica-blue" style={{ flex: 1.5, backgroundColor: 'var(--accent-red)' }}>Confirm & Pay</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SETTINGS (API KEY) */}
      {showSettingsModal && (
        <div className="modal-overlay">
          <div className="boardroom-msg-card modal-content animate-fade-in" style={{ padding: '24px', maxWidth: '400px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--workspace-text-dark)', marginBottom: '8px' }}>
              ABIS API Key Settings
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#556B82', lineHeight: '1.5', marginBottom: '16px' }}>
              By default, ABIS runs on a local Socratic mock. Enter your Gemini API key to connect live LLMs (Gemini 1.5 Flash) for dynamic dialogue.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Gemini API Key</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                className="boardroom-input"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button onClick={() => setShowSettingsModal(false)} className="btn-replica-grey" style={{ flex: 1 }}>Close</button>
              <button onClick={() => saveApiKey(customApiKey)} className="btn-replica-blue" style={{ flex: 1.5 }}>Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
