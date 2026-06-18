(function(){
  const style=document.createElement('style');
  style.textContent='@media(max-width:920px){.supervision-screen{overflow:auto!important;align-items:start!important}.supervision-panel{margin:12px 0}}';
  document.head.appendChild(style);

  document.addEventListener('click',event=>{
    const continueButton=event.target.closest&&event.target.closest('.prologue-continue');
    if(!continueButton)return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const skipButton=document.querySelector('.prologue-skip');
    if(skipButton)skipButton.click();
  },true);
})();
