export function formatDate(dateString?: string) {

  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

}