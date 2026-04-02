import { Deadline } from "@/hooks/useDeadlines";

function formatICSDate(date: Date): string {
    return date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");
}

function escapeICS(text: string): string {
    return text.replace(/[,;\\]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
}

export function generateICS(deadlines: Deadline[]): string {
    const now = new Date();
    const lines: string[] = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//DBE-OS//Deadline Export//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:DBE-OS Deadlines",
    ];

    for (const d of deadlines) {
        if (d.completed) continue;

        const due = new Date(d.dueDate);
        const uid = `${d.id}@dbe-os`;
        const typeLabel = d.type.charAt(0).toUpperCase() + d.type.slice(1);

        lines.push("BEGIN:VEVENT");
        lines.push(`UID:${uid}`);
        lines.push(`DTSTAMP:${formatICSDate(now)}`);
        lines.push(`DTSTART:${formatICSDate(due)}`);
        lines.push(`DTEND:${formatICSDate(new Date(due.getTime() + 60 * 60 * 1000))}`);
        lines.push(`SUMMARY:${escapeICS(`[${typeLabel}] ${d.title}`)}`);
        lines.push(`DESCRIPTION:${escapeICS(`Subject: ${d.subject}\\nType: ${typeLabel}`)}`);
        lines.push(`CATEGORIES:${escapeICS(d.subject)}`);

        // 7 days before
        lines.push("BEGIN:VALARM");
        lines.push("TRIGGER:-P7D");
        lines.push("ACTION:DISPLAY");
        lines.push(`DESCRIPTION:${escapeICS(d.title)} is due in 7 days`);
        lines.push("END:VALARM");

        // 1 day before
        lines.push("BEGIN:VALARM");
        lines.push("TRIGGER:-P1D");
        lines.push("ACTION:DISPLAY");
        lines.push(`DESCRIPTION:${escapeICS(d.title)} is due tomorrow`);
        lines.push("END:VALARM");

        // 1 hour before
        lines.push("BEGIN:VALARM");
        lines.push("TRIGGER:-PT1H");
        lines.push("ACTION:DISPLAY");
        lines.push(`DESCRIPTION:${escapeICS(d.title)} is due in 1 hour`);
        lines.push("END:VALARM");

        lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
}

export function downloadICS(deadlines: Deadline[]): void {
    const icsContent = generateICS(deadlines);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dbe-os-deadlines.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
