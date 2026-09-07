

import {
  FaShieldHalved,
  FaEnvelope,
  FaLocationDot,
  FaClock,
  FaArrowRight,
  FaGithub,
  FaLinkedin,
  FaCircleCheck,
  FaHeadset,
} from "react-icons/fa6";

export default function Contact() {
  return (
    <main className="min-h-screen bg-[#050b14] text-white">

      {/* =========================
          HERO
      ========================== */}

      <section className="relative overflow-hidden border-b border-white/10">

        {/* Background Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-250px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute bottom-[-200px] left-[-100px] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">

          <div className="mx-auto max-w-3xl text-center">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 text-xs font-medium tracking-wide text-cyan-400">

              <FaHeadset />

              CONTACT THREATDETECT

            </div>

            {/* Heading */}
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">

              Let's Talk
              <span className="block text-cyan-400">
                Security.
              </span>

            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">

              Have a question about email threat detection, forensic
              analysis, or our platform? Our team is here to help.

            </p>

          </div>

        </div>

      </section>


      {/* =========================
          CONTACT SECTION
      ========================== */}

      <section className="relative py-20 lg:py-24">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">


            {/* =========================
                LEFT INFORMATION
            ========================== */}

            <div>

              <div className="mb-8">

                <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400">
                  GET IN TOUCH
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  We're here to help.
                </h2>

                <p className="mt-4 max-w-md text-sm leading-6 text-gray-400">
                  Whether you need help understanding an email threat,
                  want to learn more about ThreatDetect, or have feedback
                  about our platform, feel free to reach out.
                </p>

              </div>


              {/* Email */}
              <div className="group mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">

                    <FaEnvelope className="text-cyan-400" />

                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Email
                    </p>

                    <p className="mt-1 text-sm font-medium text-white">
                      contact@threatdetect.com
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      We'll respond as soon as possible.
                    </p>

                  </div>

                </div>

              </div>


              {/* Location */}
              <div className="group mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">

                    <FaLocationDot className="text-cyan-400" />

                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-medium text-white">
                      India
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Remote security engineering team
                    </p>

                  </div>

                </div>

              </div>


              {/* Availability */}
              <div className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">

                    <FaClock className="text-cyan-400" />

                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Availability
                    </p>

                    <p className="mt-1 text-sm font-medium text-white">
                      Monday – Friday
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      9:00 AM – 6:00 PM IST
                    </p>

                  </div>

                </div>

              </div>


              {/* Social */}
              <div className="mt-8">

                <p className="mb-3 text-xs font-medium text-gray-500">
                  CONNECT WITH US
                </p>

                <div className="flex items-center gap-3">

                  <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-gray-400 transition hover:border-cyan-400/30 hover:text-cyan-400"
                  >
                    <FaGithub />
                  </a>

                  <a
                    href="#"
                    aria-label="LinkedIn"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-gray-400 transition hover:border-cyan-400/30 hover:text-cyan-400"
                  >
                    <FaLinkedin />
                  </a>

                </div>

              </div>

            </div>


            {/* =========================
                CONTACT FORM
            ========================== */}

            <div className="relative">

              {/* Glow */}
              <div className="absolute inset-0 rounded-2xl bg-cyan-400/[0.04] blur-2xl" />

              <div className="relative rounded-2xl border border-white/10 bg-[#091522]/90 p-6 shadow-2xl sm:p-8">

                {/* Form Header */}
                <div className="mb-8 flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">

                    <FaShieldHalved className="text-xl text-cyan-400" />

                  </div>

                  <div>

                    <h3 className="text-lg font-semibold text-white">
                      Send us a message
                    </h3>

                    <p className="text-xs text-gray-500">
                      Secure communication channel
                    </p>

                  </div>

                </div>


                {/* Form */}
                <form className="space-y-5">


                  {/* Name + Email */}
                  <div className="grid gap-5 sm:grid-cols-2">

                    <div>

                      <label
                        htmlFor="name"
                        className="mb-2 block text-xs font-medium text-gray-400"
                      >
                        Full Name
                      </label>

                      <input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        className="w-full rounded-lg border border-white/10 bg-[#050b14] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                      />

                    </div>


                    <div>

                      <label
                        htmlFor="email"
                        className="mb-2 block text-xs font-medium text-gray-400"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-white/10 bg-[#050b14] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                      />

                    </div>

                  </div>


                  {/* Subject */}
                  <div>

                    <label
                      htmlFor="subject"
                      className="mb-2 block text-xs font-medium text-gray-400"
                    >
                      Subject
                    </label>

                    <input
                      id="subject"
                      type="text"
                      placeholder="How can we help?"
                      className="w-full rounded-lg border border-white/10 bg-[#050b14] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                    />

                  </div>


                  {/* Category */}
                  <div>

                    <label
                      htmlFor="category"
                      className="mb-2 block text-xs font-medium text-gray-400"
                    >
                      Inquiry Type
                    </label>

                    <select
                      id="category"
                      className="w-full rounded-lg border border-white/10 bg-[#050b14] px-4 py-3 text-sm text-gray-400 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                    >

                      <option value="">
                        Select an inquiry type
                      </option>

                      <option value="general">
                        General Question
                      </option>

                      <option value="security">
                        Security Issue
                      </option>

                      <option value="threat">
                        Threat Investigation
                      </option>

                      <option value="feedback">
                        Feedback
                      </option>

                      <option value="other">
                        Other
                      </option>

                    </select>

                  </div>


                  {/* Message */}
                  <div>

                    <label
                      htmlFor="message"
                      className="mb-2 block text-xs font-medium text-gray-400"
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      rows="6"
                      placeholder="Describe your question or issue..."
                      className="w-full resize-none rounded-lg border border-white/10 bg-[#050b14] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                    />

                  </div>


                  {/* Privacy */}
                  <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">

                    <FaCircleCheck className="mt-0.5 shrink-0 text-emerald-400" />

                    <p className="text-[11px] leading-5 text-gray-500">
                      Please do not include passwords, private keys,
                      credentials, or other sensitive information in this
                      form.
                    </p>

                  </div>


                  {/* Submit */}
                  <button
                    type="submit"
                    className="group flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-[#03101a] transition hover:bg-cyan-300"
                  >

                    Send Secure Message

                    <FaArrowRight className="transition-transform group-hover:translate-x-1" />

                  </button>


                  {/* Security note */}
                  <div className="flex items-center justify-center gap-2 text-[11px] text-gray-600">

                    <FaShieldHalved className="text-cyan-400" />

                    Your communication is handled securely.

                  </div>

                </form>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          SECURITY CTA
      ========================== */}

      <section className="border-t border-white/10 bg-[#07101c]">

        <div className="mx-auto max-w-5xl px-6 py-20 text-center lg:px-8">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">

            <FaShieldHalved className="text-xl text-cyan-400" />

          </div>

          <h2 className="mt-6 text-3xl font-bold">
            Need help investigating a threat?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-400">
            Share the relevant details with our team and we'll help
            you understand the indicators and potential risks.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs text-gray-500">

            <span className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2">
              Email Analysis
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2">
              Threat Intelligence
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2">
              Digital Forensics
            </span>

          </div>

        </div>

      </section>

    </main>
  );
}

