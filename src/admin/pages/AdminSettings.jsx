import React, { useState } from 'react';
import { useAdminApi } from '../hooks/useAdminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Save, Eye, EyeOff, Shield, ExternalLink, Key } from 'lucide-react';

export default function AdminSettings() {
  const { admin }           = useAdminAuth();
  const { request }         = useAdminApi();
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw]   = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow]     = useState(false);
  const [msg, setMsg]       = useState('');
  const [err, setErr]       = useState('');
  const [saving, setSaving] = useState(false);

  const changePassword = async e => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (newPw !== confirm)  { setErr('New passwords do not match'); return; }
    if (newPw.length < 8)   { setErr('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await request('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
      });
      setMsg('✓ Password updated successfully!');
      setCurrent(''); setNewPw(''); setConfirm('');
    } catch(er) {
      setErr(er.message);
    } finally { setSaving(false); }
  };

  const Row = ({ label, value }) => (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)',fontSize:13}}>
      <span style={{color:'#64748b'}}>{label}</span>
      <strong style={{color:'#e2e8f0'}}>{value}</strong>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div className="ap-header">
        <div><h1>Settings</h1><p>Manage your admin account and system configuration.</p></div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>

        {/* Account Info */}
        <div className="ap-card">
          <h3><Shield size={13} style={{display:'inline',marginRight:6,verticalAlign:'middle'}}/>Account Information</h3>
          <Row label="Name"  value={admin?.name || 'Admin'}/>
          <Row label="Email" value={admin?.email || '—'}/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',fontSize:13}}>
            <span style={{color:'#64748b'}}>Role</span>
            <span className="ap-badge ap-badge-approved">Administrator</span>
          </div>
        </div>

        {/* Change Password */}
        <div className="ap-card">
          <h3><Key size={13} style={{display:'inline',marginRight:6,verticalAlign:'middle'}}/>Change Password</h3>
          {msg && <div className="ap-success" style={{marginBottom:12,padding:'10px 14px',borderRadius:8,fontSize:13}}>{msg}</div>}
          {err && <div className="ap-error"  style={{marginBottom:12}}>{err}</div>}
          <form onSubmit={changePassword} style={{display:'flex',flexDirection:'column',gap:12}}>
            <div className="ap-fg">
              <label>Current Password</label>
              <div style={{position:'relative'}}>
                <input type={show?'text':'password'} value={current} className="ap-input"
                  onChange={e=>setCurrent(e.target.value)} required placeholder="Current password"
                  style={{paddingRight:40}}/>
                <button type="button" onClick={()=>setShow(s=>!s)}
                  style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#64748b',cursor:'pointer',display:'flex'}}>
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
            <div className="ap-fg">
              <label>New Password (min 8 characters)</label>
              <input type={show?'text':'password'} value={newPw} className="ap-input"
                onChange={e=>setNewPw(e.target.value)} required placeholder="New password"/>
            </div>
            <div className="ap-fg">
              <label>Confirm New Password</label>
              <input type={show?'text':'password'} value={confirm} className="ap-input"
                onChange={e=>setConfirm(e.target.value)} required placeholder="Repeat new password"/>
            </div>
            <button type="submit" className="ap-btn ap-btn-primary" disabled={saving}>
              <Save size={14}/> {saving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Quick Links */}
        <div className="ap-card">
          <h3>Quick Links</h3>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[
              { label:'View Public Website',   url:'/',                 desc:'Open the live website in a new tab' },
              { label:'Quote Requests',         url:'/admin/quotes',    desc:'See all incoming quote enquiries' },
              { label:'Pending Reviews',        url:'/admin/reviews',   desc:'Approve customer reviews' },
              { label:'Contact Messages',       url:'/admin/messages',  desc:'View all contact form submissions' },
            ].map((l,i) => (
              <a key={i} href={l.url}
                target={l.url.startsWith('/')?'_self':'_blank'}
                rel="noopener noreferrer"
                style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,background:'#22263a',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8,color:'#e2e8f0',transition:'.2s',textDecoration:'none'}}>
                <div>
                  <strong style={{display:'block',fontSize:13,marginBottom:2}}>{l.label}</strong>
                  <span style={{fontSize:12,color:'#64748b'}}>{l.desc}</span>
                </div>
                <ExternalLink size={14} style={{color:'#c9a84c',flexShrink:0}}/>
              </a>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="ap-card">
          <h3>System Information</h3>
          <Row label="Version"    value="MBPSS v2.0"/>
          <Row label="Database"   value="MongoDB"/>
          <Row label="Backend"    value="Node.js / Express"/>
          <Row label="Frontend"   value="React 18"/>
          <Row label="Domain"     value="www.mbpss.co.uk"/>
          <Row label="Admin URL"  value="www.mbpss.co.uk/admin"/>
        </div>
      </div>
    </div>
  );
}
