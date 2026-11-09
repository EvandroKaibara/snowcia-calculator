import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../config/defaults'
import { quote, type Quote } from './pricing'

function ok(entrada: [string, string], saida: [string, string], config = DEFAULT_CONFIG): Quote {
  const r = quote(
    { entradaData: entrada[0], entradaHora: entrada[1], saidaData: saida[0], saidaHora: saida[1] },
    config,
  )
  if (!r.ok) throw new Error(r.erro)
  return r
}

// 02/03/2026 é segunda-feira, sem feriado em março.
const SEG = '2026-03-02'

describe('quantidade de diárias (RN-01 a RN-03)', () => {
  it.each([
    ['24h', ['2026-03-03', '07:00'], 1],
    ['25h', ['2026-03-03', '08:00'], 1],
    ['25h01', ['2026-03-03', '08:01'], 2],
    ['48h', ['2026-03-04', '07:00'], 2],
    ['49h', ['2026-03-04', '08:00'], 2],
    ['49h01', ['2026-03-04', '08:01'], 3],
    ['1 minuto', ['2026-03-02', '07:01'], 1],
  ] as const)('%s', (_, saida, n) => {
    expect(ok([SEG, '07:00'], [...saida]).n).toBe(n)
  })
})

describe('tarifas (RN-04 a RN-08)', () => {
  it('8 diárias em período comum somam R$ 400,00', () => {
    const q = ok([SEG, '07:00'], ['2026-03-10', '07:00'])
    expect(q.n).toBe(8)
    expect(q.promoAplicada).toBe(true)
    expect(q.total).toBe(40000)
  })

  it('8 diárias em dezembro somam R$ 480,00', () => {
    const q = ok(['2026-12-01', '07:00'], ['2026-12-09', '07:00'])
    expect(q.n).toBe(8)
    expect(q.promoAplicada).toBe(false)
    expect(q.total).toBe(48000)
  })

  it('6 diárias não ganham promoção', () => {
    const q = ok([SEG, '07:00'], ['2026-03-08', '07:00'])
    expect(q.n).toBe(6)
    expect(q.promoAplicada).toBe(false)
  })

  it('segunda a quinta custam 50 e sexta a domingo custam 60', () => {
    expect(ok(['2026-03-02', '10:00'], ['2026-03-03', '10:00']).total).toBe(5000)
    expect(ok(['2026-03-07', '10:00'], ['2026-03-08', '10:00']).total).toBe(6000)
  })

  it('feriado custa R$ 75,00, inclusive em dezembro', () => {
    expect(ok(['2026-04-21', '10:00'], ['2026-04-22', '10:00']).total).toBe(7500)
    expect(ok(['2026-12-25', '10:00'], ['2026-12-26', '10:00']).total).toBe(7500)
  })

  it('estadia que cruza meses cobra cada diária pela sua data', () => {
    // dom 29/11 (60), seg 30/11 (50), 01/12 (60), 02/12 (60)
    const q = ok(['2026-11-29', '07:00'], ['2026-12-03', '07:00'])
    expect(q.diarias.map((d) => d.centavos)).toEqual([6000, 5000, 6000, 6000])
    expect(q.total).toBe(23000)
  })

  it('diária que atravessa o feriado vale pela data de início', () => {
    // começa em 08/07 às 22h e termina em 09/07 (feriado): tarifa normal
    expect(ok(['2026-07-08', '22:00'], ['2026-07-09', '22:00']).total).toBe(5000)
    expect(ok(['2026-07-09', '07:00'], ['2026-07-10', '07:00']).total).toBe(7500)
  })

  it('feriado extra cadastrado na configuração vale R$ 75,00', () => {
    const config = { ...DEFAULT_CONFIG, feriadosExtras: [{ data: '2026-03-02', nome: 'Evento' }] }
    expect(ok([SEG, '10:00'], ['2026-03-03', '10:00'], config).total).toBe(7500)
  })

  it('a configuração altera os cálculos novos', () => {
    const config = { ...DEFAULT_CONFIG, semana: 5500 }
    expect(ok([SEG, '10:00'], ['2026-03-03', '10:00'], config).total).toBe(5500)
  })
})

describe('sinal e saldo (RN-10)', () => {
  it('R$ 400,00 vira sinal de R$ 200,00 e saldo de R$ 200,00', () => {
    const q = ok([SEG, '07:00'], ['2026-03-10', '07:00'])
    expect([q.sinal, q.saldo]).toEqual([20000, 20000])
  })

  it('arredonda o sinal em centavos e o saldo fecha o total', () => {
    const q = ok([SEG, '10:00'], ['2026-03-03', '10:00'], { ...DEFAULT_CONFIG, semana: 5001 })
    expect(q.sinal).toBe(2501)
    expect(q.saldo).toBe(2500)
    expect(q.sinal + q.saldo).toBe(q.total)
  })
})

describe('validação (RN-14)', () => {
  const base = { entradaData: SEG, entradaHora: '07:00', saidaData: SEG, saidaHora: '07:00' }

  it('campo em branco é só dica', () => {
    const r = quote({ ...base, saidaHora: '' }, DEFAULT_CONFIG)
    expect(r).toMatchObject({ ok: false, vazio: true })
  })

  it('rejeita saída igual ou anterior à entrada', () => {
    expect(quote(base, DEFAULT_CONFIG)).toMatchObject({ ok: false, vazio: false })
    expect(quote({ ...base, saidaData: '2026-03-01' }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
  })

  it('rejeita data inexistente', () => {
    expect(quote({ ...base, saidaData: '2026-02-30' }, DEFAULT_CONFIG)).toMatchObject({ ok: false, vazio: false })
  })

  it('rejeita estadia acima do limite de diárias', () => {
    expect(quote({ ...base, saidaData: '2028-03-02' }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
  })
})
