import { QRCodeSVG } from "qrcode.react";

export default function VerifyQR({ id, size = 112 }) {
  const url = `${window.location.origin}/verify/${id}`;
  return <QRCodeSVG value={url} size={size} level="M" includeMargin={false} fgColor="#111" />;
}
