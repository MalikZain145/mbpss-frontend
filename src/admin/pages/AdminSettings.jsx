import React, { useState } from 'react';
import { useAdminApi } from '../hooks/useAdminApi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Save, Eye, EyeOff, Shield, Key } from 'lucide-react';

export default function AdminSettings() {
  const { admin }             = useAdminAuth();
  const { request }           = useAdminApi();
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw]     = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow]       = useState(false);
  const [msg, setMsg]         = useState('');
  const [err, setErr]         = useState('');
  const [saving, setSaving]   = useState(false);

  const changePassword = async e => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (newPw !== confirm) { setErr('New passwords do not match'); return; }
    if (newPw.length < 8)  { setErr('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await request('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
      });
      setMsg('✓ Password updated successfully!');
      setCurrent(''); setNewPw(''); setConfirm('');
    } catch (er) {
      setErr(er.message);
    } finally { setSaving(false); }
  };

  const Row = ({ label, value }) => (
    <div className="ap-drow">
      <span className="ap-drow-label">{label}</span>
      <strong className="ap-drow-val">{value}</strong>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div className="ap-header">
        <div><h1>Settings</h1><p>Manage your admin account.</p></div>
      </div>

      <div className="ap-grid ap-grid-2" style={{gap:20}}>

        {/* Account Info */}
        <div className="ap-card">
          <h3><Shield size={13} style={{display:'inline',marginRight:6,verticalAlign:'middle'}}/>Account Information</h3>
          <Row label="Name"  value="Engr. Mary Amir"/>
          <Row label="Email" value={admin?.email || '—'}/>
          <div className="ap-drow">
            <span className="ap-drow-label">Role</span>
            <span className="ap-badge ap-badge-approved">Administrator</span>
          </div>
        </div>

        {/* Change Password */}
        <div className="ap-card">
          <h3><Key size={13} style={{display:'inline',marginRight:6,verticalAlign:'middle'}}/>Change Password</h3>
          {msg && <div className="ap-success" style={{marginBottom:12}}>{msg}</div>}
          {err && <div className="ap-error"   style={{marginBottom:12}}>{err}</div>}
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

      </div>
    </div>
  );
}
