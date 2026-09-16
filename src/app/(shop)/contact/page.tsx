import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { InfoHeader } from "@/components/pages/InfoHeader";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us — UniShop",
  description:
    "Get in touch with the UniShop team — email, phone, WhatsApp, or our campus support desk.",
};

const contactMethods = [
  {
    icon: Mail,
    title: "Email us",
    text: "support@unishop.app",
    note: "We reply within 24 hours on weekdays.",
  },
  {
    icon: Phone,
    title: "Call us",
    text: "+233 000 000 000",
    note: "Mon–Fri, 9am–5pm GMT.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    text: "+233 000 000 000",
    note: "Fastest way to reach support.",
  },
  {
    icon: MapPin,
    title: "Campus desk",
    text: "Student Support Office",
    note: "Accra Campus, main library block.",
  },
];

export default function ContactPage() {
  return (
    <>
      <InfoHeader
        icon={<Mail className="size-6" />}
        title="Contact Us"
        subtitle="We are here to help you shop, sell, or sort out an order. Reach us on any channel below."
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          {/* Contact methods */}
          <div className="grid grid-cols-1 gap-4 self-start sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="rounded-2xl bg-card p-6 ring-1 ring-border"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <method.icon className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-semibold">{method.title}</h2>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {method.text}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {method.note}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl bg-muted/50 p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <Clock className="size-4 text-primary" />
                Support hours
              </h2>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li className="flex justify-between">
                  <span>Monday – Friday</span>
                  <span className="font-medium text-foreground">9am – 5pm</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium text-foreground">10am – 2pm</span>
                </li>
                <li className="flex justify-between">
                  <span>Sundays &amp; holidays</span>
                  <span className="font-medium text-foreground">Closed</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-card p-6 ring-1 ring-border sm:p-8">
              <h2 className="text-xl font-bold tracking-tight">
                Send us a message
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill in the form and we will get back to you. This opens your
                email app with the message ready to send.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}