import { io, Socket } from "socket.io-client";

export class WebRTCManager {
  private socket: Socket;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  public remoteStream: MediaStream | null = null;
  public roomId: string | null = null;

  public onRemoteStream?: (stream: MediaStream) => void;
  public onConnectionStateChange?: (state: string) => void;
  public onReceiversUpdate?: (receivers: any[]) => void;
  public onPeerDisconnected?: () => void;
  
  constructor() {
    this.socket = io(window.location.origin);
    
    this.socket.on("receivers-list", (receivers) => {
      if (this.onReceiversUpdate) this.onReceiversUpdate(receivers);
    });

    this.socket.on("user-joined", async (userId) => {
      // Receiver: a sender joined, we don't initiate the offer, the sender initiates the offer
      // Wait, standard WebRTC: the one who has the media (Sender) should create the offer.
    });

    this.socket.on("offer", async (data) => {
      await this.handleOffer(data.offer, data.sender);
    });

    this.socket.on("answer", async (data) => {
      await this.handleAnswer(data.answer);
    });

    this.socket.on("ice-candidate", async (data) => {
      await this.handleIceCandidate(data.candidate);
    });
  }

  // Common PeerConnection Setup
  private createPeerConnection(remoteSocketId: string) {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit("ice-candidate", {
          roomId: this.roomId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (this.onRemoteStream && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStream(event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(pc.connectionState);
      }
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        if (this.onPeerDisconnected) this.onPeerDisconnected();
      }
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    this.peerConnection = pc;
    return pc;
  }

  // ================= RECEIVER LOGIC =================
  public registerAsReceiver(name: string) {
    this.roomId = name;
    this.socket.emit("join-room", name);
    this.socket.emit("register-receiver", { name, ip: "192.168.x.x" });
  }

  public async handleOffer(offer: RTCSessionDescriptionInit, senderId: string) {
    const pc = this.createPeerConnection(senderId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.socket.emit("answer", { roomId: this.roomId, answer });
  }


  // ================= SENDER LOGIC =================
  public getReceivers() {
    this.socket.emit("get-receivers");
  }

  public async startCasting(roomId: string, stream: MediaStream) {
    this.roomId = roomId;
    this.localStream = stream;
    this.socket.emit("join-room", roomId);

    const pc = this.createPeerConnection("receiver"); // We just send to room
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.socket.emit("offer", { roomId, offer });
  }

  public async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  public async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  public stop() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
      this.remoteStream = null;
    }
    
  }
}
