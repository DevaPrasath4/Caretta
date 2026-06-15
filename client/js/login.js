// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('login-error');
  const btn      = document.getElementById('loginBtn');

  errorEl.style.display = 'none';

  if (!email || !password) {
    errorEl.textContent = 'Please enter your email and password.';
    errorEl.style.display = 'block';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Signing in...';

  fetch(`http://${window.location.hostname}:5000/api/auth/login`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }) 
  })
    .then(r => r.json().then(data => ({ ok: r.ok, status: r.status, data })))
    .then(({ ok, status, data }) => {
      if (!ok) {
        throw new Error(data.error || `HTTP ${status}`);
      }

      const user = data.user || data;

      localStorage.setItem('caretta_user', JSON.stringify({
        email: user.email || email,
        name: user.name || email.split('@')[0].replace(/\./g, ' '),
        token: data.token,
        userId: user.id
      }));

      console.log('✅ Login successful:', user.email);
      window.location.href = 'pages/dashboard.html';
    })
    .catch(err => {
      console.error('❌ Login failed:', err.message);
      errorEl.textContent = err.message || 'Login failed. Please try again.';
      errorEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Sign in';
    });
});