微信桌面版
======  
　　基于`node-webkit`(0.9.2版本)，通过`iframe`内嵌微信网页版来实现。理论上可以运行在win、mac、linux三个平台，不过目前只对win进行了适配和兼容，所以暂时也只提供该平台的安装包下载。安装包里引用的是服务端的js文件，目的是为了方便更新代码而不需要重新下载安装包。如果您觉得这样会存在潜在的风险，可以下载源码，自行打包运行。
	
    
##### 安装包下载(windows)：

* 最新版本：0.9.2(与打包的node-webkit版本号保持一致)
* 下载地址：<a href="http://pan.baidu.com/s/1pJ2mpJ1" target="_blank">百度云</a>

##### 功能特性：
1. 微信网页版的基本功能。
2. 任务栏好友头像闪动提示新消息。
3. 自动弹出浮窗显示新消息内容。
    
##### 用户提示：
1. 如果想播放语音消息和新消息提示音，需要安装<a href="http://rj.baidu.com/soft/detail/15432.html" target="_blank">Adobe Flash Player Plugin</a>(非IE内核)。
2. 由于目前node-webkit还不支持全局热键，所以还无法实现热键提取消息。
 * 已支持的4个热键：`Alt+Q`(关闭)、`Alt+E`(最小化)、`Alt+A`(最大化)、`Alt+S`(还原)