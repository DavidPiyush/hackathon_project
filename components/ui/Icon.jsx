import {
  FaShieldHalved,
  FaBell,
  FaUser,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaHouse,
  FaEnvelope,
  FaEnvelopeOpen,
  FaMagnifyingGlass,
  FaFolderOpen,
  FaNetworkWired,
  FaGlobe,
  FaFileLines,
  FaGear,
  FaCircleQuestion,
  FaBars,
  FaXmark,
  FaPuzzlePiece,
  FaCircleInfo,
  FaArrowRight,
  FaArrowLeft,
  FaArrowUpRightFromSquare,
  FaCheck,
  FaCircleCheck,
  FaTriangleExclamation,
  FaClock,
  FaPaperclip,
  FaLink,
  FaLock,
  FaFingerprint,
  FaBrain,
  FaDiagramProject,
  FaMapLocationDot,
  FaLocationDot,
  FaDatabase,
  FaServer,
  FaCode,
  FaTerminal,
  FaBug,
  FaStar,
  FaReply,
  FaShare,
  FaPrint,
  FaCopy,
  FaTrash,
  FaBoxArchive,
  FaEllipsisVertical,
  FaFilter,
  FaSliders,
  FaTag,
  FaPlus,
  FaInbox,
  FaPaperPlane,
  FaChartLine,
  FaGithub,
  FaLinkedin,
  FaHeadset,
  FaEye,
  FaDownload,
  FaUpload,
  FaKey,
  FaSitemap,
  FaListCheck,
  FaBan,
  FaRotate,
  FaFileShield,
  FaLayerGroup,
  FaBolt,
  FaCircleNodes,
  FaScaleBalanced,
  FaBookOpen,
  FaGaugeHigh,
} from "react-icons/fa6";

/**
 * Single icon registry for the whole platform.
 *
 * Data modules reference icons by semantic name instead of importing a
 * component, which keeps `lib/data/*` free of UI imports and lets tests assert
 * that every configured icon name actually resolves.
 *
 * Everything comes from `react-icons/fa6` — mixing Font Awesome 5 and 6 would
 * ship two icon sets to the browser.
 */
export const icons = {
  shield: FaShieldHalved,
  "shield-file": FaFileShield,
  bell: FaBell,
  user: FaUser,
  "chevron-down": FaChevronDown,
  "chevron-left": FaChevronLeft,
  "chevron-right": FaChevronRight,
  home: FaHouse,
  envelope: FaEnvelope,
  "envelope-open": FaEnvelopeOpen,
  search: FaMagnifyingGlass,
  folder: FaFolderOpen,
  network: FaNetworkWired,
  globe: FaGlobe,
  file: FaFileLines,
  gear: FaGear,
  help: FaCircleQuestion,
  bars: FaBars,
  close: FaXmark,
  puzzle: FaPuzzlePiece,
  info: FaCircleInfo,
  "arrow-right": FaArrowRight,
  "arrow-left": FaArrowLeft,
  external: FaArrowUpRightFromSquare,
  check: FaCheck,
  "check-circle": FaCircleCheck,
  warning: FaTriangleExclamation,
  clock: FaClock,
  paperclip: FaPaperclip,
  link: FaLink,
  lock: FaLock,
  fingerprint: FaFingerprint,
  brain: FaBrain,
  graph: FaDiagramProject,
  map: FaMapLocationDot,
  pin: FaLocationDot,
  database: FaDatabase,
  server: FaServer,
  code: FaCode,
  terminal: FaTerminal,
  bug: FaBug,
  star: FaStar,
  reply: FaReply,
  share: FaShare,
  print: FaPrint,
  copy: FaCopy,
  trash: FaTrash,
  archive: FaBoxArchive,
  more: FaEllipsisVertical,
  filter: FaFilter,
  sliders: FaSliders,
  tag: FaTag,
  plus: FaPlus,
  inbox: FaInbox,
  send: FaPaperPlane,
  chart: FaChartLine,
  github: FaGithub,
  linkedin: FaLinkedin,
  headset: FaHeadset,
  eye: FaEye,
  download: FaDownload,
  upload: FaUpload,
  key: FaKey,
  sitemap: FaSitemap,
  checklist: FaListCheck,
  ban: FaBan,
  refresh: FaRotate,
  layers: FaLayerGroup,
  bolt: FaBolt,
  nodes: FaCircleNodes,
  scale: FaScaleBalanced,
  book: FaBookOpen,
  gauge: FaGaugeHigh,
};

/**
 * Render a registered icon by name.
 *
 * Decorative by default (`aria-hidden`), because icons in this app almost
 * always sit next to a text label. Pass a `label` only when the icon is the
 * sole carrier of meaning.
 */
export function Icon({ name, label, className, ...props }) {
  const Glyph = icons[name];

  if (!Glyph) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Icon: unknown icon name "${name}"`);
    }

    return null;
  }

  return (
    <Glyph
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      {...props}
    />
  );
}

export default Icon;
