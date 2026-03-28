/* Auth UI Logic */

document.addEventListener('DOMContentLoaded', () => {
  injectAuthUI();
  checkLoginStatus();
});

function injectAuthUI() {
  const container = document.getElementById('authModalContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="auth-modal-overlay" id="authModal">
      <div class="auth-modal-content">
        <button class="auth-modal-close" id="authCloseBtn">&times;</button>
        <div class="auth-tabs">
          <button class="auth-tab active" id="tabLogin">登录</button>
          <button class="auth-tab" id="tabRegister">注册</button>
        </div>
        
        <!-- Login Form -->
        <form id="loginForm">
          <div class="auth-form-group">
            <label>昵称</label>
            <input type="text" class="auth-form-input" id="loginNickname" required>
          </div>
          <div class="auth-form-group">
            <label>密码</label>
            <input type="password" class="auth-form-input" id="loginPassword" required>
          </div>
          <div style="text-align:right; margin-bottom:1rem;">
            <a href="#" id="linkResetPassword" style="color:#38b2ac; font-size:0.8rem; text-decoration:none;">忘记密码？</a>
          </div>
          <div class="auth-error" id="loginError"></div>
          <button type="submit" class="auth-btn">登录</button>
        </form>

        <!-- Register Form -->
        <form id="registerForm" style="display: none;">
          <div class="auth-form-group">
            <label>昵称</label>
            <input type="text" class="auth-form-input" id="registerNickname" minlength="2" maxlength="20" required>
          </div>
          <div class="auth-form-group">
            <label>邮箱 (用于密码找回)</label>
            <input type="email" class="auth-form-input" id="registerEmail" required>
          </div>
          <div class="auth-form-group">
            <label>密码</label>
            <input type="password" class="auth-form-input" id="registerPassword" minlength="6" required>
          </div>
          <div class="auth-error" id="registerError"></div>
          <button type="submit" class="auth-btn">注册</button>
        </form>

        <!-- Reset Password Form -->
        <form id="resetForm" style="display: none;">
          <p style="font-size:0.9rem; color:#4a5568; margin-bottom:1rem; text-align:center;">请输入您的注册邮箱，我们将向您发送包含临时密码的邮件。</p>
          <div class="auth-form-group">
            <label>邮箱</label>
            <input type="email" class="auth-form-input" id="resetEmail" required>
          </div>
          <div class="auth-error" id="resetError"></div>
          <div class="auth-success" id="resetSuccess" style="color:#10b981; font-size:0.85rem; margin-bottom:1rem; text-align:center;"></div>
          <button type="submit" class="auth-btn">发送重置邮件</button>
          <div style="text-align:center; margin-top:1rem;">
            <a href="#" id="linkBackToLogin" style="color:#94a3b8; font-size:0.85rem; text-decoration:none;">返回登录</a>
          </div>
        </form>
        
        <!-- Force Reset Password Form (Post-Login) -->
        <form id="forceResetForm" style="display: none;">
          <h3 style="text-align:center; color:#e11d48; margin-bottom:1rem;">⚠️ 安全提醒重新设置密码</h3>
          <p style="font-size:0.85rem; color:#4a5568; margin-bottom:1.5rem; text-align:center;">为了您的账号安全，请立即修改您的系统随机生成的临时密码。</p>
          <div class="auth-form-group">
            <label>新密码</label>
            <input type="password" class="auth-form-input" id="newPassword" minlength="6" required>
          </div>
          <div class="auth-error" id="forceResetError"></div>
          <button type="submit" class="auth-btn">保存新密码并继续</button>
        </form>

      </div>
    </div>
  `;

  bindAuthEvents();
}

function bindAuthEvents() {
  const modal = document.getElementById('authModal');
  const closeBtn = document.getElementById('authCloseBtn');
  const navLoginBtn = document.getElementById('navLoginBtn');
  
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const resetForm = document.getElementById('resetForm');
  const forceResetForm = document.getElementById('forceResetForm');
  const authTabs = document.querySelector('.auth-tabs');

  if (navLoginBtn) {
    navLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
  }

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Tab switching
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    resetForm.style.display = 'none';
    forceResetForm.style.display = 'none';
    authTabs.style.display = 'flex';
    document.getElementById('loginError').textContent = '';
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    resetForm.style.display = 'none';
    forceResetForm.style.display = 'none';
    authTabs.style.display = 'flex';
    document.getElementById('registerError').textContent = '';
  });

  const linkResetPassword = document.getElementById('linkResetPassword');
  if (linkResetPassword) {
    linkResetPassword.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      registerForm.style.display = 'none';
      authTabs.style.display = 'none';
      resetForm.style.display = 'block';
      forceResetForm.style.display = 'none';
      document.getElementById('resetError').textContent = '';
      document.getElementById('resetSuccess').textContent = '';
    });
  }

  const linkBackToLogin = document.getElementById('linkBackToLogin');
  if (linkBackToLogin) {
    linkBackToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      tabLogin.click();
    });
  }

  // Submits
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button');
    btn.textContent = '登录中...';
    btn.disabled = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: document.getElementById('loginNickname').value,
          password: document.getElementById('loginPassword').value
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('landingc_token', data.token);
        localStorage.setItem('landingc_user', JSON.stringify(data.user));
        
        if (data.user.force_reset === 1) {
          // Trigger forced password reset UI
          loginForm.style.display = 'none';
          registerForm.style.display = 'none';
          authTabs.style.display = 'none';
          forceResetForm.style.display = 'block';
        } else {
          modal.classList.remove('active');
          checkLoginStatus();
        }
      } else {
        document.getElementById('loginError').textContent = data.error || '登录失败';
      }
    } catch (err) {
      document.getElementById('loginError').textContent = '网络错误，请稍后再试';
    } finally {
      btn.textContent = '登录';
      btn.disabled = false;
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('button');
    btn.textContent = '注册中，并发送欢迎邮件...';
    btn.disabled = true;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: document.getElementById('registerNickname').value,
          email: document.getElementById('registerEmail').value,
          password: document.getElementById('registerPassword').value
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('landingc_token', data.token);
        localStorage.setItem('landingc_user', JSON.stringify(data.user));
        modal.classList.remove('active');
        checkLoginStatus();
      } else {
        document.getElementById('registerError').textContent = data.error || '注册失败';
      }
    } catch (err) {
      document.getElementById('registerError').textContent = '网络错误，请稍后再试';
    } finally {
      btn.textContent = '注册';
      btn.disabled = false;
    }
  });

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = resetForm.querySelector('button');
    btn.textContent = '发送中...';
    btn.disabled = true;
    document.getElementById('resetError').textContent = '';
    document.getElementById('resetSuccess').textContent = '';

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('resetEmail').value
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        document.getElementById('resetSuccess').textContent = data.message;
      } else {
        document.getElementById('resetError').textContent = data.error || '请求失败';
      }
    } catch (err) {
      document.getElementById('resetError').textContent = '网络错误，请稍后再试';
    } finally {
      btn.textContent = '发送重置邮件';
      btn.disabled = false;
    }
  });

  forceResetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = forceResetForm.querySelector('button');
    btn.textContent = '保存中...';
    btn.disabled = true;
    const token = localStorage.getItem('landingc_token');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newPassword: document.getElementById('newPassword').value
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Update user state and allow them to proceed
        let usr = JSON.parse(localStorage.getItem('landingc_user'));
        usr.force_reset = 0;
        localStorage.setItem('landingc_user', JSON.stringify(usr));
        
        modal.classList.remove('active');
        checkLoginStatus();
        alert('密码修改成功，欢迎回来！');
      } else {
        document.getElementById('forceResetError').textContent = data.error || '保存失败';
      }
    } catch (err) {
      document.getElementById('forceResetError').textContent = '网络错误，请稍后再试';
    } finally {
      btn.textContent = '保存新密码并继续';
      btn.disabled = false;
    }
  });

  // Logout
  const navLogout = document.getElementById('navLogout');
  if (navLogout) {
    navLogout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('landingc_token');
      localStorage.removeItem('landingc_user');
      checkLoginStatus();
      window.location.reload();
    });
  }
}

function checkLoginStatus() {
  const token = localStorage.getItem('landingc_token');
  const userStr = localStorage.getItem('landingc_user');
  
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navUserMenu = document.getElementById('navUserMenu');
  const navUsername = document.getElementById('navUsername');

  if (token && userStr) {
    const user = JSON.parse(userStr);
    if (navLoginBtn) navLoginBtn.style.display = 'none';
    if (navUserMenu) {
      navUserMenu.style.display = 'inline-block';
      if (navUsername) {
        navUsername.textContent = user.nickname || '用户';
      }
      
      // Update avatar if present (Fix R2)
      const userAvatar = document.getElementById('userAvatar');
      if (userAvatar) {
        userAvatar.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.nickname || 'default'}`;
      }

      // Show admin link if role is admin
      const navAdminLink = document.getElementById('navAdminLink');
      if (navAdminLink) {
        navAdminLink.style.display = user.role === 'admin' ? 'block' : 'none';
      }
      
      // Add Click Toggle for stability (R4 Improvement)
      const avatarLink = navUserMenu.querySelector('.nav-avatar');
      if (avatarLink) {
        avatarLink.addEventListener('click', (e) => {
          e.preventDefault();
          navUserMenu.classList.toggle('active-dropdown');
        });
      }
    }
  } else {
    if (navLoginBtn) navLoginBtn.style.display = 'inline-block';
    if (navUserMenu) {
      navUserMenu.style.display = 'none';
      navUserMenu.classList.remove('active-dropdown');
    }
  }
}

// Helper to trigger login modal from other components
window.triggerLogin = function() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('active');
  }
};
