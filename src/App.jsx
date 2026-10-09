import React, { useState, useEffect, useMemo } from 'react';
import coursesData from './courses.json';
import { Search, GraduationCap, DollarSign, Award, CheckCircle, Share2, Filter, AlertCircle, Sidebar, Maximize2, Globe, Sparkles, Building2, Clock, RefreshCw } from 'lucide-react';

// Default / Fallback Benchmark FX Rates
const DEFAULT_RATES = {
  USD: { rate: 1, symbol: '$', label: 'USD ($)', isLakh: false },
  INR: { rate: 96.7, symbol: '₹', label: 'INR (₹ Lakhs)', isLakh: true },
  EUR: { rate: 0.89, symbol: '€', label: 'EUR (€)', isLakh: false },
  GBP: { rate: 0.75, symbol: '£', label: 'GBP (£)', isLakh: false },
};

export default function App() {
  const [profile, setProfile] = useState({
    country: 'All',
    maxTotalBudgetUSD: 45000,
    field: 'Computer Science',
    gpa: 3.0,
    ielts: 6.5,
    hasGre: false,
  });

  const [rates, setRates] = useState(DEFAULT_RATES);
  const [currency, setCurrency] = useState('USD');
  const [isLiveFx, setIsLiveFx] = useState(false);
  const [budgetFlex, setBudgetFlex] = useState(false);
  const [waiveGRE, setWaiveGRE] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shortlist, setShortlist] = useState([]);
  const [copied, setCopied] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  // FETCH LIVE MARKET EXCHANGE RATES ON APP LOAD
  useEffect(() => {
    async function fetchLiveExchangeRates() {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data && data.rates) {
          setRates({
            USD: { rate: 1, symbol: '$', label: 'USD ($)', isLakh: false },
            INR: { rate: data.rates.INR || 96.7, symbol: '₹', label: 'INR (₹ Lakhs)', isLakh: true },
            EUR: { rate: data.rates.EUR || 0.89, symbol: '€', label: 'EUR (€)', isLakh: false },
            GBP: { rate: data.rates.GBP || 0.75, symbol: '£', label: 'GBP (£)', isLakh: false },
          });
          setIsLiveFx(true);
        }
      } catch (err) {
        console.warn('Using fallback exchange rates:', err);
      }
    }
    fetchLiveExchangeRates();
  }, []);

  const curr = rates[currency] || DEFAULT_RATES[currency];

  const formatPrice = (usdAmount) => {
    const converted = usdAmount * curr.rate;
    if (curr.isLakh) {
      return `${curr.symbol}${(converted / 100000).toFixed(2)} Lakhs`;
    }
    return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
  };

  const effectiveBudgetUSD = useMemo(() => {
    return budgetFlex ? profile.maxTotalBudgetUSD * 1.1 : profile.maxTotalBudgetUSD;
  }, [profile.maxTotalBudgetUSD, budgetFlex]);

  const filteredCourses = useMemo(() => {
    return coursesData.filter((course) => {
      const totalCostUSD = course.tuitionFeesUSD + course.livingCostUSD;

      if (profile.country !== 'All' && course.country !== profile.country) return false;
      if (profile.field !== 'All' && course.field !== profile.field) return false;
      if (totalCostUSD > effectiveBudgetUSD) return false;
      if (course.minIELTS > profile.ielts) return false;
      if (course.greRequired && !profile.hasGre && !waiveGRE) return false;
      if (
        searchQuery &&
        !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !course.university.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [profile, effectiveBudgetUSD, waiveGRE, searchQuery]);

  const getRationale = (course) => {
    const totalCostUSD = course.tuitionFeesUSD + course.livingCostUSD;
    const reasons = [];

    if (totalCostUSD <= profile.maxTotalBudgetUSD) {
      reasons.push(`Total cost (${formatPrice(totalCostUSD)}/yr) is 100% within student budget (${formatPrice(profile.maxTotalBudgetUSD)})`);
    } else if (totalCostUSD <= effectiveBudgetUSD) {
      reasons.push(`Total cost matches extended budget flex (+10% buffer)`);
    }
    if (profile.gpa >= course.minGPA) {
      reasons.push(`GPA (${profile.gpa}) meets academic requirement (${course.minGPA})`);
    }
    if (!course.greRequired) {
      reasons.push(`No GRE required for admission`);
    } else if (waiveGRE) {
      reasons.push(`GRE requirement overridden via counsellor waiver`);
    }
    return reasons;
  };

  const toggleShortlist = (course) => {
    if (shortlist.some((item) => item.id === course.id)) {
      setShortlist(shortlist.filter((item) => item.id !== course.id));
    } else {
      setShortlist([...shortlist, course]);
    }
  };

  const exportSummary = () => {
    if (shortlist.length === 0) return;
    const summaryText = shortlist
      .map((c, idx) => {
        const total = c.tuitionFeesUSD + c.livingCostUSD;
        return `${idx + 1}. ${c.title} - ${c.university} (${c.country})\n   • Tuition Fee: ${formatPrice(c.tuitionFeesUSD)}/yr\n   • Living Expenses: ~${formatPrice(c.livingCostUSD)}/yr\n   • TOTAL COST: ${formatPrice(total)}/yr\n   • Intake: ${c.intake} | Visa: ${c.workVisaYears} Years\n`;
      })
      .join('\n');

    const textToCopy = `======================================\nGRADGUIDE RECOMMENDED COURSE SHORTLIST\n======================================\n\n${summaryText}\nGenerated by GradGuide Counselling Platform.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div style={{ ...styles.wrapper, maxWidth: compactMode ? '430px' : '1240px' }}>
      {/* HEADER */}
      <header style={styles.appHeader}>
        <div style={styles.brandGroup}>
          <div style={styles.logoIcon}><GraduationCap color="#ffffff" size={20} /></div>
          <div>
            <h1 style={styles.brandTitle}>GradGuide Workspace</h1>
            <p style={styles.brandSubtitle}>Counsellor Decision Support Assistant</p>
          </div>
        </div>

        <div style={styles.headerActions}>
          {/* LIVE FX BADGE */}
          <span style={{ ...styles.fxBadge, backgroundColor: isLiveFx ? '#dcfce7' : '#fef3c7', color: isLiveFx ? '#15803d' : '#b45309' }}>
            {isLiveFx ? '● Live FX Rates Active' : '● Benchmark FX Active'}
          </span>

          <div style={styles.currencyPill}>
            <Globe size={14} color="#64748b" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={styles.currencySelect}
            >
              {Object.keys(rates).map((c) => (
                <option key={c} value={c}>{rates[c].label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setCompactMode(!compactMode)}
            style={styles.dockBtn}
          >
            {compactMode ? <Maximize2 size={14} /> : <Sidebar size={14} />}
            <span>{compactMode ? 'Expand' : 'Meet Dock'}</span>
          </button>
        </div>
      </header>

      {/* MAIN GRID */}
      <div style={{ ...styles.grid, gridTemplateColumns: compactMode ? '1fr' : '320px 1fr' }}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <Filter size={16} color="#2563eb" />
            <h3 style={styles.sidebarTitle}>Student Profile</h3>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Target Country</label>
            <select
              style={styles.selectInput}
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
            >
              <option value="All">All Study Destinations</option>
              <option value="USA">United States (USA)</option>
              <option value="UK">United Kingdom (UK)</option>
              <option value="Canada">Canada</option>
              <option value="Germany">Germany</option>
              <option value="Australia">Australia</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Domain / Field</label>
            <select
              style={styles.selectInput}
              value={profile.field}
              onChange={(e) => setProfile({ ...profile, field: e.target.value })}
            >
              <option value="All">All Fields</option>
              <option value="Computer Science">Computer Science & Tech</option>
              <option value="Business">Business & Management</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={styles.fieldLabel}>Max Total Cost (Tuition + Living)</label>
              <span style={styles.budgetValue}>{formatPrice(profile.maxTotalBudgetUSD)}</span>
            </div>
            <input
              type="range"
              min="15000"
              max="70000"
              step="2000"
              value={profile.maxTotalBudgetUSD}
              onChange={(e) => setProfile({ ...profile, maxTotalBudgetUSD: Number(e.target.value) })}
              style={styles.slider}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>GPA Score</label>
              <input
                type="number"
                step="0.1"
                style={styles.textInput}
                value={profile.gpa}
                onChange={(e) => setProfile({ ...profile, gpa: Number(e.target.value) })}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>IELTS Score</label>
              <input
                type="number"
                step="0.5"
                style={styles.textInput}
                value={profile.ielts}
                onChange={(e) => setProfile({ ...profile, ielts: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.sectionHeader}>
            <Sparkles size={15} color="#d97706" />
            <span style={styles.sectionTitle}>Live Objection Handlers</span>
          </div>

          <label style={styles.toggleRow}>
            <input
              type="checkbox"
              checked={budgetFlex}
              onChange={(e) => setBudgetFlex(e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.toggleText}>Flex Budget (+10% Buffer)</span>
          </label>

          <label style={styles.toggleRow}>
            <input
              type="checkbox"
              checked={waiveGRE}
              onChange={(e) => setWaiveGRE(e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.toggleText}>Show GRE-Waived Programs</span>
          </label>

          <div style={styles.shortlistCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Active Shortlist</span>
              <span style={styles.countBadge}>{shortlist.length} Selected</span>
            </div>
            <button
              onClick={exportSummary}
              disabled={shortlist.length === 0}
              style={{
                ...styles.exportBtn,
                backgroundColor: shortlist.length > 0 ? '#2563eb' : '#cbd5e1',
                cursor: shortlist.length > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              <Share2 size={14} />
              <span>{copied ? 'Summary Copied!' : 'Copy Summary for Student'}</span>
            </button>
          </div>
        </aside>

        {/* RESULTS FEED */}
        <main>
          <div style={styles.searchBar}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by course title, university, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.resultsInfo}>
            <span style={styles.resultsCount}>
              Showing <strong>{filteredCourses.length}</strong> verified recommendations
            </span>
            {budgetFlex && <span style={styles.flexPill}>Flex Budget Active</span>}
          </div>

          {filteredCourses.length === 0 ? (
            <div style={styles.emptyCard}>
              <AlertCircle size={36} color="#94a3b8" />
              <p style={{ margin: '10px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                No courses match these constraints. Try adjusting the total budget slider or toggling "Flex Budget".
              </p>
            </div>
          ) : (
            <div style={styles.cardsList}>
              {filteredCourses.map((course) => {
                const isShortlisted = shortlist.some((item) => item.id === course.id);
                const totalCostUSD = course.tuitionFeesUSD + course.livingCostUSD;
                const rationale = getRationale(course);

                return (
                  <div key={course.id} style={styles.courseCard}>
                    <div style={{ flex: 1 }}>
                      <div style={styles.tagRow}>
                        <span style={styles.countryTag}>{course.country}</span>
                        <span style={styles.intakeTag}><Clock size={10} /> {course.intake}</span>
                        <span style={styles.durationTag}>{course.duration}</span>
                      </div>

                      <h3 style={styles.courseName}>{course.title}</h3>
                      <div style={styles.univRow}>
                        <Building2 size={14} color="#64748b" />
                        <span>{course.university}</span>
                      </div>

                      <div style={styles.metricsGrid}>
                        <div style={styles.metricItem}>
                          <span style={styles.metricLabel}>Tuition Fee</span>
                          <span style={styles.metricValue}>{formatPrice(course.tuitionFeesUSD)}/yr</span>
                        </div>
                        <div style={styles.metricItem}>
                          <span style={styles.metricLabel}>Est. Living Cost</span>
                          <span style={styles.metricValue}>~{formatPrice(course.livingCostUSD)}/yr</span>
                        </div>
                        <div style={styles.metricItemHighlight}>
                          <span style={styles.metricLabelHighlight}>TOTAL ANNUAL COST</span>
                          <span style={styles.metricValueHighlight}>{formatPrice(totalCostUSD)}/yr</span>
                        </div>
                        <div style={styles.metricItem}>
                          <span style={styles.metricLabel}>Visa & Eligibility</span>
                          <span style={styles.metricValue}>{course.workVisaYears} Yrs Visa | GPA {course.minGPA}</span>
                        </div>
                      </div>

                      <div style={styles.rationaleBox}>
                        <span style={styles.rationaleTitle}>Recommendation Rationale:</span>
                        <ul style={styles.rationaleList}>
                          {rationale.map((r, idx) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleShortlist(course)}
                      style={{
                        ...styles.shortlistBtn,
                        backgroundColor: isShortlisted ? '#16a34a' : '#ffffff',
                        color: isShortlisted ? '#ffffff' : '#2563eb',
                        border: `1px solid ${isShortlisted ? '#16a34a' : '#2563eb'}`,
                      }}
                    >
                      {isShortlisted ? <CheckCircle size={15} /> : '+ Shortlist'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { fontFamily: 'Inter, system-ui, -apple-system, sans-serif', margin: '0 auto', padding: '20px', color: '#0f172a' },
  appHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: '20px' },
  brandGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoIcon: { backgroundColor: '#2563eb', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' },
  brandTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' },
  brandSubtitle: { margin: 0, fontSize: '12px', color: '#64748b' },
  headerActions: { display: 'flex', gap: '10px', alignItems: 'center' },
  fxBadge: { fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' },
  currencyPill: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '8px' },
  currencySelect: { border: 'none', backgroundColor: 'transparent', fontSize: '13px', fontWeight: '600', color: '#334155', outline: 'none', cursor: 'pointer' },
  dockBtn: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  grid: { display: 'grid', gap: '20px' },
  sidebar: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
  sidebarTitle: { margin: 0, fontSize: '15px', fontWeight: '700' },
  fieldGroup: { marginBottom: '14px' },
  fieldLabel: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' },
  selectInput: { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#0f172a', outline: 'none' },
  textInput: { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' },
  budgetValue: { fontSize: '13px', fontWeight: '700', color: '#2563eb' },
  slider: { width: '100%', accentColor: '#2563eb', cursor: 'pointer' },
  divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '16px 0' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' },
  sectionTitle: { fontSize: '13px', fontWeight: '700', color: '#0f172a' },
  toggleRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', marginBottom: '8px', cursor: 'pointer' },
  checkbox: { accentColor: '#2563eb', width: '15px', height: '15px' },
  toggleText: { fontSize: '12px' },
  shortlistCard: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px', marginTop: '16px' },
  countBadge: { backgroundColor: '#e0e7ff', color: '#3730a3', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' },
  exportBtn: { width: '100%', padding: '9px', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '12px', marginBottom: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#0f172a' },
  resultsInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' },
  resultsCount: { fontSize: '13px', color: '#64748b' },
  flexPill: { backgroundColor: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' },
  emptyCard: { textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' },
  cardsList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  courseCard: { display: 'flex', justifyContent: 'space-between', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '18px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', gap: '16px' },
  tagRow: { display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' },
  countryTag: { backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' },
  intakeTag: { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' },
  durationTag: { backgroundColor: '#f8fafc', color: '#64748b', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' },
  courseName: { margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' },
  univRow: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', marginBottom: '12px' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px' },
  metricItem: { display: 'flex', flexDirection: 'column' },
  metricItemHighlight: { display: 'flex', flexDirection: 'column', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' },
  metricLabel: { fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' },
  metricLabelHighlight: { fontSize: '10px', color: '#1e40af', textTransform: 'uppercase', fontWeight: '700' },
  metricValue: { fontSize: '12px', fontWeight: '700', color: '#0f172a' },
  metricValueHighlight: { fontSize: '12px', fontWeight: '800', color: '#1d4ed8' },
  rationaleBox: { backgroundColor: '#f0fdf4', borderLeft: '3px solid #16a34a', padding: '8px 12px', borderRadius: '0 6px 6px 0' },
  rationaleTitle: { fontSize: '11px', fontWeight: '700', color: '#15803d', display: 'block', marginBottom: '3px' },
  rationaleList: { margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#166534' },
  shortlistBtn: { padding: '8px 14px', borderRadius: '8px', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', height: 'fit-content', cursor: 'pointer', transition: 'all 0.2s' }
};