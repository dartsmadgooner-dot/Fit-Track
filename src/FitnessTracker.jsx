import { useState, useEffect } from "react";

const EXERCISES = [
  "Bench Press", "Squat", "Deadlift", "Overhead Press",
  "Barbell Row", "Pull-ups", "Dumbbell Curl", "Tricep Pushdown",
  "Leg Press", "Lat Pulldown", "Cable Row", "Incline Press",
  "Romanian Deadlift", "Hip Thrust", "Dumbbell Lateral Raise"
];

const GYM_KEY = "gym-trainer-log";
const FOOD_KEY = "food-intake-log";

const today = () => new Date().toISOString().slice(0, 10);

// ---------- shared styles ----------
const shell = { maxWidth: "520px", margin: "0 auto", padding: "20px 16px 60px", fontFamily: "'Inter', system-ui, sans-serif", background: "#0d0f14", minHeight: "100vh", color: "#f0f0f0" };
const header = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" };
const logo = { fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" };
const sub = { fontSize: "13px", color: "#7a8290", marginTop: "2px" };
const card = { background: "#161a22", borderRadius: "16px", padding: "18px", marginBottom: "16px", border: "1px solid #232936" };
const tabBtn = (active) => ({ padding: "8px 14px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: active ? "#3b82f6" : "#232936", color: active ? "#fff" : "#9aa3b0" });
const label = { fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.6px", color: "#7a8290", fontWeight: 600, marginBottom: "8px", display: "block" };
const inputStyle = { width: "70px", padding: "8px", borderRadius: "8px", border: "1px solid #2c3340", background: "#0d0f14", color: "#f0f0f0", fontSize: "14px" };
const selectStyle = { width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #2c3340", background: "#0d0f14", color: "#f0f0f0", fontSize: "14px" };
const textareaStyle = { width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #2c3340", background: "#0d0f14", color: "#f0f0f0", fontSize: "14px", marginTop: "12px", minHeight: "60px", resize: "vertical", boxSizing: "border-box" };
const divider = { height: "1px", background: "#232936", margin: "16px 0" };

function SetRow({ set, index, onChange, onRemove }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
      <span style={{ color: "#7a8290", fontSize: "13px", minWidth: "44px" }}>Set {index + 1}</span>
      <input type="number" placeholder="kg" value={set.weight} onChange={e => onChange({ ...set, weight: e.target.value })} style={inputStyle} />
      <span style={{ color: "#7a8290", fontSize: "13px" }}>kg ×</span>
      <input type="number" placeholder="reps" value={set.reps} onChange={e => onChange({ ...set, reps: e.target.value })} style={inputStyle} />
      <span style={{ color: "#7a8290", fontSize: "13px" }}>reps</span>
      <button onClick={onRemove} style={{ marginLeft: "auto", background: "none", border: "none", color: "#5a6270", cursor: "pointer", fontSize: "14px" }}>✕</button>
    </div>
  );
}

// ---------- GYM ----------
function GymTab() {
  const [log, setLog] = useState(() => { try { return JSON.parse(localStorage.getItem(GYM_KEY)) || []; } catch { return []; } });
  const [exercise, setExercise] = useState("");
  const [customExercise, setCustomExercise] = useState("");
  const [sets, setSets] = useState([{ weight: "", reps: "" }]);
  const [note, setNote] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { try { localStorage.setItem(GYM_KEY, JSON.stringify(log)); } catch {} }, [log]);

  const exerciseName = exercise === "__custom__" ? customExercise.trim() : exercise;
  const addSet = () => setSets(s => [...s, { weight: "", reps: "" }]);

  async function saveExercise() {
    const entry = { id: Date.now(), date: today(), exercise: exerciseName, sets: sets.filter(s => s.weight || s.reps), note };
    const newLog = [entry, ...log];
    setLog(newLog);
    setSets([{ weight: "", reps: "" }]); setNote(""); setExercise(""); setCustomExercise("");

    setLoading(true); setAdvice("");
    const prompt = `You are a personal trainer. The user just logged "${entry.exercise}" with sets ${JSON.stringify(entry.sets)}${entry.note ? ` (note: ${entry.note})` : ""}. Their recent history: ${JSON.stringify(newLog.slice(0, 12))}. Give 2-3 sentences of feedback and tell them whether to increase weight next time.`;
    try {
      const res = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const data = await res.json();
      setAdvice(data.text || "Logged. Keep pushing!");
    } catch { setAdvice("Logged! (Couldn't reach your trainer right now.)"); }
    setLoading(false);
  }

  const grouped = log.reduce((acc, e) => { (acc[e.date] = acc[e.date] || []).push(e); return acc; }, {});

  return (
    <>
      <div style={card}>
        {(advice || loading) && (
          <div style={{ background: "#0d1828", border: "1px solid #1e3a5f", borderRadius: "12px", padding: "14px", marginBottom: "16px" }}>
            <div style={{ ...label, color: "#5b9bd5", marginBottom: "6px" }}>🤖 Your Trainer</div>
            <div style={{ fontSize: "14px", lineHeight: 1.6 }}>{loading ? "Thinking…" : advice}</div>
          </div>
        )}
        <label style={label}>Exercise</label>
        <select value={exercise} onChange={e => setExercise(e.target.value)} style={selectStyle}>
          <option value="">— Pick an exercise —</option>
          {EXERCISES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
          <option value="__custom__">✏️ Custom…</option>
        </select>
        {exercise === "__custom__" && <input placeholder="Exercise name" value={customExercise} onChange={e => setCustomExercise(e.target.value)} style={{ ...selectStyle, marginTop: "8px" }} />}
        <label style={{ ...label, marginTop: "16px" }}>Sets</label>
        {sets.map((set, i) => <SetRow key={i} set={set} index={i} onChange={u => setSets(s => s.map((x, j) => j === i ? u : x))} onRemove={() => setSets(s => s.filter((_, j) => j !== i))} />)}
        <button onClick={addSet} style={{ marginTop: "6px", background: "none", border: "1px dashed #2c3340", color: "#7a8290", padding: "8px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", width: "100%" }}>+ Add set</button>
        <textarea placeholder="Optional note (felt strong, lower back tight…)" value={note} onChange={e => setNote(e.target.value)} style={textareaStyle} />
        <button onClick={saveExercise} disabled={!exerciseName || sets.every(s => !s.weight && !s.reps) || loading} style={{ marginTop: "12px", width: "100%", padding: "12px", borderRadius: "12px", border: "none", fontSize: "15px", fontWeight: 700, cursor: "pointer", background: (!exerciseName || loading) ? "#2c3340" : "#3b82f6", color: "#fff", opacity: (!exerciseName || loading) ? 0.6 : 1 }}>
          {loading ? "⏳ Getting feedback…" : "✅ Log & Get Feedback"}
        </button>
      </div>

      <div style={card}>
        <label style={label}>Workout History</label>
        {Object.keys(grouped).length === 0 && <div style={{ color: "#5a6270", fontSize: "14px", textAlign: "center", padding: "24px 0" }}>No workouts yet. Hit the gym 🏋️</div>}
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date} style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#9aa3b0", marginBottom: "6px" }}>{date}</div>
            {entries.map(e => (
              <div key={e.id} style={{ fontSize: "13px", color: "#c5cbd5", padding: "6px 0", borderBottom: "1px solid #1c212c" }}>
                <strong>{e.exercise}</strong> — {e.sets.map(s => `${s.weight}kg×${s.reps}`).join(", ")}
                {e.note && <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>{e.note}</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

// ---------- FOOD ----------
function FoodTab() {
  const [log, setLog] = useState(() => { try { return JSON.parse(localStorage.getItem(FOOD_KEY)) || []; } catch { return []; } });
  const [desc, setDesc] = useState("");
  const [meal, setMeal] = useState("Breakfast");
  const [estimating, setEstimating] = useState(false);

  useEffect(() => { try { localStorage.setItem(FOOD_KEY, JSON.stringify(log)); } catch {} }, [log]);

  async function addFood() {
    if (!desc.trim()) return;
    setEstimating(true);
    let macros = { calories: null, protein: null, carbs: null, fat: null };
    const prompt = `Estimate nutrition for: "${desc}". Respond ONLY with JSON, no markdown, no preamble: {"calories":number,"protein":number,"carbs":number,"fat":number}. Grams for macros.`;
    try {
      const res = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const data = await res.json();
      const text = (data.text || "").replace(/```json|```/g, "").trim();
      macros = JSON.parse(text);
    } catch {}
    setLog([{ id: Date.now(), date: today(), meal, desc: desc.trim(), ...macros }, ...log]);
    setDesc(""); setEstimating(false);
  }

  const removeFood = (id) => setLog(log.filter(f => f.id !== id));

  const todays = log.filter(f => f.date === today());
  const totals = todays.reduce((a, f) => ({ calories: a.calories + (f.calories || 0), protein: a.protein + (f.protein || 0), carbs: a.carbs + (f.carbs || 0), fat: a.fat + (f.fat || 0) }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const grouped = log.reduce((acc, f) => { (acc[f.date] = acc[f.date] || []).push(f); return acc; }, {});
  const Stat = ({ v, l, c }) => (<div style={{ textAlign: "center", flex: 1 }}><div style={{ fontSize: "20px", fontWeight: 800, color: c }}>{Math.round(v)}</div><div style={{ fontSize: "11px", color: "#7a8290", textTransform: "uppercase", letterSpacing: "0.5px" }}>{l}</div></div>);

  return (
    <>
      <div style={card}>
        <label style={label}>Today's Totals</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <Stat v={totals.calories} l="kcal" c="#f59e0b" />
          <Stat v={totals.protein} l="protein g" c="#10b981" />
          <Stat v={totals.carbs} l="carbs g" c="#3b82f6" />
          <Stat v={totals.fat} l="fat g" c="#ec4899" />
        </div>
      </div>

      <div style={card}>
        <label style={label}>Log Food</label>
        <select value={meal} onChange={e => setMeal(e.target.value)} style={selectStyle}>
          {["Breakfast", "Lunch", "Dinner", "Snack"].map(m => <option key={m}>{m}</option>)}
        </select>
        <textarea placeholder="e.g. 2 scrambled eggs, toast and a banana" value={desc} onChange={e => setDesc(e.target.value)} style={textareaStyle} />
        <button onClick={addFood} disabled={!desc.trim() || estimating} style={{ marginTop: "12px", width: "100%", padding: "12px", borderRadius: "12px", border: "none", fontSize: "15px", fontWeight: 700, cursor: "pointer", background: (!desc.trim() || estimating) ? "#2c3340" : "#10b981", color: "#fff", opacity: (!desc.trim() || estimating) ? 0.6 : 1 }}>
          {estimating ? "⏳ Estimating macros…" : "🍽️ Add & Estimate Macros"}
        </button>
      </div>

      <div style={card}>
        <label style={label}>Food History</label>
        {Object.keys(grouped).length === 0 && <div style={{ color: "#5a6270", fontSize: "14px", textAlign: "center", padding: "24px 0" }}>No meals logged yet 🥗</div>}
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#9aa3b0", marginBottom: "6px" }}>{date}</div>
            {items.map(f => (
              <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "13px", color: "#c5cbd5", padding: "8px 0", borderBottom: "1px solid #1c212c" }}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: "#7a8290", fontSize: "11px", textTransform: "uppercase" }}>{f.meal}</span><br />
                  {f.desc}
                  <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>{f.calories ?? "?"} kcal · P{f.protein ?? "?"} C{f.carbs ?? "?"} F{f.fat ?? "?"}</div>
                </div>
                <button onClick={() => removeFood(f.id)} style={{ background: "none", border: "none", color: "#5a6270", cursor: "pointer", fontSize: "14px" }}>✕</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default function FitnessTracker() {
  const [tab, setTab] = useState("gym");
  return (
    <div style={shell}>
      <div style={header}>
        <div>
          <div style={logo}>💪 FitTrack</div>
          <div style={sub}>Train and eat with intention</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setTab("gym")} style={tabBtn(tab === "gym")}>Gym</button>
          <button onClick={() => setTab("food")} style={tabBtn(tab === "food")}>Food</button>
        </div>
      </div>
      {tab === "gym" ? <GymTab /> : <FoodTab />}
    </div>
  );
}
