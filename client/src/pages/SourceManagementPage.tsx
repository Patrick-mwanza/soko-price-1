import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Source {
    _id: string;
    name: string;
    phoneNumber: string;
    role: string;
    reliabilityScore: number;
    status: string;
    submissionCount: number;
    lastSubmission?: string;
    createdAt: string;
}

const SourceManagementPage: React.FC = () => {
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', phoneNumber: '', role: 'Trader' });
    const [editId, setEditId] = useState<string | null>(null);

    const fetchSources = async () => {
        try {
            const res = await api.get('/sources');
            setSources(res.data);
        } catch (error) {
            console.error('Failed to load sources:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSources(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/sources/${editId}`, form);
            } else {
                await api.post('/sources', form);
            }
            setShowForm(false);
            setEditId(null);
            setForm({ name: '', phoneNumber: '', role: 'Trader' });
            fetchSources();
        } catch (error) {
            console.error('Failed to save source:', error);
        }
    };

    const handleEdit = (source: Source) => {
        setForm({ name: source.name, phoneNumber: source.phoneNumber, role: source.role });
        setEditId(source._id);
        setShowForm(true);
    };

    const getReliabilityColor = (score: number) => {
        if (score >= 0.8) return 'var(--green-400)';
        if (score >= 0.5) return 'var(--gold-400)';
        return 'var(--red-400)';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return 'badge-green';
            case 'inactive': return 'badge-gold';
            case 'suspended': return 'badge-red';
            default: return 'badge-blue';
        }
    };

    if (loading) {
        return <figure className="spinner-container" aria-label="Loading sources"><span className="spinner" /></figure>;
    }

    return (
        <section className="animate-in">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <hgroup>
                    <h1>📡 Source Management</h1>
                    <p>Manage price data sources and track reliability</p>
                </hgroup>
                <button
                    className="btn btn-primary"
                    onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', phoneNumber: '', role: 'Trader' }); }}
                    id="add-source-btn"
                >
                    + Add Source
                </button>
            </header>

            {showForm && (
                <aside className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>{editId ? '✏️ Edit Source' : '➕ New Source'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
                        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                            <label htmlFor="source-name" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Name</label>
                            <input id="source-name" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Full name" />
                        </fieldset>
                        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                            <label htmlFor="source-phone" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Phone Number</label>
                            <input id="source-phone" className="form-input" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required placeholder="+254..." />
                        </fieldset>
                        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                            <label htmlFor="source-role" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Role</label>
                            <select id="source-role" className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                <option value="Trader">Trader</option>
                                <option value="Official">Official</option>
                                <option value="Enumerator">Enumerator</option>
                            </select>
                        </fieldset>
                        <menu style={{ display: 'flex', gap: '8px', padding: 0, margin: 0 }}>
                            <li style={{ listStyle: 'none' }}><button type="submit" className="btn btn-primary" id="save-source-btn">Save</button></li>
                            <li style={{ listStyle: 'none' }}><button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button></li>
                        </menu>
                    </form>
                </aside>
            )}

            <article>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Phone</th>
                                <th scope="col">Role</th>
                                <th scope="col">Reliability</th>
                                <th scope="col">Submissions</th>
                                <th scope="col">Last Active</th>
                                <th scope="col">Status</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sources.map((s) => (
                                <tr key={s._id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                                    <td>{s.phoneNumber}</td>
                                    <td><span className="badge badge-blue">{s.role}</span></td>
                                    <td>
                                        <figure style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                            <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${s.reliabilityScore * 100}%`, height: '100%', background: getReliabilityColor(s.reliabilityScore), borderRadius: '3px' }} />
                                            </div>
                                            <data value={s.reliabilityScore} style={{ fontSize: '13px', fontWeight: 600, color: getReliabilityColor(s.reliabilityScore) }}>
                                                {Math.round(s.reliabilityScore * 100)}%
                                            </data>
                                        </figure>
                                    </td>
                                    <td><data value={s.submissionCount} style={{ fontWeight: 600 }}>{s.submissionCount}</data></td>
                                    <td style={{ fontSize: '13px' }}>
                                        {s.lastSubmission
                                            ? <time dateTime={s.lastSubmission}>{new Date(s.lastSubmission).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}</time>
                                            : <span aria-label="No submissions yet">—</span>}
                                    </td>
                                    <td><mark className={`badge ${getStatusBadge(s.status)}`} style={{ background: 'transparent' }}>{s.status}</mark></td>
                                    <td>
                                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(s)} id={`edit-source-${s._id}`}>
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </article>

            {sources.length === 0 && (
                <aside className="empty-state" role="status">
                    <span className="empty-icon" aria-hidden="true">📡</span>
                    <h3>No sources found</h3>
                    <p>Add your first price data source to get started.</p>
                </aside>
            )}
        </section>
    );
};

export default SourceManagementPage;
