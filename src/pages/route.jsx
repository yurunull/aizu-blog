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

const getOptimizedIndices = (posts) => {
    if (posts.length === 0) return [];

    const remaining = posts.map((post, index) => ({
        index,
        coords: post.coordinates
    }));

    const sortedIndices = [];
    let lastCoords = AIZU_WAKAMATSU_STATION;

    while (remaining.length > 0) {
        let bestIdx = 0;
        let minD = Infinity;

        for (let i = 0; i < remaining.length; i++) {
            const curr = remaining[i].coords;
            const d = (curr[0] - lastCoords[0]) ** 2 + (curr[1] - lastCoords[1]) ** 2;
            if (d < minD) {
                minD = d;
                bestIdx = i;
            }
        }

        const next = remaining.splice(bestIdx, 1)[0];
        sortedIndices.push(next.index);
        lastCoords = next.coords;
    }

    return sortedIndices;
};

function OptimizedRouting({ waypoints, triggerFit, isPrinting }) {
    const map = useMap();
    const routingControl = useRef(null);

    const routeNodes = useMemo(() => [AIZU_WAKAMATSU_STATION, ...waypoints], [waypoints]);

    const fitRouteBounds = () => {
        if (!map || routeNodes.length === 0) return;
        const bounds = L.latLngBounds(routeNodes);
        map.fitBounds(bounds, { padding: [50, 50], animate: false });
    };

    useEffect(() => {
        if (!map) return;
        
        // 1回目：即時リセット
        map.invalidateSize({ animate: false });
        fitRouteBounds();

        // 2回目：DOMの配置確定を待って、実サイズでの再計算を確実に走らせる
        const printTimer = setTimeout(() => {
            map.invalidateSize({ animate: false });
            fitRouteBounds();
        }, 300);

        return () => clearTimeout(printTimer);
    }, [map, isPrinting, triggerFit, waypoints]);

    useEffect(() => {
        if (!map) return;

        if (routingControl.current) map.removeControl(routingControl.current);

        if (routeNodes.length > 1) {
            const control = L.Routing.control({
                waypoints: routeNodes.map(wp => L.latLng(wp[0], wp[1])),
                router: L.Routing.osrmv1({ profile: 'foot' }),
                lineOptions: { styles: [{ color: "#87A7B3", weight: 6, opacity: 0.9 }] },
                createMarker: (i, wp, n) => L.marker(wp.latLng, { icon: createNumberIcon(i) }),
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: false,
                show: false,
            }).addTo(map);

            const container = control.getContainer();
            if (container) container.style.display = 'none';
            routingControl.current = control;
        }
    }, [map, routeNodes]);

    return null;
}

export default function RoutePage() {
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPrinting, setIsPrinting] = useState(false);
    const [triggerFit, setTriggerFit] = useState(0);

    const postFiles = import.meta.glob("../article/*.md", {
        query: "raw",
        import: "default",
        eager: true,
    });

    const handlePrint = () => {
        if (selectedIds.length === 0) return;
        
        setIsPrinting(true);
        setTriggerFit(prev => prev + 1);

        // 印刷用DOMが画面外で完全にタイルマップの描画を終えるまで待つ（1秒に設定）
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
            setTriggerFit(prev => prev + 1);
        }, 1000); 
    };

    useEffect(() => {
        const handleAfterPrint = () => {
            setIsPrinting(false);
            setTriggerFit(prev => prev + 1);
        };
        window.addEventListener("afterprint", handleAfterPrint);
        return () => window.removeEventListener("afterprint", handleAfterPrint);
    }, []);

    const allPosts = useMemo(() => {
        return Object.entries(postFiles || {}).map(([path, content]) => {
            const id = path.split("/").pop().replace(/\.md$/, "");
            const metaMatch = content.match(/^---\s*([\s\S]*?)\s*---/);

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

    const selectedPosts = useMemo(() => {
        return allPosts.filter(p => selectedIds.includes(p.id));
    }, [allPosts, selectedIds]);

    const optimizedPosts = useMemo(() => {
        const optimizedIndices = getOptimizedIndices(selectedPosts);
        return optimizedIndices.map(index => selectedPosts[index]);
    }, [selectedPosts]);

    const optimizedCoordinates = useMemo(() => {
        return optimizedPosts.map(p => p.coordinates);
    }, [optimizedPosts]);

    const getDisplayName = (post) => post.locationName || post.title;
    const getTagsList = (tagsString) => tagsString ? tagsString.split(",").map(t => t.trim()) : [];
    const getFirstLovePoint = (pointsString) => pointsString ? pointsString.split(",")[0].trim() : "";

    return (
        <div className="flex h-screen pt-20 bg-[#F9F9F9] font-sans print:h-auto print:block print:bg-white print:p-0">

            {/* 画面左：サイドバー（印刷時は非表示） */}
            <div className="w-[400px] bg-white border-r border-gray-100 flex flex-col z-20 print:hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-serif font-bold text-[#333333] mb-2">ルート作成</h2>
                    <p className="text-xs text-gray-400 mb-4">※表示されるルートは目安です(徒歩での最短経路を仮定しています)<br />参考程度にご利用ください。</p>

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
                                                    <span className="font-bold text-base text-[#333333] block">{getDisplayName(post)}</span>
                                                    {firstPoint && (
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">📌 {firstPoint}</p>
                                                    )}
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
                    <button
                        onClick={handlePrint}
                        disabled={selectedIds.length === 0}
                        className="w-full py-3 bg-[#333333] text-white rounded-xl font-bold hover:bg-[#87A7B3] transition-colors hover:shadow-lg disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                        PDFで保存（印刷画面へ）
                    </button>
                </div>
            </div>

            {/* 画面右：通常表示用マップ（印刷時は非表示） */}
            <div className="flex-1 h-full z-10 relative print:hidden">
                <MapContainer center={AIZU_WAKAMATSU_STATION} zoom={14} style={{ width: "100%", height: "100%" }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    <OptimizedRouting waypoints={optimizedCoordinates} triggerFit={triggerFit} isPrinting={isPrinting} />
                </MapContainer>
            </div>

            {/* ─── 印刷用エリア（画面外配置テクニック） ─── */}
            {isPrinting && (
                /* 💡 修正箇所: `hidden print:block` ではなく、スクリーン表示中も `absolute left-[-9999px]` で
                   要素に実サイズを持たせたまま画面外へ飛ばします。これでLeafletが100%のサイズで正常に描画完了できます。 */
                <div className="absolute left-[-9999px] top-0 w-[720px] print:static print:w-full print:block print-page-container">
                    {/* 印刷用ヘッダー */}
                    <div className="mb-4 w-full">
                        <h1 className="text-2xl font-bold mb-1">会津観光ルート計画</h1>
                        <p className="text-xs text-gray-400">※本ルートは徒歩用の最短経路目安です。参考程度にご利用ください。</p>
                    </div>

                    {/* 印刷用マップ */}
                    <div className="w-full h-[380px] rounded-xl overflow-hidden border border-gray-200 mb-4 print-map-box">
                        <MapContainer center={AIZU_WAKAMATSU_STATION} zoom={14} style={{ width: "100%", height: "100%" }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                            <OptimizedRouting waypoints={optimizedCoordinates} triggerFit={triggerFit} isPrinting={isPrinting} />
                        </MapContainer>
                    </div>

                    {/* 印刷用詳細ルートリスト */}
                    {selectedPosts.length > 0 && (
                        <div className="w-full print-list-box">
                            <div className="space-y-3">
                                {optimizedPosts.map((post, i) => (
                                    <div key={post.id} className="border-b border-gray-100 pb-2.5 last:border-none">
                                        <h2 className="text-md font-bold text-[#333333]">{i + 1}. {getDisplayName(post)}</h2>
                                        {post.address && <p className="text-xs text-gray-500 mt-0.5">住所: {post.address}</p>}
                                        {post.memo && <p className="text-xs text-gray-500 mt-0.5">メモ: {post.memo}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 印刷用のグローバルCSSスタイル */}
            <style jsx="true" global="true">{`
                @media print {
                    footer, .site-footer, [class*="footer"], 
                    header, .site-header, [class*="header"],
                    nav, .nav-container {
                        display: none !important;
                        height: 0 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    html, body, #root {
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 12mm 12mm 10mm 12mm;
                    }
                    /* 💡 印刷時は画面外配置を解除し、通常のブロック要素としてレイアウトさせる */
                    .print-page-container {
                        position: static !important;
                        left: auto !important;
                        top: auto !important;
                        width: 100% !important;
                        display: block !important;
                    }
                    .print-map-box, .print-map-box .leaflet-container {
                        height: 380px !important;
                        width: 100% !important;
                        visibility: visible !important;
                        display: block !important;
                    }
                    .leaflet-control-container {
                        display: none !important;
                    }
                    .print-list-box > div {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }
            `}</style>
        </div>
    );
}