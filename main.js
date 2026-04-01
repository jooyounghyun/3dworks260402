document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeLoginBtn = document.getElementById('closeLoginBtn');

  // 로그인 클릭 시 모달 열기
  if (loginBtn && loginModal) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginModal.classList.remove('hidden');
    });
  }

  // 닫기 버튼 클릭 시 모달 닫기
  if (closeLoginBtn && loginModal) {
    closeLoginBtn.addEventListener('click', () => {
      loginModal.classList.add('hidden');
    });
  }

  // 모달 바깥쪽 클릭 시 닫기
  window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      loginModal.classList.add('hidden');
    }
  });
});
