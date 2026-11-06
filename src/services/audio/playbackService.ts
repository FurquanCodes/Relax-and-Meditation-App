import TrackPlayer, { Event, RemoteDuckEvent } from 'react-native-track-player';

export async function playbackService(): Promise<void> {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.reset();
  });

  TrackPlayer.addEventListener(Event.RemoteDuck, async (e: RemoteDuckEvent) => {
    if (e.permanent || e.paused) {
      await TrackPlayer.pause();
    } else if (e.ducking) {
      await TrackPlayer.setVolume(0.3);
    } else {
      await TrackPlayer.setVolume(1.0);
    }
  });
}

