"use client";

import React, { useState } from "react";
import { Plane, MapPin, Navigation, Radio, ExternalLink, RefreshCw } from "lucide-react";

interface MapProps {
    latitude?: number;
    longitude?: number;
    currentLocation?: string;
    locationName?: string;
    flightNumber?: string;
    origin?: string;
    destination?: string;
    status?: string;
    isPrivateJet?: boolean;
    aircraft?: string;
    onRefresh?: () => void;
}

export default function Map({
    latitude = 51.5074,
    longitude = -0.1278,
    currentLocation,
    locationName,
    flightNumber = "PJ-808",
    origin = "LHR",
    destination = "JFK",
    status = "active",
    isPrivateJet = false,
    aircraft = "Gulfstream G650ER",
    onRefresh,
}: MapProps) {
    const displayLocation = locationName || currentLocation || "In Transit";
    const latNum = Number(latitude) || 51.5074;
    const lngNum = Number(longitude) || -0.1278;


    // Construct iframe embed URL using OpenStreetMap centered on lat/lng
    const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lngNum - 0.25}%2C${latNum - 0.25}%2C${lngNum + 0.25}%2C${latNum + 0.25}&layer=mapnik&marker=${latNum}%2C${lngNum}`;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white my-6">
            {/* Flight Tracking Header Bar */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isPrivateJet ? "bg-amber-100/20 text-text-secondary border border-amber-100/30" : "bg-red-600/20 text-red-500 border border-red-500/30"}`}>
                        <Plane className={`w-6 h-6 ${isPrivateJet ? "rotate-45" : ""}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold tracking-tight text-white">{flightNumber}</h3>
                            {isPrivateJet && (
                                <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-100/20 text-text-primary border border-amber-100/40 rounded-full">
                                    PRIVATE JET CHARTER
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {aircraft} • {origin} → {destination}
                        </p>
                    </div>
                </div>

                {/* Live Status Badge */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        LIVE RADAR FEED
                    </div>
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                            title="Refresh radar position"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Map Display & Telemetry Overlay Container */}
            <div className="relative h-[380px] sm:h-[460px] w-full bg-slate-950 overflow-hidden">
                {/* OpenStreetMap Embed */}
                <iframe
                    title={`Live Map Telemetry for ${flightNumber}`}
                    className="w-full h-full filter contrast-125 saturate-110 brightness-90"
                    src={osmUrl}
                    loading="lazy"
                    style={{ border: 0 }}
                />

                {/* Telemetry Floating Glass HUD Overlay */}
                <div className="absolute top-4 left-4 right-4 sm:right-auto bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-2xl max-w-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Telemetry Coordinates
                        </span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">GPS SYNC</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs my-2">
                        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-mono">LATITUDE</span>
                            <span className="font-mono font-bold text-text-secondary text-sm">{latNum.toFixed(6)}° N</span>
                        </div>
                        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-mono">LONGITUDE</span>
                            <span className="font-mono font-bold text-text-secondary text-sm">{lngNum.toFixed(6)}° E</span>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs">
                        <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <div className="truncate">
                            <span className="text-[10px] text-slate-400 block font-mono">LAST REPORTED LOCATION</span>
                            <span className="font-medium text-slate-200">{displayLocation}</span>
                        </div>
                    </div>
                </div>

                {/* Route Waypoint Indicator Bottom Bar */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 shadow-2xl flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-400">ORIGIN:</span>
                            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">{origin}</span>
                        </div>
                        <span className="text-slate-600">----------------</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                            <span className="text-slate-400">DESTINATION:</span>
                            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">{destination}</span>
                        </div>
                    </div>

                    <a
                        href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
                    >
                        Open in Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}