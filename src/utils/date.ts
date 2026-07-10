// src/utils/date.ts
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export function formatDate(date: string | Date, locale: 'en' | 'ar' = 'en', formatStr = 'PPP') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, formatStr, { locale: locale === 'ar' ? ar : enUS });
}

export function formatRelativeTime(date: string | Date, locale: 'en' | 'ar' = 'en') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return formatDistanceToNow(d, { addSuffix: true, locale: locale === 'ar' ? ar : enUS });
}

export function getDaysBetween(start: string | Date, end: string | Date) {
  const s = typeof start === 'string' ? parseISO(start) : start;
  const e = typeof end === 'string' ? parseISO(end) : end;
  if (!isValid(s) || !isValid(e)) return 0;
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}