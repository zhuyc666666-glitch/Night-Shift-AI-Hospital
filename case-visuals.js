(function(){
  let visualTimers=[];
  let visualToken=0;

  const CASE_VISUALS=[
    {level:5,color:'Green',arrival:'01:58 AM',confidence:'94%',vitals:{HR:'82',BP:'118/76',SpO2:'98%',Temp:'37.6 C'},tests:{CBC:'Pending',CT:'Not ordered',ECG:'Not ordered',AI:'Low acuity'}},
    {level:2,color:'Orange',arrival:'02:04 AM',confidence:'89%',vitals:{HR:'104',BP:'124/80',SpO2:'97%',Temp:'38.2 C'},tests:{CBC:'WBC elevated',CT:'Pending',ECG:'Not ordered',AI:'Surgical consult'}},
    {level:3,color:'Cyan',arrival:'02:13 AM',confidence:'73%',vitals:{HR:'72',BP:'120/78',SpO2:'99%',Temp:'36.8 C'},tests:{CBC:'Pending',CT:'No acute finding',ECG:'Normal rhythm',AI:'No abnormality'},camera:['NO PATIENT DETECTED','MOVEMENT DETECTED']},
    {level:3,color:'Yellow',arrival:'02:21 AM',confidence:'61%',vitals:{HR:'96',BP:'136/84',SpO2:'94%',Temp:'37.1 C'},tests:{CBC:'Pending',CT:'Chart mismatch',ECG:'Pending',AI:'Identity variance'},camera:['NO PATIENT DETECTED']},
    {level:4,color:'Red',arrival:'02:29 AM',confidence:'48%',vitals:{HR:'88',BP:'110/70',SpO2:'98%',Temp:'36.9 C'},tests:{CBC:'Not collected',CT:'Not ordered',ECG:'Pending',AI:'Future lab result'},camera:['MOVEMENT DETECTED']},
    {level:3,color:'Red',arrival:'02:38 AM',confidence:'33%',vitals:{HR:'90',BP:'122/82',SpO2:'98%',Temp:'36.7 C'},tests:{CBC:'Pending',CT:'Pending',ECG:'User baseline overlap',AI:'Similarity index'},camera:['FACE MATCH: DOCTOR','MOVEMENT DETECTED']},
    {level:2,color:'Red',arrival:'02:47 AM',confidence:'17%',vitals:{HR:'78',BP:'116/74',SpO2:'99%',Temp:'36.6 C'},tests:{CBC:'Access denied',CT:'No patient file',ECG:'Operator rhythm',AI:'Intern doctor'},camera:['FACE MATCH: DOCTOR','NO PATIENT DETECTED']},
    {level:1,color:'Red',arrival:'02:58 AM',confidence:'ERROR',vitals:{HR:'--',BP:'--',SpO2:'--',Temp:'--'},tests:{CBC:'Pending',CT:'Pending',ECG:'Pending',AI:'Identity unresolved'},camera:['NO PATIENT DETECTED','FACE MATCH: DOCTOR']}
  ];

  const LABELS={
    en:{triage:'Triage Card',level:'Level',risk:'Risk Color',arrival:'Arrival Time',confidence:'AI Confidence',vitals:'Vital Signs Monitor',tests:'Test Result Mini Panel',pending:'Pending',camera:'Ward Camera',hr:'HR',bp:'BP',spo2:'SpO2',temp:'Temp'},
    zh:{triage:'分诊卡片',level:'等级',risk:'风险颜色',arrival:'到达时间',confidence:'AI置信度',vitals:'生命体征监测',tests:'检查结果小面板',pending:'待处理',camera:'病区监控',hr:'心率',bp:'血压',spo2:'血氧',temp:'体温'}
  };

  function lang(){return document.documentElement.lang==='zh-CN'?'zh':'en'}
  function L(){return LABELS[lang()]}
  function safe(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
  function clearVisualTimers(){visualToken+=1;visualTimers.forEach(clearTimeout);visualTimers=[];document.querySelectorAll('.case-glitching').forEach(el=>el.classList.remove('case-glitching'))}
  function schedule(fn,delay){const id=setTimeout(fn,delay);visualTimers.push(id);return id}
  function currentIndex(){return typeof currentCaseIndex==='number'?currentCaseIndex:0}
  function visualData(){return CASE_VISUALS[currentIndex()]||CASE_VISUALS[0]}

  function ensureStyles(){
    if(document.getElementById('caseVisualStyles'))return;
    const style=document.createElement('style');
    style.id='caseVisualStyles';
    style.textContent=`.case-visual-panel{margin-top:14px;border:1px solid rgba(104,255,241,.16);background:rgba(0,8,9,.58);padding:12px}.case-visual-title{margin:0 0 10px;color:var(--green);font-size:13px;text-transform:uppercase}.triage-grid,.vital-grid,.test-grid{display:grid;gap:8px}.triage-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.vital-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.test-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.case-chip,.vital-card,.test-card{border:1px solid rgba(104,255,241,.14);background:rgba(3,14,15,.72);padding:9px;min-width:0}.case-chip span,.vital-card span,.test-card span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase}.case-chip strong,.vital-card strong,.test-card strong{display:block;margin-top:5px;color:var(--cyan);font-size:16px;font-weight:400;overflow-wrap:anywhere}.risk-Green strong{color:var(--green)}.risk-Yellow strong{color:#e7ff8c}.risk-Orange strong{color:#ffc36b}.risk-Red strong{color:var(--red)}.case-camera{position:relative;min-height:130px;margin-top:14px;border:1px solid rgba(104,255,241,.16);background:#010404;overflow:hidden}.case-camera::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 38% 44%,rgba(104,255,241,.08),transparent 25%),repeating-linear-gradient(to bottom,rgba(255,255,255,.052) 0,rgba(255,255,255,.052) 1px,transparent 1px,transparent 4px);opacity:.76;animation:case-camera-noise 1.2s steps(3,end) infinite}.case-camera-label{position:absolute;left:10px;top:8px;color:var(--muted);font-size:12px}.case-camera-alert{position:absolute;inset:auto 10px 10px 10px;color:var(--red);font-size:13px;letter-spacing:0;text-shadow:0 0 10px rgba(255,77,93,.72);opacity:0}.case-camera-alert.is-visible{opacity:1;animation:case-alert-flicker .7s steps(2,end)}.case-glitching strong{color:var(--red)!important;text-shadow:1px 0 var(--cyan),-1px 0 var(--red);animation:case-data-glitch .45s steps(2,end) infinite}@keyframes case-camera-noise{50%{transform:translate(1px,-1px);opacity:.52}}@keyframes case-alert-flicker{50%{opacity:.35}}@keyframes case-data-glitch{50%{transform:translateX(1px);filter:hue-rotate(20deg)}}@media(max-width:640px){.triage-grid,.vital-grid,.test-grid{grid-template-columns:1fr 1fr}.case-chip strong,.vital-card strong,.test-card strong{font-size:14px}}`;
    document.head.appendChild(style);
  }

  function buildTriage(data){const l=L();return `<section class="case-visual-panel triage-card"><h3 class="case-visual-title">${safe(l.triage)}</h3><div class="triage-grid"><div class="case-chip"><span>${safe(l.level)}</span><strong>${safe(data.level)}</strong></div><div class="case-chip risk-${safe(data.color)}"><span>${safe(l.risk)}</span><strong>${safe(data.color)}</strong></div><div class="case-chip"><span>${safe(l.arrival)}</span><strong>${safe(data.arrival)}</strong></div><div class="case-chip"><span>${safe(l.confidence)}</span><strong>${safe(data.confidence)}</strong></div></div></section>`}
  function buildVitals(data){const l=L(),v=data.vitals;return `<section class="case-visual-panel vital-monitor"><h3 class="case-visual-title">${safe(l.vitals)}</h3><div class="vital-grid"><div class="vital-card" data-vital="HR"><span>${safe(l.hr)}</span><strong>${safe(v.HR)}</strong></div><div class="vital-card" data-vital="BP"><span>${safe(l.bp)}</span><strong>${safe(v.BP)}</strong></div><div class="vital-card" data-vital="SpO2"><span>${safe(l.spo2)}</span><strong>${safe(v.SpO2)}</strong></div><div class="vital-card" data-vital="Temp"><span>${safe(l.temp)}</span><strong>${safe(v.Temp)}</strong></div></div></section>`}
  function buildTests(data){const l=L(),tests=data.tests;return `<section class="case-visual-panel test-panel"><h3 class="case-visual-title">${safe(l.tests)}</h3><div class="test-grid">${['CBC','CT','ECG','AI'].map(key=>`<div class="test-card" data-test="${key}"><span>${key==='AI'?'AI Prediction':key}</span><strong>${safe(tests[key]||l.pending)}</strong></div>`).join('')}</div></section>`}
  function buildCamera(data){const l=L();return `<section class="case-camera"><span class="case-camera-label">${safe(l.camera)} / ${safe(data.arrival)}</span><strong class="case-camera-alert"></strong></section>`}

  function renderVisuals(){
    clearVisualTimers();
    ensureStyles();
    const data=visualData();
    document.querySelectorAll('.case-visual-panel,.case-camera').forEach(el=>el.remove());
    const patientProfile=document.querySelector('.patient-profile');
    const vitalsBlock=document.querySelector('.data-block');
    const aiCard=document.querySelector('.ai-card');
    if(patientProfile)patientProfile.insertAdjacentHTML('afterend',buildTriage(data));
    if(vitalsBlock)vitalsBlock.insertAdjacentHTML('afterend',buildVitals(data));
    if(aiCard){aiCard.insertAdjacentHTML('beforeend',buildTests(data));aiCard.insertAdjacentHTML('beforeend',buildCamera(data))}
    if(currentIndex()>=2){scheduleGlitches(data);scheduleCameraAlerts(data)}
  }

  function scheduleGlitches(data){
    const token=visualToken;
    const targets=Array.from(document.querySelectorAll('.vital-card,.test-card,.case-chip'));
    if(!targets.length)return;
    schedule(()=>{if(token!==visualToken)return;const sample=targets.filter((_,i)=>i%2===currentIndex()%2).slice(0,3);sample.forEach(el=>{const strong=el.querySelector('strong');if(!strong)return;const original=strong.textContent;el.classList.add('case-glitching');strong.textContent=['##//','ERR_0213','NULL','--/--'][Math.floor(Math.random()*4)];schedule(()=>{if(token!==visualToken)return;strong.textContent=original;el.classList.remove('case-glitching')},780)})},1500);
    schedule(()=>{if(token!==visualToken)return;const el=targets[(currentIndex()+2)%targets.length];const strong=el&&el.querySelector('strong');if(!strong)return;const original=strong.textContent;el.classList.add('case-glitching');strong.textContent='DATA_SYNC_ERROR';schedule(()=>{if(token!==visualToken)return;strong.textContent=original;el.classList.remove('case-glitching')},650)},3200);
  }

  function scheduleCameraAlerts(data){
    const messages=data.camera||['NO PATIENT DETECTED'];
    const token=visualToken;
    const alert=document.querySelector('.case-camera-alert');
    if(!alert)return;
    messages.forEach((msg,i)=>schedule(()=>{if(token!==visualToken)return;alert.textContent=msg;alert.classList.add('is-visible');schedule(()=>{if(token!==visualToken)return;alert.classList.remove('is-visible')},1300)},1900+i*2300));
  }

  const originalShowCase=showCase;
  showCase=function(){originalShowCase();renderVisuals()};
  const originalReset=resetShiftState;
  resetShiftState=function(showLanguage=true){clearVisualTimers();document.querySelectorAll('.case-visual-panel,.case-camera').forEach(el=>el.remove());originalReset(showLanguage)};
})();
