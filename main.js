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

  // --- 2. 상태 관리 (복구된 데이터 및 상태) ---
  const MANPOWER_HIERARCHY = {
    "보통인력": {
      "일반인부": {
        "현장 청소정리 및 잡일": 150000,
        "현장 자재정리 및 잡일": 160000,
        "현장 설치/해체 보조 및 잡일": 160000,
        "상하체/운반 작업 및 잡일": 170000,
        "철거 현장 폐기물 처리 및 잡일": 170000,
        "아시바,시스템,폼 정리 및 잡일": 180000,
        "땅파기/삽질/톱/낫질 작업 및 잡일": 190000,
        "예초작업": 200000,
        "예초작업 및 개인장비지침": 250000
      },
      "철거공": {
        "가벽/천장 철거": 180000,
        "뿌레카 철거(바닥)": 190000,
        "뿌레카 철거(벽/천장)": 200000,
        "글라인더 면갈이(천장)": 190000,
        "글라인더 면갈이(바닥/벽)": 180000,
        "지붕/옥상 철거": 180000,
        "석면 해체 작업": 200000,
        "유압크라샤 철거": 210000,
        "프리즈마 절단": 230000,
        "프리즈마 절단 및 개인장비지침": 280000
      }
    },
    "기술인력": {
      "전기공": {
        "내선(인테리어)전공": 230000,
        "외선 및 고압 전공": 300000
      }
    }
  };

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
    isLoggedIn: true
  };

  let activeManpowerItem = null;
  let selectionPath = [];

  // --- 3. 공통 모달 제어 ---
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
    if (e.target.classList.contains('modal')) closeAllModals();
  };

  if (loginBtn) loginBtn.onclick = (e) => { e.preventDefault(); closeAllModals(); loginModal.classList.remove('hidden'); };
  if (hireTeamBtn) hireTeamBtn.onclick = () => { closeAllModals(); serviceModal.classList.remove('hidden'); };
  if (manpowerBtn) manpowerBtn.onclick = () => { closeAllModals(); manpowerModal.classList.remove('hidden'); };

  // --- 4. 회원가입 로직 (복구 완료) ---
  if (signupBtn) {
    signupBtn.onclick = (e) => {
      e.preventDefault();
      closeAllModals();
      signupModal.classList.remove('hidden');
      if (signupStep1) signupStep1.classList.remove('hidden');
      if (signupStep2) signupStep2.classList.add('hidden');
      if (signupStepCompany) signupStepCompany.classList.add('hidden');
      if (signupStep3) signupStep3.classList.add('hidden');
    };
  }

  // 1단계: 개인/업체 선택
  document.querySelectorAll('#signupStep1 .type-btn').forEach(btn => {
    btn.onclick = () => {
      signupState.type = btn.getAttribute('data-type');
      signupStep1.classList.add('hidden');
      signupStep2.classList.remove('hidden');
    };
  });

  // 2단계: 통신사 선택
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

  // 인증번호 확인 -> 업체면 정보 입력 단계로, 개인은 바로 가입 정보 단계로
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

  // 업체 정보 단계: 사업자번호 확인
  const checkBusinessBtn = document.getElementById('checkBusinessBtn');
  if (checkBusinessBtn) {
    checkBusinessBtn.onclick = () => {
      const bNum = document.getElementById('businessNumInput').value;
      const cName = document.getElementById('companyNameInput').value;
      if (!cName || !bNum) return alert('정보를 모두 입력해주세요.');
      alert('사업자 정보가 확인되었습니다.');
      document.getElementById('nextToFinalStepBtn').disabled = false;
    };
  }

  if (document.getElementById('nextToFinalStepBtn')) {
    document.getElementById('nextToFinalStepBtn').onclick = () => goToSignupStep3();
  }

  function goToSignupStep3() {
    signupStep2.classList.add('hidden');
    signupStepCompany.classList.add('hidden');
    signupStep3.classList.remove('hidden');
    document.getElementById('signupPhone').value = signupState.phone;
  }

  // --- 5. 인력 지원 요청 로직 복구 ---
  function renderTypeList() {
    const typeList = document.getElementById('typeList');
    const title = document.getElementById('manpowerTypeTitle');
    const backBtn = document.getElementById('backTypeBtn');
    if (!typeList) return;
    typeList.innerHTML = '';
    let currentData = MANPOWER_HIERARCHY;
    selectionPath.forEach(path => { currentData = currentData[path]; });

    if (selectionPath.length === 0) {
      if (title) title.innerText = "인력 대분류 선택";
      if (backBtn) backBtn.style.display = 'none';
      if (document.getElementById('typeBreadcrumb')) document.getElementById('typeBreadcrumb').style.display = 'none';
    } else {
      if (title) title.innerText = selectionPath[selectionPath.length - 1];
      if (backBtn) backBtn.style.display = 'block';
      if (document.getElementById('typeBreadcrumb')) {
        document.getElementById('typeBreadcrumb').style.display = 'block';
        document.getElementById('currentCategory').innerText = selectionPath[selectionPath.length - 1];
      }
    }

    Object.keys(currentData).forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'type-btn';
      btn.style.width = '100%'; btn.style.textAlign = 'left'; btn.style.marginBottom = '8px';
      const isLeaf = typeof currentData[key] === 'number';
      btn.innerHTML = `<span>${key}</span> ${isLeaf ? `<span style="float:right; color:#38bdf8;">${currentData[key].toLocaleString()}원</span>` : '<span style="float:right; color:#94a3b8;">&gt;</span>'}`;
      btn.onclick = () => { if (isLeaf) selectManpowerType(key, currentData[key]); else { selectionPath.push(key); renderTypeList(); } };
      typeList.appendChild(btn);
    });
  }

  function selectManpowerType(name, wage) {
    if (activeManpowerItem) {
      activeManpowerItem.querySelector('.manpower-type-btn').innerText = name;
      activeManpowerItem.querySelector('.manpower-type-btn').style.color = 'white';
      activeManpowerItem.querySelector('.manpower-type-val').value = name;
      activeManpowerItem.querySelector('.manpower-wage').value = wage;
      updateManpowerSummary();
      manpowerTypeModal.classList.add('hidden');
    }
  }

  if (document.getElementById('backTypeBtn')) {
    document.getElementById('backTypeBtn').onclick = () => { selectionPath.pop(); renderTypeList(); };
  }

  if (manpowerSelectionList) {
    manpowerSelectionList.onclick = (e) => {
      if (e.target.classList.contains('manpower-type-btn')) { activeManpowerItem = e.target.closest('.manpower-item'); selectionPath = []; renderTypeList(); manpowerTypeModal.classList.remove('hidden'); }
      if (e.target.classList.contains('remove-manpower-btn')) { if (manpowerSelectionList.querySelectorAll('.manpower-item').length > 1) { e.target.closest('.manpower-item').remove(); updateManpowerSummary(); } }
    };
  }

  if (document.getElementById('addManpowerBtn')) {
    document.getElementById('addManpowerBtn').onclick = () => {
      const newItem = document.createElement('div');
      newItem.className = 'manpower-item manpower-grid'; newItem.style.marginTop = '10px';
      newItem.innerHTML = `<button type="button" class="manpower-type-btn" style="flex: 2; text-align: left; background: #0f172a; border: 1px solid #334155; color: #94a3b8; padding: 10px; border-radius: 6px; font-size: 12px; cursor: pointer;">인력 유형 선택</button><input type="hidden" class="manpower-type-val"><input type="number" class="manpower-wage" placeholder="임금" value="0" style="flex: 1.5;"><select class="manpower-count" style="flex: 1; height: 38px;"><option value="" selected disabled>인원</option>${[...Array(20).keys()].map(i => `<option value="${i+1}">${i+1}명</option>`).join('')}</select><button type="button" class="remove-manpower-btn" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:18px; padding:0 5px; line-height:1;">&times;</button>`;
      manpowerSelectionList.appendChild(newItem);
    };
  }

  function updateManpowerSummary() {
    const items = document.querySelectorAll('.manpower-item');
    const days = parseInt(document.getElementById('manpowerWorkDays').value) || 1;
    let sum = 0; items.forEach(item => { sum += (parseInt(item.querySelector('.manpower-wage').value) || 0) * (parseInt(item.querySelector('.manpower-count').value) || 0); });
    const total = sum * days; const fee = Math.floor(total * 0.1);
    document.getElementById('wageTotalDisplay').innerText = total.toLocaleString() + '원';
    document.getElementById('matchingFeeDisplay').innerText = fee.toLocaleString() + '원';
    document.getElementById('totalAmountDisplay').innerText = (total + fee).toLocaleString() + '원';
  }

  document.addEventListener('input', (e) => { if (e.target.classList.contains('manpower-wage') || e.target.classList.contains('manpower-count') || e.target.id === 'manpowerWorkDays') updateManpowerSummary(); });

  // --- 6. 기타 서비스 및 모달 ---
  if (confirmServiceBtn) {
    confirmServiceBtn.onclick = () => {
      const selected = document.querySelector('.service-item-btn.selected');
      if (!selected) return alert('서비스를 선택해주세요.');
      const txt = selected.innerText.trim(); closeAllModals();
      if (txt === '상가 철거') demolitionModal.classList.remove('hidden');
      else if (txt === '폐기물 처리') wasteModal.classList.remove('hidden');
      else if (txt === '상가 원상복구') restorationModal.classList.remove('hidden');
      else if (txt === '전기 공사') electricModal.classList.remove('hidden');
      else if (txt === '배관막힘 누수공사') pipeModal.classList.remove('hidden');
    };
  }

  document.querySelectorAll('.service-item-btn').forEach(btn => { btn.onclick = () => { document.querySelectorAll('.service-item-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); }; });
  document.addEventListener('click', (e) => { const btn = e.target.closest('.type-btn'); if (!btn || btn.classList.contains('manpower-type-btn') || btn.closest('#manpowerTypeModal') || btn.closest('#signupModal')) return; btn.classList.toggle('selected'); });
});
