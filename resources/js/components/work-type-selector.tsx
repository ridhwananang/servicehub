import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, X, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkTypeOption } from '@/types';
import { WORK_TYPE_OPTIONS } from '@/constants/ticket';
export { WORK_TYPE_OPTIONS };

interface WorkTypeSelectorProps {
    selectedValues: string[];
    otherWorkText?: string | null;
    onChange: (values: string[], otherText?: string) => void;
    error?: string;
}

export function WorkTypeSelector({
    selectedValues = [],
    otherWorkText = '',
    onChange,
    error,
}: WorkTypeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isLainLainSelected = selectedValues.includes('Lain-lain');

    const toggleOption = (option: string) => {
        let newValues: string[];
        if (selectedValues.includes(option)) {
            newValues = selectedValues.filter((item) => item !== option);
            // If Lain-lain is removed, clear other text
            if (option === 'Lain-lain') {
                onChange(newValues, '');
                return;
            }
        } else {
            newValues = [...selectedValues, option];
        }
        onChange(newValues, otherWorkText || '');
    };

    const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(selectedValues, e.target.value);
    };

    const removeTag = (option: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newValues = selectedValues.filter((item) => item !== option);
        onChange(newValues, option === 'Lain-lain' ? '' : (otherWorkText || ''));
    };

    return (
        <div className="space-y-2.5" ref={dropdownRef}>
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Pilihan Pengerjaan <span className="text-xs font-normal text-slate-500">(Bisa pilih &gt; 1)</span>
                </Label>
                {selectedValues.length > 0 && (
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                        {selectedValues.length} dipilih
                    </span>
                )}
            </div>

            {/* Dropdown Trigger Button */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex min-h-[42px] w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-900 dark:border-slate-700",
                        error ? "border-red-500 ring-red-200" : "border-slate-300 dark:border-slate-700 hover:border-slate-400",
                        isOpen && "ring-2 ring-red-500 border-transparent"
                    )}
                >
                    <div className="flex flex-wrap items-center gap-1.5 pr-2">
                        {selectedValues.length === 0 ? (
                            <span className="flex items-center gap-2 text-slate-400">
                                <Wrench className="size-4 text-slate-400" />
                                Pilih jenis pengerjaan...
                            </span>
                        ) : (
                            selectedValues.map((val) => (
                                <Badge
                                    key={val}
                                    variant="secondary"
                                    className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/60 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
                                >
                                    <span>{val}</span>
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => removeTag(val, e)}
                                        onKeyDown={(e) => e.key === 'Enter' && removeTag(val, e as any)}
                                        className="ml-0.5 rounded-full p-0.5 hover:bg-red-200/60 transition-colors"
                                    >
                                        <X className="size-3" />
                                    </span>
                                </Badge>
                            ))
                        )}
                    </div>
                    <ChevronDown className={cn("size-4 shrink-0 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in-0 zoom-in-95 duration-100">
                        <div className="text-xs font-medium text-slate-400 px-2 py-1 uppercase tracking-wider">
                            Pilihan Pengerjaan Lapangan
                        </div>
                        <div className="mt-1 space-y-1">
                            {WORK_TYPE_OPTIONS.map((option) => {
                                const checked = selectedValues.includes(option);
                                return (
                                    <label
                                        key={option}
                                        className={cn(
                                            "flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors select-none",
                                            checked
                                                ? "bg-red-50/80 font-medium text-red-900 dark:bg-red-950/50 dark:text-red-200"
                                                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={() => toggleOption(option)}
                                                className="border-slate-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                                            />
                                            <span>{option}</span>
                                        </div>
                                        {checked && <Check className="size-4 text-red-600 dark:text-red-400" />}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Input Manual Teks Bila "Lain-lain" Dicentang */}
            {isLainLainSelected && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/50 dark:bg-amber-950/20 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                    <Label htmlFor="other_work_text" className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        Input Teks Manual (Keterangan Pengerjaan Lain-lain):
                    </Label>
                    <Input
                        id="other_work_text"
                        value={otherWorkText || ''}
                        onChange={handleOtherTextChange}
                        placeholder="Contoh: Modifikasi grounding instalasi listrik, pengecekan MCB, dsb..."
                        className="mt-1.5 bg-white border-amber-300 focus-visible:ring-amber-500 dark:bg-slate-900 dark:border-amber-800"
                        autoFocus
                    />
                </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
