async function captureFrame(video) {
  if (video.readyState < 2 || !video.videoWidth || !video.videoHeight)
    throw new Error("camera_not_ready");
  const scale = Math.min(
    1,
    1600 / Math.max(video.videoWidth, video.videoHeight),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.88),
  );
  if (!blob) throw new Error("camera_failed");
  return new File([blob], "camera-notice.jpg", { type: "image/jpeg" });
}
// A single explicit still capture. No microphone and no automatic network request.
export function createCamera({
  video,
  onStatus,
  onState,
  onCapture,
  mediaDevices = globalThis.navigator?.mediaDevices,
  frame = captureFrame,
}) {
  let stream = null,
    generation = 0,
    requested = false;
  function stop(announce = false) {
    const wasActive = !!stream || requested;
    requested = false;
    generation++;
    if (stream) for (const track of stream.getTracks()) track.stop();
    stream = null;
    video.pause();
    video.srcObject = null;
    onState("off");
    if (announce || wasActive) onStatus("camera_stopped");
  }
  async function start() {
    stop();
    const attempt = generation;
    if (!mediaDevices?.getUserMedia) {
      onStatus("camera_unavailable");
      return;
    }
    requested = true;
    onState("starting");
    onStatus("camera_starting");
    try {
      const acquired = await mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      if (attempt !== generation) {
        acquired.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = acquired;
      video.srcObject = stream;
      await video.play();
      if (attempt !== generation) return;
      onState("active");
      onStatus("camera_active");
    } catch (error) {
      if (attempt !== generation) return;
      stop();
      onStatus(
        ["NotAllowedError", "SecurityError"].includes(error.name)
          ? "camera_denied"
          : [
                "NotFoundError",
                "DevicesNotFoundError",
                "OverconstrainedError",
              ].includes(error.name)
            ? "camera_missing"
            : "camera_failed",
      );
    }
  }
  async function take() {
    if (!stream) return;
    const attempt = generation;
    try {
      const file = await frame(video);
      if (attempt !== generation) return;
      stop();
      await onCapture(file);
      onStatus("camera_captured");
    } catch (error) {
      stop();
      onStatus(
        error.message === "camera_not_ready"
          ? "camera_not_ready"
          : "camera_failed",
      );
    }
  }
  return { start, take, stop };
}
