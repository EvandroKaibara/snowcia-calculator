import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../config/defaults'
import { passeioQuote, type PasseioInput, type PasseioQuote } from './passeio'

// 02/03/2026 é segunda-feira.
function ok(dias: number, passeiosPorDia: number, caes = 1, extra: Partial<PasseioInput> = {}): PasseioQuote {
  const fim = `2026-03-0${1 + dias}`
  const r = passeioQuote({ inicioData: '2026-03-02', fimData: fim, caes, passeiosPorDia, passeiosPorData: {}, ...extra }, DEFAULT_CONFIG)
  if (!r.ok) throw new Error(r.erro)
  return r
}

describe('critérios de aceitação dos passeios', () => {
  it('1 cão, 1 passeio: R$ 20', () => expect(ok(1, 1).total).toBe(2000))
  it('1 cão, 2 passeios: R$ 35', () => expect(ok(1, 2).total).toBe(3500))
  it('1 cão, 3 passeios: R$ 50', () => expect(ok(1, 3).total).toBe(5000))
  it('1 cão, 4 passeios: R$ 65', () => expect(ok(1, 4).total).toBe(6500))
  it('2 cães, 1 passeio: R$ 35', () => expect(ok(1, 1, 2).total).toBe(3500))
  it('2 cães, 2 passeios: R$ 65', () => expect(ok(1, 2, 2).total).toBe(6500))
  it('2 cães, 3 passeios: R$ 95', () => expect(ok(1, 3, 2).total).toBe(9500))
  it('2 cães, 4 passeios: R$ 125', () => expect(ok(1, 4, 2).total).toBe(12500))
  it('1 cão, 3 dias com 2 passeios: R$ 105', () => expect(ok(3, 2).total).toBe(10500))
  it('1 cão, 2 dias com 3 passeios: R$ 100', () => expect(ok(2, 3).total).toBe(10000))
  it('2/2/1 passeios em 3 dias: R$ 90', () =>
    expect(ok(3, 2, 1, { passeiosPorData: { '2026-03-04': 1 } }).total).toBe(9000))
})

describe('detalhamento', () => {
  it('separa base, adicionais e desconto, e a soma fecha com o total', () => {
    const q = ok(2, 3, 3)
    expect(q).toMatchObject({ passeios: 6, base: 12000, adicionalCaes: 18000, desconto: 2000, diasAtendidos: 2 })
    expect(q.base + q.adicionalCaes - q.desconto).toBe(q.total)
  })

  it('dia com 0 passeios não é cobrado nem recebe desconto', () => {
    const q = ok(3, 2, 1, { passeiosPorData: { '2026-03-03': 0 } })
    expect(q).toMatchObject({ total: 7000, diasAtendidos: 2, desconto: 1000 })
  })

  it('feriado não altera o preço', () => {
    const r = passeioQuote({ inicioData: '2026-04-21', fimData: '2026-04-21', caes: 1, passeiosPorDia: 1, passeiosPorData: {} }, DEFAULT_CONFIG)
    expect(r).toMatchObject({ ok: true, total: 2000 })
  })

  it('a configuração altera o cálculo', () => {
    const r = passeioQuote({ inicioData: '2026-03-02', fimData: '2026-03-02', caes: 1, passeiosPorDia: 2, passeiosPorData: {} }, { ...DEFAULT_CONFIG, pasDesconto: 0 })
    expect(r).toMatchObject({ ok: true, total: 4000 })
  })
})

describe('validação', () => {
  const base = { inicioData: '2026-03-02', fimData: '2026-03-02', caes: 1, passeiosPorDia: 1, passeiosPorData: {} }
  it('rejeita campos vazios, término anterior, zero cães e nenhum passeio', () => {
    expect(passeioQuote({ ...base, fimData: '' }, DEFAULT_CONFIG)).toMatchObject({ ok: false, vazio: true })
    expect(passeioQuote({ ...base, fimData: '2026-03-01' }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
    expect(passeioQuote({ ...base, caes: 0 }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
    expect(passeioQuote({ ...base, passeiosPorDia: 0 }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
  })
})
