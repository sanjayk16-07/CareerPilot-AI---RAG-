import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";

export function HomePage() {
  return (
    <section className="grid w-full gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm text-muted-foreground">
          <Compass className="h-4 w-4" />
          SaaS foundation
        </div>
        <div className="space-y-4">
          <BrandLogo surface="light" className="h-20 w-auto max-w-[420px]" />
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
            {env.appName}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            A clean React and FastAPI foundation for building AI-powered career
            workflows with strong boundaries from day one.
          </p>
        </div>
        <Button type="button">Architecture Ready</Button>
      </motion.div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 flex justify-center border-b pb-6">
          <BrandLogo surface="light" className="h-14 w-auto max-w-[260px]" />
        </div>
        <div className="grid gap-3 text-sm">
          {["React 19", "FastAPI", "SQLAlchemy", "LangChain", "ChromaDB", "Gemini API"].map(
            (item) => (
              <div key={item} className="rounded-md bg-muted px-3 py-2 text-muted-foreground">
                {item}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
