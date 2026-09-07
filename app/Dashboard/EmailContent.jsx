"use client";

import React from "react";

import {
  FaArrowLeft,
  FaArchive,
  FaExclamationTriangle,
  FaTrash,
  FaEllipsisV,
  FaPrint,
  FaExternalLinkAlt,
  FaStar,
  FaReply,
  FaReplyAll,
  FaShare,
  FaShieldAlt,
  FaChevronDown,
  FaPaperclip,
  FaCopy,
  FaCheckCircle,
  FaServer,
  FaMapMarkerAlt,
  FaLink,
  FaClock,
  FaFingerprint,
} from "react-icons/fa";


export default function EmailContent({
  email,
  onBack,
}) {

  // Safety fallback
  if (!email) {
    return null;
  }


  // =====================================================
  // RISK CONFIGURATION
  // =====================================================

  const riskConfig = {

    high: {
      label: "HIGH RISK",
      color: "text-[#B91C1C]",
      background: "bg-[#FEE2E2]",
    },

    medium: {
      label: "NEEDS REVIEW",
      color: "text-[#A16207]",
      background: "bg-[#FFF7E6]",
    },

    safe: {
      label: "LOW RISK",
      color: "text-[#047857]",
      background: "bg-[#DCFCE7]",
    },

  };


  const risk = riskConfig[email.risk] || riskConfig.medium;


  // =====================================================
  // EMAIL DATA
  // =====================================================

  const senderInitials = email.sender
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();


  return (

    <div className="min-h-screen bg-[#F7F9FC] text-[#172033]">


      {/* =================================================
          TOP TOOLBAR
      ================================================== */}

      <header className="flex h-[70px] items-center gap-5 border-b border-[#DCE3EC] bg-[#F7F9FC] px-5">


        {/* BACK */}

        <button
          onClick={onBack}
          title="Back to inbox"
          className="
            flex h-10 w-10
            items-center justify-center
            text-[#536273]
            transition
            hover:bg-[#EAF0F6]
            hover:text-[#0A1628]
          "
        >

          <FaArrowLeft />

        </button>


        {/* ACTIONS */}

        <div className="flex items-center gap-5 text-[#536273]">

          <button title="Archive">
            <FaArchive size={14} />
          </button>

          <button title="Report suspicious">
            <FaExclamationTriangle size={14} />
          </button>

          <button title="Delete">
            <FaTrash size={14} />
          </button>

          <div className="h-5 w-px bg-[#DCE3EC]" />

          <button title="More">
            <FaEllipsisV size={14} />
          </button>

        </div>


        {/* POSITION */}

        <div className="ml-auto flex items-center gap-5 text-xs text-[#718096]">

          <span className="hidden sm:block">
            Investigation {email.id} of 24
          </span>

          <button>
            <span className="text-sm">←</span>
          </button>

          <button>
            <span className="text-sm">→</span>
          </button>

        </div>

      </header>


      {/* =================================================
          EMAIL
      ================================================== */}

      <main className="mx-auto max-w-[1500px] px-4 py-4 lg:px-8">

        <div className="overflow-hidden rounded-xl border border-[#DCE3EC] bg-white">


          {/* =================================================
              EMAIL HEADER
          ================================================== */}

          <div className="border-b border-[#E5E9EF] px-6 py-7 sm:px-8">


            {/* SUBJECT */}

            <div className="flex items-start justify-between gap-5">

              <div className="min-w-0">

                <h1 className="text-2xl font-normal tracking-tight text-[#172033] sm:text-3xl">
                  {email.subject}
                </h1>


                {/* LABELS */}

                <div className="mt-4 flex flex-wrap items-center gap-2">

                  <span
                    className={`
                      px-2.5 py-1
                      font-mono text-[9px]
                      font-semibold
                      tracking-wider
                      ${risk.background}
                      ${risk.color}
                    `}
                  >
                    {risk.label}
                  </span>


                  <span className="bg-[#EDF2F7] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-[#536273]">
                    {email.category}
                  </span>


                  <span className="bg-[#EDF2F7] px-2.5 py-1 font-mono text-[9px] text-[#536273]">
                    IR-2026-{String(email.id).padStart(3, "0")}
                  </span>

                </div>

              </div>


              {/* HEADER ACTIONS */}

              <div className="hidden items-center gap-5 text-[#607080] sm:flex">

                <button title="Print">
                  <FaPrint />
                </button>

                <button title="Open separately">
                  <FaExternalLinkAlt />
                </button>

              </div>

            </div>


            {/* =================================================
                SENDER
            ================================================== */}

            <div className="mt-8 flex items-start gap-4">


              {/* AVATAR */}

              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#0A1628] text-sm font-semibold text-[#22D3EE]">
                {senderInitials}
              </div>


              {/* SENDER INFORMATION */}

              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-2">

                  <strong className="text-sm">
                    {email.sender}
                  </strong>

                  <span className="break-all text-xs text-[#718096]">
                    &lt;{email.senderEmail}&gt;
                  </span>

                </div>


                <div className="mt-1 flex items-center gap-2 text-xs text-[#718096]">

                  <span>
                    to me
                  </span>

                  <FaChevronDown size={8} />

                </div>

              </div>


              {/* EMAIL ACTIONS */}

              <div className="flex items-center gap-5 text-[#607080]">

                <span className="hidden text-xs sm:block">
                  {email.time}
                </span>

                <button title="Star">
                  <FaStar />
                </button>

                <button title="Reply">
                  <FaReply />
                </button>

                <button
                  className="hidden sm:block"
                  title="More"
                >
                  <FaEllipsisV />
                </button>

              </div>

            </div>

          </div>


          {/* =================================================
              MAILTRACE WARNING
          ================================================== */}

          {email.risk !== "safe" && (

            <div className="border-b border-[#F3D6A3] bg-[#FFF9EC] px-6 py-4 sm:px-8">

              <div className="flex items-start gap-3">

                <FaExclamationTriangle className="mt-0.5 shrink-0 text-[#D97706]" />

                <div>

                  <p className="text-sm font-semibold text-[#92400E]">
                    MAILTRACE detected suspicious characteristics
                  </p>

                  <p className="mt-1 text-xs leading-6 text-[#A16207]">
                    This message requires additional verification
                    before it should be considered trustworthy.
                  </p>

                </div>


                <button className="ml-auto hidden whitespace-nowrap font-mono text-[10px] text-[#92400E] underline sm:block">
                  VIEW ANALYSIS
                </button>

              </div>

            </div>

          )}


          {/* =================================================
              EMAIL BODY
          ================================================== */}

          <article className="px-6 py-10 sm:px-16 lg:px-28">

            <div className="mx-auto max-w-[760px]">


              {/* SENDER BRAND */}

              <div className="mb-10 border-b border-[#EDF0F4] pb-8">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center bg-[#0A1628] text-[#22D3EE]">

                    <FaShieldAlt />

                  </div>


                  <div>

                    <p className="text-lg font-semibold">
                      {email.sender}
                    </p>

                    <p className="text-xs text-[#718096]">
                      Security &amp; Operations
                    </p>

                  </div>

                </div>

              </div>


              {/* BODY */}

              <div className="space-y-7 text-[15px] leading-8 text-[#293548]">


                {/* GREETING */}

                <p>
                  {email.body?.greeting || "Hello,"}
                </p>


                {/* PARAGRAPHS */}

                {email.body?.paragraphs?.map((paragraph, index) => (

                  <p key={index}>
                    {paragraph}
                  </p>

                ))}


                {/* ACTION BOX */}

                <div className="border border-[#DCE3EC] bg-[#F8FAFC] p-6">

                  <p className="mb-5 font-mono text-[10px] uppercase tracking-wider text-[#718096]">
                    REQUESTED ACTION
                  </p>


                  <div className="flex items-start gap-4">

                    <FaLink className="mt-1 shrink-0 text-[#D97706]" />

                    <p className="text-sm leading-6 text-[#344054]">
                      {email.body?.action ||
                        "Review the available investigation evidence."}
                    </p>

                  </div>

                </div>


                {/* SIGNATURE */}

                <p>

                  Regards,
                  <br />

                  <strong>
                    {email.sender}
                  </strong>

                  <br />

                  <span className="text-[#718096]">
                    Security &amp; Operations
                  </span>

                </p>

              </div>


              {/* =================================================
                  ATTACHMENT
              ================================================== */}

              {email.attachment && (

                <div className="mt-10">

                  <p className="mb-4 font-mono text-[10px] uppercase tracking-wider text-[#718096]">
                    ATTACHMENTS
                  </p>


                  <div className="flex items-center gap-4 border border-[#DCE3EC] p-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#EDF2F7] text-[#607080]">

                      <FaPaperclip />

                    </div>


                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-medium">
                        investigation-evidence.pdf
                      </p>

                      <p className="mt-1 font-mono text-[10px] text-[#718096]">
                        284 KB · PDF
                      </p>

                    </div>


                    <button
                      title="Copy attachment reference"
                      className="text-[#607080] hover:text-[#0A1628]"
                    >

                      <FaCopy />

                    </button>

                  </div>

                </div>

              )}

            </div>

          </article>


          {/* =================================================
              QUICK EVIDENCE
          ================================================== */}

          <section className="border-t border-[#DCE3EC] bg-[#F8FAFC] px-6 py-8 sm:px-8">

            <div className="mx-auto max-w-[1100px]">


              {/* TITLE */}

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#718096]">
                    MAILTRACE // QUICK EVIDENCE
                  </p>

                  <h2 className="mt-2 text-lg font-semibold">
                    Message investigation summary
                  </h2>

                </div>


                <button
                  className="
                    hidden items-center gap-2
                    border border-[#22456E]
                    px-4 py-2
                    font-mono text-[10px]
                    text-[#536273]
                    hover:bg-white
                    sm:flex
                  "
                >
                  OPEN FULL ANALYSIS
                  <FaExternalLinkAlt size={9} />
                </button>

              </div>


              {/* EVIDENCE CARDS */}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">


                <EvidenceCard
                  icon={FaShieldAlt}
                  label="Authentication"
                  value={email.risk === "safe" ? "PASS" : "REVIEW"}
                  detail={
                    email.risk === "safe"
                      ? "Authentication aligned"
                      : "Additional verification"
                  }
                  status={
                    email.risk === "safe"
                      ? "safe"
                      : "warning"
                  }
                />


                <EvidenceCard
                  icon={FaFingerprint}
                  label="Message Identity"
                  value="VERIFIED"
                  detail="Evidence record available"
                  status="safe"
                />


                <EvidenceCard
                  icon={FaServer}
                  label="Infrastructure"
                  value={
                    email.risk === "high"
                      ? "SUSPICIOUS"
                      : "REVIEW"
                  }
                  detail="Network context available"
                  status={
                    email.risk === "high"
                      ? "danger"
                      : "warning"
                  }
                />


                <EvidenceCard
                  icon={FaMapMarkerAlt}
                  label="Origin"
                  value="MEDIUM"
                  detail="Network geolocation"
                  status="warning"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              REPLY ACTIONS
          ================================================== */}

          <div className="border-t border-[#DCE3EC] px-6 py-7 sm:px-8">

            <div className="mx-auto flex max-w-[1100px] flex-wrap gap-3">


              <button className="flex items-center gap-3 border border-[#DCE3EC] bg-white px-5 py-3 text-sm text-[#536273] transition hover:bg-[#F7F9FC]">

                <FaReply />

                Reply

              </button>


              <button className="flex items-center gap-3 border border-[#DCE3EC] bg-white px-5 py-3 text-sm text-[#536273] transition hover:bg-[#F7F9FC]">

                <FaReplyAll />

                Reply all

              </button>


              <button className="flex items-center gap-3 border border-[#DCE3EC] bg-white px-5 py-3 text-sm text-[#536273] transition hover:bg-[#F7F9FC]">

                <FaShare />

                Forward

              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   EVIDENCE CARD
========================================================= */

function EvidenceCard({
  icon: Icon,
  label,
  value,
  detail,
  status,
}) {

  const statusClasses = {

    safe: "text-[#047857]",

    warning: "text-[#B45309]",

    danger: "text-[#B91C1C]",

  };


  return (

    <div className="border border-[#DCE3EC] bg-white p-5">

      <div className="flex items-center justify-between">

        <Icon
          className="text-[#607080]"
          size={15}
        />

        <FaCheckCircle
          className={statusClasses[status]}
          size={12}
        />

      </div>


      <p className="mt-5 font-mono text-[9px] uppercase tracking-wider text-[#718096]">
        {label}
      </p>


      <p
        className={`
          mt-1
          font-mono
          text-sm
          font-semibold
          ${statusClasses[status]}
        `}
      >
        {value}
      </p>


      <p className="mt-2 text-xs text-[#718096]">
        {detail}
      </p>

    </div>

  );
}