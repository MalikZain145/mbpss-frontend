import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminApi, usePolling } from '../hooks/useAdminApi';
import { ArrowRight, FileText, Mail, Star, Briefcase, TrendingUp, Clock, RefreshCw, Wifi } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#c9a84c','#3b82f6','#22c55e','#f97316','#a855f7','#06b6d4','#ef4444','#84cc16'];
const TIP = {
  contentStyle: {
    background:'#1a1d27', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:8, color:'#e2e8f0', fontSize:12,
  },
};

function StatCard({ icon: Icon, label, value, sub, color, link }) {
  const inner = (
    <div className="ap-stat" style={{ borderTop:`3px solid ${color}` }}>
      <div className="ap-stat-icon" style={{ background:`${color}20`, color }}>
        <Icon size={20}/>
      </div>
      <div className="ap-stat-body">
        <div className="ap-stat-val">{value ?? '—'}</div>
        <div className="ap-stat-label">{label}</div>
        {sub && <div className="ap-stat-sub">{sub}</div>}
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

function MiniList({ items, base, secondary }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:2}}>
      {items.map(it => (
        <Link key={it._id} to={`${base}/${it._id}`}
          style={{
            display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',
            padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)',
          }}>
          <div style={{minWidth:0}}>
            <div style={{color:'#c9a84c',fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.name}</div>
            <div style={{fontSize:11,color:'#64748b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {secondary(it)}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3,flexShrink:0}}>
            <span className={`ap-badge ap-badge-${it.status}`}>{it.status}</span>
            <span style={{fontSize:11,color:'#64748b'}}>{new Date(it.createdAt).toLocaleDateString('en-GB')}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { request } = useAdminApi();
  const { data, loading, error, refresh } = usePolling(() => request('/dashboard'), 8000);

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
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div className="ap-header">
        <div>
          <h1>Dashboard</h1>
          <p>Business overview — auto-refreshes every 8 seconds</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#22c55e'}}>
            <Wifi size={13}/> Live
          </span>
          <button className="ap-btn ap-btn-ghost" onClick={refresh}><RefreshCw size={13}/> Refresh</button>
        </div>
      </div>

      {/* Stats */}
      <div className="ap-grid ap-grid-3">
        <StatCard icon={FileText}   label="Total Quotes" value={stats.totalQuotes}   sub={`${stats.newQuotes||0} new`} color="#c9a84c" link="/admin/quotes"/>
        <StatCard icon={Mail}       label="Messages"     value={stats.totalContacts} sub={`${stats.newContacts||0} unread`} color="#3b82f6" link="/admin/messages"/>
        <StatCard icon={Star}       label="Reviews"      value={stats.totalReviews}  sub={`${stats.pendingReviews||0} pending · ${stats.approvedReviews||0} published`} color="#f97316" link="/admin/reviews"/>
        <StatCard icon={TrendingUp} label="Avg Rating"   value={stats.avgRating>0?`${stats.avgRating}★`:'N/A'} sub={`${stats.approvedReviews||0} published`} color="#22c55e" link="/admin/reviews"/>
        <StatCard icon={Briefcase}  label="Services"     value={stats.totalServices} sub={`${stats.activeServices||0} active`} color="#a855f7" link="/admin/services"/>
        <StatCard icon={Clock}      label="This Week"    value={stats.weekQuotes}    sub="new quote requests" color="#06b6d4"/>
      </div>

      {/* Charts */}
      <div className="ap-grid ap-grid-charts">
        <div className="ap-card">
          <h3>Quote Enquiries — Last 14 Days</h3>
          <div className="ap-chart-box" style={{height:210}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fillDays(charts.quotesTrend)} margin={{top:5,right:10,left:-22,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="date" tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={12}/>
                <YAxis tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false} width={34}/>
                <Tooltip {...TIP}/>
                <Line type="monotone" dataKey="count" stroke="#c9a84c" strokeWidth={2} dot={false} name="Quotes"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ap-card">
          <h3>Top Services Requested</h3>
          {!charts.topServices?.length
            ? <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:210,color:'#64748b',fontSize:13}}>No data yet</div>
            : (
              <div className="ap-chart-box" style={{height:210}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.topServices.slice(0,6)} layout="vertical" margin={{top:5,right:14,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis type="number" tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <YAxis type="category" dataKey="_id" width={92} tick={{fill:'#64748b',fontSize:9}} axisLine={false} tickLine={false}/>
                    <Tooltip {...TIP}/>
                    <Bar dataKey="count" radius={[0,4,4,0]} name="Requests">
                      {charts.topServices.slice(0,6).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          }
        </div>
      </div>

      {/* Recent */}
      <div className="ap-grid ap-grid-2">
        <div className="ap-card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,gap:10}}>
            <h3 style={{marginBottom:0}}>Recent Quotes</h3>
            <Link to="/admin/quotes" className="ap-btn ap-btn-ghost ap-btn-sm">All <ArrowRight size={12}/></Link>
          </div>
          {!recent.quotes?.length
            ? <div style={{textAlign:'center',color:'#64748b',padding:24,fontSize:13}}>No quotes yet</div>
            : <MiniList items={recent.quotes} base="/admin/quotes"
                secondary={q => (q.selectedServices||[]).slice(0,2).join(', ') || '—'}/>
          }
        </div>

        <div className="ap-card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,gap:10}}>
            <h3 style={{marginBottom:0}}>Recent Messages</h3>
            <Link to="/admin/messages" className="ap-btn ap-btn-ghost ap-btn-sm">All <ArrowRight size={12}/></Link>
          </div>
          {!recent.contacts?.length
            ? <div style={{textAlign:'center',color:'#64748b',padding:24,fontSize:13}}>No messages yet</div>
            : <MiniList items={recent.contacts} base="/admin/messages"
                secondary={c => c.service || '—'}/>
          }
        </div>
      </div>
    </div>
  );
}
