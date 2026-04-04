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
            // Wait for UI to settle
            await new Promise(r => setTimeout(r, 400));
 
            const element = targetRef.current;
            if (!element) return;

            const width = element.offsetWidth;
            const height = element.offsetHeight;
 
            // Better results with PNG and explicit pixelRatio for complex layouts
            const imgData = await htmlToImage.toPng(element, {
                quality: 1.0,
                backgroundColor: "#F9F6EE", 
                pixelRatio: 2,
                style: {
                    transform: 'none',
                }
            });
 
            const pdf = new jsPDF({
                orientation: width > height ? "landscape" : "portrait",
                unit: "px",
                format: [width, height]
            });
 
            pdf.addImage(imgData, "PNG", 0, 0, width, height);
            pdf.save(`${filename}.pdf`);
        } catch (error: any) {
            console.error("Error generating PDF:", error);
            if (window.confirm("Advanced PDF generation failed. Use browser print instead?")) {
                window.print();
            }
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
                : "bg-white/10 text-gray-300 hover:bg-white/15 border border-white/5 active:scale-95"
                }`}
        >
            {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Download className="w-4 h-4" />
            )}
            {isGenerating ? "Preparing..." : "Download PDF"}
        </button>
    );
}
