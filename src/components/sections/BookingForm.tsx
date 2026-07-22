"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Phone, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button, LinkButton } from "@/components/ui/Button";
import { useLanguage } from "@/i18n/LanguageContext";
import { siteConfig } from "@/config/site";
import { telLink, whatsappLink } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

const durationKeyMap: Record<(typeof siteConfig.stayDurations)[number]["id"], "1m" | "2to3m" | "4to6m" | "6mplus"> = {
  "1m": "1m",
  "2-3m": "2to3m",
  "4-6m": "4to6m",
  "6m+": "6mplus",
};

export function BookingForm() {
  const { dict } = useLanguage();
  const [status, setStatus] = useState<Status>("idle");
  const [availability, setAvailability] = useState(siteConfig.availability);

  useEffect(() => {
    fetch("/api/availability")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setAvailability(data);
      })
      .catch(() => {
        // keep the siteConfig default if the request fails
      });
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus("submitting");

    const form = new FormData(formEl);
    const payload = {
      moveInDate: form.get("moveInDate"),
      duration: form.get("duration"),
      guests: Number(form.get("guests")),
      firstName: form.get("firstName"),
      phone: form.get("phone"),
      email: form.get("email"),
      note: form.get("note"),
    };

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      formEl.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="booking" className="bg-cream py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            eyebrow={dict.booking.eyebrow}
            title={dict.booking.title}
            subtitle={dict.booking.subtitle}
          />

          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex items-start gap-3 rounded-2xl bg-olive-dark/10 p-6 text-olive-dark"
            >
              <CheckCircle2 className="mt-0.5 shrink-0" size={24} />
              <p className="text-base font-medium leading-relaxed">{dict.booking.success}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
              <Field label={dict.booking.fields.moveInDate}>
                <input type="date" name="moveInDate" required className={inputClass} />
              </Field>

              <Field label={dict.booking.fields.duration}>
                <select name="duration" required defaultValue="" className={inputClass}>
                  <option value="" disabled>
                    —
                  </option>
                  {siteConfig.stayDurations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {dict.booking.durations[durationKeyMap[d.id]]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={dict.booking.fields.guests}>
                <input
                  type="number"
                  name="guests"
                  min={1}
                  max={siteConfig.capacity.totalSpots}
                  defaultValue={1}
                  required
                  className={inputClass}
                />
              </Field>

              <Field label={dict.booking.fields.firstName}>
                <input type="text" name="firstName" required className={inputClass} />
              </Field>

              <Field label={dict.booking.fields.phone}>
                <input type="tel" name="phone" required className={inputClass} />
              </Field>

              <Field label={dict.booking.fields.email}>
                <input type="email" name="email" required className={inputClass} />
              </Field>

              <Field label={dict.booking.fields.note} className="sm:col-span-2">
                <textarea
                  name="note"
                  rows={3}
                  placeholder={dict.booking.fields.notePlaceholder}
                  className={inputClass}
                />
              </Field>

              <div className="sm:col-span-2">
                <Button type="submit" disabled={status === "submitting"} className="w-full sm:w-auto">
                  {status === "submitting" ? dict.booking.fields.submitting : dict.booking.fields.submit}
                </Button>
                {status === "error" && <p className="mt-3 text-sm text-red-700">{dict.booking.error}</p>}
              </div>
            </form>
          )}
        </div>

        <div className="flex flex-col justify-center gap-4 rounded-3xl bg-beige/40 p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">
            {dict.booking.quickActions}
          </p>
          <LinkButton href={telLink(siteConfig.contact.phone)} variant="outline" className="w-full">
            <Phone size={18} /> {dict.booking.callUs}
          </LinkButton>
          <LinkButton
            href={whatsappLink(siteConfig.contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className="w-full"
          >
            <MessageCircle size={18} /> {dict.booking.whatsappUs}
          </LinkButton>

          {availability.hasFreeSpots && (
            <p className="mt-2 text-center text-sm text-olive-dark">
              {dict.booking.availabilityLabel}: {availability.freeSpots} / {siteConfig.capacity.totalSpots}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-olive-dark focus:outline-none focus:ring-2 focus:ring-olive-dark/20";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</span>
      {children}
    </label>
  );
}
