export function QRBlock(mountEl, data, { size = 128 } = {}) {
  if (!mountEl) return;

  mountEl.innerHTML = "";
  const value = String(data ?? "");

  // QRCode is a global from CDN.
  // eslint-disable-next-line no-undef
  new QRCode(mountEl, {
    text: value,
    width: size,
    height: size,
    correctLevel: QRCode.CorrectLevel.M,
  });
}
