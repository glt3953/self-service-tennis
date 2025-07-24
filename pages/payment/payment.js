// pages/payment/payment.js
Page({
  data: {
    bookingId: null,
    bookingInfo: {},
    selectedMethod: 'wechat',
    userBalance: 500,
    selectedCoupon: null,
    finalPrice: 0,
    agreedToTerms: false,
    paymentLoading: false,
    showCouponModal: false,
    availableCoupons: [
      {
        id: 1,
        name: '新用户专享券',
        discount: 20,
        minAmount: 50,
        expireDate: '2024-12-31',
        available: true
      },
      {
        id: 2,
        name: '周末特惠券',
        discount: 30,
        minAmount: 100,
        expireDate: '2024-12-31',
        available: true
      },
      {
        id: 3,
        name: '满200减50',
        discount: 50,
        minAmount: 200,
        expireDate: '2024-12-31',
        available: false
      }
    ],
    canPay: false
  },


  onLoad(options) {
    const bookingId = options.bookingId
    if (bookingId) {
      this.setData({ bookingId })
      this.loadBookingInfo(bookingId)
    } else {
      wx.showToast({
        title: '预约信息错误',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
    this.updateCanPay()
  },

  // 更新支付按钮状态
  updateCanPay() {
    const canPay = this.data.agreedToTerms && !this.data.paymentLoading
    this.setData({ canPay })
  },

  // 加载预约信息
  loadBookingInfo: function(bookingId) {
    var that = this
    // 模拟从全局数据中获取预约信息
    var bookings = getApp().globalData.bookings
    var booking = null
    for (var i = 0; i < bookings.length; i++) {
      if (bookings[i].id == bookingId) {
        booking = bookings[i]
        break
      }
    }
    
    if (booking) {
      var bookingInfo = {
        id: booking.id,
        courtId: booking.courtId,
        courtName: booking.courtName,
        timeSlot: booking.timeSlot,
        duration: booking.duration,
        userInfo: booking.userInfo,
        status: booking.status,
        createTime: booking.createTime,
        totalPrice: booking.totalPrice,
        date: this.formatDate(booking.date)
      }
      
      this.setData({ 
        bookingInfo: bookingInfo,
        finalPrice: booking.totalPrice
      })
      
      this.filterAvailableCoupons(booking.totalPrice)
    } else {
      wx.showToast({
        title: '预约信息不存在',
        icon: 'error'
      })
      setTimeout(function() {
        wx.navigateBack()
      }, 1500)
    }
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

  // 筛选可用优惠券
  filterAvailableCoupons: function(totalPrice) {
    var that = this
    var availableCoupons = this.data.availableCoupons.map(function(coupon) {
      return {
        id: coupon.id,
        name: coupon.name,
        discount: coupon.discount,
        minAmount: coupon.minAmount,
        expireDate: coupon.expireDate,
        available: totalPrice >= coupon.minAmount
      }
    })
    
    this.setData({ availableCoupons: availableCoupons })
  },

  // 选择支付方式
  selectPaymentMethod(e) {
    const method = e.currentTarget.dataset.method
    
    if (method === 'balance' && this.data.userBalance < this.data.finalPrice) {
      wx.showToast({
        title: '余额不足',
        icon: 'none'
      })
      return
    }
    
    this.setData({ selectedMethod: method })
  },

  // 选择优惠券
  selectCoupon() {
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

  // 选择优惠券
  chooseCoupon: function(e) {
    var coupon = e.currentTarget.dataset.coupon
    
    if (coupon && !coupon.available) {
      wx.showToast({
        title: '优惠券不可用',
        icon: 'none'
      })
      return
    }
    
    var finalPrice = this.data.bookingInfo.totalPrice
    if (coupon) {
      finalPrice = Math.max(0, finalPrice - coupon.discount)
    }
    
    this.setData({
      selectedCoupon: coupon,
      finalPrice: finalPrice,
      showCouponModal: false
    })
  },

  // 切换协议同意状态
  toggleAgreement() {
    this.setData({
      agreedToTerms: !this.data.agreedToTerms
    })
    this.updateCanPay()
  },

  // 查看服务协议
  viewTerms(e) {
    e.stopPropagation()
    wx.showModal({
      title: '服务协议',
      content: '这里是服务协议的内容...',
      showCancel: false
    })
  },

  // 查看隐私政策
  viewPrivacy(e) {
    e.stopPropagation()
    wx.showModal({
      title: '隐私政策',
      content: '这里是隐私政策的内容...',
      showCancel: false
    })
  },

  // 处理支付
  processPayment: function() {
    var that = this
    if (!this.data.agreedToTerms) {
      wx.showToast({
        title: '请先同意服务协议',
        icon: 'none'
      })
      return
    }

    this.setData({ paymentLoading: true })
    this.updateCanPay()

    if (this.data.selectedMethod === 'wechat') {
      this.wechatPay().then(function() {
        that.setData({ paymentLoading: false })
        that.updateCanPay()
      }).catch(function(error) {
        console.error('支付失败:', error)
        wx.showToast({
          title: '支付失败，请重试',
          icon: 'error'
        })
        that.setData({ paymentLoading: false })
        that.updateCanPay()
      })
    } else if (this.data.selectedMethod === 'balance') {
      this.balancePay().then(function() {
        that.setData({ paymentLoading: false })
        that.updateCanPay()
      }).catch(function(error) {
        console.error('支付失败:', error)
        wx.showToast({
          title: '支付失败，请重试',
          icon: 'error'
        })
        that.setData({ paymentLoading: false })
        that.updateCanPay()
      })
    }
  },

  // 微信支付
  wechatPay: function() {
    var that = this
    return new Promise(function(resolve, reject) {
      // 模拟微信支付
      setTimeout(function() {
        // 模拟支付成功
        if (Math.random() > 0.1) {
          that.paymentSuccess()
          resolve()
        } else {
          reject(new Error('支付失败'))
        }
      }, 2000)
    })
  },

  // 余额支付
  balancePay: function() {
    var that = this
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        if (that.data.userBalance >= that.data.finalPrice) {
          // 扣除余额
          var newBalance = that.data.userBalance - that.data.finalPrice
          that.setData({ userBalance: newBalance })
          that.paymentSuccess()
          resolve()
        } else {
          reject(new Error('余额不足'))
        }
      }, 1000)
    })
  },

  // 支付成功处理
  paymentSuccess: function() {
    var that = this
    wx.showToast({
      title: '支付成功',
      icon: 'success'
    })

    // 更新预约状态为已支付
    var bookings = getApp().globalData.bookings
    var booking = null
    for (var i = 0; i < bookings.length; i++) {
      if (bookings[i].id == this.data.bookingId) {
        booking = bookings[i]
        break
      }
    }
    if (booking) {
      booking.status = 'paid'
      booking.paymentTime = new Date().toISOString()
      booking.paymentMethod = this.data.selectedMethod
      booking.finalPrice = this.data.finalPrice
      booking.coupon = this.data.selectedCoupon
    }

    // 跳转到成功页面或返回首页
    setTimeout(function() {
      wx.showModal({
        title: '支付成功',
        content: '预约已确认，请按时到场使用',
        showCancel: false,
        success: function() {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      })
    }, 1500)
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '24小时无人网球馆',
      path: '/pages/index/index'
    }
  }
})