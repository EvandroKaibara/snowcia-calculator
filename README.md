# Snow&Cia Calculator

Calculadoras do Hotelzinho Snow&Cia, em quatro abas. A de hospedagem recebe data e horário de entrada e de saída, conta as diárias e aplica a tarifa de cada uma. A de Catsitter recebe os gatos, o período e as visitas e calcula o valor de cada dia de atendimento. As duas geram o orçamento em texto para envio por WhatsApp. Tudo roda no navegador, sem backend.

## Stack

- React 19 e TypeScript
- Vite 8 e Vitest 5
- CSS Modules, sem biblioteca de UI e sem biblioteca de datas

## Uso

Requer Node.js recente (desenvolvido com a versão 24).

| Comando           | Efeito                                      |
| ----------------- | ------------------------------------------- |
| `npm install`     | Instala as dependências                     |
| `npm run dev`     | Servidor de desenvolvimento                 |
| `npm test`        | Executa os testes unitários                 |
| `npm run build`   | Verifica os tipos e gera `dist/`            |
| `npm run preview` | Serve o build de produção localmente        |

O conteúdo de `dist/` é estático e usa caminhos relativos (`base: './'`). Funciona em qualquer hospedagem estática, na raiz ou em subpasta.

## Regras de cálculo

### Quantidade de diárias

Cada diária dura 24 horas contadas a partir do horário de entrada. Há 1 hora de tolerância após cada período. A duração real é medida em minutos.

```
n = max(1, ceil((minutos - toleranciaMin) / duracaoMin))
```

| Permanência | Diárias |
| ----------- | ------- |
| 24h         | 1       |
| 25h         | 1       |
| 25h01       | 2       |
| 49h         | 2       |
| 49h01       | 3       |

A diária `i` começa em `entrada + i * duracaoMin`. A virada da meia-noite não cria diária nova.

### Tarifa de cada diária

A tarifa é definida pela data em que a diária começa. Vale a primeira condição verdadeira:

| Ordem | Condição                            | Valor padrão |
| ----- | ----------------------------------- | ------------ |
| 1     | Feriado                             | R$ 75,00     |
| 2     | Dezembro ou janeiro                 | R$ 60,00     |
| 3     | Estadia com mais de 6 diárias       | R$ 50,00     |
| 4     | Sexta a domingo                     | R$ 60,00     |
| 5     | Segunda a quinta                    | R$ 50,00     |

A promoção da ordem 3 vale para todas as diárias comuns da estadia, não só as posteriores à sexta. Feriado, dezembro e janeiro nunca recebem o valor promocional.

### Pagamento

- Valores em centavos, sem ponto flutuante.
- Total: soma das diárias calculadas individualmente.
- Sinal: 25% do total, arredondado ao centavo. Saldo: total menos o sinal.
- Limite de 365 diárias por orçamento.

## Catsitter

Cada data do período, do início ao término e com as duas incluídas, é um dia de atendimento. O valor de cada dia é calculado separadamente:

```
dia = base + (gatos - 1) * adicionalGato + visitasAdicionais * visitaExtra + taxaFeriado
```

| Item                                    | Valor padrão |
| --------------------------------------- | ------------ |
| Base, 1 gato, com 2 visitas incluídas   | R$ 25,00     |
| Adicional por gato                      | R$ 15,00     |
| Visita adicional (além das 2 incluídas) | R$ 15,00     |
| Taxa de feriado, por dia de serviço     | R$ 10,00     |

- A taxa de feriado é cobrada uma vez por dia, qualquer que seja o número de gatos ou de visitas.
- As visitas adicionais por dia valem para todos os dias do período. Cada dia da lista tem um campo próprio para ajustar só aquele dia. Alterar o valor padrão descarta esses ajustes.
- Os horários das visitas não são pedidos nem aparecem no orçamento. Só a quantidade conta.
- Os feriados são os mesmos da hospedagem, incluindo as datas extras do painel.
- Limite de 365 dias por orçamento.

## Passeios

Atendimento em uma única data. O passeio é cobrado por unidade, e cada passeio adicional no mesmo dia recebe desconto, seja qual for o número de cachorros:

```
unitário = base + (cachorros - 1) * adicionalCachorro
total = unitário + (passeios - 1) * (unitário - desconto)
```

| Item                                   | Valor padrão |
| -------------------------------------- | ------------ |
| Primeiro passeio, 1 cachorro           | R$ 20,00     |
| Adicional por cachorro                 | R$ 15,00     |
| Desconto por passeio adicional no dia  | R$ 5,00      |

- Um orçamento cobre um dia. Vários dias exigem um orçamento por dia.
- Feriados são identificados na tela, mas não geram taxa.
- Horários dos passeios não são pedidos nem entram no orçamento.

## DayCare

Atendimento em uma única data, cobrado por cachorro. A duração vem só da diferença entre entrada e saída; a saída precisa ser depois da entrada. A modalidade é escolhida à mão e nunca muda sozinha.

```
horasAdicionais = max(0, ceil((minutos - limite) / 60))
total = (modalidade + horasAdicionais * horaExtra + taxaFeriado) * cachorros + passeiosExtras * (passeio + (cachorrosNoPasseio - 1) * adicionalCachorro)
```

| Item                                         | Valor padrão    |
| -------------------------------------------- | --------------- |
| Meio período (até 6 h, 1 passeio incluído)   | R$ 30,00        |
| Integral (até 12 h, 2 passeios incluídos)    | R$ 45,00        |
| Hora adicional iniciada, por cachorro        | R$ 5,00         |
| Passeio extra de 20 min, 1 cachorro          | R$ 10,00        |
| Cachorro adicional no passeio extra          | R$ 5,00         |
| Taxa de feriado, por cachorro                | R$ 10,00        |
| Sinal de reserva                             | 50% do total    |

- A taxa de feriado vale uma vez por cachorro, nas duas modalidades, e não depende dos passeios. Os feriados são os mesmos da hospedagem.
- Os passeios incluídos não geram cobrança. Os cachorros nos passeios extras acompanham o total de cachorros até serem reduzidos.
- Não há limite de horas excedentes nem conversão automática para integral (ponto ainda em aberto na regra de negócio).

## Feriados

`holidaysFor(ano)` devolve os feriados de São Paulo (SP) para qualquer ano:

- Nacionais fixos e Sexta-feira da Paixão.
- Estadual: 09/07.
- Municipais da capital: 25/01 e Corpus Christi.

A Páscoa é calculada pelo algoritmo de Meeus/Jones/Butcher. Carnaval e pontos facultativos não contam como feriado. Datas especiais e correções de nome entram pelo painel de configurações e prevalecem sobre a lista calculada.

## Configuração

O painel "Configurações de preços" edita as cinco tarifas da hospedagem, o limite da promoção, a duração da diária, a tolerância de saída e os feriados extras. O bloco Catsitter edita o valor-base, o adicional por gato, a visita adicional, a taxa de feriado e a quantidade de visitas incluídas por dia (apenas informativa: o preço depende das visitas adicionais informadas). As alterações valem para os cálculos seguintes e ficam salvas no `localStorage` do navegador (chave `snowcia-config`). Os valores padrão estão em `src/config/defaults.ts`.

## Estrutura

```
src/
  config/        valores padrão e tipo Config
  lib/           regras de negócio em funções puras, sem React
    pricing.ts     contagem de diárias, tarifas, sinal e saldo
    catsitter.ts   dias de atendimento, adicionais e taxa de feriado
    passeio.ts     passeios do dia, adicionais por cachorro e desconto
    daycare.ts     modalidade, horas adicionais, passeios extras, feriado e sinal
    holidays.ts    feriados por ano e cálculo da Páscoa
    message.ts     texto do orçamento (hospedagem e catsitter)
    format.ts      moeda, data, hora e duração em pt-BR
  hooks/         estado do formulário, orçamento, configuração, clipboard
  components/    um componente por pasta, com o CSS Module ao lado
  styles/        tokens de cor (paleta da marca) e estilos globais
  App.tsx        composição da tela
```

## Testes

85 testes unitários em `src/lib` cobrem a contagem de diárias nas bordas de tolerância, as tarifas por categoria, estadias que cruzam meses e feriados, o arredondamento do sinal, a validação de entrada, o cálculo de feriados, os critérios de aceitação do catsitter e dos passeios e do DayCare e o texto dos orçamentos.

## Limitações

- A configuração é por aparelho. Não há sincronização entre dispositivos.
- Os feriados fixos são os de São Paulo (SP), nas duas calculadoras. Para outra localidade, edite a lista em `src/lib/holidays.ts`.
- Datas e horários usam o fuso do navegador. O cálculo soma 24 horas fixas por diária, o que é correto sem horário de verão (o Brasil não o adota desde 2019).
