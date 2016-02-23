# selectBox

依赖jQuery，兼容IE8+ & 其他浏览器

![image](https://raw.githubusercontent.com/weizs/selectBox/master/select-box.png)

[Demo Link](http://weizs.github.io/selectBox/)

## 结构

1.纯原生Select

无分组

```html
<select id="select_id" style="display: none;">
    <option value="1">测试1</option>
    <option value="2">测试2</option>
    <option value="3">测试3</option>
</select>
```

带分组

```html
<select id="select_id" style="display: none;">
    <optgroup label="分组1">
        <option value="11">测试11</option>
        <option value="12">测试12</option>
        <option value="13">测试13</option>
    </optgroup>
    <optgroup label="分组2">
        <option value="21">测试21</option>
        <option value="22">测试22</option>
        <option value="23">测试23</option>
    </optgroup>
</select>
```
 
2.div+dl>dd
 
无分组
 
```html
<div id="div_id">
    <div class="select-box-inner">
    <input type="text" class="select-text">
    </div>
    <dl>
        <dd data-id="1">测试1</dd>
        <dd data-id="2">测试2</dd>
        <dd data-id="3">测试3</dd>
    </dl>
</div>
```

带分组

```html
<div id="div_id">
    <div class="select-box-inner">
        <input type="text" class="select-text">
    </div>
    <dl data-label="分组1">
        <dd data-id="11">测试11</dd>
        <dd data-id="12">测试12</dd>
        <dd data-id="13">测试13</dd>
    </dl>
    <dl data-label="分组2">
        <dd data-id="21">测试21</dd>
        <dd data-id="22">测试22</dd>
        <dd data-id="23">测试23</dd>
    </dl>
</div>
```
 
3.纯div，jsAPI初始化数据
 
```html
<div id="div_id"></div>
```
 
实例化后DOM结构如下
 
```html
<div class="select-box" id="div_id">
    <div class="select-box-inner">
        <input type="text" class="select-text">
    </div>
    <dl>
        <dd data-group-index="0" data-select-index="0" data-id="1">测试1</dd>
        <dd data-group-index="1" data-select-index="1" data-id="2">测试2</dd>
        <dd data-group-index="2" data-select-index="2" data-id="3">测试3</dd>
    </dl>
</div>
<select id="select_id" style="display: none;">
    <option value="1">测试1</option>
    <option value="2">测试2</option>
    <option value="3">测试3</option>
</select>
```

## 参数

* dataKey: []<br>//通过select或者dl>dd进行初始化时，可在option或者dd上增加额外属性，格式为data-[key]，如：“data-corp_id”,会把对应数据存入options对象数组内

* style: {}<br>//select生成转化后wrap包装内联样式追加

* keys: {
    text: 'text',
    value: 'id'
}<br>//select text属性，可根据数据自行修改，默认通过dom创建的情况无需修改，select value属性，可根据数据自行修改，默认通过dom创建的情况无需修改

* placeholder: null<br>//选中项为空时显示文本，如："请选择"

* options: null<br>//纯数据初始化方式，传入对象数组

* combo: false<br>//默认普通下拉框，为true时为组合框

* clearText: false<br>//combo为true时点击文本是否清空当前显示文本，默认不清空

* hideArrowOnDisabled: false<br>//禁用时隐藏下拉箭头，默认不隐藏，用于特殊场景

* toggleArrow: false<br>//展开下拉列表时切换箭头，默认不切换

* disabled: false<br>//设置初始化时是否禁用

* noBorder: false<br>//是否显示显示部分边框

* maxHeight: null<br>//是否显示显示部分边框

* copyStyle: true<br>//原生select作为源的时候，自动扫描默认样式['display','border','margin','width']

* input: null<br>//fn,设置combo为true情况下输入内容时回调

* filter: null<br>//fn,初始化时过滤options数据，返回过滤后数组

* filtered: null<br>//fn,filterData调用完毕回调，返回已过滤数据

* filterItem: null<br>//fn,输出options时依次过滤每个节点数据

* formatter: null<br>//fn,输出options时格式化text内容

* create: null<br>//fn,创建完成后回调

* change: null<br>//fn,change事件，改变选中值时回调

## 方法

* var instance = $('#select_id').selectBox()<br>原生select实例化
* var instance = $('#div_id').selectBox()<br>div.select-box实例化，值初始化在dl>dd
* var instance = $('#div_id').selectBox({options:[{},{},{}]})<br>根据数组初始化，带分组初始化数据为<br>[{label:'分组1',options:[{},{},{}]},{label:'分组2',options:[{},{},{}]}]
* instance.setOptions([{},{},{}])<br>用于级联操作情况下重置数据
* instance.val()<br>得到当前选中对象数据（JSON）
* instance.val('value')<br>传入value，设置为当前选中值
* instance.disable()<br>禁用select实例
* instance.enable()<br>启用select实例
* instance.destroy()<br>销毁实例
* instance.refresh()<br>恢复select实例初始状态
