# Security Policy

Security is a primary concern for local network media streaming.

## Threat Model
- **Unauthorized Casting:** Malicious actor on the local network attempts to cast to the TV.
  - *Mitigation:* PIN authentication required before accepting the RTSP connection.
- **Interception (Eavesdropping):** Attacker attempts to sniff the UDP stream.
  - *Mitigation:* The connection operates over a secure WiFi Direct P2P group encrypted with WPA2-PSK. 

## Best Practices
- Never hardcode PINs or passwords in the source code.
- Ensure the RTSP server only binds to the P2P interface (`192.168.49.1`), refusing connections from the broader local LAN to prevent cross-subnet attacks.

## Reporting a Vulnerability
If you discover a security vulnerability, please send an email to the security team. Do not open a public issue. We will respond within 48 hours.
