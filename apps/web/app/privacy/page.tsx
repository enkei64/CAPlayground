"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { ArrowLeft, Sun, Moon } from "lucide-react"
import { DiscordPresence } from "@/components/discord-presence"

export default function PrivacyPage() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    document.title = "CAPlayground - Privacy Policy";
  }, []);

  return (
    <main className="relative min-h-screen px-4 py-10 sm:py-16 bg-gradient-to-b from-muted/40 to-transparent">
      <DiscordPresence details="Reading privacy policy" />
      {/* back */}
      <div className="absolute left-4 top-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
      </div>

      {/* theme */}
      <div className="absolute right-4 top-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className="rounded-full h-9 w-9 p-0"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last Updated: 20th October 2025</p>
        </div>

        {/* Paper container */}
        <div className="rounded-2xl bg-card text-card-foreground shadow-lg ring-1 ring-black/5 border border-border p-6 sm:p-10 text-base sm:text-lg">
          <p className="mt-0 leading-7">
            This Privacy Policy explains how CAPlayground ("we", "us") collects, uses, and protects your information. It
            applies to your use of the CAPlayground website and application (the "Service").
          </p>

          <h2 className="mt-12 text-3xl md:text-4xl font-semibold">1. Information We Collect</h2>
          <ul className="mt-6 list-disc pl-6 space-y-3">
            <li>
              <strong>NO Local Projects</strong>: By default, your projects are stored locally on your device (using browser IndexedDB or OPFS). We do not receive your local projects unless you explicitly upload or share them.
            </li>
            <li>
              <strong>Cloud Projects (Optional)</strong>: You can optionally use Cloud Projects by signing in to Google Drive. When you do this, your project files are stored in YOUR Google Drive account, not on CAPlayground servers. We do not receive, store, or have access to your Cloud Projects. All data is transmitted directly between your browser and Google Drive.
            </li>
            <li>
              <strong>Account Information</strong>: If you create an account via Supabase using email/password or Google OAuth,
              we process your email, necessary authentication identifiers (e.g., provider and user ID), and optional profile
              information required to operate the Service.
            </li>
            <li>
              <strong>Device & Usage</strong>: Basic technical information such as device/browser type and interactions needed to
              operate the Service. We do not run third-party analytics unless stated here.
            </li>
            <li>
              <strong>Cookies & Local Storage</strong>: We use necessary cookies/localStorage for session, preferences, and product
              features (e.g., first-time Terms acceptance: <code>caplayground-tos-accepted</code>). If you sign in to Google Drive, we store authentication tokens in secure, httpOnly cookies (<code>google_drive_access_token</code>, <code>google_drive_refresh_token</code>, <code>google_drive_token_expiry</code>) to maintain your Drive session and authenticate API requests on your behalf.
            </li>
          </ul>

          <h2 className="mt-12 text-3xl md:text-4xl font-semibold">2. How We Use Information</h2>
          <ul className="mt-6 list-disc pl-6 space-y-3">
            <li>Provide and improve the Service and its features.</li>
            <li>Authenticate users and secure accounts.</li>
            <li>Prevent abuse and ensure the reliability of the Service.</li>
            <li>Communicate important updates related to your account or the Service.</li>
          </ul>

          <h2 className="mt-12 text-3xl md:text-4xl font-semibold">3. Analytics</h2>
          <p className="mt-6 leading-7">
            We use privacy conscious analytics to understand usage and improve CAPlayground. This includes:
          </p>
          <ul className="mt-4 list-disc pl-6 space-y-3">
            <li>
              <strong>Page Views</strong>: Page URL, title, referrer, timestamp, and a session ID.
            </li>
            <li>
              <strong>Sessions</strong>: Session duration, start/end time, number of pages visited, and basic bounce detection.
            </li>
            <li>
              <strong>Performance</strong>: Page load time, DOM content loaded, first paint/first contentful paint, and resource
              timing metrics.
            </li>
            <li>
              <strong>Aggregate Counters</strong>: We also keep aggregate-only counts for certain product events (projects
              created). These counters are stored without user identifiers and used for product planning. The contents in your projects are not collected.
            </li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            We do not use analytics for advertising, and we do not intentionally collect sensitive identifiers (such as precise
            location or device fingerprinting data) for analytics.
          </p>

          <h2 className="mt-12 text-3xl md:text-4xl font-semibold">4. Third Parties</h2>
          <p className="mt-6 leading-7">
            We use Supabase for authentication and backend infrastructure. Supabase may process data necessary to provide those
            services and may maintain operational logs (e.g., auth events). We also use PostHog for privacy focused
            analytics as described above. PostHog data is proxied through our own domain to improve reliability. Refer to those providers' documentation/policies for more details.
          </p>
          <p className="mt-4 leading-7">
            <strong>Google Drive (Optional)</strong>: If you choose to use Cloud Projects, we integrate with Google Drive to store your project files. Your project files are stored in YOUR Google Drive account in a folder named "CAPlayground". We access only files created by CAPlayground. Your use of Google Drive is subject to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Google's Privacy Policy</a>. You can revoke CAPlayground's access to your Drive at any time through your Google account settings.
          </p>

          <h2 className="mt-12 text-3xl md:text-4xl font-semibold">5. Data Retention</h2>
          <ul className="mt-6 list-disc pl-6 space-y-3">
            <li>Local projects remain on your device until you remove them.</li>
            <li>Cloud Projects remain in your Google Drive until you delete them. Deleting your CAPlayground account does NOT automatically delete your Cloud Projects from Google Drive. You must manually delete them using the "Delete All" feature in the dashboard or directly from Google Drive.</li>
            <li>Account data is retained while your account is active. If you delete your account, we delete associated account data
              except where retention is required by law.</li>
            <li>Google Drive authentication cookies are cleared when you sign out from Google Drive or when they expire.</li>
          </ul>

          <h2 className="mt-12 text-3xl md:text-4xl font-semibold">6. Your Rights</h2>
          <p className="mt-6 leading-7">
            Depending on your location, you may have rights to access, correct, or delete your data. We are planning an account
            deletion endpoint in the app. You can also contact us to exercise your rights.
          </p>

          <h2 className="mt-12 text-3xl md:text-4xl font-semibold">7. Children’s Privacy</h2>
          <p className="mt-6 leading-7">
            The Service is not intended for children under the age specified in our Terms of Service. If you believe a child has
            provided us personal data, contact us and we will take appropriate steps.
          </p>

          <h2 className="mt-12 text-3xl md:text-4xl font-semibold">8. International Transfers</h2>
          <p className="mt-6 leading-7">
            Data may be processed in regions where our providers operate. We take steps to ensure appropriate safeguards consistent
            with applicable laws.
          </p>

          <h2 className="mt-12 text-3xl md:text-4xl font-semibold">9. Changes to This Policy</h2>
          <p className="mt-6 leading-7">
            We may update this Privacy Policy from time to time. We will update the "Last Updated" date above and, when
            appropriate, provide additional notice.
          </p>

          <h2 className="mt-12 text-3xl md:text-4xl font-semibold">10. Contact</h2>
          <p className="mt-6 leading-7">
            Questions? Contact us at <a className="underline" href="mailto:support@enkei64.xyz">support@enkei64.xyz</a>.
          </p>

          <p className="mt-10 text-sm text-muted-foreground">
            Also see our {" "}
            <Link href="/tos" className="underline">Terms of Service</Link>.
          </p>
        </div>
      </div>
    </main>
  )
}
