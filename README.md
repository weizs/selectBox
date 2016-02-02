# selectBox

依赖jQuery，兼容IE8+ & 其他浏览器

![image](https://raw.githubusercontent.com/weizhansheng/selectBox/master/select-box.png)


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
