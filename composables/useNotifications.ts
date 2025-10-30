import type { Notification } from '~/types'

export const useNotifications = () => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()

  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  // Getters
  const unreadNotifications = computed(() => notifications.value.filter(n => !n.is_read))
  const notificationsByType = (type: string) => notifications.value.filter(n => n.type === type)
  const recentNotifications = computed(() => notifications.value.slice(0, 5))

  // Actions
  const fetchNotifications = async () => {
    if (!user.value) { return }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.value.id)
        .order('timestamp', { ascending: false })

      if (error) { throw error }

      notifications.value = data || []
      unreadCount.value = notifications.value.filter(n => !n.is_read).length
    } catch (error: any) {
      console.error('Error fetching notifications:', error)
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true } as any)
        .eq('id', notificationId)

      if (error) { throw error }

      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification && !notification.is_read) {
        notification.is_read = true
        unreadCount.value--
      }
    } catch (error: any) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user.value) { return }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true } as any)
        .eq('user_id', user.value.id)
        .eq('is_read', false)

      if (error) { throw error }

      // Update local state
      notifications.value.forEach((n) => {
        n.is_read = true
      })
      unreadCount.value = 0
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const subscribeToRealtime = () => {
    if (!user.value) { return }

    const { showInfo } = useUI()

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.value.id}`
        },
        (payload) => {
          notifications.value.unshift(payload.new as Notification)
          unreadCount.value++

          // Show snackbar notification
          showInfo(payload.new.message)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    // State
    notifications,
    unreadCount,
    loading: readonly(loading),
    // Getters
    unreadNotifications,
    notificationsByType,
    recentNotifications,
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    subscribeToRealtime
  }
}
