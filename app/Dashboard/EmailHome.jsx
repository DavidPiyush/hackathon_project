"use client";

import React, { useState } from "react";

import {
  FaBars,
  FaSearch,
  FaSlidersH,
  FaQuestionCircle,
  FaCog,
  FaTh,
  FaPen,
  FaInbox,
  FaStar,
  FaClock,
  FaPaperPlane,
  FaFileAlt,
  FaPlus,
  FaTag,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTrash,
  FaEllipsisV,
  FaChevronLeft,
  FaChevronRight,
  FaPaperclip,
  FaArchive,
  FaProjectDiagram,
} from "react-icons/fa";

import EmailContent from "./EmailContent";


export default function EmailHome() {

  // =====================================================
  // STATES
  // =====================================================

  const [activeTab, setActiveTab] = useState("Primary");

  const [selectedEmails, setSelectedEmails] = useState([]);

  const [search, setSearch] = useState("");

  // This stores the email currently being opened
  const [openedEmail, setOpenedEmail] = useState(null);


  // =====================================================
  // EMAIL DATA
  // =====================================================

  const emails = [

    {
      id: 1,
      sender: "Security Operations",
      senderEmail: "security@northstar-secure.com",
      subject: "New suspicious message detected",
      preview:
        "A potentially malicious email has been flagged for further investigation.",
      time: "11:42",
      category: "Primary",
      unread: true,
      risk: "high",
      attachment: false,

      body: {
        greeting: "Hello Security Team,",
        paragraphs: [
          "Our monitoring system has detected a suspicious message that requires additional investigation.",
          "The message contains characteristics commonly associated with credential harvesting and social engineering attempts.",
          "Please review the available evidence before taking any further action."
        ],
        action: "Review the investigation evidence before interacting with the message."
      }
    },


    {
      id: 2,
      sender: "Threat Intelligence",
      senderEmail: "intel@mailtrace-secure.com",
      subject: "Infrastructure intelligence update",
      preview:
        "New indicators have been correlated with previously observed activity.",
      time: "10:58",
      category: "Updates",
      unread: true,
      risk: "medium",
      attachment: true,

      body: {
        greeting: "Hello Analyst,",
        paragraphs: [
          "The latest infrastructure intelligence cycle has identified several indicators that overlap with previously observed activity.",
          "The associated domains, network infrastructure and historical observations have been added to the intelligence registry.",
          "Analysts are advised to review the related cases before closing the investigation."
        ],
        action: "Review the correlated infrastructure and related investigations."
      }
    },


    {
      id: 3,
      sender: "Case Management",
      senderEmail: "cases@mailtrace-secure.com",
      subject: "Investigation IR-2026-018 requires review",
      preview:
        "The latest analysis contains findings that require analyst attention.",
      time: "09:34",
      category: "Primary",
      unread: true,
      risk: "high",
      attachment: false,

      body: {
        greeting: "Hello Analyst,",
        paragraphs: [
          "Investigation IR-2026-018 has reached the review stage.",
          "The analysis contains multiple findings that require analyst verification before the case can be finalized.",
          "Please examine the evidence chain and confirm whether the current classification is appropriate."
        ],
        action: "Open the investigation and verify the findings."
      }
    },


    {
      id: 4,
      sender: "MAILTRACE System",
      senderEmail: "system@mailtrace.local",
      subject: "Analysis completed successfully",
      preview:
        "Your submitted email has completed all available investigation stages.",
      time: "08:52",
      category: "Primary",
      unread: false,
      risk: "safe",
      attachment: false,

      body: {
        greeting: "Hello Analyst,",
        paragraphs: [
          "The submitted email has completed the configured investigation pipeline.",
          "Header analysis, authentication checks, infrastructure enrichment and classification have been processed successfully.",
          "The resulting evidence is now available in your investigation workspace."
        ],
        action: "Open the investigation report to review the findings."
      }
    },


    {
      id: 5,
      sender: "Threat Research",
      senderEmail: "research@mailtrace-secure.com",
      subject: "Weekly threat intelligence briefing",
      preview:
        "Review the latest phishing, spoofing and business email compromise trends.",
      time: "Yesterday",
      category: "Updates",
      unread: false,
      risk: "medium",
      attachment: true,

      body: {
        greeting: "Hello Team,",
        paragraphs: [
          "This week's intelligence briefing contains several notable email security trends.",
          "The report covers phishing infrastructure, impersonation techniques and business email compromise activity.",
          "The attached briefing provides additional context for ongoing investigations."
        ],
        action: "Review the latest threat intelligence briefing."
      }
    },


    {
      id: 6,
      sender: "SOC Alerts",
      senderEmail: "alerts@mailtrace-secure.com",
      subject: "Multiple cases share the same infrastructure",
      preview:
        "Three investigations appear to be connected through common network indicators.",
      time: "Yesterday",
      category: "Primary",
      unread: false,
      risk: "high",
      attachment: false,

      body: {
        greeting: "Hello SOC Team,",
        paragraphs: [
          "Our correlation engine has identified common infrastructure between multiple investigations.",
          "The shared indicators include network addresses and domain-level observations.",
          "These relationships may indicate that the cases belong to the same campaign."
        ],
        action: "Review the evidence graph and linked investigations."
      }
    },


    {
      id: 7,
      sender: "Evidence Engine",
      senderEmail: "evidence@mailtrace.local",
      subject: "Evidence integrity verification complete",
      preview:
        "The original evidence hash and audit chain have been successfully verified.",
      time: "5 Sept",
      category: "Updates",
      unread: false,
      risk: "safe",
      attachment: false,

      body: {
        greeting: "Hello Analyst,",
        paragraphs: [
          "Evidence integrity verification has completed successfully.",
          "The original message hash matches the stored evidence record.",
          "The audit chain remains consistent with the recorded investigation events."
        ],
        action: "View the evidence integrity details."
      }
    },


    {
      id: 8,
      sender: "Analyst Workspace",
      senderEmail: "workspace@mailtrace.local",
      subject: "Your investigation report is ready",
      preview:
        "The forensic report has been generated and is available for review.",
      time: "5 Sept",
      category: "Primary",
      unread: false,
      risk: "safe",
      attachment: true,

      body: {
        greeting: "Hello Analyst,",
        paragraphs: [
          "Your investigation report has been generated successfully.",
          "The report contains the classification, supporting evidence, infrastructure observations and analysis summary.",
          "You can review the report before exporting or sharing it with authorized users."
        ],
        action: "Open the investigation report."
      }
    },


    {
      id: 9,
      sender: "MAILTRACE",
      senderEmail: "intelligence@mailtrace.local",
      subject: "New campaign correlation found",
      preview:
        "A previously unknown relationship between two cases has been identified.",
      time: "4 Sept",
      category: "Primary",
      unread: false,
      risk: "medium",
      attachment: false,

      body: {
        greeting: "Hello Analyst,",
        paragraphs: [
          "The correlation engine has discovered a previously unknown relationship between two investigations.",
          "The relationship is based on overlapping infrastructure indicators.",
          "Additional investigation is recommended before assigning a campaign classification."
        ],
        action: "Review the campaign correlation."
      }
    },


    {
      id: 10,
      sender: "System Monitor",
      senderEmail: "monitor@mailtrace.local",
      subject: "Threat intelligence provider status",
      preview:
        "All configured intelligence providers are currently operational.",
      time: "4 Sept",
      category: "Updates",
      unread: false,
      risk: "safe",
      attachment: false,

      body: {
        greeting: "Hello Analyst,",
        paragraphs: [
          "All configured threat intelligence providers are currently operational.",
          "No provider availability issues have been detected during the latest health check.",
          "Intelligence enrichment services are ready for new investigations."
        ],
        action: "No action is currently required."
      }
    }

  ];


  // =====================================================
  // FILTER EMAILS
  // =====================================================

  const filteredEmails = emails.filter((email) => {

    const matchesTab =
      activeTab === "Primary"
        ? email.category === "Primary"
        : email.category === activeTab;


    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      email.sender.toLowerCase().includes(searchText) ||
      email.subject.toLowerCase().includes(searchText) ||
      email.preview.toLowerCase().includes(searchText);


    return matchesTab && matchesSearch;

  });


  // =====================================================
  // SELECT EMAIL
  // =====================================================

  const toggleEmail = (id) => {

    setSelectedEmails((previous) => {

      if (previous.includes(id)) {
        return previous.filter((emailId) => emailId !== id);
      }

      return [...previous, id];

    });

  };


  // =====================================================
  // SELECT ALL
  // =====================================================

  const selectAll = () => {

    if (selectedEmails.length === filteredEmails.length) {

      setSelectedEmails([]);

    } else {

      setSelectedEmails(
        filteredEmails.map((email) => email.id)
      );

    }

  };


  // =====================================================
  // OPENED EMAIL
  // =====================================================

  if (openedEmail) {

    return (
      <EmailContent
        email={openedEmail}
        onBack={() => setOpenedEmail(null)}
      />
    );

  }


  // =====================================================
  // INBOX UI
  // =====================================================

  return (

    <div className="flex h-screen overflow-hidden bg-[#F7F9FC] text-[#172033]">


      {/* =================================================
          SIDEBAR
      ================================================== */}

      <aside className="hidden w-[250px] shrink-0 border-r border-[#DCE3EC] bg-[#F7F9FC] lg:block">


        {/* LOGO */}

        <div className="flex h-[70px] items-center gap-3 px-6">

          <div className="flex h-9 w-9 items-center justify-center bg-[#0A1628] text-[#22D3EE]">

            <FaShieldAlt size={17} />

          </div>


          <div>

            <h1 className="text-[18px] font-semibold tracking-tight">
              MAILTRACE
            </h1>

            <p className="font-mono text-[8px] tracking-[0.15em] text-[#718096]">
              SECURITY WORKSPACE
            </p>

          </div>

        </div>


        {/* NEW INVESTIGATION */}

        <div className="px-4 pt-3">

          <button
            className="
              flex w-full items-center gap-4
              bg-[#DFF6FA]
              px-5 py-4
              text-sm font-medium
              text-[#0A1628]
              transition
              hover:bg-[#C9F0F5]
            "
          >

            <FaPen className="text-[#0E7490]" />

            New Investigation

          </button>

        </div>


        {/* NAVIGATION */}

        <nav className="mt-6 px-3">

          <SidebarItem
            icon={FaInbox}
            label="Inbox"
            count="24"
            active
          />

          <SidebarItem
            icon={FaStar}
            label="Starred"
          />

          <SidebarItem
            icon={FaClock}
            label="Pending Review"
            count="7"
          />

          <SidebarItem
            icon={FaPaperPlane}
            label="Sent"
          />

          <SidebarItem
            icon={FaFileAlt}
            label="Reports"
          />

          <SidebarItem
            icon={FaTag}
            label="IOC Registry"
            count="12"
          />

        </nav>


        {/* INVESTIGATION LABELS */}

        <div className="mt-8 px-6">

          <div className="mb-4 flex items-center justify-between">

            <span className="font-mono text-[9px] uppercase tracking-widest text-[#718096]">
              Investigation
            </span>

            <FaPlus className="text-[10px] text-[#718096]" />

          </div>


          <div className="space-y-4">

            <LabelItem
              color="bg-[#EF4444]"
              label="High Risk"
              count="8"
            />

            <LabelItem
              color="bg-[#F59E0B]"
              label="Needs Review"
              count="13"
            />

            <LabelItem
              color="bg-[#10B981]"
              label="Benign"
              count="42"
            />

          </div>

        </div>

      </aside>


      {/* =================================================
          MAIN
      ================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">


        {/* TOP BAR */}

        <header className="flex h-[70px] shrink-0 items-center gap-4 border-b border-[#DCE3EC] bg-[#F7F9FC] px-4 lg:px-6">


          {/* MOBILE MENU */}

          <button className="flex h-10 w-10 items-center justify-center text-[#536273] lg:hidden">

            <FaBars />

          </button>


          {/* SEARCH */}

          <div className="flex h-12 max-w-[820px] flex-1 items-center bg-[#EAF0F6] px-4">

            <FaSearch className="mr-4 shrink-0 text-[#536273]" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search investigations, senders, domains..."
              className="
                w-full
                bg-transparent
                text-sm
                outline-none
                placeholder:text-[#7C8795]
              "
            />

            <FaSlidersH className="hidden text-[#536273] sm:block" />

          </div>


          {/* HEADER ICONS */}

          <div className="ml-auto hidden items-center gap-6 text-[#536273] md:flex">

            <button>
              <FaQuestionCircle />
            </button>

            <button>
              <FaCog />
            </button>

            <button>
              <FaTh />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A1628] text-xs font-semibold text-[#22D3EE]">
              AR
            </div>

          </div>

        </header>


        {/* CONTENT */}

        <div className="flex min-h-0 flex-1">


          {/* EMAIL SECTION */}

          <section className="min-w-0 flex-1">


            {/* TOOLBAR */}

            <div className="flex h-14 items-center border-b border-[#DCE3EC] px-4">

              <div className="flex items-center gap-5 text-[#536273]">

                <input
                  type="checkbox"
                  checked={
                    filteredEmails.length > 0 &&
                    selectedEmails.length === filteredEmails.length
                  }
                  onChange={selectAll}
                  className="h-4 w-4 accent-[#0A1628]"
                />

                <button>
                  <FaArchive size={13} />
                </button>

                <button>
                  <FaTrash size={13} />
                </button>

                <button>
                  <FaEllipsisV size={13} />
                </button>

              </div>


              <div className="ml-auto flex items-center gap-5 text-xs text-[#718096]">

                <span>
                  1–{filteredEmails.length} of 24
                </span>

                <button>
                  <FaChevronLeft />
                </button>

                <button>
                  <FaChevronRight />
                </button>

              </div>

            </div>


            {/* CATEGORY TABS */}

            <div className="flex overflow-x-auto border-b border-[#DCE3EC] bg-white">

              <CategoryTab
                icon={FaInbox}
                label="Primary"
                active={activeTab === "Primary"}
                onClick={() => setActiveTab("Primary")}
                count="8"
              />

              <CategoryTab
                icon={FaShieldAlt}
                label="Threat Alerts"
                active={activeTab === "Threat Alerts"}
                onClick={() => setActiveTab("Threat Alerts")}
                count="5"
              />

              <CategoryTab
                icon={FaTag}
                label="Updates"
                active={activeTab === "Updates"}
                onClick={() => setActiveTab("Updates")}
                count="11"
              />

            </div>


            {/* EMAIL LIST */}

            <div className="overflow-y-auto">

              {filteredEmails.map((email) => (

                <EmailRow
                  key={email.id}
                  email={email}
                  selected={selectedEmails.includes(email.id)}
                  onSelect={() => toggleEmail(email.id)}
                  onOpen={() => setOpenedEmail(email)}
                />

              ))}


              {filteredEmails.length === 0 && (

                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

                  <div className="mb-4 flex h-14 w-14 items-center justify-center bg-[#EAF0F6] text-[#718096]">

                    <FaSearch />

                  </div>

                  <h3 className="font-medium">
                    No investigations found
                  </h3>

                  <p className="mt-2 max-w-sm text-sm text-[#718096]">
                    Try changing your search or selecting another category.
                  </p>

                </div>

              )}

            </div>

          </section>


          {/* RIGHT RAIL */}

          <aside className="hidden w-[62px] shrink-0 border-l border-[#DCE3EC] bg-[#F7F9FC] xl:block">

            <div className="flex flex-col items-center gap-7 pt-5 text-[#607080]">

              <RailIcon icon={FaShieldAlt} />

              <RailIcon icon={FaExclamationTriangle} />

              <RailIcon icon={FaCheckCircle} />

              <RailIcon icon={FaProjectDiagram} />

              <div className="my-2 h-px w-8 bg-[#DCE3EC]" />

              <RailIcon icon={FaPlus} />

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon: Icon,
  label,
  count,
  active = false,
}) {

  return (

    <button
      className={`
        flex w-full items-center gap-4
        px-4 py-2.5
        text-sm
        transition
        ${
          active
            ? "bg-[#DCEFF7] font-semibold text-[#0A1628]"
            : "text-[#536273] hover:bg-[#EDF2F7]"
        }
      `}
    >

      <Icon className="w-4 shrink-0" />

      <span className="flex-1 text-left">
        {label}
      </span>

      {count && (
        <span className="font-mono text-[10px] text-[#536273]">
          {count}
        </span>
      )}

    </button>

  );
}


/* =========================================================
   LABEL ITEM
========================================================= */

function LabelItem({
  color,
  label,
  count,
}) {

  return (

    <div className="flex items-center gap-3 text-xs text-[#536273]">

      <span className={`h-2 w-2 rounded-full ${color}`} />

      <span className="flex-1">
        {label}
      </span>

      <span className="font-mono text-[10px] text-[#718096]">
        {count}
      </span>

    </div>

  );
}


/* =========================================================
   CATEGORY TAB
========================================================= */

function CategoryTab({
  icon: Icon,
  label,
  active,
  onClick,
  count,
}) {

  return (

    <button
      onClick={onClick}
      className={`
        relative flex min-w-[150px]
        items-center gap-3
        px-5 py-4
        text-sm
        transition
        ${
          active
            ? "font-semibold text-[#0A1628]"
            : "text-[#718096] hover:bg-[#F7F9FC]"
        }
      `}
    >

      <Icon
        className={
          active
            ? "text-[#0E7490]"
            : "text-[#718096]"
        }
      />

      <span>
        {label}
      </span>

      <span
        className={`
          rounded-full px-1.5 py-0.5
          font-mono text-[9px]
          ${
            active
              ? "bg-[#DFF6FA] text-[#0E7490]"
              : "bg-[#EDF2F7] text-[#718096]"
          }
        `}
      >
        {count}
      </span>


      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2563EB]" />
      )}

    </button>

  );
}


/* =========================================================
   EMAIL ROW
========================================================= */

function EmailRow({
  email,
  selected,
  onSelect,
  onOpen,
}) {

  return (

    <div
      onClick={onOpen}
      className={`
        group flex min-h-[65px]
        cursor-pointer
        items-center gap-3
        border-b border-[#E1E6ED]
        px-4
        transition
        ${
          email.unread
            ? "bg-white"
            : "bg-[#F9FAFC]"
        }
        hover:bg-[#EEF5FA]
      `}
    >


      {/* CHECKBOX */}

      <input
        type="checkbox"
        checked={selected}
        onClick={(event) => event.stopPropagation()}
        onChange={onSelect}
        className="h-4 w-4 shrink-0 accent-[#0A1628]"
      />


      {/* STAR */}

      <button
        onClick={(event) => event.stopPropagation()}
        className="
          shrink-0
          text-[#B4BDC8]
          transition
          hover:text-[#F59E0B]
        "
      >

        <FaStar size={15} />

      </button>


      {/* RISK DOT */}

      <div className="w-4 shrink-0">

        {email.risk === "high" && (
          <span
            title="High risk"
            className="block h-2 w-2 rounded-full bg-[#EF4444]"
          />
        )}

        {email.risk === "medium" && (
          <span
            title="Needs review"
            className="block h-2 w-2 rounded-full bg-[#F59E0B]"
          />
        )}

        {email.risk === "safe" && (
          <span
            title="Safe"
            className="block h-2 w-2 rounded-full bg-[#10B981]"
          />
        )}

      </div>


      {/* SENDER */}

      <div
        className={`
          w-[180px]
          shrink-0
          truncate
          text-sm
          ${
            email.unread
              ? "font-bold text-[#172033]"
              : "text-[#344054]"
          }
        `}
      >
        {email.sender}
      </div>


      {/* SUBJECT */}

      <div className="min-w-0 flex-1 truncate text-sm">

        <span
          className={
            email.unread
              ? "font-semibold text-[#172033]"
              : "text-[#344054]"
          }
        >
          {email.subject}
        </span>

        <span className="text-[#718096]">
          {" "}— {email.preview}
        </span>

      </div>


      {/* ATTACHMENT */}

      {email.attachment && (
        <FaPaperclip
          className="hidden shrink-0 text-[#718096] sm:block"
          size={13}
        />
      )}


      {/* TIME */}

      <div
        className={`
          w-[70px]
          shrink-0
          text-right
          text-xs
          ${
            email.unread
              ? "font-bold text-[#172033]"
              : "text-[#718096]"
          }
        `}
      >
        {email.time}
      </div>


      {/* HOVER ACTIONS */}

      <div
        className="
          hidden
          items-center
          gap-3
          bg-[#EEF5FA]
          pl-2
          group-hover:flex
        "
      >

        <button
          onClick={(event) => event.stopPropagation()}
          className="text-[#536273] hover:text-[#0A1628]"
        >
          <FaArchive size={12} />
        </button>

        <button
          onClick={(event) => event.stopPropagation()}
          className="text-[#536273] hover:text-[#0A1628]"
        >
          <FaTrash size={12} />
        </button>

      </div>

    </div>

  );
}


/* =========================================================
   RIGHT RAIL
========================================================= */

function RailIcon({ icon: Icon }) {

  return (

    <button
      className="
        flex h-9 w-9
        items-center justify-center
        text-[#607080]
        transition
        hover:bg-[#EAF0F6]
        hover:text-[#0A1628]
      "
    >
      <Icon size={15} />
    </button>

  );

}