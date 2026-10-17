import type { NoticeState } from '../../hooks/useNotice'

type NoticeProps = {
  notice: NoticeState | null
  onDismiss: () => void
}

function Notice({ notice, onDismiss }: NoticeProps) {
  if (!notice) {
    return null
  }

  return (
    <div
      key={notice.id}
      className={`notice ${notice.kind}`}
      role={notice.kind === 'error' ? 'alert' : 'status'}
    >
      <span>{notice.text}</span>

      <button type="button" onClick={onDismiss} aria-label="Fechar aviso">
        ×
      </button>
    </div>
  )
}

export default Notice
