import React, { useState, useRef } from 'react';
import Header from './components/Header';
import TabSelector from './components/TabSelector';
import ResultArea from './components/ResultArea';
import { generateQtiFromFile, generateQtiFromText, generateQtiFromUrl } from './services/geminiService';
import { InputMode, FileData } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<InputMode>(InputMode.FILE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultXml, setResultXml] = useState<string | null>(null);

  // Inputs
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedFile({
          name: file.name,
          mimeType: file.type,
          data: base64String,
        });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setResultXml(null);

    try {
      let xml = '';
      
      if (mode === InputMode.TEXT) {
        if (!textInput.trim()) throw new Error("الرجاء إدخال نص للتحويل");
        xml = await generateQtiFromText(textInput);
      } else if (mode === InputMode.LINK) {
        if (!urlInput.trim()) throw new Error("الرجاء إدخال رابط صحيح");
        xml = await generateQtiFromUrl(urlInput);
      } else if (mode === InputMode.FILE) {
        if (!selectedFile) throw new Error("الرجاء اختيار ملف أولاً");
        xml = await generateQtiFromFile(selectedFile);
      }

      if (!xml || xml.length < 10) {
        throw new Error("فشل في إنشاء محتوى صالح. يرجى المحاولة مرة أخرى.");
      }
      
      setResultXml(xml);

    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">تطبيق QTI</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            التطبيق الأول لتحويل الملفات والروابط والنصوص إلى صيغة QTI للاختبارات الإلكترونية.
            <br />
            <span className="text-indigo-600 font-medium block mt-2">نسخة مجانية - إعداد: منى الكثيري</span>
          </p>
        </div>

        <TabSelector currentMode={mode} onModeChange={(m) => {
           setMode(m);
           setError(null);
           setResultXml(null);
        }} />

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8 transition-all">
          {/* FILE INPUT */}
          {mode === InputMode.FILE && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-xl p-10 bg-indigo-50/30 hover:bg-indigo-50/50 transition-colors">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="hidden" 
              />
              <div className="bg-indigo-100 p-4 rounded-full mb-4 text-indigo-600">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              
              {selectedFile ? (
                <div className="text-center">
                  <p className="font-medium text-slate-800 mb-1">{selectedFile.name}</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    تغيير الملف
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg font-medium text-slate-700 mb-1">اختر ملفاً للتحويل</p>
                  <p className="text-sm text-slate-500 mb-4">PDF, JPG, PNG</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-white border border-indigo-200 text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    استعراض الملفات
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TEXT INPUT */}
          {mode === InputMode.TEXT && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-slate-700 mb-2">نص المحتوى</label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="الصق النص هنا... سيقوم الذكاء الاصطناعي باستخراج الأسئلة منه."
                className="w-full h-48 p-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none text-slate-700"
              ></textarea>
            </div>
          )}

          {/* URL INPUT */}
          {mode === InputMode.LINK && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-slate-700 mb-2">رابط الصفحة (URL)</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                </div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full p-3 pr-10 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-700 ltr:text-left text-left" 
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">سيقوم النموذج بالبحث عن محتوى الرابط واستخراج الأسئلة.</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isLoading || (mode === InputMode.FILE && !selectedFile) || (mode === InputMode.TEXT && !textInput) || (mode === InputMode.LINK && !urlInput)}
              className={`
                flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all
                ${isLoading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:transform active:scale-95'
                }
              `}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري المعالجة...
                </>
              ) : (
                <>
                  تحويل إلى QTI
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" className="rtl:rotate-180"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-8 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mr-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {resultXml && (
          <ResultArea xmlContent={resultXml} />
        )}

      </main>

      <footer className="bg-slate-800 text-slate-400 py-6 mt-auto text-center text-sm">
        <p>© 2025 إعداد: منى الكثيري - مدعوم بواسطة Gemini 2.5</p>
      </footer>
    </div>
  );
};

export default App;