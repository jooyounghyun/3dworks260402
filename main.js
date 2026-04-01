document.addEventListener('DOMContentLoaded', () => {
  // --- 로그인 모달 제어 ---
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const closeLoginBtn = document.getElementById('closeLoginBtn');

  if (loginBtn && loginModal) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginModal.classList.remove('hidden');
    });
  }

  if (closeLoginBtn && loginModal) {
    closeLoginBtn.addEventListener('click', () => {
      loginModal.classList.add('hidden');
    });
  }

  // --- 회원가입 모달 및 단계 제어 ---
  const signupBtn = document.getElementById('signupBtn');
  const signupModal = document.getElementById('signupModal');
  const closeSignupBtn = document.getElementById('closeSignupBtn');
  
  const step1 = document.getElementById('signupStep1');
  const step2 = document.getElementById('signupStep2');
  const step3 = document.getElementById('signupStep3');

  // 회원가입 열기
  if (signupBtn && signupModal) {
    signupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      signupModal.classList.remove('hidden');
      resetSignup(); // 열 때마다 초기화
    });
  }

  // 회원가입 닫기
  if (closeSignupBtn && signupModal) {
    closeSignupBtn.addEventListener('click', () => {
      signupModal.classList.add('hidden');
    });
  }

  // 바깥쪽 클릭 시 닫기
  window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.classList.add('hidden');
    if (e.target === signupModal) signupModal.classList.add('hidden');
  });

  // 회원가입 초기화 함수
  function resetSignup() {
    step1.classList.remove('hidden');
    step2.classList.add('hidden');
    step3.classList.add('hidden');
    document.getElementById('verifyCodeGroup').classList.add('hidden');
    document.getElementById('phoneNum').value = '';
    document.getElementById('verifyCode').value = '';
  }

  // 1단계: 유형 선택 시 2단계로 이동
  const typeBtns = document.querySelectorAll('.type-btn');
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
    });
  });

  // 2단계: 인증번호 전송
  const sendVerifyBtn = document.getElementById('sendVerifyBtn');
  const verifyCodeGroup = document.getElementById('verifyCodeGroup');
  if (sendVerifyBtn) {
    sendVerifyBtn.addEventListener('click', () => {
      const phone = document.getElementById('phoneNum').value;
      if (phone.length > 9) {
        alert('인증번호가 전송되었습니다. (시뮬레이션)');
        verifyCodeGroup.classList.remove('hidden');
      } else {
        alert('올바른 휴대폰 번호를 입력해주세요.');
      }
    });
  }

  // 2단계: 인증 확인 시 3단계로 이동
  const checkVerifyBtn = document.getElementById('checkVerifyBtn');
  if (checkVerifyBtn) {
    checkVerifyBtn.addEventListener('click', () => {
      const code = document.getElementById('verifyCode').value;
      if (code === '123456' || code.length === 6) { // 6자리 입력 시 통과 시뮬레이션
        alert('인증되었습니다.');
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
      } else {
        alert('인증번호 6자리를 입력해주세요.');
      }
    });
  }

  // 3단계: 가입 완료 처리
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('signupEmail').value;
      const pw = document.getElementById('signupPw').value;
      const pwConfirm = document.getElementById('signupPwConfirm').value;

      if (pw !== pwConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      alert(`${email}님, 회원가입이 완료되었습니다!`);
      signupModal.classList.add('hidden');
    });
  }
});
