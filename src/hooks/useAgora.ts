import { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { agoraService } from "../services/agora.service";

export const useAgora = (bookingId: string, userId: number) => {
  const clientRef = useRef(AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }));
  const [localTracks, setLocalTracks] = useState<any>(null);
  const [remoteUser, setRemoteUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { rtc } = await agoraService.getToken(bookingId, userId);

      await clientRef.current.join(
        rtc.appId,
        rtc.channel,
        rtc.token,
        rtc.uid
      );

      const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks(tracks);

      await clientRef.current.publish(tracks);

      clientRef.current.on("user-published", async (user, type) => {
        await clientRef.current.subscribe(user, type);
        if (type === "video") setRemoteUser(user);
        if (type === "audio") user.audioTrack?.play();
      });
    };

    init();

    return () => {
      clientRef.current.leave();
    };
  }, [bookingId, userId]);

  return { client: clientRef.current, localTracks, remoteUser };
};