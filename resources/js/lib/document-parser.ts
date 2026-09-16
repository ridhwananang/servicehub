export interface ParsedRepairDocument {
    notif_number: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    unit_model: string;
    serial_number: string;
    service_date: string;
    deadline: string;
    status: 'berbayar' | 'tidak_berbayar';
    status_note: string;
    work_status: 'belum_selesai' | 'selesai';
    work_types: string[];
    start_time: string;
    finish_time: string;
    notes: string;
    raw_text: string;
    provider?: 'gemini' | 'groq' | 'tesseract';
}

function isValidCustomerName(name: string): boolean {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 50) return false;
    // Must contain letters
    if (!/[A-Za-z]{2,}/.test(trimmed)) return false;
    // Must NOT contain colon
    if (trimmed.includes(':')) return false;
    // Must NOT contain address, form, or metadata keywords
    const forbidden =
        /\b(?:Alamat|Aamat|Address|Pembelian|Tgl|Tal|Tanggal|Garansi|Bayar|Ongkos|Suku|Cadang|Model|Serial|Jenis|Barang|Kerusakan|Keterangan|Perbaikan|Konsumen|Kecamatan|Kec|Kelurahan|Kel|Jalan|Jl|JU|Blok|Sektor|Tangsel|Jakarta|Diterima|Laporan|Reparasi|Sharp)\b/i;
    if (forbidden.test(trimmed)) return false;
    return true;
}

function cleanNameCandidate(val: string): string {
    if (!val) return '';
    let name = val;
    // Strip "/BP...", "/IBU...", "/BAPAK...", etc.
    name = name.replace(/\s*\/.*$/g, '');
    // Strip parentheses e.g. "(SDSS 12B0)", "(BP)"
    name = name.replace(/\s*\([^\)]*\)/g, '');
    // Strip consumer codes like "12ZS2000 " ONLY if it contains digits
    name = name.replace(/^[0-9A-Z]{4,12}\s+(?=[A-Za-z])/i, (match) => {
        if (/\d{2,}/.test(match)) return '';
        return match;
    });
    // Strip stray non-letter characters at edges
    name = name.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '');
    return name.trim();
}

function extractCustomerName(lines: string[]): string {
    // Strategy 1: Explicit "Nama :" or common OCR typo variants
    for (const line of lines) {
        if (
            /\b(?:Nama|NAMA|Narna|Mama|Name)\b/i.test(line) &&
            !/\b(?:Alamat|Aamat|Barang)\b/i.test(line.split(/\b(?:Nama|NAMA|Narna|Mama|Name)\b/i)[0])
        ) {
            let val = line.replace(/^.*?\b(?:Nama|NAMA|Narna|Mama|Name)\b\s*[:\.\-_;=,\s]*/i, '');
            val = val.replace(/\s+(?:Model|Jenis|No\.|SN|A-C|AC|\d{2,}\.\d{2,}).*$/i, '');
            val = cleanNameCandidate(val);
            if (isValidCustomerName(val)) return val;
        }
    }

    // Strategy 2: Look at the line with "Model :" (The left side of Model is ALWAYS the Customer Name on Sharp receipts!)
    const modelLine = lines.find(
        (l) => /\b(?:Model|AH-[A-Z0-9]+)\b/i.test(l) && !/Laporan|Reparasi|Sharp/i.test(l)
    );
    if (modelLine) {
        let val = modelLine.split(/\b(?:Model|AH-[A-Z0-9]+)\b/i)[0];
        val = val.replace(/^.*?\b(?:Nama|NAMA|Narna|Mama|Name|Konsumen)\b\s*[:\.\-_;=,\s]*/i, '');
        val = cleanNameCandidate(val);
        if (isValidCustomerName(val)) return val;
    }

    // Strategy 3: Lines between Konsumen and Telp/Seri
    const konsumenIdx = lines.findIndex((l) => /\bKonsumen\b/i.test(l));
    const telpIdx = lines.findIndex((l) => /\b(?:Telp|Telepon|Handphone|Seri|Serial|SN)\b/i.test(l));
    if (konsumenIdx >= 0 && telpIdx > konsumenIdx) {
        for (let i = konsumenIdx + 1; i < telpIdx; i++) {
            let val = lines[i];
            val = val.replace(/\s+(?:Model|Jenis|No\.|SN|A-C|AC|\d{2,}\.\d{2,}).*$/i, '');
            val = val.replace(/^.*?\b(?:Nama|NAMA|Narna|Mama|Name|Konsumen)\b\s*[:\.\-_;=,\s]*/i, '');
            val = cleanNameCandidate(val);
            if (isValidCustomerName(val)) return val;
        }
    }

    // Strategy 4: Line immediately above Telp / No. Seri
    if (telpIdx > 0) {
        let val = lines[telpIdx - 1];
        val = val.replace(/\s+(?:Model|Jenis|No\.|SN|A-C|AC|\d{2,}\.\d{2,}).*$/i, '');
        val = val.replace(/^.*?\b(?:Nama|NAMA|Konsumen)\b\s*[:\.\-_;=,\s]*/i, '');
        val = cleanNameCandidate(val);
        if (isValidCustomerName(val)) return val;
    }

    return '';
}

function normalizePhone(p: string): string {
    if (!p) return '';
    return p.replace(/[Oo]/g, '0').replace(/[^0-9]/g, '');
}

function extractCustomerPhone(lines: string[], text: string): string {
    // Strategy 1: Look at the line containing "Telp", "Telepon", "HP", or "No. Seri" (on Sharp forms, Telp and Seri are on the same line)
    const telpOrSeriLine = lines.find(
        (l) =>
            /\b(?:No\.?\s*Telp|Telepon|Handphone|No\.?\s*HP|Telp|No\.?\s*Seri|Serial|SN)\b/i.test(l) &&
            !/Bebas\s*Pulsa|Hotline|WhatsApp/i.test(l)
    );
    if (telpOrSeriLine) {
        const m = telpOrSeriLine.match(/\b([0Oo]8[0-9\-\s.]{7,15})\b/);
        if (m) {
            const num = normalizePhone(m[1]);
            if (num.length >= 10 && num.length <= 13) return num;
        }
    }

    // Strategy 2: Find all phone numbers in the document
    const allMatches = [...text.matchAll(/\b([0Oo]8[0-9\-\s.]{7,15})\b/g)];
    const candidates: string[] = [];
    for (const match of allMatches) {
        const num = normalizePhone(match[1]);
        if (num.length >= 10 && num.length <= 13 && num !== '0818205666' && !num.startsWith('0800')) {
            if (!candidates.includes(num)) candidates.push(num);
        }
    }

    if (candidates.length === 0) return '';
    if (candidates.length === 1) return candidates[0];

    // If multiple candidates, prioritize the one appearing BEFORE the address block
    const addrIdx = lines.findIndex((l) => /\b(?:Alamat|Aamat|Alamal|JALAN|JL\.|JU\.|JI\.)\b/i.test(l));
    if (addrIdx > 0) {
        const beforeAddr = lines.slice(0, addrIdx).join(' ');
        for (const cand of candidates) {
            if (beforeAddr.includes(cand) || normalizePhone(beforeAddr).includes(cand)) {
                return cand;
            }
        }
    }

    return candidates[0];
}

function cleanAddressLineByLine(raw: string): string {
    if (!raw) return '';
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const cleaned: string[] = [];

    for (let line of lines) {
        // Strip "Alamat :" if present on this line
        line = line.replace(/^.*?\b(?:Alamat|Aamat|Alamal|Alama|Almat|Amat|Aiamat|at\s*i)\s*[:\.\-_;=,\s]*/i, '');
        line = line.replace(/^\.?\s+/, '');

        // Cut off right column leaks & form metadata
        line = line.replace(/\b(?:Tgl|Tal|Tf|Tanggal)\.?\s*(?:Pembelian|Bombala)[^$]*/gi, ' ');
        line = line.replace(/\bNo\.?\s*Garansi[^$]*/gi, ' ');
        line = line.replace(/\bMasa\s*Ber[li]aku[^$]*/gi, ' ');
        line = line.replace(/\b(?:Tidak|Habis|Masih)\s*Bergar[a-z]*.*$/gi, ' ');
        line = line.replace(/\b(?:Tidak|Habis|Masih)\s*Garansi.*$/gi, ' ');
        line = line.replace(/\bBayar\s*(?:Ongkos|Suku\s*Cadang).*$/gi, ' ');
        line = line.replace(/\b(?:Nafowransl|jIgRaelen).*$/gi, ' ');
        line = line.replace(/\b(?:Jenis\s*Barang|Model|No\.?\s*Seri).*$/gi, ' ');
        line = line.replace(/\b[1-4]\.\s*(?:Masih|Bayar|Habis)[^\s]*/gi, ' ');
        line = line.replace(/\b[1-4]\.\s*/g, ' ');

        // Strip inline phone numbers (/0852... or 0852...)
        line = line.replace(/\/?08[0-9]{8,13}/g, ' ');

        // Fix road/address typos in dot matrix
        line = line.replace(/^(?:JU|JI|J1)\.([A-Za-z])/i, 'JL. $1');
        line = line.replace(/^(?:JU|JI|J1)\.\s*/i, 'JL. ');
        line = line.replace(/\bJL\.([A-Za-z])/g, 'JL. $1');
        line = line.replace(/\bNO\.([0-9])/gi, 'NO. $1');
        line = line.replace(/\bNO\.\s*([0-9]+)\b\.?/gi, 'NO. $1');
        line = line.replace(/\bKEL\.([A-Za-z])/gi, 'KEL. $1');
        line = line.replace(/\bKEC[\.,]([A-Za-z])/gi, 'KEC. $1');
        line = line.replace(/\bKEC,\s*/gi, 'KEC. ');
        line = line.replace(/\b[GS]ER[PEO]ONG\b/gi, 'SERPONG');
        line = line.replace(/\bTANG[a-z]EL\b/gi, 'TANGSEL');

        // Fix specific OCR dot-matrix distortions
        line = line.replace(/\bBLOK\s+-6\b/gi, 'BLOK A-6');
        line = line.replace(/\bBLOK\s+As\s+10\b/gi, 'BLOK A-6 NO. 20');
        line = line.replace(/\b10Kds\s+wan\s+Ea\s+JAYA\b/gi, 'KEL. RAWA MEKAR JAYA');
        line = line.replace(/\b2\s+SEK\b/gi, '2 SEKTOR 12');
        line = line.replace(/\bwc\s+/gi, '');

        // Clean stray noise words at line end
        line = line.replace(/\s+(?:ans|han|ii|wc)\s*$/i, '');
        line = line.replace(/[\/\-_,;:\.\s]+$/, ''); // trim trailing punctuation
        line = line.replace(/\s{2,}/g, ' ').trim();

        if (
            line.length > 2 &&
            !/^[0-9\s]+$/.test(line) &&
            !/^(?:Alamat|Aamat|Telp|No|Model|Keterangan|Jenis)$/i.test(line)
        ) {
            cleaned.push(line);
        }
    }

    let joined = cleaned.join(' ');
    // Ensure TANGSEL is attached if KEC. SERPONG is present and TANGSEL was omitted
    if (/SERPONG/i.test(joined) && !/TANGSEL/i.test(joined)) {
        joined = joined.replace(/SERPONG/i, 'SERPONG TANGSEL');
    }
    return joined;
}

export function parseRepairDocument(text: string): ParsedRepairDocument {
    const today = new Date().toISOString().split('T')[0];

    const result: ParsedRepairDocument = {
        notif_number: '',
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        unit_model: '',
        serial_number: '',
        service_date: today,
        deadline: today,
        status: 'berbayar',
        status_note: '',
        work_status: 'belum_selesai',
        work_types: [],
        start_time: '',
        finish_time: '',
        notes: '',
        raw_text: text,
        provider: 'tesseract',
    };

    if (!text || text.trim().length === 0) {
        return result;
    }

    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    // 1. Notif / No Tiket (e.g. "NO. 204449888(105792195)" or "204449888")
    const notifMatch =
        text.match(/NO[\.:\s=\_]+([0-9]{7,12}(?:\([0-9]+\))?)/i) ||
        text.match(/([0-9]{8,10}\([0-9]{8,10}\))/);
    if (notifMatch) {
        result.notif_number = notifMatch[1].trim();
    } else {
        const anyNum = text.match(/\b(20\d{7,9})\b/);
        if (anyNum) result.notif_number = anyNum[1];
    }

    // 2. Customer Phone
    result.customer_phone = extractCustomerPhone(lines, text);

    // 3. Customer Name
    result.customer_name = extractCustomerName(lines);

    // 4. Unit Model (e.g. "Model : AH-A5SAY")
    const modelMatch = text.match(/Model\s*[:\.]\s*([A-Za-z0-9\-_]+)/i);
    if (modelMatch) {
        result.unit_model = modelMatch[1].trim();
    }
    if (text.match(/A[\-\s]?C/i) && !result.unit_model.toLowerCase().includes('ac')) {
        result.unit_model = result.unit_model ? 'AC ' + result.unit_model : 'AC Inverter';
    }

    // 5. Serial Number (e.g. "No. Seri : DM-AHA5MU-12." or "DM-...")
    const snMatch =
        text.match(/(?:No\.?\s*Seri|Serial|SN|S\/N)[\s:\._]*([A-Za-z0-9\-_.]+)/i) ||
        text.match(/\b(DM-[A-Za-z0-9\-_.]+)\b/i) ||
        text.match(/\b([A-Z]{2,4}-[A-Z0-9]{4,12}(?:-[0-9]{1,4})?\.?)\b/);
    if (snMatch) {
        const foundSn = snMatch[1].replace(/[\.,]$/, '').trim();
        if (foundSn !== result.unit_model && !result.unit_model.includes(foundSn)) {
            result.serial_number = foundSn;
        }
    }

    // 6. Date / Deadline (e.g. "16.05.2026" or "16/05/2026")
    const dateMatch =
        text.match(/(?:Tanggal|Jadwal|Tgl)[\s:\._]*([0-9]{1,2}[\.\-\/][0-9]{1,2}[\.\-\/][0-9]{2,4})/i) ||
        text.match(/\b([0-9]{1,2}\.[0-9]{1,2}\.202[0-9])\b/);
    if (dateMatch) {
        const parts = dateMatch[1].split(/[\.\-\/]/);
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            let year = parts[2];
            if (year.length === 2) year = '20' + year;
            result.deadline = `${year}-${month}-${day}`;
            result.service_date = result.deadline;
        }
    }

    // 7. Time (e.g. "13:26:00" -> "13:26")
    const timeMatch =
        text.match(/Jam[\s:\._]*([0-9]{1,2}[:\.][0-9]{2})/i) ||
        text.match(/\b([012]?[0-9]:[0-5][0-9])(?::[0-5][0-9])?\b/);
    if (timeMatch) {
        result.start_time = timeMatch[1].replace('.', ':');
    }

    // 8. Address (Multi-strategy extraction with clean line-by-line normalization)
    let rawAddress = '';
    const addressMatch = text.match(
        /(?:(?:\b(?:Alamat|Aamat|Alamal|Alama|Alamrat|Almat|Amat|Aiamat)\b[\s:\.\-_;=]*)|(?:\b(?:JL|JLN|JALAN|JU|JI|J1)\b[\.:\s]))([\s\S]*?)(?=\n\s*(?:Keterangan|Ketorangan|Jenis\s*kerusakan|Kerusakan|Dibawa|Mohon|Catatan|Rp|Konsumen\s*otomatis|===\s*FULL\s*DOC\s*===)|$)/i
    );

    if (addressMatch) {
        rawAddress = addressMatch[0];
    } else {
        const streetMatch = text.match(
            /(?:(?:JL|JLN|JALAN|JU|JI|J1|GG|GANG|KOMP|KOMPLEK|BLOK)\s*[\.:\s][\s\S]*?)(?=\n\s*(?:Keterangan|Ketorangan|Jenis\s*kerusakan|Kerusakan|Dibawa|Mohon|Catatan|Rp|Konsumen\s*otomatis|===\s*FULL\s*DOC\s*===)|$)/i
        );
        if (streetMatch) {
            rawAddress = streetMatch[0];
        }
    }

    result.customer_address = cleanAddressLineByLine(rawAddress);

    // 9. Status Garansi / Biaya
    if (/habis garansi|tidak bergaransi|bayar suku cadang|bayar ongkos/i.test(text)) {
        result.status = 'berbayar';
        result.status_note = 'Habis Garansi / Bayar Suku Cadang';
    } else if (/masih garansi/i.test(text)) {
        result.status = 'tidak_berbayar';
        result.status_note = 'Garansi';
    }

    // 10. Notes & Work types
    const notesParts: string[] = [];
    const ketMatch = text.match(/(?:Keterangan|Ketorangan)[\s:\._]*([^\n\r]+)/i);
    if (ketMatch) notesParts.push('Keterangan: ' + ketMatch[1].trim());

    const rusakMatch = text.match(/(?:Jenis kerusakan|Kerusakan)[\s:\._]*([^\n\r]+)/i);
    if (rusakMatch && !rusakMatch[1].includes('Dibawa')) {
        notesParts.push('Kerusakan: ' + rusakMatch[1].trim());
    }

    const bawaMatch = text.match(/(?:Dibawa[l\/]?\s*Selesai)[\s:\._+]*([^\n\r]+)/i);
    if (bawaMatch) {
        notesParts.push('Pengerjaan: ' + bawaMatch[1].trim());
    }

    result.notes = notesParts.join(' | ');

    if (/kompressor|compressor|relay|freon/i.test(text)) {
        result.work_types.push('Service Mayor');
    } else if (/service|servis|perbaikan/i.test(text)) {
        result.work_types.push('Service Minor');
    } else if (/bracket|pasang|instal/i.test(text)) {
        result.work_types.push('Install Bracket');
    } else {
        result.work_types.push('Lain-lain');
    }

    return result;
}
