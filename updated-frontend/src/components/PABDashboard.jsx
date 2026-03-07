import { useState, useEffect } from "react";
import { useAlerts } from '../hooks/useAlerts.js'  // Adjust path
console.log('PABDashboard: Before importing useAlerts')
console.log('PABDashboard: useAlerts imported')

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const MOCK_ALERTS = [
  {
    incident_id: "750e8400-0001",
    triage_tier: "URGENT",
    final_urgency_score: 0.91,
    start_time: new Date(Date.now() - 4 * 60000).toISOString(),
    status: "Pending",
    senior: {
      name: "Mdm Tan Ah Kow", age: 78, gender: "F", primary_language: "Hokkien",
      cci_score: 7, medical_conditions: ["Hypertension", "Diabetes", "Arthritis"],
      clinical_notes: "Recently dizzy, reduced mobility. Uses walking stick.",
      lives_alone: true, device_location: "Bathroom",
      total_alert_count: 12, false_positive_count: 1, postal_code: "150084",
    },
    forensics: {
      detected_language: "Hokkien", language_confidence: 0.82, silence_duration_s: 4.2,
      agent_consensus: "Fall keyword (toh) and pain keyword (thiann) detected in Hokkien. 4.2s silence at end. Laboured breathing present. 3AM night alert from senior living alone with CCI 7.",
      acoustic_features: {
        db_level: 68, silence_ratio: 0.42, speech_rate_wpm: 42, audio_quality_score: 0.61,
        nonverbal_sounds: { moaning: true, trembling: true, breathing_labored: true, crying: false, shouting: false },
      },
      semantic_features: {
        transcript: "toh liao... thiann... beh khi", stt_confidence: 0.61, keyword_confidence: 0.78,
        keywords: ["toh", "thiann"], cancel_phrases_detected: false,
        decision_confidence: 0.87, harm_if_wrong: "HIGH",
        risk_flags: ["low_stt_confidence", "dialect_unsupported"],
      },
      env_features: { tv_detected: false, thud_detected: true, running_water: false, fan_detected: false, children_detected: false },
    },
    dispatch_suggestion: { primary_resource: "FirstAider", dual_dispatch: true, secondary_resource: "Ambulance" },
    ui: {
      recommended_action_text: "Dispatch first aider now. Place ambulance on standby.",
      dialect_alert: true, dialect_message: "Hokkien speaker — Wong Mei Ling (on shift) speaks Hokkien.",
      show_reliability_warning: true, reliability_warning_text: "Hokkien confidence moderate (82%). Rely on acoustic signals as primary indicators.",
      callback_questions: ["Can you hear me?", "Have you fallen?", "Are you in pain?", "Can you get up?", "Is anyone with you?"],
    },
  },
  {
    incident_id: "750e8400-0002",
    triage_tier: "URGENT",
    final_urgency_score: 0.96,
    start_time: new Date(Date.now() - 7 * 60000).toISOString(),
    status: "Pending",
    senior: {
      name: "Mr Teo Chin Nam", age: 88, gender: "M", primary_language: "Teochew",
      cci_score: 10, medical_conditions: ["HeartFailure", "Dementia", "Diabetes", "COPD"],
      clinical_notes: "CRITICAL risk profile. Known dementia. Any alert treated as urgent.",
      lives_alone: true, device_location: "Bedroom",
      total_alert_count: 41, false_positive_count: 3, postal_code: "410033",
    },
    forensics: {
      detected_language: "Unknown", language_confidence: 0.12, silence_duration_s: 8.1,
      agent_consensus: "Complete silence 8.1s. Faint laboured breathing only. No speech. Known dementia and heart failure. 2AM night alert — dispatch immediately.",
      acoustic_features: {
        db_level: 28, silence_ratio: 0.81, speech_rate_wpm: 0, audio_quality_score: 0.45,
        nonverbal_sounds: { moaning: false, trembling: false, breathing_labored: true, crying: false, shouting: false },
      },
      semantic_features: {
        transcript: "", stt_confidence: 0.05, keyword_confidence: 0.0,
        keywords: [], cancel_phrases_detected: false,
        decision_confidence: 0.94, harm_if_wrong: "CRITICAL",
        risk_flags: ["silent_alert_ambiguity", "audio_quality_poor"],
      },
      env_features: { tv_detected: false, thud_detected: false, running_water: false, fan_detected: false, children_detected: false },
    },
    dispatch_suggestion: { primary_resource: "Ambulance", dual_dispatch: false, secondary_resource: null },
    ui: {
      recommended_action_text: "Dispatch ambulance immediately. Senior may be unconscious.",
      dialect_alert: true, dialect_message: "Teochew speaker — Wong Mei Ling (on shift) speaks Teochew.",
      show_reliability_warning: false, reliability_warning_text: null,
      callback_questions: ["Can you hear me?", "Are you awake?", "Can you make any sound?", "Are you breathing okay?"],
    },
  },
  {
    incident_id: "750e8400-0004",
    triage_tier: "UNCERTAIN",
    final_urgency_score: 0.58,
    start_time: new Date(Date.now() - 12 * 60000).toISOString(),
    status: "Pending",
    senior: {
      name: "Mr Lim Boon Huat", age: 82, gender: "M", primary_language: "Teochew",
      cci_score: 9, medical_conditions: ["AFib", "ChronicKidneyDisease", "Dementia"],
      clinical_notes: "Cognitive decline. Night confusion episodes. High fall risk.",
      lives_alone: true, device_location: "Bedroom",
      total_alert_count: 28, false_positive_count: 4, postal_code: "110032",
    },
    forensics: {
      detected_language: "Teochew", language_confidence: 0.44, silence_duration_s: 0.3,
      agent_consensus: "Confused speech, very low clarity. Known dementia patient. Night alert. Teochew confidence low. Callback urgently required to assess physical status.",
      acoustic_features: {
        db_level: 45, silence_ratio: 0.03, speech_rate_wpm: 38, audio_quality_score: 0.55,
        nonverbal_sounds: { moaning: false, trembling: false, breathing_labored: false, crying: false, shouting: false },
      },
      semantic_features: {
        transcript: "where... who... I don't...", stt_confidence: 0.38, keyword_confidence: 0.31,
        keywords: ["confused"], cancel_phrases_detected: false,
        decision_confidence: 0.58, harm_if_wrong: "MEDIUM",
        risk_flags: ["low_language_confidence", "dialect_unsupported", "low_stt_confidence"],
      },
      env_features: { tv_detected: false, thud_detected: false, running_water: false, fan_detected: false, children_detected: false },
    },
    dispatch_suggestion: { primary_resource: "WelfareCallback", dual_dispatch: false, secondary_resource: null },
    ui: {
      recommended_action_text: "Call back immediately. Assess physical condition before deciding dispatch.",
      dialect_alert: true, dialect_message: "Teochew speaker — Wong Mei Ling (on shift) speaks Teochew.",
      show_reliability_warning: true, reliability_warning_text: "Teochew confidence very low (44%). Transcript unreliable — assess via callback only.",
      callback_questions: ["Can you hear me?", "Do you know where you are?", "Are you hurt or in pain?", "Can you walk to the door?"],
    },
  },
  {
    incident_id: "750e8400-0006",
    triage_tier: "NON_URGENT",
    final_urgency_score: 0.12,
    start_time: new Date(Date.now() - 22 * 60000).toISOString(),
    status: "Pending",
    senior: {
      name: "Mdm Chan Poh Choo", age: 73, gender: "F", primary_language: "Hokkien",
      cci_score: 5, medical_conditions: ["Osteoporosis", "Hypertension", "Depression"],
      clinical_notes: "Frequent loneliness calls. Low fall risk but high social needs.",
      lives_alone: true, device_location: "LivingRoom",
      total_alert_count: 22, false_positive_count: 8, postal_code: "150084",
    },
    forensics: {
      detected_language: "English", language_confidence: 0.96, silence_duration_s: 0.1,
      agent_consensus: "Clear social keywords: lonely, talk, children. Calm tone. No distress. High historical false-positive rate (36%). Safe to handle as welfare callback.",
      acoustic_features: {
        db_level: 48, silence_ratio: 0.01, speech_rate_wpm: 95, audio_quality_score: 0.92,
        nonverbal_sounds: { moaning: false, trembling: false, breathing_labored: false, crying: false, shouting: false },
      },
      semantic_features: {
        transcript: "Hello anyone there aiyah I just feeling very lonely today lah my children never call",
        stt_confidence: 0.94, keyword_confidence: 0.88,
        keywords: ["lonely", "talk"], cancel_phrases_detected: false,
        decision_confidence: 0.94, harm_if_wrong: "LOW",
        risk_flags: [],
      },
      env_features: { tv_detected: true, thud_detected: false, running_water: false, fan_detected: false, children_detected: false },
    },
    dispatch_suggestion: { primary_resource: "WelfareCallback", dual_dispatch: false, secondary_resource: null },
    ui: {
      recommended_action_text: "Schedule welfare callback. No dispatch needed.",
      dialect_alert: false, dialect_message: null,
      show_reliability_warning: false, reliability_warning_text: null,
      callback_questions: ["How are you feeling today?", "Have you eaten today?", "Is there anyone we can contact?", "Would you like us to arrange a regular check-in?"],
    },
  },
  {
    incident_id: "750e8400-0007",
    triage_tier: "NON_URGENT",
    final_urgency_score: 0.05,
    start_time: new Date(Date.now() - 35 * 60000).toISOString(),
    status: "Pending",
    senior: {
      name: "Mdm Wong Siew Lan", age: 69, gender: "F", primary_language: "Cantonese",
      cci_score: 3, medical_conditions: ["Hypertension"],
      clinical_notes: "Generally healthy. Grandchildren visit weekends. All 3 alerts accidental.",
      lives_alone: false, device_location: "LivingRoom",
      total_alert_count: 3, false_positive_count: 3, postal_code: "310051",
    },
    forensics: {
      detected_language: "English", language_confidence: 0.99, silence_duration_s: 0.0,
      agent_consensus: "Explicit cancellation phrase detected. Senior confirmed okay. Accidental press — grandchildren present. 100% historical false positive rate.",
      acoustic_features: {
        db_level: 51, silence_ratio: 0.0, speech_rate_wpm: 110, audio_quality_score: 0.97,
        nonverbal_sounds: { moaning: false, trembling: false, breathing_labored: false, crying: false, shouting: false },
      },
      semantic_features: {
        transcript: "Aiyoh sorry sorry I press wrongly lah I am okay perfectly fine so sorry",
        stt_confidence: 0.97, keyword_confidence: 0.99,
        keywords: [], cancel_phrases_detected: true,
        decision_confidence: 0.97, harm_if_wrong: "LOW",
        risk_flags: [],
      },
      env_features: { tv_detected: true, thud_detected: false, running_water: false, fan_detected: false, children_detected: true },
    },
    dispatch_suggestion: { primary_resource: "NoAction", dual_dispatch: false, secondary_resource: null },
    ui: {
      recommended_action_text: "No action required. Log as accidental press.",
      dialect_alert: false, dialect_message: null,
      show_reliability_warning: false, reliability_warning_text: null,
      callback_questions: [],
    },
  },
];

const DISPATCHED = [
  {
    incident_id: "750e8400-0003", triage_tier: "URGENT", final_urgency_score: 0.88,
    start_time: new Date(Date.now() - 18 * 60000).toISOString(),
    senior: { name: "Mr Abdul Hamid", age: 84, gender: "M", medical_conditions: ["HeartFailure", "COPD"], cci_score: 8, postal_code: "410033" },
    dispatch: { resource_type: "Ambulance", dispatched_at: new Date(Date.now() - 15 * 60000).toISOString(), ai_recommended: true, operator_overridden: false },
    feedback_match: "HIGH MATCH",
  },
  {
    incident_id: "750e8400-0008", triage_tier: "URGENT", final_urgency_score: 0.85,
    start_time: new Date(Date.now() - 42 * 60000).toISOString(),
    senior: { name: "Mr Govindasamy R.", age: 79, gender: "M", medical_conditions: ["Diabetes", "HipReplacement"], cci_score: 6, postal_code: "310051" },
    dispatch: { resource_type: "FirstAider", dispatched_at: new Date(Date.now() - 39 * 60000).toISOString(), ai_recommended: false, operator_overridden: true },
    feedback_match: "PENDING",
  },
];

// ─── DESIGN TOKENS ───────────────────────────
const T = {
  bg: "#f1f5f9", surface: "#ffffff", surfaceAlt: "#f8fafc",
  border: "#e2e8f0", borderMid: "#cbd5e1",
  text: "#0f172a", textMid: "#334155", textSub: "#64748b", textFaint: "#94a3b8",
  urgent:    { bg:"#fff1f2", border:"#fecaca", badge:"#ef4444", text:"#b91c1c", soft:"#fee2e2" },
  uncertain: { bg:"#fffbeb", border:"#fde68a", badge:"#f59e0b", text:"#b45309", soft:"#fef3c7" },
  nonUrgent: { bg:"#f0fdf4", border:"#bbf7d0", badge:"#16a34a", text:"#15803d", soft:"#dcfce7" },
};
const TIER = { URGENT: T.urgent, UNCERTAIN: T.uncertain, NON_URGENT: T.nonUrgent };
const HARM_COLOR = {
  CRITICAL: { bg:"#fef2f2", color:"#991b1b", border:"#f87171" },
  HIGH:     { bg:"#fff7ed", color:"#9a3412", border:"#fb923c" },
  MEDIUM:   { bg:"#fefce8", color:"#854d0e", border:"#facc15" },
  LOW:      { bg:"#f0fdf4", color:"#166534", border:"#86efac" },
};
const RESOURCE_ICON = { Ambulance:"🚑", FirstAider:"🩹", SACStaff:"👷", WelfareCallback:"📞", NoAction:"✓" };
const FLAG_LABEL = {
  low_stt_confidence: "Low STT conf", low_language_confidence: "Low lang conf",
  silent_alert_ambiguity: "Silent alert", dialect_unsupported: "Dialect unsupported",
  audio_quality_poor: "Poor audio", acoustic_semantic_mismatch: "Signal mismatch",
};

// ─── HELPERS ─────────────────────────────────
function useElapsedSecs(isoTime) {
  const [s, setS] = useState(0);
  useEffect(() => {
    const upd = () => setS(Math.floor((Date.now() - new Date(isoTime)) / 1000));
    upd(); const t = setInterval(upd, 1000); return () => clearInterval(t);
  }, [isoTime]);
  return s;
}
function fmtSecs(s) {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s/60)}m ${s%60}s`;
  return `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m`;
}
function ElapsedBadge({ isoTime, tier }) {
  const s = useElapsedSecs(isoTime);
  const overdue = tier === "URGENT" && s > 300;
  const warn    = tier === "URGENT" && s > 120 && !overdue;
  return <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700,
    color: overdue ? "#b91c1c" : warn ? "#b45309" : T.textSub }}>
    {fmtSecs(s)}{overdue ? " ⚠" : ""}
  </span>;
}

function Pill({ label, type="info" }) {
  const C = {
    danger:  { bg:"#fee2e2", color:"#b91c1c", border:"#fca5a5" },
    warning: { bg:"#fef3c7", color:"#92400e", border:"#fcd34d" },
    info:    { bg:"#dbeafe", color:"#1d4ed8", border:"#93c5fd" },
    safe:    { bg:"#dcfce7", color:"#15803d", border:"#86efac" },
    flag:    { bg:"#f3e8ff", color:"#7e22ce", border:"#d8b4fe" },
  }[type] || { bg:"#dbeafe", color:"#1d4ed8", border:"#93c5fd" };
  return <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:4,
    background:C.bg, color:C.color, border:`1px solid ${C.border}`,
    fontSize:11, fontFamily:"'JetBrains Mono',monospace", whiteSpace:"nowrap", lineHeight:"18px" }}>
    {label}
  </span>;
}

function MetricBox({ label, value, sub, color }) {
  return <div style={{ flex:1, background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 10px" }}>
    <div style={{ fontSize:9, color:T.textFaint, textTransform:"uppercase", letterSpacing:1.2,
      fontFamily:"'JetBrains Mono',monospace", marginBottom:3 }}>{label}</div>
    <div style={{ fontSize:15, fontWeight:700, color: color||T.text,
      fontFamily:"'JetBrains Mono',monospace", lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:10, color:T.textFaint, marginTop:2 }}>{sub}</div>}
  </div>;
}

function buildPills(alert) {
  const pills = [];
  const kw = alert.forensics.semantic_features?.keywords || [];
  if (kw.length) pills.push({ label:`Keywords: ${kw.join(", ")}`, type:"danger" });
  const sil = alert.forensics.silence_duration_s || 0;
  if (sil >= 3) pills.push({ label:`${sil}s silence`, type:"danger" });
  else if (sil >= 1) pills.push({ label:`${sil}s silence`, type:"warning" });
  const nv = alert.forensics.acoustic_features?.nonverbal_sounds || {};
  if (nv.breathing_labored) pills.push({ label:"Laboured breathing", type:"danger" });
  if (nv.moaning)           pills.push({ label:"Moaning", type:"danger" });
  if (nv.crying)            pills.push({ label:"Crying", type:"warning" });
  if (nv.trembling)         pills.push({ label:"Trembling voice", type:"warning" });
  const bg = alert.forensics.env_features || {};
  if (bg.thud_detected)     pills.push({ label:"Thud", type:"danger" });
  if (bg.tv_detected)       pills.push({ label:"TV noise", type:"warning" });
  if (bg.children_detected) pills.push({ label:"Children present", type:"info" });
  const lc = alert.forensics.language_confidence || 1;
  const lang = alert.forensics.detected_language;
  if (!["English","Mandarin"].includes(lang) && lc < 0.85)
    pills.push({ label:`${lang} ${Math.round(lc*100)}%`, type:"warning" });
  if (alert.forensics.semantic_features?.cancel_phrases_detected)
    pills.push({ label:"Cancelled", type:"safe" });
  return pills;
}

// ─── TRIAGE MODAL ────────────────────────────
function TriageModal({ alert, onClose, onDispatch, onCallback, onResolve }) {
  const tc = TIER[alert.triage_tier] || T.nonUrgent;
  const pills = buildPills(alert);
  const riskPills = (alert.forensics.semantic_features?.risk_flags || []).map(f => ({ label: FLAG_LABEL[f]||f, type:"flag" }));
  const fp = alert.senior.total_alert_count > 0 ? alert.senior.false_positive_count / alert.senior.total_alert_count : 0;
  const harm = alert.forensics.semantic_features?.harm_if_wrong || "LOW";
  const hc = HARM_COLOR[harm] || HARM_COLOR.LOW;
  const [showChecklist, setShowChecklist] = useState(false);
  const sttConf = alert.forensics.semantic_features?.stt_confidence || 0;
  const kwConf  = alert.forensics.semantic_features?.keyword_confidence || 0;
  const decConf = alert.forensics.semantic_features?.decision_confidence || 0;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center",
      justifyContent:"center", background:"rgba(15,23,42,0.4)", backdropFilter:"blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{ width:"100%", maxWidth:840, maxHeight:"92vh", overflowY:"auto",
        background:T.surface, borderRadius:16, border:`1px solid ${tc.border}`,
        boxShadow:"0 24px 64px rgba(0,0,0,0.16)" }}>

        {/* Header */}
        <div style={{ padding:"18px 24px 14px", borderBottom:`1px solid ${T.border}`,
          background:`linear-gradient(135deg,${tc.bg},${T.surface})`,
          borderRadius:"16px 16px 0 0",
          display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ textAlign:"center", minWidth:52 }}>
              <div style={{ fontSize:8, fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
                letterSpacing:2, color:tc.text, textTransform:"uppercase", marginBottom:2 }}>
                {alert.triage_tier.replace("_","-")}
              </div>
              <div style={{ fontSize:38, fontWeight:800, color:tc.badge, lineHeight:1,
                fontFamily:"'JetBrains Mono',monospace" }}>
                {Math.round(alert.final_urgency_score*100)}
              </div>
              <div style={{ fontSize:9, color:T.textFaint }}>/ 100</div>
            </div>
            <div style={{ width:1, height:52, background:T.border }} />
            <div>
              <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 9px",
                borderRadius:4, background:hc.bg, color:hc.color, border:`1px solid ${hc.border}`,
                fontSize:10, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, marginBottom:5 }}>
                ⚠ HARM IF WRONG: {harm}
              </span>
              <div style={{ fontSize:13, color:T.textMid, marginBottom:2 }}>
                Alert <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:600, color:T.text }}>
                  #{alert.incident_id.slice(-4)}</span>
                {" · "}<ElapsedBadge isoTime={alert.start_time} tier={alert.triage_tier} />{" ago"}
                {" · "}<span style={{ color:T.textFaint }}>{alert.senior.device_location} · Postal {alert.senior.postal_code}</span>
              </div>
              <div style={{ fontSize:12, color:T.textFaint }}>
                AI decision confidence: <strong style={{ color:T.textMid }}>{Math.round(decConf*100)}%</strong>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:`1px solid ${T.borderMid}`,
            color:T.textSub, width:32, height:32, borderRadius:8, cursor:"pointer",
            fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding:"18px 24px", display:"grid", gridTemplateColumns:"268px 1fr", gap:16 }}>

          {/* Left: Senior */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
              <div style={{ fontSize:9, color:T.textFaint, textTransform:"uppercase",
                letterSpacing:1.5, fontFamily:"'JetBrains Mono',monospace", marginBottom:10 }}>Senior Profile</div>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:17, fontWeight:700, color:T.text }}>{alert.senior.name}</div>
                <div style={{ fontSize:12, color:T.textSub, marginTop:2 }}>
                  {alert.senior.age}{alert.senior.gender} · {alert.senior.primary_language} · {alert.senior.device_location}
                </div>
                <div style={{ fontSize:11, color:T.textFaint }}>Postal {alert.senior.postal_code}</div>
              </div>

              {/* Stat grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:10 }}>
                <MetricBox label="CCI Score" value={`${alert.senior.cci_score}/10`}
                  color={alert.senior.cci_score>=7?"#b91c1c":alert.senior.cci_score>=4?"#b45309":"#15803d"} />
                <MetricBox label="Lives Alone" value={alert.senior.lives_alone?"YES":"No"}
                  color={alert.senior.lives_alone?"#b91c1c":"#15803d"} />
                <MetricBox label="Total Alerts" value={alert.senior.total_alert_count} />
                <MetricBox label="False +ve" value={`${Math.round(fp*100)}%`}
                  color={fp>0.3?"#b45309":T.textMid}
                  sub={`${alert.senior.false_positive_count} of ${alert.senior.total_alert_count}`} />
              </div>

              {/* FP rate bar */}
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:9, color:T.textFaint, textTransform:"uppercase",
                  letterSpacing:1, fontFamily:"'JetBrains Mono',monospace", marginBottom:4 }}>False Positive History</div>
                <div style={{ height:5, background:T.border, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ width:`${Math.round(fp*100)}%`, height:"100%", borderRadius:3,
                    background: fp>0.3?"#f59e0b":fp>0.1?"#3b82f6":"#16a34a" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
                  <span style={{ fontSize:9, color:T.textFaint }}>0%</span>
                  <span style={{ fontSize:9, color:T.textFaint }}>100%</span>
                </div>
              </div>

              {/* Conditions */}
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:9, color:T.textFaint, textTransform:"uppercase",
                  letterSpacing:1, fontFamily:"'JetBrains Mono',monospace", marginBottom:5 }}>Conditions</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {alert.senior.medical_conditions.map(c => (
                    <span key={c} style={{ fontSize:10, padding:"2px 7px", borderRadius:4,
                      background:"#ede9fe", color:"#6d28d9", border:"1px solid #ddd6fe",
                      fontFamily:"'JetBrains Mono',monospace" }}>{c}</span>
                  ))}
                </div>
              </div>

              {/* Clinical notes */}
              <div style={{ fontSize:11, color:T.textMid, lineHeight:1.55, padding:"8px 10px",
                background:"#f8fafc", borderRadius:7, borderLeft:`3px solid ${T.borderMid}`,
                fontStyle:"italic" }}>
                "{alert.senior.clinical_notes}"
              </div>
            </div>

            {/* Callback checklist */}
            {alert.ui.callback_questions.length > 0 && (
              <div style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden" }}>
                <button onClick={() => setShowChecklist(x=>!x)}
                  style={{ width:"100%", padding:"10px 14px", background:"none", border:"none",
                    cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:9, color:T.textFaint, textTransform:"uppercase",
                    letterSpacing:1.5, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
                    📋 Callback Checklist ({alert.ui.callback_questions.length})
                  </span>
                  <span style={{ fontSize:11, color:T.textSub }}>{showChecklist?"▲":"▼"}</span>
                </button>
                {showChecklist && (
                  <div style={{ padding:"0 14px 12px" }}>
                    {alert.ui.callback_questions.map((q,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8,
                        padding:"6px 0", borderTop: i>0?`1px solid ${T.border}`:"none" }}>
                        <input type="checkbox" style={{ marginTop:2, accentColor:tc.badge }} />
                        <span style={{ fontSize:12, color:T.textMid, lineHeight:1.4 }}>{q}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: AI analysis */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

            {/* Audio metrics */}
            <div style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
              <div style={{ fontSize:9, color:T.textFaint, textTransform:"uppercase",
                letterSpacing:1.5, fontFamily:"'JetBrains Mono',monospace", marginBottom:10 }}>Audio Metrics</div>
              <div style={{ display:"flex", gap:6 }}>
                <MetricBox label="Language" value={alert.forensics.detected_language}
                  sub={`${Math.round(alert.forensics.language_confidence*100)}% conf`}
                  color={alert.forensics.language_confidence<0.65?"#b45309":T.text} />
                <MetricBox label="STT Conf" value={`${Math.round(sttConf*100)}%`}
                  color={sttConf<0.65?"#b91c1c":sttConf<0.8?"#b45309":"#15803d"} />
                <MetricBox label="Silence" value={`${alert.forensics.silence_duration_s}s`}
                  sub={`${Math.round((alert.forensics.acoustic_features?.silence_ratio||0)*100)}% of clip`}
                  color={alert.forensics.silence_duration_s>=3?"#b91c1c":T.textMid} />
                <MetricBox label="dB Level" value={alert.forensics.acoustic_features?.db_level||"—"} sub="avg" />
                <MetricBox label="Speech" value={alert.forensics.acoustic_features?.speech_rate_wpm||0} sub="wpm" />
                <MetricBox label="Kw Conf" value={`${Math.round(kwConf*100)}%`}
                  color={kwConf<0.65?"#b45309":T.textMid} />
              </div>
            </div>

            {/* Transcript */}
            <div style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
              <div style={{ fontSize:9, color:T.textFaint, textTransform:"uppercase",
                letterSpacing:1.5, fontFamily:"'JetBrains Mono',monospace", marginBottom:8 }}>Transcript</div>
              {alert.forensics.semantic_features?.transcript
                ? <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:T.textMid,
                    padding:"10px 12px", background:"#f8fafc", borderRadius:7,
                    borderLeft:`3px solid ${T.borderMid}`, lineHeight:1.7, fontStyle:"italic" }}>
                    "{alert.forensics.semantic_features.transcript}"
                  </div>
                : <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#b91c1c",
                    padding:"10px 12px", background:T.urgent.bg, borderRadius:7,
                    borderLeft:`3px solid ${T.urgent.badge}` }}>
                    ⚠ No speech detected — silence-only alert
                  </div>
              }
            </div>

            {/* Signal pills */}
            <div style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
              <div style={{ fontSize:9, color:T.textFaint, textTransform:"uppercase",
                letterSpacing:1.5, fontFamily:"'JetBrains Mono',monospace", marginBottom:8 }}>Key Signals</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {pills.map((p,i) => <Pill key={i} {...p} />)}
                {!pills.length && <span style={{ fontSize:12, color:T.textFaint }}>No significant signals</span>}
              </div>
            </div>

            {/* Risk flags */}
            {riskPills.length > 0 && (
              <div style={{ background:"#faf5ff", border:"1px solid #e9d5ff", borderRadius:10, padding:14 }}>
                <div style={{ fontSize:9, color:"#7e22ce", textTransform:"uppercase",
                  letterSpacing:1.5, fontFamily:"'JetBrains Mono',monospace", marginBottom:8 }}>🚩 Risk Flags</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {riskPills.map((p,i) => <Pill key={i} {...p} />)}
                </div>
              </div>
            )}

            {/* Consensus */}
            <div style={{ background:T.surfaceAlt, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
              <div style={{ fontSize:9, color:T.textFaint, textTransform:"uppercase",
                letterSpacing:1.5, fontFamily:"'JetBrains Mono',monospace", marginBottom:8 }}>AI Assessment</div>
              <p style={{ fontSize:13, color:T.textMid, lineHeight:1.7, margin:0 }}>
                {alert.forensics.agent_consensus}
              </p>
            </div>

            {/* Warnings */}
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {alert.ui.show_reliability_warning && (
                <div style={{ display:"flex", gap:10, padding:"10px 14px", borderRadius:8,
                  background:T.uncertain.soft, border:`1px solid ${T.uncertain.border}` }}>
                  <span>⚠️</span>
                  <span style={{ fontSize:12, color:T.uncertain.text, lineHeight:1.5 }}>
                    {alert.ui.reliability_warning_text}
                  </span>
                </div>
              )}
              {alert.ui.dialect_alert && alert.ui.dialect_message && (
                <div style={{ display:"flex", gap:10, padding:"10px 14px", borderRadius:8,
                  background:"#eff6ff", border:"1px solid #bfdbfe" }}>
                  <span>🌐</span>
                  <span style={{ fontSize:12, color:"#1d4ed8", lineHeight:1.5 }}>
                    {alert.ui.dialect_message}
                  </span>
                </div>
              )}
            </div>

            {/* Action recommendation */}
            <div style={{ padding:"14px 16px", borderRadius:10,
              background:`linear-gradient(135deg,${tc.soft},${tc.bg})`,
              border:`1px solid ${tc.border}` }}>
              <div style={{ fontSize:9, color:T.textFaint, textTransform:"uppercase",
                letterSpacing:1.5, fontFamily:"'JetBrains Mono',monospace", marginBottom:5 }}>Recommended Action</div>
              <div style={{ fontSize:13, fontWeight:700, color:tc.text,
                marginBottom: alert.dispatch_suggestion.dual_dispatch?4:0 }}>
                {RESOURCE_ICON[alert.dispatch_suggestion.primary_resource]} {alert.ui.recommended_action_text}
              </div>
              {alert.dispatch_suggestion.dual_dispatch && (
                <div style={{ fontSize:12, color:T.textSub }}>
                  + {RESOURCE_ICON[alert.dispatch_suggestion.secondary_resource]} {alert.dispatch_suggestion.secondary_resource} on standby
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 24px 18px", borderTop:`1px solid ${T.border}`,
          background:T.surfaceAlt, borderRadius:"0 0 16px 16px",
          display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onResolve}
            style={{ padding:"9px 16px", borderRadius:8, border:`1px solid ${T.borderMid}`,
              background:T.surface, color:T.textSub, cursor:"pointer", fontSize:13, fontWeight:600 }}>
            ✓ Mark Resolved
          </button>
          <button onClick={onCallback}
            style={{ padding:"9px 18px", borderRadius:8, border:"1px solid #bfdbfe",
              background:"#eff6ff", color:"#1d4ed8", cursor:"pointer", fontSize:13, fontWeight:600 }}>
            📞 Call Back
          </button>
          <button onClick={onDispatch}
            style={{ padding:"9px 22px", borderRadius:8, border:"none",
              background:tc.badge, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700,
              boxShadow:`0 4px 12px ${tc.badge}44` }}>
            🚨 Confirm Dispatch
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ALERT ROW ───────────────────────────────
function AlertRow({ alert, onView }) {
  const tc = TIER[alert.triage_tier] || T.nonUrgent;
  const pills = buildPills(alert).slice(0,3);
  const s = useElapsedSecs(alert.start_time);
  const isOverdue = alert.triage_tier==="URGENT" && s>300;

  return (
    <div onClick={() => onView(alert)}
      style={{ display:"grid", gridTemplateColumns:"4px 1fr auto",
        background: isOverdue ? T.urgent.bg : T.surface,
        border:`1px solid ${isOverdue ? T.urgent.border : T.border}`,
        borderRadius:10, marginBottom:6, cursor:"pointer", overflow:"hidden",
        boxShadow:"0 1px 3px rgba(0,0,0,0.05)", transition:"box-shadow 0.15s, border-color 0.15s" }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"; e.currentTarget.style.borderColor=tc.border; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor=isOverdue?T.urgent.border:T.border; }}>

      <div style={{ background:tc.badge }} />

      <div style={{ padding:"11px 16px", display:"flex", alignItems:"center", gap:16 }}>
        {/* Score */}
        <div style={{ flexShrink:0, textAlign:"center", width:54 }}>
          <div style={{ fontSize:8, fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
            letterSpacing:1.5, color:tc.text, textTransform:"uppercase", marginBottom:2 }}>
            {alert.triage_tier.replace("_","-")}
          </div>
          <div style={{ fontSize:24, fontWeight:800, color:tc.badge, lineHeight:1,
            fontFamily:"'JetBrains Mono',monospace" }}>
            {Math.round(alert.final_urgency_score*100)}
          </div>
        </div>

        {/* Senior */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5, flexWrap:"wrap" }}>
            <span style={{ fontSize:14, fontWeight:700, color:T.text }}>{alert.senior.name}</span>
            <span style={{ fontSize:11, color:T.textSub }}>{alert.senior.age}{alert.senior.gender}</span>
            {alert.senior.lives_alone && (
              <span style={{ fontSize:10, padding:"1px 6px", borderRadius:3,
                background:T.urgent.soft, color:T.urgent.text, border:`1px solid ${T.urgent.border}`,
                fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>ALONE</span>
            )}
            <span style={{ fontSize:10, padding:"1px 6px", borderRadius:3,
              background:"#ede9fe", color:"#6d28d9", border:"1px solid #ddd6fe",
              fontFamily:"'JetBrains Mono',monospace" }}>{alert.senior.device_location}</span>
            <span style={{ fontSize:10, color:T.textFaint,
              fontFamily:"'JetBrains Mono',monospace" }}>CCI {alert.senior.cci_score}</span>
            <span style={{ fontSize:10, color:T.textFaint,
              fontFamily:"'JetBrains Mono',monospace" }}>#{alert.incident_id.slice(-4)}</span>
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {pills.map((p,i) => <Pill key={i} {...p} />)}
          </div>
        </div>

        {/* Language */}
        <div style={{ flexShrink:0, textAlign:"center", minWidth:68 }}>
          <div style={{ fontSize:8, color:T.textFaint, letterSpacing:1, textTransform:"uppercase",
            fontFamily:"'JetBrains Mono',monospace", marginBottom:2 }}>Lang</div>
          <div style={{ fontSize:12, fontWeight:700, fontFamily:"'JetBrains Mono',monospace",
            color: alert.forensics.language_confidence<0.7?"#b45309":T.textMid }}>
            {alert.forensics.detected_language}
          </div>
          <div style={{ fontSize:10, color:T.textFaint }}>
            {Math.round(alert.forensics.language_confidence*100)}%
          </div>
        </div>

        {/* Timer */}
        <div style={{ flexShrink:0, textAlign:"right", minWidth:60 }}>
          <ElapsedBadge isoTime={alert.start_time} tier={alert.triage_tier} />
          {isOverdue && <div style={{ fontSize:9, color:T.urgent.text,
            fontFamily:"'JetBrains Mono',monospace" }}>OVERDUE</div>}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"8px 12px", gap:5, background:T.surfaceAlt,
        borderLeft:`1px solid ${T.border}`, minWidth:128 }}>
        <button onClick={e=>{ e.stopPropagation(); onView(alert); }}
          style={{ padding:"5px 12px", borderRadius:6, border:`1px solid ${tc.badge}`,
            background:tc.soft, color:tc.text, cursor:"pointer",
            fontSize:11, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>
          View Details →
        </button>
        <button onClick={e=>{ e.stopPropagation(); onView(alert); }}
          style={{ padding:"5px 12px", borderRadius:6, border:`1px solid ${T.borderMid}`,
            background:T.surface, color:T.textSub, cursor:"pointer", fontSize:11 }}>
          📞 Call Back
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────
export default function PABDashboard() {
  const [selected, setSelected] = useState(null);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x=>x+1), 1000); return ()=>clearInterval(t); }, []);

  const pending = alerts.filter(a => a.status==="Pending");
  const urgentCount    = pending.filter(a => a.triage_tier==="URGENT").length;
  const uncertainCount = pending.filter(a => a.triage_tier==="UNCERTAIN").length;
  const nonUrgentCount = pending.filter(a => a.triage_tier==="NON_URGENT").length;

  const sorted = [...pending].sort((a,b) => {
    const o = { URGENT:0, UNCERTAIN:1, NON_URGENT:2 };
    return o[a.triage_tier]!==o[b.triage_tier] ? o[a.triage_tier]-o[b.triage_tier] : b.final_urgency_score-a.final_urgency_score;
  });

  const handleDispatch = a => { setAlerts(p=>p.map(x=>x.incident_id===a.incident_id?{...x,status:"Dispatched"}:x)); setSelected(null); };
  const handleResolve  = a => { setAlerts(p=>p.map(x=>x.incident_id===a.incident_id?{...x,status:"Resolved"}:x)); setSelected(null); };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.text,
      fontFamily:"'DM Sans',system-ui,sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:#f1f5f9;}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.6)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>

      {/* Header */}
      <div style={{ height:56, borderBottom:`1px solid ${T.border}`, background:T.surface,
        boxShadow:"0 1px 4px rgba(0,0,0,0.07)", position:"sticky", top:0, zIndex:100,
        display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:"#ef4444", borderRadius:8,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 2px 8px rgba(239,68,68,0.3)", fontSize:16, fontWeight:900, color:"white" }}>✚</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:T.text }}>PAB Copilot</div>
            <div style={{ fontSize:10, color:T.textFaint, fontFamily:"'JetBrains Mono',monospace" }}>
              Emergency Response · GovTech SG
            </div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          {urgentCount>0 && (
            <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 12px",
              background:T.urgent.soft, border:`1px solid ${T.urgent.border}`,
              borderRadius:20, animation:"blink 2s infinite" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#ef4444",
                animation:"pulse 1.5s infinite" }} />
              <span style={{ fontSize:11, fontWeight:700, color:T.urgent.text,
                fontFamily:"'JetBrains Mono',monospace" }}>{urgentCount} URGENT</span>
            </div>
          )}
          <div style={{ fontSize:12, color:T.textSub, fontFamily:"'JetBrains Mono',monospace" }}>
            Sarah Tan · Night Shift
          </div>
          <div style={{ width:32, height:32, borderRadius:"50%",
            background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:700, color:"white" }}>S</div>
        </div>
      </div>

      <div style={{ maxWidth:1160, margin:"0 auto", padding:"24px 32px" }}>

        {/* Stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
          {[
            { label:"Urgent",     count:urgentCount,    tc:T.urgent,    sub:"Immediate action required", icon:"🚨" },
            { label:"Uncertain",  count:uncertainCount, tc:T.uncertain, sub:"Callback required",         icon:"⚠️" },
            { label:"Non-Urgent", count:nonUrgentCount, tc:T.nonUrgent, sub:"Monitor / welfare",         icon:"✓"  },
          ].map(({ label, count, tc, sub, icon }) => (
            <div key={label} style={{ background:T.surface, border:`1px solid ${T.border}`,
              borderRadius:12, padding:"16px 20px", position:"relative", overflow:"hidden",
              boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
                background:tc.badge, borderRadius:"12px 12px 0 0" }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:10, color:T.textFaint, textTransform:"uppercase",
                    letterSpacing:1.5, fontFamily:"'JetBrains Mono',monospace", marginBottom:5 }}>{label}</div>
                  <div style={{ fontSize:44, fontWeight:800, color:tc.badge, lineHeight:1,
                    fontFamily:"'JetBrains Mono',monospace" }}>{count}</div>
                  <div style={{ fontSize:11, color:T.textFaint, marginTop:5 }}>{sub}</div>
                </div>
                <span style={{ fontSize:26, opacity:0.65 }}>{icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pending */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:15, fontWeight:700, color:T.text }}>Pending Alerts</span>
              <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10,
                background:T.urgent.soft, color:T.urgent.text, border:`1px solid ${T.urgent.border}`,
                fontFamily:"'JetBrains Mono',monospace" }}>{pending.length} active</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11,
              color:"#16a34a", fontFamily:"'JetBrains Mono',monospace" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#16a34a",
                animation:"pulse 2s infinite" }} />
              LIVE
            </div>
          </div>
          {sorted.length===0
            ? <div style={{ textAlign:"center", padding:"48px", color:T.textFaint,
                border:`2px dashed ${T.border}`, borderRadius:12, background:T.surface }}>
                <div style={{ fontSize:28, marginBottom:8 }}>✓</div>
                <div style={{ fontSize:14 }}>All clear — no pending alerts</div>
              </div>
            : sorted.map(a => <AlertRow key={a.incident_id} alert={a} onView={setSelected} />)
          }
        </div>

        {/* Dispatched */}
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <span style={{ fontSize:15, fontWeight:700, color:T.text }}>Dispatched</span>
            <span style={{ fontSize:11, color:"#16a34a",
              fontFamily:"'JetBrains Mono',monospace" }}>● {DISPATCHED.length} en route</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {DISPATCHED.map(a => (
              <div key={a.incident_id} style={{ display:"flex", alignItems:"center", gap:14,
                padding:"12px 16px", background:T.surface,
                border:`1px solid ${T.border}`, borderRadius:10,
                boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
                <span style={{ fontSize:9, padding:"2px 8px", borderRadius:3, fontWeight:700,
                  fontFamily:"'JetBrains Mono',monospace",
                  background:T.urgent.soft, color:T.urgent.text, border:`1px solid ${T.urgent.border}` }}>
                  {a.triage_tier}
                </span>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{a.senior.name}</span>
                  <span style={{ fontSize:11, color:T.textSub, marginLeft:8 }}>
                    {a.senior.age}{a.senior.gender} · {a.senior.medical_conditions.slice(0,2).join(", ")} · CCI {a.senior.cci_score}
                  </span>
                  <span style={{ fontSize:10, color:T.textFaint,
                    fontFamily:"'JetBrains Mono',monospace", marginLeft:8 }}>
                    #{a.incident_id.slice(-4)} · {a.senior.postal_code}
                  </span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, padding:"3px 10px", borderRadius:12, fontWeight:600,
                    fontFamily:"'JetBrains Mono',monospace",
                    background: a.dispatch.resource_type==="Ambulance"?"#f0fdf4":"#eff6ff",
                    color:      a.dispatch.resource_type==="Ambulance"?"#15803d":"#1d4ed8",
                    border:     `1px solid ${a.dispatch.resource_type==="Ambulance"?"#bbf7d0":"#bfdbfe"}` }}>
                    {RESOURCE_ICON[a.dispatch.resource_type]} {a.dispatch.resource_type}
                  </span>
                  {a.dispatch.operator_overridden && (
                    <span style={{ fontSize:10, color:"#b45309",
                      fontFamily:"'JetBrains Mono',monospace" }}>⚡ OVERRIDE</span>
                  )}
                  <ElapsedBadge isoTime={a.dispatch.dispatched_at} tier="NON_URGENT" />
                  {a.feedback_match==="HIGH MATCH" && (
                    <span style={{ fontSize:10, padding:"2px 7px", borderRadius:3,
                      background:"#f0fdf4", color:"#15803d", border:"1px solid #bbf7d0",
                      fontFamily:"'JetBrains Mono',monospace" }}>✓ HIGH MATCH</span>
                  )}
                  {a.feedback_match==="PENDING" && (
                    <span style={{ fontSize:10, padding:"2px 7px", borderRadius:3,
                      background:T.surfaceAlt, color:T.textFaint, border:`1px solid ${T.border}`,
                      fontFamily:"'JetBrains Mono',monospace" }}>Feedback pending</span>
                  )}
                  <button style={{ padding:"4px 10px", borderRadius:6, border:`1px solid ${T.borderMid}`,
                    background:T.surface, color:T.textSub, cursor:"pointer", fontSize:11 }}>
                    Update Feedback
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <TriageModal alert={selected} onClose={()=>setSelected(null)}
          onDispatch={()=>handleDispatch(selected)}
          onCallback={()=>setSelected(null)}
          onResolve={()=>handleResolve(selected)} />
      )}
    </div>
  );
}