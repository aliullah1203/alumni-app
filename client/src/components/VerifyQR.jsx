import { QRCodeSVG } from "qrcode.react";

// Accepts either `url` (full verify URL) or `id` (legacy — uses window.location)
export default function VerifyQR({ url, id, size = 112 }) {
  const value = url || `${window.location.origin}/verify/${id}`;
  return <QRCodeSVG value={value} size={size} level="M" includeMargin={false} fgColor="#111" />;
}
