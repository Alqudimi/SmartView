import React from 'react';
import { Radio, Cpu, Network, ShieldCheck, Play, ArrowRightLeft } from 'lucide-react';

interface DiagramStep {
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: any;
  color: string;
}

export default function ArchitectureDiagram({ isArabic }: { isArabic: boolean }) {
  const steps: DiagramStep[] = [
    {
      titleAr: "تهيئة WiFi Direct P2P",
      titleEn: "WiFi Direct P2P Setup",
      descAr: "يقوم الـ Native Module بتأسيس P2P Group Owner مع SSID مشفر (WPA2) ليعلن نفسه كجهاز استقبال.",
      descEn: "Native Module registers as a P2P Group Owner generating an encrypted WPA2 SSID to advertise itself as a screen receiver.",
      icon: Radio,
      color: "border-amber-500 text-amber-400 bg-amber-950/40"
    },
    {
      titleAr: "تشغيل خادم RTSP",
      titleEn: "Spinning Up RTSP Server",
      descAr: "تبدأ خدمة Foreground Service خادم RTSP محلي على منفذ 8554 لانتظار اتصالات بث MPEG-TS اللاسلكي.",
      descEn: "Android Foreground Service spawns a local RTSP Server on port 8554, awaiting video/audio negotiation.",
      icon: Network,
      color: "border-cyan-500 text-cyan-400 bg-cyan-950/40"
    },
    {
      titleAr: "المصافحة والاتصال (Handshake)",
      titleEn: "Connection Handshake",
      descAr: "عند اقتران الهاتف بالشبكة، يرسل طلبات OPTIONS و DESCRIBE لطلب مخرجات تشفير الفيديو والترددات.",
      descEn: "Upon phone pairing, it sends RTSP commands (OPTIONS, DESCRIBE, SETUP) to negotiate media channels and payload formats.",
      icon: ArrowRightLeft,
      color: "border-emerald-500 text-emerald-400 bg-emerald-950/40"
    },
    {
      titleAr: "أمان واستقبال RTP/MPEG-TS",
      titleEn: "Payload Decryption",
      descAr: "يتم فك تشفير حزم RTP (فيديو H.264 وصوت AAC) الواردة بسرعة عبر طبقة UDP منخفضة التأخير.",
      descEn: "Enforces local network isolation, decrypting incoming RTP payloads (H.264 Video, AAC Audio) over low-latency UDP sockets.",
      icon: ShieldCheck,
      color: "border-purple-500 text-purple-400 bg-purple-950/40"
    },
    {
      titleAr: "تشغيل البث بملء الشاشة",
      titleEn: "ExoPlayer Pipeline",
      descAr: "يُمرر بث RTSP إلى محرك ExoPlayer المدمج لعرض بث شاشة الهاتف بملء الشاشة وبأقل زمن تأخير (بين 50ms - 150ms).",
      descEn: "Feeds the stream URL into Media3 ExoPlayer with customized buffering arrays to render screen mirroring inside React Native (50ms - 150ms latency).",
      icon: Play,
      color: "border-rose-500 text-rose-400 bg-rose-950/40"
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6" id="architecture-diagram">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-500" />
          {isArabic ? "الهندسة التقنية وتدفق البيانات" : "System Architecture & Data Flow"}
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          {isArabic 
            ? "كيف يتفاعل بروتوكول Miracast و Android WifiP2pManager لتأمين نقل البيانات بأعلى جودة وزمن تأخير شبه منعدم"
            : "How Smart View / Miracast integrates with Android WifiP2pManager for seamless, zero-latency streaming."
          }
        </p>
      </div>

      {/* Visual Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative">
        {steps.map((step, idx) => {
          const IconComponent = step.icon;
          return (
            <div key={idx} className="relative flex flex-col justify-between">
              {/* Step Card */}
              <div className={`flex-1 border ${step.color} rounded-xl p-5 relative z-10 flex flex-col gap-3 transition-all hover:scale-[1.02]`}>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 text-slate-400">
                    0{idx + 1}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {isArabic ? step.titleAr : step.titleEn}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {isArabic ? step.descAr : step.descEn}
                  </p>
                </div>
              </div>

              {/* Connecting line for desktop (skip for last) */}
              {idx < 4 && (
                <div className="hidden lg:block absolute top-[40px] -right-3 w-6 h-[2px] bg-gradient-to-r from-slate-700 to-transparent z-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Latency Note */}
      <div className="mt-6 bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-300 font-mono">
            {isArabic 
              ? "تحسين استهلاك الذاكرة: مخرج الفيديو مبرمج عبر ExoPlayer Buffer (100ms Min Buffer) لضمان انسيابية تامة"
              : "ExoPlayer Buffer Optimized: Min Buffer size configured to 100ms for continuous artifact-free playback"
            }
          </span>
        </div>
        <div className="text-xs font-mono bg-slate-900 border border-slate-800 text-amber-500 px-3 py-1 rounded-md">
          {isArabic ? "معدل التأخير المتوقع: ~100ms" : "Expected Latency: ~100ms"}
        </div>
      </div>
    </div>
  );
}
