// src/components/booking/CalendarPickerModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
  addDays,
  differenceInCalendarDays,
  startOfDay,
} from 'date-fns';
import { arEG, enUS } from 'date-fns/locale';
import { useTheme } from '@/hooks/useTheme';

interface CalendarPickerModalProps {
  visible: boolean;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  onClose: () => void;
  onConfirm: (checkIn: string, checkOut: string) => void;
  minDate?: Date;
}

export const CalendarPickerModal = ({
  visible,
  checkIn,
  checkOut,
  onClose,
  onConfirm,
  minDate = startOfDay(new Date()),
}: CalendarPickerModalProps) => {
  const { t, i18n } = useTranslation();
  const { colors, isDark, isRTL } = useTheme();
  const dateLocale = i18n.language === 'ar' ? arEG : enUS;

  const parseDateStr = (str?: string): Date | null => {
    if (!str) return null;
    const parts = str.split('-').map(Number);
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      if (!isNaN(d.getTime())) return startOfDay(d);
    }
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : startOfDay(parsed);
  };

  const toDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedIn, setSelectedIn] = useState<Date | null>(() => parseDateStr(checkIn) || addDays(minDate, 1));
  const [selectedOut, setSelectedOut] = useState<Date | null>(() => parseDateStr(checkOut) || addDays(minDate, 4));
  const [currentMonth, setCurrentMonth] = useState<Date>(() => selectedIn || new Date());

  useEffect(() => {
    if (visible) {
      const inDate = parseDateStr(checkIn) || addDays(minDate, 1);
      const outDate = parseDateStr(checkOut) || addDays(inDate, 3);
      setSelectedIn(inDate);
      setSelectedOut(outDate);
      setCurrentMonth(inDate);
    }
  }, [visible, checkIn, checkOut]);

  const daysGrid = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const weekDayNames = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(start, i);
      return format(day, 'EEEEEE', { locale: dateLocale });
    });
  }, [dateLocale]);

  const handleDayPress = (day: Date) => {
    if (isBefore(day, minDate)) return;

    if (!selectedIn || (selectedIn && selectedOut)) {
      // First click: select checkIn and clear checkOut
      setSelectedIn(day);
      setSelectedOut(null);
    } else if (selectedIn && !selectedOut) {
      // Second click: select checkOut or reselect checkIn
      if (isBefore(day, selectedIn)) {
        setSelectedIn(day);
        setSelectedOut(null);
      } else if (isSameDay(day, selectedIn)) {
        // Can't check out on the same day -> minimum 1 night
        setSelectedOut(addDays(day, 1));
      } else {
        setSelectedOut(day);
      }
    }
  };

  const handlePrevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    if (!isBefore(endOfMonth(prev), minDate)) {
      setCurrentMonth(prev);
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const canGoPrev = !isBefore(endOfMonth(subMonths(currentMonth, 1)), minDate);

  const totalNights = useMemo(() => {
    if (!selectedIn || !selectedOut) return 0;
    return Math.max(0, differenceInCalendarDays(selectedOut, selectedIn));
  }, [selectedIn, selectedOut]);

  const handleApplyPreset = (nights: number, offsetDays = 0) => {
    const newIn = addDays(minDate, offsetDays);
    const newOut = addDays(newIn, nights);
    setSelectedIn(newIn);
    setSelectedOut(newOut);
    setCurrentMonth(newIn);
  };

  const handleApplyWeekend = () => {
    const today = minDate;
    const dayOfWeek = today.getDay(); // 0 is Sunday, 4 is Thursday, 5 is Friday
    const daysUntilThu = (4 - dayOfWeek + 7) % 7 || 7;
    const nextThu = addDays(today, daysUntilThu);
    const nextSun = addDays(nextThu, 3);
    setSelectedIn(nextThu);
    setSelectedOut(nextSun);
    setCurrentMonth(nextThu);
  };

  const handleConfirm = () => {
    if (!selectedIn) return;
    const finalIn = selectedIn;
    const finalOut = selectedOut && isAfter(selectedOut, finalIn) ? selectedOut : addDays(finalIn, 1);
    onConfirm(toDateString(finalIn), toDateString(finalOut));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant + '33',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.onSurface }]}>
                {t('bookings.selectStayDates', 'Select Stay Dates')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                {t('bookings.tapToSelectRange', 'Choose your check-in and check-out dates')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.surfaceContainerHighest }]}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Selected Summary Cards */}
          <View style={styles.datesSummaryRow}>
            {/* Check-In Card */}
            <View
              style={[
                styles.dateBadgeCard,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: selectedIn ? '#C8922A' : colors.outlineVariant + '33',
                },
              ]}
            >
              <View style={styles.badgeLabelRow}>
                <Ionicons name="calendar-outline" size={13} color="#C8922A" />
                <Text style={[styles.badgeLabel, { color: colors.outline }]}>
                  {t('hotelDetail.checkIn', 'Check-in')}
                </Text>
              </View>
              <Text style={[styles.badgeDateValue, { color: colors.onSurface }]}>
                {selectedIn
                  ? format(selectedIn, 'EEE, d MMM', { locale: dateLocale })
                  : t('bookings.selectDate', 'Select Date')}
              </Text>
            </View>

            {/* Nights Pill in Center */}
            <View style={[styles.nightsPill, { backgroundColor: '#C8922A1A', borderColor: '#C8922A4D' }]}>
              <Text style={[styles.nightsPillText, { color: '#C8922A' }]}>
                {totalNights > 0
                  ? `${totalNights} ${t('bookings.nightsCount', 'night(s)')}`
                  : '→'}
              </Text>
            </View>

            {/* Check-Out Card */}
            <View
              style={[
                styles.dateBadgeCard,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: selectedOut ? '#C8922A' : colors.outlineVariant + '33',
                },
              ]}
            >
              <View style={styles.badgeLabelRow}>
                <Ionicons name="log-out-outline" size={13} color="#C8922A" />
                <Text style={[styles.badgeLabel, { color: colors.outline }]}>
                  {t('hotelDetail.checkOut', 'Check-out')}
                </Text>
              </View>
              <Text style={[styles.badgeDateValue, { color: colors.onSurface }]}>
                {selectedOut
                  ? format(selectedOut, 'EEE, d MMM', { locale: dateLocale })
                  : t('bookings.selectDate', 'Select Date')}
              </Text>
            </View>
          </View>

          {/* Quick Presets */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetsContainer}
          >
            <TouchableOpacity
              style={[styles.presetChip, { backgroundColor: colors.surfaceContainerHighest }]}
              onPress={handleApplyWeekend}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetChipText, { color: colors.onSurface }]}>
                {t('bookings.presets.thisWeekend', 'This Weekend (3N)')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetChip, { backgroundColor: colors.surfaceContainerHighest }]}
              onPress={() => handleApplyPreset(3, 1)}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetChipText, { color: colors.onSurface }]}>
                {t('bookings.presets.threeNights', 'Tomorrow (3 Nights)')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetChip, { backgroundColor: colors.surfaceContainerHighest }]}
              onPress={() => handleApplyPreset(7, 1)}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetChipText, { color: colors.onSurface }]}>
                {t('bookings.presets.oneWeek', '1 Week Stay')}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Month Navigation */}
          <View style={styles.monthNavigationRow}>
            <TouchableOpacity
              onPress={handlePrevMonth}
              disabled={!canGoPrev}
              style={[
                styles.navArrowButton,
                { opacity: canGoPrev ? 1 : 0.25, backgroundColor: colors.surfaceContainerHighest },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isRTL ? 'chevron-forward' : 'chevron-back'}
                size={18}
                color={colors.onSurface}
              />
            </TouchableOpacity>

            <Text style={[styles.monthTitleText, { color: colors.onSurface }]}>
              {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
            </Text>

            <TouchableOpacity
              onPress={handleNextMonth}
              style={[styles.navArrowButton, { backgroundColor: colors.surfaceContainerHighest }]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isRTL ? 'chevron-back' : 'chevron-forward'}
                size={18}
                color={colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          {/* Weekday Headers */}
          <View style={styles.weekDaysRow}>
            {weekDayNames.map((dayName, idx) => (
              <View key={idx} style={styles.weekDayCell}>
                <Text style={[styles.weekDayText, { color: colors.outline }]}>
                  {dayName}
                </Text>
              </View>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.gridContainer}>
            {daysGrid.map((day, idx) => {
              const isCurrentMonthDay = isSameMonth(day, currentMonth);
              const isPastDay = isBefore(day, minDate);
              const isTodayDay = isSameDay(day, new Date());
              const isCheckInDay = selectedIn ? isSameDay(day, selectedIn) : false;
              const isCheckOutDay = selectedOut ? isSameDay(day, selectedOut) : false;
              const isInRange =
                selectedIn && selectedOut
                  ? isAfter(day, selectedIn) && isBefore(day, selectedOut)
                  : false;

              let cellBg = 'transparent';
              if (isInRange) cellBg = '#C8922A26';

              return (
                <View
                  key={idx}
                  style={[
                    styles.dayCellWrapper,
                    {
                      backgroundColor: cellBg,
                      borderTopLeftRadius: isCheckInDay ? 20 : 0,
                      borderBottomLeftRadius: isCheckInDay ? 20 : 0,
                      borderTopRightRadius: isCheckOutDay ? 20 : 0,
                      borderBottomRightRadius: isCheckOutDay ? 20 : 0,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => isCurrentMonthDay && !isPastDay && handleDayPress(day)}
                    disabled={!isCurrentMonthDay || isPastDay}
                    style={[
                      styles.dayButton,
                      (isCheckInDay || isCheckOutDay) && styles.selectedDayButton,
                      isTodayDay && !isCheckInDay && !isCheckOutDay && styles.todayOutline,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayNumberText,
                        {
                          color: !isCurrentMonthDay || isPastDay
                            ? colors.outlineVariant + '55'
                            : isCheckInDay || isCheckOutDay
                            ? '#FFFFFF'
                            : colors.onSurface,
                          fontWeight: isCheckInDay || isCheckOutDay || isTodayDay ? '700' : '500',
                        },
                      ]}
                    >
                      {format(day, 'd')}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelBtn, { borderColor: colors.outlineVariant + '4D' }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelBtnText, { color: colors.onSurfaceVariant }]}>
                {t('common.cancel', 'Cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!selectedIn}
              style={[
                styles.confirmBtn,
                { opacity: selectedIn ? 1 : 0.5 },
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>
                {totalNights > 0
                  ? t('bookings.confirmNights', `Confirm ${totalNights} Night(s)`)
                  : t('bookings.selectCheckOut', 'Pick Check-out Date')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datesSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  dateBadgeCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 10,
  },
  badgeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeDateValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  nightsPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  nightsPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  presetsContainer: {
    gap: 8,
    paddingBottom: 14,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  monthNavigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navArrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleText: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekDayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayCellWrapper: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayButton: {
    backgroundColor: '#C8922A',
    shadowColor: '#C8922A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  todayOutline: {
    borderWidth: 1.5,
    borderColor: '#C8922A',
  },
  dayNumberText: {
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C8922A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C8922A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
