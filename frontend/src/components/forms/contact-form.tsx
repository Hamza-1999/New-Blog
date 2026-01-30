"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Clock } from "lucide-react";
import toast from "react-hot-toast";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 animate-fade-up stagger-1">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5">Name</label>
              <Input placeholder="Your name" required className="h-9 text-[13px]" />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1.5">Email</label>
              <Input type="email" placeholder="you@example.com" required className="h-9 text-[13px]" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5">Subject</label>
            <Input placeholder="What's this about?" required className="h-9 text-[13px]" />
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5">Message</label>
            <Textarea rows={5} placeholder="Your message..." required className="text-[13px]" />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>

      <div className="space-y-4 animate-fade-up stagger-2">
        {[
          { icon: Mail, title: "Email", detail: "hello@flavorjournal.com" },
          { icon: MapPin, title: "Location", detail: "Worldwide" },
          { icon: Clock, title: "Response Time", detail: "Within 24 hours" },
        ].map((item) => (
          <div key={item.title} className="flex gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
              <item.icon size={15} />
            </div>
            <div>
              <p className="text-[13px] font-medium">{item.title}</p>
              <p className="text-[13px] text-muted-foreground">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
