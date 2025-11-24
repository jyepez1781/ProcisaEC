
export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};

export const calculateAge = (dateStr: string) => {
  const years = new Date().getFullYear() - new Date(dateStr).getFullYear();
  return years;
};

export const calculateDays = (start: string, end: string | null) => {
  const d1 = new Date(start);
  const d2 = end ? new Date(end) : new Date();
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
