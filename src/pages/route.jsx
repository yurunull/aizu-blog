import React, { useState, useMemo, useRef, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Search } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const AIZU_WAKAMATSU_STATION = [37.4983, 139.9325];

const createNumberIcon = (number) => L.divIcon({
    className: 'custom-number-icon',
    html: `<div style="background-color: #87A7B3; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white;">${number}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const getOptimizedWaypoints = (waypoints) => {
    const nodes = [AIZU_WAKAMATSU_STATION, ...waypoints];
    if (nodes.length <= 2) return nodes;
    const sorted = [nodes[0]];
    const remaining = nodes.slice(1);
    while (remaining.length > 0) {
        const last = sorted[sorted.length - 1];
        const nextIndex = remaining.reduce((best, curr, idx) => {
            const d1 = (curr[0] - last[0]) ** 2 + (curr[1] - last[1]) ** 2;
            const d2 = (remaining[best][0] - last[0]) ** 2 + (remaining[best][1] - last[1]) ** 2;
            return d1 < d2 ? idx : best;
        }, 0);
        sorted.push(remaining.splice(nextIndex, 1)[0]);
    }
    return sorted;
};

function OptimizedRouting({ waypoints }) {
    const map = useMap();
    const routingControl = useRef(null);
    const optimized = useMemo(() => getOptimizedWaypoints(waypoints), [waypoints]);
    useEffect(() => {
        if (!map) return;
        if (routingControl.current) map.removeControl(routingControl.current);
        routingControl.current = L.Routing.control({
            waypoints: optimized.map(wp => L.latLng(wp[0], wp[1])),
            router: L.Routing.osrmv1({ profile: 'foot' }),
            lineOptions: { styles: [{ color: "#87A7B3", weight: 6, opacity: 0.9 }] },
            createMarker: (i, wp, n) => L.marker(wp.latLng, { icon: createNumberIcon(i) }),
            addWaypoints: false, draggableWaypoints: false, fitSelectedRoutes: true, show: false,
        }).addTo(map);
    }, [map, optimized]);
    return null;
}

export default function RoutePage() {
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const postFiles = import.meta.glob("../article/*.md", {
        query: "raw",
        import: "default",
        eager: true,
    });

    const allPosts = useMemo(() => {
        return Object.entries(postFiles || {}).map(([path, content]) => {
            const id = path.split("/").pop().replace(/\.md$/, "");
            const metaMatch = content.match(/^---\s*([\s\S]*?)\s*---/);

            // 記事データの初期構造定義 (locationName, tags, lovePoints を追加)
            const data = { id, title: "無題", locationName: "", tags: "", lovePoints: "", location: null, address: "", memo: "" };

            if (metaMatch) {
                metaMatch[1].split("\n").forEach(line => {
                    const [k, ...v] = line.split(":");
                    if (k) data[k.trim()] = v.join(":").trim().replace(/^["']|["']$/g, "");
                });
            }
            if (data.location) {
                const [lat, lng] = data.location.split(",").map(n => parseFloat(n.trim()));
                if (!isNaN(lat)) data.coordinates = [lat, lng];
            }
            return data;
        }).filter(p => p.coordinates);
    }, [postFiles]);

    const selectedPosts = allPosts.filter(p => selectedIds.includes(p.id));
    const optimizedPosts = useMemo(() => {
        const sortedCoords = getOptimizedWaypoints(selectedPosts.map(p => p.coordinates));
        return sortedCoords.slice(1).map(coord => selectedPosts.find(p => p.coordinates[0] === coord[0] && p.coordinates[1] === coord[1]));
    }, [selectedPosts]);

    // 【修正】最優先で locationName（店名）を返し、なければ記事タイトルにする
    const getDisplayName = (post) => post.locationName || post.title;

    // タグを配列にして取得するヘルパー
    const getTagsList = (tagsString) => tagsString ? tagsString.split(",").map(t => t.trim()) : [];

    // おすすめポイントを配列にして取得するヘルパー（最初の1つだけ見せる用）
    const getFirstLovePoint = (pointsString) => pointsString ? pointsString.split(",")[0].trim() : "";

    return (
        <div className="flex h-screen pt-20 bg-[#F9F9F9] font-sans">
            {/* 画面表示用 */}
            <div className="w-[400px] bg-white border-r border-gray-100 flex flex-col z-20 print:hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-serif font-bold text-[#333333] mb-2">ルート作成</h2>
                    <p className="text-xs text-gray-400 mb-4">※表示されるルートは目安です(車で行くことを仮定しています)<br />参考程度にご利用ください。</p>

                    <div className="relative flex items-center">
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-[#F9F9F9] rounded-xl border border-gray-100 outline-none text-sm transition-all focus:border-[#87A7B3] focus:bg-white"
                            placeholder="店名やスポット名で検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {/* 選択中のスポット（ピン留めエリア） */}
                    {selectedPosts.length > 0 && !searchTerm && (
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-[#87A7B3] tracking-wider uppercase">選択中のスポット ({selectedPosts.length})</span>
                            <div className="space-y-2">
                                {selectedPosts.map(post => (
                                    <div key={`selected-${post.id}`}
                                        onClick={() => setSelectedIds(prev => prev.filter(id => id !== post.id))}
                                        className="p-3 rounded-xl border border-[#87A7B3] bg-[#87A7B3]/10 cursor-pointer flex justify-between items-center transition-all hover:bg-[#87A7B3]/20">
                                        <div>
                                            <span className="font-bold text-sm text-[#333333]">{getDisplayName(post)}</span>
                                        </div>
                                        <span className="text-xs text-[#87A7B3] font-medium shrink-0 ml-2">解除 ✕</span>
                                    </div>
                                ))}
                            </div>
                            <hr className="border-gray-100 my-3" />
                        </div>
                    )}

                    {/* スポット候補一覧 */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                            {searchTerm ? "検索結果" : "スポット候補一覧"}
                        </span>

                        <div className="space-y-2">
                            {allPosts
                                .filter(p => getDisplayName(p).toLowerCase().includes(searchTerm.toLowerCase()) || p.tags.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(post => {
                                    const isSelected = selectedIds.includes(post.id);
                                    if (isSelected && !searchTerm) return null;

                                    const tags = getTagsList(post.tags);
                                    const firstPoint = getFirstLovePoint(post.lovePoints);

                                    return (
                                        <div key={post.id}
                                            onClick={() => setSelectedIds(prev => isSelected ? prev.filter(id => id !== post.id) : [...prev, post.id])}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected
                                                    ? "border-[#87A7B3] bg-[#87A7B3]/10"
                                                    : "border-gray-100 bg-white hover:border-gray-300"
                                                }`}>
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    {/* 店名 */}
                                                    <span className="font-bold text-base text-[#333333] block">{getDisplayName(post)}</span>

                                                    {/* おすすめポイントのチラ見せ */}
                                                    {firstPoint && (
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">📌 {firstPoint}</p>
                                                    )}

                                                    {/* タグ表示 */}
                                                    {tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {tags.map((tag, idx) => (
                                                                <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 追加ボタン */}
                                                {!isSelected && (
                                                    <span className="text-xs text-[#87A7B3] font-bold border border-[#87A7B3]/30 px-2 py-1 rounded-lg bg-[#87A7B3]/5 shrink-0 hover:bg-[#87A7B3]/20">
                                                        + 追加
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            }

                            {allPosts.filter(p => getDisplayName(p).toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-8">該当するスポットが見つかりません</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-white">
                    <button onClick={() => window.print()} className="w-full py-3 bg-[#333333] text-white rounded-xl font-bold hover:bg-[#87A7B3] transition-colors hover:shadow-lg">
                        PDFで保存（印刷画面へ）
                    </button>
                </div>
            </div>

            <div className="flex-1 relative print:hidden">
                <MapContainer center={AIZU_WAKAMATSU_STATION} zoom={15} className="w-full h-full">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    <OptimizedRouting waypoints={selectedPosts.map(p => p.coordinates)} />
                </MapContainer>
            </div>

            {/* 印刷用レイアウト */}
            <div className="hidden print:block p-8 w-full">
                <h1 className="text-2xl font-bold mb-2">会津観光ルート計画</h1>
                <p className="text-sm text-gray-500 mb-6">※本ルートは徒歩用の最短経路目安です。参考程度にご利用ください。</p>

                <div className="space-y-6">
                    {optimizedPosts.map((post, i) => (
                        <div key={post.id} className="border-b border-gray-100 pb-4 last:border-none">
                            <h2 className="text-lg font-bold text-[#333333]">{i + 1}. {getDisplayName(post)}</h2>
                            {post.address && <p className="text-sm text-gray-600 mt-1">住所: {post.address}</p>}
                            {post.memo && <p className="text-sm text-gray-600 mt-1">メモ: {post.memo}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}