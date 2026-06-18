import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { ArrowRight, Tag as TagIcon, List, Map as MapIcon } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- 通常時のピン ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const defaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// --- 選択された時の特別なピン ---
const selectedIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [30, 48],
    iconAnchor: [15, 48],
    popupAnchor: [1, -40],
    className: "selected-marker-filter",
});

const AIZU_WAKAMATSU_POSITION = [37.5015, 139.9220];

export default function MapPage() {
    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedTag, setSelectedTag] = useState(null);
    const [mapCenter, setMapCenter] = useState(AIZU_WAKAMATSU_POSITION);
    const [mapZoom, setMapZoom] = useState(15);
    const [viewMode, setViewMode] = useState("map");

    const markerRefs = useRef({});

    // 記事データの自動読み込み
    const postFiles = useMemo(() => {
        return import.meta.glob("../article/*.md", {
            as: "raw",
            eager: true,
        });
    }, []);

    const allPostsWithMap = useMemo(() => {
        return Object.keys(postFiles)
            .map((filePath) => {
                const content = postFiles[filePath];
                const fileName = filePath.split("/").pop();
                const id = fileName.replace(/\.md$/, "");

                const metaMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
                const metaData = { tags: [], images: [] };

                if (metaMatch) {
                    metaMatch[1].split("\n").forEach((line) => {
                        const [key, ...value] = line.split(":");
                        if (key && value.length) {
                            const trimmedKey = key.trim();
                            const val = value.join(":").trim().replace(/^["']|["']$/g, "");

                            if (trimmedKey === "tags" || trimmedKey === "images") {
                                metaData[trimmedKey] = val.split(",").map((t) => t.trim()).filter(Boolean);
                            } else {
                                metaData[trimmedKey] = val;
                            }
                        }
                    });
                }

                let coordinates = null;
                if (metaData.location) {
                    const [lat, lng] = metaData.location.split(",").map(Number);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        coordinates = [lat, lng];
                    }
                }

                const displayThumbnail =
                    metaData.images && metaData.images.length > 0
                        ? metaData.images[0].split("|")[0]
                        : metaData.thumbnail || null;

                return { id, ...metaData, thumbnail: displayThumbnail, coordinates };
            })
            .filter((post) => post.coordinates !== null);
    }, [postFiles]);

    const allTags = useMemo(() => {
        const tagsSet = new Set();
        allPostsWithMap.forEach((post) => {
            post.tags.forEach((tag) => tagsSet.add(tag));
        });
        return Array.from(tagsSet);
    }, [allPostsWithMap]);

    const filteredPosts = useMemo(() => {
        if (!selectedTag) return allPostsWithMap;
        return allPostsWithMap.filter((post) => post.tags.includes(selectedTag));
    }, [selectedTag, allPostsWithMap]);

    function ChangeView({ center, zoom }) {
        const map = useMap();
        useEffect(() => {
            map.invalidateSize({ animate: false });
        }, [viewMode, map, center]);

        // 💡 animate: false で即座に中心を切り替えます
        map.setView(center, zoom, { animate: false });
        return null;
    }

    // 💡 記事が選ばれたら、遅延なしで「パッ」とポップアップをトリガー
    useEffect(() => {
        if (selectedPost && markerRefs.current[selectedPost.id]) {
            markerRefs.current[selectedPost.id].openPopup();
        }
    }, [selectedPost]);

    const handleSpotClick = (post) => {
        setSelectedPost(post);
        setMapCenter(post.coordinates);
        setMapZoom(16);
        setViewMode("map");
    };

    const handleTagClick = (tag) => {
        if (selectedTag === tag) {
            setSelectedTag(null);
        } else {
            setSelectedTag(tag);
            setSelectedPost(null);
        }
    };

    return (
        <div className="bg-aizu-white h-[calc(100svh-5rem)] w-full flex flex-col md:flex-row relative overflow-hidden select-none pt-20">
            <style>{`
                .selected-marker-filter {
                    filter: hue-rotate(140deg) saturate(0.6) brightness(0.9) !important;
                    z-index: 999 !important;
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 6px !important;
                    padding: 8px !important;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
                }
                .leaflet-container {
                    width: 100% !important;
                    height: 100% !important;
                }
                .leaflet-popup-content {
                    margin: 4px !important;
                    width: 180px !important;
                }
            `}</style>

            {/* 📁 【左側サイドバー】 */}
            <div className={`
                w-full md:w-[380px] bg-white border-r border-gray-100 flex flex-col flex-shrink-0 z-20 transition-all duration-300 ease-in-out
                ${viewMode === "list" 
                    ? "h-[65svh] absolute bottom-0 left-0 rounded-t-2xl shadow-2xl border-t border-gray-100 md:rounded-none md:shadow-none md:border-t-0 md:relative md:h-full" 
                    : "hidden md:flex md:h-full"
                }
            `}>
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 md:hidden flex-shrink-0" />

                {/* タグエリア */}
                {allTags.length > 0 && (
                    <div className="px-6 pt-5 pb-3 border-b border-gray-50 bg-white flex-shrink-0">
                        <span className="text-[9px] text-aizu-sub/40 font-sans tracking-[0.2em] uppercase block mb-2.5">Filter by Tags</span>
                        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                            {allTags.map((tag) => {
                                const isCurrentTag = selectedTag === tag;
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagClick(tag)}
                                        className={`text-[10px] font-sans px-3 py-1 rounded-sm transition-all duration-300 flex items-center gap-1 ${
                                            isCurrentTag
                                                ? "bg-kusumi-blue text-white"
                                                : "bg-gray-50 text-aizu-gray/70 hover:bg-gray-100/70"
                                        }`}
                                    >
                                        <TagIcon size={8} className={isCurrentTag ? "text-white" : "text-aizu-sub/50"} />
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* スポット一覧 */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-gray-50/30">
                    <span className="text-[9px] text-aizu-sub/40 font-sans tracking-[0.2em] uppercase block">Spots List ({filteredPosts.length})</span>
                    {filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            onClick={() => handleSpotClick(post)}
                            className={`p-3.5 rounded-xs border cursor-pointer transition-all duration-300 bg-white ${
                                selectedPost?.id === post.id
                                    ? "border-kusumi-blue ring-1 ring-kusumi-blue/20 shadow-xs"
                                    : "border-gray-100 hover:border-gray-200 shadow-2xs"
                            }`}
                        >
                            <div className="flex gap-4">
                                {post.thumbnail && (
                                    <img
                                        src={post.thumbnail}
                                        alt={post.title}
                                        className="w-16 h-16 object-cover rounded-2xs bg-gray-50 flex-shrink-0"
                                    />
                                )}
                                <div className="space-y-1 min-w-0 flex-1 flex flex-col justify-center">
                                    <h3 className="font-serif text-sm text-aizu-gray truncate font-bold">
                                        {post.locationName || post.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {post.tags.slice(0, 2).map((t) => (
                                            <span key={t} className="text-[9px] text-aizu-sub/50 font-sans">
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredPosts.length === 0 && (
                        <p className="text-center py-12 font-serif text-aizu-sub/40 text-xs italic">
                            該当するスポットが見つかりません。
                        </p>
                    )}
                </div>
            </div>

            {/* 🗺️ 【右側・全面メイン地図エリア】 */}
            <div className={`
                flex-1 relative z-0 w-full
                ${viewMode === "list" ? "h-[35svh] md:h-full" : "h-full"}
            `}>
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    className="w-full h-full absolute inset-0"
                    zoomControl={false}
                    minZoom={13}
                    maxZoom={18}
                    maxBounds={[
                        [37.4750, 139.8900],
                        [37.5300, 139.9600]
                    ]}
                    maxBoundsViscosity={1.0}
                >
                    <ChangeView center={mapCenter} zoom={mapZoom} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {filteredPosts.map((post) => {
                        const isSelected = selectedPost?.id === post.id;

                        return (
                            <Marker
                                key={post.id}
                                position={post.coordinates}
                                icon={isSelected ? selectedIcon : defaultIcon}
                                ref={(el) => {
                                    if (el) markerRefs.current[post.id] = el;
                                }}
                                eventHandlers={{
                                    click: () => {
                                        setSelectedPost(post);
                                        setMapCenter(post.coordinates);
                                    },
                                }}
                            >
                                <Popup>
                                    <div className="p-0.5 font-sans">
                                        {post.thumbnail && (
                                            <img
                                                src={post.thumbnail}
                                                alt={post.title}
                                                className="w-full h-24 object-cover rounded-2xs mb-2 shadow-2xs"
                                            />
                                        )}
                                        <h4 className="font-serif text-xs text-aizu-gray mb-1 font-bold leading-tight">
                                            {post.locationName || post.title}
                                        </h4>
                                        
                                        {post.address && (
                                            <p className="text-[10px] text-aizu-sub/70 mt-1 mb-2 line-clamp-2 leading-relaxed">
                                                {post.address}
                                            </p>
                                        )}
                                        
                                        <Link
                                            to={`/blog/${post.id}`}
                                            className="text-[10px] text-kusumi-blue font-bold flex items-center gap-0.5 mt-1.5 no-underline hover:underline"
                                        >
                                            記事を読む <ArrowRight size={10} />
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>

            {/* 📱 【スマホ専用フローティングトグルボタン】 */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
                <button
                    onClick={() => setViewMode(viewMode === "map" ? "list" : "map")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-aizu-gray text-white font-serif text-xs font-bold tracking-widest shadow-md active:scale-95 transition-all backdrop-blur-md bg-opacity-95"
                >
                    {viewMode === "map" ? (
                        <>
                            <List size={13} className="text-kusumi-pink" />
                            <span>一覧を見る</span>
                        </>
                    ) : (
                        <>
                            <MapIcon size={13} className="text-kusumi-blue" />
                            <span>地図を広く見る</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}