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
