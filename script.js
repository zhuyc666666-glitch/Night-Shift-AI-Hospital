const startButton = document.getElementById('startButton');
const statusText = document.getElementById('statusText');

startButton.addEventListener('click', () => {
  statusText.textContent = '值班已开始。请等待医院系统响应。';
});
