(function(){
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
