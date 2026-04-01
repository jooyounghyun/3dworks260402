document.addEventListener('DOMContentLoaded', () => {
  const hireTeamBtn = document.getElementById('hireTeamBtn');
  const serviceFolder = document.getElementById('serviceFolder');
  const closeFolderBtn = document.getElementById('closeFolderBtn');

  // 팀으로 맡기기 버튼 클릭 시 폴더 열기
  hireTeamBtn.addEventListener('click', () => {
    serviceFolder.classList.remove('hidden');
  });

  // 닫기 버튼 클릭 시 폴더 닫기
  closeFolderBtn.addEventListener('click', () => {
    serviceFolder.classList.add('hidden');
  });

  // 폴더 외부 클릭 시 닫기
  window.addEventListener('click', (event) => {
    if (event.target === serviceFolder) {
      serviceFolder.classList.add('hidden');
    }
  });
});
