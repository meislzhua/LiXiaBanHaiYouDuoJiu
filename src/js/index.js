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
setTimeout(function(){
    particleground($app, {
        dotColor: '#5cbdaa',
        lineColor: '#5cbdaa'
    });
},0);

// ===================
// v0.1
// ===================
window.Command = {
    handlers: [],
    run: function (commandStr) {

        new CommandEngine(commandStr)
            .parse(ParseEngine.parseAsDefaultUsingRegExp())
            .pipe(UIHandler) // 手动注册，好处是调用逻辑清楚
            .pipe(AlertHandler)
            .pipeAll(this.handlers);

    },
    register: function (handler) {
        this.handlers.push(handler);
    }
};

function CommandEngine(commandStr) {
    this.origin = commandStr; // 保存的原始命令，
    this.compos = {
        // 参考 Docker 的命令风格
        // 示例 1)：xiaban ui --bgColor #5cbdaa --fontColor white
        // 示例 2): xiaban time --overTime 18:30
        initCommand: "", // 起始命令，如：xiaban
        functionalCommand: "", // 具体命令，具体功能，如：ui
        optional: {} // 具体命令的参数，如：--bgColor #5cbdaa 所有参数值都会字符串类型进行处理，同时字典化
    }
}

CommandEngine.prototype.parse = function (parseEngine) {
    this.compos = parseEngine.parse(this.origin) || this.compos;
    return this;
};

CommandEngine.prototype.pipe = function (mappingHandler) {
    if (mappingHandler.doFilter(this.compos)) {
        mappingHandler.handle(this.compos);
    }
    return this;
};

CommandEngine.prototype.pipeAll = function (mappingHandlers) {
    for (var i = 0; i < mappingHandlers.length; i++) {
        this.pipe(mappingHandlers[i]);
    }
    return this;
};

// ===================================

function MappingHandler(option) {
    this.filter = option.filter || null;
    this.optional = option.optional || {};
}

/**
 * 匹配接口
 * @param compos 解析后的数据
 * @returns {boolean} true表示当前Handler可以处理当前命令，false则相反
 */
MappingHandler.prototype.doFilter = function (compos) {

    // 这里只给出默认实现

    if (this.filter === null){
        return false;
    }

    return this.filter.initCommand && this.filter.functionalCommand
        && this.filter.initCommand === compos.initCommand
        && this.filter.functionalCommand === compos.functionalCommand ;

};

/**
 * 根据参数进行方法调用
 * @param compos 解析后的数据
 */
MappingHandler.prototype.handle = function (compos) {

    // 这里只给出默认实现
    // 继承后进行方法覆盖可以支持更多命令格式
    // 如 AliasMappingHandler ，让命令参数支持别名，哈哈哈哈，逃。。。/羊驼

    var commandOptKeys = Object.keys(compos.optional);
    for (var i = 0; i < commandOptKeys.length; i++) {
        var key = commandOptKeys[i];
        if (this.optional[key]){
            var func = this.optional[key];
            func(compos.optional[key]);
        }
    }
};


// 这里本来想使用模版方法，但感觉有点多余
// 注意：可以使用CommandUtils.inherit()继承后进行方法覆盖以支持更多命令格式
// 直接借鉴Vue的接口设计，配置式

// 示例一
// 注意：这里通过 CommandEngine#pipe() 进行手动注册
// 可查看 Command.run()的例子
var UIHandler = new MappingHandler({
    filter: {
        initCommand: "xiaban",
        functionalCommand: "ui"
    },
    optional: {
        bgColor: function (val) {  // 注意：val的类型为字符串
            document.getElementsByTagName("body")[0].style.backgroundColor = val;
        }
    }
});

// 示例二
// 注意：示例二使用了全局注册
var TimeHandler = new MappingHandler({
    filter: {
        initCommand: "xiaban",
        functionalCommand: "time"
    },
    optional: {
        overTime: function (val) {
            window.localStorage.setItem("time_xiaban",val);
        }
    }
});

// 全局注册
Command.register(TimeHandler);

// 示例三
// 也是手动注册
var AlertHandler = new MappingHandler({
    filter: {
        initCommand: "xiaban",
        functionalCommand: "info"
    },
    optional: {
        notify: function (val) {
            Notification.requestPermission(function (status) {
                console.log(status); // 仅当值为 "granted" 时显示通知
                var n = new Notification("离下班还有多久", {body: val || "/羊驼"}); // 显示通知
            });
        }
    }
});



// ===================================

function ParseEngine() {}

ParseEngine.prototype.parse = function (commandStr) {
    return {
        initCommand: "",
        functionalCommand: "",
        optional: {}
    };
};

/**
 * 使用正则进行解析
 * 注意：只要自己实现 ParseEngine.prototype.parse 方法就可以支持新的命令格式或者更好的解析性能
 */
ParseEngine.parseAsDefaultUsingRegExp = function (compos) {

    // 默认解析器实现
    // 使用正则匹配
    function DefaultUsingRegExp() {}
    // TODO 更加简洁的方式?
    CommandUtils.inherit(DefaultUsingRegExp, ParseEngine);
    DefaultUsingRegExp.prototype.parse = function (commandStr) {
        var before = Date.now();

        var regExpOfAll = /^\s*([a-zA-Z0-9]+)\s*([a-zA-Z0-9]+)(\s*--[a-zA-Z0-9]+(\s+[^\s]*|\s*))*/i;
        var regExpOfArguments = /(--[a-zA-Z0-9]+((?:\s+)(\S*)|))/ig;

        if (!regExpOfAll.test(commandStr)) {
            throw "哦，可能输入的命令格式不对，谁知道呢，/羊驼 " + "  ==> 命令：" + commandStr ;
        }

        var result = regExpOfAll.exec(commandStr);
        var compos = ParseEngine.prototype.parse.call({});

        compos.initCommand = result[1];
        compos.functionalCommand = result[2];

        var args = commandStr.match(regExpOfArguments);
        for( var i = 0 ; i < args.length ; i++) {
            var newItem = args[i].replace("--","").replace(/\s+/," ");
            var newArr = newItem.split(" ");
            compos.optional[newArr[0]] = newArr[1];
        }

        var after = Date.now();
//        console.log("命令解析对象：",compos);
        console.log("解析消耗时间（毫秒）：", after - before);
        return compos;
    };
    return new DefaultUsingRegExp();
};

var CommandUtils = {

    /**
     * 这里用了一种继承方法实现，好处是避免重写父类原型 /羊驼
     * @param C 子类
     * @param P 父类
     */
    inherit: function (C, P) {
        var F = function () {};
        F.prototype = P.prototype ;
        C.prototype = new F();
    }

};












