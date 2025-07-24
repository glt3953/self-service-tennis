// pages/profile/profile.js
Page({
  data: {
    userInfo: {},
    userPhone: '',
    userBalance: 500,
    totalBookings: 0,
    completedBookings: 0,
    totalHours: 0,
    totalSpent: 0,
    availableCoupons: 3,
    showCouponModal: false,
    couponTab: 'available',
    userCoupons: {
      available: [
        {
          id: 1,
          name: '新用户专享券',
          discount: 20,
          minAmount: 50,
          expireDate: '2024-12-31',
          status: 'available'
        },
        {
          id: 2,
          name: '周末特惠券',
          discount: 30,
          minAmount: 100,
          expireDate: '2024-12-31',
          status: 'available'
        },
        {
          id: 3,
          name: '满200减50',
          discount: 50,
          minAmount: 200,
          expireDate: '2024-12-31',
          status: 'available'
        }
      ],
      used: [
        {
          id: 4,
          name: '首次预约券',
          discount: 10,
          minAmount: 30,
          expireDate: '2024-11-30',
          status: 'used'
        }
      ],
      expired: [
        {
          id: 5,
          name: '过期优惠券',
          discount: 15,
          minAmount: 60,
          expireDate: '2024-10-31',
          status: 'expired'
        }
      ]
    },
    currentCoupons: []
  },

  onLoad() {
    this.loadUserData()
    this.loadUserStats()
    this.setData({
      currentCoupons: this.data.userCoupons.available
    })
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadUserStats()
  },

  // 加载用户数据
  loadUserData() {
    const userInfo = getApp().globalData.userInfo
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  // 加载用户统计数据
  async loadUserStats() {
    try {
      const bookings = await getApp().api.getBookings()
      const completedBookings = bookings.filter(b => b.status === 'completed')
      
      const totalHours = bookings.reduce((sum, booking) => sum + booking.duration, 0)
      const totalSpent = bookings.reduce((sum, booking) => sum + (booking.finalPrice || booking.totalPrice), 0)
      
      this.setData({
        totalBookings: bookings.length,
        completedBookings: completedBookings.length,
        totalHours,
        totalSpent
      })
    } catch (error) {
      console.error('加载用户统计失败:', error)
    }
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      const userInfo = await getApp().getUserInfo()
      this.setData({ userInfo })
      
      // 模拟获取手机号
      wx.showModal({
        title: '获取手机号',
        content: '是否授权获取手机号？',
        success: (res) => {
          if (res.confirm) {
            // 模拟手机号
            this.setData({
              userPhone: '138****8888'
            })
          }
        }
      })
    } catch (error) {
      console.error('获取用户信息失败:', error)
      wx.showToast({
        title: '获取信息失败',
        icon: 'error'
      })
    }
  },

  // 充值
  recharge() {
    wx.showActionSheet({
      itemList: ['充值100元', '充值200元', '充值500元', '自定义金额'],
      success: (res) => {
        let amount = 0
        switch (res.tapIndex) {
          case 0:
            amount = 100
            break
          case 1:
            amount = 200
            break
          case 2:
            amount = 500
            break
          case 3:
            this.showCustomRecharge()
            return
        }
        this.processRecharge(amount)
      }
    })
  },

  // 自定义充值金额
  showCustomRecharge() {
    wx.showModal({
      title: '自定义充值',
      content: '请输入充值金额',
      editable: true,
      placeholderText: '请输入金额',
      success: (res) => {
        if (res.confirm && res.content) {
          const amount = parseFloat(res.content)
          if (amount > 0 && amount <= 10000) {
            this.processRecharge(amount)
          } else {
            wx.showToast({
              title: '金额无效',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 处理充值
  processRecharge(amount) {
    wx.showModal({
      title: '确认充值',
      content: `确认充值¥${amount}？`,
      success: (res) => {
        if (res.confirm) {
          // 模拟充值成功
          const newBalance = this.data.userBalance + amount
          this.setData({ userBalance: newBalance })
          wx.showToast({
            title: '充值成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 提现
  withdraw() {
    if (this.data.userBalance <= 0) {
      wx.showToast({
        title: '余额不足',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '提现',
      content: `当前余额¥${this.data.userBalance}，是否全部提现？`,
      success: (res) => {
        if (res.confirm) {
          // 模拟提现处理
          wx.showToast({
            title: '提现申请已提交',
            icon: 'success'
          })
        }
      }
    })
  },

  // 跳转到历史记录
  goToHistory() {
    wx.switchTab({
      url: '/pages/history/history'
    })
  },

  // 显示优惠券
  showCoupons() {
    this.setData({ showCouponModal: true })
  },

  // 关闭优惠券弹窗
  closeCouponModal() {
    this.setData({ showCouponModal: false })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止点击事件冒泡
  },

  // 切换优惠券标签
  switchCouponTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      couponTab: tab,
      currentCoupons: this.data.userCoupons[tab]
    })
  },

  // 获取优惠券标签文本
  getCouponTabText(tab) {
    const tabMap = {
      'available': '可使用',
      'used': '已使用',
      'expired': '已过期'
    }
    return tabMap[tab] || ''
  },

  // 使用优惠券
  useCoupon(e) {
    const coupon = e.currentTarget.dataset.coupon
    wx.showModal({
      title: '使用优惠券',
      content: `是否立即使用${coupon.name}？`,
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/booking/booking'
          })
        }
      }
    })
  },

  // 显示充值记录
  showRechargeHistory() {
    wx.showToast({
      title: '充值记录功能开发中',
      icon: 'none'
    })
  },

  // 显示设置
  showSettings() {
    wx.showActionSheet({
      itemList: ['消息通知', '隐私设置', '清除缓存', '退出登录'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.showToast({
              title: '消息通知设置',
              icon: 'none'
            })
            break
          case 1:
            wx.showToast({
              title: '隐私设置',
              icon: 'none'
            })
            break
          case 2:
            this.clearCache()
            break
          case 3:
            this.logout()
            break
        }
      }
    })
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          })
        }
      }
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            userInfo: {},
            userPhone: ''
          })
          getApp().globalData.userInfo = null
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  // 联系客服
  contactService() {
    wx.showActionSheet({
      itemList: ['拨打客服电话', '在线客服', '微信客服'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.makePhoneCall({
              phoneNumber: '400-123-4567'
            })
            break
          case 1:
            wx.showToast({
              title: '在线客服功能开发中',
              icon: 'none'
            })
            break
          case 2:
            wx.showToast({
              title: '微信客服功能开发中',
              icon: 'none'
            })
            break
        }
      }
    })
  },

  // 意见反馈
  showFeedback() {
    wx.showToast({
      title: '意见反馈功能开发中',
      icon: 'none'
    })
  },

  // 关于我们
  showAbout() {
    wx.showModal({
      title: '关于我们',
      content: '24小时无人网球馆管理系统\n版本：v1.0.0\n\n致力于为用户提供便捷的网球场地预约服务',
      showCancel: false
    })
  },

  // 帮助中心
  showHelp() {
    wx.showActionSheet({
      itemList: ['如何预约', '支付问题', '取消预约', '联系客服'],
      success: (res) => {
        const helpTexts = [
          '预约流程：选择日期 → 选择场地 → 选择时间 → 确认支付',
          '支持微信支付和余额支付，支付成功后即可使用场地',
          '可在预约记录中取消未开始的预约，可能产生手续费',
          '如有问题请拨打客服电话：400-123-4567'
        ]
        
        wx.showModal({
          title: '帮助说明',
          content: helpTexts[res.tapIndex],
          showCancel: false
        })
      }
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