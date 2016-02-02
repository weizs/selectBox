/**!
 * jquery.selectBox.js v1.0
 * 通过原生select或者使用数据生成自定义下拉(组合)框
 * PS:采用原生select生成时建议实现设置visibility:hidden
 * http://www.poorren.com/jquery-select-box-plugin
 * https://github.com/weizhansheng/selectBox
 * Released under the MIT license
 * Date: 2016-01-22
 */
/*global jQuery*/
;(function ($) {
    'use strict';
    var cache = {},
        noop = function () {
        },
        styleNeedSuffix = ['margin', 'padding'],
        styleSuffix = ['Left', 'Right', 'Top', 'Bottom'],
        autoCopyStyle = ['float', 'display', 'margin', 'width'],
        index = 1,
        tpl = '<div class="select-box"><div class="select-box-inner"><div class="v-align"><input type="text" class="select-text" /></div></div><dl></dl></div>',
        defaults = {
            dataKey: [],     //通过select或者dl>dd进行初始化时，可在option或者dd上增加额外属性，格式为data-[key]，如：“data-corp_id”,会把对应数据存入options对象数组内
            style: {},     //select生成转化后wrap包装内联样式追加
            keys: {
                text: 'text', //select text属性，可根据数据自行修改，默认通过dom创建的情况无需修改
                value: 'id'    //select value属性，可根据数据自行修改，默认通过dom创建的情况无需修改
            },
            placeholder: null,   //选中项为空时显示文本，如："请选择"
            options: null,   //纯数据初始化方式，传入对象数组
            combo: false,  //默认普通下拉框，为true时为组合框
            clearTextOnFocus: false,  //combo为true时点击文本是否清空当前显示文本，默认不清空
            hideArrowOnDisabled: false,  //禁用时隐藏下拉箭头，默认不隐藏，用于特殊场景
            toggleArrowOnOpened: false,  //展开下拉列表时切换箭头，默认不切换
            onInput: null,   //设置combo为true情况下输入内容时回调
            filter: null,   //初始化时过滤options数据，返回过滤后数组
            filtered: null,   //filterData调用完毕回调，返回已过滤数据
            filterItem: null,   //输出options时依次过滤每个节点数据
            formatter: null,   //输出options时格式化text内容
            create: null,   //创建完成后回调
            change: null,   //change事件，改变选中值时回调
            disabled: false,  //设置初始化时是否禁用
            noBorder: false,  //是否显示显示部分边框
            maxHeight: null,   //是否显示显示部分边框
            autoCopyStyle: true    //原生select作为源的时候，自动扫描默认样式['display','border','margin','width']
        },
        proto = {
            init: function (instance, refresh) {
                var _self = this, create = instance.config.create;
                //创建
                _self.create(instance, refresh);
                //绑定事件
                _self.bindEvent(instance);
                //创建完成回调
                if (create && typeof create === 'function') {
                    create.call(instance, _self.getSelected(instance));
                }
                //返回methods
                return _self.getMethods(instance);
            },
            change: function (instance, option, oldOption) {
                var config = instance.config, keys = config.keys;
                if (option && oldOption) {
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
                }
                return true;
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
            select: function (options, node, status) {
                if (options && node) {
                    var groupIndex = node.data('group-index'), index = node.data('select-index'), group = options[groupIndex];
                    node.toggleClass('on', status);
                    if (group && group.options) {
                        var option = group.options[index];
                        if (option) {
                            option.selected = status;
                        }
                        return option;
                    }
                }
                return null;
            },
            setSelected: function (instance, selected) {
                if (!selected.jquery) {
                    selected = instance.wrap.find('dd[data-id="' + selected + '"]');
                }
                if (selected.length && !selected.hasClass('on')) {
                    var _self = this, config = instance.config,
                        options = config.isGroup ? config.options : [{options: config.options}],
                        text = selected.text(),
                        oldOption = _self.select(options, instance.selected, false),
                        option = _self.select(options, selected, true);
                    if (option) {
                        instance.selected = selected;
                    }
                    if (config.formatter) {
                        text = config.formatter(text);
                    }
                    instance.text.val(text).attr('value', text);
                    return _self.change(instance, option, oldOption);
                }
                return false;
            },
            unbindEvent: function (instance) {
                var wrap = instance.wrap, config = instance.config;
                if (wrap) {
                    wrap.toggleClass('hide-arrow', !!config.hideArrowOnDisabled);
                    wrap.addClass('disabled');
                    wrap.off('click');
                    if (config.combo && config.onInput) {
                        wrap.off('input propertychange');
                    }
                }
            },
            bindEvent: function (instance) {
                var _self = this,
                    wrap = instance.wrap,
                    config = instance.config;
                //取消已绑定事件
                _self.unbindEvent(instance);
                if (wrap && !config.disabled) {
                    wrap.toggleClass('hide-arrow', !!config.hideArrowOnDisabled);
                    wrap.removeClass('disabled');
                    if (config.combo && config.onInput) {
                        wrap.on('input propertychange', '.select-text', function () {
                            config.onInput.call(instance, _self.getSelected(instance));
                        });
                    }
                    wrap.on('click', '.select-box-inner', function (e) {
                        if (wrap.hasClass('open')) {
                            wrap.removeClass('open');
                        } else {
                            if (cache.wrap) {
                                cache.wrap.removeClass('open');
                            }
                            cache.wrap = instance.wrap;

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
                        //选择
                        _self.setSelected(instance, $(this));
                        //选择后关闭
                        wrap.removeClass('open');
                    });
                    _self._preventScroll(instance.listWrap);
                    if (!cache.doc) {
                        cache.doc = $(document).on('click', function (e) {
                            var target = $(e.target);
                            if (!target.is('.select-box') && !target.closest('.select-box').length && cache.wrap) {
                                cache.wrap.removeClass('open');
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
            create: function (instance, refresh) {
                var _self = this,
                    config = instance.config,
                    $node = config.node,
                    options = config.options = config.options || [];
                //初始化
                var isOrigin = _self._parseOptions(instance, config, options, refresh);
                //如果config不存在disabled配置，原生DOM有配置属性，则重新赋值
                if (isOrigin && typeof config.disabled === 'undefined') {
                    config.disabled = $node.prop('disabled') || $node.attr('disabled') || $node.attr('readonly');
                }
                //初始化wrap
                instance.wrap = _self.createWrap($node, instance.originSelectSource, config);
                //列表包装
                instance.listWrap = instance.wrap.find('dl');
                //设置wrap样式
                instance.wrap.css(config.style);
                //设置listWrap样式
                if (config.maxHeight) {
                    instance.listWrap.css({maxHeight: config.maxHeight});
                }
                //设置listWrap分组样式
                instance.listWrap.toggleClass('group', config.isGroup);
                //初始化text并设置text样式
                instance.text = instance.wrap.find('.select-text').attr('readonly', !config.combo);
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
            createWrap: function ($node, originSelectSource, config) {
                var wrap = $node;
                if (originSelectSource) {
                    //originSelectSource copy style
                    if (config.autoCopyStyle) {
                        var style = {}, styleNames = $.isArray(config.autoCopyStyle) ? config.autoCopyStyle : autoCopyStyle;
                        $.each(styleNames, function (i, name) {
                            var val = $node.css(name);
                            if (val) {
                                style[name] = val;
                            } else if ($.inArray(name, styleNeedSuffix) > -1) {
                                $.each(styleSuffix, function (i, suffix) {
                                    style[name + suffix] = $node.css(name + suffix);
                                });
                            }
                        });
                        config.style = $.extend(true, {}, style, config.style);
                    }

                    wrap = $node.prev('div.select-box');
                    if (!wrap.length) {
                        wrap = $(tpl);
                        //将自定义节点加入原生节点之前
                        $node.hide().before(wrap);
                    }
                } else {
                    //div样式追加
                    $node.addClass('select-box');
                    if (!$node.find('.select-box-inner').length || !$node.find('dl').length) {
                        $node.html('<div class="select-box-inner"><div class="v-align"><input type="text" class="select-text" /></div></div><dl></dl>');
                    }
                }

                return wrap.toggleClass('combo', !!config.combo).toggleClass('toggle', !!config.toggleArrowOnOpened);
            },
            _parseOptions: function (instance, config, options, refresh) {
                var _self = this, $node = config.node, keys = config.keys,
                    isGroup = false, ddSource = false, originSelectSource = false;

                if (!refresh) {
                    //保留原始信息
                    instance.originStyle = $node.attr('style');
                    instance.originClass = $node.attr('class');
                    instance.sourceHTML = $node.html();
                }

                //如果没有options，扫描dom生成options
                if (options.length) {
                    isGroup = !!options[0].label && !options[0][keys.text] && !options[0][keys.value];
                } else {
                    if ($node.is('select')) {
                        $node.css('visibility', 'hidden');
                        var group = $node.find('optgroup');

                        isGroup = !!group.length;
                        if (!isGroup) {
                            group = group.add($node);
                        }
                        group.each(function (idx) {
                            var groupEl = group.eq(idx),
                                groupOptions = isGroup ? [] : options,
                                optionEls = groupEl.find('option');
                            optionEls.each(function (i) {
                                var option = {},
                                    optionEl = optionEls.eq(i);
                                option[keys.text] = optionEl.text();
                                option[keys.value] = optionEl.attr('value') || '';
                                option.selected = optionEl.prop('selected');
                                _self.fetch(config.dataKey, keys, function (key) {
                                    option[key] = optionEl.data(key) || $node.data(key);
                                });
                                groupOptions.push(option);
                            });
                            if (isGroup) {
                                options.push({
                                    label: groupEl.attr('label'),
                                    options: groupOptions
                                });
                            }
                        });
                        originSelectSource = true;
                    } else {
                        var dl = $node.find('dl');
                        isGroup = dl.length > 1;
                        if (dl.length) {
                            dl.each(function (idx) {
                                var groupEl = dl.eq(idx),
                                    groupOptions = isGroup ? [] : options,
                                    dd = groupEl.find('dd');
                                dd.each(function (i) {
                                    var option = {},
                                        optionEl = dd.eq(i);
                                    option[keys.text] = optionEl.text();
                                    option[keys.value] = optionEl.data(keys.value) || '';
                                    option.selected = !!optionEl.data('selected');
                                    _self.fetch(config.dataKey, keys, function (key) {
                                        option[key] = optionEl.data(key) || $node.data(key);
                                    });
                                    groupOptions.push(option);
                                });
                                if (isGroup) {
                                    options.push({
                                        label: groupEl.data('label'),
                                        options: groupOptions
                                    });
                                }
                            });
                            ddSource = true;
                        }
                    }
                }

                instance.originSelectSource = originSelectSource;
                instance.ddSource = ddSource;
                config.isGroup = isGroup;

                return originSelectSource || ddSource;
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
                instance.text.val(text).attr('value', text);
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

                var html = this._getOptionsHtml(config.isGroup, options, keys, config.filterItem);

                instance.listWrap.html(html);
                //显示选中文本
                this._showSelected(instance);

                if (config.filtered) {
                    config.filtered.call(instance, options);
                }
                //如果visibility不是visible，设置为visible
                if (instance.wrap.css('visibility') !== 'visible') {
                    instance.wrap.css('visibility', 'visible');
                }
            },
            _getOptionHtml: function (option, keys, index, groupIndex) {
                return '<dd data-group-index="' + (groupIndex || 0) + '" data-select-index="' + index + '" data-id="' + option[keys.value] + '"' + (option.selected ? ' class="on"' : '') + '>' + option[keys.text] + '</dd>';
            },
            _getOptionsHtml: function (isGroup, groupOptions, keys, filterItem) {
                var optionHtml = [];
                if (groupOptions && groupOptions.length) {
                    var optionsArray = [{
                        options: groupOptions
                    }];
                    if (isGroup) {
                        optionsArray = groupOptions;
                    }
                    for (var idx = 0; idx < optionsArray.length; idx++) {
                        var optionsObj = optionsArray[idx];
                        if (isGroup) {
                            optionHtml.push('<dt>' + (optionsObj.label || (idx + 1)) + '</dt>');
                        }
                        var options = optionsObj.options;
                        if (filterItem) {
                            for (var f = 0; f < options.length; f++) {
                                var item = options[f];
                                item.is_valid = filterItem(item);
                                if (item.is_valid) {
                                    optionHtml.push(this._getOptionHtml(item, keys, f, idx));
                                }
                            }
                        } else {
                            for (var i = 0; i < options.length; i++) {
                                optionHtml.push(this._getOptionHtml(options[i], keys, i, idx));
                            }
                        }
                    }
                }
                return optionHtml.join('');
            },
            _preventScroll: function (dom) {
                var $dom = dom.jquery ? dom : $(dom);
                dom = $dom.get(0);

                if (!$dom.data('mouse-wheel')) {
                    $dom.attr('data-mouse-wheel', 1);

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
                var _self = this, config = instance.config, methods = {};
                /**
                 * 配置
                 * @param config
                 */
                methods.setConfig = function (config) {
                    $.extend(true, instance.config, config);
                    methods.refresh();
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
                    _self.init(instance, true);
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
                        if (config.hideArrowOnDisabled) {
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
                    var config = instance.config,
                        node = config.node,
                        boxId = _self.getBoxId(node);
                    if (instance.originSelectSource) {
                        instance.wrap.next().css('visibility', 'visible').show();
                        instance.wrap.remove();
                    } else {
                        instance.wrap.html(instance.sourceHTML);
                    }
                    node.attr({
                        'data-select-box-id': null,
                        'style': instance.originStyle || null,
                        'class': instance.originClass || null
                    });
                    delete cache[boxId];
                };
                return methods;
            }
        };

    var SelectBox = function (node, config) {
        this.config = $.extend(true, {node: $(node)}, defaults, config);
        return proto.init(this);
    };

    $.fn.extend({
        selectBox: function (config) {
            //暂时仅支持单选择器创建
            var node = this.eq(0), boxId = proto.getBoxId(node);
            if (cache[boxId]) {
                cache[boxId].setConfig(config);
            } else {
                cache[boxId] = new SelectBox(node, config);
            }
            return cache[boxId];
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
                var callback = $.type(args[args.length - 1]) === 'function' ? args.pop() : noop;
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