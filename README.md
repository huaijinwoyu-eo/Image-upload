# Image-upload（图片上传插件）
A React/Canvas/Jquery base image upload plug-ins to support the cutting function.（一款基于React/Canvas/jquer的图片上传插件，支持裁剪功能。
#####效果图如下所示：
![image](https://github.com/huaijinwoyu-eo/Image-upload/blob/master/DisplayImage.png)
######如果你并没有使用webpack进行项目的构建，而只是像引用jquery那样使用React，你可以下载user-image-upload.js文件，之后调用ImageUpload.createComponent(Container,ContainerWidth,PostTargetUrl)方法进行组件的创建。其中Container为图片上传组件的包裹层ID,ContainerWidth为包裹层实际宽度，PostTargetUrl为图片提交地址。
######当然，如果你使用了webpack或者在Node后端渲染，可以直接下载user-image-upload.jsx文件，并require之。
