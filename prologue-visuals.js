(function(){
  let visualScreen=null;
  let visualTimer=null;
  let visualToken=0;
  let visualIndex=0;
  let isTyping=false;
  let activeLine=null;
  let activeText='';
  let rememberedDoctorName='Unknown';

  const TEXT={
    en:{continue:'Continue',skip:'Skip',top:'AETHER-MD / HOSPITAL AI MONITORING',map:'Hospital Map',ecg:'ECG Monitor',status:'AI System Status',camera:'Security Camera Matrix',feed:'Hospital Alert Feed',doctor:name=>`Dr. ${name}`,alerts:['Ambulance arrival detected.','Radiology system delayed.','Unknown patient record synced.'],statusRows:['Model Confidence','Patient Queue','Risk Prediction','Human Override'],statusValues:['87%','08 waiting','Active','Available'],cams:['Camera 01 / Corridor','Camera 02 / Triage Desk','Camera 03 / Empty Ward'],rooms:['Emergency Room','ICU','Radiology','AI Core','Morgue'],screens:name=>[
      {kind:'news',label:'NEWS BRIEF',title:'2032 / City General Hospital',lines:['City General Hospital launches AETHER-MD, an autonomous diagnostic system.','It claims to reduce misdiagnosis, optimize emergency triage, and predict patient deterioration.']},
      {kind:'notice',label:'HOSPITAL NOTICE',title:'Night Shift Assignment',lines:[`Night shift supervision assigned to: Dr. ${name}.`,'Role: intern physician, AI diagnostic oversight.','Expected action set: Approve / Override.']},
      {kind:'boot',label:'AI STARTUP LOG',title:'AETHER-MD Initialization',lines:['AETHER-MD online.','Patient prediction module loaded.','Human oversight required: minimal.']},
      {kind:'alert',label:'ANOMALY PROMPT',title:'Record Conflict',lines:['Previous simulation records found.','Doctor identity: inconsistent.','Continue anyway?']},
      {kind:'start',label:'SHIFT OPEN',title:'First Intake',lines:['02:13 AM.','First patient waiting.']}
    ]},
    zh:{continue:'继续',skip:'跳过',top:'AETHER-MD / 医院AI监控系统',map:'医院平面图',ecg:'心电监测',status:'AI系统状态',camera:'监控摄像矩阵',feed:'医院警报流',doctor:name=>`${name}医生`,alerts:['检测到救护车抵达。','放射科系统延迟。','未知患者记录已同步。'],statusRows:['模型置信度','患者队列','风险预测','人工覆盖'],statusValues:['87%','08 等待','活动中','可用'],cams:['Camera 01 / 走廊','Camera 02 / 分诊台','Camera 03 / 空病区'],rooms:['Emergency Room','ICU','Radiology','AI Core','Morgue'],screens:name=>[
      {kind:'news',label:'新闻简报',title:'2032 / 市立总医院',lines:['City General Hospital launches AETHER-MD, an autonomous diagnostic system.','市立总医院正式启用 AETHER-MD 自主诊断系统。','该系统声称可以降低误诊率、优化急诊分诊，并预测患者恶化风险。']},
      {kind:'notice',label:'医院通知',title:'夜班监督分配',lines:[`Night shift supervision assigned to: Dr. ${name}.`,`夜班监督已分配给：${name}医生。`,'你的身份：夜班实习医生，负责监督 AI 诊断结果。','理论操作：Approve 或 Override。']},
      {kind:'boot',label:'AI启动日志',title:'AETHER-MD 初始化',lines:['AETHER-MD online.','Patient prediction module loaded.','Human oversight required: minimal.','今晚是系统独立运行的第一晚。']},
      {kind:'alert',label:'异常提示',title:'记录冲突',lines:['Previous simulation records found.','Doctor identity: inconsistent.','Continue anyway?','检测到既往模拟记录。医生身份：不一致。是否继续？']},
      {kind:'start',label:'正式开始',title:'第一份接诊',lines:['02:13 AM.','First patient waiting.','第一位病人正在等待。']}
    ]}
  };

  function getLang(){return document.documentElement.lang==='zh-CN'?'zh':'en'}
  function ui(){return TEXT[getLang()]}
  function safe(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
  function doctorName(){return rememberedDoctorName||'Unknown'}
  function captureDoctorName(){const input=document.querySelector('.doctor-input input');rememberedDoctorName=(input&&input.value.trim())||'Unknown'}
  function clearVisualTimer(){visualToken+=1;if(visualTimer){clearTimeout(visualTimer);visualTimer=null}isTyping=false;activeLine=null;activeText=''}

  function ensureStyles(){
    if(document.getElementById('prologueVisualStyles'))return;
    const style=document.createElement('style');
    style.id='prologueVisualStyles';
    style.textContent=`.prologue-screen.visual-monitor{position:fixed;inset:0;z-index:25;display:grid;grid-template-rows:auto 1fr auto;gap:12px;padding:14px;background:#020405;color:var(--text);font-family:"Courier New",Consolas,monospace;overflow:hidden}.visual-monitor::before{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,rgba(216,255,248,.055) 0,rgba(216,255,248,.055) 1px,transparent 1px,transparent 5px);mix-blend-mode:screen;opacity:.24}.visual-monitor::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(rgba(104,255,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(104,255,241,.035) 1px,transparent 1px);background-size:34px 34px}.monitor-top,.monitor-grid,.monitor-footer{position:relative;z-index:1}.monitor-top{display:flex;justify-content:space-between;gap:12px;border:1px solid rgba(104,255,241,.24);padding:10px 12px;background:rgba(5,16,18,.84);color:var(--muted);text-transform:uppercase}.monitor-grid{display:grid;grid-template-columns:1fr minmax(340px,.86fr);gap:12px;min-height:0}.prologue-main{display:grid;grid-template-rows:minmax(220px,1fr) minmax(170px,.7fr);gap:12px;min-height:0}.prologue-card{display:grid;align-content:center;border:1px solid rgba(104,255,241,.32);background:rgba(0,9,10,.8);padding:clamp(18px,4vw,42px);box-shadow:inset 0 0 42px rgba(37,189,180,.1),0 0 34px rgba(0,0,0,.6);animation:monitor-fault .38s steps(2,end);overflow:hidden}.prologue-card.news{border-color:rgba(104,255,241,.44);background:linear-gradient(90deg,rgba(7,24,27,.92),rgba(0,9,10,.78))}.prologue-card.notice{border-color:rgba(140,255,199,.42);background:linear-gradient(180deg,rgba(6,29,25,.9),rgba(0,9,10,.78))}.prologue-card.boot{border-color:rgba(104,255,241,.3);box-shadow:inset 0 0 52px rgba(37,189,180,.18)}.prologue-card.alert{border-color:rgba(255,77,93,.62);background:rgba(20,5,8,.8);box-shadow:inset 0 0 46px rgba(109,29,40,.3),0 0 28px rgba(255,77,93,.1)}.prologue-card.start{border-color:rgba(140,255,199,.58);background:radial-gradient(circle at 50% 20%,rgba(140,255,199,.08),transparent 40%),rgba(0,9,10,.82)}.prologue-kicker,.widget-title{margin:0 0 10px;color:var(--muted);text-transform:uppercase;font-size:12px}.prologue-card h2{margin:0 0 20px;color:var(--cyan);font-size:clamp(24px,5vw,46px);letter-spacing:0;text-shadow:0 0 18px rgba(104,255,241,.45)}.prologue-lines{display:grid;gap:10px;color:var(--green);font-size:clamp(14px,1.7vw,19px);line-height:1.6}.prologue-lines p{margin:0}.prologue-card.alert .prologue-lines{color:#ff9aa4}.visual-widgets{display:grid;grid-template-columns:1fr 1fr;gap:12px;min-height:0}.monitor-side{display:grid;grid-template-rows:auto auto 1fr;gap:12px;min-height:0}.monitor-widget{border:1px solid rgba(104,255,241,.2);background:rgba(0,9,10,.68);padding:12px;overflow:hidden;box-shadow:inset 0 0 24px rgba(37,189,180,.08)}.hospital-map{display:grid;grid-template-columns:1fr 1fr;gap:8px}.map-room{min-height:38px;border:1px solid rgba(104,255,241,.18);display:grid;place-items:center;color:var(--muted);font-size:12px;background:rgba(5,16,18,.72)}.map-room.active{color:var(--green);border-color:rgba(140,255,199,.62);box-shadow:0 0 18px rgba(140,255,199,.18);animation:room-pulse 1s steps(2,end) infinite}.ecg-wrap{height:92px;border:1px solid rgba(104,255,241,.14);background:linear-gradient(rgba(104,255,241,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(104,255,241,.03) 1px,transparent 1px);background-size:18px 18px;overflow:hidden}.ecg-line{width:220%;height:100%;animation:ecg-slide 2.2s linear infinite}.ecg-line polyline{fill:none;stroke:var(--green);stroke-width:3;filter:drop-shadow(0 0 5px rgba(140,255,199,.7))}.ai-status{display:grid;gap:8px}.status-row{display:grid;grid-template-columns:1fr auto;gap:10px;padding:7px 0;border-bottom:1px solid rgba(104,255,241,.12);color:var(--muted);font-size:13px}.status-row strong{color:var(--cyan);font-weight:400}.camera-grid{display:grid;grid-template-columns:1fr;gap:10px;min-height:0}.camera-frame{position:relative;min-height:94px;border:1px solid rgba(104,255,241,.16);background:#010404;overflow:hidden}.camera-frame::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 35% 45%,rgba(104,255,241,.08),transparent 22%),radial-gradient(circle at 70% 70%,rgba(255,255,255,.04),transparent 18%),repeating-linear-gradient(to bottom,rgba(255,255,255,.05) 0,rgba(255,255,255,.05) 1px,transparent 1px,transparent 4px);opacity:.75;animation:camera-noise 1.4s steps(3,end) infinite}.camera-frame span{position:absolute;left:8px;top:8px;color:var(--muted);font-size:12px}.camera-frame em{position:absolute;right:8px;bottom:8px;color:var(--red);font-size:11px;font-style:normal}.alert-feed{display:grid;gap:9px}.alert-feed p{margin:0;padding:9px;border-left:2px solid rgba(255,77,93,.54);background:rgba(255,77,93,.055);color:#ff9aa4;font-size:13px}.monitor-footer{display:flex;justify-content:flex-end;gap:12px}.monitor-footer button{min-width:108px;min-height:44px;text-align:center}.prologue-caret::after{content:"_";color:var(--red);animation:prologue-caret .7s steps(2,end) infinite}@keyframes monitor-fault{0%,100%{transform:translate(0,0);filter:none}35%{transform:translate(-1px,0);filter:hue-rotate(-8deg)}70%{transform:translate(1px,.5px);filter:hue-rotate(8deg)}}@keyframes prologue-caret{50%{opacity:0}}@keyframes room-pulse{50%{opacity:.45}}@keyframes ecg-slide{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes camera-noise{50%{transform:translate(1px,-1px);opacity:.5}}@media(max-width:920px){.prologue-screen.visual-monitor{overflow:auto}.monitor-grid{grid-template-columns:1fr}.monitor-side{grid-template-rows:none}.visual-widgets{grid-template-columns:1fr}.camera-grid{grid-template-columns:1fr}.monitor-footer button{min-height:52px;flex:1}}`;
    document.head.appendChild(style);
  }

  function widgetMarkup(){
    const data=ui();
    return `<div class="visual-widgets">
      <section class="monitor-widget"><p class="widget-title">${safe(data.map)}</p><div class="hospital-map">${data.rooms.map(room=>`<div class="map-room ${room==='Emergency Room'?'active':''}">${safe(room)}</div>`).join('')}</div></section>
      <section class="monitor-widget"><p class="widget-title">${safe(data.ecg)}</p><div class="ecg-wrap"><svg class="ecg-line" viewBox="0 0 600 100" preserveAspectRatio="none"><polyline points="0,55 40,55 58,55 70,25 84,82 96,45 120,55 180,55 205,55 218,20 234,84 250,48 285,55 350,55 375,55 388,24 405,83 420,50 460,55 520,55 548,55 560,28 574,80 590,55 600,55"/><polyline transform="translate(600 0)" points="0,55 40,55 58,55 70,25 84,82 96,45 120,55 180,55 205,55 218,20 234,84 250,48 285,55 350,55 375,55 388,24 405,83 420,50 460,55 520,55 548,55 560,28 574,80 590,55 600,55"/></svg></div></section>
    </div>`;
  }

  function sideMarkup(){
    const data=ui();
    return `<section class="monitor-widget"><p class="widget-title">${safe(data.status)}</p><div class="ai-status">${data.statusRows.map((row,index)=>`<div class="status-row"><span>${safe(row)}</span><strong>${safe(data.statusValues[index])}</strong></div>`).join('')}</div></section>
    <section class="monitor-widget"><p class="widget-title">${safe(data.camera)}</p><div class="camera-grid">${data.cams.map((cam,index)=>`<div class="camera-frame"><span>${safe(cam)}</span><em>${index===2?'NO MOTION':'LIVE'}</em></div>`).join('')}</div></section>
    <section class="monitor-widget"><p class="widget-title">${safe(data.feed)}</p><div class="alert-feed">${data.alerts.map(alert=>`<p>${safe(alert)}</p>`).join('')}</div></section>`;
  }

  function buildScreen(){
    ensureStyles();
    const data=ui();
    const screen=document.createElement('section');
    screen.className='prologue-screen visual-monitor';
    screen.innerHTML=`<div class="monitor-top"><span>${safe(data.top)}</span><span>02:13 AM</span></div><div class="monitor-grid"><div class="prologue-main"><article class="prologue-card"><p class="prologue-kicker"></p><h2></h2><div class="prologue-lines"></div></article>${widgetMarkup()}</div><aside class="monitor-side">${sideMarkup()}</aside></div><div class="monitor-footer"><button class="prologue-continue" type="button">${safe(data.continue)}</button><button class="prologue-skip" type="button">${safe(data.skip)}</button></div>`;
    screen.querySelector('.prologue-continue').addEventListener('click',continueVisualPrologue);
    screen.querySelector('.prologue-skip').addEventListener('click',finishVisualPrologue);
    return screen;
  }

  function screens(){return ui().screens(doctorName())}

  function render(index,token){
    if(token!==visualToken)return;
    const list=screens();
    if(index>=list.length){finishVisualPrologue();return}
    visualIndex=index;
    const part=list[index];
    const card=visualScreen.querySelector('.prologue-card');
    const kicker=visualScreen.querySelector('.prologue-kicker');
    const title=visualScreen.querySelector('h2');
    const linesBox=visualScreen.querySelector('.prologue-lines');
    card.className=`prologue-card ${part.kind}`;
    kicker.textContent=part.label;
    title.textContent=part.title;
    linesBox.innerHTML='';
    if(typeof triggerGlitch==='function')triggerGlitch();
    if((part.kind==='boot'||part.kind==='alert')&&typeof playLowHum==='function')playLowHum();
    let lineIndex=0;
    function nextLine(){
      if(token!==visualToken)return;
      if(lineIndex>=part.lines.length){visualTimer=setTimeout(()=>render(index+1,token),1500);return}
      const line=document.createElement('p');
      linesBox.appendChild(line);
      typeLine(line,`> ${part.lines[lineIndex]}`,()=>{lineIndex+=1;nextLine()},token);
    }
    nextLine();
  }

  function typeLine(target,text,done,token){
    let index=0;
    isTyping=true;
    activeLine=target;
    activeText=text;
    target.classList.add('prologue-caret');
    function tick(){
      if(token!==visualToken)return;
      target.textContent+=text.charAt(index);
      index+=1;
      if(index<text.length){visualTimer=setTimeout(tick,24);return}
      target.classList.remove('prologue-caret');
      isTyping=false;
      visualTimer=setTimeout(done,260);
    }
    tick();
  }

  function continueVisualPrologue(){
    if(!visualScreen)return;
    if(isTyping&&activeLine){activeLine.textContent=activeText;activeLine.classList.remove('prologue-caret');isTyping=false;return}
    clearTimeout(visualTimer);
    render(visualIndex+1,visualToken);
  }

  function finishVisualPrologue(){
    clearVisualTimer();
    if(visualScreen){visualScreen.remove();visualScreen=null}
    if(typeof setGameVisibility==='function')setGameVisibility(true);
    if(typeof updateStats==='function')updateStats();
    if(typeof showCase==='function')showCase();
    if(typeof renderSystemLog==='function'&&typeof t==='function')renderSystemLog(t().shiftStarted);
  }

  function startVisualPrologue(){
    clearVisualTimer();
    if(typeof setGameVisibility==='function')setGameVisibility(false);
    visualScreen=buildScreen();
    document.body.appendChild(visualScreen);
    const token=visualToken;
    render(0,token);
  }

  const startButton=document.getElementById('startButton');
  const nameInput=document.querySelector('.doctor-input input');
  if(nameInput)nameInput.addEventListener('input',captureDoctorName);
  if(startButton)startButton.addEventListener('click',captureDoctorName,true);
  startPrologue=startVisualPrologue;
})();
