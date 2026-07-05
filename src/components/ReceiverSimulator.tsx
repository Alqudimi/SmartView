import React, { useState, useRef, useEffect } from 'react';
import { 
  Tv, 
  Settings, 
  MonitorPlay, 
  Wifi, 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Laptop, 
  Smartphone, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';

interface SimulatorProps {
  isArabic: boolean;
}

export default function ReceiverSimulator({ isArabic }: SimulatorProps) {
  // Config States
  const [deviceName, setDeviceName] = useState<string>('Living Room SmartTV');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [port, setPort] = useState<number>(8554);
  const [enablePin, setEnablePin] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>('4729');

  // Interactive States
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamSource, setStreamSource] = useState<'real' | 'simulated' | null>(null);
  
  // Simulated SSID and Credentials (persisted during run session)
  const [sessionCredentials, setSessionCredentials] = useState({
    ssid: '',
    passphrase: '',
    ip: '192.168.49.1'
  });

  // Media Stream
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [streamStats, setStreamStats] = useState({
    fps: 60,
    bitrate: '8.4 Mbps',
    resolution: '1920x1080',
    latency: '85ms'
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Generate deterministic SSID and Password based on Device Name
  useEffect(() => {
    if (isRunning) {
      const slug = deviceName.replace(/\s+/g, '-').substring(0, 12);
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const randomPass = Math.random().toString(36).substring(2, 10).toUpperCase();
      setSessionCredentials({
        ssid: `DIRECT-SmartView-${slug}_${randomId}`,
        passphrase: `SV-${randomPass}`,
        ip: '192.168.49.1'
      });
    }
  }, [isRunning, deviceName]);

  // Bind screenStream to the HTML5 video element
  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream, isStreaming]);

  // Handle Starting the Receiver (Group Owner & Sockets)
  const handleToggleReceiver = () => {
    if (isRunning) {
      // Stopping
      handleDisconnect();
      setIsRunning(false);
    } else {
      // Starting
      setIsLoading(true);
      setTimeout(() => {
        setIsRunning(true);
        setIsLoading(false);
      }, 1000);
    }
  };

  // Start Real Browser-Based Screen Sharing Receiver
  const handleStartRealMirroring = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          frameRate: quality === 'high' ? 60 : quality === 'medium' ? 30 : 15
        },
        audio: true
      });

      setScreenStream(stream);
      setStreamSource('real');
      setIsStreaming(true);

      // Track stream dimensions and changes
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      
      setStreamStats({
        fps: settings.frameRate ? Math.round(settings.frameRate) : 30,
        bitrate: quality === 'high' ? '12.2 Mbps' : quality === 'medium' ? '6.8 Mbps' : '3.2 Mbps',
        resolution: `${settings.width || 1920}x${settings.height || 1080}`,
        latency: quality === 'high' ? '45ms' : quality === 'medium' ? '85ms' : '140ms'
      });

      // Handle stream termination by browser UI ("Stop Sharing" button)
      videoTrack.onended = () => {
        handleDisconnect();
      };

    } catch (err: any) {
      console.warn("Screen share cancelled or unsupported in iframe context: ", err);
      // If it fails (common in iframe boundaries), offer a seamless beautiful mock loop fallback automatically
      handleStartSimulatedMirroring();
    }
  };

  // Start simulated high-fidelity mirroring fallback
  const handleStartSimulatedMirroring = () => {
    setStreamSource('simulated');
    setIsStreaming(true);
    setStreamStats({
      fps: quality === 'high' ? 60 : quality === 'medium' ? 30 : 24,
      bitrate: quality === 'high' ? '14.5 Mbps' : quality === 'medium' ? '8.0 Mbps' : '4.1 Mbps',
      resolution: '1920x1080 (HDR)',
      latency: quality === 'high' ? '60ms' : quality === 'medium' ? '95ms' : '150ms'
    });
  };

  // Disconnect active cast stream
  const handleDisconnect = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    setIsStreaming(false);
    setStreamSource(null);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  // Dynamic QR code content encoding credentials
  const qrCodeUrl = isRunning 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        JSON.stringify({
          ssid: sessionCredentials.ssid,
          pass: sessionCredentials.passphrase,
          ip: sessionCredentials.ip,
          port: port,
          pin: enablePin ? pinCode : null,
          quality: quality
        })
      )}`
    : '';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative" id="receiver-simulator">
      {/* Upper Device Header Bar */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
            <Tv className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{deviceName}</span>
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isRunning 
                ? (isArabic ? `الخادم نشط على منفذ ${port}` : `Server binding to port ${port}`) 
                : (isArabic ? "مستقبل الشاشات متوقف" : "Screen receiver offline")
              }
            </p>
          </div>
        </div>

        {/* Configurations buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showSettings 
                ? 'bg-amber-500 border-amber-600 text-slate-950' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{isArabic ? "الإعدادات اللاسلكية" : "Wireless Settings"}</span>
          </button>
        </div>
      </div>

      {/* Settings Panel Drawer */}
      {showSettings && (
        <div className="bg-slate-950 border-b border-slate-800 p-6 grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn">
          {/* Device Name input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">
              {isArabic ? "اسم جهاز الاستقبال:" : "Receiver Device Name:"}
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. Living Room TV"
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          {/* Quality Mode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">
              {isArabic ? "جودة الفيديو والاتصال:" : "Stream Quality Preset:"}
            </label>
            <div className="grid grid-cols-3 bg-slate-900 border border-slate-800 p-1 rounded-lg">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`text-[10px] py-1 font-bold rounded-md transition-all uppercase ${
                    quality === q 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isArabic 
                    ? q === 'low' ? 'منخفضة' : q === 'medium' ? 'متوسطة' : 'عالية'
                    : q
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Port setting */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">
              {isArabic ? "منفذ خادم RTSP:" : "RTSP Server Port:"}
            </label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          {/* PIN Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">
              {isArabic ? "تفعيل الرمز السري (PIN):" : "WPA2 PIN Authentication:"}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={enablePin}
                onChange={(e) => setEnablePin(e.target.checked)}
                className="w-4.5 h-4.5 accent-amber-500 bg-slate-900 border-slate-800 rounded"
              />
              {enablePin && (
                <input
                  type="text"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-center text-amber-500 font-mono focus:outline-none focus:border-amber-500 transition-all"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Display Screen Container */}
      <div className="relative aspect-video max-h-[520px] bg-black flex flex-col items-center justify-center p-8 overflow-hidden">
        {/* If Receiver is running & Streaming (Screen is Active) */}
        {isRunning && isStreaming ? (
          <div className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col justify-between">
            {/* Real Stream Rendering */}
            {streamSource === 'real' ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={audioMuted}
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
            ) : (
              /* Simulated High fidelity stream mock loop representing smartphone screen */
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-950">
                <div className="w-[300px] h-[520px] max-h-[92%] border-8 border-slate-800 bg-slate-900 rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col justify-between">
                  {/* Speaker and camera notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                    <div className="w-12 h-1 bg-slate-700 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full ml-3" />
                  </div>

                  {/* Dynamic Mobile OS Simulation Loop */}
                  <div className="flex-1 bg-gradient-to-b from-indigo-900 via-slate-900 to-amber-950 p-6 pt-10 flex flex-col justify-between select-none font-sans relative">
                    {/* Background floating visual to simulate active phone interaction */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.1),transparent_50%)] animate-pulse" />
                    
                    {/* Simulated Mobile Status bar */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-300 font-semibold z-10">
                      <span>11:46 AM</span>
                      <div className="flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-emerald-400" />
                        <span className="bg-slate-800/80 px-1 py-0.5 rounded text-[8px] border border-slate-700/60 text-emerald-400">P2P</span>
                      </div>
                    </div>

                    {/* Smartphone Screen Center Mock */}
                    <div className="my-auto text-center flex flex-col items-center gap-4 z-10">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 animate-bounce">
                        <Smartphone className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-white text-sm font-bold">بث الشاشة نشط</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Smart View: {deviceName}</p>
                      </div>

                      {/* Moving simulation charts representing high-performance mirroring */}
                      <div className="w-full bg-slate-950/70 border border-slate-800 p-2 rounded-xl flex flex-col gap-1 text-left font-mono">
                        <div className="flex justify-between text-[8px] text-slate-500">
                          <span>GPU RENDERING</span>
                          <span className="text-emerald-400">60 FPS</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full animate-[loading_4s_infinite]" style={{ width: '85%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex justify-around items-center pt-2 z-10 border-t border-slate-800/60">
                      <div className="w-3.5 h-3.5 border-2 border-slate-500 rounded-md" />
                      <div className="w-4 h-4 border-2 border-slate-500 rounded-full" />
                      <div className="w-3 h-3 border-r-2 border-b-2 border-slate-500 rotate-45 transform" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Overlaid Stream Controller Overlay */}
            <div className="absolute bottom-5 left-5 right-5 bg-slate-950/80 backdrop-blur-md border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    {isArabic ? "جاري استقبال البث المباشر" : "Incoming Stream Connected"}
                  </span>
                </div>

                {/* Real-time stats */}
                <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
                  <div className="text-[10px] font-mono text-slate-400">
                    RES: <span className="text-slate-200">{streamStats.resolution}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    FPS: <span className="text-emerald-400 font-bold">{streamStats.fps}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    RATE: <span className="text-amber-500">{streamStats.bitrate}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    LATENCY: <span className="text-cyan-400">{streamStats.latency}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setAudioMuted(!audioMuted)}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                  title={audioMuted ? "Unmute" : "Mute"}
                >
                  {audioMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  onClick={handleDisconnect}
                  className="bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{isArabic ? "فصل البث" : "Disconnect"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : isRunning ? (
          /* Ready and waiting for client to connect */
          <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-2xl animate-fadeIn">
            {/* Info details left side */}
            <div className="flex-1 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1 rounded-full w-max text-[10px] font-bold">
                <Wifi className="w-3 h-3 animate-pulse" />
                <span>{isArabic ? "بث الـ WiFi Direct نشط" : "Wi-Fi Direct Active"}</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white leading-tight">
                  {isArabic ? "جاهز للاستقبال اللاسلكي" : "Ready for Connection"}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {isArabic 
                    ? "افتح ميزة Smart View أو Cast على هاتف الأندرويد الخاص بك وابحث عن الجهاز للبدء، أو قم بالاقتران ومسح الكود."
                    : "Activate Smart View or Screen Mirroring on your Android device and search for the receiver device below."
                  }
                </p>
              </div>

              {/* Server connection configurations */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-2.5 font-mono text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                  <span className="text-slate-500">SSID (WiFi):</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-bold">{sessionCredentials.ssid}</span>
                    <button
                      onClick={() => copyToClipboard(sessionCredentials.ssid, 'ssid')}
                      className="text-[10px] text-amber-500 hover:underline"
                    >
                      {copySuccess === 'ssid' ? (isArabic ? 'تم!' : 'Copied!') : (isArabic ? 'نسخ' : 'Copy')}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                  <span className="text-slate-500">Password (WPA2):</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-bold">{sessionCredentials.passphrase}</span>
                    <button
                      onClick={() => copyToClipboard(sessionCredentials.passphrase, 'pass')}
                      className="text-[10px] text-amber-500 hover:underline"
                    >
                      {copySuccess === 'pass' ? (isArabic ? 'تم!' : 'Copied!') : (isArabic ? 'نسخ' : 'Copy')}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                  <span className="text-slate-500">RTSP Stream URL:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">rtsp://{sessionCredentials.ip}:{port}/live</span>
                    <button
                      onClick={() => copyToClipboard(`rtsp://${sessionCredentials.ip}:${port}/live`, 'rtsp')}
                      className="text-[10px] text-amber-500 hover:underline"
                    >
                      {copySuccess === 'rtsp' ? (isArabic ? 'تم!' : 'Copied!') : (isArabic ? 'نسخ' : 'Copy')}
                    </button>
                  </div>
                </div>

                {enablePin && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">PIN Code:</span>
                    <span className="text-amber-500 font-bold tracking-widest">{pinCode}</span>
                  </div>
                )}
              </div>

              {/* Sender Triggers inside browser */}
              <div className="flex flex-col sm:flex-row gap-3 mt-1">
                {/* Real Screen share */}
                <button
                  onClick={handleStartRealMirroring}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 transition-all"
                >
                  <Laptop className="w-4 h-4" />
                  <span>{isArabic ? "بث شاشتك الآن (Miracast)" : "Mirror Your Browser Screen"}</span>
                </button>

                {/* Simulated Screen share fallback */}
                <button
                  onClick={handleStartSimulatedMirroring}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{isArabic ? "محاكاة اتصال هاتف خارجي" : "Simulate External Phone Connection"}</span>
                </button>
              </div>
            </div>

            {/* QR Code right side */}
            <div className="bg-white p-4 rounded-xl border border-slate-800 shadow-xl flex flex-col items-center shrink-0">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="WiFi Direct Pairing QR"
                  referrerPolicy="no-referrer"
                  className="w-40 h-40 object-contain"
                />
              ) : (
                <div className="w-40 h-40 bg-slate-100 animate-pulse rounded-lg" />
              )}
              <div className="mt-3 text-center">
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                  {isArabic ? "اتصال سريع (QR-PAIR)" : "Fast Setup QR"}
                </span>
                <span className="text-[9px] text-slate-400 mt-1 block">
                  {isArabic ? "امسح الرمز للاقتران المباشر" : "Scan to instantly map connection params"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Offline screen with a major Toggle Button */
          <div className="flex flex-col items-center gap-6 text-center max-w-md animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shadow-inner">
              <Tv className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                {isArabic ? "استقبال الشاشة اللاسلكية Smart View" : "Wireless Screen Mirroring Hub"}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {isArabic 
                  ? "قم بتشغيل مستقبل الشاشات لتنشيط الـ WiFi Direct وبدء استقبال بث الفيديو والصوت من هواتف الأندرويد في شبكتك المحلية."
                  : "Activate the receiver to initialize local p2p networks and start mirroring live smartphone screens on your Smart Screen."
                }
              </p>
            </div>

            <button
              onClick={handleToggleReceiver}
              disabled={isLoading}
              className={`w-44 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isLoading 
                  ? 'bg-slate-800 text-slate-500 cursor-wait' 
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/10'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>{isArabic ? "جاري التشغيل..." : "Initializing..."}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isArabic ? "تشغيل وضع الاستقبال" : "Activate Receiver"}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Simulator Bottom Status / Help Footer banner */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {isArabic 
              ? "ميزة البث الفعلي تستخدم ميزة مشاركة شاشة المتصفح لمحاكاة كرت العرض اللاسلكي بدقة تامة."
              : "Live mirroring utilizes native browser DisplayMedia streams to demonstrate high fidelity TV renderer hardware behavior."
            }
          </span>
        </div>
        <div className="flex gap-2 font-mono text-[10px] uppercase">
          <span className="border border-slate-800 px-2 py-0.5 rounded text-slate-400">RTSP-MPEGTS</span>
          <span className="border border-slate-800 px-2 py-0.5 rounded text-slate-400">Miracast receiver</span>
        </div>
      </div>
    </div>
  );
}
