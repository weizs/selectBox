/**
 *下拉组合框，采用原生select生成时建议实现设置visibility:hidden
 * Created by William Wei on 2016/01/22.
 */

/*
 <div class="select-box">
 <div class="select-box-inner">
 <input type="text" class="select-text">
 </div>
 <dl>
 <dd>测试</dd>
 <dd>测试</dd>
 <dd>测试</dd>
 </dl>
 </div>
 <select class="form-control" name="corp_id" id="corp_id" style="display: none;">
 </select>
 */

/*
 *
 * 1、原生select实例化，var select1 = $('#select_id').selectBox()
 * 2、div.select-box实例化，值初始化在dl>dd，var select2 = $('#div_id').selectBox()
 * 3、select1.setOptions([{},{},{}])，用于级联操作情况下重置数据
 * 4、select1.val()，得到当前选中对象数据（JSON）
 * 5、select1.val('value')，传入value，设置为当前选中值
 * 6、select1.disable()、select1.enable() 禁用、启用select实例
 * 7、select1.destroy() 销毁实例
 * 8、select1.refresh() 恢复select实例初始状态
 * */

//DOMNodeRemoved //TODO

'use strict';
!(function ($) {
    var publicCache = {};
    var index = 1;
    var defaults = {
        dataKey           : [],     //通过select或者dl>dd进行初始化时，可在option或者dd上增加额外属性，格式为data-[key]，如：“data-corp_id”,会把对应数据存入options对象数组内
        style             : {},     //select生成转化后wrap包装内联样式追加
        keys              : {
            text          : 'text', //select text属性，可根据数据自行修改，默认通过dom创建的情况无需修改
            value         : 'id'    //select value属性，可根据数据自行修改，默认通过dom创建的情况无需修改
        },
        placeholder       : null,   //选中项为空时显示文本，如："请选择"
        options           : null,   //纯数据初始化方式，传入对象数组
        combo             : false,  //默认普通下拉框，为true时为组合框
        clearTextOnFocus  : false,  //combo为true时点击文本是否清空当前显示文本，默认不清空
        hideArrowDisabled : false,  //禁用时隐藏下拉箭头，默认不隐藏，用于特殊场景
        onInput           : null,   //设置combo为true情况下输入内容时回调
        filter            : null,   //初始化时过滤options数据，返回过滤后数组
        filtered          : null,   //filterData调用完毕回调，返回已过滤数据
        filterItem        : null,   //输出options时依次过滤每个节点数据
        formatter         : null,   //输出options时格式化text内容
        create            : null,   //创建完成后回调
        change            : null,   //change事件，改变选中值时回调
        disabled          : false,  //设置初始化时是否禁用
        noBorder          : false,  //是否显示显示部分边框
        maxHeight         : null,   //是否显示显示部分边框
        autoCopyStyle     : true    //原生select作为源的时候，自动扫描默认样式
    };

    var tpl = '<div class="select-box"><div class="select-box-inner"><input type="text" class="select-text"></div><dl></dl></div>';

    var SelectProto = {
        init: function (instance) {
            var _self = this,
                config = instance.config,
                create = config.create;

            //创建
            _self.create(instance);
            //移除事件
            _self.unbindEvent(instance);

            if (!config.disabled) {
                _self.bindEvent(instance);
            }

            if (create && typeof create === 'function') {
                create.call(instance, _self.getSelected(instance));
            }

            //返回methods
            return _self.getMethods(instance);
        },
        change: function (instance, option, oldOption) {
            var config = instance.config,
                keys = config.keys;
            if (instance.originSelectSource) {
                var node = config.node,
                    optionEl = node.find('option[value="' + option[keys.value] + '"]'),
                    oldOptionEl = node.find('option[value="' + oldOption[keys.value] + '"]');

                if (optionEl.length) {
                    optionEl.attr('selected', 'selected').prop('selected', true);
                }

                if (oldOptionEl.length) {
                    oldOptionEl.removeAttr('selected').prop('selected', false);
                }
                node.trigger('change');
            }
            if (config.combo && config.onInput) {
                config.onInput.call(instance, this.getSelected(instance));
            }
            if (typeof config.change === 'function') {
                config.change.call(instance, option);
            }
        },
        getSelected: function (instance) {
            var config = instance.config,
                options = config.options || [],
                keys = config.keys,
                text = instance.text && instance.text.val(),
                selectedIndex = instance.selected ? instance.selected.data('select-index') : 0,
                option = options[selectedIndex];
            if (config.combo) {
                if (option && option[keys.text] === text) {
                    option.custom = false;
                    return option;
                } else {
                    var tmpOption = {};
                    tmpOption[keys.text] = text;
                    tmpOption[keys.value] = '';
                    tmpOption.selected = true;
                    tmpOption.custom = true;
                    return tmpOption;
                }
            } else {
                return option;
            }
        },
        setSelected: function (instance, selected) {
            if (!selected.jquery) {
                selected = instance.wrap.find('dd[data-id="' + selected + '"]');
            }

            if (!selected.length) {
                return false;
            }

            var _self = this,
                config = instance.config,
                options = config.options,
                text = selected.text(),
                index = selected.data('select-index'),
                option = options[index],
                oldOption = null;

            selected.addClass('on');
            if (instance.selected) {
                instance.selected.removeClass('on');
                oldOption = options[instance.selected.data('select-index')];
                if (oldOption) {
                    oldOption.selected = false;
                }
            }

            option.selected = true;
            instance.selected = selected;

            if (config.formatter) {
                text = config.formatter(text);
            }
            instance.text.val(text).attr('value', text).show();

            _self.change(instance, option, oldOption);
            return true;
        },
        unbindEvent: function (instance) {
            var wrap = instance.wrap,
                config = instance.config;
            if (wrap) {
                if (config.hideArrowDisabled) {
                    wrap.addClass('hide-arrow');
                }
                wrap.addClass('disabled');
                wrap.off('click');
            }
        },
        bindEvent: function (instance) {
            var _self = this,
                wrap = instance.wrap,
                config = instance.config;
            if (wrap) {
                wrap.removeClass('disabled');
                if (config.hideArrowDisabled) {
                    wrap.removeClass('hide-arrow');
                }
                if (config.combo && config.onInput) {
                    wrap.on('input propertychange', '.select-text', function () {
                        config.onInput.call(instance, _self.getSelected(instance));
                    });
                }

                wrap.on('click', '.select-box-inner', function (e) {
                    if (wrap.hasClass('open')) {
                        wrap.removeClass('open');
                    } else {
                        if (publicCache.wrap) {
                            publicCache.wrap.removeClass('open');
                        }
                        publicCache.wrap = instance.wrap;

                        if (config.filterItem) {
                            _self._setOptions(instance);
                        }

                        wrap.addClass('open');
                        if (config.combo && config.clearTextOnFocus) {
                            var $target = $(e.target);
                            if ($target.is('.select-text')) {
                                $target.val('');
                                wrap.removeClass('open');
                            }
                        }
                    }
                });

                wrap.on('click', 'dd', function () {
                    var selectedEl = $(this);

                    if (!selectedEl.hasClass('on')) {
                        _self.setSelected(instance, selectedEl);
                    }
                    //选择后关闭
                    wrap.removeClass('open');

                });

                _self._preventScroll(instance.listWrap);

                if (!publicCache.selectEventProxy) {
                    publicCache.selectEventProxy = true;
                    $('body').on('click', function (e) {
                        var target = $(e.target);
                        if (!target.is('.select-box') && !target.closest('.select-box').length) {
                            $('.select-box').removeClass('open');
                        }
                    });
                }
            }
        },
        getBoxId: function (node) {
            var boxId = node.data('select-box-id');
            if (node && !boxId) {
                boxId = 'select_' + index++;
                node.attr('data-select-box-id', boxId);
                return boxId;
            }
            return boxId;
        },
        create: function (instance) {
            var _self = this,
                config = instance.config,
                $node = config.node,
                options = config.options = config.options || [];

            //初始化
            var isOrigin = _self._parseOptions(instance, config, options);

            //初始化wrap
            instance.wrap = _self.createWrap($node, isOrigin || !$node.is('div'), config);

            instance.listWrap = instance.wrap.find('dl');

            //设置wrap样式
            instance.wrap.css(config.style);

            //设置listWrap样式
            if (config.maxHeight) {
                instance.listWrap.css({
                    maxHeight: config.maxHeight
                });
            }

            //初始化text
            instance.text = instance.wrap.find('.select-text');

            //设置text样式
            instance.text.attr('readonly', !config.combo);

            //设置显示文本框样式
            if (config.noBorder) {
                instance.wrap.find('.select-box-inner').css({borderColor: 'transparent'});
            }

            //设置下拉项
            _self._setOptions(instance, true);

        },
        fetch: function (dataKey, keys, fn) {
            if (dataKey && dataKey.length && fn) {
                for (var i = 0; i < dataKey.length; i++) {
                    var key = dataKey[i];
                    if (key && !keys[key]) {
                        fn(key);
                    }
                }
            }
        },
        createWrap: function ($node, isOrigin, config) {
            var wrap = $node;
            if (isOrigin) {
                wrap = $node.prev('div.select-box');
                if (!wrap.length) {
                    if (config.autoCopyStyle) {
                        var style = {
                            width: $node.css('width'),
                            margin: $node.css('margin'),
                            float: $node.css('float')
                        };
                        config.style = $.extend(true, {}, style, config.style);
                    }
                    wrap = $(tpl);
                    //将自定义节点加入原生节点之前
                    $node.before(wrap);

                    $node.hide();

                    //如果原生下拉框是禁用状态，复制
                    config.disabled = $node.prop('disabled') || $node.attr('readonly');
                }
            } else {
                //div样式追加
                if (!$node.hasClass('select-box')) {
                    $node.addClass('select-box');
                }
                if (!$node.find('.select-box-inner').length || !$node.find('dl').length) {
                    $node.html('<div class="select-box-inner"><input type="text" class="select-text"></div><dl></dl>');
                }
            }
            if (config.combo) {
                wrap.addClass('combo');
            }
            return wrap;
        },
        _parseOptions: function (instance, config, options) {
            var _self = this,
                $node = config.node,
                keys = config.keys,
                isOrigin = false,
                ddSource = false,
                originSelectSource = false;

            //如果没有options，扫描dom生成options
            if (!options.length) {
                if ($node.is('select')) {
                    $node.css('visibility', 'hidden');
                    var optionEls = $node.find('option');
                    optionEls.each(function (i) {
                        var option = {},
                            optionEl = optionEls.eq(i);
                        option[keys.text] = optionEl.text();
                        option[keys.value] = optionEl.attr('value') || '';
                        option.selected = optionEl.prop('selected');
                        _self.fetch(config.dataKey, keys, function (key) {
                            option[key] = optionEl.data(key) || $node.data(key);
                        });
                        options.push(option);
                    });
                    originSelectSource = true;
                    isOrigin = true;
                } else {
                    var dd = $node.find('dl>dd');
                    if (dd.length) {
                        dd.each(function (i) {
                            var option = {},
                                optionEl = dd.eq(i);
                            option[keys.text] = optionEl.text();
                            option[keys.value] = optionEl.data(keys.value) || '';
                            option.selected = !!optionEl.data('selected');
                            _self.fetch(config.dataKey, keys, function (key) {
                                option[key] = optionEl.data(key) || $node.data(key);
                            });
                            options.push(option);
                        });
                        ddSource = true;
                    }
                }
            }
            instance.originSelectSource = originSelectSource;
            instance.domSource = ddSource || originSelectSource;

            return isOrigin;
        },
        _setPlaceholder: function (config, options, hidePlaceholder) {
            if (config.placeholder) {
                var keys = config.keys,
                    placeholder = {};

                if (options[0].placeholder) {
                    options.shift();
                }

                if (!hidePlaceholder && options.length && options[0][keys.text] !== config.placeholder) {
                    placeholder[keys.text] = config.placeholder;
                    placeholder[keys.value] = '';
                    placeholder.selected = false;
                    placeholder.placeholder = true;
                    options.splice(0, 0, placeholder);
                }
            }
        },
        _showSelected: function (instance) {
            var config = instance.config,
                selected = instance.wrap.find('dd.on');

            if (!selected.length) {
                selected = instance.wrap.find('dd:eq(0)').addClass('on');
            }

            var text = selected.text();
            if (config.formatter) {
                text = config.formatter(text);
            }

            instance.selected = selected;
            instance.text.val(text).attr('value', text).show();
        },
        _setOptions: function (instance, isFilter, hidePlaceholder) {
            var config = instance.config,
                options = config.options,
                hasSelect = false,
                keys = config.keys;


            //如果存在filter，则事先执行filter
            if (isFilter && config.filter && typeof config.filter === 'function') {
                options = config.options = config.filter(options);
            }

            //如果存在placeholder，则事先插入
            this._setPlaceholder(config, options, hidePlaceholder);

            //判断默认
            for (var i = 0; i < options.length; i++) {
                if (options[i].selected) {
                    hasSelect = true;
                    break;
                }
            }

            if (!hasSelect && options[0]) {
                options[0].selected = true;
            }

            var html = this._getOptionsHtml(options, keys, config.filterItem);

            instance.listWrap.html(html);
            //显示选中文本
            this._showSelected(instance);

            if (config.filtered) {
                config.filtered.call(instance, options);
            }
        },
        _getOptionHtml: function (option, keys, index) {
            return '<dd data-select-index="' + index + '" data-id="' + option[keys.value] + '"' + (option.selected ? ' class="on"' : '') + '>' + option[keys.text] + '</dd>';
        },
        _getOptionsHtml: function (options, keys, filterItem) {
            var optionHtml = [];
            if (options && options.length) {
                if (filterItem) {
                    for (var f = 0; f < options.length; f++) {
                        var item = options[f];
                        item.is_valid = filterItem(item);
                        if (item.is_valid) {
                            optionHtml.push(this._getOptionHtml(item, keys, f));
                        }
                    }
                } else {
                    for (var i = 0; i < options.length; i++) {
                        optionHtml.push(this._getOptionHtml(options[i], keys, i));
                    }
                }
            }
            return optionHtml.join('');
        },
        _preventScroll: function (dom) {
            if (dom.jquery) {
                dom = dom.get(0);
            }
            if (!dom.getAttribute('data-mouse-wheel')) {
                dom.setAttribute('data-mouse-wheel', 'bind');
                if (navigator.userAgent.indexOf('Firefox') >= 0) {   //firefox
                    dom.addEventListener('DOMMouseScroll', function (e) {
                        dom.scrollTop += e.detail > 0 ? 60 : -60;
                        e.preventDefault();
                    }, false);
                } else {
                    dom.onmousewheel = function (e) {
                        e = e || window.event;
                        dom.scrollTop += e.wheelDelta > 0 ? -60 : 60;
                        return false;
                    };
                }
            }
        },
        setOptions: function (instance, options, isFilter, hidePlaceholder) {
            var config = instance.config;

            //由原先dom生成下拉框实例不允许设置options改为允许，同时数据源标示变更为非原生
            instance.originSelectSource = false;
            if (options) {
                delete config.options;
                config.options = options;
            }

            delete instance.selected;

            this._setOptions(instance, isFilter, hidePlaceholder);
        },
        getMethods: function (instance) {
            var _self = this,
                config = instance.config,
                methods = {};
            /**
             * 配置
             * @param config
             */
            methods.setConfig = function (config) {
                $.extend(true, instance.config, config);
            };

            /**
             * 获取值、设置值
             * @param val 可选
             * @returns {*}
             */
            methods.val = function (val) {
                if (val) {
                    return _self.setSelected(instance, val);
                } else {
                    return _self.getSelected(instance);
                }
            };

            /**
             * 设置options数据
             * @param options 必填
             * @param isFilter 是否过滤
             * @param hidePlaceholder 是否隐藏placeholder
             */
            methods.setOptions = function (options, isFilter, hidePlaceholder) {
                _self.setOptions(instance, options, isFilter, hidePlaceholder);
            };

            /**
             * 刷新，初始化
             */
            methods.refresh = function () {
                var options = config.options;
                for (var i = 0; i < options.length; i++) {
                    if (options[i].selected) {
                        options[i].selected = false;
                    }
                }
                delete instance.selected;
                if (instance.originSelectSource) {
                    delete config.options;
                }
                _self.init(instance);
            };

            /**
             * 禁用
             */
            methods.disable = function () {
                if (!config.disabled) {
                    config.disabled = true;
                    _self.unbindEvent(instance);

                    if (config.combo) {
                        instance.text.attr('readonly', 'readonly');
                    }
                }
            };

            /**
             * 启用
             */
            methods.enable = function () {
                if (config.disabled) {
                    config.disabled = false;
                    _self.bindEvent(instance);
                    if (config.hideArrowDisabled) {
                        instance.wrap.removeClass('hide-arrow');
                    }
                    if (config.combo) {
                        instance.text.removeAttr('readonly');
                    }
                }
            };

            /**
             * 销毁
             */
            methods.destroy = function () {
                _self.unbindEvent(instance);
                var boxId = SelectProto.getBoxId(instance.config.node);
                if (instance.originSelectSource) {
                    instance.wrap.next().css('visibility', 'visible').show();
                    instance.wrap.remove();
                }
                delete publicCache[boxId];
            };
            return methods;
        }
    };

    var SelectBox = function (node, config) {
        this.config = $.extend(true, {node: $(node)}, defaults, config);
        return SelectProto.init(this);
    };

    $.fn.extend({
        selectBox: function (config) {
            //暂时仅支持单选择器创建
            var node = this.eq(0);
            var boxId = SelectProto.getBoxId(node);
            if (publicCache[boxId]) {
                publicCache[boxId].setConfig(config);
                publicCache[boxId].refresh();
            } else {
                publicCache[boxId] = new SelectBox(node, config);
            }
            return publicCache[boxId];
        },
        /**
         * config
         * params
         * callback
         * @returns {*}
         */
        selectBoxs: function () {
            var args = Array.prototype.slice.apply(arguments),
                config = args.shift();

            if ($.type(config) === 'string') {
                var callback = $.type(args[args.length - 1]) === 'function' ? args.pop() : function () {
                };

                return this.each(function () {
                    var instance = $(this).selectBox();
                    if (instance && instance[config]) {
                        callback.call(instance, instance[config].apply(this, args));
                    }
                });
            }
            return this.each(function () {
                $(this).selectBox($.extend(true, {}, config));
            });
        }
    });

})(jQuery);
