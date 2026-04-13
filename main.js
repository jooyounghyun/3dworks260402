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
        "예초기장비지침": 250000
      },
      "철거공": 180000
    },
    "기술인력": {
      "전기공": 250000
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
        document.getElementById('manpowerCompanyName').value = currentUser.name;
        document.getElementById('manpowerCompanyContact').value = currentUser.phone;
        manpowerModal.classList.remove('hidden');
        updateManpowerSummary();
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
    
    typeList.innerHTML = '';
    
    // 현재 경로에 따른 데이터 가져오기
    let currentData = MANPOWER_HIERARCHY;
    selectionPath.forEach(path => {
      currentData = currentData[path];
    });

    // 제목 및 UI 설정
    if (selectionPath.length === 0) {
      title.innerText = "인력 대분류 선택";
      backBtn.style.display = 'none';
      breadcrumb.style.display = 'none';
    } else {
      title.innerText = selectionPath[selectionPath.length - 1];
      backBtn.style.display = 'block';
      breadcrumb.style.display = 'block';
      currentCategorySpan.innerText = selectionPath[selectionPath.length - 1];
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
      
      typeBtn.innerText = name;
      typeBtn.style.color = 'white';
      typeVal.value = name;
      wageInput.value = wage;
      
      updateManpowerSummary();
      manpowerTypeModal.classList.add('hidden');
    }
  }

  document.getElementById('backTypeBtn').onclick = () => {
    selectionPath.pop();
    renderTypeList();
  };

  document.getElementById('closeTypeBtn').onclick = () => {
    manpowerTypeModal.classList.add('hidden');
  };

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
          alert('최소 한 명의 인력은 선택해야 합니다.');
        }
      }
    });
  }

  const addManpowerBtn = document.getElementById('addManpowerBtn');
  if (addManpowerBtn) {
    addManpowerBtn.onclick = () => {
      const list = document.getElementById('manpowerSelectionList');
      const newItem = document.createElement('div');
      newItem.className = 'manpower-item manpower-grid';
      newItem.style.marginTop = '5px';
      newItem.innerHTML = `
        <button type="button" class="manpower-type-btn" style="flex: 2; text-align: left; background: #0f172a; border: 1px solid #334155; color: #94a3b8; padding: 10px; border-radius: 6px; font-size: 12px; cursor: pointer;">인력 유형 선택</button>
        <input type="hidden" class="manpower-type-val">
        <input type="number" class="manpower-wage" placeholder="임금" value="0">
        <input type="number" class="manpower-count" placeholder="인원" value="1">
        <button type="button" class="remove-manpower-btn" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:18px; padding:0 5px; line-height:1;">&times;</button>
      `;
      list.appendChild(newItem);
    };
  }

  // --- 비용 계산 로직 ---
  function updateManpowerSummary() {
    const items = document.querySelectorAll('.manpower-item');
    const workDaysInput = document.getElementById('manpowerWorkDays');
    const days = parseInt(workDaysInput.value) || 1;

    let totalWageSum = 0;

    items.forEach(item => {
      const wageInput = item.querySelector('.manpower-wage');
      const countInput = item.querySelector('.manpower-count');
      const wage = parseInt(wageInput.value) || 0;
      const count = parseInt(countInput.value) || 0;
      totalWageSum += (wage * count);
    });

    const wageTotal = totalWageSum * days;
    const matchingFee = Math.floor(wageTotal * 0.1);
    const totalAmount = wageTotal + matchingFee;

    document.getElementById('wageTotalDisplay').innerText = wageTotal.toLocaleString() + '원';
    document.getElementById('matchingFeeDisplay').innerText = matchingFee.toLocaleString() + '원';
    document.getElementById('totalAmountDisplay').innerText = totalAmount.toLocaleString() + '원';
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
      if (btn.id === 'closeTypeBtn') return; // 별도 처리
      loginModal.classList.add('hidden');
      signupModal.classList.add('hidden');
      serviceModal.classList.add('hidden');
      demolitionModal.classList.add('hidden');
      if (wasteModal) wasteModal.classList.add('hidden');
      if (restorationModal) restorationModal.classList.add('hidden');
      if (manpowerModal) manpowerModal.classList.add('hidden');
    };
  });

  window.onclick = (e) => {
    if (e.target === loginModal) loginModal.classList.add('hidden');
    if (e.target === signupModal) signupModal.classList.add('hidden');
    if (e.target === serviceModal) serviceModal.classList.add('hidden');
    if (e.target === demolitionModal) demolitionModal.classList.add('hidden');
    if (e.target === wasteModal) wasteModal.classList.add('hidden');
    if (e.target === restorationModal) restorationModal.classList.add('hidden');
    if (e.target === manpowerModal) manpowerModal.classList.add('hidden');
    if (e.target === manpowerTypeModal) manpowerTypeModal.classList.add('hidden');
  };

  // --- 버튼 클릭 핸들러 ---
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.onclick = () => {
      if (btn.parentElement.id === 'typeList') return; // 인력 분류 모달 버튼은 별도 처리
      
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
        document.getElementById('signupStep1').classList.add('hidden');
        document.getElementById('signupStep2').classList.remove('hidden');
      }
    };
  });

  // --- 기타 기능 (인증, 사진 업로드 등) ---
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
        serviceModal.classList.add('hidden');
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
    input.onchange = (e) => handleFiles(Array.from(e.target.files));
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
      const location = document.getElementById('demoLocation').value;
      if (!location) return alert('현장 위치를 입력해주세요.');
      alert('상가 철거 요청 완료!');
      demolitionModal.classList.add('hidden');
    };
  }

  const submitManpowerBtn = document.getElementById('submitManpowerBtn');
  if (submitManpowerBtn) {
    submitManpowerBtn.onclick = () => {
      const location = document.getElementById('manpowerLocation').value;
      if (!location) return alert('현장 위치를 입력해주세요.');
      
      const items = document.querySelectorAll('.manpower-item');
      let manpowerDetails = '';
      items.forEach(item => {
        const type = item.querySelector('.manpower-type-val').value;
        const count = item.querySelector('.manpower-count').value;
        if (type) manpowerDetails += `\n- ${type}: ${count}명`;
      });

      alert(`인력 지원 요청 완료!\n위치: ${location}\n내역: ${manpowerDetails || '없음'}`);
      manpowerModal.classList.add('hidden');
    };
  }
});
