import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAdminApi, usePolling } from '../hooks/useAdminApi';
import { Search, Trash2, Eye, RefreshCw, ArrowLeft, Save, ChevronLeft, ChevronRight, Wifi } from 'lucide-react';

/* ══════════════════════════════════════
   MESSAGES LIST — polls every 8s
══════════════════════════════════════ */
export function AdminMessagesList() {
  const { request }         = useAdminApi();
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  const { data, loading, refresh } = usePolling(
    () => {
      const p = new URLSearchParams({ page, limit:15 });
      if (status !== 'all') p.set('status', status);
      return request(`/contacts?${p}`);
    },
    8000,
    [page, status]
  );

  const contacts = data?.contacts || [];
  const total    = data?.total    || 0;
  const pages    = data?.pages    || 1;

  const del = async id => {
    if (!window.confirm('Delete this message?')) return;
    await request(`/contacts/${id}`, { method:'DELETE' });
    refresh();
  };

  const filtered = search
    ? contacts.filter(c => `${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase()))
    : contacts;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div className="ap-header">
        <div>
          <h1>Contact Messages</h1>
          <p>{total} total · <span style={{color:'#22c55e',fontSize:12}}><Wifi size={11}/> Live</span></p>
        </div>
        <button className="ap-btn ap-btn-ghost" onClick={refresh}><RefreshCw size={14}/> Refresh</button>
      </div>

      <div className="ap-toolbar">
        <div className="ap-search">
          <Search size={14} style={{color:'#64748b',flexShrink:0}}/>
          <input placeholder="Search name or email…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="ap-filters">
          {['all','new','read','responded'].map(s=>(
            <button key={s} className={`ap-filter-btn ${status===s?'active':''}`}
              onClick={()=>{setStatus(s);setPage(1);}}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="ap-table-wrap">
        <table className="ap-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Service</th><th>Message</th><th>Status</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {loading && !contacts.length
              ? <tr><td colSpan={8} className="ap-loading">Loading…</td></tr>
              : filtered.length===0
                ? <tr><td colSpan={8} className="ap-empty">No messages found.</td></tr>
                : filtered.map(c=>(
                  <tr key={c._id}>
                    <td><strong style={{color:'#e2e8f0'}}>{c.name}</strong></td>
                    <td style={{fontSize:12,color:'#94a3b8'}}>{c.email}</td>
                    <td style={{fontSize:12,color:'#94a3b8'}}>{c.phone||'—'}</td>
                    <td style={{fontSize:12,color:'#94a3b8'}}>{c.service||'—'}</td>
                    <td style={{fontSize:12,color:'#94a3b8',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {c.message?.slice(0,60)}{c.message?.length>60?'…':''}
                    </td>
                    <td><span className={`ap-badge ap-badge-${c.status}`}>{c.status}</span></td>
                    <td style={{fontSize:12,color:'#64748b'}}>{new Date(c.createdAt).toLocaleDateString('en-GB')}</td>
                    <td>
                      <div className="ap-td-actions">
                        <Link to={`/admin/messages/${c._id}`} className="ap-btn ap-btn-ghost ap-btn-sm"><Eye size={13}/></Link>
                        <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={()=>del(c._id)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="ap-mobile-list">
        {loading && !contacts.length
          ? <div className="ap-loading">Loading…</div>
          : filtered.length===0
            ? <div className="ap-empty">No messages found.</div>
            : filtered.map(c=>(
              <div key={c._id} className="ap-mcard">
                <div className="ap-mcard-top">
                  <span className="ap-mcard-name">{c.name}</span>
                  <span className={`ap-badge ap-badge-${c.status}`}>{c.status}</span>
                </div>
                <div className="ap-mcard-row"><span className="ap-mcard-label">Email</span><span className="ap-mcard-val">{c.email}</span></div>
                <div className="ap-mcard-row"><span className="ap-mcard-label">Phone</span><span className="ap-mcard-val">{c.phone||'—'}</span></div>
                <div className="ap-mcard-row"><span className="ap-mcard-label">Service</span><span className="ap-mcard-val">{c.service||'—'}</span></div>
                <div className="ap-mcard-row"><span className="ap-mcard-label">Message</span><span className="ap-mcard-val">{c.message?.slice(0,110)}{c.message?.length>110?'…':''}</span></div>
                <div className="ap-mcard-row"><span className="ap-mcard-label">Date</span><span className="ap-mcard-val">{new Date(c.createdAt).toLocaleDateString('en-GB')}</span></div>
                <div className="ap-mcard-actions">
                  <Link to={`/admin/messages/${c._id}`} className="ap-btn ap-btn-ghost ap-btn-sm"><Eye size={13}/> View</Link>
                  <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={()=>del(c._id)}><Trash2 size={13}/> Delete</button>
                </div>
              </div>
            ))
        }
      </div>

      {pages>1 && (
        <div className="ap-pagination">
          <button className="ap-btn ap-btn-ghost ap-btn-sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={14}/></button>
          <span>Page {page} of {pages}</span>
          <button className="ap-btn ap-btn-ghost ap-btn-sm" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}><ChevronRight size={14}/></button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   MESSAGE DETAIL
══════════════════════════════════════ */
export function AdminMessageDetail() {
  const { id }              = useParams();
  const { request }         = useAdminApi();
  const navigate            = useNavigate();
  const [notes, setNotes]   = useState('');
  const [status, setStatus] = useState('new');
  const [saved, setSaved]   = useState(false);

  const { data: contact, refresh } = usePolling(() => request(`/contacts/${id}`), 15000, [id]);

  useEffect(() => {
    if (contact) { setNotes(contact.adminNotes||''); setStatus(contact.status); }
  }, [contact?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    await request(`/contacts/${id}`, { method:'PUT', body:JSON.stringify({ status, adminNotes:notes }) });
    setSaved(true); refresh();
    setTimeout(()=>setSaved(false), 2000);
  };

  const del = async () => {
    if (!window.confirm('Delete this message?')) return;
    await request(`/contacts/${id}`, { method:'DELETE' });
    navigate('/admin/messages');
  };

  if (!contact) return <div className="ap-loading">Loading…</div>;

  const row = (label, value) => (
    <div className="ap-drow">
      <span className="ap-drow-label">{label}</span>
      <span className="ap-drow-val">{value}</span>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div className="ap-detail-bar">
        <Link to="/admin/messages" className="ap-btn ap-btn-ghost"><ArrowLeft size={14}/> Back</Link>
        <div className="ap-detail-actions">
          <select value={status} onChange={e=>setStatus(e.target.value)} className="ap-select" style={{width:'auto',minWidth:112}}>
            {['new','read','responded'].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <button className="ap-btn ap-btn-primary" onClick={save}><Save size={13}/> {saved?'✓ Saved!':'Save'}</button>
          <button className="ap-btn ap-btn-danger" onClick={del}><Trash2 size={13}/> Delete</button>
        </div>
      </div>

      <div className="ap-grid ap-grid-detail">
        <div style={{display:'flex',flexDirection:'column',gap:16,minWidth:0}}>
          <div className="ap-card">
            <h3>Contact Details</h3>
            {row('Name',  contact.name)}
            {row('Email', <a href={`mailto:${contact.email}`} style={{color:'#c9a84c'}}>{contact.email}</a>)}
            {row('Phone', contact.phone
              ? <a href={`tel:${contact.phone.replace(/\s/g,'')}`} style={{color:'#c9a84c'}}>{contact.phone}</a>
              : '—')}
            {row('Service Enquiry', contact.service||'—')}
          </div>
          <div className="ap-card">
            <h3>Message</h3>
            <p style={{fontSize:14,color:'#94a3b8',lineHeight:1.8,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{contact.message}</p>
            <a href={`mailto:${contact.email}?subject=Re: Your MBPSS Enquiry`}
              className="ap-btn ap-btn-primary"
              style={{marginTop:16,display:'inline-flex'}}>
              ✉ Reply by Email
            </a>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:16,minWidth:0}}>
          <div className="ap-card">
            <h3>Admin Notes</h3>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={5} className="ap-textarea" placeholder="Internal notes…"/>
          </div>
          <div className="ap-card">
            <h3>Meta</h3>
            {row('Received', new Date(contact.createdAt).toLocaleString('en-GB'))}
            <div className="ap-drow">
              <span className="ap-drow-label">Status</span>
              <span className={`ap-badge ap-badge-${contact.status}`}>{contact.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
