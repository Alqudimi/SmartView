# Frequently Asked Questions

**Q: Can I cast from an iPhone (iOS)?**
A: Currently, no. Smart View relies on Android's native WiFi Direct APIs. iOS uses AirPlay, which requires a completely different network stack (mDNS/Bonjour and AirPlay protocol).

**Q: Why is the video stuttering?**
A: Video stuttering is usually caused by UDP packet loss due to wireless interference. Ensure the devices are close, and prefer 5GHz WiFi networks.

**Q: Do I need an internet connection?**
A: No. Smart View uses WiFi Direct, which creates an isolated local network between the Sender and Receiver.

**Q: What is the maximum resolution?**
A: The system dynamically scales up to 1080p@60fps based on network bandwidth and the hardware decoder's capabilities.
