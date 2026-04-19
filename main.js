document.addEventListener('DOMContentLoaded', () => {
  console.log("3D Resolver JS Loaded!");

  // 모달 요소들
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = document.getElementById('loginModal');
  const signupBtn = document.getElementById('signupBtn');
  const signupModal = document.getElementById('signupModal');
  const hireTeamBtn = document.getElementById('hireTeamBtn');
  const serviceModal = document.getElementById('serviceModal');
  const demolitionModal = document.getElementById('demolitionModal');
  const wasteModal = document.getElementById('wasteModal');
  const restorationModal = document.getElementById('restorationModal');
  const manpowerModal = document.getElementById('manpowerModal');
  const manpowerBtn = document.getElementById('manpowerBtn');
  const manpowerTypeModal = document.getElementById('manpowerTypeModal');

  // --- 인력 계층 데이터 정의 ---
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

  // 현재 편집 중인 인력 행
  let activeManpowerItem = null;
  // 선택 경로 추적 (예: ["보통인력", "일반인부"])
  let selectionPath = [];

  // --- 가상의 현재 사용자 정보 (테스트용) ---
  const currentUser = {
    name: "(주)삼디건설",
    phone: "010-1234-5678",
    isLoggedIn: true
  };

  // --- 모달 초기화 함수 ---
  function resetManpowerModal() {
    // 입력 필드 초기화
    if (document.getElementById('manpowerLocation')) document.getElementById('manpowerLocation').value = '';
    if (document.getElementById('manpowerCompanyName')) document.getElementById('manpowerCompanyName').value = currentUser.name;
    if (document.getElementById('manpowerCompanyContact')) document.getElementById('manpowerCompanyContact').value = currentUser.phone;
    if (document.getElementById('manpowerManagerName')) document.getElementById('manpowerManagerName').value = '';
    if (document.getElementById('manpowerManagerContact')) document.getElementById('manpowerManagerContact').value = '';
    if (document.getElementById('manpowerStartDate')) document.getElementById('manpowerStartDate').value = '';
    if (document.getElementById('manpowerWorkDays')) document.getElementById('manpowerWorkDays').value = 1;

    // 인력 리스트 초기화 (첫 번째 행만 남기고 초기화)
    const list = document.getElementById('manpowerSelectionList');
    if (list) {
      list.innerHTML = `
        <div class="manpower-item manpower-grid">
          <button type="button" class="manpower-type-btn" style="flex: 2; text-align: left; background: #0f172a; border: 1px solid #334155; color: #94a3b8; padding: 10px; border-radius: 6px; font-size: 12px; cursor: pointer;">인력 유형 선택</button>
          <input type="hidden" class="manpower-type-val">
          <input type="number" class="manpower-wage" placeholder="임금" value="0" style="flex: 1.5;">
          <select class="manpower-count" style="flex: 1; height: 38px;">
            <option value="" selected disabled>인원</option>
            <option value="1">1명</option>
            <option value="2">2명</option>
            <option value="3">3명</option>
            <option value="4">4명</option>
            <option value="5">5명</option>
            <option value="6">6명</option>
            <option value="7">7명</option>
            <option value="8">8명</option>
            <option value="9">9명</option>
            <option value="10">10명</option>
            <option value="11">11명</option>
            <option value="12">12명</option>
            <option value="13">13명</option>
            <option value="14">14명</option>
            <option value="15">15명</option>
            <option value="16">16명</option>
            <option value="17">17명</option>
            <option value="18">18명</option>
            <option value="19">19명</option>
            <option value="20">20명</option>
          </select>
          <button type="button" class="remove-manpower-btn" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:18px; padding:0 5px; line-height:1;">&times;</button>
        </div>
      `;
    }

    // 식사 및 휴게시간 버튼 초기화
    document.querySelectorAll('.meal-btn, .break-btn').forEach(btn => btn.classList.remove('selected'));
    
    updateManpowerSummary();
  }

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
      document.getElementById('signupStep1').classList.remove('hidden');
      document.getElementById('signupStep2').classList.add('hidden');
      document.getElementById('signupStep3').classList.add('hidden');
    };
  }

  if (hireTeamBtn) {
    hireTeamBtn.onclick = () => {
      serviceModal.classList.remove('hidden');
    };
  }

  if (manpowerBtn) {
    manpowerBtn.onclick = () => {
      if (currentUser.isLoggedIn) {
        resetManpowerModal(); // 열 때마다 초기화
        manpowerModal.classList.remove('hidden');
      } else {
        alert('로그인이 필요한 서비스입니다.');
        loginModal.classList.remove('hidden');
      }
    };
  }

  // --- 인력 유형 선택 로직 ---
  function openTypeSelection(itemElement) {
    activeManpowerItem = itemElement;
    selectionPath = [];
    renderTypeList();
    manpowerTypeModal.classList.remove('hidden');
  }

  function renderTypeList() {
    const typeList = document.getElementById('typeList');
    const title = document.getElementById('manpowerTypeTitle');
    const backBtn = document.getElementById('backTypeBtn');
    const breadcrumb = document.getElementById('typeBreadcrumb');
    const currentCategorySpan = document.getElementById('currentCategory');
    
    if (!typeList) return;
    typeList.innerHTML = '';
    
    // 현재 경로에 따른 데이터 가져오기
    let currentData = MANPOWER_HIERARCHY;
    selectionPath.forEach(path => {
      currentData = currentData[path];
    });

    // 제목 및 UI 설정
    if (selectionPath.length === 0) {
      if (title) title.innerText = "인력 대분류 선택";
      if (backBtn) backBtn.style.display = 'none';
      if (breadcrumb) breadcrumb.style.display = 'none';
    } else {
      if (title) title.innerText = selectionPath[selectionPath.length - 1];
      if (backBtn) backBtn.style.display = 'block';
      if (breadcrumb) breadcrumb.style.display = 'block';
      if (currentCategorySpan) currentCategorySpan.innerText = selectionPath[selectionPath.length - 1];
    }

    // 목록 렌더링
    if (typeof currentData === 'object') {
      Object.keys(currentData).forEach(key => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'type-btn';
        btn.style.textAlign = 'left';
        btn.style.padding = '12px';
        
        const isLeaf = typeof currentData[key] === 'number';
        btn.innerHTML = `<span>${key}</span> ${isLeaf ? `<span style="float:right; color:#38bdf8;">${currentData[key].toLocaleString()}원</span>` : '<span style="float:right; color:#94a3b8;">&gt;</span>'}`;
        
        btn.onclick = () => {
          if (isLeaf) {
            // 최종 선택 완료
            selectManpowerType(key, currentData[key]);
          } else {
            // 하위 분류로 이동
            selectionPath.push(key);
            renderTypeList();
          }
        };
        typeList.appendChild(btn);
      });
    }
  }

  function selectManpowerType(name, wage) {
    if (activeManpowerItem) {
      const typeBtn = activeManpowerItem.querySelector('.manpower-type-btn');
      const typeVal = activeManpowerItem.querySelector('.manpower-type-val');
      const wageInput = activeManpowerItem.querySelector('.manpower-wage');
      
      if (typeBtn) {
        typeBtn.innerText = name;
        typeBtn.style.color = 'white';
      }
      if (typeVal) typeVal.value = name;
      if (wageInput) wageInput.value = wage;
      
      updateManpowerSummary();
      if (manpowerTypeModal) manpowerTypeModal.classList.add('hidden');
    }
  }

  const backTypeBtn = document.getElementById('backTypeBtn');
  if (backTypeBtn) {
    backTypeBtn.onclick = () => {
      selectionPath.pop();
      renderTypeList();
    };
  }

  const closeTypeBtn = document.getElementById('closeTypeBtn');
  if (closeTypeBtn) {
    closeTypeBtn.onclick = () => {
      if (manpowerTypeModal) manpowerTypeModal.classList.add('hidden');
    };
  }

  // --- 인력 행 관리 ---
  const manpowerSelectionList = document.getElementById('manpowerSelectionList');
  if (manpowerSelectionList) {
    // 유형 선택 버튼 클릭 시 (위임)
    manpowerSelectionList.addEventListener('click', (e) => {
      if (e.target.classList.contains('manpower-type-btn')) {
        openTypeSelection(e.target.closest('.manpower-item'));
      }
      
      if (e.target.classList.contains('remove-manpower-btn')) {
        const items = document.querySelectorAll('.manpower-item');
        if (items.length > 1) {
          e.target.closest('.manpower-item').remove();
          updateManpowerSummary();
        } else {
          // 마지막 남은 행이면 초기화
          const lastItem = e.target.closest('.manpower-item');
          const typeBtn = lastItem.querySelector('.manpower-type-btn');
          const typeVal = lastItem.querySelector('.manpower-type-val');
          const wageInput = lastItem.querySelector('.manpower-wage');
          const countSelect = lastItem.querySelector('.manpower-count');
          
          if (typeBtn) {
            typeBtn.innerText = '인력 유형 선택';
            typeBtn.style.color = '#94a3b8';
          }
          if (typeVal) typeVal.value = '';
          if (wageInput) wageInput.value = 0;
          if (countSelect) countSelect.value = '';
          
          updateManpowerSummary();
        }
      }
    });
  }

  const addManpowerBtn = document.getElementById('addManpowerBtn');
  if (addManpowerBtn) {
    addManpowerBtn.onclick = () => {
      const list = document.getElementById('manpowerSelectionList');
      if (!list) return;
      const newItem = document.createElement('div');
      newItem.className = 'manpower-item manpower-grid';
      newItem.style.marginTop = '5px';
      newItem.innerHTML = `
        <button type="button" class="manpower-type-btn" style="flex: 2; text-align: left; background: #0f172a; border: 1px solid #334155; color: #94a3b8; padding: 10px; border-radius: 6px; font-size: 12px; cursor: pointer;">인력 유형 선택</button>
        <input type="hidden" class="manpower-type-val">
        <input type="number" class="manpower-wage" placeholder="임금" value="0" style="flex: 1.5;">
        <select class="manpower-count" style="flex: 1; height: 38px;">
          <option value="" selected disabled>인원선택</option>
          <option value="1">1명</option>
          <option value="2">2명</option>
          <option value="3">3명</option>
          <option value="4">4명</option>
          <option value="5">5명</option>
          <option value="6">6명</option>
          <option value="7">7명</option>
          <option value="8">8명</option>
          <option value="9">9명</option>
          <option value="10">10명</option>
          <option value="11">11명</option>
          <option value="12">12명</option>
          <option value="13">13명</option>
          <option value="14">14명</option>
          <option value="15">15명</option>
          <option value="16">16명</option>
          <option value="17">17명</option>
          <option value="18">18명</option>
          <option value="19">19명</option>
          <option value="20">20명</option>
        </select>
        <button type="button" class="remove-manpower-btn" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:18px; padding:0 5px; line-height:1;">&times;</button>
      `;
      list.appendChild(newItem);
    };
  }

  // --- 비용 계산 로직 ---
  function updateManpowerSummary() {
    const items = document.querySelectorAll('.manpower-item');
    const workDaysInput = document.getElementById('manpowerWorkDays');
    const days = workDaysInput ? (parseInt(workDaysInput.value) || 1) : 1;

    let totalWageSum = 0;

    items.forEach(item => {
      const wageInput = item.querySelector('.manpower-wage');
      const countSelect = item.querySelector('.manpower-count');
      const wage = wageInput ? (parseInt(wageInput.value) || 0) : 0;
      const count = countSelect ? (parseInt(countSelect.value) || 0) : 0;
      totalWageSum += (wage * count);
    });

    const wageTotal = totalWageSum * days;
    const matchingFee = Math.floor(wageTotal * 0.1);
    const totalAmount = wageTotal + matchingFee;

    const wageTotalDisplay = document.getElementById('wageTotalDisplay');
    const matchingFeeDisplay = document.getElementById('matchingFeeDisplay');
    const totalAmountDisplay = document.getElementById('totalAmountDisplay');

    if (wageTotalDisplay) wageTotalDisplay.innerText = wageTotal.toLocaleString() + '원';
    if (matchingFeeDisplay) matchingFeeDisplay.innerText = matchingFee.toLocaleString() + '원';
    if (totalAmountDisplay) totalAmountDisplay.innerText = totalAmount.toLocaleString() + '원';
  }

  // 입력 변경 시 실시간 반영
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('manpower-wage') || 
        e.target.classList.contains('manpower-count') || 
        e.target.id === 'manpowerWorkDays') {
      updateManpowerSummary();
    }
  });

  // --- 닫기 버튼 공통 제어 ---
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.onclick = () => {
      // 만약 인력 유형 선택창의 닫기 버튼이라면 해당 창만 닫음
      if (btn.id === 'closeTypeBtn') {
        if (manpowerTypeModal) manpowerTypeModal.classList.add('hidden');
        return;
      }

      // 그 외의 경우 모든 모달을 숨김 처리
      const modals = [
        loginModal, signupModal, serviceModal, demolitionModal, 
        wasteModal, restorationModal, manpowerModal, manpowerTypeModal
      ];
      modals.forEach(modal => {
        if (modal) modal.classList.add('hidden');
      });
    };
  });

  window.onclick = (e) => {
    // 바깥 영역 클릭 시 처리
    if (e.target === manpowerTypeModal) {
      if (manpowerTypeModal) manpowerTypeModal.classList.add('hidden');
      return;
    }

    const modals = [
      loginModal, signupModal, serviceModal, demolitionModal, 
      wasteModal, restorationModal, manpowerModal
    ];
    modals.forEach(modal => {
      if (modal && e.target === modal) modal.classList.add('hidden');
    });
  };

  // --- 버튼 클릭 핸들러 ---
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.type-btn');
    if (!btn) return;
    
    // 인력 분류 모달 버튼은 별도 처리
    if (btn.parentElement.id === 'typeList') return;
    
    if (btn.classList.contains('waste-type-btn')) {
      btn.classList.toggle('selected');
    } else if (btn.classList.contains('env-choice-btn')) {
      const group = btn.getAttribute('data-group');
      document.querySelectorAll(`.env-choice-btn[data-group="${group}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    } else if (btn.classList.contains('elevator-btn')) {
      document.querySelectorAll('.elevator-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    } else if (btn.classList.contains('parking-btn')) {
      document.querySelectorAll('.parking-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    } else if (btn.classList.contains('meal-btn')) {
      document.querySelectorAll('.meal-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    } else if (btn.classList.contains('break-btn')) {
      document.querySelectorAll('.break-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    } else if (btn.parentElement.classList.contains('type-selection')) {
      const signupStep1 = document.getElementById('signupStep1');
      const signupStep2 = document.getElementById('signupStep2');
      if (signupStep1) signupStep1.classList.add('hidden');
      if (signupStep2) signupStep2.classList.remove('hidden');
    }
  });

  // --- 기타 기능 (인증, 사진 업로드 등) ---
  const sendVerifyBtn = document.getElementById('sendVerifyBtn');
  if (sendVerifyBtn) {
    sendVerifyBtn.onclick = () => {
      alert('인증번호가 전송되었습니다.');
      const verifyCodeGroup = document.getElementById('verifyCodeGroup');
      if (verifyCodeGroup) verifyCodeGroup.classList.remove('hidden');
    };
  }

  const checkVerifyBtn = document.getElementById('checkVerifyBtn');
  if (checkVerifyBtn) {
    checkVerifyBtn.onclick = () => {
      alert('인증되었습니다.');
      const signupStep2 = document.getElementById('signupStep2');
      const signupStep3 = document.getElementById('signupStep3');
      if (signupStep2) signupStep2.classList.add('hidden');
      if (signupStep3) signupStep3.classList.remove('hidden');
    };
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.onsubmit = (e) => {
      e.preventDefault();
      alert('회원가입이 완료되었습니다!');
      if (signupModal) signupModal.classList.add('hidden');
    };
  }

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
      const selectedBtn = document.querySelector('.service-item-btn.selected');
      if (selectedBtn) {
        const selectedService = selectedBtn.innerText;
        if (serviceModal) serviceModal.classList.add('hidden');
        if (selectedService === '상가 철거') demolitionModal.classList.remove('hidden');
        else if (selectedService === '폐기물 처리') wasteModal.classList.remove('hidden');
        else if (selectedService === '상가 원상복구') restorationModal.classList.remove('hidden');
        else alert(`선택된 서비스: ${selectedService}\n전문가 팀 매칭을 시작합니다!`);
      } else {
        alert('최소 하나 이상의 서비스를 선택해주세요.');
      }
    };
  }

  function setupPhotoUpload(dropzoneId, inputId, previewId, minPhotos = 3) {
    const dropzone = document.getElementById(dropzoneId);
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    let filesArr = [];
    if (!dropzone) return { getFiles: () => [] };
    dropzone.onclick = () => input.click();
    if (input) {
      input.onchange = (e) => handleFiles(Array.from(e.target.files));
    }
    dropzone.ondragover = (e) => { e.preventDefault(); dropzone.style.borderColor = '#38bdf8'; };
    dropzone.ondragleave = () => { dropzone.style.borderColor = '#334155'; };
    dropzone.ondrop = (e) => { e.preventDefault(); dropzone.style.borderColor = '#334155'; handleFiles(Array.from(e.dataTransfer.files)); };
    function handleFiles(files) {
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      if (filesArr.length + imageFiles.length > 10) return alert('최대 10장까지만 업로드 가능합니다.');
      filesArr = [...filesArr, ...imageFiles];
      updatePreview();
    }
    function updatePreview() {
      if (!preview) return;
      preview.innerHTML = '';
      filesArr.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const div = document.createElement('div');
          div.style.position = 'relative';
          div.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px;"><button style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;">&times;</button>`;
          div.querySelector('button').onclick = (ev) => { ev.stopPropagation(); filesArr.splice(index, 1); updatePreview(); };
          preview.appendChild(div);
        };
        reader.readAsDataURL(file);
      });
    }
    return { getFiles: () => filesArr };
  }

  const demoPhotos = setupPhotoUpload('photoDropzone', 'photoInput', 'photoPreview', 3);
  const wastePhotos = setupPhotoUpload('wastePhotoDropzone', 'wastePhotoInput', 'wastePhotoPreview', 3);
  const restorePhotos = setupPhotoUpload('restorePhotoDropzone', 'restorePhotoInput', 'restorePhotoPreview', 3);

  // --- 제출 핸들러 ---
  const submitDemolitionBtn = document.getElementById('submitDemolitionBtn');
  if (submitDemolitionBtn) {
    submitDemolitionBtn.onclick = () => {
      const demoLocation = document.getElementById('demoLocation');
      const location = demoLocation ? demoLocation.value : '';
      if (!location) return alert('현장 위치를 입력해주세요.');
      alert('상가 철거 요청 완료!');
      if (demolitionModal) demolitionModal.classList.add('hidden');
    };
  }

  const submitManpowerBtn = document.getElementById('submitManpowerBtn');
  if (submitManpowerBtn) {
    submitManpowerBtn.onclick = () => {
      const manpowerLocation = document.getElementById('manpowerLocation');
      const location = manpowerLocation ? manpowerLocation.value : '';
      if (!location) return alert('현장 위치를 입력해주세요.');
      
      const items = document.querySelectorAll('.manpower-item');
      let manpowerDetails = '';
      items.forEach(item => {
        const typeVal = item.querySelector('.manpower-type-val');
        const countSelect = item.querySelector('.manpower-count');
        const type = typeVal ? typeVal.value : '';
        const count = countSelect ? countSelect.value : '';
        if (type) manpowerDetails += `\n- ${type}: ${count}명`;
      });

      alert(`인력 지원 요청 완료!\n위치: ${location}\n내역: ${manpowerDetails || '없음'}`);
      if (manpowerModal) manpowerModal.classList.add('hidden');
    };
  }
});
