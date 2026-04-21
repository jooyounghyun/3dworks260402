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

  // --- 7. 인력 지원 요청 상세 로직 ---
  const manpowerSelectionList = document.getElementById('manpowerSelectionList');
  const addManpowerBtn = document.getElementById('addManpowerBtn');
  const typeList = document.getElementById('typeList');
  const manpowerTypeTitle = document.getElementById('manpowerTypeTitle');
  const typeBreadcrumb = document.getElementById('typeBreadcrumb');
  const currentCategorySpan = document.getElementById('currentCategory');
  const backTypeBtn = document.getElementById('backTypeBtn');

  let currentManpowerTarget = null; // 현재 선택 중인 행의 버튼

  const manpowerData = {
    "기능공 (기술인력)": ["전기공", "설비공", "내선목수", "외선목수", "타일공", "미장공", "조적공", "도장공", "방수공", "용접공"],
    "철거/폐기물": ["철거공", "폐기물 상차공", "커팅공", "뿌레카공"],
    "일반/기타": ["일반 잡부", "곰방/양중", "신호수", "청소/뒷정리"]
  };

  // 인력 행 추가
  if (addManpowerBtn) {
    addManpowerBtn.onclick = () => {
      const newItem = document.createElement('div');
      newItem.className = 'manpower-item manpower-grid';
      newItem.innerHTML = `
        <button type="button" class="manpower-type-btn" style="flex: 2; text-align: left; background: #0f172a; border: 1px solid #334155; color: #94a3b8; padding: 10px; border-radius: 6px; font-size: 12px; cursor: pointer;">인력 유형 선택</button>
        <input type="hidden" class="manpower-type-val">
        <input type="number" class="manpower-wage" placeholder="임금" value="0" style="flex: 1.5;">
        <select class="manpower-count" style="flex: 1; height: 38px;">
          <option value="" selected disabled>인원</option>
          ${[...Array(20).keys()].map(i => `<option value="${i+1}">${i+1}명</option>`).join('')}
        </select>
        <button type="button" class="remove-manpower-btn" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:18px; padding:0 5px; line-height:1;">&times;</button>
      `;
      manpowerSelectionList.appendChild(newItem);
    };
  }

  // 인력 행 삭제 및 유형 선택 모달 열기 (위임)
  if (manpowerSelectionList) {
    manpowerSelectionList.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-manpower-btn')) {
        const items = manpowerSelectionList.querySelectorAll('.manpower-item');
        if (items.length > 1) {
          e.target.closest('.manpower-item').remove();
          updateWageTotal();
        } else {
          alert('최소 한 명의 인력은 필요합니다.');
        }
      }

      if (e.target.classList.contains('manpower-type-btn')) {
        currentManpowerTarget = e.target;
        renderCategoryList();
        manpowerTypeModal.classList.remove('hidden');
      }
    });

    manpowerSelectionList.addEventListener('input', (e) => {
      if (e.target.classList.contains('manpower-wage') || e.target.classList.contains('manpower-count')) {
        updateWageTotal();
      }
    });
    manpowerSelectionList.addEventListener('change', (e) => {
      if (e.target.classList.contains('manpower-count')) {
        updateWageTotal();
      }
    });
  }

  // 인력 유형 렌더링 (카테고리)
  function renderCategoryList() {
    manpowerTypeTitle.innerText = "인력 유형 선택";
    typeBreadcrumb.style.display = "none";
    backTypeBtn.style.display = "none";
    typeList.innerHTML = "";
    
    Object.keys(manpowerData).forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'type-btn category-select-btn';
      btn.innerText = cat;
      btn.style.width = "100%";
      btn.style.marginBottom = "8px";
      btn.onclick = () => renderSubTypes(cat);
      typeList.appendChild(btn);
    });
  }

  // 인력 유형 렌더링 (하위 항목)
  function renderSubTypes(category) {
    manpowerTypeTitle.innerText = category;
    typeBreadcrumb.style.display = "block";
    currentCategorySpan.innerText = category;
    backTypeBtn.style.display = "block";
    typeList.innerHTML = "";

    manpowerData[category].forEach(type => {
      const btn = document.createElement('button');
      btn.className = 'type-btn detail-type-btn';
      btn.innerText = type;
      btn.style.width = "100%";
      btn.style.marginBottom = "8px";
      btn.onclick = () => selectManpowerType(type);
      typeList.appendChild(btn);
    });
  }

  function selectManpowerType(type) {
    if (currentManpowerTarget) {
      currentManpowerTarget.innerText = type;
      currentManpowerTarget.style.color = "white";
      const hiddenInput = currentManpowerTarget.parentElement.querySelector('.manpower-type-val');
      if (hiddenInput) hiddenInput.value = type;
      
      manpowerTypeModal.classList.add('hidden');
    }
  }

  if (backTypeBtn) {
    backTypeBtn.onclick = () => renderCategoryList();
  }

  // 총액 계산
  function updateWageTotal() {
    let totalWage = 0;
    const workDays = parseInt(document.getElementById('manpowerWorkDays').value) || 1;
    
    document.querySelectorAll('.manpower-item').forEach(item => {
      const wage = parseInt(item.querySelector('.manpower-wage').value) || 0;
      const count = parseInt(item.querySelector('.manpower-count').value) || 0;
      totalWage += (wage * count);
    });

    const totalIncurred = totalWage * workDays;
    const fee = Math.floor(totalIncurred * 0.1);
    const finalTotal = totalIncurred + fee;

    document.getElementById('wageTotalDisplay').innerText = totalIncurred.toLocaleString() + "원";
    document.getElementById('matchingFeeDisplay').innerText = fee.toLocaleString() + "원";
    document.getElementById('totalAmountDisplay').innerText = finalTotal.toLocaleString() + "원";
  }

  // 날짜 변경 시에도 총액 업데이트
  const manpowerWorkDaysSelect = document.getElementById('manpowerWorkDays');
  if (manpowerWorkDaysSelect) {
    manpowerWorkDaysSelect.onchange = () => updateWageTotal();
  }

  // 인력 요청 제출
  const submitManpowerBtn = document.getElementById('submitManpowerBtn');
  if (submitManpowerBtn) {
    submitManpowerBtn.onclick = () => {
      alert('인력 지원 요청이 완료되었습니다!');
      closeAllModals();
    };
  }
});

