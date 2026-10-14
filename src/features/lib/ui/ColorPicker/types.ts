export interface RGB {
  b: number
  g: number
  r: number
}

export interface RGBA extends RGB {
  a: number
}

export interface HSV {
  h: number
  s: number
  v: number
}

export interface HSVA extends HSV {
  a: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

export interface HSLA extends HSL {
  a: number
}

export interface Color {
  hex: string
  hsva: HSVA
  hsla: HSLA
  rgba: RGBA
}

export interface Position {
  x: number
  y: number
}
