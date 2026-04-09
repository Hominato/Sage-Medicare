"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHMSApi } from '../../hooks/useHMSApi';
import { useHMS } from '../../context/HMSContext';

export default function LoginPage() {
  const router = useRouter();
  const { callApi, loading } = useHMSApi();
  const { notify, setUser } = useHMS();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      notify('ERROR', 'Please enter your email and password.');
      return;
    }
    try {
      const result = await callApi('/auth/login', 'POST', { email, password });
      if (result && result.access_token) {
        localStorage.setItem('hms_token', result.access_token);
        localStorage.setItem('hms_user_role', result.user.role);
        localStorage.setItem('hms_user_id', result.user.id);
        localStorage.setItem('hms_user_email', result.user.email);
        localStorage.setItem('hms_user_profile', JSON.stringify(result.user));
        setUser({
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          staffProfile: result.user.staffProfile,
          patientProfile: result.user.patientProfile,
        });
        notify('SUCCESS', `Welcome back — authenticated as ${result.user.role}`);
        router.push('/dashboard');
      }
    } catch {
      // Error is shown by useHMSApi notify
    }
  };

  const handleForgotPassword = (e: FormEvent) => {
    e.preventDefault();
    notify('INFO', `Password reset link sent to ${forgotEmail}. Check your inbox.`);
    setForgotMode(false);
    setForgotEmail('');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .text-gradient {
            background: linear-gradient(135deg, #00478d 0%, #005eb8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
      `}} />
      <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col md:flex-row overflow-hidden fixed inset-0 z-[100]">
        
        {/* Hero Section */}
        <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-surface-container-low flex-col justify-between p-16 relative">
          <div className="z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary">medical_services</span>
              </div>
              <span className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">The Clinical Atelier</span>
            </div>
            <div className="max-w-xl">
              <h1 className="font-headline text-5xl font-extrabold text-on-surface leading-tight mb-6">
                Precision care begins with <span className="text-gradient">unified data.</span>
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-10">
                Access the next generation of clinical management. Secure, role-specific portals designed for the modern Nigerian healthcare ecosystem.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
                  <span className="material-symbols-outlined text-primary mb-3">verified_user</span>
                  <h3 className="font-headline font-bold text-on-surface mb-1">JWT Security</h3>
                  <p className="text-sm text-on-surface-variant">Stateless, encrypted authentication protocols.</p>
                </div>
                <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
                  <span className="material-symbols-outlined text-primary mb-3">clinical_notes</span>
                  <h3 className="font-headline font-bold text-on-surface mb-1">HIPAA · NDPA</h3>
                  <p className="text-sm text-on-surface-variant">Fully compliant with Nigerian & international standards.</p>
                </div>
                <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
                  <span className="material-symbols-outlined text-primary mb-3">local_hospital</span>
                  <h3 className="font-headline font-bold text-on-surface mb-1">NHIS Integrated</h3>
                  <p className="text-sm text-on-surface-variant">National Health Insurance Scheme ready.</p>
                </div>
                <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
                  <span className="material-symbols-outlined text-primary mb-3">groups</span>
                  <h3 className="font-headline font-bold text-on-surface mb-1">10 Roles</h3>
                  <p className="text-sm text-on-surface-variant">Tailored portals for every clinical workflow.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="z-10 flex gap-6 text-xs text-on-surface-variant font-label uppercase tracking-widest">
            <span>© 2026 Clinical Atelier</span>
            <span>HIPAA Compliant</span>
            <span>NDPA Compliant</span>
            <span>NHIS Ready</span>
          </div>
        </div>

        {/* Login Form Section */}
        <main className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center p-6 md:p-16 bg-surface-container-lowest relative z-10 overflow-y-auto">
          <div className="md:hidden flex items-center gap-2 mb-12 mt-12">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-sm">medical_services</span>
            </div>
            <span className="font-headline font-bold text-xl tracking-tight">The Clinical Atelier</span>
          </div>

          <div className="w-full max-w-md pb-12">
            {!forgotMode ? (
              <>
                <header className="mb-10 text-center md:text-left">
                  <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Welcome Back</h2>
                  <p className="text-on-surface-variant">Enter your institutional credentials to access your portal.</p>
                </header>

                <form className="space-y-6" onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-sm font-medium text-on-surface-variant mb-1 ml-1" htmlFor="email">Email Address</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@hospital.ng" 
                          required
                          className="w-full bg-surface-container-highest outline-none border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary/30 transition-all duration-200 placeholder:text-outline/50"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">alternate_email</span>
                      </div>
                    </div>

                    <div className="group">
                      <div className="flex justify-between mb-1 ml-1">
                        <label className="block text-sm font-medium text-on-surface-variant" htmlFor="password">Password</label>
                        <button
                          type="button"
                          onClick={() => setForgotMode(true)}
                          className="text-xs font-semibold text-primary hover:underline transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••" 
                          required
                          minLength={6}
                          className="w-full bg-surface-container-highest outline-none border-none rounded-xl py-4 pl-12 pr-12 text-on-surface focus:ring-2 focus:ring-primary/30 transition-all duration-200 placeholder:text-outline/50"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">lock</span>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer ${loading ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    <span>{loading ? 'Authenticating...' : 'Authenticate Securely'}</span>
                    {!loading && <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>}
                  </button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/30"></div></div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-surface-container-lowest px-4 text-on-surface-variant/60 font-semibold">Or Institutional Access</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => notify('INFO', 'Google SSO integration is coming soon. Contact your system administrator.')}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl border border-outline-variant/30 hover:bg-surface-container hover:cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary text-[18px]">account_circle</span>
                      <span className="text-sm font-semibold text-on-surface">Google SSO</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => notify('INFO', 'Smart Card authentication is configured by your hospital IT department.')}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl border border-outline-variant/30 hover:bg-surface-container hover:cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary">badge</span>
                      <span className="text-sm font-semibold text-on-surface">Smart Card</span>
                    </button>
                  </div>
                </form>

                <footer className="mt-12 text-center pb-8">
                  <p className="text-sm text-on-surface-variant">
                    New staff member? <span className="text-primary font-bold">Register through your Admin portal</span>
                  </p>
                  <div className="mt-8 flex justify-center items-center gap-4 text-xs text-on-surface-variant/50">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">lock</span>
                      <span>TLS 1.3 Encryption</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">shield</span>
                      <span>HIPAA · NDPA</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      <span>Nigeria WAT</span>
                    </div>
                  </div>
                </footer>
              </>
            ) : (
              /* Forgot Password Panel */
              <div>
                <button
                  onClick={() => setForgotMode(false)}
                  className="flex items-center gap-2 text-on-surface-variant text-sm font-medium mb-8 hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span> Back to Login
                </button>
                <header className="mb-10">
                  <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Reset Password</h2>
                  <p className="text-on-surface-variant">Enter your institutional email. A reset link will be sent by your hospital IT team.</p>
                </header>
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1 ml-1" htmlFor="forgotEmail">Institutional Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        id="forgotEmail"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@hospital.ng"
                        required
                        className="w-full bg-surface-container-highest outline-none border-none rounded-xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary/30 transition-all duration-200 placeholder:text-outline/50"
                      />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">alternate_email</span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-primary text-on-primary font-headline font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
