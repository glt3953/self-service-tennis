// pages/court/court.js
Page({
  data: {
    courts: [],
    showDetailModal: false,
    selectedCourt: null
  },

  onLoad() {
    this.loadCourts()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadCourts()
  },

  // 加载场地数据
  async loadCourts() {
    try {
      wx.showLoading({ title: '加载中...' })
      const courts = await getApp().api.getCourts()
      
      // 为每个场地添加详细信息
      const detailedCourts = courts.map(court => ({
        ...court,
        area: court.type === 'VIP场' ? 800 : 600,
        surface: court.type === 'VIP场' ? '进口丙烯酸' : '标准丙烯酸',
        features: this.getCourtFeatures(court.type),
        facilities: this.getCourtFacilities(court.type),
        rules: this.getCourtRules(),
        images: this.getCourtImages(court.id),
        currentUser: court.status === 'occupied' ? '张先生' : null,
        endTime: court.status === 'occupied' ? '20:00' : null
      }))
      
      this.setData({ courts: detailedCourts })
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

  // 获取场地特色
  getCourtFeatures(type) {
    const features = {
      '标准场': ['室内场地', '灯光充足', '空调设备', '免费WiFi'],
      '高级场': ['室内场地', '专业灯光', '中央空调', '免费WiFi', '音响设备'],
      'VIP场': ['室内场地', '专业灯光', '中央空调', '免费WiFi', '音响设备', '休息区', '淋浴间']
    }
    return features[type] || features['标准场']
  },

  // 获取场地设施
  getCourtFacilities(type) {
    const facilities = {
      '标准场': ['标准网球场', '球网', '计分牌', '座椅', '储物柜'],
      '高级场': ['标准网球场', '专业球网', '电子计分牌', '观众席', '储物柜', '饮水机'],
      'VIP场': ['标准网球场', '专业球网', '电子计分牌', '观众席', '储物柜', '饮水机', '休息室', '淋浴设施']
    }
    return facilities[type] || facilities['标准场']
  },

  // 获取使用规则
  getCourtRules() {
    return [
      '请提前15分钟到场，超时15分钟视为自动取消',
      '场地内禁止吸烟，禁止携带食物和有色饮料',
      '请穿着运动鞋，禁止穿高跟鞋或硬底鞋',
      '请爱护场地设施，损坏需照价赔偿',
      '使用时间结束后请及时离场，超时使用需额外付费',
      '如遇设备故障请及时联系工作人员',
      '请保持场地清洁，垃圾请投入垃圾桶'
    ]
  },

  // 获取场地图片
  getCourtImages(courtId) {
    // 模拟场地图片
    return [
      `/images/court-${courtId}-1.jpg`,
      `/images/court-${courtId}-2.jpg`,
      `/images/court-${courtId}-3.jpg`
    ]
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

  // 刷新场地状态
  refreshCourts() {
    this.loadCourts()
    wx.showToast({
      title: '已刷新',
      icon: 'success',
      duration: 1000
    })
  },

  // 查看场地详情
  viewCourtDetail(e) {
    const court = e.currentTarget.dataset.court
    this.setData({
      selectedCourt: court,
      showDetailModal: true
    })
  },

  // 关闭详情弹窗
  closeDetailModal() {
    this.setData({
      showDetailModal: false,
      selectedCourt: null
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止点击事件冒泡
  },

  // 预约场地
  bookCourt(e) {
    const court = e.currentTarget.dataset.court
    
    if (court.status !== 'available') {
      wx.showToast({
        title: '该场地暂不可预约',
        icon: 'none'
      })
      return
    }

    wx.switchTab({
      url: '/pages/booking/booking'
    })
  },

  // 预约选中的场地
  bookSelectedCourt() {
    if (this.data.selectedCourt.status !== 'available') {
      wx.showToast({
        title: '该场地暂不可预约',
        icon: 'none'
      })
      return
    }

    this.closeDetailModal()
    wx.switchTab({
      url: '/pages/booking/booking'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadCourts().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '24小时无人网球馆 - 场地预览',
      path: '/pages/court/court'
    }
  }
})