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
  const demolitionModal = document.getElementById('demolitionModal');
  const closeDemolitionBtn = document.getElementById('closeDemolitionBtn');

  if (confirmServiceBtn) {
    confirmServiceBtn.onclick = () => {
      const selectedBtn = document.querySelector('.service-item-btn.selected');
      
      if (selectedBtn) {
        const selectedService = selectedBtn.innerText;
        serviceModal.classList.add('hidden');

        if (selectedService === '상가 철거') {
          demolitionModal.classList.remove('hidden');
        } else {
          alert(`선택된 서비스: ${selectedService}\n전문가 팀 매칭을 시작합니다!`);
        }
      } else {
        alert('최소 하나 이상의 서비스를 선택해주세요.');
      }
    };
  }

  if (closeDemolitionBtn) {
    closeDemolitionBtn.onclick = () => {
      demolitionModal.classList.add('hidden');
    };
  }

  // --- 상가 철거 사진 업로드 기능 ---
  const photoDropzone = document.getElementById('photoDropzone');
  const photoInput = document.getElementById('photoInput');
  const photoPreview = document.getElementById('photoPreview');
  let selectedFiles = [];

  if (photoDropzone) {
    photoDropzone.onclick = () => photoInput.click();
    
    photoInput.onchange = (e) => {
      const files = Array.from(e.target.files);
      handleFiles(files);
    };

    // 드래그 앤 드롭 방지 및 처리
    photoDropzone.ondragover = (e) => {
      e.preventDefault();
      photoDropzone.style.borderColor = '#38bdf8';
    };
    photoDropzone.ondragleave = () => {
      photoDropzone.style.borderColor = '#334155';
    };
    photoDropzone.ondrop = (e) => {
      e.preventDefault();
      photoDropzone.style.borderColor = '#334155';
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    };
  }

  function handleFiles(files) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (selectedFiles.length + imageFiles.length > 10) {
      alert('최대 10장까지만 업로드 가능합니다.');
      return;
    }

    selectedFiles = [...selectedFiles, ...imageFiles];
    updatePreview();
  }

  function updatePreview() {
    photoPreview.innerHTML = '';
    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const div = document.createElement('div');
        div.style.position = 'relative';
        div.innerHTML = `
          <img src="${e.target.result}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px;">
          <button style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;">&times;</button>
        `;
        div.querySelector('button').onclick = () => {
          selectedFiles.splice(index, 1);
          updatePreview();
        };
        photoPreview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  }

  const submitDemolitionBtn = document.getElementById('submitDemolitionBtn');
  if (submitDemolitionBtn) {
    submitDemolitionBtn.onclick = () => {
      const location = document.getElementById('demoLocation').value;
      const area = document.getElementById('demoArea').value;
      
      if (!location) {
        alert('현장 위치를 입력해주세요.');
        return;
      }
      if (!area) {
        alert('평수를 입력해주세요.');
        return;
      }
      if (selectedFiles.length < 3) {
        alert('사진을 최소 3장 이상 업로드해주세요.');
        return;
      }
      
      alert(`상가 철거 정보가 저장되었습니다.\n위치: ${location}\n평수: ${area}평\n사진: ${selectedFiles.length}장\n곧 전문가 팀이 배정됩니다.`);
      demolitionModal.classList.add('hidden');
    };
  }
});
