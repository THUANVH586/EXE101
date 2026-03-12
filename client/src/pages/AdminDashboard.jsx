import { useState, useEffect } from 'react'
import api from '../services/api'

function AdminDashboard() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filter, setFilter] = useState('all') // all, completed, in-progress, not-started

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users')
            setUsers(response.data)
        } catch (err) {
            setError('Không thể tải danh sách người dùng. Phải là Admin mới có quyền này.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(u => {
        if (filter === 'all') return true
        if (filter === 'completed') return u.status === 'Đã hoàn thành'
        if (filter === 'in-progress') return u.status === 'Đang thực hiện'
        if (filter === 'not-started') return u.status === 'Chưa bắt đầu'
        return true
    }).filter(u => u.role !== 'admin' || (u.role === 'admin' && filter === 'all')) // Hide other admins if filtering

    // Calculate stats (only for users, not admin accounts if possible for accuracy)
    const playerUsers = users.filter(u => u.role === 'user')
    const totalPlayers = playerUsers.length
    const completedPlayers = playerUsers.filter(u => u.status === 'Đã hoàn thành').length
    const avgPoints = totalPlayers > 0
        ? Math.round(playerUsers.reduce((sum, u) => sum + u.points, 0) / totalPlayers)
        : 0

    const getStatusColor = (status) => {
        switch (status) {
            case 'Đã hoàn thành': return 'var(--color-success)'
            case 'Đang thực hiện': return 'var(--color-accent-tertiary)'
            default: return 'var(--color-text-muted)'
        }
    }

    const formatTime = (dateString) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' +
            date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }

    if (loading) {
        return (
            <div className="page">
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="page">
                <div className="container" style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
                    <div className="card" style={{ borderColor: 'var(--color-error)' }}>
                        <h2 style={{ color: 'var(--color-error)' }}>⚠️ Lỗi</h2>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Bảng điều khiển Admin 👨‍💼</h1>
                    <p className="page-subtitle">Quản lý người chơi và theo dõi bảng xếp hạng thành tích</p>
                </div>

                {/* Stats Summary */}
                <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: 'var(--space-xl)' }}>
                    <div className="card stat-card" style={{ borderLeft: '4px solid var(--color-accent-primary)' }}>
                        <div className="stat-value">{totalPlayers}</div>
                        <div className="stat-label">Tổng người chơi</div>
                    </div>
                    <div className="card stat-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
                        <div className="stat-value">{completedPlayers}</div>
                        <div className="stat-label">Đã về đích</div>
                    </div>
                    <div className="card stat-card" style={{ borderLeft: '4px solid var(--color-accent-secondary)' }}>
                        <div className="stat-value">{avgPoints}</div>
                        <div className="stat-label">Điểm trung bình</div>
                    </div>
                </div>

                {/* Filters & Leaderboard Header */}
                <div className="section-header" style={{ marginBottom: 'var(--space-md)' }}>
                    <h2 className="section-title">🏆 Bảng xếp hạng thành tích</h2>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        {['all', 'completed', 'in-progress'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: 'var(--space-xs) var(--space-md)', fontSize: 'var(--font-size-sm)' }}
                            >
                                {f === 'all' ? 'Tất cả' : f === 'completed' ? 'Hoàn thành' : 'Đang làm'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users Table */}
                <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)', width: '80px', textAlign: 'center' }}>Hạng</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)' }}>Người chơi</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)' }}>Trạng thái</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'center' }}>Nhiệm vụ</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'center' }}>Hành trình</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'center' }}>Thời gian</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'center' }}>Tổng điểm</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u, index) => {
                                const isPlayer = u.role === 'user'
                                const rank = index + 1
                                return (
                                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: u.role === 'admin' ? 'rgba(124, 58, 237, 0.05)' : 'transparent' }}>
                                        <td style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'center' }}>
                                            {u.role === 'admin' ? (
                                                <span title="Quản trị viên">⚙️</span>
                                            ) : (
                                                <span style={{
                                                    fontWeight: rank <= 3 ? 'bold' : 'normal',
                                                    fontSize: rank <= 3 ? '1.2rem' : '1rem'
                                                }}>
                                                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                                            <div style={{ fontWeight: 600, color: u.role === 'admin' ? 'var(--color-accent-secondary)' : 'inherit' }}>
                                                {u.displayName}
                                                {u.role === 'admin' && <span style={{ marginLeft: 'var(--space-xs)', fontSize: '0.7rem', verticalAlign: 'middle' }}>(Admin)</span>}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.6 }}>@{u.username}</div>
                                        </td>
                                        <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: getStatusColor(u.status)
                                            }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(u.status) }}></span>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'center' }}>
                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
                                                {u.completedCount}/{u.totalTasks}
                                            </div>
                                            <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '4px auto 0' }}>
                                                <div style={{
                                                    width: `${(u.completedCount / u.totalTasks) * 100}%`,
                                                    height: '100%',
                                                    background: getStatusColor(u.status),
                                                    borderRadius: '2px'
                                                }}></div>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'center' }}>
                                            {u.longTermProgress?.distance || 0}m
                                        </td>
                                        <td style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'center', fontSize: 'var(--font-size-xs)', opacity: 0.7 }}>
                                            {formatTime(u.lastCompletedAt)}
                                        </td>
                                        <td style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'center' }}>
                                            <div style={{
                                                fontSize: 'var(--font-size-lg)',
                                                fontWeight: 'bold',
                                                color: isPlayer ? 'var(--color-accent-primary)' : 'var(--color-text-muted)'
                                            }}>
                                                {u.points}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <p>Không tìm thấy người chơi nào phù hợp.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
