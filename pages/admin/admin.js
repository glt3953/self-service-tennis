// pages/admin/admin.js
Page({
  data: {
    isAdmin: false,
    adminPassword: '',
    todayStats: {
      bookings: 12,
      revenue: 2400,
      usage: 75,
      users: 8
    },
    courts: [],
    recentBookings: []
  },

  onLoad() {
    // 检查是否已经是管理员身份
    const isAdmin = wx.getStorageSync('isAdmin')
    if (isAdmin) {
      this.setData({ isAdmin: true })
      this.loadAdminData()
    }
  },

  onShow() {
    if (this.data.isAdmin) {
      this.loadAdminData()
    }
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({
      adminPassword: e.detail.value
    })
  },

  // 管理员登录
  adminLogin() {
    const { adminPassword } = this.data
    
    if (!adminPassword) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    // 简单的密码验证（实际项目中应该使用更安全的验证方式）
    if (adminPassword === 'admin123') {
      this.setData({ 
        isAdmin: true,
        adminPassword: ''
      })
      wx.setStorageSync('isAdmin', true)
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      this.loadAdminData()
    } else {
      wx.showToast({
        title: '密码错误',
        icon: 'error'
      })
    }
  },

  // 加载管理员数据
  async loadAdminData() {
    try {
      await Promise.all([
        this.loadCourts(),
        this.loadRecentBookings(),
        this.loadTodayStats()
      ])
    } catch (error) {
      console.error('加载管理员数据失败:', error)
    }
  },

  // 加载场地数据
  async loadCourts() {
    try {
      const courts = await getApp().api.getCourts()
      this.setData({ courts })
    } catch (error) {
      console.error('加载场地数据失败:', error)
    }
  },

  // 加载最近预约
  async loadRecentBookings() {
    try {
      const bookings = await getApp().api.getBookings()
      // 获取最近10条预约记录
      const recentBookings = bookings
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        .slice(0, 10)
      
      this.setData({ recentBookings })
    } catch (error) {
      console.error('加载预约数据失败:', error)
    }
  },

  // 加载今日统计
  loadTodayStats() {
    // 模拟统计数据
    const todayStats = {
      bookings: Math.floor(Math.random() * 20) + 5,
      revenue: Math.floor(Math.random() * 3000) + 1000,
      usage: Math.floor(Math.random() * 30) + 60,
      users: Math.floor(Math.random() * 15) + 5
    }
    
    this.setData({ todayStats })
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'available': '空闲',
      'occupied': '使用中',
      'maintenance': '维护中'
    }
    return statusMap[status] || '未知'
  },

  // 获取预约状态文本
  getBookingStatusText(status) {
    const statusMap = {
      'confirmed': '已确认',
      'paid': '已支付',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || '未知'
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

  // 切换场地状态
  toggleCourtStatus(e) {
    const courtId = parseInt(e.currentTarget.dataset.id)
    const currentStatus = e.currentTarget.dataset.status
    
    const newStatus = currentStatus === 'maintenance' ? 'available' : 'maintenance'
    const statusText = newStatus === 'maintenance' ? '维护中' : '可用'
    
    wx.showModal({
      title: '确认操作',
      content: `确定将场地状态设置为"${statusText}"吗？`,
      success: (res) => {
        if (res.confirm) {
          // 更新场地状态
          const courts = this.data.courts.map(court => {
            if (court.id === courtId) {
              return { ...court, status: newStatus }
            }
            return court
          })
          
          // 同时更新全局数据
          getApp().globalData.courts = courts
          
          this.setData({ courts })
          
          wx.showToast({
            title: '状态已更新',
            icon: 'success'
          })
        }
      }
    })
  },

  // 刷新预约数据
  refreshBookings() {
    this.loadRecentBookings()
    wx.showToast({
      title: '已刷新',
      icon: 'success',
      duration: 1000
    })
  },

  // 取消预约
  async cancelBooking(e) {
    const bookingId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？此操作不可撤销。',
      success: async (res) => {
        if (res.confirm) {
          try {
            await getApp().api.cancelBooking(bookingId)
            
            wx.showToast({
              title: '预约已取消',
              icon: 'success'
            })
            
            // 刷新数据
            this.loadRecentBookings()
          } catch (error) {
            console.error('取消预约失败:', error)
            wx.showToast({
              title: '取消失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 导出数据
  exportData() {
    wx.showActionSheet({
      itemList: ['导出今日数据', '导出本周数据', '导出本月数据'],
      success: (res) => {
        const periods = ['今日', '本周', '本月']
        const period = periods[res.tapIndex]
        
        wx.showLoading({ title: '导出中...' })
        
        // 模拟导出过程
        setTimeout(() => {
          wx.hideLoading()
          wx.showToast({
            title: `${period}数据导出成功`,
            icon: 'success'
          })
        }, 2000)
      }
    })
  },

  // 清理缓存
  clearCache() {
    wx.showModal({
      title: '清理缓存',
      content: '确定要清理系统缓存吗？这将清除所有临时数据。',
      success: (res) => {
        if (res.confirm) {
          // 清理缓存但保留管理员状态
          const isAdmin = wx.getStorageSync('isAdmin')
          wx.clearStorageSync()
          wx.setStorageSync('isAdmin', isAdmin)
          
          wx.showToast({
            title: '缓存已清理',
            icon: 'success'
          })
        }
      }
    })
  },

  // 系统维护
  systemMaintenance() {
    wx.showActionSheet({
      itemList: ['重启系统', '数据备份', '系统检查', '维护模式'],
      success: (res) => {
        const actions = ['重启系统', '数据备份', '系统检查', '维护模式']
        const action = actions[res.tapIndex]
        
        wx.showModal({
          title: '确认操作',
          content: `确定要执行"${action}"操作吗？`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.showLoading({ title: '执行中...' })
              
              setTimeout(() => {
                wx.hideLoading()
                wx.showToast({
                  title: `${action}完成`,
                  icon: 'success'
                })
              }, 3000)
            }
          }
        })
      }
    })
  },

  // 管理员退出
  adminLogout() {
    wx.showModal({
      title: '退出管理',
      content: '确定要退出管理员模式吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ 
            isAdmin: false,
            adminPassword: ''
          })
          wx.removeStorageSync('isAdmin')
          
          wx.showToast({
            title: '已退出管理模式',
            icon: 'success'
          })
        }
      }
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '24小时无人网球馆管理系统',
      path: '/pages/index/index'
    }
  }
})