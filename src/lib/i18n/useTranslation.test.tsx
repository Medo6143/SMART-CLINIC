import { renderHook, act, waitFor } from '@testing-library/react'
import { useTranslation } from './useTranslation'
import { LanguageProvider } from '@/providers/LanguageProvider'
import React, { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('useTranslation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns English by default', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper })
    expect(result.current.language).toBe('en')
    expect(result.current.t('common.save')).toBe('Save')
  })

  it('can change language to Arabic', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper })
    
    act(() => {
      result.current.changeLanguage('ar')
    })
    
    await waitFor(() => {
      expect(result.current.language).toBe('ar')
    })
    expect(result.current.t('common.save')).toBe('حفظ')
  })

  it('returns fallback for unknown keys', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper })
    expect(result.current.t('unknown.key')).toBe('unknown.key')
  })

  it('has isRTL false for English', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper })
    expect(result.current.isRTL).toBe(false)
  })

  it('has isRTL true for Arabic', async () => {
    const { result } = renderHook(() => useTranslation(), { wrapper })
    
    act(() => {
      result.current.changeLanguage('ar')
    })
    
    await waitFor(() => {
      expect(result.current.isRTL).toBe(true)
    })
  })
})
