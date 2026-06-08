"use client";

import { useState, useEffect } from "react";

type DayStatus = "available" | "full" | "past" | "selected";

interface CalendarDay {
  day: number;
  status: DayStatus;
  isCurrentMonth: boolean;
}

const DAYS_HEADER = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function generateCalendarDays(selectedDay: number): CalendarDay[] {
  // September 2024 starts on Sunday (index 0)
  // Previous month filler days
  const fillers: CalendarDay[] = [28, 29, 30, 31].map((d) => ({
    day: d,
    status: "past" as DayStatus,
    isCurrentMonth: false,
  }));

  const fullDays = new Set([4, 9, 10, 15, 16, 22, 23]);

  const days: CalendarDay[] = [];
  for (let i = 1; i <= 30; i++) {
    let status: DayStatus = "available";
    if (fullDays.has(i)) status = "full";
    if (i === selectedDay) status = "selected";
    days.push({ day: i, status, isCurrentMonth: true });
  }

  return [...fillers, ...days];
}

export default function CalendarWidget() {
  const [selectedDay, setSelectedDay] = useState(6);
  const days = generateCalendarDays(selectedDay);

  useEffect(() => {
    localStorage.setItem("summitpass_booking_date", `2024-09-${selectedDay.toString().padStart(2, "0")}`);
  }, [selectedDay]);

  return (
    <section className="bg-white rounded-xl overflow-hidden card-shadow border border-surface-variant/30">
      <div className="p-6 border-b border-surface-variant/20 bg-primary/5">
        <h3 className="text-xl font-bold text-primary font-headline">
          Pilih Tanggal Pendakian
        </h3>
        <p className="text-sm text-on-surface-variant">
          Ketersediaan langsung untuk jalur Wates &amp; Patakbanteng.
        </p>
      </div>
      <div className="p-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-lg text-secondary font-headline">
            September 2024
          </h4>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-surface-variant rounded-full transition-colors text-primary">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="p-2 hover:bg-surface-variant rounded-full transition-colors text-primary">
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
                  className="h-12 flex items-center justify-center text-outline/30"
                >
                  {day.day}
                </div>
              );
            }

            if (day.status === "full") {
              return (
                <button
                  key={`day-${day.day}`}
                  disabled
                  className="h-12 rounded-lg bg-surface-variant/40 text-outline/50 font-medium flex flex-col items-center justify-center cursor-not-allowed"
                >
                  <span>{day.day}</span>
                  <span className="text-[8px] font-bold uppercase">Penuh</span>
                </button>
              );
            }

            if (day.status === "selected") {
              return (
                <button
                  key={`day-${day.day}`}
                  className="h-12 rounded-lg forest-gradient text-white font-bold flex flex-col items-center justify-center shadow-lg ring-4 ring-primary-container"
                >
                  <span>{day.day}</span>
                  <span className="text-[8px] font-bold uppercase">
                    Terpilih
                  </span>
                </button>
              );
            }

            return (
              <button
                key={`day-${day.day}`}
                onClick={() => setSelectedDay(day.day)}
                className="h-12 rounded-lg bg-primary-container/40 text-primary font-bold flex flex-col items-center justify-center transition-all hover:bg-primary-container"
              >
                <span>{day.day}</span>
                <span className="w-1 h-1 bg-primary rounded-full"></span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 flex gap-6 text-[10px] font-bold uppercase tracking-widest text-secondary">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary-container"></span>
            <span>Tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-surface-variant"></span>
            <span>Penuh</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full forest-gradient"></span>
            <span>Terpilih</span>
          </div>
        </div>
      </div>
    </section>
  );
}
