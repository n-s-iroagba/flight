import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-dark border-t border-border-slate py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <p className="text-text-secondary text-sm">
              © 2026 Swift Wings. All rights reserved.
            </p>
            <span className="hidden sm:inline text-slate-700">•</span>
            <a
              href="mailto:booking@swiftwings.online"
              className="text-text-secondary hover:text-white text-sm flex items-center gap-1.5 transition-colors font-mono"
            >
              <Mail className="w-4 h-4 text-oxblood" />
              booking@swiftwings.online
            </a>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-text-secondary hover:text-text-primary text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-text-secondary hover:text-text-primary text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-text-secondary hover:text-text-primary text-sm transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

