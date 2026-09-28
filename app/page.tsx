import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  Check,
  Download,
  Image as ImageIcon,
  Layers3,
  MousePointer2,
  Palette,
  Rotate3D,
  ShieldCheck,
  Sparkles,
  Upload,
  WandSparkles,
  Zap,
} from "lucide-react";

const features = [
  { title: "Interactive 3D preview", description: "Rotate, zoom and inspect your package from every angle while you design.", icon: Rotate3D },
  { title: "Instant artwork mapping", description: "Upload PNG, JPG or WebP artwork and see it placed on the front of your box immediately.", icon: ImageIcon },
  { title: "Flexible dimensions", description: "Tune width, height and depth to match the product or digital mockup you need.", icon: Layers3 },
  { title: "Visual styling controls", description: "Change box and scene colors to create a presentation that fits your brand.", icon: Palette },
  { title: "Fast browser workflow", description: "No desktop design software or complicated 3D setup. Everything happens in the browser.", icon: Zap },
  { title: "High-quality PNG export", description: "Turn your finished scene into a downloadable PNG when your Pro subscription is active.", icon: Download },
];

const steps = [
  { number: "01", title: "Upload your artwork", description: "Bring your cover, product label or front design into the editor with a simple drag-and-drop style upload.", icon: Upload },
  { number: "02", title: "Shape the box", description: "Adjust dimensions, rotation, box color and background until the mockup looks exactly how you want.", icon: MousePointer2 },
  { number: "03", title: "Export and use it", description: "Preview the final composition and download your PNG for landing pages, stores, presentations or social content.", icon: Download },
];

function AppPreview({ variant = "editor" }: { variant?: "editor" | "dashboard" }) {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="absolute -inset-8 rounded-[3rem] bg-violet-500/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0b0d] shadow-2xl shadow-black/40">
        <div className="flex h-11 items-center gap-2 border-b border-white/10 bg-white/[0.025] px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <div className="ml-4 h-6 flex-1 rounded-md border border-white/5 bg-black/30" />
        </div>
        {variant === "editor" ? (
          <div className="grid min-h-[430px] lg:grid-cols-[1fr_250px]">
            <div className="grid-bg relative flex items-center justify-center overflow-hidden p-8">
              <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[10px] text-white/50">3D PREVIEW</div>
              <div className="relative h-64 w-48 rotate-[-8deg] rounded-[10px] border border-black/30 bg-gradient-to-br from-white via-slate-200 to-slate-400 shadow-[30px_30px_60px_rgba(0,0,0,.5)] sm:h-72 sm:w-52">
                <div className="absolute inset-3 flex flex-col justify-between rounded-md bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-400 p-4 text-white shadow-inner">
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.2em]"><span>BOXSHOT</span><Box className="h-3 w-3" /></div>
                  <div><p className="text-2xl font-black leading-none sm:text-3xl">YOUR<br />PRODUCT</p><p className="mt-2 text-[9px] text-white/70">Create. Preview. Launch.</p></div>
                  <div className="h-1.5 w-12 rounded-full bg-white/60" />
                </div>
              </div>
              <div className="absolute bottom-7 left-1/2 h-8 w-52 -translate-x-1/2 rounded-[50%] bg-black/40 blur-xl" />
            </div>
            <div className="border-t border-white/10 bg-white/[0.02] p-5 lg:border-l lg:border-t-0">
              <div className="mb-5 flex items-center gap-2"><SettingsMini /><span className="text-xs font-bold">Controls</span></div>
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center"><Upload className="mx-auto h-5 w-5 text-white/60" /><p className="mt-2 text-[10px] text-white/60">Upload PNG / JPG</p></div>
              {[["Width", "28 cm"], ["Height", "36 cm"], ["Depth", "11 cm"], ["Rotation", "-22°"]].map(([a,b]) => <div key={a} className="mt-5"><div className="mb-2 flex justify-between text-[10px] text-white/50"><span>{a}</span><span>{b}</span></div><div className="h-1.5 rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-white/70" /></div></div>)}
              <div className="mt-6 grid grid-cols-2 gap-2"><div className="rounded-lg border border-white/10 p-2"><div className="h-4 w-4 rounded bg-white" /><span className="mt-1 block text-[8px] text-white/40">Box color</span></div><div className="rounded-lg border border-white/10 p-2"><div className="h-4 w-4 rounded bg-slate-800" /><span className="mt-1 block text-[8px] text-white/40">Background</span></div></div>
            </div>
          </div>
        ) : (
          <div className="min-h-[430px] p-6 sm:p-8">
            <div className="flex items-end justify-between"><div><div className="h-3 w-28 rounded bg-white/20" /><div className="mt-2 h-2 w-44 rounded bg-white/10" /></div><div className="h-8 w-24 rounded-lg bg-white/10" /></div>
            <div className="mt-7 grid gap-4 sm:grid-cols-3"><div className="h-44 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/20 to-white/[0.02] p-5"><div className="h-24 w-16 rounded-lg bg-gradient-to-br from-white to-slate-400 shadow-xl" /><div className="mt-5 h-2 w-20 rounded bg-white/20" /><div className="mt-2 h-2 w-28 rounded bg-white/10" /></div><div className="h-44 rounded-2xl border border-white/10 bg-white/[0.02] p-5"><div className="h-24 w-16 rounded-lg bg-gradient-to-br from-fuchsia-400 to-violet-700 shadow-xl" /><div className="mt-5 h-2 w-20 rounded bg-white/20" /><div className="mt-2 h-2 w-28 rounded bg-white/10" /></div><div className="h-44 rounded-2xl border border-white/10 bg-white/[0.02] p-5"><div className="h-24 w-16 rounded-lg bg-gradient-to-br from-cyan-300 to-blue-700 shadow-xl" /><div className="mt-5 h-2 w-20 rounded bg-white/20" /><div className="mt-2 h-2 w-28 rounded bg-white/10" /></div></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[1.5fr_1fr]"><div className="h-28 rounded-2xl border border-white/10 bg-white/[0.02]" /><div className="h-28 rounded-2xl border border-white/10 bg-white/[0.02]" /></div>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsMini() { return <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10"><Sparkles className="h-3 w-3" /></span>; }

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <section className="grid-bg relative border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/60"><Sparkles className="h-4 w-4 text-violet-300" /> 3D product mockups, made simple</div>
            <h1 className="text-5xl font-black tracking-[-0.04em] sm:text-7xl lg:text-8xl">Turn your artwork into a <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">3D box shot.</span></h1>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">BoxShot Studio gives creators, marketers and digital product builders a fast way to transform flat artwork into convincing 3D packaging visuals—right in the browser.</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/editor" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-black transition hover:-translate-y-0.5 hover:bg-white/90">Start creating <ArrowRight className="h-4 w-4" /></Link><Link href="/pricing" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold transition hover:bg-white/10">Explore Pro</Link></div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/35"><span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Browser based</span><span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Live 3D controls</span><span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> PNG export</span></div>
          </div>
          <div className="mt-16 sm:mt-20"><Image src="/editor-preview.svg" alt="BoxShot Studio 3D editor preview" width={1200} height={760} className="relative mx-auto w-full max-w-5xl rounded-[1.5rem] border border-white/10 shadow-2xl shadow-black/40" priority /></div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-white/[0.015]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-3"><Stat value="3D" label="Real-time product preview" /><Stat value="PNG" label="Export-ready image format" /><Stat value="100%" label="Browser-based workflow" /></div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">Everything you need</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">A lightweight mockup studio built around speed.</h2><p className="mt-5 leading-8 text-white/50">Skip the complicated setup. BoxShot Studio focuses on the handful of controls that make a product mockup look polished, while keeping the workflow approachable.</p></div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(({ title, description, icon: Icon }) => <div key={title} className="glass group rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 transition group-hover:bg-violet-400/15"><Icon className="h-5 w-5" /></div><h3 className="mt-6 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-7 text-white/45">{description}</p></div>)}</div>
      </section>

      <section className="border-y border-white/5 bg-gradient-to-b from-violet-500/[0.04] to-transparent">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-[0.85fr_1.15fr] sm:py-32">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">See the workflow</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">From flat artwork to a product scene in minutes.</h2><p className="mt-5 leading-8 text-white/50">The editor keeps your creative decisions visible. Upload the front artwork, tune the package and preview the result as you work.</p><Link href="/editor" className="mt-8 inline-flex items-center gap-2 font-semibold text-white hover:text-violet-200">Open the editor <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="relative"><Image src="/dashboard-preview.svg" alt="BoxShot Studio workspace preview" width={1200} height={760} className="relative mx-auto w-full rounded-[1.5rem] border border-white/10 shadow-2xl shadow-black/40" /></div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div className="text-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">How it works</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Three simple steps.</h2><p className="mx-auto mt-5 max-w-2xl leading-7 text-white/50">A focused workflow for getting from your design file to a usable product visual without a long learning curve.</p></div>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">{steps.map(({ number, title, description, icon: Icon }) => <div key={number} className="relative rounded-3xl border border-white/10 bg-white/[0.025] p-7"><div className="flex items-center justify-between"><span className="text-sm font-black text-white/25">{number}</span><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"><Icon className="h-5 w-5" /></div></div><h3 className="mt-10 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-white/45">{description}</p></div>)}</div>
      </section>

      <section className="px-6 pb-24 sm:pb-32"><div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/15 via-white/[0.04] to-cyan-400/10 p-8 sm:p-12 lg:p-16"><div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]"><div><div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"><WandSparkles className="h-5 w-5" /></div><h2 className="text-3xl font-black tracking-tight sm:text-4xl">Ready to build your next box shot?</h2><p className="mt-4 max-w-xl leading-7 text-white/50">Create a polished 3D preview, explore the controls and unlock PNG downloads with BoxShot Pro.</p></div><Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-black hover:bg-white/90">Create your account <ArrowRight className="h-4 w-4" /></Link></div></div></section>

      <footer className="border-t border-white/10 bg-black/30">
        <div className="mx-auto max-w-7xl px-6 py-14"><div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]"><div><Link href="/" className="inline-flex items-center gap-2 font-bold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black"><Box className="h-5 w-5" /></span>BoxShot Studio</Link><p className="mt-5 max-w-sm text-sm leading-7 text-white/40">A simple browser-based 3D box mockup tool for creators and digital product teams.</p></div><FooterColumn title="Product" links={[["Editor", "/editor"], ["Pricing", "/pricing"], ["Sign up", "/signup"]]} /><FooterColumn title="Workflow" links={[["Features", "#features"], ["How it works", "#how-it-works"], ["Start creating", "/editor"]]} /><FooterColumn title="Account" links={[["Sign in", "/login"], ["Create account", "/signup"], ["Pro plan", "/pricing"]]} /></div><div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/30 sm:flex-row"><span>© {new Date().getFullYear()} BoxShot Studio. All rights reserved.</span><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secure account and subscription flow</span></div></div>
      </footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) { return <div className="text-center sm:text-left"><div className="text-2xl font-black">{value}</div><div className="mt-1 text-sm text-white/35">{label}</div></div>; }
function FooterColumn({ title, links }: { title: string; links: [string, string][] }) { return <div><h3 className="text-sm font-bold">{title}</h3><div className="mt-4 flex flex-col gap-3">{links.map(([label, href]) => <Link key={label} href={href} className="text-sm text-white/40 hover:text-white">{label}</Link>)}</div></div>; }
