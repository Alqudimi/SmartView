import re

with open('/app/applet/src/App.tsx', 'r') as f:
    code = f.read()

# remove handleSimulateConnection definition
code = re.sub(r"  const handleSimulateConnection = \(\) => \{.*?\n  };\n", "", code, flags=re.DOTALL)

# remove onSimulateConnection prop passing
code = re.sub(r"          onSimulateConnection=\{handleSimulateConnection\}\n", "", code)

# remove onSimulateConnection from Home signature
code = re.sub(r"onOpenSettings, onSimulateConnection, onToast", "onOpenSettings, onToast", code)

# fix the comment
code = code.replace("{/* Approval Dialog (PIN Enabled Simulation) */}", "{/* Approval Dialog */}")
code = code.replace("(تجاوز الإدخال السري للمحاكاة)", "(طلب اتصال جديد)")

with open('/app/applet/src/App.tsx', 'w') as f:
    f.write(code)
