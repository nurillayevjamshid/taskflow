import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  KanbanSquare,
  MessagesSquare,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

const FEATURES = [
  {
    icon: KanbanSquare,
    title: "Kanban doskalar",
    desc: "Ustun va kartalar bilan ishingizni ko'z oldingizda mukammal tashkil qiling.",
  },
  {
    icon: Users,
    title: "Jamoa bilan ishlash",
    desc: "A'zolarni taklif qiling, kartalarga biriktiring va vazifalarni aniq taqsimlang.",
  },
  {
    icon: MessagesSquare,
    title: "Izoh va muhokama",
    desc: "Har bir kartada kontekst, fayl, muhokama va eslatmalarni bir joyda saqlang.",
  },
  {
    icon: Zap,
    title: "Tezkor drag & drop",
    desc: "Kartalar va ustunlarni sekundlar ichida qayta tartibga soling.",
  },
  {
    icon: Shield,
    title: "Maxfiy va xavfsiz",
    desc: "Ma'lumotlar brauzeringizda, faqat siz ko'rasiz. Supabase-ga o'tish oson.",
  },
  {
    icon: Sparkles,
    title: "Premium dizayn",
    desc: "Ko'z charchatmaydigan, sodda, ammo estetik va ishonch uyg'otadigan interfeys.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-aurora opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />

      <AppHeader transparent sticky />

      <main className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <section className="py-20 sm:py-28 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="inline-flex size-1.5 rounded-full bg-primary" />
              Jamoangiz uchun yangi ish tajribasi
            </div>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Vazifalaringizni{" "}
              <span className="text-gradient">oson boshqaring</span>.
              <br className="hidden md:block" /> Jamoa bilan{" "}
              <span className="text-gradient">bir maromda</span> harakat qiling.
            </h1>
            <p className="mt-6 text-pretty text-base text-muted-foreground sm:text-lg">
              Taskly — bu Trello va Atlassian uslubidagi doska va kartalar
              yordamida loyihalarni tartibga soluvchi zamonaviy ish maydoni.
              Tez, chiroyli va premium.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                render={<Link href="/register" />}
                nativeButton={false}
                size="lg"
                className="min-w-44"
              >
                Bepul boshlash
                <ArrowRight className="size-4" />
              </Button>
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                size="lg"
                variant="outline"
                className="min-w-44"
              >
                Akkauntga kirish
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" /> Bepul demo rejim
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" /> Cheklanmagan
                doskalar
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" /> Kart to&apos;lovi
                shart emas
              </span>
            </div>
          </div>

          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-gradient-to-r from-primary/30 via-fuchsia-500/30 to-cyan-400/30 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur shadow-premium">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2">
                <span className="size-2.5 rounded-full bg-red-400/80" />
                <span className="size-2.5 rounded-full bg-amber-400/80" />
                <span className="size-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-xs text-muted-foreground">
                  taskly.uz / b / marketing-launch
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 p-4 sm:gap-4 sm:p-6">
                {[
                  {
                    title: "Rejada",
                    items: ["Hero dizayni", "Copywriting", "Video scenariysi"],
                    color: "from-violet-500/20 to-fuchsia-500/10",
                  },
                  {
                    title: "Jarayonda",
                    items: ["Landing sahifasi", "API integratsiyasi"],
                    color: "from-sky-500/20 to-cyan-500/10",
                  },
                  {
                    title: "Bajarildi",
                    items: ["Brend kitobi", "Analitika setup"],
                    color: "from-emerald-500/20 to-lime-500/10",
                  },
                ].map((col) => (
                  <div
                    key={col.title}
                    className="rounded-2xl border border-border/70 bg-background/60 p-3"
                  >
                    <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>{col.title}</span>
                      <span>{col.items.length}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {col.items.map((it) => (
                        <div
                          key={it}
                          className={`rounded-xl border border-border/70 bg-gradient-to-br ${col.color} p-3 text-sm`}
                        >
                          {it}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Nimani <span className="text-gradient">afzal ko&apos;rasiz</span>?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Oddiy dizayn, kuchli imkoniyatlar. Hech qanday keraksiz narsa yo&apos;q.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5 backdrop-blur transition hover:border-primary/40 hover:shadow-premium"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-fuchsia-500/10 text-primary">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="my-16 sm:my-24">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-background to-fuchsia-500/10 p-8 sm:p-12">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Bugun jamoangizga tartib olib keling
              </h2>
              <p className="mt-3 text-muted-foreground">
                Bir daqiqada ro&apos;yxatdan o&apos;ting va birinchi doskangizni
                yarating.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <Button
                  render={<Link href="/register" />}
                  nativeButton={false}
                  size="lg"
                >
                  Bepul boshlash <ArrowRight className="size-4" />
                </Button>
                <Button
                  render={<Link href="/login" />}
                  nativeButton={false}
                  size="lg"
                  variant="outline"
                >
                  Akkauntga kirish
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Taskly. Hamma huquqlar himoyalangan.
          </p>
        </div>
      </footer>
    </div>
  );
}
