import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../config/defaults'
import { catsitterQuote, type CatsitterInput, type CatsitterQuote } from './catsitter'

// 02/03/2026 é segunda-feira; 21/04/2026 é Tiradentes (feriado).
function ok(inicio: string, fim: string, extra: Partial<CatsitterInput> = {}, config = DEFAULT_CONFIG): CatsitterQuote {
  const r = catsitterQuote(
    { inicioData: inicio, fimData: fim, gatos: 1, extrasPorDia: 0, extrasPorData: {}, ...extra },
    config,
  )
  if (!r.ok) throw new Error(r.erro)
  return r
}

describe('critérios de aceitação do catsitter', () => {
  it('1 gato, 1 dia, 2 visitas: R$ 25,00', () => expect(ok('2026-03-02', '2026-03-02').total).toBe(2500))
  it('2 gatos, 1 dia: R$ 40,00', () => expect(ok('2026-03-02', '2026-03-02', { gatos: 2 }).total).toBe(4000))
  it('1 gato, 3 visitas: R$ 40,00', () => expect(ok('2026-03-02', '2026-03-02', { extrasPorDia: 1 }).total).toBe(4000))
  it('1 gato em feriado: R$ 35,00', () => expect(ok('2026-04-21', '2026-04-21').total).toBe(3500))
  it('2 gatos em feriado: R$ 50,00', () => expect(ok('2026-04-21', '2026-04-21', { gatos: 2 }).total).toBe(5000))
  it('3 dias comuns: R$ 75,00', () => expect(ok('2026-03-02', '2026-03-04').total).toBe(7500))
  it('3 dias com 1 feriado: R$ 85,00', () => {
    const q = ok('2026-04-20', '2026-04-22')
    expect(q.total).toBe(8500)
    expect(q.diasFeriado).toBe(1)
  })
  it('2 dias com 1 visita adicional em cada: R$ 80,00', () =>
    expect(ok('2026-03-02', '2026-03-03', { extrasPorDia: 1 }).total).toBe(8000))
})

describe('detalhamento e regras', () => {
  it('separa base, gatos, visitas e feriados', () => {
    const q = ok('2026-04-20', '2026-04-21', { gatos: 3, extrasPorDia: 1 })
    expect(q).toMatchObject({ n: 2, base: 5000, adicionalGatos: 6000, visitas: 3000, feriados: 1000, visitasExtras: 2 })
    expect(q.total).toBe(5000 + 6000 + 3000 + 1000)
  })

  it('visitas de um dia específico sobrepõem o padrão', () => {
    const q = ok('2026-03-02', '2026-03-03', { extrasPorDia: 1, extrasPorData: { '2026-03-03': 3 } })
    expect(q.dias.map((d) => d.extras)).toEqual([1, 3])
    expect(q.total).toBe(2500 * 2 + 4 * 1500)
  })

  it('período que cruza o ano usa o feriado de cada ano', () => {
    expect(ok('2026-12-31', '2027-01-01').diasFeriado).toBe(1)
  })

  it('feriado extra da configuração conta', () => {
    const config = { ...DEFAULT_CONFIG, feriadosExtras: [{ data: '2026-03-02', nome: 'Evento' }] }
    expect(ok('2026-03-02', '2026-03-02', {}, config).total).toBe(3500)
  })

  it('a configuração altera os cálculos', () => {
    expect(ok('2026-03-02', '2026-03-02', {}, { ...DEFAULT_CONFIG, catBase: 3000 }).total).toBe(3000)
  })
})

describe('validação', () => {
  const base = { inicioData: '2026-03-02', fimData: '2026-03-02', gatos: 1, extrasPorDia: 0, extrasPorData: {} }

  it('campo em branco é só dica', () => {
    expect(catsitterQuote({ ...base, fimData: '' }, DEFAULT_CONFIG)).toMatchObject({ ok: false, vazio: true })
  })

  it('rejeita término antes do início', () => {
    expect(catsitterQuote({ ...base, fimData: '2026-03-01' }, DEFAULT_CONFIG)).toMatchObject({ ok: false, vazio: false })
  })

  it('rejeita data inexistente, zero gatos e período acima do limite', () => {
    expect(catsitterQuote({ ...base, fimData: '2026-02-30' }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
    expect(catsitterQuote({ ...base, gatos: 0 }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
    expect(catsitterQuote({ ...base, fimData: '2028-03-02' }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
  })
})
