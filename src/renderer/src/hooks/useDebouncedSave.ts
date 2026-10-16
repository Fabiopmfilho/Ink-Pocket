import { useCallback, useEffect, useRef, useState } from 'react'

export type SaveStatus = 'editing' | 'saving' | 'saved' | 'error'

const RETRY_DELAY = 2000
const MAX_RETRIES = 5

export function useDebouncedSave(onSave: (value: string) => void | Promise<void>, delay = 500) {
  const [status, setStatus] = useState<SaveStatus>('saved')

  const saveCallbackRef = useRef(onSave)
  const pendingValueRef = useRef<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const revisionRef = useRef(0)
  const retryCountRef = useRef(0)

  useEffect(() => {
    saveCallbackRef.current = onSave
  }, [onSave])

  const flush = useCallback(async function flushPending(): Promise<void> {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const value = pendingValueRef.current

    if (value === null) {
      return
    }

    pendingValueRef.current = null

    const revision = revisionRef.current

    setStatus('saving')

    try {
      await saveCallbackRef.current(value)

      retryCountRef.current = 0

      if (revision === revisionRef.current) {
        setStatus('saved')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)

      if (revision === revisionRef.current) {
        pendingValueRef.current = value
        setStatus('error')

        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1
          timerRef.current = window.setTimeout(() => {
            void flushPending()
          }, RETRY_DELAY)
        }
      }
    }
  }, [])

  const scheduleSave = useCallback(
    (value: string) => {
      revisionRef.current += 1
      retryCountRef.current = 0
      pendingValueRef.current = value
      setStatus('editing')

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }

      timerRef.current = window.setTimeout(() => {
        void flush()
      }, delay)
    },
    [delay, flush]
  )

  useEffect(() => {
    const flushOnExit = () => {
      void flush()
    }

    window.addEventListener('beforeunload', flushOnExit)

    return () => {
      window.removeEventListener('beforeunload', flushOnExit)

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }

      const pendingValue = pendingValueRef.current

      if (pendingValue !== null) {
        pendingValueRef.current = null

        void (async () => {
          try {
            await saveCallbackRef.current(pendingValue)
          } catch (error) {
            console.error('Erro ao salvar ao sair:', error)
          }
        })()
      }
    }
  }, [flush])

  return {
    status,
    scheduleSave,
    flush
  }
}
