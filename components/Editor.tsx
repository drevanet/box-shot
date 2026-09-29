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

const BoxScene = dynamic(() => import("./BoxScene"), {
  ssr: false,
});

const FACES: {
  key: keyof FaceImages;
  label: string;
  description: string;
}[] = [
  {
    key: "front",
    label: "Front",
    description: "Main front panel",
  },
  {
    key: "back",
    label: "Back",
    description: "Rear panel",
  },
  {
    key: "left",
    label: "Left",
    description: "Left side panel",
  },
  {
    key: "right",
    label: "Right",
    description: "Right side panel",
  },
  {
    key: "top",
    label: "Top",
    description: "Top flap",
  },
  {
    key: "bottom",
    label: "Bottom",
    description: "Bottom panel",
  },
];

const EMPTY_FACES: FaceImages = {
  front: null,
  back: null,
  left: null,
  right: null,
  top: null,
  bottom: null,
};

export default function Editor({
  userName,
}: {
  userName: string;
}) {
  // ============================================================
  // DESIGN STATE
  // ============================================================

  const [faceImages, setFaceImages] =
    useState<FaceImages>(EMPTY_FACES);

  const [selectedFace, setSelectedFace] =
    useState<keyof FaceImages>("front");

  const [width, setWidth] = useState(28);
  const [height, setHeight] = useState(36);
  const [depth, setDepth] = useState(11);
  const [rotationY, setRotationY] = useState(-22);

  const [boxColor, setBoxColor] =
    useState("#f5f5f5");

  const [backgroundColor, setBackgroundColor] =
    useState("#111111");

  // ============================================================
  // DESIGN PERSISTENCE
  // ============================================================

  const [designId, setDesignId] =
    useState<string | null>(null);

  const [designLoading, setDesignLoading] =
    useState(true);

  const [designSaving, setDesignSaving] =
    useState(false);

  // ============================================================
  // SUBSCRIPTION
  // ============================================================

  const [active, setActive] = useState(false);
  const [checking, setChecking] = useState(true);
  const [exporting, setExporting] = useState(false);

  // ============================================================
  // CANVAS
  // ============================================================

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  // ============================================================
  // KEEP LATEST FACE IMAGES FOR CLEANUP
  // ============================================================

  const faceImagesRef =
    useRef<FaceImages>(EMPTY_FACES);

  useEffect(() => {
    faceImagesRef.current = faceImages;
  }, [faceImages]);

  // ============================================================
  // LOAD SAVED DESIGN
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadSavedDesign() {
      try {
        setDesignLoading(true);

        const response = await fetch("/api/design", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log(
              "User is not authenticated."
            );
          } else {
            console.error(
              "LOAD DESIGN FAILED:",
              await response.text()
            );
          }

          return;
        }

        const data = await response.json();

        if (cancelled || !data.design) {
          return;
        }

        const design = data.design;

        // --------------------------------------------------------
        // DESIGN ID
        // --------------------------------------------------------

        setDesignId(
          typeof design.id === "string"
            ? design.id
            : null
        );

        // --------------------------------------------------------
        // FACE IMAGES
        // --------------------------------------------------------

        setFaceImages({
          front: design.front ?? null,
          back: design.back ?? null,
          left: design.left_face ?? null,
          right: design.right_face ?? null,
          top: design.top_face ?? null,
          bottom: design.bottom_face ?? null,
        });

        // --------------------------------------------------------
        // DIMENSIONS
        // --------------------------------------------------------

        setWidth(
          Number.isFinite(Number(design.width))
            ? Number(design.width)
            : 28
        );

        setHeight(
          Number.isFinite(Number(design.height))
            ? Number(design.height)
            : 36
        );

        setDepth(
          Number.isFinite(Number(design.depth))
            ? Number(design.depth)
            : 11
        );

        // --------------------------------------------------------
        // ROTATION
        // --------------------------------------------------------

        setRotationY(
          Number.isFinite(
            Number(design.rotation_y)
          )
            ? Number(design.rotation_y)
            : -22
        );

        // --------------------------------------------------------
        // COLORS
        // --------------------------------------------------------

        setBoxColor(
          typeof design.box_color === "string"
            ? design.box_color
            : "#f5f5f5"
        );

        setBackgroundColor(
          typeof design.background_color ===
            "string"
            ? design.background_color
            : "#111111"
        );

        // --------------------------------------------------------
        // SELECTED FACE
        // --------------------------------------------------------

        const savedFace =
          design.selected_face;

        if (
          savedFace === "front" ||
          savedFace === "back" ||
          savedFace === "left" ||
          savedFace === "right" ||
          savedFace === "top" ||
          savedFace === "bottom"
        ) {
          setSelectedFace(savedFace);
        } else {
          setSelectedFace("front");
        }
      } catch (error) {
        console.error(
          "LOAD SAVED DESIGN ERROR:",
          error
        );
      } finally {
        if (!cancelled) {
          setDesignLoading(false);
        }
      }
    }

    loadSavedDesign();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // AUTOSAVE
  // ============================================================

  useEffect(() => {
    /*
     * Important:
     * Do not save while the existing design is being loaded.
     * Otherwise the default state could overwrite the database.
     */

    if (designLoading) {
      return;
    }

    const timer = window.setTimeout(
      async () => {
        try {
          setDesignSaving(true);

          const response = await fetch(
            "/api/design",
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                id: designId,

                faceImages,

                width,
                height,
                depth,

                rotationY,

                boxColor,
                backgroundColor,

                selectedFace,
              }),
            }
          );

          if (!response.ok) {
            console.error(
              "DESIGN SAVE FAILED:",
              await response.text()
            );

            return;
          }

          const data = await response.json();

          /*
           * First save creates a design ID.
           */

          if (
            data.id &&
            !designId
          ) {
            setDesignId(data.id);
          }
        } catch (error) {
          console.error(
            "AUTOSAVE DESIGN ERROR:",
            error
          );
        } finally {
          setDesignSaving(false);
        }
      },
      800
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    designLoading,
    designId,
    faceImages,
    width,
    height,
    depth,
    rotationY,
    boxColor,
    backgroundColor,
    selectedFace,
  ]);

  // ============================================================
  // CHECK POLAR SUBSCRIPTION
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function checkSubscription() {
      try {
        setChecking(true);

        const response = await fetch(
          "/api/subscription",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setActive(false);
          }

          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setActive(Boolean(data.active));
        }
      } catch (error) {
        console.error(
          "SUBSCRIPTION CHECK ERROR:",
          error
        );

        if (!cancelled) {
          setActive(false);
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // CLEANUP OBJECT URLS
  // ============================================================

  useEffect(() => {
    return () => {
      const urls = new Set(
        Object.values(
          faceImagesRef.current
        ).filter(
          (url): url is string =>
            Boolean(url)
        )
      );

      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  // ============================================================
  // UPLOAD FACE
  // ============================================================

  function uploadFace(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      alert(
        "Please choose an image file."
      );

      event.target.value = "";

      return;
    }

    const oldUrl =
      faceImages[selectedFace];

    const url =
      URL.createObjectURL(file);

    setFaceImages((current) => ({
      ...current,
      [selectedFace]: url,
    }));

    /*
     * Revoke the previous image URL
     * if it isn't being used by another face.
     */

    if (oldUrl) {
      const isUsedElsewhere =
        Object.entries(
          faceImages
        ).some(
          ([key, existingUrl]) =>
            key !== selectedFace &&
            existingUrl === oldUrl
        );

      if (!isUsedElsewhere) {
        URL.revokeObjectURL(oldUrl);
      }
    }

    event.target.value = "";
  }

  // ============================================================
  // CLEAR FACE
  // ============================================================

  function clearFace(
    face: keyof FaceImages =
      selectedFace
  ) {
    const current =
      faceImages[face];

    setFaceImages((previous) => ({
      ...previous,
      [face]: null,
    }));

    if (
      current &&
      !Object.entries(
        faceImages
      ).some(
        ([key, url]) =>
          key !== face &&
          url === current
      )
    ) {
      URL.revokeObjectURL(current);
    }
  }

  // ============================================================
  // APPLY ARTWORK TO ALL FACES
  // ============================================================

  async function applyToAllFaces() {
    const source =
      faceImages[selectedFace];

    if (!source) {
      alert(
        `Upload artwork to the ${selectedFace} face first.`
      );

      return;
    }

    try {
      const response =
        await fetch(source);

      const blob =
        await response.blob();

      const next: FaceImages = {
        ...faceImages,
      };

      const oldUrls =
        new Set<string>();

      FACES.forEach(
        ({ key }) => {
          if (
            key === selectedFace
          ) {
            return;
          }

          if (next[key]) {
            oldUrls.add(
              next[key]!
            );
          }

          next[key] =
            URL.createObjectURL(
              blob
            );
        }
      );

      setFaceImages(next);

      const remaining =
        new Set(
          Object.values(
            next
          ).filter(
            (
              url
            ): url is string =>
              Boolean(url)
          )
        );

      oldUrls.forEach(
        (url) => {
          if (
            !remaining.has(url)
          ) {
            URL.revokeObjectURL(
              url
            );
          }
        }
      );
    } catch (error) {
      console.error(
        "APPLY ARTWORK ERROR:",
        error
      );

      alert(
        "Unable to copy the selected artwork to all faces."
      );
    }
  }

  // ============================================================
  // RESET
  // ============================================================

  function reset() {
    const urls = new Set(
      Object.values(
        faceImages
      ).filter(
        (url): url is string =>
          Boolean(url)
      )
    );

    urls.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setFaceImages({
      ...EMPTY_FACES,
    });

    setSelectedFace("front");

    setWidth(28);
    setHeight(36);
    setDepth(11);
    setRotationY(-22);

    setBoxColor("#f5f5f5");
    setBackgroundColor("#111111");
  }

  // ============================================================
  // EXPORT PNG
  // ============================================================

  async function exportPng() {
    if (!active) {
      window.location.href =
        "/pricing";

      return;
    }

    if (!canvasRef.current) {
      return;
    }

    setExporting(true);

    try {
      await new Promise(
        (resolve) =>
          requestAnimationFrame(
            () => resolve(null)
          )
      );

      const dataUrl =
        canvasRef.current.toDataURL(
          "image/png"
        );

      const link =
        document.createElement(
          "a"
        );

      link.download =
        `revabox-${Date.now()}.png`;

      link.href = dataUrl;

      link.click();
    } catch (error) {
      console.error(
        "PNG EXPORT ERROR:",
        error
      );

      alert(
        "Unable to export the PNG. Please try again."
      );
    } finally {
      setExporting(false);
    }
  }

  // ============================================================
  // CURRENT FACE
  // ============================================================

  const currentFace =
    FACES.find(
      (face) =>
        face.key === selectedFace
    )!;

  const currentImage =
    faceImages[selectedFace];

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-white/45">
            Welcome, {userName}
          </p>

          <h1 className="mt-1 text-2xl font-black">
            RevaBox Shot Editor
          </h1>

          <p className="mt-1 text-sm text-white/45">
            Design every side of your package
            in one 3D workspace.
          </p>

          {/* SAVE STATUS */}

          {designLoading ? (
            <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading saved design...
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
              <span
                className={`h-2 w-2 rounded-full ${
                  designSaving
                    ? "animate-pulse bg-yellow-400"
                    : "bg-green-400"
                }`}
              />

              {designSaving
                ? "Saving..."
                : "Design saved"}
            </div>
          )}
        </div>

        {/* HEADER ACTIONS */}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <button
            type="button"
            onClick={exportPng}
            disabled={
              exporting ||
              checking ||
              designLoading
            }
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}

            {active
              ? "Download PNG"
              : "Unlock PNG export"}
          </button>
        </div>
      </div>

      {/* ========================================================
          WORKSPACE
      ======================================================== */}

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        {/* ======================================================
            3D PREVIEW
        ====================================================== */}

        <section className="glass relative min-h-[620px] overflow-hidden rounded-3xl">
          <div className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white/60 backdrop-blur">
            Drag to rotate · scroll to zoom · edit
            every face
          </div>

          <BoxScene
            faceImages={faceImages}
            width={width}
            height={height}
            depth={depth}
            boxColor={boxColor}
            backgroundColor={
              backgroundColor
            }
            rotationY={rotationY}
            onCanvasReady={(canvas) => {
              canvasRef.current =
                canvas;
            }}
          />
        </section>

        {/* ======================================================
            SIDEBAR
        ====================================================== */}

        <aside className="glass rounded-3xl p-5">
          {/* ====================================================
              SIDEBAR HEADER
          ==================================================== */}

          <div className="mb-5 flex items-center gap-2">
            <Settings2 className="h-5 w-5" />

            <div>
              <h2 className="font-bold">
                Package controls
              </h2>

              <p className="text-xs text-white/40">
                Configure all six box faces
              </p>
            </div>
          </div>

          {/* ====================================================
              SIX FACE SELECTOR
          ==================================================== */}

          <div className="mb-5 grid grid-cols-3 gap-2">
            {FACES.map((face) => {
              const selected =
                selectedFace ===
                face.key;

              const hasImage =
                Boolean(
                  faceImages[
                    face.key
                  ]
                );

              return (
                <button
                  key={face.key}
                  type="button"
                  onClick={() =>
                    setSelectedFace(
                      face.key
                    )
                  }
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
                    {hasImage
                      ? "Artwork added"
                      : "Empty"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ====================================================
              ARTWORK PANEL
          ==================================================== */}

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

            {/* UPLOAD */}

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
                onChange={
                  uploadFace
                }
              />
            </label>

            {/* ACTIONS */}

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  clearFace()
                }
                disabled={!currentImage}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear face
              </button>

              <button
                type="button"
                onClick={
                  applyToAllFaces
                }
                disabled={!currentImage}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-30"
              >
                Apply to all
              </button>
            </div>
          </div>

          {/* ====================================================
              DIMENSIONS
          ==================================================== */}

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

          {/* ====================================================
              COLORS
          ==================================================== */}

          <div className="mt-7 grid grid-cols-2 gap-3">
            <ColorControl
              label="Box"
              value={boxColor}
              onChange={
                setBoxColor
              }
            />

            <ColorControl
              label="Background"
              value={
                backgroundColor
              }
              onChange={
                setBackgroundColor
              }
            />
          </div>

          {/* ====================================================
              SUBSCRIPTION STATUS
          ==================================================== */}

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

            {!active &&
              !checking && (
                <a
                  href="/pricing"
                  className="mt-3 inline-block text-sm font-semibold text-violet-200 underline underline-offset-4"
                >
                  View subscription
                </a>
              )}
          </div>

          {/* ====================================================
              POLAR CUSTOMER PORTAL
          ==================================================== */}

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

// ================================================================
// RANGE COMPONENT
// ================================================================

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
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-white/60">
          {label}
        </span>

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
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="w-full accent-violet-400"
      />
    </label>
  );
}

// ================================================================
// COLOR CONTROL COMPONENT
// ================================================================

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label className="rounded-xl border border-white/10 bg-white/5 p-3">
      <span className="block text-xs text-white/50">
        {label}
      </span>

      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent"
        />

        <span className="font-mono text-xs">
          {value}
        </span>
      </div>
    </label>
  );
}