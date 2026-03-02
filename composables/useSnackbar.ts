interface SnackbarState {
  show: boolean
  message: string
  color: string
  timeout: number
}

export const useSnackbar = () => {
  const state = useState<SnackbarState>('snackbar', () => ({
    show: false,
    message: '',
    color: 'info',
    timeout: 3000
  }))

  const showSnackbar = (message: string, color: string = 'info', timeout: number = 3000) => {
    state.value = {
      show: true,
      message,
      color,
      timeout
    }
  }

  const showSuccess = (message: string) => {
    showSnackbar(message, 'success')
  }

  const showError = (message: string) => {
    showSnackbar(message, 'error', 5000)
  }

  const showWarning = (message: string) => {
    showSnackbar(message, 'warning', 4000)
  }

  const showInfo = (message: string) => {
    showSnackbar(message, 'info')
  }

  const hide = () => {
    state.value.show = false
  }

  return {
    state,
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hide
  }
}
