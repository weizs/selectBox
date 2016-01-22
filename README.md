# selectBox

依赖jQuery

## 结构
```html
 &lt;div class="select-box"&gt;
     &lt;div class="select-box-inner"&gt;
         &lt;input type="text" class="select-text"&gt;
     &lt;/div&gt;
     &lt;dl&gt;
         &lt;dd data-id="1"&gt;测试1&lt;/dd&gt;
         &lt;dd data-id="2"&gt;测试2&lt;/dd&gt;
         &lt;dd data-id="3"&gt;测试3&lt;/dd&gt;
     &lt;/dl&gt;
 &lt;/div&gt;
 &lt;select class="form-control" name="corp_id" id="corp_id" style="display: none;"&gt;
    &lt;option value="1"&gt;测试1&lt;/option&gt;
    &lt;option value="2"&gt;测试2&lt;/option&gt;
    &lt;option value="3"&gt;测试3&lt;/option&gt;
 &lt;/select&gt;
```
## 方法

1.  var select1 = $('#select_id').selectBox()  原生select实例化
2.  var select2 = $('#div_id').selectBox()  div.select-box实例化，值初始化在dl>dd
3.  select1.setOptions([{},{},{}])  用于级联操作情况下重置数据
4.  select1.val()  得到当前选中对象数据（JSON）
5.  select1.val('value')  传入value，设置为当前选中值
6.  select1.disable()  禁用select实例
7.  select1.enable()  启用select实例
8.  select1.destroy()  销毁实例
9.  select1.refresh()  恢复select实例初始状态