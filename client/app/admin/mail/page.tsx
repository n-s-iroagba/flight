'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { sendAdminMail } from '@/lib/api';
import { Mail, Send, CheckCircle2, ShieldAlert, FileText, Sparkles, User, Lock, Paperclip } from 'lucide-react';

const CustomEditor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-main rounded-xl animate-pulse border border-border-slate flex items-center justify-center text-text-secondary text-sm">Loading Rich Email Editor...</div>
});

const EMAIL_TEMPLATES = [
  {
    name: 'Flight Ticket & PNR Delivery',
    subject: 'Your Swift Wings E-Ticket & Flight Itinerary',
    content: `<h2>Dear Valued Passenger,</h2>
<p>Thank you for choosing <strong>Swift Wings</strong>. We are pleased to confirm that your flight ticket has been successfully issued.</p>
<p><strong>Booking Summary:</strong></p>
<ul>
  <li><strong>PNR / Ticket No:</strong> SW-90821-VIP</li>
  <li><strong>Airline:</strong> Swift Wings VIP Executive</li>
  <li><strong>Flight Route:</strong> LHR → JFK</li>
  <li><strong>Departure Time:</strong> 10:00 AM</li>
</ul>
<p>Please present your passport and this electronic ticket at the check-in counter.</p>
<p>Warm regards,<br/><strong>Swift Wings Support Team</strong><br/>booking@swiftwings.online</p>`
  },
  {
    name: 'Private Jet Charter Quote',
    subject: 'Official Private Jet Charter Confirmation & Bank Details',
    content: `<h2>Dear Executive Charter Client,</h2>
<p>Thank you for inquiring with <strong>Swift Wings Charter Service</strong>. Below is your formal charter quote and payment instructions.</p>
<p><strong>Charter Details:</strong></p>
<ul>
  <li><strong>Aircraft Model:</strong> Gulfstream G650ER</li>
  <li><strong>Passenger Capacity:</strong> Up to 12 Passengers</li>
  <li><strong>Departure / Destination:</strong> London Heathrow (LHR) → New York (JFK)</li>
  <li><strong>Total Charter Rate:</strong> $25,000 USD (All Taxes & VIP Handling Included)</li>
</ul>
<p><strong>Payment Instructions (Bank Wire Transfer):</strong></p>
<p>Bank: Swift Wings Global Bank<br/>Account Name: Swift Wings Aviation Ltd<br/>IBAN / Account: GB89 SWFT 1002 9918 2931 01<br/>SWIFT Code: SWFTGB2L</p>
<p>Please reply with your transfer receipt screenshot and passport copies to confirm dispatch.</p>
<p>Sincerely,<br/><strong>VIP Executive Team</strong><br/>booking@swiftwings.online</p>`
  },
  {
    name: 'Passport & Identity Verification Request',
    subject: 'Urgent: Passport Copy Required for Flight Manifest',
    content: `<h2>Dear Passenger,</h2>
<p>To finalize your aviation manifest and issue your boarding clearance, please reply to this email with a clear scan/photo of your <strong>valid international passport</strong>.</p>
<p>If traveling with guests, kindly submit passport copies for all manifest passengers.</p>
<p>Thank you for your prompt assistance.<br/><strong>Swift Wings Flight Operations</strong><br/>booking@swiftwings.online</p>`
  }
];

export default function AdminMailPage() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [sentLog, setSentLog] = useState<Array<{ id: string; to: string; subject: string; date: string }>>([
    { id: '1', to: 'client@example.com', subject: 'Flight Ticket & PNR Delivery', date: new Date().toLocaleString() }
  ]);

  const handleApplyTemplate = (template: typeof EMAIL_TEMPLATES[0]) => {
    setSubject(template.subject);
    setContent(template.content);
  };

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !content) {
      setErrorMessage('Recipient email, subject line, and email body are required.');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await sendAdminMail({
        to,
        subject,
        html: content,
        message: content.replace(/<[^>]+>/g, '')
      });

      setSuccessMessage(res.message || `Email successfully dispatched to ${to}`);
      setSentLog(prev => [
        { id: Date.now().toString(), to, subject, date: new Date().toLocaleString() },
        ...prev
      ]);
      
      // Reset form
      setTo('');
      setSubject('');
      setContent('');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.message || 'Failed to send email. Please check SMTP settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-main p-6 rounded-2xl border border-border-slate shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-oxblood font-bold text-xs uppercase tracking-wider mb-1">
            <Mail className="w-4 h-4 text-oxblood" /> Swift Wings SMTP Mailer
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">Admin Dispatch Portal</h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Send official e-tickets, charter quotes, and flight updates directly from your configured support mailbox.
          </p>
        </div>

        <div className="bg-slate-dark/90 border border-emerald-500/30 px-4 py-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="text-text-secondary">Sender Mailbox</div>
            <div className="font-mono font-bold text-emerald-400">booking@swiftwings.online</div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" /> {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Mail Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-main border border-border-slate rounded-2xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2 border-b border-border-slate pb-4">
              <Send className="w-5 h-5 text-oxblood" /> Compose Email
            </h2>

            <form onSubmit={handleSendMail} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">From Address</label>
                  <input
                    type="text"
                    value="booking@swiftwings.online"
                    disabled
                    className="w-full bg-slate-dark/70 border border-border-slate rounded-xl p-3 text-text-primary text-sm font-mono cursor-not-allowed opacity-80"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">To (Recipient Email) *</label>
                  <input
                    type="email"
                    placeholder="passenger@example.com"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full bg-slate-dark border border-border-slate rounded-xl p-3 text-text-primary text-sm focus:outline-none focus:border-oxblood"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Subject Line *</label>
                <input
                  type="text"
                  placeholder="e.g. Your Swift Wings Flight Confirmation"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-dark border border-border-slate rounded-xl p-3 text-text-primary text-sm focus:outline-none focus:border-oxblood"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Email Body (Rich Text / HTML Editor) *</label>
                <div className="bg-slate-dark rounded-xl overflow-hidden border border-border-slate text-text-primary">
                  <CustomEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write email content or select a preset template..."
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-border-slate">
                <div className="text-xs text-text-secondary flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-oxblood" /> Authenticated via SMTP (Port 465 SSL)
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-oxblood hover:bg-oxblood-bright text-white font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 text-sm"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending Email...' : 'Send Email Now'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar: Presets & Activity Log */}
        <div className="space-y-6">
          {/* Quick Presets */}
          <div className="bg-slate-main border border-border-slate rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Quick Email Presets
            </h3>
            <p className="text-xs text-text-secondary">Click any preset to populate the email subject and rich body text.</p>

            <div className="space-y-2.5">
              {EMAIL_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="w-full text-left p-3.5 bg-slate-dark hover:bg-slate-dark/70 border border-border-slate hover:border-oxblood rounded-xl transition-all group"
                >
                  <div className="text-xs font-bold text-text-primary group-hover:text-oxblood flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> {tmpl.name}
                  </div>
                  <div className="text-[11px] text-text-secondary truncate mt-1">{tmpl.subject}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dispatch Log */}
          <div className="bg-slate-main border border-border-slate rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" /> Recent Dispatch Activity
            </h3>
            
            <div className="divide-y divide-border-slate max-h-64 overflow-y-auto">
              {sentLog.map((log) => (
                <div key={log.id} className="py-3 first:pt-0 last:pb-0 text-xs">
                  <div className="flex justify-between font-semibold text-text-primary mb-1">
                    <span className="truncate max-w-[160px]">{log.to}</span>
                    <span className="text-[10px] text-text-secondary">{log.date}</span>
                  </div>
                  <div className="text-text-secondary truncate">{log.subject}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
