// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('登录成功', res.code)
        this.globalData.code = res.code
      }
    })
  },
  
  globalData: {
    userInfo: null,
    code: null,
    openid: null,
    courts: [
      { id: 1, name: '1号场地', type: '标准场', price: 80, status: 'available' },
      { id: 2, name: '2号场地', type: '标准场', price: 80, status: 'occupied' },
      { id: 3, name: '3号场地', type: '标准场', price: 80, status: 'available' },
      { id: 4, name: '4号场地', type: '高级场', price: 120, status: 'maintenance' },
      { id: 5, name: '5号场地', type: '高级场', price: 120, status: 'available' },
      { id: 6, name: '6号场地', type: 'VIP场', price: 200, status: 'available' }
    ],
    bookings: [],
    currentUser: null
  },

  // 获取用户信息
  getUserInfo() {
    return new Promise((resolve, reject) => {
      if (this.globalData.userInfo) {
        resolve(this.globalData.userInfo)
      } else {
        wx.getUserProfile({
          desc: '用于完善用户资料',
          success: (res) => {
            this.globalData.userInfo = res.userInfo
            resolve(res.userInfo)
          },
          fail: reject
        })
      }
    })
  },

  // 模拟API调用
  api: {
    // 获取场地列表
    getCourts() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(getApp().globalData.courts)
        }, 500)
      })
    },

    // 预约场地
    bookCourt(courtId, date, timeSlot, duration, userInfo) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const booking = {
            id: Date.now(),
            courtId,
            courtName: getApp().globalData.courts.find(c => c.id === courtId)?.name,
            date,
            timeSlot,
            duration,
            userInfo,
            status: 'confirmed',
            createTime: new Date().toISOString(),
            totalPrice: getApp().globalData.courts.find(c => c.id === courtId)?.price * duration
          }
          getApp().globalData.bookings.push(booking)
          resolve(booking)
        }, 1000)
      })
    },

    // 获取预约记录
    getBookings(userId) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(getApp().globalData.bookings)
        }, 500)
      })
    },

    // 取消预约
    cancelBooking(bookingId) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const bookings = getApp().globalData.bookings
          const index = bookings.findIndex(b => b.id === bookingId)
          if (index > -1) {
            bookings[index].status = 'cancelled'
          }
          resolve(true)
        }, 500)
      })
    }
  }
})