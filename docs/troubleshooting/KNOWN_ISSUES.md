# Known Issues & Limitations

- **Android 14 Permissions:** On some custom Android 14 ROMs, the P2P Group Owner intent may silently fail if Location permissions are set to "Only this time".
- **Audio Routing:** On certain hardware, the ExoPlayer may default to the earpiece speaker instead of the main media speaker. A native audio routing override may be required in future patches.
- **Capacitor Live Reload:** Using Capacitor Live Reload breaks the UDP socket binding due to port contention on the development machine. Test native features using a fully compiled build.
