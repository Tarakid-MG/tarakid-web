import { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import type {
  IAgoraRTCClient,
  ILocalVideoTrack,
  ILocalAudioTrack,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { agoraService } from "../../../services/agora.service";

export const useAgora = (bookingId: string, userId: number) => {
  const [client] = useState<IAgoraRTCClient>(() =>
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }),
  );
  const localRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);
  const [localTracks, setLocalTracks] = useState<
    [ILocalAudioTrack, ILocalVideoTrack] | null
  >(null);
  const [remoteUser, setRemoteUser] = useState<IAgoraRTCRemoteUser | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const remoteUserRef = useRef<IAgoraRTCRemoteUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setError(null);
        if (!bookingId || isNaN(userId)) return;

        const tokenData = await agoraService.getToken(bookingId, userId);
        if (!isMounted) return;

        const { rtc } = tokenData;

        if (client.connectionState === "DISCONNECTED") {
          await client.join(rtc.appId, rtc.channel, rtc.token, rtc.uid);
        }

        if (!isMounted) {
          await client.leave();
          return;
        }

        let tracks: [ILocalAudioTrack, ILocalVideoTrack];
        try {
          tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        } catch (trackError) {
          // We already joined the channel above; leave it so a denied
          // camera/mic permission doesn't leave a dangling publisher
          // connection open until the user reloads the page.
          if (
            client.connectionState === "CONNECTED" ||
            client.connectionState === "CONNECTING"
          ) {
            await client.leave();
          }
          throw trackError;
        }
        if (!isMounted) {
          tracks.forEach((t) => t.close());
          return;
        }

        setLocalTracks(tracks);
        await client.publish(tracks);

        if (localRef.current) {
          tracks[1].play(localRef.current);
        }

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video") {
            remoteUserRef.current = user;
            setRemoteUser(user);
            setTimeout(() => {
              if (remoteRef.current) user.videoTrack?.play(remoteRef.current);
            }, 100);
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        client.on("user-unpublished", (user) => {
          if (user.uid === remoteUserRef.current?.uid) {
            remoteUserRef.current = null;
            setRemoteUser(null);
          }
        });

        client.on("user-left", (user) => {
          if (user.uid === remoteUserRef.current?.uid) {
            remoteUserRef.current = null;
            setRemoteUser(null);
          }
        });
      } catch (err: unknown) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Agora initialization failed");
      }
    };

    init();

    return () => {
      isMounted = false;
      client.removeAllListeners();
      if (
        client.connectionState === "CONNECTED" ||
        client.connectionState === "CONNECTING"
      ) {
        client.leave();
      }
    };
  }, [bookingId, userId, client]);

  useEffect(() => {
    return () => {
      localTracks?.forEach((track) => {
        track.stop();
        track.close();
      });
    };
  }, [localTracks]);

  const toggleMic = async () => {
    if (!localTracks) return;
    try {
      const enabled = !micEnabled;
      await localTracks[0].setEnabled(enabled);
      setMicEnabled(localTracks[0].enabled);
    } catch (err) {
      console.error("Failed to toggle microphone", err);
    }
  };

  const toggleVideo = async () => {
    if (!localTracks) return;
    try {
      const enabled = !videoEnabled;
      await localTracks[1].setEnabled(enabled);

      if (enabled && localRef.current) {
        localTracks[1].play(localRef.current);
      } else {
        localTracks[1].stop();
      }

      setVideoEnabled(localTracks[1].enabled);
    } catch (err) {
      console.error("Failed to toggle camera", err);
    }
  };

  return {
    localRef,
    remoteRef,
    localTracks,
    remoteUser,
    micEnabled,
    videoEnabled,
    toggleMic,
    toggleVideo,
    error,
    client,
  };
};
