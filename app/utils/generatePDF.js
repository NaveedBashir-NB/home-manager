import jsPDF from "jspdf";

/**
 * Generates and downloads a PDF report of the filtered items, grouped by category.
 * Pure jsPDF canvas drawing — no autoTable dependency.
 *
 * @param {Array}  filteredItems  - The currently filtered items array
 * @param {string} categoryFilter - Active category filter label
 * @param {string} statusFilter   - Active status filter label
 * @param {Object} user           - Session user object { name, email }
 */
export function generateItemsPDF(filteredItems, categoryFilter, statusFilter, user) {
  const doc      = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const PAGE_W   = doc.internal.pageSize.getWidth();   // 595
  const PAGE_H   = doc.internal.pageSize.getHeight();  // 842
  const MARGIN   = 44;
  const CONTENT_W = PAGE_W - MARGIN * 2;               // 507

  // ─── Font families ─────────────────────────────────────────────────────────
  // "times" = Times New Roman — professional serif, built into jsPDF
  // "helvetica" kept for small UI labels where sans-serif reads better at tiny sizes
  const SERIF = "times";
  const SANS  = "helvetica";

  // ─── Colour palette ────────────────────────────────────────────────────────
  const C = {
    yellow:      [234, 179,   8],   // primary brand
    yellowMid:   [253, 224,  71],   // softer yellow for gradient feel
    yellowLight: [255, 252, 220],   // tint for category pill bg
    yellowDark:  [101,  70,   0],   // dark amber text on light bg
    charcoal:    [ 28,  28,  35],   // near-black for headings
    dark:        [ 45,  45,  55],   // body text
    muted:       [120, 120, 135],   // labels / secondary text
    subtle:      [170, 170, 185],   // very faint — dividers
    white:       [255, 255, 255],
    rowWhite:    [255, 255, 255],
    rowAlt:      [248, 248, 252],   // barely-there stripe
    cardBg:      [252, 252, 255],   // summary card bg
    border:      [218, 218, 228],   // table/card borders
    green:       [209, 250, 229],   // status: completed
    greenText:   [ 22, 101,  52],
    blue:        [219, 234, 254],   // status: future needs
    blueText:    [ 30,  64, 175],
    amberText:   [146,  64,  14],   // status: pending text
  };

  // ─── Column widths & x-positions ───────────────────────────────────────────
  const COL = { srW: 32, nameW: 140, descW: 245, statW: 90 };
  const X   = {
    sr:   MARGIN,
    name: MARGIN + COL.srW,
    desc: MARGIN + COL.srW + COL.nameW,
    stat: MARGIN + COL.srW + COL.nameW + COL.descW,
  };

  const ROW_H    = 24;   // data row height
  const HEAD_H   = 26;   // table column header height
  const PAD_L    =  7;   // cell left padding
  const PAD_TOP  = 16;   // text baseline inside a cell (vertical centre for ROW_H=24)

  // ─── Meta ──────────────────────────────────────────────────────────────────
  const now      = new Date();
  const dateStr  = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const timeStr  = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const reportId = "RPT-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  // ─── Drawing helpers ───────────────────────────────────────────────────────
  const fill   = (...rgb) => doc.setFillColor(...rgb);
  const stroke = (...rgb) => doc.setDrawColor(...rgb);
  const color  = (...rgb) => doc.setTextColor(...rgb);
  const lw     = (w)      => doc.setLineWidth(w);
  const fnt    = (family, style, size) => { doc.setFont(family, style); doc.setFontSize(size); };

  const drawRect = (x, y, w, h, mode = "F") => doc.rect(x, y, w, h, mode);
  const drawLine = (x1, y1, x2, y2)          => doc.line(x1, y1, x2, y2);
  const drawText = (str, x, y, opts)          => doc.text(String(str), x, y, opts || {});

  /** Filled cell with border */
  const cellBox = (bg, x, y, w, h) => {
    fill(...bg);   drawRect(x, y, w, h, "F");
    stroke(...C.border); lw(0.35); drawRect(x, y, w, h, "S");
  };

  /** Single-line text inside a cell, truncated with … if too wide */
  const cellText = (str, x, y, maxW, align = "left") => {
    const s = doc.splitTextToSize(String(str ?? "—"), maxW - PAD_L * 2)[0] || "";
    const display = doc.getTextWidth(s) > maxW - PAD_L * 2 ? s.slice(0, -1) + "…" : s;
    if (align === "center") drawText(display, x + maxW / 2, y + PAD_TOP, { align: "center" });
    else                    drawText(display, x + PAD_L,    y + PAD_TOP);
  };

  // Status helpers
  const statusLabel = (s) => {
    if (s === "completed")    return "Completed";
    if (s === "future-needs") return "Future Needs";
    return "Pending";
  };
  const statusStyle = (label) => {
    if (label === "Completed")    return { bg: C.green,       txt: C.greenText  };
    if (label === "Future Needs") return { bg: C.blue,        txt: C.blueText   };
    return                               { bg: C.yellowLight, txt: C.amberText  };
  };

  // ─── Page cursor & overflow ─────────────────────────────────────────────────
  let cursorY = 0;
  const ensureSpace = (needed) => {
    if (cursorY + needed > PAGE_H - 50) {
      doc.addPage();
      cursorY = MARGIN;
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. HEADER BANNER
  // ══════════════════════════════════════════════════════════════════════════
  const BANNER_H = 78;

  // Main yellow band
  fill(...C.yellow); drawRect(0, 0, PAGE_W, BANNER_H, "F");

  // Thin bottom accent stripe (darker yellow)
  fill(...C.yellowDark); drawRect(0, BANNER_H - 3, PAGE_W, 3, "F");

  // App title — serif, large
  fnt(SERIF, "bold", 24); color(...C.white);
  drawText("Household Manager", MARGIN, 34);

  // Sub-title — sans, lighter weight
  fnt(SANS, "normal", 10.5); color(255, 255, 255);
  doc.setTextColor(255, 255, 255);
  // slight transparency trick — use a near-white
  doc.setTextColor(240, 230, 180);
  drawText("Filtered Items Report", MARGIN, 52);

  // Report meta — top right
  fnt(SANS, "normal", 8); color(255, 248, 210);
  drawText(`Report ID: ${reportId}`, PAGE_W - MARGIN, 30, { align: "right" });
  drawText(`${dateStr}`, PAGE_W - MARGIN, 44, { align: "right" });
  drawText(`${timeStr}`, PAGE_W - MARGIN, 56, { align: "right" });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. SUMMARY CARD  — sits below the banner with a comfortable gap
  // ══════════════════════════════════════════════════════════════════════════
  const CARD_Y = BANNER_H + 22;   // ← 22pt gap between banner bottom and card
  const CARD_H = 100;

  // Card shadow effect (offset filled rect slightly)
  fill(210, 210, 220); drawRect(MARGIN + 2, CARD_Y + 2, CONTENT_W, CARD_H, "F");

  // Card body
  fill(...C.cardBg); drawRect(MARGIN, CARD_Y, CONTENT_W, CARD_H, "F");
  stroke(...C.border); lw(0.6); drawRect(MARGIN, CARD_Y, CONTENT_W, CARD_H, "S");

  // Left accent bar
  fill(...C.yellow); drawRect(MARGIN, CARD_Y, 5, CARD_H, "F");

  // Card label (small caps style — we fake it with tracking)
  fnt(SERIF, "bolditalic", 7.5); color(...C.muted);
  drawText("REPORT SUMMARY", MARGIN + 14, CARD_Y + 13);

  // Thin divider under the label
  stroke(...C.border); lw(0.4);
  drawLine(MARGIN + 14, CARD_Y + 17, MARGIN + CONTENT_W - 14, CARD_Y + 17);

  const lx1 = MARGIN + 14,   vx1 = MARGIN + 125;
  const lx2 = MARGIN + 268,  vx2 = MARGIN + 378;
  let infoY = CARD_Y + 30;
  const INFO_LINE = 19;

  const metaRows = [
    ["User",          user?.name  || "—",           "Email",    user?.email || "—"],
    ["Status Filter", statusFilter === "all" ? "All Statuses" : statusFilter,
                                                    "Category", categoryFilter === "all" ? "All Categories" : categoryFilter],
    ["Total Items",   String(filteredItems.length),  "Date",     dateStr],
    ["Report ID",     reportId,                      "Time",     timeStr],
  ];

  metaRows.forEach(([l1, v1, l2, v2]) => {
    // Labels — sans bold muted
    fnt(SANS, "bold", 8); color(...C.muted);
    drawText(l1 + ":", lx1, infoY);
    drawText(l2 + ":", lx2, infoY);
    // Values — serif normal dark
    fnt(SERIF, "normal", 9); color(...C.dark);
    drawText(v1, vx1, infoY);
    drawText(v2, vx2, infoY);
    infoY += INFO_LINE;
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. "ITEM LIST" SECTION HEADING
  // ══════════════════════════════════════════════════════════════════════════
  // Generous gap below the card so the page breathes
  cursorY = CARD_Y + CARD_H + 32;

  fnt(SERIF, "bold", 15); color(...C.charcoal);
  drawText("Item List", MARGIN, cursorY);

  // Full-width subtle rule below the heading
  stroke(...C.border); lw(0.5);
  drawLine(MARGIN, cursorY + 6, MARGIN + CONTENT_W, cursorY + 6);

  // Thick yellow accent on the left portion only
  stroke(...C.yellow); lw(2.5);
  drawLine(MARGIN, cursorY + 6, MARGIN + 68, cursorY + 6);

  cursorY += 22;   // space between heading rule and first category pill

  // ══════════════════════════════════════════════════════════════════════════
  // 4. GROUP BY CATEGORY
  // ══════════════════════════════════════════════════════════════════════════
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

  // ══════════════════════════════════════════════════════════════════════════
  // 5. DRAW EACH CATEGORY SECTION
  // ══════════════════════════════════════════════════════════════════════════
  sortedCategories.forEach((category) => {
    const items = [...grouped[category]].sort((a, b) => a.name.localeCompare(b.name));

    // Ensure space: pill + column header + 1 row minimum
    ensureSpace(28 + HEAD_H + ROW_H + 6);

    // ── Category pill ──────────────────────────────────────────────────────
    const PILL_H = 26;

    fill(...C.yellowLight); drawRect(MARGIN, cursorY, CONTENT_W, PILL_H, "F");
    stroke(...C.yellow); lw(0.7); drawRect(MARGIN, cursorY, CONTENT_W, PILL_H, "S");
    // Bold left accent
    fill(...C.yellow); drawRect(MARGIN, cursorY, 5, PILL_H, "F");

    fnt(SERIF, "bold", 10.5); color(...C.yellowDark);
    drawText(category, MARGIN + 14, cursorY + 17);

    fnt(SANS, "normal", 8); color(...C.muted);
    drawText(
      `${items.length} item${items.length !== 1 ? "s" : ""}`,
      MARGIN + CONTENT_W - 8, cursorY + 17, { align: "right" }
    );

    cursorY += PILL_H;   // no extra gap — table header sits flush under the pill

    // ── Column header row ─────────────────────────────────────────────────
    const colHeaders = [
      { label: "#",           x: X.sr,   w: COL.srW,   align: "center" },
      { label: "Item Name",   x: X.name, w: COL.nameW },
      { label: "Description", x: X.desc, w: COL.descW },
      { label: "Status",      x: X.stat, w: COL.statW },
    ];

    colHeaders.forEach(({ label, x, w, align }) => {
      fill(...C.charcoal); drawRect(x, cursorY, w, HEAD_H, "F");
      stroke(...C.border); lw(0.35); drawRect(x, cursorY, w, HEAD_H, "S");
      fnt(SANS, "bold", 8.5); color(...C.white);
      cellText(label, x, cursorY, w, align || "left");
    });

    cursorY += HEAD_H;

    // ── Data rows ─────────────────────────────────────────────────────────
    items.forEach((item, idx) => {
      ensureSpace(ROW_H);

      const rowBg = idx % 2 === 0 ? C.rowWhite : C.rowAlt;
      const sl    = statusLabel(item.status);
      const { bg: stBg, txt: stTxt } = statusStyle(sl);

      // Sr No.
      cellBox(rowBg, X.sr, cursorY, COL.srW, ROW_H);
      fnt(SANS, "normal", 8.5); color(...C.muted);
      cellText(idx + 1, X.sr, cursorY, COL.srW, "center");

      // Item Name — serif bold for readability
      cellBox(rowBg, X.name, cursorY, COL.nameW, ROW_H);
      fnt(SERIF, "bold", 9.5); color(...C.charcoal);
      cellText(item.name, X.name, cursorY, COL.nameW);

      // Description — serif normal
      cellBox(rowBg, X.desc, cursorY, COL.descW, ROW_H);
      fnt(SERIF, "normal", 9); color(...C.dark);
      cellText(item.description || "—", X.desc, cursorY, COL.descW);

      // Status — coloured bg with matching text
      cellBox(stBg, X.stat, cursorY, COL.statW, ROW_H);
      fnt(SANS, "bold", 8); color(...stTxt);
      cellText(sl, X.stat, cursorY, COL.statW);

      cursorY += ROW_H;
    });

    cursorY += 20;   // breathing room between categories
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. FOOTER — every page
  // ══════════════════════════════════════════════════════════════════════════
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Footer band
    fill(245, 245, 250); drawRect(0, PAGE_H - 36, PAGE_W, 36, "F");
    stroke(...C.border); lw(0.5); drawLine(0, PAGE_H - 36, PAGE_W, PAGE_H - 36);

    fnt(SANS, "normal", 7.5); color(...C.muted);
    drawText("Household Manager  ·  Confidential Report", MARGIN, PAGE_H - 16);
    drawText(`Page ${p} of ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 16, { align: "right" });

    // Centre dot separator
    fnt(SANS, "normal", 7.5); color(...C.subtle);
    drawText(dateStr, PAGE_W / 2, PAGE_H - 16, { align: "center" });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 7. SAVE
  // ══════════════════════════════════════════════════════════════════════════
  doc.save(`items-report-${now.toISOString().slice(0, 10)}.pdf`);
}