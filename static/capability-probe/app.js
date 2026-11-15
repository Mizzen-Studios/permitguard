import { invoke } from '@forge/bridge';
const output = document.querySelector('#result');
const show = value => { output.textContent = JSON.stringify(value, null, 2); };
for (const [id, method] of [['probe','capability_probe'],['readiness','check_readiness'],['activation','request_activation']]) {
  document.querySelector('#'+id).addEventListener('click', async event => {
    event.target.disabled = true;
    try { show(await invoke(method)); } catch (e) { show({ status: 'BLOCKED', message: String(e.message || e) }); }
    finally { event.target.disabled = false; }
  });
}
document.querySelector('#camera').addEventListener('click', async event => {
  event.target.disabled = true;
  let stream;
  try {
    const cameraAllowed = (document.permissionsPolicy || document.featurePolicy)?.allowsFeature('camera') ?? null;
    if (!navigator.mediaDevices?.getUserMedia) { show({ cameraAllowedByIframe: cameraAllowed, result: 'UNAVAILABLE', realCapture: false }); return; }
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    const video = document.querySelector('#video'); video.hidden = false; video.srcObject = stream;
    show({ cameraAllowedByIframe: cameraAllowed, result: 'REAL_DEVICE_STREAM_OPENED', videoTrackCount: stream.getVideoTracks().length, qrImplemented: false, physicalTabletVerified: false });
    await new Promise(resolve => setTimeout(resolve, 1500));
  } catch (e) { show({ result: 'BLOCKED', error: e.name, realCapture: false, message: 'Permission denied or no device is not evidence of readiness.' }); }
  finally { stream?.getTracks().forEach(t => t.stop()); document.querySelector('#video').srcObject = null; event.target.disabled = false; }
});
