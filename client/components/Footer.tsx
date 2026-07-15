import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-dark border-t border-border-slate py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-secondary text-sm">
            © 2026 Swift Wings. All rights reserved.
          </p>
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
