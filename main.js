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

  // --- 닫기 버튼 공통 제어 ---
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.onclick = () => {
      loginModal.classList.add('hidden');
      signupModal.classList.add('hidden');
      serviceModal.classList.add('hidden');
      demolitionModal.classList.add('hidden');
      if (wasteModal) wasteModal.classList.add('hidden');
      if (restorationModal) restorationModal.classList.add('hidden');
    };
  });

  window.onclick = (e) => {
    if (e.target === loginModal) loginModal.classList.add('hidden');
    if (e.target === signupModal) signupModal.classList.add('hidden');
    if (e.target === serviceModal) serviceModal.classList.add('hidden');
    if (e.target === demolitionModal) demolitionModal.classList.add('hidden');
    if (e.target === wasteModal) wasteModal.classList.add('hidden');
    if (e.target === restorationModal) restorationModal.classList.add('hidden');
  };

  // --- 버튼 클릭 핸들러 (회원가입 유형, 폐기물 종류, 환경 선택 등) ---
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.onclick = () => {
      if (btn.classList.contains('waste-type-btn') || btn.classList.contains('restore-env-btn')) {
        // 폐기물 종류 및 원상복구 작업환경: 중복 선택 가능
        btn.classList.toggle('selected');
      } else if (btn.classList.contains('elevator-btn')) {
        // 엘리베이터: 단일 선택
        document.querySelectorAll('.elevator-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      } else if (btn.classList.contains('parking-btn')) {
        // 주차: 단일 선택
        document.querySelectorAll('.parking-btn').forEach(b => b.classList.remove('selected'));
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
      const files = demoPhotos.getFiles();

      if (!location) return alert('현장 위치를 입력해주세요.');
      if (!area) return alert('평수를 입력해주세요.');
      if (files.length < 3) return alert('사진을 최소 3장 이상 업로드해주세요.');
      
      alert(`상가 철거 요청 완료!\n위치: ${location}\n평수: ${area}평\n곧 전문가 팀이 배정됩니다.`);
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
      const selectedEnvs = Array.from(document.querySelectorAll('.restore-env-btn.selected')).map(b => b.innerText);
      const files = restorePhotos.getFiles();

      if (!location) return alert('현장 위치를 입력해주세요.');
      if (!area) return alert('평수를 입력해주세요.');
      if (files.length < 3) return alert('현장 사진을 최소 3장 이상 업로드해주세요.');

      alert(`상가 원상복구 요청 완료!\n위치: ${location}\n평수: ${area}평\n작업환경: ${selectedEnvs.length > 0 ? selectedEnvs.join(', ') : '특이사항 없음'}\n곧 전문가 팀이 배정됩니다.`);
      restorationModal.classList.add('hidden');
    };
  }
});
