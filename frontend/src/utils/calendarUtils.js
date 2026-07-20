const getDaysInMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

const getFirstDayOfWeek = (year, monthIndex) => {
  return new Date(year, monthIndex, 1).getDay();
};

export const getMonthGridData = (year, monthIndex) => {
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstDayOfWeek = getFirstDayOfWeek(year, monthIndex);

  return {
    blanks: Array.from({ length: firstDayOfWeek }, (_, i) => i),
    days: Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      return {
        dayNum,
        dayDate: new Date(year, monthIndex, dayNum)
      };
    })
  };
};

export const getLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWeekStartLocalDate = (date) => {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday, etc.
  d.setDate(d.getDate() - dayOfWeek);
  return getLocalDateString(d);
};

export const getNextSundayLocalDate = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = 7 - day;
  const nextSunday = new Date(d.getTime() + diff * 24 * 60 * 60 * 1000);
  return getLocalDateString(nextSunday);
};

