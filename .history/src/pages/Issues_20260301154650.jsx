import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Issues.css";

import {
  Box,
  Pagination,
  Breadcrumbs,
  Link,
  Typography,
  Chip
} from "@mui/material";

import { ChevronRight } from "lucide-react";

const SEVERITIES = ["BLOCKER", "CRITICAL", "MAJOR", "MINOR"];
const QUALITIES = ["Security", "Reliability", "Maintainability"];

const Issues = () => {
  const navigate = useNavigate();
const projectKey = "auto-project-4c02e6cd-4aca-46c2-bad9-9c87643fdb22";

  const itemsPerPage = 10;

  /* ================= STATE ================= */

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedSeverities, setSelectedSeverities] = useState([]);
  const [selectedRules, setSelectedRules] = useState([]);
  const [selectedQualities, setSelectedQualities] = useState([]);

  const [page, setPage] = useState(1);

  const [ruleSearch, setRuleSearch] = useState("");
  const [allRules, setAllRules] = useState([]);

  const [stableSeverityCounts, setStableSeverityCounts] = useState({});
  const [stableQualityCounts, setStableQualityCounts] = useState({});
  const [stableRuleCounts, setStableRuleCounts] = useState({});

  const [ruleOpen, setRuleOpen] = useState(true);
  const [severityOpen, setSeverityOpen] = useState(true);
  const [qualityOpen, setQualityOpen] = useState(true);

  /* ================= PARAM BUILDER ================= */

  const buildParams = ({
    severities = selectedSeverities,
    qualities = selectedQualities,
    rules = selectedRules
  }) => {
    const params = new URLSearchParams();

    qualities.forEach(q =>
      params.append("softwareQualities", q)
    );

    severities.forEach(s =>
      params.append("severities", s)
    );

    rules.forEach(r =>
      params.append("rules", r)
    );

    params.append("page", page);
    params.append("pageSize", itemsPerPage);

    return params.toString();
  };

  /* ================= FETCH LOGIC ================= */

  useEffect(() => {
    if (!projectKey) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        const baseUrl =
          `http://localhost:8080/api/scan/${encodeURIComponent(projectKey)}/issues`;

        const [
          mainRes,
          severityRes,
          qualityRes,
          ruleRes
        ] = await Promise.all([
          fetch(`${baseUrl}?${buildParams({})}`),

          fetch(
            `${baseUrl}?${buildParams({
              severities: []
            })}`
          ),

          fetch(
            `${baseUrl}?${buildParams({
              qualities: []
            })}`
          ),

          fetch(
            `${baseUrl}?${buildParams({
              rules: []
            })}`
          )
        ]);

        if (
          !mainRes.ok ||
          !severityRes.ok ||
          !qualityRes.ok ||
          !ruleRes.ok
        ) {
          throw new Error("One or more API calls failed");
        }

        const mainData = await mainRes.json();
        const sevData = await severityRes.json();
        const qualData = await qualityRes.json();
        const ruleData = await ruleRes.json();

        setData(mainData);

        setStableSeverityCounts(
          sevData?.filterCounts?.severityCounts || {}
        );

        setStableQualityCounts(
          qualData?.filterCounts?.qualityCounts || {}
        );

        const safeRuleCounts =
          ruleData?.filterCounts?.ruleCounts || {};

        setStableRuleCounts(safeRuleCounts);
        setAllRules(Object.keys(safeRuleCounts));

      } catch (err) {
        console.error("Error fetching issues:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [
    projectKey,
    selectedQualities,
    selectedSeverities,
    selectedRules,
    page
  ]);

  /* ================= DERIVED ================= */

  const visibleRules = allRules.filter(rule =>
    rule.toLowerCase().includes(ruleSearch.toLowerCase())
  );

  const groupedIssues = useMemo(() => {
    if (!data?.content) return {};

    const grouped = {};

    data.content.forEach(group => {
      grouped[group.file] = group.issues;
    });

    return grouped;
  }, [data]);

  const totalPages = data?.totalPages || 0;

  /* ================= HANDLERS ================= */

  const toggleSeverity = sev => {
    setPage(1);
    setSelectedSeverities(prev =>
      prev.includes(sev)
        ? prev.filter(s => s !== sev)
        : [...prev, sev]
    );
  };

  const toggleRule = rule => {
    setPage(1);
    setSelectedRules(prev =>
      prev.includes(rule)
        ? prev.filter(r => r !== rule)
        : [...prev, rule]
    );
  };

  const toggleQuality = q => {
    setPage(1);
    setSelectedQualities(prev =>
      prev.includes(q)
        ? prev.filter(s => s !== q)
        : [...prev, q]
    );
  };

  const clearAllFilters = () => {
    setSelectedSeverities([]);
    setSelectedRules([]);
    setSelectedQualities([]);
    setRuleSearch("");
    setPage(1);
  };

  /* ================= UI ================= */

  return (
    <div>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs
          separator={<ChevronRight size={14} color="#94a3b8" />}
          sx={{ mb: 2 }}
        >
          <Link underline="hover" color="#64748b">
            Projects
          </Link>

          <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
            Issues Explorer
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Issues Explorer
        </Typography>

        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Manage and remediate code quality issues for{" "}
          <Chip
            label={projectKey}
            size="small"
            sx={{
              bgcolor: "#eff6ff",
              color: "#2563eb",
              fontWeight: 700,
              ml: 1
            }}
          />
        </Typography>
      </Box>

      <div className="layout">
        <div className="main">
          {/* ================= SIDEBAR ================= */}

          <div className="sidebar">
            <div className="filter-title">
              Filters
              <button className="clear" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>

            {/* SOFTWARE QUALITY */}

            <div className="section">
              <div
                className="section-header"
                onClick={() => setQualityOpen(prev => !prev)}
              >
                <span className={`chevron ${qualityOpen ? "open" : ""}`}>
                  <ChevronRight size={16} />
                </span>
                <span>Software Quality</span>
              </div>

              <div className={`collapse ${qualityOpen ? "open" : ""}`}>
                <div className="collapse-inner">
                  {QUALITIES.map(q => (
                    <div
                      key={q}
                      className={`row ${
                        selectedQualities.includes(q) ? "selected" : ""
                      }`}
                      onClick={() => toggleQuality(q)}
                    >
                      {q}
                      <span>{stableQualityCounts[q] ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RULE */}

            <div
              className="section-header"
              onClick={() => setRuleOpen(prev => !prev)}
            >
              <span className={`chevron ${ruleOpen ? "open" : ""}`}>
                <ChevronRight size={16} />
              </span>
              <span>Rule</span>
            </div>

            <div className={`collapse ${ruleOpen ? "open" : ""}`}>
              <div className="collapse-inner">
                <input
                  className="rule-search"
                  placeholder="Search rules..."
                  value={ruleSearch}
                  onChange={e => setRuleSearch(e.target.value)}
                />

                <div className="rule-list">
                  {visibleRules.map(rule => (
                    <div
                      key={rule}
                      className={`rule-item ${
                        selectedRules.includes(rule) ? "selected" : ""
                      }`}
                      onClick={() => toggleRule(rule)}
                    >
                      {rule}
                      <span>{stableRuleCounts[rule] ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SEVERITY */}

            <div
              className="section-header"
              onClick={() => setSeverityOpen(prev => !prev)}
            >
              <span className={`chevron ${severityOpen ? "open" : ""}`}>
                <ChevronRight size={16} />
              </span>
              <span>Severity</span>
            </div>

            <div className={`collapse ${severityOpen ? "open" : ""}`}>
              <div className="collapse-inner">
                {SEVERITIES.map(sev => (
                  <div
                    key={sev}
                    className={`row ${
                      selectedSeverities.includes(sev) ? "selected" : ""
                    }`}
                    onClick={() => toggleSeverity(sev)}
                  >
                    {sev.charAt(0) + sev.slice(1).toLowerCase()}
                    <span>{stableSeverityCounts[sev] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= ISSUES LIST ================= */}

          <div className="issues">
            <div className="issues-content">
              {Object.keys(groupedIssues).map(file => (
                <div key={file} className="file-group">
                  <div className="file-path">{file}</div>

                  {groupedIssues[file].map(issue => (
                    <div
                      key={issue.key}
                      className="issue-card"
                      onClick={() =>
                        navigate(
                          `/code-viewer/${projectKey}?issueKey=${issue.key}`
                        )
                      }
                    >
                      <div className="issue-main">
                        <div className="issue-title">
                          {issue.message}
                        </div>

                        <div className="badges-row">
                          <span className="type-badge">
                            {issue.softwareQuality}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {loading && (
              <div className="overlay-loader">
                <div className="spinner"></div>
              </div>
            )}

            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "center"
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Issues;