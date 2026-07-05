import re

with open('/app/applet/src/App.tsx', 'r') as f:
    code = f.read()

# find useEffect for duration and add one for isPlaying
use_effect = """  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.play();
      else videoRef.current.pause();
    }
  }, [isPlaying]);"""

code = code.replace("  const hideTimerRef = useRef<NodeJS.Timeout>();", "  const hideTimerRef = useRef<NodeJS.Timeout>();\n" + use_effect)

with open('/app/applet/src/App.tsx', 'w') as f:
    f.write(code)
