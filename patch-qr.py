import re

with open('/app/applet/src/App.tsx', 'r') as f:
    code = f.read()

import_jsqr = "import jsQR from 'jsqr';\n"
if "import jsQR" not in code:
    code = re.sub(r"import QRCode from \"react-qr-code\";", import_jsqr + "import QRCode from \"react-qr-code\";", code)

sender_scan_impl = """function SenderScan({ onCancel, onScanSuccess, isAr }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrame: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
          videoRef.current.play();
          requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Camera access denied or unavailable", err);
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        canvasRef.current.height = videoRef.current.videoHeight;
        canvasRef.current.width = videoRef.current.videoWidth;
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code) {
            // Found a QR code! 
            // The QR code contains WIFI:T:WPA;S:DeviceName;P:password;;
            const match = code.data.match(/S:([^;]+);/);
            if (match && match[1]) {
              onScanSuccess(match[1]);
              return; // Stop scanning
            }
          }
        }
      }
      animationFrame = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationFrame);
    };
  }, [onScanSuccess]);

  return (
    <div className="flex flex-col h-full bg-black text-white relative">
       <div className="absolute inset-0 bg-[#0B0F19]">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 w-full h-full opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)] pointer-events-none" />
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
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00E5FF]/20 to-transparent w-full h-[200%] animate-[scan_2s_linear_infinite]" />
          </div>
       </div>
       <div className="p-8 z-10 bg-gradient-to-t from-black/80 to-transparent shrink-0">
          <p className="text-sm font-bold text-slate-300 text-center">{isAr ? 'وجه الكاميرا نحو رمز QR لعرض الشاشة' : 'Point camera at QR code'}</p>
       </div>
    </div>
  );
}"""

code = re.sub(r"function SenderScan\(\{ onCancel, onScanSuccess, isAr \}: any\) \{.*?(?=function SenderActive)", sender_scan_impl + "\n", code, flags=re.DOTALL)

with open('/app/applet/src/App.tsx', 'w') as f:
    f.write(code)
