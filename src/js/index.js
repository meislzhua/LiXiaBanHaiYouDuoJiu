//重写getElementsByClassName 兼容IE7以下
if (!document.getElementsByClassName) {
    document.getElementsByClassName = function (className, element) {
        var children = (element || document).getElementsByTagName('*');
        var elements = new Array();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var classNames = child.className.split(' ');
            for (var j = 0; j < classNames.length; j++) {
                if (classNames[j] == className) {
                    elements.push(child);
                    break;
                }
            }
        }
        return elements;
    };
}

var $detail = document.getElementById("detail");
var $number = document.getElementsByClassName("number");
var $app = document.getElementById('app');
var hour = 0, min = 0, second = 0;

//todo 计时方式还可以优化
//获取时间相关资料函数
//修改原算法,原算法可能由于精度或其他问题,导致秒计算错误
function getTime() {
    var diff = Math.floor((getXiaBanTime() - new Date()) / 1000);
    var abs_diff = Math.abs(diff);
    var hour = Math.floor(abs_diff / 3600);
    var min = Math.floor(abs_diff % 3600 / 60);
    var second = abs_diff % 60;
    return {diff: diff, hour: hour, min: min, second: second};
}
//主倒计时的 单个翻页动画函数
function setNumberWithAnimation($ele, number) {
    $ele.className = $ele.className + " rotate";
    setTimeout(function () {
        $ele.innerHTML = number;
        $ele.className = $ele.className.replace(" rotate", "");
    }, 130);
}
//渲染主函数
function render() {
    var times = getTime();
    //渲染 详细剩余时间
    $detail.innerHTML = (times.diff > 0 ? "离下班还剩" : "已加班") + times.hour + '小时' + times.min + '分钟' + times.second + '秒';
    //渲染 主倒计时
    var tmp_number = 0;
    //小时渲染
    if (hour != times.hour) {
        if (parseInt(hour / 10) != (tmp_number = parseInt(times.hour / 10))) setNumberWithAnimation($number[0], tmp_number);
        if (hour % 10 != (tmp_number = times.hour % 10))  setNumberWithAnimation($number[1], tmp_number);
        hour = times.hour;
    }
    //分钟渲染
    if (min != times.min) {
        if (parseInt(min / 10) != (tmp_number = parseInt(times.min / 10)))  setNumberWithAnimation($number[2], tmp_number);
        if (min % 10 != (tmp_number = times.min % 10)) setNumberWithAnimation($number[3], tmp_number);
        min = times.min;
    }
    //秒渲染
    if (parseInt(second / 10) != (tmp_number = parseInt(times.second / 10)))  setNumberWithAnimation($number[4], tmp_number);
    if (second % 10 != (tmp_number = times.second % 10))   setNumberWithAnimation($number[5], tmp_number);
    second = times.second;
}
render();
window.setInterval(render, 1000);

//内容禁止选中
$app.onselectstart = function () {
    return false;
};

//复制时间函数
//todo 修改为兼容手机的方式
function copy() {
    if (window.document.selection) {
        var range = window.document.selection.createRange();
        range.moveToElementText($detail);
        range.select();
        range.execCommand("copy");
    } else if (window.getSelection) {
        selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents($detail);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("copy");
        selection.removeAllRanges();
    }

}

//获取下班时间
function getXiaBanTime() {
    try {
        var time = window.localStorage.time_xiaban.split(":");
        var xiaban = new Date().setHours(time[0].trim(), time[1].trim(), 0);
        if (xiaban) return xiaban;
        throw "时间转化错误!";
    } catch (e) {
        return new Date().setHours(18, 0, 0)
    }
}

//ga信息
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-55780211-4', 'auto');
ga('send', 'pageview');


//canvas背景
particleground($app, {
    dotColor: '#5cbdaa',
    lineColor: '#5cbdaa'
});