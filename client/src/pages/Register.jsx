import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { register } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp')
            return
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        setLoading(true)

        try {
            await register(
                formData.username,
                formData.email,
                formData.password,
                formData.displayName || formData.username
            )
            navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.' } })
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="card auth-card animate-fade-in">
                <div className="auth-header">
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🌴</div>
                    <h1 className="auth-title">Tham gia ngay!</h1>
                    <p className="auth-subtitle">Tạo tài khoản để bắt đầu hành trình khám phá</p>
                </div>

                <form onSubmit={handleSubmit}>
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
                        <label className="form-label" htmlFor="displayName">Tên hiển thị</label>
                        <input
                            id="displayName"
                            name="displayName"
                            type="text"
                            className="form-input"
                            placeholder="Tên bạn muốn hiển thị"
                            value={formData.displayName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="username">Tên đăng nhập *</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            className="form-input"
                            placeholder="Chọn tên đăng nhập"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            minLength={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email *</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-input"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Mật khẩu *</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="form-input"
                            placeholder="Ít nhất 6 ký tự"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className="form-input"
                            placeholder="Nhập lại mật khẩu"
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                                Đang tạo tài khoản...
                            </>
                        ) : (
                            'Đăng ký'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </div>
            </div>
        </div>
    )
}

export default Register
