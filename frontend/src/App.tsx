// import { useState } from "react";

// type AnalyzeResult = {
//   transcript: string;
//   triage: string;
//   primary_concern: string;
//   secondary_concern: string;
//   confidence: string;
//   critical_question: string;
//   recommended_action: string;
//   explanation_signals: string[];
//   case_complexity: string;
// };

// function App() {
//   const [transcript, setTranscript] = useState("");
//   const [livesAlone, setLivesAlone] = useState(false);
//   const [cognitiveImpairment, setCognitiveImpairment] = useState(false);
//   const [caregiverAvailable, setCaregiverAvailable] = useState(true);
//   const [priorFalls, setPriorFalls] = useState(0);
//   const [result, setResult] = useState<AnalyzeResult | null>(null);
//   const [loading, setLoading] = useState(false);

//   const analyzeAlert = async () => {
//     setLoading(true);
//     setResult(null);

//     const formData = new FormData();
//     formData.append("transcript", transcript);
//     formData.append("lives_alone", String(livesAlone));
//     formData.append("cognitive_impairment", String(cognitiveImpairment));
//     formData.append("caregiver_available", String(caregiverAvailable));
//     formData.append("prior_falls_90d", String(priorFalls));

//     try {
//       const response = await fetch("http://127.0.0.1:8000/analyze", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
//       setResult(data);
//     } catch (error) {
//       console.error(error);
//       alert("Error calling backend");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         fontFamily: "Arial, sans-serif",
//         padding: "24px",
//         maxWidth: "900px",
//         margin: "0 auto",
//       }}
//     >
//       <h1>Personal Alert Button Dashboard</h1>
//       <p>AI triage assistant for Personal Alert Button distress cases</p>

//       <div
//         style={{
//           border: "1px solid #ddd",
//           padding: "16px",
//           borderRadius: "8px",
//           marginBottom: "24px",
//         }}
//       >
//         <h2>Input</h2>

//         <label>Distress transcript</label>
//         <textarea
//           value={transcript}
//           onChange={(e) => setTranscript(e.target.value)}
//           rows={5}
//           style={{ width: "100%", marginTop: "8px", marginBottom: "16px" }}
//           placeholder="Example: I fell in the bathroom and cannot stand"
//         />

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: "12px",
//             marginBottom: "16px",
//           }}
//         >
//           <label>
//             <input
//               type="checkbox"
//               checked={livesAlone}
//               onChange={(e) => setLivesAlone(e.target.checked)}
//             />{" "}
//             Lives alone
//           </label>

//           <label>
//             <input
//               type="checkbox"
//               checked={cognitiveImpairment}
//               onChange={(e) => setCognitiveImpairment(e.target.checked)}
//             />{" "}
//             Cognitive impairment
//           </label>

//           <label>
//             <input
//               type="checkbox"
//               checked={caregiverAvailable}
//               onChange={(e) => setCaregiverAvailable(e.target.checked)}
//             />{" "}
//             Caregiver available
//           </label>

//           <label>
//             Prior falls in 90 days:
//             <input
//               type="number"
//               value={priorFalls}
//               onChange={(e) => setPriorFalls(Number(e.target.value))}
//               style={{ marginLeft: "8px", width: "80px" }}
//             />
//           </label>
//         </div>

//         <button onClick={analyzeAlert} disabled={loading || !transcript.trim()}>
//           {loading ? "Analyzing..." : "Analyze Alert"}
//         </button>
//       </div>

//       {result && (
//         <div
//           style={{
//             border: "1px solid #ddd",
//             padding: "16px",
//             borderRadius: "8px",
//           }}
//         >
//           <h2>Result</h2>
//           <p>
//             <strong>Triage:</strong> {result.triage}
//           </p>
//           <p>
//             <strong>Primary concern:</strong> {result.primary_concern}
//           </p>
//           <p>
//             <strong>Secondary concern:</strong> {result.secondary_concern}
//           </p>
//           <p>
//             <strong>Confidence:</strong> {result.confidence}
//           </p>
//           <p>
//             <strong>Critical follow-up question:</strong>{" "}
//             {result.critical_question}
//           </p>
//           <p>
//             <strong>Recommended action:</strong> {result.recommended_action}
//           </p>
//           <p>
//             <strong>Case complexity:</strong> {result.case_complexity}
//           </p>

//           <div>
//             <strong>Explanation signals:</strong>
//             <ul>
//               {result.explanation_signals.map((signal, index) => (
//                 <li key={index}>{signal}</li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

import { useState } from "react";

type AnalyzeResult = {
  transcript: string;
  triage: string;
  primary_concern: string;
  secondary_concern: string;
  confidence: string;
  critical_question: string;
  recommended_action: string;
  explanation_signals: string[];
  case_complexity: string;
};

function App() {
  const [transcript, setTranscript] = useState("");
  const [livesAlone, setLivesAlone] = useState(false);
  const [cognitiveImpairment, setCognitiveImpairment] = useState(false);
  const [caregiverAvailable, setCaregiverAvailable] = useState(true);
  const [priorFalls, setPriorFalls] = useState(0);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeAlert = async () => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("transcript", transcript);
    formData.append("lives_alone", String(livesAlone));
    formData.append("cognitive_impairment", String(cognitiveImpairment));
    formData.append("caregiver_available", String(caregiverAvailable));
    formData.append("prior_falls_90d", String(priorFalls));

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Error calling backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "24px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1>PAB Decision Support Tool</h1>
      <p>AI triage assistant for Personal Alert Button distress cases</p>

      <div
        style={{
          border: "1px solid #ddd",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <h2>Input</h2>

        <label>Distress transcript</label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={5}
          style={{ width: "100%", marginTop: "8px", marginBottom: "16px" }}
          placeholder="Example: I fell in the bathroom and cannot stand"
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={livesAlone}
              onChange={(e) => setLivesAlone(e.target.checked)}
            />{" "}
            Lives alone
          </label>

          <label>
            <input
              type="checkbox"
              checked={cognitiveImpairment}
              onChange={(e) => setCognitiveImpairment(e.target.checked)}
            />{" "}
            Cognitive impairment
          </label>

          <label>
            <input
              type="checkbox"
              checked={caregiverAvailable}
              onChange={(e) => setCaregiverAvailable(e.target.checked)}
            />{" "}
            Caregiver available
          </label>

          <label>
            Prior falls in 90 days:
            <input
              type="number"
              value={priorFalls}
              onChange={(e) => setPriorFalls(Number(e.target.value))}
              style={{ marginLeft: "8px", width: "80px" }}
            />
          </label>
        </div>

        <button onClick={analyzeAlert} disabled={loading || !transcript.trim()}>
          {loading ? "Analyzing..." : "Analyze Alert"}
        </button>
      </div>

      {result && (
        <div
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <h2>Result</h2>
          <p>
            <strong>Triage:</strong> {result.triage}
          </p>
          <p>
            <strong>Primary concern:</strong> {result.primary_concern}
          </p>
          <p>
            <strong>Secondary concern:</strong> {result.secondary_concern}
          </p>
          <p>
            <strong>Confidence:</strong> {result.confidence}
          </p>
          <p>
            <strong>Critical follow-up question:</strong>{" "}
            {result.critical_question}
          </p>
          <p>
            <strong>Recommended action:</strong> {result.recommended_action}
          </p>
          <p>
            <strong>Case complexity:</strong> {result.case_complexity}
          </p>

          <div>
            <strong>Explanation signals:</strong>
            <ul>
              {result.explanation_signals.map((signal, index) => (
                <li key={index}>{signal}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
