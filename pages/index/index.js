// 获取全局 app 实例
const app = getApp();


Page({
  data: {
    widthPercent: 30,  // 初始宽度（百分比）
    heightPercent: 20, // 初始高度（百分比）
  },

  async init_card() {
    let liveCardInfo = {};
  
    const getLiveCardInfo = async () => {
      try {
        const res = await new Promise((resolve, reject) => {
          tt.getLiveRoomCardInfo({
            success: resolve,
            fail: reject
          });
        });
  
        // 设置数据
        liveCardInfo = {
          liveCardMaxWidth: res.liveCardMaxWidth,
          liveCardMaxHeight: res.liveCardMaxHeight
        };
  
        this.setData(liveCardInfo);  // 直接传入对象以更新数据
      } catch (err) {
        console.log('调用失败：', err.errMsg);
      }
    };
  
    await getLiveCardInfo();
    // console.log(liveCardInfo);  // 在异步操作完成后输出
  
    // 如果已经创建过 LiveCard，直接返回
    if (app.isCreateLiveCard) return;
  
    // 获取缓存中的尺寸百分比
    const res = tt.getStorageSync('cardSizePercent') || {};
    const { widthPercent = 30, heightPercent = 20 } = res;
  
    this.setData({
      widthPercent,
      heightPercent
    });
  
    // 创建 LiveCard
    return new Promise((resolve, reject) => {
      tt.createLiveCard({
        url: '/live-card/card',
        width: Math.round((widthPercent / 100) * liveCardInfo.liveCardMaxWidth),
        height: Math.round((heightPercent / 100) * liveCardInfo.liveCardMaxHeight),
        success: (res) => {
          console.log('LiveCard 创建成功：', res.cardContext);
          app.pageCardContext = res.cardContext;
          app.isCreateLiveCard = true;


          // 添加消息接收监听
          tt.onReceiveLiveInteractPluginMessage((res) => {
            console.log('消息数据：', res);
            this.postMessageToLiveCard(res);

            
          });
          resolve();
        },
        fail: (res) => {
          console.log('LiveCard 创建失败', res);
          reject(res);
        }
      });
    });
  }
,  

  hideLiveCard: function() {
    if (app.pageCardContext && app.isCreateLiveCard) {
      app.pageCardContext.hide();
      console.log("隐藏成功")
    } else {
      console.log('pageCardContext 未定义，无法隐藏');
    }
  },
  
  showLiveCard: function() {
    if (app.pageCardContext && app.isCreateLiveCard) {
      console.log("展示成功")
      app.pageCardContext.show();
    } else {
      console.log('pageCardContext 未定义，无法显示');
    }
  },

  flushListenList: function() {
    tt.getStorage({
      key: 'listen_lists',
      success: (res) => {
        this.setData({
          listen_lists: res.data
        }, () => {
          app.listen_lists = res.data;

          if (app.listen_lists && app.listen_lists.length > 0) {
            // 如果还没有订阅过消息，则进行订阅
            if (!app.isSubscribed) {

              this.showLiveCard();
              this.subscribeLiveMessage();

              app.isSubscribed = true;
            }
          } else {
            
            this.hideLiveCard();
            // 当消息列表为空时取消订阅
            this.cancelSubscribeLiveMessage();
          }
        });
      },
      fail: () => {
        console.log('缓存数据获取失败或无缓存数据');
        
        this.hideLiveCard();
        this.cancelSubscribeLiveMessage(); // 失败时也取消订阅
      }
    });
  },
  

  onLoad: async function()  {
    try {
      await this.init_card(); // 等待 init_card 完成
      this.flushListenList();  // 完成后执行 flushListenList
    } catch (error) {
      console.error("Error initializing card:", error);
    }

  },

  onShow() {


    // this.init_card();
  },

  toggleState(e) {
    const { index } = e.currentTarget.dataset;
  
    // 切换监听状态，而不是已完成状态
    app.listen_lists[index].isListening = !app.listen_lists[index].isListening;
  
    // 更新数据
    this.setData({ listen_lists: app.listen_lists });
  
    // 将最新数据存储到本地
    tt.setStorage({
      key: "listen_lists",
      data: app.listen_lists,
    });
  },
  

  addListen() {
    tt.redirectTo({
      url: '/pages/add_listen/add_listen?params=redirectTo',
    });
  },

  card_settings() {
    // if(!app.isCreateLiveCard) {
    //   app.isCreateLiveCard = true;
    // }
    // 从缓存中读取尺寸
    // tt.getStorage({
    //   key: 'cardSize',
    //   success: (res) => {
    //     const { width, height } = res.data;
    //     this.setData({
    //       width: width,
    //       height: height
    //     });
    
    //     const pageCardContext = app.pageCardContext;
    //     if (pageCardContext && typeof pageCardContext.updateSize === 'function') {
    
    //       pageCardContext.updateSize({ 
    //         width: this.data.width, 
    //         height: this.data.height,
    //         success: async (res) => {
    //         console.log(res);
    //         if (res.errMsg === 'CardContext.updateSize:ok') {
    //               // console.log('卡片大小已更新为 ${newWidth}px x ${newHeight}px');
    //             } else {
    //               console.log('更新大小时出错:', res.errMsg);
    //               }
    //         }
    //       });
    //     } else {
    //       console.log('pageCardContext 或 updateSize 方法不可用。');
    //     }
    //   },
    //   fail: () => {
    //     // 缓存读取失败，保持初始值
    //     this.setData({
    //       width: this.data.width,
    //       height: this.data.height
    //     });
    //   }
    // });
    tt.redirectTo({
      url: '/pages/card_settings/card_settings?params=redirectTo',
    });
  },

  deleteItem(e) {
    const { index } = e.currentTarget.dataset;
    app.listen_lists.splice(index, 1);
    this.setData({ listen_lists: app.listen_lists });

    tt.setStorage({
      key: "listen_lists",
      data: app.listen_lists,
      success: () => {
        console.log('Storage 更新成功');
      },
      fail: () => {
        console.log('Storage 更新失败');
      }
    });
    this.flushListenList();
  },

  subscribeLiveMessage() {
    if (app.isCreateLiveCard) {
      console.log("开始调用订阅命令")
      tt.subscribeLiveInteractPluginMessage({
        messageType: ['live_like', 'live_comment', 'live_gift', 'live_follow', 'live_fansclub'],
        success(res) {
          console.log('调用成功：', res);
        },
        fail(res) {
          console.log('调用失败：', res);
        }
      });
    }

  },

  // 新增取消消息订阅的函数
  cancelSubscribeLiveMessage() {
    if (app.isSubscribed) {
      tt.unsubscribeLiveInteractPluginMessage({
        messageType: ['live_like', 'live_comment', 'live_gift', 'live_follow', 'live_fansclub'],
        success(res) {
          console.log('取消消息订阅成功：', res);
        },
        fail(res) {
          console.log('取消消息订阅失败：', res);
        }
      });
      app.isSubscribed = false;
    }
  },

  postMessageToLiveCard: function(message) {
    if (app.pageCardContext) {
      app.pageCardContext.onPageMessage(message);
    } else {
      console.log('pageCardContext 未定义，无法发送消息');
    }
  }
});
