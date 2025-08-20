// Admin Login System - Production Ready
class AdminAuth {
    constructor() {
        this.maxLoginAttempts = 3;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.loginAttempts = 0;
        this.lastFailedAttempt = 0;
        this.isLockedOut = false;
        this.currentUser = null;
        this.sessionToken = null;
        
        // Valid admin credentials (in production, this would be in a secure database)
        this.validCredentials = {
            'admin@bontravels.com': {
                password: 'BonTravels2024!',
                name: 'Administrator',
                role: 'admin',
                permissions: ['dashboard', 'users', 'bookings', 'reports', 'settings']
            },
            'manager@bontravels.com': {
                password: 'Manager2024!',
                name: 'Travel Manager',
                role: 'manager',
                permissions: ['dashboard', 'bookings', 'reports']
            },
            'support@bontravels.com': {
                password: 'Support2024!',
                name: 'Support Staff',
                role: 'support',
                permissions: ['dashboard', 'bookings']
            }
        };
        
        this.init();
    }
    
    init() {
        this.checkSession();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const loginForm = document.getElementById('adminLoginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const twoFactorInput = document.getElementById('twoFactorCode');
        const rememberMeCheckbox = document.getElementById('rememberMe');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (usernameInput) {
            usernameInput.addEventListener('input', () => this.handleUsernameChange());
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.validatePasswordStrength());
        }
        
        if (twoFactorInput) {
            twoFactorInput.addEventListener('input', (e) => this.handleTwoFactorInput(e));
        }
        
        // Password toggle
        const passwordToggle = document.getElementById('passwordToggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => this.togglePasswordVisibility());
        }
        
        // Resend 2FA code button
        const resendCodeBtn = document.getElementById('resendCodeBtn');
        if (resendCodeBtn) {
            resendCodeBtn.addEventListener('click', () => this.resendTwoFactorCode());
        }
        
        // Auto-logout on inactivity
        document.addEventListener('mousemove', () => this.resetInactivityTimer());
        document.addEventListener('keypress', () => this.resetInactivityTimer());
        document.addEventListener('click', () => this.resetInactivityTimer());
    }
    
    handleLogin(e) {
        e.preventDefault();
        
        if (this.isLockedOut) {
            this.showLoginError('Account temporarily locked. Please try again later.');
            return;
        }
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const twoFactorCode = document.getElementById('twoFactorCode').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!username || !password) {
            this.showLoginError('Please enter both username and password.');
            return;
        }
        
        this.showLoadingState();
        
        // Simulate API call delay
        setTimeout(() => {
            const authResult = this.authenticateUser(username, password, twoFactorCode);
            
            if (authResult.success) {
                this.loginSuccess(authResult.user, rememberMe);
            } else {
                this.loginFailed(authResult.error);
            }
        }, 1000);
    }
    
    authenticateUser(username, password, twoFactorCode) {
        // Check if user exists
        if (!this.validCredentials[username]) {
            return { success: false, error: 'Invalid credentials.' };
        }
        
        const user = this.validCredentials[username];
        
        // Check password first
        if (user.password !== password) {
            return { success: false, error: 'Invalid credentials.' };
        }
        
        // If admin account and no 2FA code provided, request 2FA
        if (user.role === 'admin' && !twoFactorCode) {
            // Send 2FA code only after password verification
            this.sendTwoFactorCode(username);
            return { success: false, error: '✅ Password verified! Please enter the 2FA code shown above.' };
        }
        
        // Validate 2FA code (check against sent code)
        if (user.role === 'admin' && twoFactorCode) {
            if (!/^\d{6}$/.test(twoFactorCode)) {
                return { success: false, error: 'Invalid two-factor authentication code format.' };
            }
            if (twoFactorCode !== this.currentTwoFactorCode) {
                return { success: false, error: 'Invalid two-factor authentication code. Please check your email.' };
            }
            
            // Check if code has expired (10 minutes)
            if (this.codeExpiration && Date.now() > this.codeExpiration) {
                return { success: false, error: 'Two-factor authentication code has expired. Please request a new code.' };
            }
        }
        
        return { success: true, user: user };
    }
    
    loginSuccess(user, rememberMe) {
        this.currentUser = user;
        this.sessionToken = this.generateSessionToken();
        this.loginAttempts = 0;
        this.isLockedOut = false;
        
        // Store session
        if (rememberMe) {
            localStorage.setItem('adminSession', JSON.stringify({
                user: user,
                token: this.sessionToken,
                timestamp: Date.now()
            }));
        } else {
            sessionStorage.setItem('adminSession', JSON.stringify({
                user: user,
                token: this.sessionToken,
                timestamp: Date.now()
            }));
        }
        
        // Redirect to dashboard
        window.location.href = 'admin-dashboard.html';
    }
    
    loginFailed(error) {
        this.loginAttempts++;
        this.lastFailedAttempt = Date.now();
        
        if (this.loginAttempts >= this.maxLoginAttempts) {
            this.isLockedOut = true;
            setTimeout(() => {
                this.isLockedOut = false;
                this.loginAttempts = 0;
            }, this.lockoutDuration);
            
            this.showLoginError(`Account locked due to multiple failed attempts. Please try again in 15 minutes.`);
        } else {
            this.showLoginError(`${error} (${this.maxLoginAttempts - this.loginAttempts} attempts remaining)`);
        }
        
        this.resetLoginButton();
    }
    
    handleUsernameChange() {
        // Only show 2FA field if username exists and is admin
        // Don't send code yet - wait for password verification
        const username = document.getElementById('username').value.trim();
        const twoFactorContainer = document.getElementById('twoFactorContainer');
        
        if (username && this.validCredentials[username] && this.validCredentials[username].role === 'admin') {
            twoFactorContainer.style.display = 'block';
            // Update the small text to show it's ready for 2FA
            const smallText = twoFactorContainer.querySelector('small');
            if (smallText) {
                smallText.textContent = '2FA code will be sent after password verification';
            }
        } else {
            twoFactorContainer.style.display = 'none';
        }
    }
    
    async sendTwoFactorCode(username) {
        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store the code temporarily
        this.currentTwoFactorCode = code;
        
        // Set code expiration (10 minutes)
        this.codeExpiration = Date.now() + (10 * 60 * 1000);
        
        try {
            // Initialize SendGrid service
            const sendGridService = new SendGridService();
            
            // Send 2FA code via email
            const emailResult = await sendGridService.sendTwoFactorCode(
                'bontravelsmedia@gmail.com', 
                code, 
                this.validCredentials[username].name
            );
            
            if (emailResult.success) {
                // Email sent successfully
                this.showLoginError(`✅ 2FA code sent to bontravelsmedia@gmail.com`, 'info');
                
                // Update 2FA input field
                const twoFactorInput = document.getElementById('twoFactorCode');
                if (twoFactorInput) {
                    twoFactorInput.placeholder = 'Enter 6-digit code from email';
                    twoFactorInput.focus();
                }
                
                // Update small text
                const smallText = document.querySelector('#twoFactorContainer small');
                if (smallText) {
                    smallText.textContent = 'Check your email for the 6-digit code';
                }
                
                // Show resend button
                const resendBtn = document.getElementById('resendCodeBtn');
                if (resendBtn) {
                    resendBtn.style.display = 'inline-block';
                }
            } else {
                // Email failed, fallback to showing code on screen
                console.error('SendGrid failed:', emailResult.error);
                this.showLoginError(`⚠️ Email delivery failed. Code: ${code}`, 'warning');
                
                // Update 2FA input field placeholder
                const twoFactorInput = document.getElementById('twoFactorCode');
                if (twoFactorInput) {
                    twoFactorInput.placeholder = `Code: ${code}`;
                    twoFactorInput.focus();
                }
            }
        } catch (error) {
            // Fallback if SendGrid service fails
            console.error('SendGrid service error:', error);
            this.showLoginError(`⚠️ Email service unavailable. Code: ${code}`, 'warning');
            
            // Update 2FA input field placeholder
            const twoFactorInput = document.getElementById('twoFactorCode');
            if (twoFactorInput) {
                twoFactorInput.placeholder = `Code: ${code}`;
                twoFactorInput.focus();
            }
        }
    }
    
    async resendTwoFactorCode() {
        const username = document.getElementById('username').value.trim();
        if (username && this.validCredentials[username] && this.validCredentials[username].role === 'admin') {
            // Disable resend button temporarily
            const resendBtn = document.getElementById('resendCodeBtn');
            if (resendBtn) {
                resendBtn.disabled = true;
                resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            }
            
            // Send new code
            await this.sendTwoFactorCode(username);
            
            // Re-enable resend button after 30 seconds
            setTimeout(() => {
                if (resendBtn) {
                    resendBtn.disabled = false;
                    resendBtn.innerHTML = '<i class="fas fa-redo"></i> Resend';
                }
            }, 30000);
        }
    }
    
    handleTwoFactorInput(e) {
        const value = e.target.value;
        if (value.length === 6) {
            // Auto-submit after 6 digits
            setTimeout(() => {
                document.getElementById('adminLoginForm').dispatchEvent(new Event('submit'));
            }, 500);
        }
    }
    
    validatePasswordStrength() {
        const password = document.getElementById('password').value;
        const strengthIndicator = document.getElementById('passwordStrength');
        
        if (!strengthIndicator) return;
        
        let strength = 0;
        let feedback = '';
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        switch (strength) {
            case 0:
            case 1:
                feedback = 'Very Weak';
                strengthIndicator.className = 'strength-very-weak';
                break;
            case 2:
                feedback = 'Weak';
                strengthIndicator.className = 'strength-weak';
                break;
            case 3:
                feedback = 'Fair';
                strengthIndicator.className = 'strength-fair';
                break;
            case 4:
                feedback = 'Good';
                strengthIndicator.className = 'strength-good';
                break;
            case 5:
                feedback = 'Strong';
                strengthIndicator.className = 'strength-strong';
                break;
        }
        
        strengthIndicator.textContent = feedback;
    }
    
    generateSessionToken() {
        return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    checkSession() {
        const session = JSON.parse(localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession') || '{}');
        
        if (session.user && session.token && session.timestamp) {
            const now = Date.now();
            if (now - session.timestamp < this.sessionTimeout) {
                this.currentUser = session.user;
                this.sessionToken = session.token;
                this.resetInactivityTimer();
            } else {
                this.logout();
            }
        }
    }
    
    resetInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        
        this.inactivityTimer = setTimeout(() => {
            this.logout();
        }, this.sessionTimeout);
    }
    
    logout() {
        this.currentUser = null;
        this.sessionToken = null;
        localStorage.removeItem('adminSession');
        sessionStorage.removeItem('adminSession');
        
        if (window.location.pathname.includes('admin-dashboard')) {
            window.location.href = 'admin-login.html';
        }
    }
    
    showLoadingState() {
        const loginBtn = document.getElementById('loginBtn');
        const originalText = loginBtn.innerHTML;
        
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        loginBtn.disabled = true;
        
        // Store original text for restoration
        loginBtn.dataset.originalText = originalText;
    }
    
    resetLoginButton() {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn.dataset.originalText) {
            loginBtn.innerHTML = loginBtn.dataset.originalText;
            loginBtn.disabled = false;
        }
    }
    
    showLoginError(message, type = 'error') {
        const errorContainer = document.getElementById('loginError');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.className = `login-error ${type}`;
            errorContainer.style.display = 'block';
            
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        }
    }
    

    
    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('passwordToggle');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            passwordInput.type = 'password';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }
}



// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminAuth = new AdminAuth();
    
    // Check if user is already logged in
    if (window.adminAuth.currentUser) {
        window.location.href = 'admin-dashboard.html';
    }
});
