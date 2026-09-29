
"use client";

import dynamic from "next/dynamic";
import {
  Check,
  Download,
  ImagePlus,
  Loader2,
  RotateCcw,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FaceImages } from "./BoxScene";

const BoxScene = dynamic(() => import("./BoxScene"), { ssr: false });

const FACES: {
  key: keyof FaceImages;
  label: string;
  description: string;
}[] = [
  { key: "front", label: "Front", description: "Main front panel" },
  { key: "back", label: "Back", description: "Rear panel" },
  { key: "left", label: "Left", description: "Left side panel" },
  { key: "right", label: "Right", description: "Right side panel" },
  { key: "top", label: "Top", description: "Top flap" },
  { key: "bottom", label: "Bottom", description: "Bottom panel" },
];

const EMPTY_FACES: FaceImages = {
  front: null,
  back: null,
  left: null,
  right: null,
  top: null,
  bottom: null,
};

export default function Editor({ userName }: { userName: string }) {
  const [faceImages, setFaceImages] = useState<FaceImages>(EMPTY_FACES);
  const [selectedFace, setSelectedFace] =
    useState<keyof FaceImages>("front");
  const [width, setWidth] = useState(28);
  const [height, setHeight] = useState(36);
  const [depth, setDepth] = useState(11);
  const [rotationY, setRotationY] = useState(-22);
  const [boxColor, setBoxColor] = useState("#f5f5f5");
  const [backgroundColor, setBackgroundColor] = useState("#111111");
  const [active, setActive] = useState(false);
  const [checking, setChecking] = useState(true);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    fetch("/api/subscription")
      .then((res) => res.json())
      .then((data) => setActive(Boolean(data.active)))
      .catch(() => setActive(false))
      .finally(() => setChecking(false));
  }, []);

  const faceImagesRef = useRef(faceImages);

  useEffect(() => {
    faceImagesRef.current = faceImages;
  }, [faceImages]);

  useEffect(() => {
    return () => {
      const urls = new Set(
        Object.values(faceImagesRef.current).filter(
          (url): url is string => Boolean(url)
        )
      );

      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function uploadFace(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (faceImages[selectedFace]) {
      URL.revokeObjectURL(faceImages[selectedFace]!);
    }

    const url = URL.createObjectURL(file);

    setFaceImages((current) => ({
      ...current,
      [selectedFace]: url,
    }));

    event.target.value = "";
  }

  function clearFace(face: keyof FaceImages = selectedFace) {
    const current = faceImages[face];

    setFaceImages((previous) => ({
      ...previous,
      [face]: null,
    }));

    if (
      current &&
      !Object.entries(faceImages).some(
        ([key, url]) => key !== face && url === current
      )
    ) {
      URL.revokeObjectURL(current);
    }
  }

  async function applyToAllFaces() {
    const source = faceImages[selectedFace];

    if (!source) {
      alert(`Upload artwork to the ${selectedFace} face first.`);
      return;
    }

    try {
      const response = await fetch(source);
      const blob = await response.blob();

      const next: FaceImages = { ...faceImages };
      const oldUrls = new Set<string>();

      FACES.forEach(({ key }) => {
        if (key === selectedFace) return;

        if (next[key]) oldUrls.add(next[key]!);
        next[key] = URL.createObjectURL(blob);
      });

      setFaceImages(next);

      const remaining = new Set(
        Object.values(next).filter(
          (url): url is string => Boolean(url)
        )
      );

      oldUrls.forEach((url) => {
        if (!remaining.has(url)) URL.revokeObjectURL(url);
      });
    } catch {
      alert("Unable to copy the selected artwork to all faces.");
    }
  }

  function reset() {
    const urls = new Set(
      Object.values(faceImages).filter(
        (url): url is string => Boolean(url)
      )
    );

    urls.forEach((url) => URL.revokeObjectURL(url));

    setFaceImages({ ...EMPTY_FACES });
    setSelectedFace("front");
    setWidth(28);
    setHeight(36);
    setDepth(11);
    setRotationY(-22);
    setBoxColor("#f5f5f5");
    setBackgroundColor("#111111");
  }

  async function exportPng() {
    if (!active) {
      window.location.href = "/pricing";
      return;
    }

    if (!canvasRef.current) return;

    setExporting(true);

    try {
      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(null))
      );

      const dataUrl = canvasRef.current.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = `boxshot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }

  const currentFace = FACES.find((face) => face.key === selectedFace)!;
  const currentImage = faceImages[selectedFace];

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-white/45">Welcome, {userName}</p>
          <h1 className="mt-1 text-2xl font-black">
            3D BoxShot Editor
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Design every side of your package in one 3D workspace.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <button
            onClick={exportPng}
            disabled={exporting || checking}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {active ? "Download PNG" : "Unlock PNG export"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <section className="glass relative min-h-[620px] overflow-hidden rounded-3xl">
          <div className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white/60 backdrop-blur">
            Drag to rotate · scroll to zoom · edit every face
          </div>

          <BoxScene
            faceImages={faceImages}
            width={width}
            height={height}
            depth={depth}
            boxColor={boxColor}
            backgroundColor={backgroundColor}
            rotationY={rotationY}
            onCanvasReady={(canvas) => {
              canvasRef.current = canvas;
            }}
          />
        </section>

        <aside className="glass rounded-3xl p-5">
          <div className="mb-5 flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            <div>
              <h2 className="font-bold">Package controls</h2>
              <p className="text-xs text-white/40">
                Configure all six box faces
              </p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-2">
            {FACES.map((face) => {
              const selected = selectedFace === face.key;
              const hasImage = Boolean(faceImages[face.key]);

              return (
                <button
                  key={face.key}
                  type="button"
                  onClick={() => setSelectedFace(face.key)}
                  className={`relative rounded-xl border px-2 py-3 text-center text-xs transition ${
                    selected
                      ? "border-violet-400/60 bg-violet-400/15 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {hasImage && (
                    <span className="absolute right-1.5 top-1.5">
                      <Check className="h-3 w-3 text-emerald-300" />
                    </span>
                  )}
                  <span className="block font-semibold">
                    {face.label}
                  </span>
                  <span className="mt-1 block text-[10px] text-white/35">
                    {hasImage ? "Artwork added" : "Empty"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">
                  {currentFace.label} artwork
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {currentFace.description}
                </p>
              </div>

              {currentImage && (
                <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                  Ready
                </span>
              )}
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-4 text-sm hover:bg-white/10">
              {currentImage ? (
                <Upload className="h-5 w-5" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
              {currentImage
                ? `Replace ${currentFace.label} artwork`
                : `Upload ${currentFace.label} artwork`}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={uploadFace}
              />
            </label>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => clearFace()}
                disabled={!currentImage}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear face
              </button>

              <button
                type="button"
                onClick={applyToAllFaces}
                disabled={!currentImage}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-30"
              >
                Apply to all
              </button>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            <Range
              label="Width"
              value={width}
              min={18}
              max={45}
              unit="cm"
              onChange={setWidth}
            />
            <Range
              label="Height"
              value={height}
              min={22}
              max={55}
              unit="cm"
              onChange={setHeight}
            />
            <Range
              label="Depth"
              value={depth}
              min={5}
              max={25}
              unit="cm"
              onChange={setDepth}
            />
            <Range
              label="Rotation"
              value={rotationY}
              min={-60}
              max={60}
              unit="°"
              onChange={setRotationY}
            />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <ColorControl
              label="Box"
              value={boxColor}
              onChange={setBoxColor}
            />
            <ColorControl
              label="Background"
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
          </div>

          <div
            className={`mt-7 rounded-2xl border p-4 ${
              active
                ? "border-emerald-400/20 bg-emerald-400/5"
                : "border-violet-400/20 bg-violet-400/5"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              {checking
                ? "Checking subscription..."
                : active
                  ? "Pro subscription active"
                  : "Pro export required"}
            </div>

            <p className="mt-2 text-xs leading-5 text-white/50">
              {active
                ? "Your Polar subscription is active. PNG export is enabled."
                : "The six-face editor is available after sign-in. Subscribe through Polar to enable PNG downloads."}
            </p>

            {!active && !checking && (
              <a
                href="/pricing"
                className="mt-3 inline-block text-sm font-semibold text-violet-200 underline underline-offset-4"
              >
                View subscription
              </a>
            )}
          </div>

          <a
            href="/api/polar/portal"
            className="mt-4 block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold hover:bg-white/10"
          >
            Manage Polar subscription
          </a>
        </aside>
      </div>
    </main>
  );
}

function Range({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-white/60">{label}</span>
        <span className="font-mono text-white/80">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-violet-400"
      />
    </label>
  );
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-xl border border-white/10 bg-white/5 p-3">
      <span className="block text-xs text-white/50">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent"
        />
        <span className="font-mono text-xs">{value}</span>
      </div>
    </label>
  );
}
