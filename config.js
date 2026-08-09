// ============================================================
// Supabase 프로젝트 연결 설정
// Supabase 대시보드 > Settings > API 에서 아래 두 값을 복사해서 넣으세요.
// - Project URL  →  SUPABASE_URL
// - anon public key → SUPABASE_ANON_KEY
// (anon key는 브라우저에 노출돼도 되는 공개용 키입니다. RLS 정책이 실제 보안을 담당합니다.)
// ============================================================
const SUPABASE_URL = "https://ixsmdrbojniollgjxwxd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r1LCeMml3W8rfUH1J97pDg_viMWpkNU";

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseClient = window.supabaseClient;
