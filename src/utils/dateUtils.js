export function nowDate() {
  return new Date().toLocaleDateString("en-CA");
}

export function nowTime() {
  return new Date().toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}