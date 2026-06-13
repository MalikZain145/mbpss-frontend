import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAdminApi, usePolling } from '../hooks/useAdminApi';
import { Search, Trash2, Eye, RefreshCw, ArrowLeft, Save, ChevronLeft, ChevronRight, Wifi } from 'lucide-react';

/* ══════════════════════════════════════
   QUOTES LIST — polls every 8s
══════════════════════════════════════ */
export function AdminQuotesList() {
  const { request }          = useAdminApi();
  const [status, setStatus]  = useState('all');
  const [search, setSearch]  = useState('');
  const [page, setPage]      = useState(1);

  const { data, loading, refresh } = usePolling(
    () => {
      const p = new URLSearchParams({ page, limit: 15 });
      if (status !== 'all') p.set('status', status);
      return request(`/quotes?${p}`);
    },
    8000,
    [page, status]
  );

  const quotes = data?.quotes || [];
  const total  = data?.total  || 0;
  const pages  = data?.pages  || 1;

  const del = async id => {
    if (!window.confirm('Delete this quote request?')) return;
    await request(`/quotes/${id}`, { method: 'DELETE' });
    refresh();
  };

  const filtered = search
    ? quotes.filter(q => `${q.name} ${q.email} ${q.postcode || ''}`.toLowerCase().includes(search.toLowerCase()))
    : quotes;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="ap-header">
        <div>
          <h1>Quote Requests</h1>
          <p>{total} total · <span style={{color:'#22c55e',fontSize:12}}><Wifi size={11}/> Live</span></p>
        </div>
        <button className="ap-btn ap-btn-ghost" onClick={refresh}><RefreshCw size={14}/> Refresh</button>
      </div>

      <div className="ap-toolbar">
        <div className="ap-search">
          <Search size={14} style={{color:'#64748b',flexShrink:0}}/>
          <input placeholder="Search name, email, postcode…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="ap-filters">
          {['all','new','read','responded','closed'].map(s => (
            <button key={s} className={`ap-filter-btn ${status===s?'active':''}`}
              onClick={() => { setStatus(s); setPage(1); }}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="ap-table-wrap">
        <table className="ap-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Services</th><th>Postcode</th><th>Status</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            {loading && !quotes.length
              ? <tr><td colSpan={8} className="ap-loading">Loading…</td></tr>
              : filtered.length === 0
                ? <tr><td colSpan={8} className="ap-empty">No quote requests found.</td></tr>
                : filtered.map(q => (
                  <tr key={q._id}>
                    <td><strong style={{color:'#e2e8f0'}}>{q.name}</strong></td>
                    <td style={{fontSize:12,color:'#94a3b8'}}>{q.email}</td>
                    <td style={{fontSize:12,color:'#94a3b8'}}>{q.phone}</td>
                    <td style={{fontSize:12,color:'#94a3b8',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {(q.selectedServices||[]).slice(0,2).join(', ')}{q.selectedServices?.length>2?` +${q.selectedServices.length-2}`:''}
                    </td>
                    <td style={{fontSize:12}}>{q.postcode||'—'}</td>
                    <td><span className={`ap-badge ap-badge-${q.status}`}>{q.status}</span></td>
                    <td style={{fontSize:12,color:'#64748b'}}>{new Date(q.createdAt).toLocaleDateString('en-GB')}</td>
                    <td style={{display:'flex',gap:6}}>
                      <Link to={`/admin/quotes/${q._id}`} className="ap-btn ap-btn-ghost ap-btn-sm"><Eye size={13}/></Link>
                      <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={()=>del(q._id)}><Trash2 size={13}/></button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {pages > 1 && (
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
   QUOTE DETAIL
══════════════════════════════════════ */
export function AdminQuoteDetail() {
  const { id }              = useParams();
  const { request }         = useAdminApi();
  const navigate            = useNavigate();
  const [notes, setNotes]   = useState('');
  const [status, setStatus] = useState('new');
  const [saved, setSaved]   = useState(false);

  const { data: quote, refresh } = usePolling(
    () => request(`/quotes/${id}`),
    10000,
    [id]
  );

  useEffect(() => {
    if (quote) { setNotes(quote.adminNotes||''); setStatus(quote.status); }
  }, [quote?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    await request(`/quotes/${id}`, { method:'PUT', body:JSON.stringify({ status, adminNotes:notes }) });
    setSaved(true); refresh();
    setTimeout(() => setSaved(false), 2000);
  };

  const del = async () => {
    if (!window.confirm('Delete this quote?')) return;
    await request(`/quotes/${id}`, { method:'DELETE' });
    navigate('/admin/quotes');
  };

  if (!quote) return <div className="ap-loading">Loading…</div>;

  const row = (label, value) => (
    <div style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,0.05)',fontSize:13}}>
      <span style={{color:'#64748b'}}>{label}</span>
      <span style={{color:'#e2e8f0'}}>{value}</span>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <Link to="/admin/quotes" className="ap-btn ap-btn-ghost"><ArrowLeft size={14}/> Back</Link>
        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="ap-select" style={{width:'auto'}}>
            {['new','read','responded','closed'].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <button className="ap-btn ap-btn-primary" onClick={save}><Save size={13}/> {saved?'✓ Saved!':'Save Changes'}</button>
          <button className="ap-btn ap-btn-danger" onClick={del}><Trash2 size={13}/> Delete</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:20}}>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="ap-card">
            <h3>Contact Details</h3>
            {row('Name',   quote.name)}
            {row('Email',  quote.email)}
            {row('Phone',  quote.phone)}
            {row('Preferred Date', quote.preferredDate||'Flexible')}
          </div>
          <div className="ap-card">
            <h3>Property Details</h3>
            {row('Type',     quote.propertyType||'—')}
            {row('Postcode', quote.postcode||'—')}
            {row('Bedrooms', quote.bedrooms||'—')}
            {row('Address',  quote.address||'—')}
          </div>
          {quote.notes && (
            <div className="ap-card">
              <h3>Client Notes</h3>
              <p style={{fontSize:13,color:'#94a3b8',lineHeight:1.7}}>{quote.notes}</p>
            </div>
          )}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="ap-card">
            <h3>Services Requested</h3>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {(quote.selectedServices||[]).map((s,i) => (
                <div key={i} style={{background:'rgba(201,168,76,0.1)',border:'1px solid rgba(201,168,76,0.2)',color:'#c9a84c',padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:600}}>{s}</div>
              ))}
            </div>
          </div>
          <div className="ap-card">
            <h3>Admin Notes</h3>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={5} className="ap-textarea" placeholder="Internal notes…"/>
          </div>
          <div className="ap-card">
            <h3>Meta</h3>
            {row('Submitted', new Date(quote.createdAt).toLocaleString('en-GB'))}
            <div style={{display:'flex',justifyContent:'space-between',padding:'9px 0',fontSize:13}}>
              <span style={{color:'#64748b'}}>Status</span>
              <span className={`ap-badge ap-badge-${quote.status}`}>{quote.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
