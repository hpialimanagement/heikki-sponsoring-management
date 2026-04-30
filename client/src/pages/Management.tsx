import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Management() {
  const { logout } = useAuth();

  useEffect(() => {
    // Inject CSS for the management page
    const styleId = "management-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        :root {
            --bg: #0d0f14;
            --surface: #151820;
            --surface2: #1c2030;
            --border: #252a3a;
            --accent: #4f7cff;
            --accent2: #a259ff;
            --accent3: #00e5a0;
            --danger: #ff4d6a;
            --warning: #ffb03a;
            --text: #e8ecf5;
            --text-muted: #7a849e;
            --text-dim: #3d4560;
            --green: #00c97a;
            --radius: 10px;
            --radius-lg: 16px;
        }

        .mgmt-body {
            font-family: 'DM Sans', sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .mgmt-body * { box-sizing: border-box; }

        /* ── SCROLLBAR ── */
        .mgmt-body ::-webkit-scrollbar { width: 6px; height: 6px; }
        .mgmt-body ::-webkit-scrollbar-track { background: var(--bg); }
        .mgmt-body ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

        /* DASHBOARD */
        #dashboardScreen {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        /* HEADER */
        .topbar {
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            padding: 0 28px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky; top: 0; z-index: 100;
        }

        .topbar-left {
            display: flex; align-items: center; gap: 14px;
        }

        .topbar-icon {
            width: 36px; height: 36px;
            background: linear-gradient(135deg, var(--accent), var(--accent2));
            border-radius: 9px;
            display: flex; align-items: center; justify-content: center;
            font-size: 17px;
        }

        .topbar-title {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 17px;
        }

        .topbar-title span {
            color: var(--text-muted);
            font-weight: 400;
            font-size: 14px;
            margin-left: 6px;
        }

        .topbar-right {
            display: flex; align-items: center; gap: 12px;
        }

        .topbar-user {
            font-size: 13px;
            color: var(--text-muted);
        }

        .btn-logout {
            background: var(--surface2);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            color: var(--text-muted);
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.2s;
        }

        .btn-logout:hover {
            border-color: var(--danger);
            color: var(--danger);
        }

        /* STATS STRIP */
        .stats-strip {
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            padding: 16px 28px;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .stat-pill {
            display: flex;
            align-items: center;
            gap: 10px;
            background: var(--surface2);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 10px 16px;
            flex: 1;
            min-width: 120px;
            transition: border-color 0.2s;
        }

        .stat-pill:hover { border-color: var(--accent); }

        .stat-dot {
            width: 8px; height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .stat-info { line-height: 1.2; }

        .stat-label {
            font-size: 11px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .stat-value {
            font-size: 18px;
            font-weight: 700;
            font-family: 'Syne', sans-serif;
        }

        /* MAIN CONTENT */
        .main-content {
            padding: 28px;
            flex: 1;
        }

        .toolbar {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
            align-items: center;
        }

        .search-wrap {
            position: relative;
            flex: 1;
        }

        .search-wrap svg {
            position: absolute;
            left: 12px; top: 50%;
            transform: translateY(-50%);
            width: 16px; height: 16px;
            color: var(--text-dim);
        }

        .search-wrap input {
            width: 100%;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 10px 12px 10px 38px;
            color: var(--text);
            font-family: inherit;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }

        .search-wrap input:focus { border-color: var(--accent); }

        .toolbar select {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 10px 12px;
            color: var(--text);
            font-family: inherit;
            font-size: 14px;
            outline: none;
            cursor: pointer;
        }

        .btn-add-sponsor {
            background: var(--accent);
            color: white;
            border: none;
            border-radius: var(--radius);
            padding: 10px 20px;
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .btn-add-sponsor:hover { opacity: 0.9; }

        /* TABLE */
        .table-wrap {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            overflow: hidden;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 14px;
        }

        th {
            background: var(--surface2);
            padding: 14px 20px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--border);
        }

        td {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
        }

        tr:last-child td { border-bottom: none; }

        tr:hover td { background: rgba(255,255,255,0.02); }

        .company-cell { font-weight: 600; color: var(--text); }
        .contact-cell { color: var(--text-muted); }
        .email-cell { color: var(--accent); text-decoration: none; }
        .email-cell:hover { text-decoration: underline; }

        .date-cell {
            color: var(--text-muted);
            font-size: 13px;
            white-space: nowrap;
        }

        /* STATUS BADGES */
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
        }

        .badge::before {
            content: '';
            width: 6px; height: 6px;
            border-radius: 50%;
            background: currentColor;
        }

        .badge-new       { background: rgba(79,124,255,0.12); color: #6b9aff; }
        .badge-preparing { background: rgba(255,176,58,0.12); color: #ffc05a; }
        .badge-sent      { background: rgba(162,89,255,0.12); color: #bf82ff; }
        .badge-reply     { background: rgba(0,201,122,0.12);  color: #00e07a; }
        .badge-reject    { background: rgba(255,77,106,0.12); color: #ff6b85; }
        .badge-accept    { background: rgba(0,229,160,0.12);  color: #00e5a0; }

        .actions { display: flex; gap: 6px; }

        .btn-action {
            padding: 6px 12px;
            border-radius: 6px;
            border: 1px solid var(--border);
            background: var(--surface2);
            color: var(--text-muted);
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.15s;
        }

        .btn-action:hover { border-color: var(--accent); color: var(--accent); }
        .btn-action.del:hover { border-color: var(--danger); color: var(--danger); }

        @media (max-width: 720px) {
            .topbar { padding: 0 16px; }
            .stats-strip { padding: 14px 16px; }
            .main-content { padding: 16px; }
            table { font-size: 12px; }
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, []);

  return (
    <div className="mgmt-body">
      <div id="dashboardScreen">
        <div className="topbar">
          <div className="topbar-left">
            <div className="topbar-icon">📊</div>
            <div className="topbar-title">
              Sponsoring Management
              <span>Heikki Piali</span>
            </div>
          </div>
          <div className="topbar-right">
            <span className="topbar-user">Management</span>
            <button className="btn-logout" onClick={() => logout()}>Abmelden</button>
          </div>
        </div>

        <div className="stats-strip">
          <div className="stat-pill">
            <div className="stat-dot" style={{ background: "#7a849e" }}></div>
            <div className="stat-info">
              <div className="stat-label">Gesamt</div>
              <div className="stat-value">0</div>
            </div>
          </div>
          <div className="stat-pill">
            <div className="stat-dot" style={{ background: "#6b9aff" }}></div>
            <div className="stat-info">
              <div className="stat-label">Kontaktiert</div>
              <div className="stat-value">0</div>
            </div>
          </div>
          <div className="stat-pill">
            <div className="stat-dot" style={{ background: "#00e07a" }}></div>
            <div className="stat-info">
              <div className="stat-label">Antworten</div>
              <div className="stat-value">0</div>
            </div>
          </div>
          <div className="stat-pill">
            <div className="stat-dot" style={{ background: "#ff6b85" }}></div>
            <div className="stat-info">
              <div className="stat-label">Absagen</div>
              <div className="stat-value">0</div>
            </div>
          </div>
          <div className="stat-pill">
            <div className="stat-dot" style={{ background: "#00e5a0" }}></div>
            <div className="stat-info">
              <div className="stat-label">Partner</div>
              <div className="stat-value">0</div>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="toolbar">
            <div className="search-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Suche nach Firma, Ansprechpartner oder E-Mail…" />
            </div>
            <select>
              <option value="">Alle Status</option>
              <option value="Noch nicht kontaktiert">Noch nicht kontaktiert</option>
              <option value="E-Mail in Vorbereitung">E-Mail in Vorbereitung</option>
              <option value="E-Mail gesendet">E-Mail gesendet</option>
              <option value="Antwort erhalten">Antwort erhalten</option>
              <option value="Absage">Absage</option>
              <option value="Zusage/Partner">Zusage/Partner</option>
            </select>
            <button className="btn-add-sponsor">+ Neuer Sponsor</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Firma</th>
                  <th>Ansprechpartner</th>
                  <th>E-Mail</th>
                  <th>Status</th>
                  <th>Gesendet</th>
                  <th>Antwort</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Nutzen Sie das Dashboard oben, um Sponsoren zu verwalten.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
