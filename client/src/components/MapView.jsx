import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default Leaflet icon issue with Vite/Webpack bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Cồn Sơn island center coordinates
const CON_SON_CENTER = [10.0505, 105.7834]

// Bounds restricting pan to the Cồn Sơn area
const CON_SON_BOUNDS = [
    [9.9900, 105.7200],  // SW corner
    [10.1100, 105.8400]  // NE corner
]

// Custom pulsing user location icon
const createUserIcon = () => L.divIcon({
    className: 'user-location-marker',
    html: `
        <div class="user-dot-outer">
            <div class="user-dot-inner"></div>
        </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -20],
})

// Sub-component to recenter map when user location updates
function RecenterMap({ position }) {
    const map = useMap()
    useEffect(() => {
        if (position) {
            map.panTo(position, { animate: true, duration: 0.8 })
        }
    }, [position, map])
    return null
}

function MapView() {
    const [userPosition, setUserPosition] = useState(null)
    const [accuracy, setAccuracy] = useState(null)
    const [isTracking, setIsTracking] = useState(false)
    const [locationStatus, setLocationStatus] = useState('idle') // idle | loading | tracking | error
    const watchIdRef = useRef(null)

    const startTracking = () => {
        if (!navigator.geolocation) {
            setLocationStatus('error')
            return
        }
        setLocationStatus('loading')

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy: acc } = pos.coords
                setUserPosition([latitude, longitude])
                setAccuracy(acc)
                setLocationStatus('tracking')
            },
            (err) => {
                console.error('Geolocation error:', err)
                setLocationStatus('error')
                setIsTracking(false)
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 15000,
            }
        )
    }

    const stopTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
        setLocationStatus('idle')
        setUserPosition(null)
        setAccuracy(null)
    }

    const toggleTracking = () => {
        if (isTracking) {
            stopTracking()
            setIsTracking(false)
        } else {
            setIsTracking(true)
            startTracking()
        }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
            }
        }
    }, [])

    const getTrackingBtnLabel = () => {
        if (locationStatus === 'loading') return '⏳ Đang định vị...'
        if (locationStatus === 'tracking') return '📍 Dừng định vị'
        if (locationStatus === 'error') return '❌ Thử lại'
        return '🎯 Định vị tôi'
    }

    const getStatusText = () => {
        if (locationStatus === 'loading') return 'Đang lấy vị trí GPS...'
        if (locationStatus === 'tracking') return accuracy
            ? `Đang theo dõi • Độ chính xác: ±${Math.round(accuracy)}m`
            : 'Đang theo dõi vị trí'
        if (locationStatus === 'error') return 'Không thể truy cập GPS. Kiểm tra quyền trình duyệt.'
        return 'Nhấn nút bên dưới để hiển thị vị trí của bạn'
    }

    return (
        <div className="map-page">
            {/* Map info bar */}
            <div className="map-info-bar">
                <div className="map-info-left">
                    <span className="map-island-badge">🏝️ Cồn Sơn</span>
                    <span className="map-status-text">{getStatusText()}</span>
                </div>
                <button
                    className={`btn map-locate-btn ${isTracking ? 'btn-tracking' : 'btn-primary'}`}
                    onClick={toggleTracking}
                    disabled={locationStatus === 'loading'}
                >
                    {getTrackingBtnLabel()}
                </button>
            </div>

            {/* Map container */}
            <div className="map-wrapper">
                <MapContainer
                    center={CON_SON_CENTER}
                    zoom={16}
                    minZoom={14}
                    maxZoom={19}
                    maxBounds={CON_SON_BOUNDS}
                    maxBoundsViscosity={1.0}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={true}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* User location marker + accuracy circle */}
                    {userPosition && (
                        <>
                            <Marker
                                position={userPosition}
                                icon={createUserIcon()}
                            >
                                <Popup>
                                    <div style={{ textAlign: 'center', minWidth: '120px' }}>
                                        <strong>📍 Vị trí của bạn</strong>
                                        <br />
                                        <small>
                                            {userPosition[0].toFixed(5)}°N,{' '}
                                            {userPosition[1].toFixed(5)}°E
                                        </small>
                                        {accuracy && (
                                            <>
                                                <br />
                                                <small style={{ color: '#666' }}>
                                                    ±{Math.round(accuracy)}m
                                                </small>
                                            </>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>

                            {accuracy && (
                                <Circle
                                    center={userPosition}
                                    radius={accuracy}
                                    pathOptions={{
                                        color: '#00d4aa',
                                        fillColor: '#00d4aa',
                                        fillOpacity: 0.1,
                                        weight: 1.5,
                                        dashArray: '6 4',
                                    }}
                                />
                            )}

                            <RecenterMap position={userPosition} />
                        </>
                    )}
                </MapContainer>

                {/* Zoom hint overlay */}
                <div className="map-hint">
                    🔍 Cuộn để phóng to / thu nhỏ
                </div>
            </div>
        </div>
    )
}

export default MapView
