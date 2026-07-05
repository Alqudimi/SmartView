import React, { useState, useEffect, useRef } from 'react';
import QRCode from "react-qr-code";
import { 
  MonitorPlay, Power, Settings as SettingsIcon, HelpCircle, Copy, ShieldAlert, MonitorSmartphone,
  ArrowRight, ArrowLeft, Smartphone, Shield, Video, Globe, Square, Play, Pause, Volume2, VolumeX, AlertTriangle, CheckCircle, Clock, Wifi, WifiOff,
  Cast, ScanLine, Tv, X
} from 'lucide-react';

// --- Types ---
type ScreenState = 'splash' | 'home' | 'settings' | 'receiver';
type ServerState = 'stopped' | 'starting' | 'running' | 'stopping';

interface Device {
  name: string;
  ip: string;
  duration: number;
}

interface AppConfig {
  deviceName: string;
  pinEnabled: boolean;
  pinCode: string;
  quality: 'low' | 'medium' | 'high';
  language: 'ar' | 'en';
  syncHotspot: boolean;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'warn' | 'error' | 'info';
  text: string;
}

// --- Toaster Component ---
function Toaster({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 w-[90%] max-w-sm pointer-events-none transition-all">
      {toasts.map(t => (
        <div key={t.id} className={`px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md ${
          t.type === 'success' ? 'bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF]' :
          t.type === 'warn' ? 'bg-[#FFEA00]/10 border border-[#FFEA00]/30 text-[#FFEA00]' :
          t.type === 'error' ? 'bg-[#FF1744]/10 border border-[#FF1744]/30 text-[#FF1744]' :
          'bg-[#151B2B]/90 border border-slate-700 text-white'
        }`}>
           {t.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0" />}
           {t.type === 'warn' && <AlertTriangle className="w-5 h-5 shrink-0" />}
           {t.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0" />}
           <span className="text-sm font-bold">{t.text}</span>
        </div>
      ))}
    </div>
  );
}

// --- Screens ---

function Splash({ onFinish, isAr }: { onFinish: () => void, isAr: boolean }) {
  const [text, setText] = useState(isAr ? 'جاري تهيئة الخادم...' : 'Initializing server...');

  useEffect(() => {
    const t1 = setTimeout(() => setText(isAr ? 'جاري التحقق من الأذونات...' : 'Checking permissions...'), 700);
    const t2 = setTimeout(() => setText(isAr ? 'جاهز' : 'Ready'), 1500);
    const t3 = setTimeout(onFinish, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish, isAr]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0B0F19] text-white px-6 text-center">
      <MonitorSmartphone className="w-24 h-24 text-[#00E5FF] mb-8 drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
      <h1 className="text-4xl font-black mb-12 tracking-tight">Smart View</h1>
      <div className="w-64 h-1.5 bg-[#151B2B] rounded-full overflow-hidden mb-6">
        <div className="h-full bg-[#00E5FF] animate-fill-bar shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
      </div>
      <p className="text-[#94A3B8] text-sm font-bold transition-opacity duration-300">{text}</p>
    </div>
  );
}

function Home({ serverState, setServerState, config, onOpenSettings, onSimulateConnection, onToast }: any) {
  const isAr = config.language === 'ar';
  const isRunning = serverState === 'running';
  const isStarting = serverState === 'starting';
  
  const handleToggle = () => {
    if (serverState === 'stopped') {
      setServerState('starting');
      setTimeout(() => {
        setServerState('running');
        onToast('success', isAr ? 'الخادم يعمل وجاهز للاستقبال' : 'Server is running and ready');
      }, 2000);
    } else if (isRunning) {
      setServerState('stopping');
      setTimeout(() => {
        setServerState('stopped');
        onToast('info', isAr ? 'تم إيقاف الخادم' : 'Server stopped');
      }, 800);
    }
  };

  return (
    <div className="flex flex-col h-full px-6 py-8 overflow-y-auto pb-8">
      <header className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-[#151B2B] border border-slate-800 rounded-xl flex items-center justify-center">
             <MonitorSmartphone className="w-5 h-5 text-[#00E5FF]" />
           </div>
           <h1 className="text-xl font-bold tracking-tight">Smart View</h1>
        </div>
      </header>

      {/* Main Big Toggle Area */}
      <div className="flex-1 flex flex-col items-center justify-center mb-8 shrink-0 min-h-[320px]">
        <button
          onClick={handleToggle}
          disabled={isStarting || serverState === 'stopping'}
          className={`relative w-64 h-64 rounded-[40px] flex flex-col items-center justify-center transition-all duration-500 transform active:scale-95 ${
            isRunning 
              ? 'bg-[#151B2B] border-4 border-[#00E5FF] text-[#00E5FF] animate-pulse-glow'
              : isStarting || serverState === 'stopping'
              ? 'bg-[#0B0F19] border-4 border-[#00E5FF]/30 text-[#00E5FF]/50'
              : 'bg-[#151B2B] border-4 border-[#151B2B] shadow-2xl text-slate-500 hover:text-slate-300'
          }`}
        >
          {isStarting || serverState === 'stopping' ? (
            <div className="absolute inset-0 rounded-[36px] border-[6px] border-t-[#00E5FF] border-transparent animate-spin opacity-80" />
          ) : null}
          <Power className={`w-20 h-20 mb-4 transition-all duration-300 ${isRunning ? 'drop-shadow-[0_0_15px_rgba(0,229,255,0.8)]' : ''}`} />
          <span className="text-xl font-black tracking-wide">
            {isRunning ? (isAr ? 'جاهز للاستقبال' : 'Ready') : 
             isStarting ? (isAr ? 'جاري التشغيل...' : 'Starting...') : 
             serverState === 'stopping' ? (isAr ? 'جاري الإيقاف...' : 'Stopping...') :
             (isAr ? 'تشغيل' : 'Start')}
          </span>
        </button>
        
        <p className={`mt-8 text-sm font-bold transition-colors duration-500 tracking-wide ${isRunning ? 'text-[#00E5FF]' : 'text-[#94A3B8]'}`}>
          {isRunning 
            ? (isAr ? 'في انتظار اتصال الأجهزة عبر شبكتك المحلية...' : 'Waiting for local network devices...')
            : isStarting
            ? (isAr ? 'يتم تهيئة شبكة الـ WiFi Direct...' : 'Initializing WiFi Direct network...')
            : (isAr ? 'اضغط لتفعيل الاستقبال اللاسلكي' : 'Press to activate wireless receiver')}
        </p>
      </div>

      {/* Info Card - Appears when running */}
      <div className={`transition-all duration-500 overflow-hidden shrink-0 ${isRunning ? 'max-h-[500px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
        <div className="bg-[#151B2B] border border-slate-800/80 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-2xl">
          <div className="shrink-0 flex flex-col items-center">
            <div className="bg-white p-2.5 rounded-2xl flex items-center justify-center shrink-0">
               <QRCode 
                 value={`WIFI:T:WPA;S:${config.deviceName};P:12345678;;`} 
                 size={110} 
                 level="L" 
                 bgColor="#ffffff" 
                 fgColor="#0B0F19" 
               />
            </div>
            <p className="text-[10px] text-slate-400 mt-3 text-center max-w-[140px] leading-relaxed">
              {isAr ? 'امسح هذا الكود من الجهاز الآخر للاتصال السريع' : 'Scan code from the sender device to connect instantly'}
            </p>
          </div>
          
          <div className="flex-1 flex flex-col gap-5 w-full">
            <div>
              <p className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{isAr ? 'اسم الجهاز (SSID)' : 'Device Name (SSID)'}</p>
              <p className="text-lg font-black text-white">{config.deviceName}</p>
            </div>
            
            <div>
               <p className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{isAr ? 'عنوان الشبكة (IP)' : 'IP Address'}</p>
               <div className="flex items-center justify-between bg-[#0B0F19] border border-slate-800 rounded-xl p-2.5">
                 <span className="font-mono text-[#00E5FF] font-bold tracking-widest text-lg px-2">192.168.49.1</span>
                 <button 
                   onClick={() => { navigator.clipboard.writeText('192.168.49.1'); onToast('success', isAr ? 'تم نسخ عنوان IP' : 'IP copied to clipboard'); }} 
                   className="p-2.5 bg-[#151B2B] hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
                 >
                   <Copy className="w-5 h-5" />
                 </button>
               </div>
            </div>

            {config.pinEnabled && (
              <div className="flex items-center gap-3 text-[#FFEA00] bg-[#FFEA00]/10 border border-[#FFEA00]/20 px-4 py-3 rounded-xl">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold">{isAr ? 'الحماية بـ PIN مفعلة' : 'PIN Security Enabled'}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Aesthetic Risk: A hidden simulation trigger styled as a raw system log entry */}
        <button 
          onClick={onSimulateConnection}
          className="mt-6 mx-auto flex items-center justify-center gap-2 text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors"
        >
          <span>&gt;</span>
          <span>{isAr ? 'sys.trigger(simulate_inbound_connection)' : 'sys.trigger(simulate_inbound_connection)'}</span>
        </button>
      </div>

      {/* Industrial Hardware-Style Bottom Buttons */}
      <div className="flex justify-between items-center mt-auto pt-4 shrink-0 gap-4">
        <button 
          onClick={onOpenSettings}
          className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#151B2B] border border-slate-800 rounded-2xl text-slate-300 hover:bg-slate-800 active:scale-95 transition-all"
        >
          <SettingsIcon className="w-6 h-6" />
          <span className="text-sm font-bold">{isAr ? 'الإعدادات' : 'Settings'}</span>
        </button>

        <button 
          onClick={() => onToast('info', isAr ? 'نظام المساعدة غير متوفر حالياً' : 'Help system currently unavailable')}
          className="px-6 py-4 bg-[#151B2B] border border-slate-800 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-slate-300 active:scale-95 transition-all shrink-0"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

function Settings({ config, setConfig, onClose, onToast, history, clearHistory }: any) {
  const isAr = config.language === 'ar';
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  const updateConfig = (key: keyof AppConfig, value: any) => {
    setConfig((prev: AppConfig) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19]">
      <header className="flex items-center gap-4 px-6 py-6 border-b border-[#151B2B] bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <button onClick={onClose} className="p-2 -mx-2 text-slate-400 hover:text-white transition-colors">
          <BackIcon className="w-7 h-7" />
        </button>
        <h1 className="text-2xl font-black">{isAr ? 'الإعدادات' : 'Settings'}</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-10 pb-12">
        <section>
          <h2 className="text-sm font-bold text-[#00E5FF] mb-5 flex items-center gap-2 tracking-wide">
            <Smartphone className="w-5 h-5" />
            {isAr ? 'معلومات الجهاز' : 'Device Info'}
          </h2>
          <div className="bg-[#151B2B] border border-slate-800 rounded-3xl p-5 shadow-lg">
            <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">{isAr ? 'اسم الجهاز الظاهر' : 'Visible Device Name'}</label>
            <input 
              type="text" 
              value={config.deviceName}
              onChange={(e) => updateConfig('deviceName', e.target.value)}
              className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-5 py-4 text-base font-bold text-white focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-[#00E5FF] mb-5 flex items-center gap-2 tracking-wide">
            <Shield className="w-5 h-5" />
            {isAr ? 'الأمان' : 'Security'}
          </h2>
          <div className="bg-[#151B2B] border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-white">{isAr ? 'حماية الاتصال برمز PIN' : 'Require PIN Connection'}</p>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{isAr ? 'طلب رمز مرور عند محاولة أي جهاز جديد الاتصال' : 'Ask for a PIN when a new device connects'}</p>
              </div>
              <button 
                onClick={() => updateConfig('pinEnabled', !config.pinEnabled)}
                className={`w-14 h-8 rounded-full transition-colors relative shrink-0 ${config.pinEnabled ? 'bg-[#00E5FF]' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${config.pinEnabled ? (isAr ? '-translate-x-7' : 'translate-x-7') : (isAr ? '-translate-x-1' : 'translate-x-1')}`} />
              </button>
            </div>

            {config.pinEnabled && (
              <div className="pt-5 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">{isAr ? 'الرمز السري (PIN)' : 'PIN Code'}</label>
                <input 
                  type="text" 
                  maxLength={4}
                  value={config.pinCode}
                  onChange={(e) => updateConfig('pinCode', e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-32 bg-[#0B0F19] border border-slate-800 rounded-xl px-5 py-4 text-2xl font-mono font-black text-center text-[#FFEA00] tracking-[0.5em] focus:outline-none focus:border-[#00E5FF] transition-colors"
                />
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-[#00E5FF] mb-5 flex items-center gap-2 tracking-wide">
            <Wifi className="w-5 h-5" />
            {isAr ? 'نقطة الاتصال (Hotspot)' : 'Hotspot Settings'}
          </h2>
          <div className="bg-[#151B2B] border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-white">{isAr ? 'مزامنة نقطة البث' : 'Sync Hotspot'}</p>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {isAr 
                    ? 'تشغيل وإيقاف نقطة بث الـ WiFi (Hotspot) مع الخادم' 
                    : 'Automatically toggle WiFi Hotspot with the receiver server'}
                </p>
              </div>
              <button 
                onClick={() => updateConfig('syncHotspot', !config.syncHotspot)}
                className={`w-14 h-8 rounded-full transition-colors relative shrink-0 ${config.syncHotspot ? 'bg-[#00E5FF]' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${config.syncHotspot ? (isAr ? '-translate-x-7' : 'translate-x-7') : (isAr ? '-translate-x-1' : 'translate-x-1')}`} />
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-[#00E5FF] mb-5 flex items-center gap-2 tracking-wide">
            <Globe className="w-5 h-5" />
            {isAr ? 'اللغة' : 'Language'}
          </h2>
          <div className="bg-[#151B2B] border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-lg">
             {(['ar', 'en'] as const).map(l => (
               <button 
                 key={l}
                 onClick={() => updateConfig('language', l)}
                 className={`flex items-center justify-between px-6 py-5 border-b border-slate-800 last:border-0 transition-colors ${config.language === l ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'}`}
               >
                 <span className={`text-base font-bold ${config.language === l ? 'text-[#00E5FF]' : 'text-slate-300'}`}>
                   {l === 'ar' ? 'العربية' : 'English'}
                 </span>
                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${config.language === l ? 'border-[#00E5FF]' : 'border-slate-600'}`}>
                   {config.language === l && <div className="w-3 h-3 rounded-full bg-[#00E5FF]" />}
                 </div>
               </button>
             ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-sm font-bold text-[#00E5FF] flex items-center gap-2 tracking-wide">
              <Clock className="w-5 h-5" />
              {isAr ? 'سجل الاتصالات' : 'Connection History'}
            </h2>
            {history.length > 0 && (
              <button onClick={clearHistory} className="text-xs font-bold text-[#FF1744] bg-[#FF1744]/10 px-3 py-1.5 rounded-lg">
                {isAr ? 'مسح السجل' : 'Clear Log'}
              </button>
            )}
          </div>
          <div className="bg-[#151B2B] border border-slate-800 rounded-3xl p-5 shadow-lg min-h-[100px] flex flex-col">
             {history.length === 0 ? (
               <p className="text-sm text-slate-500 text-center my-auto font-bold">{isAr ? 'لا توجد اتصالات سابقة' : 'No previous connections'}</p>
             ) : (
               <div className="flex flex-col gap-4">
                 {history.map((h: any, i: number) => (
                   <div key={i} className="flex justify-between items-center border-b border-slate-800/50 pb-4 last:border-0 last:pb-0">
                     <span className="text-sm font-bold text-white">{h.name}</span>
                     <span className="text-xs font-mono text-slate-500">{h.date}</span>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </section>

      </div>
    </div>
  );
}

function Receiver({ device, config, onDisconnect, onToast }: any) {
  const isAr = config.language === 'ar';
  const BackIcon = isAr ? ArrowRight : ArrowLeft;
  
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const hideTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const resetHideTimer = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!showConfirm) setControlsVisible(false);
    }, 3000);
  };

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimerRef.current);
  }, [showConfirm]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col justify-between overflow-hidden"
      onMouseMove={resetHideTimer}
      onClick={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div className={`w-[95%] h-[85%] border border-slate-900 rounded-[40px] bg-[#0B0F19] overflow-hidden relative transition-all duration-500 ${!isPlaying ? 'opacity-40 grayscale' : ''}`}>
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-[#0B0F19]" />
           <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-[#00E5FF]/20 rounded-full blur-[80px] animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-[#2979FF]/20 rounded-full blur-[80px] animate-pulse" />
           
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 font-mono text-sm tracking-widest">
             <p>[RTSP STREAM ACTIVE]</p>
             <p className="mt-3 text-[#00E5FF] font-bold">1920x1080 @ 60FPS</p>
           </div>
        </div>
      </div>

      <div className={`absolute top-0 left-0 right-0 p-8 flex justify-between items-start transition-opacity duration-500 bg-gradient-to-b from-black to-transparent ${controlsVisible || showConfirm ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={() => setShowConfirm(true)}
          className="p-4 bg-black/60 backdrop-blur-xl border border-slate-800 hover:border-slate-500 rounded-full text-white transition-colors"
        >
          <BackIcon className="w-7 h-7" />
        </button>
        
        <div className="flex flex-col items-end">
          <div className="bg-black/60 backdrop-blur-xl border border-slate-800 px-6 py-3.5 rounded-full flex items-center gap-4">
             <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
             <span className="text-base font-bold text-white">{device.name}</span>
             <span className="text-sm font-mono text-[#00E5FF] font-bold ml-3">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 p-10 flex justify-center items-center gap-8 transition-transform duration-500 bg-gradient-to-t from-black via-black/80 to-transparent ${controlsVisible || showConfirm ? 'translate-y-0' : 'translate-y-full'}`}>
         <button 
           onClick={() => setIsMuted(!isMuted)}
           className="p-5 bg-[#151B2B]/90 backdrop-blur-xl rounded-full border border-slate-800 text-white hover:bg-slate-800 transition-colors"
         >
           {isMuted ? <VolumeX className="w-7 h-7 text-slate-500" /> : <Volume2 className="w-7 h-7" />}
         </button>

         <button 
           onClick={() => setIsPlaying(!isPlaying)}
           className="p-6 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.4)]"
         >
           {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current translate-x-1" />}
         </button>

         <button 
           onClick={() => setShowConfirm(true)}
           className="p-5 bg-[#FF1744]/20 border border-[#FF1744]/50 backdrop-blur-xl rounded-full text-[#FF1744] hover:bg-[#FF1744] hover:text-white transition-colors shadow-[0_0_20px_rgba(255,23,68,0.3)]"
         >
           <Square className="w-7 h-7 fill-current" />
         </button>
      </div>

      {showConfirm && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-[#151B2B] border border-slate-800 p-10 rounded-[40px] max-w-sm w-full text-center flex flex-col items-center shadow-2xl">
            <div className="w-20 h-20 bg-[#FF1744]/10 rounded-full flex items-center justify-center mb-8 text-[#FF1744]">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">{isAr ? 'إنهاء الاتصال؟' : 'End Connection?'}</h3>
            <p className="text-base text-slate-400 mb-10 leading-relaxed font-medium">
              {isAr ? `هل أنت متأكد من رغبتك في قطع الاتصال بـ ${device.name}؟` : `Are you sure you want to disconnect from ${device.name}?`}
            </p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-4 bg-[#0B0F19] border border-slate-800 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button 
                onClick={() => { onDisconnect(); onToast('error', isAr ? 'تم إنهاء الاتصال' : 'Connection terminated'); }}
                className="flex-1 px-4 py-4 bg-[#FF1744] text-white rounded-2xl font-bold hover:bg-red-600 shadow-[0_0_20px_rgba(255,23,68,0.4)] transition-all active:scale-95"
              >
                {isAr ? 'قطع الاتصال' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sender (Caster) Screens ---

function SenderHome({ onConnect, onScan, onBack, isAr }: any) {
  return (
    <div className="flex flex-col h-full bg-[#0B0F19] text-white overflow-hidden relative">
      <header className="flex items-center gap-4 px-6 py-6 border-b border-[#151B2B] bg-[#0B0F19]/90 backdrop-blur-md shrink-0 z-10">
        <button onClick={onBack} className="p-2 -mx-2 text-slate-400 hover:text-white transition-colors">
          {isAr ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
        </button>
        <h1 className="text-xl font-black">{isAr ? 'بث الشاشة (المرسل)' : 'Screen Cast (Sender)'}</h1>
      </header>
      <div className="flex-1 px-6 py-8 overflow-y-auto flex flex-col items-center">
         <div className="relative w-40 h-40 mb-10 flex items-center justify-center mt-4">
            <div className="absolute inset-0 border-4 border-[#00E5FF]/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <div className="absolute inset-4 border-4 border-[#00E5FF]/40 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
            <div className="bg-[#151B2B] p-6 rounded-full relative z-10 border border-[#00E5FF]/50 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
               <Cast className="w-10 h-10 text-[#00E5FF]" />
            </div>
         </div>
         <p className="text-sm font-bold text-slate-400 mb-8">{isAr ? 'جاري البحث عن أجهزة قريبة...' : 'Looking for nearby devices...'}</p>
         
         <div className="w-full flex flex-col gap-4">
            <button onClick={() => onConnect('SmartTV-LivingRoom')} className="bg-[#151B2B] border border-slate-800 hover:border-[#00E5FF]/50 p-4 rounded-3xl flex items-center gap-4 transition-all active:scale-95 group">
               <div className="bg-[#0B0F19] p-3 rounded-2xl group-hover:bg-[#00E5FF]/10 transition-colors"><Tv className="w-6 h-6 text-[#00E5FF]" /></div>
               <div className="text-left flex-1">
                  <p className="font-bold text-white text-base">SmartTV-LivingRoom</p>
                  <p className="text-xs text-[#00E5FF] mt-1 font-bold">{isAr ? 'متاح للاتصال' : 'Available to connect'}</p>
               </div>
            </button>
            <button onClick={() => onConnect('Bedroom-TV')} className="bg-[#151B2B] border border-slate-800 hover:border-[#00E5FF]/50 p-4 rounded-3xl flex items-center gap-4 transition-all active:scale-95 group">
               <div className="bg-[#0B0F19] p-3 rounded-2xl group-hover:bg-[#00E5FF]/10 transition-colors"><Tv className="w-6 h-6 text-slate-500" /></div>
               <div className="text-left flex-1">
                  <p className="font-bold text-white text-base">Bedroom-TV</p>
                  <p className="text-xs text-slate-500 mt-1 font-bold">{isAr ? 'غير متاح' : 'Offline'}</p>
               </div>
            </button>
         </div>
         
         <div className="mt-auto w-full pt-8 pb-4">
           <button onClick={onScan} className="w-full bg-[#00E5FF] text-[#0B0F19] font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-cyan-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              <ScanLine className="w-6 h-6" />
              {isAr ? 'مسح رمز الـ QR' : 'Scan QR Code'}
           </button>
         </div>
      </div>
    </div>
  );
}

function SenderScan({ onCancel, onScanSuccess, isAr }: any) {
  useEffect(() => {
    const t = setTimeout(() => {
      onScanSuccess('SmartTV-LivingRoom');
    }, 3000);
    return () => clearTimeout(t);
  }, [onScanSuccess]);

  return (
    <div className="flex flex-col h-full bg-black text-white relative">
       <div className="absolute inset-0 bg-[#0B0F19]">
          <div className="w-full h-full opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]" />
       </div>
       <header className="flex justify-between items-center px-6 py-6 z-10 bg-gradient-to-b from-black/80 to-transparent shrink-0">
         <h1 className="text-lg font-bold">{isAr ? 'امسح الرمز' : 'Scan Code'}</h1>
         <button onClick={onCancel} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
       </header>
       <div className="flex-1 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-64 h-64 border-2 border-[#00E5FF]/50 rounded-[40px] relative overflow-hidden bg-white/5 backdrop-blur-sm">
             <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#00E5FF] rounded-tl-[40px]" />
             <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#00E5FF] rounded-tr-[40px]" />
             <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#00E5FF] rounded-bl-[40px]" />
             <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#00E5FF] rounded-br-[40px]" />
             <div className="w-full h-1 bg-[#00E5FF] absolute top-0 shadow-[0_0_15px_#00E5FF] animate-[scan_2s_ease-in-out_infinite]" />
          </div>
       </div>
       <div className="p-8 z-10 text-center bg-gradient-to-t from-black/90 to-transparent shrink-0">
          <p className="text-sm font-bold text-slate-300">{isAr ? 'وجه الكاميرا نحو رمز QR لعرض الشاشة (محاكاة: سيتم الالتقاط تلقائياً)' : 'Point camera at QR code (Simulated: auto-scans in 3s)'}</p>
       </div>
       <style>{`
         @keyframes scan {
           0% { top: 0; opacity: 0; }
           10% { opacity: 1; }
           90% { opacity: 1; }
           100% { top: 100%; opacity: 0; }
         }
       `}</style>
    </div>
  );
}

function SenderActive({ deviceName, onStop, isAr }: any) {
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const formatTime = (secs: number) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] text-white">
       <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/4 -left-10 w-40 h-40 bg-[#00E5FF]/10 rounded-full blur-[80px]" />
             <div className="absolute bottom-1/4 -right-10 w-40 h-40 bg-[#2979FF]/10 rounded-full blur-[80px]" />
          </div>
          <div className="w-40 h-40 bg-[#151B2B] border-4 border-[#00E5FF] rounded-full flex items-center justify-center mb-8 relative shadow-[0_0_40px_rgba(0,229,255,0.2)]">
             <div className="absolute inset-[-4px] rounded-full border-4 border-[#00E5FF] border-t-transparent animate-spin opacity-50" />
             <Smartphone className="w-12 h-12 text-slate-400 -translate-x-3 -translate-y-2 absolute" />
             <Tv className="w-14 h-14 text-[#00E5FF] translate-x-3 translate-y-2 absolute" />
             <Cast className="w-6 h-6 text-[#FFEA00] absolute -top-2 right-4" />
          </div>
          <h2 className="text-2xl font-black mb-2 tracking-tight">{isAr ? 'يتم البث الآن' : 'Casting Active'}</h2>
          <p className="text-slate-400 font-bold mb-8">{isAr ? 'متصل بـ' : 'Connected to'} <span className="text-white">{deviceName}</span></p>
          <div className="bg-[#151B2B] px-8 py-4 rounded-[24px] font-mono text-3xl font-black text-[#00E5FF] border border-slate-800 shadow-inner">
             {formatTime(duration)}
          </div>
       </div>
       <div className="p-8 shrink-0">
         <button onClick={onStop} className="w-full bg-[#FF1744]/10 border border-[#FF1744]/30 text-[#FF1744] font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#FF1744] hover:text-white active:scale-95 transition-all shadow-[0_0_30px_rgba(255,23,68,0.15)]">
            <Square className="w-6 h-6 fill-current" />
            {isAr ? 'إيقاف البث' : 'Stop Casting'}
         </button>
       </div>
    </div>
  );
}

// --- Main Root Application ---

export default function App() {
  const [appRole, setAppRole] = useState<'select' | 'receiver' | 'sender'>('select');
  const [senderScreen, setSenderScreen] = useState<'home' | 'scan' | 'active'>('home');
  const [senderDevice, setSenderDevice] = useState('');

  const [screen, setScreen] = useState<ScreenState>('splash');
  const [serverState, setServerState] = useState<ServerState>('stopped');
  const [config, setConfig] = useState<AppConfig>({
    deviceName: 'SmartTV-LivingRoom',
    pinEnabled: false,
    pinCode: '1234',
    quality: 'high',
    language: 'ar',
    syncHotspot: false
  });
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [history, setHistory] = useState<{name: string, date: string}[]>([]);
  
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Device | null>(null);

  const isAr = config.language === 'ar';

  const showToast = (type: ToastMessage['type'], text: string) => {
    const id = Math.random().toString(36);
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleSimulateConnection = () => {
    const device = { name: 'Galaxy S24 Ultra', ip: '192.168.49.23', duration: 0 };
    if (config.pinEnabled) {
      setPendingConnection(device);
      setShowApprovalDialog(true);
    } else {
      acceptConnection(device);
    }
  };

  const acceptConnection = (device: Device) => {
    setConnectedDevice(device);
    setScreen('receiver');
    setShowApprovalDialog(false);
    showToast('success', isAr ? 'تم بدء الاتصال بنجاح' : 'Connected successfully');
    
    // Add to history
    setHistory(prev => [
      { name: device.name, date: new Date().toLocaleString(isAr ? 'ar-SA' : 'en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }) },
      ...prev
    ].slice(0, 10));
  };

  if (appRole === 'select') {
    return (
      <div dir={isAr ? 'rtl' : 'ltr'} className="fixed inset-0 bg-[#0B0F19] text-white font-sans antialiased overflow-hidden flex flex-col p-6 items-center justify-center select-none">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-center tracking-tight">{isAr ? 'اختر وضع التشغيل' : 'Select Operation Mode'}</h1>
        <p className="text-slate-400 mb-12 text-center text-sm font-medium">{isAr ? 'لغرض المعاينة، يمكنك تشغيل واجهة جهاز البث أو واجهة الاستقبال' : 'For preview purposes, you can launch either the caster or receiver interface'}</p>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
           <button 
             onClick={() => setAppRole('receiver')}
             className="flex-1 bg-[#151B2B] border border-slate-800 hover:border-[#00E5FF] p-8 rounded-[40px] flex flex-col items-center gap-6 transition-all group shadow-xl hover:shadow-[0_0_40px_rgba(0,229,255,0.15)]"
           >
              <div className="w-24 h-24 bg-[#0B0F19] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Tv className="w-12 h-12 text-[#00E5FF]" />
              </div>
              <div className="text-center">
                 <h2 className="text-xl font-black text-white tracking-tight">{isAr ? 'التلفاز (المستقبل)' : 'TV (Receiver)'}</h2>
                 <p className="text-sm text-slate-400 mt-2 font-medium">{isAr ? 'واجهة التلفاز الذكي أو جهاز الاستقبال' : 'Smart TV or Receiver interface'}</p>
              </div>
           </button>

           <button 
             onClick={() => setAppRole('sender')}
             className="flex-1 bg-[#151B2B] border border-slate-800 hover:border-[#FFEA00] p-8 rounded-[40px] flex flex-col items-center gap-6 transition-all group shadow-xl hover:shadow-[0_0_40px_rgba(255,234,0,0.15)]"
           >
              <div className="w-24 h-24 bg-[#0B0F19] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Smartphone className="w-12 h-12 text-[#FFEA00]" />
              </div>
              <div className="text-center">
                 <h2 className="text-xl font-black text-white tracking-tight">{isAr ? 'الهاتف (المرسل)' : 'Phone (Sender)'}</h2>
                 <p className="text-sm text-slate-400 mt-2 font-medium">{isAr ? 'تطبيق الهاتف للبحث والاتصال' : 'Phone app to discover and cast'}</p>
              </div>
           </button>
        </div>
        <button onClick={() => setConfig(c => ({...c, language: c.language === 'ar' ? 'en' : 'ar'}))} className="mt-12 px-6 py-3 bg-[#151B2B] rounded-full text-slate-400 font-bold hover:text-white transition-colors flex items-center gap-2">
          <Globe className="w-5 h-5" /> {isAr ? 'English' : 'العربية'}
        </button>
      </div>
    );
  }

  if (appRole === 'sender') {
    return (
      <div dir={isAr ? 'rtl' : 'ltr'} className="fixed inset-0 bg-[#0B0F19] text-white font-sans antialiased overflow-hidden select-none">
         <Toaster toasts={toasts} />
         {senderScreen === 'home' && (
            <SenderHome 
              isAr={isAr} 
              onBack={() => setAppRole('select')}
              onScan={() => setSenderScreen('scan')} 
              onConnect={(name: string) => { setSenderDevice(name); setSenderScreen('active'); showToast('success', isAr ? `متصل بـ ${name}` : `Connected to ${name}`); }} 
            />
         )}
         {senderScreen === 'scan' && (
            <SenderScan 
              isAr={isAr} 
              onCancel={() => setSenderScreen('home')} 
              onScanSuccess={(name: string) => { setSenderDevice(name); setSenderScreen('active'); showToast('success', isAr ? 'تم التقاط الرمز بنجاح' : 'QR code scanned successfully'); }} 
            />
         )}
         {senderScreen === 'active' && (
            <SenderActive 
              isAr={isAr} 
              deviceName={senderDevice} 
              onStop={() => { setSenderScreen('home'); showToast('warn', isAr ? 'تم إيقاف البث' : 'Casting stopped'); }} 
            />
         )}
      </div>
    );
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="fixed inset-0 bg-[#0B0F19] text-white font-sans antialiased overflow-hidden select-none">
      {/* Back to Role Select (Overlay button for receiver mode) */}
      <button 
         onClick={() => setAppRole('select')}
         className="absolute top-6 right-6 z-[100] p-3 bg-black/40 hover:bg-black border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all backdrop-blur-md"
         title={isAr ? 'العودة للقائمة' : 'Back to Menu'}
      >
         {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
      </button>

      <Toaster toasts={toasts} />

      {screen === 'splash' && (
        <Splash onFinish={() => setScreen('home')} isAr={isAr} />
      )}

      {screen === 'home' && (
        <Home 
          serverState={serverState} 
          setServerState={setServerState} 
          config={config} 
          onOpenSettings={() => setScreen('settings')}
          onSimulateConnection={handleSimulateConnection}
          onToast={showToast}
        />
      )}

      {screen === 'settings' && (
        <Settings 
          config={config} 
          setConfig={setConfig} 
          onClose={() => setScreen('home')}
          onToast={showToast}
          history={history}
          clearHistory={() => setHistory([])}
        />
      )}

      {screen === 'receiver' && connectedDevice && (
        <Receiver 
          device={connectedDevice} 
          config={config} 
          onDisconnect={() => { setConnectedDevice(null); setScreen('home'); }} 
          onToast={showToast} 
        />
      )}

      {/* Approval Dialog (PIN Enabled Simulation) */}
      {showApprovalDialog && pendingConnection && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <div className="bg-[#151B2B] border border-slate-800 rounded-[40px] p-10 max-w-sm w-full shadow-2xl flex flex-col items-center">
            <div className="w-20 h-20 bg-[#00E5FF]/10 rounded-full flex items-center justify-center mb-8 text-[#00E5FF]">
              <Smartphone className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-center mb-3">{isAr ? 'طلب اتصال جديد' : 'New Connection Request'}</h3>
            <p className="text-base text-slate-400 text-center mb-10 leading-relaxed font-medium">
              {isAr ? `يرغب ` : ``}
              <span className="text-white font-bold">{pendingConnection.name}</span>
              {isAr ? ` في عرض شاشته. (تجاوز الإدخال السري للمحاكاة)` : ` wants to mirror their screen.`}
            </p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => { setShowApprovalDialog(false); showToast('warn', isAr ? 'تم رفض الاتصال' : 'Connection rejected'); }} 
                className="flex-1 px-4 py-4 bg-[#0B0F19] border border-slate-800 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
              >
                {isAr ? 'رفض' : 'Reject'}
              </button>
              <button 
                onClick={() => acceptConnection(pendingConnection)} 
                className="flex-1 px-4 py-4 bg-[#00E5FF] text-[#0B0F19] rounded-2xl font-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all active:scale-95"
              >
                {isAr ? 'موافق' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

