document.addEventListener('DOMContentLoaded', () => {
  console.log("3D Resolver JS Loaded!");

  // --- 1. 요소 선택 ---
  const loginBtn = document.getElementById('loginBtn');
  const myPageModal = document.getElementById('myPageModal');
  const chatModal = document.getElementById('chatModal');
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
  const signupStepWorker = document.getElementById('signupStepWorker');
  const signupStep3 = document.getElementById('signupStep3');
  const workerTypeSelection = document.getElementById('workerTypeSelection');
  const manpowerSelectionList = document.getElementById('manpowerSelectionList');

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
    businessVerified: false,
    selectedWorkerTypes: [],
    oauthMode: false,
    returnToMyPage: false,
    convertingType: false
  };

  let activeManpowerItem = null;
  let selectionPath = [];

  // --- Supabase 연동 헬퍼 ---
  function emailFromPhone(phone) {
    const digits = (phone || '').replace(/[^0-9]/g, '');
    return `p${digits}@3dsolver.app`;
  }

  function translateAuthError(message) {
    const map = {
      'Invalid login credentials': '전화번호 또는 비밀번호가 올바르지 않습니다.',
      'User already registered': '이미 가입된 전화번호입니다. 로그인을 이용해주세요.',
      'Email not confirmed': '계정 인증이 완료되지 않았습니다. 관리자에게 문의해주세요.',
      'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 합니다.'
    };
    return map[message] || message;
  }

  async function refreshAuthUI() {
    const authArea = document.querySelector('.auth');
    if (!authArea || !window.supabaseClient) return;
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session && session.user) {
      let { data: profile } = await supabaseClient
        .from('profiles')
        .select('phone, user_type, company_name')
        .eq('id', session.user.id)
        .maybeSingle();

      // 소셜 로그인(카카오 등)으로 첫 로그인한 경우 profiles 행이 없을 수 있음 → 자동 생성
      let justCreatedType = null;
      if (!profile) {
        let pendingType = 'user';
        try { pendingType = localStorage.getItem('pendingSignupType') || 'user'; } catch (e) {}
        try { localStorage.removeItem('pendingSignupType'); } catch (e) {}
        const { data: created } = await supabaseClient
          .from('profiles')
          .insert({ id: session.user.id, user_type: pendingType })
          .select('phone, user_type, company_name')
          .maybeSingle();
        profile = created;
        justCreatedType = pendingType;
      }

      const socialName = session.user.user_metadata && (session.user.user_metadata.nickname || session.user.user_metadata.full_name);
      const label = (profile && profile.company_name) || (profile && profile.phone) || socialName || '회원';
      authArea.innerHTML = `
        <span style="font-size:14px; color:#23262b;">${label}님</span>
        <a href="#" id="myPageBtn" title="마이페이지" aria-label="마이페이지" style="display:inline-flex; align-items:center;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4"></circle>
            <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6"></path>
          </svg>
        </a>
        <a href="#" id="logoutBtn">로그아웃</a>
      `;
      const myPageBtn = document.getElementById('myPageBtn');
      if (myPageBtn) {
        myPageBtn.onclick = (e) => {
          e.preventDefault();
          openMyPageModal();
        };
      }
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.onclick = async (e) => {
          e.preventDefault();
          await supabaseClient.auth.signOut();
          refreshAuthUI();
        };
      }

      // 소셜 로그인으로 방금 가입된 업체/일용직 회원이면, 유형에 맞는 추가정보 입력창을 이어서 띄움
      if (justCreatedType === 'company' || justCreatedType === 'worker') {
        signupState.type = justCreatedType;
        signupState.phone = (profile && profile.phone) || '';
        signupState.oauthMode = true;
        closeAllModals();
        signupModal.classList.remove('hidden');
        signupStep1.classList.add('hidden');
        signupStep2.classList.add('hidden');
        if (justCreatedType === 'company') {
          signupStepCompany.classList.remove('hidden');
          const nextBtn = document.getElementById('nextToFinalStepFromCompanyBtn');
          if (nextBtn) nextBtn.disabled = true;
        } else {
          signupStepWorker.classList.remove('hidden');
          renderWorkerTypeSelection();
        }
      }
    } else {
      authArea.innerHTML = `
        <a href="#" id="loginBtn">로그인</a>
        <a href="#" id="signupBtn" class="signup">회원가입</a>
      `;
      bindAuthOpenButtons();
    }
  }

  function bindAuthOpenButtons() {
    const loginBtnEl = document.getElementById('loginBtn');
    const signupBtnEl = document.getElementById('signupBtn');
    if (loginBtnEl) loginBtnEl.onclick = (e) => { e.preventDefault(); closeAllModals(); loginModal.classList.remove('hidden'); };
    if (signupBtnEl) {
      signupBtnEl.onclick = (e) => {
        e.preventDefault();
        signupState.oauthMode = false;
        closeAllModals();
        signupModal.classList.remove('hidden');
        if (signupStep1) signupStep1.classList.remove('hidden');
        if (signupStep2) signupStep2.classList.add('hidden');
        if (signupStepCompany) signupStepCompany.classList.add('hidden');
        if (signupStepWorker) signupStepWorker.classList.add('hidden');
        if (signupStep3) signupStep3.classList.add('hidden');
        const socialChoice = document.getElementById('socialChoice');
        if (socialChoice) socialChoice.classList.add('hidden');
        document.querySelectorAll('#signupStep1 .type-btn').forEach(b => b.classList.remove('selected'));
      };
    }
  }

  async function requireLogin() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session || !session.user) {
      alert('로그인이 필요한 기능입니다. 먼저 로그인해주세요.');
      closeAllModals();
      loginModal.classList.remove('hidden');
      return null;
    }
    return session.user;
  }

  // 모달 내부의 모든 입력값 + 선택된 버튼들을 자동으로 수집
  function collectModalData(modal) {
    const fields = {};
    modal.querySelectorAll('input[id], select[id], textarea[id]').forEach(el => {
      if (el.type === 'file') return;
      fields[el.id] = el.value;
    });
    const selections = {};
    modal.querySelectorAll('.type-btn.selected').forEach(btn => {
      const group = btn.dataset.group ||
        Array.from(btn.classList).find(c => c !== 'type-btn' && c !== 'selected') ||
        'selected';
      if (!selections[group]) selections[group] = [];
      selections[group].push(btn.dataset.value || btn.innerText.trim());
    });
    return { fields, selections };
  }

  async function uploadPhotos(fileInputEl, userId, folder) {
    if (!fileInputEl || !fileInputEl.files || fileInputEl.files.length === 0) return [];
    const urls = [];
    for (const file of Array.from(fileInputEl.files)) {
      const path = `${userId}/${folder}/${Date.now()}-${file.name}`;
      const { error } = await supabaseClient.storage.from('work-photos').upload(path, file);
      if (error) { console.error('사진 업로드 실패:', error.message); continue; }
      const { data } = supabaseClient.storage.from('work-photos').getPublicUrl(path);
      if (data && data.publicUrl) urls.push(data.publicUrl);
    }
    return urls;
  }

  async function saveWorkRequest(requestType, modal, photoInputEl, submitBtn) {
    const user = await requireLogin();
    if (!user) return;

    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = '전송 중...';

    try {
      const photoUrls = await uploadPhotos(photoInputEl, user.id, requestType);
      const { fields, selections } = collectModalData(modal);
      const { error } = await supabaseClient.from('work_requests').insert({
        user_id: user.id,
        request_type: requestType,
        payload: { fields, selections },
        photo_urls: photoUrls
      });
      if (error) throw error;
      alert('요청이 정상적으로 접수되었습니다. 담당자가 확인 후 연락드릴게요.');
      closeAllModals();
      modal.querySelectorAll('input, textarea').forEach(el => { if (el.type !== 'hidden') el.value = ''; });
      if (photoInputEl && photoInputEl._resetStoredFiles) photoInputEl._resetStoredFiles();
      modal.querySelectorAll('.type-btn.selected').forEach(b => b.classList.remove('selected'));
    } catch (err) {
      console.error(err);
      alert('요청 접수 중 문제가 발생했습니다: ' + (err.message || err));
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = originalText;
    }
  }

  // --- 로그인 폼 실제 동작 ---
  const loginFormEl = document.querySelector('.login-form');
  if (loginFormEl) {
    loginFormEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const phoneVal = document.getElementById('phone').value;
      const pwVal = document.getElementById('password').value;
      if (!phoneVal || !pwVal) { alert('전화번호와 비밀번호를 입력해주세요.'); return; }
      const submitBtn = loginFormEl.querySelector('.login-submit');
      const originalText = submitBtn.innerText;
      submitBtn.disabled = true; submitBtn.innerText = '로그인 중...';
      try {
        const { error } = await supabaseClient.auth.signInWithPassword({
          email: emailFromPhone(phoneVal),
          password: pwVal
        });
        if (error) { alert('로그인에 실패했습니다: ' + translateAuthError(error.message)); return; }
        closeAllModals();
        loginFormEl.reset();
        refreshAuthUI();
      } catch (err) {
        console.error(err);
        alert('로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        submitBtn.disabled = false; submitBtn.innerText = originalText;
      }
    });
  }

  // --- 최종 회원가입 폼 실제 동작 (계정 생성 + 프로필 저장) ---
  const signupFormEl = document.getElementById('signupForm');
  if (signupFormEl) {
    signupFormEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw = document.getElementById('signupPw').value;
      const pwConfirm = document.getElementById('signupPwConfirm').value;
      if (!signupState.phone) { alert('휴대폰 인증을 먼저 진행해주세요.'); return; }
      if (pw.length < 6) { alert('비밀번호는 6자 이상이어야 합니다.'); return; }
      if (pw !== pwConfirm) { alert('비밀번호가 일치하지 않습니다.'); return; }

      const submitBtn = signupFormEl.querySelector('.login-submit');
      const originalText = submitBtn.innerText;
      submitBtn.disabled = true; submitBtn.innerText = '가입 처리 중...';

      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email: emailFromPhone(signupState.phone),
          password: pw
        });
        if (error) throw error;

        const userId = data.user && data.user.id;
        if (userId) {
          const { error: profileError } = await supabaseClient.from('profiles').insert({
            id: userId,
            phone: signupState.phone,
            user_type: signupState.type || 'user',
            company_name: document.getElementById('companyNameInput') ? document.getElementById('companyNameInput').value : null,
            business_reg_no: document.getElementById('businessNumInput') ? document.getElementById('businessNumInput').value : null,
            worker_types: signupState.selectedWorkerTypes && signupState.selectedWorkerTypes.length ? signupState.selectedWorkerTypes : null
          });
          if (profileError) throw profileError;
        }

        alert('회원가입이 완료되었습니다.');
        closeAllModals();
        signupFormEl.reset();
        refreshAuthUI();
      } catch (err) {
        console.error(err);
        alert('회원가입 중 문제가 발생했습니다: ' + translateAuthError(err.message || err));
      } finally {
        submitBtn.disabled = false; submitBtn.innerText = originalText;
      }
    });
  }

  // --- 3. 공통 모달 제어 ---
  function closeAllModals() {
    const modals = [
      loginModal, signupModal, serviceModal, manpowerModal,
      demolitionModal, wasteModal, restorationModal, electricModal, pipeModal, manpowerTypeModal, myPageModal, chatModal
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

  if (hireTeamBtn) hireTeamBtn.onclick = () => { closeAllModals(); serviceModal.classList.remove('hidden'); };
  if (manpowerBtn) {
    manpowerBtn.onclick = async () => {
      closeAllModals();
      manpowerModal.classList.remove('hidden');
      if (window.supabaseClient) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('phone, company_name')
            .eq('id', session.user.id)
            .maybeSingle();
          const nameField = document.getElementById('manpowerCompanyName');
          const contactField = document.getElementById('manpowerCompanyContact');
          const socialName = session.user.user_metadata && (session.user.user_metadata.nickname || session.user.user_metadata.full_name);
          if (nameField) nameField.value = (profile && profile.company_name) || socialName || '';
          if (contactField) contactField.value = (profile && profile.phone) || '';
        }
      }
    };
  }

  // --- SNS 로그인 연동 ---
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const kakaoLoginBtn = document.getElementById('kakaoLoginBtn');
  const naverLoginBtn = document.getElementById('naverLoginBtn');

  // 1. Google 로그인
  if (googleLoginBtn) {
    googleLoginBtn.onclick = () => {
      alert('구글 로그인 API를 호출합니다. (Google Console 설정 필요)');
    };
  }

  // 2. 카카오 로그인
  if (kakaoLoginBtn) {
    kakaoLoginBtn.onclick = async () => {
      if (!window.supabaseClient) { alert('로그인 서비스 연결에 문제가 있습니다.'); return; }
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'kakao',
        options: { redirectTo: window.location.origin }
      });
      if (error) alert('카카오 로그인에 실패했습니다: ' + error.message);
    };
  }

  // 3. 네이버 로그인
  if (naverLoginBtn) {
    naverLoginBtn.onclick = () => {
      alert('네이버 로그인 창을 띄웁니다. (Naver Developers 설정 필요)');
    };
  }

  // --- 소셜 회원가입 연동 ---
  const googleSignupBtn = document.getElementById('googleSignupBtn');
  const kakaoSignupBtn = document.getElementById('kakaoSignupBtn');
  const naverSignupBtn = document.getElementById('naverSignupBtn');

  function handleSocialSignup(provider) {
    if (!signupState.type) {
      alert('사용자 유형을 먼저 선택해주세요.');
      return;
    }

    if (provider === '카카오') {
      if (!window.supabaseClient) { alert('로그인 서비스 연결에 문제가 있습니다.'); return; }
      // 카카오 인증 후 다시 돌아왔을 때 이어서 처리할 수 있도록 선택한 유형을 잠깐 저장해둠
      try { localStorage.setItem('pendingSignupType', signupState.type); } catch (e) {}
      supabaseClient.auth.signInWithOAuth({
        provider: 'kakao',
        options: { redirectTo: window.location.origin }
      }).then(({ error }) => {
        if (error) alert('카카오 로그인에 실패했습니다: ' + error.message);
      });
      return;
    }

    console.log(`${provider} 회원가입 시도: 유형=${signupState.type}`);
    
    // 소셜 로그인 시뮬레이션 (실제로는 API 호출 및 리다이렉트 발생)
    alert(`${provider} 인증에 성공했습니다.`);
    
    // 소셜 로그인 시에는 휴대폰 번호를 가져왔다고 가정 (가상의 데이터)
    signupState.phone = "010-9999-8888"; 
    signupState.isVerified = true;

    // 유형에 따라 다음 단계로 이동
    if (signupState.type === 'company') {
      signupStep1.classList.add('hidden');
      signupStep2.classList.add('hidden');
      signupStepCompany.classList.remove('hidden');
    } else if (signupState.type === 'worker') {
      signupStep1.classList.add('hidden');
      signupStep2.classList.add('hidden');
      signupStepWorker.classList.remove('hidden');
      renderWorkerTypeSelection();
    } else {
      signupStep1.classList.add('hidden');
      signupStep2.classList.add('hidden');
      goToSignupStep3();
    }
  }

  if (googleSignupBtn) googleSignupBtn.onclick = () => handleSocialSignup('Google');
  if (kakaoSignupBtn) kakaoSignupBtn.onclick = () => handleSocialSignup('카카오');
  if (naverSignupBtn) naverSignupBtn.onclick = () => handleSocialSignup('네이버');

  // 회원가입/로그인 모달 열기는 bindAuthOpenButtons()에서 처리 (로그인 상태에 따라 버튼이 동적으로 바뀌므로)

  // 1단계: 개인/업체 선택
  document.querySelectorAll('#signupStep1 .type-btn').forEach(btn => {
    btn.onclick = () => {
      const type = btn.getAttribute('data-type');
      signupState.type = type;
      
      let typeKo = '';
      if (type === 'user') typeKo = '사용자';
      else if (type === 'company') typeKo = '업체';
      else if (type === 'worker') typeKo = '일용구직자';

      const socialChoice = document.getElementById('socialChoice');
      const selectedTypeDisplay = document.getElementById('selectedTypeDisplay');
      if (socialChoice && selectedTypeDisplay) {
        selectedTypeDisplay.innerText = `[${typeKo}] 유형을 선택하셨습니다.`;
        socialChoice.classList.remove('hidden');
        document.querySelectorAll('#signupStep1 .type-selection .type-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      }
    };
  });

  // Step 1에서 방식 선택
  const phoneSignupBtn = document.getElementById('phoneSignupBtn');
  if (phoneSignupBtn) {
    phoneSignupBtn.onclick = () => {
      signupStep1.classList.add('hidden');
      signupStep2.classList.remove('hidden');
    };
  }

  const googleStep1Btn = document.getElementById('googleStep1Btn');
  const kakaoStep1Btn = document.getElementById('kakaoStep1Btn');
  const naverStep1Btn = document.getElementById('naverStep1Btn');

  if (googleStep1Btn) googleStep1Btn.onclick = () => handleSocialSignup('Google');
  if (kakaoStep1Btn) kakaoStep1Btn.onclick = () => handleSocialSignup('카카오');
  if (naverStep1Btn) naverStep1Btn.onclick = () => handleSocialSignup('네이버');

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

  // 인증번호 확인 -> 유형에 따라 다음 단계로
  const checkVerifyBtn = document.getElementById('checkVerifyBtn');
  if (checkVerifyBtn) {
    checkVerifyBtn.onclick = () => {
      alert('휴대폰 인증이 완료되었습니다.');
      if (signupState.type === 'company') {
        signupStep2.classList.add('hidden');
        signupStepCompany.classList.remove('hidden');
      } else if (signupState.type === 'worker') {
        signupStep2.classList.add('hidden');
        signupStepWorker.classList.remove('hidden');
        renderWorkerTypeSelection();
      } else {
        goToSignupStep3();
      }
    };
  }

  // 일용구직자 공종 선택 리스트 렌더링
  function renderWorkerTypeSelection() {
    if (!workerTypeSelection) return;
    workerTypeSelection.innerHTML = '';
    
    // 계층형 데이터를 평면화하여 뿌려줌 (대분류 > 중분류 > 소분류)
    Object.keys(MANPOWER_HIERARCHY).forEach(bigCat => {
      const bigHeader = document.createElement('div');
      bigHeader.style.cssText = "color: #1d3557; font-weight: bold; margin-top: 15px; font-size: 14px; border-bottom: 1px solid #ddd6c5; padding-bottom: 5px;";
      bigHeader.innerText = bigCat;
      workerTypeSelection.appendChild(bigHeader);

      Object.keys(MANPOWER_HIERARCHY[bigCat]).forEach(midCat => {
        const midGroup = document.createElement('div');
        midGroup.style.cssText = "padding-left: 10px; display: flex; flex-direction: column; gap: 5px; margin-top: 10px;";
        
        const midHeader = document.createElement('div');
        midHeader.style.cssText = "color: #6c6f76; font-size: 13px; font-weight: 500;";
        midHeader.innerText = midCat;
        midGroup.appendChild(midHeader);

        const itemContainer = document.createElement('div');
        itemContainer.style.cssText = "display: grid; grid-template-columns: 1fr 1fr; gap: 8px;";

        Object.keys(MANPOWER_HIERARCHY[bigCat][midCat]).forEach(smallCat => {
          const btn = document.createElement('button');
          btn.type = "button";
          btn.className = "type-btn";
          btn.style.cssText = "padding: 10px; font-size: 11px; text-align: left; height: auto; min-height: 44px; display: flex; align-items: center; justify-content: center; text-align: center;";
          btn.innerText = smallCat;
          btn.onclick = () => {
            btn.classList.toggle('selected');
          };
          itemContainer.appendChild(btn);
        });
        midGroup.appendChild(itemContainer);
        workerTypeSelection.appendChild(midGroup);
      });
    });
  }

  // 일용구직자 단계에서 계정 설정 단계로
  const nextToFinalStepFromWorkerBtn = document.getElementById('nextToFinalStepFromWorkerBtn');
  if (nextToFinalStepFromWorkerBtn) {
    nextToFinalStepFromWorkerBtn.onclick = () => {
      const selected = Array.from(workerTypeSelection.querySelectorAll('.type-btn.selected')).map(btn => btn.innerText);
      if (selected.length === 0) return alert('최소 하나 이상의 작업 유형을 선택해주세요.');
      signupState.selectedWorkerTypes = selected;
      if (signupState.oauthMode) {
        finishOAuthProfile(Object.assign(
          { worker_types: selected },
          signupState.convertingType ? { user_type: 'worker' } : {}
        ));
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
      document.getElementById('nextToFinalStepFromCompanyBtn').disabled = false;
    };
  }

  if (document.getElementById('nextToFinalStepFromCompanyBtn')) {
    document.getElementById('nextToFinalStepFromCompanyBtn').onclick = () => {
      if (signupState.oauthMode) {
        finishOAuthProfile(Object.assign(
          {
            company_name: document.getElementById('companyNameInput').value,
            business_reg_no: document.getElementById('businessNumInput').value
          },
          signupState.convertingType ? { user_type: 'company' } : {}
        ));
      } else {
        goToSignupStep3();
      }
    };
  }

  // 소셜 로그인(OAuth) 가입 마무리 또는 마이페이지에서의 공종 재선택 저장에 공용으로 사용
  async function finishOAuthProfile(extraFields) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session || !session.user) return;
    const { error } = await supabaseClient
      .from('profiles')
      .update(extraFields)
      .eq('id', session.user.id);
    if (error) {
      alert('저장 중 문제가 발생했습니다: ' + error.message);
      return;
    }
    const returnToMyPage = signupState.returnToMyPage;
    const convertingType = signupState.convertingType;
    signupState.oauthMode = false;
    signupState.returnToMyPage = false;
    signupState.convertingType = false;
    closeAllModals();
    if (returnToMyPage) {
      alert(convertingType ? '회원 유형이 전환되었습니다.' : '공종 정보가 수정되었습니다.');
      await openMyPageModal();
      showMyPageView('Info');
    } else {
      alert('추가정보까지 등록이 완료되었습니다.');
      refreshAuthUI();
    }
  }

  // --- 마이페이지 ---
  const REQUEST_TYPE_LABELS = {
    demolition: '상가 철거', waste: '폐기물 처리', restoration: '원상복구',
    electric: '전기 공사', pipe: '배관·누수', manpower: '인력 지원'
  };
  const STATUS_LABELS = { pending: '접수 대기', matched: '매칭 완료', completed: '완료', cancelled: '취소됨' };

  async function renderMyPageRequestHistory(userId) {
    const historyBox = document.getElementById('myPageRequestHistory');
    if (!historyBox) return;
    const { data: requests } = await supabaseClient
      .from('work_requests')
      .select('id, request_type, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    historyBox.innerHTML = '';
    if (!requests || requests.length === 0) {
      historyBox.innerHTML = '<p style="font-size:13px; color:#6c6f76;">아직 신청한 요청이 없습니다.</p>';
      return;
    }
    requests.forEach(r => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px; border:1px solid #ddd6c5; border-radius:8px; margin-bottom:8px;';
      const dateStr = new Date(r.created_at).toLocaleDateString('ko-KR');
      const info = document.createElement('div');
      info.innerHTML = `
        <div style="font-size:13px; font-weight:700;">${REQUEST_TYPE_LABELS[r.request_type] || r.request_type}</div>
        <div style="font-size:12px; color:#6c6f76;">${dateStr} · ${STATUS_LABELS[r.status] || r.status}</div>
      `;
      const chatBtn = document.createElement('button');
      chatBtn.type = 'button';
      chatBtn.innerText = '채팅하기';
      chatBtn.style.cssText = 'padding:6px 12px; font-size:12px; border-radius:6px; border:1px solid #1d3557; background:#ffffff; color:#1d3557; cursor:pointer; flex-shrink:0;';
      chatBtn.onclick = () => openChatModal(r.id);
      item.appendChild(info);
      item.appendChild(chatBtn);
      historyBox.appendChild(item);
    });
  }

  let currentChatRequestId = null;

  async function openChatModal(requestId) {
    currentChatRequestId = requestId;
    closeAllModals();
    chatModal.classList.remove('hidden');
    await loadChatMessages();
  }

  async function loadChatMessages() {
    if (!currentChatRequestId) return;
    const { data: msgs } = await supabaseClient
      .from('messages')
      .select('sender_role, content, created_at')
      .eq('request_id', currentChatRequestId)
      .order('created_at', { ascending: true });
    const box = document.getElementById('chatMessages');
    if (!box) return;
    box.innerHTML = '';
    (msgs || []).forEach(m => {
      const isMe = m.sender_role === 'customer';
      const bubble = document.createElement('div');
      bubble.style.cssText = `align-self:${isMe ? 'flex-end' : 'flex-start'}; background:${isMe ? '#ff6a3d' : '#ffffff'}; color:${isMe ? '#ffffff' : '#23262b'}; padding:8px 12px; border-radius:10px; max-width:78%; font-size:13px; border:1px solid #ddd6c5; word-break:break-word;`;
      bubble.innerText = m.content;
      box.appendChild(bubble);
    });
    box.scrollTop = box.scrollHeight;
  }

  async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text || !currentChatRequestId) return;
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;
    const { error } = await supabaseClient.from('messages').insert({
      request_id: currentChatRequestId,
      sender_id: session.user.id,
      sender_role: 'customer',
      content: text
    });
    if (error) { alert('메시지 전송에 실패했습니다: ' + error.message); return; }
    input.value = '';
    loadChatMessages();
  }

  const sendChatBtn = document.getElementById('sendChatBtn');
  if (sendChatBtn) sendChatBtn.onclick = sendChatMessage;
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); sendChatMessage(); }
    });
  }

  function showMyPageView(name) {
    ['Home', 'History', 'Info', 'Bank'].forEach(v => {
      const el = document.getElementById('myPage' + v + 'View');
      if (el) el.classList.toggle('hidden', v !== name);
    });
  }

  document.querySelectorAll('[data-mypage-target]').forEach(btn => {
    btn.addEventListener('click', () => showMyPageView(btn.dataset.mypageTarget));
  });
  document.querySelectorAll('[data-mypage-back]').forEach(btn => {
    btn.addEventListener('click', () => showMyPageView('Home'));
  });

  const myPageLogoutMenuItem = document.getElementById('myPageLogoutMenuItem');
  if (myPageLogoutMenuItem) {
    myPageLogoutMenuItem.onclick = async () => {
      await supabaseClient.auth.signOut();
      closeAllModals();
      refreshAuthUI();
    };
  }

  let myPageCurrentUserId = null;

  async function openMyPageModal() {
    if (!window.supabaseClient) return;
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session || !session.user) return;
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('user_type, company_name, business_reg_no, worker_types, address, bank_name, bank_account_number, account_holder, phone')
      .eq('id', session.user.id)
      .maybeSingle();
    if (!profile) return;

    myPageCurrentUserId = session.user.id;

    const typeLabel = { user: '일반 사용자', company: '업체', worker: '일용구직자' }[profile.user_type] || '일반 사용자';
    const socialName = session.user.user_metadata && (session.user.user_metadata.nickname || session.user.user_metadata.full_name);
    const displayName = profile.company_name || socialName || profile.phone || '회원';

    document.getElementById('myPageDisplayName').innerText = displayName + '님';
    document.getElementById('myPageTypeBadge').innerText = typeLabel;
    document.getElementById('myPageAvatarInitial').innerText = displayName.charAt(0);
    document.getElementById('myPageUserType').value = typeLabel;
    document.getElementById('myPageAddress').value = profile.address || '';

    const companyFields = document.getElementById('myPageCompanyFields');
    const workerFields = document.getElementById('myPageWorkerFields');
    const bankMenuItem = document.getElementById('myPageBankMenuItem');
    const convertSection = document.getElementById('myPageConvertSection');

    companyFields.classList.add('hidden');
    workerFields.classList.add('hidden');
    bankMenuItem.style.display = (profile.user_type === 'company' || profile.user_type === 'worker') ? 'flex' : 'none';
    if (convertSection) convertSection.classList.toggle('hidden', profile.user_type !== 'user');

    if (profile.user_type === 'company') {
      companyFields.classList.remove('hidden');
      document.getElementById('myPageCompanyName').value = profile.company_name || '';
      document.getElementById('myPageBusinessNum').value = profile.business_reg_no || '';
    } else if (profile.user_type === 'worker') {
      workerFields.classList.remove('hidden');
      document.getElementById('myPageWorkerTypesDisplay').innerText =
        (profile.worker_types && profile.worker_types.length) ? profile.worker_types.join(', ') : '등록된 공종이 없습니다';
    }

    document.getElementById('myPageBankName').value = profile.bank_name || '';
    document.getElementById('myPageAccountNumber').value = profile.bank_account_number || '';
    document.getElementById('myPageAccountHolder').value = profile.account_holder || '';

    renderMyPageRequestHistory(session.user.id);

    closeAllModals();
    myPageModal.classList.remove('hidden');
    showMyPageView('Home');
  }

  const saveMyPageInfoBtn = document.getElementById('saveMyPageInfoBtn');
  if (saveMyPageInfoBtn) {
    saveMyPageInfoBtn.onclick = async () => {
      if (!myPageCurrentUserId) return;
      const { data: currentProfile } = await supabaseClient
        .from('profiles').select('user_type').eq('id', myPageCurrentUserId).maybeSingle();

      const updateFields = { address: document.getElementById('myPageAddress').value };
      if (currentProfile && currentProfile.user_type === 'company') {
        updateFields.company_name = document.getElementById('myPageCompanyName').value;
        updateFields.business_reg_no = document.getElementById('myPageBusinessNum').value;
      }

      const { error } = await supabaseClient.from('profiles').update(updateFields).eq('id', myPageCurrentUserId);
      if (error) { alert('저장 중 문제가 발생했습니다: ' + error.message); return; }
      alert('저장되었습니다.');
      await openMyPageModal();
      showMyPageView('Info');
    };
  }

  const saveMyPageBankBtn = document.getElementById('saveMyPageBankBtn');
  if (saveMyPageBankBtn) {
    saveMyPageBankBtn.onclick = async () => {
      if (!myPageCurrentUserId) return;
      const updateFields = {
        bank_name: document.getElementById('myPageBankName').value,
        bank_account_number: document.getElementById('myPageAccountNumber').value,
        account_holder: document.getElementById('myPageAccountHolder').value
      };
      const { error } = await supabaseClient.from('profiles').update(updateFields).eq('id', myPageCurrentUserId);
      if (error) { alert('저장 중 문제가 발생했습니다: ' + error.message); return; }
      alert('계좌 정보가 저장되었습니다.');
      await openMyPageModal();
      showMyPageView('Bank');
    };
  }

  const myPageEditWorkerTypesBtn = document.getElementById('myPageEditWorkerTypesBtn');
  if (myPageEditWorkerTypesBtn) {
    myPageEditWorkerTypesBtn.onclick = () => {
      signupState.oauthMode = true;
      signupState.returnToMyPage = true;
      closeAllModals();
      signupModal.classList.remove('hidden');
      signupStep1.classList.add('hidden');
      signupStep2.classList.add('hidden');
      signupStepCompany.classList.add('hidden');
      signupStep3.classList.add('hidden');
      signupStepWorker.classList.remove('hidden');
      renderWorkerTypeSelection();
    };
  }

  // 일반 사용자 → 업체/일용구직자 회원 유형 전환
  function startTypeConversion(newType) {
    signupState.type = newType;
    signupState.oauthMode = true;
    signupState.returnToMyPage = true;
    signupState.convertingType = true;
    closeAllModals();
    signupModal.classList.remove('hidden');
    signupStep1.classList.add('hidden');
    signupStep2.classList.add('hidden');
    signupStep3.classList.add('hidden');
    if (newType === 'company') {
      signupStepWorker.classList.add('hidden');
      signupStepCompany.classList.remove('hidden');
      const nextBtn = document.getElementById('nextToFinalStepFromCompanyBtn');
      if (nextBtn) nextBtn.disabled = true;
    } else {
      signupStepCompany.classList.add('hidden');
      signupStepWorker.classList.remove('hidden');
      renderWorkerTypeSelection();
    }
  }

  const convertToCompanyBtn = document.getElementById('convertToCompanyBtn');
  if (convertToCompanyBtn) convertToCompanyBtn.onclick = () => startTypeConversion('company');
  const convertToWorkerBtn = document.getElementById('convertToWorkerBtn');
  if (convertToWorkerBtn) convertToWorkerBtn.onclick = () => startTypeConversion('worker');

  function goToSignupStep3() {
    signupStep2.classList.add('hidden');
    signupStepCompany.classList.add('hidden');
    signupStepWorker.classList.add('hidden');
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
      btn.innerHTML = `<span>${key}</span> ${isLeaf ? `<span style="float:right; color:#1d3557; font-weight:700;">${currentData[key].toLocaleString()}원</span>` : '<span style="float:right; color:#6c6f76;">&gt;</span>'}`;
      btn.onclick = () => { if (isLeaf) selectManpowerType(key, currentData[key]); else { selectionPath.push(key); renderTypeList(); } };
      typeList.appendChild(btn);
    });
  }

  function selectManpowerType(name, wage) {
    if (activeManpowerItem) {
      activeManpowerItem.querySelector('.manpower-type-btn').innerText = name;
      activeManpowerItem.querySelector('.manpower-type-btn').style.color = '#23262b';
      activeManpowerItem.querySelector('.manpower-type-btn').style.fontWeight = '700';
      activeManpowerItem.querySelector('.manpower-type-btn').style.borderColor = '#ff6a3d';
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
      newItem.innerHTML = `<button type="button" class="manpower-type-btn" style="flex: 2; text-align: left; background: #ffffff; border: 1px solid #ddd6c5; color: #6c6f76; padding: 10px; border-radius: 6px; font-size: 12px; cursor: pointer;">인력 유형 선택</button><input type="hidden" class="manpower-type-val"><input type="number" class="manpower-wage" placeholder="임금" value="0" style="flex: 1.5;"><select class="manpower-count" style="flex: 1; height: 38px;"><option value="" selected disabled>인원</option>${[...Array(20).keys()].map(i => `<option value="${i+1}">${i+1}명</option>`).join('')}</select><button type="button" class="remove-manpower-btn" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:18px; padding:0 5px; line-height:1;">&times;</button>`;
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
  if (typeof confirmServiceBtn !== 'undefined' && confirmServiceBtn) {
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
  } else {
    // confirmServiceBtn이 정의되지 않았을 경우를 대비
    const confirmBtn = document.getElementById('confirmServiceBtn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
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
  }

  document.querySelectorAll('.service-item-btn').forEach(btn => { btn.onclick = () => { document.querySelectorAll('.service-item-btn').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); }; });

  // .env-selection 안의 버튼들은 라디오처럼 하나만 선택되도록 처리
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.type-btn');
    if (!btn || btn.classList.contains('manpower-type-btn') || btn.closest('#manpowerTypeModal') || btn.closest('#signupModal')) return;
    const radioContainer = btn.closest('.env-selection');
    if (radioContainer) {
      radioContainer.querySelectorAll('.type-btn').forEach(b => { if (b !== btn) b.classList.remove('selected'); });
    }
    btn.classList.toggle('selected');
  });

  // --- 7. 작업 요청 폼 제출 (실제 저장) ---
  const submitDemolitionBtn = document.getElementById('submitDemolitionBtn');
  if (submitDemolitionBtn) {
    submitDemolitionBtn.onclick = () => saveWorkRequest('demolition', demolitionModal, document.getElementById('photoInput'), submitDemolitionBtn);
  }

  const submitWasteBtn = document.getElementById('submitWasteBtn');
  if (submitWasteBtn) {
    submitWasteBtn.onclick = () => saveWorkRequest('waste', wasteModal, document.getElementById('wastePhotoInput'), submitWasteBtn);
  }

  const submitRestorationBtn = document.getElementById('submitRestorationBtn');
  if (submitRestorationBtn) {
    submitRestorationBtn.onclick = () => saveWorkRequest('restoration', restorationModal, document.getElementById('restorePhotoInput'), submitRestorationBtn);
  }

  const submitElectricBtn = document.getElementById('submitElectricBtn');
  if (submitElectricBtn) {
    submitElectricBtn.onclick = () => saveWorkRequest('electric', electricModal, document.getElementById('electricPhotoInput'), submitElectricBtn);
  }

  const submitPipeBtn = document.getElementById('submitPipeBtn');
  if (submitPipeBtn) {
    submitPipeBtn.onclick = () => saveWorkRequest('pipe', pipeModal, document.getElementById('pipePhotoInput'), submitPipeBtn);
  }

  const submitManpowerBtn = document.getElementById('submitManpowerBtn');
  if (submitManpowerBtn) {
    submitManpowerBtn.onclick = () => saveWorkRequest('manpower', manpowerModal, null, submitManpowerBtn);
  }

  // --- 9. '기타' 선택 시 상세 입력창 열기 (restoreOtherBtn, electricOtherBtn, pipeOtherBtn 공통 처리) ---
  document.querySelectorAll('[id$="OtherBtn"]').forEach(btn => {
    const input = document.getElementById(btn.id.replace('OtherBtn', 'OtherInput'));
    if (!input) return;
    btn.addEventListener('click', () => {
      input.classList.toggle('hidden');
      if (!input.classList.contains('hidden')) input.focus();
      else input.value = '';
    });
  });

  // --- 11. 인력지원: 작업 시간 프리셋 버튼 ---
  const manpowerStartTime = document.getElementById('manpowerStartTime');
  const manpowerEndTime = document.getElementById('manpowerEndTime');
  document.querySelectorAll('.time-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (manpowerStartTime) manpowerStartTime.value = btn.dataset.start;
      if (manpowerEndTime) manpowerEndTime.value = btn.dataset.end;
      document.querySelectorAll('.time-preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  if (manpowerStartTime) manpowerStartTime.addEventListener('input', () => document.querySelectorAll('.time-preset-btn').forEach(b => b.classList.remove('active')));
  if (manpowerEndTime) manpowerEndTime.addEventListener('input', () => document.querySelectorAll('.time-preset-btn').forEach(b => b.classList.remove('active')));

  // --- 12. 사진 업로드 드롭존 (클릭/드래그로 파일 선택 + 누적 미리보기 + 개별 삭제) ---
  const MAX_PHOTOS = 10;
  document.querySelectorAll('.dropzone').forEach(dropzone => {
    const fileInput = dropzone.querySelector('input[type="file"]');
    if (!fileInput) return;
    const previewId = fileInput.id.replace('Input', 'Preview');
    const preview = document.getElementById(previewId);
    let storedFiles = []; // 이 입력칸에서 누적으로 들고 있는 File 목록

    function syncInputFiles() {
      const dt = new DataTransfer();
      storedFiles.forEach(f => dt.items.add(f));
      fileInput.files = dt.files;
    }

    function renderPreview() {
      if (!preview) return;
      preview.innerHTML = '';
      storedFiles.forEach((file, idx) => {
        const url = URL.createObjectURL(file);
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;';
        const img = document.createElement('img');
        img.src = url;
        img.style.cssText = 'width:100%; height:80px; object-fit:cover; border-radius:8px; border:1px solid #ddd6c5;';
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.innerText = '×';
        removeBtn.style.cssText = 'position:absolute; top:-6px; right:-6px; width:20px; height:20px; border-radius:50%; border:none; background:#ef4444; color:#fff; font-size:14px; line-height:1; cursor:pointer;';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          storedFiles.splice(idx, 1);
          syncInputFiles();
          renderPreview();
        });
        wrap.appendChild(img);
        wrap.appendChild(removeBtn);
        preview.appendChild(wrap);
      });
    }

    function addFiles(newFiles) {
      const incoming = Array.from(newFiles || []);
      storedFiles = storedFiles.concat(incoming).slice(0, MAX_PHOTOS);
      if (storedFiles.length + incoming.length > MAX_PHOTOS) {
        alert(`사진은 최대 ${MAX_PHOTOS}장까지 올릴 수 있어요.`);
      }
      syncInputFiles();
      renderPreview();
    }

    // saveWorkRequest 성공 후 사진 목록을 같이 비우기 위해 노출
    fileInput._resetStoredFiles = () => {
      storedFiles = [];
      syncInputFiles();
      renderPreview();
    };

    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('click', (e) => e.stopPropagation());

    fileInput.addEventListener('change', (e) => {
      addFiles(e.target.files);
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#ff6a3d';
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = '#ddd6c5';
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#ddd6c5';
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        addFiles(e.dataTransfer.files);
      }
    });
  });

  // --- 8. 초기 로그인 상태 반영 ---
  bindAuthOpenButtons();
  if (window.supabaseClient) {
    refreshAuthUI();
    supabaseClient.auth.onAuthStateChange(() => refreshAuthUI());
  }
});
