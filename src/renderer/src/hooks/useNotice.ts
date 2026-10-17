import { useCallback, useEffect, useRef, useState } from 'react'

export type NoticeKind = 'success' | 'error'

export type NoticeState = {
  id: number
  kind: NoticeKind
  text: string
}

const SUCCESS_DURATION = 5000
const ERROR_DURATION = 10000

export function useNotice() {
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const dismissNotice = useCallback(() => {
    clearTimer()
    setNotice(null)
  }, [clearTimer])

  const showNotice = useCallback(
    (kind: NoticeKind, text: string) => {
      clearTimer()
      setNotice({ id: Date.now(), kind, text })

      timerRef.current = window.setTimeout(
        () => {
          timerRef.current = null
          setNotice(null)
        },
        kind === 'error' ? ERROR_DURATION : SUCCESS_DURATION
      )
    },
    [clearTimer]
  )

  useEffect(() => clearTimer, [clearTimer])

  return { notice, showNotice, dismissNotice }
}
