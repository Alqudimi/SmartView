import re

with open('/app/applet/src/App.tsx', 'r') as f:
    code = f.read()

# Remove the simulated connection button
simulate_button_regex = r"\{/\* Aesthetic Risk: A hidden simulation trigger styled as a raw system log entry \*/\}.*?</button>"
code = re.sub(simulate_button_regex, "", code, flags=re.DOTALL)

with open('/app/applet/src/App.tsx', 'w') as f:
    f.write(code)
