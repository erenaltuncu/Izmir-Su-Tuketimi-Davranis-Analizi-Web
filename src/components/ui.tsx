import { motion } from "framer-motion";
import clsx from "clsx";
import type { PropsWithChildren } from "react";

export function Container({ children }: PropsWithChildren) {
  return <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

export function Section({
  id,
  title,
  subtitle,
  children
}: PropsWithChildren<{ id: string; title: string; subtitle?: string }>) {
  return (
    <section id={id} className="py-16 sm:py-20">
      <Container>
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-2 max-w-3xl text-sm text-slate-300 sm:text-base">{subtitle}</p>}
        </div>
        {children}
      </Container>
    </section>
  );
}

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_8px_30px_rgba(2,6,23,0.45)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

export function FadeIn({ children, delay = 0 }: PropsWithChildren<{ delay?: number }>) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay }} viewport={{ once: true }}>
      {children}
    </motion.div>
  );
}
