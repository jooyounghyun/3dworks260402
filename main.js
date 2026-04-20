document.addEventListener('DOMContentLoaded', () => {
  console.log("3D Resolver JS Loaded!");

  // --- 1. 요소 선택 ---
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const signupBtn = document.getElementById('signupBtn');
  const signupModal = document.getElementById('signupModal');
  const hireTeamBtn = document.getElementById('hireTeamBtn');
  const serviceModal = document.getElementById('serviceModal');
  const manpowerBtn = document.getElementById('manpowerBtn');
  const manpowerModal = document.getElementById('manpowerModal');
  
  // 상세 모달들
  const demolitionModal = document.getElementById('demolitionModal');
  const wasteModal = document.getElementById('wasteModal');
  const restorationModal = document.getElementById('restorationModal');
  const electricModal = document.getElementById('electricModal');
  const pipeModal = document.getElementById('pipeModal');
  const manpowerTypeModal = document.getElementById('manpowerTypeModal');

  // 회원가입 단계 요소
  const signupStep1 = document.getElementById('signupStep1');
  const signupStep2 = document.getElementById('signupStep2');
  const signupStepCompany = document.getElementById('signupStepCompany');
  const signupStep3 = document.getElementById('signupStep3');

  // --- 2. 상태 관리 ---
  let signupState = {
    type: '',
    name: '',
    carrier: '',
    phone: '',
    isVerified: false,
    businessVerified: false
  };

  const currentUser = {
    name: "(주)삼디건설",
    phone: "010-1234-5678",
    isLoggedIn: false
  };

  // --- 3. 모달 열기 함수 ---
  
  // 로그인
  if (loginBtn) {
    loginBtn.onclick = (e) => {
      e.preventDefault();
      closeAllModals();
      loginModal.classList.remove('hidden');
    };
  }

  // 회원가입 (초기화 포함)
  if (signupBtn) {
    signupBtn.onclick = (e) => {
      e.preventDefault();
      closeAllModals();
      signupModal.classList.remove('hidden');
      // 단계 초기화
      signupStep1.classList.remove('hidden');
      signupStep2.classList.add('hidden');
      signupStepCompany.classList.add('hidden');
      signupStep3.classList.add('hidden');
      document.getElementById('verifyCodeGroup').classList.add('hidden');
    };
  }

  // 팀으로 맡기기
  if (hireTeamBtn) {
    hireTeamBtn.onclick = () => {
      closeAllModals();
      serviceModal.classList.remove('hidden');
    };
  }

  // 인력 지원 요청
  if (manpowerBtn) {
    manpowerBtn.onclick = () => {
      // 실제 서비스에서는 로그인이 필요할 수 있음
      closeAllModals();
      manpowerModal.classList.remove('hidden');
    };
  }

  // --- 4. 공통 닫기 기능 ---
  function closeAllModals() {
    const modals = [
      loginModal, signupModal, serviceModal, manpowerModal,
      demolitionModal, wasteModal, restorationModal, electricModal, pipeModal, manpowerTypeModal
    ];
    modals.forEach(modal => {
      if (modal) modal.classList.add('hidden');
    });
  }

  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.onclick = () => closeAllModals();
  });

  window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
      closeAllModals();
    }
  };

  // --- 5. 회원가입 상세 로직 ---
  
  // 1단계 유형 선택
  if (signupStep1) {
    signupStep1.querySelectorAll('.type-btn').forEach(btn => {
      btn.onclick = () => {
        signupState.type = btn.getAttribute('data-type');
        signupStep1.classList.add('hidden');
        signupStep2.classList.remove('hidden');
      };
    });
  }

  // 2단계 통신사 선택
  document.querySelectorAll('.carrier-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.carrier-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      signupState.carrier = btn.getAttribute('data-value');
    };
  });

  // 인증번호 전송
  const sendVerifyBtn = document.getElementById('sendVerifyBtn');
  if (sendVerifyBtn) {
    sendVerifyBtn.onclick = () => {
      const nameVal = document.getElementById('verifyName').value;
      const phoneVal = document.getElementById('phoneNum').value;
      if (!nameVal) return alert('이름을 입력해주세요.');
      if (!signupState.carrier) return alert('통신사를 선택해주세요.');
      if (!phoneVal) return alert('휴대폰 번호를 입력해주세요.');
      
      alert(`${nameVal}님, 인증번호가 전송되었습니다.`);
      document.getElementById('verifyCodeGroup').classList.remove('hidden');
      signupState.phone = phoneVal;
    };
  }

  // 인증번호 확인
  const checkVerifyBtn = document.getElementById('checkVerifyBtn');
  if (checkVerifyBtn) {
    checkVerifyBtn.onclick = () => {
      alert('휴대폰 인증이 완료되었습니다.');
      if (signupState.type === 'company') {
        signupStep2.classList.add('hidden');
        signupStepCompany.classList.remove('hidden');
      } else {
        goToSignupStep3();
      }
    };
  }

  // 사업자 정보 확인
  const checkBusinessBtn = document.getElementById('checkBusinessBtn');
  if (checkBusinessBtn) {
    checkBusinessBtn.onclick = () => {
      alert('사업자 정보가 확인되었습니다.');
      document.getElementById('nextToFinalStepBtn').disabled = false;
    };
  }

  const nextToFinalStepBtn = document.getElementById('nextToFinalStepBtn');
  if (nextToFinalStepBtn) {
    nextToFinalStepBtn.onclick = () => goToSignupStep3();
  }

  function goToSignupStep3() {
    signupStep2.classList.add('hidden');
    signupStepCompany.classList.add('hidden');
    signupStep3.classList.remove('hidden');
    document.getElementById('signupPhone').value = signupState.phone;
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.onsubmit = (e) => {
      e.preventDefault();
      alert('회원가입이 완료되었습니다! 로그인 후 이용해주세요.');
      location.reload();
    };
  }

  // --- 6. 기타 서비스 버튼들 (기존 로직 유지) ---
  const serviceItemBtns = document.querySelectorAll('.service-item-btn');
  serviceItemBtns.forEach(btn => {
    btn.onclick = () => {
      serviceItemBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });

  const confirmServiceBtn = document.getElementById('confirmServiceBtn');
  if (confirmServiceBtn) {
    confirmServiceBtn.onclick = () => {
      const selected = document.querySelector('.service-item-btn.selected');
      if (!selected) return alert('서비스를 선택해주세요.');
      
      const txt = selected.innerText.trim();
      serviceModal.classList.add('hidden');
      
      if (txt === '상가 철거') demolitionModal.classList.remove('hidden');
      else if (txt === '폐기물 처리') wasteModal.classList.remove('hidden');
      else if (txt === '상가 원상복구') restorationModal.classList.remove('hidden');
      else if (txt === '전기 공사') electricModal.classList.remove('hidden');
      else if (txt === '배관막힘 누수공사') pipeModal.classList.remove('hidden');
    };
  }

  // 전역 클릭 핸들러 (토글 기능 등)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.type-btn');
    if (!btn) return;

    // 예외: 인력 모달 및 회원가입 내부는 이미 위에서 처리함
    if (btn.closest('#signupModal')) return;
    if (btn.closest('#manpowerTypeModal')) return;
    if (btn.parentElement.id === 'typeList') return;

    // 나머지 상세 정보 모달들의 토글
    if (btn.classList.contains('waste-type-btn') || 
        btn.classList.contains('demo-type-btn') || 
        btn.classList.contains('restore-type-btn') ||
        btn.classList.contains('electric-type-btn') ||
        btn.classList.contains('pipe-type-btn')) {
      btn.classList.toggle('selected');
    }
  });

  // 각 모달 제출 핸들러 (간소화)
  const submitPipeBtn = document.getElementById('submitPipeBtn');
  if (submitPipeBtn) {
    submitPipeBtn.onclick = () => {
      alert('배관막힘 누수공사 요청 완료!');
      closeAllModals();
    };
  }
  
  // (필요에 따라 다른 제출 버튼들도 추가 가능)
});
