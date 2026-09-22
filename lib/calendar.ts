export function generateGoogleCalenderUrl( {
    title,
    description,
    startDate,
    durationHours = 2,
  }: {
    title: string;
    description: string;
    startDate: Date;
    durationHours?: number;
  }): string {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationHours* 60 * 60 * 1000);
    const formatIsoUtc = (date:Date) =>
        date.toISOString().replace(/-|:|\.\d\d\d/g, ""); 
    

    const datesParam = `${formatIsoUtc(start)}/${formatIsoUtc(end)} `;
    const params = new URLSearchParams({
        action:"TEMPATE",
        text:description,
        date:datesParam,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}