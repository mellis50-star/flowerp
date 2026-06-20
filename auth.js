// FlowERP Auth Helper
// Include this script on every protected page

const SUPABASE_URL = 'https://sxpmubxcmdpptqbknwzh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_b8pKBMLXtEzEPtUPGsZhlA_1sOdAcTc';

// Initialize Supabase
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// Global user and company data
let currentUser = null;
let currentCompany = null;
let currentCompanyId = null;

// Call this on every protected page
async function initAuth() {
  const { data: { session } } = await db.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return null;
  }

  currentUser = session.user;

  // Get user profile and company
  const { data: profile, error } = await db
    .from('profiles')
    .select('*, companies(*)')
    .eq('id', currentUser.id)
    .single();

  if (error || !profile) {
    console.error('No profile found for user');
    return null;
  }

  currentCompanyId = profile.company_id;
  currentCompany = profile.companies;

  // Update UI with user info if elements exist
  const nameEl = document.getElementById('user-name');
  const companyEl = document.getElementById('user-company');
  if (nameEl) nameEl.textContent = profile.full_name || currentUser.email;
  if (companyEl) companyEl.textContent = profile.company_name || currentCompany?.name || 'My Company';

  return { user: currentUser, companyId: currentCompanyId, company: currentCompany };
}

// Sign out function
async function signOut() {
  await db.auth.signOut();
  window.location.href = 'login.html';
}

// Get company filtered query helper
function companyQuery(table) {
  return db.from(table).select('*').eq('company_id', currentCompanyId);
}
