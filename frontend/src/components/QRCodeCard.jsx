import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, ExternalLink, QrCode as QrIcon } from 'lucide-react';
import Button from './Button';

export default function QRCodeCard({ url, title, subtitle }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#05665D',
        light: '#FFFFFF',
      },
    })
      .then((dataUrl) => {
        setQrDataUrl(dataUrl);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
  }, [url]);

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-[#EAF6F3] text-[#087F73] flex items-center justify-center mb-3">
        <QrIcon className="w-5 h-5" />
      </div>

      <h3 className="text-base font-bold text-[#17243A]">
        {title || 'Share & Donate via QR'}
      </h3>
      <p className="text-xs text-[#667085] mt-1 max-w-xs">
        {subtitle || 'Scan with your smartphone camera to open this campaign instantly'}
      </p>

      {/* QR Code Container with subtle brand frame */}
      <div className="my-5 p-3 rounded-xl bg-[#EAF6F3]/50 border-2 border-dashed border-[#087F73]/30 shadow-inner">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="Campaign QR Code"
            className="w-48 h-48 rounded-lg shadow-xs bg-white"
          />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center text-xs text-[#667085] bg-white rounded-lg">
            Generating QR...
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex-1 justify-center"
          icon={copied ? Check : Copy}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-700 transition-colors"
          title="Open Link"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
