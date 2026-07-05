export interface CodeFile {
  path: string;
  name: string;
  language: string;
  category: 'Backend' | 'Frontend' | 'Config';
  descriptionAr: string;
  descriptionEn: string;
  content: string;
}

export const sourceCodeFiles: CodeFile[] = [
  {
    path: "android/app/src/main/java/com/receiver/wifidirect/WifiDirectModule.kt",
    name: "WifiDirectModule.kt",
    language: "kotlin",
    category: "Backend",
    descriptionAr: "كود Kotlin للـ Native Module المسؤول عن إدارة WiFi Direct وإنشاء الـ Group Owner مع استخراج SSID وكلمة المرور وبث حالة الاتصال.",
    descriptionEn: "Kotlin Native Module handling WiFi Direct P2P Group Owner creation, SSID/Password generation, and broadcasting connection events to React Native.",
    content: `package com.receiver.wifidirect

import android.content.Context
import android.net.wifi.p2p.WifiP2pConfig
import android.net.wifi.p2p.WifiP2pGroup
import android.net.wifi.p2p.WifiP2pInfo
import android.net.wifi.p2p.WifiP2pManager
import android.net.wifi.p2p.WifiP2pManager.ActionListener
import android.net.wifi.p2p.WifiP2pManager.ChannelListener
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class WifiDirectModule(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), ChannelListener {

    private var manager: WifiP2pManager? = null
    private var channel: WifiP2pManager.Channel? = null
    private var isReceiverRunning = false
    private val TAG = "WifiDirectModule"

    init {
        manager = reactContext.getSystemService(Context.WIFI_P2P_SERVICE) as WifiP2pManager
        channel = manager?.initialize(reactContext, Looper.getMainLooper(), this)
    }

    override fun getName(): String {
        return "WifiDirectModule"
    }

    override fun onChannelDisconnected() {
        Log.e(TAG, "WiFi Direct Channel disconnected. Re-initializing...")
        channel = manager?.initialize(reactContext, Looper.getMainLooper(), this)
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun startReceiver(promise: Promise) {
        if (isReceiverRunning) {
            promise.resolve("Receiver is already running")
            return
        }

        manager?.createGroup(channel, object : ActionListener {
            override fun onSuccess() {
                isReceiverRunning = true
                Log.d(TAG, "WiFi Direct Group created successfully as Owner.")
                
                // Fetch group details (SSID & Passphrase)
                requestGroupInfo(promise)
            }

            override fun onFailure(reason: Int) {
                val errorMsg = when (reason) {
                    WifiP2pManager.P2P_UNSUPPORTED -> "P2P Unsupported on this device"
                    WifiP2pManager.BUSY -> "System Busy, try again"
                    else -> "Unknown error starting WiFi Direct (Code: $reason)"
                }
                Log.e(TAG, "Failed to create group: $errorMsg")
                promise.reject("CREATE_GROUP_FAILED", errorMsg)
            }
        })
    }

    @ReactMethod
    fun stopReceiver(promise: Promise) {
        if (!isReceiverRunning) {
            promise.resolve("Receiver is already stopped")
            return
        }

        manager?.removeGroup(channel, object : ActionListener {
            override fun onSuccess() {
                isReceiverRunning = false
                Log.d(TAG, "WiFi Direct Group removed successfully.")
                promise.resolve("Receiver stopped and group removed")
            }

            override fun onFailure(reason: Int) {
                Log.e(TAG, "Failed to remove group: $reason")
                promise.reject("REMOVE_GROUP_FAILED", "Failed to stop receiver (Code: $reason)")
            }
        })
    }

    private fun requestGroupInfo(promise: Promise) {
        manager?.requestGroupInfo(channel) { group ->
            if (group != null && group.isGroupOwner) {
                val ssid = group.networkName
                val passphrase = group.passphrase
                val ipAddress = "192.168.49.1" // Default WiFi Direct Group Owner IP

                val result = Arguments.createMap().apply {
                    putString("ssid", ssid)
                    putString("passphrase", passphrase)
                    putString("ipAddress", ipAddress)
                    putInt("port", 8554) // Default RTSP Port
                }
                
                Log.d(TAG, "Group Info: SSID: $ssid, Passphrase: $passphrase")
                promise.resolve(result)

                // Also emit to React Native listeners
                sendEvent("onReceiverStarted", result)
            } else {
                promise.reject("GROUP_INFO_ERROR", "Could not retrieve Group Owner credentials")
            }
        }
    }

    @ReactMethod
    fun getConnectionInfo(promise: Promise) {
        manager?.requestConnectionInfo(channel) { info ->
            val result = Arguments.createMap().apply {
                putBoolean("groupFormed", info.groupFormed)
                putBoolean("isGroupOwner", info.isGroupOwner)
                putString("groupOwnerAddress", info.groupOwnerAddress?.hostAddress)
            }
            promise.resolve(result)
        }
    }
}`
  },
  {
    path: "android/app/src/main/java/com/receiver/wifidirect/RtspServer.kt",
    name: "RtspServer.kt",
    language: "kotlin",
    category: "Backend",
    descriptionAr: "تنفيذ بروتوكول RTSP خفيف بلغة Kotlin للتعامل مع طلبات البث (OPTIONS, DESCRIBE, SETUP, PLAY) واستقبال حزم الفيديو RTP.",
    descriptionEn: "Lightweight Kotlin RTSP Socket Server parsing Miracast setup requests (OPTIONS, DESCRIBE, SETUP, PLAY) and preparing video pipeline handlers.",
    content: `package com.receiver.wifidirect

import android.util.Log
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStream
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.Executors

class RtspServer(private val port: Int, private val onStreamStarted: (streamUrl: String) -> Unit) {
    private val TAG = "RtspServer"
    private var serverSocket: ServerSocket? = null
    private var isRunning = false
    private val threadPool = Executors.newCachedThreadPool()

    fun start() {
        if (isRunning) return
        isRunning = true
        threadPool.execute {
            try {
                serverSocket = ServerSocket(port)
                Log.i(TAG, "RTSP Server started on port $port")
                while (isRunning) {
                    val clientSocket = serverSocket?.accept()
                    if (clientSocket != null) {
                        threadPool.execute { handleClient(clientSocket) }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error in RTSP Server: \${e.message}")
            }
        }
    }

    fun stop() {
        isRunning = false
        try {
            serverSocket?.close()
            threadPool.shutdownNow()
            Log.i(TAG, "RTSP Server stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping RTSP Server: \${e.message}")
        }
    }

    private fun handleClient(socket: Socket) {
        try {
            val reader = BufferedReader(InputStreamReader(socket.getInputStream()))
            val writer = socket.getOutputStream()
            var line: String?
            var cseq = "1"
            var rtspSessionId = "987654321"

            Log.d(TAG, "New RTSP connection from \${socket.inetAddress.hostAddress}")

            while (socket.isConnected && !socket.isClosed) {
                val requestBuilder = StringBuilder()
                var contentLength = 0
                
                // Read headers
                while (reader.readLine().also { line = it } != null) {
                    if (line!!.isEmpty()) break
                    requestBuilder.append(line).append("\\n")
                    if (line!!.startsWith("CSeq:", ignoreCase = true)) {
                        cseq = line!!.substring(5).trim()
                    }
                    if (line!!.startsWith("Content-Length:", ignoreCase = true)) {
                        contentLength = line!!.substring(15).trim().toInt()
                    }
                }

                val request = requestBuilder.toString()
                if (request.isEmpty()) break

                Log.d(TAG, "RTSP Request received:\\n\$request")

                val firstLine = request.split("\\n")[0]
                val tokens = firstLine.split(" ")
                if (tokens.size < 2) continue
                val method = tokens[0]
                val uri = tokens[1]

                val response = when (method) {
                    "OPTIONS" -> {
                        "RTSP/1.0 200 OK\\r\\n" +
                        "CSeq: \$cseq\\r\\n" +
                        "Public: OPTIONS, DESCRIBE, SETUP, TEARDOWN, PLAY, PAUSE\\r\\n\\r\\n"
                    }
                    "DESCRIBE" -> {
                        // SDP body indicating H264 video on port 5004 and AAC audio on port 5006
                        val sdp = "v=0\\r\\n" +
                                "o=- 1625470000 1625470000 IN IP4 192.168.49.1\\r\\n" +
                                "s=Android Smart View Session\\r\\n" +
                                "c=IN IP4 0.0.0.0\\r\\n" +
                                "t=0 0\\r\\n" +
                                "m=video 5004 RTP/AVP 96\\r\\n" +
                                "a=rtpmap:96 H264/90000\\r\\n" +
                                "a=fmtp:96 packetization-mode=1\\r\\n" +
                                "m=audio 5006 RTP/AVP 97\\r\\n" +
                                "a=rtpmap:97 mpeg4-generic/48000/2\\r\\n"

                        "RTSP/1.0 200 OK\\r\\n" +
                        "CSeq: \$cseq\\r\\n" +
                        "Content-Type: application/sdp\\r\\n" +
                        "Content-Length: \${sdp.length}\\r\\n\\r\\n" +
                        sdp
                    }
                    "SETUP" -> {
                        // Setup RTP stream ports (client ports mapped to server delivery)
                        "RTSP/1.0 200 OK\\r\\n" +
                        "CSeq: \$cseq\\r\\n" +
                        "Session: \$rtspSessionId;timeout=60\\r\\n" +
                        "Transport: RTP/AVP;unicast;client_port=5004-5005;server_port=6004-6005\\r\\n\\r\\n"
                    }
                    "PLAY" -> {
                        // Trigger stream receiver callback to Frontend
                        onStreamStarted("rtsp://192.168.49.1:8554/live")
                        "RTSP/1.0 200 OK\\r\\n" +
                        "CSeq: \$cseq\\r\\n" +
                        "Session: \$rtspSessionId\\r\\n" +
                        "Range: npt=0.000-\\r\\n\\r\\n"
                    }
                    "TEARDOWN" -> {
                        "RTSP/1.0 200 OK\\r\\n" +
                        "CSeq: \$cseq\\r\\n" +
                        "Session: \$rtspSessionId\\r\\n\\r\\n"
                    }
                    else -> {
                        "RTSP/1.0 501 Not Implemented\\r\\n" +
                        "CSeq: \$cseq\\r\\n\\r\\n"
                    }
                }

                writer.write(response.toByteArray())
                writer.flush()
                Log.d(TAG, "RTSP Response sent:\\n\$response")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Connection lost with Miracast Sender: \${e.message}")
        } finally {
            socket.close()
        }
    }
}`
  },
  {
    path: "android/app/src/main/java/com/receiver/wifidirect/RtspReceiverService.kt",
    name: "RtspReceiverService.kt",
    language: "kotlin",
    category: "Backend",
    descriptionAr: "خدمة Foreground Service لضمان بقاء خادم RTSP نشطاً في الخلفية مع إشعار دائم يعرض حالة استقبال البث لمنع إغلاق النظام للتطبيق.",
    descriptionEn: "Android Foreground Service keeping the RTSP sockets active in the background, showing a persistent status notification to bypass OS battery constraints.",
    content: `package com.receiver.wifidirect

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.facebook.react.modules.core.DeviceEventManagerModule

class RtspReceiverService : Service() {
    private var rtspServer: RtspServer? = null
    private val NOTIFICATION_ID = 101
    private val CHANNEL_ID = "SmartViewReceiverChannel"

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action
        if (action == "START_RECEIVER") {
            val notification = buildNotification("مستعد للاستقبال... بانتظار اتصال Smart View")
            startForeground(NOTIFICATION_ID, notification)

            // Start RTSP Server on port 8554
            rtspServer = RtspServer(8554) { streamUrl ->
                // Broadcast to React Native that stream is live
                val serviceIntent = Intent("com.receiver.wifidirect.STREAM_LIVE").apply {
                    putExtra("streamUrl", streamUrl)
                }
                sendBroadcast(serviceIntent)
                
                // Update Notification to Active state
                updateNotification("جاري استقبال البث المباشر للشاشة...")
            }
            rtspServer?.start()

        } else if (action == "STOP_RECEIVER") {
            rtspServer?.stop()
            stopForeground(true)
            stopSelf()
        }

        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES, O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Smart View Screen Receiver Status",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "يعرض حالة خدمة استقبال بث الشاشة اللاسلكي"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(contentText: String): Notification {
        // Fallback or explicit MainActivity pending intent
        val notificationIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Smart View Receiver")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.presence_video_online)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun updateNotification(text: String) {
        val notification = buildNotification(text)
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, notification)
    }

    override fun onDestroy() {
        rtspServer?.stop()
        super.onDestroy()
    }
}`
  },
  {
    path: "android/app/src/main/java/com/receiver/wifidirect/SmartViewReceiverPackage.kt",
    name: "SmartViewReceiverPackage.kt",
    language: "kotlin",
    category: "Backend",
    descriptionAr: "كود جسر التسجيل لـ React Native لربط وتفعيل الـ WifiDirectModule داخل بيئة عمل التطبيق.",
    descriptionEn: "React Native Package bridging wrapper to register the WifiDirect Kotlin module inside the React Native runtime context.",
    content: `package com.receiver.wifidirect

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import java.util.ArrayList

class SmartViewReceiverPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        val modules = ArrayList<NativeModule>()
        modules.add(WifiDirectModule(reactContext))
        return modules
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}`
  },
  {
    path: "src/App.tsx",
    name: "App.tsx (React Native)",
    language: "typescript",
    category: "Frontend",
    descriptionAr: "شاشة التحكم الرئيسية في React Native مع عرض معلومات WiFi Direct، توليد الـ QR Code، ودمج مشغل الفيديو RTSP للبث الوارد.",
    descriptionEn: "React Native App component rendering toggle controls, generating connections QR Codes, and rendering the incoming RTSP screen mirror stream via Exoplayer.",
    content: `import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  DeviceEventEmitter, 
  ActivityIndicator, 
  StatusBar,
  useColorScheme
} from 'react-native';
import { NativeModules } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Video from 'react-native-video';
import KeepAwake from 'react-native-keep-awake';

const { WifiDirectModule } = NativeModules;

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    // Listen to WiFi Direct Activation Events from Kotlin
    const startListener = DeviceEventEmitter.addListener('onReceiverStarted', (data) => {
      setReceiverInfo(data);
      setIsRunning(true);
      setIsLoading(false);
    });

    // Native BroadcastReceiver listener for RTSP Stream activation
    const streamListener = DeviceEventEmitter.addListener('onStreamActive', (data) => {
      setStreamUrl(data.streamUrl);
    });

    return () => {
      startListener.remove();
      streamListener.remove();
    };
  }, []);

  const handleToggleReceiver = async () => {
    setIsLoading(true);
    if (isRunning) {
      try {
        await WifiDirectModule.stopReceiver();
        setIsRunning(false);
        setReceiverInfo(null);
        setStreamUrl(null);
        KeepAwake.deactivate();
      } catch (err) {
        console.error("Failed to stop receiver", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const info = await WifiDirectModule.startReceiver();
        setReceiverInfo(info);
        setIsRunning(true);
        KeepAwake.activate();
      } catch (err) {
        console.error("Failed to start receiver", err);
        alert("WiFi P2P Error: Ensure Location permissions & Wi-Fi are enabled.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Connection QR Payload containing WiFi-Direct credentials for Smart View Auto-Pairing
  const qrPayload = receiverInfo ? JSON.stringify({
    type: "smart-view-receiver",
    ssid: receiverInfo.ssid,
    password: receiverInfo.passphrase,
    ip: receiverInfo.ipAddress,
    port: receiverInfo.port,
    quality: quality
  }) : "";

  // Full Screen Screen-Mirroring View
  if (streamUrl) {
    return (
      <View style={styles.streamContainer}>
        <StatusBar hidden />
        <KeepAwake />
        <Video
          source={{ uri: streamUrl }}
          style={styles.fullscreenVideo}
          resizeMode="contain"
          controls={false}
          playInBackground={false}
          bufferConfig={{
            minBufferMs: 100,
            maxBufferMs: 500,
            bufferForPlaybackMs: 50,
            bufferForPlaybackAfterRebufferMs: 100
          }}
          onError={(e) => {
            console.error("RTSP Stream error: ", e);
            setStreamUrl(null);
          }}
        />
        
        {/* Disconnect Overlay button */}
        <TouchableOpacity 
          style={styles.closeStreamButton} 
          onPress={() => setStreamUrl(null)}
        >
          <Text style={styles.closeStreamText}>إغلاق البث ✕</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121214" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Smart View TV Receiver</Text>
        <Text style={styles.subtitle}>بث شاشة هواتف الأندرويد لـهذا الجهاز مباشرة</Text>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#FFB800" />
        ) : (
          <TouchableOpacity 
            style={[styles.toggleButton, isRunning ? styles.activeButton : styles.inactiveButton]}
            onPress={handleToggleReceiver}
          >
            <Text style={styles.powerIcon}>⏻</Text>
            <Text style={styles.buttonText}>
              {isRunning ? "إيقاف وضع الاستقبال" : "تشغيل وضع الاستقبال"}
            </Text>
          </TouchableOpacity>
        )}

        {isRunning && receiverInfo && (
          <View style={styles.infoCard}>
            <Text style={styles.cardHeader}>جاهز للاستقبال اللاسلكي</Text>
            
            <View style={styles.qrContainer}>
              <QRCode
                value={qrPayload}
                size={160}
                color="#000"
                backgroundColor="#fff"
              />
            </View>

            <View style={styles.detailsList}>
              <Text style={styles.detailItem}>
                <Text style={styles.detailLabel}>اسم الشبكة (SSID): </Text>
                {receiverInfo.ssid}
              </Text>
              <Text style={styles.detailItem}>
                <Text style={styles.detailLabel}>رمز المرور (WPA2): </Text>
                {receiverInfo.passphrase}
              </Text>
              <Text style={styles.detailItem}>
                <Text style={styles.detailLabel}>عنوان الشبكة (IP): </Text>
                {receiverInfo.ipAddress}:{receiverInfo.port}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Footer Settings Row */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>أصلح للهواتف والأجهزة اللوحية بنظام Android 8+</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0AA',
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginVertical: 20,
  },
  toggleButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  inactiveButton: {
    backgroundColor: '#27272A',
    borderWidth: 2,
    borderColor: '#3F3F46',
  },
  activeButton: {
    backgroundColor: '#FFB800',
    shadowColor: '#FFB800',
    shadowOpacity: 0.5,
  },
  powerIcon: {
    fontSize: 60,
    color: '#FFFFFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 15,
  },
  infoCard: {
    backgroundColor: '#1E1E24',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    marginTop: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D34',
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFB800',
    marginBottom: 15,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 15,
  },
  detailsList: {
    width: '100%',
  },
  detailItem: {
    color: '#E4E4E7',
    fontSize: 13,
    marginBottom: 6,
    textAlign: 'left',
  },
  detailLabel: {
    color: '#9E9E9E',
    fontWeight: '600',
  },
  streamContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  closeStreamButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  closeStreamText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  footerText: {
    color: '#71717A',
    fontSize: 12,
  }
});`
  },
  {
    path: "android/app/src/main/AndroidManifest.xml",
    name: "AndroidManifest.xml",
    language: "xml",
    category: "Config",
    descriptionAr: "ملف الإعدادات الأساسي لتطبيق أندرويد لطلب أذونات WiFi Direct، الموقع الجغرافي، وإعلان خدمة الـ Foreground.",
    descriptionEn: "Android Manifest configuring permission flags for WiFi Direct P2P hardware access, Fine Location constraints, and the RTSP Background Foreground Service registration.",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.receiver.wifidirect">

    <!-- WiFi & P2P Local Network Permissions -->
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- WiFi Direct (P2P) in Android 10+ requires Location permissions -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- Foreground Service permissions for Android 9+ (API 28+) -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    
    <!-- Foreground Service Type for Android 14+ (API 34+) -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">

        <!-- MainActivity Configuration -->
        <activity
            android:name=".MainActivity"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize"
            android:label="@string/app_name"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Foreground Service Registration -->
        <service
            android:name=".RtspReceiverService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="mediaPlayback" />

    </application>
</manifest>`
  },
  {
    path: "android/app/build.gradle",
    name: "build.gradle (App level)",
    language: "groovy",
    category: "Config",
    descriptionAr: "ملف ربط وتثبيت الحزم والمكتبات المساعدة للـ Android Native مثل ExoPlayer لدعم بث بروتوكول RTSP.",
    descriptionEn: "App-level gradle configuration registering standard Media3 ExoPlayer RTSP streaming drivers and React Native Native compilation hooks.",
    content: `apply plugin: "com.android.application"
apply plugin: "kotlin-android"

android {
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId "com.receiver.wifidirect"
        minSdkVersion 26 // Android 8.0 Oreo is required for advanced WiFi Direct API & Codecs
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    implementation fileTree(dir: "libs", include: ["*.jar"])
    
    // React Native dependency
    implementation "com.facebook.react:react-native:+" 

    // Kotlin Support
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version"

    // AndroidX & UI
    implementation "androidx.appcompat:appcompat:1.6.1"
    implementation "androidx.core:core-ktx:1.10.1"

    // ExoPlayer Media3 RTSP Extension for Direct Screen Mirroring Playback
    implementation "androidx.media3:media3-exoplayer:1.1.1"
    implementation "androidx.media3:media3-exoplayer-rtsp:1.1.1"
    implementation "androidx.media3:media3-ui:1.1.1"
}`
  }
];
