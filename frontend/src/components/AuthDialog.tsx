import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, Lock, ArrowLeft } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AuthMode = "initial" | "signin" | "signup" | "brand";

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>("initial");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [brandEmail, setBrandEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setMode("initial");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Google OAuth will redirect, so no need to handle success here
  };

  // send brand verification (magic link) via Supabase
  const handleSendBrandVerification = async () => {
    if (!brandEmail.trim()) {
      setError("Please enter your brand email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brandEmail)) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // use supabase directly to send magic link that redirects to brand onboarding
      const { supabase } = await import('@/lib/supabase');
      const redirectTo = `${window.location.origin}/brand-onboard?brand=true&email=${encodeURIComponent(brandEmail)}`;
      const { error } = await supabase.auth.signInWithOtp({ email: brandEmail, options: { redirectTo } });
      if (error) {
        setError(error.message);
      } else {
        setMode("initial");
        // show confirmation
        setError("Verification email sent. Check your inbox to continue the brand onboarding.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to send verification email");
    }
    setLoading(false);
  };

  const handleEmailContinue = () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setMode("signin");
  };

  const handleSignIn = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }
    
    setLoading(true);
    setError("");
    
    const { error } = await signInWithEmail(email, password);
    
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Don't have an account? Sign up below.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      handleClose();
      navigate('/main');
    }
  };

  const handleSignUp = async () => {
    if (!password) {
      setError("Please enter a password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError("");
    
    const { error } = await signUpWithEmail(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Sign up successful
      handleClose();
      navigate('/main');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (mode === "initial") {
        handleEmailContinue();
      } else if (mode === "signin") {
        handleSignIn();
      } else if (mode === "signup") {
        handleSignUp();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-8 animate-in fade-in rounded-xl shadow-md duration-300 ease-out bg-[#2a2a2a] border border-[#3a3a3a] sm:max-w-lg">
        <div>
          <div className="mx-auto max-w-md">
            <h1 className="font-display text-center font-light leading-tight tracking-tight text-3xl md:text-4xl text-white mb-3">
              {mode === "initial" && <>Sign up below to <em>unlock</em> the full potential of Ozone</>}
              {mode === "signin" && "Welcome back"}
              {mode === "signup" && "Create your account"}
            </h1>
            <div className="text-center text-sm text-gray-300 mb-6">
              {mode === "initial" && (
                <>By continuing, you agree to our <a className="underline" target="_blank" href="/privacy">privacy policy</a>.</>
              )}
              {mode === "signin" && (
                <>Enter your password to sign in</>
              )}
              {mode === "signup" && (
                <>Create a password for your account</>
              )}
            </div>
          </div>

          {/* Back button for signin/signup modes */}
          {mode !== "initial" && (
            <button
              onClick={() => setMode("initial")}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <div data-testid="login-modal">
              <div className="mx-auto max-w-md">
                {/* Initial mode - Email input and social logins */}
                {mode === "initial" && (
                  <>
                    <div className="space-y-3 mx-auto">
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="bg-[#e5e5e5] text-[#1a1a1a] hover:bg-[#d5d5d5] font-medium font-sans focus:outline-none transition duration-200 ease-out rounded-lg cursor-pointer flex w-full items-center justify-center h-11 px-4 disabled:opacity-50"
                      >
                        <div className="flex items-center min-w-0 gap-2 justify-center w-full">
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                              <span>Continue with Google</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                    <div className="mx-auto my-5 h-px w-full bg-[#404040]"></div>
                    <div>
                      <div className="mx-auto">
                        <div className="space-y-2">
                          <div>
                            <div className="relative flex items-center">
                              <Mail className="absolute left-3 w-4 h-4 text-gray-500" />
                              <input
                                placeholder="Enter your email"
                                className="w-full pl-10 outline-none focus:outline-none font-sans text-white placeholder-gray-500 bg-white/10 border-none focus:ring-1 focus:ring-gray-500 duration-200 transition-all rounded-lg h-11 text-sm px-4"
                                autoComplete="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                              />
                            </div>
                          </div>
                          <div className="flex justify-center mt-2">
                            <button
                              type="button"
                              onClick={handleEmailContinue}
                              disabled={!email.trim()}
                              className={`w-full font-sans rounded-lg h-10 text-sm font-medium transition duration-200 ${
                                email.trim()
                                  ? "bg-white text-black hover:bg-gray-200 cursor-pointer"
                                  : "bg-transparent text-gray-500 cursor-default opacity-60"
                              }`}
                            >
                              Continue with email
                            </button>
                          </div>
                          {/* Brand onboarding link */}
                          <div className="mt-4 text-center">
                            <button
                              type="button"
                              onClick={() => setMode("brand")}
                              className="text-sm underline text-gray-300 hover:text-white"
                            >
                              Are you a brand? Start brand onboarding
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Brand mode - collect brand email and send verification */}
                {mode === "brand" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-400 text-sm">Brand email</span>
                    </div>
                    <div>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3 w-4 h-4 text-gray-500" />
                        <input
                          placeholder="Enter your brand email"
                          className="w-full pl-10 outline-none focus:outline-none font-sans text-white placeholder-gray-500 bg-white/10 border-none focus:ring-1 focus:ring-gray-500 duration-200 transition-all rounded-lg h-11 text-sm px-4"
                          autoComplete="email"
                          type="email"
                          value={brandEmail}
                          onChange={(e) => setBrandEmail(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSendBrandVerification(); }}
                          autoFocus
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendBrandVerification}
                      disabled={loading || !brandEmail.trim()}
                      className="w-full bg-white text-black hover:bg-gray-200 font-sans rounded-lg h-11 text-sm font-medium transition duration-200 disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send verification'}
                    </button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setMode("initial")}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {/* Sign in mode - Password input */}
                {mode === "signin" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-400 text-sm">Email:</span>
                      <span className="text-white text-sm ml-2">{email}</span>
                    </div>
                    <div>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3 w-4 h-4 text-gray-500" />
                        <input
                          placeholder="Enter your password"
                          className="w-full pl-10 outline-none focus:outline-none font-sans text-white placeholder-gray-500 bg-white/10 border-none focus:ring-1 focus:ring-gray-500 duration-200 transition-all rounded-lg h-11 text-sm px-4"
                          autoComplete="current-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignIn}
                      disabled={loading || !password}
                      className="w-full bg-white text-black hover:bg-gray-200 font-sans rounded-lg h-11 text-sm font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Sign in"
                      )}
                    </button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        Don't have an account? <span className="underline">Sign up</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sign up mode - Password and confirm password */}
                {mode === "signup" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-400 text-sm">Email:</span>
                      <span className="text-white text-sm ml-2">{email}</span>
                    </div>
                    <div>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3 w-4 h-4 text-gray-500" />
                        <input
                          placeholder="Create a password"
                          className="w-full pl-10 outline-none focus:outline-none font-sans text-white placeholder-gray-500 bg-white/10 border-none focus:ring-1 focus:ring-gray-500 duration-200 transition-all rounded-lg h-11 text-sm px-4"
                          autoComplete="new-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3 w-4 h-4 text-gray-500" />
                        <input
                          placeholder="Confirm your password"
                          className="w-full pl-10 outline-none focus:outline-none font-sans text-white placeholder-gray-500 bg-white/10 border-none focus:ring-1 focus:ring-gray-500 duration-200 transition-all rounded-lg h-11 text-sm px-4"
                          autoComplete="new-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignUp}
                      disabled={loading || !password || !confirmPassword}
                      className="w-full bg-white text-black hover:bg-gray-200 font-sans rounded-lg h-11 text-sm font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Create account"
                      )}
                    </button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setMode("signin")}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        Already have an account? <span className="underline">Sign in</span>
                      </button>
                    </div>
                  </div>
                )}

                {mode === "initial" && (
                  <>
                    <div className="my-5 h-px w-full bg-transparent"></div>
                    <div className="text-center mb-3">
                      <span className="text-gray-400 text-sm">Don't have an account? </span>
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-white hover:text-gray-200 text-sm underline transition-colors"
                      >
                        Sign up
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-200 font-sans transition duration-200 ease-out cursor-pointer rounded-lg flex w-full items-center justify-center h-10 text-sm font-medium"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
