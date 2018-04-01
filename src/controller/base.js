/**
 * 信息在 cookie 里的名称
 *
 * @const
 * @type {string}
 */
const MSG_COOKIE_KEY = 'showMsg';

/**
 * 信息在模板里的变量名称
 *
 * @const
 * @type {string}
 */
const MSG_TPL_KEY = 'showMsg';

module.exports = class extends think.Controller {

    /**
     * 前置操作，处理用户登录状态、显示信息
     */
    async __before() {
        // 检查授权
        const token = await this.session('token');
        if (['login'].indexOf(this.ctx.action) == -1 && !token) {
            this.showMsg('请先登录', `/login.html?ref=${encodeURIComponent(this.ctx.url)}`);
        }
        this.token = token;
        this.assign({
            token
        });

        // 处理显示信息
        const msg = decodeURIComponent(this.cookie(MSG_COOKIE_KEY) || '');
        if (msg) {
            this.assign(MSG_TPL_KEY, JSON.parse(msg));
            this.cookie(MSG_COOKIE_KEY, null);
        }
    }

    /**
     * 处理显示文本数据
     *
     * @param  {Object|string} data 显示文本或者文本数据
     * @param {string} data.text 显示文字
     * @param {string} data.type 显示类型，success, danger
     * @return {Object} {text, type}
     */
    makeMsg(data) {
        if ('object' !== typeof data) {
            data = {
                text: data,
                type: 'success'
            };
        }

        return {
            text: data.text,
            type: data.type || 'success'
        };
    }

    /**
     * 显示信息到页面中
     *
     * @param  {Object|string} data 显示文本或者文本数据
     * @param  {string} url  跳转链接
     *
     * @return {Object}
     */
    async showMsg(data, url = '') {
        data = this.makeMsg(data);

        if (url) {
            this.cookie(MSG_COOKIE_KEY, encodeURIComponent(JSON.stringify(data)));
            return this.redirect(url);
        }

        this.assign(MSG_TPL_KEY, data);

        return this.display();
    }
};
