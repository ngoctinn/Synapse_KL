export function formatPrice(price: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
}

export function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} phút`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}p` : `${hours} giờ`
}
