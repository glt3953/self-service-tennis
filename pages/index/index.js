// pages/index/index.js
Page({
  data: {
    courts: [],
    todayBookings: [],
    userInfo: null
  },

  onLoad() {
    this.loadCourts()
    this.loadTodayBookings()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadCourts()
    this.loadTodayBookings()
  },

  // 加载场地数据
  async loadCourts() {
    try {
      wx.showLoading({ title: '加载中...' })
      const courts = await getApp().api.getCourts()
      this.setData({ courts })
    } catch (error) {
      console.error('加载场地数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 加载今日预约
  async loadTodayBookings() {
    try {
      const bookings = await getApp().api.getBookings()
      const today = new Date().toDateString()
      const todayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date).toDateString()
        return bookingDate === today && booking.status === 'confirmed'
      })
      this.setData({ todayBookings })
    } catch (error) {
      console.error('加载今日预约失败:', error)
    }
  },

  // 刷新场地状态
  refreshCourts() {
    this.loadCourts()
    wx.showToast({
      title: '已刷新',
      icon: 'success',
      duration: 1000
    })
  },

  // 跳转到预约页面
  goToBooking() {
    wx.switchTab({
      url: '/pages/booking/booking'
    })
  },

  // 查看场地详情
  viewCourts() {
    wx.navigateTo({
      url: '/pages/court/court'
    })
  },

  // 跳转到历史记录
  goToHistory() {
    wx.switchTab({
      url: '/pages/history/history'
    })
  },

  // 联系客服
  contactService() {
    wx.showActionSheet({
      itemList: ['拨打电话', '在线客服', '意见反馈'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.makeCall()
            break
          case 1:
            wx.showToast({
              title: '客服功能开发中',
              icon: 'none'
            })
            break
          case 2:
            wx.showToast({
              title: '反馈功能开发中',
              icon: 'none'
            })
            break
        }
      }
    })
  },

  // 拨打电话
  makeCall(e) {
    const phone = e?.currentTarget?.dataset?.phone || '400-123-4567'
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        wx.showToast({
          title: '拨号失败',
          icon: 'error'
        })
      }
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '24小时无人网球馆 - 随时预约，智能管理',
      path: '/pages/index/index',
      imageUrl: '/images/share-bg.jpg'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '24小时无人网球馆',
      imageUrl: '/images/share-bg.jpg'
    }
  }
})