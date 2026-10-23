import type { Config } from '../config/defaults'
import { formatBRL, formatDateTime } from './format'
import type { Quote } from './pricing'

function linhasDeValores(q: Quote) {
  const grupos = new Map<string, { qtd: number; centavos: number; rotulo: string }>()
  for (const d of q.diarias) {
    const chave = `${d.rotulo}|${d.centavos}`
    const g = grupos.get(chave) ?? { qtd: 0, centavos: d.centavos, rotulo: d.rotulo }
    g.qtd++
    grupos.set(chave, g)
  }
  return [...grupos.values()].map((g) => `- ${g.qtd} × ${formatBRL(g.centavos)} (${g.rotulo})`)
}

export function buildMessage(q: Quote, pet: string, config: Config): string {
  const nome = pet.trim()
  const linhas = [
    'Hospedagem — Hotelzinho Snow&Cia',
    '',
    ...(nome ? [`Pet: ${nome}`, ''] : []),
    `Período: ${formatDateTime(q.entrada)} até ${formatDateTime(q.saida)}`,
    '',
    `Quantidade de diárias: ${q.n}`,
    '',
    'Valores:',
    '',
    ...linhasDeValores(q),
    `- Total: ${formatBRL(q.total)}`,
    '',
    'Pagamento:',
    '',
    `- Sinal de 25%: ${formatBRL(q.sinal)}.`,
    `- Saldo restante: ${formatBRL(q.saldo)}.`,
    '',
    'Formas de pagamento: Pix, cartão ou dinheiro.',
  ]
  if (q.promoAplicada) {
    linhas.push(
      '',
      `Observação: como a hospedagem passa de ${config.limitePromo} diárias, os períodos comuns saem a ${formatBRL(config.promo)} a diária.`,
    )
  }
  return linhas.join('\n')
}
