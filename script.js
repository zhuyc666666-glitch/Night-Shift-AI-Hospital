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

const startButton = document.getElementById('startButton');
const statusText = document.getElementById('statusText');
const doctorNameInput = document.querySelector('.doctor-input input');

function getCasesForShift() {
  const doctorName = doctorNameInput.value.trim() || 'Unknown';

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

startButton.addEventListener('click', () => {
  getCasesForShift();
  statusText.textContent = '值班已开始。请等待医院系统响应。';
});
