const path = require('path');
const fs = require('fs');
const Base = require('./base.js');

module.exports = class extends Base {

    /**
     * 获取授权码
     *
     * @return {Array|string} 默认为*
     */
    getTokens() {
        let tokens = '*';

        try {
            const filepath = path.join(think.ROOT_PATH, 'token.json');
            delete require.cache[filepath];
            tokens = require(filepath);
        }
        catch (e) {
            think.logger.error(new Error(e));
        }

        return tokens;
    }

    /**
     * 登录授权
     *
     * @return {Object}
     */
    async loginAction() {
        if (this.isPost) {
            const {token} = this.post();
            const list = this.getTokens();

            // 检查授权码
            if (list !== '*' && list.indexOf(token) === -1) {
                think.logger.warn(`注入：${token}`);
                return this.showMsg({
                    text: '授权码错误',
                    type: 'danger'
                }, this.ctx.url);
            }

            // 写入状态
            await this.session('token', token);
            think.logger.info(`授权成功：${token}`);
            return this.showMsg('授权成功', this.ctx.query.ref || '/');
        }
        return this.display();
    }

    /**
     * 获取静态文件路径
     *
     * @param  {string} filename 文件名
     *
     * @return {string}
     */
    getFilePath(filename) {
        const extname = path.extname(filename);
        const basename = path.basename(filename, extname);
        const htmlDir = path.join(this.config('htmlDir'), this.token);
        return `${htmlDir}${path.sep}${basename.replace(/[\.\/\\]+/g, '')}${extname}`;
    }

    /**
     * 获取 CDN 静态文件路径
     *
     * @param  {string} filename 文件名
     *
     * @return {string}
     */
    getCDNFilePath(filename) {
        return `https://admin-static-xuexb-com.mipcdn.com/c/s/admin.static.xuexb.com/html/${this.token}/${filename}`;
    }

    /**
     * 首页
     *
     * @return {Object}
     */
    async indexAction() {
        return this.display();
    }

    /**
     * 个人中心
     *
     * @return {Object}
     */
    async userAction() {
        return this.display();
    }

    /**
     * 退出
     *
     * @return {Object}
     */
    async logoutAction (){
        await this.session('token', null);
        return this.showMsg('退出成功', '/login.html');
    }

    /**
     * 列表
     *
     * @return {Object}
     */
    async listAction() {
        const htmlDir = path.join(this.config('htmlDir'), this.token);
        let items = [];

        if (think.isDirectory(htmlDir)) {
            items = fs.readdirSync(htmlDir);
        }

        items = items.filter(name => name.substr(0, 1) !== '.').map(filename => {
            return {
                filename,
                url: `/html/${this.token}/${filename}`,
                mip: this.getCDNFilePath(filename)
            };
        });

        this.assign({
            items
        });

        return this.display();
    }

    /**
     * 编辑
     *
     * @param {string} filename 文件名
     * @return {Object}
     */
    async deleteAction() {
        const filename = this.get('filename');
        const filepath = this.getFilePath(filename);
        if (think.isFile(filepath)) {
            fs.unlinkSync(filepath);
        }
        return this.showMsg('删除成功', '/list');
    }

    /**
     * 编辑
     *
     * @param {string} filename 文件名
     * @param {string} content 文件内容
     * @return {Object}
     */
    async editorAction() {
        if (this.isPost) {
            const {filename, content} = this.post();
            const filepath = this.getFilePath(filename);
            think.mkdir(path.dirname(filepath));
            fs.writeFileSync(filepath, content);
            return this.showMsg('保存成功', '/list');
        }

        const filename = this.get('filename') || '';
        const isEditor = !!filename;
        const filepath = isEditor ? this.getFilePath(filename) : path.join(think.ROOT_PATH, 'view/default.html');

        if (!think.isFile(filepath)) {
            return this.showMsg({
                text: isEditor ? '文件不存在' : '新增文件出错',
                type: 'danger'
            }, '/list');
        }

        const content = fs.readFileSync(filepath).toString();

        this.assign({
            filename: filename || think.md5(Date.now()).substr(0, 6) + '.html',
            content,
            isEditor
        });

        return this.display();
    }
};
