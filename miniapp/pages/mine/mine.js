Page({login(){wx.getUserProfile({desc:'用于完善飞手认证资料',success:r=>wx.showToast({title:'登录成功'})})}})
