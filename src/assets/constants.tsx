import Ant from './icons/Ant'
import Document from './icons/Document'
import Heart from './icons/Heart'
import Inf from './icons/Inf'
import Lat from './icons/Lat'
import Med from './icons/Med'
import Note from './icons/Note'
import Pin from './icons/Pin'
import Post from './icons/Post'
import Sup from './icons/Sup'

export const M2B_CONTENT_ICON_LIST = [
  'non', // 없음
  'ntb', // ic_notebook
  'psp', // ic_pushpin
  'not', //document
  'hrt' //heart
]

export const M2B_CONTENT_ICON_MAP: {[key: string]: any} = {
  non: '',
  ntb: <Note />,
  psp: <Pin />,
  not: <Document />,
  hrt: <Heart />
}

export const M2B_CONTENT_TITLE_KEY_LIST = [
  'S01',
  'S02',
  'S03',
  'S04',
  'S05',
  'S06'
]

export const M2B_CONTENT_TITLE_MAP: {[key: string]: string} = {
  S01: '시술요약',
  S02: '어떤 시술인가요?',
  //  S03: '콘텐츠 제작사',
  S04: '관련 의료기기 업체',
  S05: '어떤 모델인가요?',
  S06: '관련질환'
}

export const MEDEL_VIEW_MODE_MAP: {[key: string]: any} = {
  Ant: Ant,
  Post: Post,
  Lat: Lat,
  Med: Med,
  Sup: Sup,
  Inf: Inf
}
