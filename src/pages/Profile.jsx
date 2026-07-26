import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const save = event => { event.preventDefault(); updateProfile(form); toast.success('Profile saved'); };
  return <div className="dashboard profile-page"><div className="eyebrow">ACCOUNT SETTINGS</div><h1>Your profile</h1><p className="profile-intro">Keep your QueueLess account details up to date.</p><section className="profile-card"><div className="profile-avatar">{user.name[0]}</div><div><h2>{user.name}</h2><p>{user.role === 'owner' ? 'Business owner' : 'Customer'} account</p></div><span className="verified"><FiShield/> Verified</span></section><form className="settings-form" onSubmit={save}><label>Full name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} minLength="2" required /></label><label><FiMail/> Email<input value={user.email} disabled /></label><label><FiPhone/> Phone number<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Add a contact number" /></label><button className="button">Save changes</button></form></div>;
}
