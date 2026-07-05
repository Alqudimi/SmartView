import re

with open('/app/applet/src/App.tsx', 'r') as f:
    code = f.read()

# 1. Add import
import_webrtc = "import { WebRTCManager } from './lib/webrtc';\n\nconst webrtc = new WebRTCManager();\n\n"
code = re.sub(r"// --- Types ---", import_webrtc + "// --- Types ---", code)

# 2. Add remote stream state to Receiver
code = re.sub(r"function Receiver\(\{ device, config, onDisconnect, onToast \}: any\) \{",
              "function Receiver({ device, config, onDisconnect, onToast }: any) {\n  const videoRef = useRef<HTMLVideoElement>(null);\n  useEffect(() => {\n    if (webrtc.onRemoteStream && videoRef.current) {\n      // Stream is already captured if it's there\n    }\n    webrtc.onRemoteStream = (stream) => {\n      if (videoRef.current) {\n        videoRef.current.srcObject = stream;\n      }\n    };\n    return () => { webrtc.stop(); };\n  }, []);\n", code)

# Replace the fake "[RTSP STREAM ACTIVE]" with actual video element
video_replacement = """           <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-contain z-10" />
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 font-mono text-sm tracking-widest z-0">
             <p>[WAITING FOR STREAM]</p>
           </div>"""
code = re.sub(r"           <div className=\"absolute inset-0 flex flex-col items-center justify-center text-slate-600 font-mono text-sm tracking-widest\">.*?</div>", video_replacement, code, flags=re.DOTALL)

# 3. Update SenderActive to capture screen and stream
code = re.sub(r"function SenderActive\(\{ deviceName, onStop, isAr \}: any\) \{",
              "function SenderActive({ deviceName, onStop, isAr }: any) {\n  const videoRef = useRef<HTMLVideoElement>(null);\n  useEffect(() => {\n    const startCasting = async () => {\n      try {\n        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });\n        if (videoRef.current) videoRef.current.srcObject = stream;\n        await webrtc.startCasting(deviceName, stream);\n        stream.getVideoTracks()[0].onended = () => {\n          webrtc.stop();\n          onStop();\n        };\n      } catch (err) {\n        console.error(err);\n        onStop();\n      }\n    };\n    startCasting();\n    return () => webrtc.stop();\n  }, []);\n", code)

# Replace SenderActive visual with video preview
sender_video_replacement = """        <div className="relative w-full aspect-video bg-black rounded-3xl border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl mb-12">
           <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-50" />
           <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="w-20 h-20 bg-[#00E5FF]/20 rounded-full flex items-center justify-center mb-6 animate-pulse border border-[#00E5FF]/50 shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                 <Video className="w-8 h-8 text-[#00E5FF]" />
              </div>
              <p className="text-sm font-bold text-[#00E5FF] tracking-widest">{isAr ? 'جاري البث' : 'CASTING ACTIVE'}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">{isAr ? 'يتم عرض شاشتك على' : 'Your screen is mirrored to'} {deviceName}</p>
           </div>
        </div>"""
code = re.sub(r"        <div className=\"relative w-full aspect-video bg-black rounded-3xl border border-slate-800 flex items-center justify-center shadow-2xl mb-12\">.*?</div>", sender_video_replacement, code, flags=re.DOTALL)


# 4. Update SenderHome to show REAL receivers
code = re.sub(r"function SenderHome\(\{ onConnect, onScan, onBack, isAr \}: any\) \{",
              "function SenderHome({ onConnect, onScan, onBack, isAr }: any) {\n  const [receivers, setReceivers] = useState<any[]>([]);\n  useEffect(() => {\n    webrtc.onReceiversUpdate = (list) => setReceivers(list);\n    webrtc.getReceivers();\n  }, []);\n", code)

# Replace the hardcoded list with map over actual receivers
receivers_list = """         <div className="w-full flex flex-col gap-4">
            {receivers.length === 0 && <p className="text-center text-slate-500 my-4 text-sm font-bold">{isAr ? 'لا توجد أجهزة متصلة' : 'No devices found'}</p>}
            {receivers.map((r, i) => (
              <button key={i} onClick={() => onConnect(r.name)} className="bg-[#151B2B] border border-slate-800 hover:border-[#00E5FF]/50 p-4 rounded-3xl flex items-center gap-4 transition-all active:scale-95 group">
                 <div className="bg-[#0B0F19] p-3 rounded-2xl group-hover:bg-[#00E5FF]/10 transition-colors"><Tv className="w-6 h-6 text-[#00E5FF]" /></div>
                 <div className="text-left flex-1">
                    <p className="font-bold text-white text-base">{r.name}</p>
                    <p className="text-xs text-[#00E5FF] mt-1 font-bold">{isAr ? 'متاح للاتصال' : 'Available to connect'}</p>
                 </div>
              </button>
            ))}
         </div>"""
code = re.sub(r"         <div className=\"w-full flex flex-col gap-4\">\n            <button onClick=\{\(\) => onConnect\('SmartTV-LivingRoom'\).*?</div>\n            </button>\n         </div>", receivers_list, code, flags=re.DOTALL)

# 5. In App component, listen for incoming connections automatically instead of manual simulate
code = re.sub(r"  const handleSimulateConnection = \(\) => \{",
              "  useEffect(() => {\n    if (appRole === 'receiver' && serverState === 'running') {\n      webrtc.registerAsReceiver(config.deviceName);\n      webrtc.onRemoteStream = (stream) => {\n        acceptConnection({ name: 'Sender', ip: 'Unknown', duration: 0 });\n      };\n    }\n  }, [appRole, serverState, config.deviceName]);\n\n  const handleSimulateConnection = () => {", code)

with open('/app/applet/src/App.tsx', 'w') as f:
    f.write(code)
