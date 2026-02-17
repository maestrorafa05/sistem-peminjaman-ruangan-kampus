import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ForbiddenPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/20 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldX className="h-5 w-5 text-destructive" />
            Akses ditolak
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Akun Anda tidak memiliki hak akses untuk membuka halaman ini.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/">Kembali ke beranda</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login">Login ulang</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
