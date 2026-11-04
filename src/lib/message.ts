import type { Config } from '../config/defaults'
import type { CatsitterQuote } from './catsitter'
import type { PasseioQuote } from './passeio'
import { formatBRL, formatDate, formatDateTime, formatDayMonth } from './format'
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

export function buildCatsitterMessage(q: CatsitterQuote, nomes: string, config: Config): string {
  const nome = nomes.trim()
  return [
    'Catsitter — Hotelzinho Snow&Cia',
    '',
    ...(nome ? [`Gato(s): ${nome}.`, ''] : []),
    `Quantidade de gatos: ${q.gatos}.`,
    '',
    `Período: ${formatDate(q.inicio)} até ${formatDate(q.fim)}.`,
    '',
    `Total de dias de serviço: ${q.n}.`,
    '',
    `Visitas incluídas: ${config.catVisitasIncluidas} por dia.`,
    '',
    `Visitas adicionais: ${q.visitasExtras}.`,
    '',
    'Valores:',
    '',
    `- Serviço-base: ${formatBRL(q.base)}.`,
    `- Adicionais por gatos: ${formatBRL(q.adicionalGatos)}.`,
    `- Visitas adicionais: ${formatBRL(q.visitas)}.`,
    `- Taxas de feriado: ${formatBRL(q.feriados)}.`,
    '',
    `Valor total: ${formatBRL(q.total)}.`,
  ].join('\n')
}

export function buildPasseioMessage(q: PasseioQuote, nomes: string): string {
  const nome = nomes.trim()
  const datas = q.dias.filter((d) => d.passeios > 0).map((d) => `${formatDayMonth(d.data)} (${d.passeios})`)
  return [
    'Passeios — Hotelzinho Snow&Cia',
    '',
    ...(nome ? [`Pet(s): ${nome}.`, ''] : []),
    `Período: ${datas.join(', ')}.`,
    '',
    `Quantidade de cachorros: ${q.caes}.`,
    '',
    `Quantidade de passeios: ${q.passeios}.`,
    '',
    'Valores:',
    '',
    `- Passeios-base: ${formatBRL(q.base)}.`,
    `- Adicionais por cachorro: ${formatBRL(q.adicionalCaes)}.`,
    `- Desconto por passeios adicionais: − ${formatBRL(q.desconto)}.`,
    '',
    `Total: ${formatBRL(q.total)}.`,
  ].join('\n')
}
