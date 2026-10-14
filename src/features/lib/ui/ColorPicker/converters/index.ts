import { Color, HSLA, HSVA, RGBA } from '../types'

export const toHex = (value: string): string => {
  if (!value.startsWith('#')) {
    const ctx = document.createElement('canvas').getContext('2d')

    if (!ctx) {
      throw new Error('2d context not supported or canvas already initialized')
    }

    ctx.fillStyle = value

    return ctx.fillStyle
  } else if (value.length === 4 || value.length === 5) {
    value = value
      .split('')
      .map((v, i) => (i ? v + v : '#'))
      .join('')

    return value
  } else if (value.length === 7 || value.length === 9) {
    return value
  }

  return '#00000000'
}

export const hex2rgba = (hex: string): RGBA => {
  const rbgArr = (
    hex
      .replace(
        /^#?([a-f\d])([a-f\d])([a-f\d]([a-f\d]))$/i,
        (m, r, g, b, a) => '#' + r + r + g + g + b + b + (a ? a + a : ''),
      )
      .substring(1)
      .match(/.{2}/g) || []
  ).map((x) => parseInt(x, 16))

  return {
    r: rbgArr[0],
    g: rbgArr[1],
    b: rbgArr[2],
    a: rbgArr[3] !== undefined ? rbgArr[3] / 255 : 1,
  }
}

export const rgba2hsla = ({ r, g, b, a }: RGBA): HSLA => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min

  const h = d
    ? (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? 2 + (b - r) / d : 4 + (r - g) / d) *
      60
    : 0

  const l = (max + min) / 2

  const s = d === 0 || d === 1 ? 0 : d / (1 - Math.abs(2 * l - 1))

  return { h, s: s * 100, l: l * 100, a }
}

export const rgba2hsva = ({ r, g, b, a }: RGBA): HSVA => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)

  const h = d
    ? (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? 2 + (b - r) / d : 4 + (r - g) / d) *
      60
    : 0
  const s = max ? (d / max) * 100 : 0
  const v = max * 100

  return { h, s, v, a }
}

export const hsva2rgba = ({ h, s, v, a }: HSVA): RGBA => {
  s /= 100
  v /= 100

  const i = ~~(h / 60)
  const f = h / 60 - i
  const p = v * (1 - s)
  const q = v * (1 - s * f)
  const t = v * (1 - s * (1 - f))
  const index = i % 6

  const r = Math.round([v, q, p, p, t, v][index] * 255)
  const g = Math.round([t, v, v, q, p, p][index] * 255)
  const b = Math.round([p, p, t, v, v, q][index] * 255)

  return { b, g, r, a }
}

//https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB
export const hsla2rgba = ({ h, s, l, a }: HSLA): RGBA => {
  s /= 100
  l /= 100

  const i = ~~(h / 60)
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((i % 2) - 1))
  const m = l - c / 2
  const index = i % 6

  const rgb = [
    [c, x, 0], // 0 <= h < 1
    [x, c, 0], // 1 <= h < 2
    [0, c, x], // 2 <= h < 3
    [0, x, c], // 3 <= h < 4
    [x, 0, c], // 4 <= h < 5
    [c, 0, x], // 5 <= h < 6
  ][index]

  const r = Math.round((rgb[0] + m) * 255)
  const g = Math.round((rgb[1] + m) * 255)
  const b = Math.round((rgb[2] + m) * 255)

  return { r, g, b, a }
}

//https://en.wikipedia.org/wiki/HSL_and_HSV
const hslaToHsva = ({ h, s, l, a }: HSLA): HSVA => {
  const v = l / 100 + (s / 100) * Math.min(l / 100, 1 - l / 100)
  const sat = v === 0 ? 0 : 2 * (1 - l / 100 / v)

  return { h, s: sat * 100, v: v * 100, a }
}

//https://en.wikipedia.org/wiki/HSL_and_HSV
const hsvaToHsla = ({ h, s, v, a }: HSVA): HSLA => {
  const l = (v / 100) * (1 - s / 100 / 2)
  const sat = l === 0 || l === 1 ? 0 : (v / 100 - l) / Math.min(l, 1 - l)
  return { h, s: sat * 100, l: l * 100, a }
}

export const rgba2hex = ({ b, g, r, a }: RGBA): string => {
  const alpha = Math.floor(a * 255)
    .toString(16)
    .padStart(2, '0')
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('') + alpha
}

export const transformColor = <M extends keyof Color, C extends Color[M]>(
  format: M,
  color: C,
): Color => {
  let hex: Color['hex'] = toHex('#121212ff')
  let rgba: Color['rgba'] = hex2rgba(hex)
  let hsva: Color['hsva'] = rgba2hsva(rgba)
  let hsla: Color['hsla'] = rgba2hsla(rgba)

  if (format === 'hex') {
    const value = color as Color['hex']

    hex = toHex(value)
    rgba = hex2rgba(hex)
    hsva = rgba2hsva(rgba)
    hsla = rgba2hsla(rgba)
  } else if (format === 'rgba') {
    const value = color as Color['rgba']

    rgba = value
    hex = rgba2hex(rgba)
    hsva = rgba2hsva(rgba)
    hsla = rgba2hsla(rgba)
  } else if (format === 'hsva') {
    const value = color as Color['hsva']

    hsva = value
    rgba = hsva2rgba(hsva)
    hex = rgba2hex(rgba)
    hsla = hsvaToHsla(hsva)
  } else if (format === 'hsla') {
    const value = color as Color['hsla']

    hsla = value
    rgba = hsla2rgba(hsla)
    hex = rgba2hex(rgba)
    hsva = hslaToHsva(hsla)
  }

  return { hex, hsva, hsla, rgba }
}

export const clamp = (value: number, max: number, min: number) => {
  return value > max ? max : value < min ? min : value
}

export const roundNumber = (number: number, decimals: number) => {
  const coefficient = Math.pow(10, decimals)

  return Math.round((number + Number.EPSILON) * coefficient) / coefficient
}
