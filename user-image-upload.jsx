var React = require("react");
var ReactDOM = require("react-dom");
var Jquery = require("jquery");

/*组件需要从父组件获得连个属性：ContainerWidth(父包裹层实际宽度)以及URL（POST提交地址）*/
var UserImageUpload = React.createClass({
    getInitialState:function () {
        return{
            status:this.props.status || "请点击“选择图片”按钮，选择图片，修改并上传。",
            targetImage:"",
            flage:false,
            formTips:"form-tips"
        }
    },
    render:function () {
        return(
            <form onSubmit={this.HandleSubmit}>
                <div className={this.state.formTips}>{this.state.status}</div>
                <canvas id="canvas" width={this.props.ContainerWidth}>
                    {"您的浏览器不支持canvas。"}
                </canvas>
                <canvas id="copy" width={this.props.ContainerWidth}></canvas>
                <canvas id="trans" width={this.props.ContainerWidth}></canvas>
                <canvas id="Mir"></canvas>
                <div className="db auto0 tc">
                    <a href="#" className="upload-wrap">
                        选择图片
                        <input id="upload-btn" type="file" accept="image/png,image/jpeg" />
                    </a>
                    <a disabled="disabled" href="#" className="margin upload-wrap" onClick={this.HandleSubmit}>
                        提交头像
                    </a>
                    <a href="#" id="btn" className="upload-wrap">
                        取消选择
                    </a>
                </div>
            </form>
        )
    },
    HandleSubmit:function (event) {
        event.preventDefault();
        if(this.state.flage){
            Jquery.ajax({
                type:"POST",
                url:this.props.URL,
                data:{
                    targetImage:this.state.targetImage,
                    username:this.props.username
                },
                success:function (code) {
                    switch (code){
                        case "1":this.setState({
                            status:"上传失败，请稍后重试。",
                            formTips:"form-tips"+" "+"error"
                        });
                            break;
                        case "2":this.setState({
                            status:"头像上传成功。",
                            formTips:"form-tips"+" "+"success"
                        });
                            this.props.InnerUp(this.state.targetImage);
                            if(localStorage.UserPhoto != this.state.targetImage || !localStorage.UserPhoto){
                                localStorage.UserPhoto = this.state.targetImage
                            }
                            break;
                        default:break;
                    }
                    this.setState({
                        flage:true
                    })
                }.bind(this)
            })
        }
    },
    componentDidMount:function () {
        /*如果浏览器不支持FileReader功能，错误弹窗。*/
        if(typeof FileReader == "undified") {
            alert("您老的浏览器不行了！");
        }
        //获取主canvas以及上下文。
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");
        //备份，通过离屏canvas，，用来截取想的图像。
        var canvas_copy = document.getElementById("copy");
        var context_copy = canvas_copy.getContext("2d");
        //截取的部分。
        var Mir = document.getElementById("Mir");
        var MirContext = Mir.getContext("2d");
        //遮罩层。
        var trans = document.getElementById("trans");
        var transcontext = trans.getContext("2d");

        var image = new Image();
        var image_bg = new Image();
        // 检测是否有鼠标按下
        var isMouseDown = false;
        var isRect = false;


        var basePoint;
        var constPoint;
        canvas.onmousedown = function (event) {
            event.preventDefault();
            isMouseDown = true;
            basePoint = getInitalPoint(event.clientX,event.clientY);
        };
        canvas.onmousemove = function (event) {
            event.preventDefault();
            var Point = getInitalPoint(event.clientX,event.clientY);
            if(isMouseDown && !isRect){
                constPoint = basePoint;
                Mir.width = Point.x - basePoint.x;
                Mir.height = Point.x - basePoint.x;
                MirContext.clearRect(0,0,Mir.width,Mir.height);
                MirContext.drawImage(canvas_copy,basePoint.x,basePoint.y,Mir.width,Mir.height,0,0,Mir.width,Mir.height);
                context.clearRect(0,0,canvas.width,canvas.height);
                context.drawImage(image,0,0,canvas.width,canvas.height);
                context.drawImage(trans,0,0,canvas.width,canvas.height);
                context.save();
                context.beginPath();
                context.strokeStyle = "#42AA69";
                context.lineWidth = 5;
                context.rect(basePoint.x,basePoint.y,Mir.width,Mir.height);
                context.stroke();
                context.clip();
                context.drawImage(Mir,0,0,Mir.width,Mir.height,basePoint.x,basePoint.y,Mir.width,Mir.height);
                context.restore();
            }else if(isRect && isMouseDown){
                var scroll_x = Point.x - basePoint.x;
                var scroll_y = Point.y - basePoint.y;
                MirContext.clearRect(0,0,Mir.width,Mir.height);
                MirContext.drawImage(canvas_copy,constPoint.x-scroll_x,constPoint.y-scroll_y,Mir.width,Mir.height,0,0,Mir.width,Mir.height);
                context.clearRect(0,0,canvas.width,canvas.height);
                context.drawImage(image,scroll_x,scroll_y,canvas.width,canvas.height);
                context.drawImage(trans,0,0,canvas.width,canvas.height);
                context.save();
                context.beginPath();
                context.strokeStyle = "#42AA69";
                context.lineWidth = 5;
                context.rect(constPoint.x,constPoint.y,Mir.width,Mir.height);
                context.stroke();
                context.clip();
                context.drawImage(Mir,0,0,Mir.width,Mir.height,constPoint.x,constPoint.y,Mir.width,Mir.height);
                context.restore();
            }
            this.setState({
                targetImage:Mir.toDataURL("image/png")
            });
        }.bind(this);
        canvas.onmouseup = function (event) {
            event.preventDefault();
            isMouseDown = false;
            isRect = true;
            this.setState({
                flage:true
            })
        }.bind(this);
        canvas.onmouseout = function (event) {
            event.preventDefault();
            if(isMouseDown){
                isRect = true;
            }
            isMouseDown = false;


        };
        var cancel = document.getElementById("btn");
        cancel.onclick = function () {
            isMouseDown = false;
            isRect = false;
            context.clearRect(0,0,canvas.width,canvas.height);
            context.drawImage(image,0,0,canvas.width,canvas.height);
            context.drawImage(trans,0,0,canvas.width,canvas.height);
        };
        //获取从上传按钮提供的内容。
        function showDataByURL() {
            var resultFile = document.getElementById("upload-btn").files[0];
            if (resultFile) {
                var reader = new FileReader();
                reader.readAsDataURL(resultFile);
                reader.onload = function (e) {
                    image.src =this.result;
                    context.clearRect(0,0,canvas.width,canvas.height);
                    image.onload = function () {
                        canvas.height = this.height*canvas.width/this.width;
                        trans.height = this.height*canvas.width/this.width;
                        canvas_copy.height = this.height*canvas.width/this.width;
                        context.drawImage(this,0,0,canvas.width,canvas.height);
                        image_bg.src = "data:img/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MUEzRTQ1RjBCMzVFMTFFNUEzOURBRjZFODcwMTUwNTkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MUEzRTQ1RjFCMzVFMTFFNUEzOURBRjZFODcwMTUwNTkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxQTNFNDVFRUIzNUUxMUU1QTM5REFGNkU4NzAxNTA1OSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxQTNFNDVFRkIzNUUxMUU1QTM5REFGNkU4NzAxNTA1OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PlI9yrYAAAAbSURBVHjaYmRgYGhgIAIwMRAJRhVSRyFAgAEA3J4AlIKhjKsAAAAASUVORK5CYII=";
                        image_bg.onload = function () {
                            transcontext.drawImage(image_bg,0,0,trans.width,trans.height);
                            context.drawImage(trans,0,0,canvas.width,canvas.height);
                            context_copy.drawImage(image,0,0,canvas_copy.width,canvas_copy.height);
                        };
                    }
                };
            }
        }
        function getInitalPoint(x,y) {
            var box = canvas.getBoundingClientRect();
            return{
                x:x-box.left,
                y:y-box.top
            }
        }
        Jquery("#upload-btn").change(function (event) {
            showDataByURL();
            this.setState({
                status:"请在阴影区域拖拽，以获取希望得到的图像区域，并且点击“提交头像”按钮完成操作。"
            });
        }.bind(this));

    }
});

module.exports = UserImageUpload;