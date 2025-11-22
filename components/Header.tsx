import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) return true;
      if ((window.navigator as any).standalone) return true; // iOS standalone
      return false;
    };
    
    setIsInstalled(checkInstalled());

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSPrompt(true);
    } else {
      // Fallback for desktop without prompt
      alert("لتثبيت التطبيق، يرجى البحث عن خيار 'تثبيت التطبيق' في قائمة إعدادات المتصفح (عادةً في النقاط الثلاث).");
    }
  };

  // Show button if:
  // 1. Not already installed
  // 2. AND (We have a prompt OR it is iOS OR it's a likely desktop browser)
  // We act optimistically for visibility
  const showButton = !isInstalled;

  return (
    <>
      <header className="bg-indigo-700 text-white p-6 shadow-lg relative z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">تطبيق QTI</h1>
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium border border-green-400 shadow-sm">مجاني</span>
              </div>
              <p className="text-indigo-200 text-sm">تحويل الملفات والروابط الى ملفات بصيغة QTI</p>
            </div>
          </div>

          {showButton && (
            <button
              onClick={handleInstallClick}
              className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm animate-pulse"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 9.75V1.5m0 0L7.5 6M12 1.5l4.5 4.5" />
              </svg>
              تثبيت التطبيق
            </button>
          )}
        </div>
      </header>

      {/* iOS Install Instructions Modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">تثبيت على iPhone/iPad</h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              هذا التطبيق يعمل كتطبيق أصلي. لتثبيته:
              <br />
              <br />
              1. اضغط على زر <strong>المشاركة</strong> <svg className="inline w-5 h-5 text-blue-500 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> في متصفح سفاري.
              <br />
              2. اختر <strong>"إضافة إلى الشاشة الرئيسية"</strong> (Add to Home Screen).
              <br />
              3. اضغط على <strong>"إضافة"</strong>.
            </p>
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;