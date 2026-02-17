import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DoorOpen, LogIn, ShieldCheck } from "lucide-react";

import { useAuth } from "@/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  nrp: z.string().trim().min(1, "NRP wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginValues = z.infer<typeof loginSchema>;

type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isBootstrapping, login } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nrp: "",
      password: "",
    },
  });

  React.useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isBootstrapping, navigate]);

  async function handleSubmit(values: LoginValues) {
    setServerError(null);
    try {
      await login(values);
      const state = location.state as LoginLocationState | null;
      const from = state?.from?.pathname;
      const target = from && from !== "/login" ? from : "/";
      navigate(target, { replace: true });
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.response?.data || e?.message || "Login gagal";
      setServerError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-[radial-gradient(1100px_500px_at_0%_0%,hsl(var(--primary)/0.15),transparent),linear-gradient(to_bottom_right,hsl(var(--background)),hsl(var(--muted)/0.25))]">
      <div className="mx-auto grid h-full w-full max-w-6xl items-center gap-6 px-4 py-4 md:px-6 md:py-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="hidden border-none bg-transparent shadow-none lg:block">
          <CardContent className="flex h-full flex-col justify-between rounded-3xl border bg-background/60 p-10 backdrop-blur">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                <DoorOpen className="h-3.5 w-3.5" />
                PARAS - Sistem Peminjaman Ruangan Kampus
              </div>
              <p className="max-w-xl text-sm text-muted-foreground">
                Akses PARAS dengan akun kampus Anda.
              </p>
              <h1 className="max-w-xl text-4xl font-semibold leading-tight">
                Pinjam Ruangan Jadi Lebih Mudah
              </h1>
              <p className="max-w-lg text-sm text-muted-foreground">
                Masuk dengan NRP untuk mulai mengajukan peminjaman atau melihat ketersediaan ruangan kampus.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-md justify-self-center border-0 bg-background/95 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Masuk ke PARAS</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="nrp">NRP</Label>
                <Input id="nrp" placeholder="Masukkan NRP" autoComplete="username" {...form.register("nrp")} />
                {form.formState.errors.nrp && (
                  <p className="text-sm text-destructive">{form.formState.errors.nrp.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>

              {serverError && <p className="text-sm text-destructive">{serverError}</p>}

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                <LogIn className="h-4 w-4" />
                {form.formState.isSubmitting ? "Masuk..." : "Login"}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Akses role tidak sesuai? Hubungi admin sistem.
              {" "}
              <Link to="/" className="underline underline-offset-4">
                Coba buka beranda
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
