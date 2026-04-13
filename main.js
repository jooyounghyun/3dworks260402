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
        // 자동 입력
        document.getElementById('manpowerCompanyName').value = currentUser.name;
        document.getElementById('manpowerCompanyContact').value = currentUser.phone;
        manpowerModal.classList.remove('hidden');
        updateManpowerSummary(); // 초기화
      } else {
        alert('로그인이 필요한 서비스입니다.');
        loginModal.classList.remove('hidden');
      }
    };
  }

  // --- 인력 지원 비용 계산 로직 ---
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

  // 인력 추가 버튼 클릭 시
  const addManpowerBtn = document.getElementById('addManpowerBtn');
  if (addManpowerBtn) {
    addManpowerBtn.onclick = () => {
      const list = document.getElementById('manpowerSelectionList');
      const newItem = document.createElement('div');
      newItem.className = 'manpower-item manpower-grid';
      newItem.style.marginTop = '5px';
      newItem.innerHTML = `
        <select class="manpower-type">
          <optgroup label="보통인력">
            <option value="일반인부">일반인부</option>
            <option value="철거공">철거공</option>
          </optgroup>
          <optgroup label="기술인력">
            <option value="전기공">전기공</option>
          </optgroup>
        </select>
        <input type="number" class="manpower-wage" placeholder="임금" value="150000">
        <input type="number" class="manpower-count" placeholder="인원" value="1">
        <button type="button" class="remove-manpower-btn" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:18px; padding:0 5px; line-height:1;">&times;</button>
      `;
      list.appendChild(newItem);
      updateManpowerSummary();
    };
  }

  // 인력 삭제 버튼 클릭 시 (이벤트 위임)
  const manpowerSelectionList = document.getElementById('manpowerSelectionList');
  if (manpowerSelectionList) {
    manpowerSelectionList.addEventListener('click', (e) => {
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
  };

  // --- 버튼 클릭 핸들러 (회원가입 유형, 폐기물 종류, 환경 선택 등) ---
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.onclick = () => {
      if (btn.classList.contains('waste-type-btn')) {
        // 폐기물 종류: 중복 선택 가능
        btn.classList.toggle('selected');
      } else if (btn.classList.contains('env-choice-btn')) {
        // 원상복구 작업환경: 그룹별 단일 선택
        const group = btn.getAttribute('data-group');
        document.querySelectorAll(`.env-choice-btn[data-group="${group}"]`).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      } else if (btn.classList.contains('elevator-btn')) {
        // 엘리베이터: 단일 선택 (폐기물 처리 모달용)
        document.querySelectorAll('.elevator-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      } else if (btn.classList.contains('parking-btn')) {
        // 주차: 단일 선택 (폐기물 처리 모달용)
        document.querySelectorAll('.parking-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      } else if (btn.classList.contains('meal-btn')) {
        // 식사 제공 (인력 지원용)
        document.querySelectorAll('.meal-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      } else if (btn.classList.contains('break-btn')) {
        // 휴식 시간 (인력 지원용)
        document.querySelectorAll('.break-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      } else if (btn.parentElement.classList.contains('type-selection')) {
        // 회원가입 단계 1
        document.getElementById('signupStep1').classList.add('hidden');
        document.getElementById('signupStep2').classList.remove('hidden');
      }
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

        if (selectedService === '상가 철거') {
          demolitionModal.classList.remove('hidden');
        } else if (selectedService === '폐기물 처리') {
          wasteModal.classList.remove('hidden');
        } else if (selectedService === '상가 원상복구') {
          restorationModal.classList.remove('hidden');
        } else {
          alert(`선택된 서비스: ${selectedService}\n전문가 팀 매칭을 시작합니다!`);
        }
      } else {
        alert('최소 하나 이상의 서비스를 선택해주세요.');
      }
    };
  }

  // --- 사진 업로드 공통 로직 ---
  function setupPhotoUpload(dropzoneId, inputId, previewId, minPhotos = 3) {
    const dropzone = document.getElementById(dropzoneId);
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    let filesArr = [];

    if (!dropzone) return { getFiles: () => [] };

    dropzone.onclick = () => input.click();
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      handleFiles(files);
    };

    dropzone.ondragover = (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#38bdf8';
    };
    dropzone.ondragleave = () => {
      dropzone.style.borderColor = '#334155';
    };
    dropzone.ondrop = (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#334155';
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    };

    function handleFiles(files) {
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      if (filesArr.length + imageFiles.length > 10) {
        alert('최대 10장까지만 업로드 가능합니다.');
        return;
      }
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
          div.innerHTML = `
            <img src="${e.target.result}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px;">
            <button style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;">&times;</button>
          `;
          div.querySelector('button').onclick = (ev) => {
            ev.stopPropagation();
            filesArr.splice(index, 1);
            updatePreview();
          };
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

  // --- 상가 철거 제출 ---
  const submitDemolitionBtn = document.getElementById('submitDemolitionBtn');
  if (submitDemolitionBtn) {
    submitDemolitionBtn.onclick = () => {
      const location = document.getElementById('demoLocation').value;
      const area = document.getElementById('demoArea').value;
      const height = document.getElementById('demoHeight').value;
      const notes = document.getElementById('demoNotes').value;
      const files = demoPhotos.getFiles();

      // 작업 환경 수집
      const envGroups = ['demo-elevator', 'demo-ladder', 'demo-night', 'demo-parking'];
      const selectedEnvs = {};
      let allSelected = true;

      envGroups.forEach(group => {
        const selected = document.querySelector(`.env-choice-btn[data-group="${group}"].selected`);
        if (selected) {
          selectedEnvs[group] = selected.getAttribute('data-value');
        } else {
          allSelected = false;
        }
      });

      if (!location) return alert('현장 위치를 입력해주세요.');
      if (!area) return alert('평수를 입력해주세요.');
      if (!height) return alert('층고를 입력해주세요.');
      if (!allSelected) return alert('작업 환경의 모든 항목(가능/불가능)을 선택해주세요.');
      if (files.length < 3) return alert('현장 사진을 최소 3장 이상 업로드해주세요.');
      
      alert(`상가 철거 요청 완료!\n위치: ${location}\n규모: ${area}평 / 층고 ${height}m\n\n[작업 환경]\n- 엘리베이터: ${selectedEnvs['demo-elevator']}\n- 사다리차: ${selectedEnvs['demo-ladder']}\n- 야간/주말: ${selectedEnvs['demo-night']}\n- 무료주차: ${selectedEnvs['demo-parking']}\n\n[기타 참고사항]\n${notes || '없음'}\n\n곧 전문가 팀이 배정됩니다.`);
      
      // 초기화
      document.getElementById('demoLocation').value = '';
      document.getElementById('demoArea').value = '';
      document.getElementById('demoHeight').value = '';
      document.getElementById('demoNotes').value = '';
      document.querySelectorAll(`.env-choice-btn[data-group^="demo-"]`).forEach(b => b.classList.remove('selected'));
      demolitionModal.classList.add('hidden');
    };
  }

  // --- 폐기물 처리 제출 ---
  const submitWasteBtn = document.getElementById('submitWasteBtn');
  if (submitWasteBtn) {
    submitWasteBtn.onclick = () => {
      const location = document.getElementById('wasteLocation').value;
      const volume = document.getElementById('wasteVolume').value;
      const selectedTypes = Array.from(document.querySelectorAll('.waste-type-btn.selected')).map(b => b.innerText);
      const elevator = document.querySelector('.elevator-btn.selected');
      const parking = document.querySelector('.parking-btn.selected');
      const files = wastePhotos.getFiles();

      if (!location) return alert('현장 위치를 입력해주세요.');
      if (selectedTypes.length === 0) return alert('폐기물 종류를 최소 하나 선택해주세요.');
      if (!volume) return alert('예상 분량을 선택해주세요.');
      if (!elevator) return alert('엘리베이터 유무를 선택해주세요.');
      if (!parking) return alert('주차 가능 여부를 선택해주세요.');
      if (files.length < 3) return alert('현장 사진을 최소 3장 이상 업로드해주세요.');

      alert(`폐기물 처리 요청 완료!\n위치: ${location}\n종류: ${selectedTypes.join(', ')}\n분량: ${volume}\n엘리베이터: ${elevator.innerText}\n주차: ${parking.innerText}\n곧 전문가가 연락드립니다.`);
      wasteModal.classList.add('hidden');
    };
  }

  // --- 상가 원상복구 제출 ---
  const submitRestorationBtn = document.getElementById('submitRestorationBtn');
  if (submitRestorationBtn) {
    submitRestorationBtn.onclick = () => {
      const location = document.getElementById('restoreLocation').value;
      const area = document.getElementById('restoreArea').value;
      const height = document.getElementById('restoreHeight').value;
      const notes = document.getElementById('restoreNotes').value;
      const files = restorePhotos.getFiles();

      // 작업 환경 수집
      const envGroups = ['elevator', 'ladder', 'night', 'parking'];
      const selectedEnvs = {};
      let allSelected = true;

      envGroups.forEach(group => {
        const selected = document.querySelector(`.env-choice-btn[data-group="${group}"].selected`);
        if (selected) {
          selectedEnvs[group] = selected.getAttribute('data-value');
        } else {
          allSelected = false;
        }
      });

      if (!location) return alert('현장 위치를 입력해주세요.');
      if (!area) return alert('평수를 입력해주세요.');
      if (!height) return alert('층고를 입력해주세요.');
      if (!allSelected) return alert('작업 환경의 모든 항목(가능/불가능)을 선택해주세요.');
      if (files.length < 3) return alert('현장 사진을 최소 3장 이상 업로드해주세요.');

      alert(`상가 원상복구 요청 완료!\n위치: ${location}\n규모: ${area}평 / 층고 ${height}m\n\n[작업 환경]\n- 엘리베이터: ${selectedEnvs.elevator}\n- 사다리차: ${selectedEnvs.ladder}\n- 야간/주말: ${selectedEnvs.night}\n- 무료주차: ${selectedEnvs.parking}\n\n[기타 참고사항]\n${notes || '없음'}\n\n곧 전문가 팀이 배정됩니다.`);
      
      // 초기화
      document.getElementById('restoreLocation').value = '';
      document.getElementById('restoreArea').value = '';
      document.getElementById('restoreHeight').value = '';
      document.getElementById('restoreNotes').value = '';
      document.querySelectorAll('.env-choice-btn').forEach(b => b.classList.remove('selected'));
      restorationModal.classList.add('hidden');
    };
  }

  // --- 인력 지원 요청 제출 ---
  const submitManpowerBtn = document.getElementById('submitManpowerBtn');
  if (submitManpowerBtn) {
    submitManpowerBtn.onclick = () => {
      const location = document.getElementById('manpowerLocation').value;
      const managerName = document.getElementById('manpowerManagerName').value;
      const managerContact = document.getElementById('manpowerManagerContact').value;
      const workDate = document.getElementById('manpowerWorkDate').value;
      const workDays = document.getElementById('manpowerWorkDays').value;
      const startTime = document.getElementById('manpowerStartTime').value;
      const endTime = document.getElementById('manpowerEndTime').value;
      const meal = document.querySelector('.meal-btn.selected');
      const breakTime = document.querySelector('.break-btn.selected');

      // 인력 선택 정보 수집
      const items = document.querySelectorAll('.manpower-item');
      let manpowerDetails = '';
      items.forEach(item => {
        const type = item.querySelector('.manpower-type').value;
        const count = item.querySelector('.manpower-count').value;
        manpowerDetails += `\n- ${type}: ${count}명`;
      });

      if (!location) return alert('현장 위치를 입력해주세요.');
      if (!managerName) return alert('현장 담당자 이름을 입력해주세요.');
      if (!managerContact) return alert('현장 담당자 연락처를 입력해주세요.');
      if (!workDate) return alert('작업일을 선택해주세요.');
      if (!workDays) return alert('작업일수를 입력해주세요.');
      if (!meal) return alert('식사 제공 여부를 선택해주세요.');
      if (!breakTime) return alert('휴식 시간 여부를 선택해주세요.');

      alert(`인력 지원 요청 완료!\n위치: ${location}\n담당자: ${managerName} (${managerContact})\n일정: ${workDate} (${workDays}일간)\n시간: ${startTime} ~ ${endTime}\n인력 내역: ${manpowerDetails}\n식사: ${meal.innerText} / 휴식: ${breakTime.innerText}\n곧 전문가가 연결됩니다.`);
      
      // 초기화
      document.getElementById('manpowerLocation').value = '';
      document.getElementById('manpowerManagerName').value = '';
      document.getElementById('manpowerManagerContact').value = '';
      document.getElementById('manpowerWorkDate').value = '';
      document.getElementById('manpowerWorkDays').value = '';
      document.querySelectorAll('.meal-btn, .break-btn').forEach(b => b.classList.remove('selected'));
      
      // 인력 리스트 초기화 (첫 번째 아이템만 남기고 삭제)
      const list = document.getElementById('manpowerSelectionList');
      list.innerHTML = `
        <div class="manpower-item manpower-grid">
          <select class="manpower-type">
            <optgroup label="보통인력">
              <option value="일반인부">일반인부</option>
              <option value="철거공">철거공</option>
            </optgroup>
            <optgroup label="기술인력">
              <option value="전기공">전기공</option>
            </optgroup>
          </select>
          <input type="number" class="manpower-wage" placeholder="임금" value="150000">
          <input type="number" class="manpower-count" placeholder="인원" value="1">
        </div>
      `;
      
      manpowerModal.classList.add('hidden');
    };
  }
});
