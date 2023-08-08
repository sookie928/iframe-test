import { create } from 'zustand'

interface ILoadingStoreProps {
  perc: number
  setPerc: (perc: number) => void
}

export const useLoadingStore = create<ILoadingStoreProps>((set) => ({
  perc: 0,
  setPerc: (perc: number) => {
    set({perc})
  }
  // setLanguage: (lang: 'ko' | 'en') => {
  //   localStorage.setItem('locales', lang)
  //   set({language: lang})
  // },
  // setIsMenuOpen: (isOpen: boolean) => {
  //   set({isMenuOpen: isOpen})
  // },
  // off: () => set((state) => ({isLoading: false})),
  // on: () => set((state) => ({isLoading: true}))
}))
