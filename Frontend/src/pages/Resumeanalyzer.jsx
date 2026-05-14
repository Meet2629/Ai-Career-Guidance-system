import { useState, useRef } from "react";

const API_URL = "http://localhost:3000/api/resume-ai/resume-analysis";

// Normalize API response — handles different possible field names
function normalizeResults(data) {
  return {
    score:           data.score            ?? data.resumeScore       ?? data.resume_score       ?? 0,
    ats:             data.ats              ?? data.atsScore          ?? data.ats_score          ?? 0,
    skills:          data.skills           ?? data.detectedSkills    ?? data.detected_skills    ?? [],
    missingSkills:   data.missingSkills    ?? data.missing_skills    ?? data.skillGaps          ?? data.skill_gaps ?? [],
    keywords:        data.keywords         ?? data.topKeywords       ?? data.top_keywords       ?? [],
    suggestions:     data.suggestions      ?? data.improvements      ?? data.tips               ?? [],
    jobMatches:     (data.jobMatches       ?? data.job_matches       ?? data.jobs               ?? []).map(j => ({
      title:   j.title   ?? j.jobTitle    ?? j.job_title    ?? "Job",
      company: j.company ?? j.companyName ?? j.company_name ?? "",
      match:   j.match   ?? j.matchScore  ?? j.match_score  ?? j.percentage ?? 0,
    })),
    sectionStrength: data.sectionStrength  ?? data.section_strength  ?? {},
    jdMatch:         data.jdMatch          ?? data.jd_match          ?? data.jobDescriptionMatch ?? null,
    jdMissingKeywords: data.jdMissingKeywords ?? data.jd_missing_keywords ?? data.missingJdKeywords ?? [],
    jdMatchedKeywords: data.jdMatchedKeywords ?? data.jd_matched_keywords ?? data.matchedJdKeywords ?? [],
  };
}

function ScoreRing({ value, size = 110, color = "#4F46E5" }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8EAFF" strokeWidth="10" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

function ScoreLabel(score) {
  if (score >= 80) return "Excellent — Well done!";
  if (score >= 60) return "Good — Room to improve";
  return "Needs improvement";
}

function ATSLabel(score) {
  if (score >= 80) return "Strong ATS compatibility";
  if (score >= 60) return "Moderate ATS compatibility";
  return "Low ATS compatibility";
}

export default function ResumeAnalyzer() {
  const [dragOver, setDragOver]   = useState(false);
  const [file, setFile]           = useState(null);
  const [jd, setJd]               = useState("");
  const [jdEnabled, setJdEnabled] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults]     = useState(null);
  const [error, setError]         = useState(null);
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setError(null); }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("fileName", file.name);
      if (jdEnabled && jd.trim()) {
        formData.append("jobDescription", jd.trim());
      }

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type — browser handles multipart boundary
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error ${res.status}: ${errText || res.statusText}`);
      }

      const data = await res.json();
      setResults(normalizeResults(data));
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setFile(null);
    setJd("");
    setError(null);
  };

  const defaultSections = [["Experience", 85], ["Education", 70], ["Skills", 60], ["Summary", 40]];

  return (
    <div style={{ fontFamily: "'Crimson Pro', Georgia, serif", minHeight: "100vh", background: "#F8F9FF", padding: "40px 32px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Montserrat:wght@500;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #4F46E5; border-radius: 3px; }
        .upload-zone { border: 2px dashed #A5B4FC; border-radius: 16px; background: #fff; padding: 40px 32px; text-align: center; cursor: pointer; transition: all 0.25s; }
        .upload-zone.drag { border-color: #4F46E5; background: #EEF2FF; transform: scale(1.01); }
        .upload-zone:hover { border-color: #6366F1; background: #F5F3FF; }
        .btn-primary { background: linear-gradient(135deg, #4F46E5, #6366F1); color: #fff; border: none; border-radius: 30px; padding: 13px 36px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; letter-spacing: 0.5px; box-shadow: 0 4px 20px rgba(79,70,229,0.35); transition: all 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,0.45); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
        .btn-orange { background: linear-gradient(135deg, #F59E0B, #F97316); color: #fff; border: none; border-radius: 30px; padding: 12px 32px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 4px 16px rgba(245,158,11,0.4); transition: all 0.2s; }
        .btn-orange:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,158,11,0.5); }
        .btn-ghost { background: none; border: 1.5px solid #E8EAFF; border-radius: 30px; padding: 12px 24px; cursor: pointer; font-family: 'Montserrat', sans-serif; font-size: 13px; color: #6B7280; transition: all 0.2s; }
        .btn-ghost:hover { border-color: #A5B4FC; color: #4F46E5; }
        .card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 2px 16px rgba(79,70,229,0.08); }
        .tag-skill { display: inline-block; background: #EEF2FF; color: #4F46E5; border-radius: 20px; padding: 5px 14px; font-size: 12px; font-family: 'Montserrat', sans-serif; font-weight: 600; margin: 4px; }
        .tag-missing { display: inline-block; background: #FFF7ED; color: #EA580C; border-radius: 20px; padding: 5px 14px; font-size: 12px; font-family: 'Montserrat', sans-serif; font-weight: 600; margin: 4px; border: 1px solid #FED7AA; }
        .tag-keyword { display: inline-block; background: #F0FDF4; color: #16A34A; border-radius: 20px; padding: 5px 14px; font-size: 12px; font-family: 'Montserrat', sans-serif; font-weight: 600; margin: 4px; border: 1px solid #BBF7D0; }
        .tag-jd-match { display: inline-block; background: #EFF6FF; color: #1D4ED8; border-radius: 20px; padding: 5px 14px; font-size: 12px; font-family: 'Montserrat', sans-serif; font-weight: 600; margin: 4px; border: 1px solid #BFDBFE; }
        .tag-jd-miss { display: inline-block; background: #FDF2F8; color: #9D174D; border-radius: 20px; padding: 5px 14px; font-size: 12px; font-family: 'Montserrat', sans-serif; font-weight: 600; margin: 4px; border: 1px solid #FBCFE8; }
        .progress-bar-bg { background: #E8EAFF; border-radius: 8px; height: 10px; overflow: hidden; }
        .progress-bar-fill { height: 100%; border-radius: 8px; background: linear-gradient(90deg, #4F46E5, #818CF8); transition: width 1.2s ease; }
        .progress-bar-fill-orange { height: 100%; border-radius: 8px; background: linear-gradient(90deg, #F59E0B, #FB923C); transition: width 1.2s ease; }
        .job-card { background: linear-gradient(135deg, #F8F9FF, #EEF2FF); border: 1px solid #C7D2FE; border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
        .match-badge { background: linear-gradient(135deg, #4F46E5, #6366F1); color: #fff; border-radius: 20px; padding: 4px 14px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 13px; }
        .suggestion-item { display: flex; gap: 12px; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #F1F5F9; }
        .suggestion-item:last-child { border-bottom: none; }
        .pulse-dot { width: 10px; height: 10px; border-radius: 50%; background: #4F46E5; margin-top: 5px; flex-shrink: 0; box-shadow: 0 0 0 3px #C7D2FE; }
        .error-box { background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 12px; padding: 16px 20px; display: flex; gap: 12px; align-items: flex-start; margin-top: 16px; }
        .jd-textarea { width: 100%; min-height: 140px; border: 1.5px solid #C7D2FE; border-radius: 12px; padding: 14px 16px; font-family: 'Crimson Pro', serif; font-size: 15px; color: #374151; background: #FAFBFF; resize: vertical; outline: none; transition: border-color 0.2s; line-height: 1.6; }
        .jd-textarea:focus { border-color: #6366F1; background: #fff; }
        .jd-textarea::placeholder { color: #C4C9D8; }
        .toggle-btn { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
        .toggle-track { width: 40px; height: 22px; border-radius: 11px; background: #E8EAFF; position: relative; transition: background 0.25s; flex-shrink: 0; }
        .toggle-track.on { background: #4F46E5; }
        .toggle-thumb { width: 16px; height: 16px; border-radius: 50%; background: #fff; position: absolute; top: 3px; left: 3px; transition: left 0.25s; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
        .toggle-track.on .toggle-thumb { left: 21px; }
        .section-divider { border: none; border-top: 1.5px solid #F1F5F9; margin: 20px 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 48px; height: 48px; border: 4px solid #E8EAFF; border-top-color: #4F46E5; border-radius: 50%; animation: spin 0.9s linear infinite; margin: 0 auto 16px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.45s ease forwards; }
        .label { font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700; color: #9CA3AF; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Page Title */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, fontWeight: 700, color: "#F59E0B", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>AI-Powered Tool</div>
          <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: 44, fontWeight: 700, color: "#1e1e2e", lineHeight: 1.1, marginBottom: 8 }}>
            Resume <span style={{ color: "#4F46E5" }}>Analyzer</span>
          </h1>
          <p style={{ color: "#6B7280", fontSize: 17, fontStyle: "italic", fontFamily: "'Crimson Pro', serif" }}>
            select the right career for the right person
          </p>
        </div>

        {/* Upload + JD Section */}
        {!results && !analyzing && (
          <div className="card fade-in" style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 16, color: "#1e1e2e", marginBottom: 4 }}>Upload Your Resume</h2>
            <p style={{ color: "#9CA3AF", fontSize: 13, fontFamily: "'Montserrat', sans-serif", marginBottom: 20 }}>Supports PDF, DOCX, TXT — Max 5MB</p>

            {/* Drop Zone */}
            <div
              className={`upload-zone${dragOver ? " drag" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileRef.current?.click()}
              style={{ cursor: file ? "default" : "pointer" }}
            >
              {file ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📄</div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: "#1e1e2e", fontSize: 14, marginBottom: 3 }}>{file.name}</div>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: "#9CA3AF" }}>{(file.size / 1024).toFixed(1)} KB · Ready to analyze</div>
                  </div>
                  <button className="btn-ghost" style={{ marginLeft: "auto", padding: "8px 18px", fontSize: 12 }} onClick={(e) => { e.stopPropagation(); setFile(null); setError(null); }}>✕ Remove</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📄</div>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: "#4F46E5", fontSize: 14, marginBottom: 4 }}>Drag & Drop your resume here</p>
                  <p style={{ color: "#9CA3AF", fontSize: 13, fontFamily: "'Montserrat', sans-serif" }}>or click to browse files</p>
                </>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: "none" }} onChange={(e) => { setFile(e.target.files[0]); setError(null); }} />
            </div>

            <hr className="section-divider" />

            {/* JD Toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: jdEnabled ? 16 : 0 }}>
              <div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 14, color: "#1e1e2e", marginBottom: 2 }}>
                  Job Description Match
                </div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: "#9CA3AF" }}>
                  Paste a JD to get tailored match score & missing keywords
                </div>
              </div>
              <div className="toggle-btn" onClick={() => setJdEnabled(v => !v)}>
                <div className={`toggle-track${jdEnabled ? " on" : ""}`}>
                  <div className="toggle-thumb" />
                </div>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 700, color: jdEnabled ? "#4F46E5" : "#9CA3AF" }}>
                  {jdEnabled ? "ON" : "OFF"}
                </span>
              </div>
            </div>

            {jdEnabled && (
              <div className="fade-in">
                <textarea
                  className="jd-textarea"
                  placeholder="Paste the job description here… e.g. 'We are looking for a React developer with 3+ years of experience in TypeScript, Node.js, and AWS…'"
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                />
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: "#C4C9D8", marginTop: 6, textAlign: "right" }}>
                  {jd.length} characters
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="error-box">
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 13, color: "#BE123C", marginBottom: 3 }}>Analysis Failed</div>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: "#9F1239" }}>{error}</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ marginTop: 22, display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn-primary" onClick={handleAnalyze} disabled={!file}>
                ✦ Analyze Resume{jdEnabled && jd.trim() ? " + JD" : ""}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {analyzing && (
          <div className="card fade-in" style={{ textAlign: "center", padding: "52px 32px" }}>
            <div className="spinner" />
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: "#1e1e2e", fontSize: 18, marginBottom: 8 }}>Analyzing your resume...</h3>
            <p style={{ color: "#9CA3AF", fontFamily: "'Montserrat', sans-serif", fontSize: 13 }}>
              {jdEnabled && jd.trim() ? "Matching resume against job description, skills, ATS & more" : "Checking ATS compatibility, skills, keywords & more"}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 32 }}>
              {[["🔍", "ATS Scan"], ["🎯", "Skill Match"], ["🔑", "Keywords"], ...(jdEnabled && jd.trim() ? [["📋", "JD Match"]] : [["⭐", "Score"]])].map(([icon, label]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: 20 }}>{icon}</div>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results && !analyzing && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: 18, color: "#1e1e2e" }}>Analysis Results</h2>
              <button className="btn-orange" onClick={handleReset}>Analyze New Resume</button>
            </div>

            {/* Score Cards Row */}
            <div style={{ display: "grid", gridTemplateColumns: results.jdMatch !== null ? "repeat(4, 1fr)" : "repeat(3, 1fr)", gap: 20, marginBottom: 20 }}>

              {/* Resume Score */}
              <div className="card" style={{ textAlign: "center" }}>
                <div className="label">Resume Score</div>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <ScoreRing value={results.score} color="#4F46E5" />
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: 26, color: "#4F46E5" }}>{results.score}</div>
                </div>
                <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#6B7280", marginTop: 10 }}>{ScoreLabel(results.score)}</div>
              </div>

              {/* ATS Score */}
              <div className="card" style={{ textAlign: "center" }}>
                <div className="label">ATS Score</div>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <ScoreRing value={results.ats} color="#F59E0B" />
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: 26, color: "#F59E0B" }}>{results.ats}</div>
                </div>
                <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#6B7280", marginTop: 10 }}>{ATSLabel(results.ats)}</div>
              </div>

              {/* JD Match Score — only when present */}
              {results.jdMatch !== null && (
                <div className="card" style={{ textAlign: "center" }}>
                  <div className="label">JD Match</div>
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <ScoreRing value={results.jdMatch} color="#8B5CF6" />
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: 26, color: "#8B5CF6" }}>{results.jdMatch}</div>
                  </div>
                  <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#6B7280", marginTop: 10 }}>
                    {results.jdMatch >= 75 ? "Strong JD alignment" : results.jdMatch >= 50 ? "Moderate JD alignment" : "Low JD alignment"}
                  </div>
                </div>
              )}

              {/* Skill Snapshot */}
              <div className="card">
                <div className="label">Skill Snapshot</div>
                {results.skills.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: "#4F46E5", fontWeight: 700, marginBottom: 6, letterSpacing: "0.8px" }}>DETECTED</div>
                    {results.skills.map(s => <span key={s} className="tag-skill">{s}</span>)}
                  </div>
                )}
                {results.missingSkills.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 10, color: "#EA580C", fontWeight: 700, marginBottom: 6, letterSpacing: "0.8px" }}>MISSING</div>
                    {results.missingSkills.map(s => <span key={s} className="tag-missing">{s}</span>)}
                  </div>
                )}
                {results.skills.length === 0 && results.missingSkills.length === 0 && (
                  <p style={{ fontFamily: "'Crimson Pro', serif", color: "#9CA3AF", fontSize: 14 }}>No skill data returned.</p>
                )}
              </div>
            </div>

            {/* JD Keywords Row — only when JD was submitted */}
            {results.jdMatch !== null && (results.jdMatchedKeywords.length > 0 || results.jdMissingKeywords.length > 0) && (
              <div className="card fade-in" style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 14, color: "#1e1e2e", marginBottom: 16 }}>Job Description Keywords</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {results.jdMatchedKeywords.length > 0 && (
                    <div>
                      <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: "#1D4ED8", fontWeight: 700, marginBottom: 8, letterSpacing: "0.8px" }}>✓ MATCHED IN YOUR RESUME</div>
                      {results.jdMatchedKeywords.map(k => <span key={k} className="tag-jd-match">{k}</span>)}
                    </div>
                  )}
                  {results.jdMissingKeywords.length > 0 && (
                    <div>
                      <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: "#9D174D", fontWeight: 700, marginBottom: 8, letterSpacing: "0.8px" }}>✗ MISSING FROM YOUR RESUME</div>
                      {results.jdMissingKeywords.map(k => <span key={k} className="tag-jd-miss">{k}</span>)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suggestions + Keywords/Section Strength */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div className="card">
                <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 14, color: "#1e1e2e", marginBottom: 16 }}>Improvement Suggestions</h3>
                {results.suggestions.length > 0
                  ? results.suggestions.map((s, i) => (
                    <div key={i} className="suggestion-item">
                      <div className="pulse-dot" />
                      <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "#374151", lineHeight: 1.5 }}>{s}</p>
                    </div>
                  ))
                  : <p style={{ fontFamily: "'Crimson Pro', serif", color: "#9CA3AF", fontSize: 14 }}>No suggestions returned.</p>
                }
              </div>

              <div className="card">
                {results.keywords.length > 0 && (
                  <>
                    <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 14, color: "#1e1e2e", marginBottom: 12 }}>Top Keywords Found</h3>
                    <div style={{ marginBottom: 22 }}>
                      {results.keywords.map(k => <span key={k} className="tag-keyword">{k}</span>)}
                    </div>
                  </>
                )}

                {/* Section Strength — use API data if present, fallback to defaults */}
                <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 14, color: "#1e1e2e", marginBottom: 14 }}>Section Strength</h3>
                {(Object.keys(results.sectionStrength).length > 0
                  ? Object.entries(results.sectionStrength)
                  : defaultSections
                ).map(([label, val]) => (
                  <div key={label} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 600, color: "#374151" }}>{label}</span>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 700, color: "#4F46E5" }}>{val}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Matches */}
            {results.jobMatches.length > 0 && (
              <div className="card">
                <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 14, color: "#1e1e2e", marginBottom: 16 }}>Top Job Matches</h3>
                {results.jobMatches.map((j, i) => (
                  <div key={i} className="job-card">
                    <div>
                      <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15, color: "#1e1e2e", marginBottom: 3 }}>{j.title}</div>
                      <div style={{ fontFamily: "'Crimson Pro', serif", color: "#6B7280", fontSize: 14 }}>{j.company}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className="match-badge">{j.match}% Match</span>
                      <button className="btn-orange" style={{ padding: "8px 20px", fontSize: 12 }}>Apply Now</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}