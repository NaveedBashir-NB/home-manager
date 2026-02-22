import jsPDF from "jspdf";

// ─────────────────────────────────────────────────────────────────────────────
// Font loader — fetches Poppins & Playfair Display from Google Fonts,
// converts to base64, and registers them with jsPDF at runtime.
// Call once before generating any PDF.
// ─────────────────────────────────────────────────────────────────────────────
const fontCache = {};

async function loadFont(url) {
  if (fontCache[url]) return fontCache[url];
  const res    = await fetch(url);
  const buffer = await res.arrayBuffer();
  const bytes  = new Uint8Array(buffer);
  let binary   = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  fontCache[url] = b64;
  return b64;
}

async function registerFonts(doc) {
  // Google Fonts static file URLs (direct .ttf links)
  const fonts = [
    {
      url:    "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLGT9Z1xlEA.ttf",
      name:   "Poppins",
      style:  "normal",
    },
    {
      url:    "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7Z1xlEA.ttf",
      name:   "Poppins",
      style:  "bold",
    },
    {
      url:    "https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6Z1xlEA.ttf",
      name:   "Poppins",
      style:  "semibold",   // registered as a separate "style" for convenience
    },
    {
      url:    "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYh467nEhdLA.ttf",
      name:   "PlayfairDisplay",
      style:  "normal",
    },
    {
      url:    "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFlD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_pqYZQ.ttf",
      name:   "PlayfairDisplay",
      style:  "bold",
    },
  ];

  for (const { url, name, style } of fonts) {
    const b64 = await loadFont(url);
    doc.addFileToVFS(`${name}-${style}.ttf`, b64);
    doc.addFont(`${name}-${style}.ttf`, name, style);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates and downloads a PDF report of filtered items, grouped by category.
 *
 * @param {Array}  filteredItems  - The currently filtered items array
 * @param {string} categoryFilter - Active category filter label
 * @param {string} statusFilter   - Active status filter label
 * @param {Object} user           - Session user object { name, email }
 */
export async function generateItemsPDF(filteredItems, categoryFilter, statusFilter, user) {
  const doc      = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const PAGE_W   = doc.internal.pageSize.getWidth();   // 595
  const PAGE_H   = doc.internal.pageSize.getHeight();  // 842
  const MARGIN   = 44;
  const CONTENT_W = PAGE_W - MARGIN * 2;               // 507

  // Register Google Fonts into jsPDF
  await registerFonts(doc);

  // ─── Font shortcuts ─────────────────────────────────────────────────────────
  // PLAYFAIR  → headings, app title, item names  (matches --font-serif in CSS)
  // POPPINS   → body, labels, badges, metadata   (matches --font-sans in CSS)
  const PLAYFAIR = "PlayfairDisplay";
  const POPPINS  = "Poppins";

  const fnt = (family, style, size) => {
    doc.setFont(family, style);
    doc.setFontSize(size);
  };

  // ─── Colour palette — matched to CSS theme ──────────────────────────────────
  // Brand yellow:  --color-primary  oklch(0.86 0.17 96) ≈ #facc15
  // Dark text:     --color-gray-900 oklch(0.18 0.005 270) ≈ #1c1c24
  // Muted:         --color-gray-500 oklch(0.52 0.012 270) ≈ #6b7280
  // Light bg:      --color-gray-50  oklch(0.98 0.002 270) ≈ #f9f9fb
  // Border:        --color-gray-200 oklch(0.88 0.005 270) ≈ #e2e2ea
  const C = {
    // Brand
    yellow:      [250, 204,  21],   // #facc15 — primary
    yellowMid:   [253, 224,  71],   // #fde047 — primary-light
    yellowDark:  [202, 138,   4],   // #ca8a04 — primary-dark
    yellowText:  [120,  80,   0],   // readable amber on light bg
    yellowLight: [254, 252, 232],   // #fefce8 — very light tint

    // Neutrals
    charcoal:    [ 28,  28,  36],   // gray-900
    dark:        [ 45,  45,  58],   // gray-800
    mid:         [ 75,  75,  90],   // gray-700
    muted:       [107, 114, 128],   // gray-500
    subtle:      [156, 163, 175],   // gray-400
    border:      [226, 226, 234],   // gray-200
    bgLight:     [249, 249, 251],   // gray-50
    cardBg:      [252, 252, 255],
    white:       [255, 255, 255],
    rowWhite:    [255, 255, 255],
    rowAlt:      [248, 248, 252],   // barely-there stripe

    // Status colours (matches dashboard badge colours)
    green:       [220, 252, 231],   // green-100
    greenText:   [ 22, 101,  52],   // green-800
    blue:        [219, 234, 254],   // blue-100
    blueText:    [ 30,  64, 175],   // blue-800
    amberLight:  [254, 243, 199],   // yellow-100
    amberText:   [146,  64,  14],   // yellow-800
  };

  // ─── Column layout ───────────────────────────────────────────────────────────
  const COL = { srW: 32, nameW: 138, descW: 247, statW: 90 };
  const X   = {
    sr:   MARGIN,
    name: MARGIN + COL.srW,
    desc: MARGIN + COL.srW + COL.nameW,
    stat: MARGIN + COL.srW + COL.nameW + COL.descW,
  };
  const ROW_H  = 25;
  const HEAD_H = 27;
  const PAD_L  =  7;
  const PAD_TOP = 17;

  // ─── Meta ────────────────────────────────────────────────────────────────────
  const now      = new Date();
  const dateStr  = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const timeStr  = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const reportId = "RPT-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  // ─── Drawing helpers ─────────────────────────────────────────────────────────
  const fill   = (...rgb) => doc.setFillColor(...rgb);
  const stroke = (...rgb) => doc.setDrawColor(...rgb);
  const color  = (...rgb) => doc.setTextColor(...rgb);
  const lw     = (w)      => doc.setLineWidth(w);
  const drawRect = (x, y, w, h, mode = "F") => doc.rect(x, y, w, h, mode);
  const drawLine = (x1, y1, x2, y2)          => doc.line(x1, y1, x2, y2);
  const drawText = (str, x, y, opts)          => doc.text(String(str), x, y, opts || {});

  const cellBox = (bg, x, y, w, h) => {
    fill(...bg);         drawRect(x, y, w, h, "F");
    stroke(...C.border); lw(0.35); drawRect(x, y, w, h, "S");
  };

  const cellText = (str, x, y, maxW, align = "left") => {
    const s = doc.splitTextToSize(String(str ?? "—"), maxW - PAD_L * 2)[0] || "";
    const display = doc.getTextWidth(s) > maxW - PAD_L * 2 ? s.slice(0, -2) + "…" : s;
    if (align === "center") drawText(display, x + maxW / 2, y + PAD_TOP, { align: "center" });
    else                    drawText(display, x + PAD_L,    y + PAD_TOP);
  };

  const statusLabel = (s) => {
    if (s === "completed")    return "Completed";
    if (s === "future-needs") return "Future Needs";
    return "Pending";
  };
  const statusStyle = (label) => {
    if (label === "Completed")    return { bg: C.green,      txt: C.greenText };
    if (label === "Future Needs") return { bg: C.blue,       txt: C.blueText  };
    return                               { bg: C.amberLight, txt: C.amberText };
  };

  // ─── Page cursor ─────────────────────────────────────────────────────────────
  let cursorY = 0;
  const ensureSpace = (needed) => {
    if (cursorY + needed > PAGE_H - 50) {
      doc.addPage();
      cursorY = MARGIN;
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // 1. HEADER BANNER
  // ══════════════════════════════════════════════════════════════════════════════
  const BANNER_H = 82;

  // Main yellow fill
  fill(...C.yellow); drawRect(0, 0, PAGE_W, BANNER_H, "F");

  // Subtle darker stripe at bottom of banner
  fill(...C.yellowDark); drawRect(0, BANNER_H - 3, PAGE_W, 3, "F");

  // App title — Playfair Display Bold (matches --font-serif)
  fnt(PLAYFAIR, "bold", 26); color(...C.white);
  drawText("Household Manager", MARGIN, 36);

  // Sub-title — Poppins Regular, warm tint so it sits gently under the title
  fnt(POPPINS, "normal", 10); color(255, 248, 200);
  drawText("Filtered Items Report", MARGIN, 55);

  // Report meta — top right, Poppins small
  fnt(POPPINS, "normal", 7.5); color(255, 245, 185);
  drawText(`Report ID: ${reportId}`, PAGE_W - MARGIN, 30, { align: "right" });
  drawText(dateStr,                  PAGE_W - MARGIN, 44, { align: "right" });
  drawText(timeStr,                  PAGE_W - MARGIN, 57, { align: "right" });

  // ══════════════════════════════════════════════════════════════════════════════
  // 2. SUMMARY CARD  — 24pt gap below banner
  // ══════════════════════════════════════════════════════════════════════════════
  const CARD_Y = BANNER_H + 24;
  const CARD_H = 106;

  // Drop shadow (offset filled rect)
  fill(210, 210, 222); drawRect(MARGIN + 2, CARD_Y + 2, CONTENT_W, CARD_H, "F");

  // Card body
  fill(...C.cardBg); drawRect(MARGIN, CARD_Y, CONTENT_W, CARD_H, "F");
  stroke(...C.border); lw(0.6); drawRect(MARGIN, CARD_Y, CONTENT_W, CARD_H, "S");

  // Left accent bar — brand yellow
  fill(...C.yellow); drawRect(MARGIN, CARD_Y, 5, CARD_H, "F");

  // "REPORT SUMMARY" label — Poppins small caps feel
  fnt(POPPINS, "bold", 7); color(...C.muted);
  drawText("REPORT SUMMARY", MARGIN + 14, CARD_Y + 14);

  // Thin rule under label
  stroke(...C.border); lw(0.4);
  drawLine(MARGIN + 14, CARD_Y + 18, MARGIN + CONTENT_W - 14, CARD_Y + 18);

  const lx1 = MARGIN + 14,   vx1 = MARGIN + 122;
  const lx2 = MARGIN + 268,  vx2 = MARGIN + 375;
  let infoY = CARD_Y + 32;
  const INFO_LINE = 20;

  const metaRows = [
    ["User",          user?.name  || "—",           "Email",    user?.email || "—"],
    ["Status Filter", statusFilter === "all" ? "All Statuses" : statusFilter,
                                                    "Category", categoryFilter === "all" ? "All Categories" : categoryFilter],
    ["Total Items",   String(filteredItems.length),  "Date",     dateStr],
    ["Report ID",     reportId,                      "Time",     timeStr],
  ];

  metaRows.forEach(([l1, v1, l2, v2]) => {
    // Labels — Poppins Bold muted
    fnt(POPPINS, "bold", 7.5); color(...C.muted);
    drawText(l1 + ":", lx1, infoY);
    drawText(l2 + ":", lx2, infoY);
    // Values — Poppins Regular dark
    fnt(POPPINS, "normal", 8.5); color(...C.dark);
    drawText(v1, vx1, infoY);
    drawText(v2, vx2, infoY);
    infoY += INFO_LINE;
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // 3. "ITEM LIST" SECTION HEADING  — 32pt gap below card
  // ══════════════════════════════════════════════════════════════════════════════
  cursorY = CARD_Y + CARD_H + 32;

  // Heading — Playfair Display Bold (matches h1–h6 in CSS)
  fnt(PLAYFAIR, "bold", 16); color(...C.charcoal);
  drawText("Item List", MARGIN, cursorY);

  // Full-width subtle rule
  stroke(...C.border); lw(0.5);
  drawLine(MARGIN, cursorY + 7, MARGIN + CONTENT_W, cursorY + 7);

  // Short thick yellow accent on left
  stroke(...C.yellow); lw(2.5);
  drawLine(MARGIN, cursorY + 7, MARGIN + 72, cursorY + 7);

  cursorY += 24;   // gap between rule and first category pill

  // ══════════════════════════════════════════════════════════════════════════════
  // 4. GROUP BY CATEGORY
  // ══════════════════════════════════════════════════════════════════════════════
  const CATEGORY_ORDER = [
    "Food & Groceries",
    "Household Items / Supplies",
    "Personal Care",
    "Child Care",
    "Clothing & Accessories",
    "Medical & Healthcare",
    "Misc Items",
  ];

  const grouped = {};
  filteredItems.forEach((item) => {
    const cat = item.category || "Uncategorised";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const sortedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)).sort(),
  ];

  // ══════════════════════════════════════════════════════════════════════════════
  // 5. DRAW EACH CATEGORY SECTION
  // ══════════════════════════════════════════════════════════════════════════════
  sortedCategories.forEach((category) => {
    const items = [...grouped[category]].sort((a, b) => a.name.localeCompare(b.name));
    ensureSpace(28 + HEAD_H + ROW_H + 6);

    // ── Category pill ────────────────────────────────────────────────────────
    const PILL_H = 27;

    fill(...C.yellowLight); drawRect(MARGIN, cursorY, CONTENT_W, PILL_H, "F");
    stroke(...C.yellowMid); lw(0.7); drawRect(MARGIN, cursorY, CONTENT_W, PILL_H, "S");
    // Left accent
    fill(...C.yellow); drawRect(MARGIN, cursorY, 5, PILL_H, "F");

    // Category name — Playfair Display Bold (serif heading, matches CSS h4 style)
    fnt(PLAYFAIR, "bold", 11); color(...C.yellowText);
    drawText(category, MARGIN + 14, cursorY + 18);

    // Item count — Poppins small muted
    fnt(POPPINS, "normal", 7.5); color(...C.muted);
    drawText(
      `${items.length} item${items.length !== 1 ? "s" : ""}`,
      MARGIN + CONTENT_W - 8, cursorY + 18, { align: "right" }
    );

    cursorY += PILL_H;

    // ── Column header row — yellow theme, Poppins Bold ───────────────────────
    const colHeaders = [
      { label: "#",           x: X.sr,   w: COL.srW,   align: "center" },
      { label: "Item Name",   x: X.name, w: COL.nameW },
      { label: "Description", x: X.desc, w: COL.descW },
      { label: "Status",      x: X.stat, w: COL.statW },
    ];

    colHeaders.forEach(({ label, x, w, align }) => {
      // Header bg: slightly darker yellow-dark so it pairs with the pill above
      fill(...C.yellowDark); drawRect(x, cursorY, w, HEAD_H, "F");
      stroke(...C.border); lw(0.35); drawRect(x, cursorY, w, HEAD_H, "S");
      fnt(POPPINS, "bold", 8); color(...C.white);
      cellText(label, x, cursorY, w, align || "left");
    });

    cursorY += HEAD_H;

    // ── Data rows ────────────────────────────────────────────────────────────
    items.forEach((item, idx) => {
      ensureSpace(ROW_H);

      const rowBg = idx % 2 === 0 ? C.rowWhite : C.rowAlt;
      const sl    = statusLabel(item.status);
      const { bg: stBg, txt: stTxt } = statusStyle(sl);

      // Sr No. — Poppins muted
      cellBox(rowBg, X.sr, cursorY, COL.srW, ROW_H);
      fnt(POPPINS, "normal", 8); color(...C.muted);
      cellText(idx + 1, X.sr, cursorY, COL.srW, "center");

      // Item Name — Poppins SemiBold for emphasis (maps to font-weight-semibold)
      cellBox(rowBg, X.name, cursorY, COL.nameW, ROW_H);
      fnt(POPPINS, "bold", 8.5); color(...C.charcoal);
      cellText(item.name, X.name, cursorY, COL.nameW);

      // Description — Poppins Regular
      cellBox(rowBg, X.desc, cursorY, COL.descW, ROW_H);
      fnt(POPPINS, "normal", 8.5); color(...C.mid);
      cellText(item.description || "—", X.desc, cursorY, COL.descW);

      // Status — Poppins Bold with coloured bg + matching text
      cellBox(stBg, X.stat, cursorY, COL.statW, ROW_H);
      fnt(POPPINS, "bold", 7.5); color(...stTxt);
      cellText(sl, X.stat, cursorY, COL.statW);

      cursorY += ROW_H;
    });

    cursorY += 20;   // breathing room between category sections
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // 6. FOOTER — every page
  // ══════════════════════════════════════════════════════════════════════════════
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Footer band
    fill(245, 245, 250); drawRect(0, PAGE_H - 36, PAGE_W, 36, "F");
    stroke(...C.border); lw(0.5); drawLine(0, PAGE_H - 36, PAGE_W, PAGE_H - 36);

    fnt(POPPINS, "normal", 7.5); color(...C.muted);
    drawText("Household Manager  ·  Items Report", MARGIN, PAGE_H - 16);
    drawText(`Page ${p} of ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 16, { align: "right" });

    fnt(POPPINS, "normal", 7.5); color(...C.subtle);
    drawText(dateStr, PAGE_W / 2, PAGE_H - 16, { align: "center" });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // 7. SAVE
  // ══════════════════════════════════════════════════════════════════════════════
  doc.save(`items-report-${now.toISOString().slice(0, 10)}.pdf`);
}