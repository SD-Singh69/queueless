import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function ShopQRCode({ shopId, shopName }) {
  const qrRef = useRef(null);
  
  // Construct direct check-in link for customers scanning the code
  const joinUrl = `${window.location.origin}/customer?shopId=${shopId}`;

  const downloadSVG = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${shopName.toLowerCase().replace(/\s+/g, '-')}-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-1">{shopName}</h3>
      <p className="text-sm text-gray-500 mb-4">Scan QR code to join queue</p>
      
      <div ref={qrRef} className="p-3 bg-gray-50 border rounded-lg">
        <QRCodeSVG value={joinUrl} size={180} level="H" includeMargin={true} />
      </div>

      <p className="text-xs text-gray-400 mt-3 break-all max-w-xs text-center">{joinUrl}</p>

      <button
        onClick={downloadSVG}
        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors"
      >
        Download Printable QR
      </button>
    </div>
  );
}