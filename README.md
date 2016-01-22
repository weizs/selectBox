# selectBox

依赖jQuery

## 结构
```html
 <div class="select-box">
     <div class="select-box-inner">
         <input type="text" class="select-text">
     </div>
     <dl>
         <dd data-id="1">测试1</dd>
         <dd data-id="2">测试2</dd>
         <dd data-id="3">测试3</dd>
     </dl>
 </div>
 <select class="form-control" name="corp_id" id="corp_id" style="display: none;">
    <option value="1">测试1</option>
    <option value="2">测试2</option>
    <option value="3">测试3</option>
 </select>
```
## 方法

* var select1 = $('#select_id').selectBox()  原生select实例化
* var select2 = $('#div_id').selectBox()  div.select-box实例化，值初始化在dl>dd
* select1.setOptions([{},{},{}])  用于级联操作情况下重置数据
* select1.val()  得到当前选中对象数据（JSON）
* select1.val('value')  传入value，设置为当前选中值
* select1.disable()  禁用select实例
* select1.enable()  启用select实例
* select1.destroy()  销毁实例
* select1.refresh()  恢复select实例初始状态