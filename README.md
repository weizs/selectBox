# selectBox

依赖jQuery

## 结构
 &gt;div class="select-box"&lt;
     &gt;div class="select-box-inner"&lt;
         &gt;input type="text" class="select-text"&lt;
     &gt;/div&lt;
     &gt;dl&lt;
         &gt;dd data-id="1"&lt;测试1&gt;/dd&lt;
         &gt;dd data-id="2"&lt;测试2&gt;/dd&lt;
         &gt;dd data-id="3"&lt;测试3&gt;/dd&lt;
     &gt;/dl&lt;
 &gt;/div&lt;
 &gt;select class="form-control" name="corp_id" id="corp_id" style="display: none;"&lt;
    &gt;option value="1"&lt;测试1&gt;/option&lt;
    &gt;option value="2"&lt;测试2&gt;/option&lt;
    &gt;option value="3"&lt;测试3&gt;/option&lt;
 &gt;/select&lt;

## 方法

### 原生select实例化，var select1 = $('#select_id').selectBox()
### div.select-box实例化，值初始化在dl>dd，var select2 = $('#div_id').selectBox()
### select1.setOptions([{},{},{}])，用于级联操作情况下重置数据
### select1.val()，得到当前选中对象数据（JSON）
### select1.val('value')，传入value，设置为当前选中值
### select1.disable()、select1.enable() 禁用、启用select实例
### select1.destroy() 销毁实例
### select1.refresh() 恢复select实例初始状态