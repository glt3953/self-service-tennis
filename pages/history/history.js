// pages/history/history.js
Page({
  data: {
    activeTab: 'all',
    bookings: [],
    filteredBookings: [],
    showDetailModal: false,
    selectedBooking: null
  },

  onLoad() {
    this.loadBookings()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadBookings()
  },

  // 加载预约记录
  async loadBookings() {
    try {
      const bookings = await getApp().api.getBookings()
      // 按创建时间倒序排列
      bookings.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      
      this.setData({ bookings })
      this.filterBookings()
    } catch (error) {
      console.error('加载预约记录失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    this.filterBookings()
  },

  // 筛选预约记录
  filterBookings() {
    const { bookings, activeTab } = this.data
    let filteredBookings = []

    switch (activeTab) {
      case 'all':
        filteredBookings = bookings
        break
      case 'confirmed':
        filteredBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'paid')
        break
      case 'completed':
        filteredBookings = bookings.filter(b => b.status === 'completed')
        break
      case 'cancelled':
        filteredBookings = bookings.filter(b => b.status === 'cancelled')
        break
    }

    this.setData({ filteredBookings })
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'confirmed': '已确认',
      'paid': '已支付',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || '未知状态'
  },

  // 获取标签文本
  getTabText(tab) {
    const tabMap = {
      'all': '全部',
      'confirmed': '已确认',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return tabMap[tab] || ''
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekday = weekdays[date.getDay()]
    
    return `${month}月${day}日 ${weekday}`
  },

  // 格式化时间
  formatTime(timeStr) {
    const date = new Date(timeStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${month}月${day}日 ${hours}:${minutes}`
  },

  // 取消预约
  async cancelBooking(e) {
    const bookingId = e.currentTarget.dataset.id
    
    const res = await new Promise((resolve) => {
      wx.showModal({
        title: '确认取消',
        content: '确定要取消这个预约吗？取消后可能产生手续费。',
        success: resolve
      })
    })

    if (!res.confirm) return

    try {
      wx.showLoading({ title: '取消中...' })
      await getApp().api.cancelBooking(bookingId)
      
      wx.showToast({
        title: '取消成功',
        icon: 'success'
      })
      
      // 刷新数据
      this.loadBookings()
    } catch (error) {
      console.error('取消预约失败:', error)
      wx.showToast({
        title: '取消失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 查看详情
  viewDetails(e) {
    const booking = e.currentTarget.dataset.booking
    this.setData({
      selectedBooking: booking,
      showDetailModal: true
    })
  },

  // 关闭详情弹窗
  closeDetailModal() {
    this.setData({
      showDetailModal: false,
      selectedBooking: null
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止点击事件冒泡
  },

  // 评价预约
  rateBooking(e) {
    const bookingId = e.currentTarget.dataset.id
    wx.showToast({
      title: '评价功能开发中',
      icon: 'none'
    })
  },

  // 重新预约相同场地
  rebookSame(e) {
    const booking = e.currentTarget.dataset.booking
    
    wx.showModal({
      title: '重新预约',
      content: `是否重新预约${booking.courtName}？`,
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/booking/booking'
          })
        }
      }
    })
  },

  // 跳转到预约页面
  goToBooking() {
    wx.switchTab({
      url: '/pages/booking/booking'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadBookings().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '24小时无人网球馆',
      path: '/pages/index/index'
    }
  }
})