# Architecture Decision Records (ADR)

An Architecture Decision Record (ADR) captures a single architecture decision, such as framing the context, the decision itself, and the consequences.

## Current Records

### ADR 001: Use Capacitor over React Native CLI
- **Status:** Accepted
- **Context:** The team needed a framework that leverages existing web skills while providing robust access to native APIs.
- **Decision:** We use Capacitor to wrap our Vite/React app.
- **Consequences:** Easier web-based development and instant previewing, though it requires custom native plugins for deep hardware access (like WiFi Direct).

### ADR 002: Tailwind CSS for Styling
- **Status:** Accepted
- **Context:** Need a fast, scalable styling solution without the overhead of CSS-in-JS runtime performance hits.
- **Decision:** Utilize Tailwind CSS.
- **Consequences:** Faster rendering, consistent design language, but steeper initial learning curve for utility classes.

### ADR 003: Direct UDP Streaming for Media
- **Status:** Accepted
- **Context:** TCP introduces head-of-line blocking which causes severe latency spikes during screen mirroring.
- **Decision:** Media payloads (RTP) are transmitted over UDP.
- **Consequences:** Sub-100ms latency is achieved. Packet loss will result in minor visual artifacting rather than buffering pauses.
