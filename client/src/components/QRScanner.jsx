import { useState, useRef, useEffect } from "react";
import { useToast } from "./Toast";

let Html5Qrcode;

async function loadHtml5Qrcode() {
  if (!Html5Qrcode) {
    try {
      const mod = await import("html5-qrcode");
      Html5Qrcode = mod.Html5Qrcode;
    } catch {
      return null;
    }
  }
  return Html5Qrcode;
}

/**
 * QRScanner — a self-contained component for scanning QR codes.
 * On scan, calls onScan(data). Falls back to a mock input if the
 * html5-qrcode library isn't installed.
 */
export default function QRScanner({ onScan, buttonLabel = "Start scanner" }) {
  const toast = useToast();
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState("");
  const [mockInput, setMockInput] = useState("");
  const html5QrCodeRef = useRef(null);
  const scannerRef = useRef(null);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  const startScanner = async () => {
    const Html5QrcodeModule = await loadHtml5Qrcode();
    if (!Html5QrcodeModule) {
      toast.warning("Scanner library not installed — using mock input mode");
      setScanning(true);
      return;
    }

    try {
      const html5QrCode = new Html5QrcodeModule("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          width: 640,
          height: 480,
          fps: 10,
          qrbox: 250,
        },
        (decoded) => {
          setLastResult(decoded);
          toast.success(`Scanned: ${decoded}`);
          if (onScan) onScan(decoded);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      toast.error(err.message || "Camera access denied");
      setScanning(false);
    }
  };

  const handleMockSubmit = (e) => {
    e.preventDefault();
    if (!mockInput.trim()) return;
    setLastResult(mockInput.trim());
    toast.success(`Scanned (mock): ${mockInput.trim()}`);
    if (onScan) onScan(mockInput.trim());
    setMockInput("");
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="card p-5 animate-scale-in" style={{ background: "rgba(10,12,20,0.92)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2.5">📱 QR Code Scanner</h3>
        {scanning && Html5Qrcode && (
          <button onClick={stopScanner} className="text-xs text-rose-300 hover:text-rose-200 font-medium cursor-pointer">
            ⏹ Stop
          </button>
        )}
      </div>

      {!scanning && (!Html5Qrcode || true) && (
        <div className="text-center py-6">
          <p className="text-4xl mb-3">📱</p>
          <p className="text-sm text-[#8b93a7] mb-4">
            {Html5Qrcode
              ? "Click below to start your camera and scan a batch QR code."
              : "The html5-qrcode library isn't installed — enter a batch ID manually to simulate a scan."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={startScanner} className="btn-primary py-2.5 px-6 text-[13px]">
              {buttonLabel}
            </button>
          </div>

          {/* Mock input fallback */}
          <form onSubmit={handleMockSubmit} className="mt-6 flex gap-2 max-w-sm mx-auto">
            <input
              type="text"
              className="field text-xs flex-1"
              placeholder="Enter batch ID (e.g. abc123def456)…"
              value={mockInput}
              onChange={(e) => setMockInput(e.target.value)}
            />
            <button type="submit" className="btn-ghost py-2 px-3.5 text-xs">
              Scan
            </button>
          </form>
        </div>
      )}

      {scanning && Html5Qrcode && (
        <div id="qr-reader" ref={scannerRef} className="w-full rounded-xl overflow-hidden mb-3" style={{ background: "#000" }} />
      )}

      {scanning && !Html5Qrcode && (
        <div className="text-center py-8">
          <p className="text-sm text-[#8b93a7] mb-4">📷 Camera would start here (html5-qrcode library)</p>
          <div className="rounded-xl bg-black/40 border border-white/5 p-8 max-w-xs mx-auto">
            <div className="border-2 border-dashed border-dashed border-accent-500/30 rounded-xl p-6 text-center">
              <p className="text-xs text-[#5d6577]">Live camera feed placeholder</p>
            </div>
          </div>
          <p className="text-[11px] text-[#5d6577] mt-3">Use the mock input below to simulate a scan.</p>
          <form onSubmit={handleMockSubmit} className="mt-4 flex gap-2 max-w-sm mx-auto">
            <input
              type="text"
              className="field text-xs flex-1"
              placeholder="Enter batch ID…"
              value={mockInput}
              onChange={(e) => setMockInput(e.target.value)}
            />
            <button type="submit" className="btn-ghost py-2 px-3.5 text-xs">
              Scan
            </button>
          </form>
        </div>
      )}

      {scanning && Html5Qrcode && (
        <form onSubmit={handleMockSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            className="field text-xs flex-1"
            placeholder="Or enter batch ID manually…"
            value={mockInput}
            onChange={(e) => setMockInput(e.target.value)}
          />
          <button type="submit" className="btn-ghost py-2 px-3.5 text-xs">
            Scan
          </button>
        </form>
      )}

      {lastResult && (
        <div className="mt-4 rounded-lg bg-white/[0.03] border border-accent-400/20 px-3 py-2.5 text-center animate-fade-in">
          <span className="text-xs text-[#5d6577]">Last scan:</span>
          <span className="font-mono text-xs text-white break-all ml-1.5">{lastResult}</span>
        </div>
      )}
    </div>
  );
}
