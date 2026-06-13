import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminApi, usePolling } from '../hooks/useAdminApi';
import { ArrowRight, FileText, Mail, Star, Briefcase, TrendingUp, Clock, RefreshCw, Wifi } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#c9a84c','#3b82f6','#22c55e','#f97316','#a855f7','#06b6d4','#ef4444','#84cc16'];
const TIP    = { contentStyle:{background:'#1a1d27',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#e2e8f0'} };

function StatCard({ icon: Icon, label, value, sub, color, link }) {
  const inner = (
    <div style={{
      background:'#1a1d27', border:'1px solid rgba(255,255,255,0.07)',
      borderTop:`3px solid ${color}`, borderRadius:12, padding:18,
      display:'flex', gap:14, alignItems:'flex-start', transition:'.2s',
    }}>
      <div style={{width:40,height:40,borderRadius:10,background:`${color}20`,color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <Icon size={20}/>
      </div>
      <div>
        <div style={{fontSize:24,fontWeight:700,color:'#e2e8f0',lineHeight:1.2}}>{value ?? '—'}</div>
        <div style={{fontSize:12,color:'#64748b',marginTop:2}}>{label}</div>
        {sub && <div style={{fontSize:11,color:'#c9a84c',marginTop:3}}>{sub}</div>}
      </div>
    </div>
  );
  return link ? <Link to={link} style={{textDecoration:'none'}}>{inner}</Link> : inner;
}

function fillDays(arr) {
  const map = {};
  (arr||[]).forEach(d => { map[d._id] = d.count; });
  return Array.from({length:14},(_,i) => {
    const d = new Date(Date.now()-((13-i)*86400000));
    const k = d.toISOString().split('T')[0];
    return { date:k.slice(5), count:map[k]||0 };
  });
}

export default function AdminDashboard() {
  const { request } = useAdminApi();
  const { data, loading, error, refresh } = usePolling(
    () => request('/dashboard'),
    8000 // refresh every 8 seconds
  );

  const gridStyle = {display:'grid',gap:14};

  if (loading && !data) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',color:'#64748b',gap:12}}>
      <RefreshCw size={24} style={{animation:'spin 1s linear infinite'}}/> Loading dashboard…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error && !data) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',gap:16}}>
      <div style={{color:'#f87171',fontSize:15}}>Failed to load dashboard</div>
      <button className="ap-btn ap-btn-primary" onClick={refresh}>Retry</button>
    </div>
  );

  const { stats, charts, recent } = data || { stats:{}, charts:{}, recent:{} };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:700,color:'#e2e8f0',marginBottom:2}}>Dashboard</h1>
          <p style={{fontSize:13,color:'#64748b'}}>Business overview — auto-refreshes every 8 seconds</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#22c55e'}}>
            <Wifi size={13}/> Live
          </div>
          <button className="ap-btn ap-btn-ghost" onClick={refresh} style={{display:'flex',alignItems:'center',gap:6}}>
            <RefreshCw size={13}/> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{...gridStyle, gridTemplateColumns:'repeat(3,1fr)'}}>
        <StatCard icon={FileText}   label="Total Quotes"   value={stats.totalQuotes}   sub={`${stats.newQuotes||0} new`}          color="#c9a84c" link="/admin/quotes"/>
        <StatCard icon={Mail}       label="Messages"       value={stats.totalContacts} sub={`${stats.newContacts||0} unread`}     color="#3b82f6" link="/admin/messages"/>
        <StatCard icon={Star}       label="Reviews"        value={stats.totalReviews}  sub={`${stats.pendingReviews||0} pending · ${stats.approvedReviews||0} published`} color="#f97316" link="/admin/reviews"/>
        <StatCard icon={TrendingUp} label="Avg Rating"     value={stats.avgRating>0?`${stats.avgRating}★`:'N/A'} sub={`${stats.approvedReviews||0} published`} color="#22c55e" link="/admin/reviews"/>
        <StatCard icon={Briefcase}  label="Services"       value={stats.totalServices} sub={`${stats.activeServices||0} active`}  color="#a855f7" link="/admin/services"/>
        <StatCard icon={Clock}      label="This Week"      value={stats.weekQuotes}    sub="new quote requests"                   color="#06b6d4"/>
      </div>

      {/* Charts */}
      <div style={{...gridStyle,gridTemplateColumns:'1.5fr 1fr'}}>
        <div className="ap-card">
          <h3>Quote Enquiries — Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={fillDays(charts.quotesTrend)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
              <XAxis dataKey="date" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip {...TIP}/>
              <Line type="monotone" dataKey="count" stroke="#c9a84c" strokeWidth={2} dot={false} name="Quotes"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="ap-card">
          <h3>Top Services Requested</h3>
          {!charts.topServices?.length
            ? <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:200,color:'#64748b',fontSize:13}}>No data yet</div>
            : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={charts.topServices.slice(0,6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis type="number" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="_id" width={130} tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip {...TIP}/>
                  <Bar dataKey="count" radius={[0,4,4,0]} name="Requests">
                    {charts.topServices.slice(0,6).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* Recent */}
      <div style={{...gridStyle,gridTemplateColumns:'1fr 1fr'}}>
        <div className="ap-card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <h3 style={{marginBottom:0}}>Recent Quotes</h3>
            <Link to="/admin/quotes" className="ap-btn ap-btn-ghost ap-btn-sm">All <ArrowRight size={12}/></Link>
          </div>
          {!recent.quotes?.length
            ? <div style={{textAlign:'center',color:'#64748b',padding:24,fontSize:13}}>No quotes yet</div>
            : (
              <table className="ap-table">
                <thead><tr><th>Name</th><th>Services</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {recent.quotes.map(q=>(
                    <tr key={q._id}>
                      <td><Link to={`/admin/quotes/${q._id}`}>{q.name}</Link></td>
                      <td style={{maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12,color:'#94a3b8'}}>
                        {(q.selectedServices||[]).slice(0,2).join(', ')}
                      </td>
                      <td><span className={`ap-badge ap-badge-${q.status}`}>{q.status}</span></td>
                      <td style={{fontSize:12,color:'#64748b'}}>{new Date(q.createdAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
        <div className="ap-card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <h3 style={{marginBottom:0}}>Recent Messages</h3>
            <Link to="/admin/messages" className="ap-btn ap-btn-ghost ap-btn-sm">All <ArrowRight size={12}/></Link>
          </div>
          {!recent.contacts?.length
            ? <div style={{textAlign:'center',color:'#64748b',padding:24,fontSize:13}}>No messages yet</div>
            : (
              <table className="ap-table">
                <thead><tr><th>Name</th><th>Service</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {recent.contacts.map(c=>(
                    <tr key={c._id}>
                      <td><Link to={`/admin/messages/${c._id}`}>{c.name}</Link></td>
                      <td style={{fontSize:12,color:'#94a3b8'}}>{c.service||'—'}</td>
                      <td><span className={`ap-badge ap-badge-${c.status}`}>{c.status}</span></td>
                      <td style={{fontSize:12,color:'#64748b'}}>{new Date(c.createdAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>
    </div>
  );
}
