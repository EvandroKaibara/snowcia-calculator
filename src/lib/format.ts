const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const pad = (n: number) => String(n).padStart(2, '0')

// O Intl usa espaço sem quebra entre "R$" e o número; troco por espaço comum para o texto do WhatsApp.
export const formatBRL = (centavos: number) => brl.format(centavos / 100).replace(/\u00a0/g, ' ')

export const formatDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`

export const formatDayMonth = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`

export function formatTime(d: Date) {
  const min = d.getMinutes()
  return `${pad(d.getHours())}h${min ? pad(min) : ''}`
}

export const formatDateTime = (d: Date) => `${formatDate(d)} às ${formatTime(d)}`

export function formatDuration(minutos: number) {
  const dias = Math.floor(minutos / 1440)
  const horas = Math.floor((minutos % 1440) / 60)
  const min = minutos % 60
  const partes = [
    dias && `${dias} ${dias === 1 ? 'dia' : 'dias'}`,
    horas && `${horas} h`,
    min && `${min} min`,
  ].filter(Boolean) as string[]
  return partes.length > 1 ? `${partes.slice(0, -1).join(', ')} e ${partes.at(-1)}` : partes[0]
}
