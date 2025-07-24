// pages/booking/booking.js
Page({
  data: {
    // 日期相关
    dateList: [],
    selectedDate: '',
    selectedDateText: '',
    
    // 场地相关
    courts: [],
    selectedCourt: null,
    selectedCourtName: '',
    courtPrice: 0,
    
    // 时间相关
    timeSlots: [],
    selectedTimeSlot: '',
    
    // 时长相关
    durationOptions: [1, 2, 3, 4],
    selectedDuration: null,
    totalPrice: 0,
    
    // 用户信息
    userName: '',
    userPhone: '',
    remark: '',
    
    // 状态
    loading: false,
    canSubmit: false
  },

  onLoad() {
    this.initDateList()
    this.loadCourts()
  },

  // 初始化日期列表（未来7天）
  initDateList() {
    const dateList = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const dateStr = date.toISOString().split('T')[0]
      const day = date.getDate()
      let text = ''
      
      if (i === 0) {
        text = '今天'
      } else if (i === 1) {
        text = '明天'
      } else {
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        text = weekdays[date.getDay()]
      }
      
      dateList.push({
        date: dateStr,
        day: day,
        text: text,
        fullDate: date
      })
    }
    
    this.setData({ 
      dateList,
      selectedDate: dateList[0].date,
      selectedDateText: `${dateList[0].fullDate.getMonth() + 1}月${dateList[0].day}日 ${dateList[0].text}`
    })
  },

  // 加载场地数据
  async loadCourts() {
    try {
      const courts = await getApp().api.getCourts()
      this.setData({ courts })
    } catch (error) {
      console.error('加载场地数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 选择日期
  selectDate(e) {
    const date = e.currentTarget.dataset.date
    const dateItem = this.data.dateList.find(item => item.date === date)
    
    this.setData({
      selectedDate: date,
      selectedDateText: `${dateItem.fullDate.getMonth() + 1}月${dateItem.day}日 ${dateItem.text}`,
      selectedTimeSlot: '',
      selectedDuration: null
    })
    
    // 重新加载时间段
    if (this.data.selectedCourt) {
      this.loadTimeSlots()
    }
    
    this.checkCanSubmit()
  },

  // 选择场地
  selectCourt(e) {
    const courtId = parseInt(e.currentTarget.dataset.id)
    const court = this.data.courts.find(c => c.id === courtId)
    
    if (court.status !== 'available') {
      wx.showToast({
        title: '该场地不可预约',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      selectedCourt: courtId,
      selectedCourtName: court.name,
      courtPrice: court.price,
      selectedTimeSlot: '',
      selectedDuration: null
    })
    
    this.loadTimeSlots()
    this.checkCanSubmit()
  },

  // 加载时间段
  loadTimeSlots() {
    const timeSlots = []
    
    // 生成时间段（8:00-22:00，每2小时一个时段）
    for (let hour = 8; hour < 22; hour += 2) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`
      const endTime = `${(hour + 2).toString().padStart(2, '0')}:00`
      const timeSlot = `${startTime}-${endTime}`
      
      // 模拟已预约的时间段
      const isAvailable = Math.random() > 0.3
      
      timeSlots.push({
        time: timeSlot,
        available: isAvailable
      })
    }
    
    this.setData({ timeSlots })
  },

  // 选择时间段
  selectTimeSlot(e) {
    const time = e.currentTarget.dataset.time
    const timeSlot = this.data.timeSlots.find(slot => slot.time === time)
    
    if (!timeSlot.available) {
      wx.showToast({
        title: '该时间段已被预约',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      selectedTimeSlot: time,
      selectedDuration: null
    })
    
    this.checkCanSubmit()
  },

  // 选择时长
  selectDuration(e) {
    const duration = parseInt(e.currentTarget.dataset.duration)
    const totalPrice = this.data.courtPrice * duration
    
    this.setData({
      selectedDuration: duration,
      totalPrice: totalPrice
    })
    
    this.checkCanSubmit()
  },

  // 输入姓名
  onNameInput(e) {
    this.setData({
      userName: e.detail.value
    })
    this.checkCanSubmit()
  },

  // 输入手机号
  onPhoneInput(e) {
    this.setData({
      userPhone: e.detail.value
    })
    this.checkCanSubmit()
  },

  // 输入备注
  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    })
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { selectedDate, selectedCourt, selectedTimeSlot, selectedDuration, userName, userPhone } = this.data
    const phoneRegex = /^1[3-9]\d{9}$/
    
    const canSubmit = selectedDate && selectedCourt && selectedTimeSlot && 
                     selectedDuration && userName.trim() && phoneRegex.test(userPhone)
    
    this.setData({ canSubmit })
  },

  // 提交预约
  async submitBooking() {
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请完善预约信息',
        icon: 'none'
      })
      return
    }

    // 二次确认
    const res = await new Promise((resolve) => {
      wx.showModal({
        title: '确认预约',
        content: `确认预约${this.data.selectedCourtName}，${this.data.selectedDateText} ${this.data.selectedTimeSlot}，共${this.data.selectedDuration}小时，费用¥${this.data.totalPrice}？`,
        success: resolve
      })
    })

    if (!res.confirm) return

    this.setData({ loading: true })

    try {
      const userInfo = {
        name: this.data.userName,
        phone: this.data.userPhone,
        remark: this.data.remark
      }

      const booking = await getApp().api.bookCourt(
        this.data.selectedCourt,
        this.data.selectedDate,
        this.data.selectedTimeSlot,
        this.data.selectedDuration,
        userInfo
      )

      wx.showToast({
        title: '预约成功',
        icon: 'success'
      })

      // 跳转到支付页面
      setTimeout(() => {
        wx.navigateTo({
          url: `/pages/payment/payment?bookingId=${booking.id}`
        })
      }, 1500)

    } catch (error) {
      console.error('预约失败:', error)
      wx.showToast({
        title: '预约失败，请重试',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '24小时无人网球馆预约',
      path: '/pages/booking/booking'
    }
  }
})