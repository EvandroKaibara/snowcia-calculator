import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../config/defaults'
import { buildPasseioMessage } from './message'
import { passeioQuote, type PasseioInput, type PasseioQuote } from './passeio'

// 02/03/2026 é uma segunda-feira comum; 21/04/2026 é Tiradentes.
const base: PasseioInput = {
  modo: 'unica',
  inicioData: '2026-03-02',
  fimData: '',
  caes: 1,
  passeiosPorDia: 1,
  limpezasPorDia: 0,
  porData: {},
}
function ok(extra: Partial<PasseioInput> = {}, config = DEFAULT_CONFIG): PasseioQuote {
  const r = passeioQuote({ ...base, ...extra }, config)
  if (!r.ok) throw new Error(r.erro)
  return r
}
const total = (extra: Partial<PasseioInput>) => ok(extra).total

// Período do exemplo da especificação: 28/11 a 01/12, 1 cachorro.
const periodo: Partial<PasseioInput> = {
  modo: 'periodo',
  inicioData: '2026-11-28',
  fimData: '2026-12-01',
  porData: {
    '2026-11-28': { passeios: 2, limpezas: 1 },
    '2026-11-29': { passeios: 3, limpezas: 0 },
    '2026-11-30': { passeios: 1, limpezas: 1 },
    '2026-12-01': { passeios: 2, limpezas: 1 },
  },
}

describe('valores por passeios e cachorros (centavos)', () => {
  it.each([
    [1, 1, 2500],
    [1, 2, 4500],
    [1, 3, 6500],
    [2, 1, 4000],
    [2, 2, 7500],
    [2, 3, 11000],
    [3, 1, 5500],
    [3, 2, 10500],
    [3, 3, 15500],
    [4, 1, 7000],
  ])('%i cachorro(s), %i passeio(s)', (caes, passeiosPorDia, esperado) => {
    expect(total({ caes, passeiosPorDia })).toBe(esperado)
  })

  it('zero passeios custa zero', () => {
    expect(total({ passeiosPorDia: 0 })).toBe(0)
  })
})

describe('limpeza / troca de ração e água', () => {
  it.each([
    [1, 1, 3500],
    [2, 1, 5500],
    [3, 1, 7500],
    [0, 1, 1000],
    [2, 2, 6500],
  ])('%i passeio(s) + %i limpeza(s) = %i', (passeiosPorDia, limpezasPorDia, esperado) => {
    expect(total({ passeiosPorDia, limpezasPorDia })).toBe(esperado)
  })

  it('não multiplica pelos cachorros nem altera o desconto dos passeios', () => {
    expect(ok({ caes: 3, passeiosPorDia: 2, limpezasPorDia: 1 })).toMatchObject({ liquido: 10500, limpezaValor: 1000, total: 11500 })
  })
})

describe('período', () => {
  it('reproduz o exemplo: subtotais por data e total', () => {
    const q = ok(periodo)
    expect(q.dias.map((d) => d.subtotal)).toEqual([5500, 6500, 3500, 5500])
    expect(q).toMatchObject({
      n: 4,
      diasComAtendimento: 4,
      passeios: 8,
      limpezas: 3,
      bruto: 20000,
      desconto: 2000,
      liquido: 18000,
      limpezaValor: 3000,
      total: 21000,
    })
  })

  it('o desconto reinicia a cada data', () => {
    const q = ok({ modo: 'periodo', inicioData: '2026-11-28', fimData: '2026-11-29', passeiosPorDia: 2 })
    expect(q.dias.map((d) => d.subtotal)).toEqual([4500, 4500])
    expect(q.total).toBe(9000)
  })

  it('atravessa meses e anos', () => {
    const q = ok({ modo: 'periodo', inicioData: '2026-12-30', fimData: '2027-01-02' })
    expect(q.dias.map((d) => d.chave)).toEqual(['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02'])
  })

  it('aceita dia sem serviços dentro do período', () => {
    const q = ok({ ...periodo, porData: { '2026-11-29': { passeios: 0, limpezas: 0 } }, passeiosPorDia: 1 })
    expect(q.dias[1].subtotal).toBe(0)
    expect(q.diasComAtendimento).toBe(3)
    expect(q.total).toBe(7500)
  })

  it('a data única ignora fim e ajustes por data de um período anterior', () => {
    const q = ok({ ...periodo, modo: 'unica', inicioData: '2026-11-28', passeiosPorDia: 1 })
    expect(q).toMatchObject({ n: 1, total: 2500 })
  })
})

describe('configuração e feriado', () => {
  it('feriado é informado, mas não altera o preço', () => {
    const q = ok({ inicioData: '2026-04-21' })
    expect(q.dias[0]).toMatchObject({ subtotal: 2500, feriado: 'Tiradentes' })
    expect(ok().dias[0].feriado).toBeUndefined()
  })

  it('a configuração altera o cálculo', () => {
    expect(ok({ passeiosPorDia: 2 }, { ...DEFAULT_CONFIG, pasDesconto: 0 }).total).toBe(5000)
    expect(ok({ limpezasPorDia: 1 }, { ...DEFAULT_CONFIG, pasLimpeza: 1500 }).total).toBe(4000)
  })

  it('o valor antigo de R$ 20,00 não é mais o padrão', () => {
    expect(DEFAULT_CONFIG.pasBase).toBe(2500)
  })
})

describe('validação', () => {
  it('datas em branco são só dica', () => {
    expect(passeioQuote({ ...base, inicioData: '' }, DEFAULT_CONFIG)).toMatchObject({ ok: false, vazio: true })
    expect(passeioQuote({ ...base, modo: 'periodo', inicioData: '2026-03-02' }, DEFAULT_CONFIG)).toMatchObject({ ok: false, vazio: true })
  })
  it('rejeita data inexistente, zero cachorros e término antes do início', () => {
    expect(passeioQuote({ ...base, inicioData: '2026-02-30' }, DEFAULT_CONFIG)).toMatchObject({ ok: false, vazio: false })
    expect(passeioQuote({ ...base, caes: 0 }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
    expect(passeioQuote({ ...base, modo: 'periodo', fimData: '2026-03-01' }, DEFAULT_CONFIG)).toMatchObject({ ok: false, vazio: false })
  })
  it('limita o período a 365 dias', () => {
    expect(passeioQuote({ ...base, modo: 'periodo', fimData: '2027-03-02' }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
    expect(passeioQuote({ ...base, modo: 'periodo', fimData: '2027-03-01' }, DEFAULT_CONFIG)).toMatchObject({ ok: true, n: 365 })
  })
})

describe('texto do orçamento', () => {
  it('período: detalha cada data e o resumo', () => {
    expect(buildPasseioMessage(ok(periodo), 'Rex')).toBe(
      [
        'Passeios — Hotelzinho Snow&Cia',
        '',
        'Pet: Rex',
        '',
        'Período: 28/11/2026 a 01/12/2026',
        '',
        'Quantidade de cachorros: 1',
        '',
        'Serviços por data:',
        '',
        '28/11 — 2 passeios + 1 limpeza / troca de ração e água: R$ 55,00',
        '',
        '29/11 — 3 passeios: R$ 65,00',
        '',
        '30/11 — 1 passeio + 1 limpeza / troca de ração e água: R$ 35,00',
        '',
        '01/12 — 2 passeios + 1 limpeza / troca de ração e água: R$ 55,00',
        '',
        'Resumo:',
        '',
        '- Quantidade total de passeios: 8.',
        '- Valor bruto dos passeios: R$ 200,00.',
        '- Descontos aplicados: − R$ 20,00.',
        '- Valor líquido dos passeios: R$ 180,00.',
        '- 3 serviços de limpeza / troca de ração e água: R$ 30,00.',
        '',
        'Total: R$ 210,00.',
      ].join('\n'),
    )
  })

  it('data única: sem período, sem pet e sem linha de limpeza quando não há', () => {
    const msg = buildPasseioMessage(ok({ passeiosPorDia: 2 }), '')
    expect(msg).toContain('Data: 02/03/2026')
    expect(msg).toContain('02/03 — 2 passeios: R$ 45,00')
    expect(msg).not.toMatch(/Período|Pet:|limpeza/)
  })

  it('omite dias sem serviços e mostra horários quando informados', () => {
    const msg = buildPasseioMessage(
      ok({ modo: 'periodo', inicioData: '2026-11-28', fimData: '2026-11-29', porData: { '2026-11-28': { passeios: 0 }, '2026-11-29': { horarios: '9h e 16h' } } }),
      '',
    )
    expect(msg).not.toContain('28/11 —')
    expect(msg).toContain('29/11 — 1 passeio (horários: 9h e 16h): R$ 25,00')
  })
})
