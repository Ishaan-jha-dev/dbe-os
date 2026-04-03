"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";

interface PdfExportButtonProps {
    targetRef: React.RefObject<HTMLElement | null>;
    filename: string;
}

export default function PdfExportButton({ targetRef, filename }: PdfExportButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePdf = async () => {
        if (!targetRef.current || isGenerating) return;

        setIsGenerating(true);
        try {
            // Calculate dimensions based on the captured element
            const width = targetRef.current.clientWidth;
            const height = targetRef.current.clientHeight;

            // Using html-to-image natively resolves modern CSS functions (like oklab)
            // that html2canvas struggles to parse.
            const imgData = await htmlToImage.toJpeg(targetRef.current, {
                quality: 1.0,
                backgroundColor: "#F9F6EE", // matches paper background
                pixelRatio: 2 // High resolution scale
            });

            // Calculate PDF dimensions based on the canvas aspect ratio
            const pdf = new jsPDF({
                orientation: width > height ? "landscape" : "portrait",
                unit: "px",
                format: [width, height]
            });

            pdf.addImage(imgData, "JPEG", 0, 0, width, height);
            pdf.save(`${filename}.pdf`);
        } catch (error: any) {
            console.error("Error generating PDF:", error);
            alert(`Failed to generate PDF. Error: ${error?.message || String(error)}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={generatePdf}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover-lift ${isGenerating
                ? "bg-indigo-500/50 text-white cursor-not-allowed"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
        >
            {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Download className="w-4 h-4" />
            )}
            {isGenerating ? "Exporting..." : "Download PDF"}
        </button>
    );
}
