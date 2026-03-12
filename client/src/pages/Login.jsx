import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const successMessage = location.state?.message

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const userData = await login(identifier, password)
            navigate(userData.role === 'admin' ? '/admin' : '/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="card auth-card animate-fade-in">
                <div className="auth-header">
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🌴</div>
                    <h1 className="auth-title">Chào mừng trở lại!</h1>
                    <p className="auth-subtitle">Đăng nhập để tiếp tục khám phá Cồn Sơn</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {successMessage && (
                        <div style={{
                            padding: 'var(--space-md)',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid var(--color-success)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-success)',
                            marginBottom: 'var(--space-lg)',
                            fontSize: 'var(--font-size-sm)',
                            textAlign: 'center'
                        }}>
                            {successMessage}
                        </div>
                    )}
                    {error && (
                        <div style={{
                            padding: 'var(--space-md)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--color-error)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-error)',
                            marginBottom: 'var(--space-lg)',
                            fontSize: 'var(--font-size-sm)'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="identifier">Email hoặc Tên đăng nhập</label>
                        <input
                            id="identifier"
                            type="text"
                            className="form-input"
                            placeholder="Nhập email hoặc tên đăng nhập"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Mật khẩu</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{ width: 20, height: 20 }}></div>
                                Đang đăng nhập...
                            </>
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </div>
            </div>
        </div>
    )
}

export default Login
