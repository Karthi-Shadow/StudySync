// Human-friendly time formatting for faculty presentations & daily study tracking

export const formatMinutes = (mins) => {
  const totalMins = Math.round(Number(mins) || 0);
  if (totalMins === 0) return '0 mins';
  if (totalMins < 60) return `${totalMins} mins`;
  const hrs = Math.floor(totalMins / 60);
  const remMins = totalMins % 60;
  if (remMins === 0) return `${totalMins} mins (${hrs} hrs)`;
  return `${totalMins} mins (${hrs}h ${remMins}m)`;
};

export const formatHoursToMinutes = (hrs) => {
  const mins = Math.round((Number(hrs) || 0) * 60);
  return formatMinutes(mins);
};
