import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../config/defaults'
import { buildMessage } from './message'
import { quote, type Quote } from './pricing'

function build(saidaData: string, pet = 'Thor') {
  const q = quote(
    { entradaData: '2026-03-02', entradaHora: '07:00', saidaData, saidaHora: '07:00' },
    DEFAULT_CONFIG,
  ) as Quote
  return buildMessage(q, pet, DEFAULT_CONFIG)
}

describe('orçamento para WhatsApp (RN-11)', () => {
  it('traz datas, diárias, valores e pagamento já calculados', () => {
    expect(build('2026-03-03')).toBe(
      [
        'Hospedagem — Hotelzinho Snow&Cia',
        '',
        'Pet: Thor',
        '',
        'Período: 02/03/2026 às 07h até 03/03/2026 às 07h',
        '',
        'Quantidade de diárias: 1',
        '',
        'Valores:',
        '',
        '- 1 × R$ 50,00 (Seg a qui)',
        '- Total: R$ 50,00',
        '',
        'Pagamento:',
        '',
        '- Sinal de 25%: R$ 12,50.',
        '- Saldo restante: R$ 37,50.',
        '',
        'Formas de pagamento: Pix, cartão ou dinheiro.',
      ].join('\n'),
    )
  })

  it('omite a linha do pet quando o nome está vazio', () => {
    expect(build('2026-03-03', '  ')).not.toContain('Pet:')
  })

  it('agrupa diárias iguais e avisa sobre a promoção', () => {
    const texto = build('2026-03-10')
    expect(texto).toContain('- 8 × R$ 50,00 (Promoção)')
    expect(texto).toContain('- Total: R$ 400,00')
    expect(texto).toContain('Observação: como a hospedagem passa de 6 diárias')
  })

  it('não leva caracteres invisíveis nem espaço sem quebra', () => {
    expect(build('2026-03-10')).not.toMatch(/[\u200b-\u200d\u2060\ufeff\u00a0]/)
  })
})
