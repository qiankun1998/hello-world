const app = getApp();

Page({
  data: {
    widthPercent: 30,  // 初始宽度（百分比）
    heightPercent: 20, // 初始高度（百分比）
    minSizePercent: 0,  // 最小尺寸（百分比）
    liveCardMaxWidth: 0,    // 卡片最大宽度（px）
    liveCardMaxHeight: 0    // 卡片最大高度（px）
  },

  onLoad: function () {
    console.log('页面加载完成。');

    // 获取卡片最大宽度和高度信息
    let liveCardInfo = {};

    tt.getLiveRoomCardInfo({
      success: (res) => {  // 使用箭头函数
        liveCardInfo = {
          liveCardMaxWidth: res.liveCardMaxWidth,
          liveCardMaxHeight: res.liveCardMaxHeight
        };
        // 正确的 this 引用
        this.setData({
          liveCardMaxWidth: liveCardInfo.liveCardMaxWidth,
          liveCardMaxHeight: liveCardInfo.liveCardMaxHeight
        });
      },
      fail: (err) => {
        console.log('调用失败：', err.errMsg);
      }
    });
    
    

    // 从缓存中读取尺寸（以百分比存储）
    try {
      const res = tt.getStorageSync('cardSizePercent');

      if (res) {
        const { widthPercent, heightPercent } = res;
        this.setData({
          widthPercent: widthPercent,
          heightPercent: heightPercent
        });
      } else {
        // 缓存为空，保持初始值
        this.setData({
          widthPercent: this.data.widthPercent,
          heightPercent: this.data.heightPercent
        });
      }
    } catch (error) {
      // 读取缓存时发生错误，保持初始值
      this.setData({
        widthPercent: this.data.widthPercent,
        heightPercent: this.data.heightPercent
      });
    }

  },

  // 更新宽度
  onWidthChange: function (e) {
    const newWidthPercent = parseFloat(e.detail.value);
    if (!isNaN(newWidthPercent)) {
      this.setData({
        widthPercent: newWidthPercent
      }, () => {
        this.updateCardSize();
      });
    }
  },

  // 更新高度
  onHeightChange: function (e) {
    const newHeightPercent = parseFloat(e.detail.value);
    if (!isNaN(newHeightPercent)) {
      this.setData({
        heightPercent: newHeightPercent
      }, () => {
        this.updateCardSize();
      });
    }
  },

  // 更新卡片大小
  updateCardSize: function () {
    const pageCardContext = app.pageCardContext;

    if (pageCardContext && typeof pageCardContext.updateSize === 'function') {
      // 将尺寸取整
      const newWidthPx = Math.round((this.data.widthPercent / 100) * this.data.liveCardMaxWidth);
      const newHeightPx = Math.round((this.data.heightPercent / 100) * this.data.liveCardMaxHeight);

      console.log(`尝试将卡片大小更新为 ${newWidthPx}px x ${newHeightPx}px`);

      pageCardContext.updateSize({ 
        width: newWidthPx, 
        height: newHeightPx,
        success: async (res) => {
          console.log(res);
          if (res.errMsg === 'CardContext.updateSize:ok') {
            console.log(`卡片大小已更新为 ${newWidthPx}px x ${newHeightPx}px`);

            // 以百分比存储
            tt.setStorage({
              key: 'cardSizePercent',
              data: { widthPercent: this.data.widthPercent, heightPercent: this.data.heightPercent },
              success: () => {
                console.log('设置成功');
              },
              fail: (res) => {
                console.log('setStorage调用失败', res);
              },
              complete: () => {
                console.log('setStorage触发');
              }
            });
          } else {
            console.log('更新大小时出错:', res.errMsg);
          }
        }
      });
    } else {
      console.log('pageCardContext 或 updateSize 方法不可用。');
    }
  }
  ,

  // 点击返回按钮
  onBack: function () {
    tt.redirectTo({
      url: '/pages/index/index?params=redirectTo',
      success(res) {
        console.log('成功返回:', res);
      },
      fail(err) {
        console.log('返回失败:', err);
      },
      complete(res) {
        console.log('返回完成:', res);
      }
    });
  }
});
