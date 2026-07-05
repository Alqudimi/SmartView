import re

with open('/app/applet/src/App.tsx', 'r') as f:
    code = f.read()

# Replace the current onRemoteStream handler to respect pinEnabled
new_handler = """      webrtc.onRemoteStream = (stream) => {
        const device = { name: 'Sender', ip: 'Unknown', duration: 0 };
        if (config.pinEnabled) {
          setPendingConnection(device);
          setShowApprovalDialog(true);
        } else {
          acceptConnection(device);
        }
      };"""

code = re.sub(r"      webrtc\.onRemoteStream = \(stream\) => \{\n        acceptConnection\(\{ name: 'Sender', ip: 'Unknown', duration: 0 \}\);\n      \};", new_handler, code)

with open('/app/applet/src/App.tsx', 'w') as f:
    f.write(code)
