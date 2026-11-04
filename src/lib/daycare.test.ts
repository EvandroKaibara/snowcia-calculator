import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../config/defaults'
import { daycareQuote, type DaycareInput, type DaycareQuote } from './daycare'

// 10/11/2026 é terça-feira comum; 20/11/2026 é feriado (Consciência Negra).
const base: DaycareInput = {
  data: '2026-11-10',
  entradaHora: '09:00',
  saidaHora: '15:00',
  caes: 1,
  modalidade: 'meio',
  passeiosExtras: 0,
  caesPasseio: 1,
}
function ok(extra: Partial<DaycareInput> = {}, config = DEFAULT_CONFIG): DaycareQuote {
  const r = daycareQuote({ ...base, ...extra }, config)
  if (!r.ok) throw new Error(r.erro)
  return r
}
const total = (extra: Partial<DaycareInput>) => ok(extra).total

describe('critérios de aceitação do DayCare', () => {
  it('09h às 15h são 6 horas; 09h às 16h30 são 7h30', () => {
    expect(ok().minutos).toBe(360)
    expect(ok({ saidaHora: '16:30' }).minutos).toBe(450)
  })
  it('meio período: 6h R$ 30, 7h R$ 35, 7h01 R$ 40', () => {
    expect(total({})).toBe(3000)
    expect(total({ saidaHora: '16:00' })).toBe(3500)
    expect(total({ saidaHora: '16:01' })).toBe(4000)
  })
  it('6h30 custa R$ 35 e 8h custa R$ 40', () => {
    expect(total({ saidaHora: '15:30' })).toBe(3500)
    expect(total({ saidaHora: '17:00' })).toBe(4000)
  })
  it('integral de 12h: R$ 45', () => expect(total({ modalidade: 'integral', saidaHora: '21:00' })).toBe(4500))
  it('2 e 3 cachorros, sem adicionais', () => {
    expect(total({ caes: 2 })).toBe(6000)
    expect(total({ caes: 3 })).toBe(9000)
    expect(total({ caes: 2, modalidade: 'integral' })).toBe(9000)
    expect(total({ caes: 3, modalidade: 'integral' })).toBe(13500)
  })
  it('horas adicionais são por cachorro', () => expect(total({ caes: 2, saidaHora: '16:01' })).toBe(8000))
  it('passeios extras: 1 cão R$ 40; 2 cães, 1 passeio R$ 75; 2 cães, 2 passeios R$ 90', () => {
    expect(total({ passeiosExtras: 1 })).toBe(4000)
    expect(total({ caes: 2, passeiosExtras: 1, caesPasseio: 2 })).toBe(7500)
    expect(total({ caes: 2, passeiosExtras: 2, caesPasseio: 2 })).toBe(9000)
    expect(total({ caes: 2, passeiosExtras: 1, caesPasseio: 1 })).toBe(7000)
  })
  it('feriado: meio R$ 40 / R$ 80, integral R$ 55 / R$ 110', () => {
    const f = { data: '2026-11-20' }
    expect(total(f)).toBe(4000)
    expect(total({ ...f, caes: 2 })).toBe(8000)
    expect(total({ ...f, modalidade: 'integral', saidaHora: '21:00' })).toBe(5500)
    expect(total({ ...f, modalidade: 'integral', saidaHora: '21:00', caes: 2 })).toBe(11000)
  })
  it('a taxa de feriado não depende dos passeios e soma com horas e passeios', () => {
    const q = ok({ data: '2026-11-20', saidaHora: '16:01', passeiosExtras: 2 })
    expect(q).toMatchObject({ taxaFeriado: 1000, horasExtrasValor: 1000, passeiosValor: 2000, total: 3000 + 1000 + 1000 + 2000 })
  })
  it('não troca a modalidade sozinho', () => expect(ok({ saidaHora: '20:00' }).modalidade).toBe('meio'))
})

describe('sinal e configuração', () => {
  it('sinal de 50% e saldo', () => expect(ok({ saidaHora: '16:01' })).toMatchObject({ total: 4000, sinal: 2000, saldo: 2000 }))
  it('a configuração altera limite, hora adicional e sinal', () => {
    const config = { ...DEFAULT_CONFIG, dcLimiteMeioMin: 480, dcHoraExtra: 1000, dcSinalPct: 30 }
    expect(ok({ saidaHora: '17:00' }, config).total).toBe(3000)
    expect(ok({ saidaHora: '18:00' }, config)).toMatchObject({ total: 4000, sinal: 1200 })
  })
})

describe('validação', () => {
  it('campos em branco são só dica', () => {
    expect(daycareQuote({ ...base, data: '' }, DEFAULT_CONFIG)).toMatchObject({ ok: false, vazio: true })
  })
  it('saída igual ou anterior à entrada impede o cálculo', () => {
    expect(daycareQuote({ ...base, saidaHora: '09:00' }, DEFAULT_CONFIG)).toMatchObject({ ok: false, vazio: false })
    expect(daycareQuote({ ...base, saidaHora: '08:00' }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
  })
  it('rejeita zero cachorros e cachorros demais nos passeios', () => {
    expect(daycareQuote({ ...base, caes: 0 }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
    expect(daycareQuote({ ...base, passeiosExtras: 1, caesPasseio: 2 }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
  })
})
