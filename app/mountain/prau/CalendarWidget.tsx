"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type DayStatus = "available" | "full" | "past" | "selected";

interface CalendarDay {
  day: number;
  status: DayStatus;
  isCurrentMonth: boolean;
  date: Date;
}

const DAYS_HEADER = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarWidget() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("summitpass_booking_date");
      if (saved) {
        const d = new Date(saved);
        if (!isNaN(d.getTime())) return d;
      }
    }
    // Default to tomorrow
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  });

  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    if (selectedDate) {
      localStorage.setItem("summitpass_booking_date", formatYYYYMMDD(selectedDate));
    }
  }, [selectedDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isPrevDisabled = year <= today.getFullYear() && month <= today.getMonth();

  // Generate calendar grid
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  // Previous month filler days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    days.push({
      day: d,
      status: "past",
      isCurrentMonth: false,
      date: new Date(year, month - 1, d),
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const currentDayDate = new Date(year, month, i);
    currentDayDate.setHours(0, 0, 0, 0);

    let status: DayStatus = "available";
    if (currentDayDate.getTime() < today.getTime()) {
      status = "past";
    } else if (selectedDate && currentDayDate.getTime() === selectedDate.getTime()) {
      status = "selected";
    } else {
      // Simulate fully-booked days: Saturdays and dates 15 & 23
      const dayOfWeek = currentDayDate.getDay();
      if (dayOfWeek === 6 || i === 15 || i === 23) {
        status = "full";
      }
    }

    days.push({
      day: i,
      status,
      isCurrentMonth: true,
      date: currentDayDate,
    });
  }

  // Next month filler days to fill up the grid (total 42 cells)
  const totalCells = 42;
  const remainingCells = totalCells - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      day: i,
      status: "available",
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }

  return (
    <section className="bg-white rounded-3xl overflow-hidden border border-outline-variant/30 card-shadow">
      <div className="p-6 border-b border-outline-variant/20 bg-primary/5">
        <h3 className="text-xl font-headline font-black text-primary">
          Pilih Tanggal Pendakian
        </h3>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          Ketersediaan langsung untuk jalur Wates &amp; Patakbanteng.
        </p>
      </div>
      <div className="p-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-headline font-bold text-lg text-secondary">
            {MONTH_NAMES[month]} {year}
          </h4>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              disabled={isPrevDisabled}
              className={`p-2 rounded-full transition-colors ${
                isPrevDisabled
                  ? "text-outline/30 cursor-not-allowed"
                  : "hover:bg-surface-container-low text-primary cursor-pointer"
              }`}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {/* Days Header */}
          {DAYS_HEADER.map((d) => (
            <div
              key={d}
              className="text-[10px] font-black uppercase text-outline pb-2"
            >
              {d}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day, idx) => {
            if (!day.isCurrentMonth) {
              return (
                <div
                  key={`filler-${idx}`}
                  className="h-12 flex items-center justify-center text-outline/20 text-xs"
                >
                  {day.day}
                </div>
              );
            }

            if (day.status === "past") {
              return (
                <button
                  key={`day-${day.day}`}
                  disabled
                  className="h-12 rounded-xl bg-surface-container-high/40 text-outline/30 text-xs font-semibold flex flex-col items-center justify-center cursor-not-allowed"
                >
                  <span>{day.day}</span>
                  <span className="text-[7px] font-bold uppercase tracking-wider text-outline/40">Lalu</span>
                </button>
              );
            }

            if (day.status === "full") {
              return (
                <button
                  key={`day-${day.day}`}
                  disabled
                  className="h-12 rounded-xl bg-surface-variant/40 text-outline/50 text-xs font-semibold flex flex-col items-center justify-center cursor-not-allowed"
                >
                  <span>{day.day}</span>
                  <span className="text-[7px] font-black uppercase tracking-wider text-error-container">Penuh</span>
                </button>
              );
            }

            if (day.status === "selected") {
              return (
                <button
                  key={`day-${day.day}`}
                  className="h-12 rounded-xl forest-gradient text-white text-xs font-black flex flex-col items-center justify-center shadow-md ring-2 ring-primary-container"
                >
                  <span>{day.day}</span>
                  <span className="text-[7px] font-black uppercase tracking-wider">
                    Terpilih
                  </span>
                </button>
              );
            }

            return (
              <button
                key={`day-${day.day}`}
                onClick={() => setSelectedDate(day.date)}
                className="h-12 rounded-xl bg-primary-container/30 text-primary text-xs font-bold flex flex-col items-center justify-center transition-all hover:bg-primary-container/70 cursor-pointer"
              >
                <span>{day.day}</span>
                <span className="w-1 h-1 bg-primary rounded-full mt-0.5"></span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
            <span>Tersedia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-variant"></span>
            <span>Penuh</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full forest-gradient"></span>
            <span>Terpilih</span>
          </div>
        </div>

        {/* Selected Date Booking Link - Directing the Hiker */}
        {selectedDate && (
          <div className="mt-8 pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-0.5">Tanggal Terpilih</span>
              <span className="text-sm font-black text-primary font-headline">
                {selectedDate.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <Link
              href="/booking/register"
              className="w-full sm:w-auto text-center forest-gradient text-white py-3.5 px-8 rounded-2xl font-bold text-sm shadow-lg hover:shadow-primary/20 active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lanjutkan Pemesanan</span>
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
