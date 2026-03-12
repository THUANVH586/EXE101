import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import TaskCard from '../components/TaskCard'
import LongTermTask from '../components/LongTermTask'
import ProgressRing from '../components/ProgressRing'
import MapView from '../components/MapView'
import { calculateDistance } from '../utils/geo'

// Sample tasks for demo (when API is not available)
const sampleTasks = [
    {
        id: 1,
        title: 'Thưởng thức Bánh Xèo',
        description: 'Đến quầy bánh dân gian trải nghiệm món bánh xèo giòn rụm đặc trưng miền Tây',
        type: 'food',
        category: 'short-term',
        location: { name: 'Quầy Cô Ba', description: 'Đầu đường chính Cồn Sơn' },
        duration: 20,
        points: 15,
        icon: '🥞',
        order: 1
    },
    {
        id: 2,
        title: 'Trang trí Nón Lá',
        description: 'Vẽ và trang trí nón lá theo phong cách riêng của bạn',
        type: 'craft',
        category: 'short-term',
        location: { name: 'Quầy Chú Năm', description: 'Khu thủ công mỹ nghệ' },
        duration: 30,
        points: 25,
        icon: '🎨',
        order: 2
    },
    {
        id: 3,
        title: 'Trải nghiệm Bán Hàng',
        description: 'Trải nghiệm làm người đứng quầy bán bánh tráng trộn trong 30 phút',
        type: 'community',
        category: 'short-term',
        location: { name: 'Quầy Bánh Tráng Trộn', description: 'Khu ẩm thực đường chính' },
        duration: 30,
        points: 50,
        icon: '🏪',
        order: 3
    },
    {
        id: 4,
        title: 'Hành trình khám phá',
        description: 'Khám phá Cồn Sơn bằng cách di chuyển và tích lũy ít nhất 2000m',
        type: 'health',
        category: 'long-term',
        location: { name: 'Toàn bộ Cồn Sơn' },
        duration: 0,
        points: 100,
        icon: '🏃',
        order: 4
    },
    {
        id: 5,
        title: 'Bảo vệ Môi trường',
        description: 'Mang theo bình nước cá nhân, không sử dụng ly nhựa trong suốt chuyến tham quan',
        type: 'environment',
        category: 'long-term',
        location: { name: 'Toàn bộ Cồn Sơn' },
        duration: 0,
        points: 75,
        icon: '🌿',
        order: 5
    },
    {
        id: 6,
        title: 'Thưởng thức Chè Bưởi',
        description: 'Nếm thử món chè bưởi mát lạnh đặc sản Cồn Sơn',
        type: 'food',
        category: 'short-term',
        location: { name: 'Quầy Chè Cô Tư', description: 'Gần bến thuyền' },
        duration: 15,
        points: 10,
        icon: '🍨',
        order: 6
    },
    {
        id: 7,
        title: 'Học làm Bánh Dân Gian',
        description: 'Tham gia workshop học làm bánh lá dừa truyền thống',
        type: 'craft',
        category: 'short-term',
        location: { name: 'Khu Workshop', description: 'Nhà văn hóa Cồn Sơn' },
        duration: 45,
        points: 35,
        icon: '🍰',
        order: 7
    }
]

function Dashboard() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('missions')
    const [tasks, setTasks] = useState([])
    const [completedIds, setCompletedIds] = useState([])
    const [longTermProgress, setLongTermProgress] = useState({ distance: 0, usingPersonalBottle: false })
    const [isTracking, setIsTracking] = useState(false)
    const [lastPosition, setLastPosition] = useState(null)
    const [watchId, setWatchId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        fetchTasks()
    }, [])

    useEffect(() => {
        if (isTracking) {
            startTracking()
        } else {
            stopTracking()
        }
        return () => stopTracking()
    }, [isTracking])

    const startTracking = () => {
        if (!navigator.geolocation) {
            showToast('❌ Trình duyệt của bạn không hỗ trợ định vị')
            setIsTracking(false)
            return
        }

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords

                if (lastPosition) {
                    const dist = calculateDistance(
                        lastPosition.latitude,
                        lastPosition.longitude,
                        latitude,
                        longitude
                    )

                    if (dist > 5) { // Chỉ tính nếu di chuyển trên 5m để tránh nhiễu GPS
                        setLongTermProgress(prev => ({
                            ...prev,
                            distance: (prev.distance || 0) + dist
                        }))
                    }
                }

                setLastPosition({ latitude, longitude })
            },
            (error) => {
                console.error('GPS Error:', error)
                showToast('❌ Không thể truy cập vị trí của bạn')
                setIsTracking(false)
            },
            { enableHighAccuracy: true, distanceFilter: 5 }
        )
        setWatchId(id)
    }

    const stopTracking = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId)
            setWatchId(null)
        }
        setLastPosition(null)
    }

    const toggleTracking = () => {
        setIsTracking(!isTracking)
        if (!isTracking) {
            showToast('🏃 Đang bắt đầu ghi lại hành trình...')
        } else {
            showToast('✅ Đã tạm dừng ghi hành trình')
            // Đồng bộ với server khi dừng
            handleUpdateDistance(longTermProgress.distance)
        }
    }

    const fetchTasks = async () => {
        try {
            // Try to fetch from API
            const response = await api.get('/tasks')
            setTasks(response.data)
        } catch (error) {
            // Use sample tasks if API fails
            console.log('Using sample tasks (API not available)')
            setTasks(sampleTasks)
        } finally {
            setLoading(false)
        }
    }

    const handleCompleteTask = async (taskId) => {
        if (completedIds.includes(taskId)) return

        try {
            await api.post(`/tasks/complete/${taskId}`)
        } catch (error) {
            console.log('Demo mode: marking task complete locally')
        }

        setCompletedIds([...completedIds, taskId])
        showToast('🎉 Chúc mừng! Bạn đã hoàn thành nhiệm vụ!')
    }

    const handleUpdateDistance = async (distance) => {
        try {
            await api.patch('/api/tasks/long-term', { distance })
        } catch (error) {
            console.log('Demo mode: updating distance locally')
        }

        setLongTermProgress({ ...longTermProgress, distance })
        showToast('✅ Đã cập nhật quãng đường!')
    }

    const handleUpdateBottle = async (using) => {
        try {
            await api.patch('/tasks/long-term', { usingPersonalBottle: using })
        } catch (error) {
            console.log('Demo mode: updating bottle status locally')
        }

        setLongTermProgress({ ...longTermProgress, usingPersonalBottle: using })
        if (using) {
            showToast('🌿 Tuyệt vời! Bạn đang bảo vệ môi trường!')
        }
    }

    const showToast = (message) => {
        setToast(message)
        setTimeout(() => setToast(null), 3000)
    }

    const shortTermTasks = tasks.filter(t => t.category === 'short-term')
    const longTermTasks = tasks.filter(t => t.category === 'long-term')

    const completedCount = completedIds.length
    const totalShortTerm = shortTermTasks.length
    const progressPercent = totalShortTerm > 0 ? (completedCount / totalShortTerm) * 100 : 0

    const totalPoints = tasks
        .filter(t => completedIds.includes(t.id || t._id))
        .reduce((sum, t) => sum + (t.points || 0), 0)

    if (loading) {
        return (
            <div className="page">
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">
                        Chào {user?.displayName || user?.username || 'bạn'}! 👋
                    </h1>
                    <p className="page-subtitle">Hãy khám phá Cồn Sơn qua những nhiệm vụ thú vị</p>
                </div>

                {/* Tab Navigation */}
                <div className="tab-bar">
                    <button
                        className={`tab-btn ${activeTab === 'missions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('missions')}
                    >
                        📋 Nhiệm vụ
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
                        onClick={() => setActiveTab('map')}
                    >
                        🗺️ Bản đồ
                    </button>
                </div>
            </div>

            {/* Tab: Map (full-width, outside container) */}
            {activeTab === 'map' && <MapView />}

            {/* Tab: Missions */}
            {activeTab === 'missions' && (
                <div className="container">
                    {/* Stats */}
                    <div className="dashboard-stats">
                        <div className="card stat-card">
                            <ProgressRing progress={progressPercent} size={80} />
                            <div className="stat-label">Tiến độ hoàn thành</div>
                        </div>
                        <div className="card stat-card">
                            <div className="stat-value">{completedCount}/{totalShortTerm}</div>
                            <div className="stat-label">Nhiệm vụ đã hoàn thành</div>
                        </div>
                        <div className="card stat-card">
                            <div className="stat-value">{totalPoints}</div>
                            <div className="stat-label">Điểm tích lũy</div>
                        </div>
                    </div>

                    {/* Long-term Tasks */}
                    <section style={{ marginBottom: 'var(--space-2xl)' }}>
                        <div className="section-header">
                            <h2 className="section-title">🎯 Thử thách trong ngày</h2>
                        </div>
                        <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                            {longTermTasks.map(task => (
                                <LongTermTask
                                    key={task.id || task._id}
                                    task={task}
                                    currentValue={task.type === 'health' ? longTermProgress.distance : undefined}
                                    targetValue={task.type === 'health' ? 2000 : undefined}
                                    unit={task.type === 'health' ? 'm' : ''}
                                    isCompleted={task.type === 'environment' ? longTermProgress.usingPersonalBottle : false}
                                    isTracking={task.type === 'health' ? isTracking : undefined}
                                    onUpdate={task.type === 'health' ? toggleTracking : handleUpdateBottle}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Short-term Tasks */}
                    <section style={{ paddingBottom: 'var(--space-2xl)' }}>
                        <div className="section-header">
                            <h2 className="section-title">📋 Nhiệm vụ trải nghiệm</h2>
                        </div>
                        <div className="task-grid">
                            {shortTermTasks.map((task, index) => (
                                <div key={task.id || task._id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <TaskCard
                                        task={task}
                                        isCompleted={completedIds.includes(task.id || task._id)}
                                        onComplete={handleCompleteTask}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* Toast notification */}
            {toast && <div className="toast">{toast}</div>}
        </div>
    )
}

export default Dashboard
