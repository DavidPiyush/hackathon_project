"use client";

import { useState } from "react";
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaMagnifyingGlass,
  FaFilter,
  FaTriangleExclamation,
  FaShieldHalved,
  FaClock,
  FaPaperclip,
  FaLink,
  FaArrowRight,
  FaCheck,
  FaFileShield,
} from "react-icons/fa6";

const emails = [
  {
    id: 1,
    sender: "finance@secure-payments.com",
    name: "Finance Department",
    subject: "Urgent Invoice Payment Required",
    preview:
      "Please review the attached invoice and process the payment immediately...",
    time: "10:42 AM",
    risk: 92,
    category: "BEC / Phishing",
    status: "High Risk",
    unread: true,
    attachment: true,
    link: true,
  },
  {
    id: 2,
    sender: "support@micr0soft-security.com",
    name: "Microsoft Security",
    subject: "Your account requires verification",
    preview:
      "We detected unusual activity on your account. Verify your credentials...",
    time: "09:31 AM",
    risk: 81,
    category: "Impersonation",
    status: "Suspicious",
    unread: true,
    attachment: false,
    link: true,
  },
  {
    id: 3,
    sender: "notification@company.com",
    name: "Company Notifications",
    subject: "Weekly Security Summary",
    preview: "Here is your weekly security activity and account summary...",
    time: "Yesterday",
    risk: 12,
    category: "Legitimate",
    status: "Safe",
    unread: false,
    attachment: false,
    link: false,
  },
  {
    id: 4,
    sender: "accounts@finance-alert.com",
    name: "Accounts Department",
    subject: "Payment confirmation needed",
    preview:
      "Your payment is currently pending. Please confirm your account details...",
    time: "Yesterday",
    risk: 76,
    category: "Credential Phishing",
    status: "Suspicious",
    unread: true,
    attachment: true,
    link: true,
  },
  {
    id: 5,
    sender: "admin@internal-company.com",
    name: "IT Administration",
    subject: "Password policy update",
    preview:
      "Our password policy has been updated. No action is required at this time.",
    time: "Sep 5",
    risk: 8,
    category: "Legitimate",
    status: "Safe",
    unread: false,
    attachment: false,
    link: false,
  },
  {
    id: 6,
    sender: "security-alert@account-verify.net",
    name: "Account Security",
    subject: "Unusual login detected",
    preview:
      "A new login was detected from an unfamiliar location. Review your account...",
    time: "Sep 5",
    risk: 88,
    category: "Phishing",
    status: "High Risk",
    unread: true,
    attachment: false,
    link: true,
  },
];

export default function InboxPage() {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredEmails = emails.filter((email) => {
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Unread" && email.unread) ||
      (activeFilter === "High Risk" && email.risk >= 75) ||
      (activeFilter === "Safe" && email.status === "Safe");

    const searchText =
      `${email.sender} ${email.subject} ${email.category}`.toLowerCase();

    return matchesFilter && searchText.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#050b14] text-white">
      {/* Page Header */}
      <div className="border-b border-white/10 px-6 py-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10">
                <FaEnvelope className="text-cyan-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">Email Inbox</h1>

                <p className="mt-1 text-xs text-gray-500">
                  Monitor and investigate incoming email threats
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-80">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-600" />

            <input
              type="text"
              placeholder="Search emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.02] py-2.5 pl-9 pr-4 text-sm text-gray-300 outline-none placeholder:text-gray-600 focus:border-cyan-400/30"
            />
          </div>
        </div>
      </div>

      {/* Inbox Stats */}
      <div className="grid border-b border-white/10 sm:grid-cols-4">
        <InboxStat title="Total Emails" value="1,284" icon={FaEnvelope} />

        <InboxStat title="Unread" value="17" icon={FaEnvelopeOpen} />

        <InboxStat title="High Risk" value="12" icon={FaTriangleExclamation} />

        <InboxStat title="Safe" value="1,197" icon={FaShieldHalved} />
      </div>

      <div className="p-6 lg:p-8">
        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <FaFilter className="mr-2 text-xs text-gray-600" />

          {["All", "Unread", "High Risk", "Safe"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-lg px-3 py-2 text-xs transition ${
                activeFilter === filter
                  ? "bg-cyan-400/10 text-cyan-400"
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              }`}
            >
              {filter}
            </button>
          ))}

          <span className="ml-auto text-xs text-gray-600">
            {filteredEmails.length} emails
          </span>
        </div>

        {/* Inbox */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#081522]">
          {/* Inbox Header */}
          <div className="hidden grid-cols-[40px_1.4fr_2fr_120px_100px] gap-4 border-b border-white/10 px-5 py-3 text-[10px] uppercase tracking-wider text-gray-600 md:grid">
            <span />
            <span>Sender</span>
            <span>Subject</span>
            <span>Risk</span>
            <span>Status</span>
          </div>

          {/* Emails */}
          {filteredEmails.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              onClick={() => setSelectedEmail(email)}
            />
          ))}

          {filteredEmails.length === 0 && (
            <div className="p-12 text-center">
              <FaEnvelopeOpen className="mx-auto text-2xl text-gray-700" />

              <p className="mt-3 text-sm text-gray-500">No emails found</p>
            </div>
          )}
        </div>
      </div>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <EmailDetail
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </div>
  );
}

/* =========================================================
   INBOX STAT
========================================================= */

function InboxStat({ title, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 border-r border-white/10 px-6 py-4 last:border-r-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10">
        <Icon className="text-xs text-cyan-400" />
      </div>

      <div>
        <p className="text-[10px] text-gray-600">{title}</p>

        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

/* =========================================================
   EMAIL ROW
========================================================= */

function EmailRow({ email, onClick }) {
  const isSafe = email.status === "Safe";

  return (
    <button
      onClick={onClick}
      className="group grid w-full gap-3 border-b border-white/10 px-5 py-4 text-left transition last:border-b-0 hover:bg-cyan-400/[0.03] md:grid-cols-[40px_1.4fr_2fr_120px_100px] md:items-center md:gap-4"
    >
      {/* Unread */}
      <div className="flex items-center">
        {email.unread ? (
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
        ) : (
          <FaEnvelopeOpen className="text-xs text-gray-700" />
        )}
      </div>

      {/* Sender */}
      <div className="min-w-0">
        <p
          className={`truncate text-sm ${
            email.unread ? "font-semibold text-gray-200" : "text-gray-400"
          }`}
        >
          {email.name}
        </p>

        <p className="truncate text-[11px] text-gray-600">{email.sender}</p>
      </div>

      {/* Subject */}
      <div className="min-w-0">
        <p className="truncate text-sm text-gray-300">{email.subject}</p>

        <div className="mt-1 flex items-center gap-3">
          <span className="text-[10px] text-gray-600">{email.category}</span>

          {email.attachment && (
            <FaPaperclip className="text-[9px] text-gray-600" />
          )}

          {email.link && <FaLink className="text-[9px] text-gray-600" />}
        </div>
      </div>

      {/* Risk */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full ${
              email.risk >= 75
                ? "bg-red-400"
                : email.risk >= 40
                  ? "bg-yellow-400"
                  : "bg-emerald-400"
            }`}
            style={{
              width: `${email.risk}%`,
            }}
          />
        </div>

        <span className="text-[10px] text-gray-500">{email.risk}</span>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between md:block">
        <span
          className={`rounded-full border px-2.5 py-1 text-[9px] ${
            isSafe
              ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-400"
              : email.risk >= 75
                ? "border-red-400/20 bg-red-400/5 text-red-400"
                : "border-yellow-400/20 bg-yellow-400/5 text-yellow-400"
          }`}
        >
          {email.status}
        </span>

        <span className="ml-3 text-[10px] text-gray-600 md:hidden">
          {email.time}
        </span>
      </div>
    </button>
  );
}

/* =========================================================
   EMAIL DETAIL
========================================================= */

function EmailDetail({ email, onClose }) {
  const isSafe = email.status === "Safe";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[#081522] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-cyan-400">
              Email Investigation
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              {email.subject}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-5">
          {/* Risk */}
          <div className="mb-6 rounded-lg border border-white/10 bg-black/10 p-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-600">
                  Threat Assessment
                </p>

                <p
                  className={`mt-1 text-xl font-bold ${
                    isSafe ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {email.risk}/100
                </p>
              </div>

              <span
                className={`w-fit rounded-full border px-3 py-1.5 text-xs ${
                  isSafe
                    ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-400"
                    : "border-red-400/20 bg-red-400/5 text-red-400"
                }`}
              >
                {email.status}
              </span>
            </div>
          </div>

          {/* Sender Information */}
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Sender Information
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Display Name" value={email.name} />

              <Info label="Email Address" value={email.sender} />

              <Info label="Category" value={email.category} />

              <Info label="Received" value={email.time} />
            </div>
          </div>

          {/* Message Preview */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Message Preview
            </h3>

            <div className="rounded-lg border border-white/10 bg-black/10 p-4">
              <p className="text-sm leading-7 text-gray-400">{email.preview}</p>
            </div>
          </div>

          {/* Analysis Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/dashboard/analysis"
              className="flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-[#050b14]"
            >
              <FaMagnifyingGlass />
              Full Analysis
            </a>

            <button className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-xs text-gray-400 hover:bg-white/5">
              <FaFileShield />
              View Evidence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO
========================================================= */

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <p className="text-[10px] text-gray-600">{label}</p>

      <p className="mt-1 truncate text-xs text-gray-300">{value}</p>
    </div>
  );
}
