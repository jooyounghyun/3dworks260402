document.addEventListener('DOMContentLoaded', () => {
  console.log("3D Resolver JS Loaded!");

  // 모달 요소들
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const signupBtn = document.getElementById('signupBtn');
  const signupModal = document.getElementById('signupModal');
  const hireTeamBtn = document.getElementById('hireTeamBtn');
  const serviceModal = document.getElementById('serviceModal');

  // --- 모달 열기 함수 ---
  if (loginBtn) {
    loginBtn.onclick = (e) => {
      e.preventDefault();
      loginModal.classList.remove('hidden');
    };
  }

  if (signupBtn) {
    signupBtn.onclick = (e) => {
      e.preventDefault();
      signupModal.classList.remove('hidden');
      // 회원가입 단계 초기화
      document.getElementById('signupStep1').classList.remove('hidden');
      document.getElementById('signupStep2').classList.add('hidden');
      document.getElementById('signupStep3').classList.add('hidden');
    };
  }

  if (hireTeamBtn) {
    hireTeamBtn.onclick = () => {
      console.log("Hire Team button clicked!");
      serviceModal.classList.remove('hidden');
    };
  }

  // --- 닫기 버튼 공통 제어 ---
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.onclick = () => {
      loginModal.classList.add('hidden');
      signupModal.classList.add('hidden');
      serviceModal.classList.add('hidden');
    };
  });

  // 바깥쪽 클릭 시 모든 모달 닫기
  window.onclick = (e) => {
    if (e.target === loginModal) loginModal.classList.add('hidden');
    if (e.target === signupModal) signupModal.classList.add('hidden');
    if (e.target === serviceModal) serviceModal.classList.add('hidden');
  };

  // --- 회원가입 상세 기능 ---
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.onclick = () => {
      document.getElementById('signupStep1').classList.add('hidden');
      document.getElementById('signupStep2').classList.remove('hidden');
    };
  });

  const sendVerifyBtn = document.getElementById('sendVerifyBtn');
  if (sendVerifyBtn) {
    sendVerifyBtn.onclick = () => {
      alert('인증번호가 전송되었습니다.');
      document.getElementById('verifyCodeGroup').classList.remove('hidden');
    };
  }

  const checkVerifyBtn = document.getElementById('checkVerifyBtn');
  if (checkVerifyBtn) {
    checkVerifyBtn.onclick = () => {
      alert('인증되었습니다.');
      document.getElementById('signupStep2').classList.add('hidden');
      document.getElementById('signupStep3').classList.remove('hidden');
    };
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.onsubmit = (e) => {
      e.preventDefault();
      alert('회원가입이 완료되었습니다!');
      signupModal.classList.add('hidden');
    };
  }

  // --- 서비스 선택 상세 기능 ---
  const serviceItemBtns = document.querySelectorAll('.service-item-btn');
  serviceItemBtns.forEach(btn => {
    btn.onclick = () => {
      // 하나씩만 선택 가능하도록 기존 선택 해제 후 현재 버튼 토글
      const isAlreadySelected = btn.classList.contains('selected');
      
      // 모든 버튼에서 selected 클래스 제거
      serviceItemBtns.forEach(b => b.classList.remove('selected'));
      
      // 이미 선택된 상태였다면 해제된 상태로 두고, 아니었다면 선택
      if (!isAlreadySelected) {
        btn.classList.add('selected');
      }
    };
  });

  const confirmServiceBtn = document.getElementById('confirmServiceBtn');
  if (confirmServiceBtn) {
    confirmServiceBtn.onclick = () => {
      const selectedServices = Array.from(document.querySelectorAll('.service-item-btn.selected'))
                                    .map(btn => btn.innerText);
      
      if (selectedServices.length > 0) {
        alert(`선택된 서비스: ${selectedServices.join(', ')}\n전문가 팀 매칭을 시작합니다!`);
        serviceModal.classList.add('hidden');
      } else {
        alert('최소 하나 이상의 서비스를 선택해주세요.');
      }
    };
  }
});
