/** Content from the student's uploaded Student Workbook V2, A1–A9 Field Guide and A6–A8 review. */

export interface WorkbookPage {
  page: number;
  title: string;
  objectives: string[];
  vocab?: string[];
  questions: { q: string; a: string }[];
}

export const WORKBOOK: WorkbookPage[] = [
  { page: 1, title: "Technician Mindset & Diagnostic Process", objectives: ["Explain why diagnosis starts with information, not parts.", "List the 7 steps of the diagnostic process."], vocab: ["Concern", "Symptom", "Diagnosis", "Verification", "Root cause"], questions: [
    { q: "Why is it important to confirm the customer concern first?", a: "Verify the concern first to avoid misdiagnosis — if you can't duplicate it, you can't prove you fixed it." },
    { q: "What is the difference between a symptom and a root cause?", a: "A symptom is what the driver notices (misfire, noise); the root cause is the failed part or condition creating it." }] },
  { page: 2, title: "Engine Mechanical & Four-Stroke Theory", objectives: ["Identify the four strokes of engine operation.", "Recognize common engine failure symptoms."], questions: [
    { q: "The four strokes are ___, ___, ___ and ___.", a: "Intake, Compression, Power, Exhaust." },
    { q: "A low compression reading may indicate ___ or ___ problems.", a: "Valve (sealing) or piston ring / cylinder problems — confirm with a leak-down test." }] },
  { page: 3, title: "Fuel Systems & Air Induction", objectives: ["Identify major fuel system parts.", "Understand volumetric efficiency."], questions: [
    { q: "What is the difference between a rich and lean condition?", a: "Rich = too much fuel for the air (negative trims); lean = too little fuel for the air (positive trims)." },
    { q: "How does a dirty air filter affect engine performance?", a: "It restricts airflow and lowers volumetric efficiency, reducing power under load." }] },
  { page: 4, title: "Ignition Systems & Misfire Diagnosis", objectives: ["Describe how spark timing affects engine operation.", "Interpret simple misfire symptoms."], questions: [
    { q: "What are common signs of a misfire?", a: "Rough idle, shaking, flashing MIL, P030X codes, hesitation under load." },
    { q: "Why does ignition timing matter?", a: "Peak cylinder pressure must occur just after TDC; wrong timing costs power, raises temps, or causes knock." }] },
  { page: 5, title: "Electrical Fundamentals & Ohm's Law", objectives: ["Apply Ohm's law in simple circuit problems.", "Identify the purpose of fuses and relays."], questions: [
    { q: "If voltage is 12 V and resistance is 4 Ω, what is the current?", a: "I = V / R = 12 / 4 = 3 amps." },
    { q: "Why is a bad ground a common cause of electrical problems?", a: "Every circuit returns through ground; corrosion adds resistance, dropping voltage at the load." }] },
  { page: 6, title: "Advanced Electrical & Circuit Testing", objectives: ["Explain voltage drop testing.", "Identify circuit protection devices."], questions: [
    { q: "Why is voltage drop testing better than a continuity test?", a: "It tests the circuit loaded; one strand of wire passes continuity but can't carry current." },
    { q: "What happens to a circuit if a fuse blows?", a: "The circuit opens (0 V at the load). Find the short before replacing the fuse." }] },
  { page: 7, title: "Braking Systems & Hydraulics", objectives: ["Describe hydraulic brake operation.", "Identify common brake complaints."], questions: [
    { q: "What can cause a brake pedal to feel spongy?", a: "Air in the hydraulic lines — bleed the system." },
    { q: "What is the primary function of the master cylinder?", a: "Convert pedal force into hydraulic pressure for the wheel brakes." }] },
  { page: 8, title: "Anti-Lock Braking Systems (ABS)", objectives: ["Explain ABS at a basic level.", "Identify ABS wheel speed sensors."], questions: [
    { q: "What is the purpose of the ABS hydraulic modulator?", a: "It holds, releases and reapplies pressure to individual wheels to prevent lockup." },
    { q: "Can a vehicle still stop if the ABS light is on?", a: "Yes — base brakes still work; only anti-lock function is disabled." }] },
  { page: 9, title: "Steering & Suspension Geometry", objectives: ["Identify common steering parts.", "Understand alignment angles (Camber, Caster, Toe)."], questions: [
    { q: "What does a worn ball joint feel like?", a: "Clunks over bumps, wander, and play when the wheel is rocked top-to-bottom." },
    { q: "Which alignment angle is most responsible for tire wear?", a: "Toe — it scrubs the tire sideways (feathering)." }] },
  { page: 10, title: "Tire & Wheel Service", objectives: ["Recognize tire wear patterns.", "Understand TPMS."], questions: [
    { q: "Inside edge wear?", a: "Excess negative camber or toe-out." },
    { q: "Cupping?", a: "Worn shocks/struts or imbalance." },
    { q: "Center wear?", a: "Over-inflation." }] },
  { page: 11, title: "Heating, Ventilation & Air Conditioning", objectives: ["Describe the refrigeration cycle.", "Identify basic HVAC components."], questions: [
    { q: "What does the condenser do?", a: "Removes heat from high-pressure vapor so it changes state to liquid." },
    { q: "What is the job of the blend door?", a: "Mixes hot (heater core) and cold (evaporator) air to set vent temperature." }] },
  { page: 12, title: "Manual Transmissions & Drivelines", objectives: ["Identify driveline components.", "Understand clutch operation."], questions: [
    { q: "Common symptoms of a slipping clutch?", a: "RPM rises without road speed gain, burning smell, worse in high gear under load." },
    { q: "Purpose of a differential?", a: "Lets drive wheels turn at different speeds in turns while delivering torque." }] },
  { page: 13, title: "Automatic Transmissions & Transaxles", objectives: ["Identify shifting complaints.", "Understand torque converter function."], questions: [
    { q: "What causes harsh shifting?", a: "High line pressure, faulty pressure control solenoid, wrong fluid, or bad adaptives." },
    { q: "Why is fluid condition critical?", a: "Fluid is the hydraulic medium, coolant and friction modifier — burnt fluid means clutch damage." }] },
  { page: 14, title: "Hybrid & EV Safety", objectives: ["Identify high-voltage components by color.", "Describe proper PPE for EV service."], questions: [
    { q: "What color are high-voltage cables?", a: "Orange." },
    { q: "Why do Class 0 high-voltage gloves matter?", a: "They're rated to 1,000 V; inspect and air-test before every use." }] },
  { page: 15, title: "Service Write-up & Customer Communication", objectives: ["Understand the 3 C's (Complaint, Cause, Correction).", "Practice professional communication."], questions: [
    { q: "How do you document a Correction on a repair order?", a: "State exactly what was replaced/repaired, the test that proved the cause, and the verification performed." }] },
  { page: 16, title: "Final Comprehensive Diagnostic Review", objectives: ["Tie the process together."], questions: [
    { q: "What makes a test result trustworthy?", a: "It is repeatable, measured against a spec, and taken under the conditions where the fault occurs." },
    { q: "Why is verification part of the repair?", a: "Without proof of fix you guessed — verification closes the 7-step loop." }] },
];

export const GOLDEN_RULES = [
  { area: "A1", focus: "Engine Repair", concept: "Mechanical Integrity", rule: "Always perform a compression test first." },
  { area: "A2", focus: "Automatic Trans", concept: "Hydraulics / Pressure", rule: "Burnt fluid = clutch failure." },
  { area: "A3", focus: "Manual Drivetrain", concept: "Torque Transfer", rule: "Clutch chatter = mechanical surface issue." },
  { area: "A4", focus: "Steering / Suspension", concept: "Geometry / Alignment", rule: "Tire wear tells the truth about alignment." },
  { area: "A5", focus: "Brakes", concept: "Friction / Hydraulics", rule: "Air in lines = spongy pedal." },
  { area: "A6", focus: "Electrical", concept: "Circuit Logic", rule: "Voltage drop is the only way to find resistance." },
  { area: "A7", focus: "HVAC", concept: "Refrigeration Cycle", rule: "State change (liquid to gas) is key." },
  { area: "A8", focus: "Engine Performance", concept: "Fuel Trim", rule: "(+) is lean (add fuel), (−) is rich (cut fuel)." },
  { area: "A9", focus: "Diesel", concept: "High-Pressure Injection", rule: "Black smoke = not enough air." },
];

export const KEY_TERMS = [
  { term: "Voltage Drop", def: "The loss of electrical pressure across a connection." },
  { term: "Fuel Trim", def: "The PCM's adjustment to keep the air/fuel mix at 14.7:1." },
  { term: "Differential Pressure", def: "Pressure difference before and after a DPF; tells you if it's clogged." },
  { term: "Camber / Toe / Caster", def: "The three angles that dictate how a tire meets the road." },
  { term: "Parasitic Draw", def: "Current flowing with the ignition off (max ~50 mA)." },
];

export const REALITY_CHECK = [
  { title: "Mechanical or electrical?", body: "Don't try to code your way out of a broken physical part — a clogged cat is a restriction no reset will fix." },
  { title: "What is the data saying?", body: "Trust scan data over gut feel. −40°F coolant in summer means a bad sensor or wiring, not a frozen engine." },
  { title: "The textbook answer", body: "The test wants the safest, most accurate diagnostic step — a voltage drop test, not a hammer tap." },
];

export const SHOP_STORY = {
  title: "The Expensive Guess",
  body: "A no-start car: replaced the starter, then the battery — $400 of the customer's money — before finding a ground cable hanging by one thread. A $10 cable fixed it.",
  lesson: "Never reach for your wallet before you reach for your multimeter. Test, don't guess.",
};

export const GRADING = "Grading: 25% Theory · 50% Lab Accuracy · 25% Final Exam. Zero tolerance for missing PPE or improper lift use.";
