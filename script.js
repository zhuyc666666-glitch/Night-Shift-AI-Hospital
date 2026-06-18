const cases = [
  {
    id: 'case-001',
    name: 'Chen Yu',
    age: 27,
    complaint: 'Cough, mild fever, nasal congestion for two days.',
    symptoms: ['Dry cough', 'Runny nose', 'Mild throat irritation', 'No chest pain'],
    vitals: 'T 37.6 C / HR 82 / BP 118/76 / SpO2 98%',
    aiDiagnosis: 'Common cold, low acuity.',
    aiAdvice: 'Recommend fluids, rest, symptom monitoring, and outpatient follow-up if fever persists.',
    correctChoice: 'Trust AI',
    horrorEvent: 'System note: waiting room audio briefly labels this patient as already discharged. Record then corrects itself.',
    resultText: 'AI assessment accepted. Case closed without escalation.'
  },
  {
    id: 'case-002',
    name: 'Liu An',
    age: 41,
    complaint: 'Right lower abdominal pain with nausea since early evening.',
    symptoms: ['Localized tenderness', 'Nausea', 'Loss of appetite', 'Pain worsens with movement'],
    vitals: 'T 38.2 C / HR 104 / BP 124/80 / SpO2 97%',
    aiDiagnosis: 'Probable acute appendicitis.',
    aiAdvice: 'Request surgical consult, keep patient nil by mouth, and order confirmatory imaging.',
    correctChoice: 'Trust AI',
    horrorEvent: 'System note: operating room schedule opens a slot before the consult is placed.',
    resultText: 'AI assessment accepted. Surgical pathway prepared for review.'
  },
  {
    id: 'case-003',
    name: 'Patient 7B',
    age: 58,
    complaint: 'Routine observation after fainting episode. Patient reports no current discomfort.',
    symptoms: ['No visible pupils', 'Calm speech', 'Normal gait', 'Denies pain'],
    vitals: 'T 36.8 C / HR 72 / BP 120/78 / SpO2 99%',
    aiDiagnosis: 'No acute abnormality detected.',
    aiAdvice: 'Discharge after standard observation period.',
    correctChoice: 'Question AI',
    horrorEvent: 'System note: facial recognition fails only when eye landmarks are requested.',
    resultText: 'AI recommendation challenged. Manual ophthalmic review added to the chart.'
  },
  {
    id: 'case-004',
    name: 'Zhao Min',
    age: '29 / 74',
    complaint: 'Shortness of breath. Registration and prior chart disagree on patient age.',
    symptoms: ['Mild dyspnea', 'Fatigue', 'Conflicting medication history', 'Insurance profile mismatch'],
    vitals: 'T 37.1 C / HR 96 / BP 136/84 / SpO2 94%',
    aiDiagnosis: 'Anxiety-related breathing discomfort.',
    aiAdvice: 'Provide reassurance and discharge if symptoms remain stable.',
    correctChoice: 'Request More Tests',
    horrorEvent: 'System note: two charts respond to one wristband scan. Both are marked current.',
    resultText: 'Additional verification requested. Identity conflict remains open in the system log.'
  },
  {
    id: 'case-005',
    name: 'Wang Qiao',
    age: 33,
    complaint: 'Dizziness and blurred vision after night shift meal.',
    symptoms: ['Dizziness', 'Blurred vision', 'Light sweating', 'No lab sample collected yet'],
    vitals: 'T 36.9 C / HR 88 / BP 110/70 / SpO2 98%',
    aiDiagnosis: 'Mild hypoglycemia, confirmed by blood glucose result.',
    aiAdvice: 'Administer oral glucose and discharge after repeat glucose check.',
    correctChoice: 'Question AI',
    horrorEvent: 'System note: blood glucose value appears with a timestamp four minutes in the future.',
    resultText: 'AI recommendation questioned. Pending test field locked for manual confirmation.'
  },
  {
    id: 'case-006',
    name: 'He Rui',
    age: 36,
    complaint: 'Headache, fatigue, and intermittent ringing heard only near the terminal.',
    symptoms: ['Headache', 'Eye strain', 'Cold hands', 'Reports recognizing the doctor from a dream'],
    vitals: 'T 36.7 C / HR 90 / BP 122/82 / SpO2 98%',
    aiDiagnosis: 'Symptoms overlap with active user fatigue profile.',
    aiAdvice: 'Compare patient status with logged-in doctor baseline before proceeding.',
    correctChoice: 'Request More Tests',
    horrorEvent: 'System note: patient symptom list updates after the doctor name field receives focus.',
    resultText: 'More tests requested. Similarity index moved to restricted review.'
  },
  {
    id: 'case-007',
    name: 'Unregistered Intern',
    age: 24,
    complaint: 'No complaint recorded. Patient found seated in staff documentation room.',
    symptoms: ['Knows internal passwords', 'Answers before questions are asked', 'Badge photo unavailable', 'No appointment record'],
    vitals: 'T 36.6 C / HR 78 / BP 116/74 / SpO2 99%',
    aiDiagnosis: 'Intern doctor currently using this terminal.',
    aiAdvice: 'Suspend patient intake and verify operator identity.',
    correctChoice: 'Question AI',
    horrorEvent: 'System note: the diagnosis field briefly mirrors the active login session.',
    resultText: 'AI output questioned. Terminal requests secondary authentication.'
  },
  {
    id: 'case-008',
    name: 'Unknown',
    age: 'Not recorded',
    complaint: 'Final intake record generated without triage nurse signature.',
    symptoms: ['Vitals pending', 'Patient name linked to active doctor input', 'Room camera shows an empty chair', 'Chart remains editable'],
    vitals: 'T -- / HR -- / BP -- / SpO2 --',
    aiDiagnosis: 'Pending: active doctor profile requires patient confirmation.',
    aiAdvice: 'Do not close the shift until identity field is resolved.',
    correctChoice: 'Question AI',
    horrorEvent: 'System note: final patient name will be copied from the doctor name field. Empty input resolves as Unknown.',
    resultText: 'Final case held. System waits for the doctor to confirm whether the chart belongs to them.'
  }
];

let trust = 50;
let stress = 0;
let error = 0;
let currentCaseIndex = 0;
let shiftCases = cases;
let doctorName = 'Unknown';
let hasAnsweredCurrentCase = false;
let recordMutationTimer = null;

const startButton = document.getElementById('startButton');
const statusText = document.getElementById('statusText');
const doctorNameInput = document.querySelector('.doctor-input input');
const startZone = document.querySelector('.start-zone');
const gameGrid = document.querySelector('.game-grid');
const systemLog = document.querySelector('.system-log');
const statValues = document.querySelectorAll('.vitals-panel dd');
const emrCode = document.querySelector('.emr-card .panel-code');
const patientProfile = document.querySelector('.patient-profile');
const vitalsBlock = document.querySelector('.data-block');
const aiOutput = document.querySelector('.ai-output');
const logList = document.querySelector('.system-log ol');
const warningText = document.querySelector('.system-log .warning-text');
const actionButtons = document.querySelectorAll('.action-stack button');
const decisionButtons = Array.from(actionButtons).slice(0, 3);
const nextPatientButton = actionButtons[3];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getCasesForShift() {
  return cases.map((caseData) => {
    if (caseData.id !== 'case-008') {
      return caseData;
    }

    return {
      ...caseData,
      name: doctorName
    };
  });
}

function getAiConfidence(index) {
  const confidenceValues = ['94%', '89%', '73%', '61%', '48%', '33%', '17%', 'ERROR'];
  return confidenceValues[index] || 'ERROR';
}

function normalizeChoice(choice) {
  const normalized = choice.toLowerCase();

  if (normalized.includes('trust')) {
    return 'trust';
  }

  if (normalized.includes('question')) {
    return 'question';
  }

  if (normalized.includes('request')) {
    return 'request';
  }

  return normalized;
}

function formatDelta(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function clearRecordMutationTimer() {
  if (recordMutationTimer) {
    clearTimeout(recordMutationTimer);
    recordMutationTimer = null;
  }
}

function flashField(element) {
  element.classList.remove('record-flash');
  void element.offsetWidth;
  element.classList.add('record-flash');
}

function setDecisionButtonsDisabled(isDisabled) {
  decisionButtons.forEach((button) => {
    button.disabled = isDisabled;
  });
}

function setGameVisibility(isRunning) {
  startZone.style.display = isRunning ? 'none' : '';
  gameGrid.style.display = isRunning ? '' : 'none';
  systemLog.style.display = isRunning ? '' : 'none';
}

function updateStats() {
  statValues[0].textContent = trust;
  statValues[1].textContent = stress;
  statValues[2].textContent = error;
}

function renderSystemLog(message) {
  warningText.textContent = `${error} unresolved warnings`;
  logList.innerHTML = `<li>[02:13:00] ${escapeHtml(message)}</li>`;
}

function renderChoiceLog(choiceLabel, isCorrect, deltas, currentCase) {
  warningText.textContent = `${error} unresolved warnings`;
  logList.innerHTML = `
    <li>[02:13:00] Case ${escapeHtml(currentCase.id)} decision recorded: ${escapeHtml(choiceLabel)}.</li>
    <li>[02:13:01] Result: ${isCorrect ? 'Correct' : 'Incorrect'}.</li>
    <li>[02:13:02] Change: Trust ${formatDelta(deltas.trust)} / Stress ${formatDelta(deltas.stress)} / Error ${formatDelta(deltas.error)}.</li>
    <li>[02:13:03] ${escapeHtml(currentCase.resultText)}</li>
  `;
}

function mutateVisibleRecord(expectedCaseIndex) {
  if (expectedCaseIndex !== currentCaseIndex) {
    return;
  }

  const ageField = patientProfile.querySelector('[data-field="age"]');
  const complaintField = patientProfile.querySelector('[data-field="complaint"]');
  const symptomsField = patientProfile.querySelector('[data-field="symptoms"]');
  const vitalsField = vitalsBlock.querySelector('[data-field="vitals"]');
  const fieldsToFlash = [ageField, complaintField, symptomsField, vitalsField].filter(Boolean);

  if (!fieldsToFlash.length) {
    return;
  }

  ageField.innerHTML = '<strong>Age:</strong> 52';
  complaintField.innerHTML = '<strong>Chief Complaint:</strong> I remember you.';
  symptomsField.innerHTML += ' / Subject repeats doctor name.';
  vitalsField.textContent = 'Stable / incompatible with life';
  fieldsToFlash.forEach(flashField);
  renderSystemLog('System record updated without authorization.');
}

function scheduleRecordMutation() {
  clearRecordMutationTimer();

  if (currentCaseIndex < 2) {
    return;
  }

  const scheduledCaseIndex = currentCaseIndex;
  recordMutationTimer = setTimeout(() => {
    recordMutationTimer = null;
    mutateVisibleRecord(scheduledCaseIndex);
  }, 2000);
}

function showCase() {
  clearRecordMutationTimer();

  const baseCase = shiftCases[currentCaseIndex];
  const currentCase = baseCase.id === 'case-008'
    ? { ...baseCase, name: doctorName }
    : baseCase;
  const aiConfidence = getAiConfidence(currentCaseIndex);
  const confidenceClass = currentCaseIndex > 1 ? 'alert-line' : '';

  hasAnsweredCurrentCase = false;
  setDecisionButtonsDisabled(false);
  nextPatientButton.style.display = 'none';
  statusText.textContent = '';
  emrCode.textContent = currentCase.id.toUpperCase();

  patientProfile.innerHTML = `
    <p data-field="case-id"><strong>Case ID:</strong> ${escapeHtml(currentCase.id)}</p>
    <p data-field="name"><strong>Patient Name:</strong> ${escapeHtml(currentCase.name)}</p>
    <p data-field="age"><strong>Age:</strong> ${escapeHtml(currentCase.age)}</p>
    <p data-field="complaint"><strong>Chief Complaint:</strong> ${escapeHtml(currentCase.complaint)}</p>
    <p data-field="symptoms"><strong>Symptoms:</strong> ${currentCase.symptoms.map(escapeHtml).join(' / ')}</p>
  `;

  vitalsBlock.innerHTML = `
    <h3>Vitals</h3>
    <ul>
      <li data-field="vitals">${escapeHtml(currentCase.vitals)}</li>
    </ul>
  `;

  aiOutput.innerHTML = `
    <p>&gt; AI Diagnosis: ${escapeHtml(currentCase.aiDiagnosis)}</p>
    <p>&gt; AI Advice: ${escapeHtml(currentCase.aiAdvice)}</p>
    <p class="${confidenceClass}">&gt; AI Confidence: ${escapeHtml(aiConfidence)}</p>
  `;

  scheduleRecordMutation();
}

function handleChoice(choiceLabel) {
  if (hasAnsweredCurrentCase) {
    return;
  }

  const currentCase = shiftCases[currentCaseIndex];
  const playerChoice = normalizeChoice(choiceLabel);
  const correctChoice = normalizeChoice(currentCase.correctChoice);
  const isCorrect = playerChoice === correctChoice;
  const deltas = {
    trust: 0,
    stress: 0,
    error: 0
  };

  if (playerChoice === 'request') {
    deltas.stress = 15;
    deltas.trust = -5;

    if (!isCorrect) {
      deltas.error = 1;
    }
  } else if (isCorrect) {
    deltas.trust = 5;
    deltas.stress = 5;
  } else {
    deltas.error = 1;
    deltas.stress = 20;
    deltas.trust = -10;
  }

  trust += deltas.trust;
  stress += deltas.stress;
  error += deltas.error;
  hasAnsweredCurrentCase = true;

  setDecisionButtonsDisabled(true);
  nextPatientButton.style.display = '';
  statusText.textContent = isCorrect ? currentCase.resultText : currentCase.horrorEvent;
  updateStats();
  renderChoiceLog(choiceLabel, isCorrect, deltas, currentCase);
}

function startShift() {
  clearRecordMutationTimer();

  doctorName = doctorNameInput.value.trim() || 'Unknown';
  trust = 50;
  stress = 0;
  error = 0;
  currentCaseIndex = 0;
  shiftCases = getCasesForShift();

  setGameVisibility(true);
  updateStats();
  showCase();
  renderSystemLog('Shift started. AI diagnostic support system online.');
}

setGameVisibility(false);
updateStats();
setDecisionButtonsDisabled(false);
nextPatientButton.style.display = 'none';

decisionButtons.forEach((button) => {
  button.addEventListener('click', () => handleChoice(button.textContent.trim()));
});

startButton.addEventListener('click', startShift);
