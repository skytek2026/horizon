/* @ds-bundle: {"format":3,"namespace":"SkytekDesignSystem_fda4f4","components":[],"sourceHashes":{"app.jsx":"75653c569016","changelog-data.js":"ea0b96ecf455","charts-lib.jsx":"2404bc40d049","components/rw-modal-demos.js":"a130d20bcbcf","components/rw-modal.js":"709b3a438084","copy-utilities.js":"1d40498337f0","icons.jsx":"08796654338d","section-apply.jsx":"f710e1b142d7","section-asset-identity.jsx":"98cfe2e69e9b","section-buttons-deep.jsx":"5fdf9ecc5c5d","section-charts.jsx":"4815315e6258","section-components.jsx":"5299b24e927f","section-data-primitives.jsx":"70b24f0cc61b","section-datetime.jsx":"1b9e115df234","section-domain.jsx":"c60433559083","section-elevation-usage.jsx":"c3361c793f5a","section-elevation.jsx":"e525e864d3cf","section-event-log.jsx":"9aa6566fd63f","section-export.jsx":"9fab153495eb","section-forms-deep.jsx":"c55798ddb50e","section-foundations-meta.jsx":"140beb5df097","section-foundations.jsx":"a4570afc9979","section-foundations2.jsx":"2712e9398548","section-handoff.jsx":"194e82a80df0","section-layout-interaction-a11y.jsx":"2f5f97e98143","section-modal.jsx":"e89e58ecb036","section-states.jsx":"d354fcb2c01e","section-stewardship.jsx":"01cbb3306737","section-toast.jsx":"43e2f17ddaad","section-token-index.jsx":"f694bf896b8f","section-voice.jsx":"b1f4a57454bd","tweaks-panel.jsx":"ea982af775f0"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SkytekDesignSystem_fda4f4 = window.SkytekDesignSystem_fda4f4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// app.jsx
try { (() => {
/* Compliance / Sanction list mock — focused on the "Unknown" entity bug fix.

   The bug: when a relationship's value is "Unknown" or "Unknown Entity",
   the system runs sanction list checks against the literal string and
   reports green "Ok" — falsely implying the entity has been screened.

   The fix: introduce an "Unverifiable" / "Cannot be analysed" state so
   it's visually clear those rows could not be evaluated and may carry
   undisclosed sanctions risk.
*/

const WarnIcon = ({
  size = 12,
  color = "var(--unverif-700)"
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 9v4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 17h.01"
}));
const InfoIcon = ({
  size = 12,
  color = "currentColor"
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "10"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 16v-4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 8h.01"
}));
const FolderIcon = ({
  size = 14
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.75",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
}));
const SANCTION_LISTS = ["OFAC List", "UN List", "EU List", "Australia List", "OFSI List"];

/* Status helpers */
const StatusCell = ({
  status,
  treatment = "default"
}) => {
  if (status === "ok") {
    return /*#__PURE__*/React.createElement("span", {
      className: "s-cell s-cell--ok",
      "aria-label": "Ok"
    }, /*#__PURE__*/React.createElement("span", {
      className: "s-dot"
    }), " Ok");
  }
  if (status === "sanctioned") {
    return /*#__PURE__*/React.createElement("span", {
      className: "s-cell s-cell--sanctioned",
      "aria-label": "Sanctioned"
    }, /*#__PURE__*/React.createElement("span", {
      className: "s-dot"
    }), " Sanctioned");
  }
  // unverifiable variants
  if (treatment === "dash") {
    return /*#__PURE__*/React.createElement("span", {
      className: "s-cell s-cell--unverif-dash",
      title: "Cannot be analysed \u2014 subject is unknown."
    }, /*#__PURE__*/React.createElement("span", {
      className: "dash"
    }, "\u2014"), /*#__PURE__*/React.createElement("span", {
      className: "warn-glyph"
    }, /*#__PURE__*/React.createElement(WarnIcon, {
      size: 11,
      color: "var(--unverif-500)"
    })));
  }
  if (treatment === "stripe") {
    return /*#__PURE__*/React.createElement("span", {
      className: "s-cell s-cell--unverif-stripe",
      title: "Cannot be analysed \u2014 subject is unknown."
    }, /*#__PURE__*/React.createElement("span", {
      className: "s-dot"
    }), " Unverifiable");
  }
  if (treatment === "na") {
    return /*#__PURE__*/React.createElement("span", {
      className: "s-cell s-cell--unverif-na",
      title: "Cannot be analysed \u2014 subject is unknown."
    }, /*#__PURE__*/React.createElement("span", {
      className: "s-dot"
    }), /*#__PURE__*/React.createElement("span", {
      className: "warn-tag"
    }, /*#__PURE__*/React.createElement(WarnIcon, {
      size: 10
    }), " Unknown subject"));
  }
  return /*#__PURE__*/React.createElement("span", {
    className: "s-cell s-cell--unverif",
    title: "Cannot be analysed \u2014 subject is unknown."
  }, /*#__PURE__*/React.createElement("span", {
    className: "s-dot"
  }), " Unverifiable");
};
const REASON_COPY = {
  "no-record": {
    title: "Provider has no record",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "The data provider returned ", /*#__PURE__*/React.createElement("em", null, "unknown"), " for this relationship \u2014 they hold no record of the underlying entity. Sanctions screening cannot run. ", /*#__PURE__*/React.createElement("strong", null, "Treat as elevated risk."))
  },
  "link-terminated": {
    title: "Active link terminated",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "A previously-recorded link ended (e.g. Technical Manager 2021\u20132025). No successor has been registered, so the current holder is unknown. ", /*#__PURE__*/React.createElement("strong", null, "Verify before clearing."))
  }
};
const SubjectName = ({
  name,
  unknown,
  link,
  reason
}) => {
  if (unknown) {
    const r = REASON_COPY[reason] || REASON_COPY["no-record"];
    return /*#__PURE__*/React.createElement("span", {
      className: "info-popover-trigger",
      style: {
        position: "relative",
        display: "inline-block"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "s-subject-unknown"
    }, /*#__PURE__*/React.createElement(WarnIcon, {
      size: 12
    }), name), /*#__PURE__*/React.createElement("div", {
      className: "info-popover",
      role: "tooltip"
    }, /*#__PURE__*/React.createElement("div", {
      className: "pop-title"
    }, /*#__PURE__*/React.createElement(WarnIcon, {
      size: 12,
      color: "var(--unverif-300)"
    }), " ", r.title), r.body));
  }
  return link ? /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, name) : /*#__PURE__*/React.createElement("span", null, name);
};

/* ============================================================
   "Before" — current behaviour as shown in the screenshot.
   Every Unknown subject gets green Ok across all five lists.
   ============================================================ */
const BeforeTable = () => {
  const rows = [{
    rel: "Vessel",
    name: "HH GLORY",
    link: true,
    unknown: false,
    results: ["sanctioned", "ok", "ok", "ok", "ok"]
  }, {
    rel: "Vessel's Flag",
    name: "Panama",
    link: false,
    unknown: false,
    results: ["ok", "ok", "ok", "ok", "ok"]
  }, {
    rel: "Owner",
    name: "Skyros Maritime & Trading SA",
    link: true,
    unknown: false,
    folder: true,
    results: ["sanctioned", "ok", "ok", "ok", "ok"]
  }, {
    rel: "Owner's Registration Country",
    name: "Panama",
    link: false,
    results: ["ok", "ok", "ok", "ok", "ok"]
  }, {
    rel: "Owner's Control Country",
    name: "Panama",
    link: false,
    results: ["ok", "ok", "ok", "ok", "ok"]
  }, {
    rel: "Owner's Domicile Country",
    name: "Unknown",
    link: false,
    unknown: true,
    results: ["ok", "ok", "ok", "ok", "ok"]
  },
  // ← bug: should not be Ok
  {
    rel: "Group Beneficial",
    name: "Unknown Entity",
    link: true,
    unknown: true,
    folder: true,
    results: ["ok", "ok", "ok", "ok", "ok"]
  },
  // ← bug
  {
    rel: "Operator",
    name: "Unknown Entity",
    link: true,
    unknown: true,
    folder: true,
    results: ["ok", "ok", "ok", "ok", "ok"]
  } // ← bug
  ];
  return /*#__PURE__*/React.createElement("table", {
    className: "compliance-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Relationship"), /*#__PURE__*/React.createElement("th", null, "Name"), SANCTION_LISTS.map(l => /*#__PURE__*/React.createElement("th", {
    key: l,
    className: "center"
  }, l)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rel"
  }, r.folder && /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, /*#__PURE__*/React.createElement(FolderIcon, null)), r.rel)), /*#__PURE__*/React.createElement("td", {
    className: "name"
  }, r.link ? /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault()
  }, r.name) : /*#__PURE__*/React.createElement("span", null, r.name)), r.results.map((s, j) => /*#__PURE__*/React.createElement("td", {
    key: j,
    className: "center"
  }, /*#__PURE__*/React.createElement(StatusCell, {
    status: s
  })))))));
};

/* ============================================================
   "After" — Unverifiable status replaces false Ok.
   ============================================================ */
const AfterTable = ({
  treatment
}) => {
  const rows = [{
    rel: "Vessel",
    name: "HH GLORY",
    link: true,
    unknown: false,
    results: ["sanctioned", "ok", "ok", "ok", "ok"]
  }, {
    rel: "Vessel's Flag",
    name: "Panama",
    link: false,
    unknown: false,
    results: ["ok", "ok", "ok", "ok", "ok"]
  }, {
    rel: "Owner",
    name: "Skyros Maritime & Trading SA",
    link: true,
    unknown: false,
    folder: true,
    results: ["sanctioned", "ok", "ok", "ok", "ok"]
  }, {
    rel: "Owner's Registration Country",
    name: "Panama",
    link: false,
    results: ["ok", "ok", "ok", "ok", "ok"]
  }, {
    rel: "Owner's Control Country",
    name: "Panama",
    link: false,
    results: ["ok", "ok", "ok", "ok", "ok"]
  },
  // Unknown rows now resolve to unverifiable across the board
  {
    rel: "Owner's Domicile Country",
    name: "Unknown",
    link: false,
    unknown: true,
    reason: "no-record",
    results: ["unverif", "unverif", "unverif", "unverif", "unverif"]
  }, {
    rel: "Group Beneficial",
    name: "Unknown Entity",
    link: true,
    unknown: true,
    folder: true,
    reason: "no-record",
    results: ["unverif", "unverif", "unverif", "unverif", "unverif"]
  }, {
    rel: "Operator",
    name: "Unknown Entity",
    link: true,
    unknown: true,
    folder: true,
    reason: "link-terminated",
    results: ["unverif", "unverif", "unverif", "unverif", "unverif"]
  }];
  return /*#__PURE__*/React.createElement("table", {
    className: "compliance-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Relationship"), /*#__PURE__*/React.createElement("th", null, "Name"), SANCTION_LISTS.map(l => /*#__PURE__*/React.createElement("th", {
    key: l,
    className: "center"
  }, l)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    className: r.unknown ? "row--unverif" : ""
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "rel"
  }, r.folder && /*#__PURE__*/React.createElement("span", {
    className: "ico"
  }, /*#__PURE__*/React.createElement(FolderIcon, null)), r.rel)), /*#__PURE__*/React.createElement("td", {
    className: "name"
  }, /*#__PURE__*/React.createElement(SubjectName, {
    name: r.name,
    unknown: r.unknown,
    link: r.link,
    reason: r.reason
  })), r.results.map((s, j) => /*#__PURE__*/React.createElement("td", {
    key: j,
    className: "center"
  }, /*#__PURE__*/React.createElement(StatusCell, {
    status: s,
    treatment: treatment
  })))))));
};

/* ============================================================
   Top-of-tab banner shown when unverifiable rows are present.
   ============================================================ */
const UnverifBanner = () => /*#__PURE__*/React.createElement("div", {
  className: "ds-alert ds-alert--unverif",
  style: {
    margin: "12px 14px 0"
  },
  role: "status"
}, /*#__PURE__*/React.createElement("span", {
  style: {
    marginTop: 1
  }
}, /*#__PURE__*/React.createElement(WarnIcon, {
  size: 18,
  color: "var(--unverif-700)"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-body"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-title"
}, "3 subjects could not be analysed"), /*#__PURE__*/React.createElement("div", {
  style: {
    color: "var(--unverif-700)",
    fontSize: 12.5,
    lineHeight: 1.5
  }
}, /*#__PURE__*/React.createElement("strong", null, "Owner's Domicile Country"), ", ", /*#__PURE__*/React.createElement("strong", null, "Group Beneficial"), " and ", /*#__PURE__*/React.createElement("strong", null, "Operator"), " are listed as ", /*#__PURE__*/React.createElement("em", null, "Unknown"), ". Sanctions screening cannot run against an unknown subject \u2014 there may be sanctioned implications that have not been surfaced.", /*#__PURE__*/React.createElement("a", {
  href: "#",
  onClick: e => e.preventDefault(),
  style: {
    color: "var(--unverif-700)",
    marginLeft: 6,
    fontWeight: 600
  }
}, "How is this resolved? \u2192"))));

/* ============================================================
   Mock browser frame — vessel detail page chrome
   ============================================================ */
const MockFrame = ({
  children
}) => /*#__PURE__*/React.createElement("div", {
  className: "mock-frame"
}, /*#__PURE__*/React.createElement("div", {
  className: "mock-frame__chrome"
}, /*#__PURE__*/React.createElement("div", {
  className: "url"
}, "app.realworld.skytek.com/vessel/141461?assetDetailReports=company")), /*#__PURE__*/React.createElement("div", {
  className: "mock-tabs"
}, /*#__PURE__*/React.createElement("button", {
  className: "mock-tab"
}, "Inspection Data"), /*#__PURE__*/React.createElement("button", {
  className: "mock-tab",
  "aria-selected": "true"
}, "Sanction Compliance", /*#__PURE__*/React.createElement("span", {
  className: "tab-warn-dot",
  "aria-label": "3 unverifiable subjects"
})), /*#__PURE__*/React.createElement("button", {
  className: "mock-tab"
}, "Casualty Data"), /*#__PURE__*/React.createElement("button", {
  className: "mock-tab"
}, "Additional Details"), /*#__PURE__*/React.createElement("button", {
  className: "mock-tab"
}, "Historical Details"), /*#__PURE__*/React.createElement("button", {
  className: "mock-tab"
}, "Full Vessel Details"), /*#__PURE__*/React.createElement("button", {
  className: "mock-tab"
}, "Ship-To-Ship"), /*#__PURE__*/React.createElement("button", {
  className: "mock-tab"
}, "Suspicious Activities")), children);

/* ============================================================
   Side panel: tweakable info card explaining the gauge note.
   Reflects: "With sanctions" risk score is partially blind when
   unverifiable subjects are present.
   ============================================================ */
const SmallScoreCallout = () => /*#__PURE__*/React.createElement("div", {
  className: "mini-gauge",
  style: {
    width: 280
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "mini-gauge__head"
}, /*#__PURE__*/React.createElement("span", {
  className: "mini-gauge__title"
}, "Risk score \xB7 with sanctions")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "baseline",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 30,
    fontWeight: 700,
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.02em",
    color: "var(--danger-700)"
  }
}, "100"), /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--danger ds-badge--dot"
}, "Sanctioned")), /*#__PURE__*/React.createElement("div", {
  className: "gauge-warn"
}, /*#__PURE__*/React.createElement(WarnIcon, {
  size: 14
}), /*#__PURE__*/React.createElement("div", null, "Score reflects screened subjects only.", /*#__PURE__*/React.createElement("strong", {
  style: {
    display: "block",
    color: "var(--unverif-700)"
  }
}, "3 unverifiable subjects excluded."))));

/* ============================================================
   Page composition
   ============================================================ */
const Page = () => {
  const defaults = /*EDITMODE-BEGIN*/{
    "treatment": "default",
    "showBefore": true,
    "showBanner": true,
    "showRowTint": true
  } /*EDITMODE-END*/;
  const [tweaks, setTweak] = useTweaks(defaults);

  // Toggle row-tint by adding/removing a class on the after table wrapper.
  const afterClass = `treatment-${tweaks.treatment}` + (tweaks.showRowTint ? "" : " no-row-tint");

  // Inject a runtime style toggle to optionally remove row tint
  React.useEffect(() => {
    const id = "__row-tint-toggle";
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = tweaks.showRowTint ? "" : `tr.row--unverif > td { background: var(--white) !important; }
         tr.row--unverif > td:first-child::before { display: none; }`;
  }, [tweaks.showRowTint]);
  return /*#__PURE__*/React.createElement("div", {
    className: "page-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "page-eyebrow"
  }, "Sanctions screening \xB7 bug fix"), /*#__PURE__*/React.createElement("h1", null, "\"Unknown\" subjects must not pass as compliant"), /*#__PURE__*/React.createElement("p", null, "When a relationship resolves to ", /*#__PURE__*/React.createElement("em", null, "Unknown"), " or ", /*#__PURE__*/React.createElement("em", null, "Unknown Entity"), ", the platform currently runs the literal string against each sanctions list and reports green ", /*#__PURE__*/React.createElement("strong", null, "Ok"), " \u2014 which reads as \"screened and cleared\". It hasn't been screened at all. This deck introduces an ", /*#__PURE__*/React.createElement("strong", null, "Unverifiable"), " state so users see, immediately, that there could be sanctions implications that haven't been surfaced.")), /*#__PURE__*/React.createElement("div", {
    className: "section-block"
  }, /*#__PURE__*/React.createElement("h2", null, "The new state \xB7 Unverifiable"), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, "A third semantic alongside Ok / Sanctioned. Distinct hue (amber-slate, not the warning orange already used for \"At risk\"), hollow ring with a \"?\" mark, and a row-level tint so the eye lands on these subjects first."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 24,
      flexWrap: "wrap",
      padding: "16px",
      background: "var(--white)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginBottom: 6
    }
  }, "Ok"), /*#__PURE__*/React.createElement(StatusCell, {
    status: "ok"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginBottom: 6
    }
  }, "Sanctioned"), /*#__PURE__*/React.createElement(StatusCell, {
    status: "sanctioned"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginBottom: 6
    }
  }, "Unverifiable ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--unverif-700)"
    }
  }, "(new)")), /*#__PURE__*/React.createElement(StatusCell, {
    status: "unverif",
    treatment: tweaks.treatment
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 280,
      paddingLeft: 24,
      borderLeft: "1px solid var(--border-subtle)",
      fontSize: 13,
      color: "var(--text-secondary)",
      lineHeight: 1.55
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--text-primary)"
    }
  }, "Sarah / Gabriel asked for a dash."), " A bare ", /*#__PURE__*/React.createElement("code", null, "\u2014"), " stops the false green Ok but doesn't carry the second message \u2014 that this could be hiding sanctioned exposure. The ", /*#__PURE__*/React.createElement("em", null, "\u2014 + warn"), " tweak option keeps the dash and adds a small amber glyph; ", /*#__PURE__*/React.createElement("em", null, "Ring+?"), " is louder. Pick whichever the team prefers."))), /*#__PURE__*/React.createElement("div", {
    className: "section-block"
  }, /*#__PURE__*/React.createElement("h2", null, "Before \xB7 After"), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, "The Sanction Compliance tab on the vessel detail page, with the same data shown in the attached screenshot."), /*#__PURE__*/React.createElement("div", {
    className: "audit-section",
    style: {
      display: tweaks.showBefore ? "grid" : "block",
      gridTemplateColumns: tweaks.showBefore ? "1fr 1fr" : "1fr"
    }
  }, tweaks.showBefore && /*#__PURE__*/React.createElement("div", {
    className: "audit-pane audit-pane--before"
  }, /*#__PURE__*/React.createElement("div", {
    className: "audit-pane__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "audit-pane__pill"
  }, "Before"), "Unknown subjects pass as Ok"), /*#__PURE__*/React.createElement(MockFrame, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 14px"
    }
  }, /*#__PURE__*/React.createElement(BeforeTable, null))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 14px",
      background: "var(--danger-050)",
      borderTop: "1px solid var(--danger-100)",
      color: "var(--danger-700)",
      fontSize: 12.5,
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Problem."), " The bottom three rows show ", /*#__PURE__*/React.createElement("em", null, "Unknown"), " / ", /*#__PURE__*/React.createElement("em", null, "Unknown Entity"), " as the subject, yet the system returns green Ok across all five sanctions lists. A reviewer scanning the page sees \"no flags\" and clears the vessel \u2014 without realising three of its key relationships were never actually screened.")), /*#__PURE__*/React.createElement("div", {
    className: "audit-pane audit-pane--after"
  }, /*#__PURE__*/React.createElement("div", {
    className: "audit-pane__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "audit-pane__pill"
  }, "After"), "Unverifiable subjects are surfaced as a distinct state"), /*#__PURE__*/React.createElement(MockFrame, null, tweaks.showBanner && /*#__PURE__*/React.createElement(UnverifBanner, null), /*#__PURE__*/React.createElement("div", {
    className: afterClass,
    style: {
      padding: "0 14px"
    }
  }, /*#__PURE__*/React.createElement(AfterTable, {
    treatment: tweaks.treatment
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 14px",
      background: "var(--success-050)",
      borderTop: "1px solid var(--success-100)",
      color: "var(--success-700)",
      fontSize: 12.5,
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("strong", null, "What changed."), " Three behaviours work together: (1) ", /*#__PURE__*/React.createElement("strong", null, "row tint & left rail"), "draw the eye to unknown subjects, (2) ", /*#__PURE__*/React.createElement("strong", null, "cell status"), " shows Unverifiable instead of Ok, and (3) a ", /*#__PURE__*/React.createElement("strong", null, "tab-level banner"), " states the count and the implication up front so the reviewer can't miss it.")))), /*#__PURE__*/React.createElement("div", {
    className: "section-block"
  }, /*#__PURE__*/React.createElement("h2", null, "Behaviour spec"), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, "What triggers Unverifiable, why the subject is unknown, and how it surfaces."), /*#__PURE__*/React.createElement("table", {
    className: "spec-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: 220
    }
  }, "Reason"), /*#__PURE__*/React.createElement("th", null, "What the provider returned"), /*#__PURE__*/React.createElement("th", null, "Popover copy"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "No record"), /*#__PURE__*/React.createElement("div", {
    className: "t-caption"
  }, "Provider has nothing on this entity.")), /*#__PURE__*/React.createElement("td", null, "Provider returns ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "unknown"), " with no entity ID and no historical record."), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("em", null, "\"The data provider returned ", /*#__PURE__*/React.createElement("strong", null, "unknown"), " for this relationship \u2014 they hold no record of the underlying entity. Sanctions screening cannot run. Treat as elevated risk.\""))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Active link terminated"), /*#__PURE__*/React.createElement("div", {
    className: "t-caption"
  }, "e.g. Tech Manager 2021\u20132025, no successor.")), /*#__PURE__*/React.createElement("td", null, "Provider returns ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "unknown"), " but has historical records \u2014 the prior link ended on a known date and no replacement was filed."), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("em", null, "\"A previously-recorded link ended (e.g. Technical Manager 2021\u20132025). No successor has been registered, so the current holder is unknown. Verify before clearing.\""))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Mixed result on a folder"), /*#__PURE__*/React.createElement("div", {
    className: "t-caption"
  }, "e.g. Owner has 5 beneficiaries, 1 unknown.")), /*#__PURE__*/React.createElement("td", null, "Folder aggregates child screening results."), /*#__PURE__*/React.createElement("td", null, "Folder cell shows ", /*#__PURE__*/React.createElement("em", null, "Partially verifiable"), " with count badge \"1 unknown\". Children listed individually.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Risk score gauge")), /*#__PURE__*/React.createElement("td", null, "The score is computed only from screened subjects."), /*#__PURE__*/React.createElement("td", null, "Footnote chip on the gauge: ", /*#__PURE__*/React.createElement("em", null, "\"Score excludes 3 unverifiable subjects.\""), " \u2014 keeps the score truthful.")))), /*#__PURE__*/React.createElement("div", {
    className: "callout warn",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Where the reason comes from."), " The provider response already distinguishes \"no record\" from \"link terminated\" (per Stefan). We surface that on hover instead of inventing a single generic message. Reviewers respond differently to the two cases \u2014 \"no record\" usually means escalate; \"link terminated\" usually means chase the broker for the successor. One pattern, two stories.")), /*#__PURE__*/React.createElement("div", {
    className: "section-block"
  }, /*#__PURE__*/React.createElement("h2", null, "Where else this surfaces"), /*#__PURE__*/React.createElement("p", {
    className: "lead"
  }, "The pattern propagates beyond the table cell."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "300px 1fr",
      gap: 16,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(SmallScoreCallout, null), /*#__PURE__*/React.createElement("div", {
    className: "ds-card",
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginBottom: 8
    }
  }, "Tab indicator"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 0,
      borderBottom: "1px solid var(--border-default)",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "mock-tab"
  }, "Inspection Data"), /*#__PURE__*/React.createElement("button", {
    className: "mock-tab",
    "aria-selected": "true"
  }, "Sanction Compliance", /*#__PURE__*/React.createElement("span", {
    className: "tab-warn-dot"
  })), /*#__PURE__*/React.createElement("button", {
    className: "mock-tab"
  }, "Casualty Data")), /*#__PURE__*/React.createElement("p", {
    className: "t-caption",
    style: {
      margin: 0
    }
  }, "When unverifiable subjects exist on a vessel, the Sanction Compliance tab gets a small amber dot \u2014 same affordance the team already uses for \"Suspicious Activities\" but in the unverifiable hue. Visible from any tab on the vessel detail page.")))), /*#__PURE__*/React.createElement("div", {
    className: "section-block"
  }, /*#__PURE__*/React.createElement("h2", null, "What we deliberately didn't do"), /*#__PURE__*/React.createElement("ul", {
    className: "diff-list"
  }, /*#__PURE__*/React.createElement("li", null, "Mark unverifiable subjects as ", /*#__PURE__*/React.createElement("strong", null, "Sanctioned"), " \u2014 false positives erode trust in the red dot."), /*#__PURE__*/React.createElement("li", null, "Hide unverifiable rows from the ", /*#__PURE__*/React.createElement("em", null, "Compliance"), " table \u2014 the reviewer must still see them. (Hiding may make sense for the ", /*#__PURE__*/React.createElement("em", null, "Ownership"), " table specifically \u2014 that's a separate decision.)"), /*#__PURE__*/React.createElement("li", null, "Reuse the existing ", /*#__PURE__*/React.createElement("strong", null, "orange \"At risk\""), " warning hue \u2014 it already means \"screened and borderline\". Conflating the two would dilute both."), /*#__PURE__*/React.createElement("li", null, "Block PDF export when unverifiable subjects exist \u2014 but the PDF inherits the same banner copy so downstream readers also see the caveat."))), /*#__PURE__*/React.createElement("div", {
    className: "section-block",
    style: {
      marginTop: 48,
      paddingTop: 24,
      borderTop: "1px dashed var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "t-caption",
    style: {
      margin: 0
    }
  }, "Toggle the ", /*#__PURE__*/React.createElement("strong", null, "Tweaks"), " button (top-right) to compare three visual treatments for the Unverifiable cell, hide the Before pane, hide the banner, or remove the row tint. Use it to decide which treatment best fits Skytek's compliance surfaces.")), /*#__PURE__*/React.createElement(TweaksPanel, {
    title: "Tweaks"
  }, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Cell treatment"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Style",
    value: tweaks.treatment,
    onChange: v => setTweak("treatment", v),
    options: [{
      value: "default",
      label: "Ring+?"
    }, {
      value: "dash",
      label: "— + warn"
    }, {
      value: "stripe",
      label: "Striped"
    }, {
      value: "na",
      label: "N/A"
    }]
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Layout"
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Show Before pane",
    value: tweaks.showBefore,
    onChange: v => setTweak("showBefore", v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Top-of-tab banner",
    value: tweaks.showBanner,
    onChange: v => setTweak("showBanner", v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Tint unverifiable rows",
    value: tweaks.showRowTint,
    onChange: v => setTweak("showRowTint", v)
  })));
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/*#__PURE__*/React.createElement(Page, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "app.jsx", error: String((e && e.message) || e) }); }

// changelog-data.js
try { (() => {
/* ============================================================================
   Skytek Design System — Living Changelog data
   ----------------------------------------------------------------------------
   This file is the single source of truth for the Changelog page.

   APPEND PROTOCOL (read before editing):
   • Whenever ANY part of the design system changes — a component, pattern,
     token, doc, accessibility rule, brand element or asset — add a NEW entry
     object to the TOP of the CHANGELOG_ENTRIES array below.
   • Never edit or delete past entries. The changelog is an immutable record.
   • Fill every field. Use the current date/time in UTC.
   • Version numbers follow semver and increment from the previous entry:
        – Breaking            → bump MAJOR (x.0.0)
        – Minor (new feature) → bump MINOR (1.x.0)
        – Patch / fix         → bump PATCH (1.2.x)
        – Documentation Only  → bump PATCH
   • Category MUST be one of:
        Component | Pattern | Token | Documentation |
        Accessibility | Brand | Asset | Other
   • Impact MUST be one of:
        Breaking | Minor | Patch | Documentation Only

   Entry shape:
   {
     version:   "v1.2.3",
     dateISO:   "2026-06-15T14:32:00Z",   // used for sorting + date filter
     date:      "15/06/2026",             // DD/MM/YYYY (display)
     time:      "14:32 UTC",              // 24-hour (display)
     category:  "Component",
     updatedBy: "Claude",
     impact:    "Minor",
     summary:   "One or two sentence overview.",
     changes:   ["Specific change.", "Another specific change."],
     reason:    "Why the update was made.",
     affected:  ["Button Component", "Forms Pattern"]
   }
   ============================================================================ */

window.CHANGELOG_ENTRIES = [{
  version: "v2.2.1",
  dateISO: "2026-06-26T13:10:00Z",
  date: "26/06/2026",
  time: "13:10 UTC",
  category: "Documentation",
  updatedBy: "Claude",
  impact: "Patch",
  summary: "Fixed the sidebar version label, which was hardcoded to 'v1.0' and never reflected the actual design system version.",
  changes: ["Bound the sidebar 'Design System' label to the latest changelog entry's version instead of a static 'v1.0' string."],
  reason: "The navigation showed a stale 'v1.0' regardless of the real version, making it impossible to tell which version was in view.",
  affected: ["Skytek Design System.html", "Sidebar navigation"]
}, {
  version: "v2.2.0",
  dateISO: "2026-06-26T12:50:00Z",
  date: "26/06/2026",
  time: "12:50 UTC",
  category: "Token",
  updatedBy: "Claude",
  impact: "Minor",
  summary: "Added a themed, cross-browser scrollbar treatment — a 6px thin bar with a brand-blue thumb on a light-grey track — applied to the page root and any .ds-scroll / [data-scroll] container, plus a documented Scrollbars subsection under Motion.",
  changes: ["New scrollbar tokens: --scrollbar-size (6px), --scrollbar-track (--slate-100), --scrollbar-thumb (--brand-500), --scrollbar-thumb-hover (--brand-600).", "Firefox support via scrollbar-width:thin + scrollbar-color; WebKit/Blink support via ::-webkit-scrollbar rules honoring the exact 6px width.", "Opt-in .ds-scroll class and [data-scroll] attribute for inner scroll containers (tables, panels, popovers).", "Added a Scrollbars subsection to the Motion foundations page with a live demo, token table, code sample, and a 'don't hide scrollbars' rule."],
  reason: "Default OS scrollbars looked foreign inside dense data regions; a consistent themed bar ties scroll affordances to the product and matches the requested visual (theme thumb, light-grey track, 6px).",
  affected: ["Foundations / Motion", "styles.css", "Scrollbars"]
}, {
  version: "v2.1.5",
  dateISO: "2026-06-25T00:05:00Z",
  date: "25/06/2026",
  time: "00:05 UTC",
  category: "Documentation",
  updatedBy: "Claude",
  impact: "Documentation Only",
  summary: "Added an Upload icon to the Icon Inventory canonical alias map.",
  changes: ["Added the 'upload' alias (Lucide Upload) for import-data / attach-file / upload-report actions, placed alphabetically."],
  reason: "The inventory had a download glyph but no matching upload glyph for import flows.",
  affected: ["Icon Inventory", "Iconography"]
}, {
  version: "v2.1.4",
  dateISO: "2026-06-25T00:00:00Z",
  date: "25/06/2026",
  time: "00:00 UTC",
  category: "Documentation",
  updatedBy: "Claude",
  impact: "Documentation Only",
  summary: "Added a Download icon to the Icon Inventory canonical alias map and sorted the entire list alphabetically by alias.",
  changes: ["Added the 'download' alias (Lucide Download) for export / save-file / download-report actions.", "Reordered all canonical alias entries to be alphabetical by alias for easier scanning."],
  reason: "The inventory lacked a download glyph and its previous arbitrary order made specific aliases hard to find.",
  affected: ["Icon Inventory", "Iconography"]
}, {
  version: "v2.1.3",
  dateISO: "2026-06-17T09:30:00Z",
  date: "17/06/2026",
  time: "09:30 UTC",
  category: "Token",
  updatedBy: "Claude",
  impact: "Patch",
  summary: "Replaced the badges' hard-coded rgba border colors with new tokenized status-border tokens.",
  changes: ["Introduced --border-info, --border-success, --border-warning and --border-danger, each derived from its status-500 color via color-mix at low alpha.", "Repointed the info, success, warning and danger badge borders from raw rgba(...) values to the new tokens.", "Documented the four tokens in the Color section and the Token index."],
  reason: "Badge borders used custom rgba literals instead of system colors; tokenizing them keeps the borders consistent and themeable.",
  affected: ["Badges & Status", "Design Tokens", "Token index", "Color"]
}, {
  version: "v2.1.2",
  dateISO: "2026-06-15T16:55:00Z",
  date: "15/06/2026",
  time: "16:55 UTC",
  category: "Documentation",
  updatedBy: "Claude",
  impact: "Documentation Only",
  summary: "Synced the Color section with the Token index so every documented color token now has a swatch.",
  changes: ["Added missing palette swatches: --brand-700, --slate-150, --success-050, --warning-050, --danger-800, --danger-050 and --info-050.", "Added the missing semantic tokens --bg-raised and --text-inverse to the semantic surface/border/text list.", "No new tokens were created — all already existed in styles.css; they were simply not shown in the Color section."],
  reason: "The Color section was missing colors that the Token index already documented, leaving the two references inconsistent.",
  affected: ["Color", "Token index"]
}, {
  version: "v2.1.1",
  dateISO: "2026-06-15T16:20:00Z",
  date: "15/06/2026",
  time: "16:20 UTC",
  category: "Documentation",
  updatedBy: "Claude",
  impact: "Documentation Only",
  summary: "Added rem values alongside the existing pixel values in the Typography and Spacing sections.",
  changes: ["Typography specimens now list size/line-height in both px and rem (e.g. 32px / 40px and 2rem / 2.5rem), assuming a 16px root.", "The Spacing scale now shows each step in both px and rem (e.g. 16px · 1rem).", "Pixel values are unchanged — rem is shown as an additional reference."],
  reason: "Give engineers the rem equivalents for relative sizing without losing the pixel values the team designs in.",
  affected: ["Typography", "Spacing"]
}, {
  version: "v2.1.0",
  dateISO: "2026-06-15T15:40:00Z",
  date: "15/06/2026",
  time: "15:40 UTC",
  category: "Component",
  updatedBy: "Claude",
  impact: "Minor",
  summary: "Flattened secondary and icon-only buttons, removed all hard-coded button colors, and gave every button variant a pressed (active) state.",
  changes: ["Removed the drop shadow from .ds-btn--secondary and .ds-btn--icon.", "Replaced the hard-coded #1f5fc7 in the primary active state with a new --brand-700 token (also fixed the same literal in the Buttons full-spec demo and token table).", "Switched the danger button's text from the `white` keyword to var(--white).", "Added :active (pressed) states to the danger and link variants — every variant now has one.", "Added --brand-700 (#1f5fc7) and --danger-800 (#991B1B) to the color tokens and the Token index."],
  reason: "Flatten low-emphasis buttons for a calmer surface, keep every button color fully tokenized (no raw hex), and give all variants consistent press feedback.",
  affected: ["Buttons", "Buttons — full spec", "Design Tokens", "Token index"]
}, {
  version: "v2.0.0",
  dateISO: "2026-06-15T15:10:00Z",
  date: "15/06/2026",
  time: "15:10 UTC",
  category: "Token",
  updatedBy: "Claude",
  impact: "Breaking",
  summary: "Removed the 2px spacing step (--space-1) and renumbered the entire spacing scale down by one into a contiguous 4-pt scale.",
  changes: ["Removed --space-1 (2px) from the spacing scale.", "Renumbered every remaining step down by one: --space-2→--space-1, --space-3→--space-2, … --space-10→--space-9, --space-12→--space-10, --space-16→--space-11.", "Repointed internal usages so visual spacing is unchanged (the density .gap-density rule now uses --space-4 / --space-3).", "Updated the Spacing foundations section and the Token index to match the new numbering."],
  reason: "The 2px step was too fine to be useful and encouraged off-grid hairline spacing; collapsing it yields a cleaner, contiguous scale aligned to the 4-pt grid.",
  affected: ["Spacing", "Design Tokens", "Token index", "Density"]
}, {
  version: "v1.3.0",
  dateISO: "2026-06-15T14:32:00Z",
  date: "15/06/2026",
  time: "14:32 UTC",
  category: "Documentation",
  updatedBy: "Claude",
  impact: "Minor",
  summary: "Added a living Changelog page that records every change made to the design system.",
  changes: ["Created a dedicated Changelog page with reverse-chronological timeline of entries.", "Added search across all fields plus filters for date range, category, version and impact level.", "Established an append protocol so every future change auto-records a dated, versioned entry.", "Linked the Changelog from the main specification navigation."],
  reason: "Give the team a single, auditable record of how the system evolves over time and make change history discoverable.",
  affected: ["Documentation", "Navigation"]
}, {
  version: "v1.2.1",
  dateISO: "2026-06-15T09:05:00Z",
  date: "15/06/2026",
  time: "09:05 UTC",
  category: "Component",
  updatedBy: "Claude",
  impact: "Patch",
  summary: "Fixed the Card footer so its background follows the card's rounded bottom corners.",
  changes: ["Rounded the bottom-left and bottom-right corners of .ds-card-foot to match --radius-lg.", "Added overflow: hidden to .ds-card so footer fills clip cleanly to the card shape.", "Verified box-shadows are unaffected since they render outside the box."],
  reason: "The footer's slate background was poking past the card's rounded corners with small square nubs.",
  affected: ["Cards", "Card Footer"]
}, {
  version: "v1.2.0",
  dateISO: "2026-06-14T11:30:00Z",
  date: "14/06/2026",
  time: "11:30 UTC",
  category: "Component",
  updatedBy: "Claude",
  impact: "Minor",
  summary: "Defined Card footers in the design system, including footers with action buttons.",
  changes: ["Added .ds-card-foot with --start and --between alignment modifiers.", "Locked all card-footer buttons to ghost (tertiary) style in ALL CAPS via CSS.", "Documented the rule in the Cards component spec and demonstrated all three footer patterns."],
  reason: "Card footers were used but undocumented; footer actions needed a consistent low-emphasis treatment.",
  affected: ["Cards", "Card Footer", "Buttons"]
}, {
  version: "v1.1.4",
  dateISO: "2026-06-13T16:10:00Z",
  date: "13/06/2026",
  time: "16:10 UTC",
  category: "Asset",
  updatedBy: "Claude",
  impact: "Patch",
  summary: "Updated two icon names in the iconography inventory to their canonical Lucide names.",
  changes: ["Renamed AlertTriangle to TriangleAlert.", "Renamed HelpCircle to CircleHelp."],
  reason: "Lucide deprecated the old names; aligning the inventory with current Lucide avoids confusion in handoff.",
  affected: ["Iconography"]
}, {
  version: "v1.1.3",
  dateISO: "2026-06-13T15:45:00Z",
  date: "13/06/2026",
  time: "15:45 UTC",
  category: "Component",
  updatedBy: "Claude",
  impact: "Patch",
  summary: "Iconography inventory now renders icons from the live Lucide library instead of a partial shim.",
  changes: ["Loaded lucide@0.469.0 and rendered each inventory entry from its real glyph node.", "Removed the generic 'tag' fallback that affected roughly half the inventory.", "Updated the caption to reflect that icons render from the live library."],
  reason: "About 22 of 44 icons fell back to an identical generic glyph because the offline shim only defined ~20 icons.",
  affected: ["Iconography"]
}, {
  version: "v1.1.2",
  dateISO: "2026-06-12T10:20:00Z",
  date: "12/06/2026",
  time: "10:20 UTC",
  category: "Documentation",
  updatedBy: "Claude",
  impact: "Documentation Only",
  summary: "Corrected typography documentation to show Exo as the display and heading typeface.",
  changes: ["Updated Display and H1–H4 specimen labels from Inter to Exo.", "Revised the Typography section intro to read: Exo for display & headings, Inter for body & UI, JetBrains Mono for codes."],
  reason: "The specimens use var(--font-display) which resolves to Exo, but were mislabelled as Inter.",
  affected: ["Typography"]
}, {
  version: "v1.1.1",
  dateISO: "2026-06-09T11:02:00Z",
  date: "09/06/2026",
  time: "11:02 UTC",
  category: "Brand",
  updatedBy: "Claude",
  impact: "Patch",
  summary: "Self-hosted JetBrains Mono from uploaded font files.",
  changes: ["Added @font-face rules for JetBrains Mono (upright + italic, variable weight).", "Pointed --font-mono at the self-hosted family."],
  reason: "Replace CDN delivery with self-hosted brand fonts for reliability and offline rendering.",
  affected: ["Typography", "Design Tokens"]
}, {
  version: "v1.1.0",
  dateISO: "2026-06-09T09:14:00Z",
  date: "09/06/2026",
  time: "09:14 UTC",
  category: "Brand",
  updatedBy: "Claude",
  impact: "Minor",
  summary: "Self-hosted the Inter typeface from uploaded font files.",
  changes: ["Added @font-face rules for Inter (upright + italic, variable weight/optical size).", "Switched the --font-sans family over from the CDN stylesheet to the self-hosted files."],
  reason: "Self-host brand fonts to guarantee consistent rendering independent of external CDNs.",
  affected: ["Typography", "Design Tokens"]
}, {
  version: "v1.0.0",
  dateISO: "2026-04-28T09:00:00Z",
  date: "28/04/2026",
  time: "09:00 UTC",
  category: "Other",
  updatedBy: "Claude",
  impact: "Minor",
  summary: "Initial release of the Skytek Design System specification.",
  changes: ["Published foundations: color, typography, spacing, radius, elevation, iconography, density, motion and the token index.", "Published the component system, patterns, domain primitives and engineering handoff chapters."],
  reason: "Establish the canonical reference for everything visual and interactive in the Skytek React app.",
  affected: ["Foundations", "Components", "Patterns", "Domain primitives", "Handoff"]
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "changelog-data.js", error: String((e && e.message) || e) }); }

// charts-lib.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* ============================================================================
   charts-lib.jsx — Skytek composite chart layer (live reference implementation)
   Built from shared primitives: Canvas, Scale, Axis, GridLines, Legend,
   Tooltip, ChartFrame. Token-driven (--chart-*), responsive (ResizeObserver),
   accessible (figure role + hidden data table + roving keyboard focus).
   The .tsx in the spec mirrors these components 1:1.
   ============================================================================ */

/* ── Shared scales / helpers (the "Scale" primitive) ─────────────────── */
const CAT = i => `var(--chart-cat-${i % 8 + 1})`;
function niceStep(raw) {
  const pow = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const n = (raw || 1) / pow;
  const m = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
  return m * pow;
}
function axisTicks(maxVal, count = 5) {
  const step = niceStep((maxVal || 1) / count);
  const top = Math.max(step, Math.ceil((maxVal || 1) / step) * step);
  const ticks = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(+v.toFixed(6));
  return {
    ticks,
    top
  };
}
const linear = (d0, d1, r0, r1) => v => r0 + (v - d0) / (d1 - d0 || 1) * (r1 - r0);
const truncate = (s, n) => s && s.length > n ? s.slice(0, n - 1) + "…" : s;

/* ── useMeasure — the responsive backbone of <Canvas> ─────────────────── */
function useMeasure() {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(0);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setW(Math.round(e.contentRect.width));
    });
    ro.observe(ref.current);
    setW(Math.round(ref.current.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/* ── Roving keyboard focus across data marks (a11y) ──────────────────── */
function onMarksKeyDown(e) {
  const keys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"];
  if (!keys.includes(e.key)) return;
  const marks = Array.from(e.currentTarget.querySelectorAll("[data-mark]"));
  const idx = marks.indexOf(document.activeElement);
  if (idx === -1) return;
  e.preventDefault();
  let next = idx;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(marks.length - 1, idx + 1);
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(0, idx - 1);
  if (e.key === "Home") next = 0;
  if (e.key === "End") next = marks.length - 1;
  marks[next].focus();
}

/* ── Tooltip primitive ───────────────────────────────────────────────── */
const ChartTooltip = ({
  tip
}) => {
  if (!tip) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "cx-tip",
    style: {
      left: tip.x,
      top: tip.y
    },
    role: "tooltip"
  }, tip.title && /*#__PURE__*/React.createElement("div", {
    className: "cx-tip-title"
  }, tip.title), tip.rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "cx-tip-row"
  }, r.color && /*#__PURE__*/React.createElement("span", {
    className: "cx-tip-sw",
    style: {
      background: r.color
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "cx-tip-k"
  }, r.k), /*#__PURE__*/React.createElement("span", {
    className: "cx-tip-v"
  }, r.v))));
};

/* ── Legend primitive ────────────────────────────────────────────────── */
const Legend = ({
  items,
  placement = "bottom"
}) => /*#__PURE__*/React.createElement("ul", {
  className: `cx-legend cx-legend--${placement}`
}, items.map(it => /*#__PURE__*/React.createElement("li", {
  key: it.label,
  className: "cx-legend-item"
}, /*#__PURE__*/React.createElement("span", {
  className: "cx-legend-sw",
  style: {
    background: it.color,
    borderRadius: it.shape === "line" ? 2 : 3,
    height: it.shape === "line" ? 3 : 10
  }
}), /*#__PURE__*/React.createElement("span", {
  className: "cx-legend-lbl"
}, it.label), it.value != null && /*#__PURE__*/React.createElement("span", {
  className: "cx-legend-val"
}, it.value))));

/* ── ChartFrame — composite shell: title, state, legend, responsive,
      hidden data table, a11y wrapper. children = (dims) => <svg/> ─────── */
const ChartFrame = ({
  title,
  caption,
  height = 260,
  legend,
  legendPlacement = "bottom",
  state = {},
  ariaLabel,
  dataTable,
  children,
  minWidth = 120
}) => {
  const [ref, w] = useMeasure();
  const {
    loading,
    error,
    empty
  } = state;
  const isRight = legendPlacement === "right";
  const body = () => {
    if (loading) {
      return /*#__PURE__*/React.createElement("div", {
        className: "cx-skeleton",
        style: {
          height
        },
        "aria-hidden": "true"
      }, /*#__PURE__*/React.createElement("span", {
        className: "ds-skel",
        style: {
          height: "60%",
          alignSelf: "flex-end",
          width: "12%"
        }
      }), /*#__PURE__*/React.createElement("span", {
        className: "ds-skel",
        style: {
          height: "85%",
          alignSelf: "flex-end",
          width: "12%"
        }
      }), /*#__PURE__*/React.createElement("span", {
        className: "ds-skel",
        style: {
          height: "45%",
          alignSelf: "flex-end",
          width: "12%"
        }
      }), /*#__PURE__*/React.createElement("span", {
        className: "ds-skel",
        style: {
          height: "70%",
          alignSelf: "flex-end",
          width: "12%"
        }
      }), /*#__PURE__*/React.createElement("span", {
        className: "ds-skel",
        style: {
          height: "55%",
          alignSelf: "flex-end",
          width: "12%"
        }
      }));
    }
    if (error) {
      return /*#__PURE__*/React.createElement("div", {
        className: "cx-state",
        style: {
          height
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "ds-alert ds-alert--danger",
        style: {
          maxWidth: 360
        }
      }, /*#__PURE__*/React.createElement("svg", {
        className: "ds-alert-icon",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M12 8v5m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
        strokeLinecap: "round"
      })), /*#__PURE__*/React.createElement("div", {
        className: "ds-alert-body"
      }, /*#__PURE__*/React.createElement("div", {
        className: "ds-alert-title"
      }, "Couldn't load chart"), typeof error === "string" ? error : "Retry or check the data source.")));
    }
    if (empty) {
      return /*#__PURE__*/React.createElement("div", {
        className: "cx-state cx-empty",
        style: {
          height
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "cx-empty-dash"
      }, "\u2014"), /*#__PURE__*/React.createElement("div", {
        className: "t-caption"
      }, "No data in range."));
    }
    return /*#__PURE__*/React.createElement("div", {
      className: `cx-plotwrap ${isRight ? "is-right" : ""}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "cx-plot",
      ref: ref,
      style: {
        height
      }
    }, w > minWidth && children({
      width: w,
      height
    })), legend && /*#__PURE__*/React.createElement(Legend, {
      items: legend,
      placement: legendPlacement
    }));
  };
  return /*#__PURE__*/React.createElement("figure", {
    className: "cx-frame",
    role: "group",
    "aria-label": ariaLabel || title
  }, title && /*#__PURE__*/React.createElement("figcaption", {
    className: "cx-frame-title t-label"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "cx-frame-body"
  }, body()), caption && /*#__PURE__*/React.createElement("div", {
    className: "cx-frame-cap t-caption"
  }, caption), dataTable && /*#__PURE__*/React.createElement("table", {
    className: "sr-only"
  }, /*#__PURE__*/React.createElement("caption", null, ariaLabel || title, " \u2014 data table"), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, dataTable.columns.map((c, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    scope: "col"
  }, c)))), /*#__PURE__*/React.createElement("tbody", null, dataTable.rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, r.map((c, j) => j === 0 ? /*#__PURE__*/React.createElement("th", {
    key: j,
    scope: "row"
  }, c) : /*#__PURE__*/React.createElement("td", {
    key: j
  }, c)))))));
};

/* ── Axis + GridLines primitives (rendered inside each chart's <svg>) ── */
const GridLines = ({
  ticks,
  scaleY,
  x0,
  x1
}) => /*#__PURE__*/React.createElement("g", {
  "aria-hidden": "true"
}, ticks.map(t => /*#__PURE__*/React.createElement("line", {
  key: t,
  x1: x0,
  x2: x1,
  y1: scaleY(t),
  y2: scaleY(t),
  stroke: "var(--chart-grid)",
  strokeWidth: "1"
})));
const AxisLeft = ({
  ticks,
  scaleY,
  x,
  fmt
}) => /*#__PURE__*/React.createElement("g", {
  "aria-hidden": "true"
}, ticks.map(t => /*#__PURE__*/React.createElement("text", {
  key: t,
  x: x - 6,
  y: scaleY(t) + 3,
  textAnchor: "end",
  className: "cx-axis-lbl"
}, fmt ? fmt(t) : t)));

/* ════════════════════════════════════════════════════════════════════
   BAR CHART — variants: single | stacked | grouped
   ════════════════════════════════════════════════════════════════════ */
const BarChart = ({
  data,
  series,
  variant = "single",
  height = 260,
  colors,
  formatValue = v => v,
  maxLabel = 10,
  legend: showLegend = true,
  legendPlacement = "bottom",
  title,
  caption,
  state,
  ariaLabel,
  setTip
}) => {
  const palette = colors || series.map((_, i) => CAT(i));

  // Totals per category drive the value scale
  const totals = data.map(d => variant === "stacked" ? series.reduce((s, k) => s + (d[k] || 0), 0) : Math.max(...series.map(k => d[k] || 0)));
  const maxVal = Math.max(1, ...totals);
  const {
    ticks,
    top
  } = axisTicks(maxVal);
  const legendItems = showLegend && series.length > 1 ? series.map((k, i) => ({
    label: k,
    color: palette[i]
  })) : null;
  const dataTable = {
    columns: ["Category", ...series],
    rows: data.map(d => [d.label, ...series.map(k => formatValue(d[k] || 0))])
  };
  return /*#__PURE__*/React.createElement(ChartFrame, {
    title: title,
    caption: caption,
    height: height,
    state: state,
    legend: legendItems,
    legendPlacement: legendPlacement,
    ariaLabel: ariaLabel || title,
    dataTable: dataTable
  }, ({
    width,
    height: h
  }) => {
    const m = {
      t: 14,
      r: 12,
      b: 34,
      l: 40
    };
    const iw = width - m.l - m.r,
      ih = h - m.t - m.b;
    const sy = linear(0, top, m.t + ih, m.t);
    const band = iw / data.length;
    const rotate = band < 48; // responsive: rotate tight labels
    const grp = series.length > 1 && variant === "grouped";
    const barPad = 0.28;
    const groupW = band * (1 - barPad);
    const sub = grp ? groupW / series.length : groupW;
    const show = (e, d, k, val, color) => {
      const r = e.currentTarget.getBoundingClientRect();
      const host = e.currentTarget.closest(".cx-host");
      const p = host.getBoundingClientRect();
      setTip({
        x: r.left - p.left + r.width / 2,
        y: r.top - p.top - 8,
        title: d.label,
        rows: [{
          k: series.length > 1 ? k : "Value",
          v: formatValue(val),
          color
        }]
      });
    };
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: `0 0 ${width} ${h}`,
      width: width,
      height: h,
      className: "cx-svg",
      role: "application",
      "aria-label": `${ariaLabel || title}. ${data.length} categories. Use arrow keys to move between bars.`,
      onKeyDown: onMarksKeyDown,
      onMouseLeave: () => setTip(null)
    }, /*#__PURE__*/React.createElement(GridLines, {
      ticks: ticks,
      scaleY: sy,
      x0: m.l,
      x1: width - m.r
    }), /*#__PURE__*/React.createElement(AxisLeft, {
      ticks: ticks,
      scaleY: sy,
      x: m.l,
      fmt: formatValue
    }), /*#__PURE__*/React.createElement("line", {
      x1: m.l,
      x2: m.l,
      y1: m.t,
      y2: m.t + ih,
      stroke: "var(--chart-axis)"
    }), data.map((d, ci) => {
      const bx = m.l + band * ci;
      return /*#__PURE__*/React.createElement("g", {
        key: d.label
      }, variant === "stacked" ? (() => {
        let acc = 0;
        return series.map((k, si) => {
          const val = d[k] || 0;
          const bh = val / top * ih;
          const y = sy(acc + val);
          acc += val;
          return /*#__PURE__*/React.createElement("rect", {
            key: k,
            "data-mark": true,
            tabIndex: 0,
            role: "img",
            "aria-label": `${d.label}, ${k}: ${formatValue(val)}`,
            x: bx + band * barPad / 2,
            y: y,
            width: groupW,
            height: Math.max(0, bh),
            fill: palette[si],
            rx: "1.5",
            className: "cx-bar",
            onMouseEnter: e => show(e, d, k, val, palette[si]),
            onFocus: e => show(e, d, k, val, palette[si])
          });
        });
      })() : grp ? series.map((k, si) => {
        const val = d[k] || 0;
        const bh = val / top * ih;
        return /*#__PURE__*/React.createElement("rect", {
          key: k,
          "data-mark": true,
          tabIndex: 0,
          role: "img",
          "aria-label": `${d.label}, ${k}: ${formatValue(val)}`,
          x: bx + band * barPad / 2 + sub * si,
          y: sy(val),
          width: Math.max(1, sub - 2),
          height: Math.max(0, bh),
          fill: palette[si],
          rx: "1.5",
          className: "cx-bar",
          onMouseEnter: e => show(e, d, k, val, palette[si]),
          onFocus: e => show(e, d, k, val, palette[si])
        });
      }) : (() => {
        const k = series[0];
        const val = d[k] || 0;
        const bh = val / top * ih;
        return /*#__PURE__*/React.createElement("rect", {
          "data-mark": true,
          tabIndex: 0,
          role: "img",
          "aria-label": `${d.label}: ${formatValue(val)}`,
          x: bx + band * barPad / 2,
          y: sy(val),
          width: groupW,
          height: Math.max(0, bh),
          fill: palette[0],
          rx: "1.5",
          className: "cx-bar",
          onMouseEnter: e => show(e, d, k, val, palette[0]),
          onFocus: e => show(e, d, k, val, palette[0])
        });
      })(), /*#__PURE__*/React.createElement("text", {
        x: bx + band / 2,
        y: m.t + ih + (rotate ? 10 : 16),
        textAnchor: rotate ? "end" : "middle",
        className: "cx-cat-lbl",
        transform: rotate ? `rotate(-35 ${bx + band / 2} ${m.t + ih + 10})` : undefined
      }, truncate(d.label, rotate ? maxLabel : Math.max(6, Math.floor(band / 7)))));
    }));
  });
};

/* ════════════════════════════════════════════════════════════════════
   LINE CHART — variants: single | multi | area
   ════════════════════════════════════════════════════════════════════ */
const LineChart = ({
  data,
  series,
  variant = "single",
  height = 260,
  colors,
  formatValue = v => v,
  formatX = v => v,
  legend: showLegend = true,
  legendPlacement = "bottom",
  title,
  caption,
  state,
  ariaLabel,
  setTip
}) => {
  const palette = colors || series.map((_, i) => CAT(i));
  const maxVal = Math.max(1, ...data.flatMap(d => series.map(k => d[k] || 0)));
  const {
    ticks,
    top
  } = axisTicks(maxVal);
  const legendItems = showLegend && series.length > 1 ? series.map((k, i) => ({
    label: k,
    color: palette[i],
    shape: "line"
  })) : null;
  const dataTable = {
    columns: ["X", ...series],
    rows: data.map(d => [formatX(d.x), ...series.map(k => formatValue(d[k] || 0))])
  };
  return /*#__PURE__*/React.createElement(ChartFrame, {
    title: title,
    caption: caption,
    height: height,
    state: state,
    legend: legendItems,
    legendPlacement: legendPlacement,
    ariaLabel: ariaLabel || title,
    dataTable: dataTable
  }, ({
    width,
    height: h
  }) => {
    const m = {
      t: 14,
      r: 14,
      b: 30,
      l: 40
    };
    const iw = width - m.l - m.r,
      ih = h - m.t - m.b;
    const sy = linear(0, top, m.t + ih, m.t);
    const sx = linear(0, data.length - 1, m.l, width - m.r);
    const xTickEvery = Math.ceil(data.length / Math.max(2, Math.floor(iw / 64)));
    const lineFor = k => data.map((d, i) => `${i ? "L" : "M"}${sx(i).toFixed(1)} ${sy(d[k] || 0).toFixed(1)}`).join(" ");
    const show = (e, d, i) => {
      const host = e.currentTarget.closest(".cx-host");
      const p = host.getBoundingClientRect();
      const r = e.currentTarget.getBoundingClientRect();
      setTip({
        x: r.left - p.left + r.width / 2,
        y: r.top - p.top - 8,
        title: formatX(d.x),
        rows: series.map((k, si) => ({
          k,
          v: formatValue(d[k] || 0),
          color: palette[si]
        }))
      });
    };
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: `0 0 ${width} ${h}`,
      width: width,
      height: h,
      className: "cx-svg",
      role: "application",
      "aria-label": `${ariaLabel || title}. ${series.length} series, ${data.length} points. Arrow keys to move between points.`,
      onKeyDown: onMarksKeyDown,
      onMouseLeave: () => setTip(null)
    }, /*#__PURE__*/React.createElement(GridLines, {
      ticks: ticks,
      scaleY: sy,
      x0: m.l,
      x1: width - m.r
    }), /*#__PURE__*/React.createElement(AxisLeft, {
      ticks: ticks,
      scaleY: sy,
      x: m.l,
      fmt: formatValue
    }), series.map((k, si) => /*#__PURE__*/React.createElement("g", {
      key: k
    }, variant === "area" && /*#__PURE__*/React.createElement("path", {
      d: `${lineFor(k)} L${sx(data.length - 1)} ${sy(0)} L${sx(0)} ${sy(0)} Z`,
      fill: palette[si],
      fillOpacity: "0.12",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("path", {
      d: lineFor(k),
      fill: "none",
      stroke: palette[si],
      strokeWidth: "2",
      strokeLinejoin: "round",
      strokeLinecap: "round",
      "aria-hidden": "true"
    }))), data.map((d, i) => /*#__PURE__*/React.createElement("g", {
      key: i
    }, series.map((k, si) => /*#__PURE__*/React.createElement("circle", {
      key: k,
      "data-mark": true,
      tabIndex: si === 0 ? 0 : -1,
      role: "img",
      "aria-label": `${formatX(d.x)}${series.length > 1 ? ", " + k : ""}: ${formatValue(d[k] || 0)}`,
      cx: sx(i),
      cy: sy(d[k] || 0),
      r: "3.5",
      fill: "var(--bg-surface)",
      stroke: palette[si],
      strokeWidth: "2",
      className: "cx-dot",
      onMouseEnter: e => show(e, d, i),
      onFocus: e => show(e, d, i)
    })), i % xTickEvery === 0 && /*#__PURE__*/React.createElement("text", {
      x: sx(i),
      y: m.t + ih + 16,
      textAnchor: "middle",
      className: "cx-cat-lbl"
    }, formatX(d.x)))));
  });
};

/* ════════════════════════════════════════════════════════════════════
   DONUT CHART — variants: donut | pie  (+ center-label slot)
   ════════════════════════════════════════════════════════════════════ */
const DonutChart = ({
  data,
  variant = "donut",
  height = 260,
  colors,
  formatValue = v => v,
  innerRatio = 0.62,
  centerLabel,
  centerSlot,
  legend: showLegend = true,
  legendPlacement = "right",
  title,
  caption,
  state,
  ariaLabel,
  setTip
}) => {
  const palette = colors || data.map((_, i) => CAT(i));
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const legendItems = showLegend ? data.map((d, i) => ({
    label: d.label,
    color: palette[i],
    value: `${Math.round(d.value / total * 100)}%`
  })) : null;
  const dataTable = {
    columns: ["Segment", "Value", "Share"],
    rows: data.map(d => [d.label, formatValue(d.value), `${(d.value / total * 100).toFixed(1)}%`])
  };
  const arc = (cx, cy, rO, rI, a0, a1) => {
    const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const [x0, y0] = p(rO, a0),
      [x1, y1] = p(rO, a1);
    const [xi1, yi1] = p(rI, a1),
      [xi0, yi0] = p(rI, a0);
    if (variant === "pie") return `M${cx} ${cy} L${x0} ${y0} A${rO} ${rO} 0 ${large} 1 ${x1} ${y1} Z`;
    return `M${x0} ${y0} A${rO} ${rO} 0 ${large} 1 ${x1} ${y1} L${xi1} ${yi1} A${rI} ${rI} 0 ${large} 0 ${xi0} ${yi0} Z`;
  };
  return /*#__PURE__*/React.createElement(ChartFrame, {
    title: title,
    caption: caption,
    height: height,
    state: state,
    legend: legendItems,
    legendPlacement: legendPlacement,
    ariaLabel: ariaLabel || title,
    dataTable: dataTable,
    minWidth: 80
  }, ({
    width,
    height: h
  }) => {
    const size = Math.min(width, h);
    const cx = width / 2,
      cy = h / 2,
      rO = size / 2 - 6,
      rI = variant === "pie" ? 0 : rO * innerRatio;
    let a = -Math.PI / 2;
    const show = (e, d) => {
      const host = e.currentTarget.closest(".cx-host");
      const p = host.getBoundingClientRect();
      const r = e.currentTarget.getBoundingClientRect();
      setTip({
        x: r.left - p.left + r.width / 2,
        y: r.top - p.top,
        title: d.label,
        rows: [{
          k: "Value",
          v: formatValue(d.value)
        }, {
          k: "Share",
          v: `${(d.value / total * 100).toFixed(1)}%`
        }]
      });
    };
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: `0 0 ${width} ${h}`,
      width: width,
      height: h,
      className: "cx-svg",
      role: "application",
      "aria-label": `${ariaLabel || title}. ${data.length} segments. Arrow keys to move between segments.`,
      onKeyDown: onMarksKeyDown,
      onMouseLeave: () => setTip(null)
    }, data.map((d, i) => {
      const a0 = a,
        a1 = a + d.value / total * Math.PI * 2;
      a = a1;
      return /*#__PURE__*/React.createElement("path", {
        key: d.label,
        "data-mark": true,
        tabIndex: 0,
        role: "img",
        "aria-label": `${d.label}: ${formatValue(d.value)}, ${(d.value / total * 100).toFixed(1)}%`,
        d: arc(cx, cy, rO, rI, a0, a1),
        fill: palette[i],
        className: "cx-arc",
        stroke: "var(--bg-surface)",
        strokeWidth: "2",
        onMouseEnter: e => show(e, d),
        onFocus: e => show(e, d)
      });
    }), variant === "donut" && (centerSlot ? /*#__PURE__*/React.createElement("foreignObject", {
      x: cx - rI,
      y: cy - rI,
      width: rI * 2,
      height: rI * 2
    }, /*#__PURE__*/React.createElement("div", {
      className: "cx-center"
    }, centerSlot)) : centerLabel && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("text", {
      x: cx,
      y: cy - 2,
      textAnchor: "middle",
      className: "cx-center-val"
    }, centerLabel.value), /*#__PURE__*/React.createElement("text", {
      x: cx,
      y: cy + 14,
      textAnchor: "middle",
      className: "cx-center-lbl"
    }, centerLabel.label))));
  });
};

/* ── WithTip — hosts tooltip state + renders the absolute tooltip div ── */
const WithTip = ({
  Chart,
  ...props
}) => {
  const [tip, setTip] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", {
    className: "cx-host",
    onMouseLeave: () => setTip(null),
    onBlur: e => {
      if (!e.currentTarget.contains(e.relatedTarget)) setTip(null);
    }
  }, /*#__PURE__*/React.createElement(Chart, _extends({}, props, {
    setTip: setTip
  })), /*#__PURE__*/React.createElement(ChartTooltip, {
    tip: tip
  }));
};

/* Public composite components (tooltip-hosted) */
const Bar = p => /*#__PURE__*/React.createElement(WithTip, _extends({
  Chart: BarChart
}, p));
const Line = p => /*#__PURE__*/React.createElement(WithTip, _extends({
  Chart: LineChart
}, p));
const Donut = p => /*#__PURE__*/React.createElement(WithTip, _extends({
  Chart: DonutChart
}, p));
Object.assign(window, {
  ChartFrame,
  Legend,
  ChartTooltip,
  Bar,
  Line,
  Donut,
  CAT
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "charts-lib.jsx", error: String((e && e.message) || e) }); }

// components/rw-modal-demos.js
try { (() => {
/* ============================================================================
   Demos for the Modal component spec page.
   Shows the high-level open() API, the confirm() helper, and a faithful
   rebuild of the original AddPortModal assembled from the standardized slots.
   ========================================================================== */
(function () {
  'use strict';

  // Inject demo-only styles (form fields + map placeholder used by the
  // AddPort rebuild) so the demos look correct wherever this script loads.
  function ensureDemoStyles() {
    if (document.getElementById('rw-modal-demo-style')) return;
    var s = document.createElement('style');
    s.id = 'rw-modal-demo-style';
    s.textContent = '.demo-twocol{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px;}' + '.demo-formgrid{display:grid;gap:12px;align-content:start;}' + '.demo-field{display:grid;grid-template-columns:140px 1fr;gap:14px;align-items:center;}' + '.demo-field-label{font-size:13px;color:#334155;}' + '.demo-field-control{width:100%;border:1px solid #d1d5db;border-radius:6px;padding:7px 10px;font:inherit;font-size:13px;color:#0f172a;background:#fff;transition:border-color 120ms,box-shadow 120ms;}' + '.demo-field-control:focus{outline:0;border-color:#8ec5fd;box-shadow:0 0 0 3px rgba(37,99,235,.12);}' + ".demo-field-select{appearance:none;-webkit-appearance:none;cursor:pointer;padding-right:28px;background:#fff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\") no-repeat right 10px center;}" + '.demo-map{min-height:360px;border:1px solid #e2e8f0;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,rgba(45,127,251,0.05),rgba(45,127,251,0.02)),repeating-linear-gradient(45deg,#eef2f7 0 10px,#e6ecf3 10px 20px);}' + '.demo-map-cap{font-family:monospace;font-size:11px;color:#64748b;background:rgba(255,255,255,0.8);padding:4px 10px;border-radius:6px;}' + '@media (max-width:768px){.demo-twocol{grid-template-columns:1fr;}.demo-map{min-height:220px;}.demo-field{grid-template-columns:1fr;gap:4px;}}';
    document.head.appendChild(s);
  }
  function field(label, id, value, opts) {
    opts = opts || {};
    var wrap = document.createElement('div');
    wrap.className = 'demo-field';
    var l = document.createElement('label');
    l.className = 'demo-field-label';
    l.setAttribute('for', id);
    l.textContent = label;
    wrap.appendChild(l);
    var input;
    if (opts.select) {
      input = document.createElement('select');
      input.className = 'demo-field-control demo-field-select';
      opts.options.forEach(function (o) {
        var op = document.createElement('option');
        op.value = o;
        op.textContent = o || '—';
        if (o === value) op.selected = true;
        input.appendChild(op);
      });
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.className = 'demo-field-control';
      input.value = value || '';
    }
    input.id = id;
    wrap.appendChild(input);
    return wrap;
  }

  /* ── Size variants ────────────────────────────────────────────────── */
  function openSize(size) {
    var labels = {
      sm: 'Small',
      md: 'Medium',
      lg: 'Large',
      xl: 'Extra-large',
      full: 'Full-bleed'
    };
    RWModal.open({
      size: size,
      title: labels[size] + ' dialog',
      subtitle: 'size="' + size + '"',
      body: function (b) {
        var p = document.createElement('p');
        p.style.cssText = 'margin:0;font-size:13.5px;line-height:1.6;color:#475569;';
        p.innerHTML = 'This is the <strong>' + labels[size] + '</strong> container width. The same header, body, and footer slots scale across every size — only <code style="font-family:monospace;">--rw-modal-w-' + size + '</code> changes. Tab through the buttons below: focus is trapped inside this dialog, and Escape closes it.';
        b.appendChild(p);
      },
      footer: [{
        label: 'Cancel',
        variant: 'secondary',
        closeOnClick: true
      }, {
        label: 'Got it',
        variant: 'primary',
        onClick: function (m) {
          m.close();
        }
      }]
    });
  }

  /* ── Scrollable body ──────────────────────────────────────────────── */
  function openScrollable() {
    RWModal.open({
      size: 'md',
      title: 'Terms & coverage',
      subtitle: 'Body scrolls; header and footer stay pinned',
      body: function (b) {
        for (var i = 1; i <= 12; i++) {
          var h = document.createElement('div');
          h.className = 'rw-modal-section-title';
          if (i === 1) {
            h.style.borderTop = '0';
            h.style.marginTop = '0';
            h.style.paddingTop = '0';
          }
          h.textContent = 'Clause ' + i;
          b.appendChild(h);
          var p = document.createElement('p');
          p.style.cssText = 'margin:8px 0 4px;font-size:13px;line-height:1.6;color:#475569;';
          p.textContent = 'The body region uses overflow-y:auto with min-height:0 so it scrolls independently while the header and footer remain fixed. This keeps primary actions reachable no matter how long the content runs.';
          b.appendChild(p);
        }
      },
      footer: [{
        label: 'Decline',
        variant: 'ghost',
        closeOnClick: true
      }, {
        label: 'Accept',
        variant: 'primary',
        onClick: function (m) {
          m.close();
        }
      }]
    });
  }

  /* ── closeOnOverlayClick toggle ───────────────────────────────────── */
  function openOverlay(closeOnOverlay) {
    RWModal.open({
      size: 'sm',
      title: closeOnOverlay ? 'Dismissible' : 'Locked to actions',
      subtitle: 'closeOnOverlayClick = ' + closeOnOverlay,
      closeOnOverlayClick: closeOnOverlay,
      body: function (b) {
        var p = document.createElement('p');
        p.style.cssText = 'margin:0;font-size:13.5px;line-height:1.6;color:#475569;';
        p.textContent = closeOnOverlay ? 'Click anywhere on the dimmed backdrop to dismiss. Good for non-destructive, low-stakes dialogs.' : 'Clicking the backdrop does nothing — the user must choose an explicit action. Use this for forms with unsaved input or destructive confirmations.';
        b.appendChild(p);
      },
      footer: [{
        label: 'Close',
        variant: 'primary',
        onClick: function (m) {
          m.close();
        }
      }]
    });
  }

  /* ── confirm() helper (destructive) ───────────────────────────────── */
  function openConfirm() {
    RWModal.confirm({
      title: 'Delete portfolio?',
      message: 'This permanently removes “North Sea Fleet” and its 42 tracked vessels. This action cannot be undone.',
      confirmLabel: 'Delete portfolio',
      cancelLabel: 'Keep it',
      danger: true,
      closeOnOverlayClick: false
    }).then(function (ok) {
      if (ok) RWModal.open({
        size: 'sm',
        title: 'Deleted',
        body: '<p style="margin:0;font-size:13.5px;color:#475569;">Portfolio removed.</p>',
        footer: [{
          label: 'OK',
          variant: 'primary',
          onClick: function (m) {
            m.close();
          }
        }]
      });
    });
  }

  /* ── Faithful AddPort rebuild — assembled from the standardized slots ─ */
  function openAddPort() {
    ensureDemoStyles();
    var COUNTRIES = ['', 'Ireland', 'United Kingdom', 'Netherlands', 'Germany', 'France', 'Spain', 'Norway', 'United States', 'Singapore', 'Other'];
    RWModal.open({
      size: 'xl',
      title: 'Add a new Port',
      subtitle: 'Rebuilt on RWModal — same form, standardized shell',
      closeOnOverlayClick: false,
      initialFocus: '#ap2-name',
      body: function (b) {
        var two = document.createElement('div');
        two.className = 'demo-twocol';
        var grid = document.createElement('div');
        grid.className = 'demo-formgrid';
        grid.appendChild(field('Name', 'ap2-name', 'Dublin Port'));
        grid.appendChild(field('LOCODE', 'ap2-locode', 'IEDUB'));
        grid.appendChild(field('GlobalPortID', 'ap2-gpid', ''));
        grid.appendChild(field('WorldPortNumber', 'ap2-wpn', ''));
        grid.appendChild(field('Country', 'ap2-country', 'Ireland', {
          select: true,
          options: COUNTRIES
        }));
        grid.appendChild(field('Lat', 'ap2-lat', '53.353584'));
        grid.appendChild(field('Lng', 'ap2-lng', '-6.251495'));
        two.appendChild(grid);
        var mapWrap = document.createElement('div');
        mapWrap.className = 'demo-map';
        mapWrap.innerHTML = '<span class="demo-map-cap">Leaflet map mounts into the body slot — unchanged</span>';
        two.appendChild(mapWrap);
        b.appendChild(two);
      },
      footer: [{
        label: 'Cancel',
        variant: 'secondary',
        closeOnClick: true
      }, {
        label: 'Save',
        variant: 'primary',
        onClick: function (m) {
          var name = m.query('#ap2-name').value;
          m.close();
          RWModal.open({
            size: 'sm',
            title: 'Port saved',
            body: '<p style="margin:0;font-size:13.5px;color:#475569;">“' + name + '” was added to the registry.</p>',
            footer: [{
              label: 'Done',
              variant: 'primary',
              onClick: function (x) {
                x.close();
              }
            }]
          });
        }
      }]
    });
  }

  /* ── Composed-from-parts demo (low-level API) ─────────────────────── */
  function openComposed() {
    var P = RWModal.parts;
    var overlay = P.Overlay({
      labelledby: 'composed-title'
    });
    var container = P.Container({
      size: 'md'
    });
    container.appendChild(P.Header({
      title: 'Assembled by hand',
      titleId: 'composed-title',
      subtitle: 'Built from RWModal.parts.*'
    }));
    container.appendChild(P.Body('<p style="margin:0;font-size:13.5px;line-height:1.6;color:#475569;">This dialog was composed slot-by-slot with <code style="font-family:monospace;">Overlay → Container → Header → Body → Footer</code>, then wired with <code style="font-family:monospace;">RWModal.mount()</code> for focus-trapping and dismissal. Same primitives the high-level <code style="font-family:monospace;">open()</code> uses internally.</p>'));
    container.appendChild(P.Footer([{
      label: 'Close',
      variant: 'primary',
      onClick: function (m) {
        m.close();
      }
    }]));
    overlay.appendChild(container);
    RWModal.mount(overlay, {
      closeOnOverlayClick: true,
      closeOnEsc: true
    });
  }

  // Expose to the page
  window.ModalDemos = {
    openSize: openSize,
    openScrollable: openScrollable,
    openOverlay: openOverlay,
    openConfirm: openConfirm,
    openAddPort: openAddPort,
    openComposed: openComposed
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/rw-modal-demos.js", error: String((e && e.message) || e) }); }

// components/rw-modal.js
try { (() => {
/* ============================================================================
   RW Modal — Design System Component (framework-agnostic, vanilla JS)
   ----------------------------------------------------------------------------
   Standardizes the platform's dialogs into one accessible, configurable
   primitive. Drop in alongside components/rw-modal.css.

   HIGH-LEVEL API
   ──────────────
     const modal = RWModal.open({
       size: 'md',                  // 'sm' | 'md' | 'lg' | 'xl' | 'full'
       title: 'Add a new Port',
       subtitle: 'Define location and metadata',
       closeButton: true,           // show the standardized × button
       closeOnOverlayClick: true,   // click scrim to dismiss
       closeOnEsc: true,            // Escape to dismiss
       align: 'center',             // 'center' | 'top'
       body: el => { ... },         // string | Node | (bodyEl) => void
       footer: [                    // array of button configs (or Node/string/false)
         { label: 'Cancel', variant: 'secondary', closeOnClick: true },
         { label: 'Save',   variant: 'primary',   onClick: m => {...} },
       ],
       initialFocus: '#field-name', // selector or Node; defaults to first field
       onOpen:  m => {},
       onClose: () => {},
     });
     modal.close();

   LOW-LEVEL SLOTS (assemble by hand — see RWModal.parts)
   ──────────────
     RWModal.parts.Overlay / Container / Header / Body / Footer / Button
     RWModal.mount(overlayEl, opts)   // wires a11y + behavior onto a built tree

   ACCESSIBILITY
   ──────────────
     • role="dialog", aria-modal="true", aria-labelledby → title (or aria-label)
     • Focus is trapped within the dialog (Tab / Shift+Tab cycle)
     • Escape closes (when closeOnEsc); focus returns to the trigger on close
     • Background scroll is locked; nested modals are reference-counted
   ========================================================================== */
(function () {
  'use strict';

  var SIZES = {
    sm: 'rw-modal--sm',
    md: 'rw-modal--md',
    lg: 'rw-modal--lg',
    xl: 'rw-modal--xl',
    full: 'rw-modal--full'
  };
  var FOCUSABLE = ['a[href]', 'button:not([disabled])', 'textarea:not([disabled])', 'input:not([disabled]):not([type="hidden"])', 'select:not([disabled])', '[tabindex]:not([tabindex="-1"])'].join(',');
  var uid = 0;
  var openCount = 0;
  var CLOSE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">' + '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  /* ── tiny DOM helpers ───────────────────────────────────────────────── */
  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) for (var k in attrs) {
      if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    return n;
  }
  function fill(node, content) {
    if (content == null || content === false) return;
    if (typeof content === 'string') node.innerHTML = content;else if (content instanceof Node) node.appendChild(content);else if (typeof content === 'function') {
      var r = content(node);
      if (r != null && r !== node) fill(node, r);
    }
  }
  function ensureRoot() {
    var root = document.getElementById('rw-modal-root');
    if (!root) {
      root = el('div', null, {
        id: 'rw-modal-root'
      });
      document.body.appendChild(root);
    }
    return root;
  }
  function lockScroll(lock) {
    if (lock) {
      openCount++;
      document.documentElement.classList.add('rw-modal-open');
    } else {
      openCount = Math.max(0, openCount - 1);
      if (!openCount) document.documentElement.classList.remove('rw-modal-open');
    }
  }

  /* ── sub-component builders (the five slots) ────────────────────────── */
  var parts = {
    Overlay: function (opts) {
      opts = opts || {};
      var o = el('div', 'rw-modal-overlay' + (opts.align === 'top' ? ' rw-modal-overlay--top' : ''), {
        role: 'dialog',
        'aria-modal': 'true'
      });
      if (opts.labelledby) o.setAttribute('aria-labelledby', opts.labelledby);else if (opts.ariaLabel) o.setAttribute('aria-label', opts.ariaLabel);
      return o;
    },
    Container: function (opts) {
      opts = opts || {};
      var sizeCls = SIZES[opts.size] || SIZES.md;
      return el('div', 'rw-modal ' + sizeCls + (opts.className ? ' ' + opts.className : ''));
    },
    Header: function (opts) {
      opts = opts || {};
      var hasClose = opts.closeButton !== false;
      var h = el('div', 'rw-modal-header' + (hasClose ? '' : ' rw-modal-header--plain'));
      var titles = el('div', 'rw-modal-titles');
      if (opts.title) {
        var t = el('h2', 'rw-modal-title', {
          id: opts.titleId
        });
        t.textContent = opts.title;
        titles.appendChild(t);
      }
      if (opts.subtitle) {
        var s = el('p', 'rw-modal-subtitle');
        s.textContent = opts.subtitle;
        titles.appendChild(s);
      }
      h.appendChild(titles);
      if (hasClose) {
        var btn = el('button', 'rw-modal-close-btn', {
          type: 'button',
          'aria-label': opts.closeLabel || 'Close dialog',
          'data-rw-close': ''
        });
        btn.innerHTML = CLOSE_SVG;
        h.appendChild(btn);
      }
      return h;
    },
    Body: function (content, opts) {
      opts = opts || {};
      var b = el('div', 'rw-modal-body' + (opts.className ? ' ' + opts.className : ''));
      fill(b, content);
      return b;
    },
    Footer: function (items, opts) {
      opts = opts || {};
      var f = el('div', 'rw-modal-footer' + (opts.layout ? ' rw-modal-footer--' + opts.layout : ''));
      if (Array.isArray(items)) items.forEach(function (cfg) {
        f.appendChild(parts.Button(cfg));
      });else fill(f, items);
      return f;
    },
    Button: function (cfg) {
      cfg = cfg || {};
      var variant = cfg.variant || 'secondary';
      var b = el('button', 'rw-modal-btn rw-modal-btn--' + variant, {
        type: 'button'
      });
      if (cfg.id) b.id = cfg.id;
      if (cfg.disabled) b.disabled = true;
      if (cfg.autoFocus) b.setAttribute('data-rw-autofocus', '');
      b.textContent = cfg.label || '';
      b._rwCfg = cfg; // consumed by mount() for click wiring
      return b;
    }
  };

  /* ── mount(): wire accessibility + behavior onto an assembled tree ──── */
  function mount(overlay, opts) {
    opts = opts || {};
    var root = ensureRoot();
    var previouslyFocused = document.activeElement;
    var modal = overlay.querySelector('.rw-modal') || overlay;
    var closed = false;
    var instance = {
      el: overlay,
      modal: modal,
      query: function (sel) {
        return overlay.querySelector(sel);
      },
      queryAll: function (sel) {
        return Array.prototype.slice.call(overlay.querySelectorAll(sel));
      },
      close: doClose
    };
    function focusables() {
      return Array.prototype.slice.call(modal.querySelectorAll(FOCUSABLE)).filter(function (n) {
        return n.offsetParent !== null || n === document.activeElement;
      });
    }
    function onKeydown(e) {
      if (e.key === 'Escape' && opts.closeOnEsc !== false) {
        e.stopPropagation();
        doClose();
        return;
      }
      if (e.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) {
        e.preventDefault();
        return;
      }
      var first = f[0],
        last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    // If focus somehow escapes the dialog, pull it back in (true trap).
    function onFocusIn(e) {
      if (!overlay.contains(e.target)) {
        var f = focusables();
        if (f.length) f[0].focus();
      }
    }
    function onOverlayClick(e) {
      if (e.target === overlay && opts.closeOnOverlayClick !== false) doClose();
    }
    function doClose() {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKeydown, true);
      document.removeEventListener('focusin', onFocusIn, true);
      overlay.classList.add('is-closing');
      lockScroll(false);
      var ms = prefersReducedMotion() ? 0 : 140;
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
        if (typeof opts.onClose === 'function') opts.onClose();
      }, ms);
    }

    // Wire close affordances
    overlay.addEventListener('mousedown', function (e) {
      instance._downTarget = e.target;
    });
    overlay.addEventListener('click', function (e) {
      // Only dismiss when both press and release happen on the scrim (prevents
      // accidental close when a drag starts inside the modal and ends on scrim).
      if (instance._downTarget === overlay) onOverlayClick(e);
    });
    instance.queryAll('[data-rw-close]').forEach(function (b) {
      b.addEventListener('click', doClose);
    });

    // Wire footer button configs
    instance.queryAll('.rw-modal-btn').forEach(function (b) {
      var cfg = b._rwCfg;
      if (!cfg) return;
      b.addEventListener('click', function () {
        // Run the handler; if it returns false, keep the modal open
        // (e.g. validation failed). Otherwise close unless closeOnClick:false.
        var keepOpen = false;
        if (typeof cfg.onClick === 'function') keepOpen = cfg.onClick(instance) === false;
        if (!keepOpen && cfg.closeOnClick !== false) doClose();
      });
    });
    document.addEventListener('keydown', onKeydown, true);
    document.addEventListener('focusin', onFocusIn, true);
    root.appendChild(overlay);
    lockScroll(true);

    // Initial focus — setTimeout (not rAF) so it fires even if the tab is
    // backgrounded at open time; rAF is paused while the document is hidden.
    setTimeout(function () {
      var target = null;
      if (opts.initialFocus) {
        target = typeof opts.initialFocus === 'string' ? overlay.querySelector(opts.initialFocus) : opts.initialFocus;
      }
      if (!target) target = overlay.querySelector('[data-rw-autofocus]');
      if (!target) {
        var f = focusables().filter(function (n) {
          return !n.hasAttribute('data-rw-close');
        });
        target = f[0] || overlay.querySelector('.rw-modal-close-btn') || modal;
      }
      if (target && typeof target.focus === 'function') target.focus();
      if (typeof opts.onOpen === 'function') opts.onOpen(instance);
    }, 30);
    return instance;
  }
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ── open(): the high-level convenience that assembles the slots ────── */
  function open(config) {
    config = config || {};
    var id = 'rw-modal-' + ++uid;
    var titleId = id + '-title';
    var overlay = parts.Overlay({
      align: config.align,
      labelledby: config.title ? titleId : null,
      ariaLabel: config.ariaLabel
    });
    var container = parts.Container({
      size: config.size,
      className: config.className
    });

    // Header (skip entirely if no title and explicitly no close button)
    if (config.title || config.subtitle || config.closeButton !== false) {
      container.appendChild(parts.Header({
        title: config.title,
        titleId: titleId,
        subtitle: config.subtitle,
        closeButton: config.closeButton,
        closeLabel: config.closeLabel
      }));
    }
    container.appendChild(parts.Body(config.body, {
      className: config.bodyClassName
    }));
    if (config.footer !== false && config.footer != null) {
      container.appendChild(parts.Footer(config.footer, {
        layout: config.footerLayout
      }));
    }
    overlay.appendChild(container);
    return mount(overlay, {
      closeOnOverlayClick: config.closeOnOverlayClick,
      closeOnEsc: config.closeOnEsc,
      initialFocus: config.initialFocus,
      onOpen: config.onOpen,
      onClose: config.onClose
    });
  }

  /* ── confirm(): higher-order helper for destructive / yes-no dialogs ── */
  function confirm(config) {
    config = config || {};
    return new Promise(function (resolve) {
      var body = el('div');
      var p = el('p', null);
      p.style.cssText = 'margin:0;font-size:13.5px;line-height:1.55;color:var(--rw-modal-text-muted);';
      p.textContent = config.message || '';
      body.appendChild(p);
      var m = open({
        size: config.size || 'sm',
        title: config.title || 'Are you sure?',
        body: body,
        closeOnOverlayClick: config.closeOnOverlayClick !== false,
        footer: [{
          label: config.cancelLabel || 'Cancel',
          variant: 'secondary',
          onClick: function () {
            resolve(false);
          },
          closeOnClick: true
        }, {
          label: config.confirmLabel || 'Confirm',
          variant: config.danger ? 'danger' : 'primary',
          onClick: function (inst) {
            resolve(true);
            inst.close();
          }
        }],
        onClose: function () {
          resolve(false);
        }
      });
      return m;
    });
  }
  function closeAll() {
    Array.prototype.slice.call(document.querySelectorAll('#rw-modal-root .rw-modal-overlay')).forEach(function (o) {
      o.classList.add('is-closing');
      setTimeout(function () {
        o.remove();
      }, 140);
    });
    openCount = 0;
    document.documentElement.classList.remove('rw-modal-open');
  }
  window.RWModal = {
    open: open,
    confirm: confirm,
    mount: mount,
    parts: parts,
    closeAll: closeAll
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/rw-modal.js", error: String((e && e.message) || e) }); }

// copy-utilities.js
try { (() => {
/* ============================================================
   Copy Utilities — zero-touch enhancement layer
   ------------------------------------------------------------
   Auto-decorates existing primitives with copy actions:
     • <pre class="code">     → toolbar with Copy + format switcher
     • .token-row <code>      → inline copy chip on hover
     • [data-copy]            → explicit opt-in for any element
   No JSX changes required. Uses MutationObserver so it works
   with the async React render.
   ============================================================ */
(function () {
  "use strict";

  const COPIED_MS = 1800;

  /* -------- clipboard with fallback -------- */
  async function writeClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {/* fall through */}
    // Fallback for non-secure contexts / older browsers
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  /* -------- ARIA live region for screen-reader feedback -------- */
  let liveRegion;
  function announce(msg) {
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.setAttribute("role", "status");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.className = "sr-only";
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = "";
    // Re-set on next tick so SRs re-announce identical messages
    setTimeout(() => {
      liveRegion.textContent = msg;
    }, 30);
  }

  /* -------- icons (inline SVG strings) -------- */
  const ICON_COPY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`;
  const ICON_CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;

  /* -------- flash a button into "copied" state -------- */
  function flashCopied(btn, label) {
    btn.classList.add("is-copied");
    const orig = btn.dataset.origHtml || btn.innerHTML;
    if (!btn.dataset.origHtml) btn.dataset.origHtml = orig;
    btn.innerHTML = `${ICON_CHECK}<span>Copied</span>`;
    btn.setAttribute("aria-label", `${label} copied to clipboard`);
    clearTimeout(btn._copyTimer);
    btn._copyTimer = setTimeout(() => {
      btn.classList.remove("is-copied");
      btn.innerHTML = btn.dataset.origHtml;
      btn.removeAttribute("aria-label");
    }, COPIED_MS);
  }

  /* -------- detect code language from content -------- */
  function detectLang(text) {
    if (/^\s*\/\*|--[a-z-]+\s*:|@(media|font-face|keyframes)/i.test(text)) return "css";
    if (/^\s*(import|export|const|function|=>|<[A-Z])/m.test(text)) return "tsx";
    if (/^\s*</.test(text)) return "html";
    return "code";
  }
  const COPY_LABEL_BY_LANG = {
    css: "Copy CSS",
    tsx: "Copy code",
    html: "Copy HTML",
    code: "Copy"
  };

  /* -------- enhance a <pre class="code"> block -------- */
  function enhanceCodeBlock(pre) {
    if (pre.dataset.copyEnhanced) return;
    pre.dataset.copyEnhanced = "1";
    const raw = pre.textContent || "";
    const lang = detectLang(raw);
    const label = COPY_LABEL_BY_LANG[lang] || "Copy";

    // Wrap pre in a positioned container so toolbar can be absolute
    const wrap = document.createElement("div");
    wrap.className = "ds-code-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    const toolbar = document.createElement("div");
    toolbar.className = "ds-code-toolbar";
    toolbar.innerHTML = `
      <span class="ds-code-lang" aria-hidden="true">${lang}</span>
      <button type="button" class="ds-copy-btn" data-copy-code aria-label="${label}">
        ${ICON_COPY}<span>${label}</span>
      </button>
    `;
    wrap.appendChild(toolbar);
    toolbar.querySelector("[data-copy-code]").addEventListener("click", async e => {
      const btn = e.currentTarget;
      const ok = await writeClipboard(raw.replace(/\n+$/, ""));
      if (ok) {
        flashCopied(btn, label);
        announce(`${label} — copied to clipboard`);
      }
    });
  }

  /* -------- enhance a token-row <code> element -------- */
  function enhanceTokenCode(codeEl) {
    if (codeEl.dataset.copyEnhanced) return;
    // only the FIRST <code> child of a token-row — the token name
    const row = codeEl.closest(".token-row");
    if (!row) return;
    if (row.querySelector("code") !== codeEl) return;
    codeEl.dataset.copyEnhanced = "1";

    // Wrap the code in an inline-flex container so we can absolutely place a chip
    const wrap = document.createElement("span");
    wrap.className = "ds-token-copy-wrap";
    codeEl.parentNode.insertBefore(wrap, codeEl);
    wrap.appendChild(codeEl);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ds-token-copy-chip";
    btn.setAttribute("aria-label", `Copy token ${codeEl.textContent.trim()}`);
    btn.innerHTML = ICON_COPY;
    wrap.appendChild(btn);
    btn.addEventListener("click", async e => {
      e.stopPropagation();
      const token = codeEl.textContent.trim();
      const ok = await writeClipboard(token);
      if (ok) {
        flashCopied(btn, `Token ${token}`);
        announce(`${token} copied`);
      }
    });
  }

  /* -------- enhance explicit [data-copy] opt-ins -------- */
  function enhanceDataCopy(el) {
    if (el.dataset.copyEnhanced) return;
    el.dataset.copyEnhanced = "1";
    el.addEventListener("click", async () => {
      const val = el.getAttribute("data-copy");
      const ok = await writeClipboard(val);
      if (ok) {
        flashCopied(el, el.getAttribute("data-copy-label") || "Value");
        announce(`${val} copied`);
      }
    });
    el.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.click();
      }
    });
    if (!el.hasAttribute("tabindex") && el.tagName !== "BUTTON") el.setAttribute("tabindex", "0");
    if (!el.hasAttribute("role") && el.tagName !== "BUTTON") el.setAttribute("role", "button");
  }

  /* -------- collect DS class names used inside a node -------- */
  function collectClasses(root) {
    const out = new Set();
    root.querySelectorAll("[class]").forEach(el => {
      el.classList.forEach(c => {
        if (/^(ds-|t-|panel|swatch|token-row|grid-|row|col|callout|surface|spec-)/.test(c)) {
          out.add(c);
        }
      });
    });
    return out;
  }

  /* -------- extract CSS rules from the stylesheet matching any of the given classes -------- */
  function extractCss(classes) {
    const wanted = Array.from(classes);
    const lines = [];
    const seen = new Set();
    for (const sheet of Array.from(document.styleSheets)) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch (_) {
        continue;
      } // cross-origin guard
      if (!rules) continue;
      for (const rule of Array.from(rules)) {
        if (!rule.selectorText || !rule.cssText) continue;
        // match if selector mentions any of our classes
        const sel = rule.selectorText;
        const hit = wanted.some(c => sel.indexOf("." + c) !== -1);
        if (hit && !seen.has(rule.cssText)) {
          seen.add(rule.cssText);
          lines.push(rule.cssText);
        }
      }
    }
    return lines.join("\n\n");
  }

  /* -------- collect token names referenced inside a node (from inline class="inline" code + class names) -------- */
  function collectTokens(root) {
    const tokens = new Set();
    // Explicit code.inline references
    root.querySelectorAll("code.inline, code").forEach(c => {
      const t = (c.textContent || "").trim();
      if (/^--[a-z][a-z0-9-]+$/i.test(t)) tokens.add(t);
    });
    // From class names: ds-btn--primary → references --brand-600 etc.
    // We resolve indirectly: serialize matching CSS, then regex out --vars
    const classes = collectClasses(root);
    const css = extractCss(classes);
    const re = /var\((--[a-z0-9-]+)/gi;
    let m;
    while ((m = re.exec(css)) !== null) tokens.add(m[1]);
    return tokens;
  }

  /* -------- resolve a token to its computed value from :root -------- */
  function resolveToken(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /* -------- serialize the rendered preview as static HTML -------- */
  function serializePreview(body) {
    // Strip React-injected attributes that aren't useful in copied output
    const clone = body.cloneNode(true);
    clone.querySelectorAll("*").forEach(el => {
      [...el.attributes].forEach(a => {
        if (/^(data-react|data-reactroot|data-cc-id|data-dm-ref|data-copy-enhanced)/.test(a.name)) {
          el.removeAttribute(a.name);
        }
      });
      // Drop the injected toolbars/wraps we added
      if (el.classList && (el.classList.contains("ds-code-toolbar") || el.classList.contains("ds-token-copy-chip") || el.classList.contains("ds-panel-copy-toolbar"))) {
        el.remove();
      }
    });
    // Unwrap our injected wrappers
    clone.querySelectorAll(".ds-code-wrap").forEach(w => {
      const pre = w.querySelector("pre.code");
      if (pre) w.replaceWith(pre);
    });
    clone.querySelectorAll(".ds-token-copy-wrap").forEach(w => {
      const code = w.querySelector("code");
      if (code) w.replaceWith(code);
    });
    // Pretty-print: 2-space indented
    return formatHtml(clone.innerHTML);
  }
  function formatHtml(html) {
    // very lightweight pretty-printer
    const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
    let out = "",
      indent = 0;
    const tokens = html.replace(/>\s+</g, "><").split(/(<[^>]+>)/g).filter(Boolean);
    for (const t of tokens) {
      if (t.startsWith("</")) {
        indent = Math.max(indent - 1, 0);
        out += "  ".repeat(indent) + t + "\n";
      } else if (t.startsWith("<") && !t.startsWith("<!")) {
        const tag = t.match(/^<\s*([a-z0-9-]+)/i);
        const selfClose = t.endsWith("/>") || tag && VOID.has(tag[1].toLowerCase());
        out += "  ".repeat(indent) + t + "\n";
        if (!selfClose) indent += 1;
      } else {
        const txt = t.trim();
        if (txt) out += "  ".repeat(indent) + txt + "\n";
      }
    }
    return out.trim();
  }

  /* -------- enhance a ComponentBlock panel-head with Copy Code / CSS / Tokens -------- */
  function enhanceComponentPanel(panel) {
    if (panel.dataset.copyEnhanced) return;
    const head = panel.querySelector(":scope > .panel-head");
    const body = panel.querySelector(":scope > .panel-body");
    if (!head || !body) return;
    // Only attach to ComponentBlock-style panels — those inside .subsection
    if (!panel.closest(".subsection")) return;
    // Skip if this panel only contains a single pre.code (it already has its own toolbar)
    if (body.querySelector(":scope > pre.code") && body.children.length === 1) return;
    panel.dataset.copyEnhanced = "1";
    const tokens = collectTokens(body);
    const classes = collectClasses(body);
    const toolbar = document.createElement("div");
    toolbar.className = "ds-panel-copy-toolbar";
    toolbar.setAttribute("role", "group");
    toolbar.setAttribute("aria-label", "Copy implementation");
    const mkBtn = (label, action, ariaLabel) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ds-panel-copy-btn";
      b.setAttribute("aria-label", ariaLabel || label);
      b.innerHTML = `${ICON_COPY}<span>${label}</span>`;
      b.addEventListener("click", async () => {
        const text = action();
        if (!text) {
          announce("Nothing to copy");
          return;
        }
        const ok = await writeClipboard(text);
        if (ok) {
          flashCopied(b, label);
          announce(`${label} — copied to clipboard`);
        }
      });
      return b;
    };
    toolbar.appendChild(mkBtn("Copy code", () => serializePreview(body), "Copy markup for this component"));
    toolbar.appendChild(mkBtn("Copy CSS", () => extractCss(classes), "Copy CSS rules for this component"));
    if (tokens.size > 0) {
      const label = `Copy tokens (${tokens.size})`;
      toolbar.appendChild(mkBtn(label, () => {
        return Array.from(tokens).sort().map(t => `${t}: ${resolveToken(t)};`).join("\n");
      }, "Copy design tokens used by this component"));
    }

    // Hide the existing "all states · all variants" meta on small screens to make room
    head.appendChild(toolbar);
  }

  /* -------- scan a subtree -------- */
  function scan(root) {
    root.querySelectorAll("pre.code").forEach(enhanceCodeBlock);
    root.querySelectorAll(".token-row > code").forEach(enhanceTokenCode);
    root.querySelectorAll("[data-copy]").forEach(enhanceDataCopy);
    root.querySelectorAll(".subsection > .panel").forEach(enhanceComponentPanel);
  }

  /* -------- boot + observe -------- */
  function boot() {
    scan(document.body);
    const obs = new MutationObserver(mutations => {
      for (const m of mutations) {
        m.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          scan(node);
        });
      }
    });
    obs.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "copy-utilities.js", error: String((e && e.message) || e) }); }

// icons.jsx
try { (() => {
/* Shared inline icons (SVG paths) for the spec page demos */

const I = {
  search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35",
  plus: "M12 5v14M5 12h14",
  filter: "M4 5h16M7 12h10M10 19h4",
  download: "M12 3v12m0 0 4-4m-4 4-4-4M4 21h16",
  chevron: "m6 9 6 6 6-6",
  chevronRight: "m9 6 6 6-6 6",
  chevronLeft: "m15 6-6 6 6 6",
  check: "M20 6 9 17l-5-5",
  x: "M18 6 6 18M6 6l12 12",
  warn: "M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z",
  info: "M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  ship: "M3 18s2-1 9-1 9 1 9 1M5 14l1.5-7h11L19 14M12 4v3M9 21v-3m6 3v-3",
  plane: "M21 12 3 18l4-6-4-6 18 6Z",
  globe: "M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
  bell: "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9m6 13a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3Z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.5l2.1-1.6-2-3.5-2.5 1a7.5 7.5 0 0 0-2.6-1.5L13.5 2h-3l-.4 2.4a7.5 7.5 0 0 0-2.6 1.5l-2.5-1-2 3.5 2.1 1.6a7.4 7.4 0 0 0 0 3l-2.1 1.6 2 3.5 2.5-1c.8.6 1.6 1.1 2.6 1.5L10.5 22h3l.4-2.4a7.5 7.5 0 0 0 2.6-1.5l2.5 1 2-3.5-2.1-1.6c.1-.5.1-1 .1-1.5Z",
  folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z",
  map: "M9 5l-6 2v14l6-2 6 2 6-2V5l-6 2-6-2Zm0 0v14m6 0V7",
  bars: "M3 12h18M3 6h18M3 18h18",
  trash: "M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z",
  calendar: "M3 9h18M3 5h18v16H3zM8 3v4m8-4v4",
  star: "m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2 2 9.3l6.9-1L12 2Z",
  trend: "M3 17l6-6 4 4 8-8M14 7h7v7",
  alert: "M12 8v5m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  arrowUp: "m12 5 7 7m-7-7-7 7m7-7v14",
  arrowDown: "m12 19 7-7m-7 7-7-7m7 7V5",
  sort: "m8 9 4-4 4 4M8 15l4 4 4-4",
  arrowRight: "M5 12h14m-7-7 7 7-7 7",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  flag: "M4 21V4m0 0h12l-2 4 2 4H4"
};
const Icon = ({
  d,
  size = 16,
  stroke = "currentColor",
  fill = "none",
  className = ""
}) => /*#__PURE__*/React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: fill,
  stroke: stroke,
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className,
  "aria-hidden": "true"
}, Array.isArray(d) ? d.map((p, i) => /*#__PURE__*/React.createElement("path", {
  key: i,
  d: p
})) : /*#__PURE__*/React.createElement("path", {
  d: d
}));
window.I = I;
window.Icon = Icon;
})(); } catch (e) { __ds_ns.__errors.push({ path: "icons.jsx", error: String((e && e.message) || e) }); }

// section-apply.jsx
try { (() => {
/* Section 5 — Apply the system: 4 product surfaces */

const ApplyHeader = ({
  name,
  what,
  why
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 16,
    marginBottom: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card",
  style: {
    padding: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "t-overline",
  style: {
    color: "var(--brand-500)"
  }
}, "Surface"), /*#__PURE__*/React.createElement("div", {
  className: "t-h3",
  style: {
    marginTop: 4
  }
}, name)), /*#__PURE__*/React.createElement("div", {
  className: "ds-card",
  style: {
    padding: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "t-overline"
}, "What changes"), /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: "6px 0 0",
    paddingLeft: 18,
    fontSize: 12.5,
    color: "var(--text-secondary)",
    lineHeight: 1.55
  }
}, what.map((w, i) => /*#__PURE__*/React.createElement("li", {
  key: i
}, w)))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card",
  style: {
    padding: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "t-overline"
}, "Why"), /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: "6px 0 0",
    paddingLeft: 18,
    fontSize: 12.5,
    color: "var(--text-secondary)",
    lineHeight: 1.55
  }
}, why.map((w, i) => /*#__PURE__*/React.createElement("li", {
  key: i
}, w)))));
const Frame = ({
  label,
  children,
  h = 520
}) => /*#__PURE__*/React.createElement("div", {
  className: "surface",
  style: {
    padding: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "surface-toolbar"
}, /*#__PURE__*/React.createElement("span", {
  className: "dot r"
}), /*#__PURE__*/React.createElement("span", {
  className: "dot y"
}), /*#__PURE__*/React.createElement("span", {
  className: "dot g"
}), /*#__PURE__*/React.createElement("span", {
  style: {
    marginLeft: 8
  }
}, label)), /*#__PURE__*/React.createElement("div", {
  style: {
    height: h,
    overflow: "hidden",
    background: "var(--bg-app)"
  }
}, children));
const ProductShell = ({
  active,
  title,
  children,
  breadcrumb,
  actions
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "200px 1fr",
    height: "100%"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-sidebar",
  style: {
    width: "100%",
    padding: "10px 0",
    height: "100%",
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "0 14px 10px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderBottom: "1px solid var(--border-subtle)"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "app-nav-brand-mark",
  style: {
    width: 22,
    height: 22,
    fontSize: 11
  }
}, "S"), /*#__PURE__*/React.createElement("span", {
  style: {
    fontWeight: 600,
    fontSize: 13
  }
}, "Skytek")), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "10px 0 4px 18px",
    fontSize: 10,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.06em"
  }
}, "Monitor"), /*#__PURE__*/React.createElement("a", {
  className: `ds-sidebar-item ${active === "dashboard" ? "is-active" : ""}`
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.bars
}), " Dashboard"), /*#__PURE__*/React.createElement("a", {
  className: `ds-sidebar-item ${active === "vessels" ? "is-active" : ""}`
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.ship
}), " Vessels"), /*#__PURE__*/React.createElement("a", {
  className: `ds-sidebar-item ${active === "aircraft" ? "is-active" : ""}`
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.plane
}), " Aircraft"), /*#__PURE__*/React.createElement("a", {
  className: `ds-sidebar-item ${active === "regions" ? "is-active" : ""}`
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.globe
}), " Regions"), /*#__PURE__*/React.createElement("a", {
  className: `ds-sidebar-item ${active === "portfolios" ? "is-active" : ""}`
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.folder
}), " Portfolios"), /*#__PURE__*/React.createElement("a", {
  className: `ds-sidebar-item ${active === "reports" ? "is-active" : ""}`
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.trend
}), " Reports")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateRows: "44px 1fr",
    minWidth: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 16px",
    background: "white",
    borderBottom: "1px solid var(--border-default)"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    flex: 1,
    maxWidth: 280
  }
}, /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  placeholder: "Search\u2026",
  style: {
    paddingLeft: 28,
    height: 28
  }
}), /*#__PURE__*/React.createElement("span", {
  style: {
    position: "absolute",
    left: 8,
    top: 7,
    color: "var(--text-muted)"
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.search,
  size: 14
}))), /*#__PURE__*/React.createElement("div", {
  className: "spacer-grow"
}), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost ds-btn--icon ds-btn--sm"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.bell
})), /*#__PURE__*/React.createElement("span", {
  className: "ds-avatar",
  style: {
    width: 24,
    height: 24,
    fontSize: 10
  }
}, "JL")), /*#__PURE__*/React.createElement("div", {
  style: {
    overflow: "auto"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "12px 20px 0",
    display: "flex",
    gap: 6,
    fontSize: 11.5,
    color: "var(--text-muted)"
  }
}, breadcrumb), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "4px 20px 12px",
    display: "flex",
    alignItems: "flex-end",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("h1", {
  className: "t-h1",
  style: {
    flex: 1,
    margin: 0
  }
}, title), actions), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "0 20px 20px"
  }
}, children))));
const ApplyDashboard = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ApplyHeader, {
  name: "Marine dashboard",
  what: ["Stat cards unified to one Card primitive (was 3 layouts)", "Map canvas uses --bg-canvas; controls use Button primitives", "Severity chips replace ad-hoc colored text"],
  why: ["One read of the page tells you risk, count, trend", "Chart/legend density preserved without visual noise", "Works at 1280–1920px without rework"]
}), /*#__PURE__*/React.createElement(Frame, {
  label: "dashboard \xB7 /dashboard",
  h: 560
}, /*#__PURE__*/React.createElement(ProductShell, {
  active: "dashboard",
  title: "Marine Dashboard",
  breadcrumb: /*#__PURE__*/React.createElement("span", null, "Dashboard"),
  actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.download
  }), " Export"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.calendar
  }), " Last 7 days"))
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12
  }
}, [["Vessels tracked", "1,284", "+12", "info"], ["At risk", "23", "+4", "danger"], ["Sanctioned", "2", "0", "neutral"], ["Compliance", "94%", "+1.2", "success"]].map(([t, v, d, k], i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  className: "ds-card",
  style: {
    padding: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "t-caption"
}, t), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    marginTop: 4
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "t-h1 t-numeric",
  style: {
    margin: 0
  }
}, v), /*#__PURE__*/React.createElement("span", {
  className: `ds-badge ds-badge--${k} ds-badge--dot`
}, d))))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: 12,
    marginTop: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card",
  style: {
    padding: 0,
    height: 280,
    position: "relative",
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "10px 14px",
    borderBottom: "1px solid var(--border-subtle)",
    display: "flex",
    alignItems: "center"
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title",
  style: {
    flex: 1
  }
}, "Live fleet \xB7 North Atlantic"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost ds-btn--sm"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.filter
}), " Filter")), /*#__PURE__*/React.createElement("div", {
  style: {
    height: "100%",
    background: "linear-gradient(120deg,#dbe7f0 0%,#c5d8e8 50%,#bcd0e0 100%)",
    position: "relative"
  }
}, [[40, 55], [55, 60], [70, 40], [35, 75], [50, 30], [80, 65], [25, 50]].map(([x, y], i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    position: "absolute",
    left: `${x}%`,
    top: `${y}%`,
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: i === 4 ? "var(--danger-500)" : i === 2 ? "var(--warning-500)" : "var(--brand-600)",
    boxShadow: "0 0 0 4px rgba(255,255,255,0.7)"
  }
})))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card",
  style: {
    padding: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "10px 14px",
    borderBottom: "1px solid var(--border-subtle)"
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Recent alerts")), /*#__PURE__*/React.createElement("div", null, [["danger", "Sanctioned vessel", "M/V Helios · 2m"], ["warning", "Severe weather", "Voyage 4711 · 8m"], ["info", "Region updated", "NA-04 · 14m"], ["success", "Policy added", "#44721 · 1h"]].map(([k, t, m], i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    display: "flex",
    gap: 10,
    padding: "10px 14px",
    borderTop: i ? "1px solid var(--border-subtle)" : 0,
    alignItems: "flex-start"
  }
}, /*#__PURE__*/React.createElement("span", {
  className: `ds-badge ds-badge--${k} ds-badge--dot`,
  style: {
    marginTop: 2
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12.5,
    lineHeight: 1.4
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontWeight: 600
  }
}, t), /*#__PURE__*/React.createElement("div", {
  className: "t-caption"
}, m))))))))));
const ApplyTable = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ApplyHeader, {
  name: "Vessels list",
  what: ["Single Table primitive replaces 4 implementations", "Sticky header, removed alternating-row backgrounds", "Filters consolidated into one popover, badge shows active count"],
  why: ["Engineers stop reinventing tables per module", "Hover highlight is enough to track row on dense screens", "Filter state is discoverable + resettable in one place"]
}), /*#__PURE__*/React.createElement(Frame, {
  label: "vessels \xB7 /gsin",
  h: 560
}, /*#__PURE__*/React.createElement(ProductShell, {
  active: "vessels",
  title: "Vessels",
  breadcrumb: /*#__PURE__*/React.createElement("span", null, "GSIN ", /*#__PURE__*/React.createElement(Icon, {
    d: I.chevronRight,
    size: 11
  }), " Vessels"),
  actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.download
  }), " Export"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--primary ds-btn--sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.plus
  }), " Add vessel"))
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card",
  style: {
    padding: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 10,
    borderBottom: "1px solid var(--border-subtle)",
    display: "flex",
    gap: 8,
    alignItems: "center"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    width: 280
  }
}, /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  placeholder: "Search vessels\u2026",
  style: {
    paddingLeft: 28,
    height: 28
  }
}), /*#__PURE__*/React.createElement("span", {
  style: {
    position: "absolute",
    left: 8,
    top: 7,
    color: "var(--text-muted)"
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.search,
  size: 14
}))), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.filter
}), " Filters ", /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--info",
  style: {
    marginLeft: 4
  }
}, "3")), /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--neutral"
}, "Risk: D, E"), /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--neutral"
}, "Flag: PA"), /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--neutral"
}, "Status: At risk"), /*#__PURE__*/React.createElement("div", {
  className: "spacer-grow"
}), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "142 vessels")), /*#__PURE__*/React.createElement("table", {
  className: "ds-table is-compact"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
  style: {
    width: 28
  }
}, /*#__PURE__*/React.createElement("input", {
  type: "checkbox",
  className: "ds-check"
})), /*#__PURE__*/React.createElement("th", null, "Vessel"), /*#__PURE__*/React.createElement("th", {
  style: {
    width: 100
  }
}, "IMO"), /*#__PURE__*/React.createElement("th", {
  style: {
    width: 60
  }
}, "Flag"), /*#__PURE__*/React.createElement("th", {
  style: {
    width: 70
  }
}, "Risk"), /*#__PURE__*/React.createElement("th", {
  style: {
    width: 130
  }
}, "Status"), /*#__PURE__*/React.createElement("th", {
  style: {
    width: 130
  }
}, "Last seen"), /*#__PURE__*/React.createElement("th", {
  className: "num",
  style: {
    width: 130
  }
}, "Sum insured"), /*#__PURE__*/React.createElement("th", {
  style: {
    width: 40
  }
}))), /*#__PURE__*/React.createElement("tbody", null, [["M/V Stratos", "9472183", "MT", "A", "Compliant", "2m ago", 28_400_000], ["Aegean Pioneer", "9301847", "GR", "B", "In review", "11m ago", 14_900_000], ["Bristol Endeavour", "9618742", "GB", "C", "At risk", "32m ago", 19_500_000], ["Norwegian Beacon", "9510938", "NO", "A", "Compliant", "4m ago", 31_200_000], ["Helios Carrier", "9432751", "PA", "E", "Sanctioned", "2h ago", 12_700_000], ["Lisbon Trader", "9388321", "PT", "B", "Compliant", "6m ago", 17_200_000], ["Suez Voyager", "9470922", "EG", "D", "At risk", "18m ago", 22_100_000], ["Reykjavík Spirit", "9551238", "IS", "A", "Compliant", "8m ago", 26_400_000]].map((r, i) => /*#__PURE__*/React.createElement("tr", {
  key: i
}, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("input", {
  type: "checkbox",
  className: "ds-check"
})), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, r[0])), /*#__PURE__*/React.createElement("td", {
  className: "t-mono",
  style: {
    fontSize: 12
  }
}, r[1]), /*#__PURE__*/React.createElement("td", null, r[2]), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: `ds-rating ds-rating--${r[3].toLowerCase()}`
}, r[3])), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: `ds-badge ds-badge--${r[4] === "Compliant" ? "success" : r[4] === "In review" ? "info" : r[4] === "At risk" ? "warning" : "danger"} ds-badge--dot`
}, r[4])), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, r[5]), /*#__PURE__*/React.createElement("td", {
  className: "num t-numeric"
}, "$", r[6].toLocaleString()), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost ds-btn--icon ds-btn--xs"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.more
}))))))), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 10,
    borderTop: "1px solid var(--border-subtle)",
    display: "flex",
    alignItems: "center",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "1\u20138 of 142"), /*#__PURE__*/React.createElement("div", {
  className: "spacer-grow"
}), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost ds-btn--sm"
}, "Previous"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm"
}, "Next"))))));
const ApplyDetail = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ApplyHeader, {
  name: "Vessel detail",
  what: ["Header consolidates badge + meta + actions in one row", "Tabs replace tab-like segmented controls in legacy modules", "Definition lists for properties — uniform key/value layout"],
  why: ["Header height is consistent across all detail pages", "Property scanning is faster with aligned key columns", "Removes 3 different ways the team currently shows vessel meta"]
}), /*#__PURE__*/React.createElement(Frame, {
  label: "vessel \xB7 /vessel/:id",
  h: 580
}, /*#__PURE__*/React.createElement(ProductShell, {
  active: "vessels",
  title: "M/V Stratos",
  breadcrumb: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "Vessels"), /*#__PURE__*/React.createElement(Icon, {
    d: I.chevronRight,
    size: 11
  }), /*#__PURE__*/React.createElement("span", null, "M/V Stratos")),
  actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "ds-badge ds-badge--success ds-badge--dot",
    style: {
      alignSelf: "center"
    }
  }, "Compliant"), /*#__PURE__*/React.createElement("span", {
    className: "ds-rating ds-rating--a",
    style: {
      alignSelf: "center"
    }
  }, "A"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.download
  }), " PDF"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--primary ds-btn--sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.flag
  }), " Flag"))
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-tabs",
  style: {
    marginBottom: 12
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-tab",
  "aria-selected": "true"
}, "Overview"), /*#__PURE__*/React.createElement("button", {
  className: "ds-tab"
}, "Voyages"), /*#__PURE__*/React.createElement("button", {
  className: "ds-tab"
}, "Casualties"), /*#__PURE__*/React.createElement("button", {
  className: "ds-tab"
}, "Compliance")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Particulars")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    display: "grid",
    gridTemplateColumns: "160px 1fr 160px 1fr",
    gap: "10px 16px",
    fontSize: 13
  }
}, [["IMO", "9472183"], ["MMSI", "248901000"], ["Flag", "Malta"], ["Type", "Bulk carrier"], ["Built", "2018"], ["DWT", "82,400 t"], ["Operator", "Aegean Maritime"], ["Class", "DNV"]].map(([k, v], i) => /*#__PURE__*/React.createElement(React.Fragment, {
  key: i
}, /*#__PURE__*/React.createElement("div", {
  className: "t-caption"
}, k), /*#__PURE__*/React.createElement("div", {
  className: i === 0 || i === 1 ? "t-mono" : "",
  style: {
    fontWeight: 500
  }
}, v))))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Risk profile")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    display: "grid",
    gap: 10
  }
}, [["PSC compliance", "94%", 94], ["Sanctions risk", "Low", 10], ["Voyage risk", "Medium", 55]].map(([k, v, p], i) => /*#__PURE__*/React.createElement("div", {
  key: i
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    marginBottom: 4
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, k), /*#__PURE__*/React.createElement("strong", {
  style: {
    fontSize: 12.5
  }
}, v)), /*#__PURE__*/React.createElement("div", {
  className: "ds-progress"
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: `${p}%`,
    background: p > 70 ? "var(--success-500)" : p > 30 ? "var(--warning-500)" : "var(--info-500)"
  }
}))))))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card",
  style: {
    marginTop: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Recent voyages"), /*#__PURE__*/React.createElement("a", {
  className: "ds-btn ds-btn--link"
}, "All voyages \u2192")), /*#__PURE__*/React.createElement("table", {
  className: "ds-table is-compact"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "From"), /*#__PURE__*/React.createElement("th", null, "To"), /*#__PURE__*/React.createElement("th", null, "Departed"), /*#__PURE__*/React.createElement("th", null, "ETA"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, [["Piraeus", "Rotterdam", "Apr 21", "Apr 29", "On schedule"], ["Tangier", "Piraeus", "Apr 8", "Apr 15", "Completed"], ["Algeciras", "Tangier", "Apr 1", "Apr 4", "Completed"]].map((r, i) => /*#__PURE__*/React.createElement("tr", {
  key: i
}, /*#__PURE__*/React.createElement("td", null, r[0]), /*#__PURE__*/React.createElement("td", null, r[1]), /*#__PURE__*/React.createElement("td", null, r[2]), /*#__PURE__*/React.createElement("td", null, r[3]), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: `ds-badge ds-badge--${r[4] === "On schedule" ? "info" : "success"} ds-badge--dot`
}, r[4]))))))))));
const ApplyForm = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ApplyHeader, {
  name: "Add policy \xB7 form flow",
  what: ["Standard form layout with grouped FormItems", "Inline validation messages, no toasts for field errors", "Sticky footer with one primary CTA"],
  why: ["Engineers drop in <Form>, <FormField>, <FormItem> — no styling", "Errors are visible without leaving the field", "Save is unambiguous; Cancel is the secondary path"]
}), /*#__PURE__*/React.createElement(Frame, {
  label: "add policy \xB7 /portfolio/:id/policy/add",
  h: 580
}, /*#__PURE__*/React.createElement(ProductShell, {
  active: "portfolios",
  title: "Add policy",
  breadcrumb: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "Portfolios"), /*#__PURE__*/React.createElement(Icon, {
    d: I.chevronRight,
    size: 11
  }), /*#__PURE__*/React.createElement("span", null, "Atlantic Hull 2026"), /*#__PURE__*/React.createElement(Icon, {
    d: I.chevronRight,
    size: 11
  }), /*#__PURE__*/React.createElement("span", null, "Policies"), /*#__PURE__*/React.createElement(Icon, {
    d: I.chevronRight,
    size: 11
  }), /*#__PURE__*/React.createElement("span", null, "Add")),
  actions: /*#__PURE__*/React.createElement(React.Fragment, null)
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: 16
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 8
  }
}, "Sections"), /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 2
  }
}, [["Policy details", true], ["Coverage", false], ["Vessels", false], ["Documents", false]].map(([s, a], i) => /*#__PURE__*/React.createElement("a", {
  key: i,
  className: `ds-sidebar-item ${a ? "is-active" : ""}`,
  style: {
    margin: 0
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: a ? "var(--brand-600)" : "var(--slate-200)",
    color: a ? "white" : "var(--text-muted)",
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 600
  }
}, i + 1), " ", s)))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Policy details")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Policy number ", /*#__PURE__*/React.createElement("span", {
  className: "ds-field-required"
}, "*")), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "44721"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Underwriter ", /*#__PURE__*/React.createElement("span", {
  className: "ds-field-required"
}, "*")), /*#__PURE__*/React.createElement("select", {
  className: "ds-input ds-select"
}, /*#__PURE__*/React.createElement("option", null, "JL Marine Re"))), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Effective date ", /*#__PURE__*/React.createElement("span", {
  className: "ds-field-required"
}, "*")), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "2026-05-01"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Expiry date ", /*#__PURE__*/React.createElement("span", {
  className: "ds-field-required"
}, "*")), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "2027-04-30"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field",
  style: {
    gridColumn: "1 / -1"
  }
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Coverage type"), /*#__PURE__*/React.createElement("div", {
  className: "row",
  style: {
    gap: 16
  }
}, /*#__PURE__*/React.createElement("label", {
  className: "row",
  style: {
    gap: 6,
    fontSize: 13
  }
}, /*#__PURE__*/React.createElement("input", {
  type: "radio",
  name: "ct",
  className: "ds-radio",
  defaultChecked: true
}), " Hull & Machinery"), /*#__PURE__*/React.createElement("label", {
  className: "row",
  style: {
    gap: 6,
    fontSize: 13
  }
}, /*#__PURE__*/React.createElement("input", {
  type: "radio",
  name: "ct",
  className: "ds-radio"
}), " P&I"), /*#__PURE__*/React.createElement("label", {
  className: "row",
  style: {
    gap: 6,
    fontSize: 13
  }
}, /*#__PURE__*/React.createElement("input", {
  type: "radio",
  name: "ct",
  className: "ds-radio"
}), " War risk"))), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Premium (USD)"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "\u2212250",
  "aria-invalid": "true"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-field-error"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.alert,
  size: 12
}), " Must be a positive number.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Deductible (USD)"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "50,000"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field",
  style: {
    gridColumn: "1 / -1"
  }
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Notes"), /*#__PURE__*/React.createElement("textarea", {
  className: "ds-input",
  style: {
    height: 64,
    padding: 8
  },
  placeholder: "Optional context for the underwriter\u2026"
}))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-foot"
}, /*#__PURE__*/React.createElement("span", {
  className: "t-caption",
  style: {
    marginRight: "auto"
  }
}, "Step 1 of 4"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm"
}, "Cancel"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary ds-btn--sm"
}, "Continue ", /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronRight
}))))))));
const ApplySection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ApplyDashboard, null), /*#__PURE__*/React.createElement("hr", {
  className: "section-hr"
}), /*#__PURE__*/React.createElement(ApplyTable, null), /*#__PURE__*/React.createElement("hr", {
  className: "section-hr"
}), /*#__PURE__*/React.createElement(ApplyDetail, null), /*#__PURE__*/React.createElement("hr", {
  className: "section-hr"
}), /*#__PURE__*/React.createElement(ApplyForm, null));
window.ApplySection = ApplySection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-apply.jsx", error: String((e && e.message) || e) }); }

// section-asset-identity.jsx
try { (() => {
/* Section — Asset identity & status (Domain primitives)
   How every asset (vessel, offshore installation, aircraft, property) is
   identified and status-coded consistently across lists, tables, detail
   headers, popups, alerts and reports. The Maps chapter governs the asset
   *on a map*; this chapter governs the asset *everywhere else*. */

/* ── Shared data, mirrors the product ─────────────────────────────── */

const FLAG_SRC = (cc, w = 40) => `https://flagcdn.com/w${w}/${cc}.png`;
const Flag = ({
  cc,
  name,
  size = "sm"
}) => {
  const w = size === "md" ? 80 : 40;
  return /*#__PURE__*/React.createElement("img", {
    className: `ds-flag ds-flag--${size}`,
    src: FLAG_SRC(cc, w === 80 ? 40 : 20),
    srcSet: `${FLAG_SRC(cc, 80)} 2x`,
    alt: name || cc.toUpperCase(),
    loading: "lazy"
  });
};

/* ── Flag chip ────────────────────────────────────────────────────── */

const FlagSection = () => /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Flag chip"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Nationality is the single most repeated identity signal in the product \u2014 a vessel's flag state, an asset's country of jurisdiction, a region row, a sanction subject's domicile, a port's country. One chip renders all of them: a ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "flagcdn.com"), " raster at a fixed aspect, 2\xA0px corners, a 1\xA0px hairline ring so light flags stay legible on white. It is ", /*#__PURE__*/React.createElement("strong", null, "never the sole identifier"), " \u2014 it always sits beside the country name or asset name."), /*#__PURE__*/React.createElement("div", {
  className: "grid-2",
  style: {
    alignItems: "flex-start"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Two sizes")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    gap: 32,
    alignItems: "center"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8
  }
}, /*#__PURE__*/React.createElement(Flag, {
  cc: "es",
  name: "Spain",
  size: "sm"
}), /*#__PURE__*/React.createElement("span", {
  className: "t-mono",
  style: {
    fontSize: 11,
    color: "var(--text-muted)"
  }
}, "sm \xB7 20\xD714"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption",
  style: {
    fontSize: 11
  }
}, "lists, inline rows")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8
  }
}, /*#__PURE__*/React.createElement(Flag, {
  cc: "es",
  name: "Spain",
  size: "md"
}), /*#__PURE__*/React.createElement("span", {
  className: "t-mono",
  style: {
    fontSize: 11,
    color: "var(--text-muted)"
  }
}, "md \xB7 28\xD718"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption",
  style: {
    fontSize: 11
  }
}, "alert rows, headers"))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "Aspect is fixed at ~1.4:1; never stretch a flag to fill a square.")), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Always paired with a name")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "flag-pair"
}, /*#__PURE__*/React.createElement(Flag, {
  cc: "pa",
  name: "Panama"
}), " Panama"), /*#__PURE__*/React.createElement("span", {
  className: "flag-pair"
}, /*#__PURE__*/React.createElement(Flag, {
  cc: "lr",
  name: "Liberia"
}), " Liberia"), /*#__PURE__*/React.createElement("span", {
  className: "flag-pair"
}, /*#__PURE__*/React.createElement(Flag, {
  cc: "mh",
  name: "Marshall Islands"
}), " Marshall Islands")), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "The ", /*#__PURE__*/React.createElement("code", null, "alt"), " carries the country name \u2014 a bare flag fails screen readers."))), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 12,
    marginBottom: 6
  }
}, "One helper, two sizes, retina by default. Modules never hand-build the ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "<img>"), ":"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// app/ui/Flag.tsx
export function Flag({ cc, name, size = 'sm' }: { cc: string; name: string; size?: 'sm' | 'md' }) {
  return (
    <img
      className={\`ds-flag ds-flag--\${size}\`}
      src={\`https://flagcdn.com/w\${size === 'md' ? 40 : 20}/\${cc}.png\`}
      srcSet={\`https://flagcdn.com/w80/\${cc}.png 2x\`}
      alt={name}          // never empty — nationality is meaning, not decoration
      loading="lazy"
    />
  );
}`), /*#__PURE__*/React.createElement("div", {
  className: "dodont",
  style: {
    marginTop: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "do"
}, /*#__PURE__*/React.createElement("div", {
  className: "hd"
}, "DO"), /*#__PURE__*/React.createElement("div", {
  className: "bd"
}, /*#__PURE__*/React.createElement("span", {
  className: "flag-pair"
}, /*#__PURE__*/React.createElement(Flag, {
  cc: "gr",
  name: "Greece"
}), " Greece")), /*#__PURE__*/React.createElement("div", {
  className: "note"
}, "Flag + country name. Scannable and accessible.")), /*#__PURE__*/React.createElement("div", {
  className: "dont"
}, /*#__PURE__*/React.createElement("div", {
  className: "hd"
}, "DON'T"), /*#__PURE__*/React.createElement("div", {
  className: "bd"
}, /*#__PURE__*/React.createElement(Flag, {
  cc: "gr",
  name: "Greece"
})), /*#__PURE__*/React.createElement("div", {
  className: "note"
}, "Flag alone. Ambiguous to most operators, invisible to AT."))));

/* ── Asset identity block ─────────────────────────────────────────── */

const VesselGlyph = ({
  color = "#2563eb",
  heading = 45,
  size = 28
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    display: "inline-flex",
    width: size,
    height: size,
    alignItems: "center",
    justifyContent: "center"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    display: "inline-block",
    transform: `rotate(${heading + 45}deg)`,
    transformOrigin: "center"
  }
}, /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  width: size,
  height: size,
  style: {
    color,
    display: "block"
  },
  fill: "currentColor",
  stroke: "#fff",
  strokeWidth: "1.2",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 2 L19 20 L12 16 L5 20 Z"
}))));
const OffshoreGlyph = ({
  color = "#ea580c",
  size = 16
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    display: "inline-flex",
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: color,
    border: "2px solid #fff",
    boxShadow: "0 1px 3px rgba(0,0,0,.3)"
  }
}));
const IdentityBlock = ({
  glyph,
  name,
  type,
  flagCc,
  flagName,
  ids,
  status
}) => /*#__PURE__*/React.createElement("div", {
  className: "asset-identity"
}, /*#__PURE__*/React.createElement("div", {
  className: "asset-identity-glyph"
}, glyph), /*#__PURE__*/React.createElement("div", {
  className: "asset-identity-main"
}, /*#__PURE__*/React.createElement("div", {
  className: "asset-identity-name"
}, name, status), /*#__PURE__*/React.createElement("div", {
  className: "asset-identity-sub"
}, /*#__PURE__*/React.createElement(Flag, {
  cc: flagCc,
  name: flagName
}), " ", flagName, /*#__PURE__*/React.createElement("span", {
  style: {
    color: "var(--border-strong)"
  }
}, "\xB7"), /*#__PURE__*/React.createElement("span", null, type)), /*#__PURE__*/React.createElement("div", {
  className: "asset-identity-ids"
}, ids.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
  className: "asset-id",
  key: k
}, /*#__PURE__*/React.createElement("span", {
  className: "k"
}, k), /*#__PURE__*/React.createElement("span", {
  className: "v"
}, v))))));
const IdentitySection = () => /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Asset identity block"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Every asset answers the same four questions, in the same order, wherever it appears: ", /*#__PURE__*/React.createElement("strong", null, "what is it"), " (type glyph),", /*#__PURE__*/React.createElement("strong", null, " what is it called"), " (name), ", /*#__PURE__*/React.createElement("strong", null, "whose is it / where is it flagged"), " (flag + country), and", /*#__PURE__*/React.createElement("strong", null, " how do we key it"), " (the canonical ID). Compliance status rides at the end of the name line as a badge \u2014 never as a recolor. This block is the heading of every detail page, the header of every map popup, and the lead cell of every asset list."), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  }
}, /*#__PURE__*/React.createElement(IdentityBlock, {
  glyph: /*#__PURE__*/React.createElement(VesselGlyph, {
    color: "#ef4444",
    heading: 120
  }),
  name: "FRESH BREEZE",
  type: "Tanker",
  flagCc: "es",
  flagName: "Spain",
  status: /*#__PURE__*/React.createElement("span", {
    className: "ds-badge ds-badge--danger ds-badge--dot"
  }, "Sanctioned"),
  ids: [["IMO", "9374045"], ["MMSI", "224128610"], ["Call sign", "EAFB"]]
}), /*#__PURE__*/React.createElement(IdentityBlock, {
  glyph: /*#__PURE__*/React.createElement(OffshoreGlyph, {
    color: "#ea580c"
  }),
  name: "Teora Lopes Elevator",
  type: "Mobile Production (MOPU)",
  flagCc: "no",
  flagName: "Norway",
  status: /*#__PURE__*/React.createElement("span", {
    className: "ds-badge ds-badge--success ds-badge--dot"
  }, "Operational"),
  ids: [["IMO", "9374045"], ["Unit ID / CVN", "HSE-2016-NOR"], ["Field", "Santos Basin"]]
})), /*#__PURE__*/React.createElement("h4", {
  style: {
    fontSize: 13,
    fontWeight: 700,
    margin: "20px 0 8px"
  }
}, "Identifier conventions"), /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Identifier"), /*#__PURE__*/React.createElement("th", null, "Applies to"), /*#__PURE__*/React.createElement("th", null, "Format"), /*#__PURE__*/React.createElement("th", null, "Rendering"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Name")), /*#__PURE__*/React.createElement("td", null, "All assets"), /*#__PURE__*/React.createElement("td", null, "Free text"), /*#__PURE__*/React.createElement("td", null, "Display font, ", /*#__PURE__*/React.createElement("strong", null, "UPPERCASE"), " for vessels (matches AIS); title-case for offshore/property.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "IMO number")), /*#__PURE__*/React.createElement("td", null, "Vessels, offshore (where assigned)"), /*#__PURE__*/React.createElement("td", null, "7 digits"), /*#__PURE__*/React.createElement("td", null, "Mono, tabular, never grouped. The durable key \u2014 survives name & flag changes.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "MMSI")), /*#__PURE__*/React.createElement("td", null, "Vessels"), /*#__PURE__*/React.createElement("td", null, "9 digits"), /*#__PURE__*/React.createElement("td", null, "Mono, tabular. Transient \u2014 can change with flag; never the primary key.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Call sign")), /*#__PURE__*/React.createElement("td", null, "Vessels, aircraft"), /*#__PURE__*/React.createElement("td", null, "Alphanumeric"), /*#__PURE__*/React.createElement("td", null, "Mono, uppercase.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Unit ID / CVN")), /*#__PURE__*/React.createElement("td", null, "Offshore installations"), /*#__PURE__*/React.createElement("td", null, "Registry-specific"), /*#__PURE__*/React.createElement("td", null, "Mono. Shown beside IMO when both exist.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Flag")), /*#__PURE__*/React.createElement("td", null, "All assets"), /*#__PURE__*/React.createElement("td", null, "ISO 3166-1 \u03B1-2"), /*#__PURE__*/React.createElement("td", null, "Flag chip + country name (see above).")))), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 12
  }
}, /*#__PURE__*/React.createElement("strong", null, "IMO is the key, not the name."), " Vessel names and flags change \u2014 sometimes to evade screening (see the Historical Details and Name/Flag Change patterns). Lists, dedupe and cross-references key on ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "imo"), "; the name is a label on top of it."));

/* ── Status taxonomy ──────────────────────────────────────────────── */

const StatusSection = () => /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Status taxonomy"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "An asset carries up to three ", /*#__PURE__*/React.createElement("em", null, "independent"), " status dimensions, and they must never be collapsed into one swatch.", /*#__PURE__*/React.createElement("strong", null, " Operational state"), " (is it running), ", /*#__PURE__*/React.createElement("strong", null, "compliance state"), " (has it been screened), and", /*#__PURE__*/React.createElement("strong", null, " risk severity"), " (how bad is the current finding) each map to their own semantic tokens. All three use the badge primitive \u2014 tint + ink + optional leading dot \u2014 so the product reads one status language."), /*#__PURE__*/React.createElement("div", {
  className: "grid-2",
  style: {
    alignItems: "flex-start"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Operational state"), /*#__PURE__*/React.createElement("span", {
  className: "meta"
}, "offshore \xB7 property")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "status-row"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--success ds-badge--dot"
}, "Operational"), /*#__PURE__*/React.createElement("span", null, "running / on-station \xB7 ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--success"))), /*#__PURE__*/React.createElement("div", {
  className: "status-row"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--warning ds-badge--dot"
}, "Under Maintenance"), /*#__PURE__*/React.createElement("span", null, "degraded / in service \xB7 ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--warning"))), /*#__PURE__*/React.createElement("div", {
  className: "status-row"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--neutral ds-badge--dot"
}, "Decommissioned"), /*#__PURE__*/React.createElement("span", null, "cold-stacked / retired \xB7 ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--slate")))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "On a map this is the marker's status overlay, not its fill.")), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Compliance state"), /*#__PURE__*/React.createElement("span", {
  className: "meta"
}, "vessels \xB7 subjects")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "status-row"
}, /*#__PURE__*/React.createElement("span", {
  className: "s-cell s-cell--ok"
}, /*#__PURE__*/React.createElement("span", {
  className: "s-dot"
}), " Clear"), /*#__PURE__*/React.createElement("span", null, "screened, no hit \xB7 ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--success"))), /*#__PURE__*/React.createElement("div", {
  className: "status-row"
}, /*#__PURE__*/React.createElement("span", {
  className: "s-cell s-cell--sanctioned"
}, /*#__PURE__*/React.createElement("span", {
  className: "s-dot"
}), " Sanctioned"), /*#__PURE__*/React.createElement("span", null, "positive match \xB7 ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--danger"))), /*#__PURE__*/React.createElement("div", {
  className: "status-row"
}, /*#__PURE__*/React.createElement("span", {
  className: "s-cell s-cell--unverif"
}, "?"), /*#__PURE__*/React.createElement("span", {
  style: {
    marginLeft: 4
  }
}, "Unverifiable \xB7 ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--unverif")))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "Unverifiable \u2260 Clear. A subject that couldn't be screened must look different from one that passed."))), /*#__PURE__*/React.createElement("div", {
  className: "callout warn",
  style: {
    marginTop: 14
  }
}, /*#__PURE__*/React.createElement("strong", null, "One dimension, one channel."), " A sanctioned vessel that is also operational shows ", /*#__PURE__*/React.createElement("em", null, "both"), " a danger compliance badge and a success operational badge \u2014 it is never rendered in a single blended color. Operators must be able to read each question separately."));

/* ── Severity ─────────────────────────────────────────────────────── */

const SeveritySection = () => /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Severity scale"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Findings \u2014 casualties, deficiencies, weather impact \u2014 carry a three-step severity. It is an ", /*#__PURE__*/React.createElement("em", null, "ordered"), " scale (unlike the categorical event types below), so it maps to the semantic ramp: danger \u2192 warning \u2192 neutral. This replaces the ad-hoc colored text that drifted across casualty, inspection and weather surfaces."), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap"
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "severity-chip severity-chip--severe"
}, /*#__PURE__*/React.createElement("span", {
  className: "sd"
}), " Severe"), /*#__PURE__*/React.createElement("span", {
  className: "severity-chip severity-chip--moderate"
}, /*#__PURE__*/React.createElement("span", {
  className: "sd"
}), " Moderate"), /*#__PURE__*/React.createElement("span", {
  className: "severity-chip severity-chip--minor"
}, /*#__PURE__*/React.createElement("span", {
  className: "sd"
}), " Minor")), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "Pair with a count where it aids triage (e.g. a tab badge), but the chip alone must read severity at a glance.")));

/* ── Event / alert-type color coding ──────────────────────────────── */

const ALERT_TYPES = [["Sanctioned", "event-chip--sanctioned", "Positive sanctions match on the asset or a related subject.", "danger token"], ["AIS Silence", "event-chip--ais-silence", "AIS transponder signal lost for a sustained period.", "blue"], ["AIS Spoofing", "event-chip--ais-spoofing", "Reported position contradicts satellite tracking.", "purple"], ["Route Deviation", "event-chip--route-dev", "Vessel departs its filed route.", "warning token"], ["Drifting", "event-chip--drifting", "Stationary or near-zero power for an extended window.", "cyan"], ["Loitering", "event-chip--loitering", "Extended dwell in a sensitive area.", "orange"], ["Name/Flag Change", "event-chip--name-flag", "Identity changed — a classic evasion signal.", "pink"], ["Unusual Movement", "event-chip--unusual", "Erratic course or speed pattern.", "warning token"], ["STS Transfer", "event-chip--sts", "Ship-to-ship transfer detected.", "orange"]];
const EventTypeSection = () => /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Event & alert types"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Suspicious-activity and alert classes are a ", /*#__PURE__*/React.createElement("em", null, "categorical"), " vocabulary \u2014 there is no \"worse\" hue, only a different kind of event. Each type owns one color so an operator learns the palette once and reads it across the dashboard alert feed, the vessel Suspicious Activity tab, and the map. These are tokens (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--event-*"), "), reconciling the per-page colors that had drifted apart. Severity (above) answers \"how bad\"; the event type answers \"what kind\"."), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    marginBottom: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  }
}, ALERT_TYPES.map(([label, cls]) => /*#__PURE__*/React.createElement("span", {
  key: label,
  className: `event-chip ${cls}`
}, label)))), /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Token hue"), /*#__PURE__*/React.createElement("th", null, "Means"))), /*#__PURE__*/React.createElement("tbody", null, ALERT_TYPES.map(([label, cls, desc, hue]) => /*#__PURE__*/React.createElement("tr", {
  key: label
}, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: `event-chip ${cls}`
}, label)), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, hue), /*#__PURE__*/React.createElement("td", {
  style: {
    fontSize: 12.5,
    color: "var(--text-secondary)"
  }
}, desc))))), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 12
  }
}, /*#__PURE__*/React.createElement("strong", null, "Type colour vs. severity."), " The same event can be high or low severity (an AIS Silence in a storm vs. in a sanctions corridor). Keep the type chip and the severity chip side by side; do not tint the type chip by severity or you lose both signals."));

/* ── Sanction compliance matrix ───────────────────────────────────── */

const SANCTION_LISTS = ["OFAC", "UN", "EU", "Australia", "OFSI"];
const SCell = ({
  status
}) => {
  if (status === "ok") return /*#__PURE__*/React.createElement("span", {
    className: "s-cell s-cell--ok"
  }, /*#__PURE__*/React.createElement("span", {
    className: "s-dot"
  }), " Ok");
  if (status === "sanctioned") return /*#__PURE__*/React.createElement("span", {
    className: "s-cell s-cell--sanctioned"
  }, /*#__PURE__*/React.createElement("span", {
    className: "s-dot"
  }), " Sanctioned");
  return /*#__PURE__*/React.createElement("span", {
    className: "s-cell s-cell--unverif",
    "aria-label": "Unverifiable"
  }, "?");
};
const SANCTION_ROWS = [{
  rel: "Vessel",
  name: "FRESH BREEZE",
  cc: "es",
  res: ["sanctioned", "ok", "ok", "ok", "ok"]
}, {
  rel: "Vessel's Flag",
  name: "Spain",
  cc: "es",
  res: ["ok", "ok", "ok", "ok", "ok"]
}, {
  rel: "Registered Owner",
  name: "Ametrine Navigation Inc.",
  cc: null,
  res: ["ok", "ok", "ok", "ok", "ok"]
}, {
  rel: "Operator",
  name: "Unknown Entity",
  cc: null,
  unverif: true,
  res: ["unverif", "unverif", "unverif", "unverif", "unverif"]
}, {
  rel: "Group Owner",
  name: "Unknown Entity",
  cc: null,
  unverif: true,
  res: ["unverif", "unverif", "unverif", "unverif", "unverif"]
}];
const SanctionSection = () => /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Sanction compliance matrix"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "The vessel's Sanction Compliance tab screens every ", /*#__PURE__*/React.createElement("strong", null, "related subject"), " \u2014 the vessel, its flag, owner, operator and managers \u2014 against five lists (OFAC, UN, EU, Australia, OFSI). The matrix is the canonical layout: relationship rows down, lists across, one cell state per check."), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    padding: 0
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "sanction-matrix"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Relationship"), /*#__PURE__*/React.createElement("th", null, "Subject"), SANCTION_LISTS.map(l => /*#__PURE__*/React.createElement("th", {
  key: l
}, l)))), /*#__PURE__*/React.createElement("tbody", null, SANCTION_ROWS.map((r, i) => /*#__PURE__*/React.createElement("tr", {
  key: i,
  className: r.unverif ? "is-unverif" : ""
}, /*#__PURE__*/React.createElement("td", {
  className: "rel"
}, r.rel), /*#__PURE__*/React.createElement("td", {
  className: "subj"
}, /*#__PURE__*/React.createElement("span", {
  className: "flag-pair"
}, r.cc && /*#__PURE__*/React.createElement(Flag, {
  cc: r.cc,
  name: r.name
}), " ", r.name)), r.res.map((s, j) => /*#__PURE__*/React.createElement("td", {
  key: j,
  className: "center"
}, /*#__PURE__*/React.createElement(SCell, {
  status: s
})))))))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "Tinted rows are ", /*#__PURE__*/React.createElement("em", null, "Unverifiable"), " \u2014 the subject resolved to \"Unknown\", so screening could not run.")), /*#__PURE__*/React.createElement("h4", {
  style: {
    fontSize: 13,
    fontWeight: 700,
    margin: "20px 0 8px"
  }
}, "Cell states"), /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "State"), /*#__PURE__*/React.createElement("th", null, "When"), /*#__PURE__*/React.createElement("th", null, "Meaning"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(SCell, {
  status: "ok"
})), /*#__PURE__*/React.createElement("td", null, "Subject screened, no list match."), /*#__PURE__*/React.createElement("td", null, "Cleared against this list.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(SCell, {
  status: "sanctioned"
})), /*#__PURE__*/React.createElement("td", null, "Subject matches a list entry."), /*#__PURE__*/React.createElement("td", null, "Positive hit \u2014 drives the asset's overall compliance to ", /*#__PURE__*/React.createElement("em", null, "Sanctioned"), ".")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "s-cell s-cell--unverif"
}, "?")), /*#__PURE__*/React.createElement("td", null, "Subject is ", /*#__PURE__*/React.createElement("em", null, "Unknown"), " / has no provider record."), /*#__PURE__*/React.createElement("td", null, "Screening could not run. ", /*#__PURE__*/React.createElement("strong", null, "Treat as elevated risk"), " \u2014 must not show as Ok.")))), /*#__PURE__*/React.createElement("div", {
  className: "callout danger",
  style: {
    marginTop: 12
  }
}, /*#__PURE__*/React.createElement("strong", null, "\"Unknown\" must never pass as compliant."), " When a relationship resolves to ", /*#__PURE__*/React.createElement("em", null, "Unknown"), ", the platform must render the Unverifiable state \u2014 not a green Ok. A reviewer scanning all-green clears the vessel; the Unverifiable cell, row tint, and a small amber dot on the tab keep unscreened subjects visible. Do not reuse the warning \"At risk\" orange (that means \"screened and borderline\") and do not mark unverifiable subjects as Sanctioned (false positives erode trust in the red dot)."));

/* ── Section export ───────────────────────────────────────────────── */

const AssetIdentitySection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FlagSection, null), /*#__PURE__*/React.createElement(IdentitySection, null), /*#__PURE__*/React.createElement(StatusSection, null), /*#__PURE__*/React.createElement(SeveritySection, null), /*#__PURE__*/React.createElement(EventTypeSection, null), /*#__PURE__*/React.createElement(SanctionSection, null));
window.AssetIdentitySection = AssetIdentitySection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-asset-identity.jsx", error: String((e && e.message) || e) }); }

// section-buttons-deep.jsx
try { (() => {
/* Comprehensive Buttons documentation — variants, sizes, states, anatomy, tokens, matrix, guidelines */

/* ——— Redesigned interaction-states data ——— */
const SIZE_DEFS = [{
  key: "sm",
  label: "Small",
  cls: "ds-btn--sm",
  h: "28px"
}, {
  key: "md",
  label: "Medium",
  cls: "",
  h: "32px",
  def: true
}, {
  key: "lg",
  label: "Large",
  cls: "ds-btn--lg",
  h: "40px"
}];
const STATE_DEFS = [{
  key: "default",
  label: "Default",
  trigger: "rest",
  style: {}
}, {
  key: "hover",
  label: "Hover",
  trigger: ":hover",
  style: {
    background: "var(--brand-500)",
    borderColor: "var(--brand-500)"
  }
}, {
  key: "focus",
  label: "Focus",
  trigger: ":focus-visible",
  style: {
    boxShadow: "var(--shadow-focus)"
  },
  focus: true
}, {
  key: "active",
  label: "Active",
  trigger: ":active",
  style: {
    background: "var(--brand-700)",
    borderColor: "var(--brand-700)"
  }
}, {
  key: "disabled",
  label: "Disabled",
  trigger: "[disabled]",
  disabled: true
}];
const BS_STATES_CSS = `
.bs-states kbd.bs-kbd {
  font-family: var(--font-mono); font-size: 11px; line-height: 1;
  padding: 2px 5px; border-radius: 4px;
  background: var(--slate-100); border: 1px solid var(--border-default);
  border-bottom-width: 2px; color: var(--text-secondary);
}

/* Live specimen */
.bs-live {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 20px 24px; margin-top: 4px;
  border: 1px solid var(--border-default); border-radius: var(--radius-lg);
  background:
    radial-gradient(120% 140% at 100% 0%, var(--brand-050) 0%, transparent 55%),
    var(--bg-surface);
}
.bs-live-copy { max-width: 560px; }
.bs-live-stage { flex-shrink: 0; }

/* Matrix */
.bs-panel { overflow: hidden; }
.bs-matrix-wrap { padding: 20px; background: var(--bg-canvas); overflow-x: auto; }
.bs-matrix {
  min-width: 640px;
  display: grid;
  grid-template-columns: 148px repeat(5, minmax(108px, 1fr));
  gap: 1px;
  background: var(--border-default);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.bs-corner, .bs-colhead, .bs-rowhead, .bs-cell { background: var(--bg-surface); }
.bs-corner {
  display: flex; align-items: flex-end; padding: 12px 14px;
  background: var(--slate-50);
}
.bs-colhead {
  padding: 12px 14px; background: var(--slate-50);
  display: flex; flex-direction: column; gap: 4px;
}
.bs-colhead.is-focus, .bs-cell.is-focus { background: var(--brand-050); }
.bs-colhead-name {
  font-size: 12px; font-weight: 700; color: var(--text-primary);
  letter-spacing: 0.01em; display: flex; align-items: center; gap: 6px;
}
.bs-wcag {
  font-family: var(--font-mono); font-size: 9px; font-weight: 700;
  letter-spacing: 0.06em; color: var(--brand-600);
  background: var(--white); border: 1px solid var(--brand-100);
  padding: 1px 4px; border-radius: 3px;
}
.bs-trigger { font-family: var(--font-mono); font-size: 10.5px; color: var(--text-muted); }
.bs-rowhead {
  display: flex; flex-direction: column; gap: 3px; justify-content: center;
  padding: 0 14px; background: var(--slate-50);
}
.bs-size-name { font-size: 13px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
.bs-def {
  font-size: 9px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
  color: var(--brand-600); background: var(--brand-050);
  border: 1px solid var(--brand-100); padding: 1px 5px; border-radius: 3px;
}
.bs-size-h { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
.bs-cell { display: flex; align-items: center; justify-content: center; padding: 26px 14px; }

/* Loading strip */
.bs-loading-strip {
  display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap;
  margin-top: 16px; padding: 18px 24px;
  border: 1px solid var(--border-default); border-radius: var(--radius-lg);
  background: var(--bg-surface);
}
.bs-loading-copy { display: flex; align-items: flex-start; gap: 14px; }
.bs-loading-stage { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.bs-spinner {
  display: inline-block; width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
  animation: bs-spin 0.7s linear infinite;
}
@keyframes bs-spin { to { transform: rotate(360deg); } }

/* Spec table focus-row tint */
.bs-row-focus td { background: var(--brand-050); }

/* Focus spotlight */
.bs-focus-spot {
  display: grid; grid-template-columns: minmax(280px, 1fr) 1.2fr; gap: 16px;
  margin-top: 16px;
}
.bs-focus-demo {
  display: flex; flex-direction: column; gap: 14px;
  padding: 24px; border: 1px solid var(--border-default); border-radius: var(--radius-lg);
  background: var(--bg-surface);
}
.bs-focus-stage {
  display: grid; place-items: center; padding: 28px 16px;
  border-radius: var(--radius-md);
  background:
    linear-gradient(var(--bg-canvas), var(--bg-canvas)),
    repeating-conic-gradient(#fff 0 25%, transparent 0 50%) 50% / 14px 14px;
}
.bs-focus-spec {
  border: 1px solid var(--border-default); border-radius: var(--radius-lg);
  background: var(--bg-surface); overflow: hidden;
}
.bs-focus-row {
  display: grid; grid-template-columns: 116px 1fr; gap: 16px; align-items: center;
  padding: 12px 18px; border-top: 1px solid var(--border-subtle);
}
.bs-focus-row:first-child { border-top: 0; }
.bs-focus-k { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.bs-focus-v { font-size: 13px; color: var(--text-primary); }

@media (max-width: 860px) {
  .bs-focus-spot { grid-template-columns: 1fr; }
  .bs-live { flex-direction: column; align-items: flex-start; }
}
`;
const ButtonsDeep = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Variants"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Six variants cover the full hierarchy of action priority. One primary per surface \u2014 secondary/tertiary support, destructive carries weight, link sits in copy."), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gap: 12
  }
}, [{
  name: "Primary",
  cls: "ds-btn--primary",
  purpose: "Most important action on the surface. One per view.",
  token: "--brand-600 → --brand-500"
}, {
  name: "Secondary",
  cls: "ds-btn--secondary",
  purpose: "Supporting actions. Cancel, alternative paths, secondary CTAs.",
  token: "--white + --border-default"
}, {
  name: "Tertiary / Ghost",
  cls: "ds-btn--ghost",
  purpose: "Lowest emphasis. Toolbars, table row actions, dense surfaces.",
  token: "transparent + hover --slate-100"
}, {
  name: "Destructive",
  cls: "ds-btn--danger",
  purpose: "Irreversible or data-loss actions. Always confirmed via modal.",
  token: "--danger-500 → --danger-700"
}, {
  name: "Link",
  cls: "ds-btn--link",
  purpose: "Inline navigational action that reads as text but behaves as a button.",
  token: "--text-link"
}, {
  name: "Icon-only",
  cls: "ds-btn--secondary ds-btn--icon",
  purpose: "Square buttons with no label. Always paired with aria-label and tooltip.",
  token: "Variant-dependent + width=height"
}].map((v, i) => /*#__PURE__*/React.createElement("div", {
  key: v.name,
  className: "panel",
  style: {
    display: "grid",
    gridTemplateColumns: "180px 1fr 240px",
    gap: 16,
    alignItems: "center",
    padding: 16
  }
}, /*#__PURE__*/React.createElement("div", null, v.name === "Icon-only" ? /*#__PURE__*/React.createElement("button", {
  className: `ds-btn ${v.cls}`
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.edit
})) : /*#__PURE__*/React.createElement("button", {
  className: `ds-btn ${v.cls}`
}, v.name)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    fontWeight: 600,
    fontSize: 13,
    marginBottom: 2
  }
}, v.name), /*#__PURE__*/React.createElement("div", {
  className: "t-caption"
}, v.purpose)), /*#__PURE__*/React.createElement("code", {
  className: "inline",
  style: {
    fontSize: 11
  }
}, v.token))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Sizes"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Four sizes. Heights snap to a fixed scale to align with form inputs and table rows."), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    padding: 24
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "row",
  style: {
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 24
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary ds-btn--xs"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.plus
}), " XS \xB7 24px"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary ds-btn--sm"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.plus
}), " SM \xB7 28px"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.plus
}), " MD \xB7 32px (default)"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary ds-btn--lg"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.plus
}), " LG \xB7 40px")), /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0,
    marginTop: 16
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Size"), /*#__PURE__*/React.createElement("th", null, "Height"), /*#__PURE__*/React.createElement("th", null, "Padding (X)"), /*#__PURE__*/React.createElement("th", null, "Font size"), /*#__PURE__*/React.createElement("th", null, "Icon size"), /*#__PURE__*/React.createElement("th", null, "Icon-label gap"), /*#__PURE__*/React.createElement("th", null, "Use for"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "xs")), /*#__PURE__*/React.createElement("td", null, "24px"), /*#__PURE__*/React.createElement("td", null, "8px"), /*#__PURE__*/React.createElement("td", null, "12px"), /*#__PURE__*/React.createElement("td", null, "12\xD712"), /*#__PURE__*/React.createElement("td", null, "4px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Inline table actions, compact toolbars")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "sm")), /*#__PURE__*/React.createElement("td", null, "28px"), /*#__PURE__*/React.createElement("td", null, "10px"), /*#__PURE__*/React.createElement("td", null, "12px"), /*#__PURE__*/React.createElement("td", null, "14\xD714"), /*#__PURE__*/React.createElement("td", null, "6px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Dense forms, side panels, secondary actions")), /*#__PURE__*/React.createElement("tr", {
  style: {
    background: "var(--brand-050)"
  }
}, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "md"), " ", /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "(default)")), /*#__PURE__*/React.createElement("td", null, "32px"), /*#__PURE__*/React.createElement("td", null, "12px"), /*#__PURE__*/React.createElement("td", null, "13px"), /*#__PURE__*/React.createElement("td", null, "14\xD714"), /*#__PURE__*/React.createElement("td", null, "6px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Standard application controls")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "lg")), /*#__PURE__*/React.createElement("td", null, "40px"), /*#__PURE__*/React.createElement("td", null, "16px"), /*#__PURE__*/React.createElement("td", null, "14px"), /*#__PURE__*/React.createElement("td", null, "16\xD716"), /*#__PURE__*/React.createElement("td", null, "8px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Primary CTAs, marketing surfaces, mobile")))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection bs-states"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Interaction states"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Every button resolves to five interaction states across three sizes. States are driven by native pseudo-classes \u2014 never toggled with JavaScript \u2014 so they stay in lock-step with the browser's real hover, focus, and pointer behavior. Transitions run at ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "var(--motion-fast)"), " (140ms ease-out)."), /*#__PURE__*/React.createElement("div", {
  className: "bs-live"
}, /*#__PURE__*/React.createElement("div", {
  className: "bs-live-copy"
}, /*#__PURE__*/React.createElement("div", {
  className: "t-overline",
  style: {
    color: "var(--brand-600)"
  }
}, "Live specimen"), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    margin: "4px 0 0"
  }
}, "Hover, press, or press ", /*#__PURE__*/React.createElement("kbd", {
  className: "bs-kbd"
}, "Tab"), " to focus \u2014 this is the production component reacting in real time, not a static example.")), /*#__PURE__*/React.createElement("div", {
  className: "bs-live-stage"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary ds-btn--lg"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.check
}), " Save changes"))), /*#__PURE__*/React.createElement("div", {
  className: "panel bs-panel",
  style: {
    marginTop: 20
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Primary \xB7 States \xD7 Sizes"), /*#__PURE__*/React.createElement("span", {
  className: "meta"
}, "Figma: ", /*#__PURE__*/React.createElement("code", {
  className: "inline",
  style: {
    fontSize: 11
  }
}, "Button / Primary / [Size] / [State]"))), /*#__PURE__*/React.createElement("div", {
  className: "bs-matrix-wrap"
}, /*#__PURE__*/React.createElement("div", {
  className: "bs-matrix",
  role: "table",
  "aria-label": "Button states by size"
}, /*#__PURE__*/React.createElement("div", {
  className: "bs-corner",
  role: "columnheader"
}, /*#__PURE__*/React.createElement("span", {
  className: "t-overline",
  style: {
    color: "var(--text-muted)"
  }
}, "Size \u2572 State")), STATE_DEFS.map(st => /*#__PURE__*/React.createElement("div", {
  key: st.key,
  className: `bs-colhead${st.focus ? " is-focus" : ""}`,
  role: "columnheader"
}, /*#__PURE__*/React.createElement("div", {
  className: "bs-colhead-name"
}, st.label, st.focus && /*#__PURE__*/React.createElement("span", {
  className: "bs-wcag"
}, "WCAG")), /*#__PURE__*/React.createElement("code", {
  className: "bs-trigger"
}, st.trigger))), SIZE_DEFS.map(sz => /*#__PURE__*/React.createElement(React.Fragment, {
  key: sz.key
}, /*#__PURE__*/React.createElement("div", {
  className: "bs-rowhead",
  role: "rowheader"
}, /*#__PURE__*/React.createElement("span", {
  className: "bs-size-name"
}, sz.label, sz.def && /*#__PURE__*/React.createElement("span", {
  className: "bs-def"
}, "default")), /*#__PURE__*/React.createElement("code", {
  className: "bs-size-h"
}, sz.h)), STATE_DEFS.map(st => /*#__PURE__*/React.createElement("div", {
  key: st.key,
  className: `bs-cell${st.focus ? " is-focus" : ""}`,
  role: "cell"
}, /*#__PURE__*/React.createElement("button", {
  className: `ds-btn ds-btn--primary ${sz.cls}`,
  style: st.style,
  disabled: st.disabled,
  tabIndex: -1,
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.check
}), " Save"))))))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "Same recipe applies to Secondary, Ghost, and Destructive \u2014 only the fill/border tokens swap. Focus, active, and disabled behavior is identical across variants.")), /*#__PURE__*/React.createElement("div", {
  className: "bs-loading-strip"
}, /*#__PURE__*/React.createElement("div", {
  className: "bs-loading-copy"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--info ds-badge--dot"
}, "Async"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-h4",
  style: {
    marginBottom: 2
  }
}, "Loading"), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    margin: 0,
    maxWidth: 380
  }
}, "A behavioral overlay on any state. Spinner replaces the leading icon, ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-busy=\"true\""), " is set, and ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "pointer-events"), " are suppressed \u2014 but the button stays focusable."))), /*#__PURE__*/React.createElement("div", {
  className: "bs-loading-stage"
}, [{
  cls: "ds-btn--sm"
}, {
  cls: ""
}, {
  cls: "ds-btn--lg"
}].map((s, i) => /*#__PURE__*/React.createElement("button", {
  key: i,
  className: `ds-btn ds-btn--primary ${s.cls}`,
  "aria-busy": "true",
  tabIndex: -1,
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("span", {
  className: "bs-spinner"
}), "Saving\u2026")))), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "28px 0 10px"
  }
}, "State specification"), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
  style: {
    width: "14%"
  }
}, "State"), /*#__PURE__*/React.createElement("th", {
  style: {
    width: "16%"
  }
}, "Trigger"), /*#__PURE__*/React.createElement("th", {
  style: {
    width: "26%"
  }
}, "Visual change"), /*#__PURE__*/React.createElement("th", {
  style: {
    width: "20%"
  }
}, "Token"), /*#__PURE__*/React.createElement("th", null, "Accessibility"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Default")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Resting"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Solid brand fill, white label."), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--brand-600")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Label contrast 4.5:1 on fill (AA).")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Hover")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ":hover")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Fill lightens one step; cursor \u2192 pointer."), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--brand-500")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Never the sole signal \u2014 paired with focus + active.")), /*#__PURE__*/React.createElement("tr", {
  className: "bs-row-focus"
}, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Focus")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ":focus-visible")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "3px ring, 0 offset, fill unchanged."), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--shadow-focus")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Ring \u2265 3:1 contrast. Keyboard-only; never ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "outline: none"), " without a replacement.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Active")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ":active")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Fill darkens one step (pressed)."), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--brand-700")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Instant \u2014 no transition delay on press-down.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Disabled")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "[disabled]")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Muted slate fill, slate label, no shadow."), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--slate-200"), " / ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--slate-400")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Not focusable. Pair with tooltip explaining why."))))), /*#__PURE__*/React.createElement("div", {
  className: "bs-focus-spot"
}, /*#__PURE__*/React.createElement("div", {
  className: "bs-focus-demo"
}, /*#__PURE__*/React.createElement("span", {
  className: "t-overline",
  style: {
    color: "var(--brand-600)"
  }
}, "Keyboard focus"), /*#__PURE__*/React.createElement("div", {
  className: "bs-focus-stage"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary ds-btn--lg",
  style: {
    boxShadow: "var(--shadow-focus)"
  },
  tabIndex: -1,
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.check
}), " Save changes")), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    margin: 0
  }
}, "The focus ring is the single most important accessibility affordance. It must survive design reviews untouched.")), /*#__PURE__*/React.createElement("div", {
  className: "bs-focus-spec"
}, [["Ring width", "3px solid offset"], ["Ring color", "rgba(46,134,192,0.32)"], ["Contrast", "≥ 3:1 vs. adjacent surface (WCAG 2.4.11)"], ["Visibility", "Keyboard only — suppressed on mouse via :focus-visible"], ["Activation", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("kbd", {
  className: "bs-kbd"
}, "Enter"), " and ", /*#__PURE__*/React.createElement("kbd", {
  className: "bs-kbd"
}, "Space"), " both fire onClick")], ["Never", "outline: none without a visible replacement"]].map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  className: "bs-focus-row"
}, /*#__PURE__*/React.createElement("span", {
  className: "bs-focus-k"
}, k), /*#__PURE__*/React.createElement("span", {
  className: "bs-focus-v"
}, v))))), /*#__PURE__*/React.createElement("style", null, BS_STATES_CSS)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Anatomy"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Buttons compose from up to four parts. The container is a flex row; gap controls icon-to-label spacing."), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    padding: 32,
    display: "grid",
    placeItems: "center",
    background: "var(--bg-canvas)"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    display: "inline-block"
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary ds-btn--lg",
  style: {
    padding: "0 16px"
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.plus
}), /*#__PURE__*/React.createElement("span", null, "Create policy"), /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronRight
})), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    top: -28,
    left: -8,
    right: -8,
    height: 1,
    borderTop: "1px dashed var(--brand-500)"
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    top: -44,
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 10,
    color: "var(--brand-600)",
    whiteSpace: "nowrap"
  }
}, "\u2460 Container"), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    bottom: -22,
    left: 14,
    fontSize: 10,
    color: "var(--brand-600)"
  }
}, "\u2461 Leading icon"), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    bottom: -22,
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 10,
    color: "var(--brand-600)"
  }
}, "\u2462 Label"), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    bottom: -22,
    right: 14,
    fontSize: 10,
    color: "var(--brand-600)"
  }
}, "\u2463 Trailing icon"))), /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0,
    marginTop: 24
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
  style: {
    width: 28
  }
}, "#"), /*#__PURE__*/React.createElement("th", null, "Part"), /*#__PURE__*/React.createElement("th", null, "Rules"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "\u2460"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Container")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Flex row, ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "align-items: center"), ", fixed height, full border-radius var(--radius-md). All sides equal padding.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "\u2461"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Leading icon"), " ", /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "(optional)")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Pre-label icon. Conveys action category (plus = create, edit = modify). Icon-label gap = 6px (md), 4px (xs/sm), 8px (lg).")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "\u2462"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Label")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Always present except in icon-only buttons. Verb-first (\"Save changes\", not \"Changes save\"). Sentence case. Avoid two words when one will do.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "\u2463"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Trailing icon"), " ", /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "(optional)")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Indicates direction or further options. Common: chevron-right (next), chevron-down (menu), external-link.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "\u2464"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Loading indicator"), " ", /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "(replaces \u2461)")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "12-14px circular spinner. Replaces leading icon during async work. Label can change to gerund (\"Save\" \u2192 \"Saving\u2026\")."))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Icon usage"), /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Icon + label")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    display: "grid",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "row",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.plus
}), " New vessel"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.download
}), " Export"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost"
}, "Continue ", /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronRight
}))), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    margin: 0
  }
}, "Icon clarifies the action. Always pair with a verb-first label. Icon goes left for actions, right for navigation."))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Icon-only")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    display: "grid",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "row",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--icon",
  "aria-label": "Edit"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.edit
})), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--icon",
  "aria-label": "Delete"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.trash
})), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--icon",
  "aria-label": "More options"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.more
}))), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    margin: 0
  }
}, "Square (width = height). ", /*#__PURE__*/React.createElement("strong", null, "Required:"), " ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-label"), " describing the action. Pair with tooltip on hover/focus for sighted users.")))), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 16
  }
}, /*#__PURE__*/React.createElement("strong", null, "Accessibility floor:"), " Every icon-only button needs ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-label"), ". Decorative icons inside labeled buttons get ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-hidden=\"true\""), ". Tooltip text must match aria-label.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Token mapping"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Every visual property maps to a design token. No raw hex values in component code."), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Variant"), /*#__PURE__*/React.createElement("th", null, "Background"), /*#__PURE__*/React.createElement("th", null, "Text"), /*#__PURE__*/React.createElement("th", null, "Border"), /*#__PURE__*/React.createElement("th", null, "Hover bg"), /*#__PURE__*/React.createElement("th", null, "Focus ring"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Primary")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--brand-600")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--white")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--brand-600")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--brand-500")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--shadow-focus"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Secondary")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--white")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--slate-800")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--border-default")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--slate-50")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--shadow-focus"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Ghost")), /*#__PURE__*/React.createElement("td", null, "transparent"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--text-link")), /*#__PURE__*/React.createElement("td", null, "transparent"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--slate-100")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--shadow-focus"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Destructive")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--danger-500")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--white")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--danger-500")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--danger-700")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--shadow-focus-danger"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Link")), /*#__PURE__*/React.createElement("td", null, "transparent"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--text-link")), /*#__PURE__*/React.createElement("td", null, "transparent"), /*#__PURE__*/React.createElement("td", null, "underline only"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--shadow-focus")))))), /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0,
    marginTop: 16
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Property"), /*#__PURE__*/React.createElement("th", null, "Token"), /*#__PURE__*/React.createElement("th", null, "Value"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Border radius"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--radius-md")), /*#__PURE__*/React.createElement("td", null, "6px")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Padding (md)"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--space-4")), /*#__PURE__*/React.createElement("td", null, "12px")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Icon-label gap"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--space-3")), /*#__PURE__*/React.createElement("td", null, "8px")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Transition"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--motion-fast")), /*#__PURE__*/React.createElement("td", null, "140ms ease-out")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Elevation (secondary)"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--card-shadow-rest")), /*#__PURE__*/React.createElement("td", null, "0 1px 2px / 0.05"))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Variants \xD7 Sizes \xD7 States matrix"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Figma naming convention: ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Button/[Variant]/[Size]/[State]"), " \u2014 e.g. ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Button/Primary/Large/Hover"), "."), [{
  variant: "Primary",
  cls: "ds-btn--primary"
}, {
  variant: "Secondary",
  cls: "ds-btn--secondary"
}, {
  variant: "Ghost",
  cls: "ds-btn--ghost"
}, {
  variant: "Destructive",
  cls: "ds-btn--danger"
}].map(v => /*#__PURE__*/React.createElement("div", {
  key: v.variant,
  className: "panel",
  style: {
    padding: 16,
    marginBottom: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "t-h4",
  style: {
    marginBottom: 12
  }
}, "Button / ", v.variant), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "80px repeat(5, 1fr)",
    gap: 8,
    alignItems: "center",
    fontSize: 11
  }
}, /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement("div", {
  className: "t-caption",
  style: {
    textAlign: "center"
  }
}, "Default"), /*#__PURE__*/React.createElement("div", {
  className: "t-caption",
  style: {
    textAlign: "center"
  }
}, "Hover"), /*#__PURE__*/React.createElement("div", {
  className: "t-caption",
  style: {
    textAlign: "center"
  }
}, "Focus"), /*#__PURE__*/React.createElement("div", {
  className: "t-caption",
  style: {
    textAlign: "center"
  }
}, "Active"), /*#__PURE__*/React.createElement("div", {
  className: "t-caption",
  style: {
    textAlign: "center"
  }
}, "Disabled"), [{
  sz: "sm",
  cls: "ds-btn--sm"
}, {
  sz: "md",
  cls: ""
}, {
  sz: "lg",
  cls: "ds-btn--lg"
}].map(s => /*#__PURE__*/React.createElement(React.Fragment, {
  key: s.sz
}, /*#__PURE__*/React.createElement("div", {
  className: "t-caption",
  style: {
    textAlign: "right",
    paddingRight: 4
  }
}, s.sz), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    placeItems: "center"
  }
}, /*#__PURE__*/React.createElement("button", {
  className: `ds-btn ${v.cls} ${s.cls}`
}, "Action")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    placeItems: "center"
  }
}, /*#__PURE__*/React.createElement("button", {
  className: `ds-btn ${v.cls} ${s.cls}`,
  style: v.variant === "Primary" ? {
    background: "var(--brand-500)",
    borderColor: "var(--brand-500)"
  } : v.variant === "Secondary" ? {
    background: "var(--slate-50)",
    borderColor: "var(--border-strong)"
  } : v.variant === "Ghost" ? {
    background: "var(--slate-100)"
  } : {
    background: "var(--danger-700)",
    borderColor: "var(--danger-700)"
  }
}, "Action")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    placeItems: "center"
  }
}, /*#__PURE__*/React.createElement("button", {
  className: `ds-btn ${v.cls} ${s.cls}`,
  style: {
    boxShadow: "var(--shadow-focus)"
  }
}, "Action")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    placeItems: "center"
  }
}, /*#__PURE__*/React.createElement("button", {
  className: `ds-btn ${v.cls} ${s.cls}`,
  style: v.variant === "Primary" ? {
    background: "#0B3A5A",
    borderColor: "#0B3A5A"
  } : v.variant === "Secondary" ? {
    background: "var(--slate-100)"
  } : v.variant === "Ghost" ? {
    background: "var(--slate-150)"
  } : {
    background: "#9F1F1F",
    borderColor: "#9F1F1F"
  }
}, "Action")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    placeItems: "center"
  }
}, /*#__PURE__*/React.createElement("button", {
  className: `ds-btn ${v.cls} ${s.cls}`,
  disabled: true
}, "Action")))))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Usage guidelines"), /*#__PURE__*/React.createElement("div", {
  className: "dodont"
}, /*#__PURE__*/React.createElement("div", {
  className: "do"
}, /*#__PURE__*/React.createElement("div", {
  className: "hd"
}, "\u2713 Do"), /*#__PURE__*/React.createElement("div", {
  className: "bd"
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    lineHeight: 1.7,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "One primary per surface."), " Form footers, dialogs, page headers \u2014 each gets exactly one."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Order matters."), " Primary on the right, secondary to its left, destructive at far left or in overflow."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Verb-first labels."), " \"Save changes\", \"Delete vessel\", \"Export report\"."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Match button size to context."), " Dense tables \u2192 sm. Form footers \u2192 md. Hero CTAs \u2192 lg."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Confirm destructive actions."), " Always trigger a confirmation modal before data loss.")))), /*#__PURE__*/React.createElement("div", {
  className: "dont"
}, /*#__PURE__*/React.createElement("div", {
  className: "hd"
}, "\u2717 Don't"), /*#__PURE__*/React.createElement("div", {
  className: "bd"
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    lineHeight: 1.7,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Stack two primaries."), " Confuses hierarchy. Demote one to secondary."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Use buttons for navigation."), " Use links (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, `<a>`), ") when the destination is a URL. Buttons trigger actions."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Use destructive for \"Cancel\"."), " Cancel is always secondary."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Stack ", `>`, " 3 buttons in a row."), " Collapse extras into a kebab/overflow menu."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Label with two words when one suffices."), " \"Save changes\" \u2192 \"Save\" if context is unambiguous."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Disable without explanation."), " Pair disabled buttons with tooltip or inline help text.")))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Engineering handoff"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Suggested component API. Names align with shadcn/ui and Material conventions for predictability."), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';            // default 'md'
  iconLeft?: ReactNode;                         // optional leading icon
  iconRight?: ReactNode;                        // optional trailing icon
  iconOnly?: boolean;                           // square button; requires aria-label
  loading?: boolean;                            // shows spinner, sets aria-busy
  disabled?: boolean;
  fullWidth?: boolean;                          // stretches to container
  type?: 'button' | 'submit' | 'reset';         // default 'button'
  onClick?: (e: MouseEvent) => void;
  children: ReactNode;                          // label
  'aria-label'?: string;                        // required when iconOnly
};

// Usage
<Button variant="primary" size="lg" iconLeft={<PlusIcon />} loading={isSaving}>
  Create policy
</Button>

<Button variant="secondary" iconOnly aria-label="Edit row">
  <EditIcon />
</Button>`), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    marginTop: 24,
    marginBottom: 8
  }
}, "Behavior expectations"), /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    lineHeight: 1.7,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Loading state:"), " Sets ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-busy=\"true\""), ", sets ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "pointer-events: none"), ", replaces ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "iconLeft"), " with spinner. Stays focusable for keyboard users."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Disabled + loading:"), " Mutually exclusive; if both pass, loading wins (action is in-progress, not unavailable)."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Long text:"), " Truncates with ellipsis on single line; never wraps. Tooltip surfaces full text on hover."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Form submit:"), " Default ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "type=\"button\""), " to prevent accidental submits. Set ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "type=\"submit\""), " explicitly inside forms."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Icon-only:"), " Throws TypeScript error in dev if ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-label"), " is missing."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Keyboard:"), " ", /*#__PURE__*/React.createElement("kbd", null, "Space"), " and ", /*#__PURE__*/React.createElement("kbd", null, "Enter"), " both activate. Focus ring suppressed via ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ":focus-visible"), " for mouse users.")), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    marginTop: 24,
    marginBottom: 8
  }
}, "Edge cases"), /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Case"), /*#__PURE__*/React.createElement("th", null, "Behavior"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Long label exceeds container"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Truncate with ellipsis. Use tooltip or move action to a menu item.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "loading"), " + ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "disabled"), " both true"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Loading takes precedence. Spinner shows; aria-busy true; aria-disabled false.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Async action fails"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Reset to default state. Surface error via Toast or inline alert; don't show error inside button.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Multiple clicks during loading"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Pointer-events: none prevents click handler. Don't debounce in the component \u2014 handle in caller.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Icon-only button on touch device"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Increase hit area to 44\xD744px minimum via padding while keeping visual size.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Right-to-left languages"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Mirror iconLeft/iconRight automatically when ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "dir=\"rtl\""), "."))))));
Object.assign(window, {
  ButtonsDeep
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-buttons-deep.jsx", error: String((e && e.message) || e) }); }

// section-charts.jsx
try { (() => {
/* ============================================================================
   section-charts.jsx — "Charts — composite components" spec section.
   Live demos render the real charts-lib.jsx components; the .tsx in the code
   blocks mirrors them. Depends on charts-lib.jsx (window.Bar/Line/Donut).
   ============================================================================ */

const nf = v => new Intl.NumberFormat("en-GB").format(v);
const BAR_DATA = [{
  label: "Maritime",
  High: 420,
  Medium: 560,
  Low: 267
}, {
  label: "Aviation",
  High: 210,
  Medium: 380,
  Low: 242
}, {
  label: "Offshore",
  High: 160,
  Medium: 300,
  Low: 154
}, {
  label: "GSIN",
  High: 90,
  Medium: 180,
  Low: 121
}, {
  label: "Portfolio",
  High: 40,
  Medium: 120,
  Low: 88
}].map(d => ({
  ...d,
  Alerts: d.High + d.Medium + d.Low
}));
const LINE_DATA = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((mo, i) => ({
  x: mo,
  Maritime: Math.round(380 + 180 * Math.sin(i / 2) + i * 14),
  Aviation: Math.round(240 + 90 * Math.cos(i / 1.7) + i * 8),
  Offshore: Math.round(150 + 60 * Math.sin(i / 2.3 + 1))
}));
const DONUT_DATA = [{
  label: "Container",
  value: 96
}, {
  label: "Tanker",
  value: 71
}, {
  label: "Bulk",
  value: 48
}, {
  label: "LNG",
  value: 29
}, {
  label: "Other",
  value: 19
}];
const DONUT_TOTAL = DONUT_DATA.reduce((s, d) => s + d.value, 0);

/* ── Segmented control for variant toggles ───────────────────────────── */
const Seg = ({
  value,
  onChange,
  options
}) => /*#__PURE__*/React.createElement("div", {
  className: "cx-seg",
  role: "tablist"
}, options.map(o => /*#__PURE__*/React.createElement("button", {
  key: o.v,
  role: "tab",
  "aria-selected": value === o.v,
  className: `cx-seg-btn ${value === o.v ? "is-active" : ""}`,
  onClick: () => onChange(o.v)
}, o.label)));

/* ── Live demos ──────────────────────────────────────────────────────── */
const BarDemo = () => {
  const {
    Bar
  } = window;
  const [v, setV] = React.useState("grouped");
  const series = v === "single" ? ["Alerts"] : ["High", "Medium", "Low"];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "cx-demo-head"
  }, /*#__PURE__*/React.createElement(Seg, {
    value: v,
    onChange: setV,
    options: [{
      v: "single",
      label: "Single"
    }, {
      v: "stacked",
      label: "Stacked"
    }, {
      v: "grouped",
      label: "Grouped"
    }]
  }), /*#__PURE__*/React.createElement("code", {
    className: "inline",
    style: {
      fontSize: 11
    }
  }, "variant=\"", v, "\"")), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement(Bar, {
    variant: v,
    data: BAR_DATA,
    series: series,
    formatValue: nf,
    title: `Active alerts by domain · ${v}`,
    caption: "Hover or Tab into the plot, then use \u2190 \u2192 to move between bars.",
    height: 264
  })));
};
const LineDemo = () => {
  const {
    Line
  } = window;
  const [v, setV] = React.useState("multi");
  const series = v === "multi" ? ["Maritime", "Aviation", "Offshore"] : ["Maritime"];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "cx-demo-head"
  }, /*#__PURE__*/React.createElement(Seg, {
    value: v,
    onChange: setV,
    options: [{
      v: "single",
      label: "Single"
    }, {
      v: "multi",
      label: "Multi-line"
    }, {
      v: "area",
      label: "Area"
    }]
  }), /*#__PURE__*/React.createElement("code", {
    className: "inline",
    style: {
      fontSize: 11
    }
  }, "variant=\"", v, "\"")), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement(Line, {
    variant: v,
    data: LINE_DATA,
    series: series,
    formatValue: nf,
    formatX: x => x,
    title: `Alert volume · trailing 12 months · ${v}`,
    caption: "Tab into the plot, then \u2190 \u2192 between points.",
    height: 264
  })));
};
const DonutDemo = () => {
  const {
    Donut
  } = window;
  const [v, setV] = React.useState("donut");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "cx-demo-head"
  }, /*#__PURE__*/React.createElement(Seg, {
    value: v,
    onChange: setV,
    options: [{
      v: "donut",
      label: "Donut"
    }, {
      v: "pie",
      label: "Pie"
    }]
  }), /*#__PURE__*/React.createElement("code", {
    className: "inline",
    style: {
      fontSize: 11
    }
  }, "variant=\"", v, "\"")), /*#__PURE__*/React.createElement("div", {
    className: "grid-2",
    style: {
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement(Donut, {
    variant: v,
    data: DONUT_DATA,
    formatValue: nf,
    centerLabel: {
      value: nf(DONUT_TOTAL),
      label: "vessels"
    },
    title: `Fleet by cargo type · ${v}`,
    caption: "Right-side legend with share %.",
    height: 240
  })), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement(Donut, {
    variant: "donut",
    data: DONUT_DATA,
    formatValue: nf,
    legendPlacement: "right",
    legend: false,
    centerSlot: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 26,
        fontWeight: 700,
        fontFamily: "var(--font-display)",
        color: "var(--brand-600)"
      }
    }, "72%"), /*#__PURE__*/React.createElement("span", {
      className: "t-caption",
      style: {
        fontSize: 10.5
      }
    }, "monitored")),
    title: "Center-label slot",
    caption: "centerSlot renders arbitrary JSX in the hole.",
    height: 240
  }))));
};
const StateDemo = () => {
  const {
    Bar
  } = window;
  const [s, setS] = React.useState("loading");
  const stateProp = s === "data" ? undefined : {
    loading: s === "loading",
    empty: s === "empty",
    error: s === "error"
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "cx-demo-head"
  }, /*#__PURE__*/React.createElement(Seg, {
    value: s,
    onChange: setS,
    options: [{
      v: "data",
      label: "Data"
    }, {
      v: "loading",
      label: "Loading"
    }, {
      v: "empty",
      label: "Empty"
    }, {
      v: "error",
      label: "Error"
    }]
  })), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement(Bar, {
    variant: "single",
    data: BAR_DATA,
    series: ["Alerts"],
    formatValue: nf,
    state: stateProp,
    title: "Active alerts by domain",
    caption: "Same component \u2014 every state is a prop, never a separate render path.",
    height: 220
  })));
};

/* ── The section ─────────────────────────────────────────────────────── */
const ChartsSpec = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Architecture & shared foundation"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Composite charts are thin assemblies over the domain primitives. They own ", /*#__PURE__*/React.createElement("em", null, "data shape, scales, layout and state"), " \u2014 never colors, fonts, or axis styling, which come from tokens. Every chart is wrapped in one ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "<ChartFrame>"), " that standardizes the title, legend, responsive measurement, the four states, the hidden data table and the accessibility shell."), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    overflow: "hidden",
    marginBottom: 16
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Primitive"), /*#__PURE__*/React.createElement("th", null, "Role in a composite chart"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Canvas")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Owns width/height + margins; exposes the inner plot rect. Responsive width via ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "ResizeObserver"), " (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "useMeasure"), ").")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Scale")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "scaleLinear"), " (value axis), ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "scaleBand"), " (categories), ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "scaleArc"), " (donut/pie angles).")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "GridLines"), " / ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Axis")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Horizontal gridlines + value/category ticks. 4\u20136 nice ticks; 11px mono labels; value-axis line only.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Marks.Bar / .Line / .Area / .Arc")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "The data geometry. Each mark is focusable (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "tabIndex"), ") and carries its own ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-label"), ".")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Tooltip")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Single inverse-surface tooltip, positioned from mark ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "hover"), "/", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "focus"), ". One per chart, hosted by the frame.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Legend")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Bottom (bar/line) or right (donut). Swatch shape follows the mark \u2014 square for bars/arcs, line for series."))))), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "8px 0 8px"
  }
}, "Shared props \u2014 ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "ChartBaseProps<T>")), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// app/ui/charts/types.ts
export type Token = string;                         // e.g. 'var(--chart-cat-1)'
export type Formatter<V = number> = (v: V) => string;

export interface ChartDimensions {
  width?: number;        // omit → fills container (responsive)
  height?: number;       // px; default 260
  aspectRatio?: number;  // used when height is omitted (w / ratio)
  margin?: Partial<{ t: number; r: number; b: number; l: number }>;
}

export interface ChartState {
  loading?: boolean;
  error?: boolean | string;
  empty?: boolean;       // derive from data.length === 0 if omitted
}

export interface LegendConfig {
  show?: boolean;                       // default true when series > 1
  placement?: 'bottom' | 'right';       // default per chart type
}

export interface ChartA11y {
  label: string;                        // accessible name (required)
  description?: string;                 // longer summary for SR
  dataTable?: boolean;                  // render hidden <table>, default true
}

export interface ChartBaseProps<T> {
  data: T[];
  dimensions?: ChartDimensions;
  responsive?: boolean;                 // default true
  colors?: Token[];                     // default = categorical palette by index
  formatValue?: Formatter;              // y / value formatting
  formatLabel?: Formatter<string>;      // category / tick formatting
  formatTooltip?: (datum: T) => React.ReactNode;
  legend?: LegendConfig;
  state?: ChartState;
  a11y: ChartA11y;
  onPointHover?: (datum: T | null) => void;
  onPointClick?: (datum: T) => void;
}`), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    marginTop: 16,
    marginBottom: 10
  }
}, "A composite chart, live and responsive \u2014 drag the window or collapse the panel to watch it reflow, rotate tight labels, and re-tick:"), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    padding: 20
  }
}, React.createElement(window.Bar, {
  variant: "grouped",
  data: BAR_DATA,
  series: ["High", "Medium", "Low"],
  formatValue: nf,
  title: "Alerts by domain & severity",
  caption: "Grouped bar · responsive · keyboard-navigable",
  height: 264
}))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Bar chart"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Categorical comparison. Three variants share one component and one value scale; only the mark layout changes."), /*#__PURE__*/React.createElement(BarDemo, null), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "24px 0 8px"
  }
}, "API"), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Prop"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Default"), /*#__PURE__*/React.createElement("th", null, "Notes"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "data")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, `{ label: string; [series]: number }[]`), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "One row per category.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "series")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "string[]"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Keys to plot. Length 1 \u2192 single; >1 \u2192 stacked/grouped.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "variant")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "'single'|'stacked'|'grouped'"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "'single'")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Mark layout.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "orientation")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "'vertical'|'horizontal'"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "'vertical'")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Switch to horizontal when categories > ~12 or labels are long.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "formatValue")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Formatter"), /*#__PURE__*/React.createElement("td", null, "identity"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Value-axis + tooltip number formatting.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
  colSpan: 4,
  className: "t-caption"
}, /*#__PURE__*/React.createElement("strong", null, "+ all ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "ChartBaseProps")), " (dimensions, colors, legend, state, a11y, callbacks)."))))), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "24px 0 8px"
  }
}, "Primitive assembly blueprint"), /*#__PURE__*/React.createElement("ol", {
  className: "cx-steps"
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Measure"), " \u2014 ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Canvas"), " reads container width via ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "useMeasure"), "; derive ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "innerW/innerH"), " from margins."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Scales"), " \u2014 ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "scaleBand"), " over ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "data.label"), " for x; ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "scaleLinear([0, niceMax], [innerH, 0])"), " for y. Stacked uses the per-row ", /*#__PURE__*/React.createElement("em", null, "sum"), " for the y-domain; grouped subdivides the band by ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "series.length"), "."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Guides"), " \u2014 ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "GridLines"), " on y-ticks, ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Axis"), " left (values) + bottom (categories). No vertical gridlines."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Marks"), " \u2014 map rows \u2192 ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Marks.Bar"), ". Stacked accumulates an offset; grouped offsets by sub-band index. Fill = ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "colors[i]"), "."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Interaction"), " \u2014 each bar wires ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "onMouseEnter/onFocus \u2192 Tooltip"), " and is ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "tabIndex=0"), " with an ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-label"), "."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Frame"), " \u2014 wrap in ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "ChartFrame"), " for title, legend (when series>1), state and the hidden table.")), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "24px 0 8px"
  }
}, "Implementation (excerpt)"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// app/ui/charts/BarChart.tsx
export interface BarChartProps extends ChartBaseProps<BarDatum> {
  series: string[];
  variant?: 'single' | 'stacked' | 'grouped';
  orientation?: 'vertical' | 'horizontal';
}

export function BarChart({ data, series, variant = 'single', colors, formatValue = String, ...base }: BarChartProps) {
  const palette = colors ?? series.map((_, i) => catToken(i));
  const totals  = data.map(d => variant === 'stacked'
    ? series.reduce((s, k) => s + (d[k] ?? 0), 0)
    : Math.max(...series.map(k => d[k] ?? 0)));
  const { ticks, top } = niceTicks(Math.max(...totals));

  return (
    <ChartFrame {...base} legend={series.length > 1 ? toLegend(series, palette) : undefined}
                dataTable={toTable(data, series, formatValue)}>
      {({ width, height }) => {
        const { innerW, innerH, m } = useCanvas(width, height);
        const x = scaleBand(data.map(d => d.label), [m.l, width - m.r], 0.28);
        const y = scaleLinear([0, top], [m.t + innerH, m.t]);
        return (
          <Canvas width={width} height={height} onKeyDown={rovingFocus}>
            <GridLines ticks={ticks} y={y} x0={m.l} x1={width - m.r} />
            <Axis.Left ticks={ticks} y={y} format={formatValue} />
            {data.map((d, ci) => <BarGroup key={d.label} datum={d} series={series}
              variant={variant} band={x(d.label)} palette={palette} y={y} top={top} />)}
          </Canvas>
        );
      }}
    </ChartFrame>
  );
}`)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Line chart"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Trends over an ordered axis. Single, multi-line, and filled area share one path generator."), /*#__PURE__*/React.createElement(LineDemo, null), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "24px 0 8px"
  }
}, "API"), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Prop"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Default"), /*#__PURE__*/React.createElement("th", null, "Notes"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "data")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, `{ x: string|number; [series]: number }[]`), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Ordered by x.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "series")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "string[]"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "One path per key.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "variant")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "'single'|'multi'|'area'"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "'single'")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Area fills under the line at 12% opacity.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "xScaleType")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "'point'|'time'|'linear'"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "'point'")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Time snaps ticks to natural breaks.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "curve")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "'linear'|'monotone'"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "'linear'")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Monotone for smoothed metrics only.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "formatX / formatValue")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Formatter"), /*#__PURE__*/React.createElement("td", null, "identity"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Axis + tooltip formatting.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
  colSpan: 4,
  className: "t-caption"
}, /*#__PURE__*/React.createElement("strong", null, "+ all ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "ChartBaseProps")), "."))))), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "24px 0 8px"
  }
}, "Primitive assembly blueprint"), /*#__PURE__*/React.createElement("ol", {
  className: "cx-steps"
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Measure"), " & derive inner rect (as bar)."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Scales"), " \u2014 x = ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "scalePoint/scaleTime"), " over the domain; y = ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "scaleLinear"), " over ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "[0, niceMax]"), " across ", /*#__PURE__*/React.createElement("em", null, "all"), " series so they share one axis."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Guides"), " \u2014 y ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "GridLines"), " + left axis. X ticks thinned to fit (label width budget)."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Marks"), " \u2014 one ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Marks.Line"), " path per series (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Marks.Area"), " adds a closed fill below). Point markers sit on each vertex for hit-testing + keyboard stops."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Interaction"), " \u2014 a shared crosshair + the single Tooltip listing every series value at the hovered x. Points are the focusable marks for keyboard."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Frame"), " \u2014 legend bottom when series>1.")), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// app/ui/charts/LineChart.tsx
export interface LineChartProps extends ChartBaseProps<LinePoint> {
  series: string[];
  variant?: 'single' | 'multi' | 'area';
  xScaleType?: 'point' | 'time' | 'linear';
  curve?: 'linear' | 'monotone';
}

export function LineChart({ data, series, variant = 'single', colors, curve = 'linear', ...base }: LineChartProps) {
  const palette = colors ?? series.map((_, i) => catToken(i));
  const yMax = Math.max(...data.flatMap(d => series.map(k => d[k] ?? 0)));
  const { ticks, top } = niceTicks(yMax);
  return (
    <ChartFrame {...base} legend={series.length > 1 ? toLegend(series, palette, 'line') : undefined}>
      {({ width, height }) => {
        const { innerW, innerH, m } = useCanvas(width, height);
        const x = scalePoint(data.map(d => d.x), [m.l, width - m.r]);
        const y = scaleLinear([0, top], [m.t + innerH, m.t]);
        const path = makePath(curve);
        return (
          <Canvas width={width} height={height} onKeyDown={rovingFocus}>
            <GridLines ticks={ticks} y={y} x0={m.l} x1={width - m.r} />
            <Axis.Left ticks={ticks} y={y} /> <Axis.Bottom scale={x} thin />
            {series.map((k, i) => <React.Fragment key={k}>
              {variant === 'area' && <Marks.Area data={data} x={x} y={y} k={k} fill={palette[i]} />}
              <Marks.Line data={data} x={x} y={y} k={k} stroke={palette[i]} path={path} />
            </React.Fragment>)}
          </Canvas>
        );
      }}
    </ChartFrame>
  );
}`)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Donut chart"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Part-to-whole. Donut and pie share one arc generator; the donut hole is a slot for a summary metric or arbitrary JSX."), /*#__PURE__*/React.createElement(DonutDemo, null), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "24px 0 8px"
  }
}, "API"), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Prop"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Default"), /*#__PURE__*/React.createElement("th", null, "Notes"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "data")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, `{ label: string; value: number }[]`), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Shares computed automatically.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "variant")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "'donut'|'pie'"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "'donut'")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Pie sets innerRadius 0.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "innerRatio")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "number"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "0.62")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Donut hole as a fraction of outer radius.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "centerLabel")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, `{ value: string; label: string }`), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Convenience two-line center metric (donut only).")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "centerSlot")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "ReactNode"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Full control of the hole \u2014 overrides centerLabel.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
  colSpan: 4,
  className: "t-caption"
}, /*#__PURE__*/React.createElement("strong", null, "+ all ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "ChartBaseProps")), ". Legend defaults to ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "'right'"), "."))))), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "24px 0 8px"
  }
}, "Primitive assembly blueprint"), /*#__PURE__*/React.createElement("ol", {
  className: "cx-steps"
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Measure"), " \u2014 take ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "min(width, height)"), "; the plot is square and centered."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Scale"), " \u2014 ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "scaleArc"), " maps each value to an angular span proportional to the total (start at \u221290\xB0)."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Marks"), " \u2014 one ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Marks.Arc"), " per segment between ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "outerR"), " and ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "innerR"), " (innerR = 0 for pie). 2px surface-colored stroke separates slices."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Center"), " \u2014 render ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "centerSlot"), " (or ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "centerLabel"), ") into the hole via ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "<foreignObject>"), "."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Interaction"), " \u2014 arcs are focusable; hover/focus emits the segment + share to the Tooltip."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Frame"), " \u2014 right-side legend with per-segment share %; wrap in ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "ChartFrame"), ".")), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// app/ui/charts/DonutChart.tsx
export interface DonutChartProps extends ChartBaseProps<ArcDatum> {
  variant?: 'donut' | 'pie';
  innerRatio?: number;                 // 0..1, donut hole
  centerLabel?: { value: string; label: string };
  centerSlot?: React.ReactNode;        // overrides centerLabel
}

export function DonutChart({ data, variant = 'donut', innerRatio = 0.62, centerLabel, centerSlot, colors, ...base }: DonutChartProps) {
  const palette = colors ?? data.map((_, i) => catToken(i));
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ChartFrame {...base} legend={toShareLegend(data, palette, total)} legendPlacement="right">
      {({ width, height }) => {
        const size = Math.min(width, height), cx = width / 2, cy = height / 2;
        const rO = size / 2 - 6, rI = variant === 'pie' ? 0 : rO * innerRatio;
        const arcs = scaleArc(data, total, -Math.PI / 2);
        return (
          <Canvas width={width} height={height} onKeyDown={rovingFocus}>
            {arcs.map((a, i) => <Marks.Arc key={a.label} {...a} cx={cx} cy={cy}
              rO={rO} rI={rI} fill={palette[i]} />)}
            {variant === 'donut' && (centerSlot ?? (centerLabel &&
              <CenterLabel cx={cx} cy={cy} {...centerLabel} />))}
          </Canvas>
        );
      }}
    </ChartFrame>
  );
}`)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "State architecture"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Loading, empty, error and the data state are ", /*#__PURE__*/React.createElement("strong", null, "props on one component"), ", resolved by ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "ChartFrame"), " \u2014 modules never branch into a separate \"no data\" component."), /*#__PURE__*/React.createElement(StateDemo, null), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    overflow: "hidden",
    marginTop: 16
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "State"), /*#__PURE__*/React.createElement("th", null, "Trigger"), /*#__PURE__*/React.createElement("th", null, "Render"), /*#__PURE__*/React.createElement("th", null, "Rule"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Loading")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "state.loading")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Skeleton bars matching the chart's aspect ratio."), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Never a centered spinner inside a chart frame.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Empty")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "data.length === 0")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Em-dash + \"No data in range.\""), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Never render an empty axis frame.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Error")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "state.error")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Inline danger alert + retry affordance."), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Don't show stale data behind an error.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Hover / active")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ":hover / :focus-visible")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Mark emphasis + single Tooltip; ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "onPointHover"), " fires."), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Hover is never the only way to read a value (see a11y table).")))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Accessibility"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Charts are ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "<figure>"), "s with a programmatic data path. Three layers: a hidden data table (canonical SR path), per-mark labels, and roving keyboard focus."), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Concern"), /*#__PURE__*/React.createElement("th", null, "Implementation"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Roles")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "<figure role=\"group\" aria-label>"), " wraps the chart; the SVG is ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "role=\"application\""), " for arrow-key nav; each mark is ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "role=\"img\""), " with an ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-label"), ".")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Hidden data table")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "A visually-hidden ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "<table>"), " (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".sr-only"), ") mirrors the series \u2014 the reliable, verbose path for screen readers. Always present unless ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "a11y.dataTable=false"), ".")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Keyboard nav")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, /*#__PURE__*/React.createElement("kbd", {
  className: "ms-kbd"
}, "Tab"), " enters the plot; ", /*#__PURE__*/React.createElement("kbd", {
  className: "ms-kbd"
}, "\u2190"), /*#__PURE__*/React.createElement("kbd", {
  className: "ms-kbd"
}, "\u2192"), " (and ", /*#__PURE__*/React.createElement("kbd", {
  className: "ms-kbd"
}, "Home"), "/", /*#__PURE__*/React.createElement("kbd", {
  className: "ms-kbd"
}, "End"), ") rove between marks; focus drives the same Tooltip as hover.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Color independence")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Palette is color-blind safe (\u22653:1 adjacent pairs); series are also separated by legend order + tooltip labels, never color alone.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Motion")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Enter/transition animations honor ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "prefers-reduced-motion"), "."))))), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 16
  }
}, /*#__PURE__*/React.createElement("strong", null, "The hidden table is the contract."), " Sighted users get the SVG; assistive tech gets the table. If a chart can't produce a sensible table, it isn't ready to ship.")), /*#__PURE__*/React.createElement("style", null, CHART_CSS));
const CHART_CSS = `
.cx-host { position: relative; }
.cx-frame { margin: 0; }
.cx-frame-title { display: block; margin-bottom: 10px; }
.cx-frame-cap { margin-top: 8px; }
.cx-plotwrap { display: flex; flex-direction: column; }
.cx-plotwrap.is-right { flex-direction: row; align-items: center; gap: 20px; }
.cx-plot { position: relative; width: 100%; }
.cx-plotwrap.is-right .cx-plot { flex: 1; min-width: 0; }
.cx-svg { display: block; overflow: visible; }
.cx-axis-lbl { font-size: 10px; fill: var(--chart-axis-label); font-family: var(--font-mono); }
.cx-cat-lbl { font-size: 10.5px; fill: var(--chart-axis-label); font-family: var(--font-sans); }
.cx-bar { transition: opacity 120ms; outline: none; cursor: pointer; }
.cx-bar:hover, .cx-bar:focus-visible { opacity: .82; }
.cx-bar:focus-visible { stroke: var(--text-primary); stroke-width: 2; }
.cx-dot { transition: r 120ms; outline: none; cursor: pointer; }
.cx-dot:hover, .cx-dot:focus-visible { r: 5.5; }
.cx-dot:focus-visible { stroke-width: 3; }
.cx-arc { outline: none; cursor: pointer; transition: opacity 120ms; }
.cx-arc:hover, .cx-arc:focus-visible { opacity: .85; }
.cx-arc:focus-visible { stroke: var(--text-primary); stroke-width: 2.5; }
.cx-center { display: flex; align-items: center; justify-content: center; height: 100%; text-align: center; }
.cx-center-val { font-size: 22px; font-weight: 700; fill: var(--text-primary); font-family: var(--font-display); }
.cx-center-lbl { font-size: 11px; fill: var(--text-muted); font-family: var(--font-sans); text-transform: uppercase; letter-spacing: .06em; }
/* legend */
.cx-legend { list-style: none; margin: 12px 0 0; padding: 0; display: flex; gap: 8px 16px; flex-wrap: wrap; }
.cx-legend--right { flex-direction: column; margin: 0; gap: 8px; min-width: 130px; flex-shrink: 0; }
.cx-legend-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text-secondary); }
.cx-legend-sw { width: 10px; flex-shrink: 0; display: inline-block; }
.cx-legend--right .cx-legend-lbl { flex: 1; }
.cx-legend-val { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); font-variant-numeric: tabular-nums; }
/* tooltip */
.cx-tip { position: absolute; transform: translate(-50%, -100%); background: var(--bg-inverse); color: var(--text-inverse); border-radius: 6px; padding: 8px 10px; font-size: 12px; box-shadow: var(--card-shadow-hover); pointer-events: none; z-index: 6; white-space: nowrap; min-width: 120px; }
.cx-tip-title { font-weight: 600; margin-bottom: 4px; }
.cx-tip-row { display: flex; align-items: center; gap: 8px; line-height: 1.6; }
.cx-tip-sw { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.cx-tip-k { color: rgba(255,255,255,.72); }
.cx-tip-v { margin-left: auto; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
/* states */
.cx-skeleton { display: flex; gap: 5%; align-items: flex-end; padding: 0 4px; }
.cx-state { display: flex; align-items: center; justify-content: center; }
.cx-empty { flex-direction: column; gap: 4px; }
.cx-empty-dash { font-size: 40px; color: var(--text-disabled); line-height: 1; }
/* segmented control + demo head + steps */
.cx-demo-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.cx-seg { display: inline-flex; gap: 2px; padding: 3px; background: var(--slate-100); border: 1px solid var(--border-subtle); border-radius: 8px; }
.cx-seg-btn { font: inherit; font-size: 12px; font-weight: 600; padding: 5px 12px; border: 0; background: transparent; border-radius: 6px; color: var(--text-secondary); cursor: pointer; transition: background 120ms, color 120ms; }
.cx-seg-btn:hover { color: var(--text-primary); }
.cx-seg-btn.is-active { background: var(--bg-surface); color: var(--brand-600); box-shadow: var(--card-shadow-rest); }
.cx-seg-btn:focus-visible { outline: 0; box-shadow: var(--shadow-focus); }
.cx-steps { margin: 0; padding-left: 20px; display: grid; gap: 8px; font-size: 13.5px; line-height: 1.55; color: var(--text-secondary); }
.cx-steps strong { color: var(--text-primary); }
.ms-kbd { font-family: var(--font-mono); font-size: 11px; line-height: 1; padding: 2px 5px; border-radius: 4px; background: var(--slate-100); border: 1px solid var(--border-default); border-bottom-width: 2px; color: var(--text-secondary); }
@media (max-width: 720px) {
  .cx-plotwrap.is-right { flex-direction: column; align-items: stretch; }
  .cx-legend--right { flex-direction: row; flex-wrap: wrap; }
}
`;
Object.assign(window, {
  ChartsSpec
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-charts.jsx", error: String((e && e.message) || e) }); }

// section-components.jsx
try { (() => {
/* Section 3 — Components: buttons, forms, badges, alerts, cards, tables, tabs, etc. */

const ComponentBlock = ({
  id,
  name,
  purpose,
  variants,
  states,
  rules,
  children
}) => /*#__PURE__*/React.createElement("div", {
  id: id,
  className: "subsection",
  style: {
    marginTop: 48
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, /*#__PURE__*/React.createElement("span", null, name), /*#__PURE__*/React.createElement("span", {
  className: "ord"
}, "component")), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, purpose), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Preview"), /*#__PURE__*/React.createElement("span", {
  className: "meta"
}, "all states \xB7 all variants")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    background: "var(--bg-app)"
  }
}, children), (variants || states || rules) && /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0,
    borderRadius: 0,
    borderTop: "1px solid var(--border-subtle)"
  }
}, /*#__PURE__*/React.createElement("tbody", null, variants && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
  style: {
    width: 120,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: "0.04em"
  }
}, "Variants"), /*#__PURE__*/React.createElement("td", null, variants)), states && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
  style: {
    width: 120,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: "0.04em"
  }
}, "States"), /*#__PURE__*/React.createElement("td", null, states)), rules && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
  style: {
    width: 120,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: "0.04em"
  }
}, "Rules"), /*#__PURE__*/React.createElement("td", null, rules))))));
const ButtonsBlock = () => /*#__PURE__*/React.createElement(ComponentBlock, {
  id: "c-buttons",
  name: "Buttons",
  purpose: "Trigger actions. One primary per surface; secondary actions are quieter; destructive actions use the danger variant only when the action cannot be undone safely.",
  variants: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "primary"), " \xB7 ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "secondary"), " \xB7 ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "ghost"), " \xB7 ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "danger"), " \xB7 ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "link")),
  states: /*#__PURE__*/React.createElement(React.Fragment, null, "default \xB7 hover \xB7 active \xB7 disabled \xB7 loading \xB7 focus-visible"),
  rules: /*#__PURE__*/React.createElement(React.Fragment, null, "Heights snap to ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "24 / 28 / 32 / 40px"), ". Icon-only buttons are square. Never stack > 3 buttons in a row \u2014 collapse into a menu.")
}, /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 24
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "row"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.plus
}), " New portfolio"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary"
}, "Cancel"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost"
}, "More"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--danger"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.trash
}), " Delete"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--link"
}, "View report \u2192")), /*#__PURE__*/React.createElement("div", {
  className: "row"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary ds-btn--xs"
}, "xs"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary ds-btn--sm"
}, "sm"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary ds-btn--md"
}, "md (default)"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary ds-btn--lg"
}, "lg"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--icon"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.edit
})), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--icon ds-btn--sm"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.more
}))), /*#__PURE__*/React.createElement("div", {
  className: "row"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary",
  disabled: true
}, "Disabled"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary",
  disabled: true
}, "Disabled"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-skel",
  style: {
    width: 14,
    height: 14,
    borderRadius: "50%"
  }
}), " Saving\u2026")), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    fontSize: 12
  }
}, /*#__PURE__*/React.createElement("strong", null, "Hierarchy rule:"), " Primary on the right of a row, Secondary to its left, destructive at the far left or in an overflow menu. Cancel is always Secondary, never a separate variant.")));
const FormsBlock = () => /*#__PURE__*/React.createElement(ComponentBlock, {
  id: "c-forms",
  name: "Inputs, Selects, Textareas",
  purpose: "All text input controls share one shell so they can be combined inside FormField groups.",
  variants: /*#__PURE__*/React.createElement(React.Fragment, null, "text \xB7 select \xB7 textarea \xB7 search \xB7 number \xB7 password"),
  states: /*#__PURE__*/React.createElement(React.Fragment, null, "default \xB7 hover \xB7 focus \xB7 disabled \xB7 readonly \xB7 invalid \xB7 with prefix / suffix"),
  rules: /*#__PURE__*/React.createElement(React.Fragment, null, "Height ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "32px"), " default; ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "40px"), " for primary forms. Always paired with a Label and optional Help text. Errors appear below the field, never as a tooltip.")
}, /*#__PURE__*/React.createElement("div", {
  className: "grid-2",
  style: {
    gap: 24
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "IMO number ", /*#__PURE__*/React.createElement("span", {
  className: "ds-field-required"
}, "*")), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  placeholder: "e.g. 9123456",
  defaultValue: "9123456"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-field-help"
}, "7-digit International Maritime Organization number.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Vessel type"), /*#__PURE__*/React.createElement("select", {
  className: "ds-input ds-select",
  defaultValue: "bulk"
}, /*#__PURE__*/React.createElement("option", {
  value: "bulk"
}, "Bulk carrier"), /*#__PURE__*/React.createElement("option", {
  value: "tanker"
}, "Tanker"), /*#__PURE__*/React.createElement("option", {
  value: "container"
}, "Container"))), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Search"), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative"
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.search,
  size: 14,
  stroke: "var(--text-muted)",
  className: "ico-14"
}), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  placeholder: "Search vessels, regions, policies\u2026",
  style: {
    paddingLeft: 32
  }
}), /*#__PURE__*/React.createElement("span", {
  style: {
    position: "absolute",
    left: 10,
    top: 9,
    color: "var(--text-muted)",
    pointerEvents: "none"
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.search,
  size: 14,
  stroke: "currentColor"
})))), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Effective date"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  type: "text",
  defaultValue: "2026-04-29"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Notes"), /*#__PURE__*/React.createElement("textarea", {
  className: "ds-input",
  style: {
    height: 72,
    padding: 8,
    resize: "vertical"
  },
  placeholder: "Optional context for the underwriter\u2026"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Premium (USD)"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "\u2212250",
  "aria-invalid": "true"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-field-error"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.alert,
  size: 12
}), " Must be a positive number.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Disabled"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "Read only",
  disabled: true
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Toggles & checks"), /*#__PURE__*/React.createElement("div", {
  className: "row",
  style: {
    gap: 16
  }
}, /*#__PURE__*/React.createElement("label", {
  className: "row",
  style: {
    gap: 6,
    fontSize: 13
  }
}, /*#__PURE__*/React.createElement("input", {
  type: "checkbox",
  className: "ds-check",
  defaultChecked: true
}), " Active"), /*#__PURE__*/React.createElement("label", {
  className: "row",
  style: {
    gap: 6,
    fontSize: 13
  }
}, /*#__PURE__*/React.createElement("input", {
  type: "checkbox",
  className: "ds-check"
}), " Archived"), /*#__PURE__*/React.createElement("label", {
  className: "row",
  style: {
    gap: 6,
    fontSize: 13
  }
}, /*#__PURE__*/React.createElement("input", {
  type: "radio",
  name: "r",
  className: "ds-radio",
  defaultChecked: true
}), " Daily"), /*#__PURE__*/React.createElement("label", {
  className: "row",
  style: {
    gap: 6,
    fontSize: 13
  }
}, /*#__PURE__*/React.createElement("input", {
  type: "radio",
  name: "r",
  className: "ds-radio"
}), " Weekly"), /*#__PURE__*/React.createElement("button", {
  role: "switch",
  "aria-checked": "true",
  className: "ds-switch"
}), /*#__PURE__*/React.createElement("button", {
  role: "switch",
  "aria-checked": "false",
  className: "ds-switch"
})))));
const BadgesBlock = () => /*#__PURE__*/React.createElement(ComponentBlock, {
  id: "c-badges",
  name: "Badges & Status",
  purpose: "Inline labels for status, count and category. Risk ratings (A\u2013E) are a distinct, locked-down primitive.",
  variants: /*#__PURE__*/React.createElement(React.Fragment, null, "neutral \xB7 info \xB7 success \xB7 warning \xB7 danger \xB7 with dot \xB7 risk-rating"),
  rules: /*#__PURE__*/React.createElement(React.Fragment, null, "Tone is semantic, not decorative. Use neutral for counts; reserve color tones for genuine status.")
}, /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "row"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--neutral"
}, "Draft"), /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--info ds-badge--dot"
}, "In review"), /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--success ds-badge--dot"
}, "Compliant"), /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--warning ds-badge--dot"
}, "At risk"), /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--danger ds-badge--dot"
}, "Sanctioned"), /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--neutral"
}, "42 vessels")), /*#__PURE__*/React.createElement("div", {
  className: "row"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-rating ds-rating--a"
}, "A"), /*#__PURE__*/React.createElement("span", {
  className: "ds-rating ds-rating--b"
}, "B"), /*#__PURE__*/React.createElement("span", {
  className: "ds-rating ds-rating--c"
}, "C"), /*#__PURE__*/React.createElement("span", {
  className: "ds-rating ds-rating--d"
}, "D"), /*#__PURE__*/React.createElement("span", {
  className: "ds-rating ds-rating--e"
}, "E"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "PSC compliance grades \u2014 tied to ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rating-*")))));
const AlertsBlock = () => /*#__PURE__*/React.createElement(ComponentBlock, {
  id: "c-alerts",
  name: "Alerts & Banners",
  purpose: "Persistent feedback for the current surface. Toasts (transient) are a separate component.",
  variants: /*#__PURE__*/React.createElement(React.Fragment, null, "info \xB7 success \xB7 warning \xB7 danger"),
  rules: /*#__PURE__*/React.createElement(React.Fragment, null, "Always lead with a short ", /*#__PURE__*/React.createElement("em", null, "title"), ", then a sentence of context. Include a primary action when one exists; never two CTAs.")
}, /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-alert ds-alert--info"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.info,
  className: "ds-alert-icon",
  stroke: "var(--info-700)"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-body"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-title"
}, "Region data refreshed"), "13 new vessels matched your North Atlantic filter set.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-alert ds-alert--success"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.check,
  className: "ds-alert-icon",
  stroke: "var(--success-700)"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-body"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-title"
}, "Policy saved"), "Policy #44721 was added to ", /*#__PURE__*/React.createElement("em", null, "Atlantic Hull Programme 2026"), ".")), /*#__PURE__*/React.createElement("div", {
  className: "ds-alert ds-alert--warning"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.warn,
  className: "ds-alert-icon",
  stroke: "var(--warning-700)"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-body"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-title"
}, "Severe weather along voyage"), "Force 9 conditions forecast crossing the planned route within 24h.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-alert ds-alert--danger"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.alert,
  className: "ds-alert-icon",
  stroke: "var(--danger-700)"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-body"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-title"
}, "Sanctioned vessel detected"), "1 vessel in this portfolio matches the OFAC SDN list. Action required."))));
const CardsBlock = () => /*#__PURE__*/React.createElement(ComponentBlock, {
  id: "c-cards",
  name: "Cards",
  purpose: "Group related content on dashboards and detail pages. Cards never nest more than one level deep.",
  variants: /*#__PURE__*/React.createElement(React.Fragment, null, "plain \xB7 stat \xB7 list \xB7 with footer actions"),
  rules: /*#__PURE__*/React.createElement(React.Fragment, null, "Single border + ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "shadow-xs"), ". Card title is H3 / 16px. Internal padding 16px (or 24px on dashboards). Footer actions are ", /*#__PURE__*/React.createElement("strong", null, "ghost (tertiary) buttons only, in ALL CAPS"), " \u2014 never a filled primary inside a card foot.")
}, /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 24
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "grid-3"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Vessels at risk"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "Today")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "baseline",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "t-display"
}, "23"), /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--danger ds-badge--dot"
}, "+4")), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "across 6 portfolios"))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Compliance score")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "baseline",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "t-display"
}, "94", /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 20,
    color: "var(--text-muted)"
  }
}, "%")), /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--success ds-badge--dot"
}, "+1.2")), /*#__PURE__*/React.createElement("div", {
  className: "ds-progress",
  style: {
    marginTop: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: "94%"
  }
})))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Recent activity"), /*#__PURE__*/React.createElement("a", {
  className: "ds-btn ds-btn--link"
}, "View all")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    padding: 0
  }
}, ["Policy #44721 added", "Region NA-04 updated", "M/V Stratos flagged"].map((t, i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    borderTop: i ? "1px solid var(--border-subtle)" : 0,
    fontSize: 13
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-avatar",
  style: {
    width: 22,
    height: 22,
    fontSize: 10
  }
}, "JL"), /*#__PURE__*/React.createElement("span", {
  style: {
    flex: 1
  }
}, t), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "2m")))))), /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)"
  }
}, "Card footers \u2014 ghost (tertiary) buttons, ALL CAPS"), /*#__PURE__*/React.createElement("div", {
  className: "grid-3"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Sanctions review")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    color: "var(--text-secondary)",
    lineHeight: 1.55
  }
}, "M/V Stratos matched a watchlist entry. Confirm before the policy can bind."), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-foot"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost ds-btn--sm"
}, "Dismiss"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost ds-btn--sm"
}, "Review"))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Voyage export")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    color: "var(--text-secondary)",
    lineHeight: 1.55
  }
}, "42 voyages in the current filter. Export a CSV for the underwriting committee."), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-foot ds-card-foot--between"
}, /*#__PURE__*/React.createElement("span", {
  className: "t-caption",
  style: {
    textTransform: "none"
  }
}, "Updated 2m ago"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost ds-btn--sm"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.download
}), " Export"))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Region NA-04")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    color: "var(--text-secondary)",
    lineHeight: 1.55
  }
}, "3 vessels added since your last visit. Open the region to review the updated roster."), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-foot ds-card-foot--start"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost ds-btn--sm"
}, "Open region")))))));
const MetricCardsBlock = () => /*#__PURE__*/React.createElement(ComponentBlock, {
  id: "c-metrics",
  name: "Metric cards & stat strips",
  purpose: "Surface key numbers at the top of a view. One glance should tell the underwriter what's happening \u2014 value, unit and direction.",
  variants: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "metric strip"), " \xB7 ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "single stat card"), " \xB7 ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "stat + delta")),
  rules: /*#__PURE__*/React.createElement(React.Fragment, null, "Always abbreviate at scale: ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "4,932"), " stays as-is; ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "$605,200,000"), " becomes ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "$605.2M"), ". Use 1 decimal place for abbreviated values. Currency: prefix ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "$"), ", right-align in tables, brand-colored in strips. Counts: no symbol, neutral ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "text-primary"), " unless the number signals risk (then use danger color). Label is 11\u201312 px muted, always above the value \u2014 never below. Strip background: ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "brand-050"), " with ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "brand-100"), " borders. Max 4 metrics per strip before it wraps to a 2\xD72 grid. Delta badges show change vs. prior period; up = danger (risk increasing), down = success (risk decreasing).")
}, /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 32
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)"
  }
}, "Metric strip \u2014 2-up"), /*#__PURE__*/React.createElement("div", {
  className: "ds-metric-strip"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-metric"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-label"
}, "Total Policies"), /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-value ds-metric-value--neutral"
}, "4,932")), /*#__PURE__*/React.createElement("div", {
  className: "ds-metric"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-label"
}, "Total Exposure"), /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-value"
}, "$605.2B")))), /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)"
  }
}, "Metric strip \u2014 4-up with deltas"), /*#__PURE__*/React.createElement("div", {
  className: "ds-metric-strip"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-metric"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-label"
}, "Active Vessels"), /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-value ds-metric-value--neutral"
}, "1,204"), /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-delta up"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.arrowUp,
  size: 11
}), "+23 this week")), /*#__PURE__*/React.createElement("div", {
  className: "ds-metric"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-label"
}, "High Risk"), /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-value ds-metric-value--danger"
}, "87"), /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-delta up"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.arrowUp,
  size: 11
}), "+4 today")), /*#__PURE__*/React.createElement("div", {
  className: "ds-metric"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-label"
}, "Compliance Score"), /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-value ds-metric-value--success"
}, "94%"), /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-delta down"
}, /*#__PURE__*/React.createElement("svg", {
  width: 11,
  height: 11,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 5v14m7-7-7 7-7-7"
})), "\u22120.4 vs last month")), /*#__PURE__*/React.createElement("div", {
  className: "ds-metric"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-label"
}, "Total Exposure"), /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-value"
}, "$2.1T"), /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-delta",
  style: {
    color: "var(--text-muted)"
  }
}, "\u2014 unchanged")))), /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)"
  }
}, "Individual stat cards"), /*#__PURE__*/React.createElement("div", {
  className: "grid-3"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Vessels at risk"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "Live")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-value ds-metric-value--danger",
  style: {
    fontSize: 32
  }
}, "23"), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 6,
    display: "flex",
    alignItems: "center",
    gap: 6
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--danger"
}, "+4 today"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "across 6 portfolios")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Total Exposure"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "All portfolios")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-value",
  style: {
    fontSize: 32
  }
}, "$605.2B"), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 6
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "$360.8B marine hull \xB7 $244.4B other")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Compliance score"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "This quarter")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "baseline",
    gap: 6
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-metric-value ds-metric-value--success",
  style: {
    fontSize: 32
  }
}, "94", /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 18,
    fontWeight: 500
  }
}, "%")), /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--success"
}, "\u2191 +1.2")), /*#__PURE__*/React.createElement("div", {
  className: "ds-progress",
  style: {
    marginTop: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: "94%"
  }
})))))), /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)"
  }
}, "Number formatting reference"), /*#__PURE__*/React.createElement("div", {
  className: "ds-card",
  style: {
    overflow: "hidden",
    padding: 0
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "ds-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Raw value"), /*#__PURE__*/React.createElement("th", null, "Display as"), /*#__PURE__*/React.createElement("th", null, "Notes"))), /*#__PURE__*/React.createElement("tbody", null, [["4,932", "4,932", "Under 10K — show exact with comma separator"], ["$605,200,000", "$605.2M", "Abbreviate ≥ 1M; 1 decimal place"], ["$2,100,000,000,000", "$2.1T", "Abbreviate ≥ 1B → B; ≥ 1T → T"], ["0.9412", "94%", "Percentages: 0 decimal places unless < 10%"], ["−0.004 change", "−0.4%", "Deltas: always show sign + 1 decimal"], ["87 (risk count)", "87", "Counts: no abbreviation under 10K"]].map(([raw, display, note]) => /*#__PURE__*/React.createElement("tr", {
  key: raw
}, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  style: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--text-muted)"
  }
}, raw)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", {
  style: {
    fontVariantNumeric: "tabular-nums"
  }
}, display)), /*#__PURE__*/React.createElement("td", {
  style: {
    color: "var(--text-secondary)",
    fontSize: 12
  }
}, note)))))))));
const TablesBlock = () => {
  const cols = [{
    key: "name",
    label: "Vessel",
    num: false,
    width: undefined
  }, {
    key: "imo",
    label: "IMO",
    num: false,
    width: 120
  }, {
    key: "flag",
    label: "Flag",
    num: false,
    width: 90
  }, {
    key: "risk",
    label: "Risk",
    num: false,
    width: 90
  }, {
    key: "status",
    label: "Status",
    num: false,
    width: 140
  }, {
    key: "sum",
    label: "Sum insured",
    num: true,
    width: 130
  }];
  const baseRows = [{
    name: "M/V Stratos",
    imo: "9472183",
    flag: "MT",
    risk: "A",
    status: "Compliant",
    sum: 28_400_000
  }, {
    name: "Aegean Pioneer",
    imo: "9301847",
    flag: "GR",
    risk: "B",
    status: "In review",
    sum: 14_900_000
  }, {
    name: "Bristol Endeavour",
    imo: "9618742",
    flag: "GB",
    risk: "C",
    status: "At risk",
    sum: 19_500_000
  }, {
    name: "Norwegian Beacon",
    imo: "9510938",
    flag: "NO",
    risk: "A",
    status: "Compliant",
    sum: 31_200_000
  }, {
    name: "Helios Carrier",
    imo: "9432751",
    flag: "PA",
    risk: "E",
    status: "Sanctioned",
    sum: 12_700_000
  }];
  // null → ascending → descending → null. Numeric columns open descending.
  const [sort, setSort] = React.useState({
    key: "sum",
    dir: "desc"
  });
  const cycle = (key, num) => setSort(s => {
    const first = num ? "desc" : "asc";
    const second = num ? "asc" : "desc";
    if (s.key !== key) return {
      key,
      dir: first
    };
    if (s.dir === first) return {
      key,
      dir: second
    };
    return {
      key: null,
      dir: null
    };
  });
  const rows = React.useMemo(() => {
    if (!sort.key) return baseRows;
    return [...baseRows].sort((a, b) => {
      const av = a[sort.key],
        bv = b[sort.key];
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [sort]);
  const ariaFor = key => sort.key !== key ? "none" : sort.dir === "asc" ? "ascending" : "descending";
  return /*#__PURE__*/React.createElement(ComponentBlock, {
    id: "c-tables",
    name: "Tables",
    purpose: "The most-used surface in this product. Density is critical: an underwriter scans 200+ rows per session.",
    variants: /*#__PURE__*/React.createElement(React.Fragment, null, "default \xB7 compact \xB7 comfy \xB7 with selection \xB7 sortable header"),
    rules: /*#__PURE__*/React.createElement(React.Fragment, null, "One implementation only \u2014 replaces the four current variants. Sticky header, alternating-row backgrounds removed in favor of subtle hover highlight. Numeric columns right-aligned with ", /*#__PURE__*/React.createElement("code", {
      className: "inline"
    }, "tabular-nums"), ". Every column header is a sort control \u2014 click to cycle ", /*#__PURE__*/React.createElement("em", null, "ascending \u2192 descending \u2192 unsorted"), "; the ", /*#__PURE__*/React.createElement(Icon, {
      d: I.sort,
      size: 11,
      className: "inline-ico"
    }), " glyph is always visible so columns read as sortable, and turns into a solid ", /*#__PURE__*/React.createElement(Icon, {
      d: I.arrowDown,
      size: 11,
      className: "inline-ico"
    }), " on the active column. Headers carry ", /*#__PURE__*/React.createElement("code", {
      className: "inline"
    }, "aria-sort"), " for screen readers.")
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-card",
    style: {
      overflow: "hidden",
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      borderBottom: "1px solid var(--border-subtle)",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ds-card-title",
    style: {
      flex: 1
    }
  }, "Portfolio \xB7 Atlantic Hull Programme 2026"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--ghost ds-btn--sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.filter
  }), " Filter"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.download
  }), " Export")), /*#__PURE__*/React.createElement("table", {
    className: "ds-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: 28
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    className: "ds-check"
  })), cols.map(c => {
    const active = sort.key === c.key;
    return /*#__PURE__*/React.createElement("th", {
      key: c.key,
      scope: "col",
      style: c.width ? {
        width: c.width
      } : undefined,
      className: `ds-th--sortable${active ? " ds-th--active" : ""}`,
      "aria-sort": ariaFor(c.key)
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: `ds-th-sort${c.num ? " num" : ""}`,
      onClick: () => cycle(c.key, c.num),
      title: `Sort by ${c.label}`
    }, c.label, /*#__PURE__*/React.createElement("span", {
      className: "ds-sort-ind"
    }, /*#__PURE__*/React.createElement(Icon, {
      d: active ? sort.dir === "asc" ? I.arrowUp : I.arrowDown : I.sort,
      size: 12
    }))));
  }), /*#__PURE__*/React.createElement("th", {
    style: {
      width: 60
    }
  }))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.imo
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    className: "ds-check"
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, r.name)), /*#__PURE__*/React.createElement("td", {
    className: "t-mono",
    style: {
      fontSize: 12
    }
  }, r.imo), /*#__PURE__*/React.createElement("td", null, r.flag), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `ds-rating ds-rating--${r.risk.toLowerCase()}`
  }, r.risk)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `ds-badge ds-badge--${r.status === "Compliant" ? "success" : r.status === "In review" ? "info" : r.status === "At risk" ? "warning" : "danger"} ds-badge--dot`
  }, r.status)), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, "$", r.sum.toLocaleString()), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--ghost ds-btn--icon ds-btn--sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.more
  }))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 12px",
      borderTop: "1px solid var(--border-subtle)",
      background: "var(--slate-50)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-caption"
  }, "Live \u2014 click any header to sort. First click sorts (numeric columns open descending), a second reverses, a third returns to the default order."))));
};
const NavTabsBlock = () => {
  const [activeTab, setActiveTab] = React.useState("Overview");
  const tabs = ["Overview", "Voyages", "Casualties", "Compliance", "Documents"];
  const motion = window.Motion || window.framerMotion || window.FramerMotion;
  const M = motion ? motion.motion : null;
  return /*#__PURE__*/React.createElement(ComponentBlock, {
    id: "c-tabs",
    name: "Tabs, Breadcrumbs & Page header",
    purpose: "Top-of-page navigation primitives. Tabs switch views within a single resource; breadcrumbs show hierarchy."
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px 0",
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "ds-btn ds-btn--link",
    style: {
      fontSize: 12
    }
  }, "Portfolios"), /*#__PURE__*/React.createElement(Icon, {
    d: I.chevronRight,
    size: 12
  }), /*#__PURE__*/React.createElement("a", {
    className: "ds-btn ds-btn--link",
    style: {
      fontSize: 12
    }
  }, "Atlantic Hull 2026"), /*#__PURE__*/React.createElement(Icon, {
    d: I.chevronRight,
    size: 12
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-primary)",
      fontWeight: 500
    }
  }, "M/V Stratos")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 20px 16px",
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "t-h1",
    style: {
      flex: 1,
      margin: 0
    }
  }, "M/V Stratos"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.download
  }), " Export PDF"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--primary"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.flag
  }), " Flag for review")), /*#__PURE__*/React.createElement("div", {
    className: "ds-tabs",
    style: {
      margin: "0 20px 16px"
    }
  }, tabs.map(tab => {
    const isActive = activeTab === tab;
    return /*#__PURE__*/React.createElement("button", {
      key: tab,
      className: "ds-tab",
      "aria-selected": isActive,
      onClick: () => setActiveTab(tab)
    }, isActive && M && /*#__PURE__*/React.createElement(M.span, {
      key: "pill",
      layoutId: "ds-tab-pill",
      className: "ds-tab-pill",
      transition: {
        type: "spring",
        bounce: 0.2,
        duration: 0.6
      }
    }), /*#__PURE__*/React.createElement("span", {
      key: "label",
      className: "ds-tab-label"
    }, tab));
  }))));
};
const OverlayBlock = () => /*#__PURE__*/React.createElement(ComponentBlock, {
  id: "c-overlays",
  name: "Modals, Drawers, Popovers, Tooltips",
  purpose: "Surfaces that overlay the page. Modals block; drawers and popovers don't.",
  rules: /*#__PURE__*/React.createElement(React.Fragment, null, "Modal width ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "480 / 640 / 800px"), ". Drawer width ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "400 / 560 / 720px"), " from right. Tooltip max-width ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "240px"), ".")
}, /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "surface",
  style: {
    padding: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "surface-toolbar"
}, /*#__PURE__*/React.createElement("span", {
  className: "dot r"
}), /*#__PURE__*/React.createElement("span", {
  className: "dot y"
}), /*#__PURE__*/React.createElement("span", {
  className: "dot g"
}), /*#__PURE__*/React.createElement("span", {
  style: {
    marginLeft: 8
  }
}, "modal \xB7 480px")), /*#__PURE__*/React.createElement("div", {
  style: {
    background: "rgba(15,23,42,0.4)",
    padding: "20px 24px",
    display: "grid",
    placeItems: "center",
    minHeight: 240
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    background: "white",
    width: 380,
    borderRadius: 8,
    boxShadow: "var(--shadow-xl)",
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "16px 20px",
    borderBottom: "1px solid var(--border-subtle)",
    display: "flex",
    alignItems: "center"
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title",
  style: {
    flex: 1
  }
}, "Delete portfolio?"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost ds-btn--icon ds-btn--sm"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.x
}))), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "16px 20px",
    fontSize: 13,
    color: "var(--text-secondary)"
  }
}, "This will permanently remove ", /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--text-primary)"
  }
}, "Atlantic Hull 2026"), ", its 142 policies, and all associated voyage data. This cannot be undone."), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "12px 20px",
    borderTop: "1px solid var(--border-subtle)",
    background: "var(--slate-50)",
    display: "flex",
    justifyContent: "flex-end",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary"
}, "Cancel"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--danger"
}, "Delete portfolio"))))), /*#__PURE__*/React.createElement("div", {
  className: "surface",
  style: {
    padding: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "surface-toolbar"
}, /*#__PURE__*/React.createElement("span", {
  className: "dot r"
}), /*#__PURE__*/React.createElement("span", {
  className: "dot y"
}), /*#__PURE__*/React.createElement("span", {
  className: "dot g"
}), /*#__PURE__*/React.createElement("span", {
  style: {
    marginLeft: 8
  }
}, "popover \xB7 tooltip \xB7 empty state")), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 24,
    display: "grid",
    gap: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    display: "inline-block",
    width: "fit-content"
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.filter
}), " Filters"), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    top: 38,
    left: 0,
    width: 280,
    background: "white",
    border: "1px solid var(--border-default)",
    borderRadius: 6,
    boxShadow: "var(--shadow-md)",
    padding: 12,
    zIndex: 2
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 8
  }
}, "Filter vessels"), /*#__PURE__*/React.createElement("div", {
  className: "ds-field",
  style: {
    gap: 4
  }
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label",
  style: {
    fontSize: 11
  }
}, "Risk grade"), /*#__PURE__*/React.createElement("select", {
  className: "ds-input ds-select",
  style: {
    height: 28,
    fontSize: 12
  }
}, /*#__PURE__*/React.createElement("option", null, "All"))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 8,
    marginTop: 12,
    justifyContent: "flex-end"
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost ds-btn--sm"
}, "Reset"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary ds-btn--sm"
}, "Apply")))), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    display: "inline-block",
    marginTop: 80
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.info
}), " hover me"), /*#__PURE__*/React.createElement("div", {
  className: "ds-tooltip",
  style: {
    top: -32,
    left: "50%",
    transform: "translateX(-50%)"
  }
}, "Risk score updated 4m ago")), /*#__PURE__*/React.createElement("div", {
  className: "ds-empty"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-empty-icon"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.folder,
  size: 20
})), /*#__PURE__*/React.createElement("h4", null, "No vessels match these filters"), /*#__PURE__*/React.createElement("p", null, "Try widening the risk range or removing the flag filter."), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm"
}, "Reset filters"))))), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 16
  }
}, /*#__PURE__*/React.createElement("strong", null, "Modals are a standardized component."), " See the live, tokenized ", /*#__PURE__*/React.createElement("a", {
  href: "#c-modal",
  style: {
    color: "var(--brand-600)",
    fontWeight: 600
  }
}, "Modal \u2014 full specification"), " for the production API, slots, sizes and accessibility."));
const LoadingBlock = () => /*#__PURE__*/React.createElement(ComponentBlock, {
  id: "c-loading",
  name: "Loading & Skeleton states",
  purpose: "Never block the user with a full-page spinner. Skeleton frames mirror final layout so perceived load time is short.",
  rules: /*#__PURE__*/React.createElement(React.Fragment, null, "Tables and cards have skeleton variants. Use a thin top progress bar for navigation. Spinners only appear inside buttons / row actions.")
}, /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-skel",
  style: {
    width: 120
  }
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    display: "grid",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-skel",
  style: {
    width: "70%"
  }
}), /*#__PURE__*/React.createElement("span", {
  className: "ds-skel",
  style: {
    width: "90%"
  }
}), /*#__PURE__*/React.createElement("span", {
  className: "ds-skel",
  style: {
    width: "50%"
  }
}))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("table", {
  className: "ds-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Vessel"), /*#__PURE__*/React.createElement("th", null, "IMO"), /*#__PURE__*/React.createElement("th", null, "Risk"))), /*#__PURE__*/React.createElement("tbody", null, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("tr", {
  key: i
}, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "ds-skel",
  style: {
    width: 140
  }
})), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "ds-skel",
  style: {
    width: 80
  }
})), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "ds-skel",
  style: {
    width: 24,
    height: 16
  }
})))))))));
const PaginationBlock = () => /*#__PURE__*/React.createElement(ComponentBlock, {
  id: "c-pagination",
  name: "Pagination",
  purpose: "Navigates large datasets across pages. Always paired with a results summary so the user knows their position in the set.",
  variants: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "default"), " \xB7 ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "compact"), " \xB7 ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "table-footer")),
  states: /*#__PURE__*/React.createElement(React.Fragment, null, "default \xB7 hover \xB7 active (current page) \xB7 disabled (prev on page 1 / next on last page)"),
  rules: /*#__PURE__*/React.createElement(React.Fragment, null, "Show page numbers when total pages \u2264 7; collapse middle pages with an ellipsis beyond that. Minimum hit target ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "32\xD732px"), ". Always show a results count (", /*#__PURE__*/React.createElement("em", null, "\"1\u201325 of 847 results\""), "). Never use pagination for infinite-scroll surfaces \u2014 use a \"Load more\" button instead.")
}, /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 32
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 4
  }
}, "Default"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 13,
    color: "var(--text-muted)"
  }
}, "1\u201325 of 847 results"), /*#__PURE__*/React.createElement("nav", {
  className: "ds-pagination",
  "aria-label": "Pagination"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn",
  disabled: true,
  "aria-label": "Previous page"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronLeft,
  size: 14
})), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn is-active",
  "aria-current": "page"
}, "1"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn"
}, "2"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn"
}, "3"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn"
}, "4"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn"
}, "5"), /*#__PURE__*/React.createElement("span", {
  className: "ds-page-ellipsis"
}, "\u2026"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn"
}, "34"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn",
  "aria-label": "Next page"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronRight,
  size: 14
}))))), /*#__PURE__*/React.createElement("hr", {
  className: "section-hr",
  style: {
    margin: "0"
  }
}), /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 4
  }
}, "Compact"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 13,
    color: "var(--text-muted)"
  }
}, "26\u201350 of 847 results"), /*#__PURE__*/React.createElement("div", {
  className: "ds-pagination--compact"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn",
  "aria-label": "Previous page"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronLeft,
  size: 14
})), /*#__PURE__*/React.createElement("span", {
  className: "page-label"
}, "Page ", /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--text-primary)"
  }
}, "2"), " of 34"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn",
  "aria-label": "Next page"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronRight,
  size: 14
}))))), /*#__PURE__*/React.createElement("hr", {
  className: "section-hr",
  style: {
    margin: "0"
  }
}), /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 4
  }
}, "Table footer"), /*#__PURE__*/React.createElement("div", {
  className: "ds-card",
  style: {
    overflow: "hidden",
    padding: 0
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "ds-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Vessel"), /*#__PURE__*/React.createElement("th", null, "IMO"), /*#__PURE__*/React.createElement("th", null, "Flag"), /*#__PURE__*/React.createElement("th", null, "Risk"))), /*#__PURE__*/React.createElement("tbody", null, [["M/V Stratos", "9801234", "Panama", "medium"], ["M/V Oceanus", "9712345", "Liberia", "high"], ["M/V Nereid", "9623456", "Malta", "low"], ["M/V Tethys", "9534567", "Bahamas", "medium"]].map(([vessel, imo, flag, risk]) => /*#__PURE__*/React.createElement("tr", {
  key: imo
}, /*#__PURE__*/React.createElement("td", {
  style: {
    fontWeight: 500
  }
}, vessel), /*#__PURE__*/React.createElement("td", {
  style: {
    fontFamily: "var(--font-mono)",
    fontSize: 12
  }
}, imo), /*#__PURE__*/React.createElement("td", null, flag), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: `ds-badge ds-badge--${risk === "high" ? "danger" : risk === "medium" ? "warning" : "success"}`
}, risk)))))), /*#__PURE__*/React.createElement("div", {
  className: "ds-pagination-wrap"
}, /*#__PURE__*/React.createElement("span", null, "Showing 1\u20134 of 847 vessels"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 16
  }
}, /*#__PURE__*/React.createElement("label", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 6
  }
}, "Rows per page", /*#__PURE__*/React.createElement("select", {
  className: "ds-input",
  style: {
    height: 28,
    width: "auto",
    padding: "0 8px",
    fontSize: 13
  }
}, /*#__PURE__*/React.createElement("option", null, "25"), /*#__PURE__*/React.createElement("option", null, "50"), /*#__PURE__*/React.createElement("option", null, "100"))), /*#__PURE__*/React.createElement("nav", {
  className: "ds-pagination",
  "aria-label": "Table pagination"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn",
  disabled: true,
  "aria-label": "Previous"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronLeft,
  size: 14
})), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn is-active"
}, "1"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn"
}, "2"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn"
}, "3"), /*#__PURE__*/React.createElement("span", {
  className: "ds-page-ellipsis"
}, "\u2026"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn"
}, "34"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn",
  "aria-label": "Next"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronRight,
  size: 14
}))))))), /*#__PURE__*/React.createElement("hr", {
  className: "section-hr",
  style: {
    margin: "0"
  }
}), /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)"
  }
}, "Mobile \xB7 < 640px"), /*#__PURE__*/React.createElement("p", {
  style: {
    margin: 0,
    fontSize: 13,
    color: "var(--text-secondary)",
    maxWidth: 720
  }
}, "Numbered page lists don't fit and the hit targets are too small. Collapse to a stacked layout with prev / next as the primary controls, a page-of-total label, and an optional \"jump to page\" sheet for deep result sets. Hit targets are ", /*#__PURE__*/React.createElement("strong", null, "44\xD744 px"), " minimum."), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    alignItems: "start"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--success-700)",
    letterSpacing: "0.06em",
    textTransform: "uppercase"
  }
}, "Do \u2014 stacked controls"), /*#__PURE__*/React.createElement("div", {
  style: {
    width: 360,
    maxWidth: "100%",
    margin: "0 auto",
    border: "8px solid #1F2937",
    borderRadius: 28,
    overflow: "hidden",
    background: "var(--white)"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    height: 28,
    background: "var(--white)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 18px",
    fontSize: 11,
    fontWeight: 600
  }
}, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
  style: {
    display: "flex",
    gap: 4,
    alignItems: "center",
    color: "var(--text-primary)"
  }
}, "\u25CF \u25CF \u25CF")), /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--bg-app)",
    padding: "12px 16px",
    display: "grid",
    gap: 10
  }
}, [["M/V Stratos", "Panama · medium"], ["M/V Oceanus", "Liberia · high"], ["M/V Nereid", "Malta · low"]].map(([v, m]) => /*#__PURE__*/React.createElement("div", {
  key: v,
  className: "ds-card",
  style: {
    padding: "10px 12px"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    fontWeight: 600
  }
}, v), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: "var(--text-muted)"
  }
}, m)))), /*#__PURE__*/React.createElement("div", {
  style: {
    borderTop: "1px solid var(--border-subtle)",
    background: "var(--slate-50)",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 12,
    color: "var(--text-muted)"
  }
}, /*#__PURE__*/React.createElement("span", null, "1\u201325 of 847"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--link",
  style: {
    fontSize: 12
  }
}, "Jump to page\u2026")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary",
  style: {
    flex: 1,
    height: 44,
    justifyContent: "center"
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronLeft,
  size: 16
}), " Prev"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 16px",
    minWidth: 86,
    background: "var(--white)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-md)",
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums"
  }
}, "1 / 34"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary",
  style: {
    flex: 1,
    height: 44,
    justifyContent: "center"
  }
}, "Next ", /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronRight,
  size: 16
})))))), /*#__PURE__*/React.createElement("div", {
  className: "col",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--danger-700)",
    letterSpacing: "0.06em",
    textTransform: "uppercase"
  }
}, "Don't \u2014 desktop pattern on phone"), /*#__PURE__*/React.createElement("div", {
  style: {
    width: 360,
    maxWidth: "100%",
    margin: "0 auto",
    border: "8px solid #1F2937",
    borderRadius: 28,
    overflow: "hidden",
    background: "var(--white)"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    height: 28,
    background: "var(--white)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 18px",
    fontSize: 11,
    fontWeight: 600
  }
}, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
  style: {
    display: "flex",
    gap: 4,
    alignItems: "center",
    color: "var(--text-primary)"
  }
}, "\u25CF \u25CF \u25CF")), /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--bg-app)",
    padding: "12px 16px",
    display: "grid",
    gap: 10
  }
}, [["M/V Stratos", "Panama · medium"], ["M/V Oceanus", "Liberia · high"], ["M/V Nereid", "Malta · low"]].map(([v, m]) => /*#__PURE__*/React.createElement("div", {
  key: v,
  className: "ds-card",
  style: {
    padding: "10px 12px"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    fontWeight: 600
  }
}, v), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: "var(--text-muted)"
  }
}, m)))), /*#__PURE__*/React.createElement("div", {
  style: {
    borderTop: "1px solid var(--border-subtle)",
    background: "var(--slate-50)",
    padding: "10px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: "var(--text-muted)",
    textAlign: "center"
  }
}, "Showing 1\u201325 of 847 results"), /*#__PURE__*/React.createElement("nav", {
  className: "ds-pagination",
  "aria-label": "bad",
  style: {
    justifyContent: "center",
    overflowX: "auto"
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn",
  disabled: true,
  style: {
    minWidth: 26,
    height: 26,
    padding: 0
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronLeft,
  size: 12
})), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn is-active",
  style: {
    minWidth: 26,
    height: 26,
    padding: 0,
    fontSize: 11
  }
}, "1"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn",
  style: {
    minWidth: 26,
    height: 26,
    padding: 0,
    fontSize: 11
  }
}, "2"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn",
  style: {
    minWidth: 26,
    height: 26,
    padding: 0,
    fontSize: 11
  }
}, "3"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn",
  style: {
    minWidth: 26,
    height: 26,
    padding: 0,
    fontSize: 11
  }
}, "4"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn",
  style: {
    minWidth: 26,
    height: 26,
    padding: 0,
    fontSize: 11
  }
}, "5"), /*#__PURE__*/React.createElement("span", {
  className: "ds-page-ellipsis",
  style: {
    minWidth: 14,
    height: 26,
    fontSize: 11
  }
}, "\u2026"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn",
  style: {
    minWidth: 26,
    height: 26,
    padding: 0,
    fontSize: 11
  }
}, "34"), /*#__PURE__*/React.createElement("button", {
  className: "ds-page-btn",
  style: {
    minWidth: 26,
    height: 26,
    padding: 0
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronRight,
  size: 12
}))), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 10,
    color: "var(--danger-600)",
    textAlign: "center",
    marginTop: 2
  }
}, "26px hit targets \xB7 fails WCAG 2.5.5"))))), /*#__PURE__*/React.createElement("div", {
  className: "grid-2",
  style: {
    gap: 16,
    marginTop: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--success-050)",
    border: "1px solid var(--success-100)",
    borderRadius: "var(--radius-md)",
    padding: "14px 16px"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--success-700)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 8
  }
}, "Include on mobile"), /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    lineHeight: 1.65,
    color: "var(--text-primary)"
  }
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Prev / Next buttons"), " \u2014 full-width, min 44\xD744 px, labelled with icon + text"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Current page indicator"), " \u2014 \"1 / 34\" pill between the buttons"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Result count"), " \u2014 condensed: ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "\"1\u201325 of 847\"")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Jump to page"), " \u2014 link that opens a bottom sheet with a numeric input (only when total pages > 10)"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Disabled state"), " \u2014 prev on page 1, next on last page"))), /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--danger-050)",
    border: "1px solid var(--danger-100)",
    borderRadius: "var(--radius-md)",
    padding: "14px 16px"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--danger-700)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 8
  }
}, "Drop on mobile"), /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    lineHeight: 1.65,
    color: "var(--text-primary)"
  }
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Numbered page list"), " \u2014 hit targets fall below 44 px and the row overflows"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Ellipsis collapsing"), " \u2014 irrelevant once the number strip is gone"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "\"Rows per page\" selector"), " \u2014 move to the filter / settings sheet; default to 25"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Word \"results\""), " \u2014 abbreviate aggressively; screen real estate is the constraint"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "First / Last buttons"), " \u2014 replaced by the jump-to-page sheet")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card",
  style: {
    overflow: "hidden",
    padding: 0,
    marginTop: 8
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "ds-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Breakpoint"), /*#__PURE__*/React.createElement("th", null, "Layout"), /*#__PURE__*/React.createElement("th", null, "Hit target"), /*#__PURE__*/React.createElement("th", null, "Page numbers shown"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "< 640px"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "phone")), /*#__PURE__*/React.createElement("td", null, "Stacked: count + jump link on row 1, full-width Prev / page-of-total / Next on row 2"), /*#__PURE__*/React.createElement("td", null, "44 \xD7 44 px"), /*#__PURE__*/React.createElement("td", null, "Current only (e.g. \"1 / 34\")")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "640 \u2013 1024px"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "tablet")), /*#__PURE__*/React.createElement("td", null, "Single row, compact: count on left, prev / page-of-total / next on right"), /*#__PURE__*/React.createElement("td", null, "36 \xD7 36 px"), /*#__PURE__*/React.createElement("td", null, "Current only")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "\u2265 1024px"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "desktop")), /*#__PURE__*/React.createElement("td", null, "Full numbered list with ellipsis + rows-per-page selector"), /*#__PURE__*/React.createElement("td", null, "32 \xD7 32 px"), /*#__PURE__*/React.createElement("td", null, "Up to 7 + ellipsis"))))))));
const ComponentsSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ButtonsBlock, null), /*#__PURE__*/React.createElement(FormsBlock, null), /*#__PURE__*/React.createElement(BadgesBlock, null), /*#__PURE__*/React.createElement(AlertsBlock, null), /*#__PURE__*/React.createElement(CardsBlock, null), /*#__PURE__*/React.createElement(MetricCardsBlock, null), /*#__PURE__*/React.createElement(TablesBlock, null), /*#__PURE__*/React.createElement(NavTabsBlock, null), /*#__PURE__*/React.createElement(OverlayBlock, null), /*#__PURE__*/React.createElement(LoadingBlock, null), /*#__PURE__*/React.createElement(PaginationBlock, null));
window.ComponentsSection = ComponentsSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-components.jsx", error: String((e && e.message) || e) }); }

// section-data-primitives.jsx
try { (() => {
/* Section — Data primitives: filters, search, bulk actions, saved views */

const FilterBarDemo = () => /*#__PURE__*/React.createElement("div", {
  className: "ds-filter-bar"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-search-input"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.search,
  size: 14
}), /*#__PURE__*/React.createElement("input", {
  type: "text",
  placeholder: "Search vessels, IMO, flag\u2026",
  defaultValue: "atlantic"
})), /*#__PURE__*/React.createElement("span", {
  className: "ds-chip ds-chip--filter"
}, /*#__PURE__*/React.createElement("span", {
  className: "chip-label"
}, "Type:"), /*#__PURE__*/React.createElement("span", {
  className: "chip-value"
}, "Tanker"), /*#__PURE__*/React.createElement("button", {
  className: "ds-chip-x",
  "aria-label": "Remove Type filter"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.x,
  size: 10
}))), /*#__PURE__*/React.createElement("span", {
  className: "ds-chip ds-chip--filter"
}, /*#__PURE__*/React.createElement("span", {
  className: "chip-label"
}, "Flag:"), /*#__PURE__*/React.createElement("span", {
  className: "chip-value"
}, "Liberia \xB7 Panama \xB7 +2"), /*#__PURE__*/React.createElement("button", {
  className: "ds-chip-x",
  "aria-label": "Remove Flag filter"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.x,
  size: 10
}))), /*#__PURE__*/React.createElement("span", {
  className: "ds-chip ds-chip--filter"
}, /*#__PURE__*/React.createElement("span", {
  className: "chip-label"
}, "Rating:"), /*#__PURE__*/React.createElement("span", {
  className: "chip-value"
}, "D, E"), /*#__PURE__*/React.createElement("button", {
  className: "ds-chip-x",
  "aria-label": "Remove Rating filter"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.x,
  size: 10
}))), /*#__PURE__*/React.createElement("button", {
  className: "ds-filter-trigger"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.plus,
  size: 10
}), " Add filter"), /*#__PURE__*/React.createElement("span", {
  style: {
    flex: 1
  }
}), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost ds-btn--sm"
}, "Reset"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.star,
  size: 12,
  stroke: "currentColor"
}), "  Save view"));
const FacetDropdownDemo = () => {
  const rows = [["Tanker", 412, true], ["Container", 1284, false], ["Bulk Carrier", 802, false], ["Gas Carrier", 167, true], ["LNG Carrier", 119, false], ["General Cargo", 433, false], ["Refrigerated Cargo", 91, false], ["Cruise Passenger", 48, false], ["Vehicle Carrier", 73, false], ["Yacht", 22, false]];
  return /*#__PURE__*/React.createElement("div", {
    className: "ds-facet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-facet-head"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.search,
    size: 14,
    stroke: "var(--text-muted)"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Filter types\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ds-facet-body"
  }, rows.map(([label, count, checked]) => /*#__PURE__*/React.createElement("label", {
    key: label,
    className: "ds-facet-row"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    className: "ds-check",
    defaultChecked: checked
  }), label, /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, count.toLocaleString())))), /*#__PURE__*/React.createElement("div", {
    className: "ds-facet-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--link",
    style: {
      fontSize: 12
    }
  }, "Clear (2)"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--primary ds-btn--sm"
  }, "Apply")));
};
const SavedViewsDemo = () => /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Saved views"), /*#__PURE__*/React.createElement("button", {
  className: "ds-view-trigger"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.star,
  size: 14,
  stroke: "currentColor",
  className: "star"
}), "My high-risk tankers", /*#__PURE__*/React.createElement(Icon, {
  d: I.chevron,
  size: 14
}))), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 8
  }
}, [["My high-risk tankers", "tanker · rating D, E · flag Liberia, Panama", "current"], ["EU-bound, last 7d", "destination region EU · ATA ≤ 7d", "shared by Maeve"], ["Sanctioned watchlist", "flag in sanctions list · AIS gap > 6h", "team"], ["Black Sea grain", "type bulk · region Black Sea", ""]].map(([name, descr, badge]) => /*#__PURE__*/React.createElement("div", {
  key: name,
  style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 12px",
    borderTop: "1px solid var(--border-subtle)"
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.eye,
  size: 14,
  stroke: "var(--text-muted)"
}), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    minWidth: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    fontWeight: 600
  }
}, name), /*#__PURE__*/React.createElement("div", {
  className: "t-caption",
  style: {
    fontSize: 11.5
  }
}, descr)), badge === "current" && /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--info"
}, "current"), badge === "team" && /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--neutral"
}, "team"), badge.startsWith("shared") && /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--neutral"
}, badge)))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot",
  style: {
    display: "flex",
    justifyContent: "space-between"
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--link",
  style: {
    fontSize: 12
  }
}, "+ Save current as new view"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "URL-encoded \xB7 share by copying the link")));
const BulkActionBarDemo = () => {
  const [count, setCount] = React.useState(23);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      alignItems: "stretch"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-bulk-bar"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    className: "ds-check",
    defaultChecked: true,
    style: {
      borderColor: "rgba(255,255,255,.4)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, count), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      opacity: 0.85
    }
  }, "vessels selected"), /*#__PURE__*/React.createElement("span", {
    className: "divider"
  }), /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement(Icon, {
    d: I.tag || I.flag,
    size: 12
  }), " Tag"), /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement(Icon, {
    d: I.folder,
    size: 12
  }), " Move to portfolio"), /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement(Icon, {
    d: I.download,
    size: 12
  }), " Export"), /*#__PURE__*/React.createElement("button", {
    style: {
      color: "#fca5a5"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.trash,
    size: 12
  }), " Archive"), /*#__PURE__*/React.createElement("button", {
    className: "undo"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.x,
    size: 12
  }), " Clear")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--ghost ds-btn--sm",
    onClick: () => setCount(c => Math.max(0, c - 5))
  }, "\u22125 selected"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--ghost ds-btn--sm",
    onClick: () => setCount(c => c + 12)
  }, "+12 selected")));
};
const FilterTypesTable = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Trigger"), /*#__PURE__*/React.createElement("th", null, "Surface"), /*#__PURE__*/React.createElement("th", null, "When to use"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Quick filter")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "ds-filter-trigger"), " \"+ Add filter\""), /*#__PURE__*/React.createElement("td", null, "Popover dropdown"), /*#__PURE__*/React.createElement("td", null, "1\u201310 enumerable values per category. The default.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Facet")), /*#__PURE__*/React.createElement("td", null, "Field name in chip \u2192 opens dropdown with search + checklist"), /*#__PURE__*/React.createElement("td", null, "Searchable dropdown"), /*#__PURE__*/React.createElement("td", null, "10\u20131000 values: flags, ports, organizations. Multi-select with counts.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Range")), /*#__PURE__*/React.createElement("td", null, "\"Speed \u2265 10 kn\" chip \u2192 opens slider"), /*#__PURE__*/React.createElement("td", null, "Inline slider"), /*#__PURE__*/React.createElement("td", null, "Continuous numeric: speed, draught, exposure. Min, max, or both.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Date range")), /*#__PURE__*/React.createElement("td", null, "\"Last 7d\" preset chip \u2192 opens calendar"), /*#__PURE__*/React.createElement("td", null, "Date range picker"), /*#__PURE__*/React.createElement("td", null, "ATA, ETA, AIS-last-seen. Always with presets: 1d, 7d, 30d, YTD.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Advanced")), /*#__PURE__*/React.createElement("td", null, "\"Advanced filters\" button"), /*#__PURE__*/React.createElement("td", null, "Side panel"), /*#__PURE__*/React.createElement("td", null, "Boolean combinations across > 3 categories. Power-user surface."))));
const URLStateExample = () => /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// Filter state lives in the URL — always. Sharing = copy + paste.
//   /vessels?type=tanker&flag=lr,pa&rating=d,e&q=atlantic&view=my-hr-tankers

// app/ui/Filters/useFilterState.ts
export function useFilterState(): [FilterState, (next: FilterState) => void] {
  const [state, setRaw] = React.useState(() => parseFilters(location.search));
  React.useEffect(() => {
    const handler = () => setRaw(parseFilters(location.search));
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);
  const set = (next: FilterState) => {
    const search = serializeFilters(next);
    history.replaceState(null, '', \`?\${search}\`);  // replace, not push, while typing
    setRaw(next);
  };
  return [state, set];
}

// Saved views are just named URL strings persisted server-side
type SavedView = {
  id: string; name: string;
  query: string;          // the URL search string
  ownerId: string;
  scope: 'private' | 'team';
};`);
const FilterRulesDoDont = () => /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head",
  style: {
    background: "var(--success-050)"
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title",
  style: {
    color: "var(--success-700)"
  }
}, "DO")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, "Show ", /*#__PURE__*/React.createElement("strong", null, "active filter counts"), " \u2014 \"412 of 5,983 vessels\"."), /*#__PURE__*/React.createElement("li", null, "Persist state in the URL. The back button works."), /*#__PURE__*/React.createElement("li", null, "Reset is a single click \u2014 never bury it in a menu."), /*#__PURE__*/React.createElement("li", null, "Show ", /*#__PURE__*/React.createElement("strong", null, "option counts"), " on facets so users see \"Tanker (412)\" not just \"Tanker\"."), /*#__PURE__*/React.createElement("li", null, "Default sort is stable across filter changes.")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head",
  style: {
    background: "var(--danger-050)"
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title",
  style: {
    color: "var(--danger-700)"
  }
}, "DON'T")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, "Auto-apply filters as the user types in the facet search \u2014 debounce or wait for Apply."), /*#__PURE__*/React.createElement("li", null, "Hide the active filters in a panel. Chips are always visible."), /*#__PURE__*/React.createElement("li", null, "Reset selection on filter change. A user filtering down their selection expects it to persist."), /*#__PURE__*/React.createElement("li", null, "Show empty facets (\"Gas Carrier (0)\") \u2014 collapse to \"no matches\"."), /*#__PURE__*/React.createElement("li", null, "Mix AND/OR semantics without telling the user. Within a facet = OR; across facets = AND.")))));
const BulkActionRules = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Concern"), /*#__PURE__*/React.createElement("th", null, "Rule"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Selection scope")), /*#__PURE__*/React.createElement("td", null, "The header checkbox is a ", /*#__PURE__*/React.createElement("strong", null, "tristate"), ": empty, partial (\u2014 icon), all on current page. \"Select all 5,983\" is an explicit second action.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Action bar position")), /*#__PURE__*/React.createElement("td", null, "Sticky to the bottom of the selection scope (usually the table card), not the viewport. Slides up from the bottom on first select, fades out on clear.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Destructive actions")), /*#__PURE__*/React.createElement("td", null, "Confirmation modal when count \u2265 10 OR action is irreversible. Confirmation modal types the count: \"Archive 23 vessels?\" \u2014 not just \"Are you sure?\".")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Undo")), /*#__PURE__*/React.createElement("td", null, "Reversible actions show an undo toast for 8 s after completion. Time-bombed undo links to a permanent audit log entry.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Optimistic UI")), /*#__PURE__*/React.createElement("td", null, "Rows visually transition (fade + collapse) before the server confirms. Failure reverts with a danger toast.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Bulk-action result")), /*#__PURE__*/React.createElement("td", null, "Always summarize: \"Archived 21 of 23 (2 failed \u2014 permission denied)\". Never leave the user guessing."))));
const SortableHeaderDemo = () => {
  const cols = [{
    key: "name",
    label: "Vessel",
    num: false
  }, {
    key: "flag",
    label: "Flag",
    num: false
  }, {
    key: "type",
    label: "Type",
    num: false
  }, {
    key: "speed",
    label: "Speed (kn)",
    num: true
  }, {
    key: "seen",
    label: "AIS last seen",
    num: true
  }];
  const baseRows = [{
    name: "Atlantic Crown",
    flag: "Liberia",
    type: "Tanker",
    speed: 12.4,
    seen: 2
  }, {
    name: "Nordic Aurora",
    flag: "Panama",
    type: "Bulk Carrier",
    speed: 8.1,
    seen: 41
  }, {
    name: "Pacific Venture",
    flag: "Marshall Is.",
    type: "Container",
    speed: 18.9,
    seen: 0
  }, {
    name: "Sea Meridian",
    flag: "Malta",
    type: "Gas Carrier",
    speed: 0.0,
    seen: 376
  }, {
    name: "Orion Trader",
    flag: "Liberia",
    type: "Tanker",
    speed: 14.2,
    seen: 6
  }, {
    name: "Baltic Spirit",
    flag: "Cyprus",
    type: "General Cargo",
    speed: 9.6,
    seen: 18
  }];
  // null → ascending → descending → null
  const [sort, setSort] = React.useState({
    key: "speed",
    dir: "desc"
  });
  const cycle = key => setSort(s => {
    if (s.key !== key) return {
      key,
      dir: "asc"
    };
    if (s.dir === "asc") return {
      key,
      dir: "desc"
    };
    if (s.dir === "desc") return {
      key: null,
      dir: null
    };
    return {
      key,
      dir: "asc"
    };
  });
  const rows = React.useMemo(() => {
    if (!sort.key) return baseRows;
    const sorted = [...baseRows].sort((a, b) => {
      const av = a[sort.key],
        bv = b[sort.key];
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [sort]);
  const ariaFor = key => sort.key !== key ? "none" : sort.dir === "asc" ? "ascending" : "descending";
  return /*#__PURE__*/React.createElement("div", {
    className: "surface",
    style: {
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "ds-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, cols.map(c => {
    const active = sort.key === c.key;
    return /*#__PURE__*/React.createElement("th", {
      key: c.key,
      scope: "col",
      className: `ds-th--sortable${active ? " ds-th--active" : ""}`,
      "aria-sort": ariaFor(c.key)
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: `ds-th-sort${c.num ? " num" : ""}`,
      onClick: () => cycle(c.key),
      title: `Sort by ${c.label}`
    }, c.label, /*#__PURE__*/React.createElement("span", {
      className: "ds-sort-ind"
    }, /*#__PURE__*/React.createElement(Icon, {
      d: active ? sort.dir === "asc" ? I.arrowUp : I.arrowDown : I.sort,
      size: 12
    }))));
  }))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.name
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 600
    }
  }, r.name), /*#__PURE__*/React.createElement("td", null, r.flag), /*#__PURE__*/React.createElement("td", null, r.type), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, r.speed.toFixed(1)), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, r.seen === 0 ? "live" : `${r.seen}h ago`))))));
};
const SortRulesTable = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Concern"), /*#__PURE__*/React.createElement("th", null, "Rule"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Affordance")), /*#__PURE__*/React.createElement("td", null, "Sortable headers are ", /*#__PURE__*/React.createElement("code", null, "<button>"), "s inside the ", /*#__PURE__*/React.createElement("code", null, "<th>"), " \u2014 focusable, Enter/Space activate. A faint up/down glyph (", /*#__PURE__*/React.createElement("code", null, "I.sort"), ") is ", /*#__PURE__*/React.createElement("strong", null, "always visible"), " at 40% rest opacity so users know a column is sortable before they hover \u2014 it darkens to 70% on hover and turns into a solid directional arrow when active.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Click cycle")), /*#__PURE__*/React.createElement("td", null, "First click \u2192 ", /*#__PURE__*/React.createElement("strong", null, "ascending"), ", second \u2192 ", /*#__PURE__*/React.createElement("strong", null, "descending"), ", third \u2192 ", /*#__PURE__*/React.createElement("strong", null, "unsorted"), " (returns to default order). Don't trap users in a two-state toggle with no way back to default.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Active indicator")), /*#__PURE__*/React.createElement("td", null, "The active column shows a solid arrow in ", /*#__PURE__*/React.createElement("code", null, "--brand-600"), "; its label darkens to ", /*#__PURE__*/React.createElement("code", null, "--text-primary"), ". Only one column is visibly active at a time (unless multi-sort is on \u2014 see below).")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Direction glyph")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Icon, {
  d: I.arrowUp,
  size: 11,
  className: "inline-ico"
}), " ascending = A\u2192Z, 0\u21929, oldest\u2192newest. ", /*#__PURE__*/React.createElement(Icon, {
  d: I.arrowDown,
  size: 11,
  className: "inline-ico"
}), " descending = the reverse. Numeric and date columns default to ", /*#__PURE__*/React.createElement("strong", null, "descending"), " on first click (most users want \"highest / most recent first\").")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Accessibility")), /*#__PURE__*/React.createElement("td", null, "The ", /*#__PURE__*/React.createElement("code", null, "<th>"), " carries ", /*#__PURE__*/React.createElement("code", null, "aria-sort=\"ascending | descending | none\""), " and ", /*#__PURE__*/React.createElement("code", null, "scope=\"col\""), ". Screen readers announce the sort state on focus \u2014 the glyph alone is never the only signal.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Alignment")), /*#__PURE__*/React.createElement("td", null, "Numeric columns right-align both header and cells (", /*#__PURE__*/React.createElement("code", null, ".num"), "), with the glyph trailing the label so the column reads as a single right-aligned unit.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Multi-sort")), /*#__PURE__*/React.createElement("td", null, "Shift-click adds a secondary sort key; a small superscript rank (", /*#__PURE__*/React.createElement("span", {
  className: "ds-sort-rank",
  style: {
    position: "static"
  }
}, "1"), " ", /*#__PURE__*/React.createElement("span", {
  className: "ds-sort-rank",
  style: {
    position: "static"
  }
}, "2"), ") appears beside each active glyph. Reserve for power surfaces \u2014 most lists are single-column.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Persistence")), /*#__PURE__*/React.createElement("td", null, "Sort key + direction serialize into the URL (", /*#__PURE__*/React.createElement("code", null, "?sort=speed:desc"), ") alongside filters. Refresh and permalinks restore the exact order. Default sort is stable across filter changes."))));
const DataPrimitivesSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Why this chapter"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Search, filter, select, act \u2014 that's the loop on most Skytek surfaces. Today each module reinvents it: AssetsSearch, Companies, Ports and the vessel/aircraft lists all carry similar but subtly different patterns. This chapter is the canonical version every list page snaps to.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Filter bar"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "One row above the table. Left \u2192 right: search box, active filter chips, ", /*#__PURE__*/React.createElement("em", null, "+ Add filter"), ", spacer, ", /*#__PURE__*/React.createElement("em", null, "Reset"), ", ", /*#__PURE__*/React.createElement("em", null, "Save view"), ". Chips are always visible; they ARE the state of the page."), /*#__PURE__*/React.createElement(FilterBarDemo, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Filter types"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Five filter modes. Pick by the cardinality and shape of the underlying field \u2014 not by the screen's available space."), /*#__PURE__*/React.createElement(FilterTypesTable, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Faceted dropdown"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Multi-select facets with counts. Local search at the top, scrollable list, footer with Apply and Clear. Apply is the commit \u2014 selecting checkboxes doesn't fire the filter."), /*#__PURE__*/React.createElement("div", {
  className: "grid-2",
  style: {
    alignItems: "flex-start"
  }
}, /*#__PURE__*/React.createElement(FacetDropdownDemo, null), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
  style: {
    fontSize: 13,
    marginTop: 0
  }
}, "Counts & ordering"), /*#__PURE__*/React.createElement("p", {
  className: "t-body-sm",
  style: {
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("strong", null, "Counts"), " reflect the result set after ", /*#__PURE__*/React.createElement("em", null, "all other filters"), " are applied \u2014 so a user filtering by Liberia sees the number of Tankers under the Liberia filter, not the global count.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, "Ordering"), ": checked items first (stable order), then unchecked sorted by count descending. New facet sessions reset to count order.")))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Saved views"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "A saved view is a named URL string. Sharing = copy the link. Personal vs team scope; team views are governed by the parent surface's roles."), /*#__PURE__*/React.createElement(SavedViewsDemo, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "URL as source of truth"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Filter state, sort, selected facets, search query, pagination \u2014 all serialized into the URL. Refresh restores the view. Back/forward navigate filter history. Permalinks are the system's sharing primitive."), /*#__PURE__*/React.createElement(URLStateExample, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Selection & bulk actions"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Row checkboxes appear on hover; persist when any row is selected. The bulk-action bar slides in from the bottom of the table card \u2014 never the viewport edge."), /*#__PURE__*/React.createElement(BulkActionBarDemo, null), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "Buttons above are live \u2014 they change the count to show the bar's responsive behavior.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Sortable headers"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Every column header on a list table is a sort control. Click to cycle ", /*#__PURE__*/React.createElement("em", null, "ascending \u2192 descending \u2192 unsorted"), ". Try the columns below \u2014 the glyph hints sortability on hover and turns solid on the active column."), /*#__PURE__*/React.createElement(SortableHeaderDemo, null), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "Live \u2014 click any header. Third click on the same column returns to the default order."), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 20
  }
}, /*#__PURE__*/React.createElement(SortRulesTable, null))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Bulk-action rules"), /*#__PURE__*/React.createElement(BulkActionRules, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Do & don't"), /*#__PURE__*/React.createElement(FilterRulesDoDont, null)), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "The principle:"), " the filter bar tells you what you're looking at, the URL tells you how you got here, and the bulk bar tells you what you can do about it. Three primitives, on every list page, in the same place."));
window.DataPrimitivesSection = DataPrimitivesSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-data-primitives.jsx", error: String((e && e.message) || e) }); }

// section-datetime.jsx
try { (() => {
/* Section — Date, time & range pickers */

/* Static calendar grid generator — pure presentational */
const buildMonth = (year, monthIdx) => {
  const first = new Date(year, monthIdx, 1);
  const start = new Date(first);
  start.setDate(1 - (first.getDay() + 6) % 7); // Monday-first
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
};
const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const CalendarMonth = ({
  year,
  monthIdx,
  today,
  rangeStart,
  rangeEnd,
  hoverDate,
  onCellClick,
  onCellHover,
  style
}) => {
  const days = buildMonth(year, monthIdx);
  const monthName = new Date(year, monthIdx, 1).toLocaleString("en-GB", {
    month: "long",
    year: "numeric"
  });
  const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const inRange = d => {
    if (!rangeStart) return false;
    const end = rangeEnd || hoverDate;
    if (!end) return false;
    const [a, b] = rangeStart.getTime() <= end.getTime() ? [rangeStart, end] : [end, rangeStart];
    return d.getTime() > a.getTime() && d.getTime() < b.getTime();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "ds-datepicker",
    style: {
      border: 0,
      boxShadow: "none",
      padding: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-datepicker-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ds-datepicker-month"
  }, monthName), /*#__PURE__*/React.createElement("div", {
    className: "ds-datepicker-nav"
  }, /*#__PURE__*/React.createElement("button", {
    "aria-label": "Previous month"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.chevronLeft || I.chevron,
    size: 14
  })), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Next month"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.chevronRight || I.chevron,
    size: 14
  })))), /*#__PURE__*/React.createElement("div", {
    className: "ds-datepicker-grid"
  }, DOW.map(d => /*#__PURE__*/React.createElement("span", {
    key: d,
    className: "dow"
  }, d)), days.map((d, i) => {
    const otherMonth = d.getMonth() !== monthIdx;
    const isToday = isSameDay(d, today);
    const isStart = isSameDay(d, rangeStart);
    const isEnd = isSameDay(d, rangeEnd);
    const between = inRange(d);
    let cls = "ds-datepicker-cell";
    if (otherMonth) cls += " is-other-month";
    if (isToday) cls += " is-today";
    if (isStart) cls += " is-range-start";
    if (isEnd) cls += " is-range-end";
    if (between) cls += " is-in-range";
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      className: cls,
      onClick: () => onCellClick?.(d),
      onMouseEnter: () => onCellHover?.(d)
    }, d.getDate());
  })));
};
const SingleDatePickerDemo = () => {
  const today = new Date();
  const [selected, setSelected] = React.useState(new Date(today.getFullYear(), today.getMonth(), 15));
  return /*#__PURE__*/React.createElement(CalendarMonth, {
    year: selected.getFullYear(),
    monthIdx: selected.getMonth(),
    today: today,
    rangeStart: selected,
    onCellClick: d => setSelected(d),
    style: {
      border: "1px solid var(--border-default)",
      boxShadow: "var(--shadow-lg)",
      padding: 12
    }
  });
};
const RangePickerDemo = () => {
  const today = new Date();
  const [activePreset, setActivePreset] = React.useState("7d");
  const [start, setStart] = React.useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return d;
  });
  const [end, setEnd] = React.useState(today);
  const [hover, setHover] = React.useState(null);
  const [stage, setStage] = React.useState("end");
  const setPreset = key => {
    setActivePreset(key);
    const now = new Date();
    let s = new Date(now);
    switch (key) {
      case "today":
        s = new Date(now);
        break;
      case "7d":
        s.setDate(now.getDate() - 6);
        break;
      case "30d":
        s.setDate(now.getDate() - 29);
        break;
      case "90d":
        s.setDate(now.getDate() - 89);
        break;
      case "ytd":
        s = new Date(now.getFullYear(), 0, 1);
        break;
      case "lastQ":
        s = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
        break;
      default:
        break;
    }
    setStart(s);
    setEnd(now);
  };
  const onCellClick = d => {
    if (stage === "end" || !start) {
      setStart(d);
      setEnd(null);
      setStage("range");
    } else {
      if (d.getTime() < start.getTime()) {
        setEnd(start);
        setStart(d);
      } else {
        setEnd(d);
      }
      setStage("end");
      setActivePreset(null);
    }
  };
  const cur = new Date(today.getFullYear(), today.getMonth(), 1);
  const nxt = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return /*#__PURE__*/React.createElement("div", {
    className: "ds-date-range-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-date-presets"
  }, [["today", "Today"], ["7d", "Last 7 days"], ["30d", "Last 30 days"], ["90d", "Last 90 days"], ["ytd", "Year to date"], ["lastQ", "Last quarter"]].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: `ds-date-preset ${activePreset === k ? "is-active" : ""}`,
    onClick: () => setPreset(k)
  }, l))), /*#__PURE__*/React.createElement(CalendarMonth, {
    year: cur.getFullYear(),
    monthIdx: cur.getMonth(),
    today: today,
    rangeStart: start,
    rangeEnd: end,
    hoverDate: hover,
    onCellClick: onCellClick,
    onCellHover: setHover
  }), /*#__PURE__*/React.createElement(CalendarMonth, {
    year: nxt.getFullYear(),
    monthIdx: nxt.getMonth(),
    today: today,
    rangeStart: start,
    rangeEnd: end,
    hoverDate: hover,
    onCellClick: onCellClick,
    onCellHover: setHover
  }));
};
const TimePickerDemo = () => {
  const [focus, setFocus] = React.useState("hh");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ds-time-picker"
  }, /*#__PURE__*/React.createElement("span", {
    className: `seg ${focus === "hh" ? "is-focus" : ""}`,
    tabIndex: 0,
    onFocus: () => setFocus("hh")
  }, "14"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, ":"), /*#__PURE__*/React.createElement("span", {
    className: `seg ${focus === "mm" ? "is-focus" : ""}`,
    tabIndex: 0,
    onFocus: () => setFocus("mm")
  }, "32"), /*#__PURE__*/React.createElement("span", {
    className: "zone"
  }, "UTC")), /*#__PURE__*/React.createElement("span", {
    className: "ds-time-picker"
  }, /*#__PURE__*/React.createElement("span", {
    className: `seg ${focus === "hh2" ? "is-focus" : ""}`,
    tabIndex: 0,
    onFocus: () => setFocus("hh2")
  }, "09"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, ":"), /*#__PURE__*/React.createElement("span", {
    className: `seg ${focus === "mm2" ? "is-focus" : ""}`,
    tabIndex: 0,
    onFocus: () => setFocus("mm2")
  }, "15"), /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, ":"), /*#__PURE__*/React.createElement("span", {
    className: `seg ${focus === "ss2" ? "is-focus" : ""}`,
    tabIndex: 0,
    onFocus: () => setFocus("ss2")
  }, "42"), /*#__PURE__*/React.createElement("span", {
    className: "zone"
  }, "local")), /*#__PURE__*/React.createElement("span", {
    className: "t-caption"
  }, "Each segment is independently focusable. \u2191\u2193 to increment, \u2190\u2192 to advance."));
};
const PresetRules = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Preset"), /*#__PURE__*/React.createElement("th", null, "Range"), /*#__PURE__*/React.createElement("th", null, "When to include"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Today")), /*#__PURE__*/React.createElement("td", null, "00:00 \u2192 now (local)"), /*#__PURE__*/React.createElement("td", null, "Always")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Last 7 days")), /*#__PURE__*/React.createElement("td", null, "now \u2212 6d \u2192 now"), /*#__PURE__*/React.createElement("td", null, "Always \u2014 the operator default")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Last 30 days")), /*#__PURE__*/React.createElement("td", null, "now \u2212 29d \u2192 now"), /*#__PURE__*/React.createElement("td", null, "Always")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Last 90 days")), /*#__PURE__*/React.createElement("td", null, "now \u2212 89d \u2192 now"), /*#__PURE__*/React.createElement("td", null, "Trend / portfolio surfaces")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Year to date")), /*#__PURE__*/React.createElement("td", null, "1 Jan year \u2192 now"), /*#__PURE__*/React.createElement("td", null, "Reporting, compliance")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Last quarter")), /*#__PURE__*/React.createElement("td", null, "Previous calendar quarter"), /*#__PURE__*/React.createElement("td", null, "Reporting, exposure analyses")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "This month")), /*#__PURE__*/React.createElement("td", null, "1st \u2192 now"), /*#__PURE__*/React.createElement("td", null, "Audit, billing")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "All time")), /*#__PURE__*/React.createElement("td", null, "Beginning of record \u2192 now"), /*#__PURE__*/React.createElement("td", null, "Search, history; never on dashboards"))));
const DatePickerRules = () => /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Time zones")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, "Dates are stored as ", /*#__PURE__*/React.createElement("code", null, "UTC"), ". The picker's labels are in the user's zone but the wire value is UTC."), /*#__PURE__*/React.createElement("li", null, "The \"Today\" preset uses the user's local midnight, not UTC midnight."), /*#__PURE__*/React.createElement("li", null, "Picker footer always shows the wire value: ", /*#__PURE__*/React.createElement("code", null, "2026-04-28T00:00Z \u2192 2026-04-28T23:59Z"), "."), /*#__PURE__*/React.createElement("li", null, "Time-of-day pickers default to UTC unless the field is explicitly local (vessel ETA at port).")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Constraints")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("code", null, "minDate"), " / ", /*#__PURE__*/React.createElement("code", null, "maxDate"), " disable cells; never hide them."), /*#__PURE__*/React.createElement("li", null, "Disabled cells get a tooltip on hover: \"No data before 1 Jan 2024.\""), /*#__PURE__*/React.createElement("li", null, "Max range (e.g. 90 days) shows a banner when exceeded \u2014 never silently clamps."), /*#__PURE__*/React.createElement("li", null, "Weekend / holiday styling is opt-in per surface, not a default.")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Keyboard")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("kbd", null, "\u2191\u2193\u2190\u2192"), " move by day \xB7 ", /*#__PURE__*/React.createElement("kbd", null, "PgUp/PgDn"), " by month \xB7 ", /*#__PURE__*/React.createElement("kbd", null, "Shift+PgUp/PgDn"), " by year"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("kbd", null, "Home/End"), " jump to start/end of week"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("kbd", null, "Enter"), " commits the focused cell; ", /*#__PURE__*/React.createElement("kbd", null, "Esc"), " closes without committing"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("kbd", null, "Tab"), " moves focus from grid \u2192 presets \u2192 footer \u2192 close button")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Open behavior")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, "Range picker opens at the month containing the current ", /*#__PURE__*/React.createElement("em", null, "start"), "."), /*#__PURE__*/React.createElement("li", null, "If no value, open at the current month."), /*#__PURE__*/React.createElement("li", null, "Two months for range, one for single date. No three-month layouts."), /*#__PURE__*/React.createElement("li", null, "Presets sit on the left, calendar(s) on the right. Mobile collapses to one column.")))));
const DatePickerApi = () => /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// app/ui/Date — three components, one shape.
type DateValue = string | null;   // ISO 8601 UTC, e.g. "2026-04-28T00:00:00Z"
type DateRange = { start: DateValue; end: DateValue };

// Single
<DatePicker
  value={iso}
  onChange={setIso}
  min="2024-01-01"
  max={new Date().toISOString()}
/>

// Range
<DateRangePicker
  value={range}
  onChange={setRange}
  presets={['today','7d','30d','ytd','lastQ']}
  maxRangeDays={365}
/>

// Time (segmented)
<TimePicker
  value="14:32"          // HH:mm or HH:mm:ss
  onChange={setTime}
  zone="UTC"             // 'UTC' | 'local' | IANA tz string
  step={1}               // minutes
/>

// All three render the same input shell:
<input className="ds-input" placeholder="dd MMM yyyy" value={display}
       onClick={openPicker} readOnly aria-haspopup="dialog" />`);
const DateTimeSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Why this primitive"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Skytek's lists, reports and alerts live or die on date selection. The product needs three calendar primitives \u2014 single date, date range, and time-of-day \u2014 with a consistent set of presets, the same keyboard model, and the same wire format. This is the canonical implementation.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Single date"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "One month, one selected day. Mondays first, ISO 8601 week numbering. Click any cell to select."), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    justifyContent: "center",
    padding: 24,
    background: "var(--bg-canvas)"
  }
}, /*#__PURE__*/React.createElement(SingleDatePickerDemo, null)))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Date range"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Two months side-by-side, preset shortcuts on the left, hover preview while choosing the end date. Clicking a preset overrides the manual selection (and vice versa \u2014 manual selection clears the active preset)."), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    justifyContent: "center",
    padding: 24,
    background: "var(--bg-canvas)"
  }
}, /*#__PURE__*/React.createElement(RangePickerDemo, null)))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Time picker"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Segmented HH \xB7 MM \xB7 (SS) with explicit zone marker. Keyboard-first \u2014 arrow keys increment, tab moves between segments. Never a stepped dropdown."), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-body"
}, /*#__PURE__*/React.createElement(TimePickerDemo, null)))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Preset shortcuts"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Eight presets cover the product. Surfaces opt in via the ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "presets"), " prop \u2014 never invent a new one."), /*#__PURE__*/React.createElement(PresetRules, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Rules of engagement"), /*#__PURE__*/React.createElement(DatePickerRules, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "React API"), /*#__PURE__*/React.createElement(DatePickerApi, null)), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "The principle:"), " a date picker is the most-clicked control in a monitoring product. Slow keyboard, vague time-zone behavior, or one extra click per selection compounds across thousands of operator hours. Optimize accordingly."));
window.DateTimeSection = DateTimeSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-datetime.jsx", error: String((e && e.message) || e) }); }

// section-domain.jsx
try { (() => {
/* Section — Domain primitives: Data viz, Maps, Formatting */

/* ============================================================
   Data visualization
   ============================================================ */

const CategoricalPalette = () => {
  const cats = [["--chart-cat-1", "#2d7ffb", "Series 1"], ["--chart-cat-2", "#D97706", "Series 2"], ["--chart-cat-3", "#16A34A", "Series 3"], ["--chart-cat-4", "#9333EA", "Series 4"], ["--chart-cat-5", "#DB2777", "Series 5"], ["--chart-cat-6", "#0891B2", "Series 6"], ["--chart-cat-7", "#65A30D", "Series 7"], ["--chart-cat-8", "#475569", "Series 8"]];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "chart-palette"
  }, cats.map(([t, v]) => /*#__PURE__*/React.createElement("div", {
    key: t
  }, /*#__PURE__*/React.createElement("div", {
    className: "sw",
    style: {
      background: v
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, t.replace("--chart-cat-", "cat-"))))), /*#__PURE__*/React.createElement("p", {
    className: "t-caption",
    style: {
      marginTop: 0
    }
  }, "Use in declared order \u2014 series 1 is always the primary or first series in legend order. Tested for protanopia, deuteranopia and tritanopia with adjacent-pair contrast \u2265 3:1."));
};
const SequentialRamp = ({
  title,
  vars,
  labels,
  desc
}) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 6
  }
}, title), /*#__PURE__*/React.createElement("div", {
  className: "chart-ramp"
}, vars.map(v => /*#__PURE__*/React.createElement("div", {
  key: v,
  style: {
    background: `var(${v})`
  }
}))), /*#__PURE__*/React.createElement("div", {
  className: "ramp-labels"
}, labels.map((l, i) => /*#__PURE__*/React.createElement("span", {
  key: i
}, l))), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, desc));

/* Live demo: bar chart using tokens */
const DemoBarChart = () => {
  const data = [{
    label: "Maritime",
    value: 1247,
    color: "var(--chart-cat-1)"
  }, {
    label: "Aviation",
    value: 832,
    color: "var(--chart-cat-2)"
  }, {
    label: "Offshore",
    value: 614,
    color: "var(--chart-cat-3)"
  }, {
    label: "GSIN",
    value: 391,
    color: "var(--chart-cat-4)"
  }, {
    label: "Portfolio",
    value: 248,
    color: "var(--chart-cat-5)"
  }];
  const max = 1400,
    threshold = 1000;
  const w = 480,
    h = 200,
    pad = {
      t: 12,
      r: 8,
      b: 28,
      l: 36
    };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const bw = innerW / data.length;
  const yTicks = [0, 350, 700, 1050, 1400];
  return /*#__PURE__*/React.createElement("div", {
    className: "chart-demo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginBottom: 8
    }
  }, "Active alerts by domain \xB7 last 7 days"), /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${w} ${h}`,
    role: "img",
    "aria-label": "Active alerts by domain"
  }, yTicks.map(t => {
    const y = pad.t + innerH - t / max * innerH;
    return /*#__PURE__*/React.createElement("line", {
      key: t,
      x1: pad.l,
      x2: w - pad.r,
      y1: y,
      y2: y,
      stroke: "var(--chart-grid)",
      strokeWidth: "1"
    });
  }), yTicks.map(t => {
    const y = pad.t + innerH - t / max * innerH;
    return /*#__PURE__*/React.createElement("text", {
      key: t,
      x: pad.l - 6,
      y: y + 3,
      textAnchor: "end",
      fontSize: "10",
      fill: "var(--chart-axis-label)",
      fontFamily: "var(--font-mono)"
    }, t);
  }), /*#__PURE__*/React.createElement("line", {
    x1: pad.l,
    x2: w - pad.r,
    y1: pad.t + innerH - threshold / max * innerH,
    y2: pad.t + innerH - threshold / max * innerH,
    stroke: "var(--chart-threshold-warn)",
    strokeWidth: "1.25",
    strokeDasharray: "4 3"
  }), /*#__PURE__*/React.createElement("text", {
    x: w - pad.r,
    y: pad.t + innerH - threshold / max * innerH - 4,
    textAnchor: "end",
    fontSize: "10",
    fill: "var(--warning-700)",
    fontFamily: "var(--font-mono)"
  }, "warn \u2265 ", threshold), data.map((d, i) => {
    const bh = d.value / max * innerH;
    const x = pad.l + bw * i + 6;
    const y = pad.t + innerH - bh;
    return /*#__PURE__*/React.createElement("g", {
      key: d.label
    }, /*#__PURE__*/React.createElement("rect", {
      x: x,
      y: y,
      width: bw - 12,
      height: bh,
      fill: d.color,
      rx: "2"
    }), /*#__PURE__*/React.createElement("text", {
      x: x + (bw - 12) / 2,
      y: pad.t + innerH + 14,
      textAnchor: "middle",
      fontSize: "10.5",
      fill: "var(--chart-axis-label)",
      fontFamily: "var(--font-sans)"
    }, d.label), /*#__PURE__*/React.createElement("text", {
      x: x + (bw - 12) / 2,
      y: y - 4,
      textAnchor: "middle",
      fontSize: "10",
      fontWeight: "600",
      fill: "var(--text-primary)",
      fontFamily: "var(--font-mono)"
    }, d.value));
  })));
};

/* Live demo: sparklines */
const Sparkline = ({
  values,
  color,
  height = 28,
  width = 96,
  fill = false
}) => {
  const min = Math.min(...values),
    max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const pts = values.map((v, i) => [i * stepX, height - (v - min) / range * height]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${width} ${height}`,
    width: width,
    height: height,
    "aria-hidden": "true",
    style: {
      display: "block"
    }
  }, fill && /*#__PURE__*/React.createElement("path", {
    d: `${d} L${width} ${height} L0 ${height} Z`,
    fill: color,
    fillOpacity: "0.12"
  }), /*#__PURE__*/React.createElement("path", {
    d: d,
    fill: "none",
    stroke: color,
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: pts[pts.length - 1][0],
    cy: pts[pts.length - 1][1],
    r: "2",
    fill: color
  }));
};
const DemoSparklines = () => {
  const rows = [{
    label: "High-risk vessels",
    value: "412",
    delta: "+8.2%",
    up: true,
    color: "var(--chart-cat-1)",
    values: [320, 328, 335, 344, 360, 372, 389, 402, 408, 412]
  }, {
    label: "Sanction hits",
    value: "27",
    delta: "+12.5%",
    up: true,
    color: "var(--danger-500)",
    values: [12, 14, 18, 15, 19, 21, 24, 22, 25, 27]
  }, {
    label: "Avg. dwell time",
    value: "3.4d",
    delta: "-4.1%",
    up: false,
    color: "var(--success-500)",
    values: [4.2, 4.0, 3.9, 4.1, 3.8, 3.7, 3.6, 3.5, 3.5, 3.4]
  }, {
    label: "Policies expiring",
    value: "61",
    delta: "—",
    up: null,
    color: "var(--chart-cat-4)",
    values: [55, 58, 60, 62, 58, 60, 61, 59, 60, 61]
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "chart-demo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginBottom: 8
    }
  }, "Sparkline KPI strip"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, rows.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.label,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "8px 0",
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-caption",
    style: {
      marginBottom: 2
    }
  }, r.label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-numeric",
    style: {
      fontSize: 18,
      fontWeight: 700
    }
  }, r.value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: r.up === true ? "var(--danger-700)" : r.up === false ? "var(--success-700)" : "var(--text-muted)"
    }
  }, r.delta))), /*#__PURE__*/React.createElement(Sparkline, {
    values: r.values,
    color: r.color,
    fill: true
  })))));
};
const ChartAxisRules = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Element"), /*#__PURE__*/React.createElement("th", null, "Token"), /*#__PURE__*/React.createElement("th", null, "Rule"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Gridlines"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "--chart-grid")), /*#__PURE__*/React.createElement("td", null, "Horizontal only. Never vertical gridlines on a time x-axis.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Axis line"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "--chart-axis")), /*#__PURE__*/React.createElement("td", null, "1px, only on the value axis. Category axis line is omitted.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Axis labels"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "--chart-axis-label"), " \xB7 11px mono"), /*#__PURE__*/React.createElement("td", null, "Tabular numerals. No trailing zeros on whole values.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Tick density"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", null, "4\u20136 ticks on a value axis. Time axis ticks snap to natural breaks (5m, 1h, 1d).")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Threshold"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "--chart-threshold-warn"), " / ", /*#__PURE__*/React.createElement("code", null, "--chart-threshold-danger")), /*#__PURE__*/React.createElement("td", null, "Dashed 4\u20133, labelled at right edge.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Legend"), /*#__PURE__*/React.createElement("td", null, "Inline 12px, top-left"), /*#__PURE__*/React.createElement("td", null, "Omit when \u2264 1 series. Wrap to multi-line before truncating series names.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Empty state"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", null, "Show ", /*#__PURE__*/React.createElement("code", null, "\u2014"), " placeholder + caption \"No data in range.\" Never render an empty chart frame.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Loading"), /*#__PURE__*/React.createElement("td", null, "Skeleton"), /*#__PURE__*/React.createElement("td", null, "Skeleton matches chart aspect ratio. No spinning loaders inside chart frames."))));
const DataVizSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Categorical palette"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Eight ordered hues for qualitative series \u2014 pie slices, multi-line charts, stacked bars. Engineers select by index, never by hex. The palette is fixed so charts read the same across modules."), /*#__PURE__*/React.createElement(CategoricalPalette, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Sequential & divergent ramps"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "For heatmaps, choropleths, and risk gradients. Use sequential for one-direction quantities (volume, exposure); use divergent for signed values where zero is meaningful (P&L delta, change vs. baseline)."), /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement(SequentialRamp, {
  title: "Sequential \xB7 brand single-hue",
  vars: ["--chart-seq-1", "--chart-seq-2", "--chart-seq-3", "--chart-seq-4", "--chart-seq-5", "--chart-seq-6", "--chart-seq-7"],
  labels: ["low", "", "", "", "", "", "high"],
  desc: "Perceptually-uniform ramp built from --brand-050 \u2192 --brand-700."
}), /*#__PURE__*/React.createElement(SequentialRamp, {
  title: "Divergent \xB7 danger \u2194 neutral \u2194 success",
  vars: ["--chart-div-neg-3", "--chart-div-neg-2", "--chart-div-neg-1", "--chart-div-zero", "--chart-div-pos-1", "--chart-div-pos-2", "--chart-div-pos-3"],
  labels: ["−high", "", "", "0", "", "", "+high"],
  desc: "Always center on neutral. Asymmetric ranges should not stretch the ramp \u2014 clip and label instead."
}))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Patterns in context"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Live, token-driven examples. Bars + sparklines render directly in this page; the same tokens feed the Highcharts theme below."), /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement(DemoBarChart, null), /*#__PURE__*/React.createElement(DemoSparklines, null))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Axis, grid & legend rules"), /*#__PURE__*/React.createElement(ChartAxisRules, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "A\u2013E rating in charts"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "The product's A\u2013E risk grade is its own scale. Never substitute it with the categorical palette, and never blend it into a sequential ramp. Use the rating tokens as discrete fills, ordered A \u2192 E, with the same swatch shape as the ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".ds-rating"), " pill."), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-body"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 8,
    alignItems: "flex-end",
    height: 120
  }
}, [{
  r: "a",
  n: 38,
  label: "A"
}, {
  r: "b",
  n: 92,
  label: "B"
}, {
  r: "c",
  n: 71,
  label: "C"
}, {
  r: "d",
  n: 44,
  label: "D"
}, {
  r: "e",
  n: 18,
  label: "E"
}].map(x => /*#__PURE__*/React.createElement("div", {
  key: x.label,
  style: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: "100%",
    height: `${x.n}%`,
    background: `var(--rating-${x.r})`,
    borderRadius: 4
  }
}), /*#__PURE__*/React.createElement("span", {
  className: "t-mono",
  style: {
    fontSize: 11
  }
}, x.label, " \xB7 ", x.n))))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "Distribution of fleet by current rating \xB7 n=263"))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Highcharts theme"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Skytek's chart library is Highcharts. Wrap it in ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "app/ui/Chart"), " so every chart reads from tokens, not from the global Highcharts theme."), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// app/ui/Chart/theme.ts
import Highcharts from 'highcharts';

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

export const skytekChartTheme: Highcharts.Options = {
  colors: [
    css('--chart-cat-1'), css('--chart-cat-2'), css('--chart-cat-3'), css('--chart-cat-4'),
    css('--chart-cat-5'), css('--chart-cat-6'), css('--chart-cat-7'), css('--chart-cat-8'),
  ],
  chart: { backgroundColor: 'transparent', style: { fontFamily: css('--font-sans') } },
  title: { style: { fontSize: '14px', fontWeight: '600', color: css('--text-primary') } },
  xAxis: {
    lineColor: 'transparent',
    tickColor: css('--chart-axis'),
    labels: { style: { color: css('--chart-axis-label'), fontFamily: css('--font-mono'), fontSize: '11px' } },
  },
  yAxis: {
    gridLineColor: css('--chart-grid'),
    lineColor: css('--chart-axis'),
    labels: { style: { color: css('--chart-axis-label'), fontFamily: css('--font-mono'), fontSize: '11px' } },
  },
  legend: { itemStyle: { fontSize: '12px', color: css('--text-secondary') } },
  tooltip: {
    backgroundColor: css('--bg-inverse'),
    borderWidth: 0, borderRadius: 6, shadow: false,
    style: { color: css('--text-inverse'), fontSize: '12px' },
  },
  plotOptions: { series: { animation: { duration: 200 }, marker: { radius: 3 } } },
};

Highcharts.setOptions(skytekChartTheme);`)), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "Rule:"), " charts in modules never set ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "colors"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "fontFamily"), ", or axis colors directly. If a chart needs a non-default color, lift the value into a token first."), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 12
  }
}, /*#__PURE__*/React.createElement("strong", null, "Composite charts \u2192"), " the ready-made ", /*#__PURE__*/React.createElement("a", {
  href: "#charts",
  style: {
    color: "var(--brand-600)",
    fontWeight: 600
  }
}, "Bar, Line & Donut components"), " assemble these tokens and primitives into product-ready charts with built-in states and accessibility."));

/* ============================================================
   Maps & geospatial
   ============================================================ */

/* Canonical vessel type palette — matches MarineDashboard VESSEL_TYPES */
const VESSEL_TYPE_PALETTE = [{
  k: "Container",
  color: "#2563eb"
}, {
  k: "Bulk Carrier",
  color: "#3b82f6"
}, {
  k: "Tanker",
  color: "#ef4444"
}, {
  k: "Gas Carrier",
  color: "#f97316"
}, {
  k: "LNG Carrier",
  color: "#eab308"
}, {
  k: "General Cargo",
  color: "#22c55e"
}, {
  k: "Refrigerated Cargo",
  color: "#06b6d4"
}, {
  k: "Cruise Passenger",
  color: "#ec4899"
}, {
  k: "Vehicle Carrier",
  color: "#8b5cf6"
}, {
  k: "Yacht",
  color: "#f59e0b"
}];
const TileProviders = () => {
  const rows = [["Satellite", "default", "Esri World Imagery", "server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", "#0b1e2e"], ["Street View", "", "OpenStreetMap", "{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", "#e2e8f0"], ["Dark Mode", "", "CartoDB Dark Matter", "{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", "#0b0f1a"], ["Light Mode", "", "CartoDB Positron", "{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", "#f1f5f9"]];
  return /*#__PURE__*/React.createElement("table", {
    className: "spec-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Layer"), /*#__PURE__*/React.createElement("th", null), /*#__PURE__*/React.createElement("th", null, "Provider"), /*#__PURE__*/React.createElement("th", null, "Tile URL template"), /*#__PURE__*/React.createElement("th", null, "Fallback bg"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(([name, def, prov, url, bg]) => /*#__PURE__*/React.createElement("tr", {
    key: name
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, name)), /*#__PURE__*/React.createElement("td", null, def && /*#__PURE__*/React.createElement("span", {
    className: "ds-badge ds-badge--info"
  }, "default")), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 12.5,
      color: "var(--text-secondary)"
    }
  }, prov), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    style: {
      fontSize: 11
    }
  }, url)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "swatch-mini",
    style: {
      background: bg,
      width: 18,
      height: 18
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "t-mono",
    style: {
      fontSize: 11,
      color: "var(--text-muted)"
    }
  }, bg)))))));
};
const VesselTeardropGlyph = ({
  color,
  heading = 0,
  size = 16
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    display: "inline-flex",
    width: size,
    height: size,
    alignItems: "center",
    justifyContent: "center"
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-vessel-marker",
  style: {
    display: "inline-block",
    transform: `rotate(${heading + 45}deg)`,
    transformOrigin: "center"
  }
}, /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  width: size,
  height: size,
  style: {
    color,
    display: "block"
  },
  fill: "currentColor",
  stroke: "#fff",
  strokeWidth: "1.2",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 2 L19 20 L12 16 L5 20 Z"
}))));
const VesselTypeLegend = () => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8
  }
}, VESSEL_TYPE_PALETTE.map(t => /*#__PURE__*/React.createElement("span", {
  key: t.k,
  className: "vessel-type-swatch"
}, /*#__PURE__*/React.createElement("span", {
  className: "glyph",
  style: {
    background: "transparent",
    width: 0,
    height: 0,
    borderLeft: "6px solid transparent",
    borderRight: "6px solid transparent",
    borderBottom: `12px solid ${t.color}`,
    transform: "rotate(0deg)"
  }
}), t.k)));

/* Live Leaflet map embedded directly in the spec */
const LiveLeafletMap = () => {
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);
  React.useEffect(() => {
    if (!window.L || !ref.current || mapRef.current) return;
    const L = window.L;
    const map = L.map(ref.current, {
      center: [30, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 6,
      worldCopyJump: true,
      zoomControl: true,
      attributionControl: true
    });
    mapRef.current = map;
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap contributors © CARTO",
      maxZoom: 19
    }).addTo(map);
    const sample = [{
      name: "ATLANTIC PEARL",
      type: "Container",
      color: "#2563eb",
      lat: 45,
      lng: -30,
      heading: 75
    }, {
      name: "NORDIC STAR",
      type: "LNG Carrier",
      color: "#eab308",
      lat: 58,
      lng: 5,
      heading: 220
    }, {
      name: "MIRAMAR",
      type: "Tanker",
      color: "#ef4444",
      lat: 25,
      lng: 55,
      heading: 160
    }, {
      name: "SOUTHERN CROSS",
      type: "Bulk Carrier",
      color: "#3b82f6",
      lat: -25,
      lng: 30,
      heading: 320
    }, {
      name: "GULF VOYAGER",
      type: "Tanker",
      color: "#ef4444",
      lat: 28,
      lng: -90,
      heading: 90
    }, {
      name: "PACIFIC DAWN",
      type: "Container",
      color: "#2563eb",
      lat: 10,
      lng: 130,
      heading: 45
    }, {
      name: "ARCTIC WIND",
      type: "Gas Carrier",
      color: "#f97316",
      lat: 62,
      lng: -160,
      heading: 200
    }, {
      name: "BLUE HORIZON",
      type: "General Cargo",
      color: "#22c55e",
      lat: -10,
      lng: 100,
      heading: 270
    }, {
      name: "CORAL EXPLORER",
      type: "Cruise Passenger",
      color: "#ec4899",
      lat: 17,
      lng: -75,
      heading: 30
    }, {
      name: "SEASPRITE",
      type: "Yacht",
      color: "#f59e0b",
      lat: 38,
      lng: 18,
      heading: 120
    }];
    const mkIcon = v => L.divIcon({
      className: "",
      html: `<div class="ds-vessel-marker" style="transform: rotate(${v.heading + 45}deg); transform-origin: center;">
        <svg viewBox="0 0 24 24" width="16" height="16" style="color:${v.color};" fill="currentColor" stroke="#fff" stroke-width="1.2" stroke-linejoin="round">
          <path d="M12 2 L19 20 L12 16 L5 20 Z"/>
        </svg></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    const mkPopup = v => `
      <div class="vp">
        <div class="vp-header">
          <div>
            <div class="vp-title">${v.name}</div>
            <div class="vp-subtitle">${v.type}</div>
          </div>
        </div>
        <div class="vp-route">
          <div class="vp-port">
            <div class="vp-port-code">SG</div>
            <div class="vp-port-name">Singapore</div>
            <div class="vp-port-time">ADT: 04 Apr, 08:00</div>
          </div>
          <div class="vp-arrow">→</div>
          <div class="vp-port">
            <div class="vp-port-code">NL</div>
            <div class="vp-port-name">Rotterdam</div>
            <div class="vp-port-time">ETA: 19 Apr, 14:00</div>
          </div>
        </div>
        <div class="vp-grid">
          <div><div class="vp-k">Speed</div><div class="vp-v"><span class="vp-strong">14.2</span> kn</div></div>
          <div><div class="vp-k">Heading</div><div class="vp-v">${String(v.heading).padStart(3, "0")}°</div></div>
          <div><div class="vp-k">Draught</div><div class="vp-v"><span class="vp-strong">12.40</span> <span class="vp-muted">m</span></div></div>
          <div><div class="vp-k">Flag</div><div class="vp-v">Liberia</div></div>
          <div class="vp-span"><div class="vp-k">Nav status</div><div class="vp-v vp-nav">Underway Using Engine</div></div>
          <div class="vp-span"><div class="vp-k">Policy</div><div class="vp-v vp-strong">Hull & Machinery</div></div>
        </div>
        <a href="#" class="vp-cta" onclick="event.preventDefault()">View Full Vessel Details</a>
      </div>`;
    sample.forEach(v => {
      L.marker([v.lat, v.lng], {
        icon: mkIcon(v)
      }).bindPopup(mkPopup(v), {
        className: "ds-vessel-popup",
        maxWidth: 320,
        minWidth: 300,
        closeButton: true,
        autoPanPadding: [30, 30]
      }).addTo(map);
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "ds-leaflet",
    ref: ref,
    role: "region",
    "aria-label": "Live vessel map demo"
  });
};
const PopupTemplatePreview = () => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "center",
    padding: "24px",
    background: "var(--bg-canvas)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-default)"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 300,
    borderRadius: "var(--radius-xl)",
    overflow: "hidden",
    boxShadow: "var(--card-shadow-modal)"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "vp"
}, /*#__PURE__*/React.createElement("div", {
  className: "vp-header"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "vp-title"
}, "ATLANTIC PEARL"), /*#__PURE__*/React.createElement("div", {
  className: "vp-subtitle"
}, "Container Ship"))), /*#__PURE__*/React.createElement("div", {
  className: "vp-route"
}, /*#__PURE__*/React.createElement("div", {
  className: "vp-port"
}, /*#__PURE__*/React.createElement("div", {
  className: "vp-port-code"
}, "SG"), /*#__PURE__*/React.createElement("div", {
  className: "vp-port-name"
}, "Singapore"), /*#__PURE__*/React.createElement("div", {
  className: "vp-port-time"
}, "ADT: 04 Apr, 08:00")), /*#__PURE__*/React.createElement("div", {
  className: "vp-arrow"
}, "\u2192"), /*#__PURE__*/React.createElement("div", {
  className: "vp-port"
}, /*#__PURE__*/React.createElement("div", {
  className: "vp-port-code"
}, "NL"), /*#__PURE__*/React.createElement("div", {
  className: "vp-port-name"
}, "Rotterdam"), /*#__PURE__*/React.createElement("div", {
  className: "vp-port-time"
}, "ETA: 19 Apr, 14:00"))), /*#__PURE__*/React.createElement("div", {
  className: "vp-grid"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "vp-k"
}, "Speed"), /*#__PURE__*/React.createElement("div", {
  className: "vp-v"
}, /*#__PURE__*/React.createElement("span", {
  className: "vp-strong"
}, "14.2"), " kn")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "vp-k"
}, "Heading"), /*#__PURE__*/React.createElement("div", {
  className: "vp-v"
}, "075\xB0")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "vp-k"
}, "Draught"), /*#__PURE__*/React.createElement("div", {
  className: "vp-v"
}, /*#__PURE__*/React.createElement("span", {
  className: "vp-strong"
}, "12.40"), " ", /*#__PURE__*/React.createElement("span", {
  className: "vp-muted"
}, "m"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "vp-k"
}, "Flag"), /*#__PURE__*/React.createElement("div", {
  className: "vp-v"
}, "Liberia")), /*#__PURE__*/React.createElement("div", {
  className: "vp-span"
}, /*#__PURE__*/React.createElement("div", {
  className: "vp-k"
}, "Nav status"), /*#__PURE__*/React.createElement("div", {
  className: "vp-v vp-nav"
}, "Underway Using Engine")), /*#__PURE__*/React.createElement("div", {
  className: "vp-span"
}, /*#__PURE__*/React.createElement("div", {
  className: "vp-k"
}, "Policy"), /*#__PURE__*/React.createElement("div", {
  className: "vp-v vp-strong"
}, "Hull & Machinery"))), /*#__PURE__*/React.createElement("a", {
  href: "#",
  className: "vp-cta",
  onClick: e => e.preventDefault()
}, "View Full Vessel Details"))));
const MapToolbarPreview = () => /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    height: 200,
    background: "var(--bg-canvas)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-default)",
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    top: 12,
    left: 12,
    display: "flex",
    gap: 4
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-map-btn",
  title: "Zoom in"
}, "+"), /*#__PURE__*/React.createElement("button", {
  className: "ds-map-btn",
  title: "Zoom out"
}, "\u2212")), /*#__PURE__*/React.createElement("button", {
  className: "ds-map-btn",
  style: {
    position: "absolute",
    top: 12,
    left: 84
  },
  title: "Fullscreen"
}, /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
}))), /*#__PURE__*/React.createElement("div", {
  className: "ds-map-toolbar"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-map-btn",
  title: "Layers"
}, /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 2 2 7l10 5 10-5-10-5Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "m2 17 10 5 10-5"
}), /*#__PURE__*/React.createElement("path", {
  d: "m2 12 10 5 10-5"
}))), /*#__PURE__*/React.createElement("button", {
  className: "ds-map-btn",
  title: "Filter vessels"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.filter,
  size: 16
})), /*#__PURE__*/React.createElement("button", {
  className: "ds-map-btn",
  title: "Vessel labels"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.flag,
  size: 16
}))), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    bottom: 12,
    left: 12,
    fontSize: 11,
    color: "var(--text-muted)",
    background: "rgba(255,255,255,0.9)",
    padding: "4px 8px",
    borderRadius: 4
  }
}, "Controls only (basemap omitted)"));

/* Filter menu — vessel/asset type toggle popover (mirrors map-filters-menu) */
const FilterMenuPreview = () => {
  const [on, setOn] = React.useState(() => new Set(VESSEL_TYPE_PALETTE.map(t => t.k)));
  const toggle = k => setOn(prev => {
    const next = new Set(prev);
    next.has(k) ? next.delete(k) : next.add(k);
    return next;
  });
  const rows = VESSEL_TYPE_PALETTE.slice(0, 7);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      padding: 24,
      background: "var(--bg-canvas)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "asset-filter"
  }, /*#__PURE__*/React.createElement("div", {
    className: "asset-filter-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "asset-filter-title"
  }, "Filter Vessels"), /*#__PURE__*/React.createElement("div", {
    className: "asset-filter-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "asset-filter-btn",
    onClick: () => setOn(new Set(VESSEL_TYPE_PALETTE.map(t => t.k)))
  }, "All"), /*#__PURE__*/React.createElement("button", {
    className: "asset-filter-btn",
    onClick: () => setOn(new Set())
  }, "None"))), /*#__PURE__*/React.createElement("div", {
    className: "asset-filter-sub"
  }, "Vessel Type"), /*#__PURE__*/React.createElement("div", {
    className: "asset-filter-list"
  }, rows.map(t => /*#__PURE__*/React.createElement("label", {
    key: t.k,
    className: "asset-filter-row",
    onClick: e => {
      e.preventDefault();
      toggle(t.k);
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: on.has(t.k),
    readOnly: true
  }), /*#__PURE__*/React.createElement("span", {
    className: "asset-filter-glyph"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    style: {
      transform: "rotate(45deg)",
      color: t.color
    },
    fill: "currentColor",
    stroke: "currentColor",
    strokeWidth: "1",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2 L19 20 L12 16 L5 20 Z"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, t.k))))));
};

/* Selection & hover states — the white ring around a marker */
const SelectionStates = () => /*#__PURE__*/React.createElement("div", {
  className: "grid-3",
  style: {
    alignItems: "stretch"
  }
}, [{
  label: "Rest",
  ring: false,
  z: "auto"
}, {
  label: "Hover",
  ring: true,
  z: "lifted"
}, {
  label: "Selected (popup open)",
  ring: true,
  z: "lifted"
}].map(s => /*#__PURE__*/React.createElement("div", {
  key: s.label,
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    justifyContent: "center"
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "sel-demo"
}, s.ring && /*#__PURE__*/React.createElement("span", {
  className: "sel-ring"
}), /*#__PURE__*/React.createElement(VesselTeardropGlyph, {
  color: "#2563eb",
  heading: 45,
  size: 20
}))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, s.label, " \xB7 z-index ", /*#__PURE__*/React.createElement("code", null, s.z)))));

/* ── Cross-domain marker glyphs (mirror the live product markers) ───── */
const AircraftGlyph = ({
  heading = 0,
  size = 26,
  color = "#eab308"
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    display: "inline-flex",
    width: size,
    height: size,
    alignItems: "center",
    justifyContent: "center"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    display: "inline-block",
    transform: `rotate(${heading}deg)`,
    color,
    filter: "drop-shadow(0 1px 2px rgba(0,0,0,.4))"
  }
}, /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  width: size,
  height: size,
  fill: "currentColor",
  stroke: "none",
  style: {
    display: "block"
  }
}, /*#__PURE__*/React.createElement("path", {
  d: "M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
}))));
const AirportPin = ({
  size = 30
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    width: size,
    height: size,
    borderRadius: 8,
    background: "var(--brand-600)",
    border: "2px solid #fff",
    boxShadow: "0 2px 6px rgba(0,0,0,.28)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff"
  }
}, /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  width: size * 0.5,
  height: size * 0.5,
  fill: "currentColor"
}, /*#__PURE__*/React.createElement("path", {
  d: "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
})));
const OffshoreDot = ({
  color,
  label
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: color,
    border: "2px solid #fff",
    boxShadow: "0 2px 4px rgba(0,0,0,.3)"
  }
}), label && /*#__PURE__*/React.createElement("span", {
  style: {
    background: "#1e293b",
    color: "#fff",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
    whiteSpace: "nowrap"
  }
}, label));
const PropertyPin = ({
  color,
  ico,
  alert,
  size = 34
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    position: "relative",
    width: size,
    height: size,
    borderRadius: 8,
    background: color,
    border: "2px solid #fff",
    boxShadow: "0 2px 6px rgba(0,0,0,.28)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    display: "inline-flex"
  },
  dangerouslySetInnerHTML: {
    __html: ico
  }
}), alert && /*#__PURE__*/React.createElement("span", {
  style: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 11,
    height: 11,
    borderRadius: "50%",
    background: "#dc2626",
    border: "2px solid #fff",
    boxShadow: "0 0 0 0 rgba(220,38,38,.55)",
    animation: "anchor-pulse 1.6s infinite"
  }
}));
const OFFSHORE_ASSETS = [{
  k: "Oil Rig",
  color: "#ef4444"
}, {
  k: "Platform",
  color: "#06b6d4"
}, {
  k: "Windfarm",
  color: "#10b981"
}, {
  k: "Floating Storage (FSO)",
  color: "#8b5cf6"
}, {
  k: "Fixed Platform",
  color: "#ec4899"
}, {
  k: "Jack-Up Drilling Unit",
  color: "#f59e0b"
}, {
  k: "Mobile Drilling (MODU)",
  color: "#3b82f6"
}, {
  k: "Mobile Production (MOPU)",
  color: "#ea580c"
}, {
  k: "Single Point Mooring (SPM)",
  color: "#0ea5e9"
}, {
  k: "Subsea",
  color: "#14b8a6"
}, {
  k: "Well",
  color: "#a855f7"
}, {
  k: "Other",
  color: "#64748b"
}];
const PROPERTY_CATS = [{
  k: "Corporate & Office",
  color: "#2563eb",
  ico: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M12 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/></svg>`
}, {
  k: "Industrial & Logistics",
  color: "#ea580c",
  ico: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>`
}, {
  k: "Infrastructure & Energy",
  color: "#16a34a",
  ico: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
}, {
  k: "Retail & Hospitality",
  color: "#ec4899",
  ico: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><line x1="2" y1="7" x2="22" y2="7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a3 3 0 0 0-3-3v0a3 3 0 0 0-3 3v4"/></svg>`
}];
const MapsSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Library: Leaflet"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Skytek uses ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "leaflet@1.9.4"), " as its canonical map library across Marine, Aviation, Offshore, NatCat and Ports. No second mapping library ships with the product. Choose Leaflet primitives (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "L.tileLayer"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "L.marker"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "L.divIcon"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "L.popup"), ") \u2014 never roll a new map runtime."), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `<!-- Load order — pin to 1.9.4 across all surfaces -->
<link rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin="" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""></script>`)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Basemaps \u2014 four tile providers"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Every Skytek map ships with the same four basemap options behind the ", /*#__PURE__*/React.createElement("strong", null, "Layers"), " button. Satellite is the default in operator-facing surfaces; Light is the default in printable reports. Engineers don't pick custom providers \u2014 these four are the contract."), /*#__PURE__*/React.createElement(TileProviders, null), /*#__PURE__*/React.createElement("div", {
  className: "callout warn",
  style: {
    marginTop: 12
  }
}, /*#__PURE__*/React.createElement("strong", null, "Attribution is non-negotiable."), " Every tile layer must keep its ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "attribution"), " string. Removing the OSM / Carto / Esri credit violates their license."), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 12,
    marginBottom: 6
  }
}, "The ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "setMapType"), " helper switches layers and syncs the gap-fill background color so transitions don't flash white:"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// app/ui/Map/tiles.ts
export const TILES = {
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
               attr: 'Tiles © Esri', bg: '#0b1e2e' },
  street:    { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
               attr: '© OpenStreetMap contributors', bg: '#e2e8f0' },
  dark:      { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
               attr: '© OpenStreetMap contributors © CARTO', bg: '#0b0f1a' },
  light:     { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
               attr: '© OpenStreetMap contributors © CARTO', bg: '#f1f5f9' },
} as const;`)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Live map"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "A real Leaflet instance, the same configuration used by Marine Dashboard. Click a vessel to see the canonical popup. Drag to pan, scroll to zoom."), /*#__PURE__*/React.createElement(LiveLeafletMap, null), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "Embedded with CartoDB Positron for the spec; the product defaults to Esri World Imagery.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Vessel marker \u2014 teardrop divIcon"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "One canonical marker shape: a 16 \xD7 16 teardrop SVG inside a Leaflet ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "L.divIcon"), ".", /*#__PURE__*/React.createElement("strong", null, " Rotation"), " encodes heading (degrees true). ", /*#__PURE__*/React.createElement("strong", null, "Fill color"), " encodes vessel type \u2014 sourced from the locked type palette below."), /*#__PURE__*/React.createElement("div", {
  className: "grid-2",
  style: {
    alignItems: "flex-start"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Heading rotation")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    gap: 24,
    alignItems: "center",
    justifyContent: "space-around"
  }
}, [0, 45, 90, 180, 270].map(h => /*#__PURE__*/React.createElement("div", {
  key: h,
  style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6
  }
}, /*#__PURE__*/React.createElement(VesselTeardropGlyph, {
  color: "#2563eb",
  heading: h,
  size: 28
}), /*#__PURE__*/React.createElement("span", {
  className: "t-mono",
  style: {
    fontSize: 11,
    color: "var(--text-muted)"
  }
}, String(h).padStart(3, "0"), "\xB0")))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "SVG rotation = ", /*#__PURE__*/React.createElement("code", null, "heading + 45\xB0"), " (teardrop tip points east at 0).")), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Type palette")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body"
}, /*#__PURE__*/React.createElement(VesselTypeLegend, null)), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "Locked. Adding a vessel type requires an RFC and an update to ", /*#__PURE__*/React.createElement("code", null, "VESSEL_TYPES"), "."))), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 12,
    marginBottom: 6
  }
}, "Canonical factory \u2014 every vessel marker in the product is built this way:"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// app/ui/Map/vesselIcon.ts
import L from 'leaflet';

export function vesselIcon(color: string, heading: number) {
  // Heading 0 (north) points the teardrop "up". The SVG path's tip naturally
  // points NE, so we add 45° to align it to compass north.
  const html = \`
    <div class="ds-vessel-marker"
         style="transform: rotate(\${heading + 45}deg); transform-origin: center;">
      <svg viewBox="0 0 24 24" width="16" height="16" style="color:\${color};"
           fill="currentColor" stroke="#fff" stroke-width="1.2" stroke-linejoin="round">
        <path d="M12 2 L19 20 L12 16 L5 20 Z"/>
      </svg>
    </div>\`;
  return L.divIcon({ html, className: '', iconSize: [16, 16], iconAnchor: [8, 8] });
}

export function vesselLabelIcon(name: string) {
  return L.divIcon({
    html: \`<div class="ds-vessel-label">\${name}</div>\`,
    className: 'ds-vessel-label-wrap',
    iconSize: [0, 0], iconAnchor: [-10, 7],
  });
}`)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Markers across domains"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "The vessel teardrop is one instance of a single cross-domain system. Every asset class \u2014 vessel, aircraft, airport, offshore installation, property \u2014 gets ", /*#__PURE__*/React.createElement("strong", null, "one canonical marker"), ", and all of them encode information on the same four channels. This is what lets an operator read any Skytek map the same way, whether they're in Marine, Aviation, Offshore or Property."), /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    marginBottom: 16
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Channel"), /*#__PURE__*/React.createElement("th", null, "Encodes"), /*#__PURE__*/React.createElement("th", null, "Applies to"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Shape")), /*#__PURE__*/React.createElement("td", null, "Asset class"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "teardrop = vessel \xB7 aircraft glyph = flight \xB7 square pin = property \xB7 brand pin = airport \xB7 dot = offshore installation")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Fill color")), /*#__PURE__*/React.createElement("td", null, "Type / category ", /*#__PURE__*/React.createElement("em", null, "within"), " the class"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "vessel type \xB7 asset type \xB7 property category (airport & aircraft fills are fixed)")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Rotation")), /*#__PURE__*/React.createElement("td", null, "Heading (degrees true)"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "moving assets only \u2014 vessels & aircraft. Static installations never rotate.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Overlay"), " ", /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "(pulse / badge)")), /*#__PURE__*/React.createElement("td", null, "Status & alerts"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "sanctioned vessel, property risk pulse \u2014 never a recolor of the glyph")))), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    marginBottom: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "One shape per asset class"), /*#__PURE__*/React.createElement("span", {
  className: "meta"
}, "Leaflet ", /*#__PURE__*/React.createElement("code", {
  style: {
    fontSize: 11
  }
}, "L.divIcon"))), /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    flexWrap: "wrap",
    gap: 28,
    alignItems: "flex-start"
  }
}, [{
  comp: /*#__PURE__*/React.createElement(VesselTeardropGlyph, {
    color: "#2563eb",
    heading: 45,
    size: 30
  }),
  name: "Vessel",
  sub: "teardrop · type + heading",
  domain: "Marine"
}, {
  comp: /*#__PURE__*/React.createElement(AircraftGlyph, {
    heading: 45,
    size: 28
  }),
  name: "Aircraft",
  sub: "amber glyph · heading",
  domain: "Aviation"
}, {
  comp: /*#__PURE__*/React.createElement(AirportPin, {
    size: 30
  }),
  name: "Airport",
  sub: "brand pin · static",
  domain: "Aviation"
}, {
  comp: /*#__PURE__*/React.createElement(OffshoreDot, {
    color: "#06b6d4"
  }),
  name: "Installation",
  sub: "dot + label · asset type",
  domain: "Offshore"
}, {
  comp: /*#__PURE__*/React.createElement(PropertyPin, {
    color: "#2563eb",
    ico: PROPERTY_CATS[0].ico,
    size: 32
  }),
  name: "Property",
  sub: "square pin · category",
  domain: "Property"
}].map(g => /*#__PURE__*/React.createElement("div", {
  key: g.name,
  style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    width: 96,
    textAlign: "center"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    height: 40,
    display: "flex",
    alignItems: "center"
  }
}, g.comp), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12.5,
    fontWeight: 600
  }
}, g.name), /*#__PURE__*/React.createElement("div", {
  className: "t-caption",
  style: {
    fontSize: 11
  }
}, g.sub), /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--neutral",
  style: {
    fontSize: 10
  }
}, g.domain)))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "All markers share the canonical close behavior, popup template family, and the four-channel encoding above.")), /*#__PURE__*/React.createElement("div", {
  className: "grid-2",
  style: {
    alignItems: "flex-start"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Aviation")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 18,
    alignItems: "center",
    justifyContent: "space-around"
  }
}, [0, 90, 180, 270].map(h => /*#__PURE__*/React.createElement("div", {
  key: h,
  style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6
  }
}, /*#__PURE__*/React.createElement(AircraftGlyph, {
  heading: h,
  size: 26
}), /*#__PURE__*/React.createElement("span", {
  className: "t-mono",
  style: {
    fontSize: 11,
    color: "var(--text-muted)"
  }
}, String(h).padStart(3, "0"), "\xB0")))), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    margin: 0
  }
}, "Aircraft are a single class \u2014 fill is fixed amber (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "#eab308"), "), ", /*#__PURE__*/React.createElement("strong", null, "rotation encodes heading"), ". Airports are static infrastructure: a brand-blue pin with a white glyph, no rotation.")), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "Status (cruising / climbing / descending) lives in the popup, not the glyph color.")), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Offshore / Energy"), /*#__PURE__*/React.createElement("span", {
  className: "meta"
}, "fill = asset type")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8
  }
}, OFFSHORE_ASSETS.map(a => /*#__PURE__*/React.createElement("span", {
  key: a.k,
  className: "vessel-type-swatch"
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: a.color,
    border: "1.5px solid #fff",
    boxShadow: "0 1px 2px rgba(0,0,0,.25)",
    flexShrink: 0
  }
}), a.k)))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "Static dot + optional name label. Filterable by type; no rotation."))), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    marginTop: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Property"), /*#__PURE__*/React.createElement("span", {
  className: "meta"
}, "fill = category \xB7 pulse = active risk")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
    alignItems: "center"
  }
}, PROPERTY_CATS.map(c => /*#__PURE__*/React.createElement("div", {
  key: c.k,
  style: {
    display: "flex",
    alignItems: "center",
    gap: 10
  }
}, /*#__PURE__*/React.createElement(PropertyPin, {
  color: c.color,
  ico: c.ico,
  size: 32
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 12.5,
    color: "var(--text-secondary)"
  }
}, c.k))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginLeft: "auto"
  }
}, /*#__PURE__*/React.createElement(PropertyPin, {
  color: "#2563eb",
  ico: PROPERTY_CATS[0].ico,
  alert: true,
  size: 32
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 12.5,
    color: "var(--danger-700)",
    fontWeight: 600
  }
}, "+ active risk pulse"))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "Rounded-square pin with a white category glyph. The pulsing red corner dot is the ", /*#__PURE__*/React.createElement("em", null, "status overlay"), " \u2014 same rule as a sanctioned vessel.")), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 12,
    marginBottom: 6
  }
}, "Each domain ships one ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "divIcon"), " factory \u2014 same structure as ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "vesselIcon"), ", differing only in shape and what each channel encodes:"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// app/ui/Map/markers/aircraft.ts — fill fixed, rotation = heading
export const aircraftIcon = (heading: number) => L.divIcon({
  className: '', iconSize: [24, 24], iconAnchor: [12, 12],
  html: \`<div style="transform:rotate(\${heading}deg);color:var(--aviation-aircraft,#eab308)">\${PLANE_SVG}</div>\`,
});

// app/ui/Map/markers/airport.ts — static infrastructure pin
export const airportIcon = () => L.divIcon({
  className: '', iconSize: [32, 32], iconAnchor: [16, 16],
  html: \`<div class="rw-pin rw-pin--brand">\${PLANE_WHITE_SVG}</div>\`,
});

// app/ui/Map/markers/offshore.ts — fill = asset type, optional label
export const offshoreIcon = (color: string, label?: string) => L.divIcon({
  className: '', iconSize: [120, 40], iconAnchor: [60, 20],
  html: \`<div class="rw-offshore"><span class="rw-offshore-dot" style="background:\${color}"></span>\${label ? \`<span class="rw-offshore-label">\${label}</span>\` : ''}</div>\`,
});

// app/ui/Map/markers/property.ts — fill = category, alert = status overlay
export const propertyIcon = (color: string, glyph: string, alert = false) => L.divIcon({
  className: '', iconSize: [34, 34], iconAnchor: [17, 17],
  html: \`<div class="rw-pin" style="background:\${color}">\${glyph}\${alert ? '<span class="rw-pin-pulse"></span>' : ''}</div>\`,
});`), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 12
  }
}, /*#__PURE__*/React.createElement("strong", null, "Open question for the team:"), " aircraft currently use a single fixed fill. If aviation needs type/operator differentiation on the glyph (as Marine does for vessel type), that's an RFC to add an aircraft-class palette \u2014 keeping fill = type consistent across every domain.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Status overlays"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Vessel ", /*#__PURE__*/React.createElement("em", null, "type"), " owns the fill. Status (sanctioned, AIS silence, route deviation) is layered on as an overlay \u2014 a pulsing ring, an alert badge, or a tag in the popup \u2014 never as a color change to the glyph itself. This is the rule that lets operators read \"what is this asset\" and \"what's wrong with it\" as two separate questions."), /*#__PURE__*/React.createElement("div", {
  className: "dodont"
}, /*#__PURE__*/React.createElement("div", {
  className: "do"
}, /*#__PURE__*/React.createElement("div", {
  className: "hd"
}, "DO"), /*#__PURE__*/React.createElement("div", {
  className: "bd",
  style: {
    flexDirection: "column",
    gap: 12,
    padding: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 16
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    position: "relative",
    display: "inline-flex"
  }
}, /*#__PURE__*/React.createElement(VesselTeardropGlyph, {
  color: "#ef4444",
  heading: 0,
  size: 28
}), /*#__PURE__*/React.createElement("span", {
  style: {
    position: "absolute",
    top: -3,
    right: -6,
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "var(--danger-500)",
    border: "2px solid #fff",
    boxShadow: "0 0 0 0 rgba(220,38,38,.55)",
    animation: "anchor-pulse 1.8s infinite"
  }
})), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontWeight: 700,
    fontSize: 13
  }
}, "Tanker \xB7 ", /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--danger"
}, "SANCTIONED")), /*#__PURE__*/React.createElement("div", {
  className: "t-caption"
}, "Type = color. Status = overlay badge or pulse."))))), /*#__PURE__*/React.createElement("div", {
  className: "dont"
}, /*#__PURE__*/React.createElement("div", {
  className: "hd"
}, "DON'T"), /*#__PURE__*/React.createElement("div", {
  className: "bd",
  style: {
    flexDirection: "column",
    gap: 12,
    padding: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 16
  }
}, /*#__PURE__*/React.createElement(VesselTeardropGlyph, {
  color: "#7c2d12",
  heading: 0,
  size: 28
}), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontWeight: 700,
    fontSize: 13
  }
}, "Tanker recolored to \"sanctioned brown\""), /*#__PURE__*/React.createElement("div", {
  className: "t-caption"
}, "Overloads one channel with two meanings. Operators can no longer scan by type."))))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Popup template \u2014 ", /*#__PURE__*/React.createElement("code", null, ".vp")), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "One template, four parts: ", /*#__PURE__*/React.createElement("strong", null, "header"), " (brand fill, vessel name, type subtitle) \xB7 ", /*#__PURE__*/React.createElement("strong", null, "route"), " (origin \u2192 destination ports with ADT/ETA) \xB7", /*#__PURE__*/React.createElement("strong", null, "grid"), " (vessel data in 2-column key/value pairs) \xB7 ", /*#__PURE__*/React.createElement("strong", null, "CTA"), " (link to the full vessel detail page). 300 px wide, brand-blue header, 12.5 px body, tabular numerals for numbers."), /*#__PURE__*/React.createElement(PopupTemplatePreview, null), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 12,
    marginBottom: 6
  }
}, "Render with ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "bindPopup"), " + the ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "ds-vessel-popup"), " wrapper class:"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `marker.bindPopup(vesselPopupHTML(v), {
  className: 'ds-vessel-popup',
  maxWidth: 320, minWidth: 300,
  closeButton: true,
  autoPanPadding: [30, 30],
});`)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Map control toolbar"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Four canonical controls, in fixed positions: ", /*#__PURE__*/React.createElement("strong", null, "zoom"), " (top-left, Leaflet default) \xB7 ", /*#__PURE__*/React.createElement("strong", null, "fullscreen"), " (top-left, beside zoom) \xB7", /*#__PURE__*/React.createElement("strong", null, " layers / filters / labels"), " (top-right, vertical stack). Buttons are 32 \xD7 32, white surface, ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--radius-lg"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--card-shadow-rest"), "."), /*#__PURE__*/React.createElement(MapToolbarPreview, null), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "Menus open ", /*#__PURE__*/React.createElement("em", null, "left-of"), " their trigger (top-right controls open inward), 240 px wide, white surface, ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--card-shadow-hover"), ", and dismiss on outside-click or ", /*#__PURE__*/React.createElement("kbd", null, "Esc"), ".")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Filter menu"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "The ", /*#__PURE__*/React.createElement("strong", null, "filter"), " control opens a type toggle: a header with ", /*#__PURE__*/React.createElement("strong", null, "All / None"), " shortcuts, a section label, and one row per type \u2014 a checkbox, the type's marker glyph in its locked color, and the label. Toggling a type hides or shows its markers (and their labels) in place; the selection persists in page state, so it survives basemap switches and re-renders. Marine filters by ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "VESSEL_TYPES"), "; Offshore filters by ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "ASSET_TYPES"), " \u2014 same component, different list."), /*#__PURE__*/React.createElement(FilterMenuPreview, null), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "The glyph in each row is the same marker drawn on the map, so the legend and the filter are one and the same \u2014 no separate key to learn.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Selection & hover states"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Markers are interactive. On ", /*#__PURE__*/React.createElement("strong", null, "hover"), ", a 24 px white ring with a soft shadow appears around the glyph and the marker lifts above its neighbours (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "z-index"), " raised). Opening a marker's popup adds ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".is-selected"), ", which keeps the ring on while the popup is open. The ring is the one selection affordance across every domain \u2014 it never recolors or resizes the glyph itself."), /*#__PURE__*/React.createElement(SelectionStates, null), /*#__PURE__*/React.createElement("div", {
  className: "grid-2",
  style: {
    marginTop: 14,
    alignItems: "flex-start"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "Hover tooltip vs. label."), " Hovering a marker shows a dark tooltip (flag + name + type). When the ", /*#__PURE__*/React.createElement("strong", null, "Labels"), " toggle is on, names render permanently beside every marker and the hover tooltip is suppressed \u2014 the name is already on the map, so a tooltip would just repeat it."), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "One close model."), " Popups close on the \xD7 button, on outside-click, or on opening another marker. Only one popup is open at a time; selecting a new marker deselects the previous."))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Clustering"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Below ~30 px separation, aggregate vessels into a cluster bubble. Bubble color follows the dominant vessel type; if any clustered vessel is flagged sanctioned or AIS-silent, the bubble gets a pulsing danger ring overlay (same overlay rule as a single marker)."), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    alignItems: "center",
    gap: 24
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "map-cluster map-cluster--sm"
}, "7"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "small \xB7 < 10")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "map-cluster map-cluster--md"
}, "42"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "medium \xB7 10\u201399")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "map-cluster map-cluster--lg"
}, "218"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "large \xB7 100+")), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    color: "var(--text-secondary)",
    fontSize: 13
  }
}, "Use ", /*#__PURE__*/React.createElement("code", null, "leaflet.markercluster"), " when a layer exceeds 200 markers. Below that, render individually \u2014 clustering at low density hides real positions.")))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Performance"), /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Constraint"), /*#__PURE__*/React.createElement("th", null, "Rule"), /*#__PURE__*/React.createElement("th", null, "Why"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Max markers per layer"), /*#__PURE__*/React.createElement("td", null, "\u2264 5,000 without clustering"), /*#__PURE__*/React.createElement("td", null, "Above this, Leaflet's DOM marker layer hits frame-rate cliffs.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Tile prefetch"), /*#__PURE__*/React.createElement("td", null, "Disabled"), /*#__PURE__*/React.createElement("td", null, "Esri / Carto rate-limit anonymous tiles. Don't pre-warm tiles the user can't see.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Marker rotation"), /*#__PURE__*/React.createElement("td", null, "CSS transform on inner div, not SVG ", /*#__PURE__*/React.createElement("code", null, "transform")), /*#__PURE__*/React.createElement("td", null, "Composited rotation is GPU-accelerated; SVG attribute rotation re-rasterizes.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Popup content"), /*#__PURE__*/React.createElement("td", null, "HTML string, not React"), /*#__PURE__*/React.createElement("td", null, "Leaflet popups are mounted outside React's tree \u2014 keep them framework-free.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Fullscreen"), /*#__PURE__*/React.createElement("td", null, "CSS class swap, not native Fullscreen API"), /*#__PURE__*/React.createElement("td", null, "Avoids permission prompt; map can render alongside other UI in inspect tools."))))), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 24
  }
}, /*#__PURE__*/React.createElement("strong", null, "Single source of truth:"), " the tile providers, the teardrop divIcon, the type palette, and the ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".vp"), " popup template all live in ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "app/ui/Map/*"), ". Marine, Aviation, Offshore and NatCat surfaces import from there \u2014 never copy-paste the marker factory or popup HTML into a module."));

/* ============================================================
   Formatting: time, date, number, units
   ============================================================ */

const FormatTimeTable = () => /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Time & date"), /*#__PURE__*/React.createElement("span", {
  className: "meta"
}, "UTC is the canonical wire format")), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "8px 0"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Relative"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "2 min ago"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "Within 60 min. Live-updating. Pair with absolute on hover.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Time-of-day"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "14:32 UTC"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "Always include the zone. 24h clock everywhere \u2014 no AM/PM.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Date \xB7 short"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "28 Apr 2026"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "For lists and tables. Month abbreviated, year always shown.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Date \xB7 long"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "Tuesday, 28 April 2026"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "For report headers and confirmation modals.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Date + time"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "28 Apr 2026 \xB7 14:32 UTC"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "Audit logs, event timelines.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "ISO 8601"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "2026-04-28T14:32:00Z"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "Only in raw data exports, API payload displays, and CSV.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Duration"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "3d 4h \xB7 14m 02s"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "Two largest units. Drop seconds above 1h.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Range"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "21\u201328 Apr 2026"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "Collapse repeated month/year. Use en-dash, not hyphen."))));
const FormatNumberTable = () => /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Numbers"), /*#__PURE__*/React.createElement("span", {
  className: "meta"
}, "Tabular numerals \xB7 en-IE / en-GB grouping")), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "8px 0"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Integer"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "1,247,832"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "Group with comma. No grouping below 10,000? \u2014 always group.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Decimal"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "12.45"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "Two places by default. Three for coordinates, ratios < 0.1.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Compact"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "1.2M \xB7 248K \xB7 14.7B"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "Tile values, sparkline labels, dense tables. Never in legal/compliance copy.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Percent"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "84.2%"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "One decimal. Zero decimals on dashboards if precision < 1% is meaningless.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Signed delta"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "+8.2% \xB7 \u22124.1%"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "Always include the sign (use Unicode \"\u2212\", not hyphen). Pair with up/down arrow.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Currency"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "$2.4M \xB7 \u20AC1.18bn \xB7 \xA3842K"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "Currency symbol leads. Use 3-letter ISO in tables: USD 2,400,000.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Coordinates"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "51.5074\xB0 N, 0.1278\xB0 W"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "Degrees + cardinal. Four decimals (\u2248 11 m). Never sign-prefix.")), /*#__PURE__*/React.createElement("div", {
  className: "format-example"
}, /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Empty / null"), /*#__PURE__*/React.createElement("span", {
  className: "out"
}, "\u2014"), /*#__PURE__*/React.createElement("span", {
  className: "desc"
}, "An em-dash. Never \"N/A\", \"null\", \"0\", or a blank cell."))));
const DomainUnits = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Quantity"), /*#__PURE__*/React.createElement("th", null, "Unit"), /*#__PURE__*/React.createElement("th", null, "Symbol"), /*#__PURE__*/React.createElement("th", null, "Example"), /*#__PURE__*/React.createElement("th", null, "Notes"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Vessel speed"), /*#__PURE__*/React.createElement("td", null, "Knot"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "kn")), /*#__PURE__*/React.createElement("td", null, "12.4 kn"), /*#__PURE__*/React.createElement("td", null, "Never \"knots\" in UI. Space before symbol.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Distance \xB7 maritime"), /*#__PURE__*/React.createElement("td", null, "Nautical mile"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "nm")), /*#__PURE__*/React.createElement("td", null, "248 nm"), /*#__PURE__*/React.createElement("td", null, "Lowercase. Disambiguate from nanometer by context only.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Distance \xB7 land"), /*#__PURE__*/React.createElement("td", null, "Kilometre"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "km")), /*#__PURE__*/React.createElement("td", null, "1,420 km"), /*#__PURE__*/React.createElement("td", null, "SI default everywhere except maritime.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Aviation altitude"), /*#__PURE__*/React.createElement("td", null, "Flight level"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "FL")), /*#__PURE__*/React.createElement("td", null, "FL 380"), /*#__PURE__*/React.createElement("td", null, "Always uppercase, no decimal.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Cargo \xB7 liquid"), /*#__PURE__*/React.createElement("td", null, "Barrel"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "bbl")), /*#__PURE__*/React.createElement("td", null, "1.4M bbl"), /*#__PURE__*/React.createElement("td", null, "Compact form OK on tiles.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Cargo \xB7 dry"), /*#__PURE__*/React.createElement("td", null, "Tonne"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "t")), /*#__PURE__*/React.createElement("td", null, "82,400 t"), /*#__PURE__*/React.createElement("td", null, "Lowercase. Metric tonne implied.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Bearing / heading"), /*#__PURE__*/React.createElement("td", null, "Degrees"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "\xB0")), /*#__PURE__*/React.createElement("td", null, "087\xB0"), /*#__PURE__*/React.createElement("td", null, "Three-digit pad. Always degrees true.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Temperature"), /*#__PURE__*/React.createElement("td", null, "Celsius"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "\xB0C")), /*#__PURE__*/React.createElement("td", null, "4.2 \xB0C"), /*#__PURE__*/React.createElement("td", null, "Space before symbol. Fahrenheit only in US-locale toggle.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Time interval"), /*#__PURE__*/React.createElement("td", null, "Minutes / hours"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "m"), " / ", /*#__PURE__*/React.createElement("code", null, "h")), /*#__PURE__*/React.createElement("td", null, "14m \xB7 3h 20m"), /*#__PURE__*/React.createElement("td", null, "Compact, no spaces. See Duration above."))));
const FormatHelperAPI = () => /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// app/lib/format.ts — the only correct place these live.
// Modules must NOT call Intl directly; everything routes through here so locale,
// timezone, and product conventions stay consistent.

import { format as fmt } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export const formatDate = (d: Date, variant: 'short' | 'long' | 'iso' = 'short') => {
  switch (variant) {
    case 'short': return fmt(d, 'd MMM yyyy');           // 28 Apr 2026
    case 'long':  return fmt(d, 'EEEE, d MMMM yyyy');    // Tuesday, 28 April 2026
    case 'iso':   return d.toISOString();
  }
};

export const formatTime = (d: Date, opts: { zone?: string } = {}) => {
  const zone = opts.zone ?? 'UTC';
  const zoned = utcToZonedTime(d, zone);
  return \`\${fmt(zoned, 'HH:mm')} \${zone === 'UTC' ? 'UTC' : zone}\`;
};

export const formatRelative = (d: Date, now = new Date()) => {
  const sec = Math.round((now.getTime() - d.getTime()) / 1000);
  if (sec < 60)   return \`\${sec}s ago\`;
  if (sec < 3600) return \`\${Math.round(sec / 60)} min ago\`;
  if (sec < 86400) return \`\${Math.round(sec / 3600)}h ago\`;
  return formatDate(d, 'short');
};

export const formatNumber = (n: number, opts: { decimals?: number; compact?: boolean } = {}) => {
  if (n == null || Number.isNaN(n)) return '—';
  if (opts.compact) {
    return new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  }
  return new Intl.NumberFormat('en-GB', { maximumFractionDigits: opts.decimals ?? 2 }).format(n);
};

export const formatDelta = (pct: number) => {
  if (pct == null) return '—';
  const sign = pct > 0 ? '+' : pct < 0 ? '−' : '';
  return \`\${sign}\${formatNumber(Math.abs(pct), { decimals: 1 })}%\`;
};

export const formatUnit = (value: number, unit: 'kn' | 'nm' | 'km' | 'bbl' | 't' | '°C') => {
  return \`\${formatNumber(value, { decimals: unit === 'bbl' ? 0 : 1 })} \${unit}\`;
};

export const NULL_DISPLAY = '—';`);
const FormattingSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Time & date"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Skytek is a global product \u2014 operators in Dublin, Houston and Singapore look at the same alert. UTC is the canonical wire format; the local-time toggle is a presentation concern. The rules below close the gap between API payloads and what an operator reads."), /*#__PURE__*/React.createElement(FormatTimeTable, null), /*#__PURE__*/React.createElement("div", {
  className: "grid-2",
  style: {
    marginTop: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "UTC by default."), " Every absolute time renders with its zone. A bare \"14:32\" is a bug \u2014 operators read it as their own."), /*#__PURE__*/React.createElement("div", {
  className: "callout warn"
}, /*#__PURE__*/React.createElement("strong", null, "Relative needs absolute."), " \"2 min ago\" is a hover-tooltip pair with the absolute timestamp. Audit logs show both inline."))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Numbers"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Tabular numerals everywhere. Grouping is comma-thousand, period-decimal (en-GB). Tables use right-aligned numerics so digits stack."), /*#__PURE__*/React.createElement(FormatNumberTable, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Domain units"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Maritime, aviation and offshore each carry their own unit conventions. The product never silently converts \u2014 it shows the native unit and lets the user toggle."), /*#__PURE__*/React.createElement(DomainUnits, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Format helper API"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "One module, one set of functions. The rule: ", /*#__PURE__*/React.createElement("strong", null, "no module calls ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "Intl"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "toLocaleString"), " or ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "date-fns"), " directly"), " \u2014 everything routes through ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "app/lib/format.ts"), "."), /*#__PURE__*/React.createElement(FormatHelperAPI, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Locale & i18n"), /*#__PURE__*/React.createElement("div", {
  className: "grid-3"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Translation budget")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.55,
    color: "var(--text-secondary)"
  }
}, "Reserve ", /*#__PURE__*/React.createElement("strong", null, "+30%"), " width on buttons, badges and column headers (DE/FR expansion). Never set ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "white-space: nowrap"), " on UI copy without a max-width.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Pluralization")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.55,
    color: "var(--text-secondary)"
  }
}, "ICU MessageFormat \u2014 never ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, `\${n === 1 ? 'item' : 'items'}`), " in source. The format helper consumes ICU keys, not concatenations.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "RTL readiness")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.55,
    color: "var(--text-secondary)"
  }
}, "Use logical properties (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "padding-inline-start"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "margin-inline-end"), ") in new components. The tokens are direction-agnostic.")))));

/* ============================================================
   Combined section export
   ============================================================ */

const DomainSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Why this chapter exists"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Skytek is a monitoring product \u2014 its job is to put the right number, the right time, and the right asset in front of an operator at a glance. Generic web components don't cover charts, maps, or domain-specific formatting. Without rules here, every module reinvents them and consistency leaks. These primitives are the shared vocabulary that connects the dashboard, vessel detail, alerts, and reports.")));
window.DomainSection = DomainSection;
window.DataVizSection = DataVizSection;
window.MapsSection = MapsSection;
window.FormattingSection = FormattingSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-domain.jsx", error: String((e && e.message) || e) }); }

// section-elevation-usage.jsx
try { (() => {
/* Elevation System Usage & Examples */

const ElevationUsage = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "When to use elevation vs. borders"), /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head",
  style: {
    background: "var(--success-050)"
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title",
  style: {
    color: "var(--success-700)"
  }
}, "Use elevation (shadow)")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body"
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("li", null, "Interactive cards that respond to hover/focus"), /*#__PURE__*/React.createElement("li", null, "Floating panels, drawers, popovers"), /*#__PURE__*/React.createElement("li", null, "Content that overlays other content (modals)"), /*#__PURE__*/React.createElement("li", null, "When you want depth without visual separation"), /*#__PURE__*/React.createElement("li", null, "High-interaction surfaces (tables with row selection)")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head",
  style: {
    background: "var(--warning-050)"
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title",
  style: {
    color: "var(--warning-700)"
  }
}, "Use borders instead")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body"
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("li", null, "Static containers (cards in a grid with no hover)"), /*#__PURE__*/React.createElement("li", null, "Form input fields and controls"), /*#__PURE__*/React.createElement("li", null, "Section dividers and navigation"), /*#__PURE__*/React.createElement("li", null, "When you want to define structure, not depth"), /*#__PURE__*/React.createElement("li", null, "Low-motion or minimal-interaction surfaces"))))), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 16
  }
}, /*#__PURE__*/React.createElement("strong", null, "Rule:"), " A card uses either a border OR a shadow, rarely both. If a card has a border, use elevation-0 (no shadow). If it floats, remove the border and use appropriate elevation.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Component examples"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "How elevation integrates into real components."), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gap: 24
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-h4",
  style: {
    marginBottom: 8
  }
}, "Card (rest state)"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    background: "white",
    border: "1px solid var(--border-default)",
    borderRadius: 8,
    padding: 16,
    boxShadow: "var(--card-shadow-rest)"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontWeight: 600,
    marginBottom: 4
  }
}, "Vessel summary"), /*#__PURE__*/React.createElement("div", {
  className: "t-caption"
}, "23 vessels tracked")), /*#__PURE__*/React.createElement("div", {
  className: "t-caption",
  style: {
    display: "grid",
    placeItems: "center"
  }
}, /*#__PURE__*/React.createElement("code", {
  style: {
    fontSize: 11
  }
}, "shadow-sm"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("code", {
  style: {
    fontSize: 11
  }
}, "or elevation-1")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-h4",
  style: {
    marginBottom: 8
  }
}, "Table row (hover state)"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "ds-table is-compact"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Vessel"), /*#__PURE__*/React.createElement("th", null, "IMO"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "M/V Stratos")), /*#__PURE__*/React.createElement("td", null, "9472183"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--success ds-badge--dot"
}, "Compliant"))), /*#__PURE__*/React.createElement("tr", {
  style: {
    background: "var(--brand-050)",
    boxShadow: "var(--card-shadow-hover) inset"
  }
}, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Aegean Pioneer")), /*#__PURE__*/React.createElement("td", null, "9301847"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--info ds-badge--dot"
}, "In review"))))), /*#__PURE__*/React.createElement("div", {
  className: "t-caption"
}, "Row lifts on hover with ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "shadow-md"), " (elevation-2)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-h4",
  style: {
    marginBottom: 8
  }
}, "Popover (floating, active)"), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    display: "inline-block"
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary"
}, "Filter options"), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "absolute",
    top: 40,
    left: 0,
    width: 240,
    background: "white",
    border: "1px solid var(--border-default)",
    borderRadius: 8,
    padding: 12,
    boxShadow: "var(--card-shadow-active)",
    zIndex: 10
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 6
  }
}, "Risk grade"), /*#__PURE__*/React.createElement("select", {
  className: "ds-input ds-select",
  style: {
    height: 28,
    fontSize: 12
  }
}, /*#__PURE__*/React.createElement("option", null, "All"))), /*#__PURE__*/React.createElement("div", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "Uses ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "shadow-lg"), " (elevation-3)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-h4",
  style: {
    marginBottom: 8
  }
}, "Modal (maximum elevation)"), /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    display: "inline-block"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 300,
    background: "white",
    border: "1px solid var(--border-default)",
    borderRadius: 8,
    boxShadow: "var(--card-shadow-modal)",
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--border-subtle)"
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Confirm action")), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 16,
    fontSize: 13,
    color: "var(--text-secondary)"
  }
}, "Are you sure you want to delete this policy? This cannot be undone."), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "8px 16px",
    borderTop: "1px solid var(--border-subtle)",
    background: "var(--slate-50)",
    display: "flex",
    justifyContent: "flex-end",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm"
}, "Cancel"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--danger ds-btn--sm"
}, "Delete"))), /*#__PURE__*/React.createElement("div", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "Uses ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "shadow-2xl"), " (elevation-5)"))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Anti-patterns"), /*#__PURE__*/React.createElement("div", {
  className: "dodont"
}, /*#__PURE__*/React.createElement("div", {
  className: "do"
}, /*#__PURE__*/React.createElement("div", {
  className: "hd"
}, "\u2713 Do"), /*#__PURE__*/React.createElement("div", {
  className: "bd"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("strong", {
  style: {
    display: "block",
    marginBottom: 4,
    color: "var(--text-primary)"
  }
}, "Progressive elevation on interaction"), "Rest (level 1) \u2192 Hover (level 2) \u2192 Active (level 3)", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", {
  style: {
    display: "block",
    marginBottom: 4,
    color: "var(--text-primary)"
  }
}, "Consistent within component families"), "All cards at rest use level 1; all hovers use level 2."))), /*#__PURE__*/React.createElement("div", {
  className: "dont"
}, /*#__PURE__*/React.createElement("div", {
  className: "hd"
}, "\u2717 Don't"), /*#__PURE__*/React.createElement("div", {
  className: "bd"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("strong", {
  style: {
    display: "block",
    marginBottom: 4,
    color: "var(--text-primary)"
  }
}, "Jump elevation levels"), "Rest \u2192 Active should not skip level 2.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", {
  style: {
    display: "block",
    marginBottom: 4,
    color: "var(--text-primary)"
  }
}, "Use only high elevation everywhere"), "Level 5 should be modal-only, not your default card shadow."))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Dark theme support"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Elevation tokens are semantics-first. Dark mode only changes the token values, not the component structure."), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `/* In tokens.css or as a CSS class */
[data-theme="dark"] {
  --card-shadow-rest:   0 1px 3px rgba(0, 0, 0, 0.24), 0 1px 2px rgba(0, 0, 0, 0.18);
  --card-shadow-hover:  0 4px 12px rgba(0, 0, 0, 0.32), 0 2px 4px rgba(0, 0, 0, 0.24);
  --card-shadow-active: 0 8px 20px rgba(0, 0, 0, 0.40), 0 4px 8px rgba(0, 0, 0, 0.28);
  --card-shadow-raised: 0 12px 28px rgba(0, 0, 0, 0.48), 0 6px 12px rgba(0, 0, 0, 0.32);
  --card-shadow-modal:  0 20px 48px rgba(0, 0, 0, 0.56), 0 8px 16px rgba(0, 0, 0, 0.36);
}`)));
Object.assign(window, {
  ElevationUsage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-elevation-usage.jsx", error: String((e && e.message) || e) }); }

// section-elevation.jsx
try { (() => {
/* Section: Card Elevation System */

const ElevationScale = () => {
  const grid2 = "grid-2";
  const levels = [{
    level: 0,
    name: "Flat",
    token: "--card-shadow-flat",
    tailwind: "shadow-none",
    use: "Backgrounds, disabled states, very subtle containers",
    hex: "none"
  }, {
    level: 1,
    name: "Rest",
    token: "--card-shadow-rest",
    tailwind: "shadow-sm",
    use: "Default card state, panels at rest, inactive sections",
    hex: "0 1px 3px rgba(15,23,42,0.12), 0 1px 2px rgba(15,23,42,0.08)"
  }, {
    level: 2,
    name: "Hover",
    token: "--card-shadow-hover",
    tailwind: "shadow-md",
    use: "Cards on hover, interactive row highlight, popovers",
    hex: "0 4px 12px rgba(15,23,42,0.15), 0 2px 4px rgba(15,23,42,0.10)"
  }, {
    level: 3,
    name: "Active",
    token: "--card-shadow-active",
    tailwind: "shadow-lg",
    use: "Pressed/focused cards, selected rows, dropdowns, tooltips",
    hex: "0 8px 20px rgba(15,23,42,0.18), 0 4px 8px rgba(15,23,42,0.12)"
  }, {
    level: 4,
    name: "Raised",
    token: "--card-shadow-raised",
    tailwind: "shadow-xl",
    use: "Drawers, side panels, floating action buttons",
    hex: "0 12px 28px rgba(15,23,42,0.22), 0 6px 12px rgba(15,23,42,0.14)"
  }, {
    level: 5,
    name: "Modal",
    token: "--card-shadow-modal",
    tailwind: "shadow-2xl",
    use: "Modals, fullscreen overlays, maximum emphasis",
    hex: "0 20px 48px rgba(15,23,42,0.28), 0 8px 16px rgba(15,23,42,0.16)"
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subsection-title"
  }, "Elevation scale"), /*#__PURE__*/React.createElement("p", {
    className: "subsection-desc"
  }, "Six elevation levels from flat to modal. Each step signals depth and user interaction."), /*#__PURE__*/React.createElement("div", {
    className: "grid-3"
  }, levels.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.level,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: 96,
      background: "white",
      borderRadius: 8,
      boxShadow: `var(${l.token})`,
      transition: "box-shadow var(--motion-base) var(--ease-out)"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 2
    }
  }, l.level, ". ", l.name), /*#__PURE__*/React.createElement("div", {
    className: "t-caption",
    style: {
      marginBottom: 4
    }
  }, l.use), /*#__PURE__*/React.createElement("code", {
    className: "inline",
    style: {
      fontSize: 11
    }
  }, l.tailwind)))))), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subsection-title"
  }, "Token reference"), /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("table", {
    className: "spec-table",
    style: {
      border: 0
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: 60
    }
  }, "Level"), /*#__PURE__*/React.createElement("th", null, "Semantic Token"), /*#__PURE__*/React.createElement("th", null, "Tailwind Class"), /*#__PURE__*/React.createElement("th", null, "Shadow Value"), /*#__PURE__*/React.createElement("th", null, "Primary use"))), /*#__PURE__*/React.createElement("tbody", null, levels.map(l => /*#__PURE__*/React.createElement("tr", {
    key: l.level
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, l.level)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    style: {
      fontSize: 11
    }
  }, l.token)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    style: {
      fontSize: 11
    }
  }, l.tailwind)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "t-mono",
    style: {
      fontSize: 10,
      color: "var(--text-muted)"
    }
  }, l.hex === "none" ? "none" : l.hex.substring(0, 30) + "…")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, l.use))))))), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subsection-title"
  }, "Interaction pattern"), /*#__PURE__*/React.createElement("p", {
    className: "subsection-desc"
  }, "Elevation responds to user interaction. Never jump more than one level in a single state change."), /*#__PURE__*/React.createElement("div", {
    className: "grid-3"
  }, [{
    state: "Rest",
    level: 1,
    desc: "Default card state. Static content.",
    token: "--card-shadow-rest"
  }, {
    state: "Hover",
    level: 2,
    desc: "User cursor enters card area. Subtle lift.",
    token: "--card-shadow-hover"
  }, {
    state: "Active / Focus",
    level: 3,
    desc: "Card is selected, keyboard-focused, or clicked.",
    token: "--card-shadow-active"
  }].map(s => /*#__PURE__*/React.createElement("div", {
    key: s.state,
    className: "ds-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-card-head"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ds-card-title"
  }, s.state)), /*#__PURE__*/React.createElement("div", {
    className: "ds-card-body",
    style: {
      display: "grid",
      gap: 12,
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 120,
      height: 80,
      background: "white",
      borderRadius: 8,
      border: "1px solid var(--border-subtle)",
      boxShadow: `var(${s.token})`
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      textAlign: "center",
      color: "var(--text-secondary)"
    }
  }, "Level ", /*#__PURE__*/React.createElement("strong", null, s.level), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("code", {
    className: "inline",
    style: {
      marginTop: 4,
      display: "block"
    }
  }, s.token))), /*#__PURE__*/React.createElement("div", {
    className: "ds-card-foot",
    style: {
      borderTop: 0,
      background: "transparent",
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "t-caption",
    style: {
      margin: 0
    }
  }, s.desc)))))), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subsection-title"
  }, "Tailwind config mapping"), /*#__PURE__*/React.createElement("pre", {
    className: "code"
  }, `/* tailwind.config.js */
export default {
  theme: {
    extend: {
      boxShadow: {
        'elevation-0': 'var(--card-shadow-flat)',
        'elevation-1': 'var(--card-shadow-rest)',
        'elevation-2': 'var(--card-shadow-hover)',
        'elevation-3': 'var(--card-shadow-active)',
        'elevation-4': 'var(--card-shadow-raised)',
        'elevation-5': 'var(--card-shadow-modal)',
      },
      /* or map directly to Tailwind's standard shadow scale */
      boxShadow: {
        'sm': 'var(--card-shadow-rest)',
        'md': 'var(--card-shadow-hover)',
        'lg': 'var(--card-shadow-active)',
        'xl': 'var(--card-shadow-raised)',
        '2xl': 'var(--card-shadow-modal)',
      },
    },
  },
};`)));
};
Object.assign(window, {
  ElevationScale
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-elevation.jsx", error: String((e && e.message) || e) }); }

// section-event-log.jsx
try { (() => {
/* Section — Event log / timeline */

const TimelineEvent = ({
  tone = "default",
  icon,
  actor,
  verb,
  object,
  time,
  detail,
  payload
}) => /*#__PURE__*/React.createElement("div", {
  className: "ds-event"
}, /*#__PURE__*/React.createElement("span", {
  className: `ds-event-glyph ds-event-glyph--${tone}`
}, icon), /*#__PURE__*/React.createElement("div", {
  className: "ds-event-head"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-event-actor"
}, actor), /*#__PURE__*/React.createElement("span", {
  className: "ds-event-verb"
}, verb), /*#__PURE__*/React.createElement("span", {
  className: "ds-event-object"
}, object), /*#__PURE__*/React.createElement("span", {
  className: "ds-event-time"
}, time)), detail && /*#__PURE__*/React.createElement("div", {
  className: "ds-event-detail"
}, detail), payload && /*#__PURE__*/React.createElement("pre", {
  className: "ds-event-payload"
}, payload));
const VesselAuditDemo = () => /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--bg-app)",
    padding: "16px 20px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-default)"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-timeline"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-timeline-day"
}, "Today \xB7 28 Apr 2026"), /*#__PURE__*/React.createElement(TimelineEvent, {
  tone: "danger",
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.alert,
    size: 12,
    stroke: "currentColor"
  }),
  actor: "System",
  verb: "raised",
  object: "SANCTIONED alert",
  time: "14:32 UTC",
  detail: "Flag changed from Marshall Islands \u2192 Russia. Vessel matches OFAC SDN list."
}), /*#__PURE__*/React.createElement(TimelineEvent, {
  tone: "warning",
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.eye,
    size: 12,
    stroke: "currentColor"
  }),
  actor: "System",
  verb: "detected",
  object: "AIS gap",
  time: "09:14 UTC",
  detail: "No AIS position received in the last 6h 14m. Last known: 43.8\xB0N 37.2\xB0E."
}), /*#__PURE__*/React.createElement(TimelineEvent, {
  tone: "brand",
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.edit,
    size: 12,
    stroke: "currentColor"
  }),
  actor: "maeve.daly@skytek.com",
  verb: "updated",
  object: "policy notes",
  time: "08:47 UTC",
  payload: `- High-watch flagged\n+ High-watch flagged\n+ Confirm exposure with reinsurer`
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-timeline-day"
}, "Yesterday \xB7 27 Apr 2026"), /*#__PURE__*/React.createElement(TimelineEvent, {
  tone: "success",
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.check,
    size: 12,
    stroke: "currentColor"
  }),
  actor: "System",
  verb: "cleared",
  object: "ROUTE DEVIATION",
  time: "22:03 UTC",
  detail: "Vessel returned to filed route after 4h 22m off-course."
}), /*#__PURE__*/React.createElement(TimelineEvent, {
  tone: "default",
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.ship,
    size: 12,
    stroke: "currentColor"
  }),
  actor: "System",
  verb: "recorded",
  object: "port call",
  time: "14:11 UTC",
  detail: "Departed Singapore (SG\xB7SIN) en route to Rotterdam (NL\xB7RTM). ETA 19 May 14:00 UTC."
}), /*#__PURE__*/React.createElement(TimelineEvent, {
  tone: "brand",
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.user,
    size: 12,
    stroke: "currentColor"
  }),
  actor: "ronan.kelly@skytek.com",
  verb: "assigned",
  object: "this vessel to Tom Walsh",
  time: "11:25 UTC"
})));
const EventAnatomy = () => /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Event row anatomy")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: 24,
    alignItems: "center"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--bg-app)",
    padding: 16,
    borderRadius: "var(--radius-md)"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-timeline",
  style: {
    padding: 0
  }
}, /*#__PURE__*/React.createElement(TimelineEvent, {
  tone: "brand",
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.edit,
    size: 12,
    stroke: "currentColor"
  }),
  actor: "maeve.daly@skytek.com",
  verb: "updated",
  object: "policy notes",
  time: "14:32 UTC",
  detail: "Notes were modified after the most recent inspection cycle."
}))), /*#__PURE__*/React.createElement("ol", {
  style: {
    margin: 0,
    paddingLeft: 20,
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Glyph"), " \u2014 24 px circle, tone matches event class (brand / success / warning / danger / neutral). Lucide icon at 12 px."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Actor"), " \u2014 person email or \"System\". Bold."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Verb"), " \u2014 past tense, lowercase. \"created\", \"updated\", \"raised\", \"cleared\"."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Object"), " \u2014 what was acted on. Bold-ish."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Time"), " \u2014 right-aligned, mono, absolute time with zone."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Detail"), " \u2014 one optional line of context."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Payload"), " \u2014 diff or code block, only when the change is data-shaped."))));
const EventClassesTable = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Class"), /*#__PURE__*/React.createElement("th", null, "Glyph tone"), /*#__PURE__*/React.createElement("th", null, "Examples"), /*#__PURE__*/React.createElement("th", null, "When"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "System alert")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "ds-event-glyph ds-event-glyph--danger",
  style: {
    position: "static"
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.alert,
  size: 12
}))), /*#__PURE__*/React.createElement("td", null, "Sanctioned hit, AIS silence, route deviation, weather hazard"), /*#__PURE__*/React.createElement("td", null, "Automated trigger from monitoring rules. Always has a clear/ack path.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Warning")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "ds-event-glyph ds-event-glyph--warning",
  style: {
    position: "static"
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.eye,
  size: 12
}))), /*#__PURE__*/React.createElement("td", null, "Watchlist match, speed anomaly, policy expiring"), /*#__PURE__*/React.createElement("td", null, "Soft signals; no immediate action required.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "State change")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "ds-event-glyph ds-event-glyph--success",
  style: {
    position: "static"
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.check,
  size: 12
}))), /*#__PURE__*/React.createElement("td", null, "Alert cleared, port arrival, AIS resumed, policy renewed"), /*#__PURE__*/React.createElement("td", null, "Resolution of a previous warning or system event.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "User action")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "ds-event-glyph ds-event-glyph--brand",
  style: {
    position: "static"
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.edit,
  size: 12
}))), /*#__PURE__*/React.createElement("td", null, "Notes edited, assignment changed, watch flag toggled"), /*#__PURE__*/React.createElement("td", null, "Anything a human did. Always includes the actor email.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Record")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "ds-event-glyph",
  style: {
    position: "static"
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.ship,
  size: 12
}))), /*#__PURE__*/React.createElement("td", null, "Port call, voyage start, AIS position snapshot"), /*#__PURE__*/React.createElement("td", null, "Passive observation. Background tone, no decoration."))));
const TimelineVariants = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Surface"), /*#__PURE__*/React.createElement("th", null, "Filters"), /*#__PURE__*/React.createElement("th", null, "Default grouping"), /*#__PURE__*/React.createElement("th", null, "Load pattern"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Vessel detail \xB7 Activity")), /*#__PURE__*/React.createElement("td", null, "Class (alert/user/system/record), actor"), /*#__PURE__*/React.createElement("td", null, "By day"), /*#__PURE__*/React.createElement("td", null, "Paginated \xB7 \"Load older\"")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Alert detail \xB7 Trail")), /*#__PURE__*/React.createElement("td", null, "None \u2014 single alert's lineage"), /*#__PURE__*/React.createElement("td", null, "Reverse chronological, flat"), /*#__PURE__*/React.createElement("td", null, "Complete \u2014 typically < 20 entries")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Compliance \xB7 Audit log")), /*#__PURE__*/React.createElement("td", null, "User, action type, date range, IP"), /*#__PURE__*/React.createElement("td", null, "By day"), /*#__PURE__*/React.createElement("td", null, "Virtualized \xB7 infinite scroll")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Portfolio \xB7 Recent activity")), /*#__PURE__*/React.createElement("td", null, "Class, vessel"), /*#__PURE__*/React.createElement("td", null, "By day"), /*#__PURE__*/React.createElement("td", null, "Last 30d default \xB7 \"Show all\"")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "NatCat event \xB7 Updates")), /*#__PURE__*/React.createElement("td", null, "None"), /*#__PURE__*/React.createElement("td", null, "Reverse chronological, no grouping"), /*#__PURE__*/React.createElement("td", null, "Live \xB7 polled every 60 s"))));
const TimelineRules = () => /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Time display")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, "Absolute UTC time on every event row."), /*#__PURE__*/React.createElement("li", null, "Day header is local-to-user (e.g. \"Today\", \"Yesterday\", \"27 Apr 2026\")."), /*#__PURE__*/React.createElement("li", null, "Relative time (\"2 min ago\") only appears on the top-of-feed item or in a hover tooltip \u2014 never as the only timestamp."), /*#__PURE__*/React.createElement("li", null, "Live feeds show a tick indicator next to the day header that updates every 60 s.")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Empty & loading")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, "Empty state: \"No activity in this range.\" Single line, no illustration."), /*#__PURE__*/React.createElement("li", null, "Loading: 3 skeleton rows; never a centered spinner over an existing feed."), /*#__PURE__*/React.createElement("li", null, "Error: a danger banner above the rail, \"Couldn't load activity. Retry.\" Don't blank the existing rows."), /*#__PURE__*/React.createElement("li", null, "End-of-feed: a muted \"Beginning of history\" line with the earliest known date.")))));
const EventApiSpec = () => /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// One Event shape powers every timeline surface.
type EventClass = 'alert' | 'warning' | 'state' | 'user' | 'record';

type Event = {
  id: string;
  ts: string;              // ISO 8601 UTC
  class: EventClass;
  actor: { kind: 'user' | 'system'; id: string; label: string };
  verb: string;            // "raised" | "updated" | "cleared" | …
  object: { kind: string; id: string; label: string };
  detail?: string;         // single-line context
  payload?: {
    kind: 'diff' | 'json' | 'text';
    body: string;
  };
  acknowledged?: { by: string; ts: string };
};

// Standard component
<EventTimeline
  events={events}
  groupBy="day"
  loadOlder={fetchOlder}
  filters={['class', 'actor']}
  onAck={ackEvent}
/>`);
const EventLogSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Why this chapter"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Vessel history, alert trails, audit logs, NatCat updates, portfolio activity \u2014 every Skytek surface needs to show \"what happened, when, who did it.\" Today these timelines live in five modules with five different row designs. One component, one event shape, one set of rules.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Anatomy"), /*#__PURE__*/React.createElement(EventAnatomy, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Event classes"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Five glyph tones cover every event in the product. Modules don't introduce new tones."), /*#__PURE__*/React.createElement(EventClassesTable, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "In context \u2014 vessel activity"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "A live composition: system alerts, user actions, state changes, and records \u2014 all in one rail, grouped by day with sticky day headers."), /*#__PURE__*/React.createElement(VesselAuditDemo, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Surface variants"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "The component is the same; defaults differ per surface. Don't author a custom variant \u2014 configure props."), /*#__PURE__*/React.createElement(TimelineVariants, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Time, empty, error"), /*#__PURE__*/React.createElement(TimelineRules, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Event shape"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "One Event type powers every surface. The API contract is owned by the system, not by individual modules."), /*#__PURE__*/React.createElement(EventApiSpec, null)), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "The principle:"), " a timeline tells one story per row \u2014 who did what, to what, when. Two stories means two rows. If you can't fit it on a single line + one detail, it's a card, not an event."));
window.EventLogSection = EventLogSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-event-log.jsx", error: String((e && e.message) || e) }); }

// section-export.jsx
try { (() => {
/* Section — Export & report design */

const CoverPagePreview = () => /*#__PURE__*/React.createElement("div", {
  className: "ds-paper ds-paper--cover"
}, /*#__PURE__*/React.createElement("span", {
  className: "classification"
}, "CONFIDENTIAL"), /*#__PURE__*/React.createElement("div", {
  className: "brand"
}, /*#__PURE__*/React.createElement("span", {
  className: "mark"
}, "S"), /*#__PURE__*/React.createElement("span", null, "Skytek")), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 18
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "t-overline",
  style: {
    color: "rgba(255,255,255,.7)",
    fontSize: 8,
    marginBottom: 6
  }
}, "QUARTERLY EXPOSURE REPORT"), /*#__PURE__*/React.createElement("h1", null, "Black Sea Portfolio"), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    opacity: .85,
    marginTop: 4
  }
}, "Q1 2026 \xB7 12 Jan \u2192 31 Mar")), /*#__PURE__*/React.createElement("div", {
  className: "meta"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Prepared for")), /*#__PURE__*/React.createElement("div", null, "Maeve Daly \xB7 Lead Underwriter"), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 6
  }
}, /*#__PURE__*/React.createElement("strong", null, "Issued")), /*#__PURE__*/React.createElement("div", null, "28 April 2026 \xB7 14:32 UTC"), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 6
  }
}, /*#__PURE__*/React.createElement("strong", null, "Reference")), /*#__PURE__*/React.createElement("div", null, "SKY-RPT-2026-Q1-BSP-0142")));
const BodyPagePreview = ({
  watermark
}) => /*#__PURE__*/React.createElement("div", {
  className: "ds-paper ds-paper--body"
}, watermark && /*#__PURE__*/React.createElement("span", {
  className: "ds-paper-watermark"
}, watermark), /*#__PURE__*/React.createElement("div", {
  className: "ds-paper-header"
}, /*#__PURE__*/React.createElement("span", null, "Black Sea Portfolio \xB7 Q1 2026"), /*#__PURE__*/React.createElement("span", null, "SKY-RPT-2026-Q1-BSP-0142")), /*#__PURE__*/React.createElement("div", {
  className: "ds-paper-body-text"
}, /*#__PURE__*/React.createElement("h3", null, "Executive summary"), /*#__PURE__*/React.createElement("div", {
  className: "line full"
}), /*#__PURE__*/React.createElement("div", {
  className: "line full"
}), /*#__PURE__*/React.createElement("div", {
  className: "line med"
}), /*#__PURE__*/React.createElement("h3", null, "Sanctions exposure"), /*#__PURE__*/React.createElement("div", {
  className: "line full"
}), /*#__PURE__*/React.createElement("div", {
  className: "line short"
}), /*#__PURE__*/React.createElement("div", {
  className: "chart-placeholder"
}), /*#__PURE__*/React.createElement("h3", null, "High-risk vessels"), /*#__PURE__*/React.createElement("div", {
  className: "table-mini"
}, /*#__PURE__*/React.createElement("div", {
  className: "th"
}, "Vessel"), /*#__PURE__*/React.createElement("div", {
  className: "th"
}, "Type"), /*#__PURE__*/React.createElement("div", {
  className: "th"
}, "Flag"), /*#__PURE__*/React.createElement("div", {
  className: "th"
}, "Rating"), /*#__PURE__*/React.createElement("div", null, "MV Atlantic"), /*#__PURE__*/React.createElement("div", null, "Tanker"), /*#__PURE__*/React.createElement("div", null, "LR"), /*#__PURE__*/React.createElement("div", null, "D"), /*#__PURE__*/React.createElement("div", null, "MV Nordic Star"), /*#__PURE__*/React.createElement("div", null, "LNG"), /*#__PURE__*/React.createElement("div", null, "NO"), /*#__PURE__*/React.createElement("div", null, "C"), /*#__PURE__*/React.createElement("div", null, "MV Miramar"), /*#__PURE__*/React.createElement("div", null, "Tanker"), /*#__PURE__*/React.createElement("div", null, "PA"), /*#__PURE__*/React.createElement("div", null, "E"))), /*#__PURE__*/React.createElement("div", {
  className: "ds-paper-footer"
}, /*#__PURE__*/React.createElement("span", null, "Confidential \xB7 Skytek \xB7 28 Apr 2026"), /*#__PURE__*/React.createElement("span", null, "Page 4 of 18")));
const PrintTypography = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Role"), /*#__PURE__*/React.createElement("th", null, "Size \xB7 pt"), /*#__PURE__*/React.createElement("th", null, "Family"), /*#__PURE__*/React.createElement("th", null, "Weight"), /*#__PURE__*/React.createElement("th", null, "Use"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Cover title"), /*#__PURE__*/React.createElement("td", null, "28 pt"), /*#__PURE__*/React.createElement("td", null, "Exo"), /*#__PURE__*/React.createElement("td", null, "700"), /*#__PURE__*/React.createElement("td", null, "Single line on cover. Wraps to 2 max.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Cover eyebrow"), /*#__PURE__*/React.createElement("td", null, "8 pt"), /*#__PURE__*/React.createElement("td", null, "Exo"), /*#__PURE__*/React.createElement("td", null, "600"), /*#__PURE__*/React.createElement("td", null, "Tracking 0.12em \xB7 uppercase. Report type label.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Body h1"), /*#__PURE__*/React.createElement("td", null, "16 pt"), /*#__PURE__*/React.createElement("td", null, "Exo"), /*#__PURE__*/React.createElement("td", null, "700"), /*#__PURE__*/React.createElement("td", null, "Section start. New page or 24 pt of vertical space above.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Body h2"), /*#__PURE__*/React.createElement("td", null, "13 pt"), /*#__PURE__*/React.createElement("td", null, "Exo"), /*#__PURE__*/React.createElement("td", null, "700"), /*#__PURE__*/React.createElement("td", null, "Subsection. Inline with following paragraph.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Body h3"), /*#__PURE__*/React.createElement("td", null, "11 pt"), /*#__PURE__*/React.createElement("td", null, "Inter"), /*#__PURE__*/React.createElement("td", null, "600"), /*#__PURE__*/React.createElement("td", null, "Sidebar headings, table caption, named ranges.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Body paragraph"), /*#__PURE__*/React.createElement("td", null, "10 pt"), /*#__PURE__*/React.createElement("td", null, "Inter"), /*#__PURE__*/React.createElement("td", null, "400"), /*#__PURE__*/React.createElement("td", null, "Default. Leading 1.5. Max line length \u2248 70 chars.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Caption"), /*#__PURE__*/React.createElement("td", null, "8.5 pt"), /*#__PURE__*/React.createElement("td", null, "Inter"), /*#__PURE__*/React.createElement("td", null, "400"), /*#__PURE__*/React.createElement("td", null, "Table footnotes, figure captions. Color text-muted.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Table cell"), /*#__PURE__*/React.createElement("td", null, "9 pt"), /*#__PURE__*/React.createElement("td", null, "Inter"), /*#__PURE__*/React.createElement("td", null, "400 / 600 emph"), /*#__PURE__*/React.createElement("td", null, "Tabular numerals. Header in 8 pt uppercase.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Page header / footer"), /*#__PURE__*/React.createElement("td", null, "8 pt"), /*#__PURE__*/React.createElement("td", null, "Inter"), /*#__PURE__*/React.createElement("td", null, "500"), /*#__PURE__*/React.createElement("td", null, "Color text-muted. Repeats on every page."))));
const PageRules = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Area"), /*#__PURE__*/React.createElement("th", null, "Rule"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Page size")), /*#__PURE__*/React.createElement("td", null, "A4 portrait (210 \xD7 297 mm). Letter sized only when explicitly requested by a US-domiciled customer.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Margins")), /*#__PURE__*/React.createElement("td", null, "22 mm top, 18 mm bottom, 20 mm left/right. Header sits in the top 12 mm; footer in the bottom 10 mm.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Page header")), /*#__PURE__*/React.createElement("td", null, "Two columns: doc title (left) \xB7 reference code (right). Hairline border-bottom. Repeats on every page except the cover.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Page footer")), /*#__PURE__*/React.createElement("td", null, "Two columns: \"Confidential \xB7 Skytek \xB7 ", `{date}`, "\" (left) \xB7 \"Page X of Y\" (right). Repeats including cover.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Page numbering")), /*#__PURE__*/React.createElement("td", null, "Roman lowercase on front matter (cover, TOC, exec summary). Arabic from the first body section. \"Page X of Y\" always.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Table breaks")), /*#__PURE__*/React.createElement("td", null, "Repeat header row on each page. Never orphan a single body row at the bottom \u2014 push to next page if < 3 rows remain.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Section breaks")), /*#__PURE__*/React.createElement("td", null, "H1 sections start on a new page if they would otherwise begin in the bottom third.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Widows & orphans")), /*#__PURE__*/React.createElement("td", null, "Min 2 lines at end of page; min 2 lines at top of next page. Enforced via ", /*#__PURE__*/React.createElement("code", null, "orphans: 2; widows: 2"), ".")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Color")), /*#__PURE__*/React.createElement("td", null, "Same tokens as the app. Brand and rating colors are intentional in print \u2014 never desaturate."))));
const ClassificationStrip = () => /*#__PURE__*/React.createElement("div", {
  className: "row",
  style: {
    gap: 8
  }
}, [["INTERNAL", "var(--info-700)", "var(--info-100)"], ["CONFIDENTIAL", "var(--warning-700)", "var(--warning-100)"], ["RESTRICTED", "var(--danger-700)", "var(--danger-100)"], ["DRAFT", "var(--text-muted)", "var(--slate-100)"]].map(([label, fg, bg]) => /*#__PURE__*/React.createElement("span", {
  key: label,
  style: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    background: bg,
    color: fg,
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em"
  }
}, label)));
const WatermarkRules = () => /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Watermarks")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "DRAFT"), " \xB7 slate-400, 12% opacity, \u221222\xB0 rotation, repeats on every body page"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "CONFIDENTIAL"), " \xB7 danger-700, 12% opacity, applied automatically to classification \u2265 Confidential"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "SAMPLE"), " \xB7 brand-600, 14% opacity, applied to anonymized exports for sales")), /*#__PURE__*/React.createElement("p", {
  style: {
    marginTop: 12,
    marginBottom: 0,
    fontSize: 12
  }
}, "Always behind content, never above. Never on the cover."))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Classification")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("p", {
  style: {
    marginTop: 0
  }
}, "Top-right of every page \u2014 including cover. Color matches the classification level."), /*#__PURE__*/React.createElement(ClassificationStrip, null), /*#__PURE__*/React.createElement("p", {
  style: {
    marginTop: 12,
    marginBottom: 0,
    fontSize: 12
  }
}, "Default is ", /*#__PURE__*/React.createElement("strong", null, "CONFIDENTIAL"), " for portfolio and exposure reports. Toggled by the report builder, not the user."))));
const PrintCSS = () => /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `/* app/styles/print.css — loaded for every report surface */
@page {
  size: A4 portrait;
  margin: 22mm 20mm 18mm 20mm;
  @top-left {
    content: string(doc-title);
    font: 500 8pt 'Inter', sans-serif;
    color: var(--text-muted);
    border-bottom: 0.5pt solid var(--border-default);
    padding-bottom: 4pt;
  }
  @top-right {
    content: string(doc-ref);
    font: 500 8pt 'Inter', sans-serif;
    color: var(--text-muted);
  }
  @bottom-left  { content: 'Confidential · Skytek · ' string(doc-date);
                   font: 500 8pt 'Inter', sans-serif; color: var(--text-muted); }
  @bottom-right { content: 'Page ' counter(page) ' of ' counter(pages);
                   font: 500 8pt 'Inter', sans-serif; color: var(--text-muted); }
}
@page :first { @top-left { content: none; } @top-right { content: none; } }

@media print {
  :root { font-size: 10pt; }
  body { background: white; color: black; }
  .no-print { display: none !important; }
  thead { display: table-header-group; }  /* repeat on each page */
  tr, .ds-event, h1, h2, h3 { break-inside: avoid; }
  h1 { break-before: page; }
  p, li { orphans: 2; widows: 2; }
}`);
const ExportWorkflow = () => /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, [["1 · Build", "Operator configures a report surface (portfolio, date range, classification). Surface renders at A4 width in a preview pane.", "Same components as the app — DS-table, charts, timelines."], ["2 · Preview", "Print preview shows pagination, headers, footers, watermarks. Operator can flip pages and verify breaks.", "Browser print preview is the source of truth."], ["3 · Export", "One click triggers browser PDF print at A4. Headless render for unattended generation uses the same CSS.", "PDF is byte-identical between operator + scheduled run."], ["4 · Distribute", "Generated PDF is logged in the audit log with reference code, classification, recipient, and SHA-256.", "Audit log appears in this spec's Event log chapter."]].map(([k, d, n]) => /*#__PURE__*/React.createElement("div", {
  key: k,
  className: "token-row",
  style: {
    gridTemplateColumns: "100px 1fr 280px"
  }
}, /*#__PURE__*/React.createElement("strong", {
  style: {
    fontSize: 13
  }
}, k), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 13,
    color: "var(--text-secondary)"
  }
}, d), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, n))));
const ChartsInReports = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Concern"), /*#__PURE__*/React.createElement("th", null, "App"), /*#__PURE__*/React.createElement("th", null, "Report"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Background"), /*#__PURE__*/React.createElement("td", null, "Surface tokens, can be elevated"), /*#__PURE__*/React.createElement("td", null, "Transparent \u2014 page is white")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Interaction"), /*#__PURE__*/React.createElement("td", null, "Hover tooltips, click drilldown"), /*#__PURE__*/React.createElement("td", null, "None \u2014 value labels rendered inline")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Animation"), /*#__PURE__*/React.createElement("td", null, "200 ms enter"), /*#__PURE__*/React.createElement("td", null, "None \u2014 first render is final")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Legend position"), /*#__PURE__*/React.createElement("td", null, "Top-left, inline"), /*#__PURE__*/React.createElement("td", null, "Bottom of figure, centered, with figure number")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Caption"), /*#__PURE__*/React.createElement("td", null, "Optional eyebrow above"), /*#__PURE__*/React.createElement("td", null, "Required: \"Fig. 3 \u2014 Sanctioned exposure by region\" below")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Resolution"), /*#__PURE__*/React.createElement("td", null, "SVG"), /*#__PURE__*/React.createElement("td", null, "SVG (vector) \u2014 never raster, never canvas")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Data limit"), /*#__PURE__*/React.createElement("td", null, "250 points / series"), /*#__PURE__*/React.createElement("td", null, "Same \u2014 downsample upstream, not in the report"))));
const ExportSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Why this chapter"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Compliance work produces PDFs. Underwriters share them with reinsurers. Auditors archive them. Print is not a fallback \u2014 it's a first-class output of the product. This chapter defines the report system: page rules, typography for paper, classification & watermarks, and the export workflow.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Anatomy"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Every report has two page archetypes. The cover establishes brand and classification; body pages carry content under a consistent header/footer rhythm."), /*#__PURE__*/React.createElement("div", {
  className: "ds-paper-stack"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 8
  }
}, "Cover \xB7 always page 1"), /*#__PURE__*/React.createElement(CoverPagePreview, null)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 8
  }
}, "Body \xB7 all subsequent pages"), /*#__PURE__*/React.createElement(BodyPagePreview, {
  watermark: "DRAFT"
})))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Page rules"), /*#__PURE__*/React.createElement(PageRules, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Print typography"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Same families as the app (Exo + Inter), shifted to point sizes. 10 pt body is the floor \u2014 anything below 8.5 pt is for footnotes only."), /*#__PURE__*/React.createElement(PrintTypography, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Classification & watermarks"), /*#__PURE__*/React.createElement(WatermarkRules, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Charts & visuals in reports"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Same tokens, same chart library \u2014 different defaults. Reports are static surfaces; everything that helps interaction in the app (hover, animation, dynamic legends) becomes noise on paper."), /*#__PURE__*/React.createElement(ChartsInReports, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Export workflow"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Four steps from \"I need to send this to the reinsurer\" to a logged, classified PDF in the recipient's inbox. The operator's view and the scheduled-job view share the same rendering path."), /*#__PURE__*/React.createElement(ExportWorkflow, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Print stylesheet"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "The whole print system fits in one CSS file. CSS Paged Media (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "@page"), ") handles headers, footers, page numbering, and breaks."), /*#__PURE__*/React.createElement(PrintCSS, null)), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "The principle:"), " a Skytek report is the same product, rendered for paper. Same tokens, same typography family, same chart palette, same classification rules. The medium changes; the system doesn't."));
window.ExportSection = ExportSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-export.jsx", error: String((e && e.message) || e) }); }

// section-forms-deep.jsx
try { (() => {
/* Section — Forms — full specification */

const FormAnatomyDemo = () => /*#__PURE__*/React.createElement("div", {
  className: "ds-form-anatomy"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label",
  htmlFor: "anatomy-field"
}, "IMO number ", /*#__PURE__*/React.createElement("span", {
  className: "ds-field-required",
  "aria-hidden": "true"
}, "*"), /*#__PURE__*/React.createElement("span", {
  className: "sr-only"
}, " required")), /*#__PURE__*/React.createElement("input", {
  id: "anatomy-field",
  className: "ds-input",
  placeholder: "9234567",
  defaultValue: "9234567",
  "aria-describedby": "anatomy-help"
}), /*#__PURE__*/React.createElement("div", {
  id: "anatomy-help",
  className: "ds-field-help"
}, "7 digits, no prefix. We'll validate against the IHS Maritime registry."))), /*#__PURE__*/React.createElement("ol", {
  style: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 12.5,
    lineHeight: 1.65,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--text-primary)"
  }
}, "Label"), " \u2014 sentence case, no colon, above the input."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--text-primary)"
  }
}, "Required indicator"), " \u2014 danger-500 asterisk, with a screen-reader-only \"required\"."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--text-primary)"
  }
}, "Input"), " \u2014 32 px (md) default, 28 px (sm) in compact density."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--text-primary)"
  }
}, "Helper text"), " \u2014 single line below, muted. Replaced by error when error fires."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--text-primary)"
  }
}, "aria-describedby"), " \u2014 links input to the help/error id.")));
const FieldStatesDemo = () => /*#__PURE__*/React.createElement("div", {
  className: "ds-field-grid"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Default"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "Pacific Pioneer"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-field-help"
}, "Rest state with helper text.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Focus"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "Pacific Pioneer",
  autoFocus: true,
  style: {
    borderColor: "var(--brand-400)",
    boxShadow: "var(--shadow-focus)"
  }
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-field-help"
}, "Brand-400 border + 3 px focus ring.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Disabled"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "Pacific Pioneer",
  disabled: true
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-field-help"
}, "User cannot edit. Won't submit. Use when the field doesn't apply.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Read-only"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "IMO 9234567",
  readOnly: true,
  style: {
    background: "var(--slate-50)",
    color: "var(--text-primary)"
  }
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-field-help"
}, "User can copy/select. Will submit. Use for computed or locked values.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Error"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "123",
  "aria-invalid": "true"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-field-error"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.alert,
  size: 12,
  stroke: "currentColor"
}), " IMO must be 7 digits.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Async pending"), /*#__PURE__*/React.createElement("span", {
  style: {
    position: "relative"
  }
}, /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "9234567",
  style: {
    paddingRight: 32
  }
}), /*#__PURE__*/React.createElement("span", {
  className: "ds-spinner",
  style: {
    position: "absolute",
    right: 10,
    top: 9
  }
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field-help"
}, "Checking registry\u2026")), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Async valid"), /*#__PURE__*/React.createElement("span", {
  style: {
    position: "relative"
  }
}, /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "9234567",
  style: {
    paddingRight: 32
  }
}), /*#__PURE__*/React.createElement("span", {
  className: "ds-validation-state-icon ds-field-valid",
  style: {
    position: "absolute",
    right: 10,
    top: 8
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.check,
  size: 14,
  stroke: "currentColor"
}))), /*#__PURE__*/React.createElement("div", {
  className: "ds-field-help",
  style: {
    color: "var(--success-700)"
  }
}, "Matches MV PACIFIC PIONEER (Liberia).")), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Async invalid"), /*#__PURE__*/React.createElement("span", {
  style: {
    position: "relative"
  }
}, /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "0000001",
  "aria-invalid": "true",
  style: {
    paddingRight: 32
  }
}), /*#__PURE__*/React.createElement("span", {
  className: "ds-validation-state-icon ds-field-invalid",
  style: {
    position: "absolute",
    right: 10,
    top: 8
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.x,
  size: 14,
  stroke: "currentColor"
}))), /*#__PURE__*/React.createElement("div", {
  className: "ds-field-error"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.alert,
  size: 12,
  stroke: "currentColor"
}), " Not found in IHS Maritime registry.")));
const ValidationTimingTable = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Trigger"), /*#__PURE__*/React.createElement("th", null, "Fires on"), /*#__PURE__*/React.createElement("th", null, "Use for"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "onSubmit")), /*#__PURE__*/React.createElement("td", null, "Form submission"), /*#__PURE__*/React.createElement("td", null, "The default. Show all errors at once. Scroll to the first one.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "onBlur")), /*#__PURE__*/React.createElement("td", null, "Field loses focus"), /*#__PURE__*/React.createElement("td", null, "Email, URLs, IMO lookups, typeahead values. Don't fire on every keystroke.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "onChange (live)")), /*#__PURE__*/React.createElement("td", null, "Each keystroke"), /*#__PURE__*/React.createElement("td", null, "Strength meters, char counters, format hints. Never errors \u2014 only positive feedback.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Async")), /*#__PURE__*/React.createElement("td", null, "Debounced onBlur or onChange"), /*#__PURE__*/React.createElement("td", null, "Uniqueness checks, registry lookups. Always show pending state before result.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Cross-field")), /*#__PURE__*/React.createElement("td", null, "onSubmit of dependent field"), /*#__PURE__*/React.createElement("td", null, "\"End date must be after start date.\" Re-run when either changes."))));
const LabelLayoutDemo = () => /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Top labels \xB7 default")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Vessel name"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "MV Pacific Pioneer"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Flag"), /*#__PURE__*/React.createElement("select", {
  className: "ds-input ds-select",
  defaultValue: "lr"
}, /*#__PURE__*/React.createElement("option", {
  value: "lr"
}, "Liberia"), /*#__PURE__*/React.createElement("option", {
  value: "pa"
}, "Panama"), /*#__PURE__*/React.createElement("option", {
  value: "mh"
}, "Marshall Islands")))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "Use for create forms, detail edit pages, anything > 3 fields.")), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Inline labels \xB7 dense")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: 12,
    alignItems: "center"
  }
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label",
  style: {
    marginBottom: 0
  }
}, "Vessel name"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "MV Pacific Pioneer"
})), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: 12,
    alignItems: "center"
  }
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label",
  style: {
    marginBottom: 0
  }
}, "Flag"), /*#__PURE__*/React.createElement("select", {
  className: "ds-input ds-select",
  defaultValue: "lr"
}, /*#__PURE__*/React.createElement("option", {
  value: "lr"
}, "Liberia"), /*#__PURE__*/React.createElement("option", {
  value: "pa"
}, "Panama")))), /*#__PURE__*/React.createElement("div", {
  className: "panel-foot"
}, "Use for inline edits, side-panel forms, compact tables.")));
const FieldGroupDemo = () => /*#__PURE__*/React.createElement("fieldset", {
  style: {
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-md)",
    padding: 16,
    background: "var(--white)"
  }
}, /*#__PURE__*/React.createElement("legend", {
  style: {
    padding: "0 6px",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.06em"
  }
}, "Vessel identification"), /*#__PURE__*/React.createElement("div", {
  className: "ds-field-grid"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "IMO number ", /*#__PURE__*/React.createElement("span", {
  className: "ds-field-required"
}, "*")), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "9234567"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "MMSI"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "636019825"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Call sign"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "D5AB7"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Vessel name ", /*#__PURE__*/React.createElement("span", {
  className: "ds-field-required"
}, "*")), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "MV Pacific Pioneer"
}))));
const StepperDemo = () => /*#__PURE__*/React.createElement("div", {
  className: "ds-stepper"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-step is-done"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-step-dot"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.check,
  size: 12,
  stroke: "currentColor"
})), /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Identification")), /*#__PURE__*/React.createElement("div", {
  className: "ds-step-line"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-step is-current"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-step-dot"
}, "2"), /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Policy & coverage")), /*#__PURE__*/React.createElement("div", {
  className: "ds-step-line"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-step"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-step-dot"
}, "3"), /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Portfolio")), /*#__PURE__*/React.createElement("div", {
  className: "ds-step-line"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-step"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-step-dot"
}, "4"), /*#__PURE__*/React.createElement("span", {
  className: "label"
}, "Review")));
const FormsRules = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Concern"), /*#__PURE__*/React.createElement("th", null, "Rule"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Required indicator")), /*#__PURE__*/React.createElement("td", null, "Danger-500 asterisk after the label. Plus an SR-only \"required\" so screen readers don't say \"asterisk\".")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Optional indicator")), /*#__PURE__*/React.createElement("td", null, "Show \"(optional)\" in muted text when most fields are required. Don't double-mark.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Placeholder vs label")), /*#__PURE__*/React.createElement("td", null, "Placeholder is example data (\"9234567\"). It's never a substitute for a label.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Helper vs error")), /*#__PURE__*/React.createElement("td", null, "Helper shows by default. Error replaces it. Both share the same DOM slot \u2014 so the layout doesn't jump when validation fires.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Error placement")), /*#__PURE__*/React.createElement("td", null, "Below the input, never above. ", /*#__PURE__*/React.createElement("code", null, "aria-describedby"), " wires the error id to the input.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "aria-invalid")), /*#__PURE__*/React.createElement("td", null, "Set when an error fires. Cleared on next input change. Drives the red border styling.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Submission")), /*#__PURE__*/React.createElement("td", null, "Disable Submit only while a request is in flight. Don't disable for invalid fields \u2014 let the submission show the errors at once.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Focus on error")), /*#__PURE__*/React.createElement("td", null, "On submit with errors, focus moves to the first invalid field. Page scrolls to bring it into view.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Autofill")), /*#__PURE__*/React.createElement("td", null, "Use semantic ", /*#__PURE__*/React.createElement("code", null, "autocomplete"), " attributes (", /*#__PURE__*/React.createElement("code", null, "email"), ", ", /*#__PURE__*/React.createElement("code", null, "given-name"), ", ", /*#__PURE__*/React.createElement("code", null, "organization"), "). Browsers do the right thing.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Prevent data loss")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "beforeunload"), " warning when the form is dirty. Suppressed during programmatic navigation."))));
const FormsApi = () => /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// app/ui/Form/types.ts
type FieldStatus = 'idle' | 'pending' | 'valid' | 'invalid';

type FieldProps<T> = {
  name: string;
  label: string;
  required?: boolean;
  help?: string;
  error?: string;          // present = aria-invalid
  status?: FieldStatus;    // drives icon + helper coloring
  // standard input forwarding
  value?: T;
  onChange?: (next: T) => void;
  onBlur?: () => void;
};

// React API — same surface for every input type
<Field name="imo" label="IMO number" required help="7 digits"
       status={imoStatus} error={imoError} {...register('imo')} />

// Async validator
useAsyncValidator('imo', async (value, signal) => {
  if (!/^\\d{7}$/.test(value)) return { error: 'IMO must be 7 digits.' };
  const res = await fetch(\`/api/imo/\${value}\`, { signal });
  if (!res.ok) return { error: 'Not found in IHS Maritime registry.' };
  return { valid: true, note: \`Matches \${(await res.json()).name}.\` };
}, { debounce: 300 });

// Form
<Form onSubmit={handle} validate={schema}
      onError={(errors) => focusFirstError(errors)}>
  …
</Form>`);
const FormsLayoutMatrix = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Form"), /*#__PURE__*/React.createElement("th", null, "Layout"), /*#__PURE__*/React.createElement("th", null, "Submit pattern"), /*#__PURE__*/React.createElement("th", null, "Cancel destination"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Create"), " (vessel, portfolio, rule)"), /*#__PURE__*/React.createElement("td", null, "Full page, top labels, 2-col grid for paired fields"), /*#__PURE__*/React.createElement("td", null, "Sticky footer \xB7 \"Create vessel\" (primary) + \"Cancel\" (ghost)"), /*#__PURE__*/React.createElement("td", null, "List page the user came from")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Edit / detail")), /*#__PURE__*/React.createElement("td", null, "Inline on detail page, edit-in-place per section"), /*#__PURE__*/React.createElement("td", null, "Per-section \"Save\" (primary) + \"Discard\"; disabled when clean"), /*#__PURE__*/React.createElement("td", null, "Stay on page; revert form to clean")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Quick add"), " (assign, tag)"), /*#__PURE__*/React.createElement("td", null, "Side panel, inline labels, single column"), /*#__PURE__*/React.createElement("td", null, "Footer \xB7 \"Apply\" (primary)"), /*#__PURE__*/React.createElement("td", null, "Close panel")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Multi-step")), /*#__PURE__*/React.createElement("td", null, "Centered card with stepper above"), /*#__PURE__*/React.createElement("td", null, "\"Next\" / \"Back\" per step; \"Create\" on review step"), /*#__PURE__*/React.createElement("td", null, "Exit confirmation if dirty")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Filters / config")), /*#__PURE__*/React.createElement("td", null, "Popover or panel, inline labels"), /*#__PURE__*/React.createElement("td", null, "\"Apply\" + \"Reset\""), /*#__PURE__*/React.createElement("td", null, "Close without applying"))));
const FormsDeepSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Field anatomy"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "One field, five parts. The label is above; the input is the default size for its density; helper text occupies the same slot that errors will, so layout doesn't jump when validation fires."), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-body"
}, /*#__PURE__*/React.createElement(FormAnatomyDemo, null)))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Field states"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Every input renders in eight states. Async validation is a first-class state \u2014 never blank during a registry lookup."), /*#__PURE__*/React.createElement(FieldStatesDemo, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Validation timing"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Five triggers. Pick by the cost of being wrong and the speed of the feedback loop."), /*#__PURE__*/React.createElement(ValidationTimingTable, null), /*#__PURE__*/React.createElement("div", {
  className: "callout warn",
  style: {
    marginTop: 12
  }
}, /*#__PURE__*/React.createElement("strong", null, "Never fire errors on every keystroke."), " A user typing is not making a mistake \u2014 they're not done. Errors fire on blur or submit.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Label layouts"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Top labels by default; inline labels for dense surfaces (side panels, inline edits, compact rows). Never mix within the same form."), /*#__PURE__*/React.createElement(LabelLayoutDemo, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Field grouping"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Use semantic ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "<fieldset>"), " + ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "<legend>"), " when fields belong together \u2014 screen readers announce the group on each field, and the visual chrome reinforces it."), /*#__PURE__*/React.createElement(FieldGroupDemo, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Multi-step forms"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Stepper above the form, one step in view at a time. Steps validate independently; Next is disabled until the current step is valid. Back never validates."), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-body"
}, /*#__PURE__*/React.createElement(StepperDemo, null))), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "Completed steps show a check glyph in success-500. The current step uses brand-600 with the step number. Future steps are muted.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Form layouts by purpose"), /*#__PURE__*/React.createElement(FormsLayoutMatrix, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Rules of engagement"), /*#__PURE__*/React.createElement(FormsRules, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "React API"), /*#__PURE__*/React.createElement(FormsApi, null)), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "The principle:"), " a form is a conversation. The user is talking; the form is listening. Don't interrupt mid-sentence (no per-keystroke errors), don't disable the submit button to make a point, and when the user makes a mistake, make the fix obvious \u2014 not a punishment."));
window.FormsDeepSection = FormsDeepSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-forms-deep.jsx", error: String((e && e.message) || e) }); }

// section-foundations-meta.jsx
try { (() => {
/* Section 1 — Audit summary + Principles */

const AuditSummary = () => {
  const findings = [{
    area: "Color",
    count: 47,
    note: "47 raw hex codes used directly across modules; 12 different greys; brand blues defined twice."
  }, {
    area: "Typography",
    count: 6,
    note: "6 H-level styles + 5 body sizes, mixed Lato / Open Sans / system; no semantic roles."
  }, {
    area: "Buttons",
    count: 3,
    note: "Two competing implementations (legacy styled-components Button.style.ts + new app/ui/Button.tsx). 3 variants × 5 sizes × 2 colors with inconsistent disabled state."
  }, {
    area: "Spacing",
    count: 0,
    note: "No spacing scale enforced; padding values range 2px–48px ad-hoc."
  }, {
    area: "Tables",
    count: 4,
    note: "Four table implementations: common/table, common/dataTable, app/ui/Table, app/components/Table."
  }, {
    area: "Forms",
    count: 0,
    note: "Inconsistent label/help/error patterns; checkboxes use FontAwesome glyph (Unicode F00C)."
  }, {
    area: "Shadows",
    count: 5,
    note: "5 distinct shadow recipes inline. No elevation scale."
  }, {
    area: "Radius",
    count: 6,
    note: "Border radius values: 3px, 4px, 5px, 6px, 12px, 9999px — all in use without rules."
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-head"
  }, /*#__PURE__*/React.createElement("h4", null, "Codebase audit \xB7 what we found"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "8 systemization gaps identified")), /*#__PURE__*/React.createElement("table", {
    className: "spec-table",
    style: {
      border: 0,
      borderRadius: 0
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: 140
    }
  }, "Area"), /*#__PURE__*/React.createElement("th", {
    style: {
      width: 70
    }
  }, "Count"), /*#__PURE__*/React.createElement("th", null, "Observation"))), /*#__PURE__*/React.createElement("tbody", null, findings.map(f => /*#__PURE__*/React.createElement("tr", {
    key: f.area
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, f.area)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, f.count || "—")), /*#__PURE__*/React.createElement("td", {
    style: {
      color: "var(--text-secondary)"
    }
  }, f.note))))));
};
const Principles = () => {
  const items = [{
    num: "01",
    title: "Clarity over decoration",
    body: "Information density is high in monitoring software. Every visual flourish must earn its place by aiding scanning, comparison, or decision-making — not by adorning."
  }, {
    num: "02",
    title: "One primary action per surface",
    body: "Pages, panels, modals and rows have at most one primary CTA. Secondary actions are visually quieter. Destructive actions are always confirmed."
  }, {
    num: "03",
    title: "Predictable, not novel",
    body: "Reuse existing patterns from the codebase before introducing new ones. Operators should be able to navigate any screen without retraining."
  }, {
    num: "04",
    title: "Status is semantic, not decorative",
    body: "Color carries meaning: red = danger / non-compliant, amber = warning, green = healthy. Never use brand colors to convey status."
  }, {
    num: "05",
    title: "Density with hierarchy",
    body: "Tables and dashboards are dense. Hierarchy is achieved through type weight, color contrast and whitespace — not through borders or boxes."
  }, {
    num: "06",
    title: "Accessible by default",
    body: "WCAG AA contrast on all text and controls. Every interactive element has a visible focus ring. Keyboard support is not optional."
  }, {
    num: "07",
    title: "Calm under stress",
    body: "Operators see this product during incidents. Motion is short and never distracts; loading states never block; errors are recoverable."
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "grid-2",
    style: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))"
    }
  }, items.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.num,
    className: "principle"
  }, /*#__PURE__*/React.createElement("div", {
    className: "num"
  }, "PRINCIPLE \u2014 ", p.num), /*#__PURE__*/React.createElement("h4", null, p.title), /*#__PURE__*/React.createElement("p", null, p.body))));
};
window.AuditSummary = AuditSummary;
window.Principles = Principles;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-foundations-meta.jsx", error: String((e && e.message) || e) }); }

// section-foundations.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Section 2 — Foundations: Color, Type, Spacing, Radius/Shadow */

const ColorSwatch = ({
  name,
  token,
  value,
  fg = "white"
}) => /*#__PURE__*/React.createElement("div", {
  className: "swatch"
}, /*#__PURE__*/React.createElement("div", {
  className: "swatch-color",
  style: {
    background: value,
    color: fg,
    padding: "8px 10px",
    display: "flex",
    alignItems: "flex-end"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 11,
    fontWeight: 600,
    opacity: 0.85
  }
}, name)), /*#__PURE__*/React.createElement("div", {
  className: "swatch-meta"
}, /*#__PURE__*/React.createElement("div", {
  className: "swatch-token"
}, token), /*#__PURE__*/React.createElement("div", {
  className: "swatch-hex"
}, value)));
const ColorScale = ({
  title,
  items
}) => /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 10
  }
}, title), /*#__PURE__*/React.createElement("div", {
  className: "grid-6"
}, items.map(it => /*#__PURE__*/React.createElement(ColorSwatch, _extends({
  key: it.token
}, it)))));
const ColorSection = () => {
  const brand = [{
    name: "700",
    token: "--brand-700",
    value: "#1f5fc7"
  }, {
    name: "600",
    token: "--brand-600",
    value: "#2d7ffb"
  }, {
    name: "500",
    token: "--brand-500",
    value: "#51a2fc"
  }, {
    name: "400",
    token: "--brand-400",
    value: "#8ec5fd"
  }, {
    name: "300",
    token: "--brand-300",
    value: "#bfdbfe",
    fg: "#2d7ffb"
  }, {
    name: "100",
    token: "--brand-100",
    value: "#dbeafe",
    fg: "#2d7ffb"
  }, {
    name: "050",
    token: "--brand-050",
    value: "#eff6ff",
    fg: "#2d7ffb"
  }];
  const slate = [{
    name: "950",
    token: "--slate-950",
    value: "#0B1220"
  }, {
    name: "900",
    token: "--slate-900",
    value: "#111827"
  }, {
    name: "800",
    token: "--slate-800",
    value: "#1F2937"
  }, {
    name: "700",
    token: "--slate-700",
    value: "#374151"
  }, {
    name: "600",
    token: "--slate-600",
    value: "#4B5563"
  }, {
    name: "500",
    token: "--slate-500",
    value: "#6B7280"
  }, {
    name: "400",
    token: "--slate-400",
    value: "#9CA3AF"
  }, {
    name: "300",
    token: "--slate-300",
    value: "#D1D5DB",
    fg: "#111827"
  }, {
    name: "200",
    token: "--slate-200",
    value: "#E5E7EB",
    fg: "#111827"
  }, {
    name: "150",
    token: "--slate-150",
    value: "#ECEEF2",
    fg: "#111827"
  }, {
    name: "100",
    token: "--slate-100",
    value: "#F3F4F6",
    fg: "#111827"
  }, {
    name: "50",
    token: "--slate-50",
    value: "#F9FAFB",
    fg: "#111827"
  }, {
    name: "white",
    token: "--white",
    value: "#FFFFFF",
    fg: "#111827"
  }];
  const status = [{
    name: "Success 700",
    token: "--success-700",
    value: "#15803D"
  }, {
    name: "Success 500",
    token: "--success-500",
    value: "#16A34A"
  }, {
    name: "Success 100",
    token: "--success-100",
    value: "#DCFCE7",
    fg: "#15803D"
  }, {
    name: "Success 050",
    token: "--success-050",
    value: "#F0FDF4",
    fg: "#15803D"
  }, {
    name: "Warning 700",
    token: "--warning-700",
    value: "#B45309"
  }, {
    name: "Warning 500",
    token: "--warning-500",
    value: "#D97706"
  }, {
    name: "Warning 100",
    token: "--warning-100",
    value: "#FEF3C7",
    fg: "#B45309"
  }, {
    name: "Warning 050",
    token: "--warning-050",
    value: "#FFFBEB",
    fg: "#B45309"
  }, {
    name: "Danger 800",
    token: "--danger-800",
    value: "#991B1B"
  }, {
    name: "Danger 700",
    token: "--danger-700",
    value: "#B91C1C"
  }, {
    name: "Danger 500",
    token: "--danger-500",
    value: "#DC2626"
  }, {
    name: "Danger 100",
    token: "--danger-100",
    value: "#FEE2E2",
    fg: "#B91C1C"
  }, {
    name: "Danger 050",
    token: "--danger-050",
    value: "#FEF2F2",
    fg: "#B91C1C"
  }, {
    name: "Info 700",
    token: "--info-700",
    value: "#1D4ED8"
  }, {
    name: "Info 500",
    token: "--info-500",
    value: "#2563EB"
  }, {
    name: "Info 100",
    token: "--info-100",
    value: "#DBEAFE",
    fg: "#1D4ED8"
  }, {
    name: "Info 050",
    token: "--info-050",
    value: "#EFF6FF",
    fg: "#1D4ED8"
  }];
  const ratings = [{
    name: "Rating A",
    token: "--rating-a",
    value: "#2E7D4F"
  }, {
    name: "Rating B",
    token: "--rating-b",
    value: "#6FA84A"
  }, {
    name: "Rating C",
    token: "--rating-c",
    value: "#C9A227",
    fg: "#111827"
  }, {
    name: "Rating D",
    token: "--rating-d",
    value: "#D97706"
  }, {
    name: "Rating E",
    token: "--rating-e",
    value: "#C0392B"
  }];
  const semantic = [["--bg-app", "Page background", "#F9FAFB"], ["--bg-canvas", "Map / dashboard canvas", "#F5F7FA"], ["--bg-surface", "Cards, modals, panels", "#FFFFFF"], ["--bg-raised", "Elevated surfaces", "#FFFFFF"], ["--bg-sunken", "Form rows, inset blocks", "#F9FAFB"], ["--bg-muted", "Disabled, placeholders", "#F3F4F6"], ["--bg-inverse", "Dark surfaces, tooltips", "#111827"], ["--border-subtle", "Internal dividers", "#ECEEF2"], ["--border-default", "Cards, inputs, buttons", "#E5E7EB"], ["--border-strong", "Hover, emphasized", "#D1D5DB"], ["--border-info", "Info badge / alert border", "color-mix(in srgb, var(--info-500) 18%, transparent)"], ["--border-success", "Success badge / alert border", "color-mix(in srgb, var(--success-500) 18%, transparent)"], ["--border-warning", "Warning badge / alert border", "color-mix(in srgb, var(--warning-500) 20%, transparent)"], ["--border-danger", "Danger badge / alert border", "color-mix(in srgb, var(--danger-500) 18%, transparent)"], ["--text-primary", "Body, headings", "#111827"], ["--text-secondary", "Supporting copy", "#4B5563"], ["--text-muted", "Help, captions, meta", "#6B7280"], ["--text-disabled", "Disabled controls", "#9CA3AF"], ["--text-inverse", "On dark surfaces", "#FFFFFF"], ["--text-link", "Inline links", "#51a2fc"], ["--text-on-brand", "On primary buttons", "#FFFFFF"]];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ColorScale, {
    title: "Brand \xB7 for primary actions, links and focus states only",
    items: brand
  }), /*#__PURE__*/React.createElement(ColorScale, {
    title: "Slate \xB7 neutral UI palette",
    items: slate
  }), /*#__PURE__*/React.createElement(ColorScale, {
    title: "Status \xB7 semantic only \u2014 never decorative",
    items: status
  }), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginBottom: 10
    }
  }, "Risk rating scale (preserved from product)"), /*#__PURE__*/React.createElement("div", {
    className: "grid-6"
  }, ratings.map(it => /*#__PURE__*/React.createElement(ColorSwatch, _extends({
    key: it.token
  }, it)))), /*#__PURE__*/React.createElement("p", {
    className: "t-caption",
    style: {
      marginTop: 8
    }
  }, "Locked to A\u2013E values from ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "colors.ratings"), ". These are domain-specific (PSC compliance grades) and must remain stable across the product.")), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginBottom: 10
    }
  }, "Semantic surface, border & text tokens"), /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, semantic.map(([t, role, val]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    className: "token-row"
  }, /*#__PURE__*/React.createElement("code", null, t), /*#__PURE__*/React.createElement("span", {
    className: "swatch-mini",
    style: {
      background: val
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)"
    }
  }, role), /*#__PURE__*/React.createElement("span", {
    className: "t-mono",
    style: {
      color: "var(--text-muted)"
    }
  }, val))))), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginBottom: 10
    }
  }, "Usage rules"), /*#__PURE__*/React.createElement("table", {
    className: "spec-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Rule"), /*#__PURE__*/React.createElement("th", null, "Why"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Brand color is reserved for primary CTAs, selected nav, links, and focus rings."), /*#__PURE__*/React.createElement("td", null, "Prevents brand from competing with status colors during incidents.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Status colors never carry decorative weight (e.g. success-100 is not a \"nice green tint\")."), /*#__PURE__*/React.createElement("td", null, "So users learn that any colored badge / row tint ", /*#__PURE__*/React.createElement("em", null, "means"), " something.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Body text is always ", /*#__PURE__*/React.createElement("code", null, "--text-primary"), " on light surfaces. Never < 4.5:1 contrast."), /*#__PURE__*/React.createElement("td", null, "WCAG AA on all dense table content.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Backgrounds use only the four ", /*#__PURE__*/React.createElement("code", null, "--bg-*"), " tokens. No raw hex in modules."), /*#__PURE__*/React.createElement("td", null, "Single source of truth; easier to dark-mode later.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "The legacy ", /*#__PURE__*/React.createElement("code", null, "react-light-blue / react-dark-blue"), " map to ", /*#__PURE__*/React.createElement("code", null, "--brand-300 / --brand-600"), "."), /*#__PURE__*/React.createElement("td", null, "Source compatibility during migration."))))));
};
const toRem = px => parseFloat((parseFloat(px) / 16).toFixed(4));
const TypeSpecimen = ({
  cls,
  label,
  family,
  weight,
  size,
  lh,
  role
}) => /*#__PURE__*/React.createElement("div", {
  className: "token-row",
  style: {
    gridTemplateColumns: "200px 1fr 200px"
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    fontWeight: 600
  }
}, label), /*#__PURE__*/React.createElement("div", {
  className: "t-caption"
}, role)), /*#__PURE__*/React.createElement("div", {
  className: cls
}, "The quick brown fox jumps over the lazy dog"), /*#__PURE__*/React.createElement("div", {
  className: "t-mono",
  style: {
    color: "var(--text-muted)",
    fontSize: 11,
    lineHeight: 1.45
  }
}, /*#__PURE__*/React.createElement("div", null, family, " \xB7 ", weight), /*#__PURE__*/React.createElement("div", null, size, "px / ", lh, "px"), /*#__PURE__*/React.createElement("div", {
  style: {
    opacity: 0.75
  }
}, toRem(size), "rem / ", toRem(lh), "rem")));
const TypeSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 10
  }
}, "Type roles"), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement(TypeSpecimen, {
  cls: "t-display",
  label: "Display",
  role: "Page hero on dashboards. Use sparingly.",
  family: "Exo",
  weight: "600",
  size: "32",
  lh: "40"
}), /*#__PURE__*/React.createElement(TypeSpecimen, {
  cls: "t-h1",
  label: "H1",
  role: "Page header title (one per page).",
  family: "Exo",
  weight: "600",
  size: "24",
  lh: "32"
}), /*#__PURE__*/React.createElement(TypeSpecimen, {
  cls: "t-h2",
  label: "H2",
  role: "Section / card group title.",
  family: "Exo",
  weight: "600",
  size: "20",
  lh: "28"
}), /*#__PURE__*/React.createElement(TypeSpecimen, {
  cls: "t-h3",
  label: "H3",
  role: "Card title, modal title.",
  family: "Exo",
  weight: "600",
  size: "16",
  lh: "24"
}), /*#__PURE__*/React.createElement(TypeSpecimen, {
  cls: "t-h4",
  label: "H4",
  role: "Subsection within a card.",
  family: "Exo",
  weight: "600",
  size: "14",
  lh: "20"
}), /*#__PURE__*/React.createElement(TypeSpecimen, {
  cls: "t-body",
  label: "Body",
  role: "Default body text.",
  family: "Inter",
  weight: "400",
  size: "14",
  lh: "20"
}), /*#__PURE__*/React.createElement(TypeSpecimen, {
  cls: "t-body-sm",
  label: "Body sm",
  role: "Tables, dense panels, sidebars.",
  family: "Inter",
  weight: "400",
  size: "13",
  lh: "18"
}), /*#__PURE__*/React.createElement(TypeSpecimen, {
  cls: "t-caption",
  label: "Caption",
  role: "Help, meta, captions.",
  family: "Inter",
  weight: "400",
  size: "12",
  lh: "16"
}), /*#__PURE__*/React.createElement(TypeSpecimen, {
  cls: "t-label",
  label: "Label",
  role: "Field labels, table headers.",
  family: "Inter",
  weight: "600",
  size: "12",
  lh: "16"
}), /*#__PURE__*/React.createElement(TypeSpecimen, {
  cls: "t-overline",
  label: "Overline",
  role: "Section eyebrows, status group titles.",
  family: "Inter",
  weight: "600",
  size: "11",
  lh: "14"
}), /*#__PURE__*/React.createElement(TypeSpecimen, {
  cls: "t-mono",
  label: "Mono",
  role: "IMO, MMSI, codes, IDs, JSON.",
  family: "JetBrains Mono",
  weight: "400",
  size: "12.5",
  lh: "18"
}))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 10
  }
}, "Rationale"), /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    color: "var(--text-secondary)",
    lineHeight: 1.65
  }
}, /*#__PURE__*/React.createElement("li", null, "Consolidate Lato + Open Sans \u2192 ", /*#__PURE__*/React.createElement("strong", null, "Inter"), ": better screen rendering at 12\u201314px, true tabular-nums, matches B2B SaaS conventions (Linear / Stripe / Vercel)."), /*#__PURE__*/React.createElement("li", null, "Reduce 6 H-styles + 5 body sizes \u2192 ", /*#__PURE__*/React.createElement("strong", null, "5 heading roles + 3 body roles + 2 utility"), ". Maps cleanly to product usage."), /*#__PURE__*/React.createElement("li", null, "Always use ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "tabular-nums"), " on numeric table cells, IMO codes, coordinates, timestamps."), /*#__PURE__*/React.createElement("li", null, "Never use sizes < 12px in production UI. ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "10px"), " body (legacy ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "bodyXXsmall"), ") is removed."))));
const SpacingSection = () => {
  const scale = [["--space-1", 4, "Tight pairings (icon + label inside a chip)"], ["--space-2", 8, "Default form gap, button gap, badge padding"], ["--space-3", 12, "Card inner padding, list row gap"], ["--space-4", 16, "Standard section gap, card body padding"], ["--space-5", 20, "Comfortable form vertical spacing"], ["--space-6", 24, "Card-to-card gap on dashboards"], ["--space-7", 32, "Section vertical spacing on detail pages"], ["--space-8", 40, "Page header vertical padding"], ["--space-9", 48, "Major page section breaks"], ["--space-10", 64, "Page top padding (desktop)"], ["--space-11", 96, "Empty / error full-page states"]];
  return /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, scale.map(([t, v, use]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    className: "token-row",
    style: {
      gridTemplateColumns: "180px 120px 120px 1fr"
    }
  }, /*#__PURE__*/React.createElement("code", null, t), /*#__PURE__*/React.createElement("span", {
    className: "t-mono",
    style: {
      color: "var(--text-secondary)"
    }
  }, v, "px ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)"
    }
  }, "\xB7 ", toRem(v), "rem")), /*#__PURE__*/React.createElement("div", {
    className: "preview"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--brand-300)",
      height: 12,
      width: v,
      borderRadius: 2
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)"
    }
  }, use))));
};
const RadiusShadowSection = () => {
  const radii = [["--radius-xs", 2, "Inline tags, status dots' inner shapes"], ["--radius-sm", 4, "Badges, small chips, table cells"], ["--radius-md", 6, "Buttons, inputs, popovers — DEFAULT"], ["--radius-lg", 8, "Cards, modals, drawers"], ["--radius-xl", 12, "Onboarding & marketing surfaces (rare)"], ["--radius-pill", "9999", "Pills, switches, avatars"]];
  const shadows = [["--shadow-xs", "Resting cards, secondary buttons", "0 1px 0 rgba(15, 23, 42, 0.04)"], ["--shadow-sm", "Static panels, inline cards", "0 1px 2px rgba(15, 23, 42, 0.06)"], ["--shadow-md", "Popovers, dropdowns, tooltips", "0 4px 12px -2px rgba(15, 23, 42, 0.08)"], ["--shadow-lg", "Drawers, side panels", "0 12px 24px -8px rgba(15, 23, 42, 0.12)"], ["--shadow-xl", "Modals only", "0 24px 48px -12px rgba(15, 23, 42, 0.18)"]];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginBottom: 10
    }
  }, "Radius scale"), /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, radii.map(([t, v, use]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    className: "token-row",
    style: {
      gridTemplateColumns: "180px 80px 80px 1fr"
    }
  }, /*#__PURE__*/React.createElement("code", null, t), /*#__PURE__*/React.createElement("span", {
    className: "t-mono",
    style: {
      color: "var(--text-muted)"
    }
  }, v, "px"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      background: "var(--brand-300)",
      borderRadius: typeof v === "number" ? v : 9999
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)"
    }
  }, use))))), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginBottom: 10
    }
  }, "Elevation"), /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, shadows.map(([t, use, raw]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    className: "token-row",
    style: {
      gridTemplateColumns: "180px 1fr 80px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("code", null, t), /*#__PURE__*/React.createElement("div", {
    className: "t-caption",
    style: {
      marginTop: 2
    }
  }, use)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 80,
      height: 60,
      background: "white",
      border: "1px solid var(--border-default)",
      borderRadius: 6,
      boxShadow: `var(${t})`
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "t-mono",
    style: {
      color: "var(--text-muted)",
      fontSize: 10
    }
  }, raw)))), /*#__PURE__*/React.createElement("div", {
    className: "callout",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Rule:"), " Borders define structure; shadows define elevation. A surface should rarely use both heavily \u2014 choose one. Dashboards default to ", /*#__PURE__*/React.createElement("em", null, "border + shadow-xs"), ", never ", /*#__PURE__*/React.createElement("em", null, "shadow-md"), ".")));
};
window.ColorSection = ColorSection;
window.TypeSection = TypeSection;
window.SpacingSection = SpacingSection;
window.RadiusShadowSection = RadiusShadowSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-foundations.jsx", error: String((e && e.message) || e) }); }

// section-foundations2.jsx
try { (() => {
/* Section — Foundations II: Iconography (Lucide), Density modes, Motion */

/* ============================================================
   Iconography — Lucide
   ============================================================ */

const ICON_SIZE_RULES = [["12 px", "h-3 w-3", "Inline meta, tiny badges, dense table cells, sparkline endcaps."], ["14 px", "h-3.5 w-3.5", "Menu glyphs, breadcrumb separators, inline-with-12-px-caption pairings."], ["16 px", "h-4 w-4", "Default UI size. Buttons (xs/sm), inputs, chevrons, kebabs, table actions."], ["20 px", "h-5 w-5", "Lucide default. Toolbar actions, app-shell nav items, card header actions."], ["24 px", "h-6 w-6", "Standalone affordances, alert / banner leading glyphs, empty-state guidance."], ["32 px", "h-8 w-8", "Empty-state hero, category landing tiles, large badge inside a circle."], ["40 px", "h-10 w-10", "Dashboard module tiles, marketing-style category headers. Sparingly."]];
const LUCIDE_INVENTORY = [
// [alias, lucideName, usage] — kept alphabetical by alias
["alertTri", "TriangleAlert", "Warning state, alert badge"], ["anchor", "Anchor", "Ports nav, port detail"], ["arrowDown", "ArrowDown", "Sort desc, negative delta"], ["arrowUp", "ArrowUp", "Sort asc, positive delta"], ["bell", "Bell", "Notifications"], ["bolt", "Zap", "Offshore/Energy nav"], ["briefcase", "Briefcase", "Portfolios nav"], ["building", "Building", "Property nav"], ["cargo", "Container", "Cargo nav, container metrics"], ["check", "Check", "Confirm, selected state, completed"], ["chev", "ChevronRight", "Disclosure, drill-in, breadcrumbs"], ["chevDown", "ChevronDown", "Dropdown trigger, accordion"], ["clipboard", "Clipboard", "Copy action, audit"], ["clock", "Clock", "Time-range filters, history"], ["cloud", "Cloud", "Weather nav"], ["cloudrain", "CloudRain", "Weather event glyph"], ["compass", "Compass", "Map orient, heading"], ["doc", "FileText", "Reports nav, document rows"], ["download", "Download", "Export, save file, download report"], ["factory", "Factory", "Industry classifications"], ["filter", "Filter", "Filter buttons, map filter menu"], ["gem", "Gem", "Assets search nav"], ["globe", "Globe", "Regions nav, world view toggle"], ["grid", "LayoutGrid", "Dashboard nav"], ["help", "CircleHelp", "Inline help, tooltips trigger"], ["layers", "Layers", "Map layer switcher"], ["leaf", "Leaf", "ESG / sustainability filters"], ["maximize", "Maximize2", "Map fullscreen enter"], ["menu", "Menu", "Sidebar trigger"], ["minimize", "Minimize2", "Map fullscreen exit"], ["minus", "Minus", "Zoom out, decrement"], ["news", "Newspaper", "News nav"], ["office", "Building2", "Companies nav"], ["pin", "MapPin", "Location refs in popovers and lists"], ["plane", "Plane", "Aviation nav, aircraft detail"], ["plus", "Plus", "Create actions"], ["radio", "RadioTower", "AIS / signal status"], ["search", "Search", "Toolbar, command palette"], ["shield", "ShieldCheck", "Permissions, security indicators"], ["ship", "Ship", "Marine nav, vessel detail"], ["tag", "Tag", "Labels menu, badge editor"], ["upload", "Upload", "Import data, attach file, upload report"], ["users", "Users", "Organizations, teams"], ["wave", "Waves", "NatCat nav, marine events"], ["x", "X", "Close, dismiss, remove chip"]];

// Inline replicas (a few of the most common) — for the spec page itself,
// which doesn't load Lucide. Strokes match Lucide's default (stroke-width=2,
// linecap/linejoin=round).
const LucideShim = {
  search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35",
  filter: "M4 5h16M7 12h10M10 19h4",
  bell: "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9m6 13a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3Z",
  ship: "M3 18s2-1 9-1 9 1 9 1M5 14l1.5-7h11L19 14M12 4v3M9 21v-3m6 3v-3",
  plane: "M21 12 3 18l4-6-4-6 18 6Z",
  anchor: "M12 22V8M5 12H2a10 10 0 0 0 20 0h-3M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  layers: "M12 2 2 7l10 5 10-5-10-5Zm-10 15 10 5 10-5M2 12l10 5 10-5",
  globe: "M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
  plus: "M12 5v14M5 12h14",
  check: "M20 6 9 17l-5-5",
  x: "M18 6 6 18M6 6l12 12",
  chev: "m9 6 6 6-6 6",
  chevDown: "m6 9 6 6 6-6",
  arrowUp: "m5 12 7-7 7 7M12 19V5",
  arrowDown: "M12 5v14M5 12l7 7 7-7",
  maximize: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  alertTri: "M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z",
  clock: "M12 6v6l4 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z",
  pin: "M12 22s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12ZM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  tag: "M20 13.41 11.42 22a2 2 0 0 1-2.84 0L2 15.42a2 2 0 0 1 0-2.84L10.59 4a2 2 0 0 1 1.41-.59H19a2 2 0 0 1 2 2v7.41a2 2 0 0 1-.59 1.41ZM7 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
};
const Lu = ({
  name,
  size = 20,
  className = ""
}) => /*#__PURE__*/React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className,
  "aria-hidden": "true",
  style: {
    display: "block"
  }
}, (LucideShim[name] || "").split(/(?=M)/).filter(Boolean).map((d, i) => /*#__PURE__*/React.createElement("path", {
  key: i,
  d: d
})));

// Real Lucide glyphs from the live library (window.lucide, UMD). Each icon is an
// IconNode: an array of [tag, attrs] tuples. Falls back to the offline shim's
// generic glyph only if the library hasn't loaded.
const LuReal = ({
  name,
  size = 20,
  className = ""
}) => {
  const icon = typeof window !== "undefined" && window.lucide ? window.lucide[name] || window.lucide.icons && window.lucide.icons[name] : null;
  // Lucide icon node: ["svg", svgAttrs, children]. We supply our own <svg> wrapper
  // and render only the children (paths/circles/etc.) at index [2].
  const children = Array.isArray(icon) && Array.isArray(icon[2]) ? icon[2] : null;
  if (!children) return /*#__PURE__*/React.createElement(Lu, {
    name: "tag",
    size: size,
    className: className
  });
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className,
    "aria-hidden": "true",
    style: {
      display: "block"
    }
  }, children.map(([tag, attrs], i) => React.createElement(tag, {
    key: i,
    ...attrs
  })));
};
const IconSizesPanel = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Size"), /*#__PURE__*/React.createElement("th", null, "Tailwind"), /*#__PURE__*/React.createElement("th", null, "Sample"), /*#__PURE__*/React.createElement("th", null, "Where to use it"))), /*#__PURE__*/React.createElement("tbody", null, ICON_SIZE_RULES.map(([px, tw, where]) => {
  const sz = parseInt(px, 10);
  return /*#__PURE__*/React.createElement("tr", {
    key: px
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, px)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, tw)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      color: "var(--slate-700)"
    }
  }, /*#__PURE__*/React.createElement(Lu, {
    name: "bell",
    size: sz
  }))), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 12.5,
      color: "var(--text-secondary)"
    }
  }, where));
})));
const StrokeRules = () => /*#__PURE__*/React.createElement("div", {
  className: "grid-3"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Stroke weight")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, "Lucide default \u2014 ", /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--text-primary)"
  }
}, "2 px"), ". Never thin Lucide icons below 1.5 \u2014 they're designed for 2 and the optical balance breaks. Custom icons in the system follow the same weight.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Color")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, "Always ", /*#__PURE__*/React.createElement("code", null, "currentColor"), " \u2014 icons inherit from their text or button context. Status-toned icons get their color from the parent (", /*#__PURE__*/React.createElement("code", null, ".ds-alert--warning"), " etc.), never hardcoded.")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Alignment")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, "Icons inside a label use ", /*#__PURE__*/React.createElement("code", null, "display: inline-flex"), " + ", /*#__PURE__*/React.createElement("code", null, "gap: 6px"), " with the parent \u2014 never margins. Vertically centered to the cap-height, not the baseline.")));
const A11yIconRules = () => /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head",
  style: {
    background: "var(--success-050)"
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title",
  style: {
    color: "var(--success-700)"
  }
}, "DO")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "row",
  style: {
    marginBottom: 12
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--icon",
  "aria-label": "Filter vessels"
}, /*#__PURE__*/React.createElement(Lu, {
  name: "filter",
  size: 14
})), /*#__PURE__*/React.createElement("code", {
  style: {
    fontSize: 11
  }
}, "aria-label=\"Filter vessels\"")), /*#__PURE__*/React.createElement("div", {
  className: "row"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary"
}, /*#__PURE__*/React.createElement(Lu, {
  name: "plus",
  size: 14
}), " Add policy"), /*#__PURE__*/React.createElement("code", {
  style: {
    fontSize: 11
  }
}, "icon + visible text \xB7 icon is ", /*#__PURE__*/React.createElement("code", null, "aria-hidden"))))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head",
  style: {
    background: "var(--danger-050)"
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title",
  style: {
    color: "var(--danger-700)"
  }
}, "DON'T")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "row",
  style: {
    marginBottom: 12
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--icon"
}, /*#__PURE__*/React.createElement(Lu, {
  name: "filter",
  size: 14
})), /*#__PURE__*/React.createElement("code", {
  style: {
    fontSize: 11,
    color: "var(--danger-700)"
  }
}, "icon-only \xB7 no aria-label")), /*#__PURE__*/React.createElement("div", {
  className: "row"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary",
  "aria-label": "Add policy"
}, /*#__PURE__*/React.createElement(Lu, {
  name: "plus",
  size: 14
}), " Add policy"), /*#__PURE__*/React.createElement("code", {
  style: {
    fontSize: 11,
    color: "var(--danger-700)"
  }
}, "aria-label duplicates the visible text")))));
const IconographySection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Library: Lucide"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Skytek uses ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "lucide@0.469.0"), " as its canonical icon library. Pinned, loaded as the UMD bundle, and resolved through a thin alias map. No second icon library ships with the product. New icons either come from Lucide or go through an RFC."), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `<!-- Load order: before chrome.js, after Tailwind -->
<script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js"></script>

// app/ui/icons/lucide.ts — single source of truth for aliases + sizes
export const LUCIDE_NAMES = {
  menu:  'Menu',         grid:    'LayoutGrid',
  ship:  'Ship',         plane:   'Plane',
  bolt:  'Zap',          anchor:  'Anchor',
  cargo: 'Container',    pin:     'MapPin',
  // … see full inventory below
} as const;

export const LUCIDE_SIZES: Partial<Record<keyof typeof LUCIDE_NAMES, string>> = {
  search:    'h-4 w-4',   chev:      'h-4 w-4',
  arrowUp:   'h-3 w-3',   arrowDown: 'h-3 w-3',
  ship:      'h-10 w-10', plane:     'h-10 w-10',
};

export const I = new Proxy({} as Record<keyof typeof LUCIDE_NAMES, string>, {
  get: (_t, alias: string) => lucideIcon(alias),  // returns SVG string
});`), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "Use ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, `${'$'}{I.alias}`), " in chrome / shell strings; use ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "<Icon name=\"alias\" />"), " in React. Modules never reach for ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "lucide.icons.ShipFront"), " directly \u2014 always through the alias map.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Sizes"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Seven discrete sizes. The Lucide grid is 24 \u2014 anything between rasterizes poorly. Pick from the table; don't interpolate."), /*#__PURE__*/React.createElement(IconSizesPanel, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Stroke, color & alignment"), /*#__PURE__*/React.createElement(StrokeRules, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Accessible icon buttons"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Icon-only buttons need an ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-label"), ". Icon+label buttons must not \u2014 the label IS the accessible name, and a redundant ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-label"), " overrides it."), /*#__PURE__*/React.createElement(A11yIconRules, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Inventory"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "The canonical alias map. Aliases are stable across product surfaces \u2014 when \"ship\" is added to a new module, every module already knows what it means. Adding to this list requires an RFC + entry in ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "LUCIDE_NAMES"), "."), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, LUCIDE_INVENTORY.length, " canonical aliases"), /*#__PURE__*/React.createElement("span", {
  className: "meta"
}, "v1.0 \xB7 sync with chrome.js")), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 8,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 0
  }
}, LUCIDE_INVENTORY.map(([alias, lucide, use]) => /*#__PURE__*/React.createElement("div", {
  key: alias,
  style: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    borderTop: "1px solid var(--border-subtle)"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    width: 28,
    height: 28,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--slate-700)",
    background: "var(--slate-50)",
    borderRadius: "var(--radius-sm)",
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement(LuReal, {
  name: lucide,
  size: 16
})), /*#__PURE__*/React.createElement("div", {
  style: {
    minWidth: 0,
    flex: 1
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12.5,
    fontWeight: 600
  }
}, /*#__PURE__*/React.createElement("code", {
  style: {
    color: "var(--brand-600)"
  }
}, alias)), /*#__PURE__*/React.createElement("div", {
  className: "t-caption",
  style: {
    fontSize: 11
  }
}, lucide, " \xB7 ", use)))))), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "Icons above render from the live Lucide library (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "lucide@0.469.0"), ") \u2014 the same source the product uses.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Custom icons"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Almost everything is in Lucide. The few exceptions: brand glyphs (the Skytek \"S\" mark), domain shapes (the vessel teardrop on maps), and rating pills (A\u2013E). Custom icons live in ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "app/ui/icons/custom/*.svg"), ", exported the same way as Lucide aliases, and follow the same 24-grid, 2-px stroke conventions."), /*#__PURE__*/React.createElement("div", {
  className: "callout warn"
}, /*#__PURE__*/React.createElement("strong", null, "Before adding a custom icon, check Lucide first."), " The library has ~1,500 glyphs; most \"we need a new icon\" requests are actually solved by a less-obvious Lucide name.")));

/* ============================================================
   Density modes
   ============================================================ */

const DensityComparison = () => {
  const rows = [["MV ATLANTIC PEARL", "Container", "Liberia", "14.2 kn", "075°", "Underway"], ["MV NORDIC STAR", "LNG Carrier", "Norway", "11.8 kn", "220°", "Underway"], ["MV MIRAMAR", "Tanker", "Panama", "13.4 kn", "160°", "Underway"], ["MV SOUTHERN CROSS", "Bulk Carrier", "Greece", "10.9 kn", "320°", "At Anchor"], ["MV GULF VOYAGER", "Tanker", "Marshall I.", "12.6 kn", "090°", "Underway"]];
  const renderTable = density => /*#__PURE__*/React.createElement("div", {
    "data-density": density,
    style: {
      background: "var(--white)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-density-head",
    style: {
      padding: density === "compact" ? "10px 14px" : "14px 16px"
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 13
    }
  }, "Vessels"), /*#__PURE__*/React.createElement("span", {
    className: "t-caption",
    style: {
      marginLeft: 8
    }
  }, rows.length, " of 412 \xB7 ", /*#__PURE__*/React.createElement("code", {
    style: {
      fontSize: 11
    }
  }, "data-density=\"", density, "\""))), /*#__PURE__*/React.createElement("table", {
    className: "ds-table",
    style: {
      tableLayout: "auto"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Vessel"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Flag"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Speed"), /*#__PURE__*/React.createElement("th", null, "Heading"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r[0],
    style: {
      "--row-pad": density === "compact" ? "5px 12px" : "12px 12px"
    }
  }, r.map((c, i) => /*#__PURE__*/React.createElement("td", {
    key: i,
    style: {
      padding: density === "compact" ? "5px 12px" : "12px 12px",
      fontSize: density === "compact" ? 12 : 13
    },
    className: i === 3 ? "num" : ""
  }, c)))))));
  return /*#__PURE__*/React.createElement("div", {
    className: "grid-2",
    style: {
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginBottom: 8
    }
  }, "Comfortable \xB7 default for dashboards & detail"), renderTable("comfortable")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t-label",
    style: {
      marginBottom: 8
    }
  }, "Compact \xB7 default for data-heavy lists"), renderTable("compact")));
};
const DensityTokenMatrix = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Element"), /*#__PURE__*/React.createElement("th", null, "Comfortable"), /*#__PURE__*/React.createElement("th", null, "Compact"), /*#__PURE__*/React.createElement("th", null, "How it's wired"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Row padding (table, list)"), /*#__PURE__*/React.createElement("td", null, "12 px y"), /*#__PURE__*/React.createElement("td", null, "5\u20136 px y"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, ".ds-table.is-comfy"), " / ", /*#__PURE__*/React.createElement("code", null, ".ds-table.is-compact"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Body font size"), /*#__PURE__*/React.createElement("td", null, "13 px"), /*#__PURE__*/React.createElement("td", null, "12.5 px"), /*#__PURE__*/React.createElement("td", null, "Inherited via row class")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Card padding"), /*#__PURE__*/React.createElement("td", null, "16 px"), /*#__PURE__*/React.createElement("td", null, "12 px"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "[data-density=\"compact\"] .ds-card-body"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Gap between siblings"), /*#__PURE__*/React.createElement("td", null, "16 px (", /*#__PURE__*/React.createElement("code", null, "--space-5"), ")"), /*#__PURE__*/React.createElement("td", null, "12 px (", /*#__PURE__*/React.createElement("code", null, "--space-4"), ")"), /*#__PURE__*/React.createElement("td", null, "Utility ", /*#__PURE__*/React.createElement("code", null, ".gap-density"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Section vertical padding"), /*#__PURE__*/React.createElement("td", null, "20 px"), /*#__PURE__*/React.createElement("td", null, "12 px"), /*#__PURE__*/React.createElement("td", null, "Utility ", /*#__PURE__*/React.createElement("code", null, ".py-density"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Sidebar nav item"), /*#__PURE__*/React.createElement("td", null, "10 px y"), /*#__PURE__*/React.createElement("td", null, "6 px y"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "[data-density] .ds-sidebar-item"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Form field height"), /*#__PURE__*/React.createElement("td", null, "32 px (md)"), /*#__PURE__*/React.createElement("td", null, "28 px (sm)"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "ds-input"), " + size class")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Button default size"), /*#__PURE__*/React.createElement("td", null, "md (32 px)"), /*#__PURE__*/React.createElement("td", null, "sm (28 px)"), /*#__PURE__*/React.createElement("td", null, "Component sets default from density context"))));
const DensityDefaults = () => /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, [["Surface", "Default density", "Why"]].map(() => null), [["Dashboards (Marine, Aviation, etc.)", "comfortable", "Information-light tiles; visual hierarchy comes from whitespace."], ["Detail pages (Vessel, Aircraft, Port)", "comfortable", "Reading mode — operators dwell on individual records."], ["List + search (Assets, Companies)", "compact", "Operator scans 50+ rows; row count beats whitespace."], ["Tables inside cards (alerts, history)", "compact", "Local density — table compresses without affecting outer card."], ["Map popovers", "compact", "Constrained 300 px width; every line counts."], ["Reports & exports", "comfortable", "Print medium; whitespace reads as quality."], ["Modals & overlays", "comfortable", "Single task focus."]].map(([s, d, w]) => /*#__PURE__*/React.createElement("div", {
  key: s,
  className: "token-row",
  style: {
    gridTemplateColumns: "260px 130px 1fr"
  }
}, /*#__PURE__*/React.createElement("strong", {
  style: {
    fontSize: 13
  }
}, s), /*#__PURE__*/React.createElement("span", {
  className: `ds-badge ds-badge--${d === "compact" ? "info" : "neutral"}`
}, d), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, w))));
const DensitySection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "One attribute, two modes"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Density is a single attribute on the ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "<body>"), " \u2014 ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "data-density=\"comfortable\""), " or ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "data-density=\"compact\""), ". Every density-aware component reads from it. Operators can switch globally via the Tweaks panel; individual surfaces can override locally on a parent element."), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `<!-- Global, on <body> -->
<body data-density="compact">

<!-- Local override — affects only this subtree -->
<section data-density="compact">
  <table class="ds-table">…</table>
</section>

// Programmatic switch (from Tweaks)
document.body.dataset.density = 'compact';`)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Side by side"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Same content, two densities. Same tokens. The diff is mechanical \u2014 no per-table styling, no inline padding."), /*#__PURE__*/React.createElement(DensityComparison, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Token mapping"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "What density actually changes. Anything not listed here is density-invariant \u2014 colors, radii, type families, icon sizes don't move with density."), /*#__PURE__*/React.createElement(DensityTokenMatrix, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Defaults by surface"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "The product picks an opinionated default per surface. Users can override; the spec records the starting point."), /*#__PURE__*/React.createElement(DensityDefaults, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Density utilities"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Two helpers for density-aware spacing in module code. They make density propagate to one-off sections without authoring a custom variant."), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `/* In tokens.css */
[data-density="comfortable"] .py-density { padding-top: 20px;  padding-bottom: 20px;  }
[data-density="compact"]     .py-density { padding-top: 12px;  padding-bottom: 12px;  }
[data-density="comfortable"] .gap-density { gap: var(--space-4); }
[data-density="compact"]     .gap-density { gap: var(--space-3); }`), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "Reserved for cases where component-level density isn't enough. Don't reach for ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".gap-density"), " if a stock ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".ds-card"), " would do.")), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "Density is presentation, not data."), " Switching modes never changes what's on screen \u2014 just how tightly it's packed. Don't gate features behind a density state."));

/* ============================================================
   Motion
   ============================================================ */

const DURATION_TOKENS = [["--motion-instant", "80 ms", "Microinteractions: button press, checkbox tick, switch flip. Below the threshold of feeling 'animated'."], ["--motion-fast", "140 ms", "Hover states, focus rings, color transitions, tooltip appear. Default for any single-property tween."], ["--motion-base", "200 ms", "Component-level transitions: dropdown open, popover, expand/collapse, tab switch."], ["--motion-slow", "320 ms", "Layout transitions, page-level reveals, modal mount, sidebar collapse. The ceiling."]];
const EASING_TOKENS = [["--ease-out", "cubic-bezier(0.16, 1, 0.3, 1)", "Default for 'enters' and one-way transitions (open, reveal, slide-in). Decelerates fast then settles."], ["--ease-in-out", "cubic-bezier(0.4, 0, 0.2, 1)", "For reversible transitions where motion happens both directions (drawer open/close, tab pill)."], ["--ease-emphasis", "cubic-bezier(0.34, 1.2, 0.64, 1)", "Reserved for tab pill, segmented control selection, micro-bounce on confirm. Overshoots ~5% then settles."]];
const EasingCurve = ({
  name,
  cp,
  color = "var(--brand-600)"
}) => {
  // cp = "cubic-bezier(a, b, c, d)"
  const m = cp.match(/cubic-bezier\(([^)]+)\)/);
  const [a, b, c, d] = m ? m[1].split(",").map(s => parseFloat(s.trim())) : [0, 0, 1, 1];
  const W = 120,
    H = 80;
  // y is inverted in SVG. progress goes from (0,1) bottom-left to (1,0) top-right.
  const x1 = a * W,
    y1 = (1 - b) * H;
  const x2 = c * W,
    y2 = (1 - d) * H;
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    width: W,
    height: H,
    "aria-hidden": "true",
    style: {
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("rect", {
    width: W,
    height: H,
    fill: "var(--bg-canvas)",
    rx: "4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "0",
    y1: H,
    x2: W,
    y2: "0",
    stroke: "var(--border-default)",
    strokeDasharray: "2 3"
  }), /*#__PURE__*/React.createElement("path", {
    d: `M 0 ${H} C ${x1} ${y1}, ${x2} ${y2}, ${W} 0`,
    fill: "none",
    stroke: color,
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: x1,
    cy: y1,
    r: "2",
    fill: color,
    opacity: "0.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: x2,
    cy: y2,
    r: "2",
    fill: color,
    opacity: "0.5"
  }));
};
const MotionDurationDemo = () => {
  const [tick, setTick] = React.useState(0);
  return /*#__PURE__*/React.createElement("div", {
    className: "panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-head"
  }, /*#__PURE__*/React.createElement("h4", null, "Hover any token to feel its duration"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--ghost ds-btn--sm",
    onClick: () => setTick(t => t + 1)
  }, "Replay all")), /*#__PURE__*/React.createElement("div", {
    className: "panel-body",
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16
    }
  }, DURATION_TOKENS.map(([token, ms]) => {
    const dur = parseInt(ms, 10);
    return /*#__PURE__*/React.createElement("div", {
      key: token,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      key: tick,
      className: "motion-demo-card",
      style: {
        background: "var(--brand-050)",
        border: "1px solid var(--brand-100)",
        borderRadius: "var(--radius-md)",
        height: 64,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 4,
        background: "var(--brand-600)",
        borderRadius: "var(--radius-sm)",
        transform: "translateX(-100%)",
        animation: `motion-slide-${dur} ${dur}ms var(--ease-out) forwards`
      }
    }), /*#__PURE__*/React.createElement("style", null, `@keyframes motion-slide-${dur} { to { transform: translateX(0); } }`)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("code", {
      style: {
        fontSize: 11,
        color: "var(--brand-600)"
      }
    }, token), /*#__PURE__*/React.createElement("div", {
      className: "t-mono",
      style: {
        fontSize: 11,
        color: "var(--text-muted)"
      }
    }, ms)));
  })));
};
const SystemAnimations = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Animation"), /*#__PURE__*/React.createElement("th", null, "Where"), /*#__PURE__*/React.createElement("th", null, "Duration"), /*#__PURE__*/React.createElement("th", null, "Easing"), /*#__PURE__*/React.createElement("th", null, "Notes"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "pop")), /*#__PURE__*/React.createElement("td", null, "Dropdowns, popovers, menus on open"), /*#__PURE__*/React.createElement("td", null, "160 ms"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "cubic-bezier(.2,.8,.2,1)")), /*#__PURE__*/React.createElement("td", null, "Opacity 0\u21921 + translate-Y 4px + scale .98\u21921. ", /*#__PURE__*/React.createElement("code", null, "transform-origin: top right"), " for top-right anchored menus.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "pulse")), /*#__PURE__*/React.createElement("td", null, "Live alert dots (sanctioned, AIS silence)"), /*#__PURE__*/React.createElement("td", null, "1.8 s infinite"), /*#__PURE__*/React.createElement("td", null, "linear"), /*#__PURE__*/React.createElement("td", null, "Box-shadow ring fades from 50% opacity to 0. Pause via ", /*#__PURE__*/React.createElement("code", null, "prefers-reduced-motion"), ".")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "skel")), /*#__PURE__*/React.createElement("td", null, "Skeleton loaders"), /*#__PURE__*/React.createElement("td", null, "1.4 s linear infinite"), /*#__PURE__*/React.createElement("td", null, "linear"), /*#__PURE__*/React.createElement("td", null, "Background-position sweep across a 3-stop gradient. Stop on focus, on tab change.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "anchor-pulse")), /*#__PURE__*/React.createElement("td", null, "Section jump target (URL hash)"), /*#__PURE__*/React.createElement("td", null, "1.4 s once"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "var(--ease-out)")), /*#__PURE__*/React.createElement("td", null, "Background flashes ", /*#__PURE__*/React.createElement("code", null, "--brand-100"), " \u2192 transparent. Confirms \"I landed at the right place\"."))));
const MotionRules = () => /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Reduced motion")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("p", {
  style: {
    marginTop: 0
  }
}, "Every transition above ", /*#__PURE__*/React.createElement("code", null, "--motion-fast"), " respects the OS preference:"), /*#__PURE__*/React.createElement("pre", {
  className: "code",
  style: {
    marginTop: 8
  }
}, `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`), /*#__PURE__*/React.createElement("p", {
  style: {
    marginBottom: 0
  }
}, "Microinteractions at ", /*#__PURE__*/React.createElement("code", null, "--motion-instant"), " stay \u2014 they're the system's way of saying \"I heard you\"."))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "What never moves")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, "Data values. A KPI counter never animates from 0 to the real number."), /*#__PURE__*/React.createElement("li", null, "Map basemap. Tile fade is the library default; we don't add to it."), /*#__PURE__*/React.createElement("li", null, "Page-level layout (sidebar collapse is the only exception)."), /*#__PURE__*/React.createElement("li", null, "Alert glyphs. A live alert pulses; it doesn't slide into view."), /*#__PURE__*/React.createElement("li", null, "Anything during a print or PDF export.")))));
const MotionSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Why motion matters here"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Skytek is a monitoring product. Motion has one job: confirm that the system heard the operator, or signal that something on screen changed. Anything beyond that is decoration \u2014 and decoration costs reading time during an incident. The rules below are deliberately conservative.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Duration tokens"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Four durations. Pick from the list \u2014 no in-between values, no per-component overrides."), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, DURATION_TOKENS.map(([token, ms, where]) => /*#__PURE__*/React.createElement("div", {
  key: token,
  className: "token-row",
  style: {
    gridTemplateColumns: "180px 90px 1fr"
  }
}, /*#__PURE__*/React.createElement("code", null, token), /*#__PURE__*/React.createElement("span", {
  className: "t-mono",
  style: {
    color: "var(--brand-600)"
  }
}, ms), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, where)))), /*#__PURE__*/React.createElement(MotionDurationDemo, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Easing tokens"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Two everyday easings and one reserved easing for selection feedback. Linear is for repeating animations only (pulse, skeleton)."), /*#__PURE__*/React.createElement("div", {
  className: "grid-3"
}, EASING_TOKENS.map(([token, cp, where]) => /*#__PURE__*/React.createElement("div", {
  key: token,
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, /*#__PURE__*/React.createElement("code", {
  style: {
    color: "var(--brand-600)"
  }
}, token))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body"
}, /*#__PURE__*/React.createElement(EasingCurve, {
  name: token,
  cp: cp,
  color: token.includes("emphasis") ? "var(--chart-cat-2)" : "var(--brand-600)"
}), /*#__PURE__*/React.createElement("div", {
  className: "t-mono",
  style: {
    fontSize: 11,
    color: "var(--text-muted)",
    marginTop: 8
  }
}, cp), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 6,
    marginBottom: 0
  }
}, where)))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "System animations"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Named keyframes that ship with the system. Modules consume by class \u2014 never duplicate the keyframes locally."), /*#__PURE__*/React.createElement(SystemAnimations, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Reduced motion & restraint"), /*#__PURE__*/React.createElement(MotionRules, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Composing transitions"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `/* Default: single-property tween at fast duration */
.ds-btn { transition: background var(--motion-fast) var(--ease-out),
                      border-color var(--motion-fast) var(--ease-out),
                      box-shadow var(--motion-fast) var(--ease-out); }

/* Component-level: a popover */
.ds-popover { transition: opacity var(--motion-base) var(--ease-out),
                          transform var(--motion-base) var(--ease-out); }

/* Reversible: drawer */
.ds-drawer { transition: transform var(--motion-slow) var(--ease-in-out); }

/* Selection: tab pill — the only place ease-emphasis is allowed */
.ds-tab-pill { transition: transform var(--motion-slow) var(--ease-emphasis),
                           width     var(--motion-slow) var(--ease-emphasis); }`)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Scrollbars"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "One scrollbar treatment everywhere: a ", /*#__PURE__*/React.createElement("strong", null, "6\xA0px"), " thin bar with a brand-blue thumb on a light-grey track. It replaces the OS default so dense tables, map popovers and side panels read as part of the product rather than the operating system. The page root gets it automatically; for any inner scroll container, add the ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".ds-scroll"), " class (or ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "data-scroll"), " attribute)."), /*#__PURE__*/React.createElement("div", {
  className: "grid-2",
  style: {
    gap: 24,
    alignItems: "start"
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 8
  }
}, "Live \u2014 vertical ", /*#__PURE__*/React.createElement("code", {
  style: {
    fontSize: 11
  }
}, ".ds-scroll")), /*#__PURE__*/React.createElement("div", {
  className: "ds-scroll",
  style: {
    height: 200,
    overflowY: "auto",
    background: "var(--white)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-md)",
    padding: "8px 14px"
  }
}, Array.from({
  length: 24
}).map((_, i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    padding: "7px 0",
    borderBottom: i < 23 ? "1px solid var(--border-subtle)" : "none",
    fontSize: 13,
    color: "var(--text-secondary)",
    display: "flex",
    justifyContent: "space-between"
  }
}, /*#__PURE__*/React.createElement("span", null, "Vessel record ", String(i + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("span", {
  className: "t-mono",
  style: {
    color: "var(--text-muted)",
    fontSize: 11
  }
}, (12 + i * 0.3).toFixed(1), " kn")))), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 6
  }
}, "Scroll the panel \u2014 thumb is ", /*#__PURE__*/React.createElement("code", {
  style: {
    fontSize: 11
  }
}, "--brand-500"), ", track is ", /*#__PURE__*/React.createElement("code", {
  style: {
    fontSize: 11
  }
}, "--slate-100"), ".")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 8
  }
}, "Tokens"), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, [["--scrollbar-size", "6px", "Bar thickness (width & height)"], ["--scrollbar-track", "--slate-100", "Track — light grey"], ["--scrollbar-thumb", "--brand-500", "Thumb — theme color"], ["--scrollbar-thumb-hover", "--brand-600", "Thumb on hover"]].map(([token, val, where]) => /*#__PURE__*/React.createElement("div", {
  key: token,
  className: "token-row",
  style: {
    gridTemplateColumns: "200px 110px 1fr"
  }
}, /*#__PURE__*/React.createElement("code", null, token), /*#__PURE__*/React.createElement("span", {
  className: "t-mono",
  style: {
    color: "var(--brand-600)"
  }
}, val), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, where)))), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 12
  }
}, /*#__PURE__*/React.createElement("strong", null, "Firefox note:"), " ", /*#__PURE__*/React.createElement("code", null, "scrollbar-width"), " only supports ", /*#__PURE__*/React.createElement("code", null, "thin"), "/", /*#__PURE__*/React.createElement("code", null, "auto"), ", so Firefox renders a system-thin bar (\u2248 8\u201311 px) rather than an exact 6 px \u2014 but the brand thumb & grey track colors match. WebKit/Blink honour the precise 6 px."))), /*#__PURE__*/React.createElement("pre", {
  className: "code",
  style: {
    marginTop: 16
  }
}, `:root {
  --scrollbar-size:        6px;
  --scrollbar-track:       var(--slate-100);   /* light grey */
  --scrollbar-thumb:       var(--brand-500);   /* theme color */
  --scrollbar-thumb-hover: var(--brand-600);
}

/* Firefox */
html, .ds-scroll, [data-scroll] {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}

/* WebKit / Blink — Chrome, Safari, Edge, Opera */
.ds-scroll::-webkit-scrollbar       { width: var(--scrollbar-size); height: var(--scrollbar-size); }
.ds-scroll::-webkit-scrollbar-track { background: var(--scrollbar-track); border-radius: 9999px; }
.ds-scroll::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 9999px; }
.ds-scroll::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover); }`), /*#__PURE__*/React.createElement("div", {
  className: "callout warn",
  style: {
    marginTop: 12
  }
}, /*#__PURE__*/React.createElement("strong", null, "Don't hide scrollbars."), " Operators need to know how much more is below the fold during an incident. Style the bar \u2014 never set ", /*#__PURE__*/React.createElement("code", null, "scrollbar-width: none"), " or ", /*#__PURE__*/React.createElement("code", null, "::-webkit-scrollbar { display:none }"), " on data regions.")), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "The motion test:"), " if removing an animation makes the UI ", /*#__PURE__*/React.createElement("em", null, "worse"), ", keep it. If removing it makes the UI ", /*#__PURE__*/React.createElement("em", null, "faster"), ", it was decoration. Default to the second."));
window.IconographySection = IconographySection;
window.DensitySection = DensitySection;
window.MotionSection = MotionSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-foundations2.jsx", error: String((e && e.message) || e) }); }

// section-handoff.jsx
try { (() => {
/* Section 6 — Engineering Handoff */

const HandoffSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Developer copy utilities"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Every ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "<pre class=\"code\">"), " block and every token row in the docs is auto-decorated with a one-click copy action. The enhancement is non-invasive \u2014 no JSX changes required. A single ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "copy-utilities.js"), " module observes the DOM and attaches buttons."), /*#__PURE__*/React.createElement("div", {
  className: "grid-2",
  style: {
    marginBottom: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "What gets copy actions")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.65
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Code blocks"), " \u2014 top-right toolbar with language pill + Copy button, on every ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "pre.code")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Token rows"), " \u2014 hover-revealed chip beside every token name in foundations & handoff tables"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("strong", null, "Opt-in elements"), " \u2014 add ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "data-copy=\"value\""), " to any element (keyboard-activated)")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Behavior contract")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.65
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, "Preserves source whitespace & indentation (raw ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "textContent"), ")"), /*#__PURE__*/React.createElement("li", null, "\"Copied\" state for 1.8 s, then reverts"), /*#__PURE__*/React.createElement("li", null, "Fires polite ARIA-live announcement for screen readers"), /*#__PURE__*/React.createElement("li", null, "Keyboard: ", /*#__PURE__*/React.createElement("kbd", null, "Tab"), " focus + ", /*#__PURE__*/React.createElement("kbd", null, "Enter"), " / ", /*#__PURE__*/React.createElement("kbd", null, "Space"), " to copy"), /*#__PURE__*/React.createElement("li", null, "Falls back to ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "execCommand"), " in non-secure contexts"))))), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 16,
    marginBottom: 6
  }
}, "Try it \u2014 hover any token to see the chip:"), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "token-row",
  style: {
    gridTemplateColumns: "200px 100px 1fr"
  }
}, /*#__PURE__*/React.createElement("code", null, "--brand-600"), /*#__PURE__*/React.createElement("span", {
  className: "t-mono",
  style: {
    color: "var(--text-muted)"
  }
}, "#2d7ffb"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "Primary action / key headings")), /*#__PURE__*/React.createElement("div", {
  className: "token-row",
  style: {
    gridTemplateColumns: "200px 100px 1fr"
  }
}, /*#__PURE__*/React.createElement("code", null, "--spacing-md"), /*#__PURE__*/React.createElement("span", {
  className: "t-mono",
  style: {
    color: "var(--text-muted)"
  }
}, "16px"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "Default gap between siblings")), /*#__PURE__*/React.createElement("div", {
  className: "token-row",
  style: {
    gridTemplateColumns: "200px 100px 1fr"
  }
}, /*#__PURE__*/React.createElement("code", null, "--radius-lg"), /*#__PURE__*/React.createElement("span", {
  className: "t-mono",
  style: {
    color: "var(--text-muted)"
  }
}, "8px"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "Cards, panels, surfaces"))), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 16,
    marginBottom: 6
  }
}, "API \u2014 opt-in copy for arbitrary nodes:"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `<!-- Any element with data-copy becomes a focusable copy trigger -->
<span class="ds-badge ds-badge--info"
      data-copy="role=&quot;status&quot; aria-live=&quot;polite&quot;"
      data-copy-label="ARIA attributes">
  Copy ARIA
</span>

<!-- pre.code blocks are auto-decorated, no markup change needed -->
<pre class="code">npm install @skytek/design-system</pre>`), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 16,
    marginBottom: 6
  }
}, "Integration \u2014 single script, zero refactor:"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `<!-- In your shell HTML, after the docs render -->
<script src="copy-utilities.js" defer></script>

/* The module:
   1. Scans the DOM on load
   2. MutationObserver picks up async-rendered React content
   3. Wraps pre.code in .ds-code-wrap, injects .ds-code-toolbar
   4. Wraps the first <code> in each .token-row with a copy chip
   5. Adds click + Enter/Space handlers for [data-copy] nodes
*/`)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Token architecture"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Three layers. Primitive tokens hold raw values; semantic tokens give them roles; component tokens reference semantic tokens. Engineers consume only semantic and component tokens."), /*#__PURE__*/React.createElement("div", {
  className: "grid-3"
}, [["1 · Primitive", "Raw scales. Never used in components directly.", `--brand-600: #0F4C75
--slate-100: #F3F4F6
--space-5: 16px
--radius-md: 6px`], ["2 · Semantic", "Role-based aliases. The vocabulary engineers reach for.", `--bg-surface: var(--white)
--text-primary: var(--slate-900)
--border-default: var(--slate-200)
--shadow-md: …`], ["3 · Component", "Per-component knobs that wire semantic tokens.", `--btn-primary-bg: var(--brand-600)
--btn-primary-fg: var(--white)
--input-border: var(--border-default)`]].map(([t, d, c], i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, t)), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body"
}, /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 0
  }
}, d), /*#__PURE__*/React.createElement("pre", {
  className: "code",
  style: {
    marginTop: 8
  }
}, c)))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "CSS variable strategy"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Tokens are CSS custom properties on ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ":root"), ", lowercase kebab-case. They live in ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "src/app/styles/tokens.css"), " and are imported once at the app root."), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `/* src/app/styles/tokens.css */
:root {
  /* primitives */
  --brand-600: #0F4C75;
  --slate-200: #E5E7EB;
  --space-5: 16px;
  --radius-md: 6px;
  /* semantics */
  --bg-surface: #FFFFFF;
  --text-primary: var(--slate-900);
  --border-default: var(--slate-200);
}

/* future: dark mode swaps semantics only */
[data-theme="dark"] {
  --bg-surface: var(--slate-900);
  --text-primary: var(--slate-50);
  --border-default: var(--slate-700);
}`)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Tailwind mapping"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Replace ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "tailwind.config.js"), "'s ad-hoc ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "react-dark-blue"), " palette with semantic classes that resolve to tokens. Engineers use ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "bg-surface"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "text-primary"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "border-default"), " \u2014 never raw colors."), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        brand: { 50:'var(--brand-050)', 100:'var(--brand-100)', 300:'var(--brand-300)',
                 400:'var(--brand-400)', 500:'var(--brand-500)', 600:'var(--brand-600)' },
        surface: 'var(--bg-surface)',
        canvas:  'var(--bg-canvas)',
        sunken:  'var(--bg-sunken)',
        muted:   'var(--bg-muted)',
        // status
        success: { 100:'var(--success-100)', 500:'var(--success-500)', 700:'var(--success-700)' },
        warning: { 100:'var(--warning-100)', 500:'var(--warning-500)', 700:'var(--warning-700)' },
        danger:  { 100:'var(--danger-100)',  500:'var(--danger-500)',  700:'var(--danger-700)' },
        info:    { 100:'var(--info-100)',    500:'var(--info-500)',    700:'var(--info-700)' },
        // text
        ink: { primary:'var(--text-primary)', secondary:'var(--text-secondary)',
               muted:'var(--text-muted)', disabled:'var(--text-disabled)' },
        line: { subtle:'var(--border-subtle)', DEFAULT:'var(--border-default)', strong:'var(--border-strong)' },
      },
      spacing:    Object.fromEntries(Array.from({length:17},(_,i)=>[i,\`var(--space-\${i})\`])),
      borderRadius:{ xs:'var(--radius-xs)', sm:'var(--radius-sm)', md:'var(--radius-md)',
                     lg:'var(--radius-lg)', xl:'var(--radius-xl)', full:'9999px' },
      boxShadow:  { xs:'var(--shadow-xs)', sm:'var(--shadow-sm)', md:'var(--shadow-md)',
                    lg:'var(--shadow-lg)', xl:'var(--shadow-xl)' },
      fontFamily: { sans:['Inter','system-ui','sans-serif'], mono:['JetBrains Mono','ui-monospace'] },
    },
  },
};`)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Component naming conventions"), /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Concept"), /*#__PURE__*/React.createElement("th", null, "Convention"), /*#__PURE__*/React.createElement("th", null, "Example"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Component file"), /*#__PURE__*/React.createElement("td", null, "PascalCase folder + same-name component"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "app/ui/Button/Button.tsx"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Component variants"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "cva"), " with ", /*#__PURE__*/React.createElement("code", null, "variant"), ", ", /*#__PURE__*/React.createElement("code", null, "size"), ", ", /*#__PURE__*/React.createElement("code", null, "tone"), " props"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, `<Button variant="primary" size="md" />`))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Compound components"), /*#__PURE__*/React.createElement("td", null, "Dot-namespace"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "Card.Header"), ", ", /*#__PURE__*/React.createElement("code", null, "Form.Field"), ", ", /*#__PURE__*/React.createElement("code", null, "Table.Row"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Data attributes"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "data-slot"), " for shadcn-style internal slots"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "data-slot=\"card-title\""))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Hooks"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "use<Capability>")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "useFormField()"), ", ", /*#__PURE__*/React.createElement("code", null, "useToast()"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Storybook"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "Design System / <Component>")), /*#__PURE__*/React.createElement("td", null, "Already in place \u2014 keep."))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Migration plan"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Five-phase rollout. Each phase lands behind no flag \u2014 the system is additive. Old code keeps working until each module is touched."), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, [["Phase 1 · Tokens land", "Week 1", "Add tokens.css, update tailwind.config.js, ship a compat shim that maps react-dark-blue → --brand-600. Zero visual change.", "No regressions"], ["Phase 2 · Component standardization", "Weeks 2–3", "Lock app/ui as canonical. Mark common/components/* as deprecated. Build missing primitives (Toast, Dropdown, Skeleton).", "All new code uses app/ui"], ["Phase 3 · Surface migration", "Weeks 4–7", "Migrate the 4 representative surfaces (dashboard, vessels list, vessel detail, add-policy). Use as reference.", "Surfaces match the spec"], ["Phase 4 · Module sweep", "Weeks 8–12", "Module-by-module: portfolio, region, aviation, offshore, GSIN, reports. One PR per module. Codemod for raw hex → token.", "≤ 5 raw hex left in repo"], ["Phase 5 · Cleanup", "Week 13", "Delete common/components/*. Remove styled-components dependency. Snapshot Storybook for visual regression.", "Bundle size −18%"]].map(([t, w, b, o], i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  className: "token-row",
  style: {
    gridTemplateColumns: "200px 90px 1fr 220px"
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
  style: {
    fontSize: 13
  }
}, t)), /*#__PURE__*/React.createElement("div", {
  className: "t-caption"
}, w), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    color: "var(--text-secondary)"
  }
}, b), /*#__PURE__*/React.createElement("div", {
  className: "t-caption",
  style: {
    color: "var(--success-700)"
  }
}, "\u2713 ", o))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Standardize first / refactor later"), /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head",
  style: {
    background: "var(--success-050)"
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title",
  style: {
    color: "var(--success-700)"
  }
}, "First (high ROI, low risk)")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body"
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("li", null, "Color & spacing tokens \u2014 affect everything, zero behavior change."), /*#__PURE__*/React.createElement("li", null, "Button (consolidate ", /*#__PURE__*/React.createElement("code", null, "common/button"), " + ", /*#__PURE__*/React.createElement("code", null, "app/ui/Button"), ")."), /*#__PURE__*/React.createElement("li", null, "Input / Select / FormField \u2014 the cause of most inconsistency reports."), /*#__PURE__*/React.createElement("li", null, "Table \u2014 collapse 4 implementations to 1."), /*#__PURE__*/React.createElement("li", null, "Page header pattern \u2014 visible quick win on every page.")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head",
  style: {
    background: "var(--warning-050)"
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title",
  style: {
    color: "var(--warning-700)"
  }
}, "Later (slower, scoped)")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body"
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("li", null, "Highcharts theme \u2014 wrap charts to consume tokens."), /*#__PURE__*/React.createElement("li", null, "Leaflet map controls \u2014 match Button system."), /*#__PURE__*/React.createElement("li", null, "DataTable virtualization & column-resize ergonomics."), /*#__PURE__*/React.createElement("li", null, "Dark mode (semantic-only swap; the architecture supports it)."), /*#__PURE__*/React.createElement("li", null, "Removing styled-components entirely (after module sweep).")))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Linting & guardrails"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `// .eslintrc — forbid raw hex in JSX/CSS-in-JS
"no-restricted-syntax": ["error",
  { selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
    message: "Use a design token (var(--…)) instead of a raw hex color." }
]

// stylelint-no-restricted-values for CSS files
"declaration-property-value-disallowed-list": {
  "/.*/": ["/^#[0-9a-fA-F]+$/"]
}`), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "Run as warning for one sprint, then upgrade to error. Codemods take care of the long tail.")), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 32
  }
}, /*#__PURE__*/React.createElement("strong", null, "Single source of truth:"), " ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "src/app/styles/tokens.css"), " is the only place values live. Storybook reads from it. The product reads from it. This document is generated from it. If a value is not in tokens.css, it does not exist in the system."));
window.HandoffSection = HandoffSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-handoff.jsx", error: String((e && e.message) || e) }); }

// section-layout-interaction-a11y.jsx
try { (() => {
/* Section 4 — Layout, Interaction, Accessibility */

const LayoutSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "App shell"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "A persistent left rail (220px), a top utility bar (48px), and a content region. The shell never scrolls; only the content region scrolls."), /*#__PURE__*/React.createElement("div", {
  className: "surface",
  style: {
    padding: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "surface-toolbar"
}, /*#__PURE__*/React.createElement("span", {
  className: "dot r"
}), /*#__PURE__*/React.createElement("span", {
  className: "dot y"
}), /*#__PURE__*/React.createElement("span", {
  className: "dot g"
}), /*#__PURE__*/React.createElement("span", {
  style: {
    marginLeft: 8
  }
}, "app shell \xB7 1280px")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    height: 420,
    background: "var(--bg-app)"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-sidebar",
  style: {
    width: "100%",
    padding: "12px 0"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "0 16px 16px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderBottom: "1px solid var(--border-subtle)"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "app-nav-brand-mark",
  style: {
    width: 22,
    height: 22,
    fontSize: 11
  }
}, "S"), /*#__PURE__*/React.createElement("span", {
  style: {
    fontWeight: 600,
    fontSize: 13
  }
}, "Skytek")), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "12px 0 4px 20px",
    fontSize: 10,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.06em"
  }
}, "Monitor"), /*#__PURE__*/React.createElement("a", {
  className: "ds-sidebar-item is-active"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.bars
}), " Dashboard"), /*#__PURE__*/React.createElement("a", {
  className: "ds-sidebar-item"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.ship
}), " Vessels"), /*#__PURE__*/React.createElement("a", {
  className: "ds-sidebar-item"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.plane
}), " Aircraft"), /*#__PURE__*/React.createElement("a", {
  className: "ds-sidebar-item"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.globe
}), " Regions"), /*#__PURE__*/React.createElement("a", {
  className: "ds-sidebar-item"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.folder
}), " Portfolios"), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "12px 0 4px 20px",
    fontSize: 10,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.06em"
  }
}, "Account"), /*#__PURE__*/React.createElement("a", {
  className: "ds-sidebar-item"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.settings
}), " Settings")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateRows: "48px 1fr",
    minWidth: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 16px",
    background: "white",
    borderBottom: "1px solid var(--border-default)"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    position: "relative",
    flex: 1,
    maxWidth: 320
  }
}, /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  placeholder: "Search vessels, regions\u2026",
  style: {
    paddingLeft: 28
  }
}), /*#__PURE__*/React.createElement("span", {
  style: {
    position: "absolute",
    left: 8,
    top: 9,
    color: "var(--text-muted)"
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.search,
  size: 14
}))), /*#__PURE__*/React.createElement("div", {
  className: "spacer-grow"
}), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--ghost ds-btn--icon ds-btn--sm"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.bell
})), /*#__PURE__*/React.createElement("span", {
  className: "ds-avatar"
}, "JL")), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 24,
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("h2", {
  className: "t-h1"
}, "Dashboard"), /*#__PURE__*/React.createElement("p", {
  className: "t-caption"
}, "Page content scrolls inside this region only."), /*#__PURE__*/React.createElement("div", {
  className: "grid-3",
  style: {
    marginTop: 16
  }
}, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
  key: i,
  className: "ds-card",
  style: {
    height: 100
  }
})))))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Page header pattern"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Every detail and list page follows the same shape: breadcrumbs \u2192 title row \u2192 tabs (optional) \u2192 content. Action buttons live on the right of the title row."), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "var(--text-muted)"
  }
}, /*#__PURE__*/React.createElement("span", null, "Portfolios"), /*#__PURE__*/React.createElement(Icon, {
  d: I.chevronRight,
  size: 12
}), /*#__PURE__*/React.createElement("span", null, "Atlantic Hull 2026")), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: "0 20px 16px",
    display: "flex",
    alignItems: "flex-end",
    gap: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1
  }
}, /*#__PURE__*/React.createElement("h2", {
  className: "t-h1",
  style: {
    margin: 0
  }
}, "Atlantic Hull 2026"), /*#__PURE__*/React.createElement("div", {
  className: "row",
  style: {
    marginTop: 6
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--success ds-badge--dot"
}, "Active"), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "142 vessels \xB7 12 policies \xB7 last updated 4m ago"))), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.download
}), " Export"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary"
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.plus
}), " Add policy")))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Content widths & breakpoints"), /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Surface"), /*#__PURE__*/React.createElement("th", null, "Max width"), /*#__PURE__*/React.createElement("th", null, "Padding (desktop / mobile)"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Detail pages (forms, profiles)"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "880px")), /*#__PURE__*/React.createElement("td", null, "32px / 16px")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "List & table pages"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "1280px")), /*#__PURE__*/React.createElement("td", null, "24px / 12px")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Dashboards (incl. map)"), /*#__PURE__*/React.createElement("td", null, "fluid (no max)"), /*#__PURE__*/React.createElement("td", null, "24px / 12px")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Modals"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "480 / 640 / 800px")), /*#__PURE__*/React.createElement("td", null, "20px / 16px")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Drawers"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "400 / 560 / 720px")), /*#__PURE__*/React.createElement("td", null, "20px")))), /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    marginTop: 16
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Breakpoint"), /*#__PURE__*/React.createElement("th", null, "min-width"), /*#__PURE__*/React.createElement("th", null, "Behavior"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "sm")), /*#__PURE__*/React.createElement("td", null, "640px"), /*#__PURE__*/React.createElement("td", null, "Two-column forms collapse to single column below this.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "md")), /*#__PURE__*/React.createElement("td", null, "768px"), /*#__PURE__*/React.createElement("td", null, "Sidebar collapses to icon rail.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "lg")), /*#__PURE__*/React.createElement("td", null, "960px"), /*#__PURE__*/React.createElement("td", null, "Tables become horizontally scrollable below this.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "xl")), /*#__PURE__*/React.createElement("td", null, "1280px"), /*#__PURE__*/React.createElement("td", null, "Default desktop layout.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "2xl")), /*#__PURE__*/React.createElement("td", null, "1920px"), /*#__PURE__*/React.createElement("td", null, "Dashboards expand to 4-up card grids."))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Form layouts"), /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Single-column (default)")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    display: "grid",
    gap: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Portfolio name"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "Atlantic Hull 2026"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Underwriter"), /*#__PURE__*/React.createElement("select", {
  className: "ds-input ds-select"
}, /*#__PURE__*/React.createElement("option", null, "JL Marine Re"))), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Effective date"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "2026-01-01"
}))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-foot"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary"
}, "Cancel"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary"
}, "Save"))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Two-column (long forms)")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "1fr 1fr"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "IMO"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "9472183"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "MMSI"), /*#__PURE__*/React.createElement("input", {
  className: "ds-input",
  defaultValue: "248901000"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Flag"), /*#__PURE__*/React.createElement("select", {
  className: "ds-input ds-select"
}, /*#__PURE__*/React.createElement("option", null, "Malta"))), /*#__PURE__*/React.createElement("div", {
  className: "ds-field"
}, /*#__PURE__*/React.createElement("label", {
  className: "ds-field-label"
}, "Type"), /*#__PURE__*/React.createElement("select", {
  className: "ds-input ds-select"
}, /*#__PURE__*/React.createElement("option", null, "Bulk carrier")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-foot"
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary"
}, "Cancel"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary"
}, "Save")))), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 12,
    fontSize: 12
  }
}, /*#__PURE__*/React.createElement("strong", null, "Rule:"), " Labels above fields. Two-column only when fields are short and naturally paired (codes, dates, currencies). Long fields (descriptions, notes) span full width.")));
const InteractionSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "State"), /*#__PURE__*/React.createElement("th", null, "Visual change"), /*#__PURE__*/React.createElement("th", null, "Token"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Hover")), /*#__PURE__*/React.createElement("td", null, "Background steps one shade up. No size or border-width change."), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "--motion-fast (140ms)"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Active / Pressed")), /*#__PURE__*/React.createElement("td", null, "Background steps one shade darker. Visual stays inside element bounds."), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "--motion-instant (80ms)"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Focus-visible")), /*#__PURE__*/React.createElement("td", null, "3px ring at ", /*#__PURE__*/React.createElement("code", null, "rgba(46,134,192,0.32)"), ". Always visible on keyboard navigation."), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "--shadow-focus"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Disabled")), /*#__PURE__*/React.createElement("td", null, "Background ", /*#__PURE__*/React.createElement("code", null, "--slate-50"), ", text ", /*#__PURE__*/React.createElement("code", null, "--text-disabled"), ", no hover. Cursor not-allowed."), /*#__PURE__*/React.createElement("td", null, "\u2014")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Loading")), /*#__PURE__*/React.createElement("td", null, "Inline spinner inside button; outer chrome unchanged. For pages: skeleton frames (no spinner)."), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "--motion-base"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Error")), /*#__PURE__*/React.createElement("td", null, "Border ", /*#__PURE__*/React.createElement("code", null, "--danger-500"), ", message below field. No shake."), /*#__PURE__*/React.createElement("td", null, "\u2014")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Success (transient)")), /*#__PURE__*/React.createElement("td", null, "Toast top-center, 4s. Inline rows tint ", /*#__PURE__*/React.createElement("code", null, "--success-050"), " for 1.5s."), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "--motion-slow"))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Motion budget"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Motion supports comprehension; it never delays it. All transitions complete in \u2264 320ms. Respect ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "prefers-reduced-motion"), "."), /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Token"), /*#__PURE__*/React.createElement("th", null, "Duration"), /*#__PURE__*/React.createElement("th", null, "Use"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "--motion-instant")), /*#__PURE__*/React.createElement("td", null, "80ms"), /*#__PURE__*/React.createElement("td", null, "Pressed states, checkbox toggles")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "--motion-fast")), /*#__PURE__*/React.createElement("td", null, "140ms"), /*#__PURE__*/React.createElement("td", null, "Hover, focus, button color change")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "--motion-base")), /*#__PURE__*/React.createElement("td", null, "200ms"), /*#__PURE__*/React.createElement("td", null, "Tooltips, popovers, expand/collapse")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "--motion-slow")), /*#__PURE__*/React.createElement("td", null, "320ms"), /*#__PURE__*/React.createElement("td", null, "Drawer / modal enter & exit"))))));
const A11ySection = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Rule"), /*#__PURE__*/React.createElement("th", null, "Standard"), /*#__PURE__*/React.createElement("th", null, "How to verify"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Body text contrast \u2265 4.5:1; large text \u2265 3:1."), /*#__PURE__*/React.createElement("td", null, "WCAG 2.2 AA (1.4.3)"), /*#__PURE__*/React.createElement("td", null, "Token contrast verified \u2014 see Engineering Handoff > tokens.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "UI control contrast \u2265 3:1 against adjacent surface."), /*#__PURE__*/React.createElement("td", null, "WCAG 2.2 AA (1.4.11)"), /*#__PURE__*/React.createElement("td", null, "All ", /*#__PURE__*/React.createElement("code", null, "ds-btn--secondary"), " and ", /*#__PURE__*/React.createElement("code", null, "ds-input"), " borders verified \u2265 3:1.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Visible focus on every interactive element."), /*#__PURE__*/React.createElement("td", null, "WCAG 2.2 AA (2.4.7)"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, ":focus-visible"), " applies ", /*#__PURE__*/React.createElement("code", null, "--shadow-focus"), "; never override with ", /*#__PURE__*/React.createElement("code", null, "outline:none"), ".")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Touch targets \u2265 44 \xD7 44px on mobile."), /*#__PURE__*/React.createElement("td", null, "WCAG 2.2 AA (2.5.5)"), /*#__PURE__*/React.createElement("td", null, "Use ", /*#__PURE__*/React.createElement("code", null, "ds-btn--lg"), " on mobile breakpoints; row hit areas span the full row.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Inputs always labeled (visible label or ", /*#__PURE__*/React.createElement("code", null, "aria-label"), ")."), /*#__PURE__*/React.createElement("td", null, "WCAG 2.2 A (1.3.1)"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "FormItem"), " generates ", /*#__PURE__*/React.createElement("code", null, "htmlFor"), "+", /*#__PURE__*/React.createElement("code", null, "id"), " automatically.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Errors announced via ", /*#__PURE__*/React.createElement("code", null, "aria-invalid"), " + ", /*#__PURE__*/React.createElement("code", null, "aria-describedby"), "."), /*#__PURE__*/React.createElement("td", null, "WCAG 2.2 A (3.3.1)"), /*#__PURE__*/React.createElement("td", null, "Inherited from React Hook Form Form primitive.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Tables use proper ", /*#__PURE__*/React.createElement("code", null, "<th scope>"), "; not for layout."), /*#__PURE__*/React.createElement("td", null, "WCAG 2.2 A (1.3.1)"), /*#__PURE__*/React.createElement("td", null, "Replace legacy ", /*#__PURE__*/React.createElement("code", null, "common/components/table"), " with ", /*#__PURE__*/React.createElement("code", null, "app/ui/Table"), ".")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Modals trap focus; ", /*#__PURE__*/React.createElement("code", null, "Esc"), " closes."), /*#__PURE__*/React.createElement("td", null, "WCAG 2.2 AA (2.1.2)"), /*#__PURE__*/React.createElement("td", null, "Inherited from Radix Dialog.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Status colors are paired with text or icon \u2014 never alone."), /*#__PURE__*/React.createElement("td", null, "WCAG 2.2 A (1.4.1)"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, "ds-badge--dot"), " + label; ", /*#__PURE__*/React.createElement("code", null, "ds-rating"), " always shows letter.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Respect ", /*#__PURE__*/React.createElement("code", null, "prefers-reduced-motion"), "."), /*#__PURE__*/React.createElement("td", null, "WCAG 2.2 AAA (2.3.3)"), /*#__PURE__*/React.createElement("td", null, "Global CSS rule disables non-essential transitions."))));
window.LayoutSection = LayoutSection;
window.InteractionSection = InteractionSection;
window.A11ySection = A11ySection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-layout-interaction-a11y.jsx", error: String((e && e.message) || e) }); }

// section-modal.jsx
try { (() => {
/* Modal — full specification section for the Skytek Design System spec page.
   Renders the live, standardized RWModal component (components/rw-modal.*).
   Demo triggers call window.ModalDemos / window.RWModal (loaded as plain JS). */

const MD = (fn, ...args) => () => {
  if (window.ModalDemos) window.ModalDemos[fn](...args);
};
const ModalSpec = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Live behavior"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Every dialog below is the production component. Open one and press ", /*#__PURE__*/React.createElement("kbd", {
  className: "ms-kbd"
}, "Tab"), " to feel the focus trap, ", /*#__PURE__*/React.createElement("kbd", {
  className: "ms-kbd"
}, "Esc"), " to dismiss, or click the dimmed backdrop where enabled. Focus returns to the trigger on close."), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    padding: 20
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ms-demo-row"
}, /*#__PURE__*/React.createElement("div", {
  className: "ms-demo-grp"
}, /*#__PURE__*/React.createElement("span", {
  className: "t-overline"
}, "Size variants"), /*#__PURE__*/React.createElement("div", {
  className: "row",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm",
  onClick: MD("openSize", "sm")
}, "SM"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm",
  onClick: MD("openSize", "md")
}, "MD"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm",
  onClick: MD("openSize", "lg")
}, "LG"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm",
  onClick: MD("openSize", "xl")
}, "XL"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm",
  onClick: MD("openSize", "full")
}, "Full"))), /*#__PURE__*/React.createElement("div", {
  className: "ms-demo-grp"
}, /*#__PURE__*/React.createElement("span", {
  className: "t-overline"
}, "Behaviors"), /*#__PURE__*/React.createElement("div", {
  className: "row",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm",
  onClick: MD("openScrollable")
}, "Scrollable body"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm",
  onClick: MD("openOverlay", true)
}, "Dismissible"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm",
  onClick: MD("openOverlay", false)
}, "Locked"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--secondary ds-btn--sm",
  onClick: MD("openComposed")
}, "Composed"))), /*#__PURE__*/React.createElement("div", {
  className: "ms-demo-grp"
}, /*#__PURE__*/React.createElement("span", {
  className: "t-overline"
}, "In context"), /*#__PURE__*/React.createElement("div", {
  className: "row",
  style: {
    gap: 8
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--danger ds-btn--sm",
  onClick: MD("openConfirm")
}, "Delete portfolio\u2026"), /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--primary ds-btn--sm",
  onClick: MD("openAddPort")
}, "Add a new Port"))))), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 16
  }
}, /*#__PURE__*/React.createElement("strong", null, "Refactored from ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "AddPortModal"), "."), " The \"Add a new Port\" demo is the original modal rebuilt on this shell \u2014 same form, standardized overlay/header/body/footer and accessibility.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Anatomy \u2014 five slots"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "The component decomposes into five independently styleable regions. ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "RWModal.open()"), " assembles them; ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "RWModal.parts.*"), " exposes each as a builder."), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
  style: {
    width: 28
  }
}, "#"), /*#__PURE__*/React.createElement("th", null, "Slot"), /*#__PURE__*/React.createElement("th", null, "Class"), /*#__PURE__*/React.createElement("th", null, "Responsibility"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "1"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Overlay / Backdrop")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".rw-modal-overlay")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Fixed full-bleed scrim (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "rgba(15,23,42,.45)"), " + 2px blur). Centers the container; owns dismiss-on-backdrop.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "2"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Container")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".rw-modal")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Surface: 12px radius, layered elevation, size-bounded width, viewport-capped flex column.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "3"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Header")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".rw-modal-header")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Title (+ optional subtitle) and the standardized circular close button. Pinned.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "4"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Body")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".rw-modal-body")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "The only scroll region. Consistent 20/24px inner padding; ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "overscroll-behavior: contain"), ".")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "5"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Footer")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".rw-modal-footer")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Right-aligned actions, token-driven gap. Primary / secondary / ghost / danger button variants.")))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Size variants"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Set with the ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "size"), " prop. Each maps to one max-width token \u2014 widths are the only thing that changes."), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Variant"), /*#__PURE__*/React.createElement("th", null, "Prop"), /*#__PURE__*/React.createElement("th", null, "Token"), /*#__PURE__*/React.createElement("th", null, "Max-width"), /*#__PURE__*/React.createElement("th", null, "Use for"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Small")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "size=\"sm\"")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-w-sm")), /*#__PURE__*/React.createElement("td", null, "420px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Confirmations, single-field prompts")), /*#__PURE__*/React.createElement("tr", {
  style: {
    background: "var(--brand-050)"
  }
}, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Medium"), " ", /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, "(default)")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "size=\"md\"")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-w-md")), /*#__PURE__*/React.createElement("td", null, "620px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Standard forms, settings")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Large")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "size=\"lg\"")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-w-lg")), /*#__PURE__*/React.createElement("td", null, "820px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Multi-section forms")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Extra-large")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "size=\"xl\"")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-w-xl")), /*#__PURE__*/React.createElement("td", null, "1100px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Form + map / preview (Add Port)")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Full-bleed")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "size=\"full\"")), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", null, "viewport \u2212 48px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Immersive editors, data tables")))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Props"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "RWModal.open(config)"), " returns an instance with ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".close()"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".query()"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".el"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ".modal"), "."), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Prop"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Default"), /*#__PURE__*/React.createElement("th", null, "Description"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "size")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "'sm'|'md'|'lg'|'xl'|'full'"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "'md'")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Container width variant.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "title")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "string"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Header title; wires ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-labelledby"), ".")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "subtitle")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "string"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Secondary line under the title.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "body")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "string | Node | fn"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Content slot. A function receives the body element.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "footer")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Button[] | Node | false"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Button configs, custom node, or false to omit.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "closeButton")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "boolean"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "true")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Show the \xD7 in the header.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "closeOnOverlayClick")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "boolean"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "true")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Dismiss on backdrop click.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "closeOnEsc")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "boolean"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "true")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Dismiss on Escape.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "align")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "'center'|'top'"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "'center'")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Vertical placement.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "initialFocus")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "selector | Node"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "first field"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Element focused on open.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "onOpen / onClose")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "fn"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Lifecycle hooks.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "ariaLabel")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "string"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Accessible name when titleless."))))), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "24px 0 8px"
  }
}, "Footer button config"), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Key"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Description"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "label")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "string"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Button text.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "variant")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "'primary'|'secondary'|'ghost'|'danger'"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Visual weight / intent.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "onClick")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "(instance) => void|false"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Handler. Return ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "false"), " to keep the dialog open (failed validation).")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "closeOnClick")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "boolean"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Force close after the handler.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "disabled / autoFocus")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "boolean"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Render disabled / receive initial focus.")))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Design tokens"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Every visual property reads from a ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-*"), " variable. Override on ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ":root"), " (or any ancestor) to re-theme without touching markup."), /*#__PURE__*/React.createElement("div", {
  className: "panel",
  style: {
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("table", {
  className: "spec-table",
  style: {
    border: 0
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Token"), /*#__PURE__*/React.createElement("th", null, "Default"), /*#__PURE__*/React.createElement("th", null, "Controls"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-scrim")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "rgba(15,23,42,.45)"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Backdrop color / opacity")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-scrim-blur")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "2px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Backdrop blur radius")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-radius")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "12px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Container roundness")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-shadow")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "layered"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Container elevation")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-pad-x / -pad-y")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "24px / 20px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Body inner padding")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-action-gap")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "10px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Footer button spacing")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-w-{sm\u2026xl}")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "420\u20131100px"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Size-variant widths")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-primary")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "brand-600"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Primary button fill")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-danger")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "#dc2626"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Destructive button fill")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-focus-ring")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "3px brand ring"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Keyboard focus indicator")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "--rw-modal-motion")), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "140ms"), /*#__PURE__*/React.createElement("td", {
  className: "t-caption"
}, "Open / close duration")))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Built-in accessibility"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "WCAG-aligned behavior ships with the component so consumers never re-implement it per modal."), /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "Roles & naming."), " Overlay carries ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "role=\"dialog\""), " + ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-modal=\"true\""), ", with ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-labelledby"), " bound to the title (or ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "aria-label"), ")."), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "Focus trap."), " ", /*#__PURE__*/React.createElement("kbd", {
  className: "ms-kbd"
}, "Tab"), " / ", /*#__PURE__*/React.createElement("kbd", {
  className: "ms-kbd"
}, "Shift+Tab"), " cycle within the dialog; a ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "focusin"), " guard recovers escaped focus."), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "Return focus."), " The trigger element is refocused on close \u2014 keyboard users never lose their place."), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "Dismissal & lock."), " ", /*#__PURE__*/React.createElement("kbd", {
  className: "ms-kbd"
}, "Esc"), " closes; background scroll is locked and nested modals are reference-counted."), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "Visible focus."), " All controls expose a ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, ":focus-visible"), " ring \u2014 never ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "outline:none"), " without a replacement."), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "Reduced motion."), " Rise / fade animations collapse under ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "prefers-reduced-motion"), "."))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Usage"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Link the two files, then call the high-level API or compose the slots by hand."), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "8px 0 8px"
  }
}, "Install"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `<link rel="stylesheet" href="components/rw-modal.css">
<script src="components/rw-modal.js"></script>`), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "24px 0 8px"
  }
}, "High-level \u2014 open() with slots"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `const modal = RWModal.open({
  size: 'md',
  title: 'Add a new Port',
  closeOnOverlayClick: false,          // form has unsaved input
  initialFocus: '#field-name',
  body: (el) => { el.appendChild(buildPortForm()); },
  footer: [
    { label: 'Cancel', variant: 'secondary', closeOnClick: true },
    { label: 'Save', variant: 'primary', onClick: (m) => {
        if (!m.query('#field-name').value) return false;  // keep open
        save(); m.close();
    }},
  ],
});`), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "24px 0 8px"
  }
}, "Low-level \u2014 compose the sub-components"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `const P = RWModal.parts;
const overlay   = P.Overlay({ labelledby: 'm-title' });
const container = P.Container({ size: 'lg' });
container.appendChild(P.Header({ title: 'Settings', titleId: 'm-title' }));
container.appendChild(P.Body(myContentNode));
container.appendChild(P.Footer([{ label: 'Done', variant: 'primary', onClick: (m) => m.close() }]));
overlay.appendChild(container);
RWModal.mount(overlay, { closeOnOverlayClick: true, closeOnEsc: true });`), /*#__PURE__*/React.createElement("h4", {
  className: "t-h4",
  style: {
    margin: "24px 0 8px"
  }
}, "Promise-based confirm + re-theme"), /*#__PURE__*/React.createElement("pre", {
  className: "code"
}, `const ok = await RWModal.confirm({ title: 'Delete?', message: 'Cannot be undone.', danger: true });

:root { --rw-modal-radius: 8px; --rw-modal-primary: #0f766e; --rw-modal-w-md: 560px; }`)), /*#__PURE__*/React.createElement("style", null, `
      .ms-kbd { font-family: var(--font-mono); font-size: 11px; line-height: 1; padding: 2px 5px; border-radius: 4px;
        background: var(--slate-100); border: 1px solid var(--border-default); border-bottom-width: 2px; color: var(--text-secondary); }
      .ms-demo-row { display: flex; flex-wrap: wrap; gap: 28px; }
      .ms-demo-grp { display: flex; flex-direction: column; gap: 8px; }
    `));
Object.assign(window, {
  ModalSpec
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-modal.jsx", error: String((e && e.message) || e) }); }

// section-states.jsx
try { (() => {
/* Section — Empty, error & loading states gallery */

const StateCard = ({
  icon,
  iconTone = "default",
  title,
  body,
  actions
}) => /*#__PURE__*/React.createElement("div", {
  className: "ds-state-card"
}, /*#__PURE__*/React.createElement("span", {
  className: `ds-state-icon ds-state-icon--${iconTone}`
}, icon), /*#__PURE__*/React.createElement("div", {
  className: "ds-state-title"
}, title), /*#__PURE__*/React.createElement("div", {
  className: "ds-state-body"
}, body), actions && /*#__PURE__*/React.createElement("div", {
  className: "ds-state-actions"
}, actions));
const EmptyStatesGallery = () => /*#__PURE__*/React.createElement("div", {
  className: "ds-state-gallery"
}, /*#__PURE__*/React.createElement(StateCard, {
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.folder,
    size: 20,
    stroke: "currentColor"
  }),
  title: "No vessels yet",
  body: "This portfolio doesn't have any vessels. Add one to start monitoring.",
  actions: /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--primary ds-btn--sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.plus,
    size: 12,
    stroke: "currentColor"
  }), " Add vessel")
}), /*#__PURE__*/React.createElement(StateCard, {
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.search,
    size: 20,
    stroke: "currentColor"
  }),
  title: "No matches",
  body: "No vessels match these filters. Try widening the date range or removing the flag filter.",
  actions: /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm"
  }, "Reset filters")
}), /*#__PURE__*/React.createElement(StateCard, {
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.flag || I.alert,
    size: 20,
    stroke: "currentColor"
  }),
  iconTone: "info",
  title: "Watchlist is empty",
  body: "Star a vessel from any list, or import a list of IMOs to follow.",
  actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--ghost ds-btn--sm"
  }, "Import IMOs"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm"
  }, "Browse vessels"))
}));
const ErrorStatesGallery = () => /*#__PURE__*/React.createElement("div", {
  className: "ds-state-gallery"
}, /*#__PURE__*/React.createElement(StateCard, {
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.alert,
    size: 20,
    stroke: "currentColor"
  }),
  iconTone: "danger",
  title: "Couldn't load vessels",
  body: "The AIS feed timed out after 30 s. Retry, or check the status page.",
  actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--primary ds-btn--sm"
  }, "Retry"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--link",
    style: {
      fontSize: 12
    }
  }, "Status page \u2192"))
}), /*#__PURE__*/React.createElement(StateCard, {
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.eye,
    size: 20,
    stroke: "currentColor"
  }),
  iconTone: "warn",
  title: "You don't have access",
  body: "Black Sea portfolio is restricted to its members. Ask Maeve Daly for access or pick a different portfolio.",
  actions: /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm"
  }, "Request access")
}), /*#__PURE__*/React.createElement(StateCard, {
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.x,
    size: 20,
    stroke: "currentColor"
  }),
  iconTone: "danger",
  title: "Not found",
  body: "Vessel IMO 0000001 doesn't exist in the registry. Check the number, or search by name.",
  actions: /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm"
  }, "Back to search")
}), /*#__PURE__*/React.createElement(StateCard, {
  icon: /*#__PURE__*/React.createElement(Icon, {
    d: I.globe,
    size: 20,
    stroke: "currentColor"
  }),
  iconTone: "warn",
  title: "You're offline",
  body: "No connection to the Skytek backend. Showing the last cached snapshot \u2014 last updated 8 min ago.",
  actions: /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--ghost ds-btn--sm"
  }, "Try again")
}));
const PartialFailureDemo = () => /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-head"
}, /*#__PURE__*/React.createElement("h4", null, "Partial failure"), /*#__PURE__*/React.createElement("span", {
  className: "meta"
}, "Some rows OK, some failed")), /*#__PURE__*/React.createElement("div", {
  className: "panel-body"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-alert ds-alert--warning",
  style: {
    marginBottom: 16
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.alert,
  size: 20,
  className: "ds-alert-icon"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-body"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-title"
}, "Loaded 12 of 15 vessels"), "3 vessels couldn't be loaded \u2014 AIS feed gap for IMO 9234567, 9234568, 9234570.", /*#__PURE__*/React.createElement("span", {
  style: {
    marginLeft: 8
  }
}, /*#__PURE__*/React.createElement("button", {
  className: "ds-btn ds-btn--link",
  style: {
    fontSize: 12
  }
}, "Retry failed \u2192")))), /*#__PURE__*/React.createElement("table", {
  className: "ds-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Vessel"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", {
  className: "num"
}, "Speed"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "MV ATLANTIC PEARL")), /*#__PURE__*/React.createElement("td", null, "Container"), /*#__PURE__*/React.createElement("td", {
  className: "num"
}, "14.2 kn"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--success ds-badge--dot"
}, "Live"))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "MV NORDIC STAR")), /*#__PURE__*/React.createElement("td", null, "LNG"), /*#__PURE__*/React.createElement("td", {
  className: "num"
}, "11.8 kn"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--success ds-badge--dot"
}, "Live"))), /*#__PURE__*/React.createElement("tr", {
  style: {
    opacity: 0.6
  }
}, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--text-muted)"
  }
}, "IMO 9234567")), /*#__PURE__*/React.createElement("td", {
  colSpan: 3,
  style: {
    color: "var(--danger-700)",
    fontSize: 12
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.alert,
  size: 12,
  stroke: "currentColor",
  className: "ico-12"
}), " AIS feed gap \u2014 couldn't load")), /*#__PURE__*/React.createElement("tr", {
  style: {
    opacity: 0.6
  }
}, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--text-muted)"
  }
}, "IMO 9234568")), /*#__PURE__*/React.createElement("td", {
  colSpan: 3,
  style: {
    color: "var(--danger-700)",
    fontSize: 12
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.alert,
  size: 12,
  stroke: "currentColor",
  className: "ico-12"
}), " AIS feed gap \u2014 couldn't load")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "MV MIRAMAR")), /*#__PURE__*/React.createElement("td", null, "Tanker"), /*#__PURE__*/React.createElement("td", {
  className: "num"
}, "13.4 kn"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
  className: "ds-badge ds-badge--success ds-badge--dot"
}, "Live")))))));
const LoadingStatesDemo = () => /*#__PURE__*/React.createElement("div", {
  className: "grid-3"
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 8
  }
}, "Skeleton \u2014 list row"), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  }
}, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    display: "flex",
    alignItems: "center",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-skel-block",
  style: {
    width: 32,
    height: 32,
    borderRadius: "50%"
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 6
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-skel-block",
  style: {
    height: 11,
    width: "70%"
  }
}), /*#__PURE__*/React.createElement("span", {
  className: "ds-skel-block",
  style: {
    height: 9,
    width: "50%"
  }
})), /*#__PURE__*/React.createElement("span", {
  className: "ds-skel-block",
  style: {
    width: 60,
    height: 11
  }
})))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 8
  }
}, "Skeleton \u2014 card"), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-skel-block",
  style: {
    height: 13,
    width: "60%"
  }
}), /*#__PURE__*/React.createElement("span", {
  className: "ds-skel-block",
  style: {
    height: 28,
    width: "40%"
  }
}), /*#__PURE__*/React.createElement("span", {
  className: "ds-skel-block",
  style: {
    height: 8,
    width: "100%"
  }
}), /*#__PURE__*/React.createElement("span", {
  className: "ds-skel-block",
  style: {
    height: 8,
    width: "80%"
  }
})))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 8
  }
}, "Inline \u2014 loading more"), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, /*#__PURE__*/React.createElement("div", {
  className: "panel-body",
  style: {
    textAlign: "center",
    padding: "20px 12px"
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-spinner",
  style: {
    verticalAlign: "middle"
  }
}), /*#__PURE__*/React.createElement("span", {
  style: {
    marginLeft: 10,
    fontSize: 13,
    color: "var(--text-secondary)"
  }
}, "Loading next 50 vessels\u2026")))));
const StateRules = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "State"), /*#__PURE__*/React.createElement("th", null, "Visual"), /*#__PURE__*/React.createElement("th", null, "Copy template"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Empty \xB7 no data yet")), /*#__PURE__*/React.createElement("td", null, "Neutral icon, single-line title + body, primary CTA"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("em", null, "\"No [noun] yet\""), " \u2014 body explains how to add the first one. CTA is the action.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Empty \xB7 filtered out")), /*#__PURE__*/React.createElement("td", null, "Search icon, secondary \"Reset filters\" CTA"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("em", null, "\"No [noun] match\""), " \u2014 suggest which filter to widen.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Empty \xB7 personal scope")), /*#__PURE__*/React.createElement("td", null, "Info-toned icon, dual CTAs (import + browse)"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("em", null, "\"Your [list] is empty\""), " \u2014 explain how to populate it.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Error \xB7 network")), /*#__PURE__*/React.createElement("td", null, "Danger icon, primary Retry"), /*#__PURE__*/React.createElement("td", null, "What failed + why + Retry. Link to status page when available.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Error \xB7 permission")), /*#__PURE__*/React.createElement("td", null, "Warning icon, \"Request access\" CTA"), /*#__PURE__*/React.createElement("td", null, "Name the owner. Don't say \"Access denied\" \u2014 say ", /*#__PURE__*/React.createElement("em", null, "\"Ask [owner] for access.\""))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Error \xB7 404 / not found")), /*#__PURE__*/React.createElement("td", null, "Danger icon, back-to-list CTA"), /*#__PURE__*/React.createElement("td", null, "Name what wasn't found. Suggest the next search.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Offline")), /*#__PURE__*/React.createElement("td", null, "Warning icon, show cached data with timestamp"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("em", null, "\"You're offline. Showing snapshot from [time].\""), " Never hide data the user already had.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Partial failure")), /*#__PURE__*/React.createElement("td", null, "Warning banner above the rendered content; failed rows shown muted"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("em", null, "\"Loaded N of M\""), " \u2014 show what worked. Failed rows keep their slot with retry inline.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Loading \xB7 skeleton")), /*#__PURE__*/React.createElement("td", null, "Match the layout of the real content"), /*#__PURE__*/React.createElement("td", null, "No copy. Skeleton replaces content for < 3 s; longer than that, switch to progress or \"Still loading\u2026\".")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Loading \xB7 spinner")), /*#__PURE__*/React.createElement("td", null, "Inline only \u2014 for \"load more\", form submit, or action confirmation"), /*#__PURE__*/React.createElement("td", null, "Verb + noun (\"Saving notes\u2026\", \"Loading next 50 vessels\u2026\")."))));
const StateChoiceFlow = () => /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "Picking the right state \u2014 decision flow:"), /*#__PURE__*/React.createElement("ol", {
  style: {
    margin: "8px 0 0 18px",
    padding: 0,
    lineHeight: 1.7,
    fontSize: 13
  }
}, /*#__PURE__*/React.createElement("li", null, "Did the request ", /*#__PURE__*/React.createElement("strong", null, "succeed"), " with no data? \u2192 ", /*#__PURE__*/React.createElement("em", null, "Empty"), ". Pick subtype by whether the user filtered, scoped, or simply hasn't created anything."), /*#__PURE__*/React.createElement("li", null, "Did the request ", /*#__PURE__*/React.createElement("strong", null, "fail"), "? \u2192 ", /*#__PURE__*/React.createElement("em", null, "Error"), ". Pick subtype by failure cause: network \xB7 permission \xB7 not-found \xB7 offline."), /*#__PURE__*/React.createElement("li", null, "Did ", /*#__PURE__*/React.createElement("strong", null, "some"), " data arrive and some fail? \u2192 ", /*#__PURE__*/React.createElement("em", null, "Partial failure"), ". Render what worked."), /*#__PURE__*/React.createElement("li", null, "Is data ", /*#__PURE__*/React.createElement("strong", null, "arriving"), "? \u2192 ", /*#__PURE__*/React.createElement("em", null, "Loading"), ". Skeleton if > 200 ms is expected, spinner if inline / action-driven.")));
const StatesSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Why this gallery"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Empty, loading and error states are the easiest part of a UI to skip during a build and the easiest to get wrong. They show up at the worst moments \u2014 first-use, partial outages, edge data. This chapter pulls every state into one place with the canonical copy from the Voice chapter, so a developer can copy the right pattern in ten seconds.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Empty states"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Three subtypes. Pick by why the result set is empty \u2014 not by the screen."), /*#__PURE__*/React.createElement(EmptyStatesGallery, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Error states"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Four subtypes, each with a clear \"what / why / how\" per the Voice template. The recovery action is always the primary button."), /*#__PURE__*/React.createElement(ErrorStatesGallery, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Partial failure"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Render what worked. Mark what didn't. Never blank the page because one row failed."), /*#__PURE__*/React.createElement(PartialFailureDemo, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Loading"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Skeleton replaces content; spinners run inline. Use skeletons for initial loads; use a spinner for \"loading more\" and form submissions. Never show both on the same surface."), /*#__PURE__*/React.createElement(LoadingStatesDemo, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "State reference"), /*#__PURE__*/React.createElement(StateRules, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Pick the right state"), /*#__PURE__*/React.createElement(StateChoiceFlow, null)), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    borderLeftColor: "var(--warning-500)",
    background: "var(--warning-050)"
  }
}, /*#__PURE__*/React.createElement("strong", null, "The principle:"), " the absence of data is not the absence of design. Empty, error, and loading screens are where users decide whether to trust the product. Treat them like first-class surfaces \u2014 because they are."));
window.StatesSection = StatesSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-states.jsx", error: String((e && e.message) || e) }); }

// section-stewardship.jsx
try { (() => {
/* Section — Stewardship: governance, versioning, testing, performance */

const ComponentStatusTable = () => {
  const rows = [["Button", "1.0.0", "stable"], ["Input / Field", "1.0.0", "stable"], ["Card", "1.0.0", "stable"], ["Table", "1.0.0", "stable"], ["Badge / Rating", "1.0.0", "stable"], ["Alert", "1.0.0", "stable"], ["Tabs", "1.0.0", "stable"], ["Toast", "0.4.2", "beta"], ["Command palette", "0.2.0", "beta"], ["Date range picker", "0.1.0", "draft"], ["DataGrid (legacy)", "—", "deprecated"], ["common/Button (legacy)", "—", "deprecated"]];
  return /*#__PURE__*/React.createElement("table", {
    className: "spec-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Component"), /*#__PURE__*/React.createElement("th", null, "Version"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Notes"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(([name, ver, status]) => /*#__PURE__*/React.createElement("tr", {
    key: name
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, name)), /*#__PURE__*/React.createElement("td", {
    className: "t-mono",
    style: {
      fontSize: 12
    }
  }, ver), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `steward-status steward-status--${status}`
  }, status)), /*#__PURE__*/React.createElement("td", {
    style: {
      color: "var(--text-secondary)",
      fontSize: 12.5
    }
  }, status === "stable" && "Safe to use. Breaking changes require a major bump + 1 cycle deprecation.", status === "beta" && "API may change. No version pinning required, but flag in PR if used in critical paths.", status === "draft" && "Spec only — not in app/ui yet. Do not import.", status === "deprecated" && "Migration codemod available. Removed in v2.0.")))));
};
const Changelog = () => /*#__PURE__*/React.createElement("div", {
  className: "changelog-rail"
}, /*#__PURE__*/React.createElement("div", {
  className: "changelog-entry"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "baseline",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "ver"
}, "1.0.0"), /*#__PURE__*/React.createElement("span", {
  className: "date"
}, "28 Apr 2026 \xB7 initial release")), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Token architecture (primitive \xB7 semantic \xB7 component) ships."), /*#__PURE__*/React.createElement("li", null, "17 stable components published from ", /*#__PURE__*/React.createElement("code", null, "app/ui/*"), "."), /*#__PURE__*/React.createElement("li", null, "Domain primitives: chart palette, map glyphs, formatting helpers."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("code", null, "common/components/*"), " marked deprecated; codemod added for 12 of 17 patterns."))), /*#__PURE__*/React.createElement("div", {
  className: "changelog-entry"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "baseline",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "ver"
}, "0.9.0"), /*#__PURE__*/React.createElement("span", {
  className: "date"
}, "14 Apr 2026 \xB7 RC")), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Token names finalized after eng + design review."), /*#__PURE__*/React.createElement("li", null, "Tailwind mapping ships in ", /*#__PURE__*/React.createElement("code", null, "tailwind.config.js"), "."), /*#__PURE__*/React.createElement("li", null, "Storybook coverage at 92% \u2014 Toast + Command palette still beta."))), /*#__PURE__*/React.createElement("div", {
  className: "changelog-entry"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "baseline",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  className: "ver"
}, "0.5.0"), /*#__PURE__*/React.createElement("span", {
  className: "date"
}, "3 Mar 2026 \xB7 audit complete")), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "97 colors \u2192 28 tokens \xB7 14 button variants \u2192 4 \xB7 4 tables \u2192 1."), /*#__PURE__*/React.createElement("li", null, "Before/after surfaces approved for dashboard, vessels, vessel detail."))));
const SemVerCard = ({
  kind,
  title,
  examples
}) => /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, title)), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "t-label",
  style: {
    marginBottom: 8,
    color: kind === "major" ? "var(--danger-700)" : kind === "minor" ? "var(--info-700)" : "var(--success-700)"
  }
}, kind === "major" ? "MAJOR · X.0.0" : kind === "minor" ? "MINOR · 1.X.0" : "PATCH · 1.0.X"), /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, examples.map((e, i) => /*#__PURE__*/React.createElement("li", {
  key: i
}, e)))));
const TestingMatrix = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Layer"), /*#__PURE__*/React.createElement("th", null, "Tool"), /*#__PURE__*/React.createElement("th", null, "Coverage rule"), /*#__PURE__*/React.createElement("th", null, "CI gate"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Unit")), /*#__PURE__*/React.createElement("td", null, "Vitest + Testing Library"), /*#__PURE__*/React.createElement("td", null, "Public props + a11y roles. No snapshot tests on HTML."), /*#__PURE__*/React.createElement("td", null, "Pull-request blocking")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Accessibility")), /*#__PURE__*/React.createElement("td", null, "axe-core (via Storybook)"), /*#__PURE__*/React.createElement("td", null, "Zero serious / critical violations on every Story."), /*#__PURE__*/React.createElement("td", null, "Pull-request blocking")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Visual regression")), /*#__PURE__*/React.createElement("td", null, "Chromatic"), /*#__PURE__*/React.createElement("td", null, "Every variant \xD7 size \xD7 state combo has a Story. Diffs require design sign-off."), /*#__PURE__*/React.createElement("td", null, "Pull-request advisory")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Keyboard / focus")), /*#__PURE__*/React.createElement("td", null, "Playwright + axe"), /*#__PURE__*/React.createElement("td", null, "Every interactive component completes its happy path with ", /*#__PURE__*/React.createElement("kbd", null, "Tab"), " alone."), /*#__PURE__*/React.createElement("td", null, "Nightly")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Token drift")), /*#__PURE__*/React.createElement("td", null, "ESLint + Stylelint"), /*#__PURE__*/React.createElement("td", null, "No raw hex, no raw ", /*#__PURE__*/React.createElement("code", null, "px"), " outside the spacing scale, no ", /*#__PURE__*/React.createElement("code", null, "Intl"), " calls outside ", /*#__PURE__*/React.createElement("code", null, "app/lib/format.ts"), "."), /*#__PURE__*/React.createElement("td", null, "Pull-request blocking")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Bundle size")), /*#__PURE__*/React.createElement("td", null, "size-limit"), /*#__PURE__*/React.createElement("td", null, "Per-component & total. Limits enforced from a baseline file in the repo."), /*#__PURE__*/React.createElement("td", null, "Pull-request advisory"))));
const PerformanceBudgets = () => /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, [["App shell (initial JS)", "≤ 220 KB gz", "Includes React, tokens.css, app/ui core."], ["Per-route chunk", "≤ 80 KB gz", "Each lazy-loaded module."], ["Single component import", "≤ 8 KB gz", "Tree-shake-friendly named exports only."], ["First contentful paint", "≤ 1.4 s", "Median, on a typical operator workstation (Chrome, fiber)."], ["Time to interactive", "≤ 2.6 s", "Same workstation, with a 25-row table on screen."], ["Map tile budget", "≤ 32 tiles / view", "Above this, pre-cluster server-side."], ["Highcharts series cap", "≤ 250 points / line", "Above this, downsample with LTTB on the server."], ["Table virtualization", "≥ 50 rows", "Above 50 rows, the DataGrid switches to virtualized mode automatically."]].map(([k, v, d]) => /*#__PURE__*/React.createElement("div", {
  key: k,
  className: "token-row",
  style: {
    gridTemplateColumns: "260px 140px 1fr"
  }
}, /*#__PURE__*/React.createElement("strong", {
  style: {
    fontSize: 13
  }
}, k), /*#__PURE__*/React.createElement("span", {
  className: "t-mono",
  style: {
    color: "var(--brand-600)"
  }
}, v), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, d))));
const StewardshipSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Why a stewardship chapter"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "A design system rots without a steward. This chapter describes how the system stays current \u2014 who owns it, how it changes, how engineers can trust each release, and what the system promises in return for that trust.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Ownership & governance"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "A small group with a clear contract. The system isn't a side project \u2014 it has an owner of record."), /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Role"), /*#__PURE__*/React.createElement("th", null, "Responsibility"), /*#__PURE__*/React.createElement("th", null, "Cadence"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "System lead")), /*#__PURE__*/React.createElement("td", null, "Final say on token names, public API, breaking changes. One person."), /*#__PURE__*/React.createElement("td", null, "Always-on")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Design steward")), /*#__PURE__*/React.createElement("td", null, "Reviews every PR that touches visuals or motion. Owns the Storybook canon."), /*#__PURE__*/React.createElement("td", null, "Daily review queue")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Engineering steward")), /*#__PURE__*/React.createElement("td", null, "Reviews every PR that touches the API surface. Owns the lint & build config."), /*#__PURE__*/React.createElement("td", null, "Daily review queue")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Contributors")), /*#__PURE__*/React.createElement("td", null, "Any product engineer or designer. Files RFCs, ships features behind review."), /*#__PURE__*/React.createElement("td", null, "Async")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Office hours")), /*#__PURE__*/React.createElement("td", null, "30-min open slot for any team to ask \"do we add a component for this?\""), /*#__PURE__*/React.createElement("td", null, "Wed 14:00 UTC"))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "RFC process"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Anything that adds a token, a component, or a public API change needs an RFC. Style tweaks, bug fixes, and Storybook additions don't \u2014 those go straight to PR."), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, [["1 · Problem", "What user need or audit finding does this address? Link to the screen / module where it's missing.", "1 paragraph"], ["2 · Proposal", "API sketch (TypeScript types), token additions, visual mock.", "1 page max"], ["3 · Prior art", "What exists in the codebase today? What do other systems do (Polaris, Carbon, Material)?", "Short list"], ["4 · Alternatives", "What did you reject, and why? (Composition vs. new primitive is the most common branch.)", "Bullets"], ["5 · Migration", "If this replaces something — what's the codemod plan? What's the deprecation window?", "Concrete steps"], ["6 · Approval", "System lead + one steward (design OR eng, whichever side the change touches more) approve before code lands.", "≤ 1 week"]].map(([k, d, m]) => /*#__PURE__*/React.createElement("div", {
  key: k,
  className: "token-row",
  style: {
    gridTemplateColumns: "170px 1fr 130px"
  }
}, /*#__PURE__*/React.createElement("strong", {
  style: {
    fontSize: 13
  }
}, k), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 13,
    color: "var(--text-secondary)"
  }
}, d), /*#__PURE__*/React.createElement("span", {
  className: "t-caption"
}, m)))), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 8
  }
}, "RFCs live in ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "docs/rfcs/NNNN-title.md"), " with the template in ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "docs/rfcs/0000-template.md"), ". Numbered sequentially, never reused.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Versioning"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Strict SemVer. The version of ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "@skytek/design-system"), " is the contract every product module reads from."), /*#__PURE__*/React.createElement("div", {
  className: "grid-3"
}, /*#__PURE__*/React.createElement(SemVerCard, {
  kind: "major",
  title: "Breaking",
  examples: ["Remove a token, component, or public prop.", "Rename a token (compat alias counts as minor).", "Change a default visual that other surfaces rely on.", "Change the meaning of an existing prop (e.g. tone='warning' now also darkens border)."]
}), /*#__PURE__*/React.createElement(SemVerCard, {
  kind: "minor",
  title: "Additive",
  examples: ["New component, token, or prop.", "New variant on an existing component.", "Performance improvement with no visual change.", "Mark something deprecated (still works, with a console warning)."]
}), /*#__PURE__*/React.createElement(SemVerCard, {
  kind: "patch",
  title: "Fix",
  examples: ["Bug fix that matches the documented spec.", "A11y fix (color contrast, focus order).", "Internal refactor with no external diff.", "Type definition correction."]
}))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Deprecation policy"), /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Window")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, "One ", /*#__PURE__*/React.createElement("strong", null, "minor"), " cycle of warning (e.g. 1.4 \u2192 1.5)."), /*#__PURE__*/React.createElement("li", null, "Removed in the next ", /*#__PURE__*/React.createElement("strong", null, "major"), ". Never sooner."), /*#__PURE__*/React.createElement("li", null, "Codemod ships in the same release that marks the deprecation.")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Signaling")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("code", null, "@deprecated"), " JSDoc on the export (TS surfaces it in autocomplete)."), /*#__PURE__*/React.createElement("li", null, "Runtime ", /*#__PURE__*/React.createElement("code", null, "console.warn"), " on first use in dev, once per session."), /*#__PURE__*/React.createElement("li", null, "Status pill in Storybook + this spec table flips to ", /*#__PURE__*/React.createElement("span", {
  className: "steward-status steward-status--deprecated"
}, "deprecated"), ".")))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Component status"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "A single table any engineer can read before reaching for a component. Lives in this spec and is mirrored in Storybook."), /*#__PURE__*/React.createElement(ComponentStatusTable, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Changelog"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Auto-generated from PR labels (", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "type:breaking"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "type:feature"), ", ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "type:fix"), ") into ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "CHANGELOG.md"), ". The first three entries are pinned to the top of this section."), /*#__PURE__*/React.createElement(Changelog, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Testing matrix"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "What gets tested where. CI is the source of truth \u2014 if a check isn't here, it doesn't gate a release."), /*#__PURE__*/React.createElement(TestingMatrix, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Performance budgets"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Numbers, not vibes. A PR that breaks any budget gets an automated comment with the offender and the delta. Three budget breaks in a quarter and the steward calls a review."), /*#__PURE__*/React.createElement(PerformanceBudgets, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Contribution checklist"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Required before requesting review on any PR that touches ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "app/ui"), " or ", /*#__PURE__*/React.createElement("code", {
  className: "inline"
}, "tokens.css"), "."), /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "\"Do we need this?\"")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("li", null, "Can it be built by composing existing primitives?"), /*#__PURE__*/React.createElement("li", null, "Does it appear in \u2265 2 modules, or is it a one-off?"), /*#__PURE__*/React.createElement("li", null, "Does it duplicate a Highcharts / Leaflet / radix-ui feature?"), /*#__PURE__*/React.createElement("li", null, "Will a designer commit to owning its Story canon?")), /*#__PURE__*/React.createElement("p", {
  style: {
    marginTop: 12,
    marginBottom: 0,
    fontSize: 12,
    color: "var(--text-muted)"
  }
}, "All four \"no\" \u2192 it doesn't belong in the system yet."))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "PR checklist")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6
  }
}, /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("li", null, "RFC merged (if API change)."), /*#__PURE__*/React.createElement("li", null, "Storybook story per variant \xD7 size \xD7 state."), /*#__PURE__*/React.createElement("li", null, "axe passes \xB7 keyboard happy path works."), /*#__PURE__*/React.createElement("li", null, "Tokens only \u2014 no raw hex, no magic ", /*#__PURE__*/React.createElement("code", null, "px"), " outside the scale."), /*#__PURE__*/React.createElement("li", null, "Bundle size delta \u2264 budget."), /*#__PURE__*/React.createElement("li", null, "Changelog label set (", /*#__PURE__*/React.createElement("code", null, "type:breaking"), " / ", /*#__PURE__*/React.createElement("code", null, "feature"), " / ", /*#__PURE__*/React.createElement("code", null, "fix"), ")."), /*#__PURE__*/React.createElement("li", null, "Codemod added if deprecating anything.")))))), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Release cadence"), /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, [["Patch", "On demand", "Bug fixes. No coordination needed beyond review."], ["Minor", "Every 2 weeks", "Bundles additive changes. Notes posted to #design-system."], ["Major", "Approx. quarterly", "Coordinated with product roadmap. RFC + migration guide + codemods land together."], ["Hotfix", "≤ 4h SLA", "Security or production-blocking issue. Direct to main, post-mortem within 48h."]].map(([k, c, d]) => /*#__PURE__*/React.createElement("div", {
  key: k,
  className: "token-row",
  style: {
    gridTemplateColumns: "120px 140px 1fr"
  }
}, /*#__PURE__*/React.createElement("strong", {
  style: {
    fontSize: 13
  }
}, k), /*#__PURE__*/React.createElement("span", {
  className: "t-caption",
  style: {
    color: "var(--brand-600)"
  }
}, c), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 13,
    color: "var(--text-secondary)"
  }
}, d))))), /*#__PURE__*/React.createElement("div", {
  className: "callout",
  style: {
    marginTop: 24
  }
}, /*#__PURE__*/React.createElement("strong", null, "The system's promise:"), " if you read this spec and use the tokens, your UI will keep working \u2014 through theme swaps, library upgrades, even product rebrands \u2014 without a rewrite. The system's ask back is exactly this: only what's in the spec, never invented locally."));
window.StewardshipSection = StewardshipSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-stewardship.jsx", error: String((e && e.message) || e) }); }

// section-toast.jsx
try { (() => {
/* Toast / Snackbar — full specification for the Skytek Design System spec page.
   Canonical component name is "Toast"; "Snackbar" is the documented alias.
   Renders a live, self-contained toast manager (window.SkytekToast) so every
   demo below fires the real component into a fixed top-center region. */

const TOAST_TONES = {
  info: {
    icon: I.info,
    role: "status",
    live: "polite",
    dur: "var(--toast-dur-short)"
  },
  success: {
    icon: I.check,
    role: "status",
    live: "polite",
    dur: "var(--toast-dur-short)"
  },
  warning: {
    icon: I.warn,
    role: "status",
    live: "polite",
    dur: "var(--toast-dur-long)"
  },
  danger: {
    icon: I.alert,
    role: "alert",
    live: "assertive",
    dur: "0"
  }
};

/* ---- One live toast row: owns its own auto-dismiss timer + pause-on-hover ---- */
const ToastItem = ({
  t,
  onClose
}) => {
  const [leaving, setLeaving] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const timer = React.useRef(null);
  const started = React.useRef(0);
  const left = React.useRef(t.duration);
  const dismiss = React.useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => onClose(t.id), 150);
  }, [t.id, onClose]);
  const clear = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };
  const arm = ms => {
    clear();
    if (!ms || ms === Infinity || t.loading) return; // persistent / loading toasts never auto-close
    started.current = Date.now();
    timer.current = window.setTimeout(dismiss, ms);
  };
  React.useEffect(() => {
    arm(t.duration);
    return clear;
  }, [t.duration, t.loading]);
  const pause = () => {
    if (!timer.current) return;
    left.current = Math.max(0, left.current - (Date.now() - started.current));
    clear();
    setPaused(true);
  };
  const resume = () => {
    if (paused) {
      setPaused(false);
      arm(left.current);
    }
  };
  const tone = TOAST_TONES[t.tone] || TOAST_TONES.info;
  const showTimer = !t.loading && t.duration && t.duration !== Infinity;
  return /*#__PURE__*/React.createElement("div", {
    className: `ds-toast ds-toast--${t.tone} ${leaving ? "is-leaving" : "is-entering"} ${paused ? "is-paused" : ""}`,
    role: tone.role,
    "aria-live": tone.live,
    onMouseEnter: pause,
    onMouseLeave: resume,
    onFocus: pause,
    onBlur: resume
  }, t.loading ? /*#__PURE__*/React.createElement("span", {
    className: "ds-toast-spinner",
    "aria-hidden": "true"
  }) : /*#__PURE__*/React.createElement(Icon, {
    d: tone.icon,
    size: 18,
    className: "ds-toast-icon"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ds-toast-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-toast-title"
  }, t.title), t.desc && /*#__PURE__*/React.createElement("div", {
    className: "ds-toast-desc"
  }, t.desc), t.action && /*#__PURE__*/React.createElement("div", {
    className: "ds-toast-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--link ds-btn--sm",
    style: {
      height: 24,
      padding: "0 4px"
    },
    onClick: () => {
      t.action.onClick?.();
      dismiss();
    }
  }, t.action.label))), /*#__PURE__*/React.createElement("div", {
    className: "ds-toast-side"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ds-toast-dismiss",
    "aria-label": "Dismiss notification",
    onClick: dismiss
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.x,
    size: 14
  }))), showTimer && /*#__PURE__*/React.createElement("span", {
    className: "ds-toast-timer",
    style: {
      animationDuration: `${t.duration}ms`
    },
    "aria-hidden": "true"
  }));
};

/* ---- The manager: holds the queue, renders the fixed region into <body> ---- */
const DUR = {
  short: 4000,
  long: 6000,
  action: 8000
};
const useToastManager = () => {
  const [toasts, setToasts] = React.useState([]);
  const seq = React.useRef(0);
  const close = React.useCallback(id => setToasts(ts => ts.filter(x => x.id !== id)), []);
  const update = React.useCallback((id, patch) => setToasts(ts => ts.map(x => x.id === id ? {
    ...x,
    ...patch
  } : x)), []);
  const push = React.useCallback(opts => {
    const id = ++seq.current;
    setToasts(ts => {
      const next = [{
        id,
        tone: "info",
        duration: DUR.short,
        ...opts
      }, ...ts];
      return next.slice(0, 4); // cap rendered stack; oldest beyond cap drop
    });
    return id;
  }, []);
  return {
    toasts,
    push,
    update,
    close
  };
};
const ToastRegion = ({
  toasts,
  onClose,
  inline
}) => {
  const [host] = React.useState(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("div");
    return el;
  });
  React.useEffect(() => {
    if (!host || inline) return;
    document.body.appendChild(host);
    return () => {
      try {
        document.body.removeChild(host);
      } catch (e) {}
    };
  }, [host, inline]);
  const region = /*#__PURE__*/React.createElement("div", {
    className: `ds-toast-region ${inline ? "is-inline" : ""}`,
    "aria-label": "Notifications"
  }, toasts.map(t => /*#__PURE__*/React.createElement(ToastItem, {
    key: t.id,
    t: t,
    onClose: onClose
  })));
  if (inline) return region;
  return host ? ReactDOM.createPortal(region, host) : null;
};

/* =========================== THE SPEC SECTION =========================== */
const ToastSpec = () => {
  const {
    toasts,
    push,
    update,
    close
  } = useToastManager();

  // expose a real, reusable API on window (mirrors RWModal)
  React.useEffect(() => {
    window.SkytekToast = {
      show: push,
      info: o => push({
        tone: "info",
        ...o
      }),
      success: o => push({
        tone: "success",
        ...o
      }),
      warning: o => push({
        tone: "warning",
        duration: DUR.long,
        ...o
      }),
      error: o => push({
        tone: "danger",
        duration: Infinity,
        ...o
      }),
      dismiss: close
    };
  }, [push, close]);
  const demoUndo = () => {
    push({
      tone: "success",
      title: "23 vessels archived",
      desc: "Moved to archive · undo within 8 s",
      duration: DUR.action,
      action: {
        label: "Undo",
        onClick: () => push({
          tone: "info",
          title: "Archive reverted",
          desc: "23 vessels restored to the active list."
        })
      }
    });
  };
  const demoPromise = () => {
    const id = push({
      tone: "info",
      loading: true,
      title: "Saving policy #44721…",
      duration: Infinity
    });
    window.setTimeout(() => update(id, {
      loading: false,
      tone: "success",
      title: "Policy saved",
      desc: "Added to Atlantic Hull Programme 2026.",
      duration: DUR.short
    }), 1800);
  };
  const demoStack = () => {
    ["North Atlantic", "Black Sea", "Gulf of Aden", "Malacca Strait"].forEach((r, i) => window.setTimeout(() => push({
      tone: "info",
      title: `${r} feed refreshed`,
      desc: "Positions updated."
    }), i * 320));
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ToastRegion, {
    toasts: toasts,
    onClose: close
  }), /*#__PURE__*/React.createElement("div", {
    className: "callout",
    style: {
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Naming."), " The canonical component is ", /*#__PURE__*/React.createElement("strong", null, "Toast"), " \u2014 that's the name in code (", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "useToast()"), "), the z-index token (", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--z-toast"), "), and the Figma frame. ", /*#__PURE__*/React.createElement("strong", null, "\u201CSnackbar\u201D"), " is an accepted alias for the same component; prefer \u201CToast\u201D in specs and PRs so search stays consistent. A toast is ", /*#__PURE__*/React.createElement("em", null, "transient"), " feedback that confirms an action just happened \u2014 it is not the ", /*#__PURE__*/React.createElement("a", {
    href: "#c-alerts",
    style: {
      color: "var(--brand-600)",
      fontWeight: 600
    }
  }, "Alert"), " (persistent, in-surface) and not a ", /*#__PURE__*/React.createElement("a", {
    href: "#c-modal",
    style: {
      color: "var(--brand-600)",
      fontWeight: 600
    }
  }, "Modal"), " (blocking)."), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subsection-title"
  }, "Live behavior"), /*#__PURE__*/React.createElement("p", {
    className: "subsection-desc"
  }, "Every button fires the production component into the fixed region at the ", /*#__PURE__*/React.createElement("strong", null, "top-center of the viewport"), ". Hover or focus a toast to pause its countdown; the timer bar resumes on leave. Newest stacks on top; only ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-max-stack"), " (3) stay visible."), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ts-demo-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ts-demo-grp"
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-overline"
  }, "Tones"), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm",
    onClick: () => push({
      tone: "info",
      title: "View saved",
      desc: "“Black Sea — High Risk” is now in your saved views."
    })
  }, "Info"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm",
    onClick: () => push({
      tone: "success",
      title: "Policy saved",
      desc: "Policy #44721 added to the programme."
    })
  }, "Success"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm",
    onClick: () => push({
      tone: "warning",
      duration: DUR.long,
      title: "AIS feed unstable",
      desc: "Some positions may be stale. Last full update 8 min ago."
    })
  }, "Warning"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm",
    onClick: () => push({
      tone: "danger",
      duration: Infinity,
      title: "Couldn’t save policy",
      desc: "Another user updated this 12 s ago. Refresh to see the latest.",
      action: {
        label: "Refresh"
      }
    })
  }, "Danger"))), /*#__PURE__*/React.createElement("div", {
    className: "ts-demo-grp"
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-overline"
  }, "Patterns"), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm",
    onClick: demoUndo
  }, "With undo \xB7 8 s"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm",
    onClick: demoPromise
  }, "Loading \u2192 resolve"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--secondary ds-btn--sm",
    onClick: demoStack
  }, "Burst (stacking)"), /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--ghost ds-btn--sm",
    onClick: () => toasts.forEach(t => close(t.id))
  }, "Clear all"))))), /*#__PURE__*/React.createElement("div", {
    className: "callout",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Try it from the console."), " The demo registers the real API on ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "window.SkytekToast"), " \u2014 e.g. ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "SkytekToast.success({ title: 'Done' })"), " or ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "SkytekToast.error({ title: 'Failed' })"), ".")), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subsection-title"
  }, "When to use a toast"), /*#__PURE__*/React.createElement("p", {
    className: "subsection-desc"
  }, "Reach for a toast only to confirm a completed action or surface a low-stakes, transient status. If the user must act, or the message must persist, it isn\u2019t a toast."), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "spec-table",
    style: {
      border: 0
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Need"), /*#__PURE__*/React.createElement("th", null, "Use"), /*#__PURE__*/React.createElement("th", null, "Why"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Confirm an action that just succeeded"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Toast")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Transient, non-blocking, self-dismissing. \u201CPolicy saved.\u201D")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Offer to reverse a just-done action"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Toast + Undo")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "8 s window; the only action a toast should carry.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Persistent condition on the current surface"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("a", {
    href: "#c-alerts",
    style: {
      color: "var(--brand-600)",
      fontWeight: 600
    }
  }, "Alert / banner")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Stays until resolved; lives in the layout, not over it.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "A decision that blocks progress"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("a", {
    href: "#c-modal",
    style: {
      color: "var(--brand-600)",
      fontWeight: 600
    }
  }, "Modal")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Requires focus + an explicit choice.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Field-level validation error"), /*#__PURE__*/React.createElement("td", null, "Inline message"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Lives under the field \u2014 never a toast."))))), /*#__PURE__*/React.createElement("div", {
    className: "dodont",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dd-head dd-do"
  }, "Do"), /*#__PURE__*/React.createElement("ul", {
    className: "dd-list"
  }, /*#__PURE__*/React.createElement("li", null, "One line of outcome, sentence case, no terminal period unless multi-sentence."), /*#__PURE__*/React.createElement("li", null, "At most one action, and only Undo / Retry / View."), /*#__PURE__*/React.createElement("li", null, "Let success & info self-dismiss; keep errors until dismissed."))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dd-head dd-dont"
  }, "Don\u2019t"), /*#__PURE__*/React.createElement("ul", {
    className: "dd-list"
  }, /*#__PURE__*/React.createElement("li", null, "Put critical errors or anything requiring a decision in a toast."), /*#__PURE__*/React.createElement("li", null, "Stack two CTAs, or use a toast for marketing / tips."), /*#__PURE__*/React.createElement("li", null, "Fire a toast for every keystroke or for routine, expected results."))))), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subsection-title"
  }, "Anatomy"), /*#__PURE__*/React.createElement("p", {
    className: "subsection-desc"
  }, "A 4-px tone bar encodes intent; the surface stays neutral white for legibility against any backdrop. Five regions, all optional except title."), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 24,
      background: "var(--bg-app)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 380,
      maxWidth: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-toast ds-toast--success",
    style: {
      animation: "none"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.check,
    size: 18,
    className: "ds-toast-icon"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ds-toast-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ds-toast-title"
  }, "23 vessels archived"), /*#__PURE__*/React.createElement("div", {
    className: "ds-toast-desc"
  }, "Moved to archive \xB7 undo within 8 s"), /*#__PURE__*/React.createElement("div", {
    className: "ds-toast-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ds-btn ds-btn--link ds-btn--sm",
    style: {
      height: 24,
      padding: "0 4px"
    }
  }, "Undo"))), /*#__PURE__*/React.createElement("div", {
    className: "ds-toast-side"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ds-toast-dismiss",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.x,
    size: 14
  }))), /*#__PURE__*/React.createElement("span", {
    className: "ds-toast-timer",
    style: {
      width: "100%",
      transform: "scaleX(0.55)",
      animation: "none"
    },
    "aria-hidden": "true"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      overflow: "hidden",
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "spec-table",
    style: {
      border: 0
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: 28
    }
  }, "#"), /*#__PURE__*/React.createElement("th", null, "Region"), /*#__PURE__*/React.createElement("th", null, "Class"), /*#__PURE__*/React.createElement("th", null, "Responsibility"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "1"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Tone bar")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "border-left")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "4-px accent in the tone color \u2014 the only chromatic element.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "2"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Icon")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, ".ds-toast-icon")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "18-px Lucide glyph in tone-700, or a spinner for loading toasts.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "3"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Body")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, ".ds-toast-body")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Title (13 px / 600) and optional one-line description (12 px muted).")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "4"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Action")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, ".ds-toast-actions")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Optional single link button \u2014 Undo / Retry / View only.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "5"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Dismiss + timer")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, ".ds-toast-dismiss"), " \xB7 ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, ".ds-toast-timer")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "24-px close target; 2-px bar depletes over the auto-dismiss duration.")))))), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subsection-title"
  }, "Variants & timing"), /*#__PURE__*/React.createElement("p", {
    className: "subsection-desc"
  }, "Four tones, mapped to the same status families as Alerts. Duration scales with how much the user needs to read \u2014 and errors never auto-close."), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "spec-table",
    style: {
      border: 0
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Tone"), /*#__PURE__*/React.createElement("th", null, "Use for"), /*#__PURE__*/React.createElement("th", null, "Default duration"), /*#__PURE__*/React.createElement("th", null, "ARIA"), /*#__PURE__*/React.createElement("th", null, "Auto-dismiss"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "ds-badge ds-badge--info ds-badge--dot"
  }, "info")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Neutral confirmation, background status"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-dur-short"), " \xB7 4 s"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "role=status \xB7 polite"), /*#__PURE__*/React.createElement("td", null, "Yes")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "ds-badge ds-badge--success ds-badge--dot"
  }, "success")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Action completed"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-dur-short"), " \xB7 4 s"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "role=status \xB7 polite"), /*#__PURE__*/React.createElement("td", null, "Yes")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "ds-badge ds-badge--warning ds-badge--dot"
  }, "warning")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Degraded but non-blocking state"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-dur-long"), " \xB7 6 s"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "role=status \xB7 polite"), /*#__PURE__*/React.createElement("td", null, "Yes")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "ds-badge ds-badge--danger ds-badge--dot"
  }, "danger")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Action failed / needs attention"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Persistent")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "role=alert \xB7 assertive"), /*#__PURE__*/React.createElement("td", null, "No \u2014 manual")), /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "var(--brand-050)"
    }
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "any + action")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Carries Undo / Retry"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-dur-action"), " \xB7 8 s"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "inherits tone"), /*#__PURE__*/React.createElement("td", null, "Yes (longer)")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "loading")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Promise in flight (\u2192 resolves in place)"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Persistent")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "role=status \xB7 polite"), /*#__PURE__*/React.createElement("td", null, "On settle")))))), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subsection-title"
  }, "Placement & stacking"), /*#__PURE__*/React.createElement("p", {
    className: "subsection-desc"
  }, "One region per app, never more. It sits above modals so confirmations remain visible during a flow."), /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "callout"
  }, /*#__PURE__*/React.createElement("strong", null, "Anchor."), " Fixed ", /*#__PURE__*/React.createElement("strong", null, "top-center"), ", ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-inset"), " (20 px) from the top edge and horizontally centered, at ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--z-toast"), " (1200) \u2014 above the modal layer."), /*#__PURE__*/React.createElement("div", {
    className: "callout"
  }, /*#__PURE__*/React.createElement("strong", null, "Stack order."), " Newest enters at the top and pushes older ones down. Max ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-max-stack"), " (3) visible; extras queue and appear as room frees up."), /*#__PURE__*/React.createElement("div", {
    className: "callout"
  }, /*#__PURE__*/React.createElement("strong", null, "Width."), " ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-width"), " (380 px), capped to the viewport on small screens \u2014 full-bleed minus 16 px gutters on phones."), /*#__PURE__*/React.createElement("div", {
    className: "callout"
  }, /*#__PURE__*/React.createElement("strong", null, "Pointer."), " The region is click-through (", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "pointer-events: none"), "); each toast re-enables pointer events so the page underneath stays usable.")), /*#__PURE__*/React.createElement("div", {
    className: "callout warn",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Mobile."), " Below 640 px the region spans the top gutter-to-gutter; reserve bottom placement for views with a fixed bottom action bar, and move the toast above it so it never covers the primary CTA.")), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subsection-title"
  }, "API"), /*#__PURE__*/React.createElement("p", {
    className: "subsection-desc"
  }, "A single imperative hook returns the trigger functions; tone helpers are sugar over ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "toast(opts)"), ". Promise toasts mutate in place rather than spawning a second toast."), /*#__PURE__*/React.createElement("pre", {
    className: "code"
  }, `const toast = useToast();

// Sugar — tone is implied
toast.success({ title: 'Policy saved', description: 'Added to Atlantic Hull 2026.' });
toast.error({ title: "Couldn't save policy", description: 'Refresh to see the latest.' });

// Reversible action — the only time a toast carries a button
toast.success({
  title: '23 vessels archived',
  action: { label: 'Undo', onClick: restore },
  duration: 8000,
});

// Promise — one toast: loading → success | error
toast.promise(savePolicy(id), {
  loading: 'Saving policy…',
  success: (p) => ({ title: 'Policy saved', description: \`#\${p.id} added.\` }),
  error:   'Could not save — try again.',
});`), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      overflow: "hidden",
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "spec-table",
    style: {
      border: 0
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Option"), /*#__PURE__*/React.createElement("th", null, "Type"), /*#__PURE__*/React.createElement("th", null, "Default"), /*#__PURE__*/React.createElement("th", null, "Description"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "title")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "string"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Required. The single-line outcome.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "description")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "string"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Optional second line of context.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "tone")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "'info'|'success'|'warning'|'danger'"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "'info'")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Sets icon, bar color and ARIA role.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "duration")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "number (ms) | Infinity"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "4000 / 6000"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "Infinity"), " = persistent (auto for ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "danger"), ").")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "action")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "{ label, onClick }"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "One button only. Dismisses the toast on click.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "dismissible")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "boolean"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "true")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Show the \xD7 close target.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "id")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "string"), /*#__PURE__*/React.createElement("td", null, "auto"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Pass to dedupe / update an existing toast.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "onDismiss")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "fn"), /*#__PURE__*/React.createElement("td", null, "\u2014"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Fires when removed (timeout, action, or \xD7)."))))), /*#__PURE__*/React.createElement("p", {
    className: "subsection-desc",
    style: {
      marginTop: 16
    }
  }, "Returns and controls: ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "const id = toast(opts)"), ", then ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "toast.dismiss(id)"), " or ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "toast.update(id, patch)"), ". ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "toast.dismiss()"), " with no id clears the queue.")), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subsection-title"
  }, "Design tokens"), /*#__PURE__*/React.createElement("p", {
    className: "subsection-desc"
  }, "Every dimension reads from a ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-*"), " variable. Override on ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, ":root"), " to re-theme placement, density or timing without touching markup."), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "spec-table",
    style: {
      border: 0
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Token"), /*#__PURE__*/React.createElement("th", null, "Default"), /*#__PURE__*/React.createElement("th", null, "Controls"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--z-toast")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "1200"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Stack order \u2014 above modals")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-width")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "380px"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Toast / region width")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-inset")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "20px"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Distance from the top edge")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-gap")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "12px"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Vertical gap between stacked toasts")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-radius")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "var(--radius-lg)"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Corner roundness")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-shadow")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "card-shadow-raised"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Elevation")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-accent")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "4px"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Tone-bar thickness")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-pad-x / -pad-y")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "14px / 12px"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Inner padding")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-max-stack")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "3"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Visible before queueing")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-dur-short / -long / -action")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "4s / 6s / 8s"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Auto-dismiss timings")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "--toast-motion \xB7 --toast-ease")), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "200ms \xB7 ease-out"), /*#__PURE__*/React.createElement("td", {
    className: "t-caption"
  }, "Enter animation")))))), /*#__PURE__*/React.createElement("div", {
    className: "subsection"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subsection-title"
  }, "Accessibility"), /*#__PURE__*/React.createElement("p", {
    className: "subsection-desc"
  }, "A toast appears without stealing focus, so it must announce itself and survive long enough to be read."), /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "callout"
  }, /*#__PURE__*/React.createElement("strong", null, "Live regions."), " Info / success / warning use ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "role=\"status\""), " + ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "aria-live=\"polite\""), "; danger uses ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "role=\"alert\""), " + ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "aria-live=\"assertive\""), "."), /*#__PURE__*/React.createElement("div", {
    className: "callout"
  }, /*#__PURE__*/React.createElement("strong", null, "No focus theft."), " Toasts never move focus or trap it \u2014 they overlay without interrupting the user\u2019s current task."), /*#__PURE__*/React.createElement("div", {
    className: "callout"
  }, /*#__PURE__*/React.createElement("strong", null, "Pause on interaction."), " Hover and keyboard focus pause the countdown (WCAG 2.2.1) so the message can\u2019t expire while being read or acted on."), /*#__PURE__*/React.createElement("div", {
    className: "callout"
  }, /*#__PURE__*/React.createElement("strong", null, "Reachable dismiss."), " The \xD7 is a real 24-px button in the tab order; the optional action is a focusable button, both with a visible focus ring."), /*#__PURE__*/React.createElement("div", {
    className: "callout"
  }, /*#__PURE__*/React.createElement("strong", null, "Min duration."), " Auto-dismiss never falls below 4 s; toasts with an action get 8 s so the control is reachable in time."), /*#__PURE__*/React.createElement("div", {
    className: "callout"
  }, /*#__PURE__*/React.createElement("strong", null, "Reduced motion."), " Enter / exit slides and the timer bar collapse under ", /*#__PURE__*/React.createElement("code", {
    className: "inline"
  }, "prefers-reduced-motion"), " \u2014 content simply appears."))), /*#__PURE__*/React.createElement("style", null, `
        .ts-demo-row { display: flex; flex-wrap: wrap; gap: 28px; }
        .ts-demo-grp { display: flex; flex-direction: column; gap: 8px; }
        .dodont { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .dodont > div { border: 1px solid var(--border-default); border-radius: var(--radius-lg); overflow: hidden; padding: 0; }
        .dd-head { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 10px 16px; }
        .dd-do   { background: var(--success-050); color: var(--success-700); }
        .dd-dont { background: var(--danger-050); color: var(--danger-700); }
        .dd-list { margin: 0; padding: 12px 16px 14px 32px; font-size: 13px; line-height: 1.6; color: var(--text-primary); }
        .dd-list li { margin-bottom: 4px; }
        @media (max-width: 720px) { .dodont { grid-template-columns: 1fr; } }
      `));
};
Object.assign(window, {
  ToastSpec
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-toast.jsx", error: String((e && e.message) || e) }); }

// section-token-index.jsx
try { (() => {
/* Section — Token index: every CSS variable, searchable */

const TOKEN_CATALOG = [
// [name, type, value, where]
// Color · Brand
["--brand-700", "color", "#1f5fc7", "Pressed / active state (buttons, links)"], ["--brand-600", "color", "#2d7ffb", "Primary action, key headings, link hover"], ["--brand-500", "color", "#51a2fc", "Hover/highlight, default link"], ["--brand-400", "color", "#8ec5fd", "Accent, focus rings"], ["--brand-300", "color", "#bfdbfe", "Decorative, subtle accent"], ["--brand-100", "color", "#dbeafe", "Tint backgrounds"], ["--brand-050", "color", "#eff6ff", "Lightest brand tint"],
// Color · Slate
["--slate-950", "color", "#0B1220", "Deepest text, dark surface base"], ["--slate-900", "color", "#111827", "Primary text"], ["--slate-800", "color", "#1F2937", "Dark surface variant"], ["--slate-700", "color", "#374151", "Secondary text on white"], ["--slate-600", "color", "#4B5563", "Secondary text mapping"], ["--slate-500", "color", "#6B7280", "Muted text"], ["--slate-400", "color", "#9CA3AF", "Disabled text, placeholders"], ["--slate-300", "color", "#D1D5DB", "Strong borders"], ["--slate-200", "color", "#E5E7EB", "Default borders"], ["--slate-150", "color", "#ECEEF2", "Subtle borders"], ["--slate-100", "color", "#F3F4F6", "Muted surfaces"], ["--slate-50", "color", "#F9FAFB", "App background, sunken rows"], ["--white", "color", "#FFFFFF", "Cards, modals, raised surfaces"],
// Color · Status
["--success-700", "color", "#15803D", "Success text, success badges"], ["--success-500", "color", "#16A34A", "Success fill, OK glyph border"], ["--success-100", "color", "#DCFCE7", "Success badge bg"], ["--success-050", "color", "#F0FDF4", "Success alert bg"], ["--warning-700", "color", "#B45309", "Warning text, warning badges"], ["--warning-500", "color", "#D97706", "Warning fill, alert glyph border"], ["--warning-100", "color", "#FEF3C7", "Warning badge bg"], ["--warning-050", "color", "#FFFBEB", "Warning alert bg"], ["--danger-800", "color", "#991B1B", "Danger button pressed / active state"], ["--danger-700", "color", "#B91C1C", "Danger text, danger badges"], ["--danger-500", "color", "#DC2626", "Danger fill, danger glyph border"], ["--danger-100", "color", "#FEE2E2", "Danger badge bg"], ["--danger-050", "color", "#FEF2F2", "Danger alert bg"], ["--info-700", "color", "#1D4ED8", "Info text, info badges"], ["--info-500", "color", "#2563EB", "Info fill"], ["--info-100", "color", "#DBEAFE", "Info badge bg"], ["--info-050", "color", "#EFF6FF", "Info alert bg"],
// Color · Rating (locked)
["--rating-a", "color", "#2E7D4F", "Risk rating A (best). Locked — domain semantic."], ["--rating-b", "color", "#6FA84A", "Risk rating B"], ["--rating-c", "color", "#C9A227", "Risk rating C"], ["--rating-d", "color", "#D97706", "Risk rating D"], ["--rating-e", "color", "#C0392B", "Risk rating E (worst)"],
// Semantic · surfaces
["--bg-app", "semantic", "var(--slate-50)", "Default page background"], ["--bg-canvas", "semantic", "#F5F7FA", "Map / dashboard canvas"], ["--bg-surface", "semantic", "var(--white)", "Cards, modals, panels"], ["--bg-raised", "semantic", "var(--white)", "Elevated surfaces"], ["--bg-sunken", "semantic", "var(--slate-50)", "Form rows, inset blocks"], ["--bg-muted", "semantic", "var(--slate-100)", "Disabled, placeholders"], ["--bg-inverse", "semantic", "var(--slate-900)", "Dark surfaces, tooltips"], ["--border-subtle", "semantic", "var(--slate-150)", "Internal dividers"], ["--border-default", "semantic", "var(--slate-200)", "Cards, inputs, buttons"], ["--border-strong", "semantic", "var(--slate-300)", "Hover, emphasized"], ["--border-info", "semantic", "color-mix(in srgb, var(--info-500) 18%, transparent)", "Info badge / alert border"], ["--border-success", "semantic", "color-mix(in srgb, var(--success-500) 18%, transparent)", "Success badge / alert border"], ["--border-warning", "semantic", "color-mix(in srgb, var(--warning-500) 20%, transparent)", "Warning badge / alert border"], ["--border-danger", "semantic", "color-mix(in srgb, var(--danger-500) 18%, transparent)", "Danger badge / alert border"],
// Semantic · text
["--text-primary", "semantic", "var(--slate-900)", "Body, headings"], ["--text-secondary", "semantic", "var(--slate-600)", "Supporting copy"], ["--text-muted", "semantic", "var(--slate-500)", "Help, captions, meta"], ["--text-disabled", "semantic", "var(--slate-400)", "Disabled controls"], ["--text-inverse", "semantic", "var(--white)", "On dark surfaces"], ["--text-link", "semantic", "var(--brand-500)", "Inline links"], ["--text-on-brand", "semantic", "var(--white)", "On primary buttons"],
// Type
["--font-sans", "type", "Inter · Open Sans · system-ui", "Default body family"], ["--font-display", "type", "Exo · Inter · Lato · system-ui", "Headings, titles"], ["--font-mono", "type", "JetBrains Mono · SF Mono", "Code, numbers, tokens"],
// Spacing
["--space-0", "spacing", "0", "Zero rail"], ["--space-1", "spacing", "4px", "Tight inline gap"], ["--space-2", "spacing", "8px", "Default inline gap"], ["--space-3", "spacing", "12px", "Compact group gap"], ["--space-4", "spacing", "16px", "Default group gap (sibling default)"], ["--space-5", "spacing", "20px", "Section interior"], ["--space-6", "spacing", "24px", "Card / panel padding"], ["--space-7", "spacing", "32px", "Major break between content blocks"], ["--space-8", "spacing", "40px", "Hero / module padding"], ["--space-9", "spacing", "48px", "Page section padding (small viewport)"], ["--space-10", "spacing", "64px", "Page section padding (default)"], ["--space-11", "spacing", "96px", "Empty-state padding, marketing hero"],
// Radius
["--radius-xs", "radius", "2px", "Code chips, tiny pills"], ["--radius-sm", "radius", "4px", "Buttons (sm), badges, inputs (sm)"], ["--radius-md", "radius", "6px", "Buttons, inputs, panels, alerts (default)"], ["--radius-lg", "radius", "8px", "Cards, panels, surfaces"], ["--radius-xl", "radius", "12px", "Modals, popovers, large cards"], ["--radius-pill", "radius", "9999px", "Pills, tabs, chips"],
// Shadow
["--card-shadow-flat", "shadow", "0 0 #0000", "No elevation"], ["--card-shadow-rest", "shadow", "2-layer, soft", "Resting cards, inputs at rest"], ["--card-shadow-hover", "shadow", "2-layer, lifted", "Hovered cards, popovers"], ["--card-shadow-active", "shadow", "2-layer, deeper", "Pressed / dragged elements"], ["--card-shadow-raised", "shadow", "2-layer, lifted further", "Drawers, sticky cards, map toolbar"], ["--card-shadow-modal", "shadow", "2-layer, dramatic", "Modals, command palette, popups"],
// Motion
["--motion-instant", "motion", "80ms", "Microinteraction: button press, switch tick"], ["--motion-fast", "motion", "140ms", "Hover, focus, color transitions"], ["--motion-base", "motion", "200ms", "Component-level: dropdown, popover, tab"], ["--motion-slow", "motion", "320ms", "Layout: modal mount, drawer, page reveal"], ["--ease-out", "motion", "cubic-bezier(0.16, 1, 0.3, 1)", "Default — enters, reveals"], ["--ease-in-out", "motion", "cubic-bezier(0.4, 0, 0.2, 1)", "Reversible transitions"], ["--ease-emphasis", "motion", "cubic-bezier(0.34, 1.2, 0.64, 1)", "Tab pill, selection — overshoots slightly"],
// Z-index
["--z-base", "z-index", "1", "Default stacking"], ["--z-sticky", "z-index", "100", "Sticky headers, scrolling chrome"], ["--z-overlay", "z-index", "1000", "Popovers, dropdowns"], ["--z-modal", "z-index", "1100", "Modals"], ["--z-toast", "z-index", "1200", "Toasts (always on top)"],
// Chart palette · categorical
["--chart-cat-1", "chart", "#2d7ffb", "Series 1 — primary blue"], ["--chart-cat-2", "chart", "#D97706", "Series 2 — amber"], ["--chart-cat-3", "chart", "#16A34A", "Series 3 — green"], ["--chart-cat-4", "chart", "#9333EA", "Series 4 — purple"], ["--chart-cat-5", "chart", "#DB2777", "Series 5 — pink"], ["--chart-cat-6", "chart", "#0891B2", "Series 6 — cyan"], ["--chart-cat-7", "chart", "#65A30D", "Series 7 — lime"], ["--chart-cat-8", "chart", "#475569", "Series 8 — slate"],
// Chart · sequential
["--chart-seq-1", "chart", "#eff6ff", "Sequential ramp · low"], ["--chart-seq-2", "chart", "#dbeafe", "Sequential ramp"], ["--chart-seq-3", "chart", "#bfdbfe", "Sequential ramp"], ["--chart-seq-4", "chart", "#8ec5fd", "Sequential ramp"], ["--chart-seq-5", "chart", "#51a2fc", "Sequential ramp"], ["--chart-seq-6", "chart", "#2d7ffb", "Sequential ramp"], ["--chart-seq-7", "chart", "#1d4ed8", "Sequential ramp · high"],
// Chart · divergent
["--chart-div-neg-3", "chart", "#B91C1C", "Divergent · −high"], ["--chart-div-neg-2", "chart", "#DC2626", "Divergent · −med"], ["--chart-div-neg-1", "chart", "#FCA5A5", "Divergent · −low"], ["--chart-div-zero", "chart", "#F3F4F6", "Divergent · zero"], ["--chart-div-pos-1", "chart", "#86EFAC", "Divergent · +low"], ["--chart-div-pos-2", "chart", "#16A34A", "Divergent · +med"], ["--chart-div-pos-3", "chart", "#15803D", "Divergent · +high"],
// Chart · structure
["--chart-threshold-warn", "chart", "var(--warning-500)", "Warning threshold line"], ["--chart-threshold-danger", "chart", "var(--danger-500)", "Danger threshold line"], ["--chart-grid", "chart", "var(--slate-150)", "Horizontal gridlines"], ["--chart-axis", "chart", "var(--slate-400)", "Axis line"], ["--chart-axis-label", "chart", "var(--slate-500)", "Axis label color"],
// Map · basemap + glyph
["--map-water", "map", "#DCE7F2", "Sea / water fill (override basemap fallback)"], ["--map-land", "map", "#F5F5F2", "Land fill (light basemap fallback)"], ["--map-border", "map", "#C7D2DD", "Country / region outlines"], ["--map-label", "map", "var(--slate-700)", "Place names"], ["--map-label-light", "map", "var(--slate-500)", "Minor labels"], ["--glyph-ok", "map", "var(--success-500)", "OK glyph border on map markers"], ["--glyph-alert", "map", "var(--warning-500)", "Alert glyph border"], ["--glyph-danger", "map", "var(--danger-500)", "Danger glyph border"], ["--glyph-muted", "map", "var(--slate-400)", "Stale / muted glyph border"]];
const TOKEN_GROUPS = [{
  key: "all",
  label: "All"
}, {
  key: "color",
  label: "Color"
}, {
  key: "semantic",
  label: "Semantic"
}, {
  key: "type",
  label: "Type"
}, {
  key: "spacing",
  label: "Spacing"
}, {
  key: "radius",
  label: "Radius"
}, {
  key: "shadow",
  label: "Shadow"
}, {
  key: "motion",
  label: "Motion"
}, {
  key: "z-index",
  label: "Z-index"
}, {
  key: "chart",
  label: "Chart"
}, {
  key: "map",
  label: "Map"
}];
const TokenPreview = ({
  type,
  value
}) => {
  if (type === "color" || type === "semantic" || type === "chart" || type === "map") {
    if (value.startsWith("#") || value.startsWith("var(") || value.startsWith("color-mix(")) {
      return /*#__PURE__*/React.createElement("span", {
        className: "ds-token-swatch-bar",
        style: {
          background: value
        }
      });
    }
    if (value === "0 0 #0000") {
      return /*#__PURE__*/React.createElement("span", {
        className: "ds-token-swatch-bar",
        style: {
          background: "transparent"
        }
      });
    }
    return /*#__PURE__*/React.createElement("span", {
      className: "ds-token-swatch-bar",
      style: {
        background: "var(--slate-100)"
      }
    });
  }
  if (type === "spacing") {
    const px = parseInt(value, 10);
    return /*#__PURE__*/React.createElement("span", {
      className: "ds-token-spacing-bar",
      style: {
        width: Math.max(2, Math.min(64, px)) + "px",
        height: 14
      }
    });
  }
  if (type === "radius") {
    return /*#__PURE__*/React.createElement("span", {
      className: "ds-token-radius-box",
      style: {
        borderRadius: value === "9999px" ? "9999px" : value
      }
    });
  }
  if (type === "shadow") {
    return /*#__PURE__*/React.createElement("span", {
      className: "ds-token-shadow-box",
      style: {
        boxShadow: `var(${value === "0 0 #0000" ? "--card-shadow-flat" : ""}, 0 2px 4px rgba(0,0,0,0.06))`
      }
    });
  }
  if (type === "motion") {
    if (value.endsWith("ms") || value.endsWith("s")) {
      return /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-block",
          width: 48,
          height: 8,
          background: "var(--slate-150)",
          borderRadius: 4,
          position: "relative",
          overflow: "hidden"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: 8,
          height: "100%",
          background: "var(--brand-600)",
          borderRadius: 4,
          animation: `motion-token-pulse ${value} var(--ease-out) infinite alternate`
        }
      }));
    }
    return /*#__PURE__*/React.createElement("span", {
      className: "t-mono",
      style: {
        fontSize: 10,
        color: "var(--brand-600)"
      }
    }, "\u0192");
  }
  if (type === "z-index") {
    return /*#__PURE__*/React.createElement("span", {
      className: "t-mono",
      style: {
        fontSize: 11,
        color: "var(--brand-600)"
      }
    }, value);
  }
  if (type === "type") {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: value.split(" ")[0],
        fontSize: 13,
        fontWeight: 600
      }
    }, "Aa");
  }
  return /*#__PURE__*/React.createElement("span", null);
};
const TokenIndexToolbar = ({
  query,
  setQuery,
  group,
  setGroup,
  counts,
  total
}) => /*#__PURE__*/React.createElement("div", {
  className: "ds-token-toolbar"
}, /*#__PURE__*/React.createElement("span", {
  className: "ds-search-input",
  style: {
    minWidth: 240
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.search,
  size: 14
}), /*#__PURE__*/React.createElement("input", {
  type: "text",
  placeholder: `Search ${total} tokens…`,
  value: query,
  onChange: e => setQuery(e.target.value),
  "aria-label": "Search tokens"
})), /*#__PURE__*/React.createElement("div", {
  className: "ds-token-pill-row",
  role: "tablist",
  "aria-label": "Token category"
}, TOKEN_GROUPS.map(g => /*#__PURE__*/React.createElement("button", {
  key: g.key,
  role: "tab",
  "aria-selected": group === g.key,
  className: `ds-token-pill ${group === g.key ? "is-active" : ""}`,
  onClick: () => setGroup(g.key)
}, g.label, /*#__PURE__*/React.createElement("span", {
  className: "count"
}, counts[g.key] || 0)))));
const TokenIndexSection = () => {
  const [query, setQuery] = React.useState("");
  const [group, setGroup] = React.useState("all");
  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOKEN_CATALOG.filter(([name, type, value, where]) => {
      if (group !== "all" && type !== group) return false;
      if (!q) return true;
      return name.toLowerCase().includes(q) || value.toLowerCase().includes(q) || where.toLowerCase().includes(q);
    });
  }, [query, group]);
  const counts = React.useMemo(() => {
    const c = {
      all: TOKEN_CATALOG.length
    };
    TOKEN_CATALOG.forEach(([, type]) => {
      c[type] = (c[type] || 0) + 1;
    });
    return c;
  }, []);

  // Group matches by type for display
  const grouped = React.useMemo(() => {
    const m = {};
    matches.forEach(t => {
      const type = t[1];
      if (!m[type]) m[type] = [];
      m[type].push(t);
    });
    return m;
  }, [matches]);
  const orderedTypes = ["color", "semantic", "type", "spacing", "radius", "shadow", "motion", "z-index", "chart", "map"];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, `@keyframes motion-token-pulse { from { transform: translateX(0); } to { transform: translateX(40px); } }`), /*#__PURE__*/React.createElement("div", {
    className: "subsection",
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "subsection-title"
  }, "Why this exists"), /*#__PURE__*/React.createElement("p", {
    className: "subsection-desc",
    style: {
      maxWidth: 820
    }
  }, "One searchable list of every CSS variable in the system \u2014 what it is, what it's worth, and where it's used. The fastest answer to \"what's the token for X\" without flipping between Foundations chapters. The whole inventory below renders directly from the token catalog; filter by category or search by name, value, or use-case.")), /*#__PURE__*/React.createElement(TokenIndexToolbar, {
    query: query,
    setQuery: setQuery,
    group: group,
    setGroup: setGroup,
    counts: counts,
    total: TOKEN_CATALOG.length
  }), matches.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "ds-token-empty"
  }, "No tokens match ", /*#__PURE__*/React.createElement("strong", null, query), ". Try the category pills above or clear the search."), orderedTypes.map(type => {
    const rows = grouped[type];
    if (!rows || rows.length === 0) return null;
    const groupLabel = TOKEN_GROUPS.find(g => g.key === type)?.label ?? type;
    return /*#__PURE__*/React.createElement("div", {
      key: type,
      className: "ds-token-group"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ds-token-group-head"
    }, /*#__PURE__*/React.createElement("h4", null, groupLabel), /*#__PURE__*/React.createElement("span", {
      className: "count"
    }, rows.length, " ", rows.length === 1 ? "token" : "tokens")), /*#__PURE__*/React.createElement("div", null, rows.map(([name, t, value, where]) => /*#__PURE__*/React.createElement("div", {
      key: name,
      className: "ds-token-list-row",
      "data-copy": name,
      "data-copy-label": `Copy ${name}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "preview"
    }, /*#__PURE__*/React.createElement(TokenPreview, {
      type: t,
      value: value
    })), /*#__PURE__*/React.createElement("code", null, name), /*#__PURE__*/React.createElement("span", {
      className: "value"
    }, value), /*#__PURE__*/React.createElement("span", {
      className: "where"
    }, where)))));
  }), /*#__PURE__*/React.createElement("div", {
    className: "callout",
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement("strong", null, "This index is the contract."), " If a token is in here, it ships in the system and engineers can rely on it. If it's not in here, it doesn't exist \u2014 module-local values get rejected at lint."));
};
window.TokenIndexSection = TokenIndexSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-token-index.jsx", error: String((e && e.message) || e) }); }

// section-voice.jsx
try { (() => {
/* Section — Voice & terminology */

const VoicePrinciples = () => /*#__PURE__*/React.createElement("div", {
  className: "grid-3"
}, [["Direct", "Operators are scanning under time pressure. One sentence beats two. Lead with the action or the consequence — not with throat-clearing."], ["Specific", "\"Failed\" is not enough. \"Couldn't fetch vessel — connection timed out after 30 s\" is. Names beat pronouns; numbers beat adjectives."], ["Respectful", "Never blame the user. \"Required\" not \"You forgot…\". Skytek's tone is a calm colleague, not a panicked alert."], ["Consistent", "Same noun for the same thing on every screen. \"Vessel\" everywhere, never \"ship\" in one place and \"vessel\" in another."], ["Plain", "No marketing copy in product UI. No exclamation points. No \"oops\". No emoji. Jargon is OK when it's the right word."], ["Honest", "If we don't know, we say so. If it's slow, we tell the user. Loading more than 3 s shows progress; failing surfaces the cause."]].map(([t, d]) => /*#__PURE__*/React.createElement("div", {
  key: t,
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, t)), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.55,
    color: "var(--text-secondary)"
  }
}, d))));
const VerbConventions = () => /*#__PURE__*/React.createElement("div", {
  className: "panel"
}, [["Save", "Persist current form state. Reversible (Undo within 8 s). Use on long forms where intermediate state matters."], ["Apply", "Commit a transient configuration (filters, layout, view). No round-trip to the server implied."], ["Update", "Modify an existing record. Use on detail pages where the user is the obvious editor. Prefer over \"Save\" for inline edits."], ["Create", "Make a new top-level entity: a portfolio, a rule set, an organization."], ["Add", "Insert into a list or selection: \"Add vessel to portfolio\", \"Add filter\". Reciprocal of Remove."], ["Remove", "Take out of a list. Reversible. Reciprocal of Add."], ["Delete", "Destroy a record. Confirmation required. Never reversible without an audit trail."], ["Archive", "Hide from active views. Reversible via Restore."], ["Acknowledge", "Mark an alert as seen. Doesn't resolve the underlying issue."], ["Resolve", "Close an alert because the situation is over. Pairs with a reason code."], ["Cancel", "Abandon the current action. Always destructive of unsaved state. Pair with Close on modals only when both make sense."], ["Close", "Dismiss without action. Used on read-only modals and toasts."]].map(([verb, desc]) => /*#__PURE__*/React.createElement("div", {
  key: verb,
  className: "ds-verb-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "verb"
}, verb), /*#__PURE__*/React.createElement("div", {
  className: "desc"
}, desc.split(/(?<=^|\s)("[^"]+")/).map((p, i) => p.startsWith('"') ? /*#__PURE__*/React.createElement("em", {
  key: i
}, p) : /*#__PURE__*/React.createElement(React.Fragment, {
  key: i
}, p))))));
const ErrorTemplate = () => /*#__PURE__*/React.createElement("div", {
  className: "grid-2",
  style: {
    alignItems: "flex-start"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Template")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "grid",
    gridTemplateColumns: "70px 1fr",
    gap: 8,
    alignItems: "baseline"
  }
}, /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--text-primary)"
  }
}, "What"), /*#__PURE__*/React.createElement("span", {
  style: {
    color: "var(--text-secondary)"
  }
}, "Name the failed action."), /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--text-primary)"
  }
}, "Why"), /*#__PURE__*/React.createElement("span", {
  style: {
    color: "var(--text-secondary)"
  }
}, "The cause, in the user's language. Never an error code as the only detail."), /*#__PURE__*/React.createElement("strong", {
  style: {
    color: "var(--text-primary)"
  }
}, "How"), /*#__PURE__*/React.createElement("span", {
  style: {
    color: "var(--text-secondary)"
  }
}, "The next action the user can take. Always present, even if it's \"Retry\".")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "In practice")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-alert ds-alert--danger",
  style: {
    margin: 0
  }
}, /*#__PURE__*/React.createElement(Icon, {
  d: I.alert,
  size: 20,
  className: "ds-alert-icon"
}), /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-body"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-alert-title"
}, "Couldn't update policy notes"), "Save failed because another user updated this policy 12 s ago. Refresh to see the latest version, then re-apply your changes.")), /*#__PURE__*/React.createElement("p", {
  className: "t-caption",
  style: {
    marginTop: 12,
    marginBottom: 0
  }
}, "Title = ", /*#__PURE__*/React.createElement("strong", null, "what"), ". First sentence = ", /*#__PURE__*/React.createElement("strong", null, "why"), ". Last sentence = ", /*#__PURE__*/React.createElement("strong", null, "how"), ". Reference code (if needed) goes on a second line, monospace, muted."))));
const VoiceComparisons = () => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  }
}, [{
  bad: "Oops! Something went wrong. Please try again later. 😞",
  good: "Couldn't load vessel positions. The AIS feed timed out. Retry."
}, {
  bad: "Are you sure you want to delete this? This action cannot be undone.",
  good: "Delete the Black Sea portfolio? 38 vessels will be moved to Unassigned. This is permanent."
}, {
  bad: "Success! Your changes have been saved successfully.",
  good: "Policy notes updated · 14:32 UTC."
}, {
  bad: "No items match your search criteria. Please modify your search.",
  good: "No vessels match these filters. Try widening the date range or removing the flag filter."
}, {
  bad: "Warning! High-risk vessel detected!!!",
  good: "Sanctioned · Vessel matches OFAC SDN list as of 09:14 UTC."
}].map((row, i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  className: "ds-voice-pair"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-voice-bubble ds-voice-bubble--bad"
}, /*#__PURE__*/React.createElement("div", {
  className: "lbl"
}, "Avoid"), row.bad), /*#__PURE__*/React.createElement("div", {
  className: "ds-voice-bubble ds-voice-bubble--good"
}, /*#__PURE__*/React.createElement("div", {
  className: "lbl"
}, "Prefer"), row.good))));
const Terminology = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Use"), /*#__PURE__*/React.createElement("th", null, "Not"), /*#__PURE__*/React.createElement("th", null, "Notes"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Vessel")), /*#__PURE__*/React.createElement("td", null, "Ship, boat, craft"), /*#__PURE__*/React.createElement("td", null, "Maritime asset across the product. \"Ship\" only appears in the IMO ship-type taxonomy.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Aircraft")), /*#__PURE__*/React.createElement("td", null, "Plane, jet"), /*#__PURE__*/React.createElement("td", null, "Aviation asset. \"Plane\" reserved for icon alias.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Asset")), /*#__PURE__*/React.createElement("td", null, "Object, entity, thing"), /*#__PURE__*/React.createElement("td", null, "Top-level term covering vessel, aircraft, offshore installation, property.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Policy")), /*#__PURE__*/React.createElement("td", null, "Cover, contract, insurance"), /*#__PURE__*/React.createElement("td", null, "The insurance instrument. \"Cover\" only in legacy report templates being phased out.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Exposure")), /*#__PURE__*/React.createElement("td", null, "Risk amount, sum insured, TSI"), /*#__PURE__*/React.createElement("td", null, "The monetary value at risk. Domain-standard.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Sanctioned")), /*#__PURE__*/React.createElement("td", null, "Banned, blacklisted, restricted"), /*#__PURE__*/React.createElement("td", null, "Specifically: appears on OFAC / UK / EU / UN sanctions lists. Don't use as a general adjective.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Watchlist")), /*#__PURE__*/React.createElement("td", null, "Flagged, marked, monitored"), /*#__PURE__*/React.createElement("td", null, "User-curated list of assets under elevated scrutiny.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Portfolio")), /*#__PURE__*/React.createElement("td", null, "Book, collection, group"), /*#__PURE__*/React.createElement("td", null, "Underwriter-defined grouping of policies.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Region")), /*#__PURE__*/React.createElement("td", null, "Area, territory, zone"), /*#__PURE__*/React.createElement("td", null, "Geographic grouping. \"Area\" reserved for sub-region inside a region.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Alert")), /*#__PURE__*/React.createElement("td", null, "Notification, warning, event"), /*#__PURE__*/React.createElement("td", null, "An actionable signal. \"Notification\" is the system-wide bell-icon delivery channel.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Acknowledged")), /*#__PURE__*/React.createElement("td", null, "Seen, viewed, read"), /*#__PURE__*/React.createElement("td", null, "Specifically: a user marked the alert as seen.")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "Rating")), /*#__PURE__*/React.createElement("td", null, "Score, grade, rank"), /*#__PURE__*/React.createElement("td", null, "A\u2013E PSC compliance rating. Reserved noun \u2014 not generic."))));
const CaseRules = () => /*#__PURE__*/React.createElement("div", {
  className: "grid-2"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Sentence case \xB7 UI")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("p", {
  style: {
    marginTop: 0
  }
}, "Everything operator-facing: buttons, menu items, page titles, section headings, form labels, empty states, error copy."), /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, "\"Add vessel to portfolio\" \u2014 not \"Add Vessel To Portfolio\""), /*#__PURE__*/React.createElement("li", null, "\"Sanctioned vessels\" \u2014 proper-noun \"Sanctioned\" stays cap"), /*#__PURE__*/React.createElement("li", null, "\"Last seen\" \u2014 not \"Last Seen\"")))), /*#__PURE__*/React.createElement("div", {
  className: "ds-card"
}, /*#__PURE__*/React.createElement("div", {
  className: "ds-card-head"
}, /*#__PURE__*/React.createElement("h3", {
  className: "ds-card-title"
}, "Title case \xB7 proper nouns & reports")), /*#__PURE__*/React.createElement("div", {
  className: "ds-card-body",
  style: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "var(--text-secondary)"
  }
}, /*#__PURE__*/React.createElement("p", {
  style: {
    marginTop: 0
  }
}, "Product names, module names, exported reports, formal documents."), /*#__PURE__*/React.createElement("ul", {
  style: {
    margin: 0,
    paddingLeft: 18
  }
}, /*#__PURE__*/React.createElement("li", null, "\"Skytek Real World\", \"Marine Dashboard\""), /*#__PURE__*/React.createElement("li", null, "\"Q1 2026 Sanctions Exposure Report\""), /*#__PURE__*/React.createElement("li", null, "\"OFAC SDN List\", \"Marshall Islands Flag Authority\"")))));
const NumberStyle = () => /*#__PURE__*/React.createElement("table", {
  className: "spec-table"
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Case"), /*#__PURE__*/React.createElement("th", null, "Style"), /*#__PURE__*/React.createElement("th", null, "Example"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "In prose, < 10"), /*#__PURE__*/React.createElement("td", null, "Spell out"), /*#__PURE__*/React.createElement("td", null, "\"Three vessels were updated.\"")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "In prose, \u2265 10"), /*#__PURE__*/React.createElement("td", null, "Numerals"), /*#__PURE__*/React.createElement("td", null, "\"23 vessels were updated.\"")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "In UI labels, any value"), /*#__PURE__*/React.createElement("td", null, "Numerals"), /*#__PURE__*/React.createElement("td", null, "\"7 active alerts\"")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Start of sentence"), /*#__PURE__*/React.createElement("td", null, "Spell out OR rewrite"), /*#__PURE__*/React.createElement("td", null, "\"Twelve vessels\u2026\" OR \"We updated 12 vessels\u2026\"")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Units & measurements"), /*#__PURE__*/React.createElement("td", null, "Numerals + non-breaking space"), /*#__PURE__*/React.createElement("td", null, "\"12.4 kn\", \"248 nm\" \u2014 see Formatting chapter")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Money"), /*#__PURE__*/React.createElement("td", null, "Numerals + symbol"), /*#__PURE__*/React.createElement("td", null, "\"$2.4M\" tile, \"$2,400,000\" table")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "Time"), /*#__PURE__*/React.createElement("td", null, "Numerals + zone"), /*#__PURE__*/React.createElement("td", null, "\"14:32 UTC\" \u2014 never \"two thirty\""))));
const VoiceSection = () => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
  className: "subsection",
  style: {
    marginTop: 0
  }
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Why this chapter"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc",
  style: {
    maxWidth: 820
  }
}, "Words are the smallest tokens in the system, and the most often duplicated. A \"Save\" button on one screen and an \"Update\" button on another are the same UI inconsistency as two button shades of blue. This chapter is the vocabulary \u2014 verbs, nouns, tone, and the rules that hold them together.")), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Tone \u2014 six principles"), /*#__PURE__*/React.createElement(VoicePrinciples, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Voice in practice"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Same situation, two voices. The right side is the one we ship."), /*#__PURE__*/React.createElement(VoiceComparisons, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Button verbs"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Twelve verbs cover the product. If you reach for a thirteenth, propose it via RFC \u2014 most \"new verb\" needs map to one of these."), /*#__PURE__*/React.createElement(VerbConventions, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Error message template"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "Every user-facing error answers three questions, in this order: ", /*#__PURE__*/React.createElement("strong", null, "what"), " failed, ", /*#__PURE__*/React.createElement("strong", null, "why"), ", and ", /*#__PURE__*/React.createElement("strong", null, "how"), " to proceed."), /*#__PURE__*/React.createElement(ErrorTemplate, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Terminology glossary"), /*#__PURE__*/React.createElement("p", {
  className: "subsection-desc"
}, "The canonical noun for every recurring domain concept. PRs that introduce a synonym are blocked at review."), /*#__PURE__*/React.createElement(Terminology, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Capitalization"), /*#__PURE__*/React.createElement(CaseRules, null)), /*#__PURE__*/React.createElement("div", {
  className: "subsection"
}, /*#__PURE__*/React.createElement("h3", {
  className: "subsection-title"
}, "Numbers in copy"), /*#__PURE__*/React.createElement(NumberStyle, null)), /*#__PURE__*/React.createElement("div", {
  className: "callout"
}, /*#__PURE__*/React.createElement("strong", null, "The principle:"), " if a designer and an engineer write the same string for the same situation, the system worked. Vocabulary is part of the API."));
window.VoiceSection = VoiceSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "section-voice.jsx", error: String((e && e.message) || e) }); }

// tweaks-panel.jsx
try { (() => {
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-noncommentable": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;

  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}
function TweakColor({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
    type: "color",
    className: "twk-swatch",
    value: value,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "tweaks-panel.jsx", error: String((e && e.message) || e) }); }

})();
