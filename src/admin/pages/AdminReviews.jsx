import React, { useState } from 'react';
import { useAdminApi, usePolling } from '../hooks/useAdminApi';
import { Check, Trash2, RefreshCw, Star, BarChart2, Wifi, X } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';

const SENT_COLORS = { positive:'#22c55e', neutral:'#94a3b8', negative:'#ef4444' };
const STAR_COLORS = ['#ef4444','#f97316','#eab308','#3b82f6','#22c55e'];
const TIP = {
  contentStyle: {
    background:'#1a1d27', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:8, color:'#e2e8f0', fontSize:12,
  },
};

export default function AdminReviews() {
  const { request }     = useAdminApi();
  const [tab, setTab]   = useState('pending');
  const [view, setView] = useState('list');

  const { data: reviewData, loading, refresh: refreshList } = usePolling(
    () => {
      const p = new URLSearchParams({ limit: 100 });
      if (tab === 'approved') p.set('approved','true');
      else if (tab === 'pending') p.set('approved','false');
      return request(`/reviews?${p}`);
    },
    6000,
    [tab]
  );

  const { data: analytics, refresh: refreshAnalytics } = usePolling(
    () => request('/reviews/analytics'),
    10000
  );

  const reviews = reviewData?.reviews || [];
  const refreshAll = () => { refreshList(); refreshAnalytics(); };

  const approve = async id => {
    await request(`/reviews/${id}/approve`, { method:'PUT' });
    refreshAll();
  };

  const decline = async id => {
    if (!window.confirm('Decline and delete this review?')) return;
    await request(`/reviews/${id}`, { method:'DELETE' });
    refreshAll();
  };

  const sentData   = analytics?.sentimentBreakdown?.map(d=>({ name:d._id, value:d.count, fill:SENT_COLORS[d._id]||'#94a3b8' })) || [];
  const ratingData = analytics?.ratingDist?.map(d=>({ name:`${d._id}★`, count:d.count, fill:STAR_COLORS[d._id-1] })) || [];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div className="ap-header">
        <div>
          <h1>Reviews</h1>
          <p>Approve reviews and analyse sentiment · <span style={{color:'#22c55e',fontSize:12}}><Wifi size={11}/> Live</span></p>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button className={`ap-btn ${view==='list'?'ap-btn-primary':'ap-btn-ghost'}`} onClick={()=>setView('list')}>Reviews</button>
          <button className={`ap-btn ${view==='analytics'?'ap-btn-primary':'ap-btn-ghost'}`} onClick={()=>setView('analytics')}><BarChart2 size={14}/> Analytics</button>
          <button className="ap-btn ap-btn-ghost" onClick={refreshAll}><RefreshCw size={14}/></button>
        </div>
      </div>

      {/* ══ ANALYTICS ══ */}
      {view==='analytics' && (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="ap-grid ap-grid-4">
            {[
              { label:'Total Approved', val:analytics?.total??'—', color:'#c9a84c' },
              { label:'Avg Rating',     val:analytics?.avgRating>0?`${analytics.avgRating}★`:'N/A', color:'#22c55e' },
              { label:'Pending',        val:analytics?.pending??'—', color:'#f97316' },
              { label:'Positive',       val:analytics?.sentimentBreakdown?.find(s=>s._id==='positive')?.count||0, color:'#22c55e' },
            ].map((k,i)=>(
              <div key={i} className="ap-card" style={{textAlign:'center'}}>
                <div style={{fontSize:28,fontWeight:700,color:k.color,lineHeight:1.2}}>{k.val}</div>
                <div style={{fontSize:12,color:'#64748b',marginTop:4}}>{k.label}</div>
              </div>
            ))}
          </div>

          <div className="ap-grid ap-grid-2" style={{gap:16}}>
            <div className="ap-card">
              <h3>Sentiment Breakdown</h3>
              {!sentData.length
                ? <div style={{height:210,display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b',fontSize:13}}>No data yet</div>
                : (
                  <div className="ap-chart-box" style={{height:210}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="72%"
                          label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                          {sentData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                        </Pie>
                        <Tooltip {...TIP}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
            </div>

            <div className="ap-card">
              <h3>Rating Distribution</h3>
              {!ratingData.length
                ? <div style={{height:210,display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b',fontSize:13}}>No data yet</div>
                : (
                  <div className="ap-chart-box" style={{height:210}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ratingData} margin={{top:5,right:8,left:-22,bottom:0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                        <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false} width={34}/>
                        <Tooltip {...TIP}/>
                        <Bar dataKey="count" radius={[4,4,0,0]}>
                          {ratingData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
            </div>
          </div>

          {analytics?.recentTrend?.length>0 && (
            <div className="ap-card">
              <h3>Monthly Review Trend</h3>
              <div className="ap-chart-box" style={{height:200}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.recentTrend} margin={{top:5,right:10,left:-22,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="_id" tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false} width={34}/>
                    <Tooltip {...TIP}/>
                    <Line type="monotone" dataKey="count" stroke="#c9a84c" strokeWidth={2} dot={false} name="Reviews"/>
                    <Line type="monotone" dataKey="avgRating" stroke="#3b82f6" strokeWidth={2} dot={false} name="Avg Rating"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ REVIEWS LIST ══ */}
      {view==='list' && (
        <>
          <div className="ap-filters">
            {['pending','approved','all'].map(t=>(
              <button key={t} className={`ap-filter-btn ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
                {t==='pending'  && analytics?.pending > 0 && <span style={{marginLeft:6,background:'#f97316',color:'#fff',borderRadius:10,padding:'1px 6px',fontSize:10}}>{analytics.pending}</span>}
                {t==='approved' && analytics?.total   > 0 && <span style={{marginLeft:6,background:'#22c55e',color:'#fff',borderRadius:10,padding:'1px 6px',fontSize:10}}>{analytics.total}</span>}
              </button>
            ))}
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {loading && !reviews.length
              ? <div className="ap-loading">Loading…</div>
              : reviews.length===0
                ? <div className="ap-empty">No reviews in this category.</div>
                : reviews.map(r=>(
                  <div key={r._id} className="ap-card" style={{display:'flex',flexDirection:'column',gap:12}}>
                    <div className="ap-review-head">
                      <div className="ap-review-who">
                        <div className="ap-review-avatar">{r.name.charAt(0).toUpperCase()}</div>
                        <div style={{minWidth:0}}>
                          <strong style={{color:'#e2e8f0',display:'block'}}>{r.name}</strong>
                          <span style={{fontSize:12,color:'#64748b'}}>{r.role||'Verified Customer'}</span>
                        </div>
                      </div>
                      <div className="ap-review-meta">
                        <div style={{display:'flex',gap:2}}>
                          {[...Array(5)].map((_,i)=>(
                            <Star key={i} size={14} fill={i<r.rating?'#c9a84c':'none'} color="#c9a84c"/>
                          ))}
                        </div>
                        <span className={`ap-badge ap-badge-${r.sentiment}`}>{r.sentiment}</span>
                      </div>
                    </div>

                    <p style={{fontSize:14,color:'#94a3b8',lineHeight:1.7,fontStyle:'italic',wordBreak:'break-word'}}>"{r.text}"</p>

                    <div className="ap-review-foot">
                      <span style={{fontSize:12,color:'#64748b'}}>{new Date(r.createdAt).toLocaleDateString('en-GB')}</span>
                      <div className="ap-review-actions">
                        {!r.approved && (
                          <button className="ap-btn ap-btn-green ap-btn-sm" onClick={()=>approve(r._id)}>
                            <Check size={12}/> Approve &amp; Publish
                          </button>
                        )}
                        {r.approved && <span className="ap-badge ap-badge-approved">✓ Published</span>}
                        <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={()=>decline(r._id)}>
                          {r.approved ? <><Trash2 size={12}/> Delete</> : <><X size={12}/> Decline</>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        </>
      )}
    </div>
  );
}
