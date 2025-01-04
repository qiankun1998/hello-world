// c:\Users\Misin\miniprograms\toolv1\pages\add_listenadd_listen\add_listen.js
const app = getApp();






Page({
  data: {
    // task_type: "",
    followInputText: "",
    inputValue: "",
    selectedOption: "", // 当前选择的选项
    giftPool: null, // 礼物类型列表
    selectedGift: '请选择礼物', // 默认显示的礼物类型
  },

  onLoad() {
    // 在页面加载时调用 tt.getLiveRoomGiftPool
    tt.getLiveRoomGiftPool({
      success: (res) => {
        console.log('调用成功：', res.gift_pool);

        // 使用箭头函数，确保 this 指向页面实例
        this.setData({
          giftPool: res.gift_pool
        });
      },
      fail: (err) => {
        console.log('调用失败：', err.errMsg);
      }
    });
  },


  
  onFollowInputText(e) {
    this.setData({
      followInputText: e.detail.value // 更新数据绑定
    });
  },
  // 清空输入框
  clearFollowInputText() {
    this.setData({
      followInputText: '' // 清空输入框内容
    });
  },
    /**
   * @description: input输入框失焦回调
   * @param {*} e 回调事件
   * @return {void}
   */
    // onBlurFollowInputText(e) {
    //   // 设置输入框中的输入值
    //   this.setData({
    //     followInputText: e.detail.value,
    //   });
    // },














  onInput(e) {
    this.setData({
      inputValue: e.detail.value // 更新数据绑定
    });
  },
  // 清空输入框
  clearInput() {
    this.setData({
      inputValue: '' // 清空输入框内容
    });
  },
    /**
   * @description: input输入框失焦回调
   * @param {*} e 回调事件
   * @return {void}
   */
    onBlur(e) {
      // 设置输入框中的输入值
      this.setData({
        inputValue: e.detail.value,
      });
    },















  // 处理点击事件
  handleSelect(e) {
    const option = e.currentTarget.dataset.option; // 获取点击的选项
    this.setData({
      selectedOption: option, // 更新当前选中的选项
    });
  },

   // 显示/隐藏自定义选择器
   showGiftPicker() {
    this.setData({
      showPicker: !this.data.showPicker
    });
  },

  // 处理选择礼物事件
  handleGiftOptionSelect(e) {
    const selectedGift = e.currentTarget.dataset.gift; // 获取选中的礼物对象
    this.setData({
      selectedGift: selectedGift, // 更新selectedGift为完整对象
      showPicker: false // 选择后隐藏选择器
    });
  },


  /**
   * @description: 把输入框中的值插入app.listen_list，同时设置缓存
   * @return {void}
   */
  add() {
    app.listen_lists.push({
      selectedOption: this.data.selectedOption,
      isListening: true,
    });
    tt.setStorage({
      key: "listen_lists",
      data: app.listen_lists,
    });

    // 添加完毕，返回上一页
    tt.redirectTo({
      url: '/pages/index/index?params=redirectTo',
      success(res) {
        console.log('success执行了', res);
      },
      fail(err) {
        console.log('fail执行了', err);
      },
      complete(res) {
        console.log('complete执行了', res);
      }
    });
  },
});
