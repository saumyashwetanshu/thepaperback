import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Auth = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/personalize');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-surface">
      {/* Left Column: Editorial Collage (Hidden on very small screens, visible on md+) */}
      <div className="hidden md:flex w-full md:w-1/2 lg:w-3/5 bg-surface-container relative overflow-hidden border-r border-outline-variant">
        {/* Collage Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-90 transition-opacity duration-700 hover:opacity-100" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}
        ></div>
        {/* Subtle Overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent opacity-50"></div>
        {/* Decorative Editorial Elements */}
        <div className="absolute bottom-margin-desktop left-margin-desktop z-10">
          <span className="block font-label-caps text-label-caps text-secondary mb-unit">Editorial Insight</span>
          <h2 className="font-display-sm text-display-sm text-on-surface max-w-md">Uncovering the narratives shaping the subcontinent.</h2>
        </div>
        {/* Structural Grid Lines (Decorative) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full border-x border-outline-variant/30 ml-margin-desktop mr-margin-desktop opacity-50 hidden lg:block"></div>
        </div>
      </div>
      
      {/* Right Column: Minimal Signup Experience */}
      <div className="flex-1 flex flex-col justify-center px-margin-mobile md:px-margin-desktop lg:px-24 py-editorial-stack w-full max-w-2xl mx-auto md:w-1/2 lg:w-2/5 relative">
        {/* Header / Brand */}
        <div className="mb-editorial-stack text-center md:text-left">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-intelligence-gap">The Paperback</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Understand the story behind the story.</p>
        </div>
        
        {/* Form Container */}
        <div className="w-full">
          <form action="#" className="space-y-gutter" method="POST" onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="relative">
              <label className="sr-only" htmlFor="email">Email address</label>
              <input 
                className="block w-full border-0 border-b border-outline bg-transparent py-3 px-0 font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-0 transition-colors rounded-none" 
                id="email" 
                name="email" 
                placeholder="Enter your email address" 
                required 
                type="email"
              />
            </div>
            {/* Continue Button */}
            <button 
              className="w-full bg-on-surface text-on-primary py-4 px-6 font-label-caps text-label-caps rounded-none hover:bg-on-surface-variant transition-colors flex items-center justify-center gap-unit group" 
              type="submit"
            >
              Continue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="mx-4 font-label-caps text-label-caps text-secondary">or</span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>
          
          {/* Social Logins */}
          <div className="space-y-intelligence-gap">
            <button className="w-full bg-transparent border border-outline text-on-surface py-3 px-6 font-label-caps text-label-caps rounded-none hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-3" type="button">
              {/* Custom Google Icon SVG */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Continue with Google
            </button>
            <button className="w-full bg-transparent border border-outline text-on-surface py-3 px-6 font-label-caps text-label-caps rounded-none hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-3" type="button">
              {/* Custom Apple Icon SVG */}
              <svg className="w-5 h-5 text-on-surface fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.365 7.124c.732-.89 1.226-2.146 1.092-3.393-1.077.043-2.4.715-3.154 1.606-.676.79-1.272 2.08-.112 3.3.112.113 1.218-.04 3.286-1.513zm-3.053 10.596c.783 1.144 1.583 2.277 2.858 2.277.046 0 1.274-.467 2.502-.467 1.237 0 2.404.467 2.459.467 1.226 0 2.01-1.124 2.764-2.22 1.066-1.565 1.51-3.085 1.547-3.155-.037-.018-2.955-1.134-2.973-4.542-.018-2.84 2.33-4.214 2.44-4.288-1.321-1.92-3.38-2.17-4.135-2.223-1.764-.176-3.447 1.036-4.348 1.036-.902 0-2.284-1.01-3.733-.984-1.91.036-3.67.112-4.664 2.723-1.992 3.46-.51 8.577 1.455 11.41.956 1.393 2.062 2.942 3.585 2.88 1.467-.063 2.046-.944 3.774-.944 1.737 0 2.261.944 3.82.944z"></path>
              </svg>
              Continue with Apple
            </button>
          </div>
        </div>
        
        {/* Minimal Privacy Text */}
        <div className="mt-editorial-stack text-center md:text-left">
          <p className="font-body-md text-xs text-secondary leading-relaxed">
            By continuing, you agree to The Paperback's 
            <Link className="underline hover:text-primary transition-colors ml-1" to="/protocol">Terms of Service</Link> and 
            <Link className="underline hover:text-primary transition-colors ml-1" to="/protocol">Privacy Policy</Link>.
          </p>
        </div>
        
        {/* Absolute Positioning elements for visual balance on right pane (Decorative) */}
        <div className="absolute top-margin-desktop right-margin-desktop hidden md:block">
          <span className="font-data-mono text-[10px] text-outline-variant tracking-widest uppercase">Intl. Edt. / 24</span>
        </div>
      </div>
    </div>
  );
};
