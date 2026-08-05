import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react-native';

// ─── Constants ────────────────────────────────────────────────────────────────
const TEAL = '#2563EB';
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const THIS_YEAR = new Date().getFullYear();
const YEARS: number[] = Array.from({ length: THIS_YEAR - 1919 }, (_, i) => THIS_YEAR - i);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDMY(v: string): Date | null {
  if (!v) return null;
  const [d, m, y] = v.split('/').map(Number);
  if (!d || !m || !y || y < 1900 || y > 2100) return null;
  const date = new Date(y, m - 1, d);
  return date.getMonth() === m - 1 ? date : null;
}
function formatDMY(d: Date) {
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('/');
}
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstWeekday(y: number, m: number) { return new Date(y, m, 1).getDay(); }

// ─── Props ─────────────────────────────────────────────────────────────────────
interface DatePickerInputProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

type Mode = 'calendar' | 'years' | 'months';

// ─── Component ─────────────────────────────────────────────────────────────────
export function DatePickerInput({
  label,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  required,
  error,
}: DatePickerInputProps) {
  const today = new Date();
  const parsed = parseDMY(value);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('calendar');
  const [sel, setSel] = useState<Date | null>(parsed);
  const [vYear, setVYear] = useState(parsed?.getFullYear() ?? today.getFullYear() - 25);
  const [vMonth, setVMonth] = useState(parsed?.getMonth() ?? today.getMonth());

  const yearListRef = useRef<FlatList>(null);

  const handleOpen = () => {
    const p = parseDMY(value);
    setSel(p);
    setVYear(p?.getFullYear() ?? today.getFullYear() - 25);
    setVMonth(p?.getMonth() ?? today.getMonth());
    setMode('calendar');
    setOpen(true);
  };

  useEffect(() => {
    if (mode === 'years' && yearListRef.current) {
      const idx = YEARS.indexOf(vYear);
      if (idx >= 0) {
        setTimeout(() => {
          yearListRef.current?.scrollToIndex({ index: idx, animated: false, viewPosition: 0.4 });
        }, 100);
      }
    }
  }, [mode]);

  const handleOK = () => {
    if (sel) onChange(formatDMY(sel));
    setOpen(false);
  };
  const handleCancel = () => setOpen(false);

  const prevMonth = () => {
    if (vMonth === 0) { setVMonth(11); setVYear(y => y - 1); }
    else setVMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (vMonth === 11) { setVMonth(0); setVYear(y => y + 1); }
    else setVMonth(m => m + 1);
  };

  const selectMonth = (idx: number) => {
    setVMonth(idx);
    if (sel) {
      setSel(new Date(vYear, idx, Math.min(sel.getDate(), daysInMonth(vYear, idx))));
    }
    setMode('calendar');
  };

  const selectYear = (yr: number) => {
    setVYear(yr);
    if (sel) {
      setSel(new Date(yr, sel.getMonth(), Math.min(sel.getDate(), daysInMonth(yr, sel.getMonth()))));
    }
    setMode('calendar');
  };

  // Build calendar grid
  const totalDays = daysInMonth(vYear, vMonth);
  const startDay = firstWeekday(vYear, vMonth);
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isSel = (d: number) =>
    sel?.getFullYear() === vYear && sel?.getMonth() === vMonth && sel?.getDate() === d;

  const headerDate = sel
    ? `${DAY_LABELS[sel.getDay()]}, ${SHORT_MONTHS[sel.getMonth()]} ${sel.getDate()}`
    : 'Pick a date';
  const headerYear = sel?.getFullYear() ?? vYear;

  return (
    <View style={s.wrapper}>
      {label && (
        <Text style={s.label}>
          {label}{required && <Text style={s.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[s.inputBox, error ? s.inputBoxError : null]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={[s.inputText, !value && s.placeholder]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
      {error && <Text style={s.errorMsg}>{error}</Text>}

      <Modal visible={open} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.dialog}>

            {/* ── Teal header ── */}
            <View style={s.header}>
              {/* Year tap → year list */}
              <Pressable onPress={() => setMode(mode === 'years' ? 'calendar' : 'years')}>
                <Text style={[s.headerYear, mode === 'years' && s.headerYearActive]}>
                  {headerYear}
                </Text>
              </Pressable>
              {/* Date tap → back to calendar */}
              <Pressable onPress={() => setMode('calendar')}>
                <Text style={[s.headerDate, mode === 'calendar' && s.headerDateActive]}>
                  {headerDate}
                </Text>
              </Pressable>
            </View>

            {/* ═══ YEAR LIST ═══ */}
            {mode === 'years' && (
              <View style={s.listContainer}>
                <FlatList
                  ref={yearListRef}
                  data={YEARS}
                  keyExtractor={(item) => String(item)}
                  showsVerticalScrollIndicator={false}
                  getItemLayout={(_, index) => ({ length: YEAR_H, offset: YEAR_H * index, index })}
                  renderItem={({ item: yr }) => {
                    const active = yr === vYear;
                    return (
                      <Pressable style={s.yearItem} onPress={() => selectYear(yr)}>
                        <Text style={[s.yearText, active && s.yearTextActive]}>{yr}</Text>
                        {active && <View style={s.yearDot} />}
                      </Pressable>
                    );
                  }}
                />
              </View>
            )}

            {/* ═══ MONTH GRID ═══ */}
            {mode === 'months' && (
              <View style={s.monthsWrap}>
                <Text style={s.monthsTitle}>Select Month — {vYear}</Text>
                <View style={s.monthGrid}>
                  {MONTH_NAMES.map((mn, idx) => {
                    const active = idx === vMonth;
                    return (
                      <Pressable
                        key={mn}
                        style={[s.monthCell, active && s.monthCellActive]}
                        onPress={() => selectMonth(idx)}
                      >
                        <Text style={[s.monthText, active && s.monthTextActive]}>
                          {mn.slice(0, 3)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ═══ CALENDAR ═══ */}
            {mode === 'calendar' && (
              <View style={s.body}>
                {/* Nav row */}
                <View style={s.navRow}>
                  <Pressable onPress={prevMonth} style={s.navBtn}>
                    <ChevronLeft size={22} color="#555" />
                  </Pressable>

                  {/* ← Tap "July 2001 ∨" to open month picker */}
                  <Pressable
                    onPress={() => setMode('months')}
                    style={s.navTitleBtn}
                  >
                    <Text style={s.navTitle}>
                      {MONTH_NAMES[vMonth]} {vYear}
                    </Text>
                    <ChevronDown size={14} color={TEAL} />
                  </Pressable>

                  <Pressable onPress={nextMonth} style={s.navBtn}>
                    <ChevronRight size={22} color="#555" />
                  </Pressable>
                </View>

                {/* Weekday labels */}
                <View style={s.weekRow}>
                  {DAY_NAMES.map((wd, i) => (
                    <Text key={i} style={s.weekday}>{wd}</Text>
                  ))}
                </View>

                {/* Day grid */}
                <View style={s.grid}>
                  {cells.map((day, idx) => {
                    if (day === null) return <View key={`e${idx}`} style={s.cell} />;
                    const selected = isSel(day);
                    return (
                      <Pressable
                        key={`d${day}`}
                        style={s.cell}
                        onPress={() => setSel(new Date(vYear, vMonth, day))}
                      >
                        <View style={[s.dayCircle, selected && s.dayCircleSel]}>
                          <Text style={[s.dayText, selected && s.dayTextSel]}>
                            {day}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── CANCEL / OK ── */}
            <View style={s.actions}>
              <Pressable onPress={handleCancel} style={s.actionBtn}>
                <Text style={s.actionText}>CANCEL</Text>
              </Pressable>
              <Pressable onPress={handleOK} style={s.actionBtn}>
                <Text style={[s.actionText, !sel && s.actionTextDisabled]}>OK</Text>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const CELL_SIZE = 36;
const YEAR_H = 44;

const s = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#1e293b', marginBottom: 6 },
  required: { color: '#EF4444' },

  inputBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inputBoxError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  inputText: { fontSize: 15, color: '#0F172A', fontWeight: '500' },
  placeholder: { color: '#94A3B8', fontWeight: '400' },
  errorMsg: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Overlay / dialog
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },

  // Teal header
  header: {
    backgroundColor: TEAL,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerYear: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
    marginBottom: 4,
  },
  headerYearActive: { color: '#fff', fontWeight: '700' },
  headerDate: {
    fontSize: 30,
    color: 'rgba(255,255,255,0.80)',
    fontWeight: '400',
  },
  headerDateActive: { color: '#fff' },

  // Year list
  listContainer: { height: 280 },
  yearItem: {
    height: YEAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  yearText: { fontSize: 16, color: '#64748B', fontWeight: '400' },
  yearTextActive: { fontSize: 22, color: TEAL, fontWeight: '700' },
  yearDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL },

  // Month grid
  monthsWrap: { padding: 16 },
  monthsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.4,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  monthCell: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  monthCellActive: { backgroundColor: TEAL },
  monthText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  monthTextActive: { color: '#FFFFFF', fontWeight: '700' },

  // Calendar
  body: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    cursor: 'pointer' as any,
  },
  navTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },

  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 2 },
  weekday: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    height: CELL_SIZE + 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSel: { backgroundColor: TEAL },
  dayText: { fontSize: 14, color: '#1e293b', fontWeight: '400' },
  dayTextSel: { color: '#FFFFFF', fontWeight: '700' },

  // Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  actionText: { fontSize: 14, fontWeight: '700', color: TEAL, letterSpacing: 0.8 },
  actionTextDisabled: { color: '#CBD5E1' },
});
