'use client';

import React from 'react';
import { Mail, MessageCircle, Clock, ShieldCheck, Headphones, MapPin, Send } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-oxblood/10 border border-oxblood/30 text-oxblood-bright text-xs font-semibold">
          <Headphones className="w-4 h-4" /> Swift Wings Customer Support
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Contact Us</h1>
        <p className="text-text-secondary text-base">
          Have questions regarding commercial bookings, private jet charters, flight manifests, or payments? Our team is available 24/7.
        </p>
      </div>

      {/* Main Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Email Support Card */}
        <div className="bg-slate-dark border border-border-slate rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-oxblood/20 border border-oxblood/40 text-oxblood-bright flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Official Support Mailbox</span>
              <h2 className="text-2xl font-extrabold text-white mt-1">Email Concierge</h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-2">
                Send ticket inquiries, passport documents, and flight cancellation or change requests directly to our support desk.
              </p>
            </div>
            <div className="p-4 bg-slate-main border border-slate-800 rounded-2xl">
              <div className="text-xs text-text-secondary mb-1">Direct Support Address:</div>
              <a
                href="mailto:booking@swiftwings.online"
                className="text-lg font-extrabold text-oxblood-bright hover:underline font-mono flex items-center gap-2"
              >
                booking@swiftwings.online
              </a>
            </div>
          </div>

          <a
            href="mailto:booking@swiftwings.online"
            className="w-full bg-oxblood hover:bg-oxblood-bright text-white font-extrabold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all text-sm font-mono mt-4"
          >
            <Send className="w-4 h-4" /> Send Email to booking@swiftwings.online
          </a>
        </div>

        {/* WhatsApp Support Card */}
        <div className="bg-slate-dark border border-border-slate rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Instant Messaging</span>
              <h2 className="text-2xl font-extrabold text-white mt-1">WhatsApp Operations</h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-2">
                Chat with our live support agents for instant booking confirmations, bank transfer account details, and live flight updates.
              </p>
            </div>
            <div className="p-4 bg-slate-main border border-slate-800 rounded-2xl">
              <div className="text-xs text-text-secondary mb-1">Operating Hours:</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Clock className="w-4 h-4" /> 24 Hours / 7 Days a Week
              </div>
            </div>
          </div>

          <a
            href="https://api.whatsapp.com/send?phone=12152682645&text=Hello%20Swift%20Wings%20Support"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-extrabold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all text-sm mt-4"
          >
            <MessageCircle className="w-4 h-4 fill-white" /> Open WhatsApp Support Chat
          </a>
        </div>
      </div>

      {/* Trust & Safety Note */}
      <div className="bg-slate-main border border-border-slate rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-oxblood shrink-0" />
          <div>
            <h3 className="text-base font-bold text-white">Official Verification Guarantee</h3>
            <p className="text-xs text-text-secondary">
              All official communications and payment details originate solely from <strong>booking@swiftwings.online</strong> and our verified WhatsApp channel.
            </p>
          </div>
        </div>
        <Link href="/" className="px-5 py-2.5 bg-slate-dark border border-slate-700 hover:border-white rounded-xl text-xs font-bold text-white transition-colors shrink-0">
          Return to Home →
        </Link>
      </div>
    </div>
  );
}
